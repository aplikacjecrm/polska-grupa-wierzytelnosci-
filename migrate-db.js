const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'data/komunikator.db');
const db = new sqlite3.Database(DB_PATH);

console.log('🔧 Migracja bazy danych...');

db.serialize(() => {
  // Sprawdź czy kolumna role istnieje
  db.all("PRAGMA table_info(users)", [], (err, columns) => {
    if (err) {
      console.error('❌ Błąd:', err);
      return;
    }

    const hasRole = columns.some(col => col.name === 'role');
    const hasClientId = columns.some(col => col.name === 'client_id');
    const hasIsActive = columns.some(col => col.name === 'is_active');

    if (!hasRole) {
      console.log('➕ Dodawanie kolumny role...');
      db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'lawyer'", (err) => {
        if (err) console.error('Błąd dodawania role:', err);
        else console.log('✅ Kolumna role dodana');
      });
    } else {
      console.log('✅ Kolumna role już istnieje');
    }

    if (!hasClientId) {
      console.log('➕ Dodawanie kolumny client_id...');
      db.run("ALTER TABLE users ADD COLUMN client_id INTEGER", (err) => {
        if (err) console.error('Błąd dodawania client_id:', err);
        else console.log('✅ Kolumna client_id dodana');
      });
    } else {
      console.log('✅ Kolumna client_id już istnieje');
    }

    if (!hasIsActive) {
      console.log('➕ Dodawanie kolumny is_active...');
      db.run("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1", (err) => {
        if (err) console.error('Błąd dodawania is_active:', err);
        else console.log('✅ Kolumna is_active dodana');
      });
    } else {
      console.log('✅ Kolumna is_active już istnieje');
    }

    setTimeout(() => {
      console.log('\n✅ Migracja zakończona!');
      console.log('Możesz teraz uruchomić aplikację: npm start');
      db.close();
    }, 1000);
  });
});
