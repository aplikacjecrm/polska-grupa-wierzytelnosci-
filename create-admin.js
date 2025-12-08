// Skrypt do utworzenia pierwszego admina
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'database', 'kancelaria.db');
const db = new sqlite3.Database(dbPath);

async function createAdmin() {
    console.log('🔧 Tworzenie admina...\n');
    
    // Dane admina
    const email = 'admin@pro-meritum.pl';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Sprawdź czy admin już istnieje
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, existing) => {
        if (err) {
            console.error('❌ Błąd:', err);
            db.close();
            return;
        }
        
        if (existing) {
            console.log('✅ Admin już istnieje!');
            console.log(`📧 Email: ${email}`);
            console.log(`🔑 Hasło: admin123`);
            db.close();
            return;
        }
        
        // Utwórz admina
        db.run(`
            INSERT INTO users (email, password, role, name, active)
            VALUES (?, ?, ?, ?, ?)
        `, [email, hashedPassword, 'admin', 'Administrator', 1], function(err) {
            if (err) {
                console.error('❌ Błąd tworzenia:', err);
                db.close();
                return;
            }
            
            console.log('✅ Admin utworzony!');
            console.log('\n📋 DANE LOGOWANIA:');
            console.log('═══════════════════════════════════');
            console.log(`📧 Email: ${email}`);
            console.log(`🔑 Hasło: ${password}`);
            console.log('═══════════════════════════════════\n');
            console.log('🌐 Zaloguj się na: https://web-production-ef868.up.railway.app');
            
            db.close();
        });
    });
}

createAdmin();
