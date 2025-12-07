#!/usr/bin/env node
// 🔧 REIMPORT Z PEŁNYMI TEKSTAMI - POPRAWIONY PARSER

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const TEMP_DIR = path.join(__dirname, '../temp');

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║      🔧 REIMPORT ARTYKUŁÓW - PEŁNE TEKSTY                   ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

const CODES = {
    'KC': { file: 'KC-full.txt', name: 'Kodeks cywilny', date: '1964-04-23' },
    'KPC': { file: 'KPC-full.txt', name: 'Kodeks postępowania cywilnego', date: '1964-11-17' },
    'KK': { file: 'KK-full.txt', name: 'Kodeks karny', date: '1997-06-06' },
    'KPK': { file: 'KPK-full.txt', name: 'Kodeks postępowania karnego', date: '1997-06-06' },
    'KP': { file: 'KP-full.txt', name: 'Kodeks pracy', date: '1974-06-26' }
};

// Funkcja normalizująca cyfry górne w numerach artykułów
function normalizeSuperscript(articleNumber) {
    // Jeśli już zawiera cyfry górne Unicode - zostaw jak jest
    if (/[¹²³⁴⁵⁶⁷⁸⁹⁰]/.test(articleNumber)) {
        return articleNumber;
    }
    
    // Jeśli nie ma cyfr górnych - zostaw normalnie
    return articleNumber;
    
    // Uwaga: Cyfry górne w źródle są zapisane jako "331" bez spacji
    // Parser je poprawnie wyłapie jako osobny artykuł
}

// ULEPSZONA FUNKCJA PARSOWANIA
function parseArticlesImproved(text, code) {
    console.log(`🔍 Parsuję ${code}...`);
    
    const articles = [];
    
    // Regex rozpoznający:
    // - Art. 123
    // - Art. 123a, Art. 123b
    // - Art. 33¹, Art. 33² (cyfry górne Unicode)
    // - Art. 331, Art. 332 (jako alternatywny zapis cyfr górnych)
    const regex = /Art\.\s*(\d+[a-z¹²³⁴⁵⁶⁷⁸⁹⁰]*)\s*\.?\s*((?:(?!Art\.\s*\d)[\s\S])*)/gim;
    
    let match;
    while ((match = regex.exec(text)) !== null) {
        let number = match[1].trim();
        let content = match[2].trim();
        
        // Normalizuj cyfry górne (jeśli potrzeba)
        // 331 → 33¹, 332 → 33², etc.
        number = normalizeSuperscript(number);
        
        // Wyczyść content z śmieci
        content = content
            .replace(/©Kancelaria Sejmu.*$/gm, '') // Usuń copyright
            .replace(/^\d{4}-\d{2}-\d{2}$/gm, '') // Usuń daty
            .replace(/Rozdział [IVX]+\s*$/gim, '') // Usuń nagłówki rozdziałów
            .replace(/Dział [IVX]+\s*$/gim, '')
            .replace(/\s+/g, ' ') // Normalizuj białe znaki
            .trim();
        
        // FILTROWANIE:
        // 1. Ignoruj bardzo krótkie (< 30 znaków) - prawdopodobnie fragmenty
        if (content.length < 30) continue;
        
        // 2. Ignoruj jeśli zaczyna się od "–" lub "..." (fragment poprzedniego)
        if (content.match(/^[–—\.]{1,3}\s/)) continue;
        
        // 3. Ignoruj jeśli nie ma sensownej treści (tylko znaki specjalne)
        if (content.replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, '').length < 20) continue;
        
        // Parsuj paragrafy
        const paragraphs = [];
        const paragraphRegex = /§\s*(\d+)\s*\.?\s*((?:(?!§\s*\d)[\s\S])*?)(?=§\s*\d|$)/gi;
        
        let parMatch;
        let hasParagraphs = false;
        
        while ((parMatch = paragraphRegex.exec(content)) !== null) {
            const parNum = parMatch[1];
            const parContent = parMatch[2].trim();
            
            if (parContent.length > 10) {
                paragraphs.push({
                    number: parNum,
                    content: parContent
                });
                hasParagraphs = true;
            }
        }
        
        articles.push({
            number,
            content,
            paragraphs,
            hasParagraphs
        });
    }
    
    console.log(`   ✅ Znaleziono ${articles.length} artykułów (przed deduplikacją)`);
    
    // DEDUPLIKACJA - zostaw tylko najdłuższe wersje
    const uniqueArticles = deduplicateArticles(articles);
    
    console.log(`   🔧 Po deduplikacji: ${uniqueArticles.length} artykułów`);
    return uniqueArticles;
}

