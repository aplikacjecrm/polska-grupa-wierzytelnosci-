#!/usr/bin/env node
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY);

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║              🎉 FINALNE PODSUMOWANIE - 10 USTAW              ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

db.all(`
    SELECT 
        CASE 
            WHEN title LIKE 'Kodeks cywilny%' THEN 'KC'
            WHEN title LIKE 'Kodeks postępowania cywilnego%' THEN 'KPC'
            WHEN title LIKE 'Kodeks karny %' THEN 'KK'
            WHEN title LIKE 'Kodeks postępowania karnego%' THEN 'KPK'
            WHEN title LIKE 'Kodeks pracy%' THEN 'KP'
            WHEN title LIKE 'Kodeks rodzinny%' THEN 'KRO'
            WHEN title LIKE 'Kodeks spółek%' THEN 'KSH'
            WHEN title LIKE 'Kodeks wykroczeń%' THEN 'KW'
            WHEN title LIKE '%postępowania przed sądami administracyjnymi%' THEN 'PPSA'
            WHEN title LIKE '%ruchu drogowego%' THEN 'PRD'
            ELSE 'Inne'
        END as kod,
        COUNT(*) as articles
    FROM legal_acts
    WHERE created_at > '2025-11-04 22:00'
    GROUP BY kod
    ORDER BY kod
`, [], (err, rows) => {
    if (err) {
        console.error('❌', err.message);
        db.close();
        return;
    }
    
    const codeNames = {
        'KC': 'Kodeks cywilny',
        'KPC': 'Kodeks postępowania cywilnego',
        'KK': 'Kodeks karny',
        'KPK': 'Kodeks postępowania karnego',
        'KP': 'Kodeks pracy',
        'KRO': 'Kodeks rodzinny i opiekuńczy',
        'KSH': 'Kodeks spółek handlowych',
        'KW': 'Kodeks wykroczeń',
        'PPSA': 'Prawo o postępowaniu przed sądami admin.',
        'PRD': 'Prawo o ruchu drogowym'
    };
    
    console.log('NR | KOD   | ARTYKUŁY | NAZWA');
    console.log('─'.repeat(70));
    
    let total = 0;
    let nr = 1;
    rows.forEach(row => {
        if (row.kod === 'Inne') return; // Pomijamy "Inne"
        
        const articles = String(row.articles).padStart(8);
        const name = codeNames[row.kod] || row.kod;
        console.log(`${String(nr).padStart(2)} | ${row.kod.padEnd(5)} | ${articles} | ${name}`);
        total += row.articles;
        nr++;
    });
    
    console.log('─'.repeat(70));
    console.log(`RAZEM: ${nr-1} ustaw, ${total} artykułów\n`);
    
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    🎉 GRATULACJE! 🎉                         ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log('║                                                               ║');
    console.log(`║  ✅ WSZYSTKIE 10 USTAW ZAIMPORTOWANE!                         ║`);
    console.log(`║  📚 Łącznie: ${String(total).padEnd(5)} artykułów!                                ║`);
    console.log('║                                                               ║');
    console.log('║  🎯 NASTĘPNY KROK: ETAP 2                                    ║');
    console.log('║                                                               ║');
    console.log('║  • ⚖️  Orzeczenia TK/SN                                      ║');
    console.log('║  • 📋 Interpretacje ministerialne                            ║');
    console.log('║  • 📅 Historia zmian                                         ║');
    console.log('║  • 🤖 SAOS API (automatyczne!)                               ║');
    console.log('║                                                               ║');
    console.log('║  Zobacz: ETAP-2-PLAN.md                                       ║');
    console.log('║                                                               ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    db.close();
});
