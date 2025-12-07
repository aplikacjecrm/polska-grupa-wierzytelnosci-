/**
 * Migration 007: Dodanie kolumny na przechowywanie pliku umowy
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', '..', 'data', 'komunikator.db');

const db = new sqlite3.Database(DB_PATH);

console.log('🚀 Migration 007: Kolumna contract_file_url w employee_profiles');

db.run(`ALTER TABLE employee_profiles ADD COLUMN contract_file_url TEXT`, (err) => {
  if (err) {
    if (err.message.includes('duplicate column')) {
      console.log('⚠️  Kolumna contract_file_url już istnieje');
    } else {
      console.error('❌ Błąd:', err.message);
    }
  } else {
    console.log('✅ Dodano kolumnę contract_file_url');
  }
  
  db.close((err) => {
    if (err) {
      console.error('❌ Błąd zamykania bazy:', err);
    } else {
      console.log('✅ Migracja zakończona!');
    }
  });
});
