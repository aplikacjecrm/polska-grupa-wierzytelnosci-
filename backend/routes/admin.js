/**
 * Admin Routes v2.0
 * Rozszerzone o statystyki finansowe i raporty
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getDatabase } = require('../database/init');

// =====================================
// STATYSTYKI FINANSOWE
// =====================================
router.get('/financial-stats', authenticateToken, requireRole('admin', 'finance'), async (req, res) => {
    try {
        const db = getDatabase();
        const { period = 'month' } = req.query; // month, quarter, year, all
        
        // Statystyki ogólne
        const generalStats = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as total_payments,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
                    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
                    SUM(CASE WHEN status = 'pending' AND DATE(due_date) < DATE('now') THEN amount ELSE 0 END) as overdue_amount,
                    AVG(CASE WHEN status = 'completed' THEN amount END) as average_payment
                FROM payments
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        // Statystyki bieżącego miesiąca
        const thisMonth = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as count,
                    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as revenue
                FROM payments
                WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        // Top 5 klientów według przychodów
        const topClients = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    c.id,
                    c.first_name || ' ' || c.last_name as client_name,
                    c.company_name,
                    COUNT(p.id) as payment_count,
                    SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_revenue
                FROM clients c
                LEFT JOIN payments p ON c.id = p.client_id
                WHERE p.status = 'completed'
                GROUP BY c.id
                ORDER BY total_revenue DESC
                LIMIT 5
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Przychody ostatnich 12 miesięcy
        const revenueChart = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    strftime('%Y-%m', paid_at) as month,
                    COUNT(*) as count,
                    SUM(amount) as revenue
                FROM payments
                WHERE status = 'completed'
                  AND paid_at >= DATE('now', '-12 months')
                GROUP BY strftime('%Y-%m', paid_at)
                ORDER BY month ASC
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Wskaźnik realizacji
        const realizationRate = generalStats.total_payments > 0
            ? (generalStats.completed_count / generalStats.total_payments * 100).toFixed(1)
            : 0;
        
        res.json({
            success: true,
            stats: {
                general: {
                    ...generalStats,
                    realization_rate: parseFloat(realizationRate)
                },
                this_month: thisMonth,
                top_clients: topClients,
                revenue_chart: revenueChart
            }
        });
        
    } catch (error) {
        console.error('❌ Błąd pobierania statystyk finansowych:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// KOSZTY I WYDATKI
// =====================================
router.get('/expenses-stats', authenticateToken, requireRole('admin', 'finance'), async (req, res) => {
    try {
        const db = getDatabase();
        
        // Statystyki kosztów
        const expensesStats = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as total_count,
                    SUM(gross_amount) as total_amount,
                    SUM(CASE WHEN status = 'pending' THEN gross_amount ELSE 0 END) as pending_amount,
                    SUM(CASE WHEN status = 'approved' THEN gross_amount ELSE 0 END) as approved_amount,
                    SUM(CASE WHEN status = 'paid' THEN gross_amount ELSE 0 END) as paid_amount
                FROM expenses
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        // Koszty według kategorii
        const byCategory = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    category,
                    COUNT(*) as count,
                    SUM(gross_amount) as amount
                FROM expenses
                WHERE status = 'paid'
                GROUP BY category
                ORDER BY amount DESC
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        res.json({
            success: true,
            stats: {
                general: expensesStats,
                by_category: byCategory
            }
        });
        
    } catch (error) {
        console.error('❌ Błąd pobierania statystyk kosztów:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// BILANS (PRZYCHODY VS KOSZTY)
// =====================================
router.get('/balance', authenticateToken, requireRole('admin', 'finance'), async (req, res) => {
    try {
        const db = getDatabase();
        const { month } = req.query; // format: '2025-11'
        
        let dateFilter = '';
        if (month) {
            dateFilter = `AND strftime('%Y-%m', paid_at) = '${month}'`;
        }
        
        // Przychody
        const revenue = await new Promise((resolve, reject) => {
            db.get(`
                SELECT SUM(amount) as total
                FROM payments
                WHERE status = 'completed' ${dateFilter}
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row.total || 0);
            });
        });
        
        // Koszty
        const expenses = await new Promise((resolve, reject) => {
            db.get(`
                SELECT SUM(gross_amount) as total
                FROM expenses
                WHERE status = 'paid' ${dateFilter.replace('paid_at', 'payment_date')}
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row.total || 0);
            });
        });
        
        const profit = revenue - expenses;
        const profitMargin = revenue > 0 ? (profit / revenue * 100).toFixed(1) : 0;
        
        res.json({
            success: true,
            balance: {
                revenue,
                expenses,
                profit,
                profit_margin: parseFloat(profitMargin)
            }
        });
        
    } catch (error) {
        console.error('❌ Błąd obliczania bilansu:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
