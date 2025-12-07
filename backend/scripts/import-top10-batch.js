#!/usr/bin/env node
// 🚀 ZBIORCZY IMPORT TOP 10 USTAW

const { spawn } = require('child_process');
const path = require('path');

const TOP_10_CODES = [
    'KC',           // 1. Już gotowe
    'KPC',          // 2.
    'KK',           // 3.
    'KP',           // 4.
    'KRO',          // 5.
    'PPSA',         // 6.
    'PODATKOWE',    // 7.
    'VAT',          // 8.
    'BANKOWE',      // 9.
    'UPADLOSCIOWE'  // 10.
];

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║         🚀 ZBIORCZY IMPORT TOP 10 USTAW 🚀                   ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

let currentIndex = 0;
const results = [];

function importNext() {
    if (currentIndex >= TOP_10_CODES.length) {
        // Wszystkie zakończone
        displaySummary();
        return;
    }
    
    const code = TOP_10_CODES[currentIndex];
    const num = currentIndex + 1;
    
    console.log(`\n📋 [${num}/10] Import: ${code}...\n`);
    console.log('═'.repeat(63) + '\n');
    
    const importScript = path.join(__dirname, 'import-single-code.js');
    const child = spawn('node', [importScript, code], {
        cwd: path.join(__dirname, '../../'),
        stdio: 'inherit'
    });
    
    child.on('close', (exitCode) => {
        results.push({
            code,
            success: exitCode === 0
        });
        
        if (exitCode === 0) {
            console.log(`\n✅ ${code} - Import zakończony sukcesem!\n`);
        } else {
            console.log(`\n❌ ${code} - Import nie powiódł się (kod: ${exitCode})\n`);
        }
        
        currentIndex++;
        
        // Krótka pauza przed następnym
        setTimeout(() => {
            importNext();
        }, 1000);
    });
    
    child.on('error', (err) => {
        console.error(`\n❌ Błąd uruchamiania importu ${code}:`, err.message);
        results.push({
            code,
            success: false,
            error: err.message
        });
        currentIndex++;
        setTimeout(() => {
            importNext();
        }, 1000);
    });
}

function displaySummary() {
    console.log('\n\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    📊 PODSUMOWANIE                           ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('📋 WYNIKI:\n');
    
    results.forEach((result, index) => {
        const icon = result.success ? '✅' : '❌';
        const status = result.success ? 'SUKCES' : 'BŁĄD';
        console.log(`   ${icon} ${String(index + 1).padStart(2)}. ${result.code.padEnd(15)} - ${status}`);
    });
    
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                     STATYSTYKI                               ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log(`║  ✅ Pomyślne:        ${String(successful).padStart(2)}/10                                   ║`);
    console.log(`║  ❌ Niepomyślne:     ${String(failed).padStart(2)}/10                                   ║`);
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    if (successful === TOP_10_CODES.length) {
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                  🎉 GRATULACJE! 🎉                           ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log('║                                                               ║');
        console.log('║  TOP 10 USTAW ZAIMPORTOWANE!                                  ║');
        console.log('║                                                               ║');
        console.log('║  🚀 NASTĘPNY KROK: ETAP 2                                    ║');
        console.log('║  Zobacz: ETAP-2-PLAN.md                                       ║');
        console.log('║                                                               ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    } else if (failed > 0) {
        console.log('⚠️  NIEKTÓRE IMPORTY NIE POWIODŁY SIĘ\n');
        console.log('💡 Sprawdź:');
        console.log('   1. Czy pliki .txt mają pełny tekst?');
        console.log('   2. Czy pliki są > 1000 znaków?');
        console.log('   3. Czy format jest prawidłowy (Art. 1., Art. 2...)?');
        console.log('\n📋 Uruchom ponownie dla niepowodzonych:\n');
        
        results.filter(r => !r.success).forEach(result => {
            console.log(`   node backend/scripts/import-single-code.js ${result.code}`);
        });
        console.log('');
    }
    
    console.log('💡 Sprawdź dashboard: node backend/scripts/dashboard-top10.js\n');
}

// Start!
console.log('⚠️  UWAGA: Ten skrypt zaimportuje WSZYSTKIE TOP 10 ustaw po kolei.\n');
console.log('💡 Upewnij się że wszystkie pliki .txt mają pełny tekst!\n');
console.log('📂 Pliki znajdują się w: backend/temp/\n');
console.log('⏱️  Czas trwania: ~5-10 minut (zależnie od rozmiaru ustaw)\n');

// Pauza 3 sekundy
console.log('🚀 Start za 3 sekundy...\n');

setTimeout(() => {
    importNext();
}, 3000);
