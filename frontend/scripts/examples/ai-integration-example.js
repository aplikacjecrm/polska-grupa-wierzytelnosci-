// ==========================================
// PRZYKŁAD INTEGRACJI AI ASYSTENTA W CRM
// Skopiuj i dostosuj do swojego modułu
// ==========================================

/* 
   KROK 1: Dodaj kontener w HTML widoku sprawy
   
   Znajdź miejsce gdzie renderujesz szczegóły sprawy i dodaj:
*/

const caseDetailsHTML = `
    <div class="case-details">
        <!-- Twój istniejący HTML sprawy -->
        <h2>Sprawa: ${caseNumber}</h2>
        <p>${caseDescription}</p>
        
        <!-- NOWE: Panel AI Asystenta -->
        <div id="ai-assistant-panel" style="margin-top: 30px;"></div>
    </div>
`;

/* 
   KROK 2: Wywołaj AI Assistant po załadowaniu sprawy
*/

async function loadCaseDetails(caseId) {
    try {
        // Pobierz dane sprawy z API
        const response = await fetch(`/api/cases/${caseId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const caseData = await response.json();
        
        // Renderuj szczegóły sprawy (twój istniejący kod)
        document.getElementById('case-container').innerHTML = caseDetailsHTML;
        
        // NOWE: Renderuj AI Asystenta
        if (window.AIAssistant) {
            AIAssistant.render(caseId, caseData);
        } else {
            console.warn('AI Assistant module nie jest załadowany');
        }
        
    } catch (error) {
        console.error('Błąd ładowania sprawy:', error);
    }
}

/* 
   KROK 3: ALTERNATYWNIE - Dodaj jako zakładkę w CRM
*/

function addAITabToCRM() {
    const tabsContainer = document.querySelector('.case-tabs');
    
    if (tabsContainer) {
        const aiTab = document.createElement('button');
        aiTab.className = 'tab-button';
        aiTab.innerHTML = '🤖 AI Asystent';
        aiTab.onclick = () => showAITab();
        
        tabsContainer.appendChild(aiTab);
    }
}

function showAITab() {
    const content = document.getElementById('tab-content');
    
    content.innerHTML = `
        <div style="padding: 20px;">
            <h2>🤖 AI Asystent Prawny</h2>
            <div id="ai-assistant-panel"></div>
        </div>
    `;
    
    // Pobierz aktualne dane sprawy
    const currentCase = getCurrentCaseData(); // Twoja funkcja
    
    if (window.AIAssistant && currentCase) {
        AIAssistant.render(currentCase.id, currentCase);
    }
}

/* 
   KROK 4: PRZYKŁAD - Automatyczna analiza przy otwarciu sprawy
*/

async function openCaseWithAI(caseId) {
    // Załaduj sprawę normalnie
    await loadCaseDetails(caseId);
    
    // Poczekaj na załadowanie AI
    setTimeout(() => {
        if (window.AIAssistant) {
            // Automatycznie wykonaj szybką analizę
            AIAssistant.quickAnalyze();
        }
    }, 1000);
}

/* 
   KROK 5: PRZYKŁAD - Przycisk "Zapytaj AI" przy dokumencie
*/

function renderDocumentWithAI(document) {
    return `
        <div class="document-item">
            <h4>${document.title}</h4>
            <p>${document.description}</p>
            
            <!-- Przycisk analizy AI -->
            <button onclick="analyzeDocumentWithAI(${document.id}, '${document.title}')">
                🤖 Analizuj AI
            </button>
        </div>
    `;
}

async function analyzeDocumentWithAI(documentId, documentTitle) {
    // Pobierz treść dokumentu
    const documentText = await fetchDocumentText(documentId);
    
    // Wyślij do AI
    const response = await fetch('/api/ai/gemini/analyze-document', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            documentText: documentText,
            caseType: 'civil'
        })
    });
    
    const result = await response.json();
    
    if (result.success) {
        // Pokaż wyniki analizy
        alert('Analiza AI:\n\n' + JSON.stringify(result.analysis, null, 2));
    }
}

/* 
   KROK 6: PRZYKŁAD - Kontekstowe sugestie AI
*/

function showAISuggestions(context) {
    const suggestions = {
        'nowa_sprawa': 'Czy powinienem najpierw wysłać wezwanie do zapłaty?',
        'przed_rozprawa': 'Jakie dokumenty powinienem przygotować na rozprawę?',
        'po_wyroku': 'Jakie są terminy na wniesienie apelacji?',
        'eksmisja': 'Jaka jest procedura eksmisji w Polsce?'
    };
    
    const question = suggestions[context];
    
    if (question && window.AIAssistant) {
        document.getElementById('ai-question-input').value = question;
        AIAssistant.askQuestion();
    }
}

/* 
   KROK 7: PRZYKŁAD - Mini widget AI (floating)
*/

function createFloatingAIWidget() {
    const widget = document.createElement('div');
    widget.id = 'ai-widget';
    widget.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        transition: transform 0.3s;
    `;
    
    widget.innerHTML = '<span style="font-size: 2rem;">🤖</span>';
    
    widget.onmouseenter = () => widget.style.transform = 'scale(1.1)';
    widget.onmouseleave = () => widget.style.transform = 'scale(1)';
    
    widget.onclick = () => {
        // Pokaż panel AI w modalu
        showAIModal();
    };
    
    document.body.appendChild(widget);
}

function showAIModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 0; border-radius: 12px; width: 90%; max-width: 800px; max-height: 90vh; overflow: hidden;">
            <div style="padding: 20px; background: #667eea; color: white; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0;">🤖 AI Asystent Prawny</h3>
                <button onclick="this.closest('.modal').remove()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">✕</button>
            </div>
            <div id="modal-ai-panel" style="padding: 20px; max-height: calc(90vh - 80px); overflow-y: auto;"></div>
        </div>
    `;
    
    modal.className = 'modal';
    document.body.appendChild(modal);
    
    // Renderuj AI w modalu
    if (window.AIAssistant) {
        const currentCase = getCurrentCaseData();
        if (currentCase) {
            AIAssistant.render(currentCase.id, currentCase);
        }
    }
}

/* 
   GOTOWE! Wybierz którąś z powyższych metod i zintegruj w swoim module.
   
   REKOMENDACJA:
   - Dla pełnej integracji: KROK 1-2
   - Dla zakładki CRM: KROK 3
   - Dla floating widget: KROK 7
*/
