const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', '..', 'data', 'komunikator.db');

console.log('🔧 Rozpoczynam migrację: Dodawanie rozszerzonych pól do tabeli case_evidence');
console.log('📍 Ścieżka bazy danych:', DB_PATH);

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Błąd połączenia z bazą danych:', err);
    process.exit(1);
  }
  console.log('✅ Połączono z bazą danych');
});

// Funkcja pomocnicza do dodawania kolumny
function addColumn(tableName, columnName, columnType, defaultValue = null) {
  return new Promise((resolve, reject) => {
    const defaultClause = defaultValue !== null ? ` DEFAULT ${defaultValue}` : '';
    const sql = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}${defaultClause}`;
    
    db.run(sql, (err) => {
      if (err) {
        if (err.message.includes('duplicate column')) {
          console.log(`⚠️  Kolumna ${columnName} już istnieje - pomijam`);
          resolve();
        } else {
          console.error(`❌ Błąd dodawania kolumny ${columnName}:`, err.message);
          reject(err);
        }
      } else {
        console.log(`✅ Dodano kolumnę: ${columnName} (${columnType})`);
        resolve();
      }
    });
  });
}

async function runMigration() {
  try {
    console.log('\n🚀 Rozpoczynam dodawanie nowych kolumn...\n');
    
    // === DOWODY Z INTERNETU / MEDIÓW SPOŁECZNOŚCIOWYCH ===
    await addColumn('case_evidence', 'source_url', 'TEXT');
    await addColumn('case_evidence', 'social_profile', 'TEXT');
    await addColumn('case_evidence', 'social_platform', 'TEXT');
    
    // === POWIĄZANIA Z INNYMI DOWODAMI ===
    await addColumn('case_evidence', 'related_emails', 'TEXT');
    await addColumn('case_evidence', 'related_phones', 'TEXT');
    
    // === DOWODY POSZLAKOWE ===
    await addColumn('case_evidence', 'circumstantial_type', 'TEXT');
    await addColumn('case_evidence', 'circumstantial_strength', 'TEXT');
    await addColumn('case_evidence', 'circumstantial_connections', 'TEXT');
    await addColumn('case_evidence', 'alternative_explanations', 'TEXT');
    
    // === POWIĄZANIE Z ZEZNANIEM ===
    await addColumn('case_evidence', 'testimony_id', 'INTEGER');
    
    console.log('\n✅ Migracja zakończona pomyślnie!\n');
    console.log('📊 Dodano wszystkie rozszerzone pola do tabeli case_evidence\n');
    
  } catch (error) {
    console.error('\n❌ Migracja nie powiodła się:', error);
    process.exit(1);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('❌ Błąd zamykania bazy danych:', err);
      } else {
        console.log('🔒 Połączenie z bazą danych zamknięte');
      }
      process.exit(0);
    });
  }
}

runMigration();
