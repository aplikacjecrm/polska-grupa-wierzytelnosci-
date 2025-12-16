const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ścieżka do bazy danych
const dbPath = path.join(__dirname, 'kancelaria.db');

// Utwórz połączenie z bazą danych
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Błąd połączenia z bazą danych:', err.message);
    } else {
        console.log('✅ Połączono z bazą danych SQLite:', dbPath);
    }
});

// Włącz klucze obce
db.run('PRAGMA foreign_keys = ON');

module.exports = db;
