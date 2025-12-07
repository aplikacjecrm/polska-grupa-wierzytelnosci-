#!/usr/bin/env node
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY);

console.log('\n🔍 SPRAWDZAM CO NAPRAWDĘ JEST W BAZIE:\n');

db.all(`
    SELECT 
        title,
        created_at
    FROM legal_acts
    WHERE created_at > '2025-11-04 23:00'
    ORDER BY created_at DESC
    LIMIT 20
`, [], (err, rows) => {
    if (err) {
        console.error('❌', err.message);
    } else {
        console.log(`Ostatnie 20 wpisów (po 23:00):\n`);
        console.log('CZAS         | TYTUŁ');
        console.log('─'.repeat(80));
        rows.forEach(r => {
            console.log(`${r.created_at} | ${r.title.substring(0, 60)}`);
        });
        console.log('');
        
        // Zlicz wszystkie
        db.get(`SELECT COUNT(*) as total FROM legal_acts WHERE created_at > '2025-11-04 23:00'`, [], (err, row) => {
            console.log(`\n✅ RAZEM po 23:00: ${row.total} wpisów\n`);
            db.close();
        });
    }
});
