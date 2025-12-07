const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/komunikator.db');

console.log('═══════════════════════════════════════════════════════════');
console.log('WERYFIKACJA: Art. 33, 33¹, 34');
console.log('═══════════════════════════════════════════════════════════\n');

db.all(`
    SELECT title, substr(content, 1, 200) as preview, length(content) as len
    FROM legal_acts 
    WHERE title LIKE '%Kodeks cywilny%' 
      AND (content LIKE '%Art. 33%' OR content LIKE '%Art. 331%' OR content LIKE '%Art. 34%')
    ORDER BY title
    LIMIT 10
`, (err, rows) => {
    if (err) {
        console.error('Błąd:', err);
    } else {
        rows.forEach((row, i) => {
            console.log(`${i+1}. ${row.title}`);
            console.log(`   Długość: ${row.len} znaków`);
            console.log(`   Treść: ${row.preview}...\n`);
        });
    }
    db.close();
});
