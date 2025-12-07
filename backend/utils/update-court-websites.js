/**
 * Aktualizacja stron WWW dla spraw które już mają przypisane sądy
 */

const {getDatabase} = require('../database/init');
const {COURTS_DATABASE} = require('./courts-database');

console.log('🔄 AKTUALIZACJA STRON WWW SĄDÓW W SPRAWACH...\n');

const db = getDatabase();

// Pobierz wszystkie sprawy z przypisanym court_id
db.all('SELECT id, court_id, court_name FROM cases WHERE court_id IS NOT NULL', (err, cases) => {
  if (err) {
    console.error('❌ Błąd:', err);
    return;
  }
  
  if (cases.length === 0) {
    console.log('ℹ️  Brak spraw z przypisanym sądem');
    return;
  }
  
  console.log(`📊 Znaleziono ${cases.length} spraw z przypisanym sądem\n`);
  
  let updated = 0;
  let notFound = 0;
  
  cases.forEach((caseData, index) => {
    const court = COURTS_DATABASE[caseData.court_id];
    
    if (!court) {
      console.log(`⚠️  Sprawa ${caseData.id}: Sąd ${caseData.court_id} nie znaleziony w bazie`);
      notFound++;
      return;
    }
    
    // Aktualizuj court_website
    db.run(
      'UPDATE cases SET court_website = ? WHERE id = ?',
      [court.website, caseData.id],
      function(updateErr) {
        if (updateErr) {
          console.error(`❌ Błąd aktualizacji sprawy ${caseData.id}:`, updateErr);
        } else {
          console.log(`✅ Sprawa ${caseData.id}: ${court.name} → ${court.website}`);
          updated++;
        }
        
        // Pokaż podsumowanie po ostatniej sprawie
        if (index === cases.length - 1) {
          setTimeout(() => {
            console.log(`\n📊 PODSUMOWANIE:`);
            console.log(`   ✅ Zaktualizowano: ${updated}`);
            console.log(`   ⚠️  Nie znaleziono w bazie: ${notFound}`);
            console.log(`   📊 Razem: ${cases.length}`);
          }, 100);
        }
      }
    );
  });
});
