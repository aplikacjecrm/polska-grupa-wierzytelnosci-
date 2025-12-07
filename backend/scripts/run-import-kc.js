// 🚀 URUCHOM IMPORT KODEKSU CYWILNEGO

const CodeImporter = require('./import-full-code');
const { articlesKC } = require('./data-kc-test');

async function main() {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║      📚 IMPORT PEŁNEGO KODEKSU CYWILNEGO 📚             ║');
    console.log('║                                                           ║');
    console.log('║  System z pełną walidacją i weryfikacją artykułów        ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    console.log(`📊 Przygotowano ${articlesKC.length} artykułów do importu\n`);
    console.log('⏳ Rozpoczynam import...\n');
    
    const importer = new CodeImporter('KC', 'Kodeks cywilny');
    
    try {
        const result = await importer.importArticles(articlesKC);
        
        if (result.success) {
            console.log('');
            console.log('╔═══════════════════════════════════════════════════════════╗');
            console.log('║                                                           ║');
            console.log('║           ✅ IMPORT ZAKOŃCZONY SUKCESEM! ✅              ║');
            console.log('║                                                           ║');
            console.log('╚═══════════════════════════════════════════════════════════╝\n');
            
            console.log('📋 CO DALEJ?\n');
            console.log('1. Odśwież przeglądarkę (Ctrl + Shift + R)');
            console.log('2. Testuj wyszukiwanie dowolnego artykułu (1-888)');
            console.log('3. Sprawdź logi w: logs/import-KC-*.json\n');
            console.log('4. Jeśli wszystko działa - dodamy kolejne kodeksy!\n');
        } else {
            console.log('❌ Import zakończony z błędami');
            console.log('Sprawdź szczegóły w raporcie\n');
        }
        
    } catch (error) {
        console.error('\n❌ BŁĄD KRYTYCZNY:', error.message);
        console.error(error.stack);
    } finally {
        importer.close();
        process.exit(0);
    }
}

main();
