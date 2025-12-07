// 📋 KOLEKTOR WKLEJEK - Łączy tekst wklejany w częściach

const fs = require('fs');
const path = require('path');

const PARTS_DIR = path.join(__dirname, '../temp/parts');
const OUTPUT_FILE = path.join(__dirname, '../temp/kc-complete.txt');

// Utwórz folder na części
if (!fs.existsSync(PARTS_DIR)) {
    fs.mkdirSync(PARTS_DIR, { recursive: true });
}

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║         📋 KOLEKTOR WKLEJEK - System łączenia tekstu         ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

console.log('📁 Katalog części: backend/temp/parts/\n');
console.log('💡 JAK UŻYWAĆ:\n');
console.log('   1. Stwórz pliki: part-01.txt, part-02.txt, part-03.txt...');
console.log('   2. Wklej do każdego kawałek tekstu KC');
console.log('   3. Uruchom: node backend/scripts/paste-collector.js');
console.log('   4. System automatycznie połączy wszystkie części!\n');

// Znajdź wszystkie pliki part-*.txt
const partFiles = fs.readdirSync(PARTS_DIR)
    .filter(f => f.startsWith('part-') && f.endsWith('.txt'))
    .sort();

if (partFiles.length === 0) {
    console.log('⚠️  Brak plików z częściami!\n');
    console.log('📋 UTWÓRZ PLIKI:');
    console.log('   backend/temp/parts/part-01.txt');
    console.log('   backend/temp/parts/part-02.txt');
    console.log('   backend/temp/parts/part-03.txt');
    console.log('   ...\n');
    console.log('💡 Każdy plik = kawałek tekstu ustawy\n');
    process.exit(0);
}

console.log(`✅ Znaleziono ${partFiles.length} części:\n`);
partFiles.forEach(f => console.log(`   📄 ${f}`));
console.log('');

// Łącz części
let fullText = '';
let totalChars = 0;

partFiles.forEach((file, index) => {
    const filePath = path.join(PARTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    fullText += content;
    if (index < partFiles.length - 1) {
        fullText += '\n\n'; // Separator między częściami
    }
    
    totalChars += content.length;
    console.log(`✅ Połączono ${file} (${content.length} znaków)`);
});

console.log(`\n📊 RAZEM: ${totalChars} znaków\n`);

// Zapisz pełny tekst
fs.writeFileSync(OUTPUT_FILE, fullText, 'utf-8');

console.log(`💾 Zapisano do: ${OUTPUT_FILE}\n`);

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║                     ✅ POŁĄCZONO! ✅                         ║');
console.log('╠═══════════════════════════════════════════════════════════════╣');
console.log('║                                                               ║');
console.log('║  📋 NASTĘPNY KROK:                                           ║');
console.log('║  node backend/scripts/parse-and-import-complete.js           ║');
console.log('║                                                               ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

module.exports = { fullText };
