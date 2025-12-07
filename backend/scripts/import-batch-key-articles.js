#!/usr/bin/env node
// 📥 MASOWY IMPORT ORZECZEŃ DLA KLUCZOWYCH ARTYKUŁÓW

const { spawn } = require('child_process');
const path = require('path');

// Najważniejsze artykuły KC do zaimportowania
const KEY_ARTICLES = [
    { art: '415', name: 'Odpowiedzialność deliktowa', limit: 20 },
    { art: '446', name: 'Zadośćuczynienie', limit: 20 },
    { art: '361', name: 'Normalny związek przyczynowy', limit: 20 },
    { art: '388', name: 'Wina', limit: 15 },
    { art: '471', name: 'Odpowiedzialność kontraktowa', limit: 15 },
    { art: '405', name: 'Bezpodstawne wzbogacenie', limit: 10 },
    { art: '417', name: 'Odpowiedzialność za rzecz', limit: 10 }
];

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║         📥 MASOWY IMPORT ORZECZEŃ - KLUCZOWE ARTYKUŁY       ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

console.log(`📋 Planuję import dla ${KEY_ARTICLES.length} artykułów KC\n`);
console.log('ARTYKUŁ | NAZWA                           | LIMIT');
console.log('─'.repeat(70));

let totalPlanned = 0;
KEY_ARTICLES.forEach(item => {
    console.log(`Art. ${item.art.padEnd(3)} | ${item.name.padEnd(35)} | ${item.limit}`);
    totalPlanned += item.limit;
});

console.log('─'.repeat(70));
console.log(`RAZEM: ~${totalPlanned} orzeczeń\n`);

let currentIndex = 0;
const results = [];

console.log('⏱️  Start za 3 sekundy...\n');

setTimeout(() => {
    importNext();
}, 3000);

function importNext() {
    if (currentIndex >= KEY_ARTICLES.length) {
        displaySummary();
        return;
    }
    
    const article = KEY_ARTICLES[currentIndex];
    const num = currentIndex + 1;
    
    console.log(`\n📋 [${num}/${KEY_ARTICLES.length}] Import: Art. ${article.art} KC (${article.name})\n`);
    console.log('═'.repeat(63) + '\n');
    
    const importScript = path.join(__dirname, 'import-saos-decisions.js');
    const child = spawn('node', [importScript, article.art, 'KC', String(article.limit)], {
        cwd: path.join(__dirname, '../../'),
        stdio: 'inherit'
    });
    
    child.on('close', (exitCode) => {
        results.push({
            article: article.art,
            name: article.name,
            limit: article.limit,
            success: exitCode === 0
        });
        
        if (exitCode === 0) {
            console.log(`\n✅ Art. ${article.art} - SUKCES!\n`);
        } else {
            console.log(`\n⚠️ Art. ${article.art} - Problem\n`);
        }
        
        currentIndex++;
        
        // Krótka pauza
        setTimeout(() => {
            importNext();
        }, 2000);
    });
    
    child.on('error', (err) => {
        console.error(`\n❌ Błąd: ${article.art}:`, err.message);
        results.push({
            article: article.art,
            name: article.name,
            limit: article.limit,
            success: false
        });
        currentIndex++;
        setTimeout(() => {
            importNext();
        }, 2000);
    });
}

function displaySummary() {
    console.log('\n\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    📊 PODSUMOWANIE IMPORTU                   ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('📋 WYNIKI:\n');
    console.log('ARTYKUŁ | NAZWA                           | STATUS');
    console.log('─'.repeat(70));
    
    results.forEach((result) => {
        const icon = result.success ? '✅' : '❌';
        const status = result.success ? 'OK' : 'BŁĄD';
        console.log(`Art. ${result.article.padEnd(3)} | ${result.name.padEnd(35)} | ${icon} ${status}`);
    });
    
    console.log('─'.repeat(70));
    console.log(`RAZEM: ${successful}/${KEY_ARTICLES.length} artykułów pomyślnie\n`);
    
    if (successful > 0) {
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                  🎉 MASOWY IMPORT UKOŃCZONY! 🎉              ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log('║                                                               ║');
        console.log(`║  ✅ ${successful} artykułów zaimportowanych!${' '.repeat(Math.max(0, 33 - String(successful).length))}║`);
        console.log(`║  📊 ~${totalPlanned} orzeczeń dodanych do bazy!${' '.repeat(Math.max(0, 31 - String(totalPlanned).length))}║`);
        console.log('║                                                               ║');
        console.log('║  🔗 NASTĘPNY KROK:                                           ║');
        console.log('║  • Linkowanie wszystkich z artykułami                         ║');
        console.log('║  • Sprawdzenie w bazie                                        ║');
        console.log('║  • Frontend do wyświetlania                                   ║');
        console.log('║                                                               ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
        
        console.log('💡 Uruchom linkowanie:\n');
        console.log('   node backend/scripts/link-decisions-to-articles.js\n');
    }
}
