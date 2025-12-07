/**
 * Skrypt do tworzenia kont użytkowników HR i Finance
 * Uruchom: node backend/scripts/create-hr-finance-users.js
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/komunikator.db');

console.log('👥 Tworzenie kont HR i Finance...');
console.log('📍 Baza:', DB_PATH);

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Błąd połączenia z bazą:', err);
    process.exit(1);
  }
  
  console.log('✅ Połączono z bazą danych\n');
  
  createUsers();
});

async function createUsers() {
  try {
    // Dane użytkowników do utworzenia
    const users = [
      {
        email: 'hr@promeritum.pl',
        password: 'Hr123!@#',
        name: 'Dział HR',
        role: 'hr',
        initials: 'HR'
      },
      {
        email: 'finanse@promeritum.pl',
        password: 'Finanse123!@#',
        name: 'Dział Finansowy',
        role: 'finance',
        initials: 'FIN'
      }
    ];
    
    for (const user of users) {
      await createUser(user);
    }
    
    console.log('\n✅ Wszystkie konta utworzone!');
    console.log('\n📋 Dane logowania:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 DZIAŁ HR:');
    console.log('   Email: hr@promeritum.pl');
    console.log('   Hasło: Hr123!@#');
    console.log('   Rola: hr');
    console.log('');
    console.log('💰 DZIAŁ FINANSOWY:');
    console.log('   Email: finanse@promeritum.pl');
    console.log('   Hasło: Finanse123!@#');
    console.log('   Rola: finance');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    db.close();
    
  } catch (error) {
    console.error('❌ Błąd tworzenia użytkowników:', error);
    db.close();
    process.exit(1);
  }
}

function createUser(userData) {
  return new Promise(async (resolve, reject) => {
    try {
      // Sprawdź czy użytkownik już istnieje
      db.get('SELECT id, email FROM users WHERE email = ?', [userData.email], async (err, existing) => {
        if (err) {
          return reject(err);
        }
        
        if (existing) {
          console.log(`⚠️  ${userData.name} już istnieje (${userData.email})`);
          return resolve(existing.id);
        }
        
        // Hashuj hasło
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        // Utwórz użytkownika
        db.run(`
          INSERT INTO users (
            email, password, name, user_role, role, initials, 
            is_active, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, 1, 'online', datetime('now'))
        `, [
          userData.email,
          hashedPassword,
          userData.name,
          userData.role,
          userData.role,
          userData.initials
        ], function(err) {
          if (err) {
            console.error(`❌ Błąd tworzenia ${userData.name}:`, err.message);
            return reject(err);
          }
          
          const userId = this.lastID;
          console.log(`✅ ${userData.name} utworzony (ID: ${userId})`);
          
          // Utwórz profil pracownika
          db.run(`
            INSERT INTO employee_profiles (
              user_id, position, department, hire_date, created_at, updated_at
            ) VALUES (?, ?, ?, date('now'), datetime('now'), datetime('now'))
          `, [
            userId,
            userData.role === 'hr' ? 'Specjalista HR' : 'Specjalista Finansowy',
            userData.role === 'hr' ? 'Dział Kadr i Płac' : 'Dział Finansowy'
          ], (err) => {
            if (err) {
              console.warn(`⚠️  Nie udało się utworzyć profilu dla ${userData.name}`);
            } else {
              console.log(`   📋 Profil pracownika utworzony`);
            }
            
            resolve(userId);
          });
        });
      });
      
    } catch (error) {
      reject(error);
    }
  });
}
