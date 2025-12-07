// Sprawdź dokumenty w bazie
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'komunikator.db');
console.log('📍 Ścieżka bazy:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Błąd połączenia z bazą:', err);
        process.exit(1);
    }
});

// Pobierz ostatnie sprawy
db.all(`SELECT id, case_number, title FROM cases ORDER BY id DESC LIMIT 5`, [], (err, cases) => {
    if (err) {
        console.error('❌ Błąd zapytania:', err);
        db.close();
        return;
    }
    
    console.log('\n📋 OSTATNIE 5 SPRAW:');
    cases.forEach(c => {
        console.log(`  ID: ${c.id} - ${c.case_number} - ${c.title}`);
    });
    
    if (cases.length === 0) {
        console.log('⚠️ Brak spraw!');
        db.close();
        return;
    }
    
    const caseIds = cases.map(c => c.id).join(',');
    
    // Pobierz dokumenty dla tych spraw
    db.all(`
        SELECT id, case_id, filename, filepath, category, uploaded_at 
        FROM documents 
        WHERE case_id IN (${caseIds})
        ORDER BY case_id, uploaded_at DESC
    `, [], (err, docs) => {
        if (err) {
            console.error('❌ Błąd zapytania dokumentów:', err);
            db.close();
            return;
        }
        
        console.log(`\n📄 DOKUMENTY (znaleziono: ${docs.length}):`);
        
        if (docs.length === 0) {
            console.log('⚠️ BRAK DOKUMENTÓW W SPRAWACH!');
            console.log('\n💡 Aby przetestować AI czyta dokumenty:');
            console.log('   1. Dodaj dokument PDF/DOCX do sprawy');
            console.log('   2. Kliknij "Asystent Prawny AI"');
            console.log('   3. Zadaj pytanie o dokument');
        } else {
            docs.forEach(d => {
                console.log(`\n  📄 ${d.filename}`);
                console.log(`     Sprawa ID: ${d.case_id}`);
                console.log(`     Ścieżka: ${d.filepath}`);
                console.log(`     Kategoria: ${d.category || 'brak'}`);
                
                // Sprawdź czy plik istnieje
                const fs = require('fs');
                const fullPath = path.join(__dirname, 'uploads', d.filepath);
                if (fs.existsSync(fullPath)) {
                    const stats = fs.statSync(fullPath);
                    console.log(`     ✅ Plik istnieje (${Math.round(stats.size / 1024)} KB)`);
                } else {
                    console.log(`     ❌ PLIK NIE ISTNIEJE: ${fullPath}`);
                }
            });
        }
        
        db.close();
    });
});
