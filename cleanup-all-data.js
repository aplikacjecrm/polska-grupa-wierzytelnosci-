// CLEANUP SCRIPT - Czyści WSZYSTKIE dane użytkownika (sprawy, dokumenty, klienty)
// ALE zachowuje strukturę i konta użytkowników!

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'data', 'komunikator.db');

console.log('🧹 CLEANUP - Czyszczę WSZYSTKIE dane użytkownika...\n');

// 1. BACKUP najpierw!
const backupPath = path.join(__dirname, 'data', `backup_before_cleanup_${Date.now()}.db`);
console.log('📦 Tworzę backup:', backupPath);
fs.copyFileSync(dbPath, backupPath);
console.log('✅ Backup utworzony!\n');

const db = new sqlite3.Database(dbPath);

// Tabele do wyczyszczenia (TYLKO DANE, nie struktura!)
const tablesToClean = [
    'documents',           // Dokumenty
    'attachments',         // Załączniki
    'cases',              // Sprawy
    'clients',            // Klienci
    'client_notes',       // Notatki klientów
    'client_files',       // Pliki klientów
    'case_events',        // Wydarzenia spraw
    'case_comments',      // Komentarze
    'witnesses',          // Świadkowie
    'evidence',           // Dowody
    'scenarios',          // Scenariusze
    'opposing_party',     // Strony przeciwne
    'case_permissions'    // Uprawnienia
];

// NIE CZYŚCIMY (ZACHOWUJEMY):
// - users (konta użytkowników)
// - login_sessions (sesje)
// - employee_profiles (profile pracowników)
// - payments (płatności) ✅
// - employee_tasks (zadania) ✅
// - employee_reviews (oceny) ✅
// - activity_logs (ważne logi z terminami) ✅

console.log('🗑️ Czyszczę tabele:');
tablesToClean.forEach(table => console.log(`   - ${table}`));
console.log('');

console.log('💾 ZACHOWUJĘ:');
console.log('   - users (konta)');
console.log('   - login_sessions');
console.log('   - employee_profiles');
console.log('');

// Funkcja do czyszczenia tabeli
function cleanTable(tableName) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM ${tableName}`, (err) => {
            if (err) {
                // Tabela może nie istnieć - to OK
                console.log(`⚠️  ${tableName}: Nie istnieje lub błąd -`, err.message);
                resolve();
            } else {
                console.log(`✅ ${tableName}: Wyczyszczona`);
                resolve();
            }
        });
    });
}

// Czyść wszystkie tabele po kolei
async function cleanup() {
    try {
        for (const table of tablesToClean) {
            await cleanTable(table);
        }
        
        // Reset sequences (auto-increment)
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM sqlite_sequence WHERE name IN (' + 
                   tablesToClean.map(t => `'${t}'`).join(',') + ')', 
                   (err) => {
                       if (err) console.log('⚠️  sqlite_sequence: Nie istnieje');
                       else console.log('✅ sqlite_sequence: Zresetowana');
                       resolve();
                   });
        });
        
        console.log('\n🎉 GOTOWE! Baza danych wyczyszczona!');
        console.log('');
        console.log('📊 CO ZOSTAŁO:');
        
        // Sprawdź co zostało
        db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
            if (!err) console.log(`   ✅ Users: ${row.count} kont`);
        });
        
        db.get('SELECT COUNT(*) as count FROM cases', (err, row) => {
            if (!err) console.log(`   ✅ Cases: ${row.count} spraw (powinno być 0)`);
        });
        
        db.get('SELECT COUNT(*) as count FROM documents', (err, row) => {
            if (!err) console.log(`   ✅ Documents: ${row.count} dokumentów (powinno być 0)`);
            
            setTimeout(() => {
                db.close();
                console.log('\n✅ Zamknięto połączenie z bazą');
                console.log('\n🚀 Możesz teraz uruchomić aplikację i dodać dane od nowa!');
            }, 500);
        });
        
    } catch (error) {
        console.error('❌ Błąd:', error);
        db.close();
    }
}

// URUCHOM CLEANUP
cleanup();
