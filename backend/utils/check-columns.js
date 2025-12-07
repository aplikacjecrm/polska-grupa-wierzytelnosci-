const {getDatabase} = require('../database/init');
const db = getDatabase();

db.all('PRAGMA table_info(cases)', (err, cols) => {
  if (err) {
    console.error('Błąd:', err);
    return;
  }
  
  console.log('Kolumny z "court" w nazwie:');
  cols.forEach(c => {
    if (c.name.includes('court')) {
      console.log(`  - ${c.name} (${c.type})`);
    }
  });
  
  const hasWebsite = cols.find(c => c.name === 'court_website');
  console.log('\n✅ court_website istnieje?', hasWebsite ? 'TAK' : 'NIE');
});
