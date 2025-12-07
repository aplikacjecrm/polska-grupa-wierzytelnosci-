// UŻYJ LOKALNYCH DANYCH APIFY (DARMOWE - już pobrane!)

const fs = require('fs');
const path = require('path');

class ApifyLocalData {
    
    // Załaduj zapisane wyniki
    loadResults(filename = 'combined-all.json') {
        const filePath = path.join(__dirname, '../../apify-results', filename);
        
        if (!fs.existsSync(filePath)) {
            console.log(`❌ Brak pliku: ${filename}`);
            return null;
        }
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`✅ Załadowano ${data.length} postów z lokalnych danych!`);
        return data;
    }
    
    // Parsuj do naszego formatu
    parseToOurFormat(rawData, query) {
        console.log(`🔄 Parsowanie ${rawData.length} postów dla query: "${query}"...`);
        
        const posts = rawData
            .filter(item => !item.error) // Usuń błędy
            .filter(item => {
                // FILTRUJ według query - szukaj w tekście, autorze, grupie
                if (!query) return true; // Jeśli brak query, pokaż wszystko
                
                const searchText = query.toLowerCase();
                const text = (item.text || '').toLowerCase();
                const author = ((item.user && item.user.name) || item.authorName || '').toLowerCase();
                const group = (item.groupTitle || item.groupName || '').toLowerCase();
                const url = (item.facebookUrl || item.postUrl || '').toLowerCase();
                
                return text.includes(searchText) || 
                       author.includes(searchText) || 
                       group.includes(searchText) ||
                       url.includes(searchText);
            })
            .map(item => {
                // Wyciągnij tekst z różnych miejsc
                const text = item.text || 
                            item.postText || 
                            item.message ||
                            item.description ||
                            '';
                
                // Wyciągnij autora
                const author = (item.user && item.user.name) ||
                              item.authorName || 
                              item.author || 
                              item.creatorName ||
                              (item.creator && item.creator.name) ||
                              'Unknown';
                
                // URL posta
                const url = item.facebookUrl ||
                           item.postUrl || 
                           item.url || 
                           item.permalink ||
                           '';
                
                // Data
                const time = item.time || 
                            item.date || 
                            item.createdTime ||
                            item.publishedDate ||
                            new Date().toISOString();
                
                // Statystyki
                const likes = item.likesCount || item.likes || 0;
                const comments = item.commentsCount || item.comments || 0;
                const shares = item.sharesCount || item.shares || 0;
                
                // Nazwa grupy
                const groupName = item.groupTitle || 
                                 item.groupName || 
                                 item.group ||
                                 'Facebook Group';
                
                return {
                    author,
                    text,
                    url,
                    time,
                    likes,
                    comments,
                    shares,
                    groupName,
                    facebookId: item.facebookId || item.id
                };
            })
            .filter(post => post.text && post.text.length > 10); // Tylko z tekstem
        
        const filtered = rawData.length - posts.length;
        console.log(`✅ Sparsowano ${posts.length} postów (odfiltrowano ${filtered})`);
        
        if (query && posts.length === 0) {
            console.log(`⚠️ Brak wyników dla query: "${query}"`);
            console.log(`💡 Spróbuj bardziej ogólnego wyszukiwania (np. same imię lub nazwisko)`);
        }
        
        return {
            query: query,
            source: `Zapisane dane Apify (${posts.length} z 650 dla: "${query}")`,
            totalPosts: posts.length,
            posts: posts,
            retrievedAt: new Date().toISOString(),
            fromLocalCache: true,
            searchInfo: {
                totalDataset: rawData.length,
                filtered: filtered,
                matchedQuery: query
            }
        };
    }
    
    // Główna funkcja - użyj lokalnych danych
    async useLocalData(query, filename = 'combined-all.json') {
        console.log(`\n📂 Używam lokalnych danych Apify z: ${filename}...`);
        
        // Załaduj
        const rawData = this.loadResults(filename);
        if (!rawData) {
            throw new Error('Brak lokalnych danych!');
        }
        
        // Parsuj
        const parsed = this.parseToOurFormat(rawData, query);
        
        // Analiza zostanie dodana przez apify-service.js
        // (nie robimy tutaj aby uniknąć duplikacji)
        
        return parsed;
    }
}

module.exports = new ApifyLocalData();

// Test
if (require.main === module) {
    (async () => {
        const service = new ApifyLocalData();
        const result = await service.useLocalData('test');
        console.log('\n📊 WYNIK:');
        console.log('Total Posts:', result.totalPosts);
        console.log('Red Flags:', result.redFlags.length);
        console.log('\n📝 Przykładowy post:');
        if (result.posts.length > 0) {
            const p = result.posts[0];
            console.log('Author:', p.author);
            console.log('Group:', p.groupName);
            console.log('Text:', p.text.substring(0, 150));
            console.log('Stats:', `${p.likes} likes, ${p.comments} comments, ${p.shares} shares`);
        }
    })();
}
