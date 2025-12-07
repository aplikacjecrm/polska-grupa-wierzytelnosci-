// ==========================================
// APIFY API INTEGRATION
// Facebook Groups, Instagram, TikTok, Twitter, Reddit
// ==========================================

const axios = require('axios');
const cache = require('../cache-service');
const fs = require('fs');
const path = require('path');

const APIFY_API = 'https://api.apify.com/v2';
const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

// Funkcja do wczytywania grup FB (BEZ CACHE - używa fs.readFileSync)
function loadFacebookGroups() {
    try {
        const configPath = path.join(__dirname, '../../config/facebook-groups.json');
        console.log('📂 Wczytuję grupy z:', configPath);
        
        // ZAWSZE czytaj plik od nowa (bez cache)
        const fileContent = fs.readFileSync(configPath, 'utf8');
        const groups = JSON.parse(fileContent);
        
        const totalGroups = Object.values(groups.groups).flat().length;
        console.log(`✅ Wczytano ${Object.keys(groups.groups).length} kategorii, ${totalGroups} grup FB!`);
        return groups;
    } catch (error) {
        console.error('⚠️ Błąd wczytywania grup:', error.message);
        console.error('Stack:', error.stack);
        return { groups: {} };
    }
}

class ApifyService {
    
    // ==========================================
    // FACEBOOK GROUPS SEARCH
    // ==========================================
    
