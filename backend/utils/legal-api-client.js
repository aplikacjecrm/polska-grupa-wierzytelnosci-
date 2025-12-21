const axios = require('axios');
const cheerio = require('cheerio');

let puppeteer = null;
try {
    puppeteer = require('puppeteer');
} catch (err) {
    console.warn('⚠️ Puppeteer not installed - some legal scraping features will be limited');
}

/**
 * 🔥 HYBRYDOWY SYSTEM POBIERANIA PRZEPISÓW Z PUPPETEER
 * 
 * Poziom 1: API ISAP (jeśli dostępne)
 * Poziom 2: Puppeteer (headless Chrome) - dla JS stron
 * Poziom 3: Web Scraping zwykły (fallback)
 * Poziom 4: Link do ISAP
 */

class LegalAPIClient {
    constructor() {
        this.browser = null; // Puppeteer browser instance
        // Mapowanie kodów na ID dokumentów ISAP
        this.isapDocuments = {
            'KC': { id: 'wdu19640160093', name: 'Kodeks cywilny', year: 1964 },
            'KPC': { id: 'wdu19640430296', name: 'Kodeks postępowania cywilnego', year: 1964 },
            'KK': { id: 'wdu19970880553', name: 'Kodeks karny', year: 1997 },
            'KPK': { id: 'wdu19970890555', name: 'Kodeks postępowania karnego', year: 1997 },
            'KP': { id: 'wdu19740240141', name: 'Kodeks pracy', year: 1974 },
            'KKW': { id: 'wdu19970900557', name: 'Kodeks karny wykonawczy', year: 1997 },
            'KKS': { id: 'wdu19991831158', name: 'Kodeks karny skarbowy', year: 1999 },
            'KW': { id: 'wdu19710120114', name: 'Kodeks wykroczeń', year: 1971 },
            'KRO': { id: 'wdu19640090059', name: 'Kodeks rodzinny i opiekuńczy', year: 1964 },
            'KSH': { id: 'wdu20000941037', name: 'Kodeks spółek handlowych', year: 2000 },
            'KPA': { id: 'wdu19600300168', name: 'Kodeks postępowania administracyjnego', year: 1960 }
        };
        
        this.stats = {
            apiCalls: 0,
            scrapeCalls: 0,
            cacheHits: 0,
            errors: 0
        };
    }
    
    /**
     * 🎯 GŁÓWNA METODA - pobierz artykuł z najlepszego źródła
     */
    async getArticle(code, articleNumber, options = {}) {
        console.log(`\n🔍 [LEGAL-API] Pobieranie Art. ${articleNumber} ${code}`);
        
        try {
            // POZIOM 1: Spróbuj oficjalnego API (jeśli dostępne w przyszłości)
            if (options.tryAPI !== false) {
                const apiResult = await this.tryOfficialAPI(code, articleNumber);
                if (apiResult) {
                    console.log('✅ [POZIOM 1] Pobrano z oficjalnego API');
                    this.stats.apiCalls++;
                    return this.validateAndFormat(apiResult, code, articleNumber);
                }
            }
            
            // POZIOM 2: Puppeteer (headless Chrome)
            console.log('⚙️ [POZIOM 2] Próbuję Puppeteer (headless Chrome)...');
            const puppeteerResult = await this.scrapeWithPuppeteer(code, articleNumber);
            if (puppeteerResult) {
                console.log('✅ [POZIOM 2] Pobrano przez Puppeteer!');
                this.stats.scrapeCalls++;
                return this.validateAndFormat(puppeteerResult, code, articleNumber);
            }
            
            // POZIOM 3: Zwykły scraping (fallback)
            console.log('⚙️ [POZIOM 3] Próbuję zwykły scraping...');
            const scrapeResult = await this.scrapeFromISAP(code, articleNumber);
            if (scrapeResult) {
                console.log('✅ [POZIOM 3] Pobrano przez scraping');
                this.stats.scrapeCalls++;
                return this.validateAndFormat(scrapeResult, code, articleNumber);
            }
            
            // POZIOM 4: Fallback
            console.log('⚠️ [POZIOM 4] Zwracam fallback');
            return this.getFallback(code, articleNumber);
            
        } catch (error) {
            console.error('❌ [LEGAL-API] Błąd:', error.message);
            this.stats.errors++;
            return this.getFallback(code, articleNumber);
        }
    }
    
