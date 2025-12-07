const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/kancelaria.db');
const db = new sqlite3.Database(DB_PATH);

console.log('🗑️ RESET BAZY DANYCH - Usuwanie klientów i spraw\n');

db.serialize(() => {
    // 1. Usuń wszystkie sprawy
    db.run('DELETE FROM cases', (err) => {
        if (err) {
            console.error('❌ Błąd usuwania spraw:', err);
        } else {
            console.log('✅ Usunięto wszystkie sprawy');
        }
    });

    // 2. Usuń wszystkich klientów
    db.run('DELETE FROM clients', (err) => {
        if (err) {
            console.error('❌ Błąd usuwania klientów:', err);
        } else {
            console.log('✅ Usunięto wszystkich klientów');
        }
    });

    // 3. Usuń powiązane dane
    const relatedTables = [
        'events',
        'notes',
        'documents',
        'attachments',
        'witnesses',
        'evidence',
        'chat_messages',
        'case_tasks',
        'comments'
    ];

    relatedTables.forEach(table => {
        db.run(`DELETE FROM ${table}`, (err) => {
            if (err && !err.message.includes('no such table')) {
                console.error(`❌ Błąd usuwania z ${table}:`, err);
            } else {
                console.log(`✅ Wyczyszczono tabelę: ${table}`);
            }
        });
    });

    // 4. Resetuj auto_increment
    db.run('DELETE FROM sqlite_sequence WHERE name IN ("clients", "cases")', (err) => {
        if (err) {
            console.error('❌ Błąd resetowania auto_increment:', err);
        } else {
            console.log('✅ Zresetowano liczniki ID');
        }
    });

    // 5. Pokaż statystyki
    setTimeout(() => {
        db.all('SELECT COUNT(*) as count FROM users', (err, users) => {
            db.all('SELECT COUNT(*) as count FROM clients', (err, clients) => {
                db.all('SELECT COUNT(*) as count FROM cases', (err, cases) => {
                    console.log('\n📊 STATYSTYKI PO RESECIE:');
                    console.log(`   👥 Użytkownicy: ${users[0].count} (ZACHOWANE)`);
                    console.log(`   👤 Klienci: ${clients[0].count}`);
                    console.log(`   📋 Sprawy: ${cases[0].count}`);
                    console.log('\n✅ Reset zakończony!\n');
                    
                    db.close();
                    process.exit(0);
                });
            });
        });
    }, 1000);
});
