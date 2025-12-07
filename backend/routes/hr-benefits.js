/**
 * HR - Benefity (Benefits) Routes
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

// Lista benefitów pracownika
router.get('/:userId/list', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();
    
    const benefits = await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM employee_benefits WHERE employee_id = ? ORDER BY is_active DESC, start_date DESC`, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Oblicz wartość pakietu
    const totalMonthly = benefits.filter(b => b.is_active).reduce((sum, b) => sum + (b.value_monthly || 0), 0);
    const totalYearly = totalMonthly * 12;
    
    res.json({ success: true, benefits, total_monthly: totalMonthly, total_yearly: totalYearly });
  } catch (error) {
    console.error('❌ Error listing benefits:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dodaj benefit
router.post('/:userId/add', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { benefit_type, benefit_name, provider, value_monthly, start_date, end_date, policy_number, notes } = req.body;
    const createdBy = req.user.userId || req.user.id;
    const db = getDatabase();
    
    const value_yearly = (value_monthly || 0) * 12;
    
    const benefitId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO employee_benefits (employee_id, benefit_type, benefit_name, provider, value_monthly, value_yearly, start_date, end_date, policy_number, notes, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, benefit_type, benefit_name, provider, value_monthly || 0, value_yearly, start_date, end_date, policy_number, notes, createdBy], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    res.json({ success: true, benefit_id: benefitId });
  } catch (error) {
    console.error('❌ Error adding benefit:', error);
    res.status(500).json({ error: error.message });
  }
});

// Wygasające benefity (HR)
router.get('/expiring', verifyToken, async (req, res) => {
  try {
    const userRole = req.user.user_role || req.user.role;
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    
    const db = getDatabase();
    const benefits = await new Promise((resolve, reject) => {
      db.all(`
        SELECT b.*, u.name as employee_name
        FROM employee_benefits b
        LEFT JOIN users u ON b.employee_id = u.id
        WHERE b.end_date IS NOT NULL
          AND b.end_date <= date('now', '+60 days')
          AND b.is_active = 1
        ORDER BY b.end_date ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, benefits });
  } catch (error) {
    console.error('❌ Error getting expiring benefits:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
