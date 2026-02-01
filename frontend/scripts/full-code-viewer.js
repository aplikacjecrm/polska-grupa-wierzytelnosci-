// 📚 MODUŁ PEŁNEGO WIDOKU KODEKSU

console.log('📚 Full Code Viewer loaded!');

// Pokaż cały kodeks
window.showFullCode = async function(code, currentArticle) {
    console.log('📚 Pokazuję cały kodeks:', code, 'aktualny artykuł:', currentArticle);
    
    const codeInfo = window.LEGAL_CODES[code];
    if (!codeInfo) {
        alert('❌ Nieznany kodeks');
        return;
    }
    
    // Tworz modal
    const modal = document.createElement('div');
    modal.innerHTML = `
        <style>
            @keyframes flashHighlight {
                0% {
                    box-shadow: 0 0 0px transparent;
                    transform: scale(1);
                }
                50% {
                    box-shadow: 0 0 40px ${window.LEGAL_CODES[code].color}ff, 0 0 80px ${window.LEGAL_CODES[code].color}88;
                    transform: scale(1.04);
                }
                100% {
                    box-shadow: 0 0 30px ${window.LEGAL_CODES[code].color}88, 0 0 60px ${window.LEGAL_CODES[code].color}44;
                    transform: scale(1.02);
                }
            }
            
            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.7;
                }
            }
        </style>
        <div id="fullCodeModalOverlay" onclick="if(event.target.id === 'fullCodeModalOverlay') this.remove()" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(10px);
            z-index: 10000000;
            display: flex;
            justify-content: center;
            align-items: center;
        ">
            <div id="fullCodeModal" style="
                background: linear-gradient(135deg, #1a2332, #2d3748);
                border-radius: 15px;
                width: 95%;
                max-width: 1400px;
                height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                position: relative;
                z-index: 10000001;
            ">
            <!-- Header -->
            <div style="
                background: linear-gradient(135deg, ${codeInfo.color}, ${codeInfo.color}dd);
                color: white;
                padding: 20px 30px;
                border-radius: 15px 15px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 10px;">
                        ${codeInfo.icon} ${codeInfo.name}
                    </h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.9rem;">
                        Pełny tekst ustawy z możliwością wyszukiwania
                    </p>
                </div>
                <button onclick="document.getElementById('fullCodeModalOverlay').remove()" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 24px;
                    transition: all 0.2s;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                   onmouseout="this.style.background='rgba(255,255,255,0.2)'">×</button>
            </div>
            
            <!-- Search Bar -->
            <div style="
                padding: 20px 30px;
                background: rgba(255,255,255,0.05);
                border-bottom: 1px solid rgba(255,255,255,0.1);
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
            ">
                <div style="flex: 1; min-width: 250px;">
                    <label style="color: white; font-size: 0.85rem; margin-bottom: 5px; display: block;">
                        🔢 Wyszukaj artykuł po numerze:
                    </label>
                    <input 
                        id="articleSearchInput"
                        type="text" 
                        placeholder="np. 450"
                        style="
                            width: 100%;
                            padding: 10px 15px;
                            border: 2px solid rgba(255,255,255,0.2);
                            border-radius: 8px;
                            background: rgba(255,255,255,0.1);
                            color: white;
                            font-size: 0.95rem;
                        "
                    />
                </div>
                <div style="flex: 2; min-width: 300px;">
                    <label style="color: white; font-size: 0.85rem; margin-bottom: 5px; display: block;">
                        🔍 Wyszukaj tekst w treści:
                    </label>
                    <input 
                        id="textSearchInput"
                        type="text" 
                        placeholder="np. dłużnik, szkoda, odpowiedzialność..."
                        style="
                            width: 100%;
                            padding: 10px 15px;
                            border: 2px solid rgba(255,255,255,0.2);
                            border-radius: 8px;
                            background: rgba(255,255,255,0.1);
                            color: white;
                            font-size: 0.95rem;
                        "
                    />
                </div>
                <div style="display: flex; align-items: end; gap: 10px;">
                    <button onclick="window.searchInFullCode()" style="
                        padding: 10px 20px;
                        background: linear-gradient(135deg, #3B82F6, #1E40AF);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 0.95rem;
                        transition: all 0.2s;
                        white-space: nowrap;
                    " onmouseover="this.style.transform='translateY(-2px)'" 
                       onmouseout="this.style.transform='translateY(0)'">
                        Szukaj
                    </button>
                    <button onclick="window.clearFullCodeSearch()" style="
                        padding: 10px 20px;
                        background: rgba(255,255,255,0.1);
                        color: white;
                        border: 2px solid rgba(255,255,255,0.2);
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 0.95rem;
                        transition: all 0.2s;
                        white-space: nowrap;
                    " onmouseover="this.style.background='rgba(255,255,255,0.15)'" 
                       onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                        Wyczyść
                    </button>
                </div>
            </div>
            
            <!-- Content -->
            <div id="fullCodeContent" style="
                flex: 1;
                overflow-y: auto;
                padding: 30px;
                color: white;
            ">
                <div style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.7);">
                    <div style="font-size: 4rem; margin-bottom: 20px;">⚖️</div>
                    <p style="font-size: 1.2rem; margin: 0;">Ładowanie kodeksu...</p>
                </div>
            </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Załaduj kodeks
    await loadFullCode(code, currentArticle);
    
    // Event listeners dla wyszukiwania
    document.getElementById('articleSearchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') window.searchInFullCode();
    });
    
    document.getElementById('textSearchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') window.searchInFullCode();
    });
};

// Załaduj pełny kodeks
async function loadFullCode(code, currentArticle) {
    const contentDiv = document.getElementById('fullCodeContent');
    
    // Zapisz kod dla wyszukiwarki
    contentDiv.dataset.currentCode = code;
    
    try {
        console.log('📚 [loadFullCode] Ładuję kodeks:', code);
        
        // Pobierz range artykułów (np. 1-500 dla KC)
        const maxArticles = getMaxArticlesForCode(code);
        console.log('📚 [loadFullCode] Max artykułów:', maxArticles);
        
        const articles = [];
        const batchSize = 50; // Ładuj po 50 artykułów naraz
        
        // Załaduj pierwsze 50 artykułów
        contentDiv.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.7);">
                <div style="font-size: 4rem; margin-bottom: 20px;">⚖️</div>
                <p style="font-size: 1.2rem; margin: 0;">Ładowanie artykułów...</p>
                <p style="font-size: 0.9rem; margin-top: 10px; opacity: 0.7;">To może chwilę potrwać</p>
            </div>
        `;
        
        // Ładuj tylko pierwsze 30 artykułów (dla szybkości)
        const loadLimit = 30;
        
        // Ładuj artykuły wsadowo
        for (let i = 1; i <= Math.min(maxArticles, loadLimit); i++) {
            try {
                const articleData = await fetchArticle(code, i);
                articles.push({
                    number: i,
                    isCurrent: i === parseInt(currentArticle),
                    content: articleData.content || `Art. ${i} - Treść niedostępna w bazie`
                });
            } catch (error) {
                console.warn(`⚠️ Artykuł ${i} nie załadowany:`, error.message);
                articles.push({
                    number: i,
                    isCurrent: i === parseInt(currentArticle),
                    content: `Art. ${i} - Treść niedostępna`
                });
            }
            
            // Aktualizuj progress co 5 artykułów
            if (i % 5 === 0 || i === loadLimit) {
                contentDiv.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.7);">
                        <div style="font-size: 4rem; margin-bottom: 20px;">⚖️</div>
                        <p style="font-size: 1.2rem; margin: 0;">Ładowanie artykułów...</p>
                        <p style="font-size: 0.9rem; margin-top: 10px; opacity: 0.7;">${i} / ${loadLimit} załadowanych</p>
                        <div style="width: 300px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; margin: 20px auto; overflow: hidden;">
                            <div style="width: ${(i / loadLimit) * 100}%; height: 100%; background: linear-gradient(135deg, #3B82F6, #1E40AF); transition: width 0.3s;"></div>
                        </div>
                    </div>
                `;
            }
        }
        
        console.log('📚 [loadFullCode] Załadowano artykułów:', articles.length);
        displayFullCode(articles, code, loadLimit, maxArticles);
    } catch (error) {
        console.error('❌ Błąd ładowania kodeksu:', error);
        contentDiv.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.7);">
                <div style="font-size: 4rem; margin-bottom: 20px;">❌</div>
                <p style="font-size: 1.2rem; margin: 0;">Błąd ładowania kodeksu</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">${error.message}</p>
            </div>
        `;
    }
}

