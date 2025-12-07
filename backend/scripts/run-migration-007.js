/**
 * Skrypt do uruchomienia migracji 007 - Integracja HR z Ticketami
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '../../data/komunikator.db');
const migrationPath = path.join(__dirname, '../migrations/007-add-ticket-integration.sql');

console.log('🚀 Uruchamianie migracji 007...');
console.log('📍 Baza danych:', dbPath);
console.log('📄 Plik migracji:', migrationPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Błąd połączenia z bazą:', err);
    process.exit(1);
  }
  console.log('✅ Połączono z bazą danych');
});

const migration = fs.readFileSync(migrationPath, 'utf-8');

db.exec(migration, (err) => {
  if (err) {
    console.error('❌ Błąd migracji:', err.message);
    db.close();
    process.exit(1);
  }
  
  console.log('✅ Migracja 007 zakończona pomyślnie!');
  console.log('🎉 Dodano integrację HR z ticketami:');
  console.log('   - employee_vacations.ticket_id');
  console.log('   - employee_training.ticket_id');
  console.log('   - employee_documents.ticket_id');
  
  db.close((err) => {
    if (err) console.error('❌ Błąd zamykania bazy:', err);
    else console.log('✅ Zamknięto połączenie z bazą');
    process.exit(0);
  });
});
