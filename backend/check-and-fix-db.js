const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Znajdź bazę danych
const possiblePaths = [
  path.join(__dirname, '../data/komunikator.db'),
  path.join(__dirname, 'data/komunikator.db'),
  path.join(__dirname, 'komunikator.db')
];

let DB_PATH = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    DB_PATH = p;
    break;
  }
}

if (!DB_PATH) {
  console.error('❌ Nie znaleziono bazy danych!');
  console.log('Szukano w:', possiblePaths);
  process.exit(1);
}

console.log('📂 Używam bazy:', DB_PATH);

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  // 1. Sprawdź strukturę tabeli
  console.log('\n=== SPRAWDZAM STRUKTURĘ TABELI case_comments ===\n');
  
  db.all("PRAGMA table_info(case_comments)", (err, columns) => {
    if (err) {
      console.error('❌ Błąd:', err);
      db.close();
      return;
    }
    
    console.log('Kolumny w tabeli:');
    columns.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
    
    const hasParentColumn = columns.some(c => c.name === 'parent_comment_id');
    
    if (!hasParentColumn) {
      console.log('\n⚠️  BRAK KOLUMNY parent_comment_id - DODAJĘ...\n');
      
      db.run(`ALTER TABLE case_comments ADD COLUMN parent_comment_id INTEGER`, (err) => {
        if (err) {
          console.error('❌ Błąd dodawania kolumny:', err.message);
        } else {
          console.log('✅ Kolumna parent_comment_id DODANA!\n');
        }
        
        // 2. Pokaż przykładowe komentarze
        showComments();
      });
    } else {
      console.log('\n✅ Kolumna parent_comment_id ISTNIEJE\n');
      // 2. Pokaż przykładowe komentarze
      showComments();
    }
  });
});

function showComments() {
  console.log('=== PRZYKŁADOWE KOMENTARZE ===\n');
  
  db.all(`
    SELECT id, case_id, parent_comment_id, 
           substr(comment, 1, 30) as comment_preview,
           is_internal
    FROM case_comments 
    ORDER BY created_at DESC 
    LIMIT 10
  `, (err, rows) => {
    if (err) {
      console.error('❌ Błąd pobierania komentarzy:', err);
    } else {
      console.log('Ostatnie komentarze:');
      rows.forEach(row => {
        const parent = row.parent_comment_id ? `→ odpowiedź na ${row.parent_comment_id}` : 'główny';
        console.log(`  ${row.id}: "${row.comment_preview}..." (${parent})`);
      });
    }
    
    db.close();
    console.log('\n✅ GOTOWE!\n');
  });
}
