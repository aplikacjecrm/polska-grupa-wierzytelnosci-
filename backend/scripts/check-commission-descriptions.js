/**
 * Sprawdza opisy prowizji
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH);

db.all(`
    SELECT 
        ec.id,
        ec.case_id,
        ec.description,
        c.case_number
    FROM employee_commissions ec
    LEFT JOIN cases c ON ec.case_id = c.id
    ORDER BY ec.id DESC
    LIMIT 20
`, (err, rows) => {
    if (err) {
        console.error('Błąd:', err);
    } else {
        console.log('\n📋 Ostatnie 20 prowizji:\n');
        rows.forEach(r => {
            console.log(`ID: ${r.id} | Case: ${r.case_number || 'NULL'}`);
            console.log(`   Opis: ${r.description || 'BRAK'}\n`);
        });
    }
    db.close();
});
