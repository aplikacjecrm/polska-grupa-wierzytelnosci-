/**
 * Migracja 003: Dodanie kolumny note_code do tabeli notes
 * Data: 6 listopada 2025
 * 
 * Cel: Dodanie uniwersalnego systemu numeracji do notatek
 */

const { getDatabase } = require('../database/init');

async function migrate() {
  const db = getDatabase();
  
  console.log('🔄 Migracja 003: Dodawanie kolumny note_code...');
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. Dodaj kolumnę note_code (bez UNIQUE - SQLite limitation)
      db.run(`
        ALTER TABLE notes 
        ADD COLUMN note_code VARCHAR(100)
      `, (err) => {
        if (err) {
          // Jeśli kolumna już istnieje, ignoruj błąd
          if (err.message.includes('duplicate column')) {
            console.log('⚠️ Kolumna note_code już istnieje, pomijam...');
          } else {
            console.error('❌ Błąd dodawania kolumny:', err);
            reject(err);
            return;
          }
        }
        
        console.log('✅ Kolumna note_code dodana do tabeli notes');
        resolve();
      });
    });
  });
}

// Uruchom migrację jeśli wywoływana bezpośrednio
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('✅ Migracja 003 zakończona sukcesem!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Migracja 003 nie powiodła się:', err);
      process.exit(1);
    });
}

module.exports = { migrate };
