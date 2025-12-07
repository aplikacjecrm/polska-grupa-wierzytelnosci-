#!/usr/bin/env node
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY);

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║              ✅ FINALNE PODSUMOWANIE - 10 USTAW              ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// Grupuj po tytule
db.all(`
    SELECT 
        CASE 
            WHEN title LIKE 'Kodeks cywilny%' THEN 'KC - Kodeks cywilny'
            WHEN title LIKE 'Kodeks postępowania cywilnego%' THEN 'KPC - Kodeks postępowania cywilnego'
            WHEN title LIKE 'Kodeks karny %' THEN 'KK - Kodeks karny'
            WHEN title LIKE 'Kodeks postępowania karnego%' THEN 'KPK - Kodeks postępowania karnego'
            WHEN title LIKE 'Kodeks pracy%' THEN 'KP - Kodeks pracy'
            WHEN title LIKE 'Kodeks rodzinny%' THEN 'KRO - Kodeks rodzinny'
            WHEN title LIKE 'Kodeks spółek%' THEN 'KSH - Kodeks spółek handlowych'
            WHEN title LIKE 'Kodeks wykroczeń%' THEN 'KW - Kodeks wykroczeń'
            ELSE 'Inne'
        END as kodeks,
        COUNT(*) as articles
    FROM legal_acts
    WHERE created_at > '2025-11-04 22:00'
    GROUP BY kodeks
    ORDER BY kodeks
`, [], (err, rows) => {
    if (err) {
        console.error('❌', err.message);
        db.close();
        return;
    }
    
    console.log('KOD         | ARTYKUŁY | STATUS');
    console.log('─'.repeat(70));
    
    let total = 0;
    rows.forEach(row => {
        const articles = String(row.articles).padStart(8);
        console.log(`${row.kodeks.padEnd(40)} | ${articles} | ✅`);
        total += row.articles;
    });
    
    console.log('─'.repeat(70));
    console.log(`RAZEM: ${rows.length} ustaw, ${total} artykułów\n`);
    
    // Sprawdź PPSA i PRD
    db.all(`
        SELECT DISTINCT title 
        FROM legal_acts 
        WHERE (title LIKE '%postępowania przed sądami%' OR title LIKE '%ruchu drogowego%')
        AND created_at > '2025-11-04 22:00'
    `, [], (err, other) => {
        if (other && other.length > 0) {
            console.log('🔍 INNE ZNALEZIONE USTAWY:\n');
            other.forEach(o => console.log(`   • ${o.title.substring(0, 60)}`));
            console.log('');
        }
        
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                        PODSUMOWANIE                          ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log(`║  ✅ Zaimportowano: ${rows.length} ustaw                                     ║`);
        console.log(`║  📄 Łącznie: ~${total} artykułów                                    ║`);
        console.log('║                                                               ║');
        console.log('║  🎯 BRAKUJE (nie w konfiguracji):                            ║');
        console.log('║     • PPSA (Prawo o postępowaniu przed sądami admin.)        ║');
        console.log('║     • PRD (Prawo o ruchu drogowym)                           ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
        
        db.close();
    });
});
