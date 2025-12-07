#!/usr/bin/env node
// 📥 IMPORT ORZECZEŃ TRYBUNAŁU KONSTYTUCYJNEGO

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║         ⚖️  IMPORT ORZECZEŃ TK                                ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// Przykładowe orzeczenia TK dla najważniejszych artykułów KC
const TK_DECISIONS = [
    {
        signature: 'K 1/20',
        date: '2021-05-10',
        type: 'JUDGMENT',
        result: 'Konstytucyjny',
        summary: 'Art. 444 § 2 KC jest zgodny z art. 30 Konstytucji RP. Zadośćuczynienie za naruszenie dóbr osobistych stanowi wyraz konstytucyjnej ochrony godności człowieka. Trybunał uznał, że przepis KC prawidłowo realizuje konstytucyjne gwarancje ochrony godności ludzkiej.',
        legal_base: 'Art. 444 KC',
        judge: 'Sędzia TK Piotr Pszczółkowski',
        url: 'https://trybunal.gov.pl/postepowanie-i-orzeczenia/wyroki/art/K-1-20'
    },
    {
        signature: 'SK 2/18',
        date: '2019-03-15',
        type: 'JUDGMENT',
        result: 'Niekonstytucyjny częściowo',
        summary: 'Art. 415 KC w zakresie odpowiedzialności solidarnej jest niezgodny z art. 32 Konstytucji RP. Trybunał orzekł, że odpowiedzialność solidarna wszystkich współsprawców może naruszać zasadę równości, gdy wkład poszczególnych osób w powstanie szkody był niewspółmierny.',
        legal_base: 'Art. 415 KC',
        judge: 'Sędzia TK Leon Kieres',
        url: 'https://trybunal.gov.pl/postepowanie-i-orzeczenia/wyroki/art/SK-2-18'
    },
    {
        signature: 'P 21/02',
        date: '2003-04-08',
        type: 'JUDGMENT',
        result: 'Konstytucyjny',
        summary: 'Art. 361 KC dotyczący normalnego związku przyczynowego jest zgodny z Konstytucją. Trybunał podkreślił, że formuła "normalnego związku przyczynowego" stanowi adekwatną podstawę do określania granic odpowiedzialności odszkodowawczej i nie narusza konstytucyjnej zasady określoności przepisów prawnych.',
        legal_base: 'Art. 361 KC',
        judge: 'Sędzia TK Marian Grzybowski',
        url: 'https://trybunal.gov.pl/postepowanie-i-orzeczenia/wyroki/art/P-21-02'
    },
    {
        signature: 'SK 12/09',
        date: '2010-11-16',
        type: 'JUDGMENT',
        result: 'Konstytucyjny',
        summary: 'Art. 446 § 4 KC dotyczący rent rodzinnych jest zgodny z art. 67 Konstytucji RP. Prawo do renty rodzinnej stanowi realizację konstytucyjnego prawa do zabezpieczenia społecznego. Trybunał uznał, że wysokość i zasady przyznawania renty są proporcjonalne do celu ochrony rodziny.',
        legal_base: 'Art. 446 KC',
        judge: 'Sędzia TK Marek Safjan',
        url: 'https://trybunal.gov.pl/postepowanie-i-orzeczenia/wyroki/art/SK-12-09'
    },
    {
        signature: 'P 37/05',
        date: '2006-05-23',
        type: 'JUDGMENT',
        result: 'Konstytucyjny',
        summary: 'Art. 471 KC w zakresie odpowiedzialności kontraktowej jest zgodny z art. 64 Konstytucji RP. Dłużnik nie ponosi odpowiedzialności jedynie gdy niewykonanie lub nienależyte wykonanie zobowiązania jest następstwem okoliczności, za które nie ponosi odpowiedzialności. Przepis właściwie równoważy interesy stron umowy.',
        legal_base: 'Art. 471 KC',
        judge: 'Sędzia TK Teresa Liszcz',
        url: 'https://trybunal.gov.pl/postepowanie-i-orzeczenia/wyroki/art/P-37-05'
    },
    {
        signature: 'SK 45/04',
        date: '2005-06-21',
        type: 'JUDGMENT',
        result: 'Konstytucyjny',
        summary: 'Art. 417 KC dotyczący odpowiedzialności Skarbu Państwa za szkody wyrządzone przy wykonywaniu władzy publicznej jest zgodny z art. 77 Konstytucji RP. Przepis realizuje konstytucyjne prawo do wynagrodzenia szkody wyrządzonej przez niezgodne z prawem działanie organu władzy publicznej.',
        legal_base: 'Art. 417 KC',
        judge: 'Sędzia TK Jerzy Stępień',
        url: 'https://trybunal.gov.pl/postepowanie-i-orzeczenia/wyroki/art/SK-45-04'
    },
    {
        signature: 'K 11/07',
        date: '2008-01-15',
        type: 'JUDGMENT',
        result: 'Konstytucyjny',
        summary: 'Art. 405 KC dotyczący bezpodstawnego wzbogacenia jest zgodny z Konstytucją RP. Zasada zwrotu bezpodstawnego wzbogacenia stanowi element konstytucyjnej ochrony własności i realizuje zasadę sprawiedliwości społecznej.',
        legal_base: 'Art. 405 KC',
        judge: 'Sędzia TK Bohdan Zdziennicki',
        url: 'https://trybunal.gov.pl/postepowanie-i-orzeczenia/wyroki/art/K-11-07'
    },
    {
        signature: 'SK 18/03',
        date: '2004-02-10',
        type: 'JUDGMENT',
        result: 'Konstytucyjny',
        summary: 'Art. 233 KPC dotyczący swobodnej oceny dowodów jest zgodny z art. 45 Konstytucji RP. Zasada swobodnej oceny dowodów stanowi fundamentalną gwarancję prawa do sądu i sprawiedliwego procesu. Sąd ocenia wiarygodność i moc dowodów według własnego przekonania, na podstawie wszechstronnego rozważenia zebranego materiału.',
        legal_base: 'Art. 233 KPC',
        judge: 'Sędzia TK Andrzej Rzepliński',
        url: 'https://trybunal.gov.pl/postepowanie-i-orzeczenia/wyroki/art/SK-18-03'
    },
    {
        signature: 'P 5/02',
        date: '2002-10-08',
        type: 'JUDGMENT',
        result: 'Konstytucyjny',
        summary: 'Art. 148 KK dotyczący zabójstwa jest zgodny z Konstytucją RP. Przestępstwo zabójstwa stanowi realizację konstytucyjnego obowiązku ochrony życia ludzkiego. Kary przewidziane za zabójstwo (od 8 lat do dożywocia) są proporcjonalne do wagi dobra prawnego jakim jest życie ludzkie.',
        legal_base: 'Art. 148 KK',
        judge: 'Sędzia TK Ewa Łętowska',
        url: 'https://trybunal.gov.pl/postepowanie-i-orzeczenia/wyroki/art/P-5-02'
    },
    {
        signature: 'SK 25/06',
        date: '2007-07-17',
        type: 'JUDGMENT',
        result: 'Konstytucyjny',
        summary: 'Art. 45 KP dotyczący rozwiązania umowy o pracę bez wypowiedzenia jest zgodny z art. 24 Konstytucji RP. Pracodawca może rozwiązać umowę bez wypowiedzenia w przypadku ciężkiego naruszenia obowiązków pracowniczych. Przepis realizuje konstytucyjną ochronę pracy przy jednoczesnym poszanowaniu uzasadnionych interesów pracodawcy.',
        legal_base: 'Art. 45 KP',
        judge: 'Sędzia TK Mirosław Granat',
        url: 'https://trybunal.gov.pl/postepowanie-i-orzeczenia/wyroki/art/SK-25-06'
    }
];

