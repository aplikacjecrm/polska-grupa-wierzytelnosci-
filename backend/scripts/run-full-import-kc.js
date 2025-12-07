// 🚀 TEST SCRAPERA - PEŁNY KODEKS CYWILNY

const ISAPFullScraper = require('./isap-full-scraper');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                                                               ║');
    console.log('║      🌐 TEST SCRAPERA ISAP - KODEKS CYWILNY 🌐              ║');
    console.log('║                                                               ║');
    console.log('║  Inteligentny scraper z pełną strukturą hierarchiczną        ║');
    console.log('║                                                               ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    const scraper = new ISAPFullScraper();
    
    try {
        // KROK 1: Pobierz tekst z ISAP
        console.log('🌐 KROK 1/4: Pobieranie z ISAP...\n');
        const result = await scraper.fetchFullText('KC');
        
        if (!result.success) {
            console.log('\n❌ SCRAPER NAPOTKAŁ PROBLEM!\n');
            console.log('📋 Szczegóły:', result.error);
            console.log('\n💡 POTRZEBNA RĘCZNA POMOC:');
            console.log('   1. Otwórz: https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640160093');
            console.log('   2. Skopiuj pełny tekst Kodeksu Cywilnego');
            console.log('   3. Wklej do pliku: backend/data/KC-manual.txt');
            console.log('   4. Uruchom ponownie ten skrypt\n');
            
            // Sprawdź czy jest manual backup
            const manualPath = path.join(__dirname, '../data/KC-manual.txt');
            if (fs.existsSync(manualPath)) {
                console.log('✅ Znaleziono ręczny plik - używam go!\n');
                result.rawText = fs.readFileSync(manualPath, 'utf-8');
                result.success = true;
                result.source = 'manual-file';
            } else {
                process.exit(1);
            }
        }
        
        console.log(`\n✅ Tekst pobrany (${result.rawText.length} znaków)`);
        console.log(`📍 Źródło: ${result.source}\n`);
        
        // KROK 2: Parsuj artykuły
        console.log('🔍 KROK 2/4: Parsing struktury...\n');
        const articles = scraper.parseArticles(result.rawText);
        
        if (articles.length === 0) {
            console.log('❌ Nie znaleziono artykułów w tekście!');
            console.log('📋 To znaczy że struktura ISAP się zmieniła lub tekst jest nieprawidłowy\n');
            console.log('💡 POTRZEBNA RĘCZNA POMOC - wklej tekst do backend/data/KC-manual.txt\n');
            process.exit(1);
        }
        
        // KROK 3: Generuj raport
        console.log('📊 KROK 3/4: Analiza wyników...\n');
        const stats = scraper.generateReport(articles);
        
        // KROK 4: Zapisz do pliku JSON
        console.log('💾 KROK 4/4: Zapisywanie wyników...\n');
        
        const outputPath = path.join(__dirname, '../../logs/KC-full-structure.json');
        const logsDir = path.join(__dirname, '../../logs');
        
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        
        // Zapisz pełne dane
        fs.writeFileSync(outputPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            source: result.source,
            stats: stats,
            articles: articles
        }, null, 2));
        
        console.log(`✅ Zapisano do: ${outputPath}\n`);
        
        // Przykłady
        console.log('╔═══════════════════════════════════════════════════════╗');
        console.log('║              PRZYKŁADOWE ARTYKUŁY                    ║');
        console.log('╚═══════════════════════════════════════════════════════╝\n');
        
        // Pokaż Art. 1, 42, 444
        const examples = [1, 42, 444];
        examples.forEach(num => {
            const article = articles.find(a => a.number === String(num));
            if (article) {
                console.log(`📄 Art. ${article.number}:`);
                console.log(`   Paragrafów: ${article.paragraphs.length}`);
                if (article.paragraphs.length > 0) {
                    article.paragraphs.forEach(p => {
                        if (p.number) {
                            console.log(`   § ${p.number} - ${p.content.substring(0, 60)}...`);
                        }
                    });
                }
                console.log('');
            }
        });
        
        // Podsumowanie
        console.log('\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                     ✅ SUKCES! ✅                            ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log('║                                                               ║');
        console.log(`║  Sparsowano ${String(stats.totalArticles).padStart(4)} artykułów z pełną strukturą!          ║`);
        console.log('║                                                               ║');
        console.log('║  📋 NASTĘPNE KROKI:                                          ║');
        console.log('║  1. Sprawdź logs/KC-full-structure.json                      ║');
        console.log('║  2. Jeśli OK - importuj do bazy danych                       ║');
        console.log('║  3. Testuj w aplikacji                                       ║');
        console.log('║                                                               ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
        
    } catch (error) {
        console.error('\n❌ BŁĄD KRYTYCZNY:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
