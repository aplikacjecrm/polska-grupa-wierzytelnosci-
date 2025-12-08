// Skrypt do usuwania pustych wpisów dokumentów (które nie mają plików fizycznych)
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ścieżka do bazy danych
const DB_PATH = path.resolve(__dirname, 'data', 'komunikator.db');

console.log('🔍 Sprawdzam bazę danych:', DB_PATH);

const db = new sqlite3.Database(DB_PATH);

// Pobierz wszystkie dokumenty
db.all('SELECT * FROM documents ORDER BY case_id, uploaded_at', [], (err, docs) => {
    if (err) {
        console.error('❌ Błąd odczytu dokumentów:', err);
        db.close();
        return;
    }
    
    console.log(`\n📄 Znaleziono ${docs.length} dokumentów w bazie\n`);
    
    const toDelete = [];
    
    docs.forEach(doc => {
        const filePath = doc.file_path || doc.filepath;
        const fileExists = filePath && fs.existsSync(filePath);
        
        console.log(`ID: ${doc.id} | Case: ${doc.case_id} | File: ${doc.file_name || doc.filename}`);
        console.log(`   Path: ${filePath}`);
        console.log(`   Exists: ${fileExists ? '✅ TAK' : '❌ NIE'}`);
        
        if (!fileExists) {
            toDelete.push(doc);
            console.log(`   ⚠️ DO USUNIĘCIA!`);
        }
        console.log('');
    });
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`🗑️ Znaleziono ${toDelete.length} pustych wpisów do usunięcia:`);
    console.log('═══════════════════════════════════════════════════\n');
    
    toDelete.forEach(doc => {
        console.log(`ID: ${doc.id} | Case: ${doc.case_id} | "${doc.title || doc.file_name}"`);
    });
    
    if (toDelete.length === 0) {
        console.log('\n✅ Brak pustych wpisów - wszystkie dokumenty mają pliki!');
        db.close();
        return;
    }
    
    // Usuń puste wpisy
    console.log('\n🗑️ Usuwam puste wpisy z bazy...\n');
    
    let deleted = 0;
    toDelete.forEach((doc, index) => {
        db.run('DELETE FROM documents WHERE id = ?', [doc.id], (err) => {
            if (err) {
                console.error(`❌ Błąd usuwania ID ${doc.id}:`, err);
            } else {
                console.log(`✅ Usunięto ID ${doc.id}: "${doc.title || doc.file_name}"`);
                deleted++;
            }
            
            // Zamknij połączenie po ostatnim
            if (index === toDelete.length - 1) {
                setTimeout(() => {
                    console.log(`\n═══════════════════════════════════════════════════`);
                    console.log(`✅ ZAKOŃCZONO! Usunięto ${deleted}/${toDelete.length} pustych wpisów`);
                    console.log(`═══════════════════════════════════════════════════\n`);
                    db.close();
                }, 500);
            }
        });
    });
});
