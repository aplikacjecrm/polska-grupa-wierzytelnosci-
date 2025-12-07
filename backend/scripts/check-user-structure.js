const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const DB_PATH = path.join(__dirname, '../database/kancelaria.db');
const db = new sqlite3.Database(DB_PATH);

console.log('🔍 DIAGNOSTYKA LOGOWANIA\n');

// 1. Struktura tabeli
console.log('📋 STRUKTURA TABELI USERS:');
db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
        console.error('❌ Błąd:', err);
        return;
    }
    
    console.log('\nKolumny:');
    columns.forEach(col => {
        console.log(`   - ${col.name} (${col.type})`);
    });
    
    // 2. Sprawdź użytkownika admin
    console.log('\n\n👤 SPRAWDZAM UŻYTKOWNIKA: admin@pro-meritum.pl');
    
    db.get('SELECT * FROM users WHERE email = ?', ['admin@pro-meritum.pl'], async (err, user) => {
        if (err) {
            console.error('❌ Błąd zapytania:', err);
            db.close();
            return;
        }
        
        if (!user) {
            console.log('❌ Użytkownik NIE ISTNIEJE!');
            console.log('\n💡 ROZWIĄZANIE: Uruchom create-employees.js');
            db.close();
            return;
        }
        
        console.log('✅ Użytkownik ISTNIEJE');
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   User_role: ${user.user_role}`);
        console.log(`   Is_active: ${user.is_active}`);
        console.log(`   Password hash: ${user.password ? user.password.substring(0, 20) + '...' : 'BRAK!'}`);
        
        // 3. Test hasła
        console.log('\n\n🔐 TEST WERYFIKACJI HASŁA:');
        const testPassword = 'admin123';
        
        try {
            const isValid = await bcrypt.compare(testPassword, user.password);
            
            if (isValid) {
                console.log(`✅ Hasło "${testPassword}" jest POPRAWNE!`);
            } else {
                console.log(`❌ Hasło "${testPassword}" jest NIEPOPRAWNE!`);
                console.log('\n💡 Możliwe przyczyny:');
                console.log('   1. Hasło w bazie jest inne');
                console.log('   2. Hash jest uszkodzony');
                console.log('   3. Hasło nie zostało zhaszowane przez bcrypt');
                
                // Test czy to jest plain text
                if (user.password === testPassword) {
                    console.log('\n⚠️  UWAGA: Hasło jest zapisane jako PLAIN TEXT (niezabezpieczone)!');
                }
            }
        } catch (bcryptError) {
            console.error('❌ Błąd bcrypt:', bcryptError.message);
            console.log('\n💡 Hash może być uszkodzony lub w złym formacie');
        }
        
        // 4. Pokaż wszystkich użytkowników
        console.log('\n\n📋 WSZYSCY UŻYTKOWNICY:');
        db.all('SELECT id, email, name, role, user_role, is_active FROM users ORDER BY id', (err, users) => {
            if (users && users.length > 0) {
                users.forEach(u => {
                    const roleDisplay = u.user_role || u.role || 'BRAK';
                    console.log(`   ${u.id}. ${u.email.padEnd(35)} | ${roleDisplay.padEnd(15)} | ${u.is_active ? '✅' : '❌'}`);
                });
            } else {
                console.log('   📭 Brak użytkowników');
            }
            
            db.close();
        });
    });
});
