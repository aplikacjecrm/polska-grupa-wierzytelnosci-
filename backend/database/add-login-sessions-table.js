/**
 * Migracja: Dodanie tabeli login_sessions
 * Data: 2025-11-13
 * Opis: Tabela do śledzenia sesji logowania pracowników dla Employee Dashboard
 */

const { getDatabase } = require('./init');

async function migrate() {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🔄 Uruchamianie migracji: add-login-sessions-table...');
      
      // Tworzenie tabeli login_sessions
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
          console.error('❌ Błąd tworzenia tabeli login_sessions:', err);
          reject(err);
        } else {
          console.log('✅ Tabela login_sessions utworzona');
          
          // Dodaj indeksy
          db.run(`CREATE INDEX IF NOT EXISTS idx_login_sessions_user ON login_sessions(user_id)`, (err2) => {
            if (err2) {
              console.error('❌ Błąd tworzenia indeksu idx_login_sessions_user:', err2);
            } else {
              console.log('✅ Indeks idx_login_sessions_user utworzony');
            }
          });
          
          db.run(`CREATE INDEX IF NOT EXISTS idx_login_sessions_login_time ON login_sessions(login_time)`, (err3) => {
            if (err3) {
              console.error('❌ Błąd tworzenia indeksu idx_login_sessions_login_time:', err3);
            } else {
              console.log('✅ Indeks idx_login_sessions_login_time utworzony');
            }
          });
          
          console.log('✅ Migracja zakończona pomyślnie');
          resolve();
        }
      });
    });
  });
}

// Uruchom migrację jeśli wywołano bezpośrednio
if (require.main === module) {
  const { initDatabase } = require('./init');
  initDatabase().then(() => {
    migrate()
      .then(() => {
        console.log('✅ Migracja wykonana');
        process.exit(0);
      })
      .catch((err) => {
        console.error('❌ Błąd migracji:', err);
        process.exit(1);
      });
  });
}

module.exports = { migrate };
