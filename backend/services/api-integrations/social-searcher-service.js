// ==========================================
// SOCIAL SEARCHER API INTEGRATION
// Agregator social media (Twitter, FB, Instagram, Reddit, YouTube)
// FREE: 100 req/dzień | Pro: $4.99/m unlimited
// ==========================================

const axios = require('axios');
const cache = require('../cache-service');

const SOCIAL_SEARCHER_API = 'https://api.social-searcher.com/v2';

class SocialSearcherService {
    
    async searchSocialMedia(query, options = {}) {
        console.log(`🔍 Social Searcher - szukam: ${query}`);
        
        // 1. Sprawdź cache (1h TTL)
        const cacheKey = `social:${query}`;
        const cached = await cache.get(cacheKey);
        
        if (cached) {
            console.log('✅ Znaleziono w cache (Social Searcher)');
            return cached;
        }
        
        // 2. Wywołaj API
        try {
            const response = await axios.get(`${SOCIAL_SEARCHER_API}/search`, {
                params: {
                    q: query,
                    network: options.network || 'facebook,twitter,instagram,youtube,reddit',
                    lang: options.lang || 'pl',
                    key: process.env.SOCIAL_SEARCHER_API_KEY
                },
                timeout: 10000
            });
            
            const posts = response.data.posts || [];
            
            // 3. Parsuj wyniki
            const data = {
                query: query,
                totalMentions: posts.length,
                
                // Grupuj po platformie
                platforms: {
                    facebook: posts.filter(p => p.network === 'facebook').length,
                    twitter: posts.filter(p => p.network === 'twitter').length,
                    instagram: posts.filter(p => p.network === 'instagram').length,
                    youtube: posts.filter(p => p.network === 'youtube').length,
                    reddit: posts.filter(p => p.network === 'reddit').length
                },
                
                // Sentiment analysis (prosty)
                sentiment: this.calculateSentiment(posts),
                
                // Ostatnie 10 postów
                recentPosts: posts.slice(0, 10).map(post => ({
                    network: post.network,
                    text: post.text || '',
                    url: post.url,
                    posted: post.posted,
                    user: post.user?.name || 'Unknown'
                })),
                
                // Red flags
                redFlags: this.detectRedFlags(posts),
                
                source: 'Social Searcher',
                retrievedAt: new Date().toISOString()
            };
            
            // 4. Cache na 1 godzinę
            await cache.set(cacheKey, data, 60 * 60);
            
            console.log(`✅ Social Searcher - znaleziono ${data.totalMentions} wzmianek`);
            return data;
            
        } catch (error) {
            console.error('❌ Błąd Social Searcher API:', error.message);
            
            if (error.response?.status === 401) {
                throw new Error('Nieprawidłowy klucz API Social Searcher');
            } else if (error.response?.status === 429) {
                throw new Error('Przekroczony limit requestów (100/dzień w planie FREE)');
            } else {
                throw new Error(`Błąd Social Searcher: ${error.message}`);
            }
        }
    }
    
    // Prosty sentiment analysis
    calculateSentiment(posts) {
        if (!posts || posts.length === 0) return 'neutral';
        
        const negativeWords = [
            'oszust', 'scam', 'fraud', 'nie polecam', 'złodziej', 
            'unikać', 'avoid', 'terrible', 'worst', 'awful', 
            'poor', 'disappointed', 'refund', 'problem', 'uwaga'
        ];
        
        const positiveWords = [
            'polecam', 'recommend', 'świetny', 'great', 'excellent',
            'amazing', 'super', 'perfect', 'best', 'professional',
            'helpful', 'fantastic', 'love', 'dobry'
        ];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
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
    
    // Wykrywanie red flags
    detectRedFlags(posts) {
        const redFlagKeywords = [
            'oszust', 'scam', 'fraud', 'nie płaci', 'ukradł', 'stolen',
            'policja', 'police', 'sąd', 'court', 'pozew', 'lawsuit',
            'upadłość', 'bankruptcy', 'złodziej', 'thief', 'avoid', 'unikać',
            'nie polecam', 'uwaga'
        ];
        
        const redFlags = [];
        
        posts.forEach(post => {
            const text = (post.text || '').toLowerCase();
            
            redFlagKeywords.forEach(keyword => {
                if (text.includes(keyword)) {
                    redFlags.push({
                        keyword: keyword,
                        text: (post.text || '').substring(0, 150) + '...',
                        url: post.url,
                        network: post.network,
                        date: post.posted
                    });
                }
            });
        });
        
        return redFlags;
    }
}

module.exports = new SocialSearcherService();
