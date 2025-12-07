#!/usr/bin/env node
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY);

console.log('\n🔍 Sprawdzam PPSA i PRD...\n');

db.all(`
    SELECT 
        substr(title, 1, 70) as title_short,
        COUNT(*) as count
    FROM legal_acts
    WHERE created_at > '2025-11-04 22:40'
    GROUP BY title_short
    ORDER BY count DESC
    LIMIT 15
`, [], (err, rows) => {
    if (err) {
        console.error('❌', err.message);
    } else {
        console.log('ARTYKUŁY | TYTUŁ');
        console.log('─'.repeat(80));
        rows.forEach(r => {
            console.log(`${String(r.count).padStart(8)} | ${r.title_short}`);
        });
    }
    db.close();
});
