// 🚀 PARSER I IMPORTER KODEKSU CYWILNEGO

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║         📖 PARSER & IMPORTER KODEKSU CYWILNEGO 📖            ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// Wczytaj tekst z pliku
const sourceFile = path.join(__dirname, '../temp/kc-source.txt');

if (!fs.existsSync(sourceFile)) {
    console.error('❌ Brak pliku źródłowego!');
    console.log('💡 Wklej pełny tekst KC do: backend/temp/kc-source.txt\n');
    process.exit(1);
}

const kcText = fs.readFileSync(sourceFile, 'utf-8');
console.log(`✅ Wczytano ${kcText.length} znaków\n`);

// PARSING
console.log('🔍 KROK 1/3: Parsing struktury...\n');

const articleRegex = /Art\.\s*(\d+(?:\^?\d*)?)\s*\.?\s*((?:(?!Art\.\s*\d)[\s\S])*?)(?=Art\.\s*\d|$)/gi;
const articles = [];
let match;
let count = 0;

while ((match = articleRegex.exec(kcText)) !== null) {
    const articleNumber = match[1].trim();
    let articleContent = match[2].trim();
    
    // Usuń "(uchylony)" z treści
    if (articleContent.includes('(uchylony)')) {
        articleContent = '(uchylony)';
    }
    
    if (articleContent.length > 5) {
        // Parsuj paragrafy
        const paragraphs = [];
        const paragraphRegex = /§\s*(\d+)\s*\.?\s*((?:(?!§\s*\d)[\s\S])*?)(?=§\s*\d|$)/gi;
        
        let parMatch;
        while ((parMatch = paragraphRegex.exec(articleContent)) !== null) {
            const parNumber = parMatch[1];
            const parContent = parMatch[2].trim();
            
            if (parContent.length > 5) {
                paragraphs.push({
                    number: parNumber,
                    content: parContent
                });
            }
        }
        
        // Jeśli nie ma paragrafów, całość to treść
        const hasParagraphs = paragraphs.length > 0;
        
        articles.push({
            number: articleNumber,
            paragraphs: hasParagraphs ? paragraphs : null,
            fullContent: articleContent,
            hasParagraphs: hasParagraphs
        });
        
        count++;
        if (count % 10 === 0) {
            process.stdout.write(`\r   Sparsowano ${count} artykułów...`);
        }
    }
}

console.log(`\n✅ Sparsowano ${articles.length} artykułów\n`);

// Statystyki
const withParagraphs = articles.filter(a => a.hasParagraphs);
const totalParagraphs = articles.reduce((sum, a) => sum + (a.paragraphs ? a.paragraphs.length : 0), 0);

console.log('📊 Statystyki:');
console.log(`   Artykułów: ${articles.length}`);
console.log(`   Z paragrafami: ${withParagraphs.length}`);
console.log(`   Paragrafów (total): ${totalParagraphs}\n`);

// IMPORT DO BAZY
console.log('💾 KROK 2/3: Import do bazy danych...\n');

const dbPath = path.join(__dirname, '../../database/komunikator.db');
const db = new sqlite3.Database(dbPath);

let imported = 0;
let errors = 0;

db.serialize(() => {
    // Usuń stare wpisy KC
    db.run(`DELETE FROM legal_acts WHERE title LIKE '%Kodeks cywilny%'`, (err) => {
        if (err) {
            console.error('Błąd usuwania:', err);
        }
    });
    
    articles.forEach((article, index) => {
        const title = `Kodeks cywilny - Art. ${article.number}`;
        const content = formatArticleForDB(article);
        const url = 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640160093';
        const date = '1964-04-23';
        
        db.run(
            `INSERT INTO legal_acts (title, content, date, url, created_at) VALUES (?, ?, ?, ?, datetime('now'))`,
            [title, content, date, url],
            function(err) {
                if (err) {
                    errors++;
                    console.error(`❌ Błąd przy Art. ${article.number}:`, err.message);
                } else {
                    imported++;
                    if (imported % 10 === 0) {
                        process.stdout.write(`\r   Zaimportowano ${imported}/${articles.length}...`);
                    }
                }
                
                // Ostatni artykuł
                if (index === articles.length - 1) {
                    setTimeout(() => {
                        console.log(`\n\n✅ Import zakończony: ${imported} artykułów, ${errors} błędów\n`);
                        
                        // TEST
                        testImport(db);
                    }, 100);
                }
            }
        );
    });
});

// Formatuj artykuł do bazy
function formatArticleForDB(article) {
    let content = `Art. ${article.number}\n\n`;
    
    if (article.hasParagraphs && article.paragraphs) {
        article.paragraphs.forEach(p => {
            content += `§ ${p.number}. ${p.content}\n\n`;
        });
    } else {
        content += article.fullContent;
    }
    
    return content.trim();
}

// Test importu
function testImport(db) {
    console.log('🧪 KROK 3/3: Test importu...\n');
    
    const testArticles = ['1', '444', '1000'];
    let tested = 0;
    
    testArticles.forEach(artNum => {
        db.get(
            `SELECT * FROM legal_acts WHERE title LIKE ? ORDER BY created_at DESC LIMIT 1`,
            [`%Art. ${artNum}%`],
            (err, row) => {
                tested++;
                
                if (err) {
                    console.error(`❌ Błąd testu Art. ${artNum}:`, err.message);
                } else if (row) {
                    console.log(`✅ Art. ${artNum} - OK (${row.content.substring(0, 60)}...)`);
                } else {
                    console.log(`⚠️  Art. ${artNum} - NIE ZNALEZIONO`);
                }
                
                if (tested === testArticles.length) {
                    db.close();
                    
                    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
                    console.log('║                     ✅ GOTOWE! ✅                            ║');
                    console.log('╠═══════════════════════════════════════════════════════════════╣');
                    console.log('║                                                               ║');
                    console.log(`║  Zaimportowano ${String(imported).padStart(4)} artykułów do bazy!                 ║`);
                    console.log('║                                                               ║');
                    console.log('║  📋 MOŻESZ TERAZ TESTOWAĆ W APLIKACJI:                       ║');
                    console.log('║  • Wyszukaj "art 444 kc"                                      ║');
                    console.log('║  • Zobacz wszystkie paragrafy                                 ║');
                    console.log('║  • Użyj "Pokaż szerszy kontekst"                              ║');
                    console.log('║                                                               ║');
                    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
                }
            }
        );
    });
}
