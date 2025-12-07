const bcrypt = require('bcrypt');
const { getDatabase } = require('./database/init');

/**
 * Skrypt do dodania 3 mecenasów i 5 opiekunów do systemu
 */
async function seedLawyersAndCaretakers() {
    const db = getDatabase();
    
    console.log('🌱 === SEED: Mecenasi i Opiekunowie ===');
    
    // Domyślne hasło dla wszystkich kont testowych
    const defaultPassword = 'Test123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    // 3 Mecenasów (A, B, C)
    const lawyers = [
        {
            name: 'Mecenas A',
            email: 'mecenas.a@pro-meritum.pl',
            role: 'lawyer'
        },
        {
            name: 'Mecenas B',
            email: 'mecenas.b@pro-meritum.pl',
            role: 'lawyer'
        },
        {
            name: 'Mecenas C',
            email: 'mecenas.c@pro-meritum.pl',
            role: 'lawyer'
        }
    ];
    
    // 5 Opiekunów (A, B, C, D, E)
    const caretakers = [
        {
            name: 'Opiekun A',
            email: 'opiekun.a@pro-meritum.pl',
            role: 'caretaker'
        },
        {
            name: 'Opiekun B',
            email: 'opiekun.b@pro-meritum.pl',
            role: 'caretaker'
        },
        {
            name: 'Opiekun C',
            email: 'opiekun.c@pro-meritum.pl',
            role: 'caretaker'
        },
        {
            name: 'Opiekun D',
            email: 'opiekun.d@pro-meritum.pl',
            role: 'caretaker'
        },
        {
            name: 'Opiekun E',
            email: 'opiekun.e@pro-meritum.pl',
            role: 'caretaker'
        }
    ];
    
    // Recepcja
    const receptionists = [
        {
            name: 'Recepcja',
            email: 'recepcja@pro-meritum.pl',
            role: 'receptionist'
        }
    ];
    
    const allUsers = [...lawyers, ...caretakers, ...receptionists];
    
    // Sprawdź czy użytkownicy już istnieją
    const checkSql = 'SELECT email FROM users WHERE email = ?';
    const insertSql = `
        INSERT INTO users (name, email, password, role, is_active, created_at)
        VALUES (?, ?, ?, ?, 1, datetime('now'))
    `;
    
    let added = 0;
    let skipped = 0;
    
    for (const user of allUsers) {
        const existing = await new Promise((resolve, reject) => {
            db.get(checkSql, [user.email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (existing) {
            console.log(`⏭️  Pomijam (już istnieje): ${user.name} (${user.email})`);
            skipped++;
            continue;
        }
        
        await new Promise((resolve, reject) => {
            db.run(insertSql, [
                user.name,
                user.email,
                hashedPassword,
                user.role
            ], function(err) {
                if (err) {
                    console.error(`❌ Błąd dodawania ${user.name}:`, err);
                    reject(err);
                } else {
                    console.log(`✅ Dodano: ${user.name} (${user.email}) - ID: ${this.lastID}`);
                    added++;
                    resolve();
                }
            });
        });
    }
    
    console.log('\n📊 === PODSUMOWANIE ===');
    console.log(`✅ Dodano: ${added} użytkowników`);
    console.log(`⏭️  Pominięto (istnieją): ${skipped} użytkowników`);
    console.log(`👨‍⚖️ Mecenasi (lawyers): 3`);
    console.log(`👤 Opiekunowie (caretakers): 5`);
    console.log(`📞 Recepcja (receptionist): 1`);
    console.log(`🔑 Domyślne hasło dla wszystkich: ${defaultPassword}`);
    console.log('✅ === SEED ZAKOŃCZONY ===\n');
}

// Uruchom seed
seedLawyersAndCaretakers()
    .then(() => {
        console.log('🎉 Seed wykonany pomyślnie!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Błąd podczas seed:', err);
        process.exit(1);
    });
