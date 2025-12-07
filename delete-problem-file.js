// Usuwa problematyczny plik (ID: 17) który crashuje backend
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🗑️ Usuwam problematyczny dokument (ID: 17)...');

// Pobierz info o pliku przed usunięciem
db.get('SELECT * FROM documents WHERE id = 17', (err, doc) => {
    if (err) {
        console.error('❌ Błąd odczytu:', err);
        db.close();
        return;
    }
    
    if (!doc) {
        console.log('✅ Dokument ID: 17 już nie istnieje.');
        db.close();
        return;
    }
    
    console.log('📄 Dokument do usunięcia:', {
        id: doc.id,
        filename: doc.filename || doc.file_name,
        filePath: doc.file_path
    });
    
    // Usuń plik fizyczny
    if (doc.file_path && fs.existsSync(doc.file_path)) {
        try {
            fs.unlinkSync(doc.file_path);
            console.log('✅ Plik fizyczny usunięty:', doc.file_path);
        } catch (e) {
            console.log('⚠️ Nie można usunąć pliku fizycznego:', e.message);
        }
    }
    
    // Usuń z bazy
    db.run('DELETE FROM documents WHERE id = 17', (err) => {
        if (err) {
            console.error('❌ Błąd usuwania z bazy:', err);
        } else {
            console.log('✅ Dokument usunięty z bazy danych!');
        }
        
        db.close();
        console.log('\n🎉 GOTOWE! Teraz możesz uruchomić backend:');
        console.log('   npm start');
    });
});
