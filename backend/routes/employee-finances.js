/**
 * Employee Finances Routes
 * Finanse pracownika - prowizje i wypłaty
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getDatabase } = require('../database/init');

// =====================================
// PODSUMOWANIE FINANSÓW PRACOWNIKA
// =====================================
router.get('/:userId/finances/summary', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const db = getDatabase();
        
        console.log(`💰 Pobieranie podsumowania finansów dla pracownika ${userId}`);
        
        // Prowizje - statystyki
        const commissionsStats = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as total_count,
                    SUM(amount) as total_amount,
                    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
                    SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as approved_amount,
                    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
                    SUM(CASE WHEN status = 'rejected' THEN amount ELSE 0 END) as rejected_amount,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
                    COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
                    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
                FROM employee_commissions
                WHERE employee_id = ?
                  AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
            `, [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        // Wypłaty - ostatnie 6 miesięcy
        const recentPayments = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    id, amount, payment_type, payment_date, 
                    description, status
                FROM employee_payments
                WHERE employee_id = ?
                  AND payment_date >= DATE('now', '-6 months')
                ORDER BY payment_date DESC
                LIMIT 10
            `, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Koszty do rozliczenia
        const pendingExpenses = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    id, amount, expense_category, expense_date,
                    description, status
                FROM employee_expenses
                WHERE employee_id = ?
                  AND status IN ('pending', 'approved')
                ORDER BY expense_date DESC
                LIMIT 5
            `, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Odrzucone prowizje - z powodem i datą
        const rejectedCommissions = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    ec.id,
                    ec.amount,
                    ec.rate,
                    ec.rejection_reason,
                    ec.created_at,
                    c.case_number,
                    c.title as case_title,
                    p.payment_code
                FROM employee_commissions ec
                LEFT JOIN cases c ON ec.case_id = c.id
                LEFT JOIN payments p ON ec.payment_id = p.id
                WHERE ec.employee_id = ?
                  AND ec.status = 'rejected'
                ORDER BY ec.created_at DESC
                LIMIT 10
            `, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Zmodyfikowane prowizje - ze zmienioną stawką
        const editedCommissions = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    ec.id,
                    ec.amount,
                    ec.rate,
                    ec.description,
                    ec.created_at,
                    ec.status,
                    c.case_number,
                    c.title as case_title,
                    p.payment_code
                FROM employee_commissions ec
                LEFT JOIN cases c ON ec.case_id = c.id
                LEFT JOIN payments p ON ec.payment_id = p.id
                WHERE ec.employee_id = ?
                  AND ec.description LIKE '%Edycja:%'
                ORDER BY ec.created_at DESC
                LIMIT 10
            `, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        res.json({
            success: true,
            summary: {
                commissions: commissionsStats,
                recent_payments: recentPayments,
                pending_expenses: pendingExpenses,
                rejected_commissions: rejectedCommissions,
                edited_commissions: editedCommissions
            }
        });
        
    } catch (error) {
        console.error('❌ Błąd pobierania podsumowania finansów:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// HISTORIA PROWIZJI PRACOWNIKA
// =====================================
router.get('/:userId/commissions/history', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, limit = 50, offset = 0 } = req.query;
        const db = getDatabase();
        
        let whereClause = 'WHERE ec.employee_id = ?';
        const params = [userId];
        
        if (status) {
            whereClause += ' AND ec.status = ?';
            params.push(status);
        }
        
        const commissions = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    ec.*,
                    c.case_number,
                    c.title as case_title,
                    cl.first_name || ' ' || cl.last_name as client_name
                FROM employee_commissions ec
                LEFT JOIN cases c ON ec.case_id = c.id
                LEFT JOIN clients cl ON c.client_id = cl.id
                ${whereClause}
                ORDER BY ec.created_at DESC
                LIMIT ? OFFSET ?
            `, [...params, parseInt(limit), parseInt(offset)], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        res.json({
            success: true,
            commissions
        });
        
    } catch (error) {
        console.error('❌ Błąd pobierania historii prowizji:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// HISTORIA WYPŁAT PRACOWNIKA
// =====================================
router.get('/:userId/payments/history', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        const db = getDatabase();
        
        const payments = await new Promise((resolve, reject) => {
            db.all(`
                SELECT *
                FROM employee_payments
                WHERE employee_id = ?
                ORDER BY payment_date DESC
                LIMIT ? OFFSET ?
            `, [userId, parseInt(limit), parseInt(offset)], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        res.json({
            success: true,
            payments
        });
        
    } catch (error) {
        console.error('❌ Błąd pobierania historii wypłat:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
