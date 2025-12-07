// ==========================================
// CLIENT BALANCE API ROUTES
// System salda i zasilania konta klienta
// ==========================================

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

console.log('💰 Balance Routes załadowane');

// =====================================
// GET CLIENT BALANCE
// =====================================

router.get('/client/:clientId', authenticateToken, async (req, res) => {
    console.log('📨 GET /api/balance/client/:clientId');
    
    try {
        const { clientId } = req.params;
        const db = getDatabase();
        
        // Pobierz saldo klienta
        let balance = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM client_balance WHERE client_id = ?', [clientId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        // Jeśli nie istnieje, utwórz
        if (!balance) {
            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO client_balance (client_id, balance, currency)
                    VALUES (?, 0, 'PLN')
                `, [clientId], function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                });
            });
            
            balance = { client_id: clientId, balance: 0, currency: 'PLN' };
        }
        
        // Pobierz płatności po sprawach
        const paymentsByCases = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    c.case_number,
                    c.title as case_title,
                    COUNT(p.id) as payment_count,
                    SUM(p.amount) as total
                FROM payments p
                LEFT JOIN cases c ON p.case_id = c.id
                WHERE p.client_id = ?
                GROUP BY p.case_id
            `, [clientId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Pobierz wszystkie płatności
        const payments = await new Promise((resolve, reject) => {
            db.all(`
                SELECT p.*, c.case_number, c.title as case_title
                FROM payments p
                LEFT JOIN cases c ON p.case_id = c.id
                WHERE p.client_id = ?
                ORDER BY p.created_at DESC
                LIMIT 50
            `, [clientId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Pobierz transakcje salda
        const transactions = await new Promise((resolve, reject) => {
            db.all(`
                SELECT * FROM balance_transactions
                WHERE client_id = ?
                ORDER BY created_at DESC
                LIMIT 50
            `, [clientId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        res.json({
            success: true,
            balance,
            paymentsByCases,
            payments,
            transactions
        });
        
    } catch (error) {
        console.error('❌ Błąd pobierania salda:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// =====================================
// TOP UP BALANCE - ZASILENIE SALDA
// =====================================

router.post('/top-up', authenticateToken, async (req, res) => {
    console.log('📨 POST /api/balance/top-up');
    
    try {
        const {
            client_id,
            amount,
            payment_method, // 'blik', 'paypal', 'card', 'bank_transfer', 'crypto'
            blik_code,
            crypto_currency,
            crypto_wallet_address,
            description
        } = req.body;
        
        if (!client_id || !amount || amount <= 0) {
            return res.status(400).json({ 
                success: false,
                error: 'Nieprawidłowe dane' 
            });
        }
        
        const db = getDatabase();
        
        // Pobierz aktualne saldo
        let balanceData = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM client_balance WHERE client_id = ?', [client_id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        // Jeśli nie istnieje, utwórz
        if (!balanceData) {
            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO client_balance (client_id, balance, currency)
                    VALUES (?, 0, 'PLN')
                `, [client_id], function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                });
            });
            balanceData = { balance: 0 };
        }
        
        const balance_before = parseFloat(balanceData.balance);
        const balance_after = balance_before + parseFloat(amount);
        
        // Aktualizuj saldo
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE client_balance
                SET balance = ?, last_transaction_at = CURRENT_TIMESTAMP
                WHERE client_id = ?
            `, [balance_after, client_id], function(err) {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Utwórz transakcję
        const transactionResult = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO balance_transactions (
                    client_id, amount, transaction_type, description,
                    balance_before, balance_after, created_by
                ) VALUES (?, ?, 'top_up', ?, ?, ?, ?)
            `, [
                client_id, amount, description || `Zasilenie salda przez ${payment_method}`,
                balance_before, balance_after, req.user.userId
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
        
        console.log(`✅ Saldo zasilone! Klient ${client_id}: ${balance_before} → ${balance_after} PLN`);
        
        res.json({
            success: true,
            transactionId: transactionResult.id,
            balance_before,
            balance_after,
            amount: parseFloat(amount)
        });
        
    } catch (error) {
        console.error('❌ Błąd zasilania salda:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// =====================================
// PAY FROM BALANCE - PŁATNOŚĆ Z SALDA
// =====================================

router.post('/pay-from-balance', authenticateToken, async (req, res) => {
    console.log('📨 POST /api/balance/pay-from-balance');
    
    try {
        const {
            client_id,
            payment_id,
            amount
        } = req.body;
        
        if (!client_id || !payment_id || !amount || amount <= 0) {
            return res.status(400).json({ 
                success: false,
                error: 'Nieprawidłowe dane' 
            });
        }
        
        const db = getDatabase();
        
        // Pobierz aktualne saldo
        const balanceData = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM client_balance WHERE client_id = ?', [client_id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!balanceData) {
            return res.status(400).json({ 
                success: false,
                error: 'Brak salda klienta' 
            });
        }
        
        const balance_before = parseFloat(balanceData.balance);
        
        if (balance_before < amount) {
            return res.status(400).json({ 
                success: false,
                error: 'Niewystarczające saldo',
                balance: balance_before,
                required: amount
            });
        }
        
        const balance_after = balance_before - parseFloat(amount);
        
        // Pobierz dane płatności
        const paymentData = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM payments WHERE id = ?', [payment_id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!paymentData) {
            return res.status(404).json({ 
                success: false,
                error: 'Płatność nie znaleziona' 
            });
        }
        
        // Aktualizuj saldo
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE client_balance
                SET balance = ?, last_transaction_at = CURRENT_TIMESTAMP
                WHERE client_id = ?
            `, [balance_after, client_id], function(err) {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Aktualizuj płatność
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE payments
                SET status = 'paid', 
                    payment_method = 'balance',
                    paid_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [payment_id], function(err) {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Jeśli płatność była za fakturę, zaktualizuj fakturę
        if (paymentData.invoice_id) {
            await new Promise((resolve, reject) => {
                db.run(`
                    UPDATE sales_invoices
                    SET payment_status = 'paid',
                        paid_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [paymentData.invoice_id], function(err) {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
        
        // Utwórz transakcję salda
        await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO balance_transactions (
                    client_id, payment_id, amount, transaction_type, description,
                    balance_before, balance_after, created_by
                ) VALUES (?, ?, ?, 'payment', ?, ?, ?, ?)
            `, [
                client_id, payment_id, amount, 
                `Płatność ${paymentData.payment_code}`,
                balance_before, balance_after, req.user.userId
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
        
        console.log(`✅ Płatność ${paymentData.payment_code} opłacona z salda! ${balance_before} → ${balance_after} PLN`);
        
        res.json({
            success: true,
            payment_id,
            balance_before,
            balance_after,
            amount: parseFloat(amount),
            invoice_updated: !!paymentData.invoice_id
        });
        
    } catch (error) {
        console.error('❌ Błąd płatności z salda:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

module.exports = router;
