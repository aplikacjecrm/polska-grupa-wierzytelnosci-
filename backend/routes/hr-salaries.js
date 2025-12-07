/**
 * HR - Wynagrodzenia (Salaries) Routes
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

// Historia wynagrodzeń pracownika
router.get('/:userId/history', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();
    
    const history = await new Promise((resolve, reject) => {
      db.all(`
        SELECT h.*, u.name as changed_by_name
        FROM salary_history h
        LEFT JOIN users u ON h.changed_by = u.id
        WHERE h.employee_id = ?
        ORDER BY h.effective_date DESC
      `, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Pobierz aktualne wynagrodzenie
    const profile = await new Promise((resolve, reject) => {
      db.get('SELECT base_salary, salary_currency FROM employee_profiles WHERE user_id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    res.json({ success: true, history, current_salary: profile });
  } catch (error) {
    console.error('❌ Error getting salary history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Zmiana wynagrodzenia (HR)
router.post('/:userId/change', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { new_salary, change_reason, effective_date, notes } = req.body;
    const changedBy = req.user.userId || req.user.id;
    const userRole = req.user.user_role || req.user.role;
    
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    const db = getDatabase();
    
    // Pobierz aktualne wynagrodzenie
    const profile = await new Promise((resolve, reject) => {
      db.get('SELECT base_salary FROM employee_profiles WHERE user_id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    const old_salary = profile ? profile.base_salary : 0;
    const change_amount = new_salary - old_salary;
    const change_percentage = old_salary > 0 ? ((change_amount / old_salary) * 100) : 0;
    
    // Dodaj do historii
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO salary_history (employee_id, old_salary, new_salary, change_amount, change_percentage, change_reason, effective_date, changed_by, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, old_salary, new_salary, change_amount, change_percentage, change_reason, effective_date, changedBy, notes], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Zaktualizuj profil
    await new Promise((resolve, reject) => {
      db.run('UPDATE employee_profiles SET base_salary = ? WHERE user_id = ?', [new_salary, userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true, message: 'Wynagrodzenie zaktualizowane' });
  } catch (error) {
    console.error('❌ Error changing salary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Nadchodzące podwyżki (HR)
router.get('/reviews-due', verifyToken, async (req, res) => {
  try {
    const userRole = req.user.user_role || req.user.role;
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    const db = getDatabase();
    const reviews = await new Promise((resolve, reject) => {
      db.all(`
        SELECT p.*, u.name as employee_name, u.email
        FROM employee_profiles p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.salary_review_date IS NOT NULL
          AND p.salary_review_date <= date('now', '+30 days')
        ORDER BY p.salary_review_date ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, reviews });
  } catch (error) {
    console.error('❌ Error getting salary reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
