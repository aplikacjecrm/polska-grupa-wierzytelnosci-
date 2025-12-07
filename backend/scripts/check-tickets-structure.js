const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '../../data/komunikator.db');
const db = new sqlite3.Database(dbPath);

db.all("PRAGMA table_info(tickets)", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Struktura tabeli tickets:');
    rows.forEach(col => {
      console.log(`  ${col.name} (${col.type})`);
    });
  }
  db.close();
});
