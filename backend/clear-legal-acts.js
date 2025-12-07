const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH);

console.log('🗑️  Czyszczenie tabeli legal_acts...');

db.run('DELETE FROM legal_acts', (err) => {
    if (err) {
        console.error('❌ Błąd:', err);
    } else {
        console.log('✅ Tabela legal_acts wyczyszczona!');
        console.log('💡 Teraz uruchom backend aby załadować nowe dane seed');
    }
    db.close();
});
