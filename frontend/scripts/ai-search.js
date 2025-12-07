// 🤖 AI SEARCH - Inteligentne wyszukiwanie prawne
// Version: 3.0.0 - Updated: 2025-12-02 22:33 - GEMINI 2.5 FLASH WORKING!
console.log('🤖 AI Search Module Loaded v3.0.0 - Gemini 2.5 Flash WORKING!');

window.showAISearchModal = function() {
    const modal = document.createElement('div');
    modal.id = 'aiSearchModal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.85); z-index: 10005; display: flex; justify-content: center; align-items: center; padding: 20px; overflow-y: auto;';
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #1a2332, #2d3748); border-radius: 20px; max-width: 900px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(102,126,234,0.4);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); border-bottom: 3px solid #FFD700; padding: 25px; border-radius: 20px 20px 0 0; color: white; position: sticky; top: 0; z-index: 100;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <div style="font-size: 2.5rem; margin-bottom: 10px;">🤖</div>
                        <h2 style="margin: 0 0 8px 0; font-size: 1.8rem;">AI Legal Search</h2>
                        <div style="opacity: 0.9; font-size: 1rem;">Inteligentne wyszukiwanie prawne z Gemini AI (100% darmowe)</div>
                    </div>
                    <button onclick="document.getElementById('aiSearchModal').remove()" onmouseover="this.style.background='#FFD700'; this.style.color='#1a2332'" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.color='white'" style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 1.5rem; font-weight: bold; transition: all 0.3s;">✕</button>
                </div>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
                <!-- Typ wyszukiwania -->
                <div style="margin-bottom: 25px;">
                    <label style="display: block; color: white; font-weight: 700; margin-bottom: 12px; font-size: 1.1rem;">Typ wyszukiwania:</label>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        <button onclick="window.selectAISearchType('legal')" class="ai-search-type-btn" data-type="legal" style="padding: 15px; background: linear-gradient(135deg, #1a2332, #2c3e50); color: white; border: 3px solid transparent; border-radius: 12px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                            ⚖️ Artykuły prawne
                        </button>
                        <button onclick="window.selectAISearchType('analyze')" class="ai-search-type-btn" data-type="analyze" style="padding: 15px; background: linear-gradient(135deg, #16a085, #1abc9c); color: white; border: 3px solid transparent; border-radius: 12px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                            📊 Analiza dokumentu
                        </button>
                        <button onclick="window.selectAISearchType('case')" class="ai-search-type-btn" data-type="case" style="padding: 15px; background: linear-gradient(135deg, #d4af37, #FFD700); color: #1a2332; border: 3px solid transparent; border-radius: 12px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                            🔍 Analiza sprawy
                        </button>
                    </div>
                </div>
                
                <!-- Pole tekstowe -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: white; font-weight: 700; margin-bottom: 12px; font-size: 1.1rem;">Opisz sytuację prawną lub zadaj pytanie:</label>
                    <textarea id="aiSearchQuery" placeholder="Wpisz swoje pytanie prawne lub wklej treść dokumentu do analizy..." style="width: 100%; min-height: 150px; padding: 15px; border: 2px solid #4a5568; border-radius: 12px; background: #2d3748; color: white; font-size: 1rem; resize: vertical; font-family: inherit; outline: none; transition: all 0.3s;"
                              onfocus="this.style.borderColor='#FFD700'"
                              onblur="this.style.borderColor='#4a5568'"></textarea>
                    <div id="aiAnalyzeHint" style="display: none; margin-top: 10px; padding: 10px; background: rgba(255, 215, 0, 0.1); border-left: 3px solid #FFD700; border-radius: 6px; color: #a0aec0; font-size: 0.85rem;">
                        💡 Wskazówka: Wklej tutaj treść dokumentu (umowa, pozew, itp.) i zadaj pytanie o jego analizę
                    </div>
                    <small style="color: #a0aec0; display: block; margin-top: 8px;">💡 Im bardziej szczegółowe pytanie, tym lepsza odpowiedź AI</small>
                </div>
                
                <!-- Opcje dodatkowe -->
                <div style="background: #2d3748; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; color: white; font-size: 1.1rem;">⚙️ Opcje zaawansowane:</h3>
                    <label style="display: flex; align-items: center; gap: 10px; color: white; margin-bottom: 12px; cursor: pointer;">
                        <input type="checkbox" id="aiIncludeCaseContext" style="width: 18px; height: 18px; cursor: pointer;">
                        <span>Dołącz kontekst aktualnej sprawy (jeśli otwarta)</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 10px; color: white; cursor: pointer;">
                        <input type="checkbox" id="aiSearchJurisprudence" checked style="width: 18px; height: 18px; cursor: pointer;">
                        <span>Szukaj również w orzecznictwie sądowym</span>
                    </label>
                </div>
                
                <!-- Przycisk -->
                <button onclick="window.performAISearch()" style="width: 100%; padding: 16px; background: linear-gradient(135deg, #1a2332, #2c3e50); border: 3px solid #FFD700; color: white; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 1.1rem; transition: all 0.3s; box-shadow: 0 4px 15px rgba(255,215,0,0.4);"
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(255,215,0,0.6)'"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(255,215,0,0.4)'">
                    🚀 Wyszukaj z AI
                </button>
                
                <!-- Wyniki -->
                <div id="aiSearchResults" style="margin-top: 25px;"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-select pierwszy typ
    window.selectAISearchType('legal');
    
    // Focus na textarea
    setTimeout(() => {
        document.getElementById('aiSearchQuery').focus();
    }, 300);
};

