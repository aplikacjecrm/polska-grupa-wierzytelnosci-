#!/usr/bin/env node
// 🚀 IMPORT NOWYCH USTAW KTÓRE WŁAŚNIE WKLEJONO

const { spawn } = require('child_process');
const path = require('path');

// Ustawy które użytkownik wkleił
const NEW_CODES = [
    'KPC',  // Kodeks postępowania cywilnego
    'KK',   // Kodeks karny
    'KPK',  // Kodeks postępowania karnego
    'KP',   // Kodeks pracy
    'KW',   // Kodeks wyborczy
    'KSH',  // Kodeks spółek handlowych
    'PPSA', // Prawo o postępowaniu przed sądami admin
    'KRO',  // Kodeks rodzinny
    'KRD'   // Krajowy rejestr długów (jeśli jest w konfiguracji)
];

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║         🚀 IMPORT NOWYCH USTAW - BATCH 🚀                    ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

let currentIndex = 0;
const results = [];

function importNext() {
    if (currentIndex >= NEW_CODES.length) {
        displaySummary();
        return;
    }
    
    const code = NEW_CODES[currentIndex];
    const num = currentIndex + 1;
    
    console.log(`\n📋 [${num}/${NEW_CODES.length}] Import: ${code}...\n`);
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
            console.log(`\n✅ ${code} - SUKCES!\n`);
        } else {
            console.log(`\n⚠️ ${code} - Prawdopodobnie już zaimportowane lub błąd\n`);
        }
        
        currentIndex++;
        setTimeout(() => {
            importNext();
        }, 500);
    });
    
    child.on('error', (err) => {
        console.error(`\n❌ Błąd: ${code}:`, err.message);
        results.push({
            code,
            success: false,
            error: err.message
        });
        currentIndex++;
        setTimeout(() => {
            importNext();
        }, 500);
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
        const icon = result.success ? '✅' : '⚠️';
        const status = result.success ? 'SUKCES' : 'POMINIĘTE/BŁĄD';
        console.log(`   ${icon} ${String(index + 1).padStart(2)}. ${result.code.padEnd(10)} - ${status}`);
    });
    
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                     STATYSTYKI                               ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log(`║  ✅ Nowe importy:    ${String(successful).padStart(2)}/${NEW_CODES.length}                                   ║`);
    console.log(`║  ⚠️  Pominięte:      ${String(failed).padStart(2)}/${NEW_CODES.length}                                   ║`);
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    console.log('💡 Sprawdź pełny dashboard: node backend/scripts/dashboard.js\n');
}

// Start!
console.log('⏱️  Start za 2 sekundy...\n');

setTimeout(() => {
    importNext();
}, 2000);
