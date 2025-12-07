/**
 * Dodaje brakującą prowizję dla opiekuna klienta
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH);

const CASE_ID = 29;
const PAYMENT_ID = 37;
const CLIENT_MANAGER_ID = 6; // Pro Meritum

async function addClientManagerCommission() {
    console.log('💼 Dodaję prowizję dla opiekuna klienta...\n');
    
    // 1. Pobierz dane płatności i sprawę
    const data = await new Promise((resolve, reject) => {
        db.get(`
            SELECT 
                p.id as payment_id, p.amount,
                c.case_number,
                u.name as client_manager_name
            FROM payments p
            LEFT JOIN cases c ON p.case_id = c.id
            LEFT JOIN clients cl ON c.client_id = cl.id
            LEFT JOIN users u ON cl.assigned_to = u.id
            WHERE p.id = ?
        `, [PAYMENT_ID], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
    
    console.log('📄 Płatność:', PAYMENT_ID);
    console.log('💰 Kwota:', data.amount, 'PLN');
    console.log('👤 Opiekun klienta:', data.client_manager_name, '(ID:', CLIENT_MANAGER_ID, ')\n');
    
    // 2. Sprawdź czy prowizja już istnieje
    const existing = await new Promise((resolve, reject) => {
        db.get(`
            SELECT * FROM employee_commissions 
            WHERE payment_id = ? AND employee_id = ?
        `, [PAYMENT_ID, CLIENT_MANAGER_ID], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
    
    if (existing) {
        console.log(`⚠️  Prowizja dla opiekuna klienta już istnieje (ID: ${existing.id})`);
        console.log(`   Kwota: ${existing.amount} PLN (${existing.rate}%)`);
        console.log(`   Status: ${existing.status}\n`);
        db.close();
        return;
    }
    
    // 3. Utwórz prowizję dla opiekuna klienta (5%)
    const rate = 5;
    const commissionAmount = (data.amount * rate) / 100;
    
    await new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO employee_commissions (
                employee_id, case_id, payment_id, amount, rate, status, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            CLIENT_MANAGER_ID,
            CASE_ID,
            PAYMENT_ID,
            commissionAmount,
            rate,
            'pending',
            `Prowizja opiekuna klienta dla sprawy ${data.case_number} (${rate}%)`
        ], (err) => {
            if (err) reject(err);
            else {
                console.log(`✅ Utworzono prowizję dla opiekuna klienta:`);
                console.log(`   Pracownik: ${data.client_manager_name}`);
                console.log(`   Kwota: ${commissionAmount} PLN (${rate}%)`);
                console.log(`   Status: pending`);
                console.log(`   Opis: Prowizja opiekuna klienta dla sprawy ${data.case_number} (${rate}%)\n`);
                resolve();
            }
        });
    });
    
    // 4. Pokaż wszystkie prowizje dla tej płatności
    const allCommissions = await new Promise((resolve, reject) => {
        db.all(`
            SELECT 
                ec.*,
                u.name as employee_name
            FROM employee_commissions ec
            LEFT JOIN users u ON ec.employee_id = u.id
            WHERE ec.payment_id = ?
            ORDER BY ec.rate DESC
        `, [PAYMENT_ID], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
    
    console.log('📊 Wszystkie prowizje dla płatności:', PAYMENT_ID);
    console.log('─'.repeat(80));
    allCommissions.forEach((c, i) => {
        console.log(`${i + 1}. ${c.employee_name.padEnd(20)} - ${String(c.amount).padStart(7)} PLN (${c.rate}%) - ${c.status}`);
    });
    console.log('─'.repeat(80));
    console.log(`RAZEM: ${allCommissions.reduce((sum, c) => sum + c.amount, 0)} PLN\n`);
    
    console.log('🎉 Gotowe!\n');
    db.close();
}

addClientManagerCommission().catch(err => {
    console.error('❌ Błąd:', err);
    db.close();
    process.exit(1);
});
