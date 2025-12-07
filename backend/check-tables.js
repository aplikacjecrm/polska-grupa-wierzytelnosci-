const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kancelaria.db');

console.log('🔍 Sprawdzam tabele z "install" w nazwie...\n');

db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%install%'`, [], (err, rows) => {
    if (err) {
        console.error('❌ Błąd:', err);
        db.close();
        return;
    }
    
    if (rows.length === 0) {
        console.log('❌ Brak tabel z "install" w nazwie!');
        db.close();
        return;
    }
    
    console.log(`✅ Znaleziono ${rows.length} tabel:`);
    rows.forEach(row => console.log(`  - ${row.name}`));
    console.log('');
    
    // Sprawdź każdą tabelę
    rows.forEach(row => {
        const tableName = row.name;
        
        console.log(`📊 Tabela: ${tableName}`);
        
        // Liczba rekordów
        db.get(`SELECT COUNT(*) as count FROM ${tableName}`, [], (err, result) => {
            if (err) {
                console.error(`  ❌ Błąd: ${err.message}`);
            } else {
                console.log(`  📝 Liczba rekordów: ${result.count}`);
                
                // Jeśli są rekordy, pokaż przykład
                if (result.count > 0) {
                    db.all(`SELECT * FROM ${tableName} LIMIT 3`, [], (err, samples) => {
                        if (!err) {
                            console.log(`  📄 Przykładowe rekordy:`);
                            samples.forEach((s, idx) => {
                                console.log(`    ${idx + 1}.`, JSON.stringify(s, null, 2));
                            });
                        }
                    });
                }
            }
        });
    });
    
    // Zamknij połączenie po 2 sekundach
    setTimeout(() => {
        db.close();
        console.log('\n✅ Gotowe!');
    }, 2000);
});
