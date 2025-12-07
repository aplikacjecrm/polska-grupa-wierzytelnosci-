/**
 * Uruchamia migrację 006 - HR System
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const MIGRATION_PATH = path.join(__dirname, '../migrations/006-hr-system.sql');

console.log('🔄 Uruchamiam migrację 006: HR System...\n');

const db = new sqlite3.Database(DB_PATH);

// Wczytaj SQL
const sql = fs.readFileSync(MIGRATION_PATH, 'utf8');

// Wykonaj migrację
db.exec(sql, (err) => {
    if (err) {
        console.error('❌ Błąd migracji:', err);
        db.close();
        process.exit(1);
    }
    
    console.log('✅ Migracja 006 zakończona pomyślnie!\n');
    
    // Sprawdź utworzone tabele
    db.all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND name LIKE 'employee_%' OR name LIKE 'hr_%' OR name = 'salary_history'
        ORDER BY name
    `, (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log('📊 Utworzone tabele HR:');
            rows.forEach(row => console.log(`  ✓ ${row.name}`));
        }
        
        db.close();
        console.log('\n🎉 Gotowe!');
    });
});
