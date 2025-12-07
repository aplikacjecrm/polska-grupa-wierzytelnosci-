#!/usr/bin/env node
// 📝 DODANIE PRZYKŁADOWYCH ZMIAN W USTAWACH

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║         📝 DODAWANIE PRZYKŁADOWYCH ZMIAN W USTAWACH          ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

const db = new sqlite3.Database(DB_PATH);

// Przykładowe zmiany w KC
const sampleAmendments = [
    {
        code: 'KC',
        date: '2025-01-15',
        journal: 'Dz.U. 2025 poz. 123',
        type: 'Nowelizacja',
        articles: 'Art. 444, Art. 445',
        summary: 'Zmiana definicji szkody niemajątkowej, rozszerzenie zakresu odszkodowania',
        fullText: 'Ustawa z dnia 15 stycznia 2025 r. o zmianie ustawy - Kodeks cywilny...'
    },
    {
        code: 'KC',
        date: '2020-06-01',
        journal: 'Dz.U. 2020 poz. 456',
        type: 'Nowelizacja',
        articles: 'Art. 415',
        summary: 'Wprowadzenie odpowiedzialności za szkody ekologiczne',
        fullText: 'Ustawa z dnia 1 czerwca 2020 r. o zmianie ustawy - Kodeks cywilny...'
    },
    {
        code: 'KC',
        date: '2018-03-15',
        journal: 'Dz.U. 2018 poz. 789',
        type: 'Nowelizacja',
        articles: 'Art. 446',
        summary: 'Zmiana wysokości rent z tytułu śmierci osoby bliskiej',
        fullText: 'Ustawa z dnia 15 marca 2018 r. o zmianie ustawy - Kodeks cywilny...'
    },
    {
        code: 'KP',
        date: '2024-09-01',
        journal: 'Dz.U. 2024 poz. 234',
        type: 'Nowelizacja',
        articles: 'Art. 15',
        summary: 'Podwyższenie minimalnego wynagrodzenia',
        fullText: 'Ustawa z dnia 1 września 2024 r. o zmianie ustawy - Kodeks pracy...'
    },
    {
        code: 'KK',
        date: '2023-12-10',
        journal: 'Dz.U. 2023 poz. 567',
        type: 'Nowelizacja',
        articles: 'Art. 148, Art. 149',
        summary: 'Zaostrzenie kar za przestępstwa przeciwko życiu',
        fullText: 'Ustawa z dnia 10 grudnia 2023 r. o zmianie ustawy - Kodeks karny...'
    }
];

let imported = 0;
let errors = 0;

console.log('💾 Dodaję przykładowe zmiany...\n');

db.serialize(() => {
    sampleAmendments.forEach((amendment, index) => {
        // Znajdź legal_act_id
        db.get(`
            SELECT id FROM legal_acts 
            WHERE title LIKE ? 
            LIMIT 1
        `, [`%${getCodeName(amendment.code)}%`], (err, legalAct) => {
            
            if (err || !legalAct) {
                console.log(`   ⏭️  ${amendment.code} - nie znaleziono w bazie`);
                errors++;
            } else {
                db.run(`
                    INSERT OR IGNORE INTO amendments (
                        legal_act_id,
                        amendment_date,
                        journal_reference,
                        amendment_type,
                        affected_articles,
                        summary,
                        full_text
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    legalAct.id,
                    amendment.date,
                    amendment.journal,
                    amendment.type,
                    amendment.articles,
                    amendment.summary,
                    amendment.fullText
                ], (err) => {
                    if (err) {
                        console.error(`   ❌ ${amendment.journal}: ${err.message}`);
                        errors++;
                    } else {
                        console.log(`   ✅ ${amendment.date} - ${amendment.code} (${amendment.journal})`);
                        imported++;
                    }
                    
                    // Ostatni
                    if (index === sampleAmendments.length - 1) {
                        setTimeout(() => {
                            displaySummary();
                        }, 300);
                    }
                });
            }
        });
    });
});

function getCodeName(code) {
    const names = {
        'KC': 'Kodeks cywilny',
        'KPC': 'Kodeks postępowania cywilnego',
        'KK': 'Kodeks karny',
        'KPK': 'Kodeks postępowania karnego',
        'KP': 'Kodeks pracy',
        'KRO': 'Kodeks rodzinny',
        'KSH': 'Kodeks spółek handlowych'
    };
    return names[code] || code;
}

function displaySummary() {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    📊 PODSUMOWANIE                           ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log(`║  ✅ Dodane zmiany:     ${String(imported).padStart(3)}                                   ║`);
    console.log(`║  ❌ Błędy:             ${String(errors).padStart(3)}                                   ║`);
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    if (imported > 0) {
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                  🎉 SUKCES! 🎉                               ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log('║                                                               ║');
        console.log(`║  ${imported} zmian w ustawach dodanych!${' '.repeat(Math.max(0, 32 - String(imported).length))}║`);
        console.log('║                                                               ║');
        console.log('║  🔍 Sprawdź:                                                  ║');
        console.log('║  SELECT * FROM amendments;                                    ║');
        console.log('║                                                               ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    }
    
    db.close();
}