    async searchFacebookGroups(query, groupUrls = []) {
        console.log(`🔍 Apify - szukam w grupach FB: ${query}`);
        console.log(`📝 groupUrls parameter:`, groupUrls, `type:`, typeof groupUrls, `length:`, groupUrls?.length);
        
        // 1. Sprawdź cache (4h TTL dla FB)
        const cacheKey = `apify_fb:${query}`;
        const cached = await cache.get(cacheKey);
        
        if (cached) {
            console.log('✅ Znaleziono w cache (Apify FB)');
            return cached;
        }
        
        // 2. Jeśli NIE PODANO grup - wczytaj ze świeżego pliku konfiguracyjnego
        console.log(`🔍 Checking: !groupUrls=${!groupUrls}, length==0=${groupUrls?.length === 0}`);
        if (!groupUrls || groupUrls.length === 0) {
            console.log('📋 Wczytuję grupy z facebook-groups.json...');
            const FB_GROUPS = loadFacebookGroups();
            
            // Zbierz wszystkie grupy z wszystkich kategorii
            const allGroups = [];
            for (const category in FB_GROUPS.groups) {
                const groupsInCat = FB_GROUPS.groups[category];
                console.log(`✅ Kategoria ${category}: ${groupsInCat ? groupsInCat.length : 0} grup`);
                if (groupsInCat && Array.isArray(groupsInCat)) {
                    allGroups.push(...groupsInCat);
                }
            }
            
            console.log(`📊 TOTAL: Zebrano ${allGroups.length} grup!`);
            
            if (allGroups.length === 0) {
                console.log('⚠️ DEMO MODE - brak skonfigurowanych grup. Zwracam przykładowe dane.');
                console.log('💡 Dodaj grupy do: backend/config/facebook-groups.json');
                
                // Symuluj opóźnienie API
                await this.sleep(2000);
                
                const mockData = this.getMockData(query);
                await cache.set(cacheKey, mockData, 4 * 60 * 60);
                return mockData;
            }
            
            // Użyj grup z konfiguracji
            groupUrls = allGroups;
            console.log(`📋 Używam ${groupUrls.length} grup ze skonfigurowanych kategorii`);
        }
        
        // 3. Wywołaj prawdziwy Apify Actor (gdy podano grupy)
        try {
            const actorId = '2chN8UQcH1CfxLRNE'; // apify/facebook-groups-scraper (2M runs)
            
            console.log(`🚀 Starting Apify Actor: ${actorId} (facebook-groups-scraper)`);
            console.log(`📍 Monitoruję ${groupUrls.length} grup dla query: ${query}`);
            console.log(`💡 TIP: Jeśli chcesz użyć zapisanych wyników z Apify Console:`);
            console.log(`   1. node download-apify-results.js <RUN_ID>`);
            console.log(`   2. Wyniki zapiszą się w apify-results/ folder`);
            
            // Przygotuj input dla actora
            // Format zgodny z dokumentacją Apify
            const input = {
                startUrls: groupUrls.map(g => ({ url: g })),
                resultsLimit: 20,
                captionText: false,
                onlyPostsNewerThan: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
            };
            
            console.log('📦 Input dla Apify:', JSON.stringify(input, null, 2));
            
            // Start actor run
            const runResponse = await axios.post(
                `${APIFY_API}/acts/${actorId}/runs`,
                input,
                {
                    params: { token: APIFY_TOKEN },
                    timeout: 15000
                }
            );
            
            const runId = runResponse.data.data.id;
            console.log(`⏳ Apify Run ID: ${runId} - czekam na wyniki...`);
            
            // 3. Czekaj na wyniki (max 3 minuty)
            let status = 'RUNNING';
            let attempts = 0;
            const maxAttempts = 36; // 36 * 5s = 3 minuty
            
            while (status === 'RUNNING' && attempts < maxAttempts) {
                await this.sleep(5000);
                
                const statusResponse = await axios.get(
                    `${APIFY_API}/actor-runs/${runId}`,
                    { params: { token: APIFY_TOKEN } }
                );
                
                status = statusResponse.data.data.status;
                attempts++;
                
                if (attempts % 3 === 0) { // Log co 15 sekund
                    console.log(`📊 Status: ${status} (${attempts * 5}s / 180s)`);
                }
            }
            
            if (status !== 'SUCCEEDED') {
                console.log(`⚠️ Apify timeout (status: ${status}) - fallback do mock data`);
                return this.getMockData(query);
            }
            
            // 4. Pobierz wyniki
            const resultsResponse = await axios.get(
                `${APIFY_API}/actor-runs/${runId}/dataset/items`,
                { params: { token: APIFY_TOKEN } }
            );
            
            const rawResults = resultsResponse.data || [];
            console.log(`✅ Apify zwrócił ${rawResults.length} postów`);
            
            // 5. Parsuj do naszego formatu
            const posts = rawResults.map(item => {
                // Spróbuj wygenerować poprawny URL do posta
                let postUrl = item.postUrl || item.url || '';
                
                // Jeśli mamy tylko URL grupy (bez /posts/), spróbuj dodać ID posta
                if (postUrl && !postUrl.includes('/posts/') && !postUrl.includes('/permalink/')) {
                    const postId = item.postId || item.id;
                    if (postId) {
                        // Usuń trailing slash z URL grupy
                        const groupUrl = postUrl.replace(/\/$/, '');
                        postUrl = `${groupUrl}/posts/${postId}`;
                    }
                }
                
                return {
                    author: item.authorName || 'Unknown',
                    text: item.text || item.postText || '',
                    url: postUrl,
                    postId: item.postId || item.id || null,
                    time: item.time || item.date || new Date().toISOString(),
                    likes: item.likes || 0,
                    comments: item.commentsCount || item.comments || 0,
                    shares: item.sharesCount || item.shares || 0,
                    groupName: item.groupName || 'Facebook Group',
                    groupUrl: item.groupUrl || ''
                };
            });
            
            const data = {
                query: query,
                source: `Apify Facebook Groups Scraper (${groupUrls.length} grup monitorowanych)`,
                totalPosts: posts.length,
                posts: posts,
                redFlags: this.detectRedFlags(posts),
                sentiment: this.analyzeSentiment(posts),
                potentialWitnesses: this.extractWitnesses(posts),
                retrievedAt: new Date().toISOString(),
                monitoredGroups: groupUrls.length
            };
            
            // 6. Cache na 4 godziny
            await cache.set(cacheKey, data, 4 * 60 * 60);
            
            console.log(`✅ Success! Znaleziono ${data.totalPosts} postów, ${data.redFlags.length} red flags`);
            return data;
            
        } catch (error) {
            console.error('❌ Błąd Apify:', error.message);
            if (error.response) {
                console.error('❌ Response status:', error.response.status);
                console.error('❌ Response data:', JSON.stringify(error.response.data));
            }
            
            // Sprawdź czy to limit exceeded
            const isLimitExceeded = error.response && 
                                   (error.response.status === 403 || error.response.status === 429);
            
            if (isLimitExceeded) {
                console.log('💡 Apify limit exceeded - próbuję użyć lokalnych danych...');
                
                // Spróbuj załadować lokalne dane
                try {
                    const localData = require('./apify-local-data');
                    const result = await localData.useLocalData(query);
                    
                    if (result) {
                        console.log(`✅ Używam lokalnych danych: ${result.totalPosts} postów dla "${query}"`);
                        
                        // Dodaj analizę nawet dla 0 wyników
                        result.redFlags = this.detectRedFlags(result.posts);
                        result.sentiment = this.analyzeSentiment(result.posts);
                        result.potentialWitnesses = this.extractWitnesses(result.posts);
                        
                        await cache.set(cacheKey, result, 4 * 60 * 60);
                        return result;
                    }
                } catch (localError) {
                    console.log('⚠️ Błąd lokalnych danych:', localError.message);
                    console.error(localError.stack);
                }
            }
            
            // Ostateczny fallback do mock data
            console.log('⚠️ Zwracam mock data jako fallback');
            return this.getMockData(query);
        }
    }
    
