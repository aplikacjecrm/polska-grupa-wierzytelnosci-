/**
 * Migration 008: Dodanie kolumn dla CV i dokumentów pracownika
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', '..', 'data', 'komunikator.db');

const db = new sqlite3.Database(DB_PATH);

console.log('🚀 Migration 008: CV i Dokumenty pracownika');

const alterCommands = [
  `ALTER TABLE employee_profiles ADD COLUMN cv_file_url TEXT`,
  `ALTER TABLE employee_profiles ADD COLUMN cv_uploaded_at DATETIME`
];

let completed = 0;

alterCommands.forEach((sql, index) => {
  db.run(sql, (err) => {
    completed++;
    
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log(`⚠️  Kolumna już istnieje (${index + 1}/${alterCommands.length})`);
      } else {
        console.error(`❌ Błąd ${index + 1}/${alterCommands.length}:`, err.message);
      }
    } else {
      console.log(`✅ Dodano kolumnę (${index + 1}/${alterCommands.length})`);
    }
    
    if (completed === alterCommands.length) {
      // Utwórz tabelę dla dokumentów pracownika
      db.run(`
        CREATE TABLE IF NOT EXISTS employee_documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          document_type TEXT NOT NULL,
          document_name TEXT NOT NULL,
          file_url TEXT NOT NULL,
          uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          uploaded_by INTEGER,
          notes TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (uploaded_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Błąd tworzenia tabeli employee_documents:', err.message);
        } else {
          console.log('✅ Utworzono tabelę employee_documents');
        }
        
        db.close((err) => {
          if (err) {
            console.error('❌ Błąd zamykania bazy:', err);
          } else {
            console.log('\n✅ Migracja zakończona!');
          }
        });
      });
    }
  });
});
