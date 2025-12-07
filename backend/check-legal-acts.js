const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH);

console.log('🔍 Sprawdzanie tabeli legal_acts...\n');

db.all('SELECT id, title, date FROM legal_acts ORDER BY id', (err, rows) => {
    if (err) {
        console.error('❌ Błąd:', err);
        db.close();
        return;
    }
    
    if (!rows || rows.length === 0) {
        console.log('⚠️  Tabela legal_acts jest PUSTA!');
        console.log('💡 Uruchom backend aby załadować seed data');
    } else {
        console.log(`✅ Znaleziono ${rows.length} aktów prawnych:\n`);
        rows.forEach(row => {
            console.log(`${row.id}. ${row.title} (${row.date})`);
        });
        
        // Sprawdź konkretny artykuł
        console.log('\n🔍 Sprawdzanie Kodeksu Cywilnego...');
        db.get(
            "SELECT * FROM legal_acts WHERE title LIKE '%Kodeks cywilny%'",
            (err, row) => {
                if (row) {
                    console.log('\n✅ Kodeks Cywilny znaleziony!');
                    console.log('Treść (pierwsze 200 znaków):');
                    console.log(row.content.substring(0, 200) + '...');
                    
                    // Sprawdź czy jest art. 400
                    if (row.content.includes('Art. 400') || row.content.includes('art. 400')) {
                        console.log('\n✅ Art. 400 KC jest w bazie!');
                    } else {
                        console.log('\n⚠️  Art. 400 KC NIE MA w bazie!');
                    }
                } else {
                    console.log('\n❌ Kodeks Cywilny NIE ZNALEZIONY!');
                }
                db.close();
            }
        );
    }
});
