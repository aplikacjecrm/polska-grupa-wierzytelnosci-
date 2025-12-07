// ==========================================
// SKRYPT MIGRACJI BAZY DANYCH
// Uruchom: node run-migration.js
// ==========================================

const { getDatabase } = require('./init');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🔧 Rozpoczynam migrację bazy danych...\n');
  
  const db = getDatabase();
  const sqlFile = path.join(__dirname, 'migrations', 'add-opposing-fields.sql');
  
  try {
    // Czytaj plik SQL
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Podziel na poszczególne komendy
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📋 Znaleziono ${commands.length} komend do wykonania\n`);
    
    let success = 0;
    let skipped = 0;
    let failed = 0;
    
    // Wykonaj każdą komendę
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      
      // Pokaż co robimy
      const shortCmd = cmd.substring(0, 80) + (cmd.length > 80 ? '...' : '');
      process.stdout.write(`[${i + 1}/${commands.length}] ${shortCmd}`);
      
      try {
        await new Promise((resolve, reject) => {
          db.run(cmd, (err) => {
            if (err) {
              // Sprawdź czy to błąd "kolumna już istnieje"
              if (err.message.includes('duplicate column name')) {
                skipped++;
                console.log(' ⚠️ POMINIĘTO (już istnieje)');
                resolve();
              } else {
                failed++;
                console.log(` ❌ BŁĄD: ${err.message}`);
                resolve(); // Kontynuuj mimo błędu
              }
            } else {
              success++;
              console.log(' ✅');
              resolve();
            }
          });
        });
      } catch (error) {
        console.log(` ❌ BŁĄD: ${error.message}`);
        failed++;
      }
    }
    
    // Podsumowanie
    console.log('\n' + '='.repeat(60));
    console.log('📊 PODSUMOWANIE MIGRACJI:');
    console.log('='.repeat(60));
    console.log(`✅ Sukces:   ${success} komend`);
    console.log(`⚠️  Pominięto: ${skipped} komend (już istniały)`);
    console.log(`❌ Błędy:    ${failed} komend`);
    console.log('='.repeat(60));
    
    if (failed === 0) {
      console.log('\n🎉 MIGRACJA ZAKOŃCZONA SUKCESEM!');
      console.log('\n📋 CO ZOSTAŁO DODANE:');
      console.log('   • 24 nowe kolumny w opposing_party');
      console.log('   • 3 nowe kolumny w clients');
      console.log('   • 4 nowe kolumny w case_witnesses i case_evidence');
      console.log('   • 4 nowe indeksy dla wydajności');
      console.log('\n🔄 NASTĘPNE KROKI:');
      console.log('   1. Zrestartuj backend: node server.js');
      console.log('   2. Odśwież frontend: Ctrl + Shift + R');
      console.log('   3. Przetestuj moduł Strona Przeciwna');
    } else {
      console.log('\n⚠️  MIGRACJA ZAKOŃCZONA Z BŁĘDAMI');
      console.log('   Sprawdź logi powyżej');
    }
    
  } catch (error) {
    console.error('❌ KRYTYCZNY BŁĄD:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Uruchom migrację
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║         MIGRACJA BAZY DANYCH - MODUŁ PRZECIWNIKA          ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

runMigration();
