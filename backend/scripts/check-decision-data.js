const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/komunikator.db');

console.log('═══════════════════════════════════════════════════════════');
console.log('SPRAWDZANIE DANYCH ORZECZENIA III APa 15/15');
console.log('═══════════════════════════════════════════════════════════\n');

db.get(`
    SELECT 
        signature,
        court_type,
        decision_date,
        summary,
        full_text,
        source_url,
        legal_base
    FROM court_decisions
    WHERE signature LIKE '%APa 15/15%'
    LIMIT 1
`, (err, row) => {
    if (err) {
        console.error('Błąd:', err);
        db.close();
        return;
    }
    
    if (!row) {
        console.log('❌ Nie znaleziono orzeczenia');
        db.close();
        return;
    }
    
    console.log('📋 DANE ORZECZENIA:');
    console.log(`   Sygnatura: ${row.signature}`);
    console.log(`   Sąd: ${row.court_type}`);
    console.log(`   Data: ${row.decision_date}`);
    console.log();
    
    console.log('📝 STRESZCZENIE:');
    if (row.summary) {
        console.log(`   Długość: ${row.summary.length} znaków`);
        console.log(`   Pierwsze 100 znaków: ${row.summary.substring(0, 100)}...`);
    } else {
        console.log('   ❌ BRAK');
    }
    console.log();
    
    console.log('📄 PEŁNY TEKST:');
    if (row.full_text) {
        console.log(`   Długość: ${row.full_text.length} znaków`);
        console.log(`   Pierwsze 100 znaków: ${row.full_text.substring(0, 100)}...`);
    } else {
        console.log('   ❌ BRAK');
    }
    console.log();
    
    console.log('🔗 LINK:');
    if (row.source_url) {
        console.log(`   ✅ ${row.source_url}`);
    } else {
        console.log('   ❌ BRAK');
    }
    console.log();
    
    console.log('⚖️ PODSTAWA PRAWNA:');
    if (row.legal_base) {
        console.log(`   legal_base: ${row.legal_base}`);
    } else {
        console.log('   ❌ BRAK');
    }
    
    console.log('\n═══════════════════════════════════════════════════════════');
    db.close();
});
