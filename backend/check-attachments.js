const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', 'data', 'komunikator.db');
console.log('DB:', DB_PATH);

const db = new sqlite3.Database(DB_PATH);

// Sprawdź załączniki dowodów
db.all("SELECT * FROM attachments WHERE entity_type = 'evidence'", (err, rows) => {
  if (err) {
    console.error('Błąd:', err.message);
  } else {
    console.log('\n📎 Załączniki dowodów:', rows.length);
    rows.forEach(r => {
      console.log(`  - ID: ${r.id}, Entity: ${r.entity_id}, File: ${r.filename || r.file_name}, Size: ${r.filesize || r.file_size}`);
    });
  }
  
  // Sprawdź wszystkie załączniki
  db.all("SELECT * FROM attachments LIMIT 10", (err2, all) => {
    if (err2) {
      console.error('Błąd:', err2.message);
    } else {
      console.log('\n📂 Wszystkie załączniki:', all.length);
      all.forEach(r => {
        console.log(`  - ID: ${r.id}, Type: ${r.entity_type}, Entity: ${r.entity_id}`);
      });
    }
    db.close();
  });
});
