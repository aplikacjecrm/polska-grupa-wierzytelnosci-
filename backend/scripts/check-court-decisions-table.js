#!/usr/bin/env node
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY);

console.log('\n🔍 SPRAWDZAM STRUKTURĘ TABEL DLA ORZECZEŃ...\n');

// Sprawdź czy tabele istnieją
db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%decision%' OR name LIKE '%interpretation%' OR name LIKE '%amendment%'`, [], (err, tables) => {
    if (err) {
        console.error('❌ Błąd:', err.message);
        db.close();
        return;
    }
    
    console.log('📋 TABELE DLA ETAP 2:\n');
    
    if (tables.length === 0) {
        console.log('❌ BRAK TABEL! Trzeba je utworzyć.\n');
        console.log('💡 Uruchom: node backend/scripts/create-etap2-tables.js\n');
        db.close();
        return;
    }
    
    tables.forEach(t => console.log(`   ✅ ${t.name}`));
    console.log('');
    
    // Sprawdź strukturę court_decisions
    db.all(`PRAGMA table_info(court_decisions)`, [], (err, cols) => {
        if (err) {
            console.log('\n⚠️  Tabela court_decisions nie istnieje - trzeba utworzyć!\n');
            db.close();
            return;
        }
        
        console.log('📊 STRUKTURA TABELI court_decisions:\n');
        console.log('KOLUMNA              | TYP');
        console.log('─'.repeat(50));
        cols.forEach(c => {
            console.log(`${c.name.padEnd(20)} | ${c.type}`);
        });
        console.log('');
        
        // Sprawdź ile jest orzeczeń
        db.get(`SELECT COUNT(*) as count FROM court_decisions`, [], (err, row) => {
            if (row) {
                console.log(`📈 AKTUALNA LICZBA ORZECZEŃ: ${row.count}\n`);
            }
            
            if (row && row.count === 0) {
                console.log('╔═══════════════════════════════════════════════════════════════╗');
                console.log('║                  ✅ GOTOWE DO IMPORTU!                       ║');
                console.log('╠═══════════════════════════════════════════════════════════════╣');
                console.log('║                                                               ║');
                console.log('║  Struktura bazy jest GOTOWA!                                  ║');
                console.log('║                                                               ║');
                console.log('║  🚀 NASTĘPNY KROK:                                           ║');
                console.log('║  • Test SAOS API                                              ║');
                console.log('║  • Import orzeczeń dla Art. 444 KC (test)                    ║');
                console.log('║  • Import masowy                                              ║');
                console.log('║                                                               ║');
                console.log('╚═══════════════════════════════════════════════════════════════╝\n');
            }
            
            db.close();
        });
    });
});
