const {getDatabase} = require('../database/init');

console.log('🔧 DODAWANIE KOLUMN PROKURATURY DO TABELI CASES...\n');

const db = getDatabase();

const columns = [
  'prosecutor_id VARCHAR(100)',
  'prosecutor_address TEXT',
  'prosecutor_phone VARCHAR(50)',
  'prosecutor_email VARCHAR(255)',
  'prosecutor_website VARCHAR(255)'
];

let completed = 0;

columns.forEach((col, index) => {
  const colName = col.split(' ')[0];
  
  db.run(`ALTER TABLE cases ADD COLUMN ${col}`, (err) => {
    completed++;
    
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log(`⚠️  ${colName} już istnieje`);
      } else {
        console.error(`❌ Błąd dodawania ${colName}:`, err.message);
      }
    } else {
      console.log(`✅ Dodano kolumnę: ${colName}`);
    }
    
    if (completed === columns.length) {
      console.log('\n🎉 ZAKOŃCZONO!\n');
      console.log('📋 Sprawdź wynik: node utils/check-prosecutor-columns.js');
      process.exit(0);
    }
  });
});
