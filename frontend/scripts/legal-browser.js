// 📚 PRZEGLĄDARKA KODEKSÓW - Globalny dostęp do biblioteki prawnej

console.log('📚 Ładowanie przeglądarki kodeksów...');

// Globalny przycisk do otwierania kodeksów
function createLegalBrowserButton() {
    const button = document.createElement('button');
    button.id = 'legalBrowserBtn';
    button.innerHTML = '📚 Kodeksy';
    button.title = 'Przeglądaj wszystkie kodeksy i ustawy';
    button.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 30px;
        z-index: 999998;
        padding: 15px 20px;
        background: linear-gradient(135deg, #1a2332, #2c3e50);
        color: white;
        border: 3px solid #FFD700;
        border-radius: 50px;
        box-shadow: 0 6px 30px rgba(212,175,55,0.6);
        cursor: pointer;
        font-weight: 700;
        font-size: 0.95rem;
        display: block;
        transition: all 0.3s;
        text-align: center;
        white-space: nowrap;
    `;
    
    button.onmouseover = () => {
        button.style.transform = 'translateY(-5px) scale(1.05)';
        button.style.boxShadow = '0 10px 40px rgba(255,215,0,0.8)';
    };
    
    button.onmouseout = () => {
        button.style.transform = 'translateY(0) scale(1)';
        button.style.boxShadow = '0 6px 30px rgba(212,175,55,0.6)';
    };
    
    button.onclick = () => {
        window.openLegalBrowser();
    };
    
    document.body.appendChild(button);
}

// Otwórz przeglądarkę kodeksów
window.openLegalBrowser = function() {
    console.log('📚 Otwieranie przeglądarki kodeksów...');
    
    const modal = document.createElement('div');
    modal.id = 'legalBrowserModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: rgba(0,0,0,0.9);
        backdrop-filter: blur(10px);
        z-index: 9999999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        animation: fadeIn 0.3s forwards;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <style>
            @keyframes fadeIn { to { opacity: 1; } }
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .code-card-browser {
                transition: all 0.3s;
                cursor: pointer;
            }
            .code-card-browser:hover {
                transform: translateY(-8px) scale(1.05);
                box-shadow: 0 15px 40px rgba(0,0,0,0.5);
            }
            .search-input {
                transition: all 0.3s;
            }
            .search-input:focus {
                transform: scale(1.02);
                box-shadow: 0 0 20px rgba(255,215,0,0.5);
            }
        </style>
        
        <div style="
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 20px;
            max-width: 1200px;
            width: 100%;
            max-height: 90vh;
            overflow: hidden;
            box-shadow: 0 25px 80px rgba(0,0,0,0.5);
            animation: slideUp 0.5s ease-out;
            display: flex;
            flex-direction: column;
        ">
            <!-- Header -->
            <div style="
                background: linear-gradient(135deg, #1a2332, #2c3e50);
                padding: 30px;
                border-bottom: 3px solid #FFD700;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0 0 10px 0; color: white; font-size: 2rem; display: flex; align-items: center; gap: 15px;">
                            📚 Przeglądarka Kodeksów
                        </h2>
                        <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 1rem;">
                            16 polskich kodeksów i ustaw szczególnych
                        </p>
                    </div>
                    <button onclick="document.getElementById('legalBrowserModal').remove()" 
                            style="
                                background: rgba(255,255,255,0.2);
                                border: 2px solid white;
                                color: white;
                                width: 50px;
                                height: 50px;
                                border-radius: 50%;
                                cursor: pointer;
                                font-size: 1.8rem;
                                font-weight: bold;
                                transition: all 0.3s;
                            "
                            onmouseover="this.style.background='#FFD700'; this.style.color='#1a2332'; this.style.transform='rotate(90deg)'"
                            onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.color='white'; this.style.transform='rotate(0deg)'">
                        ✕
                    </button>
                </div>
            </div>
            
            <!-- Wyszukiwarka -->
            <div style="padding: 25px; background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.1);">
                <input type="text" 
                       id="legalSearchInput" 
                       placeholder="🔍 Wyszukaj artykuł (np. 'art. 455 KC' lub 'art. 94')" 
                       class="search-input"
                       style="
                            width: 100%;
                            padding: 15px 20px;
                            border: 2px solid rgba(212,175,55,0.5);
                            border-radius: 12px;
                            background: rgba(255,255,255,0.05);
                            color: white;
                            font-size: 1.1rem;
                            outline: none;
                        "
                       onkeyup="if(event.key==='Enter') window.searchAndOpenArticle(this.value)"
                       onfocus="this.style.borderColor='#FFD700'"
                       onblur="this.style.borderColor='rgba(212,175,55,0.5)'">
                <div style="margin-top: 10px; color: rgba(255,255,255,0.6); font-size: 0.85rem; text-align: center;">
                    💡 Naciśnij Enter aby wyszukać artykuł
                </div>
            </div>
            
            <!-- Kategorie -->
            <div style="flex: 1; overflow-y: auto; padding: 30px;">
                ${renderCodeCategories()}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

// Renderuj kategorie kodeksów
function renderCodeCategories() {
    const categories = {
        'Prawo cywilne': ['KC', 'KPC'],
        'Prawo karne': ['KK', 'KPK', 'KKW', 'KKS'],
        'Prawo wykroczeń': ['KW', 'KPW'],
        'Prawo pracy': ['KP'],
        'Prawo rodzinne': ['KRO'],
        'Prawo gospodarcze': ['KSH'],
        'Prawo administracyjne': ['KPA', 'PPSA'],
        'Prawo specjalne': ['KW_WYBORCZY', 'KM', 'PRD']
    };
    
    let html = '';
    
    for (const [category, codes] of Object.entries(categories)) {
        html += `
            <div style="margin-bottom: 35px;">
                <h3 style="color: white; margin: 0 0 20px 0; font-size: 1.3rem; border-bottom: 2px solid #FFD700; padding-bottom: 10px;">
                    ${getCategoryIcon(category)} ${category}
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                    ${codes.map(code => {
                        const info = window.LEGAL_CODES ? window.LEGAL_CODES[code] : null;
                        if (!info) return '';
                        return `
                            <div class="code-card-browser" 
                                 onclick="window.openCodeDirectly('${code}')"
                                 style="
                                    background: linear-gradient(135deg, ${info.color}, ${adjustColorSimple(info.color, -30)});
                                    padding: 25px 20px;
                                    border-radius: 12px;
                                    text-align: center;
                                    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
                                ">
                                <div style="font-size: 3.5rem; margin-bottom: 12px;">${info.icon}</div>
                                <div style="color: white; font-weight: 700; font-size: 1.1rem; margin-bottom: 8px;">${code}</div>
                                <div style="color: rgba(255,255,255,0.9); font-size: 0.85rem; line-height: 1.3;">${info.name}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    return html;
}

// Ikony dla kategorii
function getCategoryIcon(category) {
    const icons = {
        'Prawo cywilne': '⚖️',
        'Prawo karne': '🔴',
        'Prawo wykroczeń': '⚠️',
        'Prawo pracy': '👔',
        'Prawo rodzinne': '👨‍👩‍👧‍👦',
        'Prawo gospodarcze': '💼',
        'Prawo administracyjne': '🏛️',
        'Prawo specjalne': '⭐'
    };
    return icons[category] || '📖';
}

// Uproszczona funkcja przyciemniania koloru
function adjustColorSimple(color, amount) {
    const num = parseInt(color.replace("#", ""), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// Otwórz kodeks bezpośrednio
window.openCodeDirectly = function(code) {
    console.log('📖 Otwieranie kodeksu:', code);
    // Zamknij przeglądarkę
    const modal = document.getElementById('legalBrowserModal');
    if (modal) modal.remove();
    
    // Otwórz bibliotekę z tym kodeksem (np. art. 1)
    window.showLegalLibrary(`art. 1 ${code}`);
};

// Wyszukaj i otwórz artykuł
window.searchAndOpenArticle = function(query) {
    const trimmed = query.trim();
    if (!trimmed) return;
    
    console.log('🔍 Wyszukiwanie artykułu:', trimmed);
    
    // Zamknij przeglądarkę
    const modal = document.getElementById('legalBrowserModal');
    if (modal) modal.remove();
    
    // Otwórz bibliotekę z tym artykułem
    window.showLegalLibrary(trimmed);
};

// Inicjalizacja przy załadowaniu
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createLegalBrowserButton);
} else {
    createLegalBrowserButton();
}

console.log('✅ Przeglądarka kodeksów załadowana');
