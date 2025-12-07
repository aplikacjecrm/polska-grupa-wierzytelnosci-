#!/usr/bin/env node
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY);

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║                  📊 FINALNE ZLICZENIE                        ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

const queries = [
    { code: 'KC', pattern: 'Kodeks cywilny%' },
    { code: 'KPC', pattern: 'Kodeks postępowania cywilnego%' },
    { code: 'KK', pattern: 'Kodeks karny %' },
    { code: 'KPK', pattern: 'Kodeks postępowania karnego%' },
    { code: 'KP', pattern: 'Kodeks pracy%' },
    { code: 'KRO', pattern: 'Kodeks rodzinny%' },
    { code: 'KSH', pattern: 'Kodeks spółek%' },
    { code: 'KW', pattern: 'Kodeks wykroczeń%' },
    { code: 'PPSA', pattern: '%postępowania przed sądami administracyjnymi%' },
    { code: 'PRD', pattern: '%ruchu drogowego%' }
];

let results = [];
let checked = 0;

queries.forEach(q => {
    db.get(`SELECT COUNT(*) as count FROM legal_acts WHERE title LIKE ?`, [q.pattern], (err, row) => {
        checked++;
        results.push({
            code: q.code,
            count: row ? row.count : 0
        });
        
        if (checked === queries.length) {
            displayResults();
        }
    });
});

function displayResults() {
    console.log('NR | KOD   | ARTYKUŁY | STATUS');
    console.log('─'.repeat(70));
    
    results.sort((a, b) => a.code.localeCompare(b.code));
    
    let total = 0;
    let nr = 1;
    results.forEach(r => {
        const icon = r.count > 0 ? '✅' : '❌';
        console.log(`${String(nr).padStart(2)} | ${r.code.padEnd(5)} | ${String(r.count).padStart(8)} | ${icon}`);
        total += r.count;
        nr++;
    });
    
    console.log('─'.repeat(70));
    const importedCount = results.filter(r => r.count > 0).length;
    console.log(`RAZEM: ${importedCount}/10 ustaw, ${total} artykułów\n`);
    
    db.close();
}
