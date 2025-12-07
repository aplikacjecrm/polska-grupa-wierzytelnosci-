// 🌐 INTELIGENTNY SCRAPER ISAP - PEŁNE TEKSTY USTAW

const axios = require('axios');
const cheerio = require('cheerio');

class ISAPFullScraper {
    constructor() {
        this.baseUrl = 'https://isap.sejm.gov.pl';
        this.documents = {
            'KC': 'wdu19640160093',
            'KPC': 'wdu19640430296',
            'KK': 'wdu19970880553',
            'KPK': 'wdu19970890555',
            'KP': 'wdu19740240141',
            'KRO': 'wdu19640090059',
            'KSH': 'wdu20000941037',
            'KPA': 'wdu19600300168'
        };
    }

    // Pobierz pełny tekst aktu prawnego
    async fetchFullText(codeType) {
        const docId = this.documents[codeType];
        if (!docId) {
            throw new Error(`Nieznany kod: ${codeType}`);
        }

        console.log(`\n╔${'═'.repeat(60)}╗`);
        console.log(`║  POBIERANIE PEŁNEGO TEKSTU: ${codeType.padEnd(42)}║`);
        console.log(`╚${'═'.repeat(60)}╝\n`);

        const url = `${this.baseUrl}/isap.nsf/DocDetails.xsp?id=${docId}`;
        console.log(`🔗 URL: ${url}`);

        try {
            // Krok 1: Pobierz główną stronę
            console.log('📥 Krok 1/3: Pobieranie strony głównej...');
            const response = await axios.get(url, {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            console.log('✅ Strona pobrana');

            // Krok 2: Znajdź link do pełnego tekstu
            console.log('🔍 Krok 2/3: Szukam linku do pełnego tekstu...');
            
            // ISAP ma różne struktury - szukamy kilku wariantów
            let fullTextUrl = null;
            
            // Wariant 1: Link "Tekst ujednolicony"
            const textLink = $('a:contains("Tekst")').first();
            if (textLink.length > 0) {
                const href = textLink.attr('href');
                if (href) {
                    fullTextUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
                    console.log(`✅ Znaleziono link: ${fullTextUrl}`);
                }
            }

            // Wariant 2: Link do PDF/HTML w sekcji dokumentu
            if (!fullTextUrl) {
                const docLinks = $('a[href*="download"], a[href*="DownloadFile"]');
                if (docLinks.length > 0) {
                    const href = docLinks.first().attr('href');
                    fullTextUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
                    console.log(`✅ Znaleziono alternatywny link: ${fullTextUrl}`);
                }
            }

            // Wariant 3: Tekst może być już na stronie
            if (!fullTextUrl) {
                console.log('⚠️  Link nie znaleziony - sprawdzam tekst na stronie głównej...');
                const content = $('.content, .document-content, .act-content, main, article').text();
                
                if (content.length > 1000) {
                    console.log('✅ Znaleziono tekst bezpośrednio na stronie');
                    return {
                        success: true,
                        source: 'main-page',
                        rawText: content,
                        url: url
                    };
                }
            }

            // Krok 3: Pobierz pełny tekst
            if (fullTextUrl) {
                console.log('📥 Krok 3/3: Pobieranie pełnego tekstu...');
                const fullResponse = await axios.get(fullTextUrl, {
                    timeout: 30000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                const $full = cheerio.load(fullResponse.data);
                const fullText = $full('body').text();

                console.log(`✅ Pobrano tekst (${fullText.length} znaków)`);

                return {
                    success: true,
                    source: 'full-text-page',
                    rawText: fullText,
                    url: fullTextUrl
                };
            }

            // Fallback: zwróć to co mamy
            console.log('⚠️  Pełny tekst niedostępny - zwracam zawartość strony głównej');
            return {
                success: false,
                source: 'fallback',
                rawText: $.text(),
                url: url,
                error: 'Nie znaleziono pełnego tekstu - potrzebna ręczna pomoc'
            };

        } catch (error) {
            console.error('❌ Błąd scrapingu:', error.message);
            return {
                success: false,
                error: error.message,
                needsManual: true
            };
        }
    }

    // Parsuj tekst na artykuły z pełną strukturą
    parseArticles(rawText) {
        console.log('\n📖 PARSING: Wykrywanie struktury artykułów...\n');

        const articles = [];
        
        // Regex dla artykułów
        // Dopasowanie: "Art. 123" lub "Artykuł 123" na początku linii
        const articleRegex = /(?:Art\.|Artykuł)\s*(\d+(?:\^?\d*)?)[^\n]*\n((?:(?!Art\.|Artykuł\s+\d)[\s\S])*?)(?=Art\.|Artykuł\s+\d|$)/gi;
        
        let match;
        let count = 0;
        
        while ((match = articleRegex.exec(rawText)) !== null) {
            const articleNumber = match[1];
            const articleContent = match[2].trim();
            
            if (articleContent.length > 10) { // Pomijamy puste
                const parsed = this.parseArticleStructure(articleNumber, articleContent);
                articles.push(parsed);
                count++;
                
                // Progress
                if (count % 10 === 0) {
                    process.stdout.write(`\r✅ Sparsowano ${count} artykułów...`);
                }
            }
        }
        
        console.log(`\n\n✅ PARSING zakończony: ${articles.length} artykułów\n`);
        
        return articles;
    }

    // Parsuj strukturę pojedynczego artykułu (§, pkt, lit)
    parseArticleStructure(articleNumber, content) {
        const structure = {
            number: articleNumber,
            fullContent: content,
            paragraphs: []
        };

        // Wykryj paragrafy (§)
        const paragraphRegex = /§\s*(\d+)[.\s]*((?:(?!§\s*\d)[\s\S])*?)(?=§\s*\d|$)/gi;
        let paragraphMatch;
        
        while ((paragraphMatch = paragraphRegex.exec(content)) !== null) {
            const parNumber = paragraphMatch[1];
            const parContent = paragraphMatch[2].trim();
            
            const paragraph = {
                number: parNumber,
                content: parContent,
                points: [],
                letters: []
            };
            
            // Wykryj punkty (1), 2), 3))
            const pointRegex = /(\d+)\)\s*((?:(?!\d+\))[\s\S])*?)(?=\d+\)|$)/gi;
            let pointMatch;
            
            while ((pointMatch = pointRegex.exec(parContent)) !== null) {
                const pointNumber = pointMatch[1];
                const pointContent = pointMatch[2].trim();
                
                const point = {
                    number: pointNumber,
                    content: pointContent,
                    letters: []
                };
                
                // Wykryj litery (a), b), c))
                const letterRegex = /([a-z])\)\s*((?:(?![a-z]\))[\s\S])*?)(?=[a-z]\)|$)/gi;
                let letterMatch;
                
                while ((letterMatch = letterRegex.exec(pointContent)) !== null) {
                    point.letters.push({
                        letter: letterMatch[1],
                        content: letterMatch[2].trim()
                    });
                }
                
                paragraph.points.push(point);
            }
            
