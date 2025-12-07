// DODAJ POPULARNE ARTYKUŁY DO BAZY

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH);

const today = new Date().toISOString().split('T')[0];

const popularArticles = [
    {
        title: 'Ustawa z dnia 23 kwietnia 1964 r. - Kodeks cywilny',
        url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640160093',
        content: `Kodeks cywilny - 
Art. 42 - Przymioty i wady fizyczne lub psychiczne wchodzą w rachubę wyłącznie przy ocenie skutków prawnych.
Art. 100 - Treść lub charakter czynności prawnej może wynikać z okoliczności, w których czynność została dokonana, w tym z zachowania się stron.
Art. 200 - Praw nie można przenieść na inną osobę, jeżeli sprzeciwiałoby się to właściwości (naturze) prawa.
Art. 300 - Własność w granicach określonych przez ustawy i zasady współżycia społecznego przysługuje właścicielowi, z wyłączeniem innych osób.
Art. 400 - Zobowiązany do zwrotu cudzych pieniędzy oraz dłużnik, który opóźnia się ze spełnieniem świadczenia pieniężnego, obowiązany jest do zapłaty odsetek za czas opóźnienia, chociażby w działaniu lub zaniechaniu nie było winy.`
    }
];

console.log('📚 Dodaję popularne artykuły do bazy...\n');

db.serialize(() => {
    popularArticles.forEach((art, idx) => {
        db.run(`
            INSERT OR REPLACE INTO legal_acts 
            (title, date, url, content, source, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        `, [art.title, today, art.url, art.content, 'manual-extended'],
        (err) => {
            if (err) {
                console.error(`❌ Błąd przy ${idx + 1}:`, err.message);
            } else {
                console.log(`✅ ${idx + 1}. Dodano: ${art.title.substring(0, 50)}...`);
            }
        });
    });
});

setTimeout(() => {
    db.close();
    console.log('\n✅ GOTOWE! Sprawdź teraz artykuły w aplikacji.');
    process.exit(0);
}, 2000);
