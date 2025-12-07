const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/komunikator.db');

// Pokaż Art. 33¹ (ten przy Art. 33, o jednostkach organizacyjnych)
db.get(`
    SELECT * FROM legal_acts 
    WHERE title = 'Kodeks cywilny - Art. 331' 
      AND content LIKE '%jednostek organizacyjnych niebędących%'
    LIMIT 1
`, (err, row) => {
    if (err) {
        console.error('Błąd:', err);
    } else if (row) {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('Art. 33¹ KC (ten przy Art. 33):');
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log(row.content);
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log(`Długość: ${row.content.length} znaków`);
    } else {
        console.log('Brak Art. 33¹');
    }
    db.close();
});
