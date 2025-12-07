/**
 * Migracja 005: Monthly Reports System
 * Data: 2025-11-23
 * 
 * Dodaje tabele dla automatycznych raportów miesięcznych:
 * - monthly_reports - Raporty miesięczne pracowników
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../database/kancelaria.db');

function runMigration() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Błąd połączenia z bazą:', err);
        reject(err);
        return;
      }
      
      console.log('✅ Połączono z bazą danych');
      
      db.serialize(() => {
        // Tabela monthly_reports
        db.run(`
          CREATE TABLE IF NOT EXISTS monthly_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            
            -- Okres raportu
            report_month INTEGER NOT NULL,
            report_year INTEGER NOT NULL,
            
            -- Dane czasu pracy
            total_work_hours REAL DEFAULT 0,
            total_login_sessions INTEGER DEFAULT 0,
            avg_session_duration REAL DEFAULT 0,
            
            -- Dane statystyczne
            total_cases INTEGER DEFAULT 0,
            total_clients INTEGER DEFAULT 0,
            completed_tasks INTEGER DEFAULT 0,
            total_tasks INTEGER DEFAULT 0,
            avg_rating REAL DEFAULT 0,
            
            -- Szczegóły JSON
            work_time_details TEXT,
            cases_details TEXT,
            clients_details TEXT,
            tasks_details TEXT,
            activity_summary TEXT,
            reviews_summary TEXT,
            
            -- Status
            status TEXT DEFAULT 'generated',
            generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            
            -- Metadata
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            
            -- Unikalny constraint - jeden raport na miesiąc na pracownika
            UNIQUE(user_id, report_year, report_month)
          )
        `, (err) => {
          if (err) {
            console.error('❌ Błąd tworzenia monthly_reports:', err);
            reject(err);
          } else {
            console.log('✅ Tabela monthly_reports utworzona');
          }
        });
        
        // Indeksy dla monthly_reports
        db.run(`CREATE INDEX IF NOT EXISTS idx_monthly_reports_user_id ON monthly_reports(user_id)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_monthly_reports_date ON monthly_reports(report_year, report_month)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_monthly_reports_status ON monthly_reports(status)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_monthly_reports_generated ON monthly_reports(generated_at)`, (err) => {
          if (err && !err.message.includes('already exists')) {
            console.error('⚠️ Indeks monthly_reports.generated_at:', err.message);
          }
          
          // Zamknij połączenie po ostatniej operacji
          db.close((err) => {
            if (err) {
              console.error('❌ Błąd zamykania bazy:', err);
              reject(err);
            } else {
              console.log('✅ Migracja 005 zakończona pomyślnie!');
              resolve();
            }
          });
        });
      });
    });
  });
}

// Uruchom migrację jeśli wywołano bezpośrednio
if (require.main === module) {
  console.log('🚀 Uruchamiam migrację 005: Monthly Reports System...\n');
  runMigration()
    .then(() => {
      console.log('\n✅ Wszystko gotowe!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Migracja nie powiodła się:', err);
      process.exit(1);
    });
}

module.exports = { runMigration };
