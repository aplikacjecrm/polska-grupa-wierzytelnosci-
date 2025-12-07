// Wymuszenie utworzenia tabel attachments i documents
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'kancelaria.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 WYMUSZAM UTWORZENIE TABEL...\n');

db.serialize(() => {
  // Tabela attachments
  console.log('📎 Tworzę tabelę attachments...');
  db.run(`
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      attachment_code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      file_type TEXT,
      category TEXT,
      uploaded_by INTEGER NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('❌ Błąd:', err);
    else console.log('✅ Tabela attachments utworzona');
  });

  // Tabela documents
  console.log('📄 Tworzę tabelę documents...');
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_number TEXT UNIQUE NOT NULL,
      case_id INTEGER,
      client_id INTEGER,
      comment_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      file_size INTEGER,
      file_type TEXT,
      category TEXT DEFAULT 'general',
      uploaded_by INTEGER NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('❌ Błąd:', err);
    else console.log('✅ Tabela documents utworzona');
    
    db.close(() => {
      console.log('\n🎉 GOTOWE!');
      process.exit(0);
    });
  });
});
