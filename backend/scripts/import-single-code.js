#!/usr/bin/env node
// 🚀 IMPORTER POJEDYNCZEGO KODEKSU

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Konfiguracja kodeksów
const CODES = {
    'KC': {
        name: 'Kodeks cywilny',
        date: '1964-04-23',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640160093'
    },
    'KPC': {
        name: 'Kodeks postępowania cywilnego',
        date: '1964-11-17',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640430296'
    },
    'KK': {
        name: 'Kodeks karny',
        date: '1997-06-06',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970880553'
    },
    'KPK': {
        name: 'Kodeks postępowania karnego',
        date: '1997-06-06',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970890555'
    },
    'KP': {
        name: 'Kodeks pracy',
        date: '1974-06-26',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19740240141'
    },
    'KRO': {
        name: 'Kodeks rodzinny i opiekuńczy',
        date: '1964-02-25',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640090059'
    },
    'KSH': {
        name: 'Kodeks spółek handlowych',
        date: '2000-09-15',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20000941037'
    },
    'KPA': {
        name: 'Kodeks postępowania administracyjnego',
        date: '1960-06-14',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19600300168'
    },
    'KW': {
        name: 'Kodeks wykroczeń',
        date: '1971-05-20',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19710120114'
    },
    'KKW': {
        name: 'Kodeks karny wykonawczy',
        date: '1997-06-06',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970900557'
    },
    'KKS': {
        name: 'Kodeks karny skarbowy',
        date: '1999-09-10',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19991160001'
    },
    'PPSA': {
        name: 'Prawo o postępowaniu przed sądami administracyjnymi',
        date: '2002-08-30',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20021531270'
    },
    'PRD': {
        name: 'Prawo o ruchu drogowym',
        date: '1997-06-20',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970980602'
    }
};

// Argumenty
const codeArg = process.argv[2];
const debug = process.argv.includes('--debug');

if (!codeArg || !CODES[codeArg.toUpperCase()]) {
    console.log('\n❌ Podaj kod ustawy!\n');
    console.log('📋 Dostępne kody:');
    Object.keys(CODES).forEach(code => {
        console.log(`   ${code} - ${CODES[code].name}`);
    });
    console.log('\n💡 Użycie: node import-single-code.js KC\n');
    process.exit(1);
}

