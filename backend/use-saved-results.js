// Użyj zapisanych wyników Apify (DARMOWE - już pobrane!)

const fs = require('fs');
const path = require('path');

// Załaduj zapisane wyniki
function loadSavedResults(runId) {
    const filePath = path.join(__dirname, 'apify-results', `${runId}.json`);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ Brak zapisanych wyników dla: ${runId}`);
        console.log(`💡 Najpierw pobierz: node download-apify-results.js ${runId}`);
        return null;
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`✅ Załadowano ${data.length} postów z zapisanych wyników!`);
    return data;
}

// Parsuj do naszego formatu
function parseToOurFormat(rawData, query) {
    const posts = rawData.map(item => ({
        author: item.authorName || item.author || 'Unknown',
        text: item.text || item.postText || '',
        url: item.postUrl || item.url || '',
        time: item.time || item.date || new Date().toISOString(),
        likes: item.likes || 0,
        comments: item.commentsCount || item.comments || 0,
        shares: item.sharesCount || item.shares || 0,
        groupName: item.groupName || 'Facebook Group'
    }));
    
    return {
        query: query,
        source: 'Zapisane wyniki Apify (DARMOWE - bez ponownej opłaty!)',
        totalPosts: posts.length,
        posts: posts,
        retrievedAt: new Date().toISOString(),
        fromCache: true
    };
}

// Lista dostępnych wyników
function listAvailableResults() {
    const resultsDir = path.join(__dirname, 'apify-results');
    
    if (!fs.existsSync(resultsDir)) {
        console.log('📂 Brak zapisanych wyników');
        return [];
    }
    
    const files = fs.readdirSync(resultsDir).filter(f => f.endsWith('.json'));
    
    console.log(`\n📋 Dostępne zapisane wyniki (${files.length}):\n`);
    
    files.forEach((file, i) => {
        const runId = file.replace('.json', '');
        const data = JSON.parse(fs.readFileSync(path.join(resultsDir, file), 'utf8'));
        console.log(`${i+1}. Run ID: ${runId}`);
        console.log(`   Postów: ${data.length}`);
        console.log(`   Użyj: loadSavedResults('${runId}')\n`);
    });
    
    return files;
}

// Export
module.exports = {
    loadSavedResults,
    parseToOurFormat,
    listAvailableResults
};

// CLI
if (require.main === module) {
    listAvailableResults();
}
