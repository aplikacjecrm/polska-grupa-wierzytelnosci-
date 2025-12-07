const { client } = require('../utils/legal-api-client');
const { getDatabase } = require('../database/init');
const fs = require('fs').promises;

/**
 * 🔥 MASOWE POBIERANIE PRZEPISÓW Z WALIDACJĄ
 * 
 * Pobiera wszystkie kluczowe artykuły z 16 kodeksów
 * Waliduje każdy
 * Zapisuje do bazy
 * Generuje raport
 */

// Artykuły do pobrania dla każdego kodeksu
const ARTICLES_TO_FETCH = {
    'KC': [1, 41, 58, 353, 415, 444, 445, 455, 471, 535, 647, 659, 805, 827],
    'KK': [1, 45, 53, 115, 148, 156, 157, 207, 278, 280, 286, 288],
    'KPC': [1, 187, 233, 367, 391, 394, 496, 505],
    'KPK': [1, 5, 41, 60, 71, 167, 249, 293],
    'KP': [1, 22, 30, 45, 94, 100, 128, 151, 154, 300],
    'KKW': [1, 4, 67],
    'KKS': [1, 54],
    'KW': [1, 51],
    'KRO': [1, 23, 27, 94, 113],
    'KSH': [1, 301, 368],
    'KPA': [1, 7, 104, 138]
};

async function fetchAllArticles() {
    console.log('🚀 START: Masowe pobieranie przepisów\n');
    console.log('=' .repeat(60));
    
    const db = getDatabase();
    const results = {
        success: [],
        failed: [],
        validated: [],
        notValidated: []
    };
    
    let totalArticles = 0;
    for (const articles of Object.values(ARTICLES_TO_FETCH)) {
        totalArticles += articles.length;
    }
    
    console.log(`📊 Do pobrania: ${totalArticles} artykułów z ${Object.keys(ARTICLES_TO_FETCH).length} kodeksów\n`);
    
    let current = 0;
    
    for (const [code, articles] of Object.entries(ARTICLES_TO_FETCH)) {
        console.log(`\n📘 ${code}: Pobieranie ${articles.length} artykułów...`);
        console.log('-'.repeat(60));
        
        for (const articleNum of articles) {
            current++;
            const progress = ((current / totalArticles) * 100).toFixed(1);
            
            process.stdout.write(`[${progress}%] Art. ${articleNum} ${code}... `);
            
            try {
                // Pobierz artykuł
                const data = await client.getArticle(code, articleNum);
                
                if (data.text && data.validated) {
                    // Zapisz do bazy
                    await saveToDatabase(db, code, data);
                    
                    results.success.push(`${code}/${articleNum}`);
                    results.validated.push(`${code}/${articleNum}`);
                    
                    console.log('✅ OK');
                } else if (data.text && !data.validated) {
                    // Zapisz ale z ostrzeżeniem
                    await saveToDatabase(db, code, data);
                    
                    results.success.push(`${code}/${articleNum}`);
                    results.notValidated.push(`${code}/${articleNum}`);
                    
                    console.log('⚠️ Pobrano ale walidacja niepełna');
                } else {
                    results.failed.push(`${code}/${articleNum}`);
                    console.log('❌ Brak treści');
                }
                
                // Opóźnienie aby nie przeciążać serwera
                await sleep(500);
                
            } catch (error) {
                results.failed.push(`${code}/${articleNum}`);
                console.log(`❌ Błąd: ${error.message}`);
            }
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 PODSUMOWANIE:\n');
    console.log(`✅ Pobrane pomyślnie: ${results.success.length}/${totalArticles}`);
    console.log(`✅ Zwalidowane: ${results.validated.length}`);
    console.log(`⚠️ Walidacja niepełna: ${results.notValidated.length}`);
    console.log(`❌ Niepobrane: ${results.failed.length}`);
    
    const stats = client.getStats();
    console.log(`\n📈 Statystyki:`);
    console.log(`   API calls: ${stats.apiCalls}`);
    console.log(`   Scraping: ${stats.scrapeCalls}`);
    console.log(`   Cache hits: ${stats.cacheHits}`);
    console.log(`   Błędy: ${stats.errors}`);
    console.log(`   Success rate: ${stats.successRate}`);
    
    // Zapisz raport
    const report = {
        timestamp: new Date().toISOString(),
        total: totalArticles,
        results: results,
        stats: stats
    };
    
    await fs.writeFile(
        'legal-fetch-report.json',
        JSON.stringify(report, null, 2)
    );
    
    console.log('\n💾 Raport zapisany: legal-fetch-report.json');
    
    // Pokaż nieudane
    if (results.failed.length > 0) {
        console.log('\n❌ Nieudane artykuły:');
        results.failed.forEach(art => console.log(`   - ${art}`));
    }
    
    // Pokaż niepełna walidacja
    if (results.notValidated.length > 0) {
        console.log('\n⚠️ Niepełna walidacja:');
        results.notValidated.forEach(art => console.log(`   - ${art}`));
    }
    
    console.log('\n✅ KONIEC\n');
    process.exit(0);
}

async function saveToDatabase(db, code, data) {
    return new Promise((resolve, reject) => {
        const codeNames = {
            'KC': 'Kodeks cywilny',
            'KPC': 'Kodeks postępowania cywilnego',
            'KK': 'Kodeks karny',
            'KPK': 'Kodeks postępowania karnego',
            'KP': 'Kodeks pracy',
            'KKW': 'Kodeks karny wykonawczy',
            'KKS': 'Kodeks karny skarbowy',
            'KW': 'Kodeks wykroczeń',
            'KRO': 'Kodeks rodzinny i opiekuńczy',
            'KSH': 'Kodeks spółek handlowych',
            'KPA': 'Kodeks postępowania administracyjnego'
        };
        
        db.run(`
            INSERT OR REPLACE INTO legal_acts 
            (title, date, url, content, source, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        `, [
            `Ustawa - ${codeNames[code]}`,
            new Date().toISOString().split('T')[0],
            data.url,
            data.text,
            data.source
        ], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Uruchom
fetchAllArticles().catch(error => {
    console.error('💥 Błąd krytyczny:', error);
    process.exit(1);
});
