const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');
const { logEmployeeActivity } = require('../utils/employee-activity');
const { calculateAndCreateCommissions } = require('../utils/commission-calculator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

console.log('💰 [PAYMENTS] Moduł payments.js załadowany!');

// =====================================
// KONFIGURACJA MULTER - UPLOAD POTWIERDZEŃ PŁATNOŚCI
// =====================================
const uploadsDir = path.join(__dirname, '../uploads/payment-confirmations');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Utworzono folder:', uploadsDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `payment-${req.params.id}-${uniqueSuffix}-${sanitizedName}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|jpg|jpeg|png|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = /pdf|jpeg|jpg|png|msword|document/.test(file.mimetype);
        
        if (mimetype && extname) {
            cb(null, true);
        } else {
            cb(new Error('Dozwolone tylko: PDF, JPG, PNG, DOC, DOCX'));
        }
    }
});

// =====================================
// PROWIZJE UŻYTKOWNIKA (dla konkretnego userId)
// Szuka w obu tabelach: lawyer_commissions i employee_commissions
// =====================================
router.get('/user-commissions/:userId', authenticateToken, async (req, res) => {
    try {
        const db = getDatabase();
        const userId = parseInt(req.params.userId);
        
        // Sprawdź uprawnienia - tylko admin/hr/finance lub własny profil
        const userRole = req.user.user_role || req.user.role;
        if (req.user.id !== userId && !['admin', 'hr', 'finance'].includes(userRole)) {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }
        
        // Pobierz z lawyer_commissions (stary system)
        const lawyerCommissions = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    lc.*,
                    c.case_number,
                    c.title as case_title,
                    cl.first_name || ' ' || cl.last_name as client_name,
                    p.payment_code,
                    p.amount as payment_amount,
                    'lawyer_commissions' as source
                FROM lawyer_commissions lc
                LEFT JOIN cases c ON lc.case_id = c.id
                LEFT JOIN clients cl ON lc.client_id = cl.id
                LEFT JOIN payments p ON lc.payment_id = p.id
                WHERE lc.user_id = ?
                ORDER BY lc.created_at DESC
            `, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Pobierz z employee_commissions (nowy system)
        const employeeCommissions = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    ec.id,
                    ec.employee_id as user_id,
                    ec.case_id,
                    ec.payment_id,
                    ec.amount as commission_amount,
                    ec.rate as commission_rate,
                    ec.status,
                    ec.rejection_reason,
                    ec.description,
                    ec.created_at,
                    c.case_number,
                    c.title as case_title,
                    cl.first_name || ' ' || cl.last_name as client_name,
                    p.payment_code,
                    p.amount as payment_amount,
                    'employee_commissions' as source
                FROM employee_commissions ec
                LEFT JOIN cases c ON ec.case_id = c.id
                LEFT JOIN clients cl ON c.client_id = cl.id
                LEFT JOIN payments p ON ec.payment_id = p.id
                WHERE ec.employee_id = ?
                ORDER BY ec.created_at DESC
            `, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Połącz obie listy i posortuj
        const commissions = [...lawyerCommissions, ...employeeCommissions]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 50);
        
        // Statystyki z obu tabel
        const stats = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    (SELECT COUNT(*) FROM lawyer_commissions WHERE user_id = ?) +
                    (SELECT COUNT(*) FROM employee_commissions WHERE employee_id = ?) as total,
                    
                    (SELECT COALESCE(SUM(commission_amount), 0) FROM lawyer_commissions WHERE user_id = ? AND status = 'pending') +
                    (SELECT COALESCE(SUM(amount), 0) FROM employee_commissions WHERE employee_id = ? AND status = 'pending') as pending_amount,
                    
                    (SELECT COALESCE(SUM(commission_amount), 0) FROM lawyer_commissions WHERE user_id = ? AND status = 'paid') +
                    (SELECT COALESCE(SUM(amount), 0) FROM employee_commissions WHERE employee_id = ? AND status = 'paid') as paid_amount,
                    
                    (SELECT COALESCE(SUM(commission_amount), 0) FROM lawyer_commissions WHERE user_id = ?) +
                    (SELECT COALESCE(SUM(amount), 0) FROM employee_commissions WHERE employee_id = ?) as total_amount
            `, [userId, userId, userId, userId, userId, userId, userId, userId], (err, row) => {
                if (err) reject(err);
                else resolve(row || {});
            });
        });
        
        res.json({ success: true, commissions, stats });
        
    } catch (error) {
        console.error('❌ Error getting user commissions:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// DASHBOARD FINANSOWY - WSZYSTKIE PŁATNOŚCI
// =====================================
router.get('/all', authenticateToken, async (req, res) => {
    try {
        const db = getDatabase();
        const userRole = req.user.user_role || req.user.role;
        
        // Sprawdź uprawnienia (admin, finance, reception)
        if (!['admin', 'finance', 'reception', 'lawyer'].includes(userRole)) {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }
        
        const { 
            status,           // pending, completed, failed
            client_id, 
            case_id,
            date_from, 
            date_to,
            payment_method,   // blik, paypal, cash, crypto, balance, bank_transfer
            limit = 100,
            offset = 0 
        } = req.query;
        
        // Buduj zapytanie z filtrami
        let query = `
            SELECT 
                p.*,
                c.case_number,
                c.title as case_title,
                cl.first_name || ' ' || cl.last_name as client_name,
                cl.company_name,
                u.name as created_by_name,
                confirmer.name as confirmed_by_name
            FROM payments p
            LEFT JOIN cases c ON p.case_id = c.id
            LEFT JOIN clients cl ON p.client_id = cl.id
            LEFT JOIN users u ON p.created_by = u.id
            LEFT JOIN users confirmer ON p.confirmed_by = confirmer.id
            WHERE 1=1
        `;
        
        const params = [];
        
        // Filtry
        if (status) {
            query += ' AND p.status = ?';
            params.push(status);
        }
        
        if (client_id) {
            query += ' AND p.client_id = ?';
            params.push(parseInt(client_id));
        }
        
        if (case_id) {
            query += ' AND p.case_id = ?';
            params.push(parseInt(case_id));
        }
        
        if (payment_method) {
            query += ' AND p.payment_method = ?';
            params.push(payment_method);
        }
        
        if (date_from) {
            query += ' AND DATE(p.created_at) >= ?';
            params.push(date_from);
        }
        
        if (date_to) {
            query += ' AND DATE(p.created_at) <= ?';
            params.push(date_to);
        }
        
        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        
        // Wykonaj zapytanie
        const payments = await new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Zlicz wszystkie (dla paginacji)
        let countQuery = 'SELECT COUNT(*) as total FROM payments p WHERE 1=1';
        const countParams = [];
        
        if (status) {
            countQuery += ' AND p.status = ?';
            countParams.push(status);
        }
        if (client_id) {
            countQuery += ' AND p.client_id = ?';
            countParams.push(parseInt(client_id));
        }
        if (case_id) {
            countQuery += ' AND p.case_id = ?';
            countParams.push(parseInt(case_id));
        }
        if (payment_method) {
            countQuery += ' AND p.payment_method = ?';
            countParams.push(payment_method);
        }
        if (date_from) {
            countQuery += ' AND DATE(p.created_at) >= ?';
            countParams.push(date_from);
        }
        if (date_to) {
            countQuery += ' AND DATE(p.created_at) <= ?';
            countParams.push(date_to);
        }
        
        const total = await new Promise((resolve, reject) => {
            db.get(countQuery, countParams, (err, row) => {
                if (err) reject(err);
                else resolve(row?.total || 0);
            });
        });
        
        res.json({ 
            success: true,
            payments,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
        
    } catch (error) {
        console.error('❌ Błąd pobierania wszystkich płatności:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// STATYSTYKI FINANSOWE
// =====================================
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const db = getDatabase();
        const userRole = req.user.user_role || req.user.role;
        
        // Sprawdź uprawnienia
        if (!['admin', 'finance', 'reception', 'lawyer'].includes(userRole)) {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }
        
        const { period = 'month' } = req.query; // month, quarter, year, all
        
        // Statystyki ogólne
        const generalStats = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as total_count,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
                    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
                    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_completed_amount,
                    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending_amount,
                    SUM(CASE WHEN status = 'pending' AND DATE(due_date) < DATE('now') THEN 1 ELSE 0 END) as overdue_count,
                    SUM(CASE WHEN status = 'pending' AND DATE(due_date) < DATE('now') THEN amount ELSE 0 END) as overdue_amount
                FROM payments
            `, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        // Statystyki bieżącego miesiąca
        const monthlyStats = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as count,
                    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as revenue
                FROM payments
                WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
            `, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        // Statystyki według metod płatności
        const paymentMethods = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    payment_method,
                    COUNT(*) as count,
                    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as amount
                FROM payments
                WHERE payment_method IS NOT NULL
                GROUP BY payment_method
                ORDER BY amount DESC
            `, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Najnowsze płatności
        const recentPayments = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    p.*,
                    c.case_number,
                    cl.first_name || ' ' || cl.last_name as client_name
                FROM payments p
                LEFT JOIN cases c ON p.case_id = c.id
                LEFT JOIN clients cl ON p.client_id = cl.id
                ORDER BY p.created_at DESC
                LIMIT 10
            `, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Zbliżające się terminy
        const upcomingDueDates = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    p.*,
                    c.case_number,
                    cl.first_name || ' ' || cl.last_name as client_name
                FROM payments p
                LEFT JOIN cases c ON p.case_id = c.id
                LEFT JOIN clients cl ON p.client_id = cl.id
                WHERE p.status = 'pending' 
                  AND p.due_date IS NOT NULL
                  AND DATE(p.due_date) BETWEEN DATE('now') AND DATE('now', '+7 days')
                ORDER BY p.due_date ASC
                LIMIT 10
            `, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        res.json({
            success: true,
            stats: {
                general: generalStats,
                monthly: monthlyStats,
                by_payment_method: paymentMethods,
                recent_payments: recentPayments,
                upcoming_due_dates: upcomingDueDates
            }
        });
        
    } catch (error) {
        console.error('❌ Błąd pobierania statystyk płatności:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// TEST ENDPOINT - BEZ AUTORYZACJI
// =====================================
router.get('/test', (req, res) => {
    console.log('🧪 [PAYMENTS] Test endpoint wywołany!');
    res.json({ 
        status: 'ok', 
        message: 'Payments router działa!',
        timestamp: new Date().toISOString()
    });
});

// =====================================
// TEST ENDPOINT - PŁATNOŚCI SPRAWY BEZ AUTH (TEMPORARY)
// =====================================
router.get('/case/:caseId/test', async (req, res) => {
    try {
        console.log('🧪 [PAYMENTS] Test endpoint płatności dla sprawy:', req.params.caseId);
        const db = getDatabase();
        
        if (!db) {
            return res.json({ 
                error: 'Database not initialized',
                payments: []
            });
        }
        
        // Sprawdź czy tabela istnieje
        const tableExists = await new Promise((resolve) => {
            db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='payments'", (err, row) => {
                resolve(!!row);
            });
        });
        
        if (!tableExists) {
            return res.json({
                error: 'Table payments does not exist',
                payments: [],
                hint: 'Restart backend to create tables'
            });
        }
        
        // Pobierz płatności
        const payments = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM payments WHERE case_id = ?', [req.params.caseId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        res.json({ 
            success: true,
            tableExists: true,
            payments: payments,
            count: payments.length
        });
    } catch (error) {
        console.error('❌ [PAYMENTS] Test error:', error);
        res.json({ 
            error: error.message,
            payments: []
        });
    }
});

