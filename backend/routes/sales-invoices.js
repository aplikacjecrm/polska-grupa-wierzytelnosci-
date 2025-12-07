// ==========================================
// SALES INVOICES API ROUTES
// System wystawiania faktur VAT dla klientów
// ==========================================

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

// MIDDLEWARE LOGOWANIA - KAŻDY REQUEST
router.use((req, res, next) => {
    console.log('🔥🔥🔥 SALES-INVOICES ROUTER - REQUEST OTRZYMANY! 🔥🔥🔥');
    console.log(`  📍 Metoda: ${req.method}`);
    console.log(`  📍 Path: ${req.path}`);
    console.log(`  📍 Body:`, req.body);
    console.log(`  📍 Headers Auth:`, req.headers.authorization ? 'YES ✅' : 'NO ❌');
    next();
});

console.log('📄 Sales Invoices Routes załadowane');

// =====================================
// GENERATE INVOICE NUMBER
// =====================================

async function generateInvoiceNumber() {
    const db = getDatabase();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT invoice_number FROM sales_invoices 
            WHERE invoice_number LIKE 'FV/${year}/${month}/%'
            ORDER BY invoice_number DESC LIMIT 1
        `, (err, row) => {
            if (err) return reject(err);
            
            let nextNum = 1;
            if (row) {
                const parts = row.invoice_number.split('/');
                nextNum = parseInt(parts[3]) + 1;
            }
            
            const invoiceNumber = `FV/${year}/${month}/${String(nextNum).padStart(3, '0')}`;
            resolve(invoiceNumber);
        });
    });
}

// =====================================
// CREATE INVOICE
// =====================================

router.post('/', authenticateToken, async (req, res) => {
    console.log('📨 POST /api/sales-invoices');
    
    try {
        const {
            client_id,
            case_id,
            buyer_name,
            buyer_nip,
            buyer_address,
            buyer_email,
            net_amount,
            vat_rate,
            items,
            issue_date,
            sale_date,
            due_date,
            notes,
            send_to_ksef,
            installment_payment,
            installment_count,
            first_installment_date
        } = req.body;
        
        if (!client_id || !buyer_name || !net_amount || !vat_rate || !items || !issue_date) {
            return res.status(400).json({ 
                success: false,
                error: 'Brak wymaganych pól' 
            });
        }
        
        const db = getDatabase();
        
        // Generuj numer faktury
        const invoice_number = await generateInvoiceNumber();
        
        // Oblicz VAT i brutto
        const vat_amount = (net_amount * vat_rate / 100).toFixed(2);
        const gross_amount = (parseFloat(net_amount) + parseFloat(vat_amount)).toFixed(2);
        
        console.log('💰 Faktura:', invoice_number, 'Klient:', client_id, 'Kwota:', gross_amount);
        
        // Zapisz fakturę
        const result = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO sales_invoices (
                    invoice_number, client_id, case_id,
                    buyer_name, buyer_nip, buyer_address, buyer_email,
                    net_amount, vat_rate, vat_amount, gross_amount,
                    items, issue_date, sale_date, due_date,
                    notes, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                invoice_number, client_id, case_id || null,
                buyer_name, buyer_nip || null, buyer_address || null, buyer_email || null,
                net_amount, vat_rate, vat_amount, gross_amount,
                JSON.stringify(items), issue_date, sale_date || issue_date, due_date || null,
                notes || null, req.user.userId
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
        
        console.log(`✅ Faktura ${invoice_number} wystawiona! ID: ${result.id}`);
        
        // =====================================
        // AUTOMATYCZNE TWORZENIE PŁATNOŚCI
        // =====================================
        
        // Generuj kod płatności
        const caseData = case_id ? await new Promise((resolve, reject) => {
            db.get('SELECT case_number FROM cases WHERE id = ?', [case_id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        }) : null;
        
        let payment_code = `PAY/INV/${String(result.id).padStart(4, '0')}`;
        if (caseData && caseData.case_number) {
            const parts = caseData.case_number.split('/');
            payment_code = `PAY/${parts[0] || 'INV'}/${parts[1] || 'XX'}/${parts[2] || '000'}/${String(result.id).padStart(3, '0')}`;
        }
        
        // Utwórz płatność powiązaną z fakturą
        const paymentResult = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO payments (
                    payment_code, case_id, client_id, lawyer_id,
                    amount, currency, description, payment_type,
                    payment_method, status, due_date, created_by,
                    invoice_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'invoice', 'pending', 'pending', ?, ?, ?)
            `, [
                payment_code, case_id || null, client_id, req.user.userId,
                gross_amount, 'PLN', `Płatność za fakturę ${invoice_number}`,
                due_date || null, req.user.userId, result.id
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
        
        console.log(`💳 Płatność ${payment_code} utworzona automatycznie! ID: ${paymentResult.id}`);
        
        // =====================================
        // PŁATNOŚĆ RATALNA (jeśli wybrana)
        // =====================================
        
        if (installment_payment && installment_count && installment_count > 1) {
            const installmentAmount = (parseFloat(gross_amount) / installment_count).toFixed(2);
            const startDate = first_installment_date ? new Date(first_installment_date) : new Date(due_date || issue_date);
            
            for (let i = 1; i <= installment_count; i++) {
                const installmentDueDate = new Date(startDate);
                installmentDueDate.setMonth(installmentDueDate.getMonth() + (i - 1));
                
                await new Promise((resolve, reject) => {
                    db.run(`
                        INSERT INTO installment_payments (
                            payment_id, invoice_id, installment_number, total_installments,
                            amount, due_date, status
                        ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
                    `, [
                        paymentResult.id, result.id, i, installment_count,
                        installmentAmount, installmentDueDate.toISOString().split('T')[0]
                    ], function(err) {
                        if (err) reject(err);
                        else resolve({ id: this.lastID });
                    });
                });
            }
            
            console.log(`📅 Utworzono ${installment_count} rat po ${installmentAmount} PLN`);
        }
        
        console.log('🔍 DEBUG - Zmienne przed utworzeniem response:');
        console.log('  - invoice_number:', invoice_number);
        console.log('  - payment_code:', payment_code);
        console.log('  - gross_amount:', gross_amount);
        console.log('  - installment_payment:', installment_payment);
        console.log('  - installment_count:', installment_count);
        
        const response = {
            success: true,
            invoiceId: result.id,
            paymentId: paymentResult.id,
            invoice_number: invoice_number,
            payment_code: payment_code,
            gross_amount: gross_amount,
            installments: installment_payment ? installment_count : 0
        };
        
        console.log('📤 Zwracam response do frontendu:', JSON.stringify(response, null, 2));
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ Błąd wystawiania faktury:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// =====================================
// GET INVOICES - LIST
// =====================================

router.get('/', authenticateToken, async (req, res) => {
    console.log('📨 GET /api/sales-invoices');
    
    try {
        const { client_id, status, limit = 50 } = req.query;
        const db = getDatabase();
        
        let query = `
            SELECT 
                si.*,
                c.first_name || ' ' || c.last_name as client_name,
                u.name as created_by_name,
                cs.case_number
            FROM sales_invoices si
            LEFT JOIN clients c ON si.client_id = c.id
            LEFT JOIN users u ON si.created_by = u.id
            LEFT JOIN cases cs ON si.case_id = cs.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (client_id) {
            query += ` AND si.client_id = ?`;
            params.push(client_id);
        }
        
        if (status) {
            query += ` AND si.payment_status = ?`;
            params.push(status);
        }
        
        query += ` ORDER BY si.created_at DESC LIMIT ?`;
        params.push(parseInt(limit));
        
        const invoices = await new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        // Parse items JSON
        invoices.forEach(inv => {
            if (inv.items) {
                try {
                    inv.items = JSON.parse(inv.items);
                } catch (e) {}
            }
        });
        
        console.log(`✅ Znaleziono ${invoices.length} faktur sprzedażowych`);
        
        res.json({ 
            success: true,
            invoices 
        });
        
    } catch (error) {
        console.error('❌ Błąd pobierania faktur:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// =====================================
// GET SINGLE INVOICE
// =====================================

router.get('/:id', authenticateToken, async (req, res) => {
    console.log('📨 GET /api/sales-invoices/:id');
    
    try {
        const { id } = req.params;
        const db = getDatabase();
        
        const invoice = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    si.*,
                    c.first_name || ' ' || c.last_name as client_name,
                    c.email as client_email,
                    u.name as created_by_name,
                    cs.case_number,
                    cs.title as case_title
                FROM sales_invoices si
                LEFT JOIN clients c ON si.client_id = c.id
                LEFT JOIN users u ON si.created_by = u.id
                LEFT JOIN cases cs ON si.case_id = cs.id
                WHERE si.id = ?
            `, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!invoice) {
            return res.status(404).json({ 
                success: false,
                error: 'Faktura nie znaleziona' 
            });
        }
        
        // Parse items
        if (invoice.items) {
            try {
                invoice.items = JSON.parse(invoice.items);
            } catch (e) {}
        }
        
        res.json({ 
            success: true,
            invoice 
        });
        
    } catch (error) {
        console.error('❌ Błąd pobierania faktury:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// =====================================
// UPDATE PAYMENT STATUS
// =====================================

router.patch('/:id/payment', authenticateToken, async (req, res) => {
    console.log('📨 PATCH /api/sales-invoices/:id/payment');
    
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['paid', 'unpaid', 'overdue'].includes(status)) {
            return res.status(400).json({ 
                success: false,
                error: 'Nieprawidłowy status' 
            });
        }
        
        const db = getDatabase();
        
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE sales_invoices 
                SET payment_status = ?,
                    paid_at = CASE WHEN ? = 'paid' THEN datetime('now') ELSE NULL END,
                    updated_at = datetime('now')
                WHERE id = ?
            `, [status, status, id], function(err) {
                if (err) reject(err);
                else resolve();
            });
        });
        
        console.log(`✅ Status faktury #${id} zmieniony na: ${status}`);
        
        res.json({ 
            success: true,
            message: 'Status płatności zaktualizowany' 
        });
        
    } catch (error) {
        console.error('❌ Błąd aktualizacji statusu:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// =====================================
// SEND TO KSEF
// =====================================

router.post('/:id/send-ksef', authenticateToken, async (req, res) => {
    console.log('📨 POST /api/sales-invoices/:id/send-ksef');
    
    try {
        const { id } = req.params;
        const db = getDatabase();
        
        // Pobierz fakturę
        const invoice = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM sales_invoices WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!invoice) {
            return res.status(404).json({ 
                success: false,
                error: 'Faktura nie znaleziona' 
            });
        }
        
        // TODO: Integracja z KSeF API
        // const ksefResult = await ksef.sendInvoice(invoiceData, nip, token);
        
        // Na razie placeholder
        const ksef_reference = `${invoice.buyer_nip || '0000000000'}-${Date.now()}-TEST-01`;
        
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE sales_invoices 
                SET ksef_reference_number = ?,
                    ksef_status = 'sent',
                    ksef_sent_at = datetime('now'),
                    updated_at = datetime('now')
                WHERE id = ?
            `, [ksef_reference, id], function(err) {
                if (err) reject(err);
                else resolve();
            });
        });
        
        console.log(`✅ Faktura #${id} wysłana do KSeF: ${ksef_reference}`);
        
        res.json({ 
            success: true,
            ksef_reference_number: ksef_reference,
            message: 'Faktura wysłana do KSeF' 
        });
        
    } catch (error) {
        console.error('❌ Błąd wysyłania do KSeF:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

module.exports = router;

console.log('✅ Sales Invoices Routes gotowe!');
