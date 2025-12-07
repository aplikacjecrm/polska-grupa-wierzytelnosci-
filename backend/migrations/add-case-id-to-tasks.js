/**
 * Migracja: Dodanie kolumny case_id do employee_tasks
 */
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, '..', '..', 'data', 'komunikator.db');
console.log('📍 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Błąd otwierania bazy:', err);
    process.exit(1);
  }
  console.log('✅ Połączono z bazą danych');
});

// Sprawdź czy kolumna istnieje
db.all(`PRAGMA table_info(employee_tasks)`, [], (err, columns) => {
  if (err) {
    console.error('❌ Błąd:', err);
    db.close();
    process.exit(1);
  }
  
  const hasCaseId = columns.some(col => col.name === 'case_id');
  
  if (hasCaseId) {
    console.log('✅ Kolumna case_id już istnieje');
    db.close();
    process.exit(0);
  }
  
  // Dodaj kolumnę
  db.run(`ALTER TABLE employee_tasks ADD COLUMN case_id INTEGER`, (err) => {
    if (err) {
      console.error('❌ Błąd dodawania kolumny:', err);
    } else {
      console.log('✅ Dodano kolumnę case_id do employee_tasks');
    }
    
    // Dodaj też updated_at jeśli nie istnieje
    const hasUpdatedAt = columns.some(col => col.name === 'updated_at');
    if (!hasUpdatedAt) {
      db.run(`ALTER TABLE employee_tasks ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
        if (err) {
          console.error('❌ Błąd dodawania updated_at:', err);
        } else {
          console.log('✅ Dodano kolumnę updated_at do employee_tasks');
        }
        db.close();
      });
    } else {
      db.close();
    }
  });
});