// =====================================
// GENEROWANIE KODU PŁATNOŚCI
// =====================================
router.post('/generate-code', authenticateToken, async (req, res) => {
    try {
        const { caseId } = req.body;
        const db = getDatabase();
        
        // Pobierz sprawę
        const caseData = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM cases WHERE id = ?', [caseId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!caseData) {
            return res.status(404).json({ error: 'Sprawa nie znaleziona' });
        }
        
        // Pobierz liczbę płatności dla tej sprawy
        const count = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM payments WHERE case_id = ?', [caseId], (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });
        
        // Format: PAY/TYP_SPRAWY/INICJAŁY/NUMER_SPRAWY/NUMER_PŁATNOŚCI
        // Przykład: PAY/CYW/JK/001/001
        const caseNumber = caseData.case_number || 'UNKNOWN';
        const parts = caseNumber.split('/');
        const caseType = parts[0] || 'GEN';
        const initials = parts[1] || 'XX';
        const caseNum = parts[2] || '000';
        
        const paymentNumber = String(count + 1).padStart(3, '0');
        const paymentCode = `PAY/${caseType}/${initials}/${caseNum}/${paymentNumber}`;
        
        res.json({ code: paymentCode });
    } catch (error) {
        console.error('Błąd generowania kodu płatności:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// UTWORZENIE PŁATNOŚCI
// =====================================
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            payment_code,
            case_id,
            client_id,
            amount,
            currency = 'PLN',
            description,
            payment_type, // 'invoice', 'advance', 'final', 'other'
            payment_method = 'paypal', // 'blik', 'paypal', 'card', 'cash', 'crypto', 'balance', 'bank_transfer'
            add_to_balance = false,
            blik_code, // Kod BLIK (6 cyfr)
            crypto_currency, // 'BTC', 'ETH', 'USDT'
            crypto_wallet_address,
            due_date,
            // KONTROLA PROWIZJI
            enable_commission = 1, // Domyślnie włączona
            commission_rate_override = null, // Custom stawka (%)
            commission_recipient_override = null // 'lawyer_only', 'case_manager_only', 'client_manager_only', null = auto
        } = req.body;
        
        const db = getDatabase();
        
        console.log('💰 [PAYMENT] Tworzenie płatności z kontrolą prowizji:', {
            enable_commission,
            commission_rate_override,
            commission_recipient_override
        });
        
        // Bezpieczne pobranie user_id
        const userId = req.user?.id || req.user?.userId || null;
        console.log('🔐 User ID dla płatności:', userId, 'req.user:', req.user);
        
        const result = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO payments (
                    payment_code, case_id, client_id, lawyer_id,
                    amount, currency, description, payment_type,
                    payment_method, add_to_balance,
                    blik_code, crypto_currency, crypto_wallet_address,
                    status, due_date, created_by,
                    enable_commission, commission_rate_override, commission_recipient_override
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)
            `, [
                payment_code,
                case_id,
                client_id,
                userId, // lawyer_id
                amount,
                currency,
                description,
                payment_type,
                payment_method,
                add_to_balance ? 1 : 0,
                blik_code || null,
                crypto_currency || null,
                crypto_wallet_address || null,
                due_date,
                userId, // created_by
                enable_commission ? 1 : 0,
                commission_rate_override,
                commission_recipient_override
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
        
        // Dodaj do historii
        if (userId) {
            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO payment_history (payment_id, new_status, changed_by)
                    VALUES (?, 'pending', ?)
                `, [result.id, userId], (err) => {
                    if (err) {
                        console.error('⚠️ Błąd dodawania do historii płatności:', err);
                        resolve(); // Nie przerywaj
                    } else {
                        resolve();
                    }
                });
            });
        }
        
        // 📊 LOGUJ AKTYWNOŚĆ DO HISTORII SPRAWY
        if (userId) {
            logEmployeeActivity({
                userId: userId,
                actionType: 'payment_created',
                actionCategory: 'payment',
                description: `Utworzono płatność: ${amount} ${currency} (${payment_code})`,
                caseId: case_id || null,
                clientId: client_id || null,
                paymentId: result.id
            });
        } else {
            console.warn('⚠️ Brak user_id - pomijam logowanie aktywności');
        }
        
        // Event Bus - emit
        // TODO: eventBus.emit('payment:created', { paymentId: result.id, caseId: case_id });
        
        // 💰 AUTOMATYCZNE WYLICZANIE PROWIZJI
        if (case_id) {
            try {
                const commResult = await calculateAndCreateCommissions(result.id, case_id, parseFloat(amount));
                if (commResult.success) {
                    console.log(`✅ Utworzono ${commResult.commissions_created} prowizji dla płatności ${result.id}`);
                }
            } catch (commError) {
                console.error('⚠️ Błąd wyliczania prowizji (płatność utworzona pomyślnie):', commError);
                // Nie przerywaj procesu - płatność jest już utworzona
            }
        } else {
            console.log('⚠️ Płatność bez case_id - pomijam prowizje');
        }
        
        res.json({ success: true, paymentId: result.id, payment_code });
    } catch (error) {
        console.error('Błąd tworzenia płatności:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// POBIERZ PŁATNOŚCI SPRAWY
// =====================================
router.get('/case/:caseId', authenticateToken, async (req, res) => {
    try {
        console.log('💰 [PAYMENTS] Pobieranie płatności dla sprawy:', req.params.caseId);
        const { caseId } = req.params;
        const db = getDatabase();
        
        if (!db) {
            console.error('❌ [PAYMENTS] Baza danych nie zainicjalizowana!');
            return res.status(500).json({ error: 'Database not initialized' });
        }
        
        const payments = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    p.*,
                    c.first_name || ' ' || c.last_name as client_name,
                    u.name as lawyer_name,
                    confirmer.name as confirmed_by_name
                FROM payments p
                LEFT JOIN clients c ON p.client_id = c.id
                LEFT JOIN users u ON p.lawyer_id = u.id
                LEFT JOIN users confirmer ON p.confirmed_by = confirmer.id
                WHERE p.case_id = ?
                ORDER BY p.created_at DESC
            `, [caseId], (err, rows) => {
                if (err) {
                    console.error('❌ [PAYMENTS] Błąd SQL:', err);
                    reject(err);
                } else {
                    console.log(`✅ [PAYMENTS] Znaleziono ${rows.length} płatności dla sprawy ${caseId}`);
                    resolve(rows || []);
                }
            });
        });
        
        res.json({ payments });
    } catch (error) {
        console.error('❌ [PAYMENTS] Błąd pobierania płatności:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// POBIERZ PŁATNOŚCI KLIENTA + SALDO
// =====================================
router.get('/client/:clientId', authenticateToken, async (req, res) => {
    try {
        console.log('💰 [PAYMENTS] Pobieranie płatności klienta:', req.params.clientId);
        const { clientId } = req.params;
        const db = getDatabase();
        
        // Pobierz saldo klienta
        const balance = await new Promise((resolve, reject) => {
            db.get(`
                SELECT balance, currency, last_transaction_at
                FROM client_balance
                WHERE client_id = ?
            `, [clientId], (err, row) => {
                if (err) reject(err);
                else resolve(row || { balance: 0, currency: 'PLN', last_transaction_at: null });
            });
        });
        
        // Pobierz płatności pogrupowane po sprawach
        const payments = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    p.*,
                    cs.case_number,
                    cs.title as case_title,
                    cs.id as case_id,
                    confirmer.name as confirmed_by_name
                FROM payments p
                LEFT JOIN cases cs ON p.case_id = cs.id
                LEFT JOIN users confirmer ON p.confirmed_by = confirmer.id
                WHERE p.client_id = ?
                ORDER BY cs.id, p.created_at DESC
            `, [clientId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Pogrupuj płatności po sprawach
        const paymentsByCases = payments.reduce((acc, payment) => {
            const caseId = payment.case_id;
            if (!acc[caseId]) {
                acc[caseId] = {
                    case_number: payment.case_number,
                    case_title: payment.case_title,
                    payments: [],
                    total: 0,
                    paid: 0,
                    pending: 0
                };
            }
            acc[caseId].payments.push(payment);
            acc[caseId].total += parseFloat(payment.amount || 0);
            if (payment.status === 'completed') {
                acc[caseId].paid += parseFloat(payment.amount || 0);
            } else if (payment.status === 'pending') {
                acc[caseId].pending += parseFloat(payment.amount || 0);
            }
            return acc;
        }, {});
        
        // Historia transakcji salda
        const transactions = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    bt.*,
                    u.name as created_by_name
                FROM balance_transactions bt
                LEFT JOIN users u ON bt.created_by = u.id
                WHERE bt.client_id = ?
                ORDER BY bt.created_at DESC
                LIMIT 50
            `, [clientId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        console.log(`✅ [PAYMENTS] Klient ${clientId}: Saldo ${balance.balance} PLN, ${payments.length} płatności`);
        
        res.json({ 
            balance,
            payments,
            paymentsByCases: Object.values(paymentsByCases),
            transactions
        });
    } catch (error) {
        console.error('❌ [PAYMENTS] Błąd pobierania płatności klienta:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// POBIERZ WSZYSTKIE PŁATNOŚCI (ADMIN)
// =====================================
router.get('/all', authenticateToken, async (req, res) => {
    try {
        // Sprawdź czy admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }
        
        const db = getDatabase();
        const { status, from_date, to_date } = req.query;
        
        let query = `
            SELECT 
                p.*,
                c.first_name || ' ' || c.last_name as client_name,
                cs.case_number,
                u.name as lawyer_name
            FROM payments p
            LEFT JOIN clients c ON p.client_id = c.id
            LEFT JOIN cases cs ON p.case_id = cs.id
            LEFT JOIN users u ON p.lawyer_id = u.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (status) {
            query += ' AND p.status = ?';
            params.push(status);
        }
        
        if (from_date) {
            query += ' AND p.created_at >= ?';
            params.push(from_date);
        }
        
        if (to_date) {
            query += ' AND p.created_at <= ?';
            params.push(to_date);
        }
        
        query += ' ORDER BY p.created_at DESC';
        
        const payments = await new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        res.json({ payments });
    } catch (error) {
        console.error('Błąd pobierania wszystkich płatności:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// AKTUALIZACJA STATUSU PŁATNOŚCI
// =====================================
router.put('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, paypal_order_id, paypal_payment_id, paypal_payer_email, note } = req.body;
        
        const db = getDatabase();
        
        // Pobierz obecny status
        const payment = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM payments WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!payment) {
            return res.status(404).json({ error: 'Płatność nie znaleziona' });
        }
        
        // Aktualizuj płatność
        const updates = ['status = ?'];
        const params = [status];
        
        if (paypal_order_id) {
            updates.push('paypal_order_id = ?');
            params.push(paypal_order_id);
        }
        
        if (paypal_payment_id) {
            updates.push('paypal_payment_id = ?');
            params.push(paypal_payment_id);
        }
        
        if (paypal_payer_email) {
            updates.push('paypal_payer_email = ?');
            params.push(paypal_payer_email);
        }
        
        if (status === 'completed') {
            updates.push('paid_at = CURRENT_TIMESTAMP');
        }
        
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);
        
        await new Promise((resolve, reject) => {
            db.run(`UPDATE payments SET ${updates.join(', ')} WHERE id = ?`, params, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Dodaj do historii
        await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO payment_history (payment_id, old_status, new_status, note, changed_by)
                VALUES (?, ?, ?, ?, ?)
            `, [id, payment.status, status, note || null, req.user.id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Event Bus - emit
        // TODO: eventBus.emit('payment:statusChanged', { paymentId: id, oldStatus: payment.status, newStatus: status });
        
        res.json({ success: true, message: 'Status płatności zaktualizowany' });
    } catch (error) {
        console.error('Błąd aktualizacji statusu płatności:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// HISTORIA PŁATNOŚCI
// =====================================
router.get('/:id/history', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        
        const history = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    ph.*,
                    u.name as changed_by_name
                FROM payment_history ph
                LEFT JOIN users u ON ph.changed_by = u.id
                WHERE ph.payment_id = ?
                ORDER BY ph.changed_at DESC
            `, [id], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        res.json({ history });
    } catch (error) {
        console.error('Błąd pobierania historii płatności:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// STATYSTYKI PŁATNOŚCI
// =====================================
router.get('/stats/summary', authenticateToken, async (req, res) => {
    try {
        const db = getDatabase();
        
        // Sprawdź rolę
        let whereClause = '';
        if (req.user.role === 'lawyer') {
            whereClause = `WHERE lawyer_id = ${req.user.id}`;
        }
        
        const stats = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as total_payments,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
                    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
                    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_paid,
                    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending
                FROM payments
                ${whereClause}
            `, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        res.json({ stats });
    } catch (error) {
        console.error('Błąd pobierania statystyk płatności:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// PŁATNOŚĆ GOTÓWKĄ
// =====================================
router.post('/:id/pay-cash', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { cash_receipt_number, note, add_to_balance } = req.body;
        
        const db = getDatabase();
        
        // Pobierz płatność
        const payment = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM payments WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!payment) {
            return res.status(404).json({ error: 'Płatność nie znaleziona' });
        }
        
        // Aktualizuj płatność
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE payments SET 
                    status = 'completed',
                    cash_receipt_number = ?,
                    cash_received_by = ?,
                    paid_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [cash_receipt_number, req.user.id, id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Dodaj do historii
        await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO payment_history (payment_id, old_status, new_status, note, changed_by)
                VALUES (?, ?, 'completed', ?, ?)
            `, [id, payment.status, `Płatność gotówką. Paragon: ${cash_receipt_number}. ${note || ''}`, req.user.id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Jeśli add_to_balance = true, dodaj do salda
        if (add_to_balance === true) {
            console.log('💰 Dodaję do salda klienta:', payment.client_id, payment.amount);
            await addToClientBalance(db, payment.client_id, parseFloat(payment.amount), id, req.user.id, 'Wpłata gotówkowa');
        }
        
        // Automatyczne generowanie paragonu
        try {
            const receiptNumber = await generateReceiptNumber(db, 'receipt');
            const grossAmount = parseFloat(payment.amount);
            
            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO payment_receipts (
                        payment_id, receipt_type, receipt_number, issue_date,
                        client_id, case_id, amount, currency,
                        tax_rate, net_amount, tax_amount, gross_amount,
                        description, payment_method, created_by
                    ) VALUES (?, 'receipt', ?, date('now'), ?, ?, ?, ?, 0, ?, 0, ?, ?, 'cash', ?)
                `, [
                    id, receiptNumber, payment.client_id, payment.case_id,
                    grossAmount, payment.currency || 'PLN',
                    grossAmount, grossAmount,
                    `Płatność gotówką - ${cash_receipt_number}`,
                    req.user.id
                ], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            console.log(`✅ Automatycznie wygenerowano paragon: ${receiptNumber}`);
        } catch (err) {
            console.error('⚠️ Błąd generowania paragonu (płatność zarejestrowana pomyślnie):', err);
        }
        
        // 💰 AUTOMATYCZNE WYLICZANIE PROWIZJI
        if (payment.case_id) {
            try {
                const { calculateAndCreateCommissions } = require('../utils/commission-calculator');
                const result = await calculateAndCreateCommissions(id, payment.case_id, parseFloat(payment.amount));
                
                if (result.success) {
                    console.log(`💰 Utworzono ${result.commissions_created} prowizji, łącznie: ${result.total_commission_amount} PLN`);
                }
            } catch (err) {
                console.error('⚠️ Błąd tworzenia prowizji (płatność zarejestrowana pomyślnie):', err);
            }
        }
        
        res.json({ success: true, message: 'Płatność gotówką zarejestrowana' });
    } catch (error) {
        console.error('Błąd płatności gotówką:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// RĘCZNE POTWIERDZENIE OPŁATY (ADMIN/FINANCE)
// =====================================
router.post('/:id/confirm-paid', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            payment_method,     // card, paypal, bank_transfer, etc.
            payment_reference,  // np. numer transakcji, ID PayPal
            note,
            confirmation_file   // opcjonalnie - ścieżka do pliku
        } = req.body;
        
        const db = getDatabase();
        const userRole = req.user.user_role || req.user.role;
        const userId = req.user.userId || req.user.id;
        
        // Sprawdź uprawnienia - tylko admin, finance, reception
        if (!['admin', 'finance', 'reception'].includes(userRole)) {
            return res.status(403).json({ error: 'Brak uprawnień do potwierdzania płatności' });
        }
        
        console.log(`💳 [PAYMENTS] Ręczne potwierdzenie opłaty #${id} przez ${req.user.name || userId}`);
        
        // Pobierz płatność
        const payment = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM payments WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!payment) {
            return res.status(404).json({ error: 'Płatność nie znaleziona' });
        }
        
        if (payment.status === 'completed') {
            return res.status(400).json({ error: 'Płatność już opłacona' });
        }
        
        // Aktualizuj płatność
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE payments SET 
                    status = 'completed',
                    payment_method = ?,
                    payment_reference = ?,
                    confirmation_file = ?,
                    confirmed_by = ?,
                    paid_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [payment_method, payment_reference, confirmation_file, userId, id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Dodaj do historii
        await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO payment_history (payment_id, old_status, new_status, note, changed_by)
                VALUES (?, ?, 'completed', ?, ?)
            `, [
                id, 
                payment.status, 
                `Ręczne potwierdzenie opłaty (${payment_method}). Ref: ${payment_reference || 'Brak'}. ${note || ''}`, 
                userId
            ], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Jeśli add_to_balance = true, dodaj do salda
        if (payment.add_to_balance) {
            await addToClientBalance(db, payment.client_id, parseFloat(payment.amount), id, userId, `Wpłata ${payment_method}`);
        }
        
        // 💰 AUTOMATYCZNE WYLICZANIE PROWIZJI
        if (payment.case_id) {
            try {
                const result = await calculateAndCreateCommissions(id, payment.case_id, parseFloat(payment.amount));
                
                if (result.success) {
                    console.log(`💰 Utworzono ${result.commissions_created} prowizji, łącznie: ${result.total_commission_amount} PLN`);
                }
            } catch (err) {
                console.error('⚠️ Błąd tworzenia prowizji (płatność zarejestrowana pomyślnie):', err);
            }
        }
        
        console.log(`✅ [PAYMENTS] Płatność #${id} potwierdzona jako opłacona (${payment_method})`);
        
        res.json({ 
            success: true, 
            message: 'Płatność potwierdzona jako opłacona',
            payment_id: id,
            payment_method,
            amount: payment.amount
        });
    } catch (error) {
        console.error('❌ Błąd potwierdzania płatności:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// UPLOAD PLIKU POTWIERDZAJĄCEGO PŁATNOŚĆ
// =====================================
router.post('/:id/upload-confirmation', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_method, payment_reference, note } = req.body;
        const db = getDatabase();
        const userRole = req.user.user_role || req.user.role;
        
        // Sprawdź uprawnienia - tylko admin, finance, reception
        if (!['admin', 'finance', 'reception'].includes(userRole)) {
            return res.status(403).json({ error: 'Brak uprawnień do uploadu potwierdzeń' });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: 'Brak pliku' });
        }
        
        console.log(`📎 [PAYMENTS] Upload potwierdzenia dla płatności #${id}:`, req.file.filename);
        console.log('👤 [PAYMENTS] req.user:', JSON.stringify(req.user, null, 2));
        
        // Użyj userId lub id (kompatybilność)
        const userId = req.user.userId || req.user.id;
        console.log('👤 [PAYMENTS] Użyty userId:', userId);
        
        // Pobierz płatność
        const payment = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM payments WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!payment) {
            // Usuń plik jeśli płatność nie istnieje
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ error: 'Płatność nie znaleziona' });
        }
        
        // Ścieżka relatywna do zapisania w bazie
        const relativePath = `payment-confirmations/${req.file.filename}`;
        
        // Aktualizuj płatność
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE payments SET 
                    status = 'completed',
                    payment_method = ?,
                    payment_reference = ?,
                    confirmation_file = ?,
                    confirmed_by = ?,
                    paid_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [
                payment_method || payment.payment_method,
                payment_reference || null,
                relativePath,
                userId,
                id
            ], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Dodaj do historii z pełną ścieżką do pliku
        const fileInfo = `${req.file.filename}`;
        const historyNote = `Opłacono z załączonym plikiem: ${fileInfo}${note ? '. ' + note : ''}`;
        
        await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO payment_history (payment_id, old_status, new_status, note, changed_by)
                VALUES (?, ?, 'completed', ?, ?)
            `, [
                id, 
                payment.status, 
                historyNote, 
                userId
            ], (err) => {
                if (err) {
                    console.error('❌ Błąd zapisu historii:', err);
                    console.error('Próbowano zapisać changed_by:', userId);
                    reject(err);
                } else {
                    console.log('✅ Historia zapisana, changed_by:', userId);
                    resolve();
                }
            });
        });
        
        // Jeśli add_to_balance = true, dodaj do salda
        if (payment.add_to_balance) {
            await addToClientBalance(db, payment.client_id, parseFloat(payment.amount), id, userId, `Wpłata z potwierdzeniem`);
        }
        
        console.log(`✅ [PAYMENTS] Płatność #${id} potwierdzona z plikiem: ${req.file.filename}`);
        
        res.json({ 
            success: true, 
            message: 'Płatność potwierdzona z załączonym plikiem',
            payment_id: id,
            file_name: req.file.originalname,
            file_path: relativePath
        });
        
    } catch (error) {
        console.error('❌ Błąd uploadu potwierdzenia:', error);
        
        // Usuń plik w razie błędu
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// PŁATNOŚĆ ZE SALDA KLIENTA
// =====================================
router.post('/:id/pay-with-balance', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        
        console.log(`💰 [PAYMENTS] Próba opłacenia płatności #${id} ze salda klienta`);
        
        // Pobierz płatność
        const payment = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM payments WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!payment) {
            return res.status(404).json({ error: 'Płatność nie znaleziona' });
        }
        
        if (payment.status === 'completed') {
            return res.status(400).json({ error: 'Płatność już opłacona' });
        }
        
        // Sprawdź czy użytkownik to klient tej płatności LUB ma uprawnienia admin/finance
        const userRole = req.user.user_role || req.user.role;
        const isAdmin = ['admin', 'finance', 'reception'].includes(userRole);
        const isOwner = req.user.id === payment.client_id;
        
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ error: 'Brak uprawnień do opłacenia tej płatności' });
        }
        
        // Pobierz saldo klienta
        const balance = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM client_balance WHERE client_id = ?', [payment.client_id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        const currentBalance = balance ? parseFloat(balance.balance) : 0;
        const paymentAmount = parseFloat(payment.amount);
        
        if (currentBalance < paymentAmount) {
            return res.status(400).json({ 
                error: 'Niewystarczające saldo',
                current_balance: currentBalance,
                required_amount: paymentAmount,
                missing: paymentAmount - currentBalance
            });
        }
        
        const newBalance = currentBalance - paymentAmount;
        
        // Aktualizuj saldo
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE client_balance SET 
                    balance = ?,
                    last_transaction_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE client_id = ?
            `, [newBalance, payment.client_id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Dodaj transakcję do historii salda
        await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO balance_transactions (
                    client_id, payment_id, amount, transaction_type,
                    description, balance_before, balance_after, created_by
                ) VALUES (?, ?, ?, 'debit', ?, ?, ?, ?)
            `, [
                payment.client_id,
                id,
                -paymentAmount,
                `Opłata płatności ${payment.payment_code}`,
                currentBalance,
                newBalance,
                req.user.id
            ], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Aktualizuj płatność
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE payments SET 
                    status = 'completed',
                    payment_method = 'balance',
                    paid_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Dodaj do historii płatności
        await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO payment_history (payment_id, old_status, new_status, note, changed_by)
                VALUES (?, ?, 'completed', ?, ?)
            `, [
                id,
                payment.status,
                `Opłacono ze salda klienta. Saldo: ${currentBalance} PLN → ${newBalance} PLN`,
                req.user.id
            ], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        console.log(`✅ [PAYMENTS] Płatność #${id} opłacona ze salda: ${currentBalance} → ${newBalance} PLN`);
        
        res.json({
            success: true,
            message: 'Płatność opłacona ze salda',
            payment_id: id,
            amount: paymentAmount,
            previous_balance: currentBalance,
            new_balance: newBalance
        });
        
    } catch (error) {
        console.error('❌ Błąd płatności ze salda:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// PŁATNOŚĆ KRYPTOWALUTĄ
// =====================================
router.post('/:id/pay-crypto', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            crypto_transaction_hash, 
            crypto_amount,
            crypto_currency,
            note 
        } = req.body;
        
        const db = getDatabase();
        
        // Pobierz płatność
        const payment = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM payments WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!payment) {
            return res.status(404).json({ error: 'Płatność nie znaleziona' });
        }
        
        // Aktualizuj płatność
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE payments SET 
                    status = 'completed',
                    crypto_transaction_hash = ?,
                    crypto_amount = ?,
                    crypto_currency = ?,
                    paid_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [crypto_transaction_hash, crypto_amount, crypto_currency, id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Dodaj do historii
        await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO payment_history (payment_id, old_status, new_status, note, changed_by)
                VALUES (?, ?, 'completed', ?, ?)
            `, [id, payment.status, `Płatność ${crypto_currency}. Hash: ${crypto_transaction_hash}. ${note || ''}`, req.user.id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Jeśli add_to_balance = true, dodaj do salda
        if (payment.add_to_balance) {
            await addToClientBalance(db, payment.client_id, parseFloat(payment.amount), id, req.user.id, `Wpłata ${crypto_currency}`);
        }
        
        res.json({ success: true, message: 'Płatność kryptowalutą zarejestrowana' });
    } catch (error) {
        console.error('Błąd płatności kryptowalutą:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// SALDO KLIENTA
// =====================================
router.get('/balance/:clientId', authenticateToken, async (req, res) => {
    try {
        const { clientId } = req.params;
        const db = getDatabase();
        
        // Pobierz lub utwórz saldo
        let balance = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM client_balance WHERE client_id = ?', [clientId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!balance) {
            // Utwórz nowe saldo
            await new Promise((resolve, reject) => {
                db.run('INSERT INTO client_balance (client_id, balance) VALUES (?, 0)', [clientId], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            balance = { client_id: clientId, balance: 0, currency: 'PLN' };
        }
        
        // Pobierz transakcje
        const transactions = await new Promise((resolve, reject) => {
            db.all(`
                SELECT * FROM balance_transactions 
                WHERE client_id = ? 
                ORDER BY created_at DESC 
                LIMIT 50
            `, [clientId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        res.json({ balance, transactions });
    } catch (error) {
        console.error('Błąd pobierania salda:', error);
        res.status(500).json({ error: error.message });
    }
});

// Funkcja pomocnicza - dodawanie do salda
async function addToClientBalance(db, clientId, amount, paymentId, userId, description) {
    // Pobierz aktualne saldo
    let balance = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM client_balance WHERE client_id = ?', [clientId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
    
    const currentBalance = balance ? parseFloat(balance.balance) : 0;
    const newBalance = currentBalance + parseFloat(amount);
    
    // Zaktualizuj lub utwórz saldo
    if (balance) {
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE client_balance SET 
                    balance = ?, 
                    last_transaction_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE client_id = ?
            `, [newBalance, clientId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    } else {
        await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO client_balance (client_id, balance, last_transaction_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
            `, [clientId, newBalance], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
    
    // Dodaj transakcję
    await new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO balance_transactions (
                client_id, payment_id, amount, transaction_type,
                description, balance_before, balance_after, created_by
            ) VALUES (?, ?, ?, 'credit', ?, ?, ?, ?)
        `, [clientId, paymentId, amount, description, currentBalance, newBalance, userId], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// =====================================
// ZASILENIE SALDA KLIENTA
// =====================================
router.post('/top-up', authenticateToken, async (req, res) => {
    try {
        const {
            clientId,
            amount,
            paymentMethod, // 'blik', 'paypal', 'card', 'transfer'
            description,
            blikCode, // Dla BLIK
            ...paymentData // Dodatkowe dane płatności
        } = req.body;
        
        console.log(`💰 [PAYMENTS] Zasilenie salda klienta ${clientId}: ${amount} PLN (${paymentMethod})`);
        
        if (!clientId || !amount || amount <= 0) {
            return res.status(400).json({ error: 'Nieprawidłowe dane' });
        }
        
        const db = getDatabase();
        
        // Pobierz aktualne saldo
        const currentBalance = await new Promise((resolve, reject) => {
            db.get('SELECT balance FROM client_balance WHERE client_id = ?', [clientId], (err, row) => {
                if (err) reject(err);
                else resolve(row ? parseFloat(row.balance) : 0);
            });
        });
        
        const newBalance = currentBalance + parseFloat(amount);
        
        // Aktualizuj lub utwórz rekord salda
        if (currentBalance > 0) {
            await new Promise((resolve, reject) => {
                db.run(`
                    UPDATE client_balance 
                    SET balance = ?, last_transaction_at = CURRENT_TIMESTAMP 
                    WHERE client_id = ?
                `, [newBalance, clientId], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } else {
            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO client_balance (client_id, balance, currency, last_transaction_at)
                    VALUES (?, ?, 'PLN', CURRENT_TIMESTAMP)
                `, [clientId, newBalance], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
        
        // Dodaj transakcję do historii
        const transactionResult = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO balance_transactions (
                    client_id, amount, transaction_type, description,
                    balance_before, balance_after, created_by
                ) VALUES (?, ?, 'top_up', ?, ?, ?, ?)
            `, [
                clientId, 
                amount, 
                description || `Zasilenie salda przez ${paymentMethod.toUpperCase()}`,
                currentBalance,
                newBalance,
                req.user.id
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
        
        console.log(`✅ [PAYMENTS] Saldo zasilone: ${currentBalance} → ${newBalance} PLN`);
        
        res.json({
            success: true,
            transactionId: transactionResult.id,
            previousBalance: currentBalance,
            newBalance: newBalance,
            amount: parseFloat(amount),
            paymentMethod,
            message: `Saldo zostało zasilone o ${amount} PLN`
        });
        
    } catch (error) {
        console.error('❌ [PAYMENTS] Błąd zasilania salda:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// ELASTYCZNE WYLICZANIE PROWIZJI
// =====================================
async function calculateCommissionsForPayment(db, paymentId, caseId, clientId, amount) {
    console.log(`💰 [COMMISSIONS] Sprawdzanie prowizji dla płatności ${paymentId}...`);
    
    // SPRAWDŹ CZY PROWIZJA MA BYĆ NALICZANA
    const payment = await new Promise((resolve, reject) => {
        db.get('SELECT enable_commission, commission_rate_override, commission_recipient_override FROM payments WHERE id = ?', 
            [paymentId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
    
    // Jeśli prowizja wyłączona - KONIEC
    if (!payment || payment.enable_commission === 0) {
        console.log(`⏭️ [COMMISSIONS] Prowizja wyłączona dla płatności ${paymentId} - pomijam`);
        return [];
    }
    
    console.log(`✅ [COMMISSIONS] Prowizja włączona - wyliczam...`);
    
    const commissionsCreated = [];
    const recipientOverride = payment.commission_recipient_override;
    
    console.log(`👤 [COMMISSIONS] Odbiorca prowizji:`, recipientOverride || 'AUTO (wszyscy)');
    
    // 1. PROWIZJA DLA MECENASA (assigned_to w sprawie)
    if (caseId && (!recipientOverride || recipientOverride === 'lawyer_only')) {
        const caseData = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM cases WHERE id = ?', [caseId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (caseData && caseData.assigned_to) {
            // Użyj custom stawki jeśli podana, w przeciwnym razie domyślna
            let lawyerRate;
            if (payment.commission_rate_override) {
                lawyerRate = { commission_type: 'percentage', commission_value: payment.commission_rate_override };
                console.log(`📝 Custom stawka mecenasa: ${payment.commission_rate_override}%`);
            } else {
                lawyerRate = await getCommissionRate(db, caseData.assigned_to, 'lawyer', caseId);
            }
            
            const lawyerCommission = calculateCommission(amount, lawyerRate);
            
            await createCommission(db, {
                payment_id: paymentId,
                case_id: caseId,
                client_id: clientId,
                user_id: caseData.assigned_to,
                user_role: 'lawyer',
                payment_amount: amount,
                commission_rate: lawyerRate.commission_value,
                commission_amount: lawyerCommission,
                commission_type: lawyerRate.commission_type
            });
            
            commissionsCreated.push({ role: 'lawyer', user_id: caseData.assigned_to, amount: lawyerCommission });
            console.log(`✅ Prowizja mecenasa: ${lawyerCommission} PLN (${lawyerRate.commission_value}%)`);
        }
        
        // 2. PROWIZJA DLA OPIEKUNA SPRAWY (case_manager_id)
        if (caseData && caseData.case_manager_id && (!recipientOverride || recipientOverride === 'case_manager_only')) {
            // Użyj custom stawki jeśli podana
            let managerRate;
            if (payment.commission_rate_override) {
                managerRate = { commission_type: 'percentage', commission_value: payment.commission_rate_override };
                console.log(`📝 Custom stawka opiekuna sprawy: ${payment.commission_rate_override}%`);
            } else {
                managerRate = await getCommissionRate(db, caseData.case_manager_id, 'case_manager', caseId);
            }
            
            const managerCommission = calculateCommission(amount, managerRate);
            
            await createCommission(db, {
                payment_id: paymentId,
                case_id: caseId,
                client_id: clientId,
                user_id: caseData.case_manager_id,
                user_role: 'case_manager',
                payment_amount: amount,
                commission_rate: managerRate.commission_value,
                commission_amount: managerCommission,
                commission_type: managerRate.commission_type
            });
            
            commissionsCreated.push({ role: 'case_manager', user_id: caseData.case_manager_id, amount: managerCommission });
            console.log(`✅ Prowizja opiekuna sprawy: ${managerCommission} PLN (${managerRate.commission_value}%)`);
        }
    }
    
    // 3. PROWIZJA DLA OPIEKUNA KLIENTA (client_manager_id w client)
    if (clientId && (!recipientOverride || recipientOverride === 'client_manager_only')) {
        const client = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM clients WHERE id = ?', [clientId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (client && client.client_manager_id) {
            // Użyj custom stawki jeśli podana
            let clientManagerRate;
            if (payment.commission_rate_override) {
                clientManagerRate = { commission_type: 'percentage', commission_value: payment.commission_rate_override };
                console.log(`📝 Custom stawka opiekuna klienta: ${payment.commission_rate_override}%`);
            } else {
                clientManagerRate = await getCommissionRate(db, client.client_manager_id, 'client_manager');
            }
            
            const clientManagerCommission = calculateCommission(amount, clientManagerRate);
            
            await createCommission(db, {
                payment_id: paymentId,
                case_id: caseId,
                client_id: clientId,
                user_id: client.client_manager_id,
                user_role: 'client_manager',
                payment_amount: amount,
                commission_rate: clientManagerRate.commission_value,
                commission_amount: clientManagerCommission,
                commission_type: clientManagerRate.commission_type
            });
            
            commissionsCreated.push({ role: 'client_manager', user_id: client.client_manager_id, amount: clientManagerCommission });
            console.log(`✅ Prowizja opiekuna klienta: ${clientManagerCommission} PLN (${clientManagerRate.commission_value}%)`);
        }
    }
    
    console.log(`✅ [COMMISSIONS] Utworzono ${commissionsCreated.length} prowizji`);
    return commissionsCreated;
}

async function getCommissionRate(db, userId, role, caseId = null) {
    console.log(`📊 [getCommissionRate] Pobieranie stawki dla userId=${userId}, role=${role}, caseId=${caseId}`);
    
    // 1. PRIORYTET: Sprawdź employee_compensation (nowy system HR)
    const employeeRate = await new Promise((resolve, reject) => {
        db.get(`
            SELECT default_commission_rate, commission_enabled
            FROM employee_compensation 
            WHERE user_id = ? AND commission_enabled = 1
        `, [userId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
    
    if (employeeRate && employeeRate.default_commission_rate) {
        console.log(`✅ [getCommissionRate] Znaleziono stawkę w employee_compensation: ${employeeRate.default_commission_rate}%`);
        return { 
            commission_type: 'percentage', 
            commission_value: parseFloat(employeeRate.default_commission_rate)
        };
    }
    
    // 2. FALLBACK: Niestandardowa stawka dla sprawy (stary system)
    if (caseId) {
        const caseRate = await new Promise((resolve, reject) => {
            db.get(`
                SELECT * FROM commission_rates 
                WHERE applies_to = ? AND role = ? AND is_active = 1
                LIMIT 1
            `, [`case:${caseId}`, role], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (caseRate) {
            console.log(`⚙️ [getCommissionRate] Użyto niestandardowej stawki dla sprawy ${caseId}: ${caseRate.commission_value}%`);
            return caseRate;
        }
    }
    
    // 3. FALLBACK: Indywidualna stawka użytkownika (stary system)
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
    
    if (rate) {
        console.log(`⚙️ [getCommissionRate] Użyto indywidualnej stawki z commission_rates: ${rate.commission_value}%`);
        return rate;
    }
    
    // 4. FALLBACK: Domyślna stawka (stary system)
    rate = await new Promise((resolve, reject) => {
        db.get(`
            SELECT * FROM commission_rates 
            WHERE user_id = 0 AND role = ? AND is_active = 1 AND (applies_to = 'all' OR applies_to IS NULL)
            LIMIT 1
        `, [role], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
    
    if (rate) {
        console.log(`⚙️ [getCommissionRate] Użyto domyślnej stawki z commission_rates: ${rate.commission_value}%`);
        return rate;
    }
    
    // 5. OSTATECZNY FALLBACK: Domyślne stawki hardcoded
    const defaultRates = {
        'lawyer': 15.00,
        'case_manager': 10.00,
        'client_manager': 5.00
    };
    
    const defaultRate = defaultRates[role] || 10.00;
    console.log(`⚠️ [getCommissionRate] Brak stawki w bazie - używam domyślnej: ${defaultRate}%`);
    
    return { 
        commission_type: 'percentage', 
        commission_value: defaultRate 
    };
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
                payment_amount, commission_rate, commission_amount, commission_type,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
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
            else {
                console.log(`🟡 Prowizja utworzona jako PENDING (wymaga zatwierdzenia)`);
                resolve(this.lastID);
            }
        });
    });
}

// =====================================
// HELPER: Generowanie numeru dokumentu
// =====================================
async function generateReceiptNumber(db, receiptType) {
    const prefix = receiptType === 'invoice' ? 'FV' : 'PAR';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    // Pobierz ostatni numer w tym miesiącu
    const lastReceipt = await new Promise((resolve, reject) => {
        db.get(`
            SELECT receipt_number 
            FROM payment_receipts 
            WHERE receipt_type = ? 
              AND receipt_number LIKE ?
            ORDER BY id DESC 
            LIMIT 1
        `, [receiptType, `${prefix}/${year}/${month}/%`], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    let number = 1;
    if (lastReceipt) {
        const parts = lastReceipt.receipt_number.split('/');
        number = parseInt(parts[parts.length - 1]) + 1;
    }

    return `${prefix}/${year}/${month}/${String(number).padStart(3, '0')}`;
}

// =====================================
// WYSYŁANIE PRZYPOMNIENIA O PŁATNOŚCI
// =====================================
router.post('/:id/send-reminder', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        const userRole = req.user.user_role || req.user.role;
        
        // Sprawdź uprawnienia
        if (!['admin', 'finance', 'reception'].includes(userRole)) {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }
        
        console.log(`📧 [PAYMENTS] Wysyłanie przypomnienia dla płatności #${id}`);
        
        // Pobierz płatność z danymi klienta
        const payment = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    p.*,
                    c.first_name,
                    c.last_name,
                    c.email,
                    c.phone,
                    cs.case_number,
                    cs.title as case_title
                FROM payments p
                LEFT JOIN clients c ON p.client_id = c.id
                LEFT JOIN cases cs ON p.case_id = cs.id
                WHERE p.id = ?
            `, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!payment) {
            return res.status(404).json({ error: 'Płatność nie znaleziona' });
        }
        
        if (payment.status === 'completed') {
            return res.status(400).json({ error: 'Płatność już opłacona' });
        }
        
        // Sprawdź czy jest przeterminowana
        const dueDate = new Date(payment.due_date);
        const now = new Date();
        const isOverdue = payment.due_date && dueDate < now;
        
        if (!isOverdue) {
            return res.status(400).json({ error: 'Płatność nie jest jeszcze przeterminowana' });
        }
        
        const clientName = `${payment.first_name || ''} ${payment.last_name || ''}`.trim();
        const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
        
        let emailSent = false;
        let notificationSent = false;
        
        // Wyślij email jeśli klient ma adres email
        if (payment.email) {
            try {
                // TODO: Integracja z serwisem email (np. nodemailer, SendGrid)
                const emailContent = `
                    <h2>Przypomnienie o płatności</h2>
                    <p>Szanowny/a ${clientName},</p>
                    <p>Uprzejmie przypominamy o zaległej płatności:</p>
                    <ul>
                        <li><strong>Kod płatności:</strong> ${payment.payment_code}</li>
                        <li><strong>Sprawa:</strong> ${payment.case_number} - ${payment.case_title || ''}</li>
                        <li><strong>Kwota:</strong> ${parseFloat(payment.amount).toFixed(2)} ${payment.currency}</li>
                        <li><strong>Termin płatności:</strong> ${dueDate.toLocaleDateString('pl-PL')}</li>
                        <li><strong>Dni opóźnienia:</strong> ${daysOverdue}</li>
                    </ul>
                    <p>Prosimy o jak najszybsze uregulowanie należności.</p>
                    <p>W razie pytań prosimy o kontakt.</p>
                    <p>Z poważaniem,<br>ProMeritum Kancelaria</p>
                `;
                
                console.log(`📧 Email dla ${payment.email}:`, emailContent);
                // await sendEmail(payment.email, 'Przypomnienie o płatności', emailContent);
                emailSent = true;
            } catch (emailError) {
                console.error('❌ Błąd wysyłania email:', emailError);
            }
        }
        
        // Utwórz powiadomienie w aplikacji
        try {
            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO notifications (
                        user_id, type, title, message, link, created_at
                    ) VALUES (?, 'payment_reminder', ?, ?, ?, CURRENT_TIMESTAMP)
                `, [
                    payment.client_id,
                    '⚠️ Przypomnienie o płatności',
                    `Zaległa płatność ${payment.payment_code} - ${parseFloat(payment.amount).toFixed(2)} PLN. Opóźnienie: ${daysOverdue} dni.`,
                    `/payments/${payment.id}`
                ], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            notificationSent = true;
        } catch (notifError) {
            console.error('❌ Błąd tworzenia powiadomienia:', notifError);
        }
        
        // Zapisz w historii
        const userId = req.user.userId || req.user.id;
        await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO payment_history (payment_id, old_status, new_status, note, changed_by)
                VALUES (?, ?, ?, ?, ?)
            `, [
                id,
                payment.status,
                payment.status,
                `Wysłano przypomnienie o płatności (${daysOverdue} dni opóźnienia). Email: ${emailSent ? 'TAK' : 'NIE'}, Powiadomienie: ${notificationSent ? 'TAK' : 'NIE'}`,
                userId
            ], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        console.log(`✅ [PAYMENTS] Przypomnienie wysłane dla płatności #${id}`);
        
        res.json({
            success: true,
            message: 'Przypomnienie wysłane',
            email_sent: emailSent,
            notification_sent: notificationSent,
            client_email: payment.email,
            days_overdue: daysOverdue
        });
        
    } catch (error) {
        console.error('❌ Błąd wysyłania przypomnienia:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
