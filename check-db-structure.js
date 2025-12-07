// Sprawdź strukturę bazy i wszystkie dokumenty
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'komunikator.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 ANALIZA STRUKTURY BAZY DANYCH\n');

// 1. Lista wszystkich tabel
db.all(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
`, [], (err, tables) => {
    if (err) {
        console.error('❌ Błąd:', err);
        db.close();
        return;
    }
    
    console.log('📋 TABELE W BAZIE:');
    tables.forEach(t => console.log(`   - ${t.name}`));
    console.log('');
    
    // 2. Struktura tabeli documents
    db.all(`PRAGMA table_info(documents)`, [], (err, columns) => {
        if (err) {
            console.error('❌ Błąd:', err);
        } else {
            console.log('📄 STRUKTURA TABELI documents:');
            columns.forEach(col => {
                console.log(`   ${col.name} (${col.type})`);
            });
            console.log('');
        }
        
        // 3. Wszystkie dokumenty w bazie
        db.all(`
            SELECT id, case_id, filename, filepath, category, 
                   length(filename) as fn_len,
                   substr(filename, -4) as extension
            FROM documents 
            ORDER BY case_id, id DESC
            LIMIT 20
        `, [], (err, docs) => {
            if (err) {
                console.error('❌ Błąd:', err);
            } else {
                console.log(`📂 WSZYSTKIE DOKUMENTY W BAZIE (max 20):`);
                console.log(`   Łącznie: ${docs.length}\n`);
                
                if (docs.length === 0) {
                    console.log('   ⚠️ TABELA documents JEST PUSTA!');
                } else {
                    docs.forEach(doc => {
                        console.log(`   ID: ${doc.id} | Sprawa: ${doc.case_id} | ${doc.filename}`);
                        console.log(`      Rozszerzenie: ${doc.extension}`);
                        console.log(`      Kategoria: ${doc.category || 'brak'}`);
                    });
                }
            }
            
            // 4. Sprawdź czy są inne tabele z dokumentami
            console.log('\n🔍 Szukam innych tabel z dokumentami...');
            
            db.all(`
                SELECT name FROM sqlite_master 
                WHERE type='table' 
                AND (name LIKE '%file%' OR name LIKE '%doc%' OR name LIKE '%attach%')
                ORDER BY name
            `, [], (err, docTables) => {
                if (docTables && docTables.length > 0) {
                    console.log('   Znaleziono tabele:');
                    docTables.forEach(t => console.log(`   - ${t.name}`));
                    
                    // Sprawdź case_files jeśli istnieje
                    if (docTables.some(t => t.name === 'case_files')) {
                        db.all(`SELECT COUNT(*) as count FROM case_files`, [], (err, result) => {
                            if (!err && result[0]) {
                                console.log(`\n📁 case_files: ${result[0].count} plików`);
                            }
                            db.close();
                        });
                    } else {
                        db.close();
                    }
                } else {
                    console.log('   Brak innych tabel z dokumentami');
                    db.close();
                }
            });
        });
    });
});
