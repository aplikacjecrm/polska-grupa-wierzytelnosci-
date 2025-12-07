const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/komunikator.db');

console.log('Sprawdzam artykuły w bazie...\n');

db.all(`SELECT title FROM legal_acts LIMIT 20`, (err, rows) => {
    if (err) {
        console.error('Błąd:', err);
        db.close();
        return;
    }
    
    console.log('Pierwsze 20 wpisów:');
    rows.forEach((r, i) => {
        console.log(`${i+1}. ${r.title}`);
    });
    
    db.get(`SELECT COUNT(*) as c FROM legal_acts`, (e, r) => {
        console.log(`\nRazem: ${r.c} wpisów`);
        db.close();
    });
});
