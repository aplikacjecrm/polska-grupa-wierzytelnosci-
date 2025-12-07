const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const DB_PATH = path.join(__dirname, '../database/kancelaria.db');
const db = new sqlite3.Database(DB_PATH);

console.log('👥 TWORZENIE KONT PRACOWNICZYCH\n');

const employees = [
    // 2x Admin
    { email: 'admin@pro-meritum.pl', name: 'Admin Główny', role: 'admin', password: 'Admin@123' },
    { email: 'admin2@pro-meritum.pl', name: 'Admin Pomocniczy', role: 'admin', password: 'Admin@456' },
    
    // 5x Mecenas
    { email: 'mecenas.a@pro-meritum.pl', name: 'Mecenas Anna Kowalska', role: 'lawyer', password: 'Mecenas@123' },
    { email: 'mecenas.b@pro-meritum.pl', name: 'Mecenas Bartosz Nowak', role: 'lawyer', password: 'Mecenas@456' },
    { email: 'mecenas.c@pro-meritum.pl', name: 'Mecenas Celina Wiśniewska', role: 'lawyer', password: 'Mecenas@789' },
    { email: 'mecenas.d@pro-meritum.pl', name: 'Mecenas Damian Wójcik', role: 'lawyer', password: 'Mecenas@012' },
    { email: 'mecenas.e@pro-meritum.pl', name: 'Mecenas Elżbieta Kamińska', role: 'lawyer', password: 'Mecenas@345' },
    
    // 5x Opiekun sprawy
    { email: 'opiekun1@pro-meritum.pl', name: 'Jan Kowalczyk', role: 'case_manager', password: 'Opiekun@111' },
    { email: 'opiekun2@pro-meritum.pl', name: 'Maria Lewandowska', role: 'case_manager', password: 'Opiekun@222' },
    { email: 'opiekun3@pro-meritum.pl', name: 'Piotr Zieliński', role: 'case_manager', password: 'Opiekun@333' },
    { email: 'opiekun4@pro-meritum.pl', name: 'Katarzyna Szymańska', role: 'case_manager', password: 'Opiekun@444' },
    { email: 'opiekun5@pro-meritum.pl', name: 'Tomasz Woźniak', role: 'case_manager', password: 'Opiekun@555' },
    
    // 2x Recepcja
    { email: 'recepcja1@pro-meritum.pl', name: 'Agnieszka Mazur', role: 'case_manager', password: 'Recepcja@111' },
    { email: 'recepcja2@pro-meritum.pl', name: 'Monika Krawczyk', role: 'case_manager', password: 'Recepcja@222' }
];

let created = 0;
let skipped = 0;

db.serialize(() => {
    employees.forEach((emp, index) => {
        // Hashuj hasło
        const hashedPassword = bcrypt.hashSync(emp.password, 10);
        
        // Sprawdź czy użytkownik już istnieje
        db.get('SELECT id FROM users WHERE email = ?', [emp.email], (err, row) => {
            if (row) {
                console.log(`⏭️  Pomijam ${emp.email} (już istnieje)`);
                skipped++;
            } else {
                // Dodaj użytkownika
                db.run(`
                    INSERT INTO users (email, password, name, role, user_role, is_active, created_at)
                    VALUES (?, ?, ?, ?, ?, 1, datetime('now'))
                `, [emp.email, hashedPassword, emp.name, emp.role, emp.role], function(err) {
                    if (err) {
                        console.error(`❌ Błąd tworzenia ${emp.email}:`, err.message);
                    } else {
                        created++;
                        console.log(`✅ Utworzono: ${emp.name} (${emp.email})`);
                    }
                });
            }
            
            // Po ostatnim - pokaż podsumowanie
            if (index === employees.length - 1) {
                setTimeout(() => {
                    console.log('\n📊 PODSUMOWANIE:');
                    console.log(`   ✅ Utworzono: ${created}`);
                    console.log(`   ⏭️  Pominięto: ${skipped}`);
                    console.log(`   📝 Razem: ${employees.length}\n`);
                    
                    console.log('📋 LISTA LOGINÓW:\n');
                    employees.forEach(emp => {
                        const roleLabel = {
                            'admin': '👑 Admin',
                            'lawyer': '👔 Mecenas',
                            'case_manager': '📋 Opiekun'
                        }[emp.role];
                        
                        console.log(`${roleLabel.padEnd(15)} | ${emp.email.padEnd(35)} | ${emp.password}`);
                    });
                    
                    console.log('\n💾 Możesz skopiować te dane do pliku tekstowego!\n');
                    
                    db.close();
                    process.exit(0);
                }, 2000);
            }
        });
    });
});
