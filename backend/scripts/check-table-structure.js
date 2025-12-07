const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', '..', 'data', 'komunikator.db');
const db = new sqlite3.Database(DB_PATH);

db.all("PRAGMA table_info(documents)", [], (err, rows) => {
    if (err) {
        console.error('❌ Błąd:', err);
        db.close();
        process.exit(1);
    }

    console.log('Struktura tabeli documents:');
    rows.forEach(col => {
        console.log(`  ${col.name} (${col.type})`);
    });

    db.close();
});
