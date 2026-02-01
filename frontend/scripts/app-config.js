// ==========================================
// KONFIGURACJA APLIKACJI - MODUŁY I FUNKCJE
// ==========================================

window.appConfig = {
    // === MODUŁY ===
    modules: {
        core: true,              // Podstawa (klienci, sprawy, dokumenty)
        events: true,            // ✅ Wydarzenia i terminy
        payments: true,          // 💰 System płatności
        collective: true,        // 👥 Sprawy zbiorowe
        witnesses: true,         // 👤 Świadkowie
        evidence: true,          // 📦 Dowody w sprawie
        scenarios: true,         // 🔀 Scenariusze/Strategie
        aiAssistant: false,      // 🤖 Asystent AI (przyszłość)
        videoConf: false,        // 📹 Wideokonferencje (przyszłość)
        documentOCR: false       // 📄 OCR dokumentów (przyszłość)
    },
    
    // === FUNKCJE ===
    features: {
        eventAutoNumbering: true,           // Automatyczna numeracja wydarzeń
        caseAutoNumbering: true,            // Automatyczna numeracja spraw
        clientAutoLogin: true,              // Auto-login dla klientów
        emailSync: false,                   // Synchronizacja email (przyszłość)
        smsNotifications: false,            // Powiadomienia SMS (przyszłość)
        advancedSearch: true,               // Zaawansowane wyszukiwanie
        taskAutomation: false               // Automatyzacja zadań (przyszłość)
    },
    
    // === ZAKŁADKI W SPRAWIE (DYNAMICZNE) ===
    caseTabs: [
        {
            id: 'details',
            label: 'Szczegóły',
            icon: '📋',
            enabled: true,
            order: 1,
            moduleRequired: 'core'
        },
        {
            id: 'documents',
            label: 'Dokumenty',
            icon: '📎',
            enabled: true,
            order: 3,
            moduleRequired: 'core'
        },
        {
            id: 'events',
            label: 'Wydarzenia',
            icon: '📅',
            enabled: true,
            order: 4,
            moduleRequired: 'events'
        },
        {
            id: 'payments',
            label: 'Płatności',
            icon: '💰',
            enabled: true,
            order: 5,
            moduleRequired: 'payments'
        },
        {
            id: 'tasks',
            label: 'Zadania',
            icon: '✅',
            enabled: true,
            order: 5.5,
            moduleRequired: 'core'
        },
        {
            id: 'collective',
            label: 'Grupa',
            icon: '👥',
            enabled: true,
            order: 6,
            moduleRequired: 'collective',
            showCondition: (caseData) => caseData.is_collective  // Tylko dla spraw zbiorowych!
        },
        {
            id: 'witnesses',
            label: 'Świadkowie',
            icon: '👤',
            enabled: true,
            order: 7,
            moduleRequired: 'witnesses'
        },
        {
            id: 'evidence',
            label: 'Dowody',
            icon: '📦',
            enabled: true,
            order: 8,
            moduleRequired: 'evidence'
        },
        {
            id: 'scenarios',
            label: 'Scenariusze',
            icon: '🔀',
            enabled: true,
            order: 9,
            moduleRequired: 'scenarios'
        },
        {
            id: 'opposing',
            label: 'Strona przeciwna',
            icon: '⚔️',
            enabled: true,
            order: 10,
            moduleRequired: 'core'
        },
        {
            id: 'comments',
            label: 'Komentarze',
            icon: '💬',
            enabled: true,
            order: 11,
            moduleRequired: 'core'
        },
        {
            id: 'permissions',
            label: 'Uprawnienia',
            icon: '🔐',
            enabled: false,
            order: 11.5,
            moduleRequired: 'core'
        },
        {
            id: 'history',
            label: 'Historia',
            icon: '📜',
            enabled: true,
            order: 12,
            moduleRequired: 'core'
        }
    ],
    
    // === POLA NIESTANDARDOWE ===
    customFields: {
        cases: [
            // Przykładowe niestandardowe pola dla spraw
            // { name: 'insurance_number', label: 'Numer polisy', type: 'text', caseTypes: ['insurance'] },
            // { name: 'accident_date', label: 'Data wypadku', type: 'date', caseTypes: ['civil', 'insurance'] }
        ],
        clients: [
            // Przykładowe niestandardowe pola dla klientów
            // { name: 'preferred_contact', label: 'Preferowany kontakt', type: 'select', options: ['email', 'phone', 'sms'] }
        ],
        events: [
            // Pola dla wydarzeń już obsługiwane przez extra_fields
        ]
    },
    
    // === SYSTEM WYDARZEŃ (EVENT BUS) ===
    // Umożliwia komunikację między modułami
    eventBus: {
        enabled: true,
        debug: true  // Loguj wszystkie eventy w konsoli
    },
    
    // === WERSJA API ===
    apiVersion: 'v1',
    
    // === INFORMACJE O APLIKACJI ===
    app: {
        name: 'E-PGW',
        version: '2.0.0',
        build: '2025.11.03',
        fullName: 'Polska Grupa Wierzytelności',
        website: 'https://e-pgw.pl',
        phone: '+48 720 13 14 15'
    }
};

// === FUNKCJE POMOCNICZE ===

// Sprawdź czy moduł jest włączony
window.isModuleEnabled = function(moduleName) {
    return window.appConfig.modules[moduleName] === true;
};

// Sprawdź czy funkcja jest włączona
window.isFeatureEnabled = function(featureName) {
    return window.appConfig.features[featureName] === true;
};

// Pobierz dostępne zakładki dla sprawy
window.getAvailableCaseTabs = function(caseData) {
    return window.appConfig.caseTabs
        .filter(tab => {
            // Sprawdź czy moduł jest włączony
            if (!window.isModuleEnabled(tab.moduleRequired)) {
                return false;
            }
            
            // Sprawdź warunek wyświetlania (jeśli istnieje)
            if (tab.showCondition && typeof tab.showCondition === 'function') {
                return tab.showCondition(caseData);
            }
            
            return tab.enabled;
        })
        .sort((a, b) => a.order - b.order);
};

console.log('✅ Konfiguracja aplikacji załadowana:', window.appConfig.app.version);
console.log('📦 Włączone moduły:', Object.keys(window.appConfig.modules).filter(m => window.appConfig.modules[m]));
