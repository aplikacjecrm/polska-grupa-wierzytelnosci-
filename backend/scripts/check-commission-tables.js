const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'komunikator.db');
const db = new sqlite3.Database(DB_PATH);

db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%commission%'", (err, rows) => {
    if (err) {
        console.error('❌ Błąd:', err);
    } else {
        console.log('📊 Tabele z "commission" w nazwie:');
        if (rows.length === 0) {
            console.log('   Brak tabel!');
        } else {
            rows.forEach(r => console.log(`   - ${r.name}`));
        }
    }
    
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%payment%'", (err2, rows2) => {
        console.log('\n📊 Tabele z "payment" w nazwie:');
        if (rows2.length === 0) {
            console.log('   Brak tabel!');
        } else {
            rows2.forEach(r => console.log(`   - ${r.name}`));
        }
        db.close();
        process.exit(0);
    });
});
