const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

// =====================================
// GENEROWANIE RAT
// =====================================

/**
 * POST /api/installments/generate
 * Generuje harmonogram rat dla faktury/płatności
 */
router.post('/generate', authenticateToken, async (req, res) => {
    const {
        invoice_id,
        case_id,
        client_id,
        total_amount,
        installment_count,
        frequency, // monthly, weekly, biweekly
        start_date
    } = req.body;

    console.log('📅 Generowanie rat:', req.body);

    try {
        const db = getDatabase();
        
        // Oblicz kwotę pojedynczej raty
        const installmentAmount = (total_amount / installment_count).toFixed(2);
        
        // Przygotuj daty rat
        const installments = [];
        let currentDate = new Date(start_date);

        for (let i = 1; i <= installment_count; i++) {
            const dueDate = new Date(currentDate);
            
            // Oblicz następny termin według częstotliwości
            if (frequency === 'monthly') {
                currentDate.setMonth(currentDate.getMonth() + 1);
            } else if (frequency === 'weekly') {
                currentDate.setDate(currentDate.getDate() + 7);
            } else if (frequency === 'biweekly') {
                currentDate.setDate(currentDate.getDate() + 14);
            }

            installments.push({
                invoice_id,
                case_id,
                client_id,
                installment_number: i,
                total_installments: installment_count,
                amount: parseFloat(installmentAmount),
                due_date: dueDate.toISOString().split('T')[0],
                status: 'pending',
                created_by: req.user.id
            });
        }

        // Zapisz raty w bazie
        const insertSQL = `
            INSERT INTO payment_installments (
                invoice_id, case_id, client_id,
                installment_number, total_installments,
                amount, due_date, status, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const promises = installments.map(inst => {
            return new Promise((resolve, reject) => {
                db.run(insertSQL, [
                    inst.invoice_id,
                    inst.case_id,
                    inst.client_id,
                    inst.installment_number,
                    inst.total_installments,
                    inst.amount,
                    inst.due_date,
                    inst.status,
                    inst.created_by
                ], function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            });
        });

        await Promise.all(promises);

        console.log(`✅ Wygenerowano ${installment_count} rat dla faktury ${invoice_id}`);
        
        res.json({
            success: true,
            message: `Wygenerowano ${installment_count} rat`,
            installments: installments
        });

    } catch (error) {
        console.error('❌ Błąd generowania rat:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Błąd generowania harmonogramu rat' 
        });
    }
});

// =====================================
// LISTA RAT
// =====================================

/**
 * GET /api/installments
 * Pobiera listę rat z filtrami
 */
router.get('/', authenticateToken, async (req, res) => {
    const db = getDatabase();
    const { 
        client_id, 
        case_id, 
        invoice_id,
        status,
        overdue_only,
        upcoming_days
    } = req.query;

    let sql = `
        SELECT 
            pi.*,
            c.first_name || ' ' || c.last_name as client_name,
            cs.case_number,
            cs.title as case_title,
            si.invoice_number
        FROM payment_installments pi
        LEFT JOIN clients c ON pi.client_id = c.id
        LEFT JOIN cases cs ON pi.case_id = cs.id
        LEFT JOIN sales_invoices si ON pi.invoice_id = si.id
        WHERE 1=1
    `;

    const params = [];

    if (client_id) {
        sql += ` AND pi.client_id = ?`;
        params.push(client_id);
    }

    if (case_id) {
        sql += ` AND pi.case_id = ?`;
        params.push(case_id);
    }

    if (invoice_id) {
        sql += ` AND pi.invoice_id = ?`;
        params.push(invoice_id);
    }

    if (status) {
        sql += ` AND pi.status = ?`;
        params.push(status);
    }

    if (overdue_only === 'true') {
        sql += ` AND pi.status = 'pending' AND pi.due_date < date('now')`;
    }

    if (upcoming_days) {
        sql += ` AND pi.status = 'pending' AND pi.due_date BETWEEN date('now') AND date('now', '+' || ? || ' days')`;
        params.push(upcoming_days);
    }

    sql += ` ORDER BY pi.due_date ASC`;

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('❌ Błąd pobierania rat:', err);
            return res.status(500).json({ success: false, error: err.message });
        }

        // Oblicz dni opóźnienia dla przeterminowanych
        const today = new Date();
        rows.forEach(row => {
            if (row.status === 'pending') {
                const dueDate = new Date(row.due_date);
                if (dueDate < today) {
                    row.late_days = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                }
            }
        });

        console.log(`✅ Znaleziono ${rows.length} rat`);
        res.json({ success: true, installments: rows });
    });
});

// =====================================
// SZCZEGÓŁY RATY
// =====================================

/**
 * GET /api/installments/:id
 * Pobiera szczegóły pojedynczej raty
 */
router.get('/:id', authenticateToken, async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;

    const sql = `
        SELECT 
            pi.*,
            c.first_name || ' ' || c.last_name as client_name,
            c.email as client_email,
            c.phone as client_phone,
            cs.case_number,
            cs.title as case_title,
            si.invoice_number,
            si.gross_amount as invoice_total
        FROM payment_installments pi
        LEFT JOIN clients c ON pi.client_id = c.id
        LEFT JOIN cases cs ON pi.case_id = cs.id
        LEFT JOIN sales_invoices si ON pi.invoice_id = si.id
        WHERE pi.id = ?
    `;

    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error('❌ Błąd pobierania raty:', err);
            return res.status(500).json({ success: false, error: err.message });
        }

        if (!row) {
            return res.status(404).json({ success: false, error: 'Rata nie znaleziona' });
        }

        res.json({ success: true, installment: row });
    });
});

// =====================================
// OZNACZ RATĘ JAKO OPŁACONĄ
// =====================================

/**
 * PATCH /api/installments/:id/mark-paid
 * POST /api/installments/:id/pay
 * Oznacza ratę jako opłaconą
 */
router.patch('/:id/mark-paid', authenticateToken, async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const { payment_method, payment_reference, notes } = req.body;

    const sql = `
        UPDATE payment_installments
        SET 
            status = 'paid',
            paid_at = datetime('now'),
            payment_method = ?,
            payment_reference = ?,
            notes = ?,
            updated_at = datetime('now')
        WHERE id = ?
    `;

    db.run(sql, [payment_method, payment_reference, notes, id], function(err) {
        if (err) {
            console.error('❌ Błąd aktualizacji raty:', err);
            return res.status(500).json({ success: false, error: err.message });
        }

        console.log(`✅ Rata ${id} oznaczona jako opłacona`);
        res.json({ success: true, message: 'Rata oznaczona jako opłacona' });
    });
});

// Alias POST dla frontendu
router.post('/:id/pay', authenticateToken, async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const { payment_method, payment_reference, notes } = req.body;

    const sql = `
        UPDATE payment_installments
        SET 
            status = 'paid',
            paid_at = datetime('now'),
            payment_method = ?,
            payment_reference = ?,
            notes = ?,
            updated_at = datetime('now')
        WHERE id = ?
    `;

    db.run(sql, [payment_method || 'cash', payment_reference, notes, id], function(err) {
        if (err) {
            console.error('❌ Błąd aktualizacji raty:', err);
            return res.status(500).json({ success: false, error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ success: false, error: 'Rata nie znaleziona' });
        }

        console.log(`✅ Rata ${id} opłacona (${payment_method || 'cash'})`);
        res.json({ success: true, message: 'Rata została opłacona' });
    });
});

// =====================================
// STATYSTYKI RAT
// =====================================

/**
 * GET /api/installments/stats/overview
 * Statystyki rat (zaległości, nadchodzące, itd.)
 */
router.get('/stats/overview', authenticateToken, async (req, res) => {
    const db = getDatabase();
    const statsSQL = `
        SELECT 
            COUNT(*) as total_installments,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
            SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
            SUM(CASE WHEN status = 'pending' AND due_date < date('now') THEN 1 ELSE 0 END) as overdue_count,
            SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
            SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
            SUM(CASE WHEN status = 'pending' AND due_date < date('now') THEN amount ELSE 0 END) as overdue_amount,
            SUM(CASE WHEN status = 'pending' AND due_date BETWEEN date('now') AND date('now', '+7 days') THEN 1 ELSE 0 END) as upcoming_week_count,
            SUM(CASE WHEN status = 'pending' AND due_date BETWEEN date('now') AND date('now', '+30 days') THEN 1 ELSE 0 END) as upcoming_month_count
        FROM payment_installments
    `;

    db.get(statsSQL, [], (err, stats) => {
        if (err) {
            console.error('❌ Błąd pobierania statystyk:', err);
            return res.status(500).json({ success: false, error: err.message });
        }

        console.log('✅ Statystyki rat pobrane');
        res.json({ success: true, stats });
    });
});

// =====================================
// KLIENCI Z ZALEGŁOŚCIAMI
// =====================================

/**
 * GET /api/installments/stats/overdue-clients
 * Lista klientów z zaległościami
 */
router.get('/stats/overdue-clients', authenticateToken, async (req, res) => {
    const sql = `
        SELECT 
            pi.client_id,
            c.first_name || ' ' || c.last_name as client_name,
            c.email as client_email,
            c.phone as client_phone,
            COUNT(*) as overdue_count,
            SUM(pi.amount) as overdue_amount,
            MIN(pi.due_date) as oldest_due_date,
            MAX(julianday('now') - julianday(pi.due_date)) as max_days_overdue
        FROM payment_installments pi
        LEFT JOIN clients c ON pi.client_id = c.id
        WHERE pi.status = 'pending' AND pi.due_date < date('now')
        GROUP BY pi.client_id, c.first_name, c.last_name, c.email, c.phone
        ORDER BY overdue_amount DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('❌ Błąd pobierania zaległości:', err);
            return res.status(500).json({ success: false, error: err.message });
        }

        console.log(`✅ Znaleziono ${rows.length} klientów z zaległościami`);
        res.json({ success: true, overdue_clients: rows });
    });
});

