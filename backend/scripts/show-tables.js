/**
 * Skrypt do wyświetlenia wszystkich tabel w bazie
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', '..', 'data', 'komunikator.db');

console.log('📊 Tabele w bazie danych');
console.log('📍 Baza danych:', DB_PATH);
console.log('');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Błąd połączenia z bazą:', err);
        process.exit(1);
    }
});

db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", [], (err, rows) => {
    if (err) {
        console.error('❌ Błąd:', err);
        db.close();
        process.exit(1);
    }

    console.log(`Znaleziono tabel: ${rows.length}`);
    console.log('═'.repeat(60));
    
    rows.forEach((row, idx) => {
        console.log(`${idx + 1}. ${row.name}`);
    });

    db.close();
});
