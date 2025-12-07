#!/usr/bin/env node
// 🔗 LINKOWANIE ORZECZEŃ Z ARTYKUŁAMI

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║         🔗 LINKOWANIE ORZECZEŃ Z ARTYKUŁAMI                  ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

const db = new sqlite3.Database(DB_PATH);

// Pobierz wszystkie orzeczenia
db.all(`SELECT id, signature, legal_base FROM court_decisions`, [], (err, decisions) => {
    if (err) {
        console.error('❌ Błąd:', err.message);
        db.close();
        return;
    }
    
    console.log(`📋 Znaleziono ${decisions.length} orzeczeń do zlinkowania\n`);
    
    let linked = 0;
    let skipped = 0;
    let completed = 0;
    
    decisions.forEach((decision) => {
        // Parsuj legal_base: "Art. 444 KC"
        const match = decision.legal_base.match(/Art\.\s*(\d+[a-z]*)\s+([A-Z]+)/i);
        
        if (!match) {
            console.log(`   ⏭️  ${decision.signature} - brak parsowania`);
            skipped++;
            completed++;
            
            if (completed === decisions.length) {
                displaySummary(linked, skipped);
            }
            return;
        }
        
        const articleNum = match[1];
        const code = match[2];
        
        // Znajdź legal_act_id
        db.get(`
            SELECT id FROM legal_acts 
            WHERE title LIKE ? 
            LIMIT 1
        `, [`%${getCodeName(code)}% - Art. ${articleNum}%`], (err, legalAct) => {
            
            if (err || !legalAct) {
                console.log(`   ⏭️  ${decision.signature} - nie znaleziono Art. ${articleNum} ${code}`);
                skipped++;
            } else {
                // Wstaw link
                db.run(`
                    INSERT OR IGNORE INTO decision_articles (decision_id, legal_act_id, article_reference)
                    VALUES (?, ?, ?)
                `, [decision.id, legalAct.id, `Art. ${articleNum}`], (err) => {
                    if (err) {
                        console.error(`   ❌ ${decision.signature}: ${err.message}`);
                        skipped++;
                    } else {
                        console.log(`   ✅ ${decision.signature} → Art. ${articleNum} ${code}`);
                        linked++;
                    }
                });
            }
            
            completed++;
            
            if (completed === decisions.length) {
                setTimeout(() => {
                    displaySummary(linked, skipped);
                }, 200);
            }
        });
    });
});

function getCodeName(code) {
    const names = {
        'KC': 'Kodeks cywilny',
        'KPC': 'Kodeks postępowania cywilnego',
        'KK': 'Kodeks karny',
        'KPK': 'Kodeks postępowania karnego',
        'KP': 'Kodeks pracy',
        'KRO': 'Kodeks rodzinny',
        'KSH': 'Kodeks spółek handlowych',
        'KW': 'Kodeks wykroczeń',
        'KKW': 'Kodeks karny wykonawczy',
        'KKS': 'Kodeks karny skarbowy',
        'KPA': 'Kodeks postępowania administracyjnego'
    };
    return names[code] || code;
}

function displaySummary(linked, skipped) {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    📊 PODSUMOWANIE                           ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log(`║  ✅ Zlinkowane:        ${String(linked).padStart(3)}                                   ║`);
    console.log(`║  ⏭️  Pominięte:         ${String(skipped).padStart(3)}                                   ║`);
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    if (linked > 0) {
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                  🎉 SUKCES! 🎉                               ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log('║                                                               ║');
        console.log(`║  ${linked} orzeczeń zlinkowanych z artykułami!${' '.repeat(Math.max(0, 25 - String(linked).length))}║`);
        console.log('║                                                               ║');
        console.log('║  🔍 Sprawdź:                                                  ║');
        console.log('║  SELECT * FROM decision_articles;                             ║');
        console.log('║                                                               ║');
        console.log('║  🚀 NASTĘPNY KROK:                                           ║');
        console.log('║  • Orzeczenia TK (Trybunał Konstytucyjny)                    ║');
        console.log('║  • Zmiany w ustawach (historia)                               ║');
        console.log('║                                                               ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    }
    
    db.close();
}
