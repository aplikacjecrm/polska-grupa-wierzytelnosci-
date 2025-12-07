/**
 * Skrypt do tworzenia konta dla działu Payroll
 * Uruchom: node backend/scripts/create-payroll-user.js
 */

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH);

async function createPayrollUser() {
  console.log('📍 Database path:', DB_PATH);
  
  const payrollUser = {
    email: 'payroll@promeritum.pl',
    // Hasło: Payroll123!@# (hash bcrypt skopiowany z konta hr)
    password: '$2a$10$q8xQCHyDYWVJ7YF5vRWmZOQnL5cJz.R1qRz9mQQK8xfQvWxWvDxWy',
    first_name: 'Dział',
    last_name: 'Płacowy',
    role: 'payroll',
    position: 'Specjalista ds. płac',
    department: 'Payroll'
  };
  
  const hashedPassword = payrollUser.password;
  
  return new Promise((resolve, reject) => {
    // Sprawdź czy użytkownik już istnieje
    db.get('SELECT id FROM users WHERE email = ?', [payrollUser.email], (err, existing) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (existing) {
        console.log('⚠️ Użytkownik payroll już istnieje (ID:', existing.id, ')');
        resolve(existing.id);
        return;
      }
      
      // Utwórz nowego użytkownika
      db.run(`
        INSERT INTO users (email, password, first_name, last_name, role, position, department, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
      `, [
        payrollUser.email,
        hashedPassword,
        payrollUser.first_name,
        payrollUser.last_name,
        payrollUser.role,
        payrollUser.position,
        payrollUser.department
      ], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        const userId = this.lastID;
        
        // Utwórz profil pracownika
        db.run(`
          INSERT INTO employee_profiles (user_id, contract_type, created_at)
          VALUES (?, 'Umowa o pracę', datetime('now'))
        `, [userId], (err2) => {
          if (err2) {
            console.warn('⚠️ Nie udało się utworzyć profilu:', err2.message);
          }
          
          console.log('✅ Utworzono konto Payroll:');
          console.log('   📧 Email:', payrollUser.email);
          console.log('   🔑 Hasło:', payrollUser.password);
          console.log('   👤 Rola:', payrollUser.role);
          console.log('   🆔 ID:', userId);
          resolve(userId);
        });
      });
    });
  });
}

createPayrollUser()
  .then(() => {
    console.log('\n✅ Gotowe!');
    db.close();
  })
  .catch(err => {
    console.error('❌ Błąd:', err);
    db.close();
    process.exit(1);
  });
