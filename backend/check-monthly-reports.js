const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database/kancelaria.db');
console.log('📍 DB PATH:', DB_PATH);

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Błąd połączenia z bazą:', err);
    process.exit(1);
  }
  
  console.log('✅ Połączono z bazą danych\n');
  
  // Sprawdź czy tabela monthly_reports istnieje
  db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='monthly_reports'`, (err, row) => {
    if (err) {
      console.error('❌ Błąd zapytania:', err);
    } else if (row) {
      console.log('✅ Tabela monthly_reports istnieje\n');
      
      // Pokaż strukturę tabeli
      db.all(`PRAGMA table_info(monthly_reports)`, (err, columns) => {
        if (err) {
          console.error('❌ Błąd pobierania struktury:', err);
        } else {
          console.log('📋 Struktura tabeli monthly_reports:');
          columns.forEach(col => {
            console.log(`  - ${col.name} (${col.type})`);
          });
          console.log('');
        }
        
        // Pokaż liczbę rekordów
        db.get(`SELECT COUNT(*) as count FROM monthly_reports`, (err, result) => {
          if (err) {
            console.error('❌ Błąd liczenia rekordów:', err);
          } else {
            console.log(`📊 Liczba raportów w bazie: ${result.count}\n`);
            
            // Pokaż przykładowe rekordy
            if (result.count > 0) {
              db.all(`SELECT * FROM monthly_reports ORDER BY report_year DESC, report_month DESC LIMIT 3`, (err, reports) => {
                if (err) {
                  console.error('❌ Błąd pobierania raportów:', err);
                } else {
                  console.log('📁 Przykładowe raporty:');
                  reports.forEach(r => {
                    console.log(`  ${r.report_year}-${String(r.report_month).padStart(2, '0')} | User ${r.user_id} | ${r.total_work_hours}h`);
                  });
                }
                
                db.close();
              });
            } else {
              db.close();
            }
          }
        });
      });
    } else {
      console.log('❌ Tabela monthly_reports NIE ISTNIEJE!');
      console.log('💡 Uruchom migrację: node backend/migrations/005-monthly-reports.js');
      db.close();
    }
  });
});
