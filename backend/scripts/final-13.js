#!/usr/bin/env node
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY);

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║              🎉 13 USTAW - FINALNE PODSUMOWANIE              ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

const queries = [
    { nr: 1, code: 'KC', pattern: 'Kodeks cywilny - Art.%' },
    { nr: 2, code: 'KPC', pattern: 'Kodeks postępowania cywilnego - Art.%' },
    { nr: 3, code: 'KK', pattern: 'Kodeks karny - Art.%' },
    { nr: 4, code: 'KPK', pattern: 'Kodeks postępowania karnego - Art.%' },
    { nr: 5, code: 'KP', pattern: 'Kodeks pracy - Art.%' },
    { nr: 6, code: 'KRO', pattern: 'Kodeks rodzinny i opiekuńczy - Art.%' },
    { nr: 7, code: 'KSH', pattern: 'Kodeks spółek handlowych - Art.%' },
    { nr: 8, code: 'KW', pattern: 'Kodeks wykroczeń - Art.%' },
    { nr: 9, code: 'KKW', pattern: 'Kodeks karny wykonawczy - Art.%' },
    { nr: 10, code: 'KKS', pattern: 'Kodeks karny skarbowy - Art.%' },
    { nr: 11, code: 'KPA', pattern: 'Kodeks postępowania administracyjnego - Art.%' },
    { nr: 12, code: 'PPSA', pattern: 'Prawo o postępowaniu przed sądami administracyjnymi - Art.%' },
    { nr: 13, code: 'PRD', pattern: 'Prawo o ruchu drogowym - Art.%' }
];

let results = [];
let checked = 0;

queries.forEach(q => {
    db.get(`SELECT COUNT(*) as count FROM legal_acts WHERE title LIKE ?`, [q.pattern], (err, row) => {
        checked++;
        results.push({
            nr: q.nr,
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
    console.log('─'.repeat(50));
    
    results.sort((a, b) => a.nr - b.nr);
    
    let total = 0;
    results.forEach(r => {
        const icon = r.count > 0 ? '✅' : '❌';
        console.log(`${String(r.nr).padStart(2)} | ${r.code.padEnd(5)} | ${String(r.count).padStart(8)} | ${icon}`);
        total += r.count;
    });
    
    console.log('─'.repeat(50));
    const importedCount = results.filter(r => r.count > 0).length;
    console.log(`RAZEM: ${importedCount}/13 ustaw, ${total} artykułów\n`);
    
    if (importedCount === 13) {
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                    🎉🎉🎉 SUKCES! 🎉🎉🎉                      ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log('║                                                               ║');
        console.log('║  ✅ WSZYSTKIE 13 USTAW ZAIMPORTOWANE!                         ║');
        console.log(`║  📚 Łącznie: ${String(total).padEnd(5)} artykułów!                               ║`);
        console.log('║                                                               ║');
        console.log('║  🏆 TO JEST OGROMNA BAZA WIEDZY PRAWNEJ!                     ║');
        console.log('║                                                               ║');
        console.log('║  📊 STATYSTYKI:                                               ║');
        console.log('║  • Kodeksy cywilne: 4 ustawy                                  ║');
        console.log('║  • Kodeksy karne: 4 ustawy                                    ║');
        console.log('║  • Procedury: 3 ustawy                                        ║');
        console.log('║  • Specjalne: 2 ustawy                                        ║');
        console.log('║                                                               ║');
        console.log('║  🚀 GOTOWE NA ETAP 2:                                        ║');
        console.log('║  • ⚖️  Orzeczenia TK/SN/NSA                                  ║');
        console.log('║  • 📋 Interpretacje ministerialne                            ║');
        console.log('║  • 📅 Historia zmian                                         ║');
        console.log('║  • 🤖 SAOS API (automatyczne pobieranie!)                    ║');
        console.log('║  • 🔍 Pełnotekstowe wyszukiwanie                             ║');
        console.log('║                                                               ║');
        console.log('║  Zobacz: ETAP-2-PLAN.md                                       ║');
        console.log('║                                                               ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    } else {
        console.log('⚠️  Niektóre ustawy nie zostały zaimportowane\n');
    }
    
    db.close();
}
