const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'backend', 'database', 'kancelaria.db');
console.log('📍 Sprawdzam bazę:', DB_PATH);

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.get("SELECT COUNT(*) as total FROM clients", (err, row) => {
    if (err) {
      console.error('❌ Błąd clients:', err);
    } else {
      console.log('👥 Klientów w bazie:', row.total);
    }
  });
  
  db.get("SELECT COUNT(*) as total FROM cases", (err, row) => {
    if (err) {
      console.error('❌ Błąd cases:', err);
    } else {
      console.log('📁 Spraw w bazie:', row.total);
    }
  });
  
  db.get("SELECT COUNT(*) as total FROM users", (err, row) => {
    if (err) {
      console.error('❌ Błąd users:', err);
    } else {
      console.log('👤 Użytkowników w bazie:', row.total);
    }
  });
  
  db.get("SELECT COUNT(*) as total FROM case_evidence", (err, row) => {
    if (err) {
      console.error('❌ Błąd case_evidence:', err);
    } else {
      console.log('🔍 Dowodów w bazie:', row.total);
    }
    db.close();
  });
});
