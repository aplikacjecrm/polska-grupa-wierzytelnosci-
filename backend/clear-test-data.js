/**
 * Skrypt do czyszczenia testowych danych HR
 * Usuwa: aktywności, logowania, zadania, oceny
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database/kancelaria.db');

console.log('🗑️ Czyszczenie testowych danych HR...');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Błąd połączenia z bazą:', err);
    process.exit(1);
  }
  
  console.log('✅ Połączono z bazą danych');
  
  // Usuń wszystkie testowe dane
  db.serialize(() => {
    console.log('🗑️ Usuwam aktywności...');
    db.run('DELETE FROM employee_activity_logs', (err) => {
      if (err) console.error('❌ Błąd usuwania employee_activity_logs:', err);
      else console.log('✅ Wyczyszczono employee_activity_logs');
    });
    
    console.log('🗑️ Usuwam sesje logowania...');
    db.run('DELETE FROM login_sessions', (err) => {
      if (err) console.error('❌ Błąd usuwania login_sessions:', err);
      else console.log('✅ Wyczyszczono login_sessions');
    });
    
    console.log('🗑️ Usuwam zadania...');
    db.run('DELETE FROM employee_tasks', (err) => {
      if (err) console.error('❌ Błąd usuwania employee_tasks:', err);
      else console.log('✅ Wyczyszczono employee_tasks');
    });
    
    console.log('🗑️ Usuwam oceny...');
    db.run('DELETE FROM employee_reviews', (err) => {
      if (err) console.error('❌ Błąd usuwania employee_reviews:', err);
      else console.log('✅ Wyczyszczono employee_reviews');
    });
    
    // Resetuj auto-increment
    console.log('🔄 Resetuję liczniki...');
    db.run("DELETE FROM sqlite_sequence WHERE name IN ('employee_activity_logs', 'login_sessions', 'employee_tasks', 'employee_reviews')", (err) => {
      if (err) console.error('❌ Błąd resetowania liczników:', err);
      else console.log('✅ Zresetowano liczniki auto-increment');
      
      console.log('\n🎉 Czyszczenie zakończone! Testowe dane HR zostały usunięte.');
      console.log('📊 Teraz system będzie zbierał tylko REALNE dane od pracowników.');
      
      db.close((err) => {
        if (err) console.error('❌ Błąd zamykania bazy:', err);
        else console.log('✅ Połączenie z bazą zamknięte');
        process.exit(0);
      });
    });
  });
});
