// Sprawdź client_files
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'komunikator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Sprawdzam client_files...\n');

// Struktura
db.all(`PRAGMA table_info(client_files)`, [], (err, cols) => {
    if (err) {
        console.error('❌ Błąd:', err);
        db.close();
        return;
    }
    
    console.log('📋 STRUKTURA client_files:');
    cols.forEach(col => console.log(`   ${col.name} (${col.type})`));
    console.log('');
    
    // Zawartość
    db.all(`
        SELECT cf.*, c.case_number, c.title as case_title
        FROM client_files cf
        LEFT JOIN cases c ON cf.case_id = c.id
        ORDER BY cf.uploaded_at DESC
        LIMIT 20
    `, [], (err, files) => {
        if (err) {
            console.error('❌ Błąd:', err);
            db.close();
            return;
        }
        
        console.log(`📁 PLIKI W client_files: ${files.length}\n`);
        
        if (files.length === 0) {
            console.log('   ⚠️ TABELA PUSTA!');
        } else {
            files.forEach((file, index) => {
                console.log(`${index + 1}. ${file.filename || file.file_name}`);
                console.log(`   ID: ${file.id}`);
                console.log(`   Sprawa: ${file.case_id} - ${file.case_number}`);
                console.log(`   Ścieżka: ${file.filepath || file.file_path}`);
                console.log(`   Kategoria: ${file.category || 'brak'}`);
                console.log('');
            });
            
            // Zlicz PDFy
            const pdfs = files.filter(f => {
                const fn = f.filename || f.file_name || '';
                return fn.toLowerCase().endsWith('.pdf');
            });
            console.log(`📄 PDFów: ${pdfs.length}`);
        }
        
        db.close();
    });
});
