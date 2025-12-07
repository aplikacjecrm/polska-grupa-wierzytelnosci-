#!/usr/bin/env node
// 📊 DASHBOARD POSTĘPU IMPORTU AKTÓW PRAWNYCH

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const TEMP_DIR = path.join(__dirname, '../temp');

// Lista wszystkich aktów
const ALL_ACTS = [
    // KODEKSY (11)
    { code: 'KC', name: 'Kodeks cywilny', priority: 1, category: 'KODEKSY' },
    { code: 'KPC', name: 'Kodeks postępowania cywilnego', priority: 2, category: 'KODEKSY' },
    { code: 'KK', name: 'Kodeks karny', priority: 3, category: 'KODEKSY' },
    { code: 'KPK', name: 'Kodeks postępowania karnego', priority: 4, category: 'KODEKSY' },
    { code: 'KP', name: 'Kodeks pracy', priority: 5, category: 'KODEKSY' },
    { code: 'KRO', name: 'Kodeks rodzinny i opiekuńczy', priority: 6, category: 'KODEKSY' },
    { code: 'KSH', name: 'Kodeks spółek handlowych', priority: 7, category: 'KODEKSY' },
    { code: 'KPA', name: 'Kodeks postępowania administracyjnego', priority: 8, category: 'KODEKSY' },
    { code: 'KW', name: 'Kodeks wykroczeń', priority: 9, category: 'KODEKSY' },
    { code: 'KKW', name: 'Kodeks karny wykonawczy', priority: 10, category: 'KODEKSY' },
    { code: 'KKS', name: 'Kodeks karny skarbowy', priority: 11, category: 'KODEKSY' },
    
    // PROCEDURY (3)
    { code: 'PPSA', name: 'Prawo o postępowaniu przed sądami administracyjnymi', priority: 12, category: 'PROCEDURY' },
    { code: 'PKC', name: 'Prawo o postępowaniu przed TK', priority: 13, category: 'PROCEDURY' },
    { code: 'PSP', name: 'Prawo o ustroju sądów powszechnych', priority: 14, category: 'PROCEDURY' },
    
    // SPECJALNE (5)
    { code: 'KW_WYBORCZY', name: 'Kodeks wyborczy', priority: 15, category: 'SPECJALNE' },
    { code: 'KM', name: 'Kodeks morski', priority: 16, category: 'SPECJALNE' },
    { code: 'PRD', name: 'Prawo o ruchu drogowym', priority: 17, category: 'SPECJALNE' },
    { code: 'LOTNICZE', name: 'Prawo lotnicze', priority: 18, category: 'SPECJALNE' },
    { code: 'MORSKIE', name: 'Prawo morskie', priority: 19, category: 'SPECJALNE' },
    
    // TOP GOSPODARCZE (10 najważniejszych)
    { code: 'DG', name: 'Prawo działalności gospodarczej', priority: 20, category: 'GOSPODARCZE' },
    { code: 'UOKIK', name: 'Ochrona konkurencji i konsumentów', priority: 21, category: 'GOSPODARCZE' },
    { code: 'BANKOWE', name: 'Prawo bankowe', priority: 22, category: 'GOSPODARCZE' },
    { code: 'UPADLOSCIOWE', name: 'Prawo upadłościowe', priority: 23, category: 'GOSPODARCZE' },
    { code: 'PODATKOWE', name: 'Ordynacja podatkowa', priority: 24, category: 'GOSPODARCZE' },
    { code: 'VAT', name: 'Ustawa o VAT', priority: 25, category: 'GOSPODARCZE' },
    
    // TOP NIERUCHOMOŚCI (5)
    { code: 'KSIEGI_WIECZYSTE', name: 'Księgi wieczyste i hipoteka', priority: 26, category: 'NIERUCHOMOŚCI' },
    { code: 'GOSPODARKA_NIERUCHOMOSCIAMI', name: 'Gospodarka nieruchomościami', priority: 27, category: 'NIERUCHOMOŚCI' },
    { code: 'PRAWO_BUDOWLANE', name: 'Prawo budowlane', priority: 28, category: 'NIERUCHOMOŚCI' },
    
    // TOP SOCJALNE (5)
    { code: 'ALIMENTY', name: 'Pomoc osobom uprawnionym do alimentów', priority: 29, category: 'SOCJALNE' },
    { code: 'UBEZPIECZENIA_SPOLECZNE', name: 'System ubezpieczeń społecznych', priority: 30, category: 'SOCJALNE' }
];

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║         📊 DASHBOARD POSTĘPU IMPORTU AKTÓW PRAWNYCH 📊       ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('❌ Nie można otworzyć bazy:', err.message);
        process.exit(1);
    }
});

// Sprawdź status każdego aktu
const status = [];

