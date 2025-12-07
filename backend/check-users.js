const { getDatabase } = require('./database/init');

const db = getDatabase();

db.all('SELECT id, email, name, role FROM users', [], (err, rows) => {
  if (err) {
    console.error('Błąd:', err);
    process.exit(1);
  }
  
  console.log('📋 Użytkownicy w bazie danych:');
  console.table(rows);
  
  process.exit(0);
});
