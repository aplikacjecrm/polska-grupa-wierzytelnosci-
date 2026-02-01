// 📚 BIBLIOTEKA PRAWNA - Interaktywny podgląd kodeksów

console.log('📚 [v18] Biblioteka prawna - BEZ przycisków Poprzedni/Następny!');

// Dane kodeksów z linkami do ISAP - PEŁNA BIBLIOTEKA PRAWNA! 📚
window.LEGAL_CODES = {
    // === KODEKSY PODSTAWOWE ===
    'KC': {
        name: 'Kodeks Cywilny',
        color: '#1a2332',
        icon: '📘',
        category: 'Prawo cywilne',
        isapUrl: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640160093',
        articles: {}
    },
    'KPC': {
        name: 'Kodeks Postępowania Cywilnego',
        color: '#2c3e50',
        icon: '📗',
        category: 'Prawo cywilne',
        isapUrl: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640430296',
        articles: {}
    },
    'KK': {
        name: 'Kodeks Karny',
        color: '#c0392b',
        icon: '📕',
        category: 'Prawo karne',
        isapUrl: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970880553',
        articles: {}
    },
    'KPK': {
        name: 'Kodeks Postępowania Karnego',
        color: '#d35400',
        icon: '📙',
        category: 'Prawo karne',
        isapUrl: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970890555',
        articles: {}
    },
    'KP': {
        name: 'Kodeks Pracy',
        color: '#16a085',
        icon: '📒',
        category: 'Prawo pracy',
        isapUrl: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19740240141',
        articles: {}
    },
    
    // === KODEKSY KARNE SPECJALNE ===
    'KKW': {
        name: 'Kodeks Karny Wykonawczy',
        color: '#34495e',
        icon: '🔒',
        category: 'Prawo karne',
        isapUrl: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970900557',
        articles: {}
    },
    'KKS': {
        name: 'Kodeks Karny Skarbowy',
        color: '#d4af37',
        icon: '💰',
        category: 'Prawo karne',
        isapUrl: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19990830930',
        articles: {}
    },
    'KW': {
        name: 'Kodeks Wykroczeń',
        color: '#e67e22',
        icon: '⚠️',
        category: 'Prawo wykroczeń',
        isapUrl: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19710120114',
        articles: {}
    },
    'KPW': {
        name: 'Kodeks Postępowania w Sprawach o Wykroczenia',
        color: '#f39c12',
        icon: '⚖️',
        category: 'Prawo wykroczeń',
        isapUrl: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20010980071',
        articles: {}
    },
    
    // === PRAWO RODZINNE I GOSPODARCZE ===
    'KRO': {
        name: 'Kodeks Rodzinny i Opiekuńczy',
        color: '#8e44ad',
        icon: '👨‍👩‍👧‍👦',
        category: 'Prawo rodzinne',
        isapUrl: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640090059',
        articles: {}
    },
    'KSH': {
        name: 'Kodeks Spółek Handlowych',
        color: '#16a085',
        icon: '🏢',
        category: 'Prawo gospodarcze',
        isapUrl: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20000941037',
        articles: {}
    },
    
    // === PRAWO ADMINISTRACYJNE ===
    'KPA': {
        name: 'Kodeks Postępowania Administracyjnego',
        color: '#5d6d7e',
        icon: '🏛️',
        category: 'Prawo administracyjne',
        isapUrl: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19600300168',
        articles: {}
    },
    'PPSA': {
        name: 'Prawo o Postępowaniu przed Sądami Administracyjnymi',
        color: '#7f8c8d',
        icon: '⚖️',
        category: 'Prawo administracyjne',
        isapUrl: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20021531270',
        articles: {}
    },
    
    // === KODEKSY SPECJALNE ===
    'KW_WYBORCZY': {
        name: 'Kodeks Wyborczy',
        color: '#2980b9',
        icon: '🗳️',
        category: 'Prawo wyborcze',
        isapUrl: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20110210112',
        articles: {}
    },
    'KM': {
        name: 'Kodeks Morski',
        color: '#1abc9c',
        icon: '⚓',
        category: 'Prawo morskie',
        isapUrl: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20010380356',
        articles: {}
    },
    
    // === USTAWY SZCZEGÓLNE ===
    'PRD': {
        name: 'Prawo o Ruchu Drogowym',
        color: '#34495e',
        icon: '🚗',
        category: 'Prawo o ruchu',
        isapUrl: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970980602',
        articles: {}
    }
};

// Alias dla kompatybilności wstecz
const LEGAL_CODES = window.LEGAL_CODES;

// 🔥 POPULARNE ARTYKUŁY DLA KAŻDEGO KODEKSU
function getPopularArticlesForCode(code) {
    const popularArticles = {
        'KC': [
            { ref: '1', label: 'Art. 1 - Zakres zastosowania KC' },
            { ref: '41', label: 'Art. 41 - Przymioty i wady fizyczne' },
            { ref: '58', label: 'Art. 58 - Nieważność czynności prawnej' },
            { ref: '353', label: 'Art. 353 - Zasada swobody umów' },
            { ref: '415', label: 'Art. 415 - Odpowiedzialność deliktowa' },
            { ref: '444', label: 'Art. 444 - Odszkodowanie' },
            { ref: '445', label: 'Art. 445 - Renta' },
            { ref: '455', label: 'Art. 455 - Naprawienie szkody' },
            { ref: '471', label: 'Art. 471 - Odpowiedzialność za niewykonanie' },
            { ref: '535', label: 'Art. 535 - Umowa sprzedaży' },
            { ref: '647', label: 'Art. 647 - Roboty budowlane' },
            { ref: '659', label: 'Art. 659 - Umowa najmu' },
            { ref: '805', label: 'Art. 805 - Umowa ubezpieczenia' },
            { ref: '827', label: 'Art. 827 - Rzecz' }
        ],
        'KK': [
            { ref: '1', label: 'Art. 1 - Zakres zastosowania KK' },
            { ref: '45', label: 'Art. 45 - Zasady wymiaru kary' },
            { ref: '53', label: 'Art. 53 - Warunkowe zawieszenie' },
            { ref: '115', label: 'Art. 115 - Definicje' },
            { ref: '148', label: 'Art. 148 - Zabójstwo' },
            { ref: '156', label: 'Art. 156 - Ciężki uszczerbek na zdrowiu' },
            { ref: '157', label: 'Art. 157 - Średni uszczerbek' },
            { ref: '207', label: 'Art. 207 - Znęcanie się' },
            { ref: '278', label: 'Art. 278 - Kradzież' },
            { ref: '280', label: 'Art. 280 - Rozbój' },
            { ref: '286', label: 'Art. 286 - Oszustwo' },
            { ref: '288', label: 'Art. 288 - Kradzież z włamaniem' }
        ],
        'KPC': [
            { ref: '1', label: 'Art. 1 - Zakres zastosowania KPC' },
            { ref: '187', label: 'Art. 187 - Ciężar dowodu' },
            { ref: '233', label: 'Art. 233 - Swobodna ocena dowodów' },
            { ref: '367', label: 'Art. 367 - Terminy procesowe' },
            { ref: '391', label: 'Art. 391 - Sprostowanie' },
            { ref: '394', label: 'Art. 394 - Uzupełnienie' },
            { ref: '496', label: 'Art. 496 - Zażalenie' },
            { ref: '505', label: 'Art. 505 - Apelacja' }
        ],
        'KPK': [
            { ref: '1', label: 'Art. 1 - Zakres zastosowania KPK' },
            { ref: '5', label: 'Art. 5 - Zasady procesu' },
            { ref: '41', label: 'Art. 41 - Prawo do obrony' },
            { ref: '60', label: 'Art. 60 - Oskarżyciel' },
            { ref: '71', label: 'Art. 71 - Oskarżony' },
            { ref: '167', label: 'Art. 167 - Zabezpieczenie dowodów' },
            { ref: '249', label: 'Art. 249 - Tymczasowe aresztowanie' },
            { ref: '293', label: 'Art. 293 - Przeszukanie' }
        ],
        'KP': [
            { ref: '1', label: 'Art. 1 - Zakres zastosowania KP' },
            { ref: '22', label: 'Art. 22 - Umowa o pracę' },
            { ref: '30', label: 'Art. 30 - Wypowiedzenie' },
            { ref: '45', label: 'Art. 45 - Rozwiązanie bez wypowiedzenia' },
            { ref: '94', label: 'Art. 94 - Obowiązki pracodawcy' },
            { ref: '100', label: 'Art. 100 - Obowiązki pracownika' },
            { ref: '128', label: 'Art. 128 - Czas pracy' },
            { ref: '151', label: 'Art. 151 - Nadgodziny' },
            { ref: '154', label: 'Art. 154 - Urlop wypoczynkowy' },
            { ref: '300', label: 'Art. 300 - Kary porządkowe' }
        ]
    };
    
    return popularArticles[code] || [];
}

