// Znajdź duplikaty plików i wersji
const fs = require('fs');
const path = require('path');

console.log('🔍 ANALIZA DUPLIKATÓW I NIEUŻYWANEGO KODU\n');

// Ścieżki do sprawdzenia
const frontendScripts = path.join(__dirname, 'frontend', 'scripts');
const backendRoutes = path.join(__dirname, 'backend', 'routes');

// Znajdź wszystkie pliki
function findFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isFile() && item.endsWith('.js')) {
            files.push({ name: item, path: fullPath, size: stat.size });
        }
    });
    
    return files;
}

console.log('📂 FRONTEND SCRIPTS:');
const frontendFiles = findFiles(frontendScripts);
console.log(`   Znaleziono: ${frontendFiles.length} plików\n`);

// Grupuj wersje
const versionGroups = {};
frontendFiles.forEach(file => {
    const match = file.name.match(/^(.+)-v(\d+)\.js$/);
    if (match) {
        const baseName = match[1];
        const version = parseInt(match[2]);
        
        if (!versionGroups[baseName]) {
            versionGroups[baseName] = [];
        }
        versionGroups[baseName].push({ ...file, version });
    }
});

console.log('🔄 ZNALEZIONE WERSJE (duplikaty):');
Object.keys(versionGroups).forEach(baseName => {
    const versions = versionGroups[baseName];
    if (versions.length > 1) {
        console.log(`\n   ${baseName}:`);
        versions.sort((a, b) => a.version - b.version).forEach(v => {
            const sizeKB = (v.size / 1024).toFixed(1);
            console.log(`      v${v.version} - ${sizeKB} KB - ${v.name}`);
        });
        
        const latest = versions[versions.length - 1];
        console.log(`      ✅ ZACHOWAJ: v${latest.version} (najnowsza)`);
        console.log(`      ❌ USUŃ: ${versions.length - 1} starszych wersji`);
    }
});

console.log('\n\n📂 BACKEND ROUTES:');
const backendFiles = findFiles(backendRoutes);
console.log(`   Znaleziono: ${backendFiles.length} plików\n`);

// Znajdź podobne nazwy (możliwe duplikaty)
const similarNames = {};
backendFiles.forEach(file => {
    const baseName = file.name.replace(/-fixed|-new|-old|-v\d+/g, '');
    if (!similarNames[baseName]) {
        similarNames[baseName] = [];
    }
    similarNames[baseName].push(file);
});

console.log('🔄 MOŻLIWE DUPLIKATY W BACKEND:');
Object.keys(similarNames).forEach(baseName => {
    const files = similarNames[baseName];
    if (files.length > 1) {
        console.log(`\n   ${baseName}:`);
        files.forEach(f => {
            const sizeKB = (f.size / 1024).toFixed(1);
            console.log(`      - ${f.name} (${sizeKB} KB)`);
        });
    }
});

// Podsumowanie
console.log('\n\n📊 PODSUMOWANIE:');
console.log(`   Frontend scripts: ${frontendFiles.length}`);
console.log(`   Backend routes: ${backendFiles.length}`);
console.log(`   Grupy wersji: ${Object.keys(versionGroups).length}`);
console.log(`   Możliwe duplikaty backend: ${Object.keys(similarNames).filter(k => similarNames[k].length > 1).length}`);

// Szacuj oszczędności
let totalDuplicateSize = 0;
Object.values(versionGroups).forEach(versions => {
    if (versions.length > 1) {
        const oldVersions = versions.slice(0, -1);
        totalDuplicateSize += oldVersions.reduce((sum, v) => sum + v.size, 0);
    }
});

console.log(`\n💾 OSZCZĘDNOŚĆ PO CLEANUP: ${(totalDuplicateSize / 1024).toFixed(1)} KB`);
