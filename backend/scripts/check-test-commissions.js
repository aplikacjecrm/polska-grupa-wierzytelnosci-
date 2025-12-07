const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'komunikator.db');
const db = new sqlite3.Database(DB_PATH);

console.log('🔍 Sprawdzanie prowizji w bazie...\n');

db.all('SELECT * FROM employee_commissions', (err, rows) => {
    if (err) {
        console.error('❌ Błąd:', err);
        process.exit(1);
    }
    
    if (rows.length === 0) {
        console.log('⚠️ BRAK PROWIZJI W BAZIE!');
        console.log('💡 Uruchom: node backend/scripts/create-test-commissions.js');
    } else {
        console.log(`✅ Znaleziono ${rows.length} prowizji:\n`);
        
        let totalPending = 0, totalApproved = 0, totalPaid = 0;
        
        rows.forEach((r, i) => {
            console.log(`${i+1}. ID: ${r.id} | ${r.status.padEnd(10)} | ${r.amount} PLN | Employee: ${r.employee_id} | ${r.description || 'Brak opisu'}`);
            
            if (r.status === 'pending') totalPending += r.amount;
            if (r.status === 'approved') totalApproved += r.amount;
            if (r.status === 'paid') totalPaid += r.amount;
        });
        
        console.log(`\n📊 PODSUMOWANIE:`);
        console.log(`   Pending:  ${totalPending} PLN`);
        console.log(`   Approved: ${totalApproved} PLN`);
        console.log(`   Paid:     ${totalPaid} PLN`);
        console.log(`   RAZEM:    ${totalPending + totalApproved + totalPaid} PLN`);
    }
    
    db.close();
    process.exit(0);
});
