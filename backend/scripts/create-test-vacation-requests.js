/**
 * Skrypt do tworzenia testowych wniosków urlopowych
 * Tworzy przykładowe wnioski dla różnych pracowników
 */

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '../../data/komunikator.db');

console.log('🚀 Tworzenie testowych wniosków urlopowych...');
console.log('📍 Baza danych:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Błąd połączenia z bazą:', err);
    process.exit(1);
  }
  console.log('✅ Połączono z bazą danych');
});

// Funkcja do obliczania dni roboczych
function calculateWorkDays(startDate, endDate) {
  let days = 0;
  let current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Nie niedziela i nie sobota
      days++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

async function createTestData() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Pobierz użytkowników (pomijając HR i admin)
      db.all(`
        SELECT id, name, email 
        FROM users 
        WHERE role NOT IN ('admin', 'hr') 
        AND email NOT IN ('hr@promeritum.pl', 'admin@promeritum.pl')
        LIMIT 5
      `, (err, users) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (users.length === 0) {
          console.log('⚠️ Brak pracowników w bazie! Tworzę testowego pracownika...');
          
          // Utwórz testowego pracownika
          db.run(`
            INSERT INTO users (email, password_hash, name, role, is_active, created_at)
            VALUES ('jan.kowalski@promeritum.pl', '$2a$10$test', 'Jan Kowalski', 'employee', 1, datetime('now'))
          `, function(err) {
            if (err) {
              console.error('❌ Błąd tworzenia testowego użytkownika:', err);
              reject(err);
              return;
            }
            
            const userId = this.lastID;
            console.log('✅ Utworzono testowego pracownika: Jan Kowalski (ID: ' + userId + ')');
            
            // Utwórz saldo urlopowe dla testowego pracownika
            db.run(`
              INSERT INTO employee_vacation_balance (employee_id, year, annual_days, occasional_days, used_annual_days, used_occasional_days)
              VALUES (?, 2025, 26, 4, 0, 0)
            `, [userId], (err) => {
              if (err) console.log('⚠️ Saldo urlopowe już istnieje lub błąd:', err.message);
            });
            
            users = [{ id: userId, name: 'Jan Kowalski', email: 'jan.kowalski@promeritum.pl' }];
            createVacationRequests(users, resolve, reject);
          });
        } else {
          console.log(`✅ Znaleziono ${users.length} pracowników`);
          
          // Upewnij się że mają saldo urlopowe
          users.forEach(user => {
            db.run(`
              INSERT OR IGNORE INTO employee_vacation_balance (employee_id, year, annual_days, occasional_days, used_annual_days, used_occasional_days)
              VALUES (?, 2025, 26, 4, 0, 0)
            `, [user.id]);
          });
          
          createVacationRequests(users, resolve, reject);
        }
      });
    });
  });
}

function createVacationRequests(users, resolve, reject) {
  const vacationTypes = [
    { type: 'annual', days: 5, notes: 'Wakacje z rodziną' },
    { type: 'annual', days: 3, notes: 'Długi weekend' },
    { type: 'occasional', days: 1, notes: 'Sprawy osobiste' },
    { type: 'annual', days: 10, notes: 'Urlop wypoczynkowy - góry' },
    { type: 'sick', days: 2, notes: 'Zwolnienie lekarskie' }
  ];
  
  const today = new Date();
  let ticketsCreated = 0;
  let vacationsCreated = 0;
  let completed = 0;
  const total = Math.min(users.length, 3); // Max 3 wnioski testowe
  
  for (let i = 0; i < total; i++) {
    const user = users[i % users.length];
    const vacation = vacationTypes[i % vacationTypes.length];
    
    // Ustaw daty (za 2 tygodnie + i dni)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 14 + (i * 7));
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + vacation.days - 1);
    
    const daysCount = calculateWorkDays(startDate, endDate);
    
    // Format dat dla SQL
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    console.log(`\n📝 Tworzę wniosek ${i + 1}/${total}:`);
    console.log(`   Pracownik: ${user.name}`);
    console.log(`   Typ: ${vacation.type}`);
    console.log(`   Daty: ${startDateStr} - ${endDateStr}`);
    console.log(`   Dni robocze: ${daysCount}`);
    
    // 1. Utwórz ticket
    db.run(`
      INSERT INTO tickets (user_id, title, description, priority, status, category, created_at)
      VALUES (?, ?, ?, 'high', 'open', 'hr_vacation', datetime('now'))
    `, [
      user.id,
      `Wniosek urlopowy: ${vacation.type === 'annual' ? 'Urlop wypoczynkowy' : vacation.type} (${daysCount} dni)`,
      `Od: ${startDateStr}\nDo: ${endDateStr}\nLiczba dni: ${daysCount}\n\nUwagi: ${vacation.notes}`
    ], function(err) {
      if (err) {
        console.error('❌ Błąd tworzenia ticketu:', err);
        return;
      }
      
      const ticketId = this.lastID;
      ticketsCreated++;
      console.log(`   ✅ Ticket utworzony (ID: ${ticketId})`);
      
      // 2. Utwórz wpis urlopowy
      db.run(`
        INSERT INTO employee_vacations (employee_id, vacation_type, start_date, end_date, days_count, notes, ticket_id, status, request_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
      `, [
        user.id,
        vacation.type,
        startDateStr,
        endDateStr,
        daysCount,
        vacation.notes,
        ticketId
      ], function(err) {
        if (err) {
          console.error('❌ Błąd tworzenia wniosku urlopowego:', err);
        } else {
          vacationsCreated++;
          console.log(`   ✅ Wniosek urlopowy utworzony (ID: ${this.lastID})`);
        }
        
        completed++;
        if (completed === total) {
          console.log(`\n🎉 GOTOWE!`);
          console.log(`✅ Utworzono ${ticketsCreated} ticketów`);
          console.log(`✅ Utworzono ${vacationsCreated} wniosków urlopowych`);
          console.log(`\n📋 Teraz możesz:`);
          console.log(`   1. Zalogować się jako HR (hr@promeritum.pl)`);
          console.log(`   2. Otworzyć http://localhost:3500/hr-panel.html`);
          console.log(`   3. Zobaczyć i zatwierdzić wnioski!\n`);
          
          db.close((err) => {
            if (err) console.error('❌ Błąd zamykania bazy:', err);
            else console.log('✅ Zamknięto połączenie z bazą');
            resolve();
            process.exit(0);
          });
        }
      });
    });
  }
}

createTestData().catch(err => {
  console.error('❌ Błąd:', err);
  db.close();
  process.exit(1);
});
