// Sprawdź daty wydarzeń TERAZ
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'kancelaria.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 SPRAWDZAM DATY WYDARZEŃ\n');
console.log('📅 DZISIAJ:', new Date().toLocaleString('pl-PL'));
console.log('📅 DZISIAJ UTC:', new Date().toISOString());
console.log('='.repeat(80));

db.all(`
  SELECT 
    id,
    title,
    start_date,
    created_at,
    event_code,
    case_id
  FROM events 
  ORDER BY start_date DESC 
  LIMIT 10
`, [], (err, events) => {
  if (err) {
    console.error('❌ Błąd:', err);
    db.close();
    return;
  }
  
  console.log(`\n📊 Ostatnie ${events.length} wydarzeń:\n`);
  
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  events.forEach((e, i) => {
    console.log(`${i + 1}. ${e.title || 'Bez tytułu'}`);
    console.log(`   ID: ${e.id} | Case: ${e.case_id} | Kod: ${e.event_code || 'brak'}`);
    console.log(`   📅 start_date (baza):     ${e.start_date}`);
    console.log(`   📅 created_at (baza):     ${e.created_at}`);
    
    // Parsuj datę tak jak robi frontend
    const eventDateStr = e.start_date.split('T')[0];
    const [year, month, day] = eventDateStr.split('-').map(Number);
    
    const eventDateOnly = new Date(year, month - 1, day);
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysUntil = Math.round((eventDateOnly - todayOnly) / (1000 * 60 * 60 * 24));
    
    console.log(`   🔢 eventDateStr:          ${eventDateStr}`);
    console.log(`   🔢 todayStr:              ${todayStr}`);
    console.log(`   🔢 daysUntil:             ${daysUntil}`);
    console.log(`   🎯 WYNIK:                 ${daysUntil < 0 ? '❌ PRZESZŁE' : daysUntil === 0 ? '✅ DZIŚ' : `✅ Za ${daysUntil} dni`}`);
    console.log('');
  });
  
  console.log('='.repeat(80));
  db.close();
});
