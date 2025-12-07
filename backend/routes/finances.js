const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

console.log('💰 [FINANCES] Moduł finances.js załadowany!');

// =====================================
// DASHBOARD FINANSOWY - PODSUMOWANIE
// =====================================
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        console.log('📊 [FINANCES] Pobieranie dashboardu finansowego');
        const db = getDatabase();
        
        // Przychody (płatności completed)
        const revenue = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as count,
                    SUM(amount) as total,
                    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as paid,
                    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending
                FROM payments
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        // Wydatki firmy
        const expenses = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as count,
                    SUM(amount) as total,
                    SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as paid,
                    SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END) as pending
                FROM company_expenses
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        // Pensje pracowników (obecny miesiąc)
        const salaries = await new Promise((resolve, reject) => {
            const now = new Date();
            db.get(`
                SELECT 
                    COUNT(*) as count,
                    SUM(net_salary) as total,
                    SUM(CASE WHEN payment_status = 'paid' THEN net_salary ELSE 0 END) as paid,
                    SUM(CASE WHEN payment_status = 'pending' THEN net_salary ELSE 0 END) as pending
                FROM employee_salaries
                WHERE month = ? AND year = ?
            `, [now.getMonth() + 1, now.getFullYear()], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        // Faktury kosztowe
        const invoices = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as count,
                    SUM(total_amount) as total,
                    SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as paid,
                    SUM(CASE WHEN payment_status = 'unpaid' THEN total_amount ELSE 0 END) as unpaid
                FROM company_invoices
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        // Salda klientów
        const clientBalances = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as count,
                    SUM(balance) as total
                FROM client_balance
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        // Oblicz bilans
        const totalRevenue = parseFloat(revenue.paid || 0);
        const totalExpenses = parseFloat(expenses.paid || 0) + 
                            parseFloat(salaries.paid || 0) + 
                            parseFloat(invoices.paid || 0);
        const balance = totalRevenue - totalExpenses;
        
        console.log(`✅ [FINANCES] Przychody: ${totalRevenue} PLN, Wydatki: ${totalExpenses} PLN, Bilans: ${balance} PLN`);
        
        res.json({
            revenue: {
                count: revenue.count || 0,
                total: parseFloat(revenue.total || 0),
                paid: parseFloat(revenue.paid || 0),
                pending: parseFloat(revenue.pending || 0)
            },
            expenses: {
                count: expenses.count || 0,
                total: parseFloat(expenses.total || 0),
                paid: parseFloat(expenses.paid || 0),
                pending: parseFloat(expenses.pending || 0)
            },
            salaries: {
                count: salaries.count || 0,
                total: parseFloat(salaries.total || 0),
                paid: parseFloat(salaries.paid || 0),
                pending: parseFloat(salaries.pending || 0)
            },
            invoices: {
                count: invoices.count || 0,
                total: parseFloat(invoices.total || 0),
                paid: parseFloat(invoices.paid || 0),
                unpaid: parseFloat(invoices.unpaid || 0)
            },
            clientBalances: {
                count: clientBalances.count || 0,
                total: parseFloat(clientBalances.total || 0)
            },
            summary: {
                totalRevenue,
                totalExpenses,
                balance,
                profit: balance > 0
            }
        });
        
    } catch (error) {
        console.error('❌ [FINANCES] Błąd pobierania dashboardu:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// WYDATKI FIRMY - DODAJ
// =====================================
router.post('/expenses', authenticateToken, async (req, res) => {
    try {
        const {
            category,
            subcategory,
            amount,
            description,
            vendor,
            invoice_number,
            invoice_date,
            payment_method
        } = req.body;
        
        console.log(`💸 [FINANCES] Dodawanie wydatku: ${category} - ${amount} PLN`);
        
        const db = getDatabase();
        
        // Generuj kod wydatku
        const count = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM company_expenses', (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });
        
        const expense_code = `EXP/${new Date().getFullYear()}/${String(count + 1).padStart(4, '0')}`;
        
        const result = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO company_expenses (
                    expense_code, category, subcategory, amount, description,
                    vendor, invoice_number, invoice_date, payment_method,
                    created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                expense_code,
                category,
                subcategory || null,
                amount,
                description,
                vendor || null,
                invoice_number || null,
                invoice_date || null,
                payment_method || null,
                req.user.id
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
        
        console.log(`✅ [FINANCES] Wydatek dodany: ${expense_code}`);
        
        res.json({
            success: true,
            expenseId: result.id,
            expense_code
        });
        
    } catch (error) {
        console.error('❌ [FINANCES] Błąd dodawania wydatku:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// WYDATKI FIRMY - LISTA
// =====================================
router.get('/expenses', authenticateToken, async (req, res) => {
    try {
        const { category, status, limit = 50 } = req.query;
        
        console.log('📋 [FINANCES] Pobieranie listy wydatków');
        const db = getDatabase();
        
        let query = `
            SELECT 
                e.*,
                u.name as created_by_name
            FROM company_expenses e
            LEFT JOIN users u ON e.created_by = u.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (category) {
            query += ` AND e.category = ?`;
            params.push(category);
        }
        
        if (status) {
            query += ` AND e.payment_status = ?`;
            params.push(status);
        }
        
        query += ` ORDER BY e.created_at DESC LIMIT ?`;
        params.push(parseInt(limit));
        
        const expenses = await new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        console.log(`✅ [FINANCES] Znaleziono ${expenses.length} wydatków`);
        
        res.json({ expenses });
        
    } catch (error) {
        console.error('❌ [FINANCES] Błąd pobierania wydatków:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// PENSJE - DODAJ
// =====================================
router.post('/salaries', authenticateToken, async (req, res) => {
    try {
        const { employee_id, employee_name, month, year, gross_amount, net_amount, notes } = req.body;
        
        if (!employee_name || !month || !year || !gross_amount || !net_amount) {
            return res.status(400).json({ error: 'Brak wymaganych pól' });
        }
        
        console.log('💰 [FINANCES] Dodawanie pensji:', { employee_id, employee_name, month, year });
        const db = getDatabase();
        
        // Użyj employee_id z frontendu jeśli dostępny, w przeciwnym razie szukaj po nazwie
        let finalEmployeeId = employee_id ? parseInt(employee_id) : null;
        
        if (!finalEmployeeId && employee_name) {
            // Fallback: Znajdź ID pracownika po nazwie
            const user = await new Promise((resolve, reject) => {
                db.get('SELECT id FROM users WHERE name = ?', [employee_name], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            finalEmployeeId = user ? user.id : null;
        }
        
        const result = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO employee_salaries (
                    employee_id, employee_name, month, year,
                    gross_amount, net_amount, payment_status,
                    payment_date, notes, created_by, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, 'paid', datetime('now'), ?, ?, datetime('now'))
            `, [
                finalEmployeeId,
                employee_name,
                month,
                year,
                gross_amount,
                net_amount,
                notes || null,
                req.user.userId
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
        
        console.log(`✅ [FINANCES] Pensja dodana! ID: ${result.id}`);
        
        res.json({
            success: true,
            salaryId: result.id
        });
        
    } catch (error) {
        console.error('❌ [FINANCES] Błąd dodawania pensji:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// PENSJE - LISTA
// =====================================
router.get('/salaries', authenticateToken, async (req, res) => {
    try {
        const { year, month } = req.query;
        
        console.log('💼 [FINANCES] Pobieranie listy pensji');
        const db = getDatabase();
        
        let query = `
            SELECT 
                s.*,
                u.name as employee_name,
                u.email as employee_email
            FROM employee_salaries s
            LEFT JOIN users u ON s.employee_id = u.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (year) {
            query += ` AND s.year = ?`;
            params.push(parseInt(year));
        }
        
        if (month) {
            query += ` AND s.month = ?`;
            params.push(parseInt(month));
        }
        
        query += ` ORDER BY s.year DESC, s.month DESC, u.name ASC`;
        
        const salaries = await new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        console.log(`✅ [FINANCES] Znaleziono ${salaries.length} pensji`);
        
        res.json({ salaries });
        
    } catch (error) {
        console.error('❌ [FINANCES] Błąd pobierania pensji:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// FAKTURY - UPLOAD PLIKU
// =====================================
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Konfiguracja multer dla faktur
const invoiceStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/invoices');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error, null);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'invoice-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const invoiceUpload = multer({ 
    storage: invoiceStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Błąd: Tylko JPG, PNG i PDF!');
        }
    }
});

router.post('/invoices/upload', authenticateToken, invoiceUpload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Brak pliku' });
        }
        
        console.log('📤 [FINANCES] Upload faktury:', req.file.filename);
        
        // Ścieżka relatywna do folderu uploads
        const file_path = 'invoices/' + req.file.filename;
        
        // Tutaj możesz dodać OCR (Tesseract.js) w przyszłości
        // const ocrData = await extractTextFromInvoice(req.file.path);
        
        res.json({
            success: true,
            file_path,
            filename: req.file.filename,
            // ocr_data: ocrData // Gdy dodasz OCR
        });
        
    } catch (error) {
        console.error('❌ [FINANCES] Błąd uploadu faktury:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// FAKTURY - DODAJ
// =====================================
router.post('/invoices', authenticateToken, async (req, res) => {
    try {
        const { invoice_number, vendor, amount, due_date, issue_date, description, file_path } = req.body;
        
        if (!invoice_number || !vendor || !amount || !due_date) {
            return res.status(400).json({ error: 'Brak wymaganych pól' });
        }
        
        console.log('📄 [FINANCES] Dodawanie faktury:', invoice_number);
        const db = getDatabase();
        
        const result = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO company_invoices (
                    invoice_number, vendor, amount, due_date, issue_date,
                    description, file_path, payment_status,
                    created_by, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'unpaid', ?, datetime('now'))
            `, [
                invoice_number,
                vendor,
                amount,
                due_date,
                issue_date || null,
                description || null,
                file_path || null,
                req.user.userId
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
        
        console.log(`✅ [FINANCES] Faktura dodana! ID: ${result.id}`);
        
        res.json({
            success: true,
            invoiceId: result.id
        });
        
    } catch (error) {
        console.error('❌ [FINANCES] Błąd dodawania faktury:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================
// FAKTURY - LISTA
// =====================================
router.get('/invoices', authenticateToken, async (req, res) => {
    try {
        const { status, limit = 50 } = req.query;
        
        console.log('📄 [FINANCES] Pobieranie listy faktur');
        const db = getDatabase();
        
        let query = `
            SELECT 
                i.*,
                u.name as created_by_name
            FROM company_invoices i
            LEFT JOIN users u ON i.created_by = u.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (status) {
            query += ` AND i.payment_status = ?`;
            params.push(status);
        }
        
        query += ` ORDER BY i.due_date ASC, i.created_at DESC LIMIT ?`;
        params.push(parseInt(limit));
        
        const invoices = await new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        console.log(`✅ [FINANCES] Znaleziono ${invoices.length} faktur`);
        
        res.json({ invoices });
        
    } catch (error) {
        console.error('❌ [FINANCES] Błąd pobierania faktur:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
