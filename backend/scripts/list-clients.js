/**
 * Skrypt do wyświetlenia wszystkich klientów w bazie
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', '..', 'data', 'komunikator.db');

console.log('📋 Lista klientów w bazie');
console.log('📍 Baza danych:', DB_PATH);
console.log('');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Błąd połączenia z bazą:', err);
        process.exit(1);
    }
});

db.all('SELECT id, first_name, last_name, email, company_name, created_at FROM clients ORDER BY id', [], (err, rows) => {
    if (err) {
        console.error('❌ Błąd:', err);
        db.close();
        process.exit(1);
    }

    console.log(`Znaleziono klientów: ${rows.length}`);
    console.log('═'.repeat(80));
    console.log('');

    rows.forEach(client => {
        console.log(`ID: ${client.id}`);
        console.log(`   Imię i nazwisko: ${client.first_name} ${client.last_name}`);
        console.log(`   Email: ${client.email}`);
        console.log(`   Firma: ${client.company_name || 'brak'}`);
        console.log(`   Utworzono: ${client.created_at}`);
        console.log('─'.repeat(80));
    });

    db.close();
});