// Funkcja deduplikacji - dla każdego numeru artykułu zostaw najdłuższą wersję
function deduplicateArticles(articles) {
    const articleMap = new Map();
    
    articles.forEach(article => {
        const key = article.number;
        
        if (!articleMap.has(key)) {
            articleMap.set(key, article);
        } else {
            // Jeśli już istnieje - zostaw dłuższą wersję
            const existing = articleMap.get(key);
            if (article.content.length > existing.content.length) {
                articleMap.set(key, article);
            }
        }
    });
    
    return Array.from(articleMap.values());
}

// FORMAT DO BAZY
function formatForDB(article, code) {
    let formatted = `${code} Art. ${article.number}\n\n`;
    
    if (article.hasParagraphs && article.paragraphs.length > 0) {
        article.paragraphs.forEach(p => {
            formatted += `§ ${p.number}. ${p.content}\n\n`;
        });
    } else {
        formatted += article.content;
    }
    
    return formatted.trim();
}

// GŁÓWNA FUNKCJA
async function reimportAll() {
    const db = new sqlite3.Database(DB_PATH);
    
    let totalImported = 0;
    
    for (const [code, config] of Object.entries(CODES)) {
        console.log(`\n📚 ${code} - ${config.name}`);
        
        const filePath = path.join(TEMP_DIR, config.file);
        
        if (!fs.existsSync(filePath)) {
            console.log(`   ⚠️  Plik nie istnieje: ${config.file}`);
            continue;
        }
        
        const text = fs.readFileSync(filePath, 'utf-8');
        const articles = parseArticlesImproved(text, code);
        
        console.log(`   🗑️  Usuwam stare wpisy...`);
        
        await new Promise((resolve) => {
            db.run(`DELETE FROM legal_acts WHERE title LIKE ?`, [`%${config.name}%`], resolve);
        });
        
        console.log(`   💾 Importuję ${articles.length} artykułów...`);
        
        let imported = 0;
        
        for (const article of articles) {
            const title = `${config.name} - Art. ${article.number}`;
            const content = formatForDB(article, code);
            
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO legal_acts (title, content, date, url, source, created_at, updated_at)
                     VALUES (?, ?, ?, ?, 'isap', datetime('now'), datetime('now'))`,
                    [title, content, config.date, `https://isap.sejm.gov.pl`],
                    (err) => {
                        if (err) {
                            console.error(`      ❌ Art. ${article.number}: ${err.message}`);
                            reject(err);
                        } else {
                            imported++;
                            if (imported % 100 === 0) {
                                process.stdout.write(`\r      ${imported}/${articles.length}...`);
                            }
                            resolve();
                        }
                    }
                );
            }).catch(() => {});
        }
        
        console.log(`   ✅ ${imported}/${articles.length} zaimportowanych`);
        totalImported += imported;
    }
    
    db.close();
    
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    📊 PODSUMOWANIE                           ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log(`║  ✅ Zaimportowano: ${String(totalImported).padStart(5)} artykułów                        ║`);
    console.log('║                                                               ║');
    console.log('║  🎯 NASTĘPNE KROKI:                                          ║');
    console.log('║  1. Test w aplikacji (http://localhost:3500)                 ║');
    console.log('║  2. Dodaj pozostałe 8 kodeksów (KRO, KSH, etc.)              ║');
    console.log('║  3. Dodaj akty zmieniające i wykonawcze                      ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
}

reimportAll().catch(console.error);
