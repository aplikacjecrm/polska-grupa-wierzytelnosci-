// CLEAR CACHE - Usuń wszystkie wpisy z api_cache

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database/kancelaria.db');
const db = new sqlite3.Database(DB_PATH);

console.log('🗑️ Czyszczę cache...');

db.run('DELETE FROM api_cache', (err) => {
    if (err) {
        console.error('❌ Błąd czyszczenia cache:', err);
    } else {
        console.log('✅ Cache wyczyszczony! Wszystkie wpisy usunięte.');
    }
    db.close();
});
