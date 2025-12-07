/**
 * Sprawdzenie świadków w bazie
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', '..', 'data', 'komunikator.db');

const db = new sqlite3.Database(DB_PATH);

console.log('🔍 Sprawdzanie świadków w bazie...\n');

// Sprawdź strukturę tabeli świadków
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%witness%'", [], (err, tables) => {
    if (err) {
        console.error('❌ Błąd:', err);
        db.close();
        return;
    }

    console.log('📋 Tabele ze świadkami:');
    tables.forEach(t => console.log(`   • ${t.name}`));
    console.log('');

    // Sprawdź strukturę każdej tabeli
    tables.forEach(table => {
        db.all(`PRAGMA table_info(${table.name})`, [], (err, cols) => {
            if (err) {
                console.error(`❌ Błąd dla ${table.name}:`, err);
                return;
            }

            console.log(`\n📊 Struktura ${table.name}:`);
            cols.forEach(col => {
                console.log(`   ${col.name} (${col.type})`);
            });

            // Sprawdź zawartość
            db.all(`SELECT * FROM ${table.name} LIMIT 10`, [], (err, rows) => {
                if (err) {
                    console.error(`❌ Błąd odczytu ${table.name}:`, err);
                    return;
                }

                console.log(`\n💾 Dane w ${table.name} (max 10 wierszy):`);
                if (rows.length === 0) {
                    console.log('   (pusta tabela)');
                } else {
                    rows.forEach((row, idx) => {
                        console.log(`\n   [${idx + 1}]`, JSON.stringify(row, null, 2));
                    });
                }

                // Jeśli to ostatnia tabela, zamknij połączenie
                if (table.name === tables[tables.length - 1].name) {
                    console.log('\n');
                    
                    // Sprawdź sprawy Tomasza
                    db.all('SELECT id, case_number, title FROM cases WHERE client_id = 17', [], (err, cases) => {
                        if (err) {
                            console.error('❌ Błąd:', err);
                            db.close();
                            return;
                        }

                        console.log('📋 Sprawy Tomasza Stefańczyka (client_id=17):');
                        cases.forEach(c => {
                            console.log(`   • ID: ${c.id}, Numer: ${c.case_number}, Tytuł: ${c.title}`);
                        });

                        db.close();
                    });
                }
            });
        });
    });
});
