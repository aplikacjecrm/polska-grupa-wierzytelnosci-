const {getDatabase} = require('../database/init');

const db = getDatabase();

db.all('PRAGMA table_info(cases)', (err, cols) => {
  if (err) {
    console.error('❌ Błąd:', err);
    return;
  }
  
  console.log('📋 Kolumny związane z prokuraturą:\n');
  
  const prosecutorCols = cols.filter(c => c.name.includes('prosecutor'));
  
  if (prosecutorCols.length === 0) {
    console.log('⚠️  Brak kolumn prokuratury!');
  } else {
    prosecutorCols.forEach(c => {
      console.log(`  ✅ ${c.name} (${c.type})`);
    });
  }
  
  console.log('\n📊 Razem:', prosecutorCols.length, 'kolumn');
  
  // Sprawdź które brakują
  const needed = [
    'prosecutor_id',
    'prosecutor_office', 
    'prosecutor_name',
    'prosecutor_address',
    'prosecutor_phone',
    'prosecutor_email',
    'prosecutor_website',
    'indictment_number',
    'auxiliary_prosecutor'
  ];
  
  console.log('\n🔍 Sprawdzanie wymaganych kolumn:');
  needed.forEach(col => {
    const exists = cols.find(c => c.name === col);
    if (exists) {
      console.log(`  ✅ ${col}`);
    } else {
      console.log(`  ❌ ${col} - BRAK!`);
    }
  });
});
