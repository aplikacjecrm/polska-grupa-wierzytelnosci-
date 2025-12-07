#!/usr/bin/env node
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY);

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║              📊 STATUS ETAP 2 - WSZYSTKIE TABELE            ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

const checks = [
    { table: 'court_decisions', name: 'Orzeczenia TK/SN/NSA', icon: '⚖️' },
    { table: 'decision_articles', name: 'Linki orzeczenia→artykuły', icon: '🔗' },
    { table: 'interpretations', name: 'Interpretacje ministerialne', icon: '📋' },
    { table: 'interpretation_articles', name: 'Linki interpretacje→artykuły', icon: '🔗' },
    { table: 'amendments', name: 'Zmiany w ustawach', icon: '📝' },
    { table: 'announcements', name: 'Teksty jednolite (obwieszczenia)', icon: '📜' }
];

let completed = 0;

checks.forEach((check, index) => {
    db.get(`SELECT COUNT(*) as count FROM ${check.table}`, [], (err, row) => {
        completed++;
        
        if (err) {
            console.log(`${check.icon} ${check.name.padEnd(40)} | ❌ BRAK TABELI`);
        } else {
            const count = row ? row.count : 0;
            const status = count > 0 ? '✅' : '⏳';
            console.log(`${check.icon} ${check.name.padEnd(40)} | ${status} ${count} wpisów`);
        }
        
        if (completed === checks.length) {
            displaySummary();
        }
    });
});

function displaySummary() {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    🎯 CO TERAZ DODAĆ?                        ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log('║                                                               ║');
    console.log('║  1️⃣  ORZECZENIA TK (Trybunał Konstytucyjny)                 ║');
    console.log('║     • Scraper trybunal.gov.pl                                 ║');
    console.log('║     • Parser wyroków TK                                       ║');
    console.log('║     • Linkowanie z artykułami                                 ║');
    console.log('║                                                               ║');
    console.log('║  2️⃣  ZMIANY W USTAWACH (amendments)                          ║');
    console.log('║     • Historia zmian od 1964                                  ║');
    console.log('║     • Nowelizacje                                             ║');
    console.log('║     • Kto zmienił i kiedy                                     ║');
    console.log('║                                                               ║');
    console.log('║  3️⃣  AKTY WYKONAWCZE (rozporządzenia)                        ║');
    console.log('║     • Rozporządzenia na podstawie ustaw                       ║');
    console.log('║     • Zarządzenia ministrów                                   ║');
    console.log('║                                                               ║');
    console.log('║  4️⃣  TEKSTY JEDNOLITE (announcements)                        ║');
    console.log('║     • Obwieszczenia Marszałka Sejmu                           ║');
    console.log('║     • Aktualne brzmienia ustaw                                ║');
    console.log('║                                                               ║');
    console.log('║  5️⃣  INTERPRETACJE MINISTERIALNE                             ║');
    console.log('║     • Ministerstwo Sprawiedliwości                            ║');
    console.log('║     • Ministerstwo Finansów                                   ║');
    console.log('║                                                               ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    console.log('💡 STRATEGIA: Robię po kolei!\n');
    console.log('🚀 Zaczynam od najbardziej użytecznych:\n');
    console.log('   1. Orzeczenia TK (najważniejsze!)');
    console.log('   2. Zmiany w ustawach (historia)');
    console.log('   3. Reszta\n');
    
    db.close();
}
