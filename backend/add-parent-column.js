const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH);

console.log('🔧 Dodawanie kolumny parent_comment_id do tabeli case_comments...');

db.serialize(() => {
  // Sprawdź czy kolumna już istnieje
  db.all("PRAGMA table_info(case_comments)", (err, columns) => {
    if (err) {
      console.error('❌ Błąd sprawdzania struktury tabeli:', err);
      db.close();
      return;
    }
    
    console.log('📋 Obecne kolumny:', columns.map(c => c.name));
    
    const hasParentColumn = columns.some(c => c.name === 'parent_comment_id');
    
    if (hasParentColumn) {
      console.log('✅ Kolumna parent_comment_id już istnieje!');
      db.close();
      return;
    }
    
    // Dodaj kolumnę
    db.run(`ALTER TABLE case_comments ADD COLUMN parent_comment_id INTEGER`, (err) => {
      if (err) {
        console.error('❌ Błąd dodawania kolumny:', err);
      } else {
        console.log('✅ Kolumna parent_comment_id została dodana!');
        
        // Sprawdź ponownie
        db.all("PRAGMA table_info(case_comments)", (err, newColumns) => {
          console.log('📋 Nowe kolumny:', newColumns.map(c => c.name));
        });
      }
      
      db.close();
    });
  });
});
