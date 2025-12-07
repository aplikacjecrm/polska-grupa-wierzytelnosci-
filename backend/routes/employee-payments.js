/**
 * API WYPŁAT PRACOWNIKÓW
 * 
 * System pensji, premii i bonusów
 * 
 * Endpointy:
 * - GET /api/employee-payments - Lista wypłat
 * - GET /api/employee-payments/pending - Oczekujące wypłaty
 * - GET /api/employee-payments/stats - Statystyki
 * - POST /api/employee-payments - Dodaj wypłatę
 * - POST /api/employee-payments/:id/pay - Oznacz jako wypłaconą
 * - GET /api/employee-payments/employee/:employeeId - Wypłaty pracownika
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

console.log('💼 [EMPLOYEE-PAYMENTS] Moduł employee-payments.js załadowany!');

// =====================================
// LISTA WYPŁAT
// =====================================

router.get('/', authenticateToken, async (req, res) => {
    const {
        status,
        payment_type,
        employee_id,
        period_month,
        period_year,
        limit = 50,
        offset = 0
    } = req.query;

    try {
        const db = getDatabase();

        let sql = `
            SELECT 
                ep.*,
                u.first_name || ' ' || u.last_name as employee_name,
                u.email as employee_email,
                cb.first_name || ' ' || cb.last_name as created_by_name,
                pb.first_name || ' ' || pb.last_name as paid_by_name
            FROM employee_payments ep
            LEFT JOIN users u ON ep.employee_id = u.id
            LEFT JOIN users cb ON ep.created_by = cb.id
            LEFT JOIN users pb ON ep.paid_by = pb.id
            WHERE 1=1
        `;

        const params = [];

        if (status) {
            sql += ` AND ep.status = ?`;
            params.push(status);
        }

        if (payment_type) {
            sql += ` AND ep.payment_type = ?`;
            params.push(payment_type);
        }

        if (employee_id) {
            sql += ` AND ep.employee_id = ?`;
            params.push(employee_id);
        }

        if (period_month) {
            sql += ` AND ep.period_month = ?`;
            params.push(period_month);
        }

        if (period_year) {
            sql += ` AND ep.period_year = ?`;
            params.push(period_year);
        }

        sql += ` ORDER BY ep.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const payments = await new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        console.log(`✅ Pobrano ${payments.length} wypłat`);

        res.json({
            success: true,
            payments,
            count: payments.length
        });

    } catch (error) {
        console.error('❌ Błąd pobierania wypłat:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================
// OCZEKUJĄCE WYPŁATY
// =====================================

router.get('/pending', authenticateToken, async (req, res) => {
    try {
        const db = getDatabase();

        const payments = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    ep.*,
                    u.first_name || ' ' || u.last_name as employee_name,
                    u.email as employee_email
                FROM employee_payments ep
                LEFT JOIN users u ON ep.employee_id = u.id
                WHERE ep.status = 'pending'
                ORDER BY ep.created_at ASC
            `, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        console.log(`✅ Pobrano ${payments.length} oczekujących wypłat`);

        res.json({
            success: true,
            payments
        });

    } catch (error) {
        console.error('❌ Błąd pobierania oczekujących wypłat:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================
// STATYSTYKI
// =====================================

router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const db = getDatabase();

        // Suma oczekujących
        const pending = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as count,
                    COALESCE(SUM(amount), 0) as total
                FROM employee_payments
                WHERE status = 'pending'
            `, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        // Wypłacone w tym miesiącu
        const thisMonth = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as count,
                    COALESCE(SUM(amount), 0) as total
                FROM employee_payments
                WHERE status = 'paid'
                  AND strftime('%Y-%m', paid_at) = strftime('%Y-%m', 'now')
            `, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        // Razem w tym roku
        const thisYear = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as count,
                    COALESCE(SUM(amount), 0) as total
                FROM employee_payments
                WHERE status = 'paid'
                  AND strftime('%Y', paid_at) = strftime('%Y', 'now')
            `, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        res.json({
            success: true,
            pending_count: pending.count,
            pending_total: pending.total,
            paid_this_month_count: thisMonth.count,
            paid_this_month: thisMonth.total,
            paid_this_year_count: thisYear.count,
            paid_this_year: thisYear.total
        });

    } catch (error) {
        console.error('❌ Błąd pobierania statystyk:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================
// DODAJ WYPŁATĘ
// =====================================

router.post('/', authenticateToken, async (req, res) => {
    const {
        employee_id,
        payment_type,
        amount,
        currency = 'PLN',
        period_month,
        period_year,
        description,
        payment_method,
        payment_date,
        notes
    } = req.body;

    try {
        const db = getDatabase();

        const result = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO employee_payments (
                    employee_id, payment_type, amount, currency,
                    period_month, period_year, description,
                    payment_method, payment_date, notes, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                employee_id, payment_type, amount, currency,
                period_month, period_year, description,
                payment_method, payment_date, notes, req.user.userId
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });

        console.log(`✅ Dodano wypłatę ID: ${result.id}`);

        res.json({
            success: true,
            message: 'Wypłata dodana pomyślnie',
            payment_id: result.id
        });

    } catch (error) {
        console.error('❌ Błąd dodawania wypłaty:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================
// OZNACZ JAKO WYPŁACONĄ
// =====================================

router.post('/:id/pay', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { transaction_reference, notes } = req.body;

    try {
        const db = getDatabase();

        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE employee_payments
                SET status = 'paid',
                    paid_at = datetime('now'),
                    paid_by = ?,
                    transaction_reference = ?,
                    notes = CASE 
                        WHEN notes IS NULL THEN ?
                        ELSE notes || '\n' || ?
                    END,
                    updated_at = datetime('now')
                WHERE id = ? AND status = 'pending'
            `, [req.user.userId, transaction_reference, notes, notes, id], function(err) {
                if (err) reject(err);
                else if (this.changes === 0) reject(new Error('Wypłata nie znaleziona lub już wypłacona'));
                else resolve();
            });
        });

        console.log(`✅ Wypłata ${id} oznaczona jako wypłacona`);

        res.json({
            success: true,
            message: 'Wypłata oznaczona jako wypłacona'
        });

    } catch (error) {
        console.error('❌ Błąd oznaczania wypłaty:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================
// WYPŁATY PRACOWNIKA
// =====================================

router.get('/employee/:employeeId', authenticateToken, async (req, res) => {
    const { employeeId } = req.params;

    try {
        const db = getDatabase();

        const payments = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    ep.*,
                    pb.first_name || ' ' || pb.last_name as paid_by_name
                FROM employee_payments ep
                LEFT JOIN users pb ON ep.paid_by = pb.id
                WHERE ep.employee_id = ?
                ORDER BY ep.created_at DESC
            `, [employeeId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        res.json({
            success: true,
            payments
        });

    } catch (error) {
        console.error('❌ Błąd pobierania wypłat pracownika:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
