#!/usr/bin/env node
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY);

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║              📊 RAPORT ZAIMPORTOWANYCH USTAW                 ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

db.all(`
    SELECT 
        title,
        COUNT(*) as count
    FROM legal_acts
    WHERE title LIKE '%Kodeks%' OR title LIKE '%Prawo%' OR title LIKE '%Ustawa%'
    GROUP BY title
    ORDER BY count DESC
`, [], (err, rows) => {
    if (err) {
        console.error('❌', err.message);
        db.close();
        return;
    }
    
    if (rows.length === 0) {
        console.log('❌ BRAK ZAIMPORTOWANYCH USTAW!\n');
    } else {
        console.log(`✅ ZAIMPORTOWANE USTAWY (${rows.length}):\n`);
        console.log('ARTYKUŁY | TYTUŁ');
        console.log('─'.repeat(70));
        
        let total = 0;
        rows.forEach(row => {
            const articles = String(row.count).padStart(8);
            const title = row.title.substring(0, 55);
            console.log(`${articles} | ${title}`);
            total += row.count;
        });
        
        console.log('─'.repeat(70));
        console.log(`RAZEM: ${rows.length} ustaw, ${total} artykułów\n`);
    }
    
    db.close();
});