// Pobierz pojedynczy artykuł
async function fetchArticle(code, articleNumber) {
    const API_URL = 'http://localhost:3500';
    const response = await fetch(`${API_URL}/api/ai/legal-acts/article`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            code: code,
            article: String(articleNumber)
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return {
        content: data.answer || null
    };
}

// Maksymalna liczba artykułów dla kodeksu
function getMaxArticlesForCode(code) {
    const maxArticles = {
        'KC': 1088,
        'KPC': 1217,
        'KK': 363,
        'KPK': 634,
        'KP': 323,
        'KKW': 248,
        'KKS': 185,
        'KW': 517,
        'KPW': 140,
        'KRO': 145,
        'KSH': 588,
        'KPA': 269,
        'PPSA': 268,
        'KW_WYBORCZY': 527,
        'KM': 641,
        'PRD': 149
    };
    return maxArticles[code] || 100;
}

// Wyświetl pełny kodeks
function displayFullCode(articles, code, loadedCount, totalCount) {
    const contentDiv = document.getElementById('fullCodeContent');
    const codeInfo = window.LEGAL_CODES[code];
    
    let html = '';
    
    // Info o załadowanych artykułach
    if (loadedCount < totalCount) {
        html += `
            <div style="
                background: linear-gradient(135deg, rgba(52,152,219,0.2), rgba(41,128,185,0.2));
                border: 2px solid rgba(52,152,219,0.3);
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 20px;
                text-align: center;
                color: white;
            ">
                <div style="font-size: 1rem; margin-bottom: 5px;">
                    ℹ️ Załadowano pierwsze <strong>${loadedCount}</strong> artykułów z <strong>${totalCount}</strong>
                </div>
                <div style="font-size: 0.85rem; opacity: 0.8;">
                    Użyj wyszukiwarki aby znaleźć konkretny artykuł
                </div>
            </div>
        `;
    }
    
    html += articles.map(art => `
        <div class="full-code-article" data-article="${art.number}" style="
            background: ${art.isCurrent ? `linear-gradient(135deg, ${codeInfo.color}22, ${codeInfo.color}11)` : 'rgba(255,255,255,0.03)'};
            border: 2px solid ${art.isCurrent ? codeInfo.color : 'rgba(255,255,255,0.1)'};
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            transition: all 0.3s;
        ">
            <div style="
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            ">
                <span style="
                    background: ${codeInfo.color};
                    color: white;
                    padding: 6px 14px;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 0.95rem;
                ">
                    Art. ${art.number}
                </span>
                ${art.isCurrent ? `
                    <span style="
                        background: linear-gradient(135deg, #3B82F6, #3B82F6);
                        color: white;
                        padding: 4px 12px;
                        border-radius: 6px;
                        font-size: 0.8rem;
                        font-weight: 600;
                        animation: pulse 2s infinite;
                    ">
                        ⭐ AKTUALNY
                    </span>
                ` : ''}
            </div>
            <div class="article-content" style="
                color: rgba(255,255,255,0.9);
                line-height: 1.8;
                font-size: 0.95rem;
            ">
                ${art.content}
            </div>
        </div>
    `).join('');
    
    contentDiv.innerHTML = html;
    
    // Scroll do aktualnego artykułu
    setTimeout(() => {
        const currentElem = contentDiv.querySelector('[data-article][style*="AKTUALNY"]')?.closest('.full-code-article');
        if (currentElem) {
            currentElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

// Wyszukiwanie w kodeksie
window.searchInFullCode = async function() {
    console.log('🔍 [searchInFullCode] START');
    
    const articleNum = document.getElementById('articleSearchInput')?.value.trim();
    const searchText = document.getElementById('textSearchInput')?.value.trim().toLowerCase();
    
    console.log('🔍 [searchInFullCode] Numer artykułu:', articleNum);
    console.log('🔍 [searchInFullCode] Tekst:', searchText);
    
    if (!articleNum && !searchText) {
        alert('⚠️ Wpisz numer artykułu lub tekst do wyszukania');
        return;
    }
    
    const contentDiv = document.getElementById('fullCodeContent');
    const currentCode = contentDiv.dataset.currentCode;
    
    // Jeśli szukamy konkretnego artykułu po numerze
    if (articleNum && !searchText) {
        console.log('🔍 [searchInFullCode] Szukam artykułu z kontekstem:', articleNum);
        
        const targetNum = parseInt(articleNum);
        const contextBefore = 5;  // 5 artykułów wcześniej
        const contextAfter = 5;   // 5 artykułów później
        
        const startNum = Math.max(1, targetNum - contextBefore);
        const endNum = targetNum + contextAfter;
        
        console.log(`📚 Ładuję artykuły ${startNum}-${endNum} (11 artykułów)`);
        
        // Ukryj wszystkie artykuły
        const allArticles = document.querySelectorAll('.full-code-article');
        allArticles.forEach(art => art.style.display = 'none');
        
        // Pokaż loading
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'contextLoading';
        loadingDiv.innerHTML = `
            <div style="text-align: center; padding: 40px; color: white;">
                <div style="font-size: 2rem; margin-bottom: 10px;">⚖️</div>
                <p>Ładowanie artykułów ${startNum}-${endNum}...</p>
                <div style="width: 200px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; margin: 20px auto; overflow: hidden;">
                    <div id="contextProgress" style="width: 0%; height: 100%; background: linear-gradient(135deg, #3B82F6, #1E40AF); transition: width 0.3s;"></div>
                </div>
            </div>
        `;
        contentDiv.insertAdjacentElement('afterbegin', loadingDiv);
        
        try {
            const codeInfo = window.LEGAL_CODES[currentCode];
            const articlesToLoad = [];
            let loadedCount = 0;
            const totalArticles = endNum - startNum + 1;
            
            // Załaduj artykuły od startNum do endNum
            for (let num = startNum; num <= endNum; num++) {
                try {
                    // Sprawdź czy już jest załadowany
                    let existingArticle = document.querySelector(`.full-code-article[data-article="${num}"]`);
                    
                    if (existingArticle) {
                        // Użyj istniejącego
                        console.log(`✅ Art. ${num} już załadowany`);
                        articlesToLoad.push({ num, element: existingArticle, existing: true });
                    } else {
                        // Załaduj z API
                        const articleData = await fetchArticle(currentCode, num);
                        
                        if (articleData.content) {
                            const isTarget = (num === targetNum);
                            
                            const articleHTML = `
                                <div class="full-code-article" data-article="${num}" style="
                                    background: ${isTarget ? `linear-gradient(135deg, ${codeInfo.color}66, ${codeInfo.color}44)` : 'rgba(255,255,255,0.03)'};
                                    border: ${isTarget ? '4px' : '2px'} solid ${isTarget ? codeInfo.color : 'rgba(255,255,255,0.1)'};
                                    border-radius: 10px;
                                    padding: 20px;
                                    margin-bottom: 15px;
                                    transition: all 0.3s;
                                    display: block;
                                    box-shadow: ${isTarget ? `0 0 30px ${codeInfo.color}88, 0 0 60px ${codeInfo.color}44` : 'none'};
                                    animation: ${isTarget ? 'flashHighlight 1s ease-out' : 'none'};
                                    transform: ${isTarget ? 'scale(1.02)' : 'scale(1)'};
                                ">
                                    <div style="
                                        display: flex;
                                        align-items: center;
                                        justify-content: space-between;
                                        margin-bottom: 15px;
                                    ">
                                        <div style="
                                            font-size: ${isTarget ? '1.5rem' : '1.2rem'};
                                            font-weight: ${isTarget ? '700' : '600'};
                                            color: ${isTarget ? codeInfo.color : 'rgba(255,255,255,0.9)'};
                                            text-shadow: ${isTarget ? `0 0 20px ${codeInfo.color}88` : 'none'};
                                        ">
                                            Art. ${num}
                                        </div>
                                        ${isTarget ? `
                                            <span style="
                                                background: linear-gradient(135deg, #3B82F6, #3B82F6);
                                                color: white;
                                                padding: 6px 14px;
                                                border-radius: 8px;
                                                font-size: 0.85rem;
                                                font-weight: 600;
                                                animation: pulse 2s infinite;
                                            ">
                                                🎯 WYSZUKANY
                                            </span>
                                        ` : ''}
                                    </div>
                                    <div class="article-content" style="
                                        color: rgba(255,255,255,0.9);
                                        line-height: 1.8;
                                        font-size: 0.95rem;
                                    ">
                                        ${articleData.content}
                                    </div>
                                </div>
                            `;
                            
                            articlesToLoad.push({ num, html: articleHTML, existing: false });
                            console.log(`✅ Art. ${num} załadowany z API`);
                        }
                    }
                    
                    loadedCount++;
                    // Update progress
                    const progress = (loadedCount / totalArticles) * 100;
                    const progressBar = document.getElementById('contextProgress');
                    if (progressBar) {
                        progressBar.style.width = `${progress}%`;
                    }
                    
                } catch (error) {
                    console.warn(`⚠️ Nie można załadować Art. ${num}:`, error.message);
                }
            }
            
            // Usuń loading
            loadingDiv.remove();
            
            // Dodaj artykuły w kolejności
            articlesToLoad.sort((a, b) => a.num - b.num);
            
            articlesToLoad.forEach(item => {
                if (item.existing) {
                    // Pokaż istniejący
                    item.element.style.display = 'block';
                    
                    // Jeśli to docelowy artykuł, dodaj mocne podświetlenie
                    if (item.num === targetNum) {
                        const codeColor = codeInfo.color;
                        
                        // Mocne podświetlenie
                        item.element.style.background = `linear-gradient(135deg, ${codeColor}66, ${codeColor}44)`;
                        item.element.style.border = `4px solid ${codeColor}`;
                        item.element.style.boxShadow = `0 0 30px ${codeColor}88, 0 0 60px ${codeColor}44`;
                        item.element.style.animation = 'flashHighlight 1s ease-out';
                        item.element.style.transform = 'scale(1.02)';
                        
                        const header = item.element.querySelector('div:first-child');
                        const titleDiv = header?.querySelector('div:first-child');
                        
                        // Zwiększ rozmiar nagłówka
                        if (titleDiv) {
                            titleDiv.style.fontSize = '1.5rem';
                            titleDiv.style.fontWeight = '700';
                            titleDiv.style.color = codeColor;
                            titleDiv.style.textShadow = `0 0 20px ${codeColor}88`;
                        }
                        
                        // Dodaj badge jeśli nie ma
                        if (header && !header.querySelector('span')) {
                            header.innerHTML += `
                                <span style="
                                    background: linear-gradient(135deg, #3B82F6, #3B82F6);
                                    color: white;
                                    padding: 6px 14px;
                                    border-radius: 8px;
                                    font-size: 0.85rem;
                                    font-weight: 600;
                                    animation: pulse 2s infinite;
                                ">
                                    🎯 WYSZUKANY
                                </span>
                            `;
                        }
                    } else {
                        // Resetuj style dla nie-target
                        item.element.style.background = 'rgba(255,255,255,0.03)';
                        item.element.style.border = '2px solid rgba(255,255,255,0.1)';
                        item.element.style.boxShadow = 'none';
                        item.element.style.animation = 'none';
                        item.element.style.transform = 'scale(1)';
                        
                        const header = item.element.querySelector('div:first-child');
                        const titleDiv = header?.querySelector('div:first-child');
                        const badge = header?.querySelector('span');
                        
                        // Resetuj nagłówek
                        if (titleDiv) {
                            titleDiv.style.fontSize = '1.2rem';
                            titleDiv.style.fontWeight = '600';
                            titleDiv.style.color = 'rgba(255,255,255,0.9)';
                            titleDiv.style.textShadow = 'none';
                        }
                        
                        // Usuń badge
                        if (badge) badge.remove();
                    }
                } else {
                    // Dodaj nowy
                    contentDiv.insertAdjacentHTML('beforeend', item.html);
                }
            });
            
            console.log(`✅ Załadowano ${articlesToLoad.length} artykułów z kontekstem`);
            
            // Dodaj PROSTE przyciski nawigacji
            addSimpleNavigationButtons(currentCode, targetNum, startNum, endNum);
            
            // Scroll do wyszukanego artykułu
            setTimeout(() => {
                const targetArticle = document.querySelector(`.full-code-article[data-article="${targetNum}"]`);
                if (targetArticle) {
                    targetArticle.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            
        } catch (error) {
            console.error('❌ Błąd ładowania kontekstu:', error);
            document.getElementById('contextLoading')?.remove();
            alert(`❌ Nie można załadować artykułów: ${error.message}`);
        }
        
        return;
    }
    
    // Jeśli szukamy tekstu - przeszukaj załadowane artykuły
    const articles = document.querySelectorAll('.full-code-article');
    console.log('🔍 [searchInFullCode] Znaleziono artykułów:', articles.length);
    
    if (articles.length === 0) {
        alert('❌ Brak załadowanych artykułów!');
        return;
    }
    
    let found = 0;
    
    articles.forEach(article => {
        const articleNumber = article.dataset.article;
        const contentElem = article.querySelector('.article-content');
        
        if (!contentElem) {
            console.warn('⚠️ Brak article-content w artykule:', articleNumber);
            return;
        }
        
        const content = contentElem.textContent.toLowerCase();
        
        let matches = true;
        
        // Filtr po numerze artykułu
        if (articleNum && articleNumber !== articleNum) {
            matches = false;
        }
        
        // Filtr po tekście
        if (searchText && !content.includes(searchText)) {
            matches = false;
        }
        
        if (matches) {
            article.style.display = 'block';
            found++;
            
            // Podświetl znaleziony tekst
            if (searchText) {
                highlightText(contentElem, searchText);
            }
            
            console.log('✅ Znaleziono:', articleNumber);
        } else {
            article.style.display = 'none';
        }
    });
    
    console.log('🔍 [searchInFullCode] Znalezionych wyników:', found);
    
    // Scroll do pierwszego znalezionego
    if (found > 0) {
        const firstFound = Array.from(articles).find(a => a.style.display !== 'none');
        if (firstFound) {
            firstFound.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } else {
        alert(`❌ Nie znaleziono wyników dla: ${articleNum || searchText}`);
    }
};

// Podświetlenie tekstu
function highlightText(element, searchText) {
    // Zapisz oryginalną treść
    const originalText = element.getAttribute('data-original') || element.textContent;
    if (!element.getAttribute('data-original')) {
        element.setAttribute('data-original', originalText);
    }
    
    // Escape znaków specjalnych regex
    const escapedText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Podświetl znaleziony tekst
    const regex = new RegExp(`(${escapedText})`, 'gi');
    const highlightedText = originalText.replace(regex, '<mark style="background: #3B82F6; color: black; padding: 2px 4px; border-radius: 3px; font-weight: 600;">$1</mark>');
    
    element.innerHTML = highlightedText;
    
    console.log('🎨 Podświetlono tekst:', searchText);
}

// NOWE PROSTE przyciski nawigacji
function addSimpleNavigationButtons(code, currentArticle, startNum, endNum) {
    const contentDiv = document.getElementById('fullCodeContent');
    const codeInfo = window.LEGAL_CODES[code];
    
    // Usuń stare przyciski jeśli są
    const oldNav = document.getElementById('simpleNavigation');
    if (oldNav) oldNav.remove();
    
    const prevNum = currentArticle - 1;
    const nextNum = currentArticle + 1;
    
    const navigationHTML = `
        <div id="simpleNavigation" style="
            position: sticky;
            top: 0;
            z-index: 10000002;
            background: linear-gradient(135deg, rgba(26, 35, 50, 0.98), rgba(31, 41, 55, 0.98));
            backdrop-filter: blur(10px);
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 12px;
            border: 2px solid ${codeInfo.color}44;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        ">
            <div style="display: flex; gap: 10px; align-items: center;">
                <button 
                    ${currentArticle <= 1 ? 'disabled' : ''}
                    onclick="document.getElementById('articleSearchInput').value='${prevNum}'; window.searchInFullCode();"
                    style="
                        flex: 1;
                        padding: 12px 20px;
                        background: ${currentArticle <= 1 ? 'rgba(100,100,100,0.3)' : `linear-gradient(135deg, ${codeInfo.color}, ${codeInfo.color}dd)`};
                        border: none;
                        border-radius: 10px;
                        color: white;
                        font-weight: 600;
                        font-size: 0.95rem;
                        cursor: ${currentArticle <= 1 ? 'not-allowed' : 'pointer'};
                        transition: all 0.2s;
                    "
                    ${currentArticle > 1 ? `onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'"` : ''}>
                    ← Poprzedni (${prevNum})
                </button>
                
                <div style="
                    flex: 1;
                    text-align: center;
                    padding: 12px;
                    background: linear-gradient(135deg, ${codeInfo.color}22, ${codeInfo.color}11);
                    border: 2px solid ${codeInfo.color}44;
                    border-radius: 10px;
                    color: white;
                    font-weight: 600;
                ">
                    <div style="font-size: 0.85rem; opacity: 0.8;">Zakres: ${startNum}-${endNum}</div>
                    <div style="font-size: 1.1rem; color: ${codeInfo.color};">🎯 Art. ${currentArticle}</div>
                </div>
                
                <button 
                    onclick="document.getElementById('articleSearchInput').value='${nextNum}'; window.searchInFullCode();"
                    style="
                        flex: 1;
                        padding: 12px 20px;
                        background: linear-gradient(135deg, ${codeInfo.color}, ${codeInfo.color}dd);
                        border: none;
                        border-radius: 10px;
                        color: white;
                        font-weight: 600;
                        font-size: 0.95rem;
                        cursor: pointer;
                        transition: all 0.2s;
                    "
                    onmouseover="this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.transform='translateY(0)'">
                    Następny (${nextNum}) →
                </button>
            </div>
        </div>
    `;
    
    contentDiv.insertAdjacentHTML('afterbegin', navigationHTML);
    console.log('✅ Dodano PROSTE przyciski nawigacji');
}

// Wyczyść wyszukiwanie
window.clearFullCodeSearch = function() {
    console.log('🧹 [clearFullCodeSearch] Czyszczenie...');
    
    const articleInput = document.getElementById('articleSearchInput');
    const textInput = document.getElementById('textSearchInput');
    
    if (articleInput) articleInput.value = '';
    if (textInput) textInput.value = '';
    
    const articles = document.querySelectorAll('.full-code-article');
    console.log('🧹 [clearFullCodeSearch] Artykułów do wyczyszczenia:', articles.length);
    
    articles.forEach(article => {
        article.style.display = 'block';
        
        // Usuń podświetlenia
        const content = article.querySelector('.article-content');
        if (content) {
            const original = content.getAttribute('data-original');
            if (original) {
                content.textContent = original;
                content.removeAttribute('data-original');
            }
        }
    });
    
    console.log('✅ [clearFullCodeSearch] Wyczyszczono!');
};

console.log('✅✅✅ [v13] Full Code Viewer ready - NOWE PROSTE PRZYCISKI!');
console.log('✅ [v13] window.searchInFullCode:', typeof window.searchInFullCode);
console.log('✅ [v13] window.clearFullCodeSearch:', typeof window.clearFullCodeSearch);
console.log('✅ [v13] window.showFullCode:', typeof window.showFullCode);
console.log('✅ [v13] Z-INDEX: 10000000 - WYŻSZY NIŻ GŁÓWNY MODAL!');
console.log('✅ [v13] 🎯 NOWE przyciski: inline onclick = PROSTO I DZIAŁA!');
console.log('✅ [v13] Przyciski: "← Poprzedni" / "Następny →" z prostym onclick!');
