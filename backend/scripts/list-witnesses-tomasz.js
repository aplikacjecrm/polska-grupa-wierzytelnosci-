/**
 * Lista wszystkich świadków ze spraw Tomasza Stefańczyka
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', '..', 'data', 'komunikator.db');

const db = new sqlite3.Database(DB_PATH);

console.log('📋 Świadkowie ze spraw Tomasza Stefańczyka\n');

db.all(`
    SELECT 
        cw.id,
        cw.case_id,
        cw.witness_code,
        cw.first_name,
        cw.last_name,
        cw.contact_email,
        cw.contact_phone,
        c.case_number,
        c.title as case_title
    FROM case_witnesses cw
    JOIN cases c ON cw.case_id = c.id
    WHERE c.client_id = 17
    ORDER BY cw.id
`, [], (err, rows) => {
    if (err) {
        console.error('❌ Błąd:', err);
        db.close();
        return;
    }

    console.log(`Znaleziono: ${rows.length} świadków\n`);
    console.log('═'.repeat(80));
    
    rows.forEach((w, idx) => {
        console.log(`\n[${idx + 1}] ${w.witness_code}`);
        console.log(`    Imię i nazwisko: ${w.first_name} ${w.last_name}`);
        console.log(`    Email: ${w.contact_email || 'brak'}`);
        console.log(`    Telefon: ${w.contact_phone || 'brak'}`);
        console.log(`    Sprawa: ${w.case_number} - ${w.case_title}`);
        console.log(`    Case ID: ${w.case_id}`);
    });
    
    console.log('\n' + '═'.repeat(80));
    
    db.close();
});
