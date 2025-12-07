/**
 * Migracja 004: Employee Dashboard HR System
 * Data: 2025-11-13
 * 
 * Dodaje tabele dla systemu HR:
 * - employee_profiles - Profile pracowników
 * - login_sessions - Historia logowań
 * - activity_logs - Logi aktywności
 * - employee_reviews - Oceny pracowników
 * - employee_tasks - Zadania pracowników
 * 
 * Dodaje kolumnę visibility do notes, documents, events
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/kancelaria.db');

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
        // 1. Tabela employee_profiles
        db.run(`
          CREATE TABLE IF NOT EXISTS employee_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            
            -- Dane podstawowe
            phone TEXT,
            position TEXT,
            department TEXT,
            office_location TEXT,
            
            -- Dane specjalistyczne (dla mecenasów)
            specialization TEXT,
            license_number TEXT,
            bar_association TEXT,
            
            -- Dane HR
            hire_date DATE,
            contract_type TEXT,
            work_hours TEXT,
            languages TEXT,
            
            -- Profil
            bio TEXT,
            avatar_url TEXT,
            skills TEXT,
            certifications TEXT,
            
            -- Metadata
            notes TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            console.error('❌ Błąd tworzenia employee_profiles:', err);
          } else {
            console.log('✅ Tabela employee_profiles utworzona');
          }
        });
        
        // Indeksy dla employee_profiles
        db.run(`CREATE INDEX IF NOT EXISTS idx_employee_profiles_user_id ON employee_profiles(user_id)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_employee_profiles_status ON employee_profiles(status)`);
        
        // 2. Tabela login_sessions
        db.run(`
          CREATE TABLE IF NOT EXISTS login_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            
            -- Sesja
            login_time DATETIME NOT NULL,
            logout_time DATETIME,
            duration_seconds INTEGER,
            session_token TEXT,
            
            -- Informacje techniczne
            ip_address TEXT,
            user_agent TEXT,
            device_type TEXT,
            
            -- Metadata
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            console.error('❌ Błąd tworzenia login_sessions:', err);
          } else {
            console.log('✅ Tabela login_sessions utworzona');
          }
        });
        
        // Indeksy dla login_sessions
        db.run(`CREATE INDEX IF NOT EXISTS idx_login_sessions_user_id ON login_sessions(user_id)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_login_sessions_login_time ON login_sessions(login_time)`);
        
        // 3. Tabela employee_activity_logs (zmieniona nazwa - activity_logs już istnieje)
        db.run(`
          CREATE TABLE IF NOT EXISTS employee_activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            
            -- Akcja
            action_type TEXT NOT NULL,
            action_category TEXT,
            description TEXT NOT NULL,
            
            -- Powiązania
            related_case_id INTEGER,
            related_client_id INTEGER,
            related_document_id INTEGER,
            related_event_id INTEGER,
            related_user_id INTEGER,
            
            -- Metadata JSON
            metadata TEXT,
            
            -- Czas
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (related_case_id) REFERENCES cases(id) ON DELETE SET NULL,
            FOREIGN KEY (related_client_id) REFERENCES clients(id) ON DELETE SET NULL
          )
        `, (err) => {
          if (err) {
            console.error('❌ Błąd tworzenia employee_activity_logs:', err);
          } else {
            console.log('✅ Tabela employee_activity_logs utworzona');
          }
        });
        
        // Indeksy dla employee_activity_logs
        db.run(`CREATE INDEX IF NOT EXISTS idx_employee_activity_logs_user_id ON employee_activity_logs(user_id)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_employee_activity_logs_action_type ON employee_activity_logs(action_type)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_employee_activity_logs_created_at ON employee_activity_logs(created_at)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_employee_activity_logs_category ON employee_activity_logs(action_category)`);
        
        // 4. Tabela employee_reviews
        db.run(`
          CREATE TABLE IF NOT EXISTS employee_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            reviewer_id INTEGER NOT NULL,
            
            -- Ocena
            review_type TEXT NOT NULL,
            rating REAL,
            
            -- Treść
            strengths TEXT,
            weaknesses TEXT,
            recommendations TEXT,
            achievements TEXT,
            goals TEXT,
            
            -- Period
            review_period_start DATE,
            review_period_end DATE,
            
            -- Status
            status TEXT DEFAULT 'draft',
            
            -- Metadata
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            console.error('❌ Błąd tworzenia employee_reviews:', err);
          } else {
            console.log('✅ Tabela employee_reviews utworzona');
          }
        });
        
        // Indeksy dla employee_reviews
        db.run(`CREATE INDEX IF NOT EXISTS idx_employee_reviews_user_id ON employee_reviews(user_id)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_employee_reviews_reviewer_id ON employee_reviews(reviewer_id)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_employee_reviews_created_at ON employee_reviews(created_at)`);
        
        // 5. Tabela employee_tasks
        db.run(`
          CREATE TABLE IF NOT EXISTS employee_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            
            -- Przypisanie
            assigned_to INTEGER NOT NULL,
            assigned_by INTEGER,
            case_id INTEGER,
            
            -- Zadanie
            title TEXT NOT NULL,
            description TEXT,
            priority TEXT DEFAULT 'medium',
            status TEXT DEFAULT 'pending',
            
            -- Terminy
            due_date DATE,
            completed_at DATETIME,
            
            -- Metadata
            tags TEXT,
            estimated_hours REAL,
            actual_hours REAL,
            
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL
          )
        `, (err) => {
          if (err) {
            console.error('❌ Błąd tworzenia employee_tasks:', err);
          } else {
            console.log('✅ Tabela employee_tasks utworzona');
          }
        });
        
        // Indeksy dla employee_tasks
        db.run(`CREATE INDEX IF NOT EXISTS idx_employee_tasks_assigned_to ON employee_tasks(assigned_to)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_employee_tasks_status ON employee_tasks(status)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_employee_tasks_due_date ON employee_tasks(due_date)`);
        
        // 6. Dodaj kolumnę visibility do notes (jeśli nie istnieje)
        db.run(`ALTER TABLE notes ADD COLUMN visibility TEXT DEFAULT 'internal'`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('⚠️ Uwaga notes.visibility:', err.message);
          } else if (!err) {
            console.log('✅ Dodano kolumnę notes.visibility');
          }
        });
        
        db.run(`CREATE INDEX IF NOT EXISTS idx_notes_visibility ON notes(visibility)`, (err) => {
          if (err && !err.message.includes('already exists')) {
            console.error('⚠️ Indeks notes.visibility:', err.message);
          }
        });
        
        // 7. Dodaj kolumnę visibility do documents (jeśli nie istnieje)
        db.run(`ALTER TABLE documents ADD COLUMN visibility TEXT DEFAULT 'internal'`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('⚠️ Uwaga documents.visibility:', err.message);
          } else if (!err) {
            console.log('✅ Dodano kolumnę documents.visibility');
          }
        });
        
        db.run(`CREATE INDEX IF NOT EXISTS idx_documents_visibility ON documents(visibility)`, (err) => {
          if (err && !err.message.includes('already exists')) {
            console.error('⚠️ Indeks documents.visibility:', err.message);
          }
        });
        
        // 8. Dodaj kolumnę visibility do events (jeśli nie istnieje)
        db.run(`ALTER TABLE events ADD COLUMN visibility TEXT DEFAULT 'internal'`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('⚠️ Uwaga events.visibility:', err.message);
          } else if (!err) {
            console.log('✅ Dodano kolumnę events.visibility');
          }
        });
        
        db.run(`CREATE INDEX IF NOT EXISTS idx_events_visibility ON events(visibility)`, (err) => {
          if (err && !err.message.includes('already exists')) {
            console.error('⚠️ Indeks events.visibility:', err.message);
          }
          
          // Zamknij połączenie po ostatniej operacji
          db.close((err) => {
            if (err) {
              console.error('❌ Błąd zamykania bazy:', err);
              reject(err);
            } else {
              console.log('✅ Migracja 004 zakończona pomyślnie!');
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
  console.log('🚀 Uruchamiam migrację 004: Employee HR System...\n');
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
