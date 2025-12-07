#!/usr/bin/env node
// 🚀 IMPORT 3 NOWYCH USTAW

const { spawn } = require('child_process');
const path = require('path');

const NEW_CODES = ['KPA', 'KKW', 'KKS'];

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║         🚀 IMPORT 3 NOWYCH USTAW                             ║');
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
    
    console.log(`\n📋 [${num}/3] Import: ${code}...\n`);
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
            console.log(`\n❌ ${code} - BŁĄD (kod: ${exitCode})\n`);
        }
        
        currentIndex++;
        setTimeout(() => {
            importNext();
        }, 1000);
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
        console.log(`   ${icon} ${String(index + 1).padStart(2)}. ${result.code.padEnd(10)} - ${status}`);
    });
    
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                     STATYSTYKI                               ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log(`║  ✅ Zaimportowane:   ${String(successful).padStart(2)}/3                                   ║`);
    console.log(`║  ❌ Błędy:           ${String(failed).padStart(2)}/3                                   ║`);
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    if (successful === NEW_CODES.length) {
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                  🎉 SUKCES! 🎉                               ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log('║                                                               ║');
        console.log('║  MASZ TERAZ 13 USTAW!                                         ║');
        console.log('║                                                               ║');
        console.log('║  Sprawdź: node backend/scripts/final-13.js                    ║');
        console.log('║                                                               ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    }
}

// Start!
console.log('⏱️  Start za 2 sekundy...\n');

setTimeout(() => {
    importNext();
}, 2000);
