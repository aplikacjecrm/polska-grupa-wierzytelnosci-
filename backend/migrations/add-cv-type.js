const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/komunikator.db');
console.log('📍 Using database:', dbPath);

const db = new sqlite3.Database(dbPath);

// SQLite nie pozwala na modyfikację CHECK constraint, więc musimy:
// 1. Utworzyć nową tabelę z rozszerzonym CHECK
// 2. Skopiować dane
// 3. Usunąć starą tabelę
// 4. Zmienić nazwę nowej

db.serialize(() => {
  // Krok 1: Utwórz nową tabelę z 'cv' w CHECK constraint
  db.run(`
    CREATE TABLE IF NOT EXISTS employee_documents_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      document_type TEXT NOT NULL CHECK(document_type IN ('contract', 'annex', 'certificate', 'diploma', 'id_card', 'medical_exam', 'safety_training', 'nda', 'cv', 'other')),
      title TEXT NOT NULL,
      description TEXT,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      issue_date DATE,
      expiry_date DATE,
      is_confidential BOOLEAN DEFAULT 0,
      requires_renewal BOOLEAN DEFAULT 0,
      uploaded_by INTEGER NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ticket_id INTEGER REFERENCES tickets(id),
      issuer TEXT,
      is_verified INTEGER DEFAULT 0,
      verified_by INTEGER,
      verified_at DATETIME,
      FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.log('❌ Error creating new table:', err.message);
      return;
    }
    console.log('✅ New table created');
  });

  // Krok 2: Skopiuj dane
  db.run(`
    INSERT INTO employee_documents_new 
    SELECT id, employee_id, document_type, title, description, file_path, file_name, 
           file_size, mime_type, issue_date, expiry_date, is_confidential, requires_renewal,
           uploaded_by, uploaded_at, updated_at, ticket_id, issuer, is_verified, verified_by, verified_at
    FROM employee_documents
  `, (err) => {
    if (err) {
      console.log('❌ Error copying data:', err.message);
      return;
    }
    console.log('✅ Data copied');
  });

  // Krok 3: Usuń starą tabelę
  db.run(`DROP TABLE employee_documents`, (err) => {
    if (err) {
      console.log('❌ Error dropping old table:', err.message);
      return;
    }
    console.log('✅ Old table dropped');
  });

  // Krok 4: Zmień nazwę nowej tabeli
  db.run(`ALTER TABLE employee_documents_new RENAME TO employee_documents`, (err) => {
    if (err) {
      console.log('❌ Error renaming table:', err.message);
      return;
    }
    console.log('✅ Table renamed - CV type added!');
    
    db.close();
  });
});
