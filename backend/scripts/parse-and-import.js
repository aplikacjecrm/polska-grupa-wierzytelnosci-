// 🚀 PARSER I IMPORTER - Po połączeniu części

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const COMPLETE_FILE = path.join(__dirname, '../temp/kc-complete.txt');
const DB_PATH = path.join(__dirname, '../../database/komunikator.db');

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║         📖 PARSER & IMPORTER KODEKSU CYWILNEGO 📖            ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// Sprawdź czy plik istnieje
if (!fs.existsSync(COMPLETE_FILE)) {
    console.error('❌ Brak połączonego pliku!\n');
    console.log('💡 URUCHOM NAJPIERW:');
    console.log('   node backend/scripts/paste-collector.js\n');
    process.exit(1);
}

// Wczytaj tekst
const kcText = fs.readFileSync(COMPLETE_FILE, 'utf-8');
console.log(`✅ Wczytano ${kcText.length} znaków\n`);

// REGEX do parsowania
const articleRegex = /Art\.\s*(\d+(?:\^?\d*)?)\s*\.?\s*((?:(?!Art\.\s*\d)[\s\S])*?)(?=Art\.\s*\d|$)/gi;

console.log('🔍 KROK 1/4: Parsing artykułów...\n');

const articles = [];
let match;
let count = 0;

while ((match = articleRegex.exec(kcText)) !== null) {
    const articleNumber = match[1].trim();
    let articleContent = match[2].trim();
    
    // Skip jeśli za krótkie
    if (articleContent.length < 10) continue;
    
    // Parsuj paragrafy
    const paragraphs = [];
    const paragraphRegex = /§\s*(\d+)\s*\.?\s*((?:(?!§\s*\d)[\s\S])*?)(?=§\s*\d|$)/gi;
    
    let parMatch;
    let hasExplicitParagraphs = false;
    
    while ((parMatch = paragraphRegex.exec(articleContent)) !== null) {
        const parNumber = parMatch[1];
        const parContent = parMatch[2].trim();
        
        if (parContent.length > 5) {
            paragraphs.push({
                number: parNumber,
                content: parContent
            });
            hasExplicitParagraphs = true;
        }
    }
    
    articles.push({
        number: articleNumber,
        paragraphs: hasExplicitParagraphs ? paragraphs : [],
        fullContent: articleContent,
        hasParagraphs: hasExplicitParagraphs
    });
    
    count++;
    if (count % 50 === 0) {
        process.stdout.write(`\r   Sparsowano ${count} artykułów...`);
    }
}

console.log(`\n✅ Sparsowano ${articles.length} artykułów\n`);

// Statystyki
const withParagraphs = articles.filter(a => a.hasParagraphs);
const totalParagraphs = articles.reduce((sum, a) => sum + a.paragraphs.length, 0);

console.log('📊 KROK 2/4: Statystyki:\n');
console.log(`   📄 Artykułów: ${articles.length}`);
console.log(`   § Z paragrafami: ${withParagraphs.length}`);
console.log(`   § Paragrafów (total): ${totalParagraphs}\n`);

// Przykłady
console.log('📋 Przykłady:\n');
const examples = ['1', '444', '1000'];
examples.forEach(num => {
    const article = articles.find(a => a.number === num);
    if (article) {
        console.log(`   Art. ${article.number}:`);
        if (article.hasParagraphs && article.paragraphs.length > 0) {
            console.log(`      Paragrafów: ${article.paragraphs.length}`);
            article.paragraphs.slice(0, 2).forEach(p => {
                console.log(`      § ${p.number} - ${p.content.substring(0, 60)}...`);
            });
        } else {
            console.log(`      ${article.fullContent.substring(0, 80)}...`);
        }
    }
});

console.log('\n💾 KROK 3/4: Import do bazy danych...\n');

const db = new sqlite3.Database(DB_PATH);

let imported = 0;
let errors = 0;

