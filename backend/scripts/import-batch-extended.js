#!/usr/bin/env node
// 📥 ROZSZERZONY MASOWY IMPORT - KC, KPC, KK, KP

const { spawn } = require('child_process');
const path = require('path');

// Kolejna porcja kluczowych artykułów z różnych kodeksów
const EXTENDED_ARTICLES = [
    // Dalsze artykuły KC
    { art: '387', code: 'KC', name: 'Odpowiedzialność z winy', limit: 15 },
    { art: '353', code: 'KC', name: 'Zasada swobody umów', limit: 15 },
    { art: '354', code: 'KC', name: 'Skutki umowy', limit: 10 },
    { art: '56', code: 'KC', name: 'Czynność prawna', limit: 10 },
    { art: '58', code: 'KC', name: 'Nieważność bezwzględna', limit: 15 },
    
    // Kodeks postępowania cywilnego (KPC)
    { art: '233', code: 'KPC', name: 'Swobodna ocena dowodów', limit: 20 },
    { art: '328', code: 'KPC', name: 'Uzasadnienie wyroku', limit: 15 },
    { art: '378', code: 'KPC', name: 'Koszty procesu', limit: 10 },
    { art: '217', code: 'KPC', name: 'Bezpłatna pomoc prawna', limit: 10 },
    
    // Kodeks karny (KK)
    { art: '148', code: 'KK', name: 'Zabójstwo', limit: 20 },
    { art: '278', code: 'KK', name: 'Kradzież', limit: 15 },
    { art: '286', code: 'KK', name: 'Oszustwo', limit: 15 },
    { art: '13', code: 'KK', name: 'Czyn zabroniony', limit: 10 },
    
    // Kodeks pracy (KP)
    { art: '45', code: 'KP', name: 'Rozwiązanie bez wypowiedzenia', limit: 15 },
    { art: '94', code: 'KP', name: 'Obowiązki pracodawcy', limit: 10 },
    { art: '183a', code: 'KP', name: 'Mobbing', limit: 15 }
];

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║         📥 ROZSZERZONY MASOWY IMPORT ORZECZEŃ                ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

console.log(`📋 Planuję import dla ${EXTENDED_ARTICLES.length} artykułów z różnych kodeksów\n`);
console.log('ARTYKUŁ      | KODEKS | NAZWA                           | LIMIT');
console.log('─'.repeat(80));

let totalPlanned = 0;
EXTENDED_ARTICLES.forEach(item => {
    console.log(`Art. ${item.art.padEnd(7)} | ${item.code.padEnd(6)} | ${item.name.padEnd(35)} | ${item.limit}`);
    totalPlanned += item.limit;
});

console.log('─'.repeat(80));
console.log(`RAZEM: ~${totalPlanned} nowych orzeczeń\n`);

let currentIndex = 0;
const results = [];

console.log('⏱️  Start za 3 sekundy...\n');

setTimeout(() => {
    importNext();
}, 3000);

function importNext() {
    if (currentIndex >= EXTENDED_ARTICLES.length) {
        displaySummary();
        return;
    }
    
    const article = EXTENDED_ARTICLES[currentIndex];
    const num = currentIndex + 1;
    
    console.log(`\n📋 [${num}/${EXTENDED_ARTICLES.length}] Import: Art. ${article.art} ${article.code} (${article.name})\n`);
    console.log('═'.repeat(63) + '\n');
    
    const importScript = path.join(__dirname, 'import-saos-decisions.js');
    const child = spawn('node', [importScript, article.art, article.code, String(article.limit)], {
        cwd: path.join(__dirname, '../../'),
        stdio: 'inherit'
    });
    
    child.on('close', (exitCode) => {
        results.push({
            article: article.art,
            code: article.code,
            name: article.name,
            limit: article.limit,
            success: exitCode === 0
        });
        
        if (exitCode === 0) {
            console.log(`\n✅ Art. ${article.art} ${article.code} - SUKCES!\n`);
        } else {
            console.log(`\n⚠️ Art. ${article.art} ${article.code} - Problem\n`);
        }
        
        currentIndex++;
        
        // Krótka pauza
        setTimeout(() => {
            importNext();
        }, 2000);
    });
    
    child.on('error', (err) => {
        console.error(`\n❌ Błąd: ${article.art} ${article.code}:`, err.message);
        results.push({
            article: article.art,
            code: article.code,
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
    console.log('║             📊 PODSUMOWANIE ROZSZERZONEGO IMPORTU            ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('📋 WYNIKI:\n');
    console.log('ARTYKUŁ      | KODEKS | NAZWA                           | STATUS');
    console.log('─'.repeat(80));
    
    // Grupuj po kodeksach
    const byCode = {};
    results.forEach(r => {
        if (!byCode[r.code]) byCode[r.code] = [];
        byCode[r.code].push(r);
    });
    
    Object.keys(byCode).sort().forEach(code => {
        console.log(`\n${code}:`);
        byCode[code].forEach(result => {
            const icon = result.success ? '✅' : '❌';
            const status = result.success ? 'OK' : 'BŁĄD';
            console.log(`Art. ${result.article.padEnd(7)} | ${result.code.padEnd(6)} | ${result.name.padEnd(35)} | ${icon} ${status}`);
        });
    });
    
    console.log('\n' + '─'.repeat(80));
    console.log(`RAZEM: ${successful}/${EXTENDED_ARTICLES.length} artykułów pomyślnie\n`);
    
    if (successful > 0) {
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║              🎉 ROZSZERZONY IMPORT UKOŃCZONY! 🎉             ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log('║                                                               ║');
        console.log(`║  ✅ ${successful} artykułów zaimportowanych!${' '.repeat(Math.max(0, 33 - String(successful).length))}║`);
        console.log(`║  📊 ~${totalPlanned} nowych orzeczeń!${' '.repeat(Math.max(0, 36 - String(totalPlanned).length))}║`);
        console.log('║                                                               ║');
        console.log('║  📚 MASZ TERAZ:                                               ║');
        console.log('║  • KC - odpowiedzialność, umowy, czynności prawne             ║');
        console.log('║  • KPC - postępowanie, dowody, koszty                         ║');
        console.log('║  • KK - przestępstwa (zabójstwo, kradzież, oszustwo)         ║');
        console.log('║  • KP - prawo pracy (rozwiązanie, mobbing)                    ║');
        console.log('║                                                               ║');
        console.log('║  🔗 NASTĘPNY KROK:                                           ║');
        console.log('║  • Linkowanie wszystkich z artykułami                         ║');
        console.log('║  • Frontend do wyświetlania                                   ║');
        console.log('║                                                               ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
        
        console.log('💡 Uruchom linkowanie:\n');
        console.log('   node backend/scripts/link-decisions-to-articles.js\n');
    }
}
