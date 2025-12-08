// 🔄 AUTO-REFRESH SYSTEM - Automatyczne odświeżanie sprawy po zmianach
console.log('🔄 auto-refresh-case.js ZAŁADOWANY!');

/**
 * Odśwież aktualnie otwartą sprawę
 * Wywołaj po każdej akcji która modyfikuje dane sprawy
 */
window.refreshCurrentCase = function() {
    console.log('🔄 refreshCurrentCase() wywołane');
    
    // Sprawdź czy jest otwarta jakaś sprawa
    const casePanel = document.getElementById('caseDetails');
    if (!casePanel || casePanel.style.display === 'none') {
        console.log('⚠️ Brak otwartej sprawy - pomijam refresh');
        return;
    }
    
    // Pobierz ID aktualnie otwartej sprawy
    const caseIdElement = casePanel.querySelector('[data-case-id]');
    if (!caseIdElement) {
        console.log('⚠️ Nie znaleziono elementu z data-case-id');
        return;
    }
    
    const caseId = caseIdElement.getAttribute('data-case-id');
    if (!caseId) {
        console.log('⚠️ Brak case ID');
        return;
    }
    
    console.log(`✅ Znaleziono otwartą sprawę: ${caseId}`);
    
    // Sprawdź która zakładka jest aktywna
    const activeTabs = document.querySelectorAll('.case-tab.active');
    let activeTabName = 'details'; // domyślnie szczegóły
    
    activeTabs.forEach(tab => {
        const tabText = tab.textContent.toLowerCase();
        if (tabText.includes('dokument')) activeTabName = 'documents';
        else if (tabText.includes('szczegół')) activeTabName = 'details';
        else if (tabText.includes('wydarze')) activeTabName = 'events';
        else if (tabText.includes('historia')) activeTabName = 'history';
        else if (tabText.includes('płatnoś')) activeTabName = 'payments';
        else if (tabText.includes('świadek')) activeTabName = 'witnesses';
        else if (tabText.includes('dowod')) activeTabName = 'evidence';
    });
    
    console.log(`📌 Aktywna zakładka: ${activeTabName}`);
    
    // Przeładuj sprawę i wróć do aktywnej zakładki
    if (typeof window.crmManager !== 'undefined') {
        console.log('📡 Przeładowuję sprawę...');
        
        window.crmManager.viewCase(caseId).then(() => {
            console.log('✅ Sprawa przeładowana');
            
            // Wróć do aktywnej zakładki po 300ms
            setTimeout(() => {
                window.crmManager.switchCaseTab(caseId, activeTabName);
                console.log(`✅ Zakładka "${activeTabName}" przywrócona`);
            }, 300);
        }).catch(err => {
            console.error('❌ Błąd przeładowania sprawy:', err);
        });
    }
};

/**
 * Hook do istniejących funkcji - automatyczne odświeżanie po akcjach
 */
function setupAutoRefreshHooks() {
    console.log('🔧 Instaluję hooki auto-refresh...');
    
    // Hook 1: Po dodaniu dokumentu
    const originalUploadDocument = window.uploadDocument;
    if (originalUploadDocument) {
        window.uploadDocument = async function(...args) {
            const result = await originalUploadDocument.apply(this, args);
            console.log('📄 Dokument dodany - odświeżam sprawę');
            setTimeout(() => window.refreshCurrentCase(), 1000);
            return result;
        };
        console.log('✅ Hook: uploadDocument');
    }
    
    // Hook 2: Po dodaniu wydarzenia
    const originalAddEvent = window.addEvent;
    if (originalAddEvent) {
        window.addEvent = async function(...args) {
            const result = await originalAddEvent.apply(this, args);
            console.log('📅 Wydarzenie dodane - odświeżam sprawę');
            setTimeout(() => window.refreshCurrentCase(), 1000);
            return result;
        };
        console.log('✅ Hook: addEvent');
    }
    
    // Hook 3: Po dodaniu płatności
    const originalAddPayment = window.addPayment;
    if (originalAddPayment) {
        window.addPayment = async function(...args) {
            const result = await originalAddPayment.apply(this, args);
            console.log('💰 Płatność dodana - odświeżam sprawę');
            setTimeout(() => window.refreshCurrentCase(), 1000);
            return result;
        };
        console.log('✅ Hook: addPayment');
    }
    
    console.log('✅ Hooki auto-refresh zainstalowane!');
}

// Zainstaluj hooki po załadowaniu strony
setTimeout(() => {
    setupAutoRefreshHooks();
}, 2000);

/**
 * Auto-refresh gdy użytkownik wraca do karty (z innej karty przeglądarki)
 */
let lastRefreshTime = Date.now();
const MIN_REFRESH_INTERVAL = 10000; // Min 10 sekund między refreshami

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Użytkownik wrócił do karty
        const timeSinceLastRefresh = Date.now() - lastRefreshTime;
        
        if (timeSinceLastRefresh > MIN_REFRESH_INTERVAL) {
            console.log('👁️ Użytkownik wrócił do karty - sprawdzam czy odświeżyć...');
            
            // Sprawdź czy jest otwarta sprawa
            const casePanel = document.getElementById('caseDetails');
            if (casePanel && casePanel.style.display !== 'none') {
                console.log('🔄 Auto-refresh po powrocie do karty');
                window.refreshCurrentCase();
                lastRefreshTime = Date.now();
            }
        }
    }
});

console.log('✅ Auto-refresh system gotowy!');
console.log('📌 Użyj: window.refreshCurrentCase() aby ręcznie odświeżyć sprawę');
