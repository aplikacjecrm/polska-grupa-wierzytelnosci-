const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'kancelaria.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Tworzę tabelę login_sessions w:', dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS login_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      logout_time DATETIME,
      duration_seconds INTEGER,
      ip_address VARCHAR(45),
      user_agent TEXT,
      device_info TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Błąd:', err);
    } else {
      console.log('✅ Tabela login_sessions utworzona');
    }
    
    // Indeksy
    db.run(`CREATE INDEX IF NOT EXISTS idx_login_sessions_user ON login_sessions(user_id)`, (err2) => {
      if (err2) console.error('❌ Błąd indeksu user:', err2);
      else console.log('✅ Indeks user utworzony');
    });
    
    db.run(`CREATE INDEX IF NOT EXISTS idx_login_sessions_login_time ON login_sessions(login_time)`, (err3) => {
      if (err3) console.error('❌ Błąd indeksu login_time:', err3);
      else console.log('✅ Indeks login_time utworzony');
      
      // Sprawdź czy tabela istnieje
      db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name='login_sessions'`, (err4, rows) => {
        if (err4) {
          console.error('❌ Błąd sprawdzania:', err4);
        } else {
          console.log('📋 Sprawdzenie:', rows.length > 0 ? '✅ Tabela istnieje!' : '❌ Tabela nie istnieje');
        }
        db.close();
      });
    });
  });
});
