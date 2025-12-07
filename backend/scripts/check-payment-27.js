const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'komunikator.db');
const db = new sqlite3.Database(DB_PATH);

console.log('🔍 Sprawdzanie płatności ID 27...\n');

db.get(`
    SELECT 
        p.*,
        c.case_number,
        c.assigned_to as lawyer_id,
        u.name as lawyer_name
    FROM payments p
    LEFT JOIN cases c ON p.case_id = c.id
    LEFT JOIN users u ON c.assigned_to = u.id
    WHERE p.id = 27
`, (err, payment) => {
    if (err) {
        console.error('❌ Błąd:', err);
        process.exit(1);
    }
    
    if (!payment) {
        console.log('❌ Płatność ID 27 nie istnieje!');
        process.exit(1);
    }
    
    console.log('📋 PŁATNOŚĆ ID 27:\n');
    console.log(`   Kwota: ${payment.amount} PLN`);
    console.log(`   Status: ${payment.status}`);
    console.log(`   Case ID: ${payment.case_id || 'BRAK!'}`);
    console.log(`   Case Number: ${payment.case_number || 'N/A'}`);
    console.log(`   Mecenas: ${payment.lawyer_name || 'BRAK!'} (ID: ${payment.lawyer_id || 'N/A'})`);
    console.log(`   Data utworzenia: ${payment.created_at}\n`);
    
    if (!payment.case_id) {
        console.log('⚠️ PROBLEM: Płatność NIE MA case_id!');
        console.log('   Prowizje NIE zostaną utworzone.\n');
        db.close();
        process.exit(0);
    }
    
    if (!payment.lawyer_id) {
        console.log('⚠️ PROBLEM: Sprawa NIE MA mecenasa!');
        console.log('   Prowizje NIE zostaną utworzone.\n');
        db.close();
        process.exit(0);
    }
    
    // Sprawdź prowizje
    db.all(`
        SELECT 
            ec.*,
            u.name as employee_name
        FROM employee_commissions ec
        LEFT JOIN users u ON ec.employee_id = u.id
        WHERE ec.payment_id = 27
    `, (err, commissions) => {
        if (err) {
            console.error('❌ Błąd:', err);
            db.close();
            process.exit(1);
        }
        
        if (commissions.length === 0) {
            console.log('❌ BRAK PROWIZJI dla płatności ID 27!\n');
            console.log('💡 ROZWIĄZANIE:');
            console.log('   Uruchom: node backend/scripts/create-commission-for-payment-27.js\n');
        } else {
            console.log(`✅ Znaleziono ${commissions.length} prowizji:\n`);
            commissions.forEach((c, i) => {
                console.log(`   ${i+1}. ${c.employee_name}: ${c.amount} PLN (${c.rate}%) - ${c.status}`);
            });
        }
        
        db.close();
        process.exit(0);
    });
});
