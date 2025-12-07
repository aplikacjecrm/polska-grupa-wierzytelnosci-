#!/usr/bin/env node
// 🗄️ TWORZENIE TABEL DLA ETAP 2

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║         🗄️  TWORZENIE TABEL DLA ETAP 2                       ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

const db = new sqlite3.Database(DB_PATH);

const tables = [
    {
        name: 'court_decisions',
        sql: `CREATE TABLE IF NOT EXISTS court_decisions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            court_type TEXT NOT NULL,
            signature TEXT NOT NULL UNIQUE,
            decision_date DATE NOT NULL,
            decision_type TEXT,
            result TEXT,
            summary TEXT,
            full_text TEXT,
            judge_name TEXT,
            source_url TEXT,
            legal_base TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'decision_articles',
        sql: `CREATE TABLE IF NOT EXISTS decision_articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            decision_id INTEGER NOT NULL,
            legal_act_id INTEGER NOT NULL,
            article_reference TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (decision_id) REFERENCES court_decisions(id),
            FOREIGN KEY (legal_act_id) REFERENCES legal_acts(id)
        )`
    },
    {
        name: 'interpretations',
        sql: `CREATE TABLE IF NOT EXISTS interpretations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            issuer TEXT NOT NULL,
            reference_number TEXT NOT NULL UNIQUE,
            issue_date DATE NOT NULL,
            title TEXT,
            summary TEXT,
            full_text TEXT,
            category TEXT,
            source_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'interpretation_articles',
        sql: `CREATE TABLE IF NOT EXISTS interpretation_articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            interpretation_id INTEGER NOT NULL,
            legal_act_id INTEGER NOT NULL,
            article_reference TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (interpretation_id) REFERENCES interpretations(id),
            FOREIGN KEY (legal_act_id) REFERENCES legal_acts(id)
        )`
    },
    {
        name: 'amendments',
        sql: `CREATE TABLE IF NOT EXISTS amendments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            legal_act_id INTEGER NOT NULL,
            amendment_date DATE NOT NULL,
            journal_reference TEXT NOT NULL,
            amendment_type TEXT,
            affected_articles TEXT,
            summary TEXT,
            full_text TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (legal_act_id) REFERENCES legal_acts(id)
        )`
    },
    {
        name: 'announcements',
        sql: `CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            legal_act_id INTEGER NOT NULL,
            announcement_date DATE NOT NULL,
            journal_reference TEXT NOT NULL,
            unified_text_url TEXT,
            summary TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (legal_act_id) REFERENCES legal_acts(id)
        )`
    }
];

let created = 0;
let errors = 0;

console.log('📋 Tworzę tabele...\n');

db.serialize(() => {
    tables.forEach((table, index) => {
        db.run(table.sql, (err) => {
            if (err) {
                console.error(`   ❌ ${table.name}: ${err.message}`);
                errors++;
            } else {
                console.log(`   ✅ ${table.name}`);
                created++;
            }
            
            // Ostatnia tabela
            if (index === tables.length - 1) {
                setTimeout(() => {
                    displaySummary();
                }, 100);
            }
        });
    });
});

function displaySummary() {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    📊 PODSUMOWANIE                           ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log(`║  ✅ Utworzone tabele:  ${String(created).padStart(2)}/${tables.length}                                ║`);
    console.log(`║  ❌ Błędy:             ${String(errors).padStart(2)}/${tables.length}                                ║`);
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    if (created === tables.length) {
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                  🎉 SUKCES! 🎉                               ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log('║                                                               ║');
        console.log('║  Struktura bazy dla ETAP 2 GOTOWA!                            ║');
        console.log('║                                                               ║');
        console.log('║  📋 UTWORZONE TABELE:                                         ║');
        console.log('║  • court_decisions - Orzeczenia TK/SN/NSA                    ║');
        console.log('║  • decision_articles - Linki orzeczenia→artykuły             ║');
        console.log('║  • interpretations - Interpretacje ministerialne             ║');
        console.log('║  • interpretation_articles - Linki interpretacje→artykuły    ║');
        console.log('║  • amendments - Historia zmian                               ║');
        console.log('║  • announcements - Teksty jednolite                          ║');
        console.log('║                                                               ║');
        console.log('║  🚀 NASTĘPNY KROK:                                           ║');
        console.log('║  • Test SAOS API                                              ║');
        console.log('║  • Import pierwszych orzeczeń                                 ║');
        console.log('║                                                               ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    }
    
    db.close();
}
