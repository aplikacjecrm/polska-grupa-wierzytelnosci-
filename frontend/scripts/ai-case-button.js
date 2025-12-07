// 🤖 FLOATING AI BUTTON - pojawia się gdy sprawa jest otwarta

console.log('🔘 Ładowanie AI Case Button...');

// Tworzy floating button
function createAICaseButton() {
    // Sprawdź czy już istnieje
    if (document.getElementById('aiCaseFloatingBtn')) {
        return;
    }
    
    const button = document.createElement('button');
    button.id = 'aiCaseFloatingBtn';
    button.innerHTML = '🤖 AI Search';
    button.title = 'Wyszukaj artykuły prawne i analizuj dokumenty z AI';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 999999;
        padding: 18px 24px;
        background: linear-gradient(135deg, #3B82F6, #1E40AF);
        color: white;
        border: none;
        border-radius: 50px;
        box-shadow: 0 6px 30px rgba(102,126,234,0.6);
        cursor: pointer;
        font-weight: 700;
        font-size: 1rem;
        display: none;
        transition: all 0.3s;
        text-align: center;
        white-space: nowrap;
    `;
    
    button.onmouseover = () => {
        button.style.transform = 'scale(1.1)';
        button.style.boxShadow = '0 6px 25px rgba(102,126,234,0.7)';
    };
    
    button.onmouseout = () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 20px rgba(102,126,234,0.5)';
    };
    
    button.onclick = () => {
        console.log('🤖 Kliknięto Floating AI Button');
        if (window.crmManager?.currentCaseData) {
            // Jeśli sprawa otwarta - użyj kontekstu
            window.showAISearchFromCase(window.crmManager.currentCaseData);
        } else {
            // Jeśli brak sprawy - otwórz zwykły AI Search
            window.showAISearchModal();
        }
    };
    
    document.body.appendChild(button);
    console.log('✅ Floating AI Button utworzony');
}

// Funkcja sprawdzająca czy sprawa jest otwarta i aktualizująca przycisk
function updateAIButtonVisibility() {
    const button = document.getElementById('aiCaseFloatingBtn');
    if (!button) return;
    
    // Sprawdź czy currentCaseData istnieje
    const hasCaseData = window.crmManager?.currentCaseData;
    
    // ZAWSZE pokazuj przycisk, ale zmień tekst
    button.style.display = 'block';
    
    if (hasCaseData) {
        // Gdy sprawa otwarta
        button.innerHTML = '🤖 Zapytaj AI o sprawę';
        button.title = `AI Search z kontekstem sprawy: ${hasCaseData.case_number}`;
    } else {
        // Gdy brak sprawy
        button.innerHTML = '🤖 AI Search';
        button.title = 'Wyszukaj artykuły prawne i analizuj dokumenty z AI';
    }
}

// Inicjalizacja po załadowaniu DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        createAICaseButton();
        
        // Sprawdzaj co sekundę
        setInterval(updateAIButtonVisibility, 1000);
    });
} else {
    createAICaseButton();
    setInterval(updateAIButtonVisibility, 1000);
}

console.log('✅ AI Case Button script loaded');
