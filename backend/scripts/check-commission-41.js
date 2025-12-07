const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'komunikator.db');
const db = new sqlite3.Database(DB_PATH);

console.log('🔍 Sprawdzanie prowizji ID 41...\n');

db.get('SELECT * FROM employee_commissions WHERE id = 41', (err, row) => {
    if (err) {
        console.error('❌ Błąd:', err);
        process.exit(1);
    }
    
    if (!row) {
        console.log('❌ Prowizja ID 41 NIE ISTNIEJE w bazie!');
        console.log('\n💡 Sprawdzam jakie ID są dostępne...\n');
        
        db.all('SELECT id, employee_id, amount, status FROM employee_commissions ORDER BY id DESC LIMIT 10', (err, rows) => {
            if (err) {
                console.error('❌ Błąd:', err);
                db.close();
                process.exit(1);
            }
            
            console.log('📋 Ostatnie 10 prowizji:');
            rows.forEach(r => {
                console.log(`   ID: ${r.id} | Employee: ${r.employee_id} | ${r.amount} PLN | ${r.status}`);
            });
            
            db.close();
            process.exit(0);
        });
    } else {
        console.log('✅ Prowizja ID 41 ISTNIEJE!');
        console.log(`   Employee: ${row.employee_id}`);
        console.log(`   Amount: ${row.amount} PLN`);
        console.log(`   Status: ${row.status}`);
        console.log(`   Case: ${row.case_id}`);
        console.log(`   Payment: ${row.payment_id}`);
        
        db.close();
        process.exit(0);
    }
});
