#!/usr/bin/env node
// 🔄 CZYŚCI LEGAL_ACTS I IMPORTUJE 10 USTAW OD ZERA

const { spawn } = require('child_process');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');

// 10 USTAW UŻYTKOWNIKA
const CODES = ['KC', 'KPC', 'KK', 'KPK', 'KP', 'KRO', 'KSH', 'KW', 'PPSA', 'PRD'];

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║         🔄 RESET I IMPORT 10 USTAW                           ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

console.log('⚠️  KROK 1: Czyszczę starą tabelę legal_acts...\n');

const db = new sqlite3.Database(DB_PATH);

db.run(`DELETE FROM legal_acts`, [], (err) => {
    if (err) {
        console.error('❌ Błąd czyszczenia:', err.message);
        db.close();
        return;
    }
    
    console.log('✅ Tabela legal_acts wyczyszczona!\n');
    console.log('⚠️  KROK 2: Importuję 10 ustaw...\n');
    console.log('═'.repeat(63) + '\n');
    
    db.close();
    
    // Importuj
    importNext(0);
});

function importNext(index) {
    if (index >= CODES.length) {
        console.log('\n\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                    ✅ GOTOWE!                                ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
        console.log('💡 Sprawdź: node backend/scripts/dashboard.js\n');
        return;
    }
    
    const code = CODES[index];
    const num = index + 1;
    
    console.log(`📋 [${num}/10] Import: ${code}...\n`);
    
    const importScript = path.join(__dirname, 'import-single-code.js');
    const child = spawn('node', [importScript, code], {
        cwd: path.join(__dirname, '../../'),
        stdio: 'inherit'
    });
    
    child.on('close', (exitCode) => {
        if (exitCode === 0) {
            console.log(`\n✅ ${code} - OK!\n`);
        } else {
            console.log(`\n⚠️ ${code} - Problem (kod: ${exitCode})\n`);
        }
        
        setTimeout(() => {
            importNext(index + 1);
        }, 1000);
    });
    
    child.on('error', (err) => {
        console.error(`\n❌ ${code}:`, err.message);
        setTimeout(() => {
            importNext(index + 1);
        }, 1000);
    });
}