// Formatowanie pełnej referencji artykułu zgodnie z hierarchią prawniczą
function formatFullArticleReference(parsed) {
    let result = `Artykuł ${parsed.article.replace('^', '¹')}`;  // Zamień ^ na indeks górny
    
    if (parsed.paragraph) {
        result += ` § ${parsed.paragraph}`;
    }
    
    if (parsed.punkt) {
        result += ` pkt ${parsed.punkt}`;
    }
    
    if (parsed.litera) {
        result += ` lit. ${parsed.litera}`;
    }
    
    return result;
}

// Parsowanie referencji do artykułu - PEŁNA HIERARCHIA PRAWNICZA! 🎯
function parseArticleReference(reference) {
    console.log('🔍 [PARSER] Analizuję:', reference);
    
    // Sprawdź czy reference nie jest undefined/null
    if (!reference) {
        console.warn('⚠️ [PARSER] Reference is undefined');
        return null;
    }
    
    // KROK 1: Usuń wielokrotne spacje
    let normalized = reference.replace(/\s+/g, ' ').trim();
    
    // KROK 2: Normalizuj znaki: zamień indeksy górne na zwykłe liczby z oznaczeniem
    // 353¹ → 353^1, 647² → 647^2
    normalized = normalized.replace(/([0-9])([¹²³⁴⁵⁶⁷⁸⁹⁰]+)/g, (match, num, superscript) => {
        const superMap = {'¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁰':'0'};
        const normalNum = superscript.split('').map(c => superMap[c] || c).join('');
        return num + '^' + normalNum;
    });
    
    // KROK 3: Jeśli brak 'art.' na początku i zaczyna się od cyfry, dodaj 'art.'
    if (/^\d/.test(normalized) && !/^art/i.test(normalized)) {
        normalized = 'art. ' + normalized;
    }
    
    console.log('📝 [PARSER] Znormalizowano:', normalized);
    
    // WZORZEC PEŁNEJ HIERARCHII:
    // art. [nr z indeksem] [§/ust.] [nr] [pkt] [nr] [lit.] [litera] [KOD]
    const fullPattern = /art\.?\s*(\d+(?:\^\d+)?)\s*(?:§|ust\.?)?\s*(\d+)?\s*(?:pkt\.?)?\s*(\d+)?\s*(?:lit\.?)?\s*([a-z])?\s*(KC|KPC|KK|KPK|KP|KKW|KKS|KW|KPW|KRO|KSH|KPA|PPSA|KW_WYBORCZY|KM|PRD|k\.c\.|k\.p\.c\.|k\.k\.|k\.p\.k\.|k\.p\.|k\.r\.o\.|k\.s\.h\.|k\.p\.a\.)/i;
    
    let match = normalized.match(fullPattern);
    
    if (match) {
        let code = match[5].toUpperCase();
        // Konwersja skrótów kropkowych na pełne kody
        code = code.replace('K.C.', 'KC')
                   .replace('K.P.C.', 'KPC')
                   .replace('K.K.', 'KK')
                   .replace('K.P.K.', 'KPK')
                   .replace('K.P.', 'KP')
                   .replace('K.R.O.', 'KRO')
                   .replace('K.S.H.', 'KSH')
                   .replace('K.P.A.', 'KPA');
        
        const parsed = {
            code: code,
            article: match[1],  // może zawierać ^1, ^2 itp.
            paragraph: match[2] || null,
            punkt: match[3] || null,
            litera: match[4] || null,
            fullText: reference
        };
        
        console.log('✅ [PARSER] Rozparsowano:', parsed);
        return parsed;
    }
    
    // FALLBACK: Stary prosty wzorzec (bez punktów i liter)
    match = normalized.match(/art\.?\s*(\d+(?:\^\d+)?)\s*(?:§|ust\.?)?\s*(\d+)?\s*(KC|KPC|KK|KPK|KP|KKW|KKS|KW|KPW|KRO|KSH|KPA|PPSA|KW_WYBORCZY|KM|PRD|k\.c\.|k\.p\.c\.|k\.k\.|k\.p\.k\.|k\.p\.|k\.r\.o\.|k\.s\.h\.|k\.p\.a\.)/i);
    
    if (match) {
        let code = match[3].toUpperCase();
        code = code.replace('K.C.', 'KC')
                   .replace('K.P.C.', 'KPC')
                   .replace('K.K.', 'KK')
                   .replace('K.P.K.', 'KPK')
                   .replace('K.P.', 'KP')
                   .replace('K.R.O.', 'KRO')
                   .replace('K.S.H.', 'KSH')
                   .replace('K.P.A.', 'KPA');
        
        const parsed = {
            code: code,
            article: match[1],
            paragraph: match[2] || null,
            punkt: null,
            litera: null,
            fullText: reference
        };
        
        console.log('✅ [PARSER] Rozparsowano (prosty):', parsed);
        return parsed;
    }
    
    // Jeśli brak kodu, spróbuj sam numer (np. "art. 118")
    match = normalized.match(/art\.?\s*(\d+(?:\^\d+)?)\s*(?:§|ust\.?)?\s*(\d+)?\s*(?:pkt\.?)?\s*(\d+)?\s*(?:lit\.?)?\s*([a-z])?/i);
    
    if (match) {
        // Brak kodu - pokaż wybór kodeksu
        console.log('⚠️ [PARSER] Brak kodu - potrzebny wybór');
        return {
            code: null,
            article: match[1],
            paragraph: match[2] || null,
            punkt: match[3] || null,
            litera: match[4] || null,
            fullText: reference,
            needsCodeSelection: true
        };
    }
    
    console.log('❌ [PARSER] Nie rozpoznano wzorca');
    return null;
}

// Główna funkcja otwierająca bibliotekę
window.showLegalLibrary = async function(articleReference) {
    console.log('📚 Otwieranie biblioteki dla:', articleReference);
    
    const parsed = parseArticleReference(articleReference);
    
    if (!parsed) {
        alert('❌ Nie można rozpoznać artykułu: ' + articleReference);
        return;
    }
    
    // Jeśli brak kodu - pokaż modal wyboru kodeksu
    if (parsed.needsCodeSelection) {
        showCodeSelectionModal(parsed);
        return;
    }
    
    const codeInfo = LEGAL_CODES[parsed.code];
    
    if (!codeInfo) {
        alert('❌ Nieznany kodeks: ' + parsed.code);
        return;
    }
    
    // Utwórz modal biblioteki
    createLibraryModal(parsed, codeInfo);
};

