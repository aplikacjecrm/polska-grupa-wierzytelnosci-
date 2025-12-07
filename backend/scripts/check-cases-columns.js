const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'komunikator.db');
const db = new sqlite3.Database(DB_PATH);

db.all("PRAGMA table_info(cases)", (err, rows) => {
    if (err) {
        console.error('❌ Błąd:', err);
        process.exit(1);
    }
    
    console.log('📊 Kolumny w tabeli cases:\n');
    rows.forEach(r => {
        console.log(`  ${r.cid}. ${r.name.padEnd(30)} ${r.type.padEnd(15)} ${r.notnull ? 'NOT NULL' : ''} ${r.dflt_value ? `DEFAULT ${r.dflt_value}` : ''}`);
    });
    
    db.close();
    process.exit(0);
});