    // ==========================================
    // POMOCNICZE FUNKCJE
    // ==========================================
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    detectRedFlags(posts) {
        const redFlagKeywords = [
            'oszust', 'scam', 'fraud', 'nie płaci', 'ukradł', 'stolen',
            'policja', 'police', 'sąd', 'court', 'pozew', 'lawsuit',
            'upadłość', 'bankruptcy', 'złodziej', 'thief', 'avoid', 'unikać',
            'nie polecam', 'uwaga', 'oszustwo'
        ];
        
        const redFlags = [];
        
        posts.forEach(post => {
            const text = (post.text || '').toLowerCase();
            
            redFlagKeywords.forEach(keyword => {
                if (text.includes(keyword)) {
                    redFlags.push({
                        keyword: keyword,
                        text: (post.text || '').substring(0, 200) + '...',
                        author: post.author || 'Unknown',
                        url: post.url,
                        date: post.time || post.date,
                        groupName: post.groupName || ''
                    });
                }
            });
        });
        
        return redFlags;
    }
    
    analyzeSentiment(posts) {
        if (!posts || posts.length === 0) return 'neutral';
        
        const negativeWords = [
            'oszust', 'scam', 'nie płaci', 'unikać', 'avoid',
            'złodziej', 'thief', 'nie polecam', 'oszustwo', 'fraud'
        ];
        
        const positiveWords = [
            'polecam', 'recommend', 'świetny', 'dobry', 'profesjonalny',
            'uczciwy', 'rzetelny', 'solidny'
        ];
        
        let negativeCount = 0;
        let positiveCount = 0;
        
        posts.forEach(post => {
            const text = (post.text || '').toLowerCase();
            
            negativeWords.forEach(word => {
                if (text.includes(word)) negativeCount++;
            });
            
            positiveWords.forEach(word => {
                if (text.includes(word)) positiveCount++;
            });
        });
        
        if (negativeCount > positiveCount * 1.5) return 'negative';
        if (positiveCount > negativeCount * 1.5) return 'positive';
        return 'neutral';
    }
    
    extractWitnesses(posts) {
        // Prosta ekstrakcja potencjalnych świadków
        const witnesses = [];
        
        posts.forEach(post => {
            const text = post.text || '';
            const hasComplaint = /oszust|nie płaci|ukradł|nie polecam/i.test(text);
            
            if (hasComplaint && post.author && post.author !== 'Unknown') {
                witnesses.push({
                    name: post.author,
                    source: 'Facebook Group',
                    groupName: post.groupName || '',
                    complaint: text.substring(0, 150) + '...',
                    date: post.time || post.date,
                    url: post.url
                });
            }
        });
        
        return witnesses;
    }
    
