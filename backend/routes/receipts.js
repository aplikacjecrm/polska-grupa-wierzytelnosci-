/**
 * API FAKTUR I PARAGONÓW
 * 
 * Automatyczne generowanie dokumentów po opłaceniu płatności
 * 
 * Endpointy:
 * - POST /api/receipts/generate - Generuj fakturę/paragon
 * - GET /api/receipts - Lista wszystkich dokumentów
 * - GET /api/receipts/:id - Szczegóły dokumentu
 * - GET /api/receipts/payment/:paymentId - Dokumenty dla płatności
 * - GET /api/receipts/client/:clientId - Dokumenty klienta
 * - POST /api/receipts/:id/send - Wyślij dokument do klienta
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

console.log('📄 [RECEIPTS] Moduł receipts.js załadowany!');

// =====================================
// GENEROWANIE FAKTURY/PARAGONU
// =====================================

/**
 * POST /api/receipts/generate
 * Automatyczne generowanie faktury lub paragonu
 */
router.post('/generate', authenticateToken, async (req, res) => {
    const {
        payment_id,
        receipt_type, // 'invoice' lub 'receipt'
        include_tax = true
    } = req.body;

    console.log(`📄 Generowanie dokumentu dla płatności ${payment_id}, typ: ${receipt_type}`);

    try {
        const db = getDatabase();

        // Pobierz dane płatności
        const payment = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    p.*,
                    c.first_name || ' ' || c.last_name as client_name,
                    c.email as client_email,
                    c.company_name,
                    c.nip,
                    cs.case_number,
                    cs.title as case_title
                FROM payments p
                LEFT JOIN clients c ON p.client_id = c.id
                LEFT JOIN cases cs ON p.case_id = cs.id
                WHERE p.id = ?
            `, [payment_id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!payment) {
            return res.status(404).json({ success: false, error: 'Płatność nie znaleziona' });
        }

        // Generuj numer dokumentu
        const receiptNumber = await generateReceiptNumber(db, receipt_type);

        // Oblicz VAT
        const grossAmount = parseFloat(payment.amount);
        let netAmount, taxAmount, taxRate;

        if (include_tax && receipt_type === 'invoice') {
            taxRate = 23; // 23% VAT
            netAmount = grossAmount / 1.23;
            taxAmount = grossAmount - netAmount;
        } else {
            taxRate = 0;
            netAmount = grossAmount;
            taxAmount = 0;
        }

        // Opis dokumentu
        const description = `Usługi prawne - sprawa ${payment.case_number || 'brak numeru'}${payment.case_title ? ': ' + payment.case_title : ''}`;

        // Zapisz dokument
        const result = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO payment_receipts (
                    payment_id, receipt_type, receipt_number, issue_date,
                    client_id, case_id, amount, currency,
                    tax_rate, net_amount, tax_amount, gross_amount,
                    description, payment_method, created_by
                ) VALUES (?, ?, ?, date('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                payment_id,
                receipt_type,
                receiptNumber,
                payment.client_id,
                payment.case_id,
                grossAmount,
                payment.currency || 'PLN',
                taxRate,
                netAmount.toFixed(2),
                taxAmount.toFixed(2),
                grossAmount,
                description,
                payment.payment_method,
                req.user.userId
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, receiptNumber });
            });
        });

        console.log(`✅ Dokument wygenerowany: ${receiptNumber} (ID: ${result.id})`);

        res.json({
            success: true,
            message: 'Dokument wygenerowany pomyślnie',
            receipt: {
                id: result.id,
                receipt_number: receiptNumber,
                receipt_type,
                amount: grossAmount,
                pdf_url: `/receipts/${receiptNumber.replace(/\//g, '-')}.pdf`
            }
        });

    } catch (error) {
        console.error('❌ Błąd generowania dokumentu:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================
// LISTA DOKUMENTÓW
// =====================================

/**
 * GET /api/receipts
 * Pobiera listę wszystkich dokumentów z filtrami
 */
router.get('/', authenticateToken, async (req, res) => {
    const {
        receipt_type,
        client_id,
        date_from,
        date_to,
        limit = 50,
        offset = 0
    } = req.query;

    try {
        const db = getDatabase();

        let sql = `
            SELECT 
                pr.*,
                c.first_name || ' ' || c.last_name as client_name,
                c.company_name,
                cs.case_number,
                p.payment_code
            FROM payment_receipts pr
            LEFT JOIN clients c ON pr.client_id = c.id
            LEFT JOIN cases cs ON pr.case_id = cs.id
            LEFT JOIN payments p ON pr.payment_id = p.id
            WHERE 1=1
        `;

        const params = [];

        if (receipt_type) {
            sql += ` AND pr.receipt_type = ?`;
            params.push(receipt_type);
        }

        if (client_id) {
            sql += ` AND pr.client_id = ?`;
            params.push(client_id);
        }

        if (date_from) {
            sql += ` AND pr.issue_date >= ?`;
            params.push(date_from);
        }

        if (date_to) {
            sql += ` AND pr.issue_date <= ?`;
            params.push(date_to);
        }

        sql += ` ORDER BY pr.issue_date DESC, pr.id DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const receipts = await new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        console.log(`✅ Pobrano ${receipts.length} dokumentów`);

        res.json({
            success: true,
            receipts,
            count: receipts.length
        });

    } catch (error) {
        console.error('❌ Błąd pobierania dokumentów:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================
// DOKUMENTY DLA PŁATNOŚCI
// =====================================

/**
 * GET /api/receipts/payment/:paymentId
 * Pobiera dokumenty dla konkretnej płatności
 */
router.get('/payment/:paymentId', authenticateToken, async (req, res) => {
    const { paymentId } = req.params;

    try {
        const db = getDatabase();

        const receipts = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    pr.*,
                    c.first_name || ' ' || c.last_name as client_name
                FROM payment_receipts pr
                LEFT JOIN clients c ON pr.client_id = c.id
                WHERE pr.payment_id = ?
                ORDER BY pr.created_at DESC
            `, [paymentId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        res.json({
            success: true,
            receipts
        });

    } catch (error) {
        console.error('❌ Błąd pobierania dokumentów płatności:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================
// DOKUMENTY KLIENTA
// =====================================

/**
 * GET /api/receipts/client/:clientId
 * Pobiera wszystkie dokumenty klienta (dla portalu klienta)
 */
router.get('/client/:clientId', authenticateToken, async (req, res) => {
    const { clientId } = req.params;

    try {
        const db = getDatabase();

        const receipts = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    pr.*,
                    p.payment_code,
                    cs.case_number
                FROM payment_receipts pr
                LEFT JOIN payments p ON pr.payment_id = p.id
                LEFT JOIN cases cs ON pr.case_id = cs.id
                WHERE pr.client_id = ?
                ORDER BY pr.issue_date DESC
            `, [clientId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        console.log(`✅ Pobrano ${receipts.length} dokumentów dla klienta ${clientId}`);

        res.json({
            success: true,
            receipts
        });

    } catch (error) {
        console.error('❌ Błąd pobierania dokumentów klienta:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

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

module.exports = router;