let checked = 0;
ALL_ACTS.forEach((act, index) => {
    const filePath = path.join(TEMP_DIR, `${act.code}-full.txt`);
    const fileExists = fs.existsSync(filePath);
    let fileSize = 0;
    let hasPastedText = false;
    
    if (fileExists) {
        const content = fs.readFileSync(filePath, 'utf-8');
        fileSize = content.length;
        hasPastedText = fileSize > 1000 && !content.includes('WKLEJ PONIŻEJ');
    }
    
    // Sprawdź w bazie
    db.get(
        `SELECT COUNT(*) as count FROM legal_acts WHERE title LIKE ?`,
        [`%${act.name}%`],
        (err, row) => {
            checked++;
            
            const articlesInDB = row ? row.count : 0;
            
            status.push({
                ...act,
                fileExists,
                fileSize,
                hasPastedText,
                articlesInDB,
                status: articlesInDB > 0 ? '✅ ZAIMPORTOWANE' : 
                        hasPastedText ? '🔄 GOTOWE DO IMPORTU' : 
                        fileExists ? '⏳ CZEKA NA WKLEJENIE' : 
                        '❌ BRAK PLIKU'
            });
            
            // Ostatni
            if (checked === ALL_ACTS.length) {
                displayDashboard(status);
                db.close();
            }
        }
    );
});

function displayDashboard(status) {
    // Statystyki
    const imported = status.filter(s => s.articlesInDB > 0).length;
    const readyToImport = status.filter(s => s.hasPastedText && s.articlesInDB === 0).length;
    const waitingForPaste = status.filter(s => s.fileExists && !s.hasPastedText).length;
    const total = status.length;
    
    const progress = Math.round((imported / total) * 100);
    
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    📊 STATYSTYKI OGÓLNE                      ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log(`║  ✅ Zaimportowane:       ${String(imported).padStart(2)}/${total}  (${String(progress).padStart(3)}%)                  ║`);
    console.log(`║  🔄 Gotowe do importu:   ${String(readyToImport).padStart(2)}                                  ║`);
    console.log(`║  ⏳ Czeka na wklejenie:  ${String(waitingForPaste).padStart(2)}                                  ║`);
    console.log(`║  ❌ Pozostałe:           ${String(total - imported - readyToImport - waitingForPaste).padStart(2)}                                  ║`);
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    // Pasek postępu
    const barLength = 50;
    const filled = Math.round((imported / total) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    console.log(`POSTĘP: [${bar}] ${progress}%\n`);
    
    // Szczegóły po kategoriach
    const categories = [...new Set(status.map(s => s.category))];
    
    categories.forEach(cat => {
        const acts = status.filter(s => s.category === cat);
        const catImported = acts.filter(a => a.articlesInDB > 0).length;
        const catTotal = acts.length;
        
        console.log(`\n📁 ${cat} (${catImported}/${catTotal}):\n`);
        
        acts.forEach(act => {
            const icon = act.articlesInDB > 0 ? '✅' : 
                        act.hasPastedText ? '🔄' : 
                        act.fileExists ? '⏳' : '❌';
            
            const artInfo = act.articlesInDB > 0 ? ` (${act.articlesInDB} art.)` : '';
            
            console.log(`   ${icon} ${String(act.priority).padStart(2)}. ${act.code.padEnd(30)} ${artInfo}`);
        });
    });
    
    // NASTĘPNE KROKI
    console.log('\n\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    🎯 NASTĘPNE KROKI                         ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    // Pokaż co zaimportować teraz
    const readyActs = status.filter(s => s.hasPastedText && s.articlesInDB === 0);
    if (readyActs.length > 0) {
        console.log('🔄 GOTOWE DO IMPORTU (uruchom teraz):\n');
        readyActs.slice(0, 5).forEach(act => {
            console.log(`   node backend/scripts/import-single-code.js ${act.code}`);
        });
        console.log('');
    }
    
    // Pokaż co wkleić
    const waitingActs = status.filter(s => s.fileExists && !s.hasPastedText && s.articlesInDB === 0);
    if (waitingActs.length > 0) {
        console.log('⏳ CZEKA NA WKLEJENIE TEKSTU:\n');
        waitingActs.slice(0, 5).forEach(act => {
            console.log(`   ${act.priority}. backend/temp/${act.code}-full.txt`);
        });
        console.log('');
    }
    
    // Kolejne do zrobienia
    const nextToDo = status
        .filter(s => s.articlesInDB === 0)
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 5);
    
    if (nextToDo.length > 0) {
        console.log('📋 KOLEJNE NA LIŚCIE (według priorytetu):\n');
        nextToDo.forEach(act => {
            console.log(`   ${act.priority}. ${act.name}`);
        });
        console.log('');
    }
    
    console.log('💡 Odśwież dashboard: node backend/scripts/dashboard.js\n');
}
