/**
 * Naprawia case_manager_id w sprawie i przelicza prowizje
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH);

const CASE_ID = 29;
const PAYMENT_ID = 37;
const GRZEGORZ_ID = 4; // Grzegorz Wiatrowski - case_manager

async function fix() {
    console.log('🔧 Naprawiam case_manager_id i przeliczam prowizje...\n');
    
    // 1. Zaktualizuj sprawę - dodaj Grzegorza jako opiekuna
    await new Promise((resolve, reject) => {
        db.run(`
            UPDATE cases 
            SET case_manager_id = ?
            WHERE id = ?
        `, [GRZEGORZ_ID, CASE_ID], (err) => {
            if (err) reject(err);
            else {
                console.log(`✅ Zaktualizowano sprawę ${CASE_ID} - dodano case_manager_id = ${GRZEGORZ_ID} (Grzegorz)`);
                resolve();
            }
        });
    });
    
    // 2. Pobierz dane płatności
    const payment = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM payments WHERE id = ?', [PAYMENT_ID], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
    
    console.log(`\n📄 Płatność ${PAYMENT_ID}: ${payment.amount} PLN\n`);
    
    // 3. Pobierz dane sprawy
    const caseData = await new Promise((resolve, reject) => {
        db.get(`
            SELECT 
                c.*,
                u1.id as lawyer_id, u1.name as lawyer_name,
                u2.id as case_manager_id, u2.name as case_manager_name
            FROM cases c
            LEFT JOIN users u1 ON c.assigned_to = u1.id
            LEFT JOIN users u2 ON c.case_manager_id = u2.id  
            WHERE c.id = ?
        `, [CASE_ID], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
    
    console.log('👥 Sprawa:');
    console.log(`   Mecenas: ${caseData.lawyer_name} (ID: ${caseData.lawyer_id})`);
    console.log(`   Opiekun sprawy: ${caseData.case_manager_name} (ID: ${caseData.case_manager_id})\n`);
    
    // 4. Sprawdź czy prowizja dla Grzegorza już istnieje
    const existingCommission = await new Promise((resolve, reject) => {
        db.get(`
            SELECT * FROM employee_commissions 
            WHERE payment_id = ? AND employee_id = ?
        `, [PAYMENT_ID, GRZEGORZ_ID], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
    
    if (existingCommission) {
        console.log(`⚠️  Prowizja dla Grzegorza już istnieje (ID: ${existingCommission.id})`);
        console.log(`   Kwota: ${existingCommission.amount} PLN (${existingCommission.rate}%)`);
        console.log(`   Status: ${existingCommission.status}\n`);
        db.close();
        return;
    }
    
    // 5. Utwórz prowizję dla Grzegorza (opiekun sprawy - 10%)
    const rate = 10;
    const commissionAmount = (payment.amount * rate) / 100;
    
    await new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO employee_commissions (
                employee_id, case_id, payment_id, amount, rate, status, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            GRZEGORZ_ID,
            CASE_ID,
            PAYMENT_ID,
            commissionAmount,
            rate,
            'pending',
            `Prowizja opiekuna sprawy ${caseData.case_number} (${rate}%)`
        ], (err) => {
            if (err) reject(err);
            else {
                console.log(`✅ Utworzono prowizję dla Grzegorza:`);
                console.log(`   Kwota: ${commissionAmount} PLN (${rate}%)`);
                console.log(`   Status: pending`);
                console.log(`   Opis: Prowizja opiekuna sprawy ${caseData.case_number} (${rate}%)\n`);
                resolve();
            }
        });
    });
    
    // 6. Pokaż wszystkie prowizje dla tej płatności
    const allCommissions = await new Promise((resolve, reject) => {
        db.all(`
            SELECT 
                ec.*,
                u.name as employee_name
            FROM employee_commissions ec
            LEFT JOIN users u ON ec.employee_id = u.id
            WHERE ec.payment_id = ?
            ORDER BY ec.id
        `, [PAYMENT_ID], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
    
    console.log('📊 Wszystkie prowizje dla płatności:', PAYMENT_ID);
    console.log('─'.repeat(80));
    allCommissions.forEach((c, i) => {
        console.log(`${i + 1}. ${c.employee_name} - ${c.amount} PLN (${c.rate}%) - ${c.status}`);
    });
    console.log('─'.repeat(80));
    console.log(`RAZEM: ${allCommissions.reduce((sum, c) => sum + c.amount, 0)} PLN\n`);
    
    console.log('🎉 Gotowe!\n');
    db.close();
}

fix().catch(err => {
    console.error('❌ Błąd:', err);
    db.close();
    process.exit(1);
});
