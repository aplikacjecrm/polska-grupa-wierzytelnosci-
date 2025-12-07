// Uruchom inicjalizację bazy danych
const { initDatabase } = require('./init');

console.log('🔧 Uruchamiam inicjalizację bazy danych...\n');

initDatabase()
  .then((db) => {
    console.log('\n✅ BAZA ZAINICJALIZOWANA POMYŚLNIE!');
    console.log('📂 Lokalizacja: database/kancelaria.db');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ BŁĄD INICJALIZACJI:', error);
    process.exit(1);
  });
