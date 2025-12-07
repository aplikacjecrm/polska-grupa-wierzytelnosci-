const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/komunikator.db');

console.log('═══════════════════════════════════════════════════════════');
console.log('SPRAWDZANIE TREŚCI ORZECZEŃ W BAZIE');
console.log('═══════════════════════════════════════════════════════════\n');

// Statystyki ogólne
db.get(`
    SELECT 
        COUNT(*) as total,
        COUNT(content) as with_content,
        COUNT(summary) as with_summary,
        COUNT(source_url) as with_url
    FROM court_decisions
`, (err, row) => {
    if (err) {
        console.error('Błąd:', err);
        db.close();
        return;
    }
    
    console.log('📊 STATYSTYKI:');
    console.log(`   Wszystkich orzeczeń: ${row.total}`);
    console.log(`   Z pełnym tekstem (content): ${row.with_content}`);
    console.log(`   Ze streszczeniem (summary): ${row.with_summary}`);
    console.log(`   Z linkiem do źródła (source_url): ${row.with_url}`);
    console.log();
    
    // Przykłady
    db.all(`
        SELECT 
            signature,
            court_type,
            CASE WHEN content IS NOT NULL THEN 'TAK' ELSE 'NIE' END as has_content,
            CASE WHEN summary IS NOT NULL THEN 'TAK' ELSE 'NIE' END as has_summary,
            CASE WHEN source_url IS NOT NULL THEN 'TAK' ELSE 'NIE' END as has_url
        FROM court_decisions
        LIMIT 10
    `, (err, rows) => {
        if (err) {
            console.error('Błąd:', err);
        } else {
            console.log('📋 PRZYKŁADY (pierwsze 10 orzeczeń):');
            console.log('Sygnatura          | Sąd | Pełny tekst | Streszczenie | Link');
            console.log('-------------------|-----|-------------|--------------|-----');
            rows.forEach(r => {
                console.log(`${r.signature.padEnd(18)} | ${r.court_type.padEnd(3)} | ${r.has_content.padEnd(11)} | ${r.has_summary.padEnd(12)} | ${r.has_url}`);
            });
        }
        
        console.log('\n═══════════════════════════════════════════════════════════');
        db.close();
    });
});
