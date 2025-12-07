// Pobierz wyniki z Apify - ELASTYCZNA WERSJA
// Działa z Run ID LUB Dataset ID!

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

async function downloadResults(id) {
    try {
        console.log(`\n📥 Próbuję pobrać wyniki dla: ${id}...\n`);
        
        let items = null;
        let method = '';
        
        // PRÓBA 1: Jako Run ID
        try {
            console.log('🔄 Próba 1: Pobieranie jako Run ID...');
            const response = await axios.get(
                `https://api.apify.com/v2/actor-runs/${id}/dataset/items`,
                { params: { token: APIFY_TOKEN } }
            );
            items = response.data;
            method = 'Run ID';
            console.log('✅ Sukces jako Run ID!');
        } catch (err) {
            console.log('❌ Nie działa jako Run ID');
            
            // PRÓBA 2: Jako Dataset ID
            console.log('\n🔄 Próba 2: Pobieranie jako Dataset ID...');
            try {
                const response = await axios.get(
                    `https://api.apify.com/v2/datasets/${id}/items`,
                    { params: { token: APIFY_TOKEN } }
                );
                items = response.data;
                method = 'Dataset ID';
                console.log('✅ Sukces jako Dataset ID!');
            } catch (err2) {
                throw new Error('Nie udało się pobrać ani jako Run ID ani Dataset ID');
            }
        }
        
        if (!items) {
            throw new Error('Brak danych!');
        }
        
        console.log(`\n✅ Pobrano ${items.length} postów! (Metoda: ${method})`);
        
        // Zapisz do pliku JSON
        const outputPath = path.join(__dirname, 'apify-results', `${id}.json`);
        
        // Stwórz folder jeśli nie istnieje
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, JSON.stringify(items, null, 2), 'utf8');
        console.log(`💾 Zapisano do: ${outputPath}`);
        
        // Analiza danych
        console.log('\n📊 ANALIZA DANYCH:\n');
        console.log(`Total postów: ${items.length}`);
        
        if (items.length > 0) {
            const first = items[0];
            
            console.log('\n🔑 Dostępne pola:');
            Object.keys(first).forEach(key => {
                const value = first[key];
                const type = typeof value;
                const preview = type === 'string' ? value.substring(0, 50) : value;
                console.log(`  - ${key} (${type}): ${preview}${type === 'string' && value.length > 50 ? '...' : ''}`);
            });
            
            console.log('\n📝 Przykładowy post:');
            console.log('Author:', first.authorName || first.author || 'Unknown');
            console.log('Text:', (first.text || first.postText || '').substring(0, 200));
            console.log('URL:', first.postUrl || first.url || 'N/A');
            console.log('Date:', first.time || first.date || 'N/A');
            
            // Statystyki
            const withText = items.filter(i => (i.text || i.postText || '').length > 0).length;
            const withAuthor = items.filter(i => (i.authorName || i.author)).length;
            
            console.log('\n📈 Statystyki:');
            console.log(`Posts z tekstem: ${withText} (${Math.round(withText/items.length*100)}%)`);
            console.log(`Posts z autorem: ${withAuthor} (${Math.round(withAuthor/items.length*100)}%)`);
        }
        
        console.log('\n✅ GOTOWE! Możesz teraz użyć tych danych w systemie.');
        console.log('💡 Uruchom: node use-saved-results.js');
        
        return items;
        
    } catch (error) {
        console.error('\n❌ BŁĄD:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
        
        console.log('\n💡 PODPOWIEDŹ:');
        console.log('1. Sprawdź czy ID jest prawidłowy');
        console.log('2. Sprawdź czy token Apify jest poprawny');
        console.log('3. Spróbuj pobrać manualnie z Apify Console');
        console.log('   → Dataset → Export → JSON → Download');
    }
}

// CLI
const id = process.argv[2];

if (!id) {
    console.log(`
📋 UŻYCIE:

node download-apify-flexible.js <ID>

ID może być:
- Run ID (np. "2oFEhMBtOxfepSA1d")
- Dataset ID (np. "fmudHghj3gnQMaZ5C")

Przykład:
node download-apify-flexible.js fmudHghj3gnQMaZ5C
    `);
    process.exit(1);
}

downloadResults(id);
