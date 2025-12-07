// Sprawdź attachments dla sprawy 21
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'data', 'komunikator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 SPRAWDZAM ATTACHMENTS DLA SPRAWY 21\n');

db.all(`
    SELECT id, case_id, entity_type, entity_id,
           file_name, filename, file_path, file_type, file_size,
           uploaded_at
    FROM attachments 
    WHERE case_id = 21
    ORDER BY uploaded_at DESC
`, [], (err, attachments) => {
    if (err) {
        console.error('❌ Błąd:', err);
        db.close();
        return;
    }
    
    console.log(`📎 Znaleziono ${attachments.length} załączników dla sprawy 21:\n`);
    
    if (attachments.length === 0) {
        console.log('⚠️ BRAK ZAŁĄCZNIKÓW!');
        console.log('\n💡 Sprawdzam wszystkie sprawy z załącznikami...\n');
        
        // Pokaż inne sprawy
        db.all(`
            SELECT DISTINCT a.case_id, c.case_number, c.title, COUNT(*) as count
            FROM attachments a
            LEFT JOIN cases c ON a.case_id = c.id
            WHERE a.case_id IS NOT NULL
            GROUP BY a.case_id
            ORDER BY a.case_id DESC
            LIMIT 5
        `, [], (err, cases) => {
            if (!err && cases) {
                console.log('📋 SPRAWY Z ZAŁĄCZNIKAMI:');
                cases.forEach(c => {
                    console.log(`   Sprawa ${c.case_id}: ${c.case_number} - ${c.title}`);
                    console.log(`   Załączników: ${c.count}\n`);
                });
            }
            db.close();
        });
        return;
    }
    
    attachments.forEach((att, index) => {
        const fileName = att.file_name || att.filename || 'brak nazwy';
        console.log(`${index + 1}. ${fileName}`);
        console.log(`   ID: ${att.id}`);
        console.log(`   Entity: ${att.entity_type} (ID: ${att.entity_id})`);
        console.log(`   Typ: ${att.file_type}`);
        console.log(`   Rozmiar: ${Math.round((att.file_size || att.filesize || 0) / 1024)} KB`);
        console.log(`   Ścieżka: ${att.file_path}`);
        
        // Sprawdź czy plik istnieje
        if (att.file_path) {
            if (fs.existsSync(att.file_path)) {
                console.log(`   ✅ PLIK ISTNIEJE`);
                
                // Sprawdź czy to PDF/DOCX
                const ext = path.extname(att.file_path).toLowerCase();
                if (ext === '.pdf') {
                    console.log(`   🎯 PDF - POWINIEN BYĆ SPARSOWANY!`);
                } else if (ext === '.docx') {
                    console.log(`   🎯 DOCX - POWINIEN BYĆ SPARSOWANY!`);
                }
            } else {
                console.log(`   ❌ PLIK NIE ISTNIEJE!`);
            }
        } else {
            console.log(`   ⚠️ BRAK ŚCIEŻKI!`);
        }
        console.log('');
    });
    
    db.close();
});
