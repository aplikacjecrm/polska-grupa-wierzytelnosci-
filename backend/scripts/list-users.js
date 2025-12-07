const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/kancelaria.db');
const db = new sqlite3.Database(DB_PATH);

console.log('👥 LISTA WSZYSTKICH UŻYTKOWNIKÓW W BAZIE\n');

db.all(`
    SELECT id, email, name, role, user_role, is_active, created_at
    FROM users
    ORDER BY role, email
`, (err, users) => {
    if (err) {
        console.error('❌ Błąd odczytu użytkowników:', err);
        process.exit(1);
    }

    if (users.length === 0) {
        console.log('📭 Brak użytkowników w bazie!\n');
        process.exit(0);
    }

    const roleLabels = {
        'admin': '👑 Admin',
        'lawyer': '👔 Mecenas',
        'client_manager': '👤 Opiekun klienta',
        'case_manager': '📋 Opiekun sprawy',
        'reception': '📞 Recepcja',
        'client': '👤 Klient'
    };

    console.log(`Znaleziono: ${users.length} użytkowników\n`);
    console.log('─'.repeat(100));
    console.log('ID  | Rola            | Email                              | Imię i nazwisko              | Status');
    console.log('─'.repeat(100));

    users.forEach(user => {
        const role = user.user_role || user.role;
        const roleLabel = roleLabels[role] || role;
        const status = user.is_active ? '✅ Aktywny' : '❌ Nieaktywny';
        
        console.log(
            `${String(user.id).padEnd(4)}| ${roleLabel.padEnd(15)} | ${user.email.padEnd(35)} | ${(user.name || '').padEnd(28)} | ${status}`
        );
    });

    console.log('─'.repeat(100));
    
    // Statystyki
    const stats = {
        admin: users.filter(u => (u.user_role || u.role) === 'admin').length,
        lawyer: users.filter(u => (u.user_role || u.role) === 'lawyer').length,
        client_manager: users.filter(u => (u.user_role || u.role) === 'client_manager').length,
        case_manager: users.filter(u => (u.user_role || u.role) === 'case_manager').length,
        reception: users.filter(u => (u.user_role || u.role) === 'reception').length,
        client: users.filter(u => (u.user_role || u.role) === 'client').length
    };

    console.log('\n📊 STATYSTYKI:');
    console.log(`   👑 Admini: ${stats.admin}`);
    console.log(`   👔 Mecenasi: ${stats.lawyer}`);
    console.log(`   👤 Opiekunowie klientów: ${stats.client_manager}`);
    console.log(`   📋 Opiekunowie spraw: ${stats.case_manager}`);
    console.log(`   📞 Recepcja: ${stats.reception}`);
    console.log(`   👤 Klienci: ${stats.client}`);
    console.log(`   📝 RAZEM: ${users.length}\n`);

    console.log('⚠️  UWAGA: Hasła są zhaszowane w bazie (bcrypt) - nie można ich odczytać!');
    console.log('💡 Znane hasła DEV MODE:');
    console.log('   • admin@pro-meritum.pl → admin123\n');

    db.close();
    process.exit(0);
});
