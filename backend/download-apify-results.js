// Pobierz zapisane wyniki z Apify (DARMOWE!)

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

async function downloadResults(runId) {
    try {
        console.log(`\n📥 Pobieram wyniki z run: ${runId}...\n`);
        
        // Pobierz wyniki z dataset (DARMOWE - już zapłacone!)
        const response = await axios.get(
            `https://api.apify.com/v2/actor-runs/${runId}/dataset/items`,
            { params: { token: APIFY_TOKEN } }
        );
        
        const items = response.data;
        console.log(`✅ Pobrano ${items.length} postów!`);
        
        // Zapisz do pliku JSON
        const outputPath = path.join(__dirname, 'apify-results', `${runId}.json`);
        
        // Stwórz folder jeśli nie istnieje
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, JSON.stringify(items, null, 2), 'utf8');
        console.log(`💾 Zapisano do: ${outputPath}`);
        
        // Pokaż przykładowy post
        if (items.length > 0) {
            console.log('\n📝 Przykładowy post:');
            const first = items[0];
            console.log('Author:', first.authorName || first.author || 'Unknown');
            console.log('Text:', (first.text || first.postText || '').substring(0, 150) + '...');
            console.log('URL:', first.postUrl || first.url || 'N/A');
            console.log('Date:', first.time || first.date || 'N/A');
        }
        
        // Pokaż dostępne pola
        if (items.length > 0) {
            console.log('\n🔑 Dostępne pola w danych:');
            console.log(Object.keys(items[0]).join(', '));
        }
        
        return items;
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

// Użycie:
// node download-apify-results.js <RUN_ID>

const runId = process.argv[2];

if (!runId) {
    console.log(`
📋 INSTRUKCJA:

1. Otwórz: https://console.apify.com/actors/runs
2. Kliknij na successful run (zielony checkmark)
3. Skopiuj Run ID (np. "CfSaFDfYwH05nwjQx")
4. Uruchom: node download-apify-results.js <RUN_ID>

Przykład:
node download-apify-results.js CfSaFDfYwH05nwjQx
    `);
    process.exit(1);
}

downloadResults(runId);
