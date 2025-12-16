/**
 * HR - Urlopy (Vacations) Routes
 * Obsługa wniosków urlopowych, sald, zatwierdzania
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

// Helper function
function getVacationTypeLabel(type) {
  const types = {
    'annual': 'Urlop wypoczynkowy',
    'sick': 'Zwolnienie lekarskie',
    'unpaid': 'Urlop bezpłatny',
    'parental': 'Urlop rodzicielski',
    'occasional': 'Urlop na żądanie',
    'other': 'Inny urlop'
  };
  return types[type] || type;
}

// ============================================
// BALANCE - Saldo urlopów pracownika
// ============================================
router.get('/:userId/balance', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();
    
    const db = getDatabase();
    
    // Pobierz lub utwórz saldo dla roku
    let balance = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM employee_vacation_balance
        WHERE employee_id = ? AND year = ?
      `, [userId, currentYear], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Jeśli nie istnieje, utwórz domyślne saldo
    if (!balance) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO employee_vacation_balance (employee_id, year, annual_days, occasional_days)
          VALUES (?, ?, 26, 4)
        `, [userId, currentYear], function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        });
      });
      
      balance = await new Promise((resolve, reject) => {
        db.get(`
          SELECT * FROM employee_vacation_balance
          WHERE employee_id = ? AND year = ?
        `, [userId, currentYear], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }
    
    // Oblicz dostępne dni
    const availableAnnual = balance.annual_days + balance.carried_over_days - balance.used_annual_days;
    const availableOccasional = balance.occasional_days - balance.used_occasional_days;
    
    res.json({
      success: true,
      balance: {
        ...balance,
        available_annual_days: availableAnnual,
        available_occasional_days: availableOccasional
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting vacation balance:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// REQUEST - Złóż wniosek urlopowy
// ============================================
router.post('/:userId/request', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { vacation_type, start_date, end_date, notes } = req.body;
    
    // Walidacja
    if (!vacation_type || !start_date || !end_date) {
      return res.status(400).json({ error: 'vacation_type, start_date, end_date są wymagane' });
    }
    
    // Oblicz liczbę dni (bez weekendów)
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    let days = 0;
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Nie niedziela i nie sobota
        days++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Sprawdź saldo (tylko dla annual i occasional)
    const db = getDatabase();
    const year = startDate.getFullYear();
    
    if (vacation_type === 'annual' || vacation_type === 'occasional') {
      const balance = await new Promise((resolve, reject) => {
        db.get(`
          SELECT * FROM employee_vacation_balance
          WHERE employee_id = ? AND year = ?
        `, [userId, year], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (!balance) {
        return res.status(400).json({ error: 'Brak salda urlopów dla tego roku' });
      }
      
      if (vacation_type === 'annual') {
        const available = balance.annual_days + balance.carried_over_days - balance.used_annual_days;
        if (days > available) {
          return res.status(400).json({ error: `Brak wystarczającej liczby dni urlopu (dostępne: ${available})` });
        }
      } else if (vacation_type === 'occasional') {
        const available = balance.occasional_days - balance.used_occasional_days;
        if (days > available) {
          return res.status(400).json({ error: `Brak wystarczającej liczby dni urlopu na żądanie (dostępne: ${available})` });
        }
      }
    }
    
    // 1. Najpierw utwórz TICKET (wniosek urlopowy jako ticket)
    const ticketTitle = `Wniosek urlopowy: ${getVacationTypeLabel(vacation_type)} (${days} dni)`;
    const ticketDetails = `
Od: ${new Date(start_date).toLocaleDateString('pl-PL')}
Do: ${new Date(end_date).toLocaleDateString('pl-PL')}
Liczba dni: ${days}
${notes ? `\nUwagi: ${notes}` : ''}
    `.trim();
    
    // Wygeneruj unikalny numer ticketu
    const ticketNumber = `VAC-${userId}-${Date.now()}`;
    
    const ticketId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO tickets (user_id, ticket_number, ticket_type, title, details, department, priority, status, created_at)
        VALUES (?, ?, 'urlop', ?, ?, 'HR', 'high', 'Nowy', CURRENT_TIMESTAMP)
      `, [userId, ticketNumber, ticketTitle, ticketDetails], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    // 2. Następnie utwórz wpis urlopowy powiązany z ticketem
    const vacationId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO employee_vacations (employee_id, vacation_type, start_date, end_date, days_count, notes, ticket_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [userId, vacation_type, start_date, end_date, days, notes, ticketId], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    res.json({
      success: true,
      vacation_id: vacationId,
      ticket_id: ticketId,
      days_count: days,
      message: 'Wniosek urlopowy złożony pomyślnie jako ticket'
    });
    
  } catch (error) {
    console.error('❌ Error requesting vacation:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// LIST - Lista wniosków pracownika
// ============================================
router.get('/:userId/list', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, year } = req.query;
    
    const db = getDatabase();
    
    let query = `
      SELECT 
        v.*,
        u.name as approver_name
      FROM employee_vacations v
      LEFT JOIN users u ON v.approved_by = u.id
      WHERE v.employee_id = ?
    `;
    const params = [userId];
    
    if (status) {
      query += ` AND v.status = ?`;
      params.push(status);
    }
    
    if (year) {
      query += ` AND strftime('%Y', v.start_date) = ?`;
      params.push(year);
    }
    
    query += ` ORDER BY v.created_at DESC`;
    
    const vacations = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      vacations
    });
    
  } catch (error) {
    console.error('❌ Error listing vacations:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HR: PENDING - Wnioski do zatwierdzenia
// ============================================
router.get('/pending', verifyToken, async (req, res) => {
  try {
    const userRole = req.user.user_role || req.user.role;
    
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    const db = getDatabase();
    
    const vacations = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          v.*,
          u.name as employee_name,
          u.email as employee_email,
          p.position
        FROM employee_vacations v
        LEFT JOIN users u ON v.employee_id = u.id
        LEFT JOIN employee_profiles p ON u.id = p.user_id
        WHERE v.status = 'pending'
        ORDER BY v.request_date ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      vacations
    });
    
  } catch (error) {
    console.error('❌ Error getting pending vacations:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HR: APPROVE - Zatwierdź wniosek
// ============================================
router.post('/:vacationId/approve', verifyToken, async (req, res) => {
  try {
    const { vacationId } = req.params;
    const { approval_notes } = req.body;
    const userRole = req.user.user_role || req.user.role;
    const approverId = req.user.userId || req.user.id;
    
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    const db = getDatabase();
    
    // Pobierz wniosek
    const vacation = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM employee_vacations WHERE id = ?', [vacationId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!vacation) {
      return res.status(404).json({ error: 'Wniosek nie znaleziony' });
    }
    
    if (vacation.status !== 'pending') {
      return res.status(400).json({ error: 'Można zatwierdzić tylko wniosek oczekujący' });
    }
    
    // Zatwierdź wniosek
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE employee_vacations
        SET status = 'approved',
            approved_by = ?,
            approved_at = datetime('now'),
            approval_notes = ?
        WHERE id = ?
      `, [approverId, approval_notes || null, vacationId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Zaktualizuj saldo
    const year = new Date(vacation.start_date).getFullYear();
    
    if (vacation.vacation_type === 'annual') {
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE employee_vacation_balance
          SET used_annual_days = used_annual_days + ?
          WHERE employee_id = ? AND year = ?
        `, [vacation.days_count, vacation.employee_id, year], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else if (vacation.vacation_type === 'occasional') {
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE employee_vacation_balance
          SET used_occasional_days = used_occasional_days + ?
          WHERE employee_id = ? AND year = ?
        `, [vacation.days_count, vacation.employee_id, year], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    // TODO: Wyślij powiadomienie do pracownika
    
    res.json({
      success: true,
      message: 'Wniosek zatwierdzony'
    });
    
  } catch (error) {
    console.error('❌ Error approving vacation:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HR: REJECT - Odrzuć wniosek
// ============================================
router.post('/:vacationId/reject', verifyToken, async (req, res) => {
  try {
    const { vacationId } = req.params;
    const { rejection_reason } = req.body;
    const userRole = req.user.user_role || req.user.role;
    const approverId = req.user.userId || req.user.id;
    
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    const db = getDatabase();
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE employee_vacations
        SET status = 'rejected',
            rejection_reason = ?,
            approved_by = ?,
            approved_at = datetime('now')
        WHERE id = ?
      `, [rejection_reason, approverId, vacationId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // TODO: Wyślij powiadomienie do pracownika
    
    res.json({
      success: true,
      message: 'Wniosek odrzucony'
    });
    
  } catch (error) {
    console.error('❌ Error rejecting vacation:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HR: CALENDAR - Kalendarz urlopów
// ============================================
router.get('/calendar', verifyToken, async (req, res) => {
  try {
    const userRole = req.user.user_role || req.user.role;
    
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    const { month, year } = req.query;
    const currentMonth = month || (new Date().getMonth() + 1);
    const currentYear = year || new Date().getFullYear();
    
    const db = getDatabase();
    
    // Pobierz zatwierdzone urlopy dla miesiąca
    const vacations = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          v.*,
          u.name as employee_name,
          p.position
        FROM employee_vacations v
        LEFT JOIN users u ON v.employee_id = u.id
        LEFT JOIN employee_profiles p ON u.id = p.user_id
        WHERE v.status = 'approved'
          AND strftime('%Y', v.start_date) = ?
          AND (strftime('%m', v.start_date) = ? OR strftime('%m', v.end_date) = ?)
        ORDER BY v.start_date
      `, [currentYear, currentMonth.toString().padStart(2, '0'), currentMonth.toString().padStart(2, '0')], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      vacations,
      month: currentMonth,
      year: currentYear
    });
    
  } catch (error) {
    console.error('❌ Error getting vacation calendar:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