// Modal wyboru kodeksu
function showCodeSelectionModal(parsed) {
    const modal = document.createElement('div');
    modal.id = 'codeSelectionModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: rgba(0,0,0,0.85);
        backdrop-filter: blur(10px);
        z-index: 999999;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        opacity: 0;
        animation: fadeIn 0.3s forwards;
        padding: 5px;
        padding-top: 60px;
        overflow-y: auto;
    `;
    
    modal.innerHTML = `
        <style>
            @keyframes fadeIn { to { opacity: 1; } }
            @keyframes popIn {
                0% { transform: scale(0.8); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes slideDown {
                from { max-height: 0; opacity: 0; }
                to { max-height: 200px; opacity: 1; }
            }
            .code-card {
                transition: all 0.3s;
                cursor: pointer;
            }
            .code-card:hover {
                transform: translateY(-10px) scale(1.05);
                box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            }
        </style>
        
        <div style="
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 20px;
            max-width: 1400px;
            width: 95%;
            max-height: calc(100vh - 40px);
            padding: 15px;
            box-shadow: 0 25px 80px rgba(0,0,0,0.5);
            animation: popIn 0.4s ease-out;
            display: flex;
            flex-direction: column;
        ">
            <div style="text-align: center; margin-bottom: 15px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; gap: 10px;">
                    <div style="flex: 1; min-width: 0;">
                        <h2 style="margin: 0; color: white; font-size: 1.2rem; display: flex; align-items: center; gap: 6px;">
                            📚 Wybierz kodeks
                        </h2>
                        <p style="color: rgba(255,255,255,0.7); font-size: 0.85rem; margin: 4px 0 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${formatFullArticleReference(parsed)}
                        </p>
                    </div>
                    
                    <!-- 💡 PRZYCISK POMOCY -->
                    <button id="toggleHelp" onclick="document.getElementById('helpBox').style.display = document.getElementById('helpBox').style.display === 'none' ? 'block' : 'none'"
                            style="
                                padding: 8px 12px;
                                background: rgba(46,204,113,0.2);
                                border: 2px solid rgba(46,204,113,0.4);
                                border-radius: 8px;
                                color: #FFD700;
                                cursor: pointer;
                                font-size: 0.9rem;
                                font-weight: 600;
                                transition: all 0.3s;
                            "
                            onmouseover="this.style.background='rgba(46,204,113,0.3)'"
                            onmouseout="this.style.background='rgba(46,204,113,0.2)'">
                        💡 Pomoc
                    </button>
                </div>
                
                <!-- 💡 ZWIJANA INSTRUKCJA -->
                <div id="helpBox" style="
                    display: none;
                    background: linear-gradient(135deg, rgba(46,204,113,0.15), rgba(39,174,96,0.15));
                    border: 2px solid rgba(46,204,113,0.3);
                    border-radius: 10px;
                    padding: 12px 15px;
                    margin: 0 auto 12px auto;
                    max-width: 700px;
                    text-align: left;
                    animation: slideDown 0.3s ease-out;
                ">
                    <div style="font-weight: 600; margin-bottom: 8px; color: #FFD700; font-size: 0.85rem;">
                        Jak wyszukiwać:
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.75rem; color: rgba(255,255,255,0.9);">
                        <div><code style="background: rgba(26,35,50,0.6); padding: 2px 6px; border-radius: 3px; color: #FFD700; font-size: 0.75rem; border: 1px solid rgba(255,215,0,0.3);">art. 42 KC</code> - prosty</div>
                        <div><code style="background: rgba(26,35,50,0.6); padding: 2px 6px; border-radius: 3px; color: #FFD700; font-size: 0.75rem; border: 1px solid rgba(255,215,0,0.3);">art. 415 § 1 KC</code> - z §</div>
                        <div><code style="background: rgba(26,35,50,0.6); padding: 2px 6px; border-radius: 3px; color: #FFD700; font-size: 0.75rem; border: 1px solid rgba(255,215,0,0.3);">art. 647¹ k.c.</code> - indeks</div>
                        <div><code style="background: rgba(26,35,50,0.6); padding: 2px 6px; border-radius: 3px; color: #FFD700; font-size: 0.75rem; border: 1px solid rgba(255,215,0,0.3);">art. 5 § 1 pkt 2 lit. b</code> - pełny</div>
                    </div>
                </div>
            </div>
            
            <div style="flex: 1; overflow-y: auto; margin-bottom: 15px; padding: 5px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
                ${Object.entries(LEGAL_CODES).map(([code, info]) => `
                    <div class="code-card" 
                         onclick="window.selectCodeAndShow('${code}', '${parsed.article}', ${parsed.paragraph ? "'" + parsed.paragraph + "'" : 'null'})"
                         style="
                            background: linear-gradient(135deg, ${info.color}, ${adjustColor(info.color, -30)});
                            padding: 20px 15px;
                            border-radius: 12px;
                            text-align: center;
                            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
                        ">
                        <div style="font-size: 3rem; margin-bottom: 10px;">${info.icon}</div>
                        <div style="color: white; font-weight: 700; font-size: 1.1rem; margin-bottom: 6px;">${code}</div>
                        <div style="color: rgba(255,255,255,0.9); font-size: 0.8rem; line-height: 1.3;">${info.name}</div>
                    </div>
                `).join('')}
                </div>
            </div>
            
            <button onclick="document.getElementById('codeSelectionModal').remove()" 
                    style="
                        width: 100%;
                        padding: 12px;
                        background: rgba(255,255,255,0.1);
                        border: 2px solid rgba(255,255,255,0.3);
                        color: white;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.9rem;
                        font-weight: 600;
                        transition: all 0.3s;
                    "
                    onmouseover="this.style.background='rgba(255,255,255,0.2)'"
                    onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                Anuluj
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Wybór kodeksu i otwarcie biblioteki
window.selectCodeAndShow = function(code, article, paragraph) {
    // Usuń modal wyboru
    const modal = document.getElementById('codeSelectionModal');
    if (modal) modal.remove();
    
    // Utwórz pełną referencję
    const fullReference = `art. ${article}${paragraph ? ' § ' + paragraph : ''} ${code}`;
    
    // Otwórz bibliotekę
    window.showLegalLibrary(fullReference);
};

// Tworzenie modala z animacją biblioteki - ULEPSZONA WERSJA!
function createLibraryModal(parsed, codeInfo) {
    const modal = document.createElement('div');
    modal.id = 'legalLibraryModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: rgba(0,0,0,0.85);
        backdrop-filter: blur(10px);
        z-index: 999999;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        opacity: 0;
        animation: fadeIn 0.3s forwards;
        padding: 5px;
        padding-top: 50px;
        overflow-y: auto;
    `;
    
    modal.innerHTML = `
        <style>
            @keyframes fadeIn {
                to { opacity: 1; }
            }
            @keyframes slideInFromTop {
                from {
                    transform: translateY(-100px) scale(0.9);
                    opacity: 0;
                }
                to {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
            }
            @keyframes bookOpen {
                from {
                    transform: perspective(1000px) rotateY(-90deg);
                }
                to {
                    transform: perspective(1000px) rotateY(0deg);
                }
            }
            @keyframes shimmer {
                0% { background-position: -1000px 0; }
                100% { background-position: 1000px 0; }
            }
            .library-book {
                transition: all 0.3s;
                cursor: pointer;
            }
            .library-book:hover {
                transform: translateY(-10px) scale(1.05);
                box-shadow: 0 15px 40px rgba(0,0,0,0.4);
            }
        </style>
        
        <div style="
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 20px;
            max-width: 900px;
            width: 95%;
            max-height: calc(100vh - 40px);
            overflow: hidden;
            box-shadow: 0 25px 80px rgba(0,0,0,0.5);
            animation: slideInFromTop 0.5s ease-out;
            display: flex;
            flex-direction: column;
            padding: 15px;
        ">
            <!-- Header -->
            <div style="
                background: linear-gradient(135deg, #1a2332, #2c3e50);
                padding: 18px 20px;
                border-bottom: 3px solid #FFD700;
                position: relative;
                overflow: visible;
                min-height: 60px;
            ">
                <div style="
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    background-size: 1000px 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    animation: shimmer 3s infinite;
                "></div>
                
                <div style="position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0; color: white; font-size: 1.3rem; display: flex; align-items: center; gap: 8px;">
                            ${codeInfo.icon} ${codeInfo.name}
                        </h2>
                    </div>
                    <button onclick="document.getElementById('legalLibraryModal').remove()" 
                            style="
                                background: rgba(255,255,255,0.2);
                                border: 2px solid white;
                                color: white;
                                width: 35px;
                                height: 35px;
                                border-radius: 50%;
                                cursor: pointer;
                                font-size: 1.2rem;
                                font-weight: bold;
                                transition: all 0.3s;
                            "
                            onmouseover="this.style.background='#FFD700'; this.style.color='#1a2332'; this.style.transform='rotate(90deg)'"
                            onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.color='white'; this.style.transform='rotate(0deg)'">
                        ✕
                    </button>
                </div>
            </div>
            
            <!-- Content -->
            <div style="flex: 1; overflow-y: auto; padding: 20px 15px; min-height: 0;">
                <!-- Wyszukiwarka artykułów w tym kodeksie -->
                <div style="margin-bottom: 25px;">
                    <h3 style="color: white; margin: 0 0 10px 0; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                        🔍 Wyszukaj inny artykuł w ${parsed.code}
                    </h3>
                    
                    <!-- 💡 INSTRUKCJA WYSZUKIWANIA -->
                    <div style="
                        background: linear-gradient(135deg, rgba(52,152,219,0.2), rgba(41,128,185,0.2));
                        border: 2px solid rgba(52,152,219,0.4);
                        border-radius: 10px;
                        padding: 15px;
                        margin-bottom: 15px;
                        font-size: 0.9rem;
                        color: rgba(255,255,255,0.9);
                    ">
                        <div style="font-weight: 700; margin-bottom: 8px; color: #FFD700; display: flex; align-items: center; gap: 8px;">
                            💡 Jak wyszukiwać:
                        </div>
                        <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 12px; font-size: 0.85rem;">
                            <span style="color: #FFD700; font-weight: 600;">Prosty:</span>
                            <span>42</span>
                            
                            <span style="color: #FFD700; font-weight: 600;">Z §:</span>
                            <span>42 § 1</span>
                            
                            <span style="color: #FFD700; font-weight: 600;">Pełny:</span>
                            <span>5 § 1 pkt 2 lit. b</span>
                            
                            <span style="color: #FFD700; font-weight: 600;">Indeks:</span>
                            <span>647¹ § 5</span>
                        </div>
                        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 0.8rem; color: rgba(255,255,255,0.7);">
                            ⚡ Naciśnij <kbd style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; font-weight: 600;">Enter</kbd> aby wyszukać
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; flex-direction: column;">
                        <!-- COMBOBOX Z POPULARNYMI ARTYKUŁAMI -->
                        <select id="popularArticles" 
                                onchange="if(this.value) { document.getElementById('quickArticleSearch').value = this.value; window.searchInCurrentCode('${parsed.code}', this.value); }"
                                style="
                                    padding: 12px 15px;
                                    border: 2px solid ${codeInfo.color};
                                    border-radius: 10px;
                                    background: rgba(255,255,255,0.15);
                                    color: white;
                                    font-size: 1rem;
                                    outline: none;
                                    cursor: pointer;
                                ">
                            <option value="">🔥 Popularne artykuły - wybierz</option>
                            ${getPopularArticlesForCode(parsed.code).map(art => 
                                `<option value="${art.ref}" style="background: #1a1a2e;">${art.label}</option>`
                            ).join('')}
                        </select>
                        
                        <!-- INPUT WŁASNEGO ARTYKUŁU -->
                        <div style="display: flex; gap: 10px;">
                            <input type="text" 
                                   id="quickArticleSearch" 
                                   placeholder="lub wpisz własny: 42, 42 § 1, 5 § 1 pkt 2 lit. b" 
                                   style="
                                        flex: 1;
                                        padding: 12px 15px;
                                        border: 2px solid ${codeInfo.color};
                                        border-radius: 10px;
                                        background: rgba(255,255,255,0.1);
                                        color: white;
                                        font-size: 1rem;
                                        outline: none;
                                    "
                                   onkeyup="if(event.key==='Enter') window.searchInCurrentCode('${parsed.code}', this.value)"
                                   onfocus="this.style.background='rgba(255,255,255,0.15)'"
                                   onblur="this.style.background='rgba(255,255,255,0.1)'">
                        <button onclick="window.searchInCurrentCode('${parsed.code}', document.getElementById('quickArticleSearch').value)"
                                style="
                                    padding: 12px 20px;
                                    background: ${codeInfo.color};
                                    border: none;
                                    border-radius: 10px;
                                    color: white;
                                    font-weight: 600;
                                    cursor: pointer;
                                    transition: all 0.3s;
                                "
                                onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.3)'"
                                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none'">
                            Szukaj
                        </button>
                    </div>
                    <div style="margin-top: 8px; color: rgba(255,255,255,0.6); font-size: 0.85rem;">
                        💡 Naciśnij Enter aby szybko wyszukać
                    </div>
                </div>
                
                <!-- Treść artykułu -->
                <div id="articleContent" style="
                    background: rgba(255,255,255,0.05);
                    border: 2px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 25px;
                    animation: bookOpen 0.6s ease-out;
                ">
                    <div style="color: rgba(255,255,255,0.6); text-align: center; padding: 40px;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">📖</div>
                        <div style="font-size: 1.1rem;">Ładowanie treści artykułu...</div>
                    </div>
                </div>
                
                <!-- Akcje -->
                <div style="margin-top: 25px; display: flex; gap: 12px; flex-wrap: wrap;">
                    <a href="${codeInfo.isapUrl}" target="_blank"
                       style="
                            flex: 1;
                            padding: 15px 20px;
                            background: linear-gradient(135deg, #1a2332, #2c3e50);
                            border: 2px solid #FFD700;
                            color: white;
                            border-radius: 10px;
                            cursor: pointer;
                            font-weight: 600;
                            text-decoration: none;
                            text-align: center;
                            transition: all 0.3s;
                            box-shadow: 0 4px 15px rgba(46,204,113,0.3);
                        "
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(46,204,113,0.5)'"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(46,204,113,0.3)'">
                        🔗 Otwórz w ISAP (oficjalne źródło)
                    </a>
                    
                    <button onclick="window.showCourtDecisionsForArticleByQuery('${parsed.code}', '${parsed.article}', 'ALL')"
                            style="
                                flex: 1;
                                padding: 14px 25px;
                                background: linear-gradient(135deg, #1a2332, #2c3e50);
                                border: 2px solid #FFD700;
                                color: white;
                                border-radius: 10px;
                                cursor: pointer;
                                font-weight: 600;
                                font-size: 1rem;
                                transition: all 0.3s;
                                box-shadow: 0 4px 15px rgba(102,126,234,0.4);
                            "
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102,126,234,0.5)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(102,126,234,0.4)'">
                        ⚖️ Orzeczenia sądów (SN, TK, NSA)
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Załaduj treść artykułu
    loadArticleContent(parsed, codeInfo);
}

// Ładowanie treści artykułu - POPRAWIONE!
async function loadArticleContent(parsed, codeInfo) {
    const contentDiv = document.getElementById('articleContent');
    
    // Ustaw opacity na 0 przed rozpoczęciem
    contentDiv.style.opacity = '0';
    
    // Loader
    contentDiv.innerHTML = `
        <div style="color: white; text-align: center; padding: 40px;">
            <div style="font-size: 3rem; margin-bottom: 15px; animation: spin 1s linear infinite;">⚖️</div>
            <div style="font-size: 1.1rem;">Ładowanie artykułu...</div>
        </div>
        <style>
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        </style>
    `;
    
    // Płynne pojawienie się loadera
    setTimeout(() => {
        contentDiv.style.opacity = '1';
        contentDiv.style.transition = 'opacity 0.2s ease';
    }, 10);
    
    try {
        console.log('📖 [FRONTEND] Wysyłam request:', {
            code: parsed.code,
            article: parsed.article,
            paragraph: parsed.paragraph,
            url: '/api/ai/legal-acts/article'
        });
        
        // Próba pobrania z naszej bazy
        const API_URL = 'http://localhost:3500';
        const response = await fetch(`${API_URL}/api/ai/legal-acts/article`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                code: parsed.code,
                article: parsed.article,
                paragraph: parsed.paragraph
            })
        });
        
        console.log('📖 [FRONTEND] Response status:', response.status);
        console.log('📖 [FRONTEND] Response OK:', response.ok);
        console.log('📖 [FRONTEND] Response headers:', response.headers);
        
        if (response.ok) {
            const data = await response.json();
            console.log('📖 [FRONTEND] Response data:', data);
            console.log('📖 [FRONTEND] data.answer exists?', !!data.answer);
            console.log('📖 [FRONTEND] data.answer value:', data.answer);
            displayArticleContent(contentDiv, data, parsed, codeInfo);
        } else {
            const errorText = await response.text();
            console.warn('⚠️ [FRONTEND] Artykuł nie znaleziony:', response.status, errorText);
            showBasicInfo(contentDiv, parsed, codeInfo);
        }
    } catch (error) {
        console.error('❌ [FRONTEND] Błąd ładowania artykułu:', error);
        console.error('❌ [FRONTEND] Error details:', {
            message: error.message,
            stack: error.stack
        });
        showBasicInfo(contentDiv, parsed, codeInfo);
    }
}

// Wyświetl treść artykułu - SZCZEGÓŁOWO!
function displayArticleContent(container, data, parsed, codeInfo) {
    console.log('📖 [displayArticleContent] Wywołano:', { hasAnswer: !!data.answer, answerLength: data.answer?.length });
    
    if (data.answer && data.answer.length > 0) {
        // Mamy treść artykułu - pokaż szczegółowo
        console.log('✅ [displayArticleContent] Wyświetlam szczegóły artykułu');
        container.innerHTML = `
            <div style="color: white;">
                <!-- Nagłówek -->
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 15px;
                    background: linear-gradient(135deg, ${codeInfo.color}33, ${codeInfo.color}11);
                    border-radius: 10px;
                    margin-bottom: 20px;
                    border-left: 4px solid ${codeInfo.color};
                ">
                    <div style="font-size: 2.5rem;">${codeInfo.icon}</div>
                    <div>
                        <div style="font-size: 1.2rem; font-weight: 700; margin-bottom: 5px;">
                            ${codeInfo.name}
                        </div>
                        <div style="font-size: 0.95rem; color: rgba(255,255,255,0.8);">
                            ${formatFullArticleReference(parsed)}
                        </div>
                    </div>
                </div>
                
                <!-- Ostrzeżenie jeśli paragraf nie znaleziony -->
                ${data.warning ? `
                <div style="
                    background: linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,152,0,0.2));
                    border: 2px solid rgba(255,193,7,0.5);
                    border-radius: 10px;
                    padding: 15px;
                    margin-bottom: 20px;
                    color: #3B82F6;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                ">
                    <span style="font-size: 1.5rem;">⚠️</span>
                    <div>
                        <strong>Uwaga:</strong> ${data.warning}
                        <br><small style="opacity: 0.8;">Pełna treść paragrafu dostępna na stronie ISAP.</small>
                    </div>
                </div>
                ` : ''}
                
                <!-- Struktura hierarchiczna -->
                ${parsed.paragraph || parsed.punkt || parsed.litera ? `
                <div style="
                    background: linear-gradient(135deg, rgba(52,152,219,0.2), rgba(155,89,182,0.2));
                    border: 2px dashed rgba(52,152,219,0.5);
                    border-radius: 10px;
                    padding: 15px;
                    margin-bottom: 20px;
                ">
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-bottom: 10px; font-weight: 600;">
                        🗂️ STRUKTURA HIERARCHICZNA:
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 0.95rem;">
                        <span style="background: rgba(52,152,219,0.3); padding: 5px 12px; border-radius: 6px; font-weight: 600;">
                            📄 Artykuł ${parsed.article}
                        </span>
                        ${parsed.paragraph ? `
                            <span style="color: rgba(255,255,255,0.5);">→</span>
                            <span style="background: rgba(155,89,182,0.3); padding: 5px 12px; border-radius: 6px; font-weight: 600;">
                                § Paragraf ${parsed.paragraph}
                            </span>
                        ` : ''}
                        ${parsed.punkt ? `
                            <span style="color: rgba(255,255,255,0.5);">→</span>
                            <span style="background: rgba(46,204,113,0.3); padding: 5px 12px; border-radius: 6px; font-weight: 600;">
                                🔹 Punkt ${parsed.punkt}
                            </span>
                        ` : ''}
                        ${parsed.litera ? `
                            <span style="color: rgba(255,255,255,0.5);">→</span>
                            <span style="background: rgba(241,196,15,0.3); padding: 5px 12px; border-radius: 6px; font-weight: 600;">
                                🔸 Litera ${parsed.litera}
                            </span>
                        ` : ''}
                    </div>
                </div>
                ` : ''}
                
                <!-- Przyciski akcji -->
                <div style="display: flex; justify-content: center; margin-bottom: 20px;">
                    <button onclick="window.copyArticleText('${parsed.code}', '${parsed.article}')" 
                            style="
                                padding: 12px 30px;
                                background: linear-gradient(135deg, rgba(46,204,113,0.3), rgba(39,174,96,0.3));
                                border: 2px solid rgba(46,204,113,0.5);
                                border-radius: 10px;
                                color: white;
                                font-weight: 600;
                                cursor: pointer;
                                transition: all 0.3s;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 8px;
                            "
                            onmouseover="this.style.background='linear-gradient(135deg, rgba(46,204,113,0.5), rgba(39,174,96,0.5))'"
                            onmouseout="this.style.background='linear-gradient(135deg, rgba(46,204,113,0.3), rgba(39,174,96,0.3))'">
                        📋 Kopiuj artykuł
                    </button>
                </div>
                
                <!-- Treść artykułu -->
                <div style="margin-bottom: 25px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h4 style="
                            margin: 0;
                            font-size: 1.1rem;
                            color: ${codeInfo.color};
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        ">
                            📖 Dokładne brzmienie przepisu:
                        </h4>
                        <button onclick="window.showFullCode('${parsed.code}', '${parsed.article}')" style="
                            background: linear-gradient(135deg, #1a2332, #2c3e50);
                            color: white;
                            border: 2px solid #FFD700;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 0.85rem;
                            font-weight: 600;
                            transition: all 0.3s;
                            box-shadow: 0 2px 8px rgba(155,89,182,0.3);
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            📚 Cały kodeks
                        </button>
                    </div>
                    <div id="articleTextContent" style="
                        background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
                        padding: 25px;
                        border-radius: 12px;
                        border: 2px solid ${codeInfo.color}44;
                        box-shadow: inset 0 2px 10px rgba(0,0,0,0.2);
                    ">
                        <div style="
                            line-height: 1.9;
                            font-size: 1.05rem;
                            color: rgba(255,255,255,0.95);
                            text-align: justify;
                            font-family: Georgia, serif;
                        ">
                            ${data.answer.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                </div>
                
                <!-- Informacje dodatkowe -->
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 12px;
                    margin-top: 20px;
                ">
                    <div style="
                        background: rgba(52,152,219,0.2);
                        padding: 12px;
                        border-radius: 8px;
                        border-left: 3px solid #3B82F6;
                    ">
                        <div style="font-size: 0.8rem; color: rgba(255,255,255,0.7); margin-bottom: 4px;">
                            📊 Typ
                        </div>
                        <div style="font-weight: 600; font-size: 0.9rem;">
                            ${parsed.paragraph ? 'Paragraf' : 'Artykuł'}
                        </div>
                    </div>
                    
                    <div style="
                        background: rgba(155,89,182,0.2);
                        padding: 12px;
                        border-radius: 8px;
                        border-left: 3px solid #3B82F6;
                    ">
                        <div style="font-size: 0.8rem; color: rgba(255,255,255,0.7); margin-bottom: 4px;">
                            📚 Kodeks
                        </div>
                        <div style="font-weight: 600; font-size: 0.9rem;">
                            ${parsed.code}
                        </div>
                    </div>
                    
                    <div style="
                        background: rgba(46,204,113,0.2);
                        padding: 12px;
                        border-radius: 8px;
                        border-left: 3px solid #3B82F6;
                    ">
                        <div style="font-size: 0.8rem; color: rgba(255,255,255,0.7); margin-bottom: 4px;">
                            🏛️ Kategoria
                        </div>
                        <div style="font-weight: 600; font-size: 0.9rem;">
                            ${codeInfo.category || 'Prawo'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Brak treści - podstawowe info
        console.log('⚠️ [displayArticleContent] Brak treści - pokazuję podstawowe info');
        showBasicInfo(container, parsed, codeInfo, data);
    }
}

// Pokazanie podstawowych informacji gdy brak treści
function showBasicInfo(container, parsed, codeInfo, data = {}) {
    console.log('📋 [showBasicInfo] Wyświetlam podstawowe info:', { code: parsed.code, article: parsed.article });
    
    const note = data?.note || 'Treść artykułu dostępna w oficjalnym źródle ISAP.';
    
    container.innerHTML = `
        <div style="color: white;">
            <!-- Przyciski nawigacji -->
            <div style="display: flex; justify-content: center; margin-bottom: 25px;">
                <button onclick="window.showFullCode('${parsed.code}', '${parsed.article}')" 
                        style="
                            padding: 12px 30px;
                            background: linear-gradient(135deg, #1a2332, #2c3e50);
                            border: 2px solid #FFD700;
                            border-radius: 10px;
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                        "
                        onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 20px rgba(255,215,0,0.4)'"
                        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none'">
                    📚 Cały kodeks
                </button>
            </div>
            
            <!-- Podstawowe info -->
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">${codeInfo.icon}</div>
                <h3 style="margin: 0 0 15px 0; font-size: 1.5rem;">
                    Art. ${parsed.article}${parsed.paragraph ? ' § ' + parsed.paragraph : ''} ${codeInfo.name}
                </h3>
                <p style="color: rgba(255,255,255,0.7); margin-bottom: 25px; line-height: 1.6;">
                    ${note}<br>
                    <strong>Każdy artykuł ze wszystkich 16 kodeksów jest dostępny w systemie ISAP.</strong>
                </p>
                <div style="
                    background: rgba(255,255,255,0.05);
                    border: 2px dashed rgba(255,255,255,0.2);
                    border-radius: 8px;
                    padding: 20px;
                    margin-top: 20px;
                ">
                    <div style="font-size: 0.9rem; color: rgba(255,255,255,0.6);">
                        📚 Informacje podstawowe
                    </div>
                    <div style="margin-top: 10px; color: rgba(255,255,255,0.8);">
                        Kodeks: <strong>${codeInfo.name}</strong><br>
                        Artykuł: <strong>${parsed.article}</strong><br>
                        ${parsed.paragraph ? `Paragraf: <strong>${parsed.paragraph}</strong>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Wyszukiwanie w aktualnym kodeksie
window.searchInCurrentCode = function(code, articleInput) {
    let trimmed = articleInput.trim();
    if (!trimmed) {
        alert('⚠️ Podaj numer artykułu');
        return;
    }
    
    // Walidacja: usuń niechciane znaki
    trimmed = trimmed.replace(/[^0-9§abcdefghijklmnopqrstuvwxyzłąćęńóśźż\s.]/gi, '');
    
    // Jeśli już ma 'art.' nie dodawaj ponownie
    if (/^art/i.test(trimmed)) {
        var fullRef = trimmed + ' ' + code;
    } else {
        var fullRef = 'art. ' + trimmed + ' ' + code;
    }
    
    console.log('🔍 Wyszukiwanie w', code, ':', fullRef);
    
    // Zamknij obecny modal
    const modal = document.getElementById('legalLibraryModal');
    if (modal) modal.remove();
    
    // Otwórz nowy artykuł w tym samym kodeksie
    window.showLegalLibrary(fullRef);
};

// Szukaj orzecznictwa
window.searchJurisprudence = function(article) {
    const searchUrl = `https://orzeczenia.ms.gov.pl/search?q=${encodeURIComponent(article)}`;
    window.open(searchUrl, '_blank');
};

// Pomocnicza funkcja do przyciemniania koloru
function adjustColor(color, amount) {
    const num = parseInt(color.replace("#", ""), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// Pokaż szerszy kontekst artykułu (artykuły przed i po)
window.showArticleContext = async function(code, articleNum) {
    console.log('🔍 Pokazuję kontekst dla:', code, articleNum);
    
    // Pobierz +/- 3 artykuły
    const articleNumber = parseInt(articleNum.replace(/\^.*$/, ''));
    const range = 3;
    const from = Math.max(1, articleNumber - range);
    const to = articleNumber + range;
    
    // Modal z kontekstem
    const modal = document.createElement('div');
    modal.id = 'contextModal';
    // Dodaj style animacji jeśli nie istnieją
    if (!document.getElementById('contextAnimationStyles')) {
        const style = document.createElement('style');
        style.id = 'contextAnimationStyles';
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.05); }
            }
        `;
        document.head.appendChild(style);
    }
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.92);
        backdrop-filter: blur(15px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999999;
        animation: fadeIn 0.3s;
    `;
    
    const codeInfo = LEGAL_CODES[code];
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #1a2332, #2d3748);
            border-radius: 15px;
            width: 90%;
            max-width: 1200px;
            max-height: 90vh;
            overflow: hidden;
            box-shadow: 0 10px 50px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
        ">
            <!-- Header -->
            <div style="
                background: linear-gradient(135deg, #1a2332, #2c3e50);
                border-bottom: 3px solid #FFD700;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 2rem;">${codeInfo.icon}</span>
                    <div>
                        <h3 style="margin: 0; font-size: 1.3rem; color: white;">
                            Szerszy kontekst przepisu
                        </h3>
                        <p style="margin: 5px 0 0 0; font-size: 0.9rem; color: rgba(255,255,255,0.8);">
                            ${codeInfo.name} - Art. ${from} do ${to}
                        </p>
                    </div>
                </div>
                <button onclick="document.getElementById('contextModal').remove()" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 1.5rem;
                    transition: all 0.3s;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    ✕
                </button>
            </div>
            
            <!-- Nawigacja do całych kart -->
            <div style="
                padding: 15px 25px;
                background: rgba(255,255,255,0.03);
                border-bottom: 1px solid rgba(255,255,255,0.1);
                display: flex;
                gap: 10px;
            ">
                <button onclick="window.navigateContextRange('${code}', ${Math.max(1, from - 7)})" 
                        style="
                            flex: 1;
                            padding: 10px 15px;
                            background: linear-gradient(135deg, rgba(255,215,0,0.2), rgba(212,175,55,0.2));
                            border: 2px solid rgba(255,215,0,0.4);
                            border-radius: 8px;
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s;
                        "
                        onmouseover="this.style.background='linear-gradient(135deg, rgba(255,215,0,0.3), rgba(212,175,55,0.3))'"
                        onmouseout="this.style.background='linear-gradient(135deg, rgba(255,215,0,0.2), rgba(212,175,55,0.2))'">
                    ← Poprzednie artykuły
                </button>
                
                <button onclick="window.copyContextArticles('${code}', ${from}, ${to})" 
                        style="
                            flex: 1;
                            padding: 10px 15px;
                            background: linear-gradient(135deg, rgba(46,204,113,0.3), rgba(39,174,96,0.3));
                            border: 2px solid rgba(46,204,113,0.5);
                            border-radius: 8px;
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s;
                        "
                        onmouseover="this.style.background='linear-gradient(135deg, rgba(46,204,113,0.5), rgba(39,174,96,0.5))'"
                        onmouseout="this.style.background='linear-gradient(135deg, rgba(46,204,113,0.3), rgba(39,174,96,0.3))'">
                    📋 Kopiuj wszystkie
                </button>
                
                <button onclick="window.navigateContextRange('${code}', ${to + 1})" 
                        style="
                            flex: 1;
                            padding: 10px 15px;
                            background: linear-gradient(135deg, rgba(255,215,0,0.2), rgba(212,175,55,0.2));
                            border: 2px solid rgba(255,215,0,0.4);
                            border-radius: 8px;
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s;
                        "
                        onmouseover="this.style.background='linear-gradient(135deg, rgba(255,215,0,0.3), rgba(212,175,55,0.3))'"
                        onmouseout="this.style.background='linear-gradient(135deg, rgba(255,215,0,0.2), rgba(212,175,55,0.2))'">
                    Następne artykuły →
                </button>
            </div>
            
            <!-- Wyszukiwanie artykułu -->
            <div style="
                padding: 15px 25px;
                background: rgba(255,255,255,0.05);
                border-bottom: 1px solid rgba(255,255,255,0.1);
            ">
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span style="color: rgba(255,255,255,0.7); font-size: 0.9rem; white-space: nowrap;">
                        🔍 Przejdź do:
                    </span>
                    <input type="text" 
                           id="contextSearchInput" 
                           placeholder="Wpisz numer artykułu (np. 450)" 
                           style="
                               flex: 1;
                               padding: 10px 15px;
                               border: 2px solid rgba(212,175,55,0.5);
                               border-radius: 8px;
                               background: rgba(255,255,255,0.1);
                               color: white;
                               font-size: 0.95rem;
                               outline: none;
                           "
                           onkeyup="if(event.key==='Enter') window.searchArticleInContext('${code}')"
                           onfocus="this.style.background='rgba(255,255,255,0.15)'; this.style.borderColor='#FFD700'"
                           onblur="this.style.background='rgba(255,255,255,0.1)'; this.style.borderColor='rgba(212,175,55,0.5)'">
                    <button onclick="window.searchArticleInContext('${code}')" 
                            style="
                                padding: 10px 20px;
                                background: linear-gradient(135deg, #1a2332, #2c3e50);
                                border: 2px solid #FFD700;
                                border-radius: 8px;
                                color: white;
                                font-weight: 600;
                                cursor: pointer;
                                transition: all 0.3s;
                                white-space: nowrap;
                            "
                            onmouseover="this.style.transform='scale(1.05)'"
                            onmouseout="this.style.transform='scale(1)'">
                        Szukaj
                    </button>
                </div>
                <div style="margin-top: 5px; color: rgba(255,255,255,0.5); font-size: 0.75rem;">
                    💡 Naciśnij Enter aby szybko przejść do artykułu
                </div>
            </div>
            
            <!-- Content -->
            <div id="contextContent" style="
                flex: 1;
                overflow-y: auto;
                padding: 25px;
            ">
                <div style="text-align: center; padding: 40px; color: white;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">⏳</div>
                    <p>Ładuję kontekst artykułów...</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Pobierz artykuły z zakresu
    const contentDiv = document.getElementById('contextContent');
    const articles = [];
    
    for (let i = from; i <= to; i++) {
        try {
            const response = await fetch(`http://localhost:3500/api/ai/legal-acts/article`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: code,
                    article: i.toString(),
                    paragraph: null
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                articles.push({
                    number: i,
                    content: data.answer,
                    isCurrent: i === articleNumber
                });
            }
        } catch (error) {
            console.error('Błąd pobierania Art.', i, error);
        }
    }
    
    // Wyświetl artykuły
    if (articles.length === 0) {
        contentDiv.innerHTML = `
            <div style="text-align: center; padding: 40px; color: white;">
                <div style="font-size: 3rem; margin-bottom: 15px;">❌</div>
                <p>Nie udało się pobrać kontekstu</p>
            </div>
        `;
        return;
    }
    
    contentDiv.innerHTML = articles.map(art => `
        <div style="
            background: ${art.isCurrent ? 
                `linear-gradient(135deg, ${codeInfo.color}33, ${codeInfo.color}11)` : 
                'rgba(255,255,255,0.05)'};
            border: 2px solid ${art.isCurrent ? codeInfo.color : 'rgba(255,255,255,0.1)'};
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            ${art.isCurrent ? 'box-shadow: 0 4px 20px rgba(0,0,0,0.3);' : ''}
        ">
            <div style="
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 12px;
                padding-bottom: 10px;
                border-bottom: 2px solid ${art.isCurrent ? codeInfo.color : 'rgba(255,255,255,0.1)'};
            ">
                <span style="
                    background: ${art.isCurrent ? codeInfo.color : 'rgba(255,255,255,0.2)'};
                    color: white;
                    padding: 5px 15px;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 0.95rem;
                ">
                    Art. ${art.number}
                </span>
                ${art.isCurrent ? `
                    <span style="
                        background: linear-gradient(135deg, #FFD700, #d4af37);
                        color: #1a2332;
                        padding: 3px 10px;
                        border-radius: 4px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        animation: pulse 2s infinite;
                    ">
                        🎯 AKTUALNY
                    </span>
                ` : ''}
            </div>
            <div style="
                color: ${art.isCurrent ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)'};
                line-height: 1.8;
                font-size: ${art.isCurrent ? '1.05rem' : '0.95rem'};
                font-family: ${art.isCurrent ? 'Georgia, serif' : 'inherit'};
            ">
                ${art.content ? art.content.replace(/\n/g, '<br>') : '<em style="opacity: 0.5;">Treść niedostępna w cache</em>'}
            </div>
        </div>
    `).join('');
    
    // Scroll do aktualnego artykułu
    setTimeout(() => {
        const currentArticle = contentDiv.querySelector('[style*="AKTUALNY"]')?.parentElement?.parentElement;
        if (currentArticle) {
            currentArticle.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
};

// Nawigacja do poprzedniego/następnego artykułu
window.navigateArticle = async function(code, articleNumber) {
    console.log('🔄 [navigateArticle] START - Nawigacja do:', code, articleNumber);
    
    if (articleNumber < 1) {
        console.warn('⚠️ [navigateArticle] Artykuł < 1, pokazuję alert');
        alert('⚠️ To jest już pierwszy artykuł w kodeksie');
        return;
    }
    
    // Parse nowego artykułu
    console.log('🔄 [navigateArticle] Parsowanie artykułu...');
    const parsed = window.parseLegalQuery(`art. ${articleNumber} ${code}`);
    const codeInfo = window.LEGAL_CODES[code];
    
    console.log('🔄 [navigateArticle] Parsed:', parsed);
    console.log('🔄 [navigateArticle] CodeInfo:', codeInfo);
    
    if (!parsed || !codeInfo) {
        console.error('❌ [navigateArticle] Nie można sparsować artykułu:', articleNumber, code);
        return;
    }
    
    // Animacja fade out zawartości
    console.log('🔄 [navigateArticle] Fade out...');
    const contentDiv = document.getElementById('articleContent');
    if (contentDiv) {
        contentDiv.style.opacity = '0';
        contentDiv.style.transition = 'opacity 0.15s ease';
    } else {
        console.error('❌ [navigateArticle] Nie znaleziono articleContent!');
    }
    
    // Poczekaj na animację
    await new Promise(resolve => setTimeout(resolve, 150));
    console.log('🔄 [navigateArticle] Fade out complete');
    
    // Zaktualizuj nagłówek modalu
    console.log('🔄 [navigateArticle] Aktualizuję nagłówek...');
    const modalTitle = document.querySelector('#legalLibraryModal h2');
    if (modalTitle) {
        modalTitle.innerHTML = `${codeInfo.icon} ${codeInfo.name} <span style="opacity: 0.7; font-size: 0.85em;">Art. ${parsed.article}</span>`;
        console.log('✅ [navigateArticle] Nagłówek zaktualizowany');
    } else {
        console.error('❌ [navigateArticle] Nie znaleziono modalTitle!');
    }
    
    // Załaduj nową zawartość
    console.log('🔄 [navigateArticle] Ładuję zawartość...');
    try {
        await loadArticleContent(parsed, codeInfo);
        console.log('✅ [navigateArticle] Zawartość załadowana');
    } catch (error) {
        console.error('❌ [navigateArticle] Błąd ładowania:', error);
    }
    
    // Fade in po załadowaniu
    console.log('🔄 [navigateArticle] Fade in...');
    if (contentDiv) {
        contentDiv.style.opacity = '1';
        console.log('✅ [navigateArticle] Fade in complete');
    }
    
    console.log('✅ [navigateArticle] KONIEC');
};

// Kopiowanie tekstu artykułu
window.copyArticleText = function(code, articleNumber) {
    console.log('📋 Kopiowanie artykułu:', code, articleNumber);
    
    // Pobierz tekst z kontenera - najpierw szukamy w głównym artykule
    let contentDiv = document.getElementById('articleTextContent');
    
    // Jeśli nie ma w głównym, spróbuj z całego articleContent
    if (!contentDiv) {
        contentDiv = document.getElementById('articleContent');
    }
    
    if (!contentDiv) {
        alert('❌ Nie można znaleźć treści artykułu');
        return;
    }
    
    // Wyciągnij czysty tekst (bez HTML, bez tagów <br>)
    let text = contentDiv.innerText || contentDiv.textContent;
    
    // Dodatkowe czyszczenie
    text = text
        .replace(/\n\s*\n/g, '\n\n') // Usuń wielokrotne puste linie
        .replace(/^\s+|\s+$/g, '') // Trim na początek i koniec
        .trim();
    
    // Sformatuj tekst z nagłówkiem
    const formattedText = `${code} Art. ${articleNumber}\n\n${text}\n\n[Źródło: System Prawny - ${new Date().toLocaleDateString('pl-PL')}]`;
    
    // Kopiuj do schowka
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(formattedText)
            .then(() => {
                showCopyNotification();
            })
            .catch(err => {
                console.error('Błąd kopiowania:', err);
                fallbackCopy(formattedText);
            });
    } else {
        fallbackCopy(formattedText);
    }
};

// Fallback kopiowanie dla starszych przeglądarek
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyNotification();
    } catch (err) {
        console.error('Fallback: Błąd kopiowania', err);
        alert('❌ Nie można skopiować tekstu. Spróbuj zaznacz ręcznie i skopiuj.');
    }
    
    document.body.removeChild(textArea);
}

// Wyszukiwanie artykułu w kontekście
window.searchArticleInContext = function(code) {
    const input = document.getElementById('contextSearchInput');
    if (!input) {
        console.error('Nie znaleziono pola wyszukiwania');
        return;
    }
    
    const articleNum = input.value.trim();
    if (!articleNum) {
        alert('⚠️ Podaj numer artykułu');
        input.focus();
        return;
    }
    
    // Walidacja - czy to liczba
    const num = parseInt(articleNum.replace(/[^0-9]/g, ''));
    if (isNaN(num) || num < 1) {
        alert('❌ Nieprawidłowy numer artykułu');
        input.focus();
        return;
    }
    
    console.log('🔍 Wyszukiwanie artykułu:', code, num);
    
    // Zamknij obecny modal kontekstu
    const modal = document.getElementById('contextModal');
    if (modal) modal.remove();
    
    // Otwórz kontekst wokół tego artykułu
    window.showArticleContext(code, num.toString());
};

// Nawigacja do wcześniejszych/późniejszych artykułów w kontekście
window.navigateContextRange = function(code, startArticle) {
    console.log('🔄 Nawigacja kontekstu:', code, startArticle);
    
    if (startArticle < 1) {
        alert('⚠️ To są już pierwsze artykuły w kodeksie');
        return;
    }
    
    // Zamknij obecny modal kontekstu
    const modal = document.getElementById('contextModal');
    if (modal) modal.remove();
    
    // Otwórz nowy kontekst
    window.showArticleContext(code, startArticle.toString());
};

// Kopiowanie wszystkich artykułów z zakresu kontekstu
window.copyContextArticles = function(code, from, to) {
    console.log('📋 Kopiowanie zakresu:', code, from, '-', to);
    
    const contentDiv = document.getElementById('contextContent');
    if (!contentDiv) {
        alert('❌ Nie można znaleźć treści artykułów');
        return;
    }
    
    // Wyciągnij czysty tekst wszystkich artykułów
    let text = contentDiv.innerText || contentDiv.textContent;
    
    // Dodatkowe czyszczenie
    text = text
        .replace(/🎯 AKTUALNY/g, '') // Usuń marker aktualnego
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Usuń wielokrotne puste linie
        .trim();
    
    // Sformatuj tekst z nagłówkiem
    const codeInfo = LEGAL_CODES[code];
    const formattedText = `${codeInfo.name}\nArtykuły ${from} - ${to}\n\n${'='.repeat(60)}\n\n${text}\n\n${'='.repeat(60)}\n[Źródło: System Prawny - ${new Date().toLocaleDateString('pl-PL')}]`;
    
    // Kopiuj do schowka
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(formattedText)
            .then(() => {
                showCopyNotification(`Skopiowano ${to - from + 1} artykułów!`);
            })
            .catch(err => {
                console.error('Błąd kopiowania:', err);
                fallbackCopy(formattedText);
            });
    } else {
        fallbackCopy(formattedText);
    }
};

// Ulepszone powiadomienie o skopiowaniu - z opcjonalną wiadomością
function showCopyNotification(message = 'Artykuł skopiowany do schowka!') {
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #1a2332, #2c3e50);
            border: 3px solid #FFD700;
            color: white;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 1.2rem;
            font-weight: 600;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            z-index: 999999;
            animation: copyPulse 0.5s ease-out;
        ">
            ✅ ${message}
        </div>
        <style>
            @keyframes copyPulse {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.1); }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        </style>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transition = 'opacity 0.3s';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Alias dla showFullCode -> showArticleContext
window.showFullCode = function(code, articleNum) {
    window.showArticleContext(code, articleNum);
};

console.log('✅ [v16] Biblioteka prawna załadowana');
console.log('✅ [v16] window.LEGAL_CODES:', typeof window.LEGAL_CODES);
console.log('✅ [v16] window.navigateArticle:', typeof window.navigateArticle);
console.log('✅ [v16] window.showLegalLibrary:', typeof window.showLegalLibrary);
console.log('✅ [v16] window.showFullCode:', typeof window.showFullCode);
