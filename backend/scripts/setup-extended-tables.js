#!/usr/bin/env node
// 🏗️ SETUP ROZSZERZONYCH TABEL

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const SQL_FILE = path.join(__dirname, '../database/create-extended-tables.sql');

console.log('\n🏗️  Tworzę rozszerzone tabele...\n');

const sql = fs.readFileSync(SQL_FILE, 'utf-8');
const db = new sqlite3.Database(DB_PATH);

db.exec(sql, (err) => {
    if (err) {
        console.error('❌ Błąd:', err);
        db.close();
        return;
    }
    
    console.log('✅ Tabele utworzone:\n');
    console.log('   📋 amending_acts - Akty zmieniające');
    console.log('   📋 executive_acts - Akty wykonawcze');
    console.log('   📋 consolidated_texts - Teksty jednolite');
    console.log('   📋 announced_texts - Ogłoszenia');
    console.log('   📋 legal_interpretations - Interpretacje');
    console.log('   📋 nsa_decisions - Orzeczenia NSA');
    console.log('\n✅ Infrastruktura gotowa!');
    
    db.close();
});
