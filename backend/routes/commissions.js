/**
 * API PROWIZJI - System prowizji dla mecenasów i opiekunów
 * 
 * Endpointy:
 * - GET /api/commissions/stats - Statystyki prowizji
 * - GET /api/commissions/pending - Prowizje do wypłaty
 * - GET /api/commissions/user/:userId - Prowizje konkretnego użytkownika
 * - POST /api/commissions/calculate - Przelicz prowizje dla płatności
 * - POST /api/commissions/:id/pay - Wypłać prowizję
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

console.log('💰 [COMMISSIONS] Moduł commissions.js załadowany!');

// =====================================
// LISTA PROWIZJI Z FILTROWANIEM PO STATUSIE
// =====================================
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    const db = getDatabase();
    const userRole = req.user.user_role || req.user.role;
    
    console.log(`📋 [COMMISSIONS] Pobieranie prowizji (status: ${status}, rola: ${userRole})`);
    
    // Tylko Finance i Admin mogą zobaczyć wszystkie
    const canViewAll = ['admin', 'finance'].includes(userRole);
    let whereClause = canViewAll ? 'WHERE 1=1' : `WHERE lc.user_id = ${req.user.userId}`;
    
    // Filtr statusu
    if (status) {
      whereClause += ` AND lc.status = '${status}'`;
    }
    
    const commissions = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          lc.*,
          u.name as user_name,
          u.email as user_email,
          p.payment_code,
          p.amount as payment_amount,
          p.created_at as payment_date,
          c.case_number,
          c.title as case_title,
          cl.first_name || ' ' || cl.last_name as client_name
        FROM lawyer_commissions lc
        LEFT JOIN users u ON lc.user_id = u.id
        LEFT JOIN payments p ON lc.payment_id = p.id
        LEFT JOIN cases c ON lc.case_id = c.id
        LEFT JOIN clients cl ON lc.client_id = cl.id
        ${whereClause}
        ORDER BY lc.created_at DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ 
      success: true, 
      commissions,
      count: commissions.length,
      canViewAll
    });
    
  } catch (error) {
    console.error('❌ [COMMISSIONS] Błąd pobierania prowizji:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================
// STATYSTYKI PROWIZJI
// =====================================
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const db = getDatabase();
    const userRole = req.user.user_role || req.user.role;
    
    console.log(`📊 [COMMISSIONS] Pobieranie statystyk prowizji (rola: ${userRole})`);
    
    // Tylko Finance i Admin mogą zobaczyć wszystkie prowizje
    const canViewAll = ['admin', 'finance'].includes(userRole);
    const whereClause = canViewAll ? '' : `WHERE lc.user_id = ${req.user.userId}`;
    
    const stats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_commissions,
          SUM(CASE WHEN lc.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
          SUM(CASE WHEN lc.status = 'paid' THEN 1 ELSE 0 END) as paid_count,
          SUM(CASE WHEN lc.status = 'pending' THEN lc.commission_amount ELSE 0 END) as pending_amount,
          SUM(CASE WHEN lc.status = 'paid' THEN lc.commission_amount ELSE 0 END) as paid_amount,
          SUM(lc.commission_amount) as total_amount
        FROM lawyer_commissions lc
        ${whereClause}
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    res.json({ 
      success: true, 
      stats,
      canViewAll
    });
    
  } catch (error) {
    console.error('❌ [COMMISSIONS] Błąd pobierania statystyk:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================
// PROWIZJE DO WYPŁATY (PENDING)
// =====================================
router.get('/pending', verifyToken, async (req, res) => {
  try {
    const db = getDatabase();
    const userRole = req.user.user_role || req.user.role;
    
    console.log(`💸 [COMMISSIONS] Pobieranie prowizji do wypłaty (rola: ${userRole})`);
    
    // Tylko Finance i Admin mogą zobaczyć wszystkie
    const canViewAll = ['admin', 'finance'].includes(userRole);
    const whereClause = canViewAll ? '' : `AND lc.user_id = ${req.user.userId}`;
    
    const commissions = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          lc.*,
          u.name as user_name,
          u.email as user_email,
          p.payment_code,
          p.amount as payment_amount,
          p.created_at as payment_date,
          c.case_number,
          c.title as case_title,
          cl.first_name || ' ' || cl.last_name as client_name
        FROM lawyer_commissions lc
        LEFT JOIN users u ON lc.user_id = u.id
        LEFT JOIN payments p ON lc.payment_id = p.id
        LEFT JOIN cases c ON lc.case_id = c.id
        LEFT JOIN clients cl ON lc.client_id = cl.id
        WHERE lc.status = 'pending'
        ${whereClause}
        ORDER BY lc.created_at DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ 
      success: true, 
      commissions,
      count: commissions.length,
      canViewAll
    });
    
  } catch (error) {
    console.error('❌ [COMMISSIONS] Błąd pobierania prowizji:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================
// PROWIZJE UŻYTKOWNIKA
// =====================================
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();
    const userRole = req.user.user_role || req.user.role;
    
    // Sprawdź uprawnienia
    const canViewAll = ['admin', 'finance', 'hr'].includes(userRole);
    const canView = canViewAll || req.user.userId === parseInt(userId);
    
    if (!canView) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    console.log(`👤 [COMMISSIONS] Pobieranie prowizji użytkownika ${userId}`);
    
    const commissions = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          lc.*,
          p.payment_code,
          p.amount as payment_amount,
          p.created_at as payment_date,
          c.case_number,
          c.title as case_title,
          cl.first_name || ' ' || cl.last_name as client_name
        FROM lawyer_commissions lc
        LEFT JOIN payments p ON lc.payment_id = p.id
        LEFT JOIN cases c ON lc.case_id = c.id
        LEFT JOIN clients cl ON lc.client_id = cl.id
        WHERE lc.user_id = ?
        ORDER BY lc.created_at DESC
      `, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Statystyki użytkownika
    const userStats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_commissions,
          SUM(CASE WHEN status = 'pending' THEN commission_amount ELSE 0 END) as pending_amount,
          SUM(CASE WHEN status = 'paid' THEN commission_amount ELSE 0 END) as paid_amount,
          SUM(commission_amount) as total_amount
        FROM lawyer_commissions
        WHERE user_id = ?
      `, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    res.json({ 
      success: true, 
      commissions,
      stats: userStats
    });
    
  } catch (error) {
    console.error('❌ [COMMISSIONS] Błąd pobierania prowizji użytkownika:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================
// PRZELICZ PROWIZJE DLA PŁATNOŚCI
// =====================================
router.post('/calculate', verifyToken, async (req, res) => {
  try {
    const { paymentId } = req.body;
    const db = getDatabase();
    
    console.log(`🧮 [COMMISSIONS] Przeliczanie prowizji dla płatności ${paymentId}`);
    
    // Pobierz płatność
    const payment = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM payments WHERE id = ?', [paymentId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!payment) {
      return res.status(404).json({ error: 'Płatność nie znaleziona' });
    }
    
    // Pobierz sprawę jeśli jest
    let caseData = null;
    if (payment.case_id) {
      caseData = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM cases WHERE id = ?', [payment.case_id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }
    
    const commissionsCreated = [];
    
    // 1. PROWIZJA DLA MECENASA (assigned_to w case)
    if (caseData && caseData.assigned_to) {
      const lawyerRate = await getCommissionRate(db, caseData.assigned_to, 'lawyer');
      const lawyerCommission = calculateCommission(payment.amount, lawyerRate);
      
      const commissionId = await createCommission(db, {
        payment_id: paymentId,
        case_id: payment.case_id,
        client_id: payment.client_id,
        user_id: caseData.assigned_to,
        user_role: 'lawyer',
        payment_amount: payment.amount,
        commission_rate: lawyerRate.commission_value,
        commission_amount: lawyerCommission,
        commission_type: lawyerRate.commission_type
      });
      
      commissionsCreated.push({ role: 'lawyer', user_id: caseData.assigned_to, amount: lawyerCommission });
    }
    
    // 2. PROWIZJA DLA OPIEKUNA SPRAWY (case_manager_id)
    if (caseData && caseData.case_manager_id) {
      const managerRate = await getCommissionRate(db, caseData.case_manager_id, 'case_manager');
      const managerCommission = calculateCommission(payment.amount, managerRate);
      
      const commissionId = await createCommission(db, {
        payment_id: paymentId,
        case_id: payment.case_id,
        client_id: payment.client_id,
        user_id: caseData.case_manager_id,
        user_role: 'case_manager',
        payment_amount: payment.amount,
        commission_rate: managerRate.commission_value,
        commission_amount: managerCommission,
        commission_type: managerRate.commission_type
      });
      
      commissionsCreated.push({ role: 'case_manager', user_id: caseData.case_manager_id, amount: managerCommission });
    }
    
    // 3. PROWIZJA DLA OPIEKUNA KLIENTA (client_manager_id w client)
    if (payment.client_id) {
      const client = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM clients WHERE id = ?', [payment.client_id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (client && client.client_manager_id) {
        const clientManagerRate = await getCommissionRate(db, client.client_manager_id, 'client_manager');
        const clientManagerCommission = calculateCommission(payment.amount, clientManagerRate);
        
        const commissionId = await createCommission(db, {
          payment_id: paymentId,
          case_id: payment.case_id,
          client_id: payment.client_id,
          user_id: client.client_manager_id,
          user_role: 'client_manager',
          payment_amount: payment.amount,
          commission_rate: clientManagerRate.commission_value,
          commission_amount: clientManagerCommission,
          commission_type: clientManagerRate.commission_type
        });
        
        commissionsCreated.push({ role: 'client_manager', user_id: client.client_manager_id, amount: clientManagerCommission });
      }
    }
    
    console.log(`✅ [COMMISSIONS] Utworzono ${commissionsCreated.length} prowizji`);
    
    res.json({ 
      success: true, 
      message: `Utworzono ${commissionsCreated.length} prowizji`,
      commissions: commissionsCreated
    });
    
  } catch (error) {
    console.error('❌ [COMMISSIONS] Błąd przeliczania prowizji:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================
// WYPŁAĆ PROWIZJĘ (TYLKO ZATWIERDZONE!)
// =====================================
router.post('/:id/pay', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method, notes } = req.body;
    const db = getDatabase();
    const userRole = req.user.user_role || req.user.role;
    
    // Tylko Finance i Admin mogą wypłacać prowizje
    if (!['admin', 'finance'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień do wypłaty prowizji' });
    }
    
    console.log(`💸 [COMMISSIONS] Wypłata prowizji ${id}`);
    
    // SPRAWDŹ CZY PROWIZJA JEST ZATWIERDZONA
    const commission = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM lawyer_commissions WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!commission) {
      return res.status(404).json({ error: 'Prowizja nie znaleziona' });
    }
    
    if (commission.status === 'pending') {
      return res.status(400).json({ 
        error: 'Prowizja nie została zatwierdzona',
        message: 'Zatwierdź prowizję przed wypłatą'
      });
    }
    
    if (commission.status === 'rejected') {
      return res.status(400).json({ 
        error: 'Prowizja została odrzucona',
        reason: commission.rejection_reason
      });
    }
    
    if (commission.status === 'paid') {
      return res.status(400).json({ error: 'Prowizja już wypłacona' });
    }
    
    // WYPŁAĆ (tylko approved → paid)
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE lawyer_commissions
        SET status = 'paid',
            paid_at = datetime('now'),
            paid_by = ?,
            payment_method = ?,
            notes = ?,
            updated_at = datetime('now')
        WHERE id = ? AND status = 'approved'
      `, [req.user.userId, payment_method, notes, id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log(`✅ [COMMISSIONS] Prowizja ${id} wypłacona`);
    
    res.json({ 
      success: true, 
      message: 'Prowizja została wypłacona'
    });
    
  } catch (error) {
    console.error('❌ [COMMISSIONS] Błąd wypłaty prowizji:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================
// FUNKCJE POMOCNICZE
// =====================================

async function getCommissionRate(db, userId, role) {
  // Najpierw szukaj indywidualnej stawki
  let rate = await new Promise((resolve, reject) => {
    db.get(`
      SELECT * FROM commission_rates 
      WHERE user_id = ? AND role = ? AND is_active = 1
      LIMIT 1
    `, [userId, role], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  // Jeśli nie ma, użyj domyślnej (user_id = 0)
  if (!rate) {
    rate = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM commission_rates 
        WHERE user_id = 0 AND role = ? AND is_active = 1
        LIMIT 1
      `, [role], (err, row) => {
        if (err) reject(err);
        else resolve(row || { commission_type: 'percentage', commission_value: 10 });
      });
    });
  }
  
  return rate;
}

function calculateCommission(amount, rate) {
  if (rate.commission_type === 'percentage') {
    return (parseFloat(amount) * parseFloat(rate.commission_value)) / 100;
  } else {
    return parseFloat(rate.commission_value);
  }
}

async function createCommission(db, data) {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO lawyer_commissions (
        payment_id, case_id, client_id, user_id, user_role,
        payment_amount, commission_rate, commission_amount, commission_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.payment_id,
      data.case_id,
      data.client_id,
      data.user_id,
      data.user_role,
      data.payment_amount,
      data.commission_rate,
      data.commission_amount,
      data.commission_type
    ], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

// =====================================
// KONFIGURACJA PROWIZJI DLA SPRAWY
// =====================================

// GET - Pobierz konfigurację prowizji dla sprawy
router.get('/case/:caseId/config', verifyToken, async (req, res) => {
  try {
    const { caseId } = req.params;
    const db = getDatabase();
    const userRole = req.user.user_role || req.user.role;
    
    // Tylko admin, finance i lawyer mogą konfigurować
    if (!['admin', 'finance', 'lawyer'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    console.log(`⚙️ [COMMISSIONS] Pobieranie konfiguracji prowizji dla sprawy ${caseId}`);
    
    const config = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM commission_rates
        WHERE applies_to = 'case:' || ?
        AND is_active = 1
        ORDER BY role
      `, [caseId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Pobierz domyślne stawki dla porównania
    const defaults = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM commission_rates
        WHERE user_id = 0 AND is_active = 1
        ORDER BY role
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json({ 
      success: true, 
      custom: config,
      defaults: defaults,
      hasCustom: config.length > 0
    });
    
  } catch (error) {
    console.error('❌ Błąd pobierania konfiguracji:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Ustaw niestandardowe stawki prowizji dla sprawy
router.post('/case/:caseId/config', verifyToken, async (req, res) => {
  try {
    const { caseId } = req.params;
    const { lawyer_rate, case_manager_rate, client_manager_rate, notes } = req.body;
    const db = getDatabase();
    const userRole = req.user.user_role || req.user.role;
    
    // Tylko admin i finance mogą konfigurować
    if (!['admin', 'finance'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    console.log(`⚙️ [COMMISSIONS] Ustawianie niestandardowych stawek dla sprawy ${caseId}`);
    console.log(`   Mecenas: ${lawyer_rate}%, Opiekun sprawy: ${case_manager_rate}%, Opiekun klienta: ${client_manager_rate}%`);
    
    // Dezaktywuj stare stawki dla tej sprawy
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE commission_rates 
        SET is_active = 0
        WHERE applies_to = 'case:' || ?
      `, [caseId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Dodaj nowe stawki
    const rates = [
      { role: 'lawyer', value: parseFloat(lawyer_rate) },
      { role: 'case_manager', value: parseFloat(case_manager_rate) },
      { role: 'client_manager', value: parseFloat(client_manager_rate) }
    ];
    
    for (const rate of rates) {
      if (rate.value > 0) { // Tylko jeśli stawka > 0
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO commission_rates (
              user_id, role, commission_type, commission_value,
              applies_to, is_active, notes
            ) VALUES (0, ?, 'percentage', ?, ?, 1, ?)
          `, [rate.role, rate.value, `case:${caseId}`, notes || `Niestandardowa stawka dla sprawy ${caseId}`], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Konfiguracja prowizji zapisana',
      rates: rates
    });
    
  } catch (error) {
    console.error('❌ Błąd zapisywania konfiguracji:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Usuń niestandardowe stawki (wróć do domyślnych)
router.delete('/case/:caseId/config', verifyToken, async (req, res) => {
  try {
    const { caseId } = req.params;
    const db = getDatabase();
    const userRole = req.user.user_role || req.user.role;
    
    // Tylko admin i finance mogą usuwać
    if (!['admin', 'finance'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    console.log(`🗑️ [COMMISSIONS] Usuwanie niestandardowych stawek dla sprawy ${caseId}`);
    
    await new Promise((resolve, reject) => {
      db.run(`
        DELETE FROM commission_rates 
        WHERE applies_to = 'case:' || ?
      `, [caseId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ 
      success: true, 
      message: 'Przywrócono domyślne stawki prowizji'
    });
    
  } catch (error) {
    console.error('❌ Błąd usuwania konfiguracji:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================
// ZATWIERDZANIE PROWIZJI (STARY - lawyer_commissions)
// USUNIĘTO - używamy nowego endpointu poniżej dla employee_commissions
// =====================================

// =====================================
// EDYCJA PROWIZJI (PRZED ZATWIERDZENIEM)
// =====================================
router.put('/:id/edit', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { commission_rate, commission_amount, edit_reason } = req.body;
    const db = getDatabase();
    const userRole = req.user.user_role || req.user.role;
    
    // Tylko admin i finance mogą edytować
    if (!['admin', 'finance'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień do edycji prowizji' });
    }
    
    console.log(`📝 [COMMISSIONS] Edycja prowizji ${id} przez ${req.user.userId}`);
    
    // Sprawdź czy prowizja istnieje
    const commission = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM employee_commissions WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!commission) {
      return res.status(404).json({ error: 'Prowizja nie znaleziona' });
    }
    
    // Można edytować tylko prowizje pending lub approved
    if (!['pending', 'approved'].includes(commission.status)) {
      return res.status(400).json({ error: 'Można edytować tylko prowizje oczekujące lub zatwierdzone (nie wypłacone)' });
    }
    
    const oldRate = commission.rate;
    const oldAmount = commission.amount;
    
    // Aktualizuj prowizję
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE employee_commissions 
        SET rate = ?,
            amount = ?,
            description = CASE 
              WHEN description IS NULL THEN ?
              ELSE description || ' | ' || ?
            END
        WHERE id = ?
      `, [
        commission_rate || oldRate,
        commission_amount || oldAmount,
        `Edycja: ${edit_reason} (${oldRate}% → ${commission_rate}%, ${oldAmount} → ${commission_amount} PLN)`,
        `Edycja: ${edit_reason} (${oldRate}% → ${commission_rate}%, ${oldAmount} → ${commission_amount} PLN)`,
        id
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log(`✅ Prowizja ${id} zaktualizowana: ${oldRate}% → ${commission_rate}%, ${oldAmount} PLN → ${commission_amount} PLN`);
    
    res.json({ 
      success: true, 
      message: 'Prowizja zaktualizowana',
      commission_id: id,
      old_rate: oldRate,
      new_rate: commission_rate,
      old_amount: oldAmount,
      new_amount: commission_amount
    });
    
  } catch (error) {
    console.error('❌ Błąd edycji prowizji:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================
// ODRZUCANIE PROWIZJI (STARY - lawyer_commissions)
// USUNIĘTO - używamy nowego endpointu poniżej dla employee_commissions
// =====================================

// =====================================
// NOWE: STATYSTYKI PROWIZJI (EMPLOYEE_COMMISSIONS)
// =====================================
router.get('/v2/stats', verifyToken, async (req, res) => {
  try {
    const db = getDatabase();
    const userRole = req.user.user_role || req.user.role;
    
    if (!['admin', 'finance'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    const stats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_count,
          SUM(amount) as total_amount,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
          SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as approved_amount,
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
          COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count
        FROM employee_commissions
        WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    res.json({ success: true, stats });
    
  } catch (error) {
    console.error('❌ Błąd statystyk prowizji:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================
// NOWE: LISTA PROWIZJI DO WYPŁATY
// =====================================
router.get('/v2/pending', verifyToken, async (req, res) => {
  try {
    const db = getDatabase();
    const userRole = req.user.user_role || req.user.role;
    const { status } = req.query; // Opcjonalny filtr statusu
    
    if (!['admin', 'finance'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    // Jeśli nie podano statusu, pokaż pending + approved
    let statusFilter = "ec.status IN ('pending', 'approved')";
    if (status === 'pending') statusFilter = "ec.status = 'pending'";
    if (status === 'approved') statusFilter = "ec.status = 'approved'";
    if (status === 'paid') statusFilter = "ec.status = 'paid'";
    if (status === 'rejected') statusFilter = "ec.status = 'rejected'";
    
    const commissions = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          ec.id,
          ec.employee_id,
          ec.case_id,
          ec.payment_id,
          ec.amount as commission_amount,
          ec.rate as commission_rate,
          ec.status,
          ec.description,
          ec.created_at,
          ec.paid_at,
          ec.rejection_reason,
          u.name as user_name,
          u.user_role,
          c.case_number,
          c.title as case_title,
          cl.first_name || ' ' || cl.last_name as client_name,
          p.payment_code,
          p.amount as payment_amount,
          p.status as payment_status
        FROM employee_commissions ec
        LEFT JOIN users u ON ec.employee_id = u.id
        LEFT JOIN cases c ON ec.case_id = c.id
        LEFT JOIN clients cl ON c.client_id = cl.id
        LEFT JOIN payments p ON ec.payment_id = p.id
        WHERE ${statusFilter}
        ORDER BY ec.created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, commissions, count: commissions.length });
    
  } catch (error) {
    console.error('❌ Błąd pobierania prowizji:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================
// NOWE: TOP ZARABIAJĄCY
// =====================================
router.get('/v2/top-earners', verifyToken, async (req, res) => {
  try {
    const db = getDatabase();
    const userRole = req.user.user_role || req.user.role;
    const { month, limit = 5 } = req.query;
    
    if (!['admin', 'finance', 'hr'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    let dateFilter = '';
    if (month) {
      dateFilter = `AND strftime('%Y-%m', ec.created_at) = '${month}'`;
    } else {
      dateFilter = `AND strftime('%Y-%m', ec.created_at) = strftime('%Y-%m', 'now')`;
    }
    
    const topEarners = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          u.id as employee_id,
          u.name as employee_name,
          u.email,
          COUNT(ec.id) as commissions_count,
          SUM(ec.amount) as total_earned,
          SUM(CASE WHEN ec.status = 'paid' THEN ec.amount ELSE 0 END) as paid_amount,
          SUM(CASE WHEN ec.status = 'approved' THEN ec.amount ELSE 0 END) as pending_amount
        FROM employee_commissions ec
        JOIN users u ON ec.employee_id = u.id
        WHERE 1=1 ${dateFilter}
        GROUP BY u.id
        ORDER BY total_earned DESC
        LIMIT ?
      `, [parseInt(limit)], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, top_earners: topEarners });
    
  } catch (error) {
    console.error('❌ Błąd pobierania top zarabiających:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================
// ZATWIERDŹ PROWIZJĘ
// =====================================
router.post('/:id/approve', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const userRole = req.user.user_role || req.user.role;
    
    if (!['admin', 'finance'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    // Sprawdź czy prowizja istnieje
    const commission = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM employee_commissions WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!commission) {
      return res.status(404).json({ error: 'Prowizja nie znaleziona' });
    }
    
    if (commission.status !== 'pending') {
      return res.status(400).json({ error: 'Można zatwierdzić tylko prowizje ze statusem pending' });
    }
    
    // Zmień status na approved
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE employee_commissions 
        SET status = 'approved'
        WHERE id = ?
      `, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log(`✅ Prowizja ${id} zatwierdzona przez ${req.user.userId}`);
    
    res.json({ 
      success: true, 
      message: 'Prowizja zatwierdzona',
      commission_id: id
    });
    
  } catch (error) {
    console.error('❌ Błąd zatwierdzania prowizji:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================
// ODRZUĆ PROWIZJĘ
// =====================================
router.post('/:id/reject', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const db = getDatabase();
    const userRole = req.user.user_role || req.user.role;
    
    if (!['admin', 'finance'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    // Sprawdź czy prowizja istnieje
    const commission = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM employee_commissions WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!commission) {
      return res.status(404).json({ error: 'Prowizja nie znaleziona' });
    }
    
    if (commission.status !== 'pending') {
      return res.status(400).json({ error: 'Można odrzucić tylko prowizje ze statusem pending' });
    }
    
    // Zmień status na rejected
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE employee_commissions 
        SET status = 'rejected',
            rejection_reason = ?
        WHERE id = ?
      `, [reason || 'Odrzucona przez administratora', id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log(`❌ Prowizja ${id} odrzucona przez ${req.user.userId}`);
    
    res.json({ 
      success: true, 
      message: 'Prowizja odrzucona',
      commission_id: id
    });
    
  } catch (error) {
    console.error('❌ Błąd odrzucania prowizji:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================
// NOWE: WYPŁAĆ PROWIZJĘ
// =====================================
router.post('/v2/:id/pay', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const userRole = req.user.user_role || req.user.role;
    
    if (!['admin', 'finance'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień do wypłacania prowizji' });
    }
    
    console.log(`💳 Wypłacanie prowizji ${id} przez ${req.user.userId}`);
    
    // Pobierz prowizję z informacją o płatności i numerze sprawy
    const commission = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          ec.*,
          p.status as payment_status,
          p.payment_code,
          p.amount as payment_amount,
          c.case_number
        FROM employee_commissions ec
        LEFT JOIN payments p ON ec.payment_id = p.id
        LEFT JOIN cases c ON ec.case_id = c.id
        WHERE ec.id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!commission) {
      return res.status(404).json({ error: 'Prowizja nie znaleziona' });
    }
    
    if (commission.status !== 'approved') {
      return res.status(400).json({ error: 'Można wypłacić tylko zatwierdzone prowizje' });
    }
    
    // ⚠️ WAŻNE: Sprawdź czy płatność od klienta jest opłacona
    if (!commission.payment_id) {
      return res.status(400).json({ 
        error: 'Prowizja nie ma przypisanej płatności',
        message: 'Nie można wypłacić prowizji bez płatności od klienta'
      });
    }
    
    if (commission.payment_status !== 'completed') {
      return res.status(400).json({ 
        error: 'Płatność nie została opłacona przez klienta',
        message: `Płatność ${commission.payment_code || commission.payment_id} ma status: ${commission.payment_status}. Prowizję można wypłacić tylko gdy klient opłaci usługę (status: completed).`,
        payment_status: commission.payment_status,
        payment_code: commission.payment_code
      });
    }
    
    // Zmień status prowizji na 'paid'
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE employee_commissions 
        SET status = 'paid',
            paid_at = datetime('now')
        WHERE id = ?
      `, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Utwórz wpis wypłaty w employee_payments
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO employee_payments (
          employee_id, amount, payment_type, payment_date,
          description, status, commission_id
        ) VALUES (?, ?, 'commission', date('now'), ?, 'completed', ?)
      `, [
        commission.employee_id,
        commission.amount,
        `Prowizja za sprawę ${commission.case_number || commission.case_id} - Płatność ${commission.payment_code || commission.payment_id}`,
        id
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log(`✅ Prowizja ${id} wypłacona, utworzono employee_payment`);
    
    // TODO: Wyślij powiadomienie do pracownika
    
    res.json({ 
      success: true, 
      message: 'Prowizja wypłacona',
      commission_id: id,
      amount: commission.amount
    });
    
  } catch (error) {
    console.error('❌ Błąd wypłacania prowizji:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
