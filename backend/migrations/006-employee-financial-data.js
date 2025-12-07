/**
 * Migracja 006: Dane finansowe pracowników
 * Rozszerzenie profilu pracownika o informacje finansowe
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../database/kancelaria.db');

console.log('🚀 Uruchamiam migrację 006: Employee Financial Data...');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Błąd połączenia z bazą:', err);
    process.exit(1);
  }
  
  console.log('✅ Połączono z bazą danych');
  runMigration();
});

async function runMigration() {
  try {
    // Sprawdź czy kolumny już istnieją
    const columns = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(employee_profiles)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(r => r.name));
      });
    });
    
    const columnsToAdd = [
      { name: 'monthly_salary', type: 'REAL', comment: 'Miesięczna pensja brutto' },
      { name: 'bank_account', type: 'TEXT', comment: 'Numer konta bankowego' },
      { name: 'contract_type', type: 'TEXT', comment: 'Typ umowy (uop/uz/b2b)' },
      { name: 'contract_start_date', type: 'DATE', comment: 'Data rozpoczęcia umowy' },
      { name: 'contract_end_date', type: 'DATE', comment: 'Data zakończenia umowy (jeśli określona)' },
      { name: 'tax_office', type: 'TEXT', comment: 'Urząd skarbowy' },
      { name: 'nip', type: 'TEXT', comment: 'NIP (dla B2B)' },
      { name: 'insurance_type', type: 'TEXT', comment: 'Rodzaj ubezpieczenia' },
      { name: 'work_hours_per_week', type: 'INTEGER', comment: 'Wymiar czasu pracy (h/tydzień)' },
      { name: 'financial_notes', type: 'TEXT', comment: 'Uwagi finansowe' }
    ];
    
    // Dodaj brakujące kolumny
    for (const col of columnsToAdd) {
      if (!columns.includes(col.name)) {
        await new Promise((resolve, reject) => {
          db.run(`ALTER TABLE employee_profiles ADD COLUMN ${col.name} ${col.type}`, (err) => {
            if (err) reject(err);
            else {
              console.log(`✅ Dodano kolumnę: ${col.name} (${col.comment})`);
              resolve();
            }
          });
        });
      } else {
        console.log(`⏭️  Kolumna ${col.name} już istnieje`);
      }
    }
    
    console.log('✅ Migracja 006 zakończona pomyślnie!');
    
    // Dodatkowo: Dodaj employee_id do tabeli employee_salaries jeśli nie istnieje
    const salaryColumns = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(employee_salaries)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(r => r.name));
      });
    });
    
    if (!salaryColumns.includes('employee_id')) {
      await new Promise((resolve, reject) => {
        db.run(`ALTER TABLE employee_salaries ADD COLUMN employee_id INTEGER`, (err) => {
          if (err) reject(err);
          else {
            console.log(`✅ Dodano kolumnę employee_id do employee_salaries`);
            resolve();
          }
        });
      });
    }
    
    console.log('\n✅ Wszystko gotowe!');
    db.close();
    
  } catch (error) {
    console.error('❌ Błąd migracji:', error);
    db.close();
    process.exit(1);
  }
}