const CODE = codeArg.toUpperCase();
const codeConfig = CODES[CODE];
const sourceFile = path.join(__dirname, `../temp/${CODE}-full.txt`);
const DB_PATH = path.join(__dirname, '../../data/komunikator.db');

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log(`║         📖 IMPORT: ${codeConfig.name.toUpperCase().padEnd(42)}║`);
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// Sprawdź plik
if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Brak pliku: ${sourceFile}\n`);
    console.log('💡 STWÓRZ PLIK I WKLEJ TEKST:');
    console.log(`   backend/temp/${CODE}-full.txt\n`);
    console.log('📋 Źródło:');
    console.log(`   ${codeConfig.url}\n`);
    process.exit(1);
}

// Wczytaj
const text = fs.readFileSync(sourceFile, 'utf-8');
console.log(`✅ Wczytano ${text.length} znaków\n`);

if (text.length < 1000) {
    console.error('⚠️  Plik wygląda na pusty lub za krótki!\n');
    console.log('💡 Wklej pełny tekst ustawy do pliku.\n');
    process.exit(1);
}

// PARSING
console.log('🔍 KROK 1/4: Parsing artykułów...\n');

const articleRegex = /Art\.\s*(\d+(?:\^?\d*)?[a-z]?)\s*\.?\s*((?:(?!Art\.\s*\d)[\s\S])*?)(?=(?:^|\n)\s*Art\.\s*\d|$)/gim;
const articles = [];
let match;
let count = 0;

while ((match = articleRegex.exec(text)) !== null) {
    const articleNumber = match[1].trim();
    let articleContent = match[2].trim();
    
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

if (articles.length === 0) {
    console.error('❌ Nie znaleziono żadnych artykułów!\n');
    console.log('💡 Sprawdź czy tekst jest w prawidłowym formacie.\n');
    process.exit(1);
}

// Statystyki
const withParagraphs = articles.filter(a => a.hasParagraphs);
const totalParagraphs = articles.reduce((sum, a) => sum + a.paragraphs.length, 0);

console.log('📊 KROK 2/4: Statystyki:\n');
console.log(`   📄 Artykułów: ${articles.length}`);
console.log(`   § Z paragrafami: ${withParagraphs.length}`);
console.log(`   § Paragrafów (total): ${totalParagraphs}\n`);

// DEBUG - pokaż przykłady
if (debug) {
    console.log('🔍 DEBUG - Przykłady:\n');
    articles.slice(0, 3).forEach(a => {
        console.log(`   Art. ${a.number}:`);
        console.log(`   ${a.fullContent.substring(0, 100)}...\n`);
    });
}

// IMPORT
console.log('💾 KROK 3/4: Import do bazy danych...\n');

const db = new sqlite3.Database(DB_PATH);

let imported = 0;
let errors = 0;

db.serialize(() => {
    // Usuń stare wpisy tego kodeksu
    const deletePattern = `%${codeConfig.name}%`;
    db.run(`DELETE FROM legal_acts WHERE title LIKE ?`, [deletePattern], (err) => {
        if (err) {
            console.error('   ⚠️  Błąd usuwania:', err.message);
        } else {
            console.log(`   ✅ Usunięto stare wpisy ${CODE}\n`);
        }
    });
    
    // Import nowych
    const stmt = db.prepare(`
        INSERT INTO legal_acts (title, content, date, url, source, created_at, updated_at) 
        VALUES (?, ?, ?, ?, 'isap', datetime('now'), datetime('now'))
    `);
    
    articles.forEach((article, index) => {
        const title = `${codeConfig.name} - Art. ${article.number}`;
        const content = formatArticle(article, CODE);
        
        stmt.run([title, content, codeConfig.date, codeConfig.url], function(err) {
            if (err) {
                errors++;
                if (debug) {
                    console.error(`   ❌ Art. ${article.number}: ${err.message}`);
                }
            } else {
                imported++;
                if (imported % 100 === 0) {
                    process.stdout.write(`\r   Zaimportowano ${imported}/${articles.length}...`);
                }
            }
            
            if (index === articles.length - 1) {
                stmt.finalize();
                
                setTimeout(() => {
                    console.log(`\n\n✅ Import zakończony: ${imported} OK, ${errors} błędów\n`);
                    runTests(db);
                }, 200);
            }
        });
    });
});

// Format artykułu
function formatArticle(article, code) {
    let content = `${code} Art. ${article.number}\n\n`;
    
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
    
    // Test losowych artykułów
    const testNumbers = ['1', articles[Math.floor(articles.length / 2)]?.number, articles[articles.length - 1]?.number].filter(Boolean);
    
    let tested = 0;
    
    testNumbers.forEach(artNum => {
        db.get(
            `SELECT * FROM legal_acts WHERE title LIKE ? ORDER BY created_at DESC LIMIT 1`,
            [`%${codeConfig.name}%Art. ${artNum}%`],
            (err, row) => {
                tested++;
                
                if (err) {
                    console.log(`   ❌ Art. ${artNum}: BŁĄD`);
                } else if (row) {
                    console.log(`   ✅ Art. ${artNum}: OK`);
                    if (debug) {
                        console.log(`      "${row.content.substring(0, 60)}..."\n`);
                    }
                } else {
                    console.log(`   ⚠️  Art. ${artNum}: NIE ZNALEZIONO`);
                }
                
                if (tested === testNumbers.length) {
                    db.close();
                    printSummary();
                }
            }
        );
    });
}

// Podsumowanie
function printSummary() {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                     ✅ GOTOWE! ✅                            ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log('║                                                               ║');
    console.log(`║  ${CODE} - Zaimportowano ${String(imported).padStart(4)} artykułów!                   ║`);
    console.log('║                                                               ║');
    console.log('║  📋 MOŻESZ TERAZ:                                            ║');
    console.log('║  • Testować w aplikacji                                       ║');
    console.log(`║  • Wyszukiwać "art 1 ${CODE.toLowerCase()}"                                      ║`);
    console.log('║  • Używać wszystkich funkcji                                  ║');
    console.log('║                                                               ║');
    console.log('║  🎯 NASTĘPNY KODEKS:                                         ║');
    console.log('║  • Wklej kolejny do backend/temp/XXX-full.txt                 ║');
    console.log('║  • Uruchom: node import-single-code.js XXX                    ║');
    console.log('║                                                               ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
}
