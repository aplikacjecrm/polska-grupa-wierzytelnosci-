const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'kancelaria.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Tworzę tabelę employee_reviews w:', dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS employee_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      reviewer_id INTEGER,
      rating INTEGER CHECK (rating BETWEEN 1 AND 5),
      review_text TEXT,
      review_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES users(id),
      FOREIGN KEY (reviewer_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Błąd:', err);
    } else {
      console.log('✅ Tabela employee_reviews utworzona');
    }
    
    // Sprawdź czy tabela istnieje
    db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name='employee_reviews'`, (err2, rows) => {
      if (err2) {
        console.error('❌ Błąd sprawdzania:', err2);
      } else {
        console.log('📋 Sprawdzenie:', rows.length > 0 ? '✅ Tabela istnieje!' : '❌ Tabela nie istnieje');
      }
      db.close();
    });
  });
});
