const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'kancelaria.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Tworzę tabelę employee_tasks w:', dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS employee_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assigned_to INTEGER NOT NULL,
      assigned_by INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      due_date DATETIME,
      completed_at DATETIME,
      case_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES users(id),
      FOREIGN KEY (assigned_by) REFERENCES users(id),
      FOREIGN KEY (case_id) REFERENCES cases(id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Błąd:', err);
    } else {
      console.log('✅ Tabela employee_tasks utworzona');
    }
    
    // Sprawdź czy tabela istnieje
    db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name='employee_tasks'`, (err2, rows) => {
      if (err2) {
        console.error('❌ Błąd sprawdzania:', err2);
      } else {
        console.log('📋 Sprawdzenie:', rows.length > 0 ? '✅ Tabela istnieje!' : '❌ Tabela nie istnieje');
      }
      db.close();
    });
  });
});
