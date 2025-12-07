// Znajdź właściwą bazę danych z tabelą documents
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPaths = [
    'data/kancelaria.db',
    'data/komunikator.db',
    'backend/database/kancelaria.db',
    'backend/database.sqlite',
    'data/database.sqlite'
];

console.log('🔍 Szukam bazy z tabelą documents...\n');

dbPaths.forEach(dbPath => {
    const fullPath = path.join(__dirname, dbPath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`❌ Nie istnieje: ${dbPath}`);
        return;
    }
    
    const db = new sqlite3.Database(fullPath, sqlite3.OPEN_READONLY);
    
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='documents'", (err, tables) => {
        if (err) {
            console.log(`⚠️  ${dbPath}: Błąd - ${err.message}`);
            db.close();
            return;
        }
        
        if (tables.length > 0) {
            console.log(`✅ ZNALEZIONO! ${dbPath}`);
            
            // Sprawdź czy jest dokument ID: 17
            db.get('SELECT id, filename, file_name FROM documents WHERE id = 17', (err, doc) => {
                if (doc) {
                    console.log(`   📄 Dokument ID:17 => ${doc.filename || doc.file_name}`);
                    console.log(`   🎯 TO JEST WŁAŚCIWA BAZA!`);
                } else {
                    console.log(`   ℹ️  Dokument ID:17 nie istnieje`);
                }
                db.close();
            });
        } else {
            console.log(`❌ Brak tabeli documents: ${dbPath}`);
            db.close();
        }
    });
});

setTimeout(() => {
    console.log('\n✅ Koniec sprawdzania');
}, 2000);
