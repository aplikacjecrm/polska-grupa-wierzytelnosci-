/**
 * Migration 006: Rozszerzenie tabeli employee_profiles
 * Dodaje pola dla HR Dashboard:
 * - Dane osobowe (PESEL, adres, dowód)
 * - Dane rodziny (kontakt awaryjny)
 * - Wykształcenie
 * - Dane finansowe
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', '..', 'data', 'komunikator.db');

const db = new sqlite3.Database(DB_PATH);

const alterCommands = [
  // DANE OSOBOWE
  `ALTER TABLE employee_profiles ADD COLUMN pesel TEXT`,
  `ALTER TABLE employee_profiles ADD COLUMN id_number TEXT`,
  `ALTER TABLE employee_profiles ADD COLUMN address TEXT`,
  
  // DANE RODZINY
  `ALTER TABLE employee_profiles ADD COLUMN emergency_contact_name TEXT`,
  `ALTER TABLE employee_profiles ADD COLUMN emergency_contact_phone TEXT`,
  `ALTER TABLE employee_profiles ADD COLUMN emergency_contact_relation TEXT`,
  `ALTER TABLE employee_profiles ADD COLUMN emergency_contact_address TEXT`,
  
  // WYKSZTAŁCENIE
  `ALTER TABLE employee_profiles ADD COLUMN education_level TEXT`,
  `ALTER TABLE employee_profiles ADD COLUMN school_name TEXT`,
  `ALTER TABLE employee_profiles ADD COLUMN field_of_study TEXT`,
  `ALTER TABLE employee_profiles ADD COLUMN graduation_year TEXT`,
  `ALTER TABLE employee_profiles ADD COLUMN degree TEXT`,
  `ALTER TABLE employee_profiles ADD COLUMN specializations TEXT`,
  
  // DANE FINANSOWE (rozszerzenie)
  `ALTER TABLE employee_profiles ADD COLUMN salary DECIMAL(10,2)`,
  `ALTER TABLE employee_profiles ADD COLUMN bank_account TEXT`,
  `ALTER TABLE employee_profiles ADD COLUMN contract_type TEXT`,
  `ALTER TABLE employee_profiles ADD COLUMN contract_start_date DATE`,
  `ALTER TABLE employee_profiles ADD COLUMN contract_end_date DATE`,
  `ALTER TABLE employee_profiles ADD COLUMN tax_office TEXT`,
  `ALTER TABLE employee_profiles ADD COLUMN nip TEXT`,
  `ALTER TABLE employee_profiles ADD COLUMN insurance_type TEXT`,
  `ALTER TABLE employee_profiles ADD COLUMN work_hours_per_week INTEGER`,
  
  // DODATKOWE FINANSOWE (z poprzedniego endpointa)
  `ALTER TABLE employee_profiles ADD COLUMN monthly_salary DECIMAL(10,2)`,
  `ALTER TABLE employee_profiles ADD COLUMN financial_notes TEXT`
];

console.log('🚀 Migration 006: Rozszerzenie employee_profiles');

let completed = 0;
let errors = 0;

alterCommands.forEach((sql, index) => {
  db.run(sql, (err) => {
    completed++;
    
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log(`⚠️  Kolumna już istnieje (${index + 1}/${alterCommands.length})`);
      } else {
        console.error(`❌ Błąd ${index + 1}/${alterCommands.length}:`, err.message);
        errors++;
      }
    } else {
      console.log(`✅ Dodano kolumnę (${index + 1}/${alterCommands.length})`);
    }
    
    // Zamknij połączenie po ostatniej komendzie
    if (completed === alterCommands.length) {
      db.close((err) => {
        if (err) {
          console.error('❌ Błąd zamykania bazy:', err);
        } else {
          console.log(`\n✅ Migracja zakończona! Dodano ${alterCommands.length - errors} kolumn.`);
          if (errors > 0) {
            console.log(`⚠️  Pominięto ${errors} błędów (prawdopodobnie kolumny już istnieją)`);
          }
        }
      });
    }
  });
});