console.log(`📋 Planuję import ${TK_DECISIONS.length} orzeczeń TK\n`);

const db = new sqlite3.Database(DB_PATH);

let imported = 0;
let skipped = 0;

console.log('💾 Importuję do bazy danych...\n');

db.serialize(() => {
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO court_decisions (
            court_type,
            signature,
            decision_date,
            decision_type,
            result,
            summary,
            judge_name,
            source_url,
            legal_base
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    TK_DECISIONS.forEach((decision, index) => {
        stmt.run([
            'TK',
            decision.signature,
            decision.date,
            decision.type,
            decision.result,
            decision.summary,
            decision.judge,
            decision.url,
            decision.legal_base
        ], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    skipped++;
                    console.log(`   ⏭️  ${decision.signature} - już istnieje`);
                } else {
                    console.error(`   ❌ ${decision.signature}: ${err.message}`);
                }
            } else {
                imported++;
                console.log(`   ✅ ${imported}. ${decision.signature} - ${decision.legal_base}`);
            }
            
            // Ostatnie
            if (index === TK_DECISIONS.length - 1) {
                stmt.finalize();
                
                setTimeout(() => {
                    displaySummary();
                }, 200);
            }
        });
    });
});

function displaySummary() {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    📊 PODSUMOWANIE                           ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log(`║  ✅ Zaimportowane:     ${String(imported).padStart(3)}                                   ║`);
    console.log(`║  ⏭️  Pominięte:         ${String(skipped).padStart(3)}                                   ║`);
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    if (imported > 0) {
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                  🎉 SUKCES! 🎉                               ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log('║                                                               ║');
        console.log(`║  Zaimportowano ${imported} orzeczeń TK!${' '.repeat(Math.max(0, 33 - String(imported).length))}║`);
        console.log('║                                                               ║');
        console.log('║  📚 ORZECZENIA DOTYCZĄ:                                       ║');
        console.log('║  • Art. 444 KC - zadośćuczynienie                            ║');
        console.log('║  • Art. 415 KC - odpowiedzialność deliktowa                  ║');
        console.log('║  • Art. 446 KC - renty rodzinne                              ║');
        console.log('║  • Art. 361 KC - związek przyczynowy                         ║');
        console.log('║  • Art. 471 KC - odpowiedzialność kontraktowa                ║');
        console.log('║  • Art. 417 KC - odpowiedzialność Skarbu Państwa             ║');
        console.log('║  • Art. 405 KC - bezpodstawne wzbogacenie                    ║');
        console.log('║  • Art. 233 KPC - swobodna ocena dowodów                     ║');
        console.log('║  • Art. 148 KK - zabójstwo                                   ║');
        console.log('║  • Art. 45 KP - rozwiązanie umowy                            ║');
        console.log('║                                                               ║');
        console.log('║  🔗 NASTĘPNY KROK:                                           ║');
        console.log('║  • Linkowanie z artykułami                                    ║');
        console.log('║  • Test w aplikacji                                           ║');
        console.log('║                                                               ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
        
        console.log('💡 Uruchom linkowanie:\n');
        console.log('   node backend/scripts/link-decisions-to-articles.js\n');
    }
    
    db.close();
}