            structure.paragraphs.push(paragraph);
        }
        
        // Jeśli nie ma paragrafów, cała treść to artykuł
        if (structure.paragraphs.length === 0) {
            structure.paragraphs.push({
                number: null,
                content: content,
                points: [],
                letters: []
            });
        }
        
        return structure;
    }

    // Generuj raport
    generateReport(articles) {
        const stats = {
            totalArticles: articles.length,
            withParagraphs: articles.filter(a => a.paragraphs.length > 1).length,
            withPoints: articles.filter(a => a.paragraphs.some(p => p.points.length > 0)).length,
            totalParagraphs: articles.reduce((sum, a) => sum + a.paragraphs.length, 0)
        };

        console.log('\n╔═══════════════════════════════════════════════════════╗');
        console.log('║              RAPORT SCRAPINGU                        ║');
        console.log('╠═══════════════════════════════════════════════════════╣');
        console.log(`║ 📄 Artykułów:            ${String(stats.totalArticles).padStart(5)}                    ║`);
        console.log(`║ § Paragrafów (total):    ${String(stats.totalParagraphs).padStart(5)}                    ║`);
        console.log(`║ 📋 Z paragrafami:        ${String(stats.withParagraphs).padStart(5)}                    ║`);
        console.log(`║ 🔹 Z punktami:           ${String(stats.withPoints).padStart(5)}                    ║`);
        console.log('╚═══════════════════════════════════════════════════════╝\n');

        return stats;
    }
}

module.exports = ISAPFullScraper;
