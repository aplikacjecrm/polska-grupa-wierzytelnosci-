// Sprawdź dane strony przeciwnej w bazie

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'kancelaria.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Sprawdzam tabelę opposing_party_info...\n');

// Sprawdź czy tabela istnieje
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='opposing_party_info'", (err, row) => {
    if (err) {
        console.error('❌ Błąd:', err);
        db.close();
        return;
    }
    
    if (!row) {
        console.log('❌ Tabela opposing_party_info NIE ISTNIEJE!\n');
        console.log('💡 ROZWIĄZANIE: Uruchom inicjalizację bazy danych\n');
        db.close();
        return;
    }
    
    console.log('✅ Tabela istnieje!\n');
    
    // Policz rekordy
    db.get("SELECT COUNT(*) as count FROM opposing_party_info", (err, row) => {
        if (err) {
            console.error('❌ Błąd:', err);
            db.close();
            return;
        }
        
        console.log(`📋 Rekordów w tabeli: ${row.count}\n`);
        
        if (row.count === 0) {
            console.log('⚠️ TABELA JEST PUSTA!\n');
            console.log('💡 DLATEGO NIE WIDAĆ PRZYCISKU!\n');
            console.log('Przycisk "🔍 Sprawdź w Social Media" pojawia się tylko gdy:');
            console.log('  1. Sprawa ma dodaną stronę przeciwną');
            console.log('  2. Jest wpisana nazwa firmy (party_name)\n');
            console.log('🔧 ROZWIĄZANIE:');
            console.log('  1. Otwórz sprawę w CRM');
            console.log('  2. Zakładka "⚔️ Strona przeciwna"');
            console.log('  3. Kliknij "+ Dodaj informacje"');
            console.log('  4. Wpisz nazwę firmy (np. "Test Firma Sp. z o.o.")');
            console.log('  5. Zapisz');
            console.log('  6. Przycisk pojawi się automatycznie!\n');
        } else {
            console.log('✅ MASZ DANE!\n');
            console.log('📋 Przykładowe strony przeciwne:\n');
            
            db.all("SELECT id, case_id, party_name, party_type FROM opposing_party_info LIMIT 5", (err, rows) => {
                if (err) {
                    console.error('❌ Błąd:', err);
                } else {
                    rows.forEach(row => {
                        console.log(`  • ID: ${row.id} | Sprawa: ${row.case_id} | Nazwa: ${row.party_name || '(brak)'} | Typ: ${row.party_type}`);
                    });
                    
                    console.log('\n💡 Jeśli nie widzisz przycisku:');
                    console.log('  1. Odśwież przeglądarkę (Ctrl+Shift+R)');
                    console.log('  2. Sprawdź czy sprawa którą otwierasz MA stronę przeciwną');
                    console.log('  3. Sprawdź konsolę JavaScript (F12) czy są błędy\n');
                }
                db.close();
            });
        }
    });
});