    /**
     * 🤖 POZIOM 2: Puppeteer - headless Chrome dla JS stron
     */
    async scrapeWithPuppeteer(code, articleNumber) {
        // Jeśli puppeteer nie jest dostępny, pomiń
        if (!puppeteer) {
            console.log('⚠️ Puppeteer not available, skipping...');
            return null;
        }
        
        const docInfo = this.isapDocuments[code];
        if (!docInfo) {
            console.log(`⚠️ Nieznany kod: ${code}`);
            return null;
        }
        
        const url = `https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=${docInfo.id}`;
        
        try {
            // Uruchom browser jeśli nie działa
            if (!this.browser) {
                console.log('🚀 Uruchamiam Puppeteer browser...');
                this.browser = await puppeteer.launch({
                    headless: 'new',
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });
            }
            
            const page = await this.browser.newPage();
            
            // Ustaw timeout
            await page.setDefaultNavigationTimeout(30000);
            
            // Ustaw User-Agent
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            
            console.log(`🌐 Otwieram: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2' });
            
            // Poczekaj na załadowanie treści (nowa składnia)
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Wyciągnij całą treść strony
            const content = await page.evaluate(() => {
                // Usuń skrypty i style
                const scripts = document.querySelectorAll('script, style, noscript');
                scripts.forEach(el => el.remove());
                
                // Pobierz tekst z body
                return document.body.innerText;
            });
            
            await page.close();
            
            if (!content || content.length < 100) {
                console.log('⚠️ Puppeteer: Za mało treści');
                return null;
            }
            
            // Wyczyść whitespace
            const cleanContent = content.replace(/\s+/g, ' ').trim();
            
            // Znajdź artykuł
            const articlePattern = new RegExp(`Art\\.?\\s*${articleNumber}[^0-9][\\s\\S]{1,2000}`, 'i');
            const match = cleanContent.match(articlePattern);
            
            if (match) {
                let extracted = match[0].trim();
                
                // Obetnij do następnego artykułu
                const nextArticleMatch = extracted.match(/Art\\.?\\s*\d+[^0-9]/g);
                if (nextArticleMatch && nextArticleMatch.length > 1) {
                    const secondArticleIndex = extracted.indexOf(nextArticleMatch[1]);
                    if (secondArticleIndex > 0) {
                        extracted = extracted.substring(0, secondArticleIndex).trim();
                    }
                }
                
                // Walidacja
                if (extracted.length < 20) {
                    console.log('⚠️ Puppeteer: Za krótka treść artykułu');
                    return null;
                }
                
                console.log(`✅ Puppeteer: Znaleziono ${extracted.length} znaków`);
                
                return {
                    text: extracted,
                    source: 'puppeteer-scraped',
                    url: url,
                    scrapedAt: new Date().toISOString()
                };
            }
            
            console.log(`⚠️ Puppeteer: Nie znaleziono Art. ${articleNumber}`);
            return null;
            
        } catch (error) {
            console.error(`❌ Puppeteer błąd: ${error.message}`);
            return null;
        }
    }
    
    /**
     * 🧹 Zamknij browser (call on shutdown)
     */
    async close() {
        if (this.browser) {
            console.log('🛑 Zamykam Puppeteer browser...');
            await this.browser.close();
            this.browser = null;
        }
    }
    
    /**
     * 🌐 POZIOM 1: Oficjalne API (przygotowane na przyszłość)
     */
    async tryOfficialAPI(code, articleNumber) {
        // TODO: Gdy ISAP udostępni oficjalne API
        // const response = await axios.get(`https://api.sejm.gov.pl/eli/acts/${code}/${articleNumber}`);
        // return response.data;
        
        console.log('ℹ️ [API] Oficjalne API jeszcze niedostępne');
        return null;
    }
    
    /**
     * 🕷️ POZIOM 2: Web Scraping z walidacją
     */
    async scrapeFromISAP(code, articleNumber) {
        const docInfo = this.isapDocuments[code];
        if (!docInfo) {
            console.log(`⚠️ Nieznany kod: ${code}`);
            return null;
        }
        
        const url = `https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=${docInfo.id}`;
        
        try {
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const $ = cheerio.load(response.data);
            
            // Różne selektory dla treści
            let content = '';
            
            // Próba 1: <div class="content">
            content = $('.content').text();
            
            // Próba 2: <div id="content">
            if (!content) content = $('#content').text();
            
            // Próba 3: <article>
            if (!content) content = $('article').text();
            
            // Próba 4: Cała strona jako fallback
            if (!content) content = $('body').text();
            
            // Wyczyść whitespace
            content = content.replace(/\s+/g, ' ').trim();
            
            // Znajdź artykuł w treści
            const articlePattern = new RegExp(`Art\\.?\\s*${articleNumber}[^0-9].*?(?=Art\\.?\\s*\\d+|$)`, 'is');
            const match = content.match(articlePattern);
            
            if (match) {
                const extracted = match[0].trim().substring(0, 2000); // Max 2000 znaków
                
                // Walidacja bazowa
                if (extracted.length < 20) {
                    console.log('⚠️ Za krótka treść artykułu');
                    return null;
                }
                
                return {
                    text: extracted,
                    source: 'isap-scraped',
                    url: url,
                    scrapedAt: new Date().toISOString()
                };
            }
            
            console.log(`⚠️ Nie znaleziono Art. ${articleNumber} w treści`);
            return null;
            
        } catch (error) {
            console.error(`❌ Błąd scrapingu: ${error.message}`);
            return null;
        }
    }
    
    /**
     * ✅ WALIDACJA i formatowanie
     */
    validateAndFormat(data, code, articleNumber) {
        const validation = {
            hasText: !!data.text,
            hasArticleNumber: data.text && data.text.includes(`Art. ${articleNumber}`),
            minLength: data.text && data.text.length >= 20,
            hasCode: code && code.length > 0
        };
        
        const isValid = Object.values(validation).every(v => v);
        
        if (!isValid) {
            console.log('⚠️ Walidacja niepomyślna:', validation);
        }
        
        // Wykryj paragrafy
        const paragraphs = data.text ? data.text.match(/§\s*\d+/g) || [] : [];
        
        return {
            article: articleNumber,
            code: code,
            text: data.text,
            paragraphs: paragraphs.map(p => p.replace(/§\s*/, '')),
            source: data.source || 'unknown',
            url: data.url,
            scrapedAt: data.scrapedAt,
            validated: isValid,
            validation: validation
        };
    }
    
    /**
     * 🔗 POZIOM 3: Fallback
     */
    getFallback(code, articleNumber) {
        const docInfo = this.isapDocuments[code];
        
        return {
            article: articleNumber,
            code: code,
            text: null,
            source: 'fallback',
            url: docInfo ? `https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=${docInfo.id}` : 'https://isap.sejm.gov.pl',
            note: `Art. ${articleNumber} ${code} dostępny w oficjalnym źródle ISAP.`,
            validated: false
        };
    }
    
    /**
     * 📊 Statystyki
     */
    getStats() {
        return {
            ...this.stats,
            successRate: this.stats.apiCalls + this.stats.scrapeCalls > 0 
                ? ((this.stats.apiCalls + this.stats.scrapeCalls) / (this.stats.apiCalls + this.stats.scrapeCalls + this.stats.errors) * 100).toFixed(2) + '%'
                : '0%'
        };
    }
}

// Singleton
const client = new LegalAPIClient();

module.exports = {
    LegalAPIClient,
    client
};
