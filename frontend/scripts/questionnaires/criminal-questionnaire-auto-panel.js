// 🚔 AUTOMATYCZNY PANEL ANKIETY KARNEJ
// Dodaje duży kolorowy panel dla wszystkich spraw karnych (POB/KRA/OSZ/DRO/NAR)

console.log('🚔 Ładuję automatyczny panel ankiety karnej...');

window.criminalQuestionnaireAutoPanel = {
    initialized: false,
    
    /**
     * Inicjalizacja - dodaj panel jeśli sprawa karna
     */
    init() {
        if (this.initialized) {
            console.log('⚠️ Panel ankiety karnej już zainicjalizowany');
            return;
        }
        
        console.log('🔄 Inicjalizacja panelu ankiety karnej...');
        
        // Poczekaj na załadowanie danych sprawy
        this.waitForCaseData();
    },
    
    /**
     * Czekaj na dane sprawy
     */
    waitForCaseData() {
        const checkInterval = setInterval(() => {
            // Sprawdź różne możliwe źródła danych sprawy
            const caseData = window.currentCase || 
                           window.crmManager?.currentCaseData || 
                           window.activeCaseData;
            
            if (caseData && caseData.id) {
                console.log('✅ Znaleziono dane sprawy:', caseData);
                clearInterval(checkInterval);
                this.addPanelIfCriminal(caseData);
            }
        }, 500);
        
        // Timeout po 10 sekundach
        setTimeout(() => {
            clearInterval(checkInterval);
            console.warn('⏰ Timeout: Nie znaleziono danych sprawy');
        }, 10000);
    },
    
    /**
     * Dodaj panel jeśli to sprawa karna
     */
    addPanelIfCriminal(caseData) {
        // Sprawdź czy to sprawa karna
        const isCriminal = window.isCriminalCase && (
            window.isCriminalCase(caseData.case_type) ||
            window.isCriminalCase(caseData.case_number)
        );
        
        if (!isCriminal) {
            console.log('ℹ️ To nie jest sprawa karna, pomijam panel');
            return;
        }
        
        console.log('🎯 Wykryto sprawę karną! Dodaję panel...');
        
        // Znajdź miejsce na panel
        const container = this.findContainer();
        
        if (!container) {
            console.warn('⚠️ Nie znaleziono kontenera dla panelu');
            return;
        }
        
        // Dodaj panel
        this.insertPanel(container, caseData);
        this.initialized = true;
    },
    
    /**
     * Znajdź kontener do wstawienia panelu
     */
    findContainer() {
        // Próbuj różne możliwe selektory
        const selectors = [
            '#caseDetailsContainer',
            '#mainCaseContent',
            '.case-details-content',
            '.case-view-content',
            '[data-case-content]',
            '.tab-content.active'
        ];
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                console.log('✅ Znaleziono kontener:', selector);
                return element;
            }
        }
        
        // Fallback - znajdź dowolny duży kontener
        const allDivs = document.querySelectorAll('div');
        for (const div of allDivs) {
            if (div.offsetWidth > 500 && div.offsetHeight > 300) {
                console.log('✅ Znaleziono fallback kontener');
                return div;
            }
        }
        
        return null;
    },
    
    /**
     * Wstaw panel do kontenera
     */
    insertPanel(container, caseData) {
        const panelHTML = `
            <div id="criminalQuestionnairePanel" style="background: linear-gradient(135deg, #e74c3c, #c0392b); padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(231,76,60,0.4); text-align: center; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                    <div style="font-size: 3rem;">🚔</div>
                    <div style="text-align: left;">
                        <h3 style="margin: 0; color: white; font-size: 1.4rem;">Ankieta Karna</h3>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Kompleksowe postępowanie karne - dla pokrzywdzonych i oskarżonych</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📋</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">9 Sekcji</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Dynamiczne pytania</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">⚖️</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">6 Faz</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Procedura karna</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">9 Dokumentów</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">AI wygeneruje</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">💰</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">Kalkulator AI</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Zadośćuczynienie</div>
                    </div>
                </div>
                <button onclick="window.openCriminalQuestionnaire(${caseData.id}, '${caseData.case_number || caseData.case_type}')" style="
                    padding: 18px 40px;
                    background: white;
                    color: #e74c3c;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 1.2rem;
                    cursor: pointer;
                    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                    transition: all 0.3s;
                    margin-top: 20px;
                " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                    🚔 Wypełnij ankietę karną
                </button>
                <p style="color: rgba(255,255,255,0.8); margin-top: 15px; font-size: 0.9rem;">
                    📢 Zawiadomienie • 🔍 Śledztwo • ⚖️ Proces • 💰 Zadośćuczynienie
                </p>
            </div>
        `;
        
        // Sprawdź czy panel już nie istnieje
        if (document.getElementById('criminalQuestionnairePanel')) {
            console.log('⚠️ Panel ankiety karnej już istnieje');
            return;
        }
        
        // Wstaw panel na początku kontenera
        container.insertAdjacentHTML('afterbegin', panelHTML);
        console.log('✅ Panel ankiety karnej dodany!');
    }
};

// Auto-start - TYLKO PO KLIKNIĘCIU SPRAWY!
console.log('🚀 Nasłuchuję na otwarcie sprawy...');

// Nasłuchuj na kliknięcia w sprawy
document.addEventListener('click', (e) => {
    // Sprawdź czy kliknięto w wiersz sprawy
    const caseRow = e.target.closest('[data-case-id], .case-row, tr[onclick*="viewCase"]');
    
    if (caseRow) {
        console.log('🎯 Wykryto kliknięcie w sprawę!');
        
        // Poczekaj aż dane się załadują
        setTimeout(() => {
            console.log('📍 Próba dodania panelu...');
            window.criminalQuestionnaireAutoPanel.initialized = false;
            window.criminalQuestionnaireAutoPanel.init();
        }, 1500);
    }
});

// Również obsłuż event bus jeśli istnieje
if (window.eventBus) {
    window.eventBus.on('case:opened', (data) => {
        console.log('🔔 Event Bus: case:opened', data);
        setTimeout(() => {
            window.criminalQuestionnaireAutoPanel.initialized = false;
            window.criminalQuestionnaireAutoPanel.init();
        }, 500);
    });
}

// Obsługa caseChanged
if (window.addEventListener) {
    window.addEventListener('caseChanged', (e) => {
        console.log('🔄 Event: caseChanged', e.detail);
        setTimeout(() => {
            window.criminalQuestionnaireAutoPanel.initialized = false;
            window.criminalQuestionnaireAutoPanel.init();
        }, 500);
    });
}

// DEBUG: Dodaj globalną funkcję do ręcznego wywołania
window.debugCriminalPanel = function() {
    console.log('🐛 DEBUG: Ręczne wywołanie panelu');
    console.log('📊 Dane sprawy:', window.currentCase || window.crmManager?.currentCaseData);
    console.log('🔍 isCriminalCase istnieje?', typeof window.isCriminalCase);
    window.criminalQuestionnaireAutoPanel.initialized = false;
    window.criminalQuestionnaireAutoPanel.init();
};

console.log('✅ Automatyczny panel ankiety karnej załadowany!');
console.log('💡 Możesz wywołać ręcznie: window.debugCriminalPanel()');
