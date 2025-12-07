/**
 * Skrypt do czyszczenia cache API
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', '..', 'data', 'komunikator.db');

console.log('🗑️ Czyszczenie cache API...');
console.log('📍 Baza danych:', DB_PATH);
console.log('');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Błąd połączenia z bazą:', err);
        process.exit(1);
    }
    console.log('✅ Połączono z bazą danych');
});

// Sprawdź ile jest wpisów w cache
db.get('SELECT COUNT(*) as count FROM api_cache', [], (err, row) => {
    if (err) {
        console.error('❌ Błąd:', err);
        db.close();
        process.exit(1);
    }

    console.log(`📊 Wpisów w cache: ${row.count}`);
    console.log('');

    // Wyczyść cache
    db.run('DELETE FROM api_cache', [], function(err) {
        if (err) {
            console.error('❌ Błąd czyszczenia:', err);
            db.close();
            process.exit(1);
        }

        console.log(`✅ Wyczyszczono ${this.changes} wpisów z cache`);
        console.log('');
        console.log('✨ Cache API został wyczyszczony!');
        console.log('');
        console.log('💡 Teraz wyszukiwanie powinno działać poprawnie.');
        
        db.close();
    });
});
