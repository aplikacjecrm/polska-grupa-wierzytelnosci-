// Usuwa dokument ID: 17 z właściwej bazy
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'komunikator.db');
const db = new sqlite3.Database(dbPath);

console.log('🗑️ Usuwam dokument ID: 17 z data/komunikator.db...\n');

// Pobierz info przed usunięciem
db.get('SELECT * FROM documents WHERE id = 17', (err, doc) => {
    if (err) {
        console.error('❌ Błąd:', err);
        db.close();
        return;
    }
    
    if (!doc) {
        console.log('✅ Dokument już nie istnieje!');
        db.close();
        return;
    }
    
    console.log('📄 Usuwam dokument:', {
        id: doc.id,
        filename: doc.filename || doc.file_name,
        filepath: doc.file_path || doc.filepath
    });
    
    // Usuń plik fizyczny jeśli istnieje
    const filePath = doc.file_path || doc.filepath;
    if (filePath && fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log('✅ Plik fizyczny usunięty');
        } catch (e) {
            console.log('⚠️ Nie można usunąć pliku:', e.message);
        }
    }
    
    // Usuń z bazy
    db.run('DELETE FROM documents WHERE id = 17', (err) => {
        if (err) {
            console.error('❌ Błąd usuwania:', err);
        } else {
            console.log('✅ Dokument usunięty z bazy!');
        }
        
        db.close();
        
        console.log('\n🎉 GOTOWE! Teraz uruchom backend:');
        console.log('   npm start\n');
    });
});
