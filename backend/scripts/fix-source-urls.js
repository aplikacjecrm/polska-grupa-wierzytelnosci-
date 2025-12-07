const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/komunikator.db');

console.log('═══════════════════════════════════════════════════════════');
console.log('NAPRAWIANIE LINKÓW DO WYROKÓW (source_url)');
console.log('═══════════════════════════════════════════════════════════\n');

// Sprawdź ile jest źle sformatowanych linków
db.get(`
    SELECT COUNT(*) as count
    FROM court_decisions
    WHERE source_url LIKE '%https://%https://%'
`, (err, row) => {
    if (err) {
        console.error('Błąd:', err);
        db.close();
        return;
    }
    
    console.log(`📊 Znaleziono ${row.count} źle sformatowanych linków\n`);
    
    if (row.count === 0) {
        console.log('✅ Wszystkie linki są poprawne!');
        db.close();
        return;
    }
    
    console.log('🔧 Naprawiam linki...\n');
    
    // Napraw linki - usuń pierwszą część "https://www.saos.org.pl"
    db.run(`
        UPDATE court_decisions
        SET source_url = REPLACE(source_url, 'https://www.saos.org.plhttps://', 'https://')
        WHERE source_url LIKE '%https://%https://%'
    `, function(err) {
        if (err) {
            console.error('Błąd przy naprawie:', err);
        } else {
            console.log(`✅ Naprawiono ${this.changes} linków\n`);
            
            // Pokaż przykładowy naprawiony link
            db.get(`
                SELECT signature, source_url
                FROM court_decisions
                WHERE signature LIKE '%APa 15/15%'
                LIMIT 1
            `, (err, example) => {
                if (!err && example) {
                    console.log('📋 Przykład naprawionego linku:');
                    console.log(`   Sygnatura: ${example.signature}`);
                    console.log(`   Link: ${example.source_url}`);
                }
                
                console.log('\n═══════════════════════════════════════════════════════════');
                console.log('✅ GOTOWE! Linki zostały naprawione.');
                console.log('═══════════════════════════════════════════════════════════');
                db.close();
            });
        }
    });
});
