const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/komunikator.db');

db.get(`SELECT * FROM legal_acts WHERE title = 'Kodeks cywilny - Art. 33' LIMIT 1`, (err, row) => {
    if (err) {
        console.error('Błąd:', err);
    } else if (row) {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('Art. 33 KC:');
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log(row.content);
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log(`Długość: ${row.content.length} znaków`);
        console.log(`Zawiera "Art. 331"? ${row.content.includes('Art. 331') ? 'TAK' : 'NIE'}`);
    } else {
        console.log('Brak Art. 33');
    }
    db.close();
});
