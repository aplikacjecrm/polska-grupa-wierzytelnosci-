/**
 * Skrypt do usunięcia użytkowników HR i Finance
 * Użytkownik powinien ich utworzyć normalnie przez Admin Dashboard
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/komunikator.db');

console.log('🗑️  Usuwanie użytkowników HR i Finance...');
console.log('📍 Baza:', DB_PATH);

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Błąd połączenia z bazą:', err);
    process.exit(1);
  }
  
  console.log('✅ Połączono z bazą danych\n');
  
  removeUsers();
});

async function removeUsers() {
  try {
    // Sprawdź czy użytkownicy istnieją
    const users = await new Promise((resolve, reject) => {
      db.all(`
        SELECT id, email, name, role, user_role 
        FROM users 
        WHERE email IN ('hr@promeritum.pl', 'finanse@promeritum.pl')
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    if (users.length === 0) {
      console.log('ℹ️  Brak użytkowników HR i Finance do usunięcia');
      db.close();
      return;
    }
    
    console.log('📋 Znaleziono użytkowników:');
    users.forEach(u => {
      console.log(`   - ID ${u.id}: ${u.name} (${u.email}) - rola: ${u.role || u.user_role}`);
    });
    console.log('');
    
    // Usuń profile pracowników
    for (const user of users) {
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM employee_profiles WHERE user_id = ?', [user.id], (err) => {
          if (err) reject(err);
          else {
            console.log(`✅ Usunięto profil dla: ${user.name}`);
            resolve();
          }
        });
      });
    }
    
    // Usuń użytkowników
    await new Promise((resolve, reject) => {
      db.run(`
        DELETE FROM users 
        WHERE email IN ('hr@promeritum.pl', 'finanse@promeritum.pl')
      `, (err) => {
        if (err) reject(err);
        else {
          console.log(`✅ Usunięto użytkowników HR i Finance`);
          resolve();
        }
      });
    });
    
    console.log('\n✅ Gotowe!');
    console.log('\n📝 INSTRUKCJA:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Teraz możesz utworzyć użytkowników HR i Finance normalnie:');
    console.log('');
    console.log('1. Zaloguj się jako Admin');
    console.log('2. Otwórz Admin Dashboard (⚙️)');
    console.log('3. Kliknij "👤 Dodaj użytkownika" w sekcji Szybkie akcje');
    console.log('4. Wypełnij formularz:');
    console.log('');
    console.log('   DZIAŁ HR:');
    console.log('   - Email: hr@promeritum.pl');
    console.log('   - Hasło: (ustaw własne, np. Hr123456!)');
    console.log('   - Imię i nazwisko: Dział HR');
    console.log('   - Rola: hr');
    console.log('   - Aktywny: ✓');
    console.log('');
    console.log('   DZIAŁ FINANSOWY:');
    console.log('   - Email: finanse@promeritum.pl');
    console.log('   - Hasło: (ustaw własne, np. Finanse123456!)');
    console.log('   - Imię i nazwisko: Dział Finansowy');
    console.log('   - Rola: finance');
    console.log('   - Aktywny: ✓');
    console.log('');
    console.log('5. Kliknij "Dodaj użytkownika"');
    console.log('6. Powtórz dla drugiego użytkownika');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    db.close();
    
  } catch (error) {
    console.error('❌ Błąd:', error);
    db.close();
    process.exit(1);
  }
}
