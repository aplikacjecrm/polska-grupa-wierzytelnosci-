/**
 * NAPRAWA BŁĘDÓW SKŁADNIOWYCH W COURTS-DATABASE.JS
 * Problem: Wieloliniowe wartości w stringach powodują SyntaxError
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 NAPRAWA BŁĘDÓW SKŁADNIOWYCH...\n');

const inputPath = path.join(__dirname, 'courts-database.js');
let content = fs.readFileSync(inputPath, 'utf-8');

// Statystyki
let fixedCount = 0;

// REGEX do znalezienia wieloliniowych stringów w wartościach
// Szuka wzorców typu: phone: 'wartość
// nowa linia

console.log('📋 Analizowanie pliku...');

// Napraw wszystkie wieloliniowe wartości
// Zamień "\n" w środku stringów na spacje
content = content.replace(/(phone|email|address):\s*'([^']*)\n([^']*)',/g, (match, field, part1, part2) => {
  fixedCount++;
  const fixed = `${field}: '${part1.trim()} ${part2.trim()}',`;
  console.log(`   ✅ Naprawiono pole: ${field}`);
  return fixed;
});

// Zapisz naprawiony plik
fs.writeFileSync(inputPath, content, 'utf-8');

console.log(`\n✅ Naprawiono ${fixedCount} błędów składniowych!`);
console.log('📝 Plik zapisany: courts-database.js\n');

console.log('🔄 Testowanie czy plik się ładuje...');

try {
  // Próbuj załadować plik
  delete require.cache[inputPath]; // Usuń cache
  const courtsDb = require(inputPath);
  console.log(`✅ Plik się poprawnie ładuje!`);
  console.log(`📊 Znaleziono ${Object.keys(courtsDb.COURTS_DATABASE).length} sądów\n`);
  console.log('🎉 NAPRAWA ZAKOŃCZONA SUKCESEM!\n');
} catch (err) {
  console.error('❌ Plik nadal ma błędy:');
  console.error(err.message);
  console.error('\n❌ NAPRAWA NIE POWIODŁA SIĘ - wymagana ręczna interwencja\n');
  process.exit(1);
}
