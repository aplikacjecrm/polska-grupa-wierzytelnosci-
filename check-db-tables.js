// Sprawdź jakie tabele są w bazie
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'database.sqlite');
console.log('📂 Sprawdzam bazę:', dbPath);

const db = new sqlite3.Database(dbPath);

db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, tables) => {
    if (err) {
        console.error('❌ Błąd:', err);
        db.close();
        return;
    }
    
    console.log('\n📊 Tabele w bazie:');
    tables.forEach((t, i) => {
        console.log(`${i+1}. ${t.name}`);
    });
    
    // Sprawdź tabele z "document" w nazwie
    const docTables = tables.filter(t => t.name.toLowerCase().includes('document'));
    
    if (docTables.length > 0) {
        console.log('\n📄 Tabele z dokumentami:');
        docTables.forEach(t => {
            console.log(`\n=== ${t.name} ===`);
            db.all(`SELECT * FROM ${t.name} LIMIT 3`, (err, rows) => {
                if (!err && rows.length > 0) {
                    console.log('Kolumny:', Object.keys(rows[0]).join(', '));
                    console.log('Rekordów:', rows.length);
                }
            });
        });
    }
    
    setTimeout(() => db.close(), 1000);
});
