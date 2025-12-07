const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/komunikator.db');

console.log('═══════════════════════════════════════════════════════════');
console.log('STRUKTURA TABELI court_decisions');
console.log('═══════════════════════════════════════════════════════════\n');

// Sprawdź strukturę tabeli
db.all("PRAGMA table_info(court_decisions)", (err, columns) => {
    if (err) {
        console.error('Błąd:', err);
        db.close();
        return;
    }
    
    console.log('📋 KOLUMNY W TABELI:');
    console.log('ID | Nazwa kolumny           | Typ          | Null? | Default');
    console.log('---|-------------------------|--------------|-------|--------');
    columns.forEach(col => {
        console.log(`${col.cid.toString().padEnd(2)} | ${col.name.padEnd(23)} | ${col.type.padEnd(12)} | ${col.notnull ? 'NO' : 'YES'.padEnd(5)} | ${col.dflt_value || 'NULL'}`);
    });
    
    console.log('\n📊 STATYSTYKI:');
    
    // Sprawdź ile jest orzeczeń
    db.get('SELECT COUNT(*) as total FROM court_decisions', (err, row) => {
        if (!err) {
            console.log(`   Wszystkich orzeczeń: ${row.total}`);
        }
        
        // Sprawdź ile ma summary
        db.get('SELECT COUNT(*) as count FROM court_decisions WHERE summary IS NOT NULL', (err, row) => {
            if (!err) {
                console.log(`   Ze streszczeniem: ${row.count}`);
            }
            
            // Sprawdź ile ma source_url
            db.get('SELECT COUNT(*) as count FROM court_decisions WHERE source_url IS NOT NULL', (err, row) => {
                if (!err) {
                    console.log(`   Z linkiem do źródła: ${row.count}`);
                }
                
                console.log('\n═══════════════════════════════════════════════════════════');
                db.close();
            });
        });
    });
});
