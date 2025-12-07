#!/usr/bin/env node
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY);

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║         🎉 FINALNE STATYSTYKI ETAP 2                         ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// Zlicz wszystko
db.all(`
    SELECT 
        (SELECT COUNT(*) FROM legal_acts) as acts,
        (SELECT COUNT(*) FROM court_decisions) as decisions,
        (SELECT COUNT(*) FROM decision_articles) as links,
        (SELECT COUNT(*) FROM amendments) as amendments
`, [], (err, rows) => {
    if (err) {
        console.error('❌', err.message);
        db.close();
        return;
    }
    
    const stats = rows[0];
    
    console.log('📊 BAZA DANYCH:\n');
    console.log(`   📚 Artykuły ustaw:        ${stats.acts.toString().padStart(6)}`);
    console.log(`   ⚖️  Orzeczenia sądów:      ${stats.decisions.toString().padStart(6)}`);
    console.log(`   🔗 Linki orzeczenia→art:  ${stats.links.toString().padStart(6)}`);
    console.log(`   📝 Zmiany w ustawach:     ${stats.amendments.toString().padStart(6)}`);
    console.log('');
    
    // Rozkład orzeczeń po sądach
    db.all(`
        SELECT court_type, COUNT(*) as count 
        FROM court_decisions 
        GROUP BY court_type 
        ORDER BY count DESC
    `, [], (err, courts) => {
        console.log('⚖️  ORZECZENIA WG SĄDÓW:\n');
        courts.forEach(c => {
            console.log(`   ${c.court_type.padEnd(10)} - ${c.count} orzeczeń`);
        });
        console.log('');
        
        // Top artykuły z orzeczeniami
        db.all(`
            SELECT 
                article_reference,
                COUNT(*) as count
            FROM decision_articles
            GROUP BY article_reference
            ORDER BY count DESC
            LIMIT 10
        `, [], (err, topArticles) => {
            console.log('🔥 TOP 10 ARTYKUŁÓW Z ORZECZENIAMI:\n');
            console.log('   ARTYKUŁ      | ORZECZENIA');
            console.log('   ' + '─'.repeat(40));
            topArticles.forEach(a => {
                console.log(`   ${a.article_reference.padEnd(13)} | ${a.count}`);
            });
            console.log('');
            
            displaySummary(stats, courts, topArticles);
            db.close();
        });
    });
});

function displaySummary(stats, courts, topArticles) {
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║              🎉🎉🎉 GRATULACJE! 🎉🎉🎉                       ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log('║                                                               ║');
    console.log('║  MASZ TERAZ POTĘŻNY SYSTEM PRAWNY!                            ║');
    console.log('║                                                               ║');
    console.log('║  📚 ETAP 1:                                                   ║');
    console.log('║  • 13 ustaw (KC, KPC, KK, KPK, KP, KRO, KSH, KW...)          ║');
    console.log(`║  • ${stats.acts} artykułów${' '.repeat(Math.max(0, 50 - String(stats.acts).length))}║`);
    console.log('║                                                               ║');
    console.log('║  ⚖️  ETAP 2:                                                  ║');
    console.log(`║  • ${stats.decisions} orzeczeń Sądu Najwyższego${' '.repeat(Math.max(0, 38 - String(stats.decisions).length))}║`);
    console.log(`║  • ${stats.links} połączeń orzeczenie→artykuł${' '.repeat(Math.max(0, 38 - String(stats.links).length))}║`);
    console.log(`║  • ${stats.amendments} zmian w ustawach${' '.repeat(Math.max(0, 49 - String(stats.amendments).length))}║`);
    console.log('║                                                               ║');
    console.log('║  🎯 POKRYCIE:                                                 ║');
    console.log('║  • KC - najważniejsze artykuły odpowiedzialności              ║');
    console.log('║  • KPC - postępowanie, dowody, koszty                         ║');
    console.log('║  • KK - przestępstwa (zabójstwo, kradzież, oszustwo)         ║');
    console.log('║  • KP - prawo pracy (rozwiązanie, mobbing)                    ║');
    console.log('║                                                               ║');
    console.log('║  💡 CO TERAZ?                                                ║');
    console.log('║  A) Frontend - Zobacz jak to wygląda!                         ║');
    console.log('║  B) Więcej orzeczeń (TK, NSA)                                 ║');
    console.log('║  C) Historia zmian (pełna od 1964)                            ║');
    console.log('║                                                               ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
}
