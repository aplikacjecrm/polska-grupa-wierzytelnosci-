const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'komunikator.db');
console.log('📍 Sprawdzam bazę:', DB_PATH);

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  // Sprawdź użytkowników
  db.all("SELECT id, email, user_role, name FROM users", (err, rows) => {
    if (err) {
      console.error('❌ Błąd users:', err);
    } else {
      console.log('\n👤 UŻYTKOWNICY:');
      rows.forEach(row => {
        console.log(`  - ID: ${row.id}, Email: ${row.email}, Rola: ${row.user_role}, Nazwa: ${row.name}`);
      });
    }
  });
  
  // Sprawdź klientów
  db.all("SELECT id, first_name, last_name, email, status FROM clients LIMIT 5", (err, rows) => {
    if (err) {
      console.error('❌ Błąd clients:', err);
    } else {
      console.log('\n👥 KLIENCI (pierwsze 5):');
      rows.forEach(row => {
        console.log(`  - ID: ${row.id}, Imię: ${row.first_name} ${row.last_name}, Email: ${row.email}, Status: ${row.status}`);
      });
    }
  });
  
  // Sprawdź sprawy
  db.all("SELECT id, title, case_number, status FROM cases LIMIT 5", (err, rows) => {
    if (err) {
      console.error('❌ Błąd cases:', err);
    } else {
      console.log('\n📁 SPRAWY (pierwsze 5):');
      rows.forEach(row => {
        console.log(`  - ID: ${row.id}, Numer: ${row.case_number}, Tytuł: ${row.title}, Status: ${row.status}`);
      });
    }
    db.close();
  });
});