db.serialize(() => {
    // Usuń stare wpisy KC
    db.run(`DELETE FROM legal_acts WHERE title LIKE '%Kodeks cywilny%'`, (err) => {
        if (err) {
            console.error('   ⚠️  Błąd usuwania starych wpisów:', err.message);
        } else {
            console.log('   ✅ Usunięto stare wpisy\n');
        }
    });
    
    // Import nowych
    const stmt = db.prepare(`
        INSERT INTO legal_acts (title, content, date, url, created_at) 
        VALUES (?, ?, ?, ?, datetime('now'))
    `);
    
    articles.forEach((article, index) => {
        const title = `Kodeks cywilny - Art. ${article.number}`;
        const content = formatArticleForDB(article);
        const url = 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640160093';
        const date = '1964-04-23';
        
        stmt.run([title, content, date, url], function(err) {
            if (err) {
                errors++;
                console.error(`   ❌ Art. ${article.number}: ${err.message}`);
            } else {
                imported++;
                if (imported % 100 === 0) {
                    process.stdout.write(`\r   Zaimportowano ${imported}/${articles.length}...`);
                }
            }
            
            // Ostatni
            if (index === articles.length - 1) {
                stmt.finalize();
                
                setTimeout(() => {
                    console.log(`\n\n✅ Import zakończony: ${imported} OK, ${errors} błędów\n`);
                    
                    // Test
                    runTests(db);
                }, 200);
            }
        });
    });
});

// Format artykułu
function formatArticleForDB(article) {
    let content = `Art. ${article.number}\n\n`;
    
    if (article.hasParagraphs && article.paragraphs.length > 0) {
        article.paragraphs.forEach(p => {
            content += `§ ${p.number}. ${p.content}\n\n`;
        });
    } else {
        content += article.fullContent;
    }
    
    return content.trim();
}

// Testy
function runTests(db) {
    console.log('🧪 KROK 4/4: Testy...\n');
    
    const tests = [
        { art: '1', desc: 'Pierwszy artykuł' },
        { art: '444', desc: 'Art. 444 (odszkodowanie)' },
        { art: '1000', desc: 'Art. 1000+ (spadki)' }
    ];
    
    let tested = 0;
    
    tests.forEach(test => {
        db.get(
            `SELECT * FROM legal_acts WHERE title LIKE ? ORDER BY created_at DESC LIMIT 1`,
            [`%Art. ${test.art}%`],
            (err, row) => {
                tested++;
                
                if (err) {
                    console.log(`   ❌ ${test.desc}: BŁĄD - ${err.message}`);
                } else if (row) {
                    console.log(`   ✅ ${test.desc}: OK`);
                    console.log(`      "${row.content.substring(0, 70)}..."\n`);
                } else {
                    console.log(`   ⚠️  ${test.desc}: NIE ZNALEZIONO\n`);
                }
                
                if (tested === tests.length) {
                    db.close();
                    printSummary();
                }
            }
        );
    });
}

// Podsumowanie
function printSummary() {
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                     ✅ GOTOWE! ✅                            ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log('║                                                               ║');
    console.log(`║  Zaimportowano ${String(imported).padStart(4)} artykułów Kodeksu Cywilnego!       ║`);
    console.log('║                                                               ║');
    console.log('║  📋 MOŻESZ TERAZ:                                            ║');
    console.log('║  • Uruchomić aplikację                                        ║');
    console.log('║  • Wyszukać "art 444 kc"                                      ║');
    console.log('║  • Zobaczyć wszystkie paragrafy                               ║');
    console.log('║  • Użyć "Pokaż szerszy kontekst"                              ║');
    console.log('║                                                               ║');
    console.log('║  🎯 NASTĘPNY KROK:                                           ║');
    console.log('║  • Dodaj zmiany w ustawach                                    ║');
    console.log('║  • Dodaj orzeczenia TK/SN                                     ║');
    console.log('║  • Importuj kolejne kodeksy                                   ║');
    console.log('║                                                               ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
}
