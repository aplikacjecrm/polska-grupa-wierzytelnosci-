// Połącz pliki JSON używając Node.js (prawidłowy sposób!)

const fs = require('fs');
const path = require('path');

const downloadsPath = 'c:\\Users\\horyz\\Downloads';
const outputPath = path.join(__dirname, 'apify-results', 'combined-all.json');

console.log('📥 Ładuję pliki z Downloads...\n');

const files = [
    'dataset_facebook-groups-scraper_2025-11-09_22-03-54-902.json',
    'dataset_facebook-groups-scraper_2025-11-09_22-15-55-326.json',
    'dataset_facebook-groups-scraper_2025-11-09_22-18-08-036.json',
    'dataset_facebook-groups-scraper_2025-11-09_22-24-21-538.json'
];

let allPosts = [];
let totalSize = 0;

files.forEach(filename => {
    const filepath = path.join(downloadsPath, filename);
    
    if (!fs.existsSync(filepath)) {
        console.log(`⚠️ Brak pliku: ${filename}`);
        return;
    }
    
    const content = fs.readFileSync(filepath, 'utf8');
    const data = JSON.parse(content);
    
    allPosts = allPosts.concat(data);
    totalSize += Buffer.byteLength(content);
    
    console.log(`✅ ${filename}: ${data.length} postów`);
});

console.log(`\n📊 TOTAL: ${allPosts.length} postów`);
console.log(`📦 Rozmiar: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

// Zapisz prawidłowy JSON
console.log('\n💾 Zapisuję combined-all.json...');
fs.writeFileSync(outputPath, JSON.stringify(allPosts, null, 2), 'utf8');

console.log(`✅ GOTOWE! Zapisano do: ${outputPath}`);

// Statystyki
const withText = allPosts.filter(p => p.text && p.text.length > 10).length;
const withUser = allPosts.filter(p => p.user && p.user.name).length;

console.log('\n📈 Statystyki:');
console.log(`Posts z tekstem (>10): ${withText} (${(withText/allPosts.length*100).toFixed(1)}%)`);
console.log(`Posts z user.name: ${withUser} (${(withUser/allPosts.length*100).toFixed(1)}%)`);
