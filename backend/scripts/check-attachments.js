const { getDatabase } = require('../database/init');

const db = getDatabase();

console.log('Sprawdzam tabele...');

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Błąd:', err);
    return;
  }
  
  const attachTables = tables.filter(t => t.name.includes('attach') || t.name.includes('comment'));
  console.log('Tabele z attach/comment:', attachTables);
  
  db.all('SELECT * FROM task_attachments', (err2, attachments) => {
    if (err2) {
      console.error('Błąd task_attachments:', err2);
    } else {
      console.log('Załączniki:', attachments);
    }
    
    db.all('SELECT * FROM task_comments', (err3, comments) => {
      if (err3) {
        console.error('Błąd task_comments:', err3);
      } else {
        console.log('Komentarze:', comments);
      }
      process.exit();
    });
  });
});