    getMockData(query) {
        // Fallback mock data - DEMO MODE
        console.log(`📋 Generuję DEMO data dla: ${query}`);
        
        const mockPosts = [
            {
                author: 'Jan Kowalski',
                text: `Uwaga na firmę ${query}! Nie płacą faktur już 3 miesiące. Nie polecam! To kompletni oszuści.`,
                url: 'https://facebook.com/groups/oszusci-budowlani/posts/123',
                time: '2025-11-05',
                likes: 15,
                comments: 8,
                shares: 3,
                groupName: 'Oszuści Budowlani - Czarna Lista'
            },
            {
                author: 'Anna Nowak',
                text: `${query} - oszust! Wziął zaliczkę 20,000 PLN na remont i zniknął. Nie odbiera telefonu. UNIKAĆ!`,
                url: 'https://facebook.com/groups/czarna-lista-firm/posts/456',
                time: '2025-11-01',
                likes: 32,
                comments: 15,
                shares: 8,
                groupName: 'Czarna Lista Firm i Oszustów'
            },
            {
                author: 'Piotr Lewandowski',
                text: `Współpraca z ${query} - nie polecam. Opóźnienia w płatnościach, brak komunikacji. Strata czasu i pieniędzy.`,
                url: 'https://facebook.com/groups/nierzetelni-kontrahenci/posts/789',
                time: '2025-10-28',
                likes: 8,
                comments: 4,
                shares: 2,
                groupName: 'Nierzetelni Kontrahenci - Portal'
            },
            {
                author: 'Marek Zieliński',
                text: `UWAGA! ${query} to złodzieje! Nie wywiązali się z umowy, zabrali pieniądze. Zgłoszenie na policję w toku.`,
                url: 'https://facebook.com/groups/oszusci-pl/posts/999',
                time: '2025-10-15',
                likes: 45,
                comments: 23,
                shares: 12,
                groupName: 'Oszuści PL - Zgłoszenia'
            },
            {
                author: 'Katarzyna Wójcik',
                text: `${query} - pozytywna opinia! Szybko, rzetelnie, polecam! Dobra współpraca.`,
                url: 'https://facebook.com/groups/polecam-firmy/posts/555',
                time: '2025-11-08',
                likes: 5,
                comments: 2,
                shares: 1,
                groupName: 'Polecam Firmy i Usługi'
            }
        ];
        
        return {
            query: query,
            source: 'DEMO MODE - Przykładowe dane (podaj URL grup aby użyć prawdziwego Apify)',
            totalPosts: mockPosts.length,
            posts: mockPosts,
            redFlags: this.detectRedFlags(mockPosts),
            sentiment: this.analyzeSentiment(mockPosts),
            potentialWitnesses: this.extractWitnesses(mockPosts),
            retrievedAt: new Date().toISOString(),
            demoMode: true
        };
    }
    
    parseApifyResults(rawData, query) {
        // Parsuj wyniki z Apify do naszego formatu postów
        const posts = [];
        
        rawData.forEach(item => {
            // Apify Facebook Pages Scraper zwraca posty w strukturze:
            // { posts: [...], pageName, pageUrl, ... }
            if (item.posts && Array.isArray(item.posts)) {
                item.posts.forEach(post => {
                    posts.push({
                        author: post.authorName || item.pageName || 'Unknown',
                        text: post.text || '',
                        url: post.url || item.pageUrl || '',
                        time: post.time || post.date || new Date().toISOString(),
                        likes: post.likes || 0,
                        comments: post.comments || 0,
                        shares: post.shares || 0,
                        groupName: item.pageName || 'Facebook Page'
                    });
                });
            }
        });
        
        // Jeśli brak wyników, zwróć mock data
        if (posts.length === 0) {
            console.log('⚠️ Apify nie zwrócił postów - używam mock data');
            return this.getMockData(query).posts;
        }
        
        return posts;
    }
}

module.exports = new ApifyService();
