#!/usr/bin/env node
// 🔍 SPRAWDŹ CO JEST ZAIMPORTOWANE W BAZIE

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');

const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('❌ Błąd:', err.message);
        process.exit(1);
    }
});

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║              🔍 SPRAWDZAM BAZĘ DANYCH                        ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

db.all(`
    SELECT 
        la.code,
        la.title,
        COUNT(a.id) as articles
    FROM legal_acts la
    LEFT JOIN articles a ON la.id = a.legal_act_id
    GROUP BY la.id
    ORDER BY la.code
`, [], (err, rows) => {
    if (err) {
        console.error('❌ Błąd zapytania:', err.message);
        db.close();
        return;
    }
    
    if (rows.length === 0) {
        console.log('❌ BAZA PUSTA - brak zaimportowanych ustaw!\n');
    } else {
        console.log(`✅ ZAIMPORTOWANE USTAWY (${rows.length}):\n`);
        console.log('KOD         | ARTYKUŁY | TYTUŁ');
        console.log('─'.repeat(70));
        
        rows.forEach(row => {
            const code = row.code.padEnd(11);
            const articles = String(row.articles).padStart(8);
            const title = row.title.substring(0, 45);
            console.log(`${code} | ${articles} | ${title}`);
        });
        
        const totalArticles = rows.reduce((sum, row) => sum + row.articles, 0);
        console.log('─'.repeat(70));
        console.log(`RAZEM: ${rows.length} ustaw, ${totalArticles} artykułów\n`);
    }
    
    db.close();
});
