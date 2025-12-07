const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = 'c:\\Users\\horyz\\CascadeProjects\\windsurf-project\\kancelaria\\komunikator-app\\data\\komunikator.db';
const db = new sqlite3.Database(DB_PATH);

db.get('SELECT * FROM attachments WHERE id = 41', (err, att) => {
    if (err) {
        console.log('Błąd:', err);
    } else if (!att) {
        console.log('Załącznik ID 46 nie istnieje');
    } else {
        console.log('Załącznik:', att);
        console.log('Ścieżka pliku:', att.file_path);
        console.log('Plik istnieje:', fs.existsSync(att.file_path));
        
        // Sprawdź absolutną ścieżkę
        const absPath = path.resolve(__dirname, att.file_path);
        console.log('Absolutna ścieżka:', absPath);
        console.log('Plik istnieje (abs):', fs.existsSync(absPath));
    }
    db.close();
});
