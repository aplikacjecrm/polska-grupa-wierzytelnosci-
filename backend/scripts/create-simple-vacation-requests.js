/**
 * Uproszczony skrypt - tworzy tylko wnioski urlopowe (bez ticketów na razie)
 */

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '../../data/komunikator.db');

console.log('🚀 Tworzenie testowych wniosków urlopowych...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Błąd:', err);
    process.exit(1);
  }
  console.log('✅ Połączono z bazą');
});

db.serialize(() => {
  // Pobierz pracowników
  db.all(`SELECT id, name, email FROM users WHERE role NOT IN ('admin', 'hr') LIMIT 3`, (err, users) => {
    if (err) {
      console.error('❌ Błąd:', err);
      db.close();
      return;
    }
    
    console.log(`✅ Znaleziono ${users.length} pracowników\n`);
    
    if (users.length === 0) {
      console.log('⚠️  Brak pracowników! Zakończono.');
      db.close();
      return;
    }
    
    let created = 0;
    const total = Math.min(users.length, 3);
    
    users.slice(0, 3).forEach((user, i) => {
      // Ustaw saldo urlopowe jeśli nie istnieje
      db.run(`
        INSERT OR IGNORE INTO employee_vacation_balance 
        (employee_id, year, annual_days, occasional_days, used_annual_days, used_occasional_days)
        VALUES (?, 2025, 26, 4, 0, 0)
      `, [user.id]);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 14 + (i * 7));
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (i + 2));
      
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      const days = i + 3;
      
      const types = ['annual', 'annual', 'occasional'];
      const notes = [
        'Wakacje z rodziną',
        'Długi weekend - majówka',
        'Sprawy osobiste'
      ];
      
      console.log(`📝 Wniosek ${i + 1}/${total}:`);
      console.log(`   ${user.name} (${user.email})`);
      console.log(`   Typ: ${types[i]}`);
      console.log(`   Daty: ${startStr} - ${endStr}`);
      console.log(`   Dni: ${days}`);
      
      db.run(`
        INSERT INTO employee_vacations 
        (employee_id, vacation_type, start_date, end_date, days_count, notes, status, request_date)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
      `, [user.id, types[i], startStr, endStr, days, notes[i]], function(err) {
        if (err) {
          console.error(`   ❌ Błąd: ${err.message}`);
        } else {
          console.log(`   ✅ Utworzono (ID: ${this.lastID})\n`);
        }
        
        created++;
        if (created === total) {
          console.log('🎉 GOTOWE!');
          console.log('\n📋 TERAZ:');
          console.log('   1. Zaloguj się jako: hr@promeritum.pl');
          console.log('   2. Otwórz: http://localhost:3500/hr-panel.html');
          console.log('   3. Zobaczysz wnioski do zatwierdzenia!\n');
          db.close();
        }
      });
    });
  });
});
