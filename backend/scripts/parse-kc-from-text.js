// 📖 PARSER KODEKSU CYWILNEGO - z wklejonego tekstu

const fs = require('fs');
const path = require('path');

// TWÓJ TEKST - wklej tutaj cały Kodeks Cywilny
const KC_TEXT = `TUTAJ_WKLEJ_TEKST`;

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║                                                               ║');
console.log('║      📖 PARSER KODEKSU CYWILNEGO                              ║');
console.log('║                                                               ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

console.log(`📥 Długość tekstu: ${KC_TEXT.length} znaków\n`);

// REGEX dla artykułów - dopasowanie: "Art. 123." lub "Artykuł 123"
const articleRegex = /(?:^|\n)\s*Art\.\s*(\d+(?:\^?\d*)?)\s*\.\s*((?:(?!(?:^|\n)\s*Art\.\s*\d)[\s\S])*?)(?=(?:^|\n)\s*Art\.\s*\d|$)/gi;

const articles = [];
let match;
let count = 0;

console.log('🔍 PARSING: Wykrywanie artykułów...\n');

while ((match = articleRegex.exec(KC_TEXT)) !== null) {
    const articleNumber = match[1].trim();
    const articleContent = match[2].trim();
    
    if (articleContent.length > 20) { // Pomijamy puste/krótkie
        
        // Parsuj paragrafy
        const paragraphs = [];
        const paragraphRegex = /§\s*(\d+)\s*\.?\s*((?:(?!§\s*\d)[\s\S])*?)(?=§\s*\d|$)/gi;
        
        let parMatch;
        while ((parMatch = paragraphRegex.exec(articleContent)) !== null) {
            const parNumber = parMatch[1];
            const parContent = parMatch[2].trim();
            
            if (parContent.length > 10) {
                paragraphs.push({
                    number: parNumber,
                    content: parContent
                });
            }
        }
        
        // Jeśli nie ma paragrafów, całość to treść artykułu
        if (paragraphs.length === 0) {
            paragraphs.push({
                number: null,
                content: articleContent
            });
        }
        
        articles.push({
            number: articleNumber,
            paragraphs: paragraphs,
            fullContent: articleContent
        });
        
        count++;
        if (count % 50 === 0) {
            process.stdout.write(`\r✅ Sparsowano ${count} artykułów...`);
        }
    }
}

console.log(`\n\n✅ PARSING zakończony: ${articles.length} artykułów\n`);

// Statystyki
const withParagraphs = articles.filter(a => a.paragraphs.length > 1 || (a.paragraphs.length === 1 && a.paragraphs[0].number !== null));
const totalParagraphs = articles.reduce((sum, a) => sum + a.paragraphs.length, 0);

console.log('╔═══════════════════════════════════════════════════════╗');
console.log('║              RAPORT PARSINGU                          ║');
console.log('╠═══════════════════════════════════════════════════════╣');
console.log(`║ 📄 Artykułów:            ${String(articles.length).padStart(5)}                    ║`);
console.log(`║ § Paragrafów (total):    ${String(totalParagraphs).padStart(5)}                    ║`);
console.log(`║ 📋 Z paragrafami:        ${String(withParagraphs.length).padStart(5)}                    ║`);
console.log('╚═══════════════════════════════════════════════════════╝\n');

// Przykłady
console.log('📋 PRZYKŁADOWE ARTYKUŁY:\n');

const examples = ['1', '42', '444', '1000'];
examples.forEach(num => {
    const article = articles.find(a => a.number === num);
    if (article) {
        console.log(`📄 Art. ${article.number}:`);
        console.log(`   Paragrafów: ${article.paragraphs.length}`);
        if (article.paragraphs.length > 0 && article.paragraphs[0].number) {
            article.paragraphs.slice(0, 2).forEach(p => {
                console.log(`   § ${p.number} - ${p.content.substring(0, 80)}...`);
            });
        } else {
            console.log(`   ${article.fullContent.substring(0, 100)}...`);
        }
        console.log('');
    }
});

// Zapisz do JSON
const outputPath = path.join(__dirname, '../../logs/KC-parsed.json');
const logsDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalArticles: articles.length,
    articles: articles
}, null, 2));

console.log(`💾 Zapisano do: ${outputPath}\n`);

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║                     ✅ SUKCES! ✅                            ║');
console.log('╠═══════════════════════════════════════════════════════════════╣');
console.log('║                                                               ║');
console.log(`║  Sparsowano ${String(articles.length).padStart(4)} artykułów Kodeksu Cywilnego!       ║`);
console.log('║                                                               ║');
console.log('║  📋 NASTĘPNE KROKI:                                          ║');
console.log('║  1. Sprawdź logs/KC-parsed.json                               ║');
console.log('║  2. Import do bazy danych (create script)                     ║');
console.log('║  3. Test w aplikacji                                          ║');
console.log('║                                                               ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

module.exports = { articles };
