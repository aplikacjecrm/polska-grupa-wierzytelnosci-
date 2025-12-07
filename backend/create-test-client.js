const { getDatabase } = require('./database/init');
const bcrypt = require('bcrypt');

async function createTestClient() {
  const db = getDatabase();
  
  const email = 'klient@test.pl';
  const password = 'test123';
  const name = 'Klient Testowy';
  const role = 'client';
  
  try {
    // Sprawdź czy użytkownik już istnieje
    const existing = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (existing) {
      console.log('⚠️  Użytkownik już istnieje!');
      console.log('Email:', email);
      console.log('Hasło:', password);
      process.exit(0);
    }
    
    // Hashuj hasło
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Dodaj użytkownika
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, role],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    
    console.log('✅ Konto klienta utworzone!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', email);
    console.log('Hasło:', password);
    console.log('Rola:', role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Błąd:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

createTestClient();
