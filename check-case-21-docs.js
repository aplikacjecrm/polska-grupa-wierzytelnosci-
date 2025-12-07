// Sprawdź dokładnie dokumenty sprawy 21
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'data', 'komunikator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Sprawdzam dokumenty sprawy 21 (Nieopłacone faktury)...\n');

db.all(`
    SELECT id, case_id, title, filename, filepath, category, uploaded_at 
    FROM documents 
    WHERE case_id = 21
    ORDER BY uploaded_at DESC
`, [], (err, docs) => {
    if (err) {
        console.error('❌ Błąd:', err);
        db.close();
        return;
    }
    
    console.log(`📄 Znaleziono ${docs.length} dokumentów:\n`);
    
    docs.forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.filename}`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Tytuł: ${doc.title}`);
        console.log(`   Kategoria: ${doc.category || 'brak'}`);
        console.log(`   Ścieżka w bazie: ${doc.filepath}`);
        
        // Sprawdź czy to absolutna ścieżka
        if (path.isAbsolute(doc.filepath)) {
            console.log(`   ✅ Ścieżka absolutna`);
            if (fs.existsSync(doc.filepath)) {
                const stats = fs.statSync(doc.filepath);
                const ext = path.extname(doc.filepath).toLowerCase();
                console.log(`   ✅ PLIK ISTNIEJE: ${Math.round(stats.size / 1024)} KB`);
                console.log(`   📄 Rozszerzenie: ${ext}`);
                
                // Sprawdź czy to PDF/DOCX
                if (ext === '.pdf') {
                    console.log(`   🎯 PDF - MOŻE BYĆ SPARSOWANY!`);
                } else if (ext === '.docx') {
                    console.log(`   🎯 DOCX - MOŻE BYĆ SPARSOWANY!`);
                } else if (ext === '.txt') {
                    console.log(`   📝 TXT - MOŻE BYĆ ODCZYTANY!`);
                } else if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
                    console.log(`   🖼️ OBRAZ - NIE MOŻE BYĆ SPARSOWANY (brak OCR)`);
                } else {
                    console.log(`   ⚠️ Nieobsługiwane rozszerzenie: ${ext}`);
                }
            } else {
                console.log(`   ❌ PLIK NIE ISTNIEJE!`);
            }
        } else {
            console.log(`   ⚠️ Ścieżka względna - będzie połączona z uploads/`);
            const fullPath = path.join(__dirname, 'uploads', doc.filepath);
            console.log(`   Pełna ścieżka: ${fullPath}`);
            if (fs.existsSync(fullPath)) {
                console.log(`   ✅ PLIK ISTNIEJE`);
            } else {
                console.log(`   ❌ PLIK NIE ISTNIEJE`);
            }
        }
        console.log('');
    });
    
    db.close();
});
