// Sprawdź WSZYSTKIE tabele i ich zawartość
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'komunikator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 SPRAWDZAM WSZYSTKIE TABELE W BAZIE...\n');

// Pobierz wszystkie tabele
db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", [], (err, tables) => {
    if (err) {
        console.error('❌ Błąd:', err);
        db.close();
        return;
    }
    
    console.log(`📊 Znaleziono ${tables.length} tabel:\n`);
    
    let index = 0;
    
    function checkNextTable() {
        if (index >= tables.length) {
            db.close();
            console.log('\n✅ Koniec sprawdzania');
            return;
        }
        
        const tableName = tables[index].name;
        index++;
        
        // Pomiń systemowe tabele SQLite
        if (tableName.startsWith('sqlite_')) {
            checkNextTable();
            return;
        }
        
        // Policz rekordy
        db.get(`SELECT COUNT(*) as count FROM ${tableName}`, [], (err, row) => {
            if (err) {
                console.log(`⚠️  ${tableName}: Błąd - ${err.message}`);
            } else {
                const count = row.count;
                const emoji = count > 0 ? '📦' : '📭';
                const status = count > 0 ? `${count} rekordów` : 'PUSTA';
                console.log(`${emoji} ${tableName.padEnd(25)} → ${status}`);
            }
            
            checkNextTable();
        });
    }
    
    checkNextTable();
});
