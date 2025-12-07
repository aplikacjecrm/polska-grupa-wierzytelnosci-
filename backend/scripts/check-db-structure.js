#!/usr/bin/env node
// 🔍 SPRAWDŹ STRUKTURĘ BAZY

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');

const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('❌ Błąd:', err.message);
        process.exit(1);
    }
});

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║              📊 STRUKTURA BAZY DANYCH                        ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// Sprawdź tabele
db.all(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`, [], (err, tables) => {
    if (err) {
        console.error('❌ Błąd:', err.message);
        db.close();
        return;
    }
    
    console.log('📋 TABELE W BAZIE:\n');
    tables.forEach(t => console.log(`   • ${t.name}`));
    console.log('');
    
    // Sprawdź czy są dane w legal_acts
    db.get(`SELECT COUNT(*) as count FROM legal_acts`, [], (err, row) => {
        if (err) {
            console.log('⚠️  Tabela legal_acts nie istnieje lub błąd\n');
        } else {
            console.log(`✅ legal_acts: ${row.count} wpisów\n`);
            
            // Pokaż co jest w legal_acts
            if (row.count > 0) {
                db.all(`SELECT id, code, title FROM legal_acts ORDER BY code`, [], (err, acts) => {
                    console.log('📚 ZAWARTOŚĆ legal_acts:\n');
                    console.log('ID  | KOD       | TYTUŁ');
                    console.log('─'.repeat(70));
                    acts.forEach(act => {
                        console.log(`${String(act.id).padStart(3)} | ${act.code.padEnd(9)} | ${act.title.substring(0, 50)}`);
                    });
                    console.log('');
                    db.close();
                });
            } else {
                console.log('⚠️  Tabela legal_acts jest PUSTA!\n');
                db.close();
            }
        }
    });
});
