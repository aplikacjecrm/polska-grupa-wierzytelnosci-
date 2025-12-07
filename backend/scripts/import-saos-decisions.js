#!/usr/bin/env node
// 📥 IMPORTER ORZECZEŃ Z SAOS API

const https = require('https');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');

// Parametry
const article = process.argv[2] || '444';
const code = process.argv[3] || 'KC';
const limit = parseInt(process.argv[4]) || 10;

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║         📥 IMPORT ORZECZEŃ Z SAOS API                        ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

console.log(`🔍 Wyszukuję orzeczenia dla: Art. ${article} ${code}`);
console.log(`📊 Limit: ${limit} orzeczeń\n`);

const searchQuery = `art. ${article} ${code === 'KC' ? 'kodeks cywilny' : code}`;
const url = `https://www.saos.org.pl/api/search/judgments?legalBase=${encodeURIComponent(searchQuery)}&pageSize=${limit}`;

console.log(`🌐 API URL: ${url}\n`);

https.get(url, {
    headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; ProMeritumBot/1.0)'
    }
}, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            
            if (!json.items || json.items.length === 0) {
                console.log('⚠️  Brak orzeczeń dla tego zapytania.\n');
                return;
            }
            
            console.log(`✅ Znaleziono ${json.items.length} orzeczeń!\n`);
            console.log('─'.repeat(63) + '\n');
            
            // Parsuj i importuj
            importDecisions(json.items, article, code);
            
        } catch (e) {
            console.error('❌ Błąd parsowania JSON:', e.message);
        }
    });
    
}).on('error', (e) => {
    console.error('❌ Błąd połączenia:', e.message);
});

function importDecisions(items, article, code) {
    const db = new sqlite3.Database(DB_PATH);
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    
    console.log('💾 Importuję do bazy danych...\n');
    
    db.serialize(() => {
        const stmt = db.prepare(`
            INSERT OR IGNORE INTO court_decisions (
                court_type,
                signature,
                decision_date,
                decision_type,
                result,
                summary,
                full_text,
                judge_name,
                source_url,
                legal_base
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        items.forEach((item, index) => {
            // Parsuj dane
            const signature = item.courtCases && item.courtCases[0] ? item.courtCases[0].caseNumber : null;
            const courtType = determineCourtType(item.courtName || '');
            const decisionDate = item.judgmentDate || null;
            const decisionType = item.judgmentType || null;
            const fullText = item.textContent || '';
            const sourceUrl = item.href ? `https://www.saos.org.pl${item.href}` : null;
            
            // Wyodrębnij sędziego z tekstu
            const judgeName = extractJudgeName(fullText);
            
            // Streszczenie - pierwsze 500 znaków
            const summary = fullText.substring(0, 500) + (fullText.length > 500 ? '...' : '');
            
            const legalBase = `Art. ${article} ${code}`;
            
            if (!signature) {
                skipped++;
                return;
            }
            
            stmt.run([
                courtType,
                signature,
                decisionDate,
                decisionType,
                null, // result - do uzupełnienia później
                summary,
                fullText,
                judgeName,
                sourceUrl,
                legalBase
            ], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        skipped++;
                    } else {
                        console.error(`   ❌ ${signature}: ${err.message}`);
                        errors++;
                    }
                } else {
                    imported++;
                    console.log(`   ✅ ${imported}. ${signature} - ${decisionDate}`);
                }
                
                // Ostatnie
                if (index === items.length - 1) {
                    stmt.finalize();
                    
                    setTimeout(() => {
                        displaySummary(imported, skipped, errors, article, code);
                        db.close();
                    }, 200);
                }
            });
        });
    });
}

function determineCourtType(courtName) {
    if (courtName.includes('Sąd Najwyższy') || courtName.includes('SN')) return 'SN';
    if (courtName.includes('Naczelny Sąd Administracyjny') || courtName.includes('NSA')) return 'NSA';
    if (courtName.includes('Trybunał')) return 'TK';
    if (courtName.includes('Apelacyjny')) return 'SA';
    if (courtName.includes('Okręgowy')) return 'SO';
    return 'Inny';
}

function extractJudgeName(text) {
    // Prosta ekstrakcja sędziego z tekstu
    const match = text.match(/Sędzia\s+([A-ZŻŹĆĄŚĘŁÓŃ][a-zżźćńąśęłó]+\s+[A-ZŻŹĆĄŚĘŁÓŃ][a-zżźćńąśęłó]+)/);
    return match ? match[1] : null;
}

function displaySummary(imported, skipped, errors, article, code) {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    📊 PODSUMOWANIE                           ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log(`║  ✅ Zaimportowane:     ${String(imported).padStart(3)}                                   ║`);
    console.log(`║  ⏭️  Pominięte (duplikaty): ${String(skipped).padStart(3)}                              ║`);
    console.log(`║  ❌ Błędy:             ${String(errors).padStart(3)}                                   ║`);
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    if (imported > 0) {
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                  🎉 SUKCES! 🎉                               ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log('║                                                               ║');
        console.log(`║  Zaimportowano ${imported} orzeczeń dla Art. ${article} ${code}!${' '.repeat(Math.max(0, 25 - article.length - code.length))}║`);
        console.log('║                                                               ║');
        console.log('║  🔍 Sprawdź w bazie:                                          ║');
        console.log('║  SELECT * FROM court_decisions LIMIT 5;                       ║');
        console.log('║                                                               ║');
        console.log('║  🚀 NASTĘPNY KROK:                                           ║');
        console.log('║  • Linkowanie z artykułami (decision_articles)                ║');
        console.log('║  • Import dla innych artykułów                                ║');
        console.log('║  • Frontend do wyświetlania                                   ║');
        console.log('║                                                               ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    }
}
