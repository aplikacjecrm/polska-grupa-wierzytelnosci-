const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Użyj tej samej ścieżki co backend
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/komunikator.db');

// Upewnij się że katalog istnieje
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

async function createAdmin() {
    const adminEmail = 'admin@pro-meritum.pl';
    const adminPassword = 'admin123';
    const adminName = 'Administrator';
    
    try {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        db.run(
            `INSERT OR REPLACE INTO users (email, password, name, role, status) 
             VALUES (?, ?, ?, 'admin', 'offline')`,
            [adminEmail, hashedPassword, adminName],
            function(err) {
                if (err) {
                    console.error('❌ Błąd tworzenia admina:', err);
                } else {
                    console.log('✅ Konto administratora utworzone!');
                    console.log('📧 Email: admin@pro-meritum.pl');
                    console.log('🔒 Hasło: admin123');
                    console.log('\n🎯 Możesz się teraz zalogować!');
                }
                db.close();
            }
        );
    } catch (error) {
        console.error('❌ Błąd:', error);
        db.close();
    }
}

createAdmin();
