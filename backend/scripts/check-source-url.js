const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/komunikator.db');

console.log('═══════════════════════════════════════════════════════════');
console.log('SPRAWDZANIE LINKÓW DO WYROKÓW (source_url)');
console.log('═══════════════════════════════════════════════════════════\n');

// Sprawdź konkretne orzeczenie III APa 15/15
db.get(`
    SELECT 
        signature,
        court_type,
        decision_date,
        source_url,
        CASE WHEN source_url IS NOT NULL AND source_url != '' THEN 'TAK' ELSE 'NIE' END as has_url
    FROM court_decisions
    WHERE signature LIKE '%APa 15/15%'
    LIMIT 1
`, (err, row) => {
    if (err) {
        console.error('Błąd:', err);
    } else if (row) {
        console.log('📋 ORZECZENIE III APa 15/15:');
        console.log(`   Sygnatura: ${row.signature}`);
        console.log(`   Sąd: ${row.court_type}`);
        console.log(`   Data: ${row.decision_date}`);
        console.log(`   Ma link (source_url)? ${row.has_url}`);
        if (row.source_url) {
            console.log(`   Link: ${row.source_url}`);
        }
    } else {
        console.log('❌ Nie znaleziono orzeczenia III APa 15/15');
    }
    
    console.log('\n📊 STATYSTYKI WSZYSTKICH ORZECZEŃ:');
    
    // Statystyki ogólne
    db.get(`
        SELECT 
            COUNT(*) as total,
            COUNT(source_url) as with_url,
            SUM(CASE WHEN source_url IS NOT NULL AND source_url != '' THEN 1 ELSE 0 END) as with_nonempty_url
        FROM court_decisions
    `, (err, stats) => {
        if (!err && stats) {
            console.log(`   Wszystkich orzeczeń: ${stats.total}`);
            console.log(`   Z kolumną source_url: ${stats.with_url}`);
            console.log(`   Z NIEpustym source_url: ${stats.with_nonempty_url}`);
            console.log(`   Procent z linkiem: ${Math.round(stats.with_nonempty_url / stats.total * 100)}%`);
        }
        
        console.log('\n═══════════════════════════════════════════════════════════');
        db.close();
    });
});
