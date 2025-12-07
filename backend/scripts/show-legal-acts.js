#!/usr/bin/env node
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');

const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY);

console.log('\n🔍 STRUKTURA TABELI legal_acts:\n');

db.all(`PRAGMA table_info(legal_acts)`, [], (err, cols) => {
    if (err) {
        console.error('❌', err.message);
        db.close();
        return;
    }
    
    console.log('Kolumny:');
    cols.forEach(c => console.log(`  • ${c.name} (${c.type})`));
    console.log('\n');
    
    // Sprawdź dane
    db.all(`SELECT * FROM legal_acts LIMIT 5`, [], (err, rows) => {
        if (err) {
            console.error('❌', err.message);
        } else {
            console.log('📊 Pierwsze 5 wpisów:\n');
            rows.forEach(row => {
                console.log(row);
                console.log('---');
            });
        }
        db.close();
    });
});
