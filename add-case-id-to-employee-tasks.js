const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'kancelaria.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Dodaję kolumnę case_id do employee_tasks w:', dbPath);

db.run(`ALTER TABLE employee_tasks ADD COLUMN case_id INTEGER`, (err) => {
  if (err) {
    if (err.message.includes('duplicate column')) {
      console.log('✅ Kolumna case_id już istnieje');
    } else {
      console.error('❌ Błąd:', err);
    }
  } else {
    console.log('✅ Kolumna case_id dodana do employee_tasks');
  }
  
  // Sprawdź strukturę
  db.all(`PRAGMA table_info(employee_tasks)`, (err2, cols) => {
    if (err2) {
      console.error('❌ Błąd sprawdzania struktury:', err2);
    } else {
      console.log('📋 Kolumny tabeli employee_tasks:');
      cols.forEach(col => console.log(`   - ${col.name} (${col.type})`));
    }
    db.close();
  });
});
