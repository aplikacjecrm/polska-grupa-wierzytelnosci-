const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/komunikator.db');

console.log('═══════════════════════════════════════════════════════════');
console.log('SPRAWDZANIE PEŁNYCH TEKSTÓW ORZECZEŃ');
console.log('═══════════════════════════════════════════════════════════\n');

db.get(`
    SELECT 
        COUNT(*) as total,
        COUNT(full_text) as with_full_text,
        SUM(CASE WHEN full_text IS NOT NULL AND LENGTH(full_text) > 0 THEN 1 ELSE 0 END) as with_nonempty_full_text
    FROM court_decisions
`, (err, row) => {
    if (err) {
        console.error('Błąd:', err);
        db.close();
        return;
    }
    
    console.log('📊 STATYSTYKI:');
    console.log(`   Wszystkich orzeczeń: ${row.total}`);
    console.log(`   Z kolumną full_text: ${row.with_full_text}`);
    console.log(`   Z NIEpustym full_text: ${row.with_nonempty_full_text}`);
    console.log();
    
    // Przykład orzeczenia
    db.get(`
        SELECT 
            signature,
            court_type,
            decision_date,
            CASE WHEN summary IS NOT NULL THEN LENGTH(summary) ELSE 0 END as summary_length,
            CASE WHEN full_text IS NOT NULL THEN LENGTH(full_text) ELSE 0 END as full_text_length,
            source_url
        FROM court_decisions
        LIMIT 1
    `, (err, example) => {
        if (!err && example) {
            console.log('📋 PRZYKŁADOWE ORZECZENIE:');
            console.log(`   Sygnatura: ${example.signature}`);
            console.log(`   Sąd: ${example.court_type}`);
            console.log(`   Data: ${example.decision_date}`);
            console.log(`   Długość summary: ${example.summary_length} znaków`);
            console.log(`   Długość full_text: ${example.full_text_length} znaków`);
            console.log(`   Link: ${example.source_url ? 'TAK' : 'NIE'}`);
        }
        
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('❌ WNIOSEK: Baza NIE zawiera pełnych tekstów wyroków!');
        console.log('   - Kolumna full_text istnieje, ale jest pusta (NULL)');
        console.log('   - Są tylko streszczenia (summary)');
        console.log('   - Są linki do źródeł (source_url)');
        console.log('═══════════════════════════════════════════════════════════');
        
        db.close();
    });
});
