const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/komunikator.db');

console.log('═══════════════════════════════════════════════════════════');
console.log('SPRAWDZANIE DUPLIKATÓW W KODEKSIE CYWILNYM');
console.log('═══════════════════════════════════════════════════════════\n');

db.all(`
    SELECT title, COUNT(*) as count 
    FROM legal_acts 
    WHERE title LIKE '%Kodeks cywilny%'
    GROUP BY title 
    HAVING count > 1
    ORDER BY count DESC
`, (err, rows) => {
    if (err) {
        console.error('Błąd:', err);
    } else if (rows && rows.length > 0) {
        console.log('❌ ZNALEZIONO DUPLIKATY W KC:\n');
        rows.forEach(r => {
            console.log(`   ${r.title} - ${r.count}x`);
        });
        console.log(`\n⚠️  Razem ${rows.length} zduplikowanych artykułów`);
    } else {
        console.log('✅ KODEKS CYWILNY - BRAK DUPLIKATÓW!\n');
        console.log('   Wszystkie artykuły są unikalne.');
    }
    
    console.log('\n═══════════════════════════════════════════════════════════');
    db.close();
});