window.selectAISearchType = function(type) {
    // Reset wszystkich przycisków
    document.querySelectorAll('.ai-search-type-btn').forEach(btn => {
        btn.style.borderColor = 'transparent';
        btn.style.transform = 'scale(1)';
    });
    
    // Pokaż/ukryj hint dla analizy dokumentów
    const hint = document.getElementById('aiAnalyzeHint');
    if (hint) {
        hint.style.display = type === 'analyze' ? 'block' : 'none';
    }
    
    // Podświetl wybrany
    const selectedBtn = document.querySelector(`[data-type="${type}"]`);
    selectedBtn.style.borderColor = '#FFD700';
    selectedBtn.style.transform = 'scale(1.05)';
    
    // Zapisz wybór
    window.selectedAISearchType = type;
};

window.performAISearch = async function() {
    const query = document.getElementById('aiSearchQuery').value.trim();
    const resultsDiv = document.getElementById('aiSearchResults');
    
    if (!query) {
        resultsDiv.innerHTML = '<div style="background: #fed7d7; color: #c53030; padding: 15px; border-radius: 8px;">⚠️ Wpisz pytanie lub opis sytuacji prawnej</div>';
        return;
    }
    
    // Pokaż loading
    resultsDiv.innerHTML = `
        <div style="background: #2d3748; padding: 30px; border-radius: 12px; text-align: center; color: white;">
            <div style="font-size: 3rem; margin-bottom: 15px; animation: spin 2s linear infinite;">🤖</div>
            <div style="font-size: 1.2rem; margin-bottom: 10px;">AI analizuje pytanie...</div>
            <div style="opacity: 0.7;">To może potrwać kilka sekund</div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    try {
        // Pobierz dane aktualnej sprawy jeśli otwarta
        let caseContext = null;
        const includeCaseCtx = document.getElementById('aiIncludeCaseContext').checked;
        
        if (includeCaseCtx && window.crmManager?.currentCaseData) {
            const caseData = window.crmManager.currentCaseData;
            caseContext = {
                case_number: caseData.case_number,
                title: caseData.title,
                case_type: caseData.case_type,
                status: caseData.status,
                description: caseData.description,
                court_name: caseData.court_name,
                court_signature: caseData.court_signature
            };
            console.log('📁 Dodaję kontekst sprawy:', caseContext);
        }
        
        const searchJuris = document.getElementById('aiSearchJurisprudence').checked;
        const searchType = window.selectedAISearchType || 'legal';
        
        // Używamy nowego endpointu Gemini Legal Search z przepisami z bazy
        console.log('🚀 Wywołuję /ai/gemini/legal-search:', {
            type: searchType,
            includeCaseContext: includeCaseCtx,
            searchJurisprudence: searchJuris
        });
        
        const response = await window.api.request('/ai/gemini/legal-search', {
            method: 'POST',
            body: JSON.stringify({
                query: query,
                type: searchType,
                includeCaseContext: includeCaseCtx,
                searchJurisprudence: searchJuris,
                caseContext: caseContext,
                caseId: window.crmManager?.currentCaseData?.id  // 🆕 ID sprawy dla dokumentów!
            })
        });
        
        console.log('🤖 Gemini Legal Search Response:', response);
        
        // Wyświetl wyniki
        const contextInfo = response.context || {};
        const badges = [];
        if (contextInfo.usedLawsContext) badges.push(`📚 ${contextInfo.lawsCount || 0} przepisów`);
        if (contextInfo.usedDocuments) badges.push(`📄 ${contextInfo.documentsSuccessCount || 0} dokumentów`); // 🆕 DOKUMENTY!
        if (searchJuris) badges.push('⚖️ Orzecznictwo');
        if (includeCaseCtx) badges.push('📁 Kontekst sprawy');
        if (badges.length === 0) badges.push('⚡ Podstawowa');
        
        resultsDiv.style.display = 'block'; // ✅ Jawne ustawienie display
        resultsDiv.innerHTML = `
            <div style="background: linear-gradient(135deg, rgba(26,35,50,0.1), rgba(44,62,80,0.1)); padding: 25px; border-radius: 12px; border-left: 5px solid #FFD700;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #FFD700; font-size: 1.3rem;">🤖 Odpowiedź Gemini AI</h3>
                    <div style="font-size: 0.8rem; color: #FFD700; background: rgba(26,35,50,0.3); padding: 4px 8px; border-radius: 6px;">
                        ${badges.join(' · ')}
                    </div>
                </div>
                <div style="color: white; line-height: 1.8; white-space: pre-wrap;">${response.answer || 'Brak odpowiedzi'}</div>
                
                ${response.sources && response.sources.length > 0 ? `
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid rgba(255,215,0,0.3);">
                        <h4 style="margin: 0 0 12px 0; color: #FFD700; font-size: 1rem;">📚 Źródła i podstawy prawne:</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${response.sources.map(source => `
                                <button onclick="window.showLegalLibrary('${source.replace(/'/g, "\\'")}')"
                                        style="background: linear-gradient(135deg, #1a2332, #2c3e50); border: 2px solid #FFD700; padding: 8px 16px; border-radius: 8px; color: white; font-size: 0.85rem; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 8px rgba(255,215,0,0.3);"
                                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(255,215,0,0.5)'"
                                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(255,215,0,0.3)'">
                                    📖 ${source}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
    } catch (error) {
        console.error('❌ Błąd AI Search:', error);
        const errorMessage = error.message || 'Nie udało się połączyć z AI';
        const errorDetails = error.details || '';
        
        resultsDiv.innerHTML = `
            <div style="background: #fed7d7; color: #c53030; padding: 20px; border-radius: 12px;">
                <h3 style="margin: 0 0 10px 0;">❌ Błąd wyszukiwania AI</h3>
                <div style="margin-bottom: 10px;"><strong>Komunikat:</strong> ${errorMessage}</div>
                ${errorDetails ? `<div><strong>Szczegóły:</strong> ${errorDetails}</div>` : ''}
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #fc8181;">
                    <strong>Możliwe przyczyny:</strong>
                    <ul style="margin: 10px 0 0 20px;">
                        <li>Nieprawidłowy klucz API Gemini</li>
                        <li>Przekroczono limit zapytań (sprawdź konsole backendu)</li>
                        <li>Problem z połączeniem internetowym</li>
                        <li>Token autoryzacji wygasł - zaloguj się ponownie</li>
                        <li>Backend nie działa - sprawdź czy serwer jest uruchomiony</li>
                    </ul>
                </div>
            </div>
        `;
    }
};

// Funkcja otwierająca AI Search z kontekstem sprawy (dla modali)
window.showAISearchFromCase = function(caseData) {
    console.log('🤖 Otwieranie AI Search z kontekstem sprawy:', caseData?.case_number);
    
    // Najpierw ustaw dane sprawy
    if (caseData && window.crmManager) {
        window.crmManager.currentCaseData = caseData;
    }
    
    // Otwórz AI Search
    window.showAISearchModal();
    
    // Po otwarciu, automatycznie zaznacz kontekst
    setTimeout(() => {
        const contextCheckbox = document.getElementById('aiIncludeCaseContext');
        if (contextCheckbox && caseData) {
            contextCheckbox.checked = true;
            console.log('✅ Automatycznie zaznaczono kontekst sprawy');
        }
        
        // Ustaw tryb analizy sprawy
        window.selectAISearchType('case');
    }, 100);
};

console.log('✅ AI Search functions loaded');