// =====================================
// NADCHODZĄCE RATY (DASHBOARD)
// =====================================

/**
 * GET /api/installments/stats/upcoming
 * Nadchodzące raty w najbliższych X dniach
 */
router.get('/stats/upcoming', authenticateToken, async (req, res) => {
    const { days = 30 } = req.query;

    const sql = `
        SELECT 
            pi.*,
            c.first_name || ' ' || c.last_name as client_name,
            cs.case_number,
            si.invoice_number
        FROM payment_installments pi
        LEFT JOIN clients c ON pi.client_id = c.id
        LEFT JOIN cases cs ON pi.case_id = cs.id
        LEFT JOIN sales_invoices si ON pi.invoice_id = si.id
        WHERE pi.status = 'pending' 
        AND pi.due_date BETWEEN date('now') AND date('now', '+' || ? || ' days')
        ORDER BY pi.due_date ASC
    `;

    db.all(sql, [days], (err, rows) => {
        if (err) {
            console.error('❌ Błąd pobierania nadchodzących rat:', err);
            return res.status(500).json({ success: false, error: err.message });
        }

        console.log(`✅ Znaleziono ${rows.length} nadchodzących rat`);
        res.json({ success: true, upcoming: rows });
    });
});

// =====================================
// WYSYŁKA PRZYPOMNIENIA
// =====================================

/**
 * POST /api/installments/:id/send-reminder
 * Wysyła przypomnienie o racie
 */
router.post('/:id/send-reminder', authenticateToken, async (req, res) => {
    const { id } = req.params;

    // TODO: Integracja z systemem email
    
    const sql = `
        UPDATE payment_installments
        SET 
            reminder_sent = 1,
            reminder_sent_at = datetime('now'),
            updated_at = datetime('now')
        WHERE id = ?
    `;

    db.run(sql, [id], function(err) {
        if (err) {
            console.error('❌ Błąd wysyłki przypomnienia:', err);
            return res.status(500).json({ success: false, error: err.message });
        }

        console.log(`✅ Przypomnienie o racie ${id} wysłane`);
        res.json({ success: true, message: 'Przypomnienie wysłane' });
    });
});

module.exports = router;
