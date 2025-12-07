/**
 * HR - Szkolenia/Kursy (Training) Routes
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

// Lista szkoleń pracownika
router.get('/:userId/list', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    const db = getDatabase();
    
    let query = `SELECT * FROM employee_training WHERE employee_id = ?`;
    const params = [userId];
    
    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY start_date DESC`;
    
    const trainings = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, trainings });
  } catch (error) {
    console.error('❌ Error listing trainings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dodaj szkolenie
router.post('/:userId/add', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { training_type, title, description, provider, start_date, end_date, duration_hours, cost, currency } = req.body;
    
    if (!training_type || !title) {
      return res.status(400).json({ error: 'training_type i title są wymagane' });
    }
    
    const db = getDatabase();
    
    // Opcjonalnie: Jeśli jest to wniosek pracownika, utwórz ticket
    const createTicket = req.body.create_ticket === true || req.user.userId.toString() === userId.toString();
    let ticketId = null;
    
    if (createTicket) {
      const ticketTitle = `Wniosek o szkolenie: ${title}`;
      const ticketDetails = `
Typ szkolenia: ${training_type}
${provider ? `Dostawca: ${provider}` : ''}
${start_date ? `Data rozpoczęcia: ${new Date(start_date).toLocaleDateString('pl-PL')}` : ''}
${duration_hours ? `Czas trwania: ${duration_hours}h` : ''}
${cost ? `Szacowany koszt: ${cost} ${currency || 'PLN'}` : ''}

${description || ''}
      `.trim();
      
      // Wygeneruj unikalny numer ticketu
      const ticketNumber = `TRN-${userId}-${Date.now()}`;
      
      ticketId = await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO tickets (user_id, ticket_number, ticket_type, title, details, department, priority, status, created_at)
          VALUES (?, ?, 'szkolenie', ?, ?, 'HR', 'medium', 'Nowy', CURRENT_TIMESTAMP)
        `, [userId, ticketNumber, ticketTitle, ticketDetails], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
    }
    
    const trainingId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO employee_training 
        (employee_id, training_type, title, description, provider, start_date, end_date, duration_hours, cost, currency, created_by, ticket_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, training_type, title, description, provider, start_date, end_date, duration_hours, cost, currency || 'PLN', req.user.userId, ticketId, createTicket ? 'planned' : 'planned'], 
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    res.json({
      success: true,
      training_id: trainingId,
      ticket_id: ticketId,
      message: createTicket ? 'Wniosek o szkolenie złożony jako ticket' : 'Szkolenie dodane pomyślnie'
    });
    
  } catch (error) {
    console.error('❌ Error adding training:', error);
    res.status(500).json({ error: error.message });
  }
});

// Aktualizuj szkolenie
router.put('/:trainingId', verifyToken, async (req, res) => {
  try {
    const { trainingId } = req.params;
    const { status, grade, certificate_url, issue_date } = req.body;
    const db = getDatabase();
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE employee_training
        SET status = ?, grade = ?, certificate_url = ?, issue_date = ?, updated_at = datetime('now')
        WHERE id = ?
      `, [status, grade, certificate_url, issue_date, trainingId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error updating training:', error);
    res.status(500).json({ error: error.message });
  }
});

// Oczekujące na zatwierdzenie (HR Panel)
router.get('/pending', verifyToken, async (req, res) => {
  try {
    const userRole = req.user.user_role || req.user.role;
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    const db = getDatabase();
    const trainings = await new Promise((resolve, reject) => {
      db.all(`
        SELECT t.*, u.name as employee_name, u.email as employee_email
        FROM employee_training t
        LEFT JOIN users u ON t.employee_id = u.id
        WHERE t.status = 'planned'
        ORDER BY t.created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, trainings });
  } catch (error) {
    console.error('❌ Error getting pending trainings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Zatwierdź szkolenie (HR)
router.post('/:trainingId/approve', verifyToken, async (req, res) => {
  try {
    const { trainingId } = req.params;
    const { approval_notes } = req.body;
    const userRole = req.user.user_role || req.user.role;
    const approverId = req.user.userId || req.user.id;
    
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    const db = getDatabase();
    
    // Pobierz szkolenie żeby mieć employee_id
    const training = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM employee_training WHERE id = ?', [trainingId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE employee_training 
        SET status = 'in_progress', approved_by = ?, approved_at = datetime('now'), approval_notes = ?
        WHERE id = ?
      `, [approverId, approval_notes || null, trainingId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Zaktualizuj powiązany ticket - oznacz jako zatwierdzony przez HR
    if (training) {
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE tickets 
          SET hr_approved = 1, 
              hr_approved_by = ?, 
              hr_approved_at = datetime('now'),
              status = 'W realizacji'
          WHERE user_id = ? 
            AND department = 'HR' 
            AND (ticket_type LIKE '%szkolenie%' OR ticket_type LIKE '%training%' OR title LIKE '%szkolenie%')
            AND status = 'Nowy'
        `, [approverId, training.employee_id], (err) => {
          if (err) console.error('⚠️ Błąd aktualizacji ticketu:', err);
          resolve();
        });
      });
    }
    
    res.json({ success: true, message: 'Szkolenie zatwierdzone i może się rozpocząć' });
  } catch (error) {
    console.error('❌ Error approving training:', error);
    res.status(500).json({ error: error.message });
  }
});

// Odrzuć szkolenie (HR)
router.post('/:trainingId/reject', verifyToken, async (req, res) => {
  try {
    const { trainingId } = req.params;
    const { rejection_reason } = req.body;
    const userRole = req.user.user_role || req.user.role;
    const approverId = req.user.userId || req.user.id;
    
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    const db = getDatabase();
    
    // Pobierz szkolenie żeby mieć employee_id
    const training = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM employee_training WHERE id = ?', [trainingId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE employee_training 
        SET status = 'cancelled', rejection_reason = ?, rejected_by = ?, rejected_at = datetime('now')
        WHERE id = ?
      `, [rejection_reason, approverId, trainingId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Zaktualizuj powiązany ticket - oznacz jako odrzucony
    if (training) {
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE tickets 
          SET hr_approved = 0, 
              hr_approved_by = ?, 
              hr_approved_at = datetime('now'),
              status = 'Odrzucony',
              admin_note = ?
          WHERE user_id = ? 
            AND department = 'HR' 
            AND (ticket_type LIKE '%szkolenie%' OR ticket_type LIKE '%training%' OR title LIKE '%szkolenie%')
            AND status = 'Nowy'
        `, [approverId, rejection_reason || 'Odrzucony przez HR', training.employee_id], (err) => {
          if (err) console.error('⚠️ Błąd aktualizacji ticketu:', err);
          resolve();
        });
      });
    }
    
    res.json({ success: true, message: 'Szkolenie odrzucone' });
  } catch (error) {
    console.error('❌ Error rejecting training:', error);
    res.status(500).json({ error: error.message });
  }
});

// Wygasające certyfikaty (HR)
router.get('/expiring', verifyToken, async (req, res) => {
  try {
    const userRole = req.user.user_role || req.user.role;
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    const db = getDatabase();
    const trainings = await new Promise((resolve, reject) => {
      db.all(`
        SELECT t.*, u.name as employee_name
        FROM employee_training t
        LEFT JOIN users u ON t.employee_id = u.id
        WHERE t.expiry_date IS NOT NULL
          AND t.expiry_date <= date('now', '+90 days')
          AND t.status = 'completed'
        ORDER BY t.expiry_date ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, trainings });
  } catch (error) {
    console.error('❌ Error getting expiring trainings:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
