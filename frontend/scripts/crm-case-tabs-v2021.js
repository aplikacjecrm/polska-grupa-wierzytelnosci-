// 🔥🔥🔥 VERSION 2018 - POPRAWIONE ODSTĘPY! 🔥🔥🔥
console.log('%c🔥🔥🔥 CRM-CASE-TABS.JS V2018 - SILVER BORDER + SPACING 40PX! 🔥🔥🔥', 'background: purple; color: white; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c✅ Border: 3px solid #c0c5ce | Gap: 25px | Title margin-top: 40px', 'background: green; color: white; font-size: 14px; padding: 5px;');
console.log('%c⚠️ Jeśli nie widzisz zmian - USUŃ CACHE: Ctrl+Shift+Delete!', 'background: orange; color: white; font-size: 16px; padding: 5px;');
console.log('✅ window.api:', typeof window.api);
console.log('✅ window.saveEnhancedEvent:', typeof window.saveEnhancedEvent);
console.log('✅ window.viewEventDetails:', typeof window.viewEventDetails);
console.log('✅ window.editEvent:', typeof window.editEvent);
console.log('🤖 AI Search gotowy!');
console.log('⚓ isSpecialCase:', typeof window.isSpecialCase);
console.log('⚓ Sprawy specjalne (5): Morskie, Energetyka, OZE, Lotnicze, IT');
console.log('🏛️ isAdministrativeCase:', typeof window.isAdministrativeCase);
console.log('🏛️ Sprawy administracyjne (3): Budowlane, Podatkowe, Zagospodarowanie');
console.log('🌍 isInternationalCase:', typeof window.isInternationalCase);
console.log('🌍 Sprawy międzynarodowe (3): Międzynarodowe, Prawo EU, Arbitraż');
console.log('💼 isCommercialCase:', typeof window.isCommercialCase);
console.log('💼 Sprawy gospodarcze (3): Gospodarcze, Upadłościowe, Restrukturyzacja');
console.log('👨‍👩‍👧‍👦 isFamilyCase:', typeof window.isFamilyCase);
console.log('👨‍👩‍👧‍👦 Sprawy rodzinne (5): Rozwody, Alimenty, Władza rodzicielska, Nieletni');
console.log('📜 isCivilCase:', typeof window.isCivilCase);
console.log('📜 Sprawy cywilne ROZBUDOWANE (15): Umowy (4), Majątkowe (4), Spadkowe (4)');

// Funkcja tłumacząca typy spraw na polski
window.translateCaseType = function(caseType) {
    const translations = {
        'criminal': 'Karna',
        'civil': 'Cywilna',
        'commercial': 'Gospodarcza',
        'family': 'Rodzinna',
        'administrative': 'Administracyjna',
        'compensation': 'Odszkodowawcza',
        'debt_collection': 'Windykacyjna',
        'windykacja': 'Windykacyjna',
        'debt': 'Windykacyjna',
        'bankruptcy': 'Upadłościowa',
        'restructuring': 'Restrukturyzacyjna',
        'international': 'Międzynarodowa',
        'european': 'Prawo UE',
        'arbitration': 'Arbitraż',
        'maritime': 'Prawo Morskie',
        'energy': 'Energetyka',
        'renewable': 'OZE',
        'aviation': 'Prawo Lotnicze',
        'it': 'Prawo IT',
        'building': 'Budowlane',
        'tax': 'Podatkowe',
        'zoning': 'Zagospodarowanie',
        'inheritance': 'Spadkowe',
        'property': 'Majątkowe',
        'contract': 'Umowy',
        'divorce': 'Rozwód',
        'alimony': 'Alimenty',
        'custody': 'Władza rodzicielska',
        'juvenile': 'Sprawy nieletnich'
    };
    
    return translations[caseType] || caseType;
};

// Funkcja sprawdzająca czy sprawa jest specjalna
window.isSpecialCase = function(caseType) {
    const specialTypes = ['maritime', 'energy', 'renewable', 'aviation', 'it'];
    const specialPrefixes = ['MOR', 'ENE', 'OZE', 'LOT', 'INF'];
    
    if (!caseType) return false;
    
    // Sprawdź bezpośrednio typ
    if (specialTypes.includes(caseType)) {
        return true;
    }
    
    // Sprawdź prefix w numerze sprawy (MOR/DK01/002)
    if (typeof caseType === 'string' && caseType.includes('/')) {
        const prefix = caseType.split('/')[0];
        return specialPrefixes.includes(prefix);
    }
    
    return false;
};

// Funkcja zwracająca szczegóły typu specjalnego
window.getSpecialCaseDetails = function(caseType) {
    const mapping = {
        'maritime': { icon: '⚓', name: 'Prawo Morskie', color: '#006994', desc: 'Żegluga, porty, statki' },
        'MOR': { icon: '⚓', name: 'Prawo Morskie', color: '#006994', desc: 'Żegluga, porty, statki' },
        
        'energy': { icon: '⚡', name: 'Energetyka', color: '#f39c12', desc: 'Koncesje, sieci, regulacje' },
        'ENE': { icon: '⚡', name: 'Energetyka', color: '#f39c12', desc: 'Koncesje, sieci, regulacje' },
        
        'renewable': { icon: '🌱', name: 'OZE / Fotowoltaika', color: '#27ae60', desc: 'Instalacje, dotacje, umowy' },
        'OZE': { icon: '🌱', name: 'OZE / Fotowoltaika', color: '#27ae60', desc: 'Instalacje, dotacje, umowy' },
        
        'aviation': { icon: '✈️', name: 'Prawo Lotnicze', color: '#3498db', desc: 'Loty, lotniska, regulacje' },
        'LOT': { icon: '✈️', name: 'Prawo Lotnicze', color: '#3498db', desc: 'Loty, lotniska, regulacje' },
        
        'it': { icon: '💻', name: 'Prawo IT', color: '#9b59b6', desc: 'RODO, dane, cyberbezpieczeństwo' },
        'INF': { icon: '💻', name: 'Prawo IT', color: '#9b59b6', desc: 'RODO, dane, cyberbezpieczeństwo' }
    };
    
    // Sprawdź bezpośrednio
    if (mapping[caseType]) {
        return mapping[caseType];
    }
    
    // Sprawdź prefix w numerze
    if (typeof caseType === 'string' && caseType.includes('/')) {
        const prefix = caseType.split('/')[0];
        if (mapping[prefix]) {
            return mapping[prefix];
        }
    }
    
    return null;
};

// Funkcja sprawdzająca czy sprawa jest administracyjna
window.isAdministrativeCase = function(caseType) {
    const adminTypes = ['building', 'tax', 'zoning'];
    const adminPrefixes = ['BUD', 'POD', 'ZAG'];
    
    if (!caseType) return false;
    
    // Sprawdź bezpośrednio typ
    if (adminTypes.includes(caseType)) {
        return true;
    }
    
    // Sprawdź prefix w numerze sprawy (BUD/DK01/002)
    if (typeof caseType === 'string' && caseType.includes('/')) {
        const prefix = caseType.split('/')[0];
        return adminPrefixes.includes(prefix);
    }
    
    return false;
};

// Funkcja zwracająca szczegóły typu administracyjnego
window.getAdministrativeCaseDetails = function(caseType) {
    const mapping = {
        'building': { 
            icon: '🏗️', 
            name: 'Prawo Budowlane', 
            color: '#e67e22', 
            desc: 'Pozwolenia, decyzje, spory budowlane',
            features: [
                { icon: '📋', title: 'Pozwolenia', subtitle: 'Na budowę/rozbiórkę' },
                { icon: '⚠️', title: 'Decyzje', subtitle: 'Nadzór budowlany' },
                { icon: '🏛️', title: 'WSA/NSA', subtitle: 'Skargi administracyjne' },
                { icon: '📐', title: 'Ekspertyzy', subtitle: 'Techniczne/prawne' }
            ],
            procedures: '📄 Wniosek • 📋 Decyzja • ⚖️ Odwołanie • 🏛️ Skarga do WSA'
        },
        'BUD': { 
            icon: '🏗️', 
            name: 'Prawo Budowlane', 
            color: '#e67e22', 
            desc: 'Pozwolenia, decyzje, spory budowlane',
            features: [
                { icon: '📋', title: 'Pozwolenia', subtitle: 'Na budowę/rozbiórkę' },
                { icon: '⚠️', title: 'Decyzje', subtitle: 'Nadzór budowlany' },
                { icon: '🏛️', title: 'WSA/NSA', subtitle: 'Skargi administracyjne' },
                { icon: '📐', title: 'Ekspertyzy', subtitle: 'Techniczne/prawne' }
            ],
            procedures: '📄 Wniosek • 📋 Decyzja • ⚖️ Odwołanie • 🏛️ Skarga do WSA'
        },
        
        'tax': { 
            icon: '🔥', 
            name: 'Prawo Podatkowe', 
            color: '#c0392b', 
            desc: 'Podatki, kontrole, spory z US/ZUS',
            features: [
                { icon: '💰', title: 'Interpretacje', subtitle: 'Indywidualne/ogólne' },
                { icon: '🔍', title: 'Kontrole', subtitle: 'US/ZUS/Celne' },
                { icon: '⚖️', title: 'Spory', subtitle: 'Decyzje/zaległości' },
                { icon: '📊', title: 'Optymalizacja', subtitle: 'Podatkowa' }
            ],
            procedures: '📝 Wniosek o interpretację • 🔍 Kontrola • ⚖️ Odwołanie • 🏛️ Skarga'
        },
        'POD': { 
            icon: '🔥', 
            name: 'Prawo Podatkowe', 
            color: '#c0392b', 
            desc: 'Podatki, kontrole, spory z US/ZUS',
            features: [
                { icon: '💰', title: 'Interpretacje', subtitle: 'Indywidualne/ogólne' },
                { icon: '🔍', title: 'Kontrole', subtitle: 'US/ZUS/Celne' },
                { icon: '⚖️', title: 'Spory', subtitle: 'Decyzje/zaległości' },
                { icon: '📊', title: 'Optymalizacja', subtitle: 'Podatkowa' }
            ],
            procedures: '📝 Wniosek o interpretację • 🔍 Kontrola • ⚖️ Odwołanie • 🏛️ Skarga'
        },
        
        'zoning': { 
            icon: '📍', 
            name: 'Zagospodarowanie Przestrzenne', 
            color: '#16a085', 
            desc: 'MPZP, WZ, decyzje lokalizacyjne',
            features: [
                { icon: '🗺️', title: 'MPZP', subtitle: 'Miejscowe plany' },
                { icon: '📄', title: 'WZ', subtitle: 'Warunki zabudowy' },
                { icon: '🏘️', title: 'Decyzje', subtitle: 'Lokalizacyjne' },
                { icon: '⚖️', title: 'Skargi', subtitle: 'Na uchwały rady' }
            ],
            procedures: '📋 Wniosek WZ • 🗺️ Procedura MPZP • ⚖️ Odwołanie • 🏛️ Skarga'
        },
        'ZAG': { 
            icon: '📍', 
            name: 'Zagospodarowanie Przestrzenne', 
            color: '#16a085', 
            desc: 'MPZP, WZ, decyzje lokalizacyjne',
            features: [
                { icon: '🗺️', title: 'MPZP', subtitle: 'Miejscowe plany' },
                { icon: '📄', title: 'WZ', subtitle: 'Warunki zabudowy' },
                { icon: '🏘️', title: 'Decyzje', subtitle: 'Lokalizacyjne' },
                { icon: '⚖️', title: 'Skargi', subtitle: 'Na uchwały rady' }
            ],
            procedures: '📋 Wniosek WZ • 🗺️ Procedura MPZP • ⚖️ Odwołanie • 🏛️ Skarga'
        }
    };
    
    // Sprawdź bezpośrednio
    if (mapping[caseType]) {
        return mapping[caseType];
    }
    
    // Sprawdź prefix w numerze
    if (typeof caseType === 'string' && caseType.includes('/')) {
        const prefix = caseType.split('/')[0];
        if (mapping[prefix]) {
            return mapping[prefix];
        }
    }
    
    return null;
};

// Funkcja sprawdzająca czy sprawa jest międzynarodowa
window.isInternationalCase = function(caseType) {
    const internationalTypes = ['international', 'european', 'arbitration'];
    const internationalPrefixes = ['MIE', 'EUR', 'ARB'];
    
    if (!caseType) return false;
    
    // Sprawdź bezpośrednio typ
    if (internationalTypes.includes(caseType)) {
        return true;
    }
    
    // Sprawdź prefix w numerze sprawy (MIE/DK01/002)
    if (typeof caseType === 'string' && caseType.includes('/')) {
        const prefix = caseType.split('/')[0];
        return internationalPrefixes.includes(prefix);
    }
    
    return false;
};

// Funkcja zwracająca szczegóły typu międzynarodowego
window.getInternationalCaseDetails = function(caseType) {
    const mapping = {
        'international': { 
            icon: '🌍', 
            name: 'Sprawy Międzynarodowe', 
            color: '#3498db', 
            desc: 'Transgraniczne spory, egzekucja, prawo kolizyjne',
            features: [
                { icon: '⚖️', title: 'Jurysdykcja', subtitle: 'Właściwość sądów' },
                { icon: '📜', title: 'Konwencje', subtitle: 'Haskie, wiedeńskie' },
                { icon: '🔄', title: 'Egzekucja', subtitle: 'Wyroki zagraniczne' },
                { icon: '🗺️', title: 'Prawo kolizyjne', subtitle: 'Wybór prawa' }
            ],
            procedures: '🌍 Jurysdykcja • 📄 Tłumaczenia • ⚖️ Uznanie wyroku • 🔄 Egzekucja'
        },
        'MIE': { 
            icon: '🌍', 
            name: 'Sprawy Międzynarodowe', 
            color: '#3498db', 
            desc: 'Transgraniczne spory, egzekucja, prawo kolizyjne',
            features: [
                { icon: '⚖️', title: 'Jurysdykcja', subtitle: 'Właściwość sądów' },
                { icon: '📜', title: 'Konwencje', subtitle: 'Haskie, wiedeńskie' },
                { icon: '🔄', title: 'Egzekucja', subtitle: 'Wyroki zagraniczne' },
                { icon: '🗺️', title: 'Prawo kolizyjne', subtitle: 'Wybór prawa' }
            ],
            procedures: '🌍 Jurysdykcja • 📄 Tłumaczenia • ⚖️ Uznanie wyroku • 🔄 Egzekucja'
        },
        
        'european': { 
            icon: '🇪🇺', 
            name: 'Prawo Europejskie', 
            color: '#004494', 
            desc: 'UE, TSUE, dyrektywy, rozporządzenia',
            features: [
                { icon: '⚖️', title: 'TSUE', subtitle: 'Trybunał Sprawiedliwości UE' },
                { icon: '📋', title: 'Dyrektywy', subtitle: 'Implementacja' },
                { icon: '🔍', title: 'Pytania prejudycjalne', subtitle: 'Do TSUE' },
                { icon: '💼', title: 'Compliance', subtitle: 'Zgodność z UE' }
            ],
            procedures: '📋 Dyrektywa • ⚖️ Pytanie prejudycjalne • 🇪🇺 TSUE • 📄 Implementacja'
        },
        'EUR': { 
            icon: '🇪🇺', 
            name: 'Prawo Europejskie', 
            color: '#004494', 
            desc: 'UE, TSUE, dyrektywy, rozporządzenia',
            features: [
                { icon: '⚖️', title: 'TSUE', subtitle: 'Trybunał Sprawiedliwości UE' },
                { icon: '📋', title: 'Dyrektywy', subtitle: 'Implementacja' },
                { icon: '🔍', title: 'Pytania prejudycjalne', subtitle: 'Do TSUE' },
                { icon: '💼', title: 'Compliance', subtitle: 'Zgodność z UE' }
            ],
            procedures: '📋 Dyrektywa • ⚖️ Pytanie prejudycjalne • 🇪🇺 TSUE • 📄 Implementacja'
        },
        
        'arbitration': { 
            icon: '⚖️', 
            name: 'Arbitraż Międzynarodowy', 
            color: '#8e44ad', 
            desc: 'ICC, LCIA, klauzule arbitrażowe, sądy polubowne',
            features: [
                { icon: '📜', title: 'Klauzula', subtitle: 'Arbitrażowa' },
                { icon: '👥', title: 'Arbitrzy', subtitle: 'Wybór/nominacja' },
                { icon: '🏛️', title: 'Instytucje', subtitle: 'ICC, LCIA, SCC' },
                { icon: '⚖️', title: 'Wyrok', subtitle: 'Uznanie i egzekucja' }
            ],
            procedures: '📜 Klauzula • 👥 Arbitrzy • ⚖️ Postępowanie • 🔄 Egzekucja wyroku'
        },
        'ARB': { 
            icon: '⚖️', 
            name: 'Arbitraż Międzynarodowy', 
            color: '#8e44ad', 
            desc: 'ICC, LCIA, klauzule arbitrażowe, sądy polubowne',
            features: [
                { icon: '📜', title: 'Klauzula', subtitle: 'Arbitrażowa' },
                { icon: '👥', title: 'Arbitrzy', subtitle: 'Wybór/nominacja' },
                { icon: '🏛️', title: 'Instytucje', subtitle: 'ICC, LCIA, SCC' },
                { icon: '⚖️', title: 'Wyrok', subtitle: 'Uznanie i egzekucja' }
            ],
            procedures: '📜 Klauzula • 👥 Arbitrzy • ⚖️ Postępowanie • 🔄 Egzekucja wyroku'
        }
    };
    
    // Sprawdź bezpośrednio
    if (mapping[caseType]) {
        return mapping[caseType];
    }
    
    // Sprawdź prefix w numerze
    if (typeof caseType === 'string' && caseType.includes('/')) {
        const prefix = caseType.split('/')[0];
        if (mapping[prefix]) {
            return mapping[prefix];
        }
    }
    
    return null;
};

// Funkcja sprawdzająca czy sprawa jest gospodarcza
window.isCommercialCase = function(caseType) {
    // UWAGA: bankruptcy i restructuring to OSOBNE kategorie, NIE commercial!
    const commercialTypes = ['business', 'commercial'];
    const commercialPrefixes = ['GOS'];
    
    if (!caseType) return false;
    
    // Sprawdź bezpośrednio typ
    if (commercialTypes.includes(caseType)) {
        return true;
    }
    
    // Sprawdź prefix w numerze sprawy (GOS/DK01/002)
    if (typeof caseType === 'string' && caseType.includes('/')) {
        const prefix = caseType.split('/')[0];
        return commercialPrefixes.includes(prefix);
    }
    
    return false;
};

// Funkcja sprawdzająca czy sprawa jest upadłościowa
window.isBankruptcyCase = function(caseType) {
    const bankruptcyTypes = ['bankruptcy'];
    const bankruptcyPrefixes = ['UPA'];
    
    if (!caseType) return false;
    if (bankruptcyTypes.includes(caseType)) return true;
    if (typeof caseType === 'string' && caseType.includes('/')) {
        const prefix = caseType.split('/')[0];
        return bankruptcyPrefixes.includes(prefix);
    }
    return false;
};

// Funkcja sprawdzająca czy sprawa jest restrukturyzacyjna  
window.isRestructuringCase = function(caseType) {
    const restructuringTypes = ['restructuring'];
    const restructuringPrefixes = ['RES'];
    
    if (!caseType) return false;
    if (restructuringTypes.includes(caseType)) return true;
    if (typeof caseType === 'string' && caseType.includes('/')) {
        const prefix = caseType.split('/')[0];
        return restructuringPrefixes.includes(prefix);
    }
    return false;
};

// Funkcja zwracająca szczegóły typu gospodarczego
window.getCommercialCaseDetails = function(caseType) {
    const mapping = {
        'business': { 
            icon: '💼', 
            name: 'Sprawy Gospodarcze', 
            color: '#2c3e50', 
            desc: 'Umowy B2B, spory handlowe, należności',
            features: [
                { icon: '📜', title: 'Umowy B2B', subtitle: 'Dostawy, usługi' },
                { icon: '💰', title: 'Windykacja', subtitle: 'Dochodzenie należności' },
                { icon: '⚖️', title: 'Spory handlowe', subtitle: 'Sąd gospodarczy' },
                { icon: '🏛️', title: 'KRS', subtitle: 'Rejestr przedsiębiorców' }
            ],
            procedures: '📄 Pozew • 💼 Sąd Gospodarczy • 💰 Egzekucja • 🔒 Zabezpieczenie'
        },
        'GOS': { 
            icon: '💼', 
            name: 'Sprawy Gospodarcze', 
            color: '#2c3e50', 
            desc: 'Umowy B2B, spory handlowe, należności',
            features: [
                { icon: '📜', title: 'Umowy B2B', subtitle: 'Dostawy, usługi' },
                { icon: '💰', title: 'Windykacja', subtitle: 'Dochodzenie należności' },
                { icon: '⚖️', title: 'Spory handlowe', subtitle: 'Sąd gospodarczy' },
                { icon: '🏛️', title: 'KRS', subtitle: 'Rejestr przedsiębiorców' }
            ],
            procedures: '📄 Pozew • 💼 Sąd Gospodarczy • 💰 Egzekucja • 🔒 Zabezpieczenie'
        },
        
        'bankruptcy': { 
            icon: '💸', 
            name: 'Sprawy Upadłościowe', 
            color: '#c0392b', 
            desc: 'Upadłość konsumencka i przedsiębiorców',
            features: [
                { icon: '📋', title: 'Wniosek', subtitle: 'O ogłoszenie upadłości' },
                { icon: '👨‍⚖️', title: 'Syndyk', subtitle: 'Zarząd masą' },
                { icon: '💳', title: 'Oddłużenie', subtitle: 'Plan spłaty' },
                { icon: '📊', title: 'Wierzyciele', subtitle: 'Lista, zgłoszenia' }
            ],
            procedures: '📄 Wniosek • 👨‍⚖️ Syndyk • 💳 Plan spłaty • ✅ Oddłużenie'
        },
        'UPA': { 
            icon: '💸', 
            name: 'Sprawy Upadłościowe', 
            color: '#c0392b', 
            desc: 'Upadłość konsumencka i przedsiębiorców',
            features: [
                { icon: '📋', title: 'Wniosek', subtitle: 'O ogłoszenie upadłości' },
                { icon: '👨‍⚖️', title: 'Syndyk', subtitle: 'Zarząd masą' },
                { icon: '💳', title: 'Oddłużenie', subtitle: 'Plan spłaty' },
                { icon: '📊', title: 'Wierzyciele', subtitle: 'Lista, zgłoszenia' }
            ],
            procedures: '📄 Wniosek • 👨‍⚖️ Syndyk • 💳 Plan spłaty • ✅ Oddłużenie'
        },
        
        'restructuring': { 
            icon: '🔄', 
            name: 'Restrukturyzacja', 
            color: '#27ae60', 
            desc: 'Postępowania sanacyjne, układy z wierzycielami',
            features: [
                { icon: '📝', title: 'Wniosek', subtitle: 'O restrukturyzację' },
                { icon: '🤝', title: 'Układ', subtitle: 'Z wierzycielami' },
                { icon: '👥', title: 'Nadzorca', subtitle: 'Sądowy/układowy' },
                { icon: '✅', title: 'Zatwierdzenie', subtitle: 'Planu układu' }
            ],
            procedures: '📄 Wniosek • 🤝 Negocjacje • ✅ Głosowanie • 📋 Układ'
        },
        'RES': { 
            icon: '🔄', 
            name: 'Restrukturyzacja', 
            color: '#27ae60', 
            desc: 'Postępowania sanacyjne, układy z wierzycielami',
            features: [
                { icon: '📝', title: 'Wniosek', subtitle: 'O restrukturyzację' },
                { icon: '🤝', title: 'Układ', subtitle: 'Z wierzycielami' },
                { icon: '👥', title: 'Nadzorca', subtitle: 'Sądowy/układowy' },
                { icon: '✅', title: 'Zatwierdzenie', subtitle: 'Planu układu' }
            ],
            procedures: '📄 Wniosek • 🤝 Negocjacje • ✅ Głosowanie • 📋 Układ'
        }
    };
    
    // Sprawdź bezpośrednio
    if (mapping[caseType]) {
        return mapping[caseType];
    }
    
    // Sprawdź prefix w numerze
    if (typeof caseType === 'string' && caseType.includes('/')) {
        const prefix = caseType.split('/')[0];
        if (mapping[prefix]) {
            return mapping[prefix];
        }
    }
    
    return null;
};

// Funkcja sprawdzająca czy sprawa jest rodzinna
window.isFamilyCase = function(caseType) {
    const familyTypes = ['divorce', 'alimony', 'custody', 'juvenile'];
    const familyPrefixes = ['ROD', 'ROZ', 'ALI', 'OPI', 'NIE'];
    
    if (!caseType) return false;
    
    // Sprawdź bezpośrednio typ
    if (familyTypes.includes(caseType)) {
        return true;
    }
    
    // Sprawdź prefix w numerze sprawy (ROD/DK01/002)
    if (typeof caseType === 'string' && caseType.includes('/')) {
        const prefix = caseType.split('/')[0];
        return familyPrefixes.includes(prefix);
    }
    
    return false;
};

// Funkcja zwracająca szczegóły typu rodzinnego
window.getFamilyCaseDetails = function(caseType) {
    const mapping = {
        'divorce': { 
            icon: '💔', 
            name: 'Sprawy Rozwodowe', 
            color: '#e74c3c', 
            desc: 'Rozwód, separacja, podział majątku',
            features: [
                { icon: '📋', title: 'Pozew o rozwód', subtitle: 'Z orzekaniem o winie' },
                { icon: '💰', title: 'Podział majątku', subtitle: 'Wspólność majątkowa' },
                { icon: '👶', title: 'Władza rodzicielska', subtitle: 'Opieka nad dziećmi' },
                { icon: '🏠', title: 'Alimenty', subtitle: 'Na dzieci i małżonka' }
            ],
            procedures: '📄 Pozew • ⚖️ Postępowanie dowodowe • 👨‍👩‍👧 Wywiad kuratora • 💔 Wyrok'
        },
        'ROZ': { 
            icon: '💔', 
            name: 'Sprawy Rozwodowe', 
            color: '#e74c3c', 
            desc: 'Rozwód, separacja, podział majątku',
            features: [
                { icon: '📋', title: 'Pozew o rozwód', subtitle: 'Z orzekaniem o winie' },
                { icon: '💰', title: 'Podział majątku', subtitle: 'Wspólność majątkowa' },
                { icon: '👶', title: 'Władza rodzicielska', subtitle: 'Opieka nad dziećmi' },
                { icon: '🏠', title: 'Alimenty', subtitle: 'Na dzieci i małżonka' }
            ],
            procedures: '📄 Pozew • ⚖️ Postępowanie dowodowe • 👨‍👩‍👧 Wywiad kuratora • 💔 Wyrok'
        },
        'ROD': { 
            icon: '👨‍👩‍👧‍👦', 
            name: 'Sprawy Rodzinne', 
            color: '#3498db', 
            desc: 'Sprawy rodzinne ogólne',
            features: [
                { icon: '💔', title: 'Rozwody', subtitle: 'I separacje' },
                { icon: '💰', title: 'Alimenty', subtitle: 'Ustalenie/podwyższenie' },
                { icon: '👶', title: 'Opieka', subtitle: 'Władza rodzicielska' },
                { icon: '⚖️', title: 'Kontakty', subtitle: 'Z dzieckiem' }
            ],
            procedures: '📄 Wniosek/Pozew • 👨‍👩‍👧 Wywiad • ⚖️ Rozprawa • 📋 Orzeczenie'
        },
        
        'alimony': { 
            icon: '💰', 
            name: 'Sprawy Alimentacyjne', 
            color: '#f39c12', 
            desc: 'Alimenty na dzieci, małżonka, rodziców',
            features: [
                { icon: '📋', title: 'Ustalenie', subtitle: 'Wysokości alimentów' },
                { icon: '📈', title: 'Podwyższenie', subtitle: 'Waloryzacja' },
                { icon: '🔄', title: 'Egzekucja', subtitle: 'Windykacja alimentów' },
                { icon: '🛡️', title: 'Fundusz', subtitle: 'Alimentacyjny' }
            ],
            procedures: '📄 Pozew/Wniosek • 💼 Dochody stron • 👶 Potrzeby dziecka • 💰 Orzeczenie'
        },
        'ALI': { 
            icon: '💰', 
            name: 'Sprawy Alimentacyjne', 
            color: '#f39c12', 
            desc: 'Alimenty na dzieci, małżonka, rodziców',
            features: [
                { icon: '📋', title: 'Ustalenie', subtitle: 'Wysokości alimentów' },
                { icon: '📈', title: 'Podwyższenie', subtitle: 'Waloryzacja' },
                { icon: '🔄', title: 'Egzekucja', subtitle: 'Windykacja alimentów' },
                { icon: '🛡️', title: 'Fundusz', subtitle: 'Alimentacyjny' }
            ],
            procedures: '📄 Pozew/Wniosek • 💼 Dochody stron • 👶 Potrzeby dziecka • 💰 Orzeczenie'
        },
        
        'custody': { 
            icon: '👶', 
            name: 'Władza Rodzicielska', 
            color: '#9b59b6', 
            desc: 'Opieka nad dzieckiem, kontakty',
            features: [
                { icon: '⚖️', title: 'Powierzenie', subtitle: 'Opieki jednemu z rodziców' },
                { icon: '🤝', title: 'Wspólna opieka', subtitle: 'Ustalenia' },
                { icon: '📅', title: 'Kontakty', subtitle: 'Harmonogram' },
                { icon: '🚫', title: 'Ograniczenie', subtitle: 'Władzy rodzicielskiej' }
            ],
            procedures: '📄 Wniosek • 👨‍👩‍👧 Wywiad kuratora • 👶 Wysłuchanie dziecka • ⚖️ Postanowienie'
        },
        'OPI': { 
            icon: '👶', 
            name: 'Władza Rodzicielska', 
            color: '#9b59b6', 
            desc: 'Opieka nad dzieckiem, kontakty',
            features: [
                { icon: '⚖️', title: 'Powierzenie', subtitle: 'Opieki jednemu z rodziców' },
                { icon: '🤝', title: 'Wspólna opieka', subtitle: 'Ustalenia' },
                { icon: '📅', title: 'Kontakty', subtitle: 'Harmonogram' },
                { icon: '🚫', title: 'Ograniczenie', subtitle: 'Władzy rodzicielskiej' }
            ],
            procedures: '📄 Wniosek • 👨‍👩‍👧 Wywiad kuratora • 👶 Wysłuchanie dziecka • ⚖️ Postanowienie'
        },
        
        'juvenile': { 
            icon: '⚖️', 
            name: 'Sprawy Nieletnich', 
            color: '#e67e22', 
            desc: 'Sąd dla nieletnich, czyny karalne',
            features: [
                { icon: '🚔', title: 'Czyny karalne', subtitle: 'Nieletnich' },
                { icon: '🏫', title: 'Demoralizacja', subtitle: 'Wagarowanie, używki' },
                { icon: '👨‍⚖️', title: 'Środki wychowawcze', subtitle: 'Nadzór, ostrzeżenie' },
                { icon: '🏛️', title: 'MOW/MOSSW', subtitle: 'Zakłady poprawcze' }
            ],
            procedures: '📋 Wniosek Policji/Szkoły • 👨‍👩‍👧 Wywiad • 👶 Wysłuchanie • ⚖️ Środki'
        },
        'NIE': { 
            icon: '⚖️', 
            name: 'Sprawy Nieletnich', 
            color: '#e67e22', 
            desc: 'Sąd dla nieletnich, czyny karalne',
            features: [
                { icon: '🚔', title: 'Czyny karalne', subtitle: 'Nieletnich' },
                { icon: '🏫', title: 'Demoralizacja', subtitle: 'Wagarowanie, używki' },
                { icon: '👨‍⚖️', title: 'Środki wychowawcze', subtitle: 'Nadzór, ostrzeżenie' },
                { icon: '🏛️', title: 'MOW/MOSSW', subtitle: 'Zakłady poprawcze' }
            ],
            procedures: '📋 Wniosek Policji/Szkoły • 👨‍👩‍👧 Wywiad • 👶 Wysłuchanie • ⚖️ Środki'
        }
    };
    
    // Sprawdź bezpośrednio
    if (mapping[caseType]) {
        return mapping[caseType];
    }
    
    // Sprawdź prefix w numerze
    if (typeof caseType === 'string' && caseType.includes('/')) {
        const prefix = caseType.split('/')[0];
        if (mapping[prefix]) {
            return mapping[prefix];
        }
    }
    
    return null;
};

// Funkcja sprawdzająca czy sprawa jest cywilna (umowy, majątkowa, spadkowa)
window.isCivilCase = function(caseType) {
    const civilTypes = [
        'contract', 'property', 'inheritance',
        // Umowy
        'contract_sale', 'contract_rent', 'contract_work', 'contract_loan',
        // Majątkowe
        'property_ownership', 'property_easement', 'property_prescription', 'property_claim',
        // Spadkowe
        'inheritance_will', 'inheritance_division', 'inheritance_statutory', 'inheritance_rejection'
    ];
    const civilPrefixes = [
        'UMO', 'MAJ', 'SPA',
        'SPR', 'NAJ', 'DZI', 'KRE',
        'WLA', 'SLU', 'ZAS', 'WIN',
        'TES', 'DZS', 'ZAC', 'ODR'
    ];
    
    if (!caseType) return false;
    
    // Sprawdź bezpośrednio typ
    if (civilTypes.includes(caseType)) {
        return true;
    }
    
    // Sprawdź prefix w numerze sprawy
    if (typeof caseType === 'string' && caseType.includes('/')) {
        const prefix = caseType.split('/')[0];
        return civilPrefixes.includes(prefix);
    }
    
    return false;
};

// Funkcja zwracająca szczegóły typu cywilnego
window.getCivilCaseDetails = function(caseType) {
    const mapping = {
        'contract': { 
            icon: '📜', 
            name: 'Sprawy Umowne', 
            color: '#34495e', 
            desc: 'Zawieranie, wykonanie, rozwiązanie umów',
            features: [
                { icon: '✍️', title: 'Przygotowanie', subtitle: 'Projekty umów' },
                { icon: '⚠️', title: 'Niewykonanie', subtitle: 'Roszczenia' },
                { icon: '❌', title: 'Unieważnienie', subtitle: 'Wadliwość' },
                { icon: '🔄', title: 'Rozwiązanie', subtitle: 'Odstąpienie' }
            ],
            procedures: '✍️ Umowa • ⚠️ Wezwanie • ⚖️ Pozew • 💰 Odszkodowanie'
        },
        'UMO': { 
            icon: '📜', 
            name: 'Sprawy Umowne', 
            color: '#34495e', 
            desc: 'Zawieranie, wykonanie, rozwiązanie umów',
            features: [
                { icon: '✍️', title: 'Przygotowanie', subtitle: 'Projekty umów' },
                { icon: '⚠️', title: 'Niewykonanie', subtitle: 'Roszczenia' },
                { icon: '❌', title: 'Unieważnienie', subtitle: 'Wadliwość' },
                { icon: '🔄', title: 'Rozwiązanie', subtitle: 'Odstąpienie' }
            ],
            procedures: '✍️ Umowa • ⚠️ Wezwanie • ⚖️ Pozew • 💰 Odszkodowanie'
        },
        
        'property': { 
            icon: '🏠', 
            name: 'Sprawy Majątkowe', 
            color: '#16a085', 
            desc: 'Własność, służebności, roszczenia rzeczowe',
            features: [
                { icon: '📋', title: 'Własność', subtitle: 'Nabycie/utrata' },
                { icon: '🚪', title: 'Służebności', subtitle: 'Przejazdu, przechodu' },
                { icon: '⚖️', title: 'Roszczenia', subtitle: 'Windykacyjne' },
                { icon: '🔨', title: 'Zasiedzenie', subtitle: 'Nieruchomości' }
            ],
            procedures: '📄 Wniosek/Pozew • 📋 KW • ⚖️ Rozprawa • 🏠 Własność'
        },
        'MAJ': { 
            icon: '🏠', 
            name: 'Sprawy Majątkowe', 
            color: '#16a085', 
            desc: 'Własność, służebności, roszczenia rzeczowe',
            features: [
                { icon: '📋', title: 'Własność', subtitle: 'Nabycie/utrata' },
                { icon: '🚪', title: 'Służebności', subtitle: 'Przejazdu, przechodu' },
                { icon: '⚖️', title: 'Roszczenia', subtitle: 'Windykacyjne' },
                { icon: '🔨', title: 'Zasiedzenie', subtitle: 'Nieruchomości' }
            ],
            procedures: '📄 Wniosek/Pozew • 📋 KW • ⚖️ Rozprawa • 🏠 Własność'
        },
        
        'inheritance': { 
            icon: '⚰️', 
            name: 'Sprawy Spadkowe', 
            color: '#8e44ad', 
            desc: 'Spadki, testamenty, dziedziczenie',
            features: [
                { icon: '📜', title: 'Testament', subtitle: 'Sporządzenie/zaskarżenie' },
                { icon: '👥', title: 'Spadkobiercy', subtitle: 'Ustalenie kręgu' },
                { icon: '💰', title: 'Dział spadku', subtitle: 'Podział majątku' },
                { icon: '❌', title: 'Odrzucenie', subtitle: 'Zrzeczenie się' }
            ],
            procedures: '⚰️ Zgon • 📋 Akt poświadczenia • 👥 Spadkobiercy • 💰 Dział'
        },
        'SPA': { 
            icon: '⚰️', 
            name: 'Sprawy Spadkowe', 
            color: '#8e44ad', 
            desc: 'Spadki, testamenty, dziedziczenie',
            features: [
                { icon: '📜', title: 'Testament', subtitle: 'Sporządzenie/zaskarżenie' },
                { icon: '👥', title: 'Spadkobiercy', subtitle: 'Ustalenie kręgu' },
                { icon: '💰', title: 'Dział spadku', subtitle: 'Podział majątku' },
                { icon: '❌', title: 'Odrzucenie', subtitle: 'Zrzeczenie się' }
            ],
            procedures: '⚰️ Zgon • 📋 Akt poświadczenia • 👥 Spadkobiercy • 💰 Dział'
        },
        
        // === ROZBUDOWANE UMOWY ===
        'contract_sale': {
            icon: '🏪',
            name: 'Umowy Sprzedaży',
            color: '#2c3e50',
            desc: 'Sprzedaż rzeczy ruchomych i nieruchomości',
            features: [
                { icon: '📋', title: 'Umowa', subtitle: 'Sprzedaży' },
                { icon: '⚠️', title: 'Wady', subtitle: 'Rzeczy/rękojmia' },
                { icon: '🔄', title: 'Zwrot', subtitle: 'Odstąpienie' },
                { icon: '💰', title: 'Cena', subtitle: 'Zapłata/zwrot' }
            ],
            procedures: '✍️ Umowa • ⚠️ Reklamacja • 🔄 Odstąpienie • 💰 Zwrot'
        },
        'SPR': {
            icon: '🏪',
            name: 'Umowy Sprzedaży',
            color: '#2c3e50',
            desc: 'Sprzedaż rzeczy ruchomych i nieruchomości',
            features: [
                { icon: '📋', title: 'Umowa', subtitle: 'Sprzedaży' },
                { icon: '⚠️', title: 'Wady', subtitle: 'Rzeczy/rękojmia' },
                { icon: '🔄', title: 'Zwrot', subtitle: 'Odstąpienie' },
                { icon: '💰', title: 'Cena', subtitle: 'Zapłata/zwrot' }
            ],
            procedures: '✍️ Umowa • ⚠️ Reklamacja • 🔄 Odstąpienie • 💰 Zwrot'
        },
        
        'contract_rent': {
            icon: '🏠',
            name: 'Umowy Najmu',
            color: '#e67e22',
            desc: 'Najem lokali, wynajem rzeczy',
            features: [
                { icon: '🔑', title: 'Umowa najmu', subtitle: 'Lokal/rzecz' },
                { icon: '💵', title: 'Czynsz', subtitle: 'Zaległości' },
                { icon: '🚪', title: 'Eksmisja', subtitle: 'Opróżnienie' },
                { icon: '🛠️', title: 'Naprawy', subtitle: 'Kto płaci?' }
            ],
            procedures: '✍️ Umowa • ⚠️ Wezwanie • ⚖️ Eksmisja • 🚪 Opróżnienie'
        },
        'NAJ': {
            icon: '🏠',
            name: 'Umowy Najmu',
            color: '#e67e22',
            desc: 'Najem lokali, wynajem rzeczy',
            features: [
                { icon: '🔑', title: 'Umowa najmu', subtitle: 'Lokal/rzecz' },
                { icon: '💵', title: 'Czynsz', subtitle: 'Zaległości' },
                { icon: '🚪', title: 'Eksmisja', subtitle: 'Opróżnienie' },
                { icon: '🛠️', title: 'Naprawy', subtitle: 'Kto płaci?' }
            ],
            procedures: '✍️ Umowa • ⚠️ Wezwanie • ⚖️ Eksmisja • 🚪 Opróżnienie'
        },
        
        'contract_work': {
            icon: '🔨',
            name: 'Umowy o Dzieło/Zlecenie',
            color: '#16a085',
            desc: 'Dzieło, zlecenie, świadczenie usług',
            features: [
                { icon: '📝', title: 'Umowa', subtitle: 'Dzieło/zlecenie' },
                { icon: '⚠️', title: 'Wady', subtitle: 'Niewykonanie' },
                { icon: '💰', title: 'Wynagrodzenie', subtitle: 'Zapłata' },
                { icon: '⏰', title: 'Termin', subtitle: 'Opóźnienie' }
            ],
            procedures: '✍️ Umowa • 🔨 Realizacja • ✅ Odbiór • 💰 Zapłata'
        },
        'DZI': {
            icon: '🔨',
            name: 'Umowy o Dzieło/Zlecenie',
            color: '#16a085',
            desc: 'Dzieło, zlecenie, świadczenie usług',
            features: [
                { icon: '📝', title: 'Umowa', subtitle: 'Dzieło/zlecenie' },
                { icon: '⚠️', title: 'Wady', subtitle: 'Niewykonanie' },
                { icon: '💰', title: 'Wynagrodzenie', subtitle: 'Zapłata' },
                { icon: '⏰', title: 'Termin', subtitle: 'Opóźnienie' }
            ],
            procedures: '✍️ Umowa • 🔨 Realizacja • ✅ Odbiór • 💰 Zapłata'
        },
        
        'contract_loan': {
            icon: '💳',
            name: 'Umowy Kredytowe/Pożyczki',
            color: '#c0392b',
            desc: 'Kredyty, pożyczki, umowy bankowe',
            features: [
                { icon: '📋', title: 'Umowa', subtitle: 'Kredyt/pożyczka' },
                { icon: '💰', title: 'Raty', subtitle: 'Spłata/zaległości' },
                { icon: '⚠️', title: 'Abuzywne', subtitle: 'Klauzule' },
                { icon: '❌', title: 'Unieważnienie', subtitle: 'Umowy' }
            ],
            procedures: '✍️ Umowa • 💳 Kredyt • ⚠️ Abuzywność • ❌ Unieważnienie'
        },
        'KRE': {
            icon: '💳',
            name: 'Umowy Kredytowe/Pożyczki',
            color: '#c0392b',
            desc: 'Kredyty, pożyczki, umowy bankowe',
            features: [
                { icon: '📋', title: 'Umowa', subtitle: 'Kredyt/pożyczka' },
                { icon: '💰', title: 'Raty', subtitle: 'Spłata/zaległości' },
                { icon: '⚠️', title: 'Abuzywne', subtitle: 'Klauzule' },
                { icon: '❌', title: 'Unieważnienie', subtitle: 'Umowy' }
            ],
            procedures: '✍️ Umowa • 💳 Kredyt • ⚠️ Abuzywność • ❌ Unieważnienie'
        },
        
        // === ROZBUDOWANE MAJĄTKOWE ===
        'property_ownership': {
            icon: '🏡',
            name: 'Własność Nieruchomości',
            color: '#27ae60',
            desc: 'Nabycie, utrata, ustalenie własności',
            features: [
                { icon: '📋', title: 'KW', subtitle: 'Księga wieczysta' },
                { icon: '⚖️', title: 'Roszczenie', subtitle: 'Windykacyjne' },
                { icon: '🔓', title: 'Uwłaszczenie', subtitle: 'Nabycie' },
                { icon: '📜', title: 'Akt notarialny', subtitle: 'Przejście własności' }
            ],
            procedures: '📋 KW • 📜 Akt • ⚖️ Sąd wieczystoksięgowy • 🏡 Własność'
        },
        'WLA': {
            icon: '🏡',
            name: 'Własność Nieruchomości',
            color: '#27ae60',
            desc: 'Nabycie, utrata, ustalenie własności',
            features: [
                { icon: '📋', title: 'KW', subtitle: 'Księga wieczysta' },
                { icon: '⚖️', title: 'Roszczenie', subtitle: 'Windykacyjne' },
                { icon: '🔓', title: 'Uwłaszczenie', subtitle: 'Nabycie' },
                { icon: '📜', title: 'Akt notarialny', subtitle: 'Przejście własności' }
            ],
            procedures: '📋 KW • 📜 Akt • ⚖️ Sąd wieczystoksięgowy • 🏡 Własność'
        },
        
        'property_easement': {
            icon: '🚪',
            name: 'Służebności',
            color: '#3498db',
            desc: 'Przejazd, przechód, służebność osobista',
            features: [
                { icon: '🚶', title: 'Przechód', subtitle: 'Służebność drogi' },
                { icon: '🚗', title: 'Przejazd', subtitle: 'Dojazd' },
                { icon: '⚡', title: 'Przesył', subtitle: 'Energii/mediów' },
                { icon: '🏠', title: 'Osobista', subtitle: 'Mieszkania' }
            ],
            procedures: '📋 Wniosek • ⚖️ Sąd • 🚪 Ustanowienie • 📜 Wpis do KW'
        },
        'SLU': {
            icon: '🚪',
            name: 'Służebności',
            color: '#3498db',
            desc: 'Przejazd, przechód, służebność osobista',
            features: [
                { icon: '🚶', title: 'Przechód', subtitle: 'Służebność drogi' },
                { icon: '🚗', title: 'Przejazd', subtitle: 'Dojazd' },
                { icon: '⚡', title: 'Przesył', subtitle: 'Energii/mediów' },
                { icon: '🏠', title: 'Osobista', subtitle: 'Mieszkania' }
            ],
            procedures: '📋 Wniosek • ⚖️ Sąd • 🚪 Ustanowienie • 📜 Wpis do KW'
        },
        
        'property_prescription': {
            icon: '🔨',
            name: 'Zasiedzenie',
            color: '#f39c12',
            desc: 'Nabycie własności przez zasiedzenie',
            features: [
                { icon: '⏰', title: 'Termin', subtitle: '20/30 lat' },
                { icon: '🏠', title: 'Posiadanie', subtitle: 'Samoistne' },
                { icon: '✅', title: 'Dobra wiara', subtitle: 'Skrócony termin' },
                { icon: '📋', title: 'Ustalenie', subtitle: 'Nabycia własności' }
            ],
            procedures: '📋 Wniosek • ⏰ Termin • ⚖️ Postępowanie • 🔨 Zasiedzenie'
        },
        'ZAS': {
            icon: '🔨',
            name: 'Zasiedzenie',
            color: '#f39c12',
            desc: 'Nabycie własności przez zasiedzenie',
            features: [
                { icon: '⏰', title: 'Termin', subtitle: '20/30 lat' },
                { icon: '🏠', title: 'Posiadanie', subtitle: 'Samoistne' },
                { icon: '✅', title: 'Dobra wiara', subtitle: 'Skrócony termin' },
                { icon: '📋', title: 'Ustalenie', subtitle: 'Nabycia własności' }
            ],
            procedures: '📋 Wniosek • ⏰ Termin • ⚖️ Postępowanie • 🔨 Zasiedzenie'
        },
        
        'property_claim': {
            icon: '⚖️',
            name: 'Roszczenia Windykacyjne',
            color: '#9b59b6',
            desc: 'Wydanie rzeczy, ochrona własności',
            features: [
                { icon: '🏠', title: 'Wydanie', subtitle: 'Nieruchomości' },
                { icon: '🚫', title: 'Zaniechanie', subtitle: 'Naruszeń' },
                { icon: '💰', title: 'Odszkodowanie', subtitle: 'Za bezumowne' },
                { icon: '⚖️', title: 'Negatoryjne', subtitle: 'Ochrona własności' }
            ],
            procedures: '⚠️ Wezwanie • ⚖️ Pozew • 🏠 Wydanie • 💰 Odszkodowanie'
        },
        'WIN': {
            icon: '⚖️',
            name: 'Roszczenia Windykacyjne',
            color: '#9b59b6',
            desc: 'Wydanie rzeczy, ochrona własności',
            features: [
                { icon: '🏠', title: 'Wydanie', subtitle: 'Nieruchomości' },
                { icon: '🚫', title: 'Zaniechanie', subtitle: 'Naruszeń' },
                { icon: '💰', title: 'Odszkodowanie', subtitle: 'Za bezumowne' },
                { icon: '⚖️', title: 'Negatoryjne', subtitle: 'Ochrona własności' }
            ],
            procedures: '⚠️ Wezwanie • ⚖️ Pozew • 🏠 Wydanie • 💰 Odszkodowanie'
        },
        
        // === ROZBUDOWANE SPADKOWE ===
        'inheritance_will': {
            icon: '📜',
            name: 'Testament',
            color: '#8e44ad',
            desc: 'Sporządzenie, zaskarżenie testamentu',
            features: [
                { icon: '✍️', title: 'Sporządzenie', subtitle: 'Testamentu' },
                { icon: '❌', title: 'Zaskarżenie', subtitle: 'Nieważność' },
                { icon: '⚖️', title: 'Wykładnia', subtitle: 'Woli spadkodawcy' },
                { icon: '📋', title: 'Wykonanie', subtitle: 'Zapisów' }
            ],
            procedures: '✍️ Testament • ⚰️ Zgon • 📋 Wykonanie • ❌ Zaskarżenie'
        },
        'TES': {
            icon: '📜',
            name: 'Testament',
            color: '#8e44ad',
            desc: 'Sporządzenie, zaskarżenie testamentu',
            features: [
                { icon: '✍️', title: 'Sporządzenie', subtitle: 'Testamentu' },
                { icon: '❌', title: 'Zaskarżenie', subtitle: 'Nieważność' },
                { icon: '⚖️', title: 'Wykładnia', subtitle: 'Woli spadkodawcy' },
                { icon: '📋', title: 'Wykonanie', subtitle: 'Zapisów' }
            ],
            procedures: '✍️ Testament • ⚰️ Zgon • 📋 Wykonanie • ❌ Zaskarżenie'
        },
        
        'inheritance_division': {
            icon: '💰',
            name: 'Dział Spadku',
            color: '#e67e22',
            desc: 'Podział majątku spadkowego',
            features: [
                { icon: '📋', title: 'Spis inwentarza', subtitle: 'Majątek' },
                { icon: '👥', title: 'Spadkobiercy', subtitle: 'Udziały' },
                { icon: '💰', title: 'Podział', subtitle: 'Fizyczny/wartość' },
                { icon: '🏠', title: 'Nieruchomości', subtitle: 'Spłaty/przyznanie' }
            ],
            procedures: '📋 Inwentarz • 👥 Udziały • 💰 Podział • ⚖️ Zatwierdzenie'
        },
        'DZS': {
            icon: '💰',
            name: 'Dział Spadku',
            color: '#e67e22',
            desc: 'Podział majątku spadkowego',
            features: [
                { icon: '📋', title: 'Spis inwentarza', subtitle: 'Majątek' },
                { icon: '👥', title: 'Spadkobiercy', subtitle: 'Udziały' },
                { icon: '💰', title: 'Podział', subtitle: 'Fizyczny/wartość' },
                { icon: '🏠', title: 'Nieruchomości', subtitle: 'Spłaty/przyznanie' }
            ],
            procedures: '📋 Inwentarz • 👥 Udziały • 💰 Podział • ⚖️ Zatwierdzenie'
        },
        
        'inheritance_statutory': {
            icon: '⚖️',
            name: 'Zachowek',
            color: '#c0392b',
            desc: 'Roszczenia o zachowek',
            features: [
                { icon: '👥', title: 'Uprawnieni', subtitle: 'Krąg' },
                { icon: '💰', title: 'Wysokość', subtitle: 'Wyliczenie' },
                { icon: '📊', title: 'Darowizny', subtitle: 'Uwzględnienie' },
                { icon: '⚖️', title: 'Roszczenie', subtitle: 'Pozew o zachowek' }
            ],
            procedures: '👥 Uprawnieni • 📊 Wyliczenie • ⚖️ Pozew • 💰 Zapłata'
        },
        'ZAC': {
            icon: '⚖️',
            name: 'Zachowek',
            color: '#c0392b',
            desc: 'Roszczenia o zachowek',
            features: [
                { icon: '👥', title: 'Uprawnieni', subtitle: 'Krąg' },
                { icon: '💰', title: 'Wysokość', subtitle: 'Wyliczenie' },
                { icon: '📊', title: 'Darowizny', subtitle: 'Uwzględnienie' },
                { icon: '⚖️', title: 'Roszczenie', subtitle: 'Pozew o zachowek' }
            ],
            procedures: '👥 Uprawnieni • 📊 Wyliczenie • ⚖️ Pozew • 💰 Zapłata'
        },
        
        'inheritance_rejection': {
            icon: '❌',
            name: 'Odrzucenie Spadku',
            color: '#7f8c8d',
            desc: 'Zrzeczenie się, odrzucenie spadku',
            features: [
                { icon: '⏰', title: 'Termin', subtitle: '6 miesięcy' },
                { icon: '❌', title: 'Odrzucenie', subtitle: 'Proste/bezwzględne' },
                { icon: '📋', title: 'Oświadczenie', subtitle: 'Sąd/notariusz' },
                { icon: '💸', title: 'Długi', subtitle: 'Uniknięcie' }
            ],
            procedures: '⏰ Termin • ❌ Odrzucenie • 📋 Oświadczenie • ✅ Skutek'
        },
        'ODR': {
            icon: '❌',
            name: 'Odrzucenie Spadku',
            color: '#7f8c8d',
            desc: 'Zrzeczenie się, odrzucenie spadku',
            features: [
                { icon: '⏰', title: 'Termin', subtitle: '6 miesięcy' },
                { icon: '❌', title: 'Odrzucenie', subtitle: 'Proste/bezwzględne' },
                { icon: '📋', title: 'Oświadczenie', subtitle: 'Sąd/notariusz' },
                { icon: '💸', title: 'Długi', subtitle: 'Uniknięcie' }
            ],
            procedures: '⏰ Termin • ❌ Odrzucenie • 📋 Oświadczenie • ✅ Skutek'
        }
    };
    
    // Sprawdź bezpośrednio
    if (mapping[caseType]) {
        return mapping[caseType];
    }
    
    // Sprawdź prefix w numerze
    if (typeof caseType === 'string' && caseType.includes('/')) {
        const prefix = caseType.split('/')[0];
        if (mapping[prefix]) {
            return mapping[prefix];
        }
    }
    
    return null;
};

// Modal przypisywania sprawy - NOWA WERSJA 2001
window.showAssignCaseModalV2001 = async function(caseId) {
    console.log('%c🎯 NOWA WERSJA MODALA V2001 - PEŁNE OPCJE!', 'background: green; color: white; font-size: 20px; padding: 10px;');
    console.log('📞 Wywołano showAssignCaseModalV2001 dla sprawy:', caseId);
    
    // Pobierz prawników i opiekunów (ten sam endpoint co w formularzu nowej sprawy)
    let lawyers = [];
    let caseManagers = [];
    let clientManagers = [];
    
    try {
        const response = await window.api.request('/cases/staff/list');
        lawyers = response.lawyers || [];
        caseManagers = response.case_managers || [];
        clientManagers = response.client_managers || [];
        console.log('👥 Pobrano personel:', {
            lawyers: lawyers.length,
            caseManagers: caseManagers.length,
            clientManagers: clientManagers.length
        });
    } catch (error) {
        console.error('❌ Błąd pobierania personelu:', error);
        console.error('Error details:', error);
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || localStorage.getItem('user') || '{}');
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: rgba(0,0,0,0.7);
        z-index: 99999;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 30px; max-width: 550px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.3); max-height: 90vh; overflow-y: auto;">
            <h2 style="margin: 0 0 20px 0; color: #1a2332; font-size: 1.3rem;">✓ Przejmij sprawę</h2>
            
            <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 25px;">
                <!-- Prowadzący sprawę (Mecenas) -->
                <div>
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #1a2332; font-weight: 600;">
                        ⚖️ Mecenas prowadzący
                    </label>
                    <select id="assignCaseLawyer" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; color: #1a2332;">
                        <option value="${currentUser.id}" selected>${currentUser.name} (Ty)</option>
                        ${lawyers.filter(l => l.id !== currentUser.id).map(lawyer => `
                            <option value="${lawyer.id}">${lawyer.name}</option>
                        `).join('')}
                    </select>
                </div>
                
                <!-- JEDEN select opiekuna (tak jak w Nowej sprawie) -->
                <div>
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #1a2332; font-weight: 600;">
                        👤 Dodatkowy opiekun sprawy (opcjonalnie)
                    </label>
                    <select id="assignCaretaker" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; color: #1a2332;">
                        <option value="">-- Brak (opcjonalnie) --</option>
                        ${caseManagers.length > 0 ? `
                            <optgroup label="📋 Opiekunowie spraw" style="color: #1a2332;">
                                ${caseManagers.map(manager => `
                                    <option value="${manager.id}">${manager.name} (${manager.initials || manager.email})</option>
                                `).join('')}
                            </optgroup>
                        ` : ''}
                        ${clientManagers.length > 0 ? `
                            <optgroup label="👤 Opiekunowie klientów (opcjonalnie)" style="color: #1a2332;">
                                ${clientManagers.map(manager => `
                                    <option value="${manager.id}">${manager.name} (${manager.initials || manager.email})</option>
                                `).join('')}
                            </optgroup>
                        ` : ''}
                    </select>
                    <small style="color: #666; font-size: 0.85rem; margin-top: 5px; display: block;">💡 Opiekun klienta może być równocześnie opiekunem sprawy</small>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="this.closest('div').parentElement.parentElement.remove()" style="
                    flex: 1;
                    padding: 12px 20px;
                    background: #95a5a6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1rem;
                ">
                    Anuluj
                </button>
                <button onclick="window.assignCaseToMe(${caseId})" style="
                    flex: 2;
                    padding: 12px 20px;
                    background: linear-gradient(135deg, #27ae60, #2ecc71);
                    color: #1a2332;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1rem;
                    transition: all 0.3s;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(46,204,113,0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    ✓ Przejmij sprawę
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Zamknij przy kliknięciu w tło
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

// Funkcja przypisywania sprawy z wybranym opiekunem
window.assignCaseToMe = async function(caseId) {
    try {
        const assignedTo = document.getElementById('assignCaseLawyer')?.value;
        const caretaker = document.getElementById('assignCaretaker')?.value;
        
        if (!assignedTo) {
            alert('⚠️ Wybierz mecenasa prowadzącego!');
            return;
        }
        
        // NAJPIERW pobierz pełne dane sprawy
        console.log('📋 Pobieranie danych sprawy:', caseId);
        const caseResponse = await window.api.request(`/cases/${caseId}`);
        const caseData = caseResponse.case;
        
        if (!caseData) {
            alert('❌ Nie można pobrać danych sprawy!');
            return;
        }
        
        console.log('✅ Pobrano dane sprawy:', caseData);
        
        // Zaktualizuj tylko pola których potrzebujemy
        const updateData = {
            ...caseData,  // Wszystkie istniejące dane
            assigned_to: parseInt(assignedTo),  // NADPISZ mecenasa
            additional_caretaker: caretaker ? parseInt(caretaker) : caseData.additional_caretaker  // NADPISZ opiekuna jeśli wybrano
        };
        
        console.log('📤 Wysyłam aktualizację:', { assigned_to: updateData.assigned_to, additional_caretaker: updateData.additional_caretaker });
        
        await window.api.request(`/cases/${caseId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
        
        // Zamknij modal
        document.querySelectorAll('div').forEach(el => {
            if (el.style.zIndex === '99999') el.remove();
        });
        
        alert('✅ Przejęto sprawę!');
        
        // Odśwież widok sprawy
        if (window.crmManager && window.crmManager.viewCase) {
            window.crmManager.viewCase(caseId);
        }
    } catch (error) {
        alert('❌ Błąd: ' + error.message);
    }
};

// Funkcje pomocnicze dla nowego widoku szczegółów sprawy

// Przełączanie zakładek
window.crmManager = window.crmManager || {};

// Podgląd dokumentu w modalu (obsługuje różne source_type)
window.crmManager.viewDocument = async function(docId, caseId, sourceType) {
    console.log(`👁️ viewDocument: docId=${docId}, caseId=${caseId}, sourceType=${sourceType}`);
    
    try {
        const apiUrl = window.getApiBaseUrl ? window.getApiBaseUrl() : 'https://web-production-ef868.up.railway.app';
        const token = localStorage.getItem('token');
        
        let docUrl, docData;
        
        // Różne endpointy w zależności od typu dokumentu
        if (sourceType === 'witness_document') {
            // Dla dokumentów świadków - pobierz dane i użyj endpointu świadków
            const docsResponse = await window.api.request(`/cases/${window.crmManager.currentCaseId}/documents`);
            const docs = docsResponse.documents || [];
            docData = docs.find(d => d.id === docId && d.source_type === 'witness_document');
            
            if (!docData) {
                alert('❌ Dokument nie znaleziony');
                return;
            }
            
            // Wyciągnij witness_id z bazy lub użyj wzorca URL świadków
            // Dla uproszczenia - otwórz bezpośrednio przez case documents endpoint
            docUrl = `${apiUrl}/cases/${window.crmManager.currentCaseId}/documents/${docId}/download?view=true&token=${token}`;
            docData = { ...docData, file_name: docData.filename };
        } else if (sourceType === 'attachment') {
            docUrl = `${apiUrl}/attachments/${docId}/download?view=true&token=${token}`;
            const docsResponse = await window.api.request(`/cases/${caseId || window.crmManager.currentCaseId}/documents`);
            const docs = docsResponse.documents || [];
            docData = docs.find(d => d.id === docId);
        } else {
            // document
            docUrl = `${apiUrl}/cases/${caseId || window.crmManager.currentCaseId}/documents/${docId}/download?view=true&token=${token}`;
            const docsResponse = await window.api.request(`/cases/${caseId || window.crmManager.currentCaseId}/documents`);
            const docs = docsResponse.documents || [];
            docData = docs.find(d => d.id === docId);
        }
        
        if (!docData) {
            alert('❌ Nie można pobrać danych dokumentu');
            return;
        }
        
        // Stwórz modal z podglądem
        const modal = document.createElement('div');
        modal.id = 'docViewModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.95); z-index: 9999999; display: flex;
            flex-direction: column; align-items: center; justify-content: center;
        `;
        
        const fileExt = docData.filename.split('.').pop().toLowerCase();
        const isPDF = fileExt === 'pdf';
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt);
        const isTXT = fileExt === 'txt';
        const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(fileExt);
        const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(fileExt);
        
        let content = '';
        if (isPDF) {
            content = `<iframe src="${docUrl}" style="width: 90vw; height: 85vh; border: none; border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);"></iframe>`;
        } else if (isImage) {
            content = `<img src="${docUrl}" style="max-width: 90vw; max-height: 85vh; border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">`;
        } else if (isTXT) {
            // Pobierz treść TXT i wyświetl w pięknym boxie
            try {
                const txtResponse = await fetch(docUrl);
                const txtContent = await txtResponse.text();
                content = `<div style="
                    background: white;
                    border: 4px solid #9333ea;
                    border-radius: 16px;
                    padding: 30px;
                    max-width: 90vw;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 8px 32px rgba(147,51,234,0.3);
                ">
                    <div style="
                        background: linear-gradient(135deg, #9333ea, #7c3aed);
                        color: white;
                        padding: 15px 20px;
                        border-radius: 10px;
                        margin-bottom: 20px;
                        font-weight: 700;
                        font-size: 1.1rem;
                        text-align: center;
                        box-shadow: 0 4px 12px rgba(147,51,234,0.4);
                    ">
                        📄 ${docData.attachment_code || docData.document_number || docData.filename}
                    </div>
                    <pre style="
                        white-space: pre-wrap;
                        word-wrap: break-word;
                        font-family: 'Segoe UI', Arial, sans-serif;
                        font-size: 1rem;
                        line-height: 1.6;
                        color: #1a2332;
                        margin: 0;
                    ">${txtContent}</pre>
                </div>`;
            } catch (error) {
                console.error('❌ Błąd wczytywania TXT:', error);
                content = `<div style="background: white; padding: 40px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">⚠️</div>
                    <p style="color: #333; font-size: 1.1rem; margin-bottom: 20px;">Nie udało się wczytać pliku tekstowego</p>
<p style="color: #666; font-size: 0.9rem;">Użyj przycisku "Pobierz" w poprzednim ekranie</p>
                </div>`;
            }
        } else if (isVideo) {
            // Podgląd wideo
            content = `<div style="background: white; border-radius: 16px; padding: 20px; max-width: 90vw; max-height: 85vh; overflow: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
                <div style="text-align: center; margin-bottom: 15px;">
                    <span style="font-size: 2rem;">🎬</span>
                    <h3 style="margin: 10px 0; color: #1a2332;">Podgląd nagrania wideo</h3>
                </div>
                <video controls style="width: 100%; max-height: 70vh; border-radius: 8px; background: #000;">
                    <source src="${docUrl}" type="video/${fileExt}">
                    Twoja przeglądarka nie obsługuje odtwarzania wideo.
                </video>
            </div>`;
        } else if (isAudio) {
            // Podgląd audio
            content = `<div style="background: white; border-radius: 16px; padding: 40px; max-width: 600px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
                <div style="text-align: center; margin-bottom: 25px;">
                    <span style="font-size: 4rem;">🎵</span>
                    <h3 style="margin: 15px 0; color: #1a2332;">Podgląd nagrania audio</h3>
                </div>
                <audio controls style="width: 100%; margin-bottom: 20px;">
                    <source src="${docUrl}" type="audio/${fileExt}">
                    Twoja przeglądarka nie obsługuje odtwarzania audio.
                </audio>
            </div>`;
        } else {
            content = `<div style="background: white; padding: 40px; border-radius: 12px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 20px;">📄</div>
                <p style="color: #333; font-size: 1.1rem; margin-bottom: 20px;">Podgląd niedostępny dla tego typu pliku</p>
                <p style="color: #666; font-size: 0.9rem;">Użyj przycisku "Pobierz" w poprzednim ekranie</p>
            </div>`;
        }
        
        modal.innerHTML = `
            <div style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 12px 24px; border-radius: 12px; color: white; font-weight: 600; z-index: 1;">
                📋 ${docData.attachment_code || docData.document_number || docData.filename}
            </div>
            
            <button onclick="document.getElementById('docViewModal').remove()" style="
                position: absolute; top: 20px; right: 20px; z-index: 2;
                background: rgba(255,255,255,0.2); backdrop-filter: blur(10px);
                border: 2px solid white; color: white;
                width: 48px; height: 48px; border-radius: 50%;
                cursor: pointer; font-size: 1.8rem; font-weight: 700;
                transition: all 0.3s;
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">×</button>
            
            ${content}
        `;
        
        document.body.appendChild(modal);
        
        // Zamknij po kliknięciu w tło
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
    } catch (error) {
        console.error('❌ Błąd podglądu:', error);
        alert('❌ Błąd: ' + error.message);
    }
};

// Pobierz dokument (obsługuje różne source_type)
window.crmManager.downloadDocument = async function(docId, filename, sourceType, caseId) {
    console.log(`📥 downloadDocument: docId=${docId}, filename=${filename}, sourceType=${sourceType}, caseId=${caseId}`);
    
    try {
        const apiUrl = window.getApiBaseUrl ? window.getApiBaseUrl() : 'https://web-production-ef868.up.railway.app';
        const token = localStorage.getItem('token');
        
        let downloadUrl;
        
        if (sourceType === 'witness_document') {
            downloadUrl = `${apiUrl}/cases/${caseId || window.crmManager.currentCaseId}/documents/${docId}/download?token=${token}`;
        } else if (sourceType === 'attachment') {
            downloadUrl = `${apiUrl}/attachments/${docId}/download?token=${token}`;
        } else {
            downloadUrl = `${apiUrl}/cases/${caseId || window.crmManager.currentCaseId}/documents/${docId}/download?token=${token}`;
        }
        
        // Pobierz plik używając download attribute
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
    } catch (error) {
        console.error('❌ Błąd pobierania:', error);
        alert('❌ Błąd: ' + error.message);
    }
};

window.crmManager.switchCaseTab = function(caseId, tabName) {
    // Odznacz wszystkie zakładki
    document.querySelectorAll('.case-tab').forEach(tab => {
        tab.style.background = 'transparent';
        tab.style.borderBottom = 'none';
        tab.style.color = '#666';
    });
    
    // Zaznacz aktywną zakładkę
    const activeTab = document.getElementById(`caseTab_${tabName}`);
    if (activeTab) {
        activeTab.style.background = 'white';
        activeTab.style.borderBottom = '3px solid #667eea';
        activeTab.style.color = '#667eea';
    }
    
    // Załaduj zawartość zakładki
    const content = document.getElementById('caseTabContent');
    if (content) {
        content.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Ładowanie...</p>';
        
        // Pobierz zawartość asynchronicznie
        window.crmManager.loadCaseTabContent(caseId, tabName);
    }
    
    // Zapisz aktualną zakładkę i caseId do późniejszego odświeżania
    window.crmManager.currentCaseId = caseId;
    window.crmManager.currentTabName = tabName;
};

// 🔄 ODŚWIEŻANIE AKTUALNEJ ZAKŁADKI - wywołaj po każdej akcji!
window.crmManager.refreshCurrentTab = function() {
    const caseId = window.crmManager.currentCaseId;
    const tabName = window.crmManager.currentTabName;
    
    if (caseId && tabName) {
        console.log(`🔄 Odświeżam zakładkę: ${tabName} dla sprawy: ${caseId}`);
        window.crmManager.loadCaseTabContent(caseId, tabName);
        
        // Odśwież też zakładkę Historia jeśli istnieje
        if (tabName !== 'history') {
            // Zaktualizuj liczniki w zakładkach (np. dokumenty)
            window.crmManager.updateTabCounters(caseId);
        }
    } else {
        console.warn('⚠️ Brak aktywnej sprawy do odświeżenia');
    }
};

// Aktualizacja liczników w zakładkach
window.crmManager.updateTabCounters = async function(caseId) {
    try {
        // Pobierz liczbę dokumentów
        const docsResponse = await window.api.request(`/cases/${caseId}/documents`);
        const docsCount = (docsResponse.documents || []).length;
        const docsTab = document.getElementById('caseTab_documents');
        if (docsTab) {
            docsTab.innerHTML = `📎 Dokumenty (${docsCount})`;
        }
    } catch (error) {
        console.warn('⚠️ Błąd aktualizacji liczników:', error);
    }
};

// Ładowanie zawartości zakładki
window.crmManager.loadCaseTabContent = async function(caseId, tabName) {
    const content = document.getElementById('caseTabContent');
    
    try {
        switch(tabName) {
            case 'details':
                const caseResponse = await window.api.request(`/cases/${caseId}`);
                content.innerHTML = await window.crmManager.renderCaseDetailsTab(caseId);
                // Załaduj dashboard i hasło PO wstawieniu HTML
                setTimeout(async () => {
                    console.log('🔄 Rozpoczynam ładowanie dashboardu dla sprawy:', caseId);
                    try {
                        await window.loadQuickDashboard(caseId);
                        console.log('✅ Dashboard załadowany');
                        
                        // Wygeneruj i wyświetl hasło
                        const passwordEl = document.getElementById('currentCasePassword');
                        if (passwordEl && caseResponse.case) {
                            const password = window.generateTodayPassword(caseResponse.case.case_number);
                            passwordEl.textContent = password;
                            console.log('🔐 Hasło wygenerowane:', password);
                        }
                    } catch (error) {
                        console.error('❌ Błąd ładowania dashboardu:', error);
                    }
                }, 100);
                break;
            case 'documents':
                content.innerHTML = await window.crmManager.renderCaseDocumentsTab(caseId);
                break;
            case 'witnesses':
                // Moduł świadków
                if (window.renderWitnessesTab) {
                    content.innerHTML = await window.renderWitnessesTab(caseId);
                } else {
                    content.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Moduł świadków nie jest załadowany</p>';
                }
                break;
            case 'evidence':
                // Moduł dowodów
                if (window.renderEvidenceTab) {
                    content.innerHTML = await window.renderEvidenceTab(caseId);
                } else {
                    content.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Moduł dowodów nie jest załadowany</p>';
                }
                break;
            case 'scenarios':
                // Moduł scenariuszy
                if (window.renderScenariosTab) {
                    content.innerHTML = await window.renderScenariosTab(caseId);
                } else {
                    content.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Moduł scenariuszy nie jest załadowany</p>';
                }
                break;
            case 'opposing':
                // ⚔️ NOWY MODUŁ Z WYSZUKIWARKAMI API (opposing-party-module.js)
                if (window.renderOpposingPartyTab) {
                    content.innerHTML = await window.renderOpposingPartyTab(caseId);
                } else if (window.opposingAnalysisModule) {
                    // Fallback do starego modułu (jeśli nowy nie załadowany)
                    content.innerHTML = await window.opposingAnalysisModule.render(caseId);
                } else {
                    content.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">⏳ Moduł analizy strony przeciwnej ładuje się...</p>';
                }
                break;
            case 'events':
                // ZAKŁADKA WYDARZEŃ - z przyciskiem do rozbudowanego formularza
                const eventsHtml = `
                    <div style="padding: 20px;">
                        <!-- Przycisk dodawania -->
                        <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
                            <button onclick="window.showEnhancedEventForm(${caseId})" style="
                                padding: 15px 30px;
                                background: linear-gradient(135deg, #1a2332, #2c3e50);
                                color: white;
                                border: none;
                                border-radius: 10px;
                                cursor: pointer;
                                font-weight: 700;
                                font-size: 1.1rem;
                                box-shadow: 0 4px 15px rgba(102,126,234,0.4);
                                transition: all 0.3s;
                                display: inline-flex;
                                align-items: center;
                                gap: 10px;
                            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102,126,234,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(102,126,234,0.4)'">
                                <span style="font-size: 1.3rem;">📅</span>
                                <span>Dodaj nowe wydarzenie</span>
                            </button>
                        </div>
                        
                        <!-- Lista wydarzeń -->
                        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <h3 style="color: #1a2332; margin: 0 0 20px 0; font-size: 1.2rem;">📋 Lista wydarzeń</h3>
                            <div id="testEventsList" style="color: #333;"></div>
                        </div>
                    </div>
                `;
                content.innerHTML = eventsHtml;
                
                // Załaduj listę wydarzeń
                setTimeout(() => {
                    window.loadTestEvents(caseId);
                }, 100);
                break;
            case 'notes':
                // Moduł notatek
                if (window.renderNotesTab) {
                    content.innerHTML = await window.renderNotesTab(caseId);
                } else {
                    content.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Moduł notatek nie jest załadowany</p>';
                }
                break;
            case 'comments':
                content.innerHTML = await window.crmManager.renderCaseCommentsTab(caseId);
                break;
            case 'history':
                content.innerHTML = await window.crmManager.renderCaseHistoryTab(caseId);
                break;
            case 'tasks':
                // Moduł zadań
                if (window.tasksModule) {
                    content.innerHTML = '<div id="caseTasks"></div>';
                    setTimeout(() => {
                        window.tasksModule.showTasksList(caseId, 'caseTasks');
                    }, 100);
                } else {
                    content.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">⏳ Moduł zadań ładuje się...</p>';
                }
                break;
            case 'payments':
                // 💰 Moduł płatności
                console.log('PAYMENTS HANDLER: START dla sprawy', caseId);
                if (window.paymentsModule) {
                    content.innerHTML = '<div id="casePaymentsContent"></div>';
                    setTimeout(() => {
                        window.paymentsModule.renderPaymentsTab(caseId);
                    }, 100);
                } else {
                    content.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">⏳ Moduł płatności ładuje się...</p>';
                }
                break;
            case 'permissions':
                // 🔐 Moduł uprawnień
                console.log('PERMISSIONS HANDLER: START dla sprawy', caseId);
                console.log('PERMISSIONS HANDLER: window.casePermissionsModule =', window.casePermissionsModule);
                if (window.casePermissionsModule) {
                    console.log('PERMISSIONS HANDLER: Tworzę kontener');
                    content.innerHTML = '<div id="casePermissionsContent"></div>';
                    setTimeout(() => {
                        console.log('PERMISSIONS HANDLER: Wywołuję renderPermissionsTab');
                        window.casePermissionsModule.renderPermissionsTab(caseId);
                    }, 100);
                } else {
                    console.error('PERMISSIONS HANDLER: Moduł nie załadowany!');
                    content.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">⏳ Moduł uprawnień ładuje się...</p>';
                }
                break;
        }
    } catch (error) {
        console.error('❌ Błąd ładowania zakładki:', error);
        
        // Sprawdź czy to błąd dostępu (403) czy został anulowany
        if (error.cancelled) {
            content.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 80px; margin-bottom: 20px;">🚫</div>
                    <h3 style="color: #dc3545; margin: 0 0 15px 0; font-size: 24px;">Anulowano</h3>
                    <p style="color: #666; margin: 0; font-size: 16px;">Odmówiono dostępu do sprawy</p>
                </div>
            `;
        } else if (error.message && error.message.includes('Brak dostępu')) {
            content.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 80px; margin-bottom: 20px;">🔒</div>
                    <h3 style="color: #dc3545; margin: 0 0 15px 0; font-size: 24px;">Brak dostępu</h3>
                    <p style="color: #666; margin: 0 0 20px 0; font-size: 16px;">Nie masz uprawnień do przeglądania szczegółów tej sprawy</p>
                    <p style="color: #999; margin: 0; font-size: 14px;">Skontaktuj się z prowadzącym sprawę lub użyj hasła dostępu</p>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 80px; margin-bottom: 20px;">⚠️</div>
                    <h3 style="color: #dc3545; margin: 0 0 15px 0; font-size: 24px;">Błąd ładowania danych</h3>
                    <p style="color: #666; margin: 0; font-size: 16px;">${error.message || 'Wystąpił nieoczekiwany błąd'}</p>
                </div>
            `;
        }
    }
};

// Generuje UNIKALNE hasło dostępu dla sprawy
// Używa numeru sprawy jako seed do wygenerowania stałego hasła (3 litery + 3 cyfry)
// To hasło NIE ZMIENIA SIĘ i jest unikalne dla każdej sprawy
window.generateTodayPassword = function(caseNumber) {
    console.log('🔐 FRONTEND: Generowanie hasła dla numeru sprawy:', caseNumber);
    
    // Użyj numeru sprawy jako seed
    const cleanNumber = caseNumber.replace(/[^0-9]/g, '');
    let seed = 0;
    
    // Dodaj wartość ASCII każdego znaku z pełnego numeru sprawy
    for (let i = 0; i < caseNumber.length; i++) {
        seed += caseNumber.charCodeAt(i) * (i + 1);
    }
    
    console.log('  📊 Seed po ASCII:', seed);
    
    // Dodaj wartość numeryczną
    seed += parseInt(cleanNumber || '1', 10) * 1337;
    
    console.log('  📊 Seed końcowy:', seed);
    
    // Generuj 3 litery (A-Z) używając seed
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lettersPart = '';
    let hash1 = seed;
    for (let i = 0; i < 3; i++) {
        hash1 = (hash1 * 1103515245 + 12345) & 0x7fffffff;
        lettersPart += letters[hash1 % 26];
    }
    
    // Generuj 3 cyfry (0-9) używając seed
    let digitsPart = '';
    let hash2 = seed * 7919;
    for (let i = 0; i < 3; i++) {
        hash2 = (hash2 * 1103515245 + 12345) & 0x7fffffff;
        digitsPart += (hash2 % 10).toString();
    }
    
    const password = `${lettersPart}-${digitsPart}`;
    console.log('  ✅ FRONTEND: Wygenerowane hasło:', password);
    
    return password;
};

// Funkcja pomocnicza do renderowania opisu sprawy z przyciskiem "Czytaj dalej"
function renderCaseDescription(description, caseId) {
    if (!description || description.trim() === '') {
        return `
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; color: #1a2332;">📝 Opis sprawy</h3>
                <div style="line-height: 1.8; color: #999; word-wrap: break-word; font-style: italic;">Brak opisu sprawy</div>
            </div>
        `;
    }
    
    // Sprawdź czy opis zawiera HTML (został edytowany w Rich Text Editor)
    const hasHtml = /<[^>]+>/.test(description);
    
    // Jeśli zawiera HTML - użyj go bezpośrednio, inaczej escape i dodaj formatowanie
    const formattedDesc = hasHtml ? description : window.crmManager.escapeHtml(description).replace(/\n/g, '<br>');
    
    // Policz "wizualne linie" - dla HTML liczymy przybliżone linie na podstawie długości tekstu
    // Dla zwykłego tekstu liczymy <br>
    let lineCount;
    if (hasHtml) {
        // Policz tekst bez HTML tagów
        const textOnly = formattedDesc.replace(/<[^>]+>/g, '');
        // Średnio ~80 znaków = 1 linia
        lineCount = Math.ceil(textOnly.length / 80);
    } else {
        lineCount = formattedDesc.split('<br>').length;
    }
    
    if (lineCount <= 5) {
        // 5 linii lub mniej - pokaż wszystko bez przycisku
        return `
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; color: #1a2332;">📝 Opis sprawy</h3>
                <div style="line-height: 1.8; color: #1a2332; word-wrap: break-word;">${formattedDesc}</div>
            </div>
        `;
    } else {
        // Więcej niż 5 linii - pokaż z przyciskiem "Czytaj dalej"
        const uniqueId = 'desc_' + caseId + '_' + Date.now();
        
        return `
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; color: #1a2332;">📝 Opis sprawy</h3>
                <div style="line-height: 1.8; color: #1a2332; word-wrap: break-word;">
                    <div id="content_${uniqueId}" style="max-height: 140px; overflow: hidden; position: relative;">
                        ${formattedDesc}
                        <div id="fade_${uniqueId}" style="position: absolute; bottom: 0; left: 0; right: 0; height: 40px; background: linear-gradient(to bottom, transparent, #f9f9f9);"></div>
                    </div>
                    <button id="toggle_${uniqueId}" onclick="
                        const content = document.getElementById('content_${uniqueId}');
                        const fade = document.getElementById('fade_${uniqueId}');
                        const btn = document.getElementById('toggle_${uniqueId}');
                        if (content.style.maxHeight === '140px') {
                            content.style.maxHeight = 'none';
                            content.style.overflow = 'visible';
                            if (fade) fade.style.display = 'none';
                            btn.textContent = '▲ Zwiń';
                        } else {
                            content.style.maxHeight = '140px';
                            content.style.overflow = 'hidden';
                            if (fade) fade.style.display = 'block';
                            btn.textContent = '▼ Czytaj dalej';
                        }
                    " style="
                        margin-top: 15px;
                        padding: 10px 20px;
                        background: linear-gradient(135deg, #3498db, #2980b9);
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 0.95rem;
                        transition: all 0.3s;
                        box-shadow: 0 2px 8px rgba(52,152,219,0.3);
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(52,152,219,0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(52,152,219,0.3)'">▼ Czytaj dalej</button>
                </div>
            </div>
        `;
    }
}

// Renderowanie zakładki Szczegóły
window.crmManager.renderCaseDetailsTab = async function(caseId) {
    console.log('%c✅ V2023 - GAP 48PX! ✅', 'background: orange; color: white; font-size: 18px; font-weight: bold; padding: 5px;');
    console.log('📋 Renderowanie szczegółów sprawy ID:', caseId);
    
    const response = await window.api.request(`/cases/${caseId}`);
    const caseData = response.case;
    
    const statusMap = {
        'open': { label: 'Otwarta', color: '#28a745' },
        'in_progress': { label: 'W toku', color: '#ffc107' },
        'closed': { label: 'Zamknięta', color: '#dc3545' }
    };
    const currentStatus = statusMap[caseData.status] || statusMap['open'];
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || localStorage.getItem('user') || '{}');
    const isLawyer = currentUser.role !== 'client';
    
    return `
        <div style="display: flex; flex-direction: column; gap: 20px;">
            
            ${!caseData.assigned_to && isLawyer ? `
                <div style="background: linear-gradient(135deg, #FFD700, #f9f9f9); padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; border: 2px solid #FFD700;">
                    <h3 style="margin: 0 0 10px 0; color: #1a2332; font-size: 1.3rem;">🎯 Sprawa oczekuje na przypisanie</h3>
                    <p style="color: #2c3e50; margin-bottom: 20px;">Kliknij przycisk aby przejąć sprawę i przypisać zespół</p>
                    <button onclick="window.showAssignCaseModalV2001(${caseId})" style="padding: 15px 40px !important; background: linear-gradient(135deg, #FFD700, #d4af37) !important; color: #1a2332 !important; border: none !important; border-radius: 10px !important; font-weight: 700 !important; font-size: 1.1rem !important; cursor: pointer !important; box-shadow: 0 4px 15px rgba(255,215,0,0.3) !important; transition: all 0.3s !important;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 20px rgba(255,215,0,0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px rgba(255,215,0,0.3)'">
                        ✓ Przejmij sprawę
                    </button>
                </div>
            ` : ''}
            
            ${caseData.assigned_to || caseData.client_caretaker_name || caseData.additional_caretaker_name ? `
                <div style="background: #f9f9f9; padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(26,35,50,0.4); border: 2px solid #FFD700;">
                    <h3 style="margin: 0 0 20px 0; color: #1a2332; font-size: 1.2rem;">👤 Osoby przypisane</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                        ${caseData.assigned_to_name ? `
                            <div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                <div style="color: #666; font-size: 0.85rem; margin-bottom: 5px; font-weight: 600;">👨‍⚖️ Mecenas prowadzący</div>
                                <div style="font-weight: 700; font-size: 1.1rem; color: #1a2332;">${caseData.assigned_to_name}</div>
                            </div>
                        ` : ''}
                        ${caseData.client_caretaker_name ? `
                            <div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                <div style="color: #666; font-size: 0.85rem; margin-bottom: 5px; font-weight: 600;">👤 Opiekun klienta</div>
                                <div style="font-weight: 700; font-size: 1.1rem; color: #1a2332;">${caseData.client_caretaker_name}</div>
                            </div>
                        ` : ''}
                        ${caseData.additional_caretaker_name ? `
                            <div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                <div style="color: #666; font-size: 0.85rem; margin-bottom: 5px; font-weight: 600;">📋 Opiekun sprawy</div>
                                <div style="font-weight: 700; font-size: 1.1rem; color: #1a2332;">${caseData.additional_caretaker_name}</div>
                            </div>
                        ` : ''}
                    </div>
                    ${caseData.assigned_to && (parseInt(currentUser.id) === parseInt(caseData.assigned_to) || currentUser.role === 'admin') ? `
                        <div style="margin-top: 20px; text-align: center; padding-top: 15px;">
                            <button onclick="window.crmManager.releaseCase(${caseId})" style="
                                padding: 12px 30px;
                                background: linear-gradient(135deg, #d4af37, #FFD700);
                                color: #1a2332;
                                border: none;
                                border-radius: 10px;
                                font-weight: 700;
                                font-size: 1rem;
                                cursor: pointer;
                                box-shadow: 0 4px 15px rgba(255,107,107,0.4);
                                transition: all 0.3s;
                            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(255,107,107,0.6)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(255,107,107,0.4)'">
                                🔄 Oddaj sprawę
                            </button>
                            <p style="color: #666; margin-top: 10px; font-size: 0.85rem;">Sprawa wróci do puli dostępnych spraw</p>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
            
            <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 30px; border-radius: 16px; border: 2px solid #FFD700; box-shadow: 0 8px 32px rgba(26,35,50,0.15);">
                <h3 style="margin: 0 0 30px 0; color: #000000 !important; font-size: 1.3rem !important; font-weight: 700 !important;">📋 Podstawowe informacje</h3>
                
                <!-- GÓRNY RZĄD: 3 boxy -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin-bottom: 25px; align-items: stretch;">
                    <div style="background: white !important; padding: 22px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); border: 2px solid #FFD700; transition: all 0.3s ease; cursor: default; display: flex; flex-direction: column; height: 100%;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.18)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.12)'">
                        <div style="color: #333333 !important; font-size: 0.9rem !important; margin-bottom: 10px; font-weight: 700 !important; text-transform: uppercase; letter-spacing: 0.5px;">Numer sprawy</div>
                        <div style="font-weight: 700 !important; font-size: 1.3rem !important; color: #000000 !important; flex: 1; display: flex; align-items: center;">${window.crmManager.escapeHtml(caseData.case_number)}</div>
                    </div>
                    <div style="background: white !important; padding: 22px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); border: 2px solid #FFD700; transition: all 0.3s ease; cursor: default; display: flex; flex-direction: column; height: 100%;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.18)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.12)'">
                        <div style="color: #333333 !important; font-size: 0.9rem !important; margin-bottom: 10px; font-weight: 700 !important; text-transform: uppercase; letter-spacing: 0.5px;">Typ sprawy</div>
                        <div style="font-weight: 700 !important; font-size: 1.3rem !important; color: #000000 !important; flex: 1; display: flex; align-items: center;">${window.crmManager.escapeHtml(window.translateCaseType(caseData.case_type))}</div>
                    </div>
                    <div style="background: white !important; padding: 22px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); border: 2px solid #FFD700; transition: all 0.3s ease; cursor: default; display: flex; flex-direction: column; height: 100%;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.18)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.12)'">
                        <div style="color: #333333 !important; font-size: 0.9rem !important; margin-bottom: 10px; font-weight: 700 !important; text-transform: uppercase; letter-spacing: 0.5px;">Status</div>
                        <div style="font-weight: 700 !important; font-size: 1.3rem !important; color: ${currentStatus.color} !important; flex: 1; display: flex; align-items: center;">${currentStatus.label}</div>
                    </div>
                </div>
                
                <!-- DOLNY RZĄD: Priorytet i Tytuł obok siebie -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; align-items: stretch;">
                    <div style="background: white !important; padding: 22px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); border: 2px solid ${caseData.priority === 'high' ? '#ff4444' : '#FFD700'}; transition: all 0.3s ease; cursor: default; display: flex; flex-direction: column; ${caseData.priority === 'high' ? 'animation: priorityPulse 2s ease-in-out infinite;' : ''}" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.18)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.12)'">
                        <style>
                            @keyframes priorityPulse {
                                0%, 100% { 
                                    box-shadow: 0 4px 16px rgba(255,68,68,0.3);
                                    border-color: #ff4444;
                                }
                                50% { 
                                    box-shadow: 0 4px 20px rgba(255,68,68,0.6);
                                    border-color: #ff6666;
                                }
                            }
                        </style>
                        <div style="color: #333333 !important; font-size: 0.9rem !important; margin-bottom: 10px; font-weight: 700 !important; text-transform: uppercase; letter-spacing: 0.5px;">Priorytet</div>
                        <div style="font-weight: 700 !important; font-size: 1.3rem !important; color: #000000 !important; flex: 1; display: flex; align-items: center;">${caseData.priority === 'high' ? '<span style="display: inline-block; animation: pulseRed 2s ease-in-out infinite;">🔴</span> Wysoki' : caseData.priority === 'medium' ? '🟡 Średni' : '🔵 Niski'}</div>
                        <style>
                            @keyframes pulseRed {
                                0%, 100% { 
                                    opacity: 1;
                                    transform: scale(1);
                                }
                                50% { 
                                    opacity: 0.6;
                                    transform: scale(1.1);
                                }
                            }
                        </style>
                    </div>
                    
                    <div style="background: white !important; padding: 25px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); border: 2px solid #FFD700; transition: all 0.3s ease; cursor: default; display: flex; flex-direction: column;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.18)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.12)'">
                        <div style="color: #333333 !important; font-size: 0.9rem !important; margin-bottom: 12px; font-weight: 700 !important; text-transform: uppercase; letter-spacing: 0.5px;">Tytuł sprawy</div>
                        <div style="font-size: 1.3rem !important; color: #000000 !important; font-weight: 700 !important; line-height: 1.5; flex: 1; display: flex; align-items: center;">${window.crmManager.escapeHtml(caseData.title)}</div>
                    </div>
                </div>
            </div>
            
            ${caseData.case_type === 'bankruptcy' || caseData.case_subtype === 'bankruptcy' ? `
                <div style="background: #f9f9f9; padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                        <div style="font-size: 3rem;">📋</div>
                        <div style="text-align: left;">
                            <h3 style="margin: 0; color: #1a2332; font-size: 1.4rem;">Ankieta Upadłościowa</h3>
                            <p style="color: #2c3e50; margin: 5px 0 0 0;">Zbierzmy wszystkie informacje potrzebne do wniosku</p>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 25px; margin-bottom: 30px;">
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">7 Sekcji</div>
                            <div style="color: #666; font-size: 0.8rem;">Pytania</div>
                        </div>
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">📅</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">10 Faz</div>
                            <div style="color: #666; font-size: 0.8rem;">Procedura</div>
                        </div>
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">👨‍⚖️</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">Syndyk</div>
                            <div style="color: #666; font-size: 0.8rem;">Dane kontaktowe</div>
                        </div>
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">11 Dokumentów</div>
                            <div style="color: #666; font-size: 0.8rem;">Checklist</div>
                        </div>
                    </div>
                    <button onclick="window.questionnaireRenderer.openQuestionnaire(${caseId}, 'bankruptcy')" style="
                        padding: 18px 40px;
                        background: linear-gradient(135deg, #FFD700, #d4af37);
                        color: #1a2332;
                        border: none;
                        border-radius: 12px;
                        font-weight: 700;
                        font-size: 1.2rem;
                        cursor: pointer;
                        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                        transition: all 0.3s;
                        margin-top: 0;
                    " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                        📋 Wypełnij ankietę upadłościową
                    </button>
                    <p style="color: #666; margin-top: 15px; font-size: 0.9rem;">
                        💾 Automatyczny zapis • ✨ Generowanie dokumentów • 📊 Pełna procedura
                    </p>
                </div>
            ` : ''}
            
            ${caseData.case_type === 'restructuring' || caseData.case_subtype === 'restructuring' ? `
                <div style="background: #f9f9f9; padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                        <div style="font-size: 3rem;">🏢</div>
                        <div style="text-align: left;">
                            <h3 style="margin: 0; color: #1a2332; font-size: 1.4rem;">Ankieta Restrukturyzacyjna</h3>
                            <p style="color: #2c3e50; margin: 5px 0 0 0;">Ratujemy Twoją firmę - zbieramy dane do układu</p>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 25px; margin-bottom: 30px;">
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">7 Sekcji</div>
                            <div style="color: #666; font-size: 0.8rem;">Pytania</div>
                        </div>
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">📅</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">5 Faz</div>
                            <div style="color: #666; font-size: 0.8rem;">Procedura</div>
                        </div>
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">👥</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">Wierzyciele</div>
                            <div style="color: #666; font-size: 0.8rem;">Lista + głosowanie</div>
                        </div>
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">📊</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">Plan Układu</div>
                            <div style="color: #666; font-size: 0.8rem;">Szczegółowy</div>
                        </div>
                    </div>
                    <button onclick="window.questionnaireRenderer.openQuestionnaire(${caseId}, 'restructuring')" style="
                        padding: 18px 40px;
                        background: linear-gradient(135deg, #FFD700, #d4af37);
                        color: #1a2332;
                        border: none;
                        border-radius: 12px;
                        font-weight: 700;
                        font-size: 1.2rem;
                        cursor: pointer;
                        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                        transition: all 0.3s;
                        margin-top: 0;
                    " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                        🏢 Wypełnij ankietę restrukturyzacyjną
                    </button>
                    <p style="color: #666; margin-top: 15px; font-size: 0.9rem;">
                        💪 Ratowanie firmy • 📈 Plan spłat • 🤝 Negocjacje z wierzycielami
                    </p>
                </div>
            ` : ''}
            
            ${caseData.case_type === 'compensation' || caseData.case_subtype === 'compensation' ? `
                <div style="background: #f9f9f9; padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                        <div style="font-size: 3rem;">💰</div>
                        <div style="text-align: left;">
                            <h3 style="margin: 0; color: #1a2332; font-size: 1.4rem;">Ankieta Odszkodowawcza</h3>
                            <p style="color: #2c3e50; margin: 5px 0 0 0;">Kompleksowe dochodzenie odszkodowania i zadośćuczynienia</p>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 25px; margin-bottom: 30px;">
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">10 Sekcji</div>
                            <div style="color: #666; font-size: 0.8rem;">Pytania</div>
                        </div>
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">📅</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">8 Faz</div>
                            <div style="color: #666; font-size: 0.8rem;">Procedura</div>
                        </div>
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">🏮</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">15 TU</div>
                            <div style="color: #666; font-size: 0.8rem;">Baza kontaktów</div>
                        </div>
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">22 Dokumenty</div>
                            <div style="color: #666; font-size: 0.8rem;">Checklist</div>
                        </div>
                    </div>
                    <button onclick="window.questionnaireRenderer.openQuestionnaire(${caseId}, 'compensation')" style="
                        padding: 18px 40px;
                        background: linear-gradient(135deg, #FFD700, #d4af37);
                        color: #1a2332;
                        border: none;
                        border-radius: 12px;
                        font-weight: 700;
                        font-size: 1.2rem;
                        cursor: pointer;
                        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                        transition: all 0.3s;
                        margin-top: 0;
                    " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                        💰 Wypełnij ankietę odszkodowawczą
                    </button>
                    <p style="color: #666; margin-top: 15px; font-size: 0.9rem;">
                        ⚖️ Dochodzenie roszczeń • 🏢 Integracja z TU • 📊 Pełna procedura
                    </p>
                </div>
            ` : ''}
            
            ${caseData.case_type === 'debt_collection' || caseData.case_subtype === 'debt_collection' || caseData.case_type === 'windykacja' || caseData.case_type === 'debt' || caseData.case_type === 'civil' || (caseData.case_number && caseData.case_number.startsWith('DLU')) ? `
                <div style="background: #f9f9f9; padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                        <div style="font-size: 3rem;">📜</div>
                        <div style="text-align: left;">
                            <h3 style="margin: 0; color: #1a2332; font-size: 1.4rem;">Ankieta Windykacyjna</h3>
                            <p style="color: #2c3e50; margin: 5px 0 0 0;">Kompleksowe dochodzenie należności - od wezwania do egzekucji</p>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 25px; margin-bottom: 30px;">
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">12 Sekcji</div>
                            <div style="color: #666; font-size: 0.8rem;">Szczegółowe pytania</div>
                        </div>
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">📅</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">9 Faz</div>
                            <div style="color: #666; font-size: 0.8rem;">Procedura windykacyjna</div>
                        </div>
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">20 Dokumentów</div>
                            <div style="color: #666; font-size: 0.8rem;">Wzory i instrukcje</div>
                        </div>
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">⚖️</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">E-Sąd</div>
                            <div style="color: #666; font-size: 0.8rem;">Integracja gotowa</div>
                        </div>
                    </div>
                    <button onclick="window.questionnaireRenderer.openQuestionnaire(${caseId}, 'debt_collection')" style="
                        padding: 18px 40px;
                        background: linear-gradient(135deg, #FFD700, #d4af37);
                        color: #1a2332;
                        border: none;
                        border-radius: 12px;
                        font-weight: 700;
                        font-size: 1.2rem;
                        cursor: pointer;
                        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                        transition: all 0.3s;
                        margin-top: 0;
                    " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                        📜 Wypełnij ankietę windykacyjną
                    </button>
                    <p style="color: #666; margin-top: 15px; font-size: 0.9rem;">
                        ⚖️ Wezwania • 📨 Negocjacje • 🏛️ Pozew • 👮 Egzekucja
                    </p>
                </div>
            ` : ''}
            
            ${window.isCriminalCase && (window.isCriminalCase(caseData.case_type) || window.isCriminalCase(caseData.case_number)) ? `
                <div style="background: #f9f9f9; padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                        <div style="font-size: 3rem;">🚔</div>
                        <div style="text-align: left;">
                            <h3 style="margin: 0; color: #1a2332; font-size: 1.4rem;">Ankieta Karna</h3>
                            <p style="color: #2c3e50; margin: 5px 0 0 0;">Kompleksowe postępowanie karne - dla pokrzywdzonych i oskarżonych</p>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 25px; margin-bottom: 30px;">
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">📋</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">9 Sekcji</div>
                            <div style="color: #666; font-size: 0.8rem;">Dynamiczne pytania</div>
                        </div>
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">⚖️</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">6 Faz</div>
                            <div style="color: #666; font-size: 0.8rem;">Procedura karna</div>
                        </div>
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">9 Dokumentów</div>
                            <div style="color: #666; font-size: 0.8rem;">AI wygeneruje</div>
                        </div>
                        <div style="background: white; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 8px;">💰</div>
                            <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">Kalkulator AI</div>
                            <div style="color: #666; font-size: 0.8rem;">Zadośćuczynienie</div>
                        </div>
                    </div>
                    <button onclick="if(window.openCriminalQuestionnaire) { window.openCriminalQuestionnaire(${caseId}, '${caseData.case_number || caseData.case_type}'); } else { alert('⚠️ Moduł ankiety karnej nie jest załadowany!'); }" style="
                        padding: 18px 40px;
                        background: linear-gradient(135deg, #FFD700, #d4af37);
                        color: #1a2332;
                        border: none;
                        border-radius: 12px;
                        font-weight: 700;
                        font-size: 1.2rem;
                        cursor: pointer;
                        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                        transition: all 0.3s;
                        margin-top: 0;
                    " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                        🚔 Wypełnij ankietę karną
                    </button>
                    <p style="color: #666; margin-top: 15px; font-size: 0.9rem;">
                        📢 Zawiadomienie • 🔍 Śledztwo • ⚖️ Proces • 💰 Zadośćuczynienie
                    </p>
                </div>
            ` : ''}
            
            ${window.isAdministrativeCase && (window.isAdministrativeCase(caseData.case_type) || window.isAdministrativeCase(caseData.case_number)) && !caseData.case_number.startsWith('BUD') && !caseData.case_number.startsWith('POD') && !caseData.case_number.startsWith('ZAG') ? (() => {
                const details = window.getAdministrativeCaseDetails(caseData.case_type || caseData.case_number);
                if (!details) return '';
                
                return `
                <div style="background: #f9f9f9; padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); text-align: center; margin-bottom: 20px; border: 2px solid ${details.color};">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                        <div style="font-size: 3rem;">${details.icon}</div>
                        <div style="text-align: left;">
                            <h3 style="margin: 0; color: #1a2332; font-size: 1.4rem;">${details.name}</h3>
                            <p style="color: #2c3e50; margin: 5px 0 0 0;">${details.desc}</p>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-top: 20px;">
                        ${details.features.map(feature => `
                            <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                <div style="font-size: 1.5rem; margin-bottom: 8px;">${feature.icon}</div>
                                <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">${feature.title}</div>
                                <div style="color: #666; font-size: 0.8rem;">${feature.subtitle}</div>
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="alert('⚠️ Dedykowany moduł dla ${details.name} - w przygotowaniu!\\n\\nFunkcje:\\n• Kreator wniosków i odwołań\\n• Terminy procesowe (KPA/Ordynacja Podatkowa)\\n• Baza orzeczeń WSA/NSA\\n• Wzory pism administracyjnych\\n• Kalkulator opłat/kar')" style="
                        padding: 18px 40px;
                        background: linear-gradient(135deg, #FFD700, #d4af37);
                        color: #1a2332;
                        border: none;
                        border-radius: 12px;
                        font-weight: 700;
                        font-size: 1.2rem;
                        cursor: pointer;
                        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                        transition: all 0.3s;
                        margin-top: 20px;
                    " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                        ${details.icon} Otwórz moduł administracyjny
                    </button>
                    <p style="color: #666; margin-top: 15px; font-size: 0.9rem;">
                        ${details.procedures}
                    </p>
                </div>
                `;
            })() : ''}
            
            ${(() => {
                // 💼 PANEL ANKIETY GOSPODARCZEJ (GOS/) - NOWY!
                if (window.questionnairePanels && window.questionnairePanels.renderCommercialPanel) {
                    const caseType = caseData.case_type;
                    const caseNumber = caseData.case_number || '';
                    
                    // Sprawdź czy to sprawa gospodarcza: case_type='commercial' LUB numer GOS/
                    // WYKLUCZENIE: NIE pokazuj dla UPA (to upadłość, nie gospodarcza!)
                    if ((caseType === 'commercial' || caseNumber.startsWith('GOS')) && !caseNumber.startsWith('UPA') && !caseNumber.startsWith('RES')) {
                        console.log('✅ Renderuję panel ankiety gospodarczej dla:', caseType || caseNumber);
                        return window.questionnairePanels.renderCommercialPanel(caseData.id);
                    }
                }
                return '';
            })()}
            
            ${(() => {
                // 🎗️ PANEL ANKIETY SPADKOWEJ (SPA/) - NOWY!
                if (window.questionnairePanels && window.questionnairePanels.renderInheritancePanel) {
                    const caseType = caseData.case_type;
                    const caseNumber = caseData.case_number || '';
                    
                    // Sprawdź czy to sprawa spadkowa: case_type='inheritance' LUB numer SPA/
                    if (caseType === 'inheritance' || caseNumber.startsWith('SPA')) {
                        console.log('✅ Renderuję panel ankiety spadkowej dla:', caseType || caseNumber);
                        return window.questionnairePanels.renderInheritancePanel(caseData.id);
                    }
                }
                return '';
            })()}
            
            ${(() => {
                // 🏠 PANEL ANKIETY MAJĄTKOWEJ (MAJ/)
                if (window.questionnairePanels && window.questionnairePanels.renderPropertyPanel) {
                    const caseType = caseData.case_type;
                    const caseNumber = caseData.case_number || '';
                    
                    // Sprawdź czy to sprawa majątkowa: case_type='property' LUB numer MAJ/
                    if (caseType === 'property' || caseNumber.startsWith('MAJ')) {
                        console.log('✅ Renderuję panel ankiety majątkowej dla:', caseType || caseNumber);
                        return window.questionnairePanels.renderPropertyPanel(caseData.id);
                    }
                }
                return '';
            })()}
            
            ${(() => {
                // 📄 PANEL ANKIETY UMOWNEJ (UMO/)
                if (window.questionnairePanels && window.questionnairePanels.renderContractPanel) {
                    const caseType = caseData.case_type;
                    const caseNumber = caseData.case_number || '';
                    
                    // Sprawdź czy to sprawa umowna: case_type='contract' LUB numer UMO/
                    if (caseType === 'contract' || caseNumber.startsWith('UMO')) {
                        console.log('✅ Renderuję panel ankiety umownej dla:', caseType || caseNumber);
                        return window.questionnairePanels.renderContractPanel(caseData.id);
                    }
                }
                return '';
            })()}
            
            ${(() => {
                // 👨‍👩‍👧‍👦 PANEL ANKIETY RODZINNEJ (ROD/)
                if (window.questionnairePanels && window.questionnairePanels.renderFamilyPanel) {
                    const caseType = caseData.case_type;
                    const caseNumber = caseData.case_number || '';
                    
                    // Sprawdź czy to sprawa rodzinna: case_type='family' LUB numer ROD/
                    if (caseType === 'family' || caseNumber.startsWith('ROD')) {
                        console.log('✅ Renderuję panel ankiety rodzinnej dla:', caseType || caseNumber);
                        return window.questionnairePanels.renderFamilyPanel(caseData.id);
                    }
                }
                return '';
            })()}
            
            ${(() => {
                // 🏗️ PANEL ANKIETY BUDOWLANEJ (BUD/)
                if (window.questionnairePanels && window.questionnairePanels.renderBuildingPanel) {
                    const caseType = caseData.case_type;
                    const caseNumber = caseData.case_number || '';
                    
                    // Sprawdź czy to sprawa budowlana: case_type='building' LUB numer BUD/
                    if (caseType === 'building' || caseNumber.startsWith('BUD')) {
                        console.log('✅ Renderuję panel ankiety budowlanej dla:', caseType || caseNumber);
                        return window.questionnairePanels.renderBuildingPanel(caseData.id);
                    }
                }
                return '';
            })()}
            
            ${(() => {
                // 🔥 PANEL ANKIETY PODATKOWEJ (POD/)
                if (window.questionnairePanels && window.questionnairePanels.renderTaxPanel) {
                    const caseType = caseData.case_type;
                    const caseNumber = caseData.case_number || '';
                    
                    // Sprawdź czy to sprawa podatkowa: case_type='tax' LUB numer POD/
                    if (caseType === 'tax' || caseNumber.startsWith('POD')) {
                        console.log('✅ Renderuję panel ankiety podatkowej dla:', caseType || caseNumber);
                        return window.questionnairePanels.renderTaxPanel(caseData.id);
                    }
                }
                return '';
            })()}
            
            ${(() => {
                // 🗺️ PANEL ANKIETY ZAGOSPODAROWANIA (ZAG/)
                if (window.questionnairePanels && window.questionnairePanels.renderZoningPanel) {
                    const caseType = caseData.case_type;
                    const caseNumber = caseData.case_number || '';
                    
                    // Sprawdź czy to sprawa zagospodarowania: case_type='zoning' LUB numer ZAG/
                    if (caseType === 'zoning' || caseNumber.startsWith('ZAG')) {
                        console.log('✅ Renderuję panel ankiety zagospodarowania dla:', caseType || caseNumber);
                        return window.questionnairePanels.renderZoningPanel(caseData.id);
                    }
                }
                return '';
            })()}
            
            ${(() => {
                // 🌍 PANEL ANKIETY MIĘDZYNARODOWEJ (MIE/EUR/ARB) - NOWY!
                if (window.questionnairePanels && window.questionnairePanels.renderInternationalPanel) {
                    const caseType = caseData.case_type;
                    const caseNumber = caseData.case_number || '';
                    
                    // Sprawdź czy to sprawa międzynarodowa: case_type='international/european/arbitration' LUB numer MIE/EUR/ARB
                    if (caseType === 'international' || caseType === 'european' || caseType === 'arbitration' ||
                        caseNumber.startsWith('MIE') || caseNumber.startsWith('EUR') || caseNumber.startsWith('ARB')) {
                        console.log('✅ Renderuję panel ankiety międzynarodowej dla:', caseType || caseNumber);
                        return window.questionnairePanels.renderInternationalPanel(caseData.id);
                    }
                }
                return '';
            })()}
            
            ${(() => {
                // ⚡ PANEL ANKIETY PRAWA SPECJALNEGO (MOR/ENE/OZE/LOT/IT) - NOWY!
                if (window.questionnairePanels && window.questionnairePanels.renderSpecialPanel) {
                    const caseType = caseData.case_type;
                    const caseNumber = caseData.case_number || '';
                    
                    // Sprawdź czy to sprawa specjalna: case_type='maritime/energy/renewable/aviation/it' LUB numer MOR/ENE/OZE/LOT/IT
                    if (caseType === 'maritime' || caseType === 'energy' || caseType === 'renewable' || caseType === 'aviation' || caseType === 'it' ||
                        caseNumber.startsWith('MOR') || caseNumber.startsWith('ENE') || caseNumber.startsWith('OZE') || caseNumber.startsWith('LOT') || caseNumber.startsWith('IT/')) {
                        console.log('✅ Renderuję panel ankiety prawa specjalnego dla:', caseType || caseNumber);
                        return window.questionnairePanels.renderSpecialPanel(caseData.id);
                    }
                }
                return '';
            })()}
            
            ${window.isFamilyCase && (window.isFamilyCase(caseData.case_type) || window.isFamilyCase(caseData.case_number)) && !caseData.case_number.startsWith('ROD') ? (() => {
                const details = window.getFamilyCaseDetails(caseData.case_type || caseData.case_number);
                if (!details) return '';
                
                return `
                <div style="background: #f9f9f9; padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); text-align: center; margin-bottom: 20px; border: 2px solid ${details.color};">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                        <div style="font-size: 3rem;">${details.icon}</div>
                        <div style="text-align: left;">
                            <h3 style="margin: 0; color: #1a2332; font-size: 1.4rem;">${details.name}</h3>
                            <p style="color: #2c3e50; margin: 5px 0 0 0;">${details.desc}</p>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-top: 20px;">
                        ${details.features.map(feature => `
                            <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                <div style="font-size: 1.5rem; margin-bottom: 8px;">${feature.icon}</div>
                                <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">${feature.title}</div>
                                <div style="color: #666; font-size: 0.8rem;">${feature.subtitle}</div>
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="window.openFamilyCaseModule('${caseData.id}', '${caseData.case_type || caseData.case_number}')" style="
                        padding: 18px 40px;
                        background: linear-gradient(135deg, #FFD700, #d4af37);
                        color: #1a2332;
                        border: none;
                        border-radius: 12px;
                        font-weight: 700;
                        font-size: 1.2rem;
                        cursor: pointer;
                        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                        transition: all 0.3s;
                        margin-top: 20px;
                    " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                        ${details.icon} Otwórz moduł rodzinny
                    </button>
                    <p style="color: #666; margin-top: 15px; font-size: 0.9rem;">
                        ${details.procedures}
                    </p>
                </div>
                `;
            })() : ''}
            
            ${window.isCivilCase && (window.isCivilCase(caseData.case_type) || window.isCivilCase(caseData.case_number)) && caseData.case_type !== 'inheritance' && caseData.case_type !== 'property' && caseData.case_type !== 'contract' && !(caseData.case_number || '').startsWith('SPA') && !(caseData.case_number || '').startsWith('MAJ') && !(caseData.case_number || '').startsWith('UMO') ? (() => {
                const details = window.getCivilCaseDetails(caseData.case_type || caseData.case_number);
                if (!details) return '';
                
                return `
                <div style="background: #f9f9f9; padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); text-align: center; margin-bottom: 20px; border: 2px solid ${details.color};">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                        <div style="font-size: 3rem;">${details.icon}</div>
                        <div style="text-align: left;">
                            <h3 style="margin: 0; color: #1a2332; font-size: 1.4rem;">${details.name}</h3>
                            <p style="color: #2c3e50; margin: 5px 0 0 0;">${details.desc}</p>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-top: 20px;">
                        ${details.features.map(feature => `
                            <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                <div style="font-size: 1.5rem; margin-bottom: 8px;">${feature.icon}</div>
                                <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">${feature.title}</div>
                                <div style="color: #666; font-size: 0.8rem;">${feature.subtitle}</div>
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="window.openCivilCaseModule('${caseData.id}', '${caseData.case_type || caseData.case_number}')" style="
                        padding: 18px 40px;
                        background: linear-gradient(135deg, #FFD700, #d4af37);
                        color: #1a2332;
                        border: none;
                        border-radius: 12px;
                        font-weight: 700;
                        font-size: 1.2rem;
                        cursor: pointer;
                        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                        transition: all 0.3s;
                        margin-top: 20px;
                    " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                        ${details.icon} Otwórz moduł cywilny
                    </button>
                    <p style="color: #666; margin-top: 15px; font-size: 0.9rem;">
                        ${details.procedures}
                    </p>
                </div>
                `;
            })() : ''}
            
            ${caseData.court_name || caseData.court_signature || caseData.court_department || caseData.judge_name || caseData.court_type || caseData.referent ? `
                <div style="background: #e3f2fd; padding: 25px; border-radius: 12px; border-left: 4px solid #2196f3; box-shadow: 0 4px 20px rgba(33,150,243,0.15);">
                    <h3 style="margin: 0 0 20px 0; color: #1976d2; font-size: 1.2rem;">⚖️ Informacje sądowe</h3>
                    
                    <!-- Grid 2 kolumny dla głównych info -->
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
                        ${caseData.court_name ? `
                            <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #bbdefb; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                                <div style="color: #666; font-size: 0.85rem; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">🏛️ Nazwa sądu</div>
                                <div style="color: #1a2332; font-weight: 700; font-size: 1.1rem; line-height: 1.4;">${window.crmManager.escapeHtml(caseData.court_name)}</div>
                            </div>
                        ` : ''}
                        ${caseData.court_signature ? `
                            <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #bbdefb; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                                <div style="color: #666; font-size: 0.85rem; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📑 Sygnatura akt</div>
                                <div style="color: #1a2332; font-weight: 700; font-size: 1.1rem; font-family: 'Courier New', monospace; background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15)); padding: 8px 12px; border-radius: 6px; display: inline-block;">${window.crmManager.escapeHtml(caseData.court_signature)}</div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Grid 3 kolumny dla szczegółów -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px;">
                        ${caseData.court_type ? `
                            <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #bbdefb; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                                <div style="color: #666; font-size: 0.85rem; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">🏛️ Rodzaj</div>
                                <div style="color: #1a2332; font-weight: 600; font-size: 1rem;">${window.crmManager.escapeHtml(caseData.court_type)}</div>
                            </div>
                        ` : ''}
                        ${caseData.court_department ? `
                            <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #bbdefb; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                                <div style="color: #666; font-size: 0.85rem; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">🏢 Wydział</div>
                                <div style="color: #1a2332; font-weight: 600; font-size: 1rem;">${window.crmManager.escapeHtml(caseData.court_department)}</div>
                            </div>
                        ` : ''}
                        ${caseData.judge_name ? `
                            <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #bbdefb; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                                <div style="color: #666; font-size: 0.85rem; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">👨‍⚖️ Sędzia</div>
                                <div style="color: #1a2332; font-weight: 600; font-size: 1rem;">${window.crmManager.escapeHtml(caseData.judge_name)}</div>
                            </div>
                        ` : ''}
                        ${caseData.referent ? `
                            <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #bbdefb; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                                <div style="color: #666; font-size: 0.85rem; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📋 Referent</div>
                                <div style="color: #1a2332; font-weight: 600; font-size: 1rem;">${window.crmManager.escapeHtml(caseData.referent)}</div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Pełna szerokość dla adresu -->
                    ${caseData.court_address ? `
                        <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #bbdefb; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 20px;">
                            <div style="color: #666; font-size: 0.85rem; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📍 Adres sądu</div>
                            <div style="color: #1a2332; font-weight: 600; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                                <span>${window.crmManager.escapeHtml(caseData.court_address)}</span>
                                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(caseData.court_address)}" target="_blank" 
                                   style="background: #4285f4; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 0.85rem; font-weight: 700; display: inline-flex; align-items: center; gap: 5px; transition: all 0.3s;"
                                   onmouseover="this.style.background='#1976d2'" onmouseout="this.style.background='#4285f4'">
                                    🗺️ Mapa
                                </a>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Grid 3 kolumny dla kontaktu -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                        ${caseData.court_phone ? `
                            <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #bbdefb; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                                <div style="color: #666; font-size: 0.85rem; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📞 Telefon</div>
                                <a href="tel:${caseData.court_phone}" style="color: #d4af37; text-decoration: none; font-weight: 700; font-size: 1.05rem; display: inline-block; background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15)); padding: 8px 14px; border-radius: 8px; transition: all 0.3s;"
                                   onmouseover="this.style.background='#bbdefb'" onmouseout="this.style.background='#e3f2fd'">
                                    ${window.crmManager.escapeHtml(caseData.court_phone)}
                                </a>
                            </div>
                        ` : ''}
                        ${caseData.court_email ? `
                            <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #bbdefb; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                                <div style="color: #666; font-size: 0.85rem; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">✉️ Email</div>
                                <a href="mailto:${caseData.court_email}" style="color: #d4af37; text-decoration: none; font-weight: 600; font-size: 0.95rem; display: inline-block; background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15)); padding: 8px 14px; border-radius: 8px; word-break: break-all; transition: all 0.3s;"
                                   onmouseover="this.style.background='#bbdefb'" onmouseout="this.style.background='#e3f2fd'">
                                    ${window.crmManager.escapeHtml(caseData.court_email)}
                                </a>
                            </div>
                        ` : ''}
                        ${caseData.court_website ? `
                            <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #bbdefb; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                                <div style="color: #666; font-size: 0.85rem; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">🌐 Strona WWW</div>
                                <a href="${caseData.court_website}" target="_blank" style="color: #d4af37; text-decoration: none; font-weight: 600; font-size: 0.95rem; display: inline-block; background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15)); padding: 8px 14px; border-radius: 8px; transition: all 0.3s;"
                                   onmouseover="this.style.background='#bbdefb'" onmouseout="this.style.background='#e3f2fd'">
                                    Odwiedź stronę →
                                </a>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${caseData.prosecutor_office || caseData.prosecutor_name || caseData.indictment_number || caseData.auxiliary_prosecutor || caseData.investigation_authority || caseData.police_case_number || caseData.prosecutor_address || caseData.prosecutor_phone || caseData.prosecutor_email || caseData.prosecutor_website ? `
                <div style="background: #fff3e0; padding: 20px; border-radius: 12px; border-left: 4px solid #ff9800; box-shadow: 0 2px 8px rgba(255,152,0,0.1);">
                    <h3 style="margin: 0 0 15px 0; color: #f57c00; font-size: 1.1rem;">🔍 Prokuratura i organy ścigania</h3>
                    
                    <!-- Nazwa prokuratury -->
                    ${caseData.prosecutor_office ? `
                        <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #ffcc80; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 15px;">
                            <div style="color: #666; font-size: 0.85rem; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">🏛️ Prokuratura</div>
                            <div style="color: #1a2332; font-weight: 700; font-size: 1.1rem; line-height: 1.4;">${window.crmManager.escapeHtml(caseData.prosecutor_office)}</div>
                        </div>
                    ` : ''}
                    
                    <!-- Adres prokuratury -->
                    ${caseData.prosecutor_address ? `
                        <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #ffcc80; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 15px;">
                            <div style="display: flex; align-items: start; gap: 10px;">
                                <span style="color: #f57c00; font-weight: 600;">📍</span>
                                <div style="flex: 1;">
                                    <div style="color: #666; font-size: 0.8rem; margin-bottom: 2px;">Adres prokuratury:</div>
                                    <div style="color: #1a2332; font-weight: 600;">${window.crmManager.escapeHtml(caseData.prosecutor_address)}</div>
                                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(caseData.prosecutor_office ? caseData.prosecutor_office + ', ' + caseData.prosecutor_address : caseData.prosecutor_address)}" 
                                       target="_blank" 
                                       rel="noopener noreferrer"
                                       style="background: #4285f4; color: white; padding: 4px 10px; border-radius: 4px; text-decoration: none; font-size: 0.8rem; font-weight: 600; display: inline-block; margin-top: 6px;">
                                        🗺️ Pokaż na mapie
                                    </a>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Telefon prokuratury -->
                    ${caseData.prosecutor_phone ? `
                        <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #ffcc80; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 15px;">
                            <div style="display: flex; align-items: start; gap: 10px;">
                                <span style="color: #f57c00; font-weight: 600;">📞</span>
                                <div>
                                    <div style="color: #666; font-size: 0.8rem; margin-bottom: 2px;">Telefon prokuratury:</div>
                                    <a href="tel:${caseData.prosecutor_phone.replace(/[\s()-]/g, '')}" style="color: #ff9800; text-decoration: none; font-weight: 600; font-size: 1rem;">
                                        ${window.crmManager.escapeHtml(caseData.prosecutor_phone)}
                                    </a>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Email prokuratury -->
                    ${caseData.prosecutor_email ? `
                        <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #ffcc80; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 15px;">
                            <div style="display: flex; align-items: start; gap: 10px;">
                                <span style="color: #f57c00; font-weight: 600;">✉️</span>
                                <div>
                                    <div style="color: #666; font-size: 0.8rem; margin-bottom: 2px;">Email prokuratury:</div>
                                    <a href="mailto:${caseData.prosecutor_email}" style="color: #ff9800; text-decoration: none; font-weight: 600;">
                                        ${window.crmManager.escapeHtml(caseData.prosecutor_email)}
                                    </a>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Strona WWW prokuratury -->
                    ${caseData.prosecutor_website ? `
                        <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #ffcc80; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 15px;">
                            <div style="display: flex; align-items: start; gap: 10px;">
                                <span style="color: #f57c00; font-weight: 600;">🌐</span>
                                <div>
                                    <div style="color: #666; font-size: 0.8rem; margin-bottom: 2px;">Strona WWW prokuratury:</div>
                                    <a href="${caseData.prosecutor_website.startsWith('http') ? caseData.prosecutor_website : 'https://' + caseData.prosecutor_website}" 
                                       target="_blank" 
                                       rel="noopener noreferrer"
                                       style="background: #ff9800; color: white; padding: 6px 14px; border-radius: 6px; text-decoration: none; font-size: 0.9rem; font-weight: 600; display: inline-block;">
                                        Odwiedź stronę prokuratury →
                                    </a>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Nazwa komendy policji / organu dochodzeniowego -->
                    ${caseData.investigation_authority ? `
                        <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #81d4fa; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 15px;">
                            <div style="color: #666; font-size: 0.85rem; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">🚔 Organ dochodzeniowy</div>
                            <div style="color: #1a2332; font-weight: 700; font-size: 1.1rem; line-height: 1.4;">${window.crmManager.escapeHtml(caseData.investigation_authority)}</div>
                        </div>
                    ` : ''}
                    
                    <!-- Adres komendy policji -->
                    ${caseData.police_address ? `
                        <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #81d4fa; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 15px;">
                            <div style="display: flex; align-items: start; gap: 10px;">
                                <span style="color: #1565c0; font-weight: 600;">📍</span>
                                <div style="flex: 1;">
                                    <div style="color: #666; font-size: 0.8rem; margin-bottom: 2px;">Adres komendy:</div>
                                    <div style="color: #1a2332; font-weight: 600;">${window.crmManager.escapeHtml(caseData.police_address)}</div>
                                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(caseData.investigation_authority ? caseData.investigation_authority + ', ' + caseData.police_address : caseData.police_address)}" 
                                       target="_blank" 
                                       rel="noopener noreferrer"
                                       style="background: #4285f4; color: white; padding: 4px 10px; border-radius: 4px; text-decoration: none; font-size: 0.8rem; font-weight: 600; display: inline-block; margin-top: 6px;">
                                        🗺️ Pokaż na mapie
                                    </a>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Telefon komendy policji -->
                    ${caseData.police_phone ? `
                        <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #81d4fa; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 15px;">
                            <div style="display: flex; align-items: start; gap: 10px;">
                                <span style="color: #1565c0; font-weight: 600;">📞</span>
                                <div>
                                    <div style="color: #666; font-size: 0.8rem; margin-bottom: 2px;">Telefon komendy:</div>
                                    <a href="tel:${caseData.police_phone.replace(/[\s()-]/g, '')}" style="color: #d4af37; text-decoration: none; font-weight: 600; font-size: 1rem;">
                                        ${window.crmManager.escapeHtml(caseData.police_phone)}
                                    </a>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Email komendy policji -->
                    ${caseData.police_email ? `
                        <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #81d4fa; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 15px;">
                            <div style="display: flex; align-items: start; gap: 10px;">
                                <span style="color: #1565c0; font-weight: 600;">✉️</span>
                                <div>
                                    <div style="color: #666; font-size: 0.8rem; margin-bottom: 2px;">Email komendy:</div>
                                    <a href="mailto:${caseData.police_email}" style="color: #d4af37; text-decoration: none; font-weight: 600;">
                                        ${window.crmManager.escapeHtml(caseData.police_email)}
                                    </a>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Strona WWW komendy policji -->
                    ${caseData.police_website ? `
                        <div style="background: white; padding: 18px; border-radius: 10px; border: 1px solid #81d4fa; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 15px;">
                            <div style="display: flex; align-items: start; gap: 10px;">
                                <span style="color: #1565c0; font-weight: 600;">🌐</span>
                                <div>
                                    <div style="color: #666; font-size: 0.8rem; margin-bottom: 2px;">Strona WWW komendy:</div>
                                    <a href="${caseData.police_website.startsWith('http') ? caseData.police_website : 'https://' + caseData.police_website}" 
                                       target="_blank" 
                                       rel="noopener noreferrer"
                                       style="background: linear-gradient(135deg, #d4af37, #FFD700); color: white; padding: 6px 14px; border-radius: 6px; text-decoration: none; font-size: 0.9rem; font-weight: 600; display: inline-block;">
                                        Odwiedź stronę komendy →
                                    </a>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Pozostałe dane -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
                        ${caseData.prosecutor_name ? `
                            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0;">
                                <div style="color: #666; font-size: 0.85rem; margin-bottom: 6px; font-weight: 600;">👔 Prokurator</div>
                                <div style="color: #1a2332; font-weight: 600; font-size: 1rem;">${window.crmManager.escapeHtml(caseData.prosecutor_name)}</div>
                            </div>
                        ` : ''}
                        ${caseData.indictment_number ? `
                            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0;">
                                <div style="color: #666; font-size: 0.85rem; margin-bottom: 6px; font-weight: 600;">📑 Akt oskarżenia / Postanowienie</div>
                                <div style="color: #1a2332; font-weight: 600; font-size: 1rem;">${window.crmManager.escapeHtml(caseData.indictment_number)}</div>
                            </div>
                        ` : ''}
                        ${caseData.auxiliary_prosecutor ? `
                            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0;">
                                <div style="color: #666; font-size: 0.85rem; margin-bottom: 6px; font-weight: 600;">👤 Skarżyciel posiłkowy</div>
                                <div style="color: #1a2332; font-weight: 600; font-size: 1rem;">${window.crmManager.escapeHtml(caseData.auxiliary_prosecutor)}</div>
                            </div>
                        ` : ''}
                        ${caseData.police_case_number ? `
                            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0;">
                                <div style="color: #666; font-size: 0.85rem; margin-bottom: 6px; font-weight: 600;">📋 Sygnatura akt policyjnych</div>
                                <div style="color: #1a2332; font-weight: 600; font-size: 1rem;">${window.crmManager.escapeHtml(caseData.police_case_number)}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${caseData.opposing_party || caseData.value_amount ? `
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
                    <h3 style="margin: 0 0 15px 0; color: #1a2332;">👥 Strony i wartość</h3>
                    <div style="display: grid; gap: 10px; color: #1a2332;">
                        ${caseData.opposing_party ? `<div><strong>Strona przeciwna:</strong> ${window.crmManager.escapeHtml(caseData.opposing_party)}</div>` : ''}
                        ${caseData.value_amount ? `<div><strong>Wartość przedmiotu sporu:</strong> ${window.crmManager.escapeHtml(caseData.value_amount)} ${window.crmManager.escapeHtml(caseData.value_currency || 'PLN')}</div>` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${caseData.description ? renderCaseDescription(caseData.description, caseId) : ''}
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; color: #1a2332;">📅 Daty</h3>
                <div style="display: grid; gap: 10px; color: #1a2332;">
                    <div><strong>Utworzono:</strong> ${new Date(caseData.created_at).toLocaleString('pl-PL')}</div>
                    <div><strong>Ostatnia aktualizacja:</strong> ${new Date(caseData.updated_at).toLocaleString('pl-PL')}</div>
                    ${caseData.closed_at ? `<div><strong>Zamknięto:</strong> ${new Date(caseData.closed_at).toLocaleString('pl-PL')}</div>` : ''}
                </div>
            </div>
            
            <!-- DASHBOARD Z OSTATNIMI WPISAMI -->
            <div id="quickDashboard_${caseId}" style="margin-top: 20px;">
                <!-- Ładuje się asynchronicznie -->
            </div>
        </div>
    `;
};

// Szybki dashboard pokazujący 4 ostatnie wpisy z każdej kategorii
window.loadQuickDashboard = async function(caseId) {
    console.log('%c✅ loadQuickDashboard V2020 - NEW VERSION! ✅', 'background: blue; color: white; font-size: 16px; font-weight: bold; padding: 5px;');
    console.log('📊 Ładowanie dashboardu dla sprawy:', caseId);
    const container = document.getElementById(`quickDashboard_${caseId}`);
    if (!container) {
        console.error('❌ Kontener quickDashboard_' + caseId + ' nie znaleziony!');
        console.error('❌ Sprawdzam czy kontener istnieje w DOM...');
        return;
    }
    
    console.log('✅ Kontener znaleziony, ustawiam "Ładowanie..."');
    container.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">⏳ Ładowanie podglądu...</p>';
    
    try {
        // Pobierz wszystkie dane równolegle + DANE SPRAWY
        const [caseResp, eventsResp, witnessesResp, docsResp, commentsResp] = await Promise.all([
            window.api.request(`/cases/${caseId}`).catch(() => null),
            window.api.request(`/events?case_id=${caseId}`).catch(() => ({ events: [] })),
            window.api.request(`/witnesses?case_id=${caseId}`).catch(() => ({ witnesses: [] })),
            window.api.request(`/cases/${caseId}/documents`).catch(() => ({ documents: [] })),
            window.api.request(`/comments/case/${caseId}`).catch(() => ({ comments: [] }))
        ]);
        
        const events = (eventsResp.events || []).slice(0, 4);
        const witnesses = (witnessesResp.witnesses || []).slice(0, 4);
        const documents = (docsResp.documents || []).slice(0, 4);
        const comments = (commentsResp.comments || []).slice(0, 4);
        
        container.innerHTML = `
            <!-- Wydarzenia -->
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 15px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid #FFD700;">
                <h4 style="margin:0 0 10px 0;color:white;font-size:1rem;">📅 Ostatnie wydarzenia (${events.length})</h4>
                ${events.length > 0 ? events.map(e => `
                    <div style="background:rgba(255,255,255,0.15);padding:8px;border-radius:6px;margin-bottom:6px;cursor:pointer;transition:all 0.2s;" 
                        onclick="window.goToEvent(${caseId},${e.id})"
                        onmouseover="this.style.background='rgba(255,255,255,0.25)'"
                        onmouseout="this.style.background='rgba(255,255,255,0.15)'">
                        <div style="font-weight:600;font-size:0.9rem;">${window.crmManager.escapeHtml(e.title || 'Bez tytułu')}</div>
                        <div style="font-size:0.8rem;opacity:0.9;">${new Date(e.start_date).toLocaleDateString('pl-PL')}</div>
                    </div>
                `).join('') : '<p style="margin:0;opacity:0.8;font-size:0.9rem;">Brak wydarzeń</p>'}
                <button onclick="window.crmManager.switchCaseTab(${caseId},'events')" style="width:100%;margin-top:8px;padding:10px;background:linear-gradient(135deg, #FFD700, #d4af37);color:#1a2332;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.9rem;box-shadow:0 2px 8px rgba(212,175,55,0.3);transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(212,175,55,0.5)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(212,175,55,0.3)'">Zobacz wszystkie →</button>
            </div>
            
            <!-- Świadkowie -->
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 15px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid #FFD700;">
                <h4 style="margin:0 0 10px 0;color:white;font-size:1rem;">👥 Ostatni świadkowie (${witnesses.length})</h4>
                ${witnesses.length > 0 ? witnesses.map(w => `
                    <div style="background:rgba(255,255,255,0.15);padding:8px;border-radius:6px;margin-bottom:6px;cursor:pointer;transition:all 0.2s;" 
                        onclick="window.goToWitness(${caseId},${w.id})"
                        onmouseover="this.style.background='rgba(255,255,255,0.25)'"
                        onmouseout="this.style.background='rgba(255,255,255,0.15)'">
                        <div style="font-weight:600;font-size:0.9rem;color:white;">${window.crmManager.escapeHtml(w.name || w.first_name + ' ' + w.last_name)}</div>
                        <div style="font-size:0.8rem;color:rgba(255,255,255,0.8);">${window.crmManager.escapeHtml(w.role || 'Świadek')}</div>
                    </div>
                `).join('') : '<p style="margin:0;opacity:0.8;font-size:0.9rem;color:white;">Brak świadków</p>'}
                <button onclick="window.crmManager.switchCaseTab(${caseId},'witnesses')" style="width:100%;margin-top:8px;padding:10px;background:linear-gradient(135deg, #FFD700, #d4af37);color:#1a2332;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.9rem;box-shadow:0 2px 8px rgba(212,175,55,0.3);transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(212,175,55,0.5)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(212,175,55,0.3)'">Zobacz wszystkie →</button>
            </div>
            
            <!-- Dokumenty -->
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 15px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid #FFD700;">
                <h4 style="margin:0 0 10px 0;color:white;font-size:1rem;">📄 Ostatnie dokumenty (${documents.length})</h4>
                ${documents.length > 0 ? documents.map(d => `
                    <div style="background:rgba(255,255,255,0.15);padding:8px;border-radius:6px;margin-bottom:6px;cursor:pointer;transition:all 0.2s;" 
                        onclick="window.goToDocument(${caseId},${d.id})"
                        onmouseover="this.style.background='rgba(255,255,255,0.25)'"
                        onmouseout="this.style.background='rgba(255,255,255,0.15)'">
                        <div style="font-weight:600;font-size:0.9rem;color:white;">${window.crmManager.escapeHtml(d.title || d.filename)}</div>
                        <div style="font-size:0.8rem;color:rgba(255,255,255,0.8);">${new Date(d.uploaded_at).toLocaleDateString('pl-PL')}</div>
                    </div>
                `).join('') : '<p style="margin:0;opacity:0.8;font-size:0.9rem;color:white;">Brak dokumentów</p>'}
                <button onclick="window.crmManager.switchCaseTab(${caseId},'documents')" style="width:100%;margin-top:8px;padding:10px;background:linear-gradient(135deg, #FFD700, #d4af37);color:#1a2332;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.9rem;box-shadow:0 2px 8px rgba(212,175,55,0.3);transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(212,175,55,0.5)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(212,175,55,0.3)'">Zobacz wszystkie →</button>
            </div>
            
            <!-- Komentarze -->
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 15px; border-radius: 12px; border-left: 4px solid #FFD700;">
                <h4 style="margin:0 0 10px 0;color:white;font-size:1rem;">💬 Ostatnie komentarze (${comments.length})</h4>
                ${comments.length > 0 ? comments.map(c => `
                    <div style="background:rgba(255,255,255,0.15);padding:8px;border-radius:6px;margin-bottom:6px;cursor:pointer;transition:all 0.2s;" onclick="window.goToComment(${caseId},${c.id})"
                        onmouseover="this.style.background='rgba(255,255,255,0.25)'"
                        onmouseout="this.style.background='rgba(255,255,255,0.15)'">
                        <div style="font-size:0.8rem;color:rgba(255,255,255,0.8);margin-bottom:3px;">👤 ${window.crmManager.escapeHtml(c.author_name || 'Nieznany')}</div>
                        <div style="font-size:0.9rem;color:white;">${window.crmManager.escapeHtml((c.content || '').substring(0, 60))}${c.content && c.content.length > 60 ? '...' : ''}</div>
                    </div>
                `).join('') : '<p style="margin:0;opacity:0.8;font-size:0.9rem;color:white;">Brak komentarzy</p>'}
                <button onclick="window.crmManager.switchCaseTab(${caseId},'comments')" style="width:100%;margin-top:8px;padding:10px;background:linear-gradient(135deg, #FFD700, #d4af37);color:#1a2332;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.9rem;box-shadow:0 2px 8px rgba(212,175,55,0.3);transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(212,175,55,0.5)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(212,175,55,0.3)'">Zobacz wszystkie →</button>
            </div>
        `;
    } catch (error) {
        console.error('Błąd ładowania dashboardu:', error);
        container.innerHTML = '<p style="text-align:center;color:#dc3545;padding:20px;">Błąd ładowania podglądu</p>';
    }
};

// Uproszczony dashboard - tylko skróty
window.loadSimpleDashboard = async function(caseId) {
    const container = document.getElementById(`caseDashboardSimple_${caseId}`);
    if (!container) return;
    
    try {
        // Pobierz wydarzenia i komentarze
        const eventsResp = await window.api.request(`/events?case_id=${caseId}`);
        const allEvents = eventsResp.events || [];
        const upcomingEvents = allEvents.filter(e => new Date(e.start_date) >= new Date()).slice(0, 3);
        
        let recentComments = [];
        try {
            const commentsResp = await window.api.request(`/comments/case/${caseId}`);
            recentComments = (commentsResp.comments || []).slice(0, 2); // 2 ostatnie
        } catch (err) {
            console.log('Brak komentarzy');
        }
        
        container.innerHTML = `
            <!-- Nadchodzące wydarzenia -->
            ${upcomingEvents.length > 0 ? `
                <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 20px; border-radius: 12px; color: white; margin-bottom: 15px; border-left: 4px solid #FFD700;">
                    <h3 style="margin: 0 0 15px 0; font-size: 1.1rem;">📅 Najbliższe wydarzenia (${upcomingEvents.length}/${allEvents.length})</h3>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${upcomingEvents.map(e => {
                            const date = new Date(e.start_date);
                            const days = Math.ceil((date - new Date()) / (1000*60*60*24));
                            return `
                                <div style="background: rgba(255,255,255,0.15); padding: 10px; border-radius: 6px;">
                                    <div style="font-weight: 600;">${window.crmManager.escapeHtml(e.title || 'Bez tytułu')}</div>
                                    <div style="font-size: 0.85rem; opacity: 0.9; margin-top: 3px;">
                                        ${date.toLocaleDateString('pl-PL')} ${date.toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'})} • 
                                        ${days === 0 ? '🔥 DZIŚ' : days === 1 ? '⚡ JUTRO' : `Za ${days} dni`}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <button onclick="window.crmManager.switchCaseTab(${caseId}, 'events')" style="width: 100%; margin-top: 10px; padding: 12px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; box-shadow: 0 2px 8px rgba(212,175,55,0.3); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(212,175,55,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(212,175,55,0.3)'">
                        Zobacz wszystkie wydarzenia →
                    </button>
                </div>
            ` : `
                <div style="background: #f0f0f0; padding: 15px; border-radius: 12px; text-align: center; margin-bottom: 15px;">
                    <p style="color: #666; margin: 0 0 10px 0;">📅 Brak nadchodzących wydarzeń</p>
                    <button onclick="window.crmManager.switchCaseTab(${caseId}, 'events')" style="padding: 10px 20px; background: linear-gradient(135deg, #d4af37, #FFD700); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        Dodaj wydarzenie
                    </button>
                </div>
            `}
            
            <!-- Ostatnie komentarze -->
            ${recentComments.length > 0 ? `
                <div style="background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15)); padding: 20px; border-radius: 12px; border-left: 4px solid #d4af37; margin-bottom: 15px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 1.1rem; color: #1a2332;">💬 Ostatnie komentarze</h3>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${recentComments.map(c => `
                            <div style="background: white; padding: 12px; border-radius: 6px; cursor: pointer; transition: all 0.2s;" 
                                onclick="window.goToComment(${caseId}, ${c.id})"
                                onmouseover="this.style.boxShadow='0 2px 8px rgba(156,39,176,0.2)'; this.style.transform='translateX(5px)'"
                                onmouseout="this.style.boxShadow='none'; this.style.transform='translateX(0)'">
                                <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">
                                    👤 ${window.crmManager.escapeHtml(c.author_name || 'Nieznany')} • 
                                    ${new Date(c.created_at).toLocaleString('pl-PL')}
                                </div>
                                <div style="color: #1a2332; font-size: 0.95rem;">${window.crmManager.escapeHtml(c.content.substring(0, 100))}${c.content.length > 100 ? '...' : ''}</div>
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="window.crmManager.switchCaseTab(${caseId}, 'comments')" style="width: 100%; margin-top: 10px; padding: 12px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; box-shadow: 0 2px 8px rgba(212,175,55,0.3); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(212,175,55,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(212,175,55,0.3)'">
                        Zobacz wszystkie komentarze →
                    </button>
                </div>
            ` : ''}
            
            <!-- Przyciski do innych zakładek -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                <button onclick="window.crmManager.switchCaseTab(${caseId}, 'witnesses')" style="padding: 12px; background: linear-gradient(135deg, #d4af37, #FFD700); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem;">
                    👥 Świadkowie
                </button>
                <button onclick="window.crmManager.switchCaseTab(${caseId}, 'documents')" style="padding: 12px; background: linear-gradient(135deg, #d4af37, #FFD700); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem;">
                    📄 Dokumenty
                </button>
                <button onclick="window.crmManager.switchCaseTab(${caseId}, 'comments')" style="padding: 12px; background: linear-gradient(135deg, #d4af37, #FFD700); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem;">
                    💬 Wszystkie komentarze
                </button>
            </div>
        `;
    } catch (error) {
        console.error('Błąd ładowania podglądu:', error);
        container.innerHTML = `
            <div style="background: #f0f0f0; padding: 15px; border-radius: 12px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                    <button onclick="window.crmManager.switchCaseTab(${caseId}, 'events')" style="padding: 12px; background: linear-gradient(135deg, #d4af37, #FFD700); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        📅 Wydarzenia
                    </button>
                    <button onclick="window.crmManager.switchCaseTab(${caseId}, 'witnesses')" style="padding: 12px; background: linear-gradient(135deg, #d4af37, #FFD700); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        👥 Świadkowie
                    </button>
                    <button onclick="window.crmManager.switchCaseTab(${caseId}, 'documents')" style="padding: 12px; background: linear-gradient(135deg, #d4af37, #FFD700); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        📄 Dokumenty
                    </button>
                    <button onclick="window.crmManager.switchCaseTab(${caseId}, 'comments')" style="padding: 12px; background: linear-gradient(135deg, #d4af37, #FFD700); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        💬 Komentarze
                    </button>
                </div>
            </div>
        `;
    }
};

// Przejdź do konkretnego wydarzenia i podświetl je
window.goToEvent = function(caseId, eventId) {
    window.crmManager.switchCaseTab(caseId, 'events');
    
    setTimeout(() => {
        const eventElement = document.querySelector(`[data-event-id="${eventId}"]`);
        if (eventElement) {
            eventElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            const originalBg = eventElement.style.background;
            eventElement.style.background = 'linear-gradient(135deg, #fff3e0, #ffe0b2)';
            eventElement.style.boxShadow = '0 0 20px rgba(255,152,0,0.6)';
            eventElement.style.transform = 'scale(1.02)';
            eventElement.style.transition = 'all 0.3s ease';
            
            showNotification('✨ To jest to wydarzenie!', '#667eea');
            
            setTimeout(() => {
                eventElement.style.background = originalBg;
                eventElement.style.boxShadow = '';
                eventElement.style.transform = '';
            }, 3000);
        }
    }, 500);
};

// Przejdź do konkretnego świadka i podświetl go
window.goToWitness = function(caseId, witnessId) {
    window.crmManager.switchCaseTab(caseId, 'witnesses');
    
    setTimeout(() => {
        const witnessElement = document.querySelector(`[data-witness-id="${witnessId}"]`);
        if (witnessElement) {
            witnessElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            const originalBg = witnessElement.style.background;
            witnessElement.style.background = 'linear-gradient(135deg, #e3f2fd, #bbdefb)';
            witnessElement.style.boxShadow = '0 0 20px rgba(33,150,243,0.6)';
            witnessElement.style.transform = 'scale(1.02)';
            witnessElement.style.transition = 'all 0.3s ease';
            
            showNotification('✨ To jest ten świadek!', '#d4af37');
            
            setTimeout(() => {
                witnessElement.style.background = originalBg;
                witnessElement.style.boxShadow = '';
                witnessElement.style.transform = '';
            }, 3000);
        }
    }, 500);
};

// Przejdź do konkretnego dokumentu i podświetl go
window.goToDocument = function(caseId, documentId) {
    window.crmManager.switchCaseTab(caseId, 'documents');
    
    setTimeout(() => {
        const docElement = document.querySelector(`[data-document-id="${documentId}"]`);
        if (docElement) {
            docElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            const originalBg = docElement.style.background;
            docElement.style.background = 'linear-gradient(135deg, #e8f5e9, #c8e6c9)';
            docElement.style.boxShadow = '0 0 20px rgba(76,175,80,0.6)';
            docElement.style.transform = 'scale(1.02)';
            docElement.style.transition = 'all 0.3s ease';
            
            showNotification('✨ To jest ten dokument!', '#d4af37');
            
            setTimeout(() => {
                docElement.style.background = originalBg;
                docElement.style.boxShadow = '';
                docElement.style.transform = '';
            }, 3000);
        }
    }, 500);
};

// Przejdź do konkretnego dowodu i podświetl go
window.goToEvidence = function(caseId, evidenceId) {
    console.log('🔍 goToEvidence:', caseId, evidenceId);
    
    // Przełącz na zakładkę Dowody
    window.crmManager.switchCaseTab(caseId, 'evidence');
    
    // Szybkie przejście - minimalny czas oczekiwania
    setTimeout(() => {
        const evidenceElement = document.querySelector(`[data-evidence-id="${evidenceId}"]`);
        
        if (evidenceElement) {
            console.log('✅ Znaleziono element dowodu, podświetlam...');
            
            // Płynne przewinięcie do elementu
            evidenceElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
            });
            
            // Zapisz oryginalny styl
            const originalBg = evidenceElement.style.background;
            const originalBorder = evidenceElement.style.border;
            const originalBoxShadow = evidenceElement.style.boxShadow;
            const originalTransform = evidenceElement.style.transform;
            
            // Dodaj płynną animację podświetlenia
            evidenceElement.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            evidenceElement.style.background = 'linear-gradient(135deg, #fff3e0, #ffe0b2)';
            evidenceElement.style.border = '3px solid #f39c12';
            evidenceElement.style.boxShadow = '0 8px 32px rgba(243,156,18,0.5), 0 0 0 4px rgba(243,156,18,0.1)';
            evidenceElement.style.transform = 'scale(1.03) translateY(-4px)';
            
            // Pokaż notyfikację
            showNotification('✨ To jest ten dowód!', '#f39c12');
            
            // Animacja pulsowania (3 razy)
            let pulseCount = 0;
            const pulseInterval = setInterval(() => {
                if (pulseCount >= 3) {
                    clearInterval(pulseInterval);
                    
                    // Przywróć oryginalny wygląd po 3 sekundach
                    setTimeout(() => {
                        evidenceElement.style.transition = 'all 0.5s ease';
                        evidenceElement.style.background = originalBg;
                        evidenceElement.style.border = originalBorder;
                        evidenceElement.style.boxShadow = originalBoxShadow;
                        evidenceElement.style.transform = originalTransform;
                    }, 2000);
                    return;
                }
                
                // Pulsuj
                evidenceElement.style.transform = pulseCount % 2 === 0 
                    ? 'scale(1.05) translateY(-6px)' 
                    : 'scale(1.03) translateY(-4px)';
                pulseCount++;
            }, 400);
            
        } else {
            console.warn('⚠️ Nie znaleziono elementu dowodu:', evidenceId);
            console.log('📋 Dostępne elementy z data-evidence-id:', 
                Array.from(document.querySelectorAll('[data-evidence-id]')).map(el => el.getAttribute('data-evidence-id')));
        }
    }, 400); // Skrócony czas dla szybszego przejścia
};

// Funkcja pomocnicza do pokazywania notyfikacji
function showNotification(text, color) {
    const notification = document.createElement('div');
    notification.style.cssText = `position: fixed; top: 20px; right: 20px; background: ${color}; color: white; padding: 15px 25px; border-radius: 8px; z-index: 10000; font-weight: 600; box-shadow: 0 4px 15px rgba(0,0,0,0.3); animation: fadeIn 0.3s ease;`;
    notification.textContent = text;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// Przejdź do konkretnego komentarza i podświetl go
window.goToComment = function(caseId, commentId) {
    // Przejdź do zakładki komentarze
    window.crmManager.switchCaseTab(caseId, 'comments');
    
    // Poczekaj aż zakładka się załaduje, potem podświetl komentarz
    setTimeout(() => {
        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
        if (commentElement) {
            // Przewiń do komentarza
            commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Podświetl komentarz
            const originalBg = commentElement.style.background;
            commentElement.style.background = 'linear-gradient(135deg, #fff3e0, #ffecb3)';
            commentElement.style.boxShadow = '0 0 20px rgba(255,152,0,0.5)';
            commentElement.style.transform = 'scale(1.02)';
            commentElement.style.transition = 'all 0.3s ease';
            
            // Pokaż notyfikację
            showNotification('✨ To jest ten komentarz!', '#d4af37');
            
            // Usuń podświetlenie po 3 sekundach
            setTimeout(() => {
                commentElement.style.background = originalBg;
                commentElement.style.boxShadow = '';
                commentElement.style.transform = '';
            }, 3000);
        } else {
            console.warn('Nie znaleziono komentarza o ID:', commentId);
        }
    }, 500);
};

// Ładowanie dashboardu sprawy (wydarzenia, świadkowie, komentarze)
window.crmManager.loadCaseDashboard = async function(caseId) {
    try {
        console.log('📊 Ładuję dashboard dla sprawy:', caseId);
        const container = document.getElementById(`caseDashboard_${caseId}`);
        if (!container) {
            console.warn('⚠️ Kontener dashboardu nie istnieje');
            return;
        }
        
        // Pobierz dane wydarzenia
        let events = [];
        let witnesses = [];
        let comments = [];
        
        try {
            const eventsResp = await window.api.request(`/events?case_id=${caseId}`);
            events = eventsResp.events || [];
            console.log('✅ Wydarzenia załadowane:', events.length);
        } catch (err) {
            console.error('❌ Błąd ładowania wydarzeń:', err);
        }
        
        try {
            const witnessesResp = await window.api.request(`/witnesses?case_id=${caseId}`);
            witnesses = witnessesResp.witnesses || [];
            console.log('✅ Świadkowie załadowani:', witnesses.length);
        } catch (err) {
            console.log('⚠️ Brak endpointu świadków lub błąd:', err.message);
        }
        
        try {
            const commentsResp = await window.api.request(`/comments/case/${caseId}`);
            comments = commentsResp.comments || commentsResp || [];
            console.log('✅ Komentarze załadowane:', comments.length);
        } catch (err) {
            console.log('⚠️ Brak komentarzy lub błąd:', err.message);
            comments = []; // Ustaw pustą tablicę jeśli błąd
        }
        
        // Nadchodzące wydarzenia (max 5)
        const now = new Date();
        const upcomingEvents = events
            .filter(e => {
                try {
                    return new Date(e.start_date) >= now;
                } catch {
                    return false;
                }
            })
            .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
            .slice(0, 5);
        
        console.log('📅 Nadchodzące wydarzenia:', upcomingEvents.length);
        
        // Ostatnie komentarze (max 3)
        const recentComments = Array.isArray(comments) ? comments.slice(0, 3) : [];
        
        container.innerHTML = `
            <!-- Nadchodzące wydarzenia -->
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 20px; border-radius: 12px; color: white; margin-bottom: 20px; border-left: 4px solid #FFD700;">
                <h3 style="margin: 0 0 15px 0;">📅 Nadchodzące wydarzenia (${upcomingEvents.length})</h3>
                ${upcomingEvents.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${upcomingEvents.map(e => {
                            const date = new Date(e.start_date);
                            const daysUntil = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
                            return `
                                <div style="background: rgba(255,255,255,0.15); padding: 12px; border-radius: 8px;">
                                    <div style="font-weight: 700; margin-bottom: 5px;">${window.crmManager.escapeHtml(e.title)}</div>
                                    <div style="font-size: 0.85rem; opacity: 0.9;">
                                        📅 ${date.toLocaleString('pl-PL')} • 
                                        ${daysUntil === 0 ? '🔥 DZIŚ!' : daysUntil === 1 ? '⚡ Jutro' : `Za ${daysUntil} dni`}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <button onclick="window.crmManager.switchCaseTab(${caseId}, 'events')" style="width: 100%; margin-top: 10px; padding: 12px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; box-shadow: 0 2px 8px rgba(212,175,55,0.3); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(212,175,55,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(212,175,55,0.3)'">
                        Zobacz wszystkie wydarzenia (${events.length})
                    </button>
                ` : '<p style="opacity: 0.8; margin: 0;">Brak nadchodzących wydarzeń</p>'}
            </div>
            
            <!-- Świadkowie -->
            ${witnesses.length > 0 ? `
                <div style="background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15)); padding: 20px; border-radius: 12px; border-left: 4px solid #d4af37; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; color: #1a2332;">👥 Świadkowie (${witnesses.length})</h3>
                    <div style="display: grid; gap: 10px;">
                        ${witnesses.slice(0, 3).map(w => `
                            <div style="background: white; padding: 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: 700; color: #1a2332;">${window.crmManager.escapeHtml(w.name)}</div>
                                    <div style="font-size: 0.85rem; color: #666;">${window.crmManager.escapeHtml(w.role || 'Świadek')}</div>
                                </div>
                                ${w.withdrawn ? '<span style="color: #dc3545; font-weight: 600;">⚠️ Wycofany</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                    ${witnesses.length > 3 ? `
                        <button onclick="window.crmManager.switchCaseTab(${caseId}, 'witnesses')" style="width: 100%; margin-top: 10px; padding: 10px; background: linear-gradient(135deg, #d4af37, #FFD700); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 700;">
                            Zobacz wszystkich świadków (${witnesses.length})
                        </button>
                    ` : ''}
                </div>
            ` : ''}
            
            <!-- Ostatnie komentarze -->
            ${recentComments.length > 0 ? `
                <div style="background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15)); padding: 20px; border-radius: 12px; border-left: 4px solid #d4af37; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; color: #1a2332;">💬 Ostatnie komentarze (${comments.length})</h3>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${recentComments.map(c => `
                            <div style="background: white; padding: 12px; border-radius: 6px;">
                                <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">
                                    👤 ${window.crmManager.escapeHtml(c.author_name || 'Nieznany')} • 
                                    ${new Date(c.created_at).toLocaleString('pl-PL')}
                                </div>
                                <div style="color: #1a2332;">${window.crmManager.escapeHtml(c.content)}</div>
                            </div>
                        `).join('')}
                    </div>
                    ${comments.length > 3 ? `
                        <button onclick="window.crmManager.switchCaseTab(${caseId}, 'comments')" style="width: 100%; margin-top: 10px; padding: 12px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; box-shadow: 0 2px 8px rgba(212,175,55,0.3); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(212,175,55,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(212,175,55,0.3)'">
                            Zobacz wszystkie komentarze (${comments.length})
                        </button>
                    ` : ''}
                </div>
            ` : ''}
            
            <!-- Statystyki -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 20px; border-radius: 12px; color: white; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; margin-bottom: 5px;">${events.length}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Wydarzeń</div>
                </div>
                <div style="background: linear-gradient(135deg, #2196f3, #1976d2); padding: 20px; border-radius: 12px; color: white; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; margin-bottom: 5px;">${witnesses.length}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Świadków</div>
                </div>
                <div style="background: linear-gradient(135deg, #9c27b0, #7b1fa2); padding: 20px; border-radius: 12px; color: white; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; margin-bottom: 5px;">${comments.length}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Komentarzy</div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('❌ Błąd ładowania dashboardu:', error);
        const container = document.getElementById(`caseDashboard_${caseId}`);
        if (container) {
            container.innerHTML = `
                <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; text-align: center;">
                    <p style="color: #856404; font-weight: 600; margin: 0 0 10px 0;">⚠️ Dashboard tymczasowo niedostępny</p>
                    <p style="color: #666; margin: 0; font-size: 0.9rem;">Skorzystaj z innych zakładek: Wydarzenia, Świadkowie, Dokumenty</p>
                    <button onclick="window.crmManager.loadCaseDashboard(${caseId})" style="margin-top: 15px; padding: 10px 20px; background: #ffc107; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        🔄 Spróbuj ponownie
                    </button>
                </div>
            `;
        }
    } finally {
        // Zawsze upewnij się że komunikat "Ładowanie..." zniknie
        const container = document.getElementById(`caseDashboard_${caseId}`);
        if (container && container.textContent.includes('Ładowanie')) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <p style="color: #999; margin-bottom: 15px;">Dashboard jest ładowany asynchronicznie</p>
                    <button onclick="window.crmManager.switchCaseTab(${caseId}, 'events')" style="padding: 10px 20px; background: linear-gradient(135deg, #d4af37, #FFD700); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; margin-right: 10px;">
                        📅 Zobacz wydarzenia
                    </button>
                    <button onclick="window.crmManager.switchCaseTab(${caseId}, 'witnesses')" style="padding: 10px 20px; background: linear-gradient(135deg, #d4af37, #FFD700); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        👥 Zobacz świadków
                    </button>
                </div>
            `;
        }
    }
};

// Renderowanie zakładki Dokumenty
window.crmManager.renderCaseDocumentsTab = async function(caseId) {
    try {
        const response = await window.api.request(`/cases/${caseId}/documents`);
        const documents = response.documents || [];
    
    const addButtonHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15)); border-radius: 12px; margin-bottom: 20px; border: 2px solid #d4af37;">
            <h3 style="margin: 0; font-size: 1.3rem; font-weight: 800; color: #1a2332 !important;">📋 Dokumenty w sprawie</h3>
            <button onclick="crmManager.showAddCaseDocument(${caseId})" style="padding: 14px 28px; background: linear-gradient(135deg, #1a2332, #2c3e50); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 1.05rem; box-shadow: 0 4px 15px rgba(26,35,50,0.3); transition: all 0.3s; display: inline-flex; align-items: center; gap: 10px;"
                onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 20px rgba(26,35,50,0.5)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(26,35,50,0.3)'">
                <span style="font-size: 1.3rem;">➕</span>
                <span>Dodaj nowy dokument</span>
            </button>
        </div>
    `;
    
    if (documents.length === 0) {
        return addButtonHtml + '<p style="text-align: center; color: #999; padding: 20px;">Brak dokumentów w sprawie</p>';
    }
    
    // Grupuj dokumenty po kategorii
    const grouped = {};
    documents.forEach(doc => {
        const category = doc.category || 'INN';
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(doc);
    });
    
    // Sortuj dokumenty w każdej kategorii - najnowsze na górze
    Object.keys(grouped).forEach(category => {
        grouped[category].sort((a, b) => {
            const dateA = new Date(a.uploaded_at);
            const dateB = new Date(b.uploaded_at);
            return dateB - dateA; // DESC - najnowsze na górze
        });
    });
    
    // Mapowanie kategorii na nazwy
    const categoryNames = {
        'POZ': '📄 Pozwy',
        'ODP': '📝 Odpowiedzi na pozew',
        'WNI': '📑 Wnioski',
        'ZAL': '📎 Załączniki',
        'ODW': '🔄 Odwołania',
        'ZAZ': '⚡ Zażalenia',
        'WYR': '⚖️ Wyroki',
        'POS': '📋 Postanowienia',
        'NAK': '📜 Nakazy zapłaty',
        'UZA': '✅ Uzasadnienia',
        'UMO': '💼 Umowy',
        'FAK': '💰 Faktury',
        'RAC': '🧾 Rachunki',
        'PRZ': '📤 Przelewy',
        'KOR': '📧 Korespondencja',
        'POC': '📨 Poczta',
        'ZAW': '📬 Zawiadomienia',
        'WEZ': '📞 Wezwania',
        'ZDJ': '📸 Zdjęcia',
        'NAG': '🎥 Nagrania',
        'EKS': '🔬 Ekspertyzy',
        'NOT': '📝 Notatki',
        'zeznanie': '👤 Zeznania świadków',
        'świadek': '👥 Dokumenty świadków',
        'INN': '📂 Inne dokumenty'
    };
    
    // Sortuj kategorie według priorytetu
    const categoryPriority = {
        'POZ': 1, 'ODP': 2, 'WNI': 3, 'zeznanie': 4, 'świadek': 5,
        'ZAL': 6, 'WYR': 7, 'POS': 8, 'NAK': 9, 'UZA': 10,
        'ODW': 11, 'ZAZ': 12, 'UMO': 13, 'FAK': 14, 'RAC': 15,
        'PRZ': 16, 'KOR': 17, 'POC': 18, 'ZAW': 19, 'WEZ': 20,
        'ZDJ': 21, 'NAG': 22, 'EKS': 23, 'NOT': 24, 'INN': 999
    };
    const sortedCategories = Object.keys(grouped).sort((a, b) => {
        return (categoryPriority[a] || 999) - (categoryPriority[b] || 999);
    });
    
    // Generuj bezpieczne ID dla kategorii
    const safeCategoryId = (cat) => {
        return 'cat_' + cat.replace(/[^a-zA-Z0-9]/g, '_');
    };
    
    // Funkcja przełączania zakładek - dodajemy PRZED renderowaniem
    if (!window.crmManager.switchDocCategory) {
        window.crmManager.switchDocCategory = function(categoryId) {
            console.log('🔄 Przełączam na kategorię:', categoryId);
            
            // Ukryj wszystkie content areas
            document.querySelectorAll('.doc-category-content').forEach(el => {
                el.style.display = 'none';
            });
            
            // Usuń active ze wszystkich tabów
            document.querySelectorAll('.doc-category-tab').forEach(tab => {
                tab.classList.remove('active');
                tab.style.background = 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15))';
                tab.style.border = '2px solid #000000';
                tab.style.borderBottom = 'none';
                tab.style.borderLeft = 'transparent';
                tab.style.color = '#1a2332';
            });
            
            // Pokaż wybrany content
            const content = document.getElementById(categoryId);
            if (content) {
                content.style.display = 'block';
                console.log('✅ Pokazano content:', categoryId);
            } else {
                console.error('❌ Nie znaleziono content:', categoryId);
            }
            
            // Dodaj active do wybranego taba
            const tab = document.getElementById('tab_' + categoryId);
            if (tab) {
                tab.classList.add('active');
                tab.style.background = 'linear-gradient(135deg, #FFD700, #d4af37)';
                tab.style.border = '2px solid #1a2332';
                tab.style.borderBottom = 'none';
                tab.style.borderLeft = '4px solid #d4af37';
                console.log('✅ Podświetlono tab:', categoryId);
            } else {
                console.error('❌ Nie znaleziono tab:', categoryId);
            }
        };
    }
    
    return `
        <style>
            @keyframes pulseRetracted {
                0%, 100% { 
                    transform: scale(1);
                    box-shadow: 0 3px 10px rgba(220,53,69,0.5);
                }
                50% { 
                    transform: scale(1.05);
                    box-shadow: 0 5px 15px rgba(220,53,69,0.7);
                }
            }
            
            /* Ukryj scrollbar ale zachowaj funkcjonalność przewijania */
            .doc-tabs-container::-webkit-scrollbar {
                height: 6px;
            }
            .doc-tabs-container::-webkit-scrollbar-track {
                background: transparent;
            }
            .doc-tabs-container::-webkit-scrollbar-thumb {
                background: rgba(0,0,0,0.2);
                border-radius: 3px;
            }
            .doc-tabs-container::-webkit-scrollbar-thumb:hover {
                background: rgba(0,0,0,0.4);
            }
            
            /* Dla Firefox */
            .doc-tabs-container {
                scrollbar-width: thin;
                scrollbar-color: rgba(0,0,0,0.2) transparent;
            }
            
            /* RESPONSYWNOŚĆ - MAŁE EKRANY */
            @media (max-width: 768px) {
                .doc-category-tab {
                    padding: 8px 12px !important;
                    font-size: 0.8rem !important;
                    gap: 4px !important;
                }
                .doc-category-tab span:first-child {
                    font-size: 0.8rem !important;
                }
                .doc-category-tab span:last-child {
                    padding: 2px 6px !important;
                    font-size: 0.65rem !important;
                }
                .doc-tabs-container {
                    gap: 4px !important;
                    padding: 8px 0 !important;
                }
            }
            
            @media (max-width: 480px) {
                .doc-category-tab {
                    padding: 6px 10px !important;
                    font-size: 0.75rem !important;
                }
                .doc-category-tab span:first-child {
                    font-size: 0.75rem !important;
                }
                .doc-category-tab span:last-child {
                    padding: 2px 5px !important;
                    font-size: 0.6rem !important;
                }
            }
        </style>
        <div style="padding: 20px;">
            
            <!-- Nagłówek z przyciskiem - NORMALNY (nie sticky) -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15)); border-radius: 12px 12px 0 0; margin-bottom: 0; border: 2px solid #d4af37; border-bottom: none;">
                <h3 style="margin: 0; font-size: 1.3rem; font-weight: 800; color: #1a2332 !important;">📋 Dokumenty w sprawie</h3>
                <button onclick="crmManager.showAddCaseDocument(${caseId})" style="padding: 14px 28px; background: linear-gradient(135deg, #1a2332, #2c3e50); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 1.05rem; box-shadow: 0 4px 15px rgba(26,35,50,0.3); transition: all 0.3s; display: inline-flex; align-items: center; gap: 10px;"
                    onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 20px rgba(26,35,50,0.5)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(26,35,50,0.3)'">
                    <span style="font-size: 1.3rem;">➕</span>
                    <span>Dodaj nowy dokument</span>
                </button>
            </div>
            
            <!-- TYLKO ZAKŁADKI - STICKY BEZPOŚREDNIO POD NAGŁÓWKIEM -->
            <div style="position: -webkit-sticky; position: sticky; top: 0; left: 0; right: 0; background: white; z-index: 1000; margin: 0 -20px 20px -20px; padding: 10px 20px; border-top: 2px solid #d4af37; border-bottom: 3px solid #d4af37; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <div class="doc-tabs-container" style="display: flex; gap: 8px; overflow-x: auto; overflow-y: hidden; padding: 10px 0; -webkit-overflow-scrolling: touch; scroll-behavior: smooth; scrollbar-width: thin;">
                    ${sortedCategories.map((category, index) => `
                        <button 
                            onclick="window.crmManager.switchDocCategory('${safeCategoryId(category)}')"
                            id="tab_${safeCategoryId(category)}"
                            class="doc-category-tab ${index === 0 ? 'active' : ''}"
                            aria-label="${categoryNames[category] || category}"
                            style="padding: 10px 20px; background: ${index === 0 ? 'linear-gradient(135deg, #FFD700, #d4af37)' : 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15))'}; border: 2px solid ${index === 0 ? '#1a2332' : '#000000'}; border-bottom: none; border-left: 4px solid ${index === 0 ? '#d4af37' : 'transparent'}; border-radius: 10px 10px 0 0; cursor: pointer; font-size: 0.95rem; font-weight: 800; color: ${index === 0 ? '#000000' : '#1a2332 !important'}; text-shadow: ${index === 0 ? '0 1px 2px rgba(255,255,255,0.8)' : 'none'}; transition: all 0.3s; white-space: nowrap; display: inline-flex; align-items: center; gap: 8px; position: relative; top: 3px;"
                            onmouseover="if(!this.classList.contains('active')) this.style.background='linear-gradient(135deg, rgba(255,215,0,0.3), rgba(212,175,55,0.3))'"
                            onmouseout="if(!this.classList.contains('active')) this.style.background='linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15))'">
                            <span>${categoryNames[category] || category}</span>
                            <span style="background: #1a2332; color: white; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;">
                                ${grouped[category].length}
                            </span>
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <!-- CONTENT AREAS - Po jednej dla każdej kategorii -->
            ${sortedCategories.map((category, index) => `
                <div id="${safeCategoryId(category)}" class="doc-category-content" style="display: ${index === 0 ? 'block' : 'none'};">
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        ${grouped[category].map(doc => {
                const isRetracted = doc.is_retracted === 1 || doc.is_retracted === true;
                return `
                <div data-document-id="${doc.id}" style="background: ${isRetracted ? 'linear-gradient(135deg, #ffebee, #ffcdd2)' : 'white'}; padding: 20px; border-radius: 10px; border-left: 5px solid ${isRetracted ? '#dc3545' : '#d4af37'}; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; position: relative;" onmouseover="this.style.boxShadow='0 5px 20px rgba(${isRetracted ? '220, 53, 69' : '212, 175, 55'}, 0.3)'; this.style.transform='translateY(-3px)';" onmouseout="this.style.boxShadow='0 3px 10px rgba(0, 0, 0, 0.1)'; this.style.transform='translateY(0)';">
                    ${isRetracted ? `
                        <div style="position: absolute; top: 10px; right: 10px; background: #dc3545; color: white; padding: 8px 14px; border-radius: 8px; font-weight: 800; font-size: 0.9rem; box-shadow: 0 3px 10px rgba(220,53,69,0.5); animation: pulseRetracted 2s infinite; z-index: 10;">
                            🚫 WYCOFANE
                        </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="display: flex; gap: 10px; margin-bottom: 8px;">
                                ${(doc.attachment_code || doc.document_number) ? `
                                    <span style="background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; padding: 8px 16px; border-radius: 10px; font-size: 1rem; font-weight: 800; font-family: 'Courier New', monospace; letter-spacing: 1px; box-shadow: 0 3px 10px rgba(212, 175, 55, 0.4); white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;">
                                        <span style="font-size: 1.2rem;">🔢</span>
                                        <span>${window.crmManager.escapeHtml(doc.attachment_code || doc.document_number)}</span>
                                    </span>
                                ` : `
                                    <span style="background: #95a5a6; color: white; padding: 6px 14px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; font-style: italic; display: inline-flex; align-items: center; gap: 5px;">
                                        <span style="font-size: 1.1rem;">⚠️</span>
                                        <span>Brak kodu</span>
                                    </span>
                                `}
                                ${doc.category ? `<span style="background: linear-gradient(135deg, #e0e0e0, #d0d0d0); padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; color: #1a2332;">${window.crmManager.escapeHtml(doc.category)}</span>` : ''}
                            </div>
                            <h4 style="margin: 0 0 12px 0; font-size: 1.3rem; font-weight: 800; color: ${isRetracted ? '#c0392b' : '#1a2332'} !important; display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 1.5rem;">${isRetracted ? '🚫' : '📄'}</span>
                                <span>${window.crmManager.escapeHtml(doc.title || doc.filename || 'Bez tytułu')}</span>
                            </h4>
                            <div style="font-size: 1rem; color: #1a2332 !important; font-weight: 600; line-height: 1.8; display: flex; flex-wrap: wrap; gap: 12px;">
                                <span style="display: inline-flex; align-items: center; gap: 6px;">
                                    <span style="font-size: 1.2rem;">📅</span>
                                    <span>${new Date(doc.uploaded_at + 'Z').toLocaleString('pl-PL')}</span>
                                </span>
                                ${doc.filename ? `
                                <span style="display: inline-flex; align-items: center; gap: 6px;">
                                    <span style="font-size: 1.2rem;">📄</span>
                                    <span style="font-weight: 800; color: #d4af37 !important;">${window.crmManager.escapeHtml(doc.filename)}</span>
                                </span>
                                ` : '<span style="display: inline-flex; align-items: center; gap: 6px; color: #999;"><span style="font-size: 1.2rem;">📝</span><span>Zeznanie tekstowe</span></span>'}
                                ${doc.uploaded_by_name ? `
                                    <span style="display: inline-flex; align-items: center; gap: 6px;">
                                        <span style="font-size: 1.2rem;">👤</span>
                                        <span>${window.crmManager.escapeHtml(doc.uploaded_by_name)}</span>
                                    </span>
                                ` : ''}
                            </div>
                            ${doc.description ? `
                                <div style="margin-top: 12px; padding: 12px 15px; background: linear-gradient(135deg, #fffbf0, #fff8e7); border-left: 4px solid #d4af37; border-radius: 6px;">
                                    <div style="font-size: 0.85rem; color: #1a2332 !important; font-weight: 700; margin-bottom: 4px;">📝 Opis:</div>
                                    <div style="color: #1a2332 !important; font-size: 0.95rem; line-height: 1.6; white-space: pre-wrap; font-weight: 600;">${window.crmManager.escapeHtml(doc.description)}</div>
                                </div>
                            ` : ''}
                        </div>
                        ${doc.filename ? `
                        <div style="display: flex; gap: 12px; flex-direction: column;">
                            <button onclick="crmManager.viewDocument(${doc.id}, ${caseId}, '${doc.source_type || 'document'}')" 
                                style="padding: 12px 20px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem; box-shadow: 0 3px 10px rgba(212,175,55,0.3); transition: all 0.3s; white-space: nowrap; display: inline-flex; align-items: center; gap: 8px; justify-content: center;"
                                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(212,175,55,0.5)'"
                                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 3px 10px rgba(212,175,55,0.3)'">
                                <span style="font-size: 1.2rem;">👁️</span>
                                <span>Pokaż</span>
                            </button>
                            <button onclick="crmManager.downloadDocument(${doc.id}, ${JSON.stringify(window.crmManager.escapeHtml(doc.filename))}, '${doc.source_type || 'document'}', ${caseId})" 
                                style="padding: 12px 20px; background: linear-gradient(135deg, #1a2332, #2c3e50); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem; box-shadow: 0 3px 10px rgba(26,35,50,0.3); transition: all 0.3s; white-space: nowrap; display: inline-flex; align-items: center; gap: 8px; justify-content: center;"
                                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(26,35,50,0.5)'"
                                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 3px 10px rgba(26,35,50,0.3)'">
                                <span style="font-size: 1.2rem;">📥</span>
                                <span>Pobierz</span>
                            </button>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
            }).join('')}
                    </div>
                </div>
            `).join('')}
            
            <!-- SCROLL TO TOP BUTTON -->
            <button 
                onclick="window.scrollTo({top: 0, behavior: 'smooth'})" 
                style="position: fixed; bottom: 30px; right: 30px; width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; box-shadow: 0 4px 15px rgba(212,175,55,0.4); cursor: pointer; font-size: 1.5rem; transition: all 0.3s; z-index: 1000; display: flex; align-items: center; justify-content: center;"
                onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 20px rgba(212,175,55,0.6)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(212,175,55,0.4)'"
                aria-label="Przewiń do góry"
                title="Przewiń do góry">
                ⬆️
            </button>
        </div>
    `;
    } catch (error) {
        console.error('❌ Błąd ładowania dokumentów:', error);
        return `
            <div style="padding: 60px 20px; text-align: center; background: linear-gradient(135deg, #fff5f5, #ffebee); border-radius: 12px; border: 2px solid #dc3545;">
                <div style="font-size: 4rem; margin-bottom: 20px; opacity: 0.5;">⚠️</div>
                <h3 style="color: #dc3545; margin: 0 0 15px 0; font-size: 1.5rem; font-weight: 800;">Błąd ładowania dokumentów</h3>
                <p style="color: #666; margin: 0 0 25px 0; font-size: 1rem;">Nie udało się pobrać dokumentów z serwera</p>
                <button 
                    onclick="window.crmManager.switchCaseTab(${caseId}, 'documents')" 
                    style="padding: 12px 24px; background: linear-gradient(135deg, #dc3545, #c0392b); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem; box-shadow: 0 3px 10px rgba(220,53,69,0.3); transition: all 0.3s;"
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(220,53,69,0.5)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 3px 10px rgba(220,53,69,0.3)'">
                    🔄 Spróbuj ponownie
                </button>
                <div style="margin-top: 15px; padding: 12px; background: white; border-radius: 6px; font-size: 0.85rem; color: #999; font-family: monospace;">
                    ${error.message || 'Nieznany błąd'}
                </div>
            </div>
        `;
    }
};

// === NOWY PROSTY MODAL WYDARZEŃ ===
window.showEnhancedEventForm = function(caseId) {
    console.log(' showEnhancedEventForm wywołane, caseId:', caseId);
    console.log(' Typ caseId:', typeof caseId);
    console.log(' Wartość caseId:', caseId);

    if (!caseId) {
        console.error(' Brak caseId!');
        alert('Błąd: Nie można dodać wydarzenia bez ID sprawy');
        return;
    }

    // Zapisz caseId globalnie dla funkcji dynamicznych
    window._currentEventCaseId = caseId;
    console.log(' Zapisano caseId do window._currentEventCaseId:', window._currentEventCaseId);

    // Usuń stary modal jeśli istnieje
    const oldModal = document.getElementById('enhancedEventModal');
    if (oldModal) {
        console.log(' Usuwam stary modal');
        oldModal.remove();
    }
    
    console.log('✅ Tworzę nowy modal...');
    
    const modal = document.createElement('div');
    modal.id = 'enhancedEventModal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0); z-index: 10001; display: flex; justify-content: center; align-items: center; padding: 20px; transition: background 0.4s ease;';
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 16px; width: 90vw; max-width: 1600px; height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
            <!-- HEADER - Sticky, nie scrolluje -->
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 25px; border-radius: 16px 16px 0 0; color: white; flex-shrink: 0; min-height: 80px; display: flex; flex-direction: column; justify-content: center;">
                <h3 style="margin: 0; font-size: 1.8rem; font-weight: 700;">📅 Dodaj nowe wydarzenie</h3>
                <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 1.05rem;">Wybierz typ i uzupełnij szczegóły - Modal 90% ekranu dla lepszej czytelności</p>
            </div>
            
            <!-- CONTENT - Scrollable -->
            <div style="flex: 1; overflow-y: auto; padding: 30px; background: #fafafa;">
                <div style="margin-bottom: 25px;">
                    <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px; font-size: 1.05rem;">Typ wydarzenia *</label>
                    <select id="eventTypeSelect" onchange="window.updateDynamicFields()" style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                        <option value="">-- Wybierz typ --</option>
                        <option value="negotiation">🤝 Negocjacje</option>
                        <option value="court">⚖️ Rozprawa sądowa</option>
                        <option value="meeting">👥 Spotkanie</option>
                        <option value="deadline">⏰ Termin procesowy</option>
                        <option value="mediation">🕊️ Mediacja</option>
                        <option value="expertise">🔬 Ekspertyza/Oględziny</option>
                        <option value="document">📄 Złożenie dokumentu</option>
                        <option value="hearing">🗣️ Przesłuchanie</option>
                        <option value="consultation">💼 Konsultacja</option>
                        <option value="task">✅ Zadanie</option>
                        <option value="other">📝 Inne</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Tytuł wydarzenia *</label>
                    <input type="text" id="eventTitle" list="eventTitleSuggestions" placeholder="Wybierz typ wydarzenia, aby zobaczyć sugestie..." 
                        style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    <datalist id="eventTitleSuggestions">
                        <option value="Wybierz typ wydarzenia...">
                    </datalist>
                    <small style="color: #999; font-size: 0.85rem; display: block; margin-top: 5px;">💡 Zacznij pisać lub wybierz z sugestii</small>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">⚡ Szybki wybór daty</label>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 15px;">
                        <button type="button" onclick="window.setQuickDate(1)" style="padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 600;">📅 Jutro</button>
                        <button type="button" onclick="window.setQuickDate(3)" style="padding: 8px 16px; background: #2ecc71; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 600;">📅 Za 3 dni</button>
                        <button type="button" onclick="window.setQuickDate(7)" style="padding: 8px 16px; background: #9b59b6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 600;">📅 Za tydzień</button>
                        <button type="button" onclick="window.setQuickDate(14)" style="padding: 8px 16px; background: #e67e22; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 600;">📅 Za 2 tygodnie</button>
                        <button type="button" onclick="window.setQuickDate(30)" style="padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 600;">📅 Za miesiąc</button>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Data * <span id="selectedDateLabel" style="color: #d4af37; font-weight: 600;"></span></label>
                        <input type="date" id="eventDate" 
                            onchange="window._selectedEventDate = this.value; console.log('🔒 ZAPISANO datę:', this.value); window.updateDateLabel();" 
                            oninput="window._selectedEventDate = this.value; console.log('🔒 ZAPISANO datę (input):', this.value); window.updateDateLabel();"
                            style="width: 100%; padding: 14px; border: 2px solid #667eea; border-radius: 8px; font-size: 1.1rem; font-weight: 600;">
                        <div style="margin-top: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px; font-size: 0.9rem; color: #666;">
                            💡 Kliknij w pole i wybierz datę z kalendarza
                        </div>
                    </div>
                    <div>
                        <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Godzina *</label>
                        <input type="time" id="eventTime" 
                            onchange="window._selectedEventTime = this.value; console.log('🔒 ZAPISANO godzinę:', this.value);" 
                            oninput="window._selectedEventTime = this.value; console.log('🔒 ZAPISANO godzinę (input):', this.value);"
                            style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    </div>
                </div>
                
                <div style="margin-bottom: 20px; background: #f0f8ff; padding: 15px; border-radius: 8px; border: 2px solid #d4af37;">
                    <label style="display: block; color: #1565c0; font-weight: 700; margin-bottom: 10px; font-size: 1.1rem;">📍 Lokalizacja / Adres <span style="color: #ff5722; font-size: 0.9rem;">(Opcjonalne, ale zalecane!)</span></label>
                    
                    <!-- Wyszukiwarka Mapbox - autouzupełnianie wbudowane! -->
                    <div id="mapboxGeocoder" style="margin-bottom: 15px;"></div>
                    
                    <!-- Mapa Mapbox -->
                    <div id="mapboxMap" style="width: 100%; height: 350px; border-radius: 8px; border: 2px solid #d4af37;"></div>
                    
                    <!-- Ukryte pole do przechowania wybranego adresu -->
                    <input type="hidden" id="eventLocation">
                    
                    <small style="color: #1a2332; font-size: 0.9rem; display: block; margin-top: 8px; font-weight: 600;">💡 Wpisz adres w wyszukiwarkę powyżej lub kliknij na mapie</small>
                </div>
                
                <div id="dynamicFields"></div>
                
                <div style="margin-bottom: 20px; background: #fff8e1; padding: 15px; border-radius: 8px; border: 2px solid #ffa726;">
                    <label style="display: block; color: #e65100; font-weight: 700; margin-bottom: 10px; font-size: 1.1rem;">📝 Opis / Notatki <span style="color: #ff5722; font-size: 0.9rem;">(Opcjonalne, ale zalecane!)</span></label>
                    <textarea id="eventDescription" rows="5" placeholder="Wpisz szczegóły, ważne informacje, cel spotkania, przygotowania..." 
                        oninput="window._selectedDescription = this.value; console.log('🔒 ZAPISANO opis (input):', this.value.substring(0, 50) + '...');"
                        onchange="window._selectedDescription = this.value; console.log('🔒 ZAPISANO opis (change):', this.value.substring(0, 50) + '...');"
                        style="width: 100%; padding: 14px; border: 2px solid #ffa726; border-radius: 8px; font-size: 1.05rem; resize: vertical; background: white; font-family: inherit;"></textarea>
                    <small style="color: #f57c00; font-size: 0.9rem; display: block; margin-top: 8px; font-weight: 600;">💡 Dodaj opis aby później łatwo przypomnieć sobie szczegóły</small>
                </div>
                
                <!-- ZAŁĄCZNIKI - DOWODY Z ZAKŁADKI "DOWODY" -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">📎 Dołącz dowody do wydarzenia</label>
                    
                    <!-- ISTNIEJĄCE DOWODY -->
                    <div style="background: #fff3e0; padding: 15px; border-radius: 8px; border: 2px solid #ff9800;">
                        <h4 style="margin: 0 0 10px 0; color: #e65100; font-size: 1rem;">📋 Wybierz dowody z zakładki "Dowody"</h4>
                        <div id="existingDocumentsList" style="max-height: 250px; overflow-y: auto; border: 2px solid #ffcc80; border-radius: 8px; padding: 10px; background: white;">
                            <p style="color: #999; text-align: center; padding: 20px;">Ładowanie dowodów...</p>
                        </div>
                        <small style="color: #e65100; display: block; margin-top: 8px;">💡 Dowody zarządzaj w zakładce "📋 Dowody" sprawy</small>
                    </div>
                </div>
                
                <!-- Przyciski akcji przeniesione do footera -->
            </div>
            
            <!-- FOOTER - Sticky, nie scrolluje -->
            <div style="flex-shrink: 0; min-height: 80px; padding: 20px 30px; background: white; border-top: 2px solid #e0e0e0; display: flex; gap: 15px; align-items: center; border-radius: 0 0 16px 16px;">
                <button onclick="document.getElementById('enhancedEventModal').remove()" style="flex: 1; padding: 14px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem; transition: all 0.3s;" onmouseover="this.style.background='#7f8c8d'" onmouseout="this.style.background='#95a5a6'">
                    ✕ Anuluj
                </button>
                <button onclick="window.saveEnhancedEvent(${caseId})" style="flex: 2; padding: 14px; background: linear-gradient(135deg, #1a2332, #2c3e50); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem; transition: all 0.3s; box-shadow: 0 4px 15px rgba(102,126,234,0.4);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102,126,234,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(102,126,234,0.4)'">
                    ✓ Zapisz wydarzenie
                </button>
            </div>
        </div>
    `;
    
    console.log('📌 Dodaję modal do body...');
    document.body.appendChild(modal);
    console.log('✅✅✅ MODAL DODANY DO DOM!');
    
    // Płynne pojawienie się modala
    const modalContent = modal.querySelector('div');
    if (modalContent) {
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'scale(0.95)';
        modalContent.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        
        requestAnimationFrame(() => {
            modal.style.background = 'rgba(0,0,0,0.8)';
            modalContent.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        });
    }
    
    // Sprawdź czy modal jest widoczny
    const addedModal = document.getElementById('enhancedEventModal');
    if (addedModal) {
        console.log('✅ Modal znajduje się w DOM!');
        console.log('📊 Modal display:', addedModal.style.display);
        console.log('📊 Modal z-index:', addedModal.style.zIndex);
        console.log('📊 Modal position:', addedModal.style.position);
    } else {
        console.error('❌❌❌ MODAL NIE ZOSTAŁ DODANY DO DOM!');
    }
    
    // Zmienne przechowujące wybraną datę i godzinę (chronione przed resetem)
    window._selectedEventDate = null;
    window._selectedEventTime = '10:00';  // Domyślna godzina
    
    // Ustaw domyślną godzinę na 10:00
    const timeInput = document.getElementById('eventTime');
    if (timeInput) {
        timeInput.value = '10:00';
        console.log('✅ Ustawiono domyślną godzinę: 10:00');
    } else {
        console.error('❌ NIE ZNALEZIONO pola eventTime!');
    }
    
    console.log('✅ Modal utworzony - wybierz datę i godzinę!');
    console.log('💡 INLINE onChange zapisze datę i godzinę automatycznie do chronionych zmiennych');
    
    // Inicjalizuj Mapbox (czeka na załadowanie)
    setTimeout(() => {
        console.log('🔄 Sprawdzam czy Mapbox jest załadowany...');
        
        if (typeof mapboxgl === 'undefined') {
            console.error('❌ Mapbox nie jest załadowany! Czekam...');
            
            // Czekaj na Mapbox
            const checkMapbox = setInterval(() => {
                if (typeof mapboxgl !== 'undefined') {
                    console.log('✅ Mapbox załadowany! Inicjalizuję mapę...');
                    clearInterval(checkMapbox);
                    try {
                        initLocationPicker();
                    } catch (err) {
                        console.error('❌ Błąd inicjalizacji Mapbox:', err);
                    }
                }
            }, 100);
            
            // Timeout po 5 sekundach
            setTimeout(() => {
                clearInterval(checkMapbox);
                if (typeof mapboxgl === 'undefined') {
                    console.error('❌ Mapbox nie załadował się w czasie 5 sekund');
                }
            }, 5000);
        } else {
            console.log('✅ Mapbox już załadowany! Inicjalizuję mapę...');
            try {
                initLocationPicker();
            } catch (err) {
                console.error('❌ Błąd inicjalizacji Mapbox:', err);
            }
        }
        
        attachSmartFormatting();
        loadCaseDocumentsForEvent(caseId);
    }, 500);
    
    // WAŻNE: Dodaj focus listener aby upewnić się że wartości są zachowane
    // KLUCZOWE: Chroniona zmienna dla opisu (jak dla daty/czasu!)
    window._selectedDescription = '';
    
    setTimeout(() => {
        const descField = document.getElementById('eventDescription');
        const locField = document.getElementById('eventLocation');
        
        if (descField) {
            // Zapisz opis do chronionej zmiennej przy KAŻDEJ zmianie
            descField.addEventListener('input', function() {
                window._selectedDescription = this.value || '';
                console.log('🔒 ZAPISANO opis do chronionej zmiennej:', window._selectedDescription.substring(0, 50) + '...');
            });
            
            descField.addEventListener('blur', function() {
                window._selectedDescription = this.value || '';
                console.log('📝 Opis po wyjściu z pola (zapisany):', this.value || '(PUSTY)');
            });
        }
        
        if (locField) {
            locField.addEventListener('blur', function() {
                console.log('📍 Lokalizacja po wyjściu z pola:', this.value || '(PUSTA)');
            });
        }
    }, 600);
};

// Funkcja szybkiego ustawiania daty
window.setQuickDate = function(daysFromNow) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysFromNow);
    
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    
    const dateValue = `${year}-${month}-${day}`;
    
    // Ustaw w polu DOM
    const dateInput = document.getElementById('eventDate');
    dateInput.value = dateValue;
    
    // KLUCZOWE: Zapisz też do chronionej zmiennej!
    window._selectedEventDate = dateValue;
    
    // Migotanie pola
    dateInput.style.background = '#d4edda';
    setTimeout(() => { dateInput.style.background = 'white'; }, 300);
    
    // Aktualizuj etykietę
    window.updateDateLabel();
    
    console.log(`📅 Szybki wybór: Ustawiono datę na ${dateValue} (za ${daysFromNow} dni)`);
    console.log(`🔒 Data zabezpieczona w zmiennej:`, window._selectedEventDate);
};

// Funkcja aktualizacji etykiety daty
window.updateDateLabel = function() {
    const dateInput = document.getElementById('eventDate');
    const label = document.getElementById('selectedDateLabel');
    
    console.log('🔄 updateDateLabel wywołana!');
    console.log('📅 Wartość pola daty:', dateInput?.value);
    
    if (!dateInput || !label) {
        console.warn('❌ Brak pola daty lub etykiety!');
        return;
    }
    
    if (!dateInput.value) {
        console.warn('❌ Pole daty jest puste!');
        label.textContent = '';
        return;
    }
    
    // KLUCZOWE: Użyj wartości bezpośrednio w formacie YYYY-MM-DD
    const [year, month, day] = dateInput.value.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day); // month - 1 bo JS liczy od 0
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = selectedDate - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    console.log('🧮 Obliczenia:', {
        selectedDate: selectedDate.toDateString(),
        today: today.toDateString(),
        diffDays
    });
    
    if (diffDays === 0) {
        label.textContent = '(DZIŚ)';
        label.style.color = '#e67e22';
    } else if (diffDays === 1) {
        label.textContent = '(JUTRO)';
        label.style.color = '#3498db';
    } else if (diffDays > 1) {
        label.textContent = `(Za ${diffDays} dni)`;
        label.style.color = '#2ecc71';
    } else {
        label.textContent = `(${Math.abs(diffDays)} dni temu)`;
        label.style.color = '#e74c3c';
    }
};

// ✨ Funkcja generująca HTML sekcji załączników - TYLKO PLIKI (DOKUMENTY)
function getAttachmentsSection() {
    return `
        <!-- ZAŁĄCZNIKI - PLIKI Z ZAKŁADKI DOKUMENTY -->
        <div style="margin: 30px 0; padding: 20px; background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15)); border-radius: 10px; border: 2px solid #d4af37;">
            <h3 style="margin: 0 0 20px 0; color: #1565c0; font-size: 1.2rem;">📎 Załącz pliki do wydarzenia</h3>
            
            <!-- WYSZUKIWARKA PLIKÓW -->
            <input type="text" 
                id="caseDocumentSearch" 
                placeholder="🔍 Szukaj pliku..." 
                oninput="window.filterCaseDocuments()"
                style="width: 100%; padding: 12px; margin-bottom: 15px; border: 2px solid #d4af37; border-radius: 8px; font-size: 1rem;">
            
            <div id="existingCaseDocumentsList" style="max-height: 300px; overflow-y: auto; border: 2px solid #90caf9; border-radius: 8px; padding: 15px; background: white;">
                <p style="color: #999; text-align: center; padding: 20px;">Ładowanie plików...</p>
            </div>
            <small style="color: #1565c0; display: block; margin-top: 12px;">💡 Pliki zarządzaj w zakładce "📄 Dokumenty" sprawy</small>
        </div>
    `;
}

// ✨ Funkcja ładowania DOWODÓW sprawy do wyboru (nie dokumentów!)
async function loadCaseDocumentsForEvent(caseId) {
    const container = document.getElementById('existingDocumentsList');
    if (!container) return;
    
    try {
        // ZMIANA: Ładuj DOWODY zamiast dokumentów
        const response = await window.api.request(`/evidence?case_id=${caseId}`);
        const evidence = response.evidence || [];
        
        if (evidence.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Brak dowodów w sprawie. Dodaj dowody w zakładce "📋 Dowody".</p>';
            return;
        }
        
        let html = '';
        
        evidence.forEach(item => {
            const title = item.title || item.description || 'Bez nazwy';
            const type = item.evidence_type || '';
            const dateAdded = item.date_acquired ? new Date(item.date_acquired).toLocaleDateString('pl-PL') : '';
            
            // Ikona według typu dowodu
            let icon = '📋';
            if (type === 'document') icon = '📄';
            else if (type === 'photo') icon = '📸';
            else if (type === 'video') icon = '🎥';
            else if (type === 'audio') icon = '🎵';
            else if (type === 'physical') icon = '📦';
            else if (type === 'digital') icon = '💾';
            
            html += `
                <label data-evidence-search="${title.toLowerCase()} ${type.toLowerCase()}" 
                    style="display: flex; align-items: start; padding: 10px; margin-bottom: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 6px; cursor: pointer; transition: all 0.2s;"
                    onmouseover="this.style.background='#fff8e1'; this.style.borderColor='#ff9800'"
                    onmouseout="this.style.background='white'; this.style.borderColor='#e0e0e0'">
                    <input type="checkbox" name="existingDocs" value="${item.id}" 
                        style="margin-right: 10px; width: 18px; height: 18px; cursor: pointer;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #1a2332; margin-bottom: 3px;">
                            ${icon} ${title}
                        </div>
                        <div style="font-size: 0.85rem; color: #666;">
                            ${type ? `<span style="background: #fff3e0; padding: 2px 8px; border-radius: 3px; margin-right: 8px; border: 1px solid #ff9800;">Typ: ${type}</span>` : ''}
                            ${dateAdded ? `<span style="color: #999;">📅 ${dateAdded}</span>` : ''}
                            ${item.evidence_code ? `<span style="color: #ff9800; font-weight: 600; margin-left: 8px;">🔢 ${item.evidence_code}</span>` : ''}
                        </div>
                    </div>
                </label>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        console.log(`✅ Załadowano ${evidence.length} dowodów do wyboru`);
    } catch (error) {
        console.error('❌ Błąd ładowania dowodów:', error);
        container.innerHTML = '<p style="color: #dc3545; text-align: center; padding: 20px;">Błąd ładowania dowodów</p>';
    }
}

// Funkcja filtrowania dowodów
window.filterDocuments = function() {
    const searchInput = document.getElementById('documentSearch');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const labels = document.querySelectorAll('#documentCheckboxList label[data-doc-search]');
    
    labels.forEach(label => {
        const searchData = label.getAttribute('data-doc-search');
        if (searchData.includes(searchTerm)) {
            label.style.display = 'flex';
        } else {
            label.style.display = 'none';
        }
    });
};

// ✨ Funkcja ładowania PLIKÓW (dokumentów) sprawy - dla załączników wydarzenia
async function loadCaseDocumentFilesForEvent(caseId) {
    const container = document.getElementById('existingCaseDocumentsList');
    if (!container) {
        console.log('❌ Brak kontenera existingCaseDocumentsList');
        return;
    }
    
    try {
        console.log(`📄 Ładuję pliki dla sprawy ${caseId}...`);
        
        // Pobierz dokumenty (pliki) z zakładki "Dokumenty"
        const response = await window.api.request(`/cases/${caseId}/documents`);
        const documents = response.documents || [];
        
        if (documents.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Brak plików w sprawie. Dodaj pliki w zakładce "📄 Dokumenty".</p>';
            return;
        }
        
        let html = '';
        
        documents.forEach(doc => {
            const title = doc.title || doc.filename || 'Bez nazwy';
            const category = doc.category || 'other';
            const dateAdded = doc.created_at ? new Date(doc.created_at).toLocaleDateString('pl-PL') : '';
            
            // Ikona według kategorii
            let icon = '📄';
            if (category === 'court_document') icon = '⚖️';
            else if (category === 'contract') icon = '📝';
            else if (category === 'evidence') icon = '📋';
            else if (category === 'correspondence') icon = '✉️';
            
            html += `
                <label data-doc-search="${title.toLowerCase()} ${category.toLowerCase()}" 
                    style="display: flex; align-items: start; padding: 10px; margin-bottom: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 6px; cursor: pointer; transition: all 0.2s;"
                    onmouseover="this.style.background='#e3f2fd'; this.style.borderColor='#d4af37'"
                    onmouseout="this.style.background='white'; this.style.borderColor='#e0e0e0'">
                    <input type="checkbox" name="existingCaseDocs" value="${doc.id}" 
                        style="margin-right: 10px; width: 18px; height: 18px; cursor: pointer;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #1a2332; margin-bottom: 3px;">
                            ${icon} ${title}
                        </div>
                        <div style="font-size: 0.85rem; color: #666;">
                            ${category ? `<span style="background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15)); padding: 2px 8px; border-radius: 3px; margin-right: 8px; border: 1px solid #d4af37;">Kategoria: ${category}</span>` : ''}
                            ${dateAdded ? `<span style="color: #999;">📅 ${dateAdded}</span>` : ''}
                        </div>
                    </div>
                </label>
            `;
        });
        
        container.innerHTML = html;
        
        console.log(`✅ Załadowano ${documents.length} plików do wyboru`);
    } catch (error) {
        console.error('❌ Błąd ładowania dokumentów:', error);
        container.innerHTML = '<p style="color: #dc3545; text-align: center; padding: 20px;">Błąd ładowania dokumentów</p>';
    }
}

// Funkcja filtrowania dokumentów sprawy
window.filterCaseDocuments = function() {
    const searchInput = document.getElementById('caseDocumentSearch');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const labels = document.querySelectorAll('#existingCaseDocumentsList label[data-doc-search]');
    
    labels.forEach(label => {
        const searchData = label.getAttribute('data-doc-search');
        if (searchData.includes(searchTerm)) {
            label.style.display = 'flex';
        } else {
            label.style.display = 'none';
        }
    });
};

// Funkcja filtrowania dowodów
window.filterEvidence = function() {
    const searchInput = document.getElementById('evidenceSearch');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const labels = document.querySelectorAll('#existingDocumentsList label[data-evidence-search]');
    
    labels.forEach(label => {
        const searchData = label.getAttribute('data-evidence-search');
        if (searchData.includes(searchTerm)) {
            label.style.display = 'flex';
        } else {
            label.style.display = 'none';
        }
    });
};

// ✨ Funkcja ładowania ZEZNAŃ ŚWIADKÓW dla rozprawy
async function loadWitnessTestimoniesForCourt(caseId) {
    const container = document.getElementById('witnessTestimoniesList');
    if (!container) return;
    
    try {
        console.log(`📝 Ładuję zeznania świadków dla sprawy ${caseId}...`);
        
        // Pobierz świadków sprawy
        const witnessesResponse = await window.api.request(`/cases/${caseId}/witnesses`);
        const witnesses = witnessesResponse.witnesses || [];
        
        if (witnesses.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Brak świadków w sprawie. Dodaj świadków w zakładce "👥 Świadkowie".</p>';
            return;
        }
        
        let html = '';
        let hasTestimonies = false;
        
        for (const witness of witnesses) {
            // Sprawdź czy świadek ma zeznania (testimony lub oral_testimony)
            if (witness.testimony || witness.oral_testimony) {
                hasTestimonies = true;
                const fullName = `${witness.first_name} ${witness.last_name}`;
                const testimonyText = witness.oral_testimony || witness.testimony || '';
                const testimonyPreview = testimonyText.length > 100 ? testimonyText.substring(0, 100) + '...' : testimonyText;
                
                html += `
                    <label style="display: flex; align-items: start; padding: 12px; margin-bottom: 10px; background: white; border: 1px solid #03a9f4; border-radius: 6px; cursor: pointer; transition: all 0.2s;"
                        onmouseover="this.style.background='#e1f5fe'; this.style.borderColor='#0277bd'"
                        onmouseout="this.style.background='white'; this.style.borderColor='#03a9f4'">
                        <input type="checkbox" name="witnessTestimonies" value="${witness.id}" 
                            style="margin-right: 10px; width: 18px; height: 18px; cursor: pointer;">
                        <div style="flex: 1;">
                            <div style="font-weight: 700; color: #01579b; margin-bottom: 5px;">
                                👤 ${fullName}
                            </div>
                            <div style="font-size: 0.9rem; color: #666; background: #f5f5f5; padding: 8px; border-radius: 4px; margin-top: 5px;">
                                ${testimonyPreview}
                            </div>
                            <div style="font-size: 0.85rem; color: #0277bd; margin-top: 5px;">
                                📝 Typ: ${witness.oral_testimony ? 'Zeznania ustne' : 'Zeznania pisemne'}
                            </div>
                        </div>
                    </label>
                `;
            }
        }
        
        if (!hasTestimonies) {
            container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Świadkowie nie mają jeszcze zeznań. Dodaj zeznania w zakładce "👥 Świadkowie".</p>';
        } else {
            container.innerHTML = html;
            console.log(`✅ Załadowano zeznania świadków`);
        }
        
    } catch (error) {
        console.error('❌ Błąd ładowania zeznań:', error);
        container.innerHTML = '<p style="color: #dc3545; text-align: center; padding: 20px;">Błąd ładowania zeznań świadków</p>';
    }
}

// Funkcja wyświetlania wybranych plików
window.displaySelectedFiles = function(input) {
    const previewDiv = document.getElementById('selectedFilesPreview');
    if (!previewDiv) return;
    
    const files = input.files;
    console.log('📎 Wybrano plików:', files.length);
    
    if (files.length === 0) {
        previewDiv.innerHTML = '';
        return;
    }
    
    let html = '<div style="background: #e8f5e9; padding: 12px; border-radius: 6px; border: 2px solid #4caf50;">';
    html += `<div style="color: #2e7d32; font-weight: 600; margin-bottom: 8px;">✅ Wybrano ${files.length} plik(ów):</div>`;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const sizeKB = (file.size / 1024).toFixed(1);
        const icon = file.type.includes('pdf') ? '📄' : 
                    file.type.includes('image') ? '🖼️' : 
                    file.type.includes('word') ? '📝' : 
                    file.type.includes('excel') ? '📊' : '📎';
        
        html += `
            <div style="display: flex; align-items: center; gap: 8px; padding: 6px; background: white; border-radius: 4px; margin-bottom: 4px;">
                <span style="font-size: 1.2rem;">${icon}</span>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #1a2332; font-size: 0.9rem;">${file.name}</div>
                    <div style="font-size: 0.75rem; color: #666;">${sizeKB} KB</div>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    previewDiv.innerHTML = html;
    
    console.log('✅ Podgląd plików wyświetlony');
};

// Funkcja aktualizująca sugestie tytułów w zależności od typu wydarzenia
function updateTitleSuggestions(type, titleInput, datalist) {
    if (!titleInput || !datalist) return;
    
    // Definicje sugestii dla każdego typu
    const suggestions = {
        'negotiation': [
            'Negocjacje ugodowe',
            'Rozmowy polubowne',
            'Negocjacje warunków ugody',
            'Spotkanie negocjacyjne ze stroną przeciwną',
            'Propozycja ugody'
        ],
        'court': [
            'Rozprawa w sprawie',
            'Rozprawa kontynuowana',
            'Pierwsza rozprawa',
            'Rozprawa końcowa',
            'Ogłoszenie wyroku',
            'Rozprawa apelacyjna'
        ],
        'meeting': [
            'Spotkanie z klientem',
            'Spotkanie w kancelarii',
            'Spotkanie organizacyjne',
            'Omówienie strategii sprawy',
            'Konsultacja w sprawie'
        ],
        'deadline': [
            'Termin złożenia odwołania',
            'Termin na odpowiedź na pozew',
            'Termin złożenia dokumentów',
            'Termin płatności opłaty sądowej',
            'Deadline procesowy'
        ],
        'mediation': [
            'Mediacja w sprawie',
            'Pierwsze spotkanie mediacyjne',
            'Kontynuacja mediacji',
            'Finalizacja ugody mediacyjnej'
        ],
        'expertise': [
            'Ekspertyza budowlana',
            'Ekspertyza medyczna',
            'Oględziny nieruchomości',
            'Badanie techniczne',
            'Sporządzenie opinii biegłego'
        ],
        'document': [
            'Złożenie pozwu',
            'Złożenie odpowiedzi na pozew',
            'Złożenie wniosku',
            'Złożenie apelacji',
            'Złożenie dokumentów w sądzie'
        ],
        'hearing': [
            'Przesłuchanie świadka',
            'Przesłuchanie strony',
            'Zeznania świadka',
            'Konfrontacja świadków'
        ],
        'consultation': [
            'Konsultacja z klientem',
            'Konsultacja telefoniczna',
            'Spotkanie konsultacyjne',
            'Omówienie sprawy z klientem',
            'Konsultacja prawna'
        ],
        'task': [
            'Przygotowanie dokumentów',
            'Analiza akt sprawy',
            'Przygotowanie strategii',
            'Zebranie dowodów',
            'Kontakt z klientem'
        ],
        'other': [
            'Inne wydarzenie',
            'Dodatkowe czynności',
            'Zadanie specjalne'
        ]
    };
    
    // Pobierz sugestie dla wybranego typu
    const typeSuggestions = suggestions[type] || [];
    
    // Aktualizuj datalist
    datalist.innerHTML = typeSuggestions.map(s => `<option value="${s}">`).join('');
    
    // Aktualizuj placeholder
    if (typeSuggestions.length > 0) {
        titleInput.placeholder = `np. ${typeSuggestions[0]}`;
    } else {
        titleInput.placeholder = 'Wpisz tytuł wydarzenia...';
    }
    
    console.log(`💡 Załadowano ${typeSuggestions.length} sugestii dla typu: ${type}`);
}

// Smart formatting - automatyczne formatowanie podczas wpisywania
function attachSmartFormatting() {
    const locationInput = document.getElementById('eventLocation');
    
    if (locationInput) {
        // Auto-formatowanie kodu pocztowego (XX-XXX)
        locationInput.addEventListener('input', function(e) {
            let value = this.value;
            
            // Wykryj wzorzec kodu pocztowego (5 cyfr bez myślnika)
            const postalCodeRegex = /\b(\d{2})(\d{3})\b/g;
            value = value.replace(postalCodeRegex, '$1-$2');
            
            if (value !== this.value) {
                const cursorPos = this.selectionStart;
                this.value = value;
                this.setSelectionRange(cursorPos + 1, cursorPos + 1);
            }
        });
        
        console.log('✅ Smart formatting aktywny');
    }
}

// Funkcja inicjalizacji Google Places Autocomplete
function initGooglePlacesAutocomplete() {
    const locationInput = document.getElementById('eventLocation');
    if (!locationInput) return;
    
    // Sprawdź czy Google Maps jest załadowany
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        console.warn('⚠️ Google Maps API nie jest załadowane. Autocomplete nie będzie działać.');
        return;
    }
    
    try {
        // Konfiguracja autocomplete dla Polski
        const autocomplete = new google.maps.places.Autocomplete(locationInput, {
            componentRestrictions: { country: 'pl' },
            fields: ['formatted_address', 'name', 'geometry'],
            types: ['establishment', 'geocode']
        });
        
        // Obsługa wyboru miejsca
        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            if (place.formatted_address) {
                locationInput.value = place.name ? `${place.name}, ${place.formatted_address}` : place.formatted_address;
                console.log('✅ Wybrano miejsce:', locationInput.value);
            }
        });
        
        console.log('✅ Google Places Autocomplete zainicjalizowany');
    } catch (error) {
        console.error(' Błąd inicjalizacji Google Places:', error);
    }
}

// === STARA FUNKCJA USUNIĘTA - PATRZ LINIA ~1458 DLA NOWEJ ===

window.updateDynamicFields = function() {
    const type = document.getElementById('eventTypeSelect').value;
    const container = document.getElementById('dynamicFields');
    const titleInput = document.getElementById('eventTitle');
    const datalist = document.getElementById('eventTitleSuggestions');
    const caseId = window._currentEventCaseId; // Pobierz zapisane caseId
    
    console.log(`🔄 updateDynamicFields wywołane - Typ: ${type}, CaseId: ${caseId}`);
    
    // Aktualizuj sugestie tytułów w zależności od typu
    updateTitleSuggestions(type, titleInput, datalist);
    
    let html = '';
    
    // Negocjacje
    if (type === 'negotiation') {
        html = `
            <div style="background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15)); border: 2px solid #d4af37; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 15px 0; color: #0d47a1;">🤝 Szczegóły negocjacji</h4>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Z kim negocjacje?</label>
                    <input type="text" id="negotiationWith" placeholder="Strona przeciwna, klient, ekspert..." style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Przedmiot negocjacji</label>
                    <textarea id="negotiationSubject" rows="2" placeholder="Czego dotyczą negocjacje?" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;"></textarea>
                </div>
                <div>
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Oczekiwany rezultat</label>
                    <textarea id="expectedResult" rows="2" placeholder="Co chcemy osiągnąć?" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;"></textarea>
                </div>
            </div>
            
            ${getAttachmentsSection()}
        `;
    }
    // Rozprawa
    else if (type === 'court') {
        html = `
            <div style="background: #ffebee; border: 2px solid #e74c3c; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 15px 0; color: #b71c1c;">⚖️ Szczegóły rozprawy sądowej</h4>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Sygnatura akt *</label>
                    <input type="text" id="courtSignature" placeholder="np. I C 123/2025" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Sąd</label>
                        <input type="text" id="courtName" placeholder="Sąd Okręgowy w Warszawie" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                    </div>
                    <div>
                        <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Sala rozpraw</label>
                        <input type="text" id="courtRoom" placeholder="np. Sala 12" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                    </div>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Sędzia prowadzący</label>
                    <input type="text" id="judgeName" placeholder="SSO Jan Kowalski" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Typ rozprawy</label>
                    <select id="hearingType" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                        <option value="first">Pierwsza rozprawa</option>
                        <option value="continuation">Rozprawa kontynuowana</option>
                        <option value="final">Rozprawa końcowa</option>
                        <option value="verdict">Ogłoszenie wyroku</option>
                        <option value="appeal">Rozprawa apelacyjna</option>
                    </select>
                </div>
                
                <!-- INTEGRACJA Z BAZĄ ŚWIADKÓW -->
                <div style="margin-bottom: 15px; background: #fff3e0; padding: 15px; border-radius: 6px; border: 2px solid #ff9800;">
                    <label style="display: block; color: #e65100; font-weight: 700; margin-bottom: 10px;">👥 Świadkowie do przesłuchania na rozprawie</label>
                    <div id="courtWitnessesList" style="background: white; padding: 12px; border-radius: 6px; min-height: 80px; max-height: 200px; overflow-y: auto;">
                        <small style="color: #999;">Ładowanie listy świadków...</small>
                    </div>
                    <small style="color: #f57c00; display: block; margin-top: 8px;">💡 Zaznacz świadków którzy mają zeznawać</small>
                </div>
                
                <!-- ZEZNANIA ŚWIADKÓW -->
                <div style="margin-bottom: 15px; background: #e1f5fe; padding: 15px; border-radius: 6px; border: 2px solid #03a9f4;">
                    <label style="display: block; color: #01579b; font-weight: 700; margin-bottom: 10px;">📝 Zeznania świadków z systemu</label>
                    <div id="witnessTestimoniesList" style="background: white; padding: 12px; border-radius: 6px; min-height: 80px; max-height: 200px; overflow-y: auto;">
                        <small style="color: #999;">Ładowanie zeznań...</small>
                    </div>
                    <small style="color: #0277bd; display: block; margin-top: 8px;">💡 Zaznacz zeznania które chcesz dołączyć do rozprawy</small>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Dodatkowi świadkowie (ręcznie)</label>
                    <input type="text" id="witnesses" placeholder="Jan Kowalski, Anna Nowak" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                </div>
                <div>
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Dokumenty do przedstawienia</label>
                    <textarea id="documentsToPresent" rows="2" placeholder="Lista dokumentów..." style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;"></textarea>
                </div>
            </div>
            
            ${getAttachmentsSection()}
        `;
    }
    // Spotkanie
    else if (type === 'meeting') {
        html = `
            <div style="background: #e8f5e9; border: 2px solid #4caf50; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 15px 0; color: #1b5e20;">👥 Szczegóły spotkania</h4>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Uczestnicy spotkania</label>
                    <input type="text" id="meetingParticipants" placeholder="Klient, ekspert, świadek..." style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Cel spotkania</label>
                    <select id="meetingPurpose" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                        <option value="consultation">Konsultacja</option>
                        <option value="strategy">Omówienie strategii</option>
                        <option value="documents">Przygotowanie dokumentów</option>
                        <option value="update">Aktualizacja stanu sprawy</option>
                        <option value="settlement">Rozmowy ugodowe</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Agenda (tematy do omówienia)</label>
                    <textarea id="meetingAgenda" rows="3" placeholder="1. Omówienie statusu sprawy\n2. Ustalenie dalszych kroków\n3. ..." style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;"></textarea>
                </div>
            </div>
            
            ${getAttachmentsSection()}
        `;
    }
    // Termin procesowy
    else if (type === 'deadline') {
        html = `
            <div style="background: #ffe6e6; border: 2px solid #dc3545; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 15px 0; color: #721c24;">⏰ Termin procesowy (DEADLINE)</h4>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Typ terminu</label>
                    <select id="deadlineType" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                        <option value="appeal">Termin na odwołanie</option>
                        <option value="response">Termin na odpowiedź na pozew</option>
                        <option value="documents">Termin na złożenie dokumentów</option>
                        <option value="payment">Termin płatności</option>
                        <option value="other">Inny termin</option>
                    </select>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Konsekwencje przekroczenia</label>
                    <textarea id="consequences" rows="2" placeholder="Co się stanie jeśli nie dotrzymamy terminu?" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;"></textarea>
                </div>
                <label style="display: flex; align-items: center; gap: 10px; color: #721c24; font-weight: 700;">
                    <input type="checkbox" id="criticalDeadline" style="width: 20px; height: 20px;">
                    <span>🚨 KRYTYCZNY TERMIN - priorytet absolutny!</span>
                </label>
            </div>
            
            ${getAttachmentsSection()}
        `;
    }
    // Mediacja
    else if (type === 'mediation') {
        html = `
            <div style="background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15)); border: 2px solid #9c27b0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 15px 0; color: #4a148c;">🕊️ Szczegóły mediacji</h4>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Mediator</label>
                    <input type="text" id="mediatorName" placeholder="Imię i nazwisko mediatora" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Oczekiwany wynik mediacji</label>
                    <textarea id="mediationOutcome" rows="2" placeholder="Czego chcemy osiągnąć?" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;"></textarea>
                </div>
                <div>
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Propozycje ugodowe</label>
                    <textarea id="settlementProposals" rows="2" placeholder="Nasze propozycje ugody" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;"></textarea>
                </div>
            </div>
            
            ${getAttachmentsSection()}
        `;
    }
    // Ekspertyza
    else if (type === 'expertise') {
        html = `
            <div style="background: #fff3e0; border: 2px solid #ff9800; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 15px 0; color: #e65100;">🔬 Szczegóły ekspertyzy/oględzin</h4>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Rodzaj ekspertyzy</label>
                    <input type="text" id="expertiseType" placeholder="Ekspertyza budowlana, medyczna, grafologiczna..." style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Ekspert</label>
                    <input type="text" id="expertName" placeholder="Imię i nazwisko eksperta" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                </div>
                <div>
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Zakres ekspertyzy</label>
                    <textarea id="expertiseScope" rows="2" placeholder="Co ma być zbadane?" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;"></textarea>
                </div>
            </div>
            
            ${getAttachmentsSection()}
        `;
    }
    // Złożenie dokumentu
    else if (type === 'document') {
        html = `
            <div style="background: #e0f2f1; border: 2px solid #009688; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 15px 0; color: #004d40;">📄 Szczegóły złożenia dokumentu</h4>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Jakie dokumenty?</label>
                    <textarea id="documentList" rows="2" placeholder="Pozew, odpowiedź na pozew, wniosek..." style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;"></textarea>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Gdzie składane?</label>
                    <select id="documentWhere" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                        <option value="court">Sąd</option>
                        <option value="prosecutor">Prokuratura</option>
                        <option value="office">Urząd</option>
                        <option value="other">Inne</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Termin złożenia</label>
                    <input type="date" id="documentDeadline" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                </div>
            </div>
            
            ${getAttachmentsSection()}
        `;
    }
    // Przesłuchanie
    else if (type === 'hearing') {
        html = `
            <div style="background: #fce4ec; border: 2px solid #e91e63; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 15px 0; color: #880e4f;">🗣️ Szczegóły przesłuchania</h4>
                
                <!-- INTEGRACJA Z BAZĄ ŚWIADKÓW -->
                <div style="margin-bottom: 15px; background: #fff3e0; padding: 15px; border-radius: 6px; border: 2px solid #ff9800;">
                    <label style="display: block; color: #e65100; font-weight: 700; margin-bottom: 10px;">👤 Wybierz świadka z bazy</label>
                    <select id="witnessFromDatabase" onchange="window.loadWitnessDetails(this.value)" style="width: 100%; padding: 12px; border: 2px solid #ff9800; border-radius: 6px; font-weight: 600;">
                        <option value="">-- Ładowanie świadków... --</option>
                    </select>
                    <small style="color: #f57c00; display: block; margin-top: 8px;">💡 Wybierz świadka aby automatycznie wypełnić dane</small>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Kto jest przesłuchiwany? *</label>
                    <input type="text" id="witnessName" placeholder="Imię i nazwisko świadka (lub wybierz z bazy powyżej)" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Rola świadka</label>
                    <select id="witnessRole" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                        <option value="our">Nasz świadek</option>
                        <option value="opposing">Świadek strony przeciwnej</option>
                        <option value="court">Świadek powołany przez sąd</option>
                    </select>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">📝 Zeznania świadka (jeśli są)</label>
                    <div id="witnessTestimonies" style="background: #f5f5f5; padding: 12px; border-radius: 6px; min-height: 60px;">
                        <small style="color: #999;">Wybierz świadka aby zobaczyć jego zeznania</small>
                    </div>
                </div>
                <div>
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Kluczowe pytania</label>
                    <textarea id="keyQuestions" rows="3" placeholder="Pytania do zadania świadkowi" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;"></textarea>
                </div>
            </div>
            
            ${getAttachmentsSection()}
        `;
    }
    // Konsultacja
    else if (type === 'consultation') {
        html = `
            <div style="background: #eceff1; border: 2px solid #607d8b; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 15px 0; color: #263238;">💼 Szczegóły konsultacji</h4>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Z kim konsultacja?</label>
                    <select id="consultationWith" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                        <option value="client">Klient</option>
                        <option value="expert">Ekspert prawny</option>
                        <option value="judge">Sędzia</option>
                        <option value="prosecutor">Prokurator</option>
                        <option value="other">Inna osoba</option>
                    </select>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Imię i nazwisko (jeśli dotyczy)</label>
                    <input type="text" id="consultationPerson" placeholder="np. Jan Kowalski" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                </div>
                <div>
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Temat konsultacji</label>
                    <textarea id="consultationTopic" rows="2" placeholder="Czego dotyczy konsultacja?" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;"></textarea>
                </div>
            </div>
        `;
    }
    // Zadanie
    else if (type === 'task') {
        html = `
            <div style="background: #e0f7fa; border: 2px solid #00bcd4; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 15px 0; color: #006064;">✅ Szczegóły zadania</h4>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Kto odpowiedzialny?</label>
                    <input type="text" id="taskResponsible" placeholder="Osoba odpowiedzialna za zadanie" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Priorytet</label>
                    <select id="taskPriority" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                        <option value="low">Niski</option>
                        <option value="medium" selected>Średni</option>
                        <option value="high">Wysoki</option>
                        <option value="critical">Krytyczny</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Status</label>
                    <select id="taskStatus" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                        <option value="pending" selected>Do zrobienia</option>
                        <option value="in_progress">W trakcie</option>
                        <option value="completed">Ukończone</option>
                    </select>
                </div>
            </div>
            
            ${getAttachmentsSection()}
        `;
    }
    
    container.innerHTML = html;
    
    console.log(`📦 HTML wyrenderowany dla typu: ${type}`);
    
    // ✨ Załaduj załączniki (dla WSZYSTKICH typów)
    setTimeout(() => {
        loadCaseDocumentFilesForEvent(caseId);  // Pliki (dokumenty) z wyszukiwarką dla wszystkich
        
        // Dla rozprawy - dodatkowo załaduj zeznania świadków
        if (type === 'court') {
            loadWitnessTestimoniesForCourt(caseId);
        }
    }, 100);
    
    // Po zaktualizowaniu HTML, załaduj świadków jeśli to typ "hearing" lub "court"
    if (type === 'hearing') {
        console.log('⏳ Czekam 300ms na render DOM, potem ładuję świadków...');
        setTimeout(() => {
            console.log('🚀 Timeout zakończony, wywołuję loadWitnessesForEvent');
            loadWitnessesForEvent(caseId, 'hearing');
        }, 300);
    } else if (type === 'court') {
        console.log('⏳ Czekam 300ms na render DOM, potem ładuję świadków...');
        setTimeout(() => {
            console.log('🚀 Timeout zakończony, wywołuję loadWitnessesForEvent');
            loadWitnessesForEvent(caseId, 'court');
        }, 300);
    }
};

// === FUNKCJE INTEGRACJI Z BAZĄ ŚWIADKÓW ===

// Ładowanie listy świadków dla wydarzenia
async function loadWitnessesForEvent(caseId, eventType) {
    console.log(`🔍 Ładuję świadków dla sprawy ${caseId}, typ: ${eventType}`);
    
    if (!caseId) {
        console.error('❌ Brak caseId! Nie mogę załadować świadków');
        return;
    }
    
    try {
        console.log(`📡 Wysyłam zapytanie: /witnesses?case_id=${caseId}`);
        const response = await window.api.request(`/witnesses?case_id=${caseId}`);
        console.log('📦 Odpowiedź z API:', response);
        const witnesses = response.witnesses || [];
        
        console.log(`✅ Pobrano ${witnesses.length} świadków`, witnesses);
        
        if (eventType === 'hearing') {
            // Dla przesłuchania - dropdown pojedynczego wyboru
            const selectEl = document.getElementById('witnessFromDatabase');
            console.log('🔍 Element witnessFromDatabase:', selectEl);
            if (!selectEl) {
                console.error('❌ Element witnessFromDatabase nie istnieje w DOM! HTML nie został jeszcze wyrenderowany.');
                return;
            }
            if (selectEl) {
                if (witnesses.length === 0) {
                    selectEl.innerHTML = '<option value="">-- Brak świadków w bazie --</option>';
                    console.log('⚠️ Brak świadków w bazie');
                } else {
                    console.log(`✅ Wypełniam dropdown ${witnesses.length} świadkami`);
                    selectEl.innerHTML = '<option value="">-- Wybierz świadka --</option>' + 
                        witnesses.map(w => {
                            const fullName = `${w.first_name || ''} ${w.last_name || ''}`.trim();
                            const relation = w.relation_to_case || 'neutral';
                            const relationLabel = {
                                'plaintiff': 'Powód',
                                'defendant': 'Pozwany',
                                'neutral': 'Neutralny',
                                'expert': 'Ekspert'
                            }[relation] || relation;
                            return `<option value="${w.id}">${fullName} (${relationLabel})</option>`;
                        }).join('');
                }
            }
        } else if (eventType === 'court') {
            // Dla rozprawy - checkboxy wielokrotnego wyboru
            const listEl = document.getElementById('courtWitnessesList');
            console.log('🔍 Element courtWitnessesList:', listEl);
            if (!listEl) {
                console.error('❌ Element courtWitnessesList nie istnieje w DOM! HTML nie został jeszcze wyrenderowany.');
                return;
            }
            if (listEl) {
                if (witnesses.length === 0) {
                    listEl.innerHTML = '<small style="color: #999;">Brak świadków w bazie</small>';
                    console.log('⚠️ Brak świadków w bazie');
                } else {
                    console.log(`✅ Wypełniam listę ${witnesses.length} świadkami`);
                    listEl.innerHTML = witnesses.map(w => {
                        const fullName = `${w.first_name || ''} ${w.last_name || ''}`.trim();
                        const relation = w.relation_to_case || 'neutral';
                        const relationLabel = {
                            'plaintiff': 'Powód',
                            'defendant': 'Pozwany',
                            'neutral': 'Neutralny',
                            'expert': 'Ekspert'
                        }[relation] || relation;
                        return `
                        <label style="display: flex; align-items: center; gap: 10px; padding: 8px; background: #f9f9f9; border-radius: 4px; margin-bottom: 6px; cursor: pointer; transition: all 0.2s;"
                            onmouseover="this.style.background='#e3f2fd'"
                            onmouseout="this.style.background='#f9f9f9'">
                            <input type="checkbox" name="courtWitnesses" value="${w.id}" style="width: 18px; height: 18px;">
                            <span style="font-weight: 600; color: #1a2332;">${fullName}</span>
                            <span style="color: #666; font-size: 0.85rem;">(${relationLabel})</span>
                        </label>
                    `;
                    }).join('');
                }
            }
        }
    } catch (error) {
        console.error('❌ Błąd ładowania świadków:', error);
    }
}

// Załadowanie szczegółów świadka (dla przesłuchania)
window.loadWitnessDetails = async function(witnessId) {
    if (!witnessId) {
        // Wyczyść pola
        document.getElementById('witnessName').value = '';
        document.getElementById('witnessTestimonies').innerHTML = '<small style="color: #999;">Wybierz świadka aby zobaczyć jego zeznania</small>';
        return;
    }
    
    console.log(`🔍 Ładuję szczegóły świadka ${witnessId}`);
    
    try {
        const response = await window.api.request(`/witnesses/${witnessId}`);
        const witness = response.witness;
        
        // Wypełnij pole nazwiska
        const fullName = `${witness.first_name || ''} ${witness.last_name || ''}`.trim();
        document.getElementById('witnessName').value = fullName;
        
        // Ustaw rolę świadka
        const roleSelect = document.getElementById('witnessRole');
        if (roleSelect && witness.relation_to_case) {
            const roleMap = {
                'plaintiff': 'our',
                'defendant': 'opposing',
                'neutral': 'court',
                'expert': 'court'
            };
            roleSelect.value = roleMap[witness.relation_to_case] || 'our';
        }
        
        // Załaduj zeznania
        const testimoniesDiv = document.getElementById('witnessTestimonies');
        if (witness.testimonies && witness.testimonies.length > 0) {
            testimoniesDiv.innerHTML = witness.testimonies.map(t => `
                <div style="background: white; padding: 10px; border-radius: 4px; margin-bottom: 8px; border-left: 3px solid #2196f3;">
                    <div style="font-weight: 600; color: #1a2332; margin-bottom: 4px;">📅 ${new Date(t.testimony_date).toLocaleDateString('pl-PL')}</div>
                    <div style="color: #666; font-size: 0.9rem;">${t.testimony_content || 'Brak treści zeznania'}</div>
                </div>
            `).join('');
        } else {
            testimoniesDiv.innerHTML = '<small style="color: #999;">Brak zeznań dla tego świadka</small>';
        }
        
        console.log('✅ Załadowano szczegóły świadka:', fullName);
    } catch (error) {
        console.error('❌ Błąd ładowania szczegółów świadka:', error);
    }
};

window.saveEnhancedEvent = async function(caseId) {
    console.log('🚀🚀🚀 === V1054 FUNKCJA ZAPISU WYWOŁANA! ===');
    console.log('📌 caseId:', caseId);
    
    const type = document.getElementById('eventTypeSelect')?.value;
    let title = document.getElementById('eventTitle')?.value?.trim();
    
    // KLUCZOWE: Użyj chronionych zmiennych zamiast pól DOM!
    const date = window._selectedEventDate || document.getElementById('eventDate')?.value;
    const time = window._selectedEventTime || document.getElementById('eventTime')?.value;
    
    // Lokalizacja z ukrytego pola (wypełnianego przez Mapbox)
    const location = document.getElementById('eventLocation')?.value?.trim() || '';
    
    // OPIS - TRIPLE CHECK! Zapisz TERAZ do chronionej zmiennej
    const descriptionElement = document.getElementById('eventDescription');
    if (descriptionElement && descriptionElement.value) {
        window._selectedDescription = descriptionElement.value;
        console.log('🔒🔒🔒 OSTATNI MOMENT - Zapisuję opis:', descriptionElement.value);
    }
    
    // KLUCZOWE: Użyj chronionej zmiennej (z fallbackiem na DOM)
    let description = window._selectedDescription || (descriptionElement ? descriptionElement.value : '');
    description = (description || '').trim();
    
    console.log('📝 OPIS - Z chronionej zmiennej:', window._selectedDescription || '(PUSTA)');
    console.log('📝 OPIS - Z textarea:', descriptionElement?.value || '(PUSTA)');
    console.log('📝 OPIS - UŻYTA (finalna):', description || '(PUSTA)');
    console.log('📝 OPIS - DŁUGOŚĆ:', description.length, 'znaków');
    
    console.log('🔍🔍🔍 === DEBUG WARTOŚCI Z FORMULARZA === 🔍🔍🔍');
    console.log('📝 Pobrane wartości:', { type, title, date, time, location, description });
    console.log('🔒 Data z chronionej zmiennej:', window._selectedEventDate);
    console.log('📅 Data z pola DOM:', document.getElementById('eventDate')?.value);
    console.log('📅 UŻYTA data (finalna):', date);
    console.log('🔒 Godzina z chronionej zmiennej:', window._selectedEventTime);
    console.log('⏰ Godzina z pola DOM:', document.getElementById('eventTime')?.value);
    console.log('⏰ UŻYTA godzina (finalna):', time);
    console.log('📍 LOKALIZACJA (z Mapbox):', location || '⚠️ PUSTA!');
    console.log('📦 Start date będzie:', `${date}T${time}:00`);
    
    // DODATKOWA WALIDACJA DATY - Format YYYY-MM-DD
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        console.error('❌ BŁĘDNY FORMAT DATY!', date);
        alert('⚠️ Błędny format daty! Użyj przycisków szybkiego wyboru lub wybierz datę z kalendarza.');
        return;
    }
    
    // AUTO-FILL tytułu jeśli pusty
    if (!title && type) {
        const autoTitles = {
            'negotiation': 'Negocjacje ugodowe',
            'court': 'Rozprawa w sprawie',
            'meeting': 'Spotkanie',
            'deadline': 'Termin procesowy',
            'mediation': 'Mediacja',
            'expertise': 'Ekspertyza',
            'document': 'Złożenie dokumentu',
            'hearing': 'Przesłuchanie świadka',
            'consultation': 'Konsultacja',
            'task': 'Zadanie',
            'other': 'Wydarzenie'
        };
        title = autoTitles[type] || 'Nowe wydarzenie';
        console.log('💡 Auto-fill tytułu:', title);
    }
    
    if (!type || !title || !date || !time) {
        console.error('❌ WALIDACJA NIE PRZESZŁA!', { type, title, date, time });
        alert('⚠️ Wypełnij wszystkie wymagane pola:\n\n✓ Typ wydarzenia\n✓ Tytuł\n✓ Data (użyj przycisków: "📅 Za tydzień" itp.)\n✓ Godzina');
        return;
    }
    
    console.log('✅ Walidacja OK - przechodzę dalej');
    
    try {
        console.log('📤 Generuję kod wydarzenia...');
        const codeResp = await window.api.request('/events/generate-code', {
            method: 'POST',
            body: JSON.stringify({ case_id: caseId, event_type: type })
        });
        
        console.log('✅ Kod wygenerowany:', codeResp.eventCode);
        
        // Zbierz extra_data w zależności od typu
        const extraData = {};
        
        if (type === 'negotiation') {
            extraData.negotiation_with = document.getElementById('negotiationWith')?.value || '';
            extraData.subject = document.getElementById('negotiationSubject')?.value || '';
            extraData.expected_result = document.getElementById('expectedResult')?.value || '';
        } 
        else if (type === 'court') {
            extraData.court_signature = document.getElementById('courtSignature')?.value || '';
            extraData.judge_name = document.getElementById('judgeName')?.value || '';
            extraData.hearing_type = document.getElementById('hearingType')?.value || '';
            extraData.witnesses = document.getElementById('witnesses')?.value || '';
            extraData.documents_to_present = document.getElementById('documentsToPresent')?.value || '';
        } 
        else if (type === 'meeting') {
            extraData.participants = document.getElementById('meetingParticipants')?.value || '';
            extraData.purpose = document.getElementById('meetingPurpose')?.value || '';
            extraData.agenda = document.getElementById('meetingAgenda')?.value || '';
        }
        else if (type === 'deadline') {
            extraData.deadline_type = document.getElementById('deadlineType')?.value || '';
            extraData.consequences = document.getElementById('consequences')?.value || '';
            extraData.critical = document.getElementById('criticalDeadline')?.checked || false;
        }
        else if (type === 'mediation') {
            extraData.mediator_name = document.getElementById('mediatorName')?.value || '';
            extraData.expected_outcome = document.getElementById('mediationOutcome')?.value || '';
            extraData.settlement_proposals = document.getElementById('settlementProposals')?.value || '';
        }
        else if (type === 'expertise') {
            extraData.expertise_type = document.getElementById('expertiseType')?.value || '';
            extraData.expert_name = document.getElementById('expertName')?.value || '';
            extraData.scope = document.getElementById('expertiseScope')?.value || '';
        }
        else if (type === 'document') {
            extraData.document_list = document.getElementById('documentList')?.value || '';
            extraData.where_submitted = document.getElementById('documentWhere')?.value || '';
            extraData.submission_deadline = document.getElementById('documentDeadline')?.value || '';
        }
        else if (type === 'hearing') {
            extraData.witness_name = document.getElementById('witnessName')?.value || '';
            extraData.witness_role = document.getElementById('witnessRole')?.value || '';
            extraData.key_questions = document.getElementById('keyQuestions')?.value || '';
        }
        else if (type === 'consultation') {
            extraData.consultation_with = document.getElementById('consultationWith')?.value || '';
            extraData.person_name = document.getElementById('consultationPerson')?.value || '';
            extraData.topic = document.getElementById('consultationTopic')?.value || '';
        }
        else if (type === 'task') {
            extraData.responsible = document.getElementById('taskResponsible')?.value || '';
            extraData.priority = document.getElementById('taskPriority')?.value || '';
            extraData.status = document.getElementById('taskStatus')?.value || '';
        }
        
        // Załączniki - istniejące dokumenty
        
        // Zbierz wybrane istniejące DOWODY (z zakładki "Dowody")
        const selectedEvidence = [];
        document.querySelectorAll('input[name="existingDocs"]:checked').forEach(checkbox => {
            selectedEvidence.push(parseInt(checkbox.value));
        });
        
        if (selectedEvidence.length > 0) {
            extraData.existing_document_ids = selectedEvidence;
            console.log(`📋 Dołączono ${selectedEvidence.length} dowodów:`, selectedEvidence);
        }
        
        // Zbierz wybrane istniejące DOKUMENTY (z zakładki "Dokumenty")
        const selectedCaseDocs = [];
        document.querySelectorAll('input[name="existingCaseDocs"]:checked').forEach(checkbox => {
            selectedCaseDocs.push(parseInt(checkbox.value));
        });
        
        if (selectedCaseDocs.length > 0) {
            extraData.existing_case_document_ids = selectedCaseDocs;
            console.log(`📄 Dołączono ${selectedCaseDocs.length} dokumentów:`, selectedCaseDocs);
        }
        
        // Zbierz wybrane ZEZNANIA ŚWIADKÓW (dla rozprawy)
        const selectedTestimonies = [];
        document.querySelectorAll('input[name="witnessTestimonies"]:checked').forEach(checkbox => {
            selectedTestimonies.push(parseInt(checkbox.value));
        });
        
        if (selectedTestimonies.length > 0) {
            extraData.witness_testimony_ids = selectedTestimonies;
            console.log(`📝 Dołączono ${selectedTestimonies.length} zeznań:`, selectedTestimonies);
        }
        
        console.log('📤 Wysyłam wydarzenie do backendu...');
        console.log('📦 PEŁNE extra_data:', JSON.stringify(extraData, null, 2));
        console.log('📎 Liczba załączników w extra_data:', extraData.attachments?.length || 0);
        
        const eventData = {
            case_id: caseId,
            event_code: codeResp.eventCode,
            event_type: type,
            title: title,
            start_date: `${date}T${time}:00`,
            location: location,
            description: description,
            extra_data: extraData,
            reminder_minutes: 1440
        };
        
        console.log('🚀🚀🚀 === WYSYŁAM DO BACKENDU === 🚀🚀🚀');
        console.log('📦 Pełny obiekt eventData:', JSON.stringify(eventData, null, 2));
        console.log('📅 start_date STRING:', eventData.start_date);
        console.log('🔍 Typ start_date:', typeof eventData.start_date);
        console.log('📍 eventData.location:', eventData.location || '❌ undefined/null!');
        console.log('📝 eventData.description:', eventData.description || '❌ PUSTE/NULL!');
        console.log('📝 DŁUGOŚĆ OPISU:', eventData.description ? eventData.description.length : 0, 'znaków');
        console.log('📝 CZY PRAWDZIWY (truthy)?', !!eventData.description);
        
        // Test parsowania tej daty
        const testDate = new Date(eventData.start_date);
        console.log('🧪 Test new Date(start_date):', testDate.toISOString());
        console.log('🧪 Test toString():', testDate.toString());
        console.log('🧪 Test toLocaleString():', testDate.toLocaleString('pl-PL'));
        
        const eventResponse = await window.api.request('/events', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
        
        console.log('✅ Wydarzenie zapisane!', eventResponse);
        
        // Pokaż komunikat sukcesu
        const notification = document.createElement('div');
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #4caf50, #45a049); color: white; padding: 20px 30px; border-radius: 10px; box-shadow: 0 4px 20px rgba(76,175,80,0.4); z-index: 10003; font-weight: 700; font-size: 1.1rem; animation: slideIn 0.3s ease-out;';
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 2rem;">✅</span>
                <div>
                    <div>Wydarzenie dodane!</div>
                    ${extraData.existing_document_ids?.length > 0 ? `<div style="font-size: 0.9rem; opacity: 0.9; margin-top: 4px;">📋 Wybrano ${extraData.existing_document_ids.length} dowód(ów)</div>` : ''}
                    ${extraData.existing_case_document_ids?.length > 0 ? `<div style="font-size: 0.9rem; opacity: 0.9; margin-top: 4px;">📄 Wybrano ${extraData.existing_case_document_ids.length} dokument(ów)</div>` : ''}
                    ${extraData.witness_testimony_ids?.length > 0 ? `<div style="font-size: 0.9rem; opacity: 0.9; margin-top: 4px;">📝 Wybrano ${extraData.witness_testimony_ids.length} zeznań</div>` : ''}
                </div>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transition = 'opacity 0.3s, transform 0.3s';
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Zamknij modal
        document.getElementById('enhancedEventModal').remove();
        
        // ODŚWIEŻ LISTĘ WYDARZEŃ - to kluczowe!
        console.log('🔄 Odświeżam listę wydarzeń...');
        await window.crmManager.loadCaseTabContent(caseId, 'events');
    } catch (error) {
        console.error('❌ Błąd:', error);
        alert('❌ Błąd: ' + error.message);
    }
};

// Renderowanie zakładki Wydarzenia
window.crmManager.renderCaseEventsTab = async function(caseId) {
    const formHtml = `
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: flex; justify-content: flex-end; padding: 20px;">
                <button onclick="window.showEnhancedEventForm(${caseId})" style="padding: 12px 24px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 15px rgba(212,175,55,0.3); transition: transform 0.2s;"
                    onmouseover="this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.transform='translateY(0)'">
                    ➕ Dodaj nowe wydarzenie
                </button>
            </div>
            
            <div id="caseEventsList">
                <p style="text-align: center; color: #1a2332; padding: 20px;">Ładowanie wydarzeń...</p>
            </div>
        </div>
    `;
    
    // Załaduj wydarzenia asynchronicznie
    setTimeout(async () => {
        try {
            const response = await window.api.request(`/events?case_id=${caseId}`);
            const events = response.events || [];
            
            const listDiv = document.getElementById('caseEventsList');
            if (!listDiv) return;
            
            if (events.length === 0) {
                listDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Brak wydarzeń dla tej sprawy</p>';
                return;
            }
            
            listDiv.innerHTML = events.map(e => {
                // NAPRAWIONA LOGIKA DAT - ignoruj strefy czasowe
                console.log(`🔍 Wydarzenie ${e.id} - RAW:`, {
                    title: e.title,
                    start_date_raw: e.start_date,
                    created_at_raw: e.created_at
                });
                
                // Użyj start_date i zignoruj timezone
                const eventDateStr = e.start_date.split('T')[0]; // "2025-11-07"
                const [year, month, day] = eventDateStr.split('-').map(Number);
                
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                
                // Porównaj stringi dat (bez czasu)
                const eventDateOnly = new Date(year, month - 1, day); // month - 1 bo JS liczy od 0
                const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const daysUntil = Math.round((eventDateOnly - todayOnly) / (1000 * 60 * 60 * 24));
                
                console.log(`📅 Wydarzenie ${e.id} - OBLICZONE:`, {
                    eventDateStr,
                    todayStr,
                    daysUntil,
                    result: daysUntil < 0 ? 'PRZESZŁE' : daysUntil === 0 ? 'DZIŚ' : `Za ${daysUntil} dni`
                });
                
                let urgencyColor = '#95a5a6';
                let urgencyText = `Za ${daysUntil} dni`;
                if (daysUntil < 0) {
                    urgencyColor = '#e74c3c';
                    urgencyText = 'Minął';
                } else if (daysUntil === 0) {
                    urgencyColor = '#e67e22';
                    urgencyText = 'Dziś!';
                } else if (daysUntil <= 3) {
                    urgencyColor = '#e67e22';
                } else if (daysUntil <= 7) {
                    urgencyColor = '#f39c12';
                }
                
                // Parsuj extra_data
                let extraData = {};
                try {
                    extraData = typeof e.extra_data === 'string' ? JSON.parse(e.extra_data) : (e.extra_data || {});
                } catch (err) {
                    console.warn('Błąd parsowania extra_data:', err);
                }
                
                const attachmentsCount = extraData.attachments?.length || 0;
                
                return `
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid ${urgencyColor}; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: start; gap: 15px;">
                            <div style="flex: 1;">
                                <div style="display: flex; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;">
                                    ${e.event_code ? `<span style="background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">${window.crmManager.escapeHtml(e.event_code)}</span>` : ''}
                                    <span style="background: #e0e0e0; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem;">${window.crmManager.escapeHtml(e.event_type || 'Wydarzenie')}</span>
                                    ${attachmentsCount > 0 ? `<span style="background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">📎 ${attachmentsCount}</span>` : ''}
                                </div>
                                <h4 style="margin: 0 0 8px 0; color: #1a2332;">${window.crmManager.escapeHtml(e.title)}</h4>
                                <div style="color: #666; font-size: 0.9rem;">
                                    📅 ${window.DateTimeUtils 
                                        ? window.DateTimeUtils.parseUTCDate(e.start_date).toLocaleString('pl-PL', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : `${eventDateOnly.toLocaleDateString('pl-PL')} ${new Date(e.start_date + (e.start_date.includes('Z') ? '' : 'Z')).toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'})}`}
                                    ${e.location ? ` • 📍 ${window.crmManager.escapeHtml(e.location)}` : ''}
                                </div>
                                ${e.description ? `<div style="color: #666; font-size: 0.85rem; margin-top: 8px;">${window.crmManager.escapeHtml(e.description.substring(0, 150))}${e.description.length > 150 ? '...' : ''}</div>` : ''}
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-end;">
                                <div style="font-size: 0.9rem; font-weight: 600; color: ${urgencyColor};">
                                    ${urgencyText}
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <button onclick="window.viewEventDetails(${e.id})" style="padding: 6px 14px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.3s;" onmouseover="this.style.background='linear-gradient(135deg, #d4af37, #FFD700)'" onmouseout="this.style.background='linear-gradient(135deg, #FFD700, #d4af37)'">
                                        👁️ Szczegóły
                                    </button>
                                    <button onclick="window.editEvent(${e.id})" style="padding: 6px 14px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.3s;" onmouseover="this.style.background='linear-gradient(135deg, #d4af37, #FFD700)'" onmouseout="this.style.background='linear-gradient(135deg, #FFD700, #d4af37)'">
                                        ✏️ Edytuj
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
        } catch (error) {
            console.error('❌ Błąd ładowania wydarzeń:', error);
            const listDiv = document.getElementById('caseEventsList');
            if (listDiv) {
                listDiv.innerHTML = '<p style="text-align: center; color: #dc3545; padding: 20px;">Błąd ładowania wydarzeń</p>';
            }
        }
    }, 100);
    
    return formHtml;
};

// Renderowanie zakładki Komentarze
window.crmManager.renderCaseCommentsTab = async function(caseId) {
    // Najpierw renderuj formularz
    const formHtml = `
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0; color: #1a2332;">💬 Komentarze do sprawy</h3>
                <button onclick="window.crmManager.reloadCommentsList(${caseId})" 
                    style="padding: 10px 20px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;"
                    title="Odśwież listę komentarzy">
                    🔄 Odśwież
                </button>
            </div>
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 20px; border-radius: 8px; box-shadow: 0 4px 15px rgba(212,175,55,0.3);">
                <h3 style="margin: 0 0 15px 0; color: white;">💬 Dodaj komentarz</h3>
                <textarea id="newCommentText" placeholder="Wpisz komentarz... (użyj przycisku 'Odpowiedz' przy innych komentarzach aby rozpocząć dyskusję)" style="width: 100%; padding: 15px; border: 3px solid #d4af37; border-radius: 6px; min-height: 120px; resize: vertical; font-size: 1.05rem; font-family: inherit; background: white !important; color: #1a2332 !important; font-weight: 600;"></textarea>
                
                <div style="margin-top: 10px;">
                    <label style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 6px; color: white; cursor: pointer;">
                        <span>📎</span>
                        <span style="font-weight: 600;">Dodaj plik</span>
                        <input type="file" id="commentPdfFile" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt" style="display: none;">
                    </label>
                    <span id="commentPdfName" style="color: white; margin-left: 10px; font-size: 0.9rem;"></span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 15px; margin-top: 15px; flex-wrap: wrap;">
                    <label style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 6px; color: white; cursor: pointer;">
                        <input type="checkbox" id="commentInternal" style="width: 18px; height: 18px; cursor: pointer;">
                        <span style="font-weight: 600;">🔒 Wewnętrzny (niewidoczny dla klienta)</span>
                    </label>
                    <button onclick="crmManager.saveCaseComment(${caseId})" style="padding: 12px 24px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 1rem; box-shadow: 0 2px 8px rgba(212,175,55,0.3); margin-left: auto;">
                        ✓ Zapisz komentarz
                    </button>
                </div>
            </div>
            
            <div style="border-top: 2px solid #e0e0e0; padding-top: 10px;">
                <h3 style="color: #1a2332; margin: 0 0 15px 0;">📝 Historia komentarzy</h3>
                <div id="caseCommentsList">
                    <p style="text-align: center; color: #1a2332; padding: 20px;">Ładowanie komentarzy...</p>
                </div>
            </div>
        </div>
    `;
    
    // Dodaj listener do wyboru pliku
    setTimeout(() => {
        const pdfInput = document.getElementById('commentPdfFile');
        const pdfName = document.getElementById('commentPdfName');
        
        if (pdfInput) {
            pdfInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    pdfName.textContent = `✓ ${e.target.files[0].name}`;
                } else {
                    pdfName.textContent = '';
                }
            });
        }
    }, 100);
    
    // Załaduj komentarze asynchronicznie
    setTimeout(async () => {
        try {
            const response = await window.api.request(`/comments/case/${caseId}`);
            const comments = response.comments || [];
            
            const listDiv = document.getElementById('caseCommentsList');
            if (!listDiv) return;
            
            if (comments.length === 0) {
                listDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Brak komentarzy do sprawy</p>';
                return;
            }
            
            // Organizuj komentarze w hierarchię
            const topLevelComments = comments.filter(c => !c.parent_comment_id);
            const getReplies = (parentId) => comments.filter(c => c.parent_comment_id === parentId);
            
            const renderComment = (c, isReply = false) => {
                const authorName = c.author_name || c.user_name || c.author_email || 'Nieznany użytkownik';
                const authorInitial = authorName[0].toUpperCase();
                const commentDate = new Date(c.created_at).toLocaleString('pl-PL');
                const isInternal = c.internal || c.is_internal;
                const replies = getReplies(c.id);
                
                return `
                <div style="${isReply ? 'margin-left: 50px; margin-top: 10px;' : ''}">
                    <div id="comment_${c.id}" data-comment-id="${c.id}" style="background: ${isInternal ? '#fff9e6' : 'white'}; padding: 20px; border-radius: 10px; border: 2px solid ${isInternal ? '#FFD700' : '#e0e0e0'}; ${isReply ? 'border-left: 4px solid #FFD700;' : ''} box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.3s ease;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #1a2332, #2c3e50); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.2rem;">
                                    ${authorInitial}
                                </div>
                                <div style="flex: 1;">
                                    <strong style="color: #1a2332; font-size: 1.05rem; display: block;">${window.crmManager.escapeHtml(authorName)}</strong>
                                    <span style="color: #666; font-size: 0.85rem;">${commentDate}</span>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                ${isInternal ? `
                                    <span style="padding: 6px 12px; background: #fff3cd; color: #856404; border: 1px solid #ffc107; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">
                                        🔒 Wewnętrzny
                                    </span>
                                ` : `
                                    <span style="padding: 6px 12px; background: #d4edda; color: #155724; border: 1px solid #28a745; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">
                                        👁️ Publiczny
                                    </span>
                                `}
                                <button onclick="crmManager.showReplyForm(${c.id}, '${window.crmManager.escapeHtml(authorName)}')" 
                                    style="padding: 6px 14px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: all 0.3s;" 
                                    onmouseover="this.style.background='linear-gradient(135deg, #d4af37, #FFD700)'" 
                                    onmouseout="this.style.background='linear-gradient(135deg, #FFD700, #d4af37)'">
                                    💬 Odpowiedz
                                </button>
                                <button onclick="crmManager.deleteComment(${caseId}, ${c.id})" 
                                    style="padding: 6px 14px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: all 0.3s;" 
                                    onmouseover="this.style.background='#c82333'" 
                                    onmouseout="this.style.background='#dc3545'"
                                    title="Usuń komentarz">
                                    🗑️ Usuń
                                </button>
                            </div>
                        </div>
                        <div style="color: #1a2332; line-height: 1.8; font-size: 1rem; white-space: pre-wrap; padding: 10px; background: ${isInternal ? '#fffaf0' : '#f9f9f9'}; border-radius: 6px;">${window.crmManager.escapeHtml(c.comment)}</div>
                        
                        <!-- Załączniki -->
                        ${c.attachments && c.attachments.length > 0 ? `
                            <div style="margin-top: 15px; padding: 12px; background: #f0f8ff; border-radius: 8px; border: 1px solid #b8d4f1;">
                                <div style="color: #d4af37; font-weight: 600; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                                    📎 Załączniki (${c.attachments.length})
                                </div>
                                ${c.attachments.map(att => {
                                    const fileIcon = att.file_type?.includes('pdf') ? '📄' : 
                                                   att.file_type?.includes('image') ? '🖼️' : 
                                                   att.file_type?.includes('word') ? '📝' : 
                                                   att.file_type?.includes('excel') ? '📊' : '📎';
                                    const fileSize = att.file_size ? (att.file_size / 1024).toFixed(1) + ' KB' : '';
                                    
                                    return `
                                        <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 6px; margin-bottom: 6px; border: 1px solid #e0e0e0;">
                                            <span style="font-size: 1.5rem;">${fileIcon}</span>
                                            <div style="flex: 1;">
                                                ${(att.attachment_code || att.document_number) ? `
                                                    <div style="display: inline-block; padding: 4px 10px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border-radius: 6px; font-size: 0.75rem; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3); margin-bottom: 5px;">
                                                        🔢 ${window.crmManager.escapeHtml(att.attachment_code || att.document_number)}
                                                    </div>
                                                ` : ''}
                                                <div style="font-weight: 600; color: #1a2332; font-size: 0.95rem;">${window.crmManager.escapeHtml(att.title || att.filename)}</div>
                                                <div style="font-size: 0.8rem; color: #666;">
                                                    ${fileSize}
                                                </div>
                                            </div>
                                            <button onclick="crmManager.viewDocument(${att.id}, null, 'attachment')" 
                                                style="padding: 6px 12px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600;"
                                                title="Wyświetl plik">
                                                👁️ Pokaż
                                            </button>
                                            <button onclick="crmManager.downloadDocument(${att.id}, '${window.crmManager.escapeHtml(att.filename)}', 'attachment')" 
                                                style="padding: 6px 12px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600;"
                                                title="Pobierz plik">
                                                ⬇️ Pobierz
                                            </button>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : ''}
                        
                        <!-- Formularz odpowiedzi (ukryty domyślnie) -->
                        <div id="replyForm_${c.id}" style="display: none; margin-top: 15px; padding: 15px; background: #fffaf0; border-radius: 8px; border: 2px dashed #FFD700;">
                            <div style="margin-bottom: 10px; color: #d4af37; font-weight: 600;">
                                💬 Odpowiedź do: ${window.crmManager.escapeHtml(authorName)}
                            </div>
                            <textarea id="replyText_${c.id}" placeholder="Wpisz odpowiedź..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; min-height: 80px; resize: vertical; font-size: 0.95rem;"></textarea>
                            <div style="display: flex; gap: 10px; margin-top: 10px;">
                                <label style="display: flex; align-items: center; gap: 5px;">
                                    <input type="checkbox" id="replyInternal_${c.id}">
                                    <span style="font-size: 0.85rem; color: #1a2332; font-weight: 600;">🔒 Wewnętrzny</span>
                                </label>
                                <button onclick="crmManager.saveReply(${caseId}, ${c.id})" style="padding: 8px 16px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; margin-left: auto;">
                                    ✓ Wyślij odpowiedź
                                </button>
                                <button onclick="crmManager.hideReplyForm(${c.id})" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">
                                    ✕ Anuluj
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Odpowiedzi -->
                    ${replies.length > 0 ? `
                        <div style="margin-top: 10px;">
                            ${replies.map(reply => renderComment(reply, true)).join('')}
                        </div>
                    ` : ''}
                </div>
                `;
            };
            
            listDiv.innerHTML = topLevelComments.map(c => renderComment(c, false)).join('');
            
        } catch (error) {
            console.error('❌ Błąd ładowania komentarzy:', error);
            const listDiv = document.getElementById('caseCommentsList');
            if (listDiv) {
                listDiv.innerHTML = '<p style="text-align: center; color: #dc3545; padding: 20px;">Błąd ładowania komentarzy</p>';
            }
        }
    }, 100);
    
    return formHtml;
};

// Renderowanie zakładki Historia
window.crmManager.renderCaseHistoryTab = async function(caseId) {
    try {
        const response = await window.api.request(`/cases/${caseId}/history`);
        const history = response.history || [];

        if (!history.length) {
            return `
                <div style="text-align: center; padding: 40px;">
                    <p style="font-size: 1.5rem; margin-bottom: 20px; color: #1a2332;">📜 Historia zmian</p>
                    <p style="color: #1a2332;">Brak zarejestrowanych działań dla tej sprawy.</p>
                </div>
            `;
        }

        const itemsHtml = history.map(entry => {
            const createdAt = entry.created_at ? new Date(entry.created_at).toLocaleString('pl-PL') : '';
            const userLabel = entry.user_name
                ? `${entry.user_name}${entry.user_role ? ' (' + entry.user_role + ')' : ''}`
                : 'Nieznany użytkownik';

            const category = entry.action_category || '';
            const type = entry.action_type || '';

            return `
                <div style="display: flex; gap: 12px; align-items: flex-start;">
                    <div style="width: 10px; height: 10px; border-radius: 50%; background: linear-gradient(135deg, #d4af37, #FFD700); margin-top: 6px; box-shadow: 0 0 0 3px rgba(102,126,234,0.2);"></div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                            <div style="font-weight: 600; color: #1a2332;">
                                ${window.crmManager.escapeHtml(entry.description || 'Akcja w sprawie')}
                            </div>
                            <div style="font-size: 0.8rem; color: #666; white-space: nowrap;">
                                ${createdAt}
                            </div>
                        </div>
                        <div style="margin-top: 4px; font-size: 0.85rem; color: #555;">
                            👤 ${window.crmManager.escapeHtml(userLabel)}
                            ${category ? ` • Kategoria: ${window.crmManager.escapeHtml(category)}` : ''}
                            ${type ? ` • Typ: ${window.crmManager.escapeHtml(type)}` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div style="padding: 20px 30px;">
                <div style="margin-bottom: 20px; text-align: left;">
                    <p style="font-size: 1.5rem; margin: 0 0 8px 0; color: #1a2332;">📜 Historia zmian</p>
                    <p style="color: #1a2332; margin: 0; opacity: 0.8;">Timeline wszystkich akcji w sprawie</p>
                </div>
                <div style="position: relative; padding-left: 10px;">
                    <div style="position: absolute; left: 4px; top: 0; bottom: 0; width: 2px; background: linear-gradient(180deg, rgba(102,126,234,0.3), rgba(118,75,162,0.3));"></div>
                    <div style="display: flex; flex-direction: column; gap: 14px; margin-left: 10px;">
                        ${itemsHtml}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('❌ Błąd ładowania historii sprawy:', error);
        return `
            <div style="text-align: center; padding: 40px;">
                <p style="font-size: 1.5rem; margin-bottom: 20px; color: #1a2332;">📜 Historia zmian</p>
                <p style="color: #c0392b;">Nie udało się załadować historii sprawy. Spróbuj ponownie później.</p>
            </div>
        `;
    }
};

// === FUNKCJA ŁADOWANIA LISTY WYDARZEŃ ===
window.loadTestEvents = async function(caseId) {
    console.log('📋 loadTestEvents wywołana! caseId:', caseId);
    
    try {
        const response = await window.api.request(`/events/case/${caseId}`);
        const events = response.events || [];
        
        console.log('📊 Pobrano wydarzeń:', events.length);
        
        const listDiv = document.getElementById('testEventsList');
        if (!listDiv) return;
        
        if (events.length === 0) {
            listDiv.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">Brak wydarzeń</p>';
            return;
        }
        
        // Mapowanie typów
        const eventTypes = {
            'negotiation': { icon: '🤝', color: '#3498db', label: 'Negocjacje' },
            'court': { icon: '⚖️', color: '#e74c3c', label: 'Rozprawa' },
            'meeting': { icon: '👥', color: '#2ecc71', label: 'Spotkanie' },
            'deadline': { icon: '⏰', color: '#e67e22', label: 'Termin procesowy' },
            'mediation': { icon: '🕊️', color: '#9b59b6', label: 'Mediacja' },
            'expertise': { icon: '🔬', color: '#f39c12', label: 'Ekspertyza' },
            'document': { icon: '📄', color: '#1abc9c', label: 'Dokument' },
            'hearing': { icon: '🗣️', color: '#e74c3c', label: 'Przesłuchanie' },
            'consultation': { icon: '💼', color: '#34495e', label: 'Konsultacja' },
            'task': { icon: '✅', color: '#16a085', label: 'Zadanie' },
            'other': { icon: '📝', color: '#95a5a6', label: 'Inne' }
        };
        
        const getTimeUntil = (dateStr) => {
            const now = new Date();
            // NAPRAWIONE: Parsuj jako lokalny czas (BEZ 'Z')
            // Format: "2025-11-21T07:32:00" → traktuj jako lokalny czas
            const eventDate = new Date(dateStr.replace(' ', 'T'));
            const diffMs = eventDate - now;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            
            if (diffMinutes < 0) return { text: 'PRZESZŁE', color: '#95a5a6', urgent: false };
            if (diffMinutes < 60) return { text: `Za ${diffMinutes} min`, color: '#e74c3c', urgent: true };
            if (diffHours < 2) return { text: `Za ${diffHours}h`, color: '#e74c3c', urgent: true };
            if (diffHours < 24) return { text: 'DZIŚ', color: '#e67e22', urgent: true };
            if (diffDays === 1) return { text: 'JUTRO', color: '#f39c12', urgent: true };
            if (diffDays <= 7) return { text: `Za ${diffDays} dni`, color: '#3498db', urgent: false };
            if (diffDays <= 30) return { text: `Za ${diffDays} dni`, color: '#2ecc71', urgent: false };
            return { text: `Za ${diffDays} dni`, color: '#95a5a6', urgent: false };
        };
        
        listDiv.innerHTML = events.map(e => {
            const type = eventTypes[e.event_type] || eventTypes.other;
            const timeInfo = getTimeUntil(e.start_date);
            
            return `
            <div data-event-id="${e.id}" style="background: white; padding: 18px; margin-bottom: 12px; border-radius: 8px; border-left: 5px solid ${type.color}; box-shadow: 0 2px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 15px;">
                    <div style="flex: 1;">
                        ${e.event_code ? `
                            <div style="background: linear-gradient(135deg, ${type.color}, ${type.color}dd); color: white; padding: 6px 14px; border-radius: 8px; display: inline-block; font-size: 0.9rem; font-weight: 700; margin-bottom: 10px; font-family: 'Courier New', monospace; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                                🔢 ${e.event_code}
                            </div>
                        ` : `
                            <div style="background: #95a5a6; color: white; padding: 6px 14px; border-radius: 8px; display: inline-block; font-size: 0.85rem; font-style: italic; margin-bottom: 10px;">
                                ⚠️ Brak kodu
                            </div>
                        `}
                        <h4 style="margin: 5px 0 10px 0; color: #1a2332; font-size: 1.1rem;">
                            ${type.icon} ${e.title}
                        </h4>
                        <div style="color: #666; font-size: 0.95rem; line-height: 1.6;">
                            📅 ${e.start_date.replace('T', ' ').substring(0, 16)}
                            ${e.location ? `<br>📍 ${e.location}` : ''}
                            ${e.description ? `<br><br><em style="color: #999;">${e.description.substring(0, 100)}${e.description.length > 100 ? '...' : ''}</em>` : ''}
                        </div>
                        <div style="margin-top: 12px; display: inline-block;">
                            <span style="padding: 6px 16px; background: ${timeInfo.color}; color: white; border-radius: 20px; font-weight: 700; font-size: 0.9rem;">
                                ${timeInfo.urgent ? '🔥 ' : ''}${timeInfo.text}
                            </span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="window.viewEventDetails(${e.id}, ${caseId})" 
                            style="padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">
                            👁️ Szczegóły
                        </button>
                        <button onclick="if(confirm('Usunąć to wydarzenie?')) window.deleteTestEvent(${e.id}, ${caseId})" 
                            style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">
                            🗑️ Usuń
                        </button>
                    </div>
                </div>
            </div>
        `}).join('');
        
    } catch (error) {
        console.error('❌ Błąd:', error);
    }
};

// === FUNKCJE PRZYPISYWANIA SPRAW ===

window.showAssignModal = async function(caseId) {
    try {
        const response = await window.api.request('/cases/staff/list');
        const lawyers = response.lawyers || [];
        const managers = response.case_managers || [];
        
        const modal = document.createElement('div');
        modal.id = 'assignModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.7); z-index: 10001; display: flex; justify-content: center; align-items: center;';
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; max-width: 600px; width: 90%;">
                <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 25px; border-radius: 16px 16px 0 0; color: white;">
                    <h3 style="margin: 0; font-size: 1.5rem;">✓ Przejmij sprawę</h3>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Wybierz mecenasa i opiekuna</p>
                </div>
                <div style="padding: 30px;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Mecenas prowadzący *</label>
                        <select id="assignLawyer" style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                            <option value="">Wybierz...</option>
                            ${lawyers.map(l => `<option value="${l.id}">${l.name}</option>`).join('')}
                        </select>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Opiekun sprawy</label>
                        <select id="assignManager" style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                            <option value="">Opcjonalnie...</option>
                            ${managers.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="document.getElementById('assignModal').remove()" style="flex: 1; padding: 14px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700;">Anuluj</button>
                        <button onclick="assignCase(${caseId})" style="flex: 2; padding: 14px; background: linear-gradient(135deg, #28a745, #20c997); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700;">✓ Przejmij</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    } catch (error) {
        alert('❌ Błąd: ' + error.message);
    }
};

window.assignCase = async function(caseId) {
    const lawyerId = document.getElementById('assignLawyer').value;
    const managerId = document.getElementById('assignManager').value || null;
    
    if (!lawyerId) {
        alert('Wybierz mecenasa!');
        return;
    }
    
    try {
        await window.api.request(`/cases/${caseId}/assign`, {
            method: 'POST',
            body: JSON.stringify({
                lawyer_id: parseInt(lawyerId),
                case_manager_id: managerId ? parseInt(managerId) : null
            })
        });
        
        alert('✅ Przypisano!');
        document.getElementById('assignModal').remove();
        window.crmManager.switchCaseTab(caseId, 'details');
    } catch (error) {
        alert('❌ Błąd: ' + error.message);
    }
};

window.unassignCase = async function(caseId) {
    try {
        await window.api.request(`/cases/${caseId}/unassign`, {
            method: 'POST'
        });
        
        alert('✅ Sprawa oddana!');
        window.crmManager.switchCaseTab(caseId, 'details');
    } catch (error) {
        alert('❌ Błąd: ' + error.message);
    }
};

// === EDYCJA SPRAWY ===

window.showEditCaseModal = async function(caseId) {
    try {
        const response = await window.api.request(`/cases/${caseId}`);
        const caseData = response.case;
        
        const modal = document.createElement('div');
        modal.id = 'editCaseModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.7); z-index: 10001; display: flex; justify-content: center; align-items: flex-start; padding: 2.5vh 0; overflow-y: auto;';
        
        // Zamknięcie po kliknięciu w tło
        modal.onclick = function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        };
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; width: 95vw; max-width: 1200px; height: 95vh; display: flex; flex-direction: column; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #3498db, #2980b9); padding: 25px; border-radius: 16px 16px 0 0; color: white; flex-shrink: 0;">
                    <h3 style="margin: 0; font-size: 1.5rem;">✏️ Edytuj sprawę</h3>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Zmień szczegóły sprawy</p>
                </div>
                
                <div style="padding: 30px; overflow-y: auto; flex: 1;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Numer sprawy</label>
                            <input type="text" id="editCaseNumber" value="${caseData.case_number}" style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; background: #f5f5f5;" readonly>
                        </div>
                        <div>
                            <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Typ sprawy *</label>
                            <small style="display: block; color: #666; font-size: 0.85rem; margin-bottom: 8px; font-style: italic;">
                                (WYBIERZ PODTYP - GŁÓWNY TYP ZOSTANIE AUTOMATYCZNIE PRZYPISANY)
                            </small>
                            <select id="editCaseType" style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                                <option value="">Wybierz...</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Tytuł sprawy *</label>
                        <input type="text" id="editTitle" value="${caseData.title}" style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Priorytet</label>
                            <select id="editPriority" style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                                <option value="low" ${caseData.priority === 'low' ? 'selected' : ''}>🔵 Niski</option>
                                <option value="medium" ${caseData.priority === 'medium' ? 'selected' : ''}>🟡 Średni</option>
                                <option value="high" ${caseData.priority === 'high' ? 'selected' : ''}>🔴 Wysoki</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Status</label>
                            <select id="editStatus" style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                                <option value="open" ${caseData.status === 'open' ? 'selected' : ''}>🟢 Otwarta</option>
                                <option value="in_progress" ${caseData.status === 'in_progress' ? 'selected' : ''}>🟡 W toku</option>
                                <option value="closed" ${caseData.status === 'closed' ? 'selected' : ''}>🔴 Zamknięta</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="background: #f0f8ff; border: 2px solid #3498db; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(52,152,219,0.1);">
                        <h4 style="margin: 0 0 20px 0; color: #2980b9; font-size: 1.15rem; display: flex; align-items: center; gap: 10px;">
                            ⚖️ Informacje sądowe
                        </h4>
                        
                        <!-- Sąd i sygnatura -->
                        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div>
                                <label style="display: block; color: #555; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">🏛️ Nazwa sądu</label>
                                <input type="text" id="editCourtName" value="${caseData.court_name || ''}" placeholder="np. Sąd Okręgowy w Warszawie" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;" onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#e0e0e0'">
                            </div>
                            <div>
                                <label style="display: block; color: #555; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">📑 Sygnatura</label>
                                <input type="text" id="editCourtSignature" value="${caseData.court_signature || ''}" placeholder="I C 123/2025" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;" onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#e0e0e0'">
                            </div>
                        </div>
                        
                        <!-- Wydział -->
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; color: #555; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">🏢 Wydział</label>
                            <input type="text" id="editCourtDepartment" value="${caseData.court_department || ''}" placeholder="np. I Wydział Cywilny" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;" onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#e0e0e0'">
                        </div>
                        
                        <!-- Sędzia i Referent -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; color: #555; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">👨‍⚖️ Sędzia prowadzący</label>
                                <input type="text" id="editJudgeName" value="${caseData.judge_name || ''}" placeholder="SSO Jan Kowalski" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;" onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#e0e0e0'">
                            </div>
                            <div>
                                <label style="display: block; color: #555; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">📋 Referent sądowy</label>
                                <input type="text" id="editReferent" value="${caseData.referent || ''}" placeholder="Anna Nowak" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;" onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#e0e0e0'">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sekcja Prokuratura (wszystkie typy spraw) -->
                    <div style="background: #fff3e0; border: 2px solid #ff9800; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(255,152,0,0.1);">
                        <h4 style="margin: 0 0 20px 0; color: #f57c00; font-size: 1.15rem; display: flex; align-items: center; gap: 10px;">
                            🔍 Prokuratura i organy ścigania
                        </h4>
                        <p style="margin: 0 0 15px 0; color: #666; font-size: 0.9rem; font-style: italic;">
                            Jeśli dotyczy - np. w sprawach karnych, odszkodowaniach, przestępstwach gospodarczych
                        </p>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; color: #555; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">🏛️ Prokuratura</label>
                            <input type="text" id="editProsecutorOffice" value="${caseData.prosecutor_office || ''}" placeholder="np. Prokuratura Rejonowa w Warszawie" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;" onfocus="this.style.borderColor='#ff9800'" onblur="this.style.borderColor='#e0e0e0'">
                        </div>
                        
                        <!-- Ukryte pola z autocomplete -->
                        <input type="hidden" id="selectedProsecutorId" value="${caseData.prosecutor_id || ''}">
                        <input type="hidden" id="prosecutorAddress" value="${caseData.prosecutor_address || ''}">
                        <input type="hidden" id="prosecutorPhone" value="${caseData.prosecutor_phone || ''}">
                        <input type="hidden" id="prosecutorEmail" value="${caseData.prosecutor_email || ''}">
                        <input type="hidden" id="prosecutorWebsite" value="${caseData.prosecutor_website || ''}">
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; color: #555; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">👤 Prokurator</label>
                                <input type="text" id="editProsecutorName" value="${caseData.prosecutor_name || ''}" placeholder="Imię i nazwisko prokuratora" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;" onfocus="this.style.borderColor='#ff9800'" onblur="this.style.borderColor='#e0e0e0'">
                            </div>
                            <div>
                                <label style="display: block; color: #555; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">📑 Postanowienie / Akt oskarżenia</label>
                                <input type="text" id="editIndictmentNumber" value="${caseData.indictment_number || ''}" placeholder="np. Ds. 123/2025" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;" onfocus="this.style.borderColor='#ff9800'" onblur="this.style.borderColor='#e0e0e0'">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sekcja Komenda Policji -->
                    <div style="background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15)); border: 2px solid #d4af37; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(33,150,243,0.1);">
                        <h4 style="margin: 0 0 20px 0; color: #1565c0; font-size: 1.15rem; display: flex; align-items: center; gap: 10px;">
                            🚔 Komenda Policji / Organ dochodzeniowy
                        </h4>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; color: #555; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">🚔 Nazwa komendy</label>
                            <input type="text" id="manualPoliceAuthority" value="${caseData.investigation_authority || ''}" placeholder="np. Komenda Rejonowa Policji Warszawa III" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;" onfocus="this.style.borderColor='#d4af37'" onblur="this.style.borderColor='#e0e0e0'">
                        </div>
                        
                        <!-- Ukryte pola z autocomplete -->
                        <input type="hidden" id="selectedPoliceId" value="${caseData.police_id || ''}">
                        <input type="hidden" id="policeAddress" value="${caseData.police_address || ''}">
                        <input type="hidden" id="policePhone" value="${caseData.police_phone || ''}">
                        <input type="hidden" id="policeEmail" value="${caseData.police_email || ''}">
                        <input type="hidden" id="policeWebsite" value="${caseData.police_website || ''}">
                        
                        <div>
                            <label style="display: block; color: #555; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">📑 Sygnatura akt policyjnych</label>
                            <input type="text" id="editPoliceCaseNumber" value="${caseData.police_case_number || ''}" placeholder="np. RSD-123/2025" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;" onfocus="this.style.borderColor='#d4af37'" onblur="this.style.borderColor='#e0e0e0'">
                        </div>
                    </div>
                    
                    <div style="background: #fff3e0; border: 2px solid #ff9800; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; color: #f57c00;">👥 Strony i wartość</h4>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Strona przeciwna</label>
                            <input type="text" id="editOpposingParty" value="${caseData.opposing_party || ''}" placeholder="Imię i nazwisko / Nazwa firmy" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                        </div>
                        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Wartość przedmiotu sporu</label>
                                <input type="number" id="editValueAmount" value="${caseData.value_amount || ''}" placeholder="12000" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                            </div>
                            <div>
                                <label style="display: block; color: #333; font-weight: 600; margin-bottom: 8px;">Waluta</label>
                                <select id="editValueCurrency" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px;">
                                    <option value="PLN" ${(caseData.value_currency || 'PLN') === 'PLN' ? 'selected' : ''}>PLN</option>
                                    <option value="EUR" ${caseData.value_currency === 'EUR' ? 'selected' : ''}>EUR</option>
                                    <option value="USD" ${caseData.value_currency === 'USD' ? 'selected' : ''}>USD</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Opis sprawy</label>
                        <textarea id="editDescription" name="description" rows="6" style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; resize: vertical;">${caseData.description || ''}</textarea>
                    </div>
                </div>
                
                <!-- Przyciski na dole - zawsze widoczne -->
                <div style="display: flex; gap: 15px; padding: 20px 30px; border-top: 2px solid #e0e0e0; flex-shrink: 0; background: white; border-radius: 0 0 16px 16px;">
                    <button onclick="document.getElementById('editCaseModal').remove(); window.crmManager.switchCaseTab(${caseId}, 'details');" style="flex: 1; padding: 14px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem;">Anuluj</button>
                    <button onclick="saveEditedCase(${caseId})" style="flex: 2; padding: 14px; background: linear-gradient(135deg, #3498db, #2980b9); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem;">✓ Zapisz zmiany</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Wypełnij select typami spraw (takie same jak przy dodawaniu)
        const editCaseTypeSelect = document.getElementById('editCaseType');
        if (window.caseTypeConfig && editCaseTypeSelect) {
            window.caseTypeConfig.typeGroups.forEach(group => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = group.label;
                
                group.subtypes.forEach(subtype => {
                    const option = document.createElement('option');
                    option.value = subtype.value;
                    option.textContent = `${subtype.label}`;
                    option.dataset.mainType = group.mainType;
                    option.dataset.prefix = subtype.prefix;
                    
                    // Zaznacz aktualny podtyp sprawy
                    if (subtype.value === caseData.case_subtype || 
                        (subtype.value === caseData.case_type && !caseData.case_subtype)) {
                        option.selected = true;
                    }
                    
                    optgroup.appendChild(option);
                });
                
                editCaseTypeSelect.appendChild(optgroup);
            });
            
            console.log('✅ Załadowano typy spraw do edycji:', caseData.case_type, caseData.case_subtype);
        }
        
        // Zamknięcie ESC
        const escHandler = function(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // 📝 Inicjalizuj Rich Text Editor dla opisu sprawy
        if (window.RichTextEditor) {
            setTimeout(() => {
                window.RichTextEditor.init('editDescription', caseData.description || '');
                console.log('✅ Rich Text Editor zainicjalizowany dla edycji sprawy');
            }, 100);
        }
        
    } catch (error) {
        alert('❌ Błąd: ' + error.message);
    }
};

window.saveEditedCase = async function(caseId) {
    const caseSubtype = document.getElementById('editCaseType').value;
    const mainType = window.getMainTypeFromSubtype ? window.getMainTypeFromSubtype(caseSubtype) : caseSubtype;
    
    const data = {
        title: document.getElementById('editTitle').value.trim(),
        case_type: mainType,
        case_subtype: caseSubtype,
        priority: document.getElementById('editPriority').value,
        status: document.getElementById('editStatus').value,
        court_name: document.getElementById('editCourtName').value.trim(),
        court_signature: document.getElementById('editCourtSignature').value.trim(),
        court_department: document.getElementById('editCourtDepartment').value.trim(),
        judge_name: document.getElementById('editJudgeName').value.trim(),
        referent: document.getElementById('editReferent').value.trim(),
        prosecutor_office: document.getElementById('editProsecutorOffice').value.trim(),
        prosecutor_name: document.getElementById('editProsecutorName').value.trim(),
        prosecutor_address: document.getElementById('prosecutorAddress')?.value.trim() || '',
        prosecutor_phone: document.getElementById('prosecutorPhone')?.value.trim() || '',
        prosecutor_email: document.getElementById('prosecutorEmail')?.value.trim() || '',
        prosecutor_website: document.getElementById('prosecutorWebsite')?.value.trim() || '',
        indictment_number: document.getElementById('editIndictmentNumber').value.trim(),
        investigation_authority: document.getElementById('manualPoliceAuthority')?.value.trim() || '',
        police_case_number: document.getElementById('editPoliceCaseNumber')?.value.trim() || '',
        police_id: document.getElementById('selectedPoliceId')?.value || '',
        police_address: document.getElementById('policeAddress')?.value.trim() || '',
        police_phone: document.getElementById('policePhone')?.value.trim() || '',
        police_email: document.getElementById('policeEmail')?.value.trim() || '',
        police_website: document.getElementById('policeWebsite')?.value.trim() || '',
        opposing_party: document.getElementById('editOpposingParty').value.trim(),
        value_amount: document.getElementById('editValueAmount').value || null,
        value_currency: document.getElementById('editValueCurrency').value,
        description: document.getElementById('editDescription').value.trim()
    };
    
    console.log('💾 Zapisuję sprawę z danymi policji:', {
        police_id: data.police_id,
        investigation_authority: data.investigation_authority,
        police_address: data.police_address,
        police_phone: data.police_phone
    });
    
    if (!data.title) {
        alert('Tytuł sprawy jest wymagany!');
        return;
    }
    
    try {
        await window.api.request(`/cases/${caseId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        
        alert('✅ Zapisano zmiany!');
        document.getElementById('editCaseModal').remove();
        
        // Odśwież tylko zakładkę szczegółów (nie zamykaj modala sprawy!)
        window.crmManager.switchCaseTab(caseId, 'details');
    } catch (error) {
        alert('❌ Błąd: ' + error.message);
    }
};

// === EDYCJA WYDARZENIA ===

window.editEventModal = async function(eventId, caseId) {
    console.log('✏️ Edycja wydarzenia:', eventId);
    
    try {
        // Pobierz aktualne dane
        const response = await window.api.request(`/events/${eventId}`);
        const event = response.event || response;
        
        // Zamknij modal szczegółów
        document.getElementById('eventDetailsModal')?.remove();
        
        // Formatowanie daty dla input datetime-local
        const formatDate = (dateStr) => {
            const d = new Date(dateStr);
            return d.toISOString().slice(0, 16);
        };
        
        // Utwórz modal edycji
        const modal = document.createElement('div');
        modal.id = 'eventEditModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0,0,0,0.7);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: fadeIn 0.2s ease;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                padding: 0;
                max-width: 700px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            ">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #3498db, #2980b9); padding: 25px; border-radius: 16px 16px 0 0; color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 1.5rem;">✏️ Edytuj wydarzenie</h2>
                        <button onclick="document.getElementById('eventEditModal').remove()" style="
                            background: rgba(255,255,255,0.2);
                            border: 2px solid white;
                            color: white;
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            cursor: pointer;
                            font-size: 1.5rem;
                        ">×</button>
                    </div>
                </div>
                
                <!-- Form -->
                <div style="padding: 30px;">
                    <div style="display: grid; gap: 15px;">
                        <!-- Typ -->
                        <div>
                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Typ wydarzenia:</label>
                            <select id="editEventType" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                                <option value="court" ${event.event_type === 'court' ? 'selected' : ''}>⚖️ Rozprawa w sądzie</option>
                                <option value="meeting_office" ${event.event_type === 'meeting_office' ? 'selected' : ''}>🏢 Spotkanie w biurze</option>
                                <option value="meeting_client" ${event.event_type === 'meeting_client' ? 'selected' : ''}>🏠 Spotkanie u klienta</option>
                                <option value="inspection" ${event.event_type === 'inspection' ? 'selected' : ''}>🔍 Oględziny</option>
                                <option value="meeting_city" ${event.event_type === 'meeting_city' ? 'selected' : ''}>🏙️ Spotkanie na mieście</option>
                                <option value="task" ${event.event_type === 'task' ? 'selected' : ''}>📋 Zadanie</option>
                                <option value="deadline" ${event.event_type === 'deadline' ? 'selected' : ''}>⏰ Termin</option>
                                <option value="other" ${event.event_type === 'other' ? 'selected' : ''}>📝 Inne</option>
                            </select>
                        </div>
                        
                        <!-- Tytuł -->
                        <div>
                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Tytuł:</label>
                            <input type="text" id="editEventTitle" value="${event.title}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                        </div>
                        
                        <!-- Data -->
                        <div>
                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Data i godzina:</label>
                            <input type="datetime-local" id="editEventDate" value="${formatDate(event.start_date)}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                        </div>
                        
                        <!-- Lokalizacja -->
                        <div>
                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Lokalizacja:</label>
                            <input type="text" id="editEventLocation" value="${event.location || ''}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                        </div>
                        
                        <!-- Opis -->
                        <div>
                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Opis:</label>
                            <textarea id="editEventDescription" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; min-height: 100px; resize: vertical;">${event.description || ''}</textarea>
                        </div>
                    </div>
                    
                    <!-- Przyciski -->
                    <div style="display: flex; gap: 10px; margin-top: 25px; padding-top: 20px; border-top: 2px solid #f0f0f0;">
                        <button onclick="document.getElementById('eventEditModal').remove()" style="
                            flex: 1;
                            padding: 14px;
                            background: #95a5a6;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 700;
                            font-size: 1rem;
                        ">
                            Anuluj
                        </button>
                        <button onclick="window.saveEventEdit(${eventId}, ${caseId})" style="
                            flex: 2;
                            padding: 14px;
                            background: linear-gradient(135deg, #2ecc71, #27ae60);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 700;
                            font-size: 1rem;
                            transition: transform 0.2s;
                        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            ✓ Zapisz zmiany
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Zamknij przy kliknięciu w tło
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
    } catch (error) {
        console.error('❌ Błąd ładowania edycji:', error);
        alert('❌ Błąd: ' + error.message);
    }
};

// === ZAPIS EDYCJI ===

window.saveEventEdit = async function(eventId, caseId) {
    console.log('💾 Zapisuję edycję wydarzenia:', eventId);
    
    try {
        const eventType = document.getElementById('editEventType').value;
        const title = document.getElementById('editEventTitle').value;
        const date = document.getElementById('editEventDate').value;
        const location = document.getElementById('editEventLocation').value;
        const description = document.getElementById('editEventDescription').value;
        
        if (!title || !date) {
            alert('Wypełnij tytuł i datę!');
            return;
        }
        
        const response = await window.api.request(`/events/${eventId}`, {
            method: 'PUT',
            body: JSON.stringify({
                event_type: eventType,
                title: title,
                start_date: date,
                location: location,
                description: description
            })
        });
        
        console.log('✅ Zapisano:', response);
        alert('✅ Zapisano zmiany!');
        
        // Zamknij modal
        document.getElementById('eventEditModal').remove();
        
        // Odśwież listę
        window.loadTestEvents(caseId);
        window.refreshUpcomingEvents();
        
    } catch (error) {
        console.error('❌ Błąd zapisu:', error);
        alert('❌ Błąd: ' + error.message);
    }
};

window.deleteTestEvent = async function(eventId, caseId) {
    console.log('🗑️ Usuwam wydarzenie:', eventId);
    
    try {
        await window.api.request(`/events/${eventId}`, { method: 'DELETE' });
        console.log('✅ Usunięto');
        alert('✅ Usunięto!');
        window.loadTestEvents(caseId);
        window.refreshUpcomingEvents();
    } catch (error) {
        console.error('❌ Błąd usuwania:', error);
        alert('❌ Błąd: ' + error.message);
    }
};

// === WIDGET NADCHODZĄCYCH WYDARZEŃ (DASHBOARD) ===

window.refreshUpcomingEvents = async function() {
    console.log('📅 Ładuję nadchodzące wydarzenia dla dashboard...');
    
    const listDiv = document.getElementById('upcomingEventsList');
    if (!listDiv) return;
    
    listDiv.innerHTML = '<p style="text-align: center; color: white; padding: 20px;">Ładowanie...</p>';
    
    try {
        // Pobierz wszystkie wydarzenia
        const response = await window.api.request('/events');
        let events = response.events || [];
        
        console.log('📊 Pobrano wszystkich wydarzeń:', events.length);
        
        // Filtruj tylko przyszłe wydarzenia
        const now = new Date();
        events = events.filter(e => new Date(e.start_date) > now);
        
        // Sortuj po dacie
        events.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        
        // Weź tylko 5 najbliższych
        events = events.slice(0, 5);
        
        console.log('📊 Nadchodzących wydarzeń:', events.length);
        
        if (events.length === 0) {
            listDiv.innerHTML = '<p style="text-align: center; color: white; padding: 20px;">Brak nadchodzących wydarzeń</p>';
            return;
        }
        
        // Mapowanie funkcji (kopiuję z loadTestEvents)
        const getEventIcon = (type) => {
            const icons = {
                'court': '⚖️', 'meeting_office': '🏢', 'meeting_client': '🏠',
                'inspection': '🔍', 'meeting_city': '🏙️', 'task': '📋',
                'deadline': '⏰', 'other': '📝'
            };
            return icons[type] || '📝';
        };
        
        const getTimeUntil = (dateStr) => {
            const now = new Date();
            const eventDate = new Date(dateStr);
            const diffMs = eventDate - now;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            
            if (diffMinutes < 60) return { text: `Za ${diffMinutes} min`, color: '#e74c3c', urgent: true };
            else if (diffHours < 2) return { text: `Za ${diffHours}h`, color: '#e74c3c', urgent: true };
            else if (diffHours < 24) return { text: `DZIŚ o ${eventDate.toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'})}`, color: '#e67e22', urgent: true };
            else if (diffDays === 1) return { text: `JUTRO o ${eventDate.toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'})}`, color: '#f39c12', urgent: true };
            else if (diffDays === 2) return { text: 'Pojutrze', color: '#f39c12', urgent: false };
            else if (diffDays <= 7) return { text: `Za ${diffDays} dni`, color: '#3498db', urgent: false };
            else return { text: `Za ${diffDays} dni`, color: '#2ecc71', urgent: false };
        };
        
        listDiv.innerHTML = events.map(e => {
            const icon = getEventIcon(e.event_type);
            const timeInfo = getTimeUntil(e.start_date);
            
            return `
            <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); cursor: pointer;" onclick="window.crmManager.viewCase(${e.case_id})">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    <div style="flex: 1;">
                        ${e.event_code ? `<div style="color: #d4af37 !important; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">${e.event_code}</div>` : ''}
                        <div style="color: #1a2332 !important; font-weight: 600; font-size: 1rem; margin-bottom: 4px;">
                            ${icon} ${e.title}
                        </div>
                        <div style="color: #666 !important; font-size: 0.85rem;">
                            📅 ${new Date(e.start_date).toLocaleString('pl-PL')}
                            ${e.location ? ` • 📍 ${e.location}` : ''}
                        </div>
                    </div>
                    <div>
                        <span style="padding: 6px 12px; background: ${timeInfo.color}; color: white !important; border-radius: 16px; font-weight: 700; font-size: 0.85rem; white-space: nowrap;">
                            ${timeInfo.urgent ? '🔥 ' : ''}${timeInfo.text}
                        </span>
                    </div>
                </div>
            </div>
        `}).join('');
        
    } catch (error) {
        console.error('❌ Błąd ładowania nadchodzących wydarzeń:', error);
        listDiv.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 20px;">Błąd ładowania</p>';
    }
};

// Auto-load gdy otwiera się widok CRM
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (document.getElementById('upcomingEventsList')) {
            window.refreshUpcomingEvents();
        }
    }, 1000);
});

// === FUNKCJE SZCZEGÓŁÓW I EDYCJI WYDARZEŃ ===

// Wyświetl szczegóły wydarzenia
window.viewEventDetails = async function(eventId) {
    console.log('👁️ Wyświetlam szczegóły wydarzenia:', eventId);
    
    try {
        const response = await window.api.request(`/events/${eventId}`);
        const event = response.event;
        
        if (!event) {
            alert('❌ Nie znaleziono wydarzenia');
            return;
        }
        
        // Parsuj extra_data
        let extraData = {};
        try {
            extraData = typeof event.extra_data === 'string' ? JSON.parse(event.extra_data) : (event.extra_data || {});
            console.log('🔍 PARSED EXTRA DATA:', extraData);
            console.log('🔍 new_client:', extraData.new_client);
            console.log('🔍 new_client_name:', extraData.new_client_name);
            console.log('🔍 assigned_lawyer:', extraData.assigned_lawyer);
            console.log('🔍 case_manager:', extraData.case_manager);
        } catch (err) {
            console.warn('Błąd parsowania extra_data:', err);
        }
        
        // Ikony typów
        const typeIcons = {
            'negotiation': '🤝', 'court': '⚖️', 'meeting': '👥', 
            'deadline': '⏰', 'mediation': '🕊️', 'expertise': '🔬',
            'document': '📄', 'hearing': '🗣️', 'consultation': '💼',
            'task': '✅', 'other': '📝'
        };
        
        const typeNames = {
            'negotiation': 'Negocjacje', 'court': 'Rozprawa sądowa', 'meeting': 'Spotkanie',
            'deadline': 'Termin procesowy', 'mediation': 'Mediacja', 'expertise': 'Ekspertyza',
            'document': 'Złożenie dokumentu', 'hearing': 'Przesłuchanie', 'consultation': 'Konsultacja',
            'task': 'Zadanie', 'other': 'Inne'
        };
        
        const icon = typeIcons[event.event_type] || '📅';
        const typeName = typeNames[event.event_type] || event.event_type;
        
        // Generuj HTML dla extra_data
        let extraFieldsHtml = '';
        
        if (event.event_type === 'negotiation') {
            extraFieldsHtml = `
                ${extraData.negotiation_with ? `<div><strong>Z kim:</strong> ${extraData.negotiation_with}</div>` : ''}
                ${extraData.subject ? `<div><strong>Przedmiot:</strong> ${extraData.subject}</div>` : ''}
                ${extraData.expected_result ? `<div><strong>Oczekiwany rezultat:</strong> ${extraData.expected_result}</div>` : ''}
            `;
        } else if (event.event_type === 'court') {
            extraFieldsHtml = `
                ${extraData.court_signature ? `<div><strong>Sygnatura akt:</strong> ${extraData.court_signature}</div>` : ''}
                ${extraData.judge_name ? `<div><strong>Sędzia:</strong> ${extraData.judge_name}</div>` : ''}
                ${extraData.hearing_type ? `<div><strong>Typ rozprawy:</strong> ${extraData.hearing_type}</div>` : ''}
                ${extraData.witnesses ? `<div><strong>Świadkowie:</strong> ${extraData.witnesses}</div>` : ''}
                ${extraData.documents_to_present ? `<div><strong>Dokumenty:</strong> ${extraData.documents_to_present}</div>` : ''}
            `;
        } else if (event.event_type === 'meeting') {
            extraFieldsHtml = `
                ${extraData.participants ? `<div><strong>Uczestnicy:</strong> ${extraData.participants}</div>` : ''}
                ${extraData.purpose ? `<div><strong>Cel:</strong> ${extraData.purpose}</div>` : ''}
                ${extraData.agenda ? `<div><strong>Agenda:</strong> ${extraData.agenda}</div>` : ''}
            `;
        } else if (event.event_type === 'deadline') {
            extraFieldsHtml = `
                ${extraData.deadline_type ? `<div><strong>Typ terminu:</strong> ${extraData.deadline_type}</div>` : ''}
                ${extraData.consequences ? `<div><strong>Konsekwencje:</strong> ${extraData.consequences}</div>` : ''}
                ${extraData.critical ? `<div style="color: #dc3545; font-weight: 700;">🚨 KRYTYCZNY TERMIN</div>` : ''}
            `;
        } else if (event.event_type === 'mediation') {
            extraFieldsHtml = `
                ${extraData.mediator_name ? `<div><strong>Mediator:</strong> ${extraData.mediator_name}</div>` : ''}
                ${extraData.expected_outcome ? `<div><strong>Oczekiwany wynik:</strong> ${extraData.expected_outcome}</div>` : ''}
                ${extraData.settlement_proposals ? `<div><strong>Propozycje ugody:</strong> ${extraData.settlement_proposals}</div>` : ''}
            `;
        } else if (event.event_type === 'expertise') {
            extraFieldsHtml = `
                ${extraData.expertise_type ? `<div><strong>Rodzaj:</strong> ${extraData.expertise_type}</div>` : ''}
                ${extraData.expert_name ? `<div><strong>Ekspert:</strong> ${extraData.expert_name}</div>` : ''}
                ${extraData.scope ? `<div><strong>Zakres:</strong> ${extraData.scope}</div>` : ''}
            `;
        } else if (event.event_type === 'document') {
            extraFieldsHtml = `
                ${extraData.document_list ? `<div><strong>Dokumenty:</strong> ${extraData.document_list}</div>` : ''}
                ${extraData.where_submitted ? `<div><strong>Gdzie składane:</strong> ${extraData.where_submitted}</div>` : ''}
                ${extraData.submission_deadline ? `<div><strong>Termin:</strong> ${extraData.submission_deadline}</div>` : ''}
            `;
        } else if (event.event_type === 'hearing') {
            extraFieldsHtml = `
                ${extraData.witness_name ? `<div><strong>Świadek:</strong> ${extraData.witness_name}</div>` : ''}
                ${extraData.witness_role ? `<div><strong>Rola:</strong> ${extraData.witness_role}</div>` : ''}
                ${extraData.key_questions ? `<div><strong>Pytania:</strong> ${extraData.key_questions}</div>` : ''}
            `;
        } else if (event.event_type === 'consultation') {
            extraFieldsHtml = `
                ${extraData.consultation_with ? `<div><strong>Z kim:</strong> ${extraData.consultation_with}</div>` : ''}
                ${extraData.person_name ? `<div><strong>Osoba:</strong> ${extraData.person_name}</div>` : ''}
                ${extraData.topic ? `<div><strong>Temat:</strong> ${extraData.topic}</div>` : ''}
            `;
        } else if (event.event_type === 'task') {
            extraFieldsHtml = `
                ${extraData.responsible ? `<div><strong>Odpowiedzialny:</strong> ${extraData.responsible}</div>` : ''}
                ${extraData.priority ? `<div><strong>Priorytet:</strong> ${extraData.priority}</div>` : ''}
                ${extraData.status ? `<div><strong>Status:</strong> ${extraData.status}</div>` : ''}
            `;
        }
        
        // Dodaj dane klienta, mecenasa i opiekuna (z kalendarza)
        let additionalInfoHtml = '';
        
        // Nowy klient - NOWY FORMAT (new_client object)
        if (extraData.new_client) {
            const nc = extraData.new_client;
            additionalInfoHtml += `
                <div style="margin-top: 15px; padding: 15px; background: #f0f8ff; border-radius: 8px; border-left: 4px solid #667eea;">
                    <h4 style="margin: 0 0 10px 0; color: #d4af37;">👤 Dane klienta</h4>
                    <div><strong>Imię i nazwisko:</strong> ${nc.first_name || ''} ${nc.last_name || ''}</div>
                    ${nc.phone ? `<div><strong>📞 Telefon:</strong> ${nc.phone}</div>` : ''}
                    ${nc.email ? `<div><strong>📧 Email:</strong> ${nc.email}</div>` : ''}
                    ${nc.address ? `<div><strong>🏠 Adres:</strong> ${nc.address}</div>` : ''}
                </div>
            `;
        }
        // KOMPATYBILNOŚĆ WSTECZNA - stary format (new_client_name string)
        else if (extraData.new_client_name) {
            additionalInfoHtml += `
                <div style="margin-top: 15px; padding: 15px; background: #f0f8ff; border-radius: 8px; border-left: 4px solid #667eea;">
                    <h4 style="margin: 0 0 10px 0; color: #d4af37;">👤 Klient</h4>
                    <div><strong>Nazwa:</strong> ${extraData.new_client_name}</div>
                    ${extraData.new_client_phone ? `<div><strong>📞 Telefon:</strong> ${extraData.new_client_phone}</div>` : ''}
                    ${extraData.new_client_email ? `<div><strong>📧 Email:</strong> ${extraData.new_client_email}</div>` : ''}
                </div>
            `;
        }
        
        // Mecenas prowadzący
        if (extraData.assigned_lawyer) {
            const lawyerNames = {
                'lawyer_a': '👨‍⚖️ Mec. Jan Kowalski',
                'lawyer_b': '👩‍⚖️ Mec. Anna Nowak',
                'lawyer_c': '👨‍⚖️ Mec. Piotr Wiśniewski'
            };
            const lawyerName = lawyerNames[extraData.assigned_lawyer] || extraData.assigned_lawyer;
            additionalInfoHtml += `
                <div style="margin-top: 10px; padding: 12px; background: #fff3e0; border-radius: 6px;">
                    <strong>⚖️ Spotkanie z mecenasem:</strong> ${lawyerName}
                </div>
            `;
        }
        
        // Opiekun sprawy
        if (extraData.case_manager) {
            const managerNames = {
                'manager_a': '👔 Maria Lewandowska',
                'manager_b': '👔 Tomasz Kamiński',
                'manager_c': '👔 Katarzyna Zielińska'
            };
            const managerName = managerNames[extraData.case_manager] || extraData.case_manager;
            additionalInfoHtml += `
                <div style="margin-top: 10px; padding: 12px; background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15)); border-radius: 6px;">
                    <strong>👤 Asystent/Opiekun:</strong> ${managerName}
                </div>
            `;
        }
        
        // Dodaj do extraFieldsHtml
        if (additionalInfoHtml) {
            extraFieldsHtml += additionalInfoHtml;
        }
        
        // Załączniki
        let attachmentsHtml = '';
        if (extraData.attachments && extraData.attachments.length > 0) {
            attachmentsHtml = `
                <div style="margin-top: 20px; padding: 15px; background: #f0f8ff; border-radius: 8px; border: 2px solid #d4af37;">
                    <h4 style="margin: 0 0 12px 0; color: #d4af37;">📎 Załączniki (${extraData.attachments.length})</h4>
                    ${extraData.attachments.map((att, idx) => `
                        <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: white; border-radius: 6px; margin-bottom: 8px;">
                            <span style="font-size: 1.5rem;">${att.type?.includes('pdf') ? '📄' : att.type?.includes('image') ? '🖼️' : '📎'}</span>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: #1a2332;">${att.name}</div>
                                <div style="font-size: 0.85rem; color: #666;">${(att.size / 1024).toFixed(1)} KB</div>
                            </div>
                            <button onclick="window.downloadEventAttachment(${eventId}, ${idx})" style="padding: 6px 12px; background: linear-gradient(135deg, #d4af37, #FFD700); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                                ⬇️ Pobierz
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Utwórz modal
        const modal = document.createElement('div');
        modal.id = 'eventDetailsModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.8); z-index: 10002; display: flex; justify-content: center; align-items: center; padding: 20px; overflow-y: auto;';
        
        // Zapobiegaj zamknięciu przez kliknięcie w tło
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                e.stopPropagation();
            }
        });
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; max-width: 1000px; width: 100%; max-height: 95vh; overflow-y: auto;">
                <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 25px; border-radius: 16px 16px 0 0; color: white; position: sticky; top: 0; z-index: 100;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <div style="font-size: 2rem; margin-bottom: 10px;">${icon}</div>
                            <h2 style="margin: 0 0 8px 0; font-size: 1.8rem;">${event.title}</h2>
                            <div style="opacity: 0.9; font-size: 1.1rem;">${typeName}</div>
                        </div>
                        <button onclick="document.getElementById('eventDetailsModal').remove()" style="background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 1.5rem; font-weight: bold;">✕</button>
                    </div>
                </div>
                
                <div style="padding: 30px;">
                    <!-- Kod wydarzenia -->
                    ${event.event_code ? `
                        <div style="background: linear-gradient(135deg, #d4af37, #FFD700); color: white; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; display: inline-block; font-weight: 700; font-size: 1.1rem;">
                            ${event.event_code}
                        </div>
                    ` : ''}
                    
                    <!-- Podstawowe informacje -->
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px; line-height: 2;">
                        <div style="font-size: 1.1rem;">
                            <div><strong>📅 Data i godzina:</strong> ${event.start_date ? new Date(event.start_date).toLocaleString('pl-PL') : '<span style="color: #e74c3c;">Brak daty!</span>'}</div>
                            ${event.location ? `<div><strong>📍 Lokalizacja:</strong> ${event.location}</div>` : ''}
                            ${event.created_at ? `<div style="font-size: 0.9rem; color: #999;"><strong>Utworzono:</strong> ${new Date(event.created_at).toLocaleString('pl-PL')}</div>` : ''}
                        </div>
                    </div>
                    
                    <!-- Szczegóły specyficzne dla typu -->
                    ${extraFieldsHtml ? `
                        <div style="background: #e8f5e9; padding: 20px; border-radius: 10px; margin-bottom: 20px; line-height: 2; font-size: 1.05rem;">
                            <h3 style="margin: 0 0 15px 0; color: #2e7d32;">📋 Szczegóły</h3>
                            ${extraFieldsHtml}
                        </div>
                    ` : ''}
                    
                    <!-- Opis -->
                    ${event.description ? `
                        <div style="background: #fff9e6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                            <h3 style="margin: 0 0 15px 0; color: #856404;">📝 Opis / Notatki</h3>
                            <div style="white-space: pre-wrap; line-height: 1.8; font-size: 1rem;">${event.description}</div>
                        </div>
                    ` : ''}
                    
                    <!-- Załączniki -->
                    ${attachmentsHtml}
                    
                    <!-- Przyciski akcji -->
                    <div style="display: flex; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                        <button onclick="window.editEvent(${eventId}); document.getElementById('eventDetailsModal').remove();" style="flex: 1; padding: 14px; background: #f39c12; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem;">
                            ✏️ Edytuj wydarzenie
                        </button>
                        <button onclick="document.getElementById('eventDetailsModal').remove()" style="flex: 1; padding: 14px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem;">
                            Zamknij
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        console.log('✅ Szczegóły wydarzenia wyświetlone');
        
    } catch (error) {
        console.error('❌ Błąd ładowania szczegółów:', error);
        alert('❌ Błąd: ' + error.message);
    }
};

// Pobierz załącznik wydarzenia
window.downloadEventAttachment = function(eventId, attachmentIndex) {
    console.log(`⬇️ Pobieranie załącznika ${attachmentIndex} z wydarzenia ${eventId}`);
    // TODO: Implementacja pobierania
    alert('Funkcja pobierania w przygotowaniu');
};

// Edytuj wydarzenie - PEŁNA IMPLEMENTACJA
window.editEvent = async function(eventId) {
    console.log('✏️ Edycja wydarzenia:', eventId);
    
    try {
        // Pobierz dane wydarzenia
        const response = await window.api.request(`/events/${eventId}`);
        const event = response.event;
        
        if (!event) {
            alert('❌ Nie znaleziono wydarzenia');
            return;
        }
        
        console.log('📝 Edytuję wydarzenie:', event);
        
        // Parsuj extra_data
        let extraData = {};
        try {
            extraData = typeof event.extra_data === 'string' ? JSON.parse(event.extra_data) : (event.extra_data || {});
        } catch (err) {
            console.warn('Błąd parsowania extra_data:', err);
        }
        
        // Formatuj datę dla input
        const formatDateForInput = (dateStr) => {
            const d = new Date(dateStr);
            return d.toISOString().slice(0, 16);
        };
        
        const dateValue = formatDateForInput(event.start_date);
        const [datePart, timePart] = dateValue.split('T');
        
        // Utwórz modal edycji
        const modal = document.createElement('div');
        modal.id = 'eventEditModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.8); z-index: 10003; display: flex; justify-content: center; align-items: center; padding: 20px;';
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; max-width: 900px; width: 100%; max-height: 95vh; overflow-y: auto;">
                <div style="background: linear-gradient(135deg, #f39c12, #e67e22); padding: 25px; border-radius: 16px 16px 0 0; color: white; position: sticky; top: 0; z-index: 100;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; font-size: 1.8rem;">✏️ Edytuj wydarzenie</h2>
                        <button onclick="document.getElementById('eventEditModal').remove()" style="background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 1.5rem; font-weight: bold;">✕</button>
                    </div>
                </div>
                
                <div style="padding: 30px;">
                    <!-- Typ wydarzenia -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Typ wydarzenia *</label>
                        <select id="editEventType" onchange="window.updateEditDynamicFields()" style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                            <option value="negotiation" ${event.event_type === 'negotiation' ? 'selected' : ''}>🤝 Negocjacje</option>
                            <option value="court" ${event.event_type === 'court' ? 'selected' : ''}>⚖️ Rozprawa sądowa</option>
                            <option value="meeting" ${event.event_type === 'meeting' ? 'selected' : ''}>👥 Spotkanie</option>
                            <option value="deadline" ${event.event_type === 'deadline' ? 'selected' : ''}>⏰ Termin procesowy</option>
                            <option value="mediation" ${event.event_type === 'mediation' ? 'selected' : ''}>🕊️ Mediacja</option>
                            <option value="expertise" ${event.event_type === 'expertise' ? 'selected' : ''}>🔬 Ekspertyza</option>
                            <option value="document" ${event.event_type === 'document' ? 'selected' : ''}>📄 Złożenie dokumentu</option>
                            <option value="hearing" ${event.event_type === 'hearing' ? 'selected' : ''}>🗣️ Przesłuchanie</option>
                            <option value="consultation" ${event.event_type === 'consultation' ? 'selected' : ''}>💼 Konsultacja</option>
                            <option value="task" ${event.event_type === 'task' ? 'selected' : ''}>✅ Zadanie</option>
                            <option value="other" ${event.event_type === 'other' ? 'selected' : ''}>📝 Inne</option>
                        </select>
                    </div>
                    
                    <!-- Tytuł -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Tytuł *</label>
                        <input type="text" id="editEventTitle" value="${event.title || ''}" style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    </div>
                    
                    <!-- Data i Godzina -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                        <div>
                            <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Data *</label>
                            <input type="date" id="editEventDate" value="${datePart}" style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                        </div>
                        <div>
                            <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Godzina *</label>
                            <input type="time" id="editEventTime" value="${timePart}" style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                        </div>
                    </div>
                    
                    <!-- Lokalizacja -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Lokalizacja</label>
                        <input type="text" id="editEventLocation" value="${event.location || ''}" style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    </div>
                    
                    <!-- Dynamiczne pola -->
                    <div id="editDynamicFields"></div>
                    
                    <!-- Opis -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Opis / Notatki</label>
                        <textarea id="editEventDescription" rows="4" style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; resize: vertical;">${event.description || ''}</textarea>
                    </div>
                    
                    <!-- Przyciski -->
                    <div style="display: flex; gap: 15px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                        <button onclick="document.getElementById('eventEditModal').remove()" style="flex: 1; padding: 14px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem;">
                            Anuluj
                        </button>
                        <button onclick="window.saveEditedEvent(${eventId}, ${event.case_id})" style="flex: 2; padding: 14px; background: linear-gradient(135deg, #f39c12, #e67e22); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem;">
                            ✓ Zapisz zmiany
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Inicjalizuj dynamiczne pola z istniejącymi wartościami
        setTimeout(() => {
            window.updateEditDynamicFields(extraData);
        }, 100);
        
    } catch (error) {
        console.error('❌ Błąd edycji:', error);
        alert('❌ Błąd: ' + error.message);
    }
};

// Aktualizuj dynamiczne pola w formularzu edycji
window.updateEditDynamicFields = function(existingData = {}) {
    const type = document.getElementById('editEventType')?.value;
    const container = document.getElementById('editDynamicFields');
    
    if (!container) return;
    
    let html = '';
    
    if (type === 'negotiation') {
        html = `
            <div style="background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15)); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #1a2332;">🤝 Szczegóły negocjacji</h3>
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Z kim negocjacje?</label>
                        <input type="text" id="negotiationWith" value="${existingData.negotiation_with || ''}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                    </div>
                    <div>
                        <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Przedmiot negocjacji</label>
                        <input type="text" id="negotiationSubject" value="${existingData.subject || ''}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                    </div>
                    <div>
                        <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Oczekiwany rezultat</label>
                        <textarea id="expectedResult" rows="2" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">${existingData.expected_result || ''}</textarea>
                    </div>
                </div>
            </div>
        `;
    } else if (type === 'court') {
        html = `
            <div style="background: #ffebee; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #c62828;">⚖️ Szczegóły rozprawy</h3>
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Sygnatura akt</label>
                        <input type="text" id="courtSignature" value="${existingData.court_signature || ''}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                    </div>
                    <div>
                        <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Sędzia prowadzący</label>
                        <input type="text" id="judgeName" value="${existingData.judge_name || ''}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                    </div>
                    <div>
                        <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Typ rozprawy</label>
                        <select id="hearingType" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                            <option value="">-- Wybierz --</option>
                            <option value="first" ${existingData.hearing_type === 'first' ? 'selected' : ''}>Pierwsza rozprawa</option>
                            <option value="continued" ${existingData.hearing_type === 'continued' ? 'selected' : ''}>Rozprawa kontynuowana</option>
                            <option value="final" ${existingData.hearing_type === 'final' ? 'selected' : ''}>Rozprawa końcowa</option>
                            <option value="verdict" ${existingData.hearing_type === 'verdict' ? 'selected' : ''}>Ogłoszenie wyroku</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Świadkowie do przesłuchania</label>
                        <textarea id="witnesses" rows="2" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">${existingData.witnesses || ''}</textarea>
                    </div>
                    <div>
                        <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Dokumenty do przedstawienia</label>
                        <textarea id="documentsToPresent" rows="2" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">${existingData.documents_to_present || ''}</textarea>
                    </div>
                </div>
            </div>
        `;
    }
    // Dodaj inne typy według potrzeb...
    
    container.innerHTML = html;
};

// Zapisz edycję wydarzenia
window.saveEditedEvent = async function(eventId, caseId) {
    console.log('💾 Zapisuję edycję wydarzenia:', eventId);
    
    try {
        const type = document.getElementById('editEventType').value;
        const title = document.getElementById('editEventTitle').value;
        const date = document.getElementById('editEventDate').value;
        const time = document.getElementById('editEventTime').value;
        const location = document.getElementById('editEventLocation').value;
        const description = document.getElementById('editEventDescription').value;
        
        if (!title || !date || !time) {
            alert('⚠️ Wypełnij tytuł, datę i godzinę!');
            return;
        }
        
        // Zbierz extra_data w zależności od typu
        const extraData = {};
        
        if (type === 'negotiation') {
            extraData.negotiation_with = document.getElementById('negotiationWith')?.value || '';
            extraData.subject = document.getElementById('negotiationSubject')?.value || '';
            extraData.expected_result = document.getElementById('expectedResult')?.value || '';
        } else if (type === 'court') {
            extraData.court_signature = document.getElementById('courtSignature')?.value || '';
            extraData.judge_name = document.getElementById('judgeName')?.value || '';
            extraData.hearing_type = document.getElementById('hearingType')?.value || '';
            extraData.witnesses = document.getElementById('witnesses')?.value || '';
            extraData.documents_to_present = document.getElementById('documentsToPresent')?.value || '';
        }
        // Dodaj pozostałe typy...
        
        console.log('📤 Wysyłam aktualizację...', { type, title, extra_data: extraData });
        
        await window.api.request(`/events/${eventId}`, {
            method: 'PUT',
            body: JSON.stringify({
                event_type: type,
                title: title,
                start_date: `${date}T${time}:00`,
                location: location,
                description: description,
                extra_data: extraData  // KLUCZOWE: Wysyłam extra_data!
            })
        });
        
        console.log('✅ Zapisano edycję!');
        
        // Pokaż notyfikację
        const notification = document.createElement('div');
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #4caf50, #45a049); color: white; padding: 20px 30px; border-radius: 10px; box-shadow: 0 4px 20px rgba(76,175,80,0.4); z-index: 10004; font-weight: 700; font-size: 1.1rem;';
        notification.innerHTML = '✅ Zmiany zapisane!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transition = 'opacity 0.3s, transform 0.3s';
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
        
        // Zamknij modal
        document.getElementById('eventEditModal').remove();
        
        // Odśwież listę
        console.log('🔄 Odświeżam listę wydarzeń...');
        await window.crmManager.loadCaseTabContent(caseId, 'events');
        
    } catch (error) {
        console.error('❌ Błąd zapisu:', error);
        alert('❌ Błąd: ' + error.message);
    }
};

// === DYNAMICZNY SYSTEM ZAKŁADEK (NOWY!) ===

// Render zakładek na podstawie konfiguracji
window.crmManager.renderDynamicCaseTabs = function(caseData) {
    console.log('📑 Renderuję dynamiczne zakładki dla sprawy:', caseData.id);
    
    // Pobierz dostępne zakładki z konfiguracji
    const availableTabs = window.getAvailableCaseTabs ? window.getAvailableCaseTabs(caseData) : [];
    
    if (availableTabs.length === 0) {
        console.warn('⚠️ Brak dostępnych zakładek! Używam domyślnych.');
        // Fallback do domyślnych
        return `
            <div class="case-tab" id="caseTab_details" onclick="crmManager.switchCaseTab(${caseData.id}, 'details')">📋 Szczegóły</div>
            <div class="case-tab" id="caseTab_documents" onclick="crmManager.switchCaseTab(${caseData.id}, 'documents')">📄 Dokumenty</div>
            <div class="case-tab" id="caseTab_events" onclick="crmManager.switchCaseTab(${caseData.id}, 'events')">📅 Wydarzenia</div>
            <div class="case-tab" id="caseTab_comments" onclick="crmManager.switchCaseTab(${caseData.id}, 'comments')">💬 Komentarze</div>
        `;
    }
    
    // Renderuj zakładki z konfiguracji
    return availableTabs.map(tab => {
        // DLA PERMISSIONS użyj prostej funkcji!
        const onclickCode = tab.id === 'permissions' 
            ? `window.showPermissionsSimple(${caseData.id})`
            : `crmManager.switchCaseTab(${caseData.id}, '${tab.id}')`;
        
        return `
            <div class="case-tab" 
                 id="caseTab_${tab.id}" 
                 onclick="${onclickCode}"
                 data-module="${tab.moduleRequired}">
                ${tab.icon} ${tab.label}
            </div>
        `;
    }).join('');
};

// Zapisz informacje o aktualnej sprawie (inicjalizacja)
if (!window.crmManager.currentCaseData) {
    window.crmManager.currentCaseData = null;
}

// Funkcja pobierania dokumentu
window.downloadDocument = async function(caseId, docId) {
    try {
        const token = localStorage.getItem('token');
        // Dynamiczny URL - localhost lub produkcja
        const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3500/api'
            : 'https://web-production-ef868.up.railway.app/api';
        window.open(`${API_BASE}/cases/${caseId}/documents/${docId}/download`, '_blank');
    } catch (error) {
        console.error('❌ Błąd pobierania dokumentu:', error);
        alert('Błąd pobierania dokumentu: ' + error.message);
    }
};

// Funkcja pokazująca modal do uploadowania dokumentu
window.showUploadDocumentModal = function(caseId) {
    const modal = document.createElement('div');
    modal.id = 'uploadDocumentModal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.7); z-index: 10001; display: flex; justify-content: center; align-items: center; padding: 20px;';
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 16px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;">
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 25px; border-radius: 16px 16px 0 0; color: white;">
                <h3 style="margin: 0; font-size: 1.5rem;">📎 Dodaj dokument</h3>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Prześlij plik do sprawy</p>
            </div>
            
            <form id="uploadDocForm" style="padding: 30px;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Tytuł dokumentu *</label>
                    <input type="text" id="docTitle" required style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">📂 Kategoria dokumentu</label>
                    <select id="docCategory" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                        <option value="">-- Wybierz kategorię --</option>
                        <optgroup label="📋 Dokumenty procesowe">
                            <option value="POZ">📄 Pozew</option>
                            <option value="ODP">📝 Odpowiedź na pozew</option>
                            <option value="WNI">📑 Wniosek</option>
                            <option value="ZAL">📎 Załącznik</option>
                        </optgroup>
                        <optgroup label="⚖️ Orzeczenia">
                            <option value="WYR">⚖️ Wyrok</option>
                            <option value="POS">📋 Postanowienie</option>
                            <option value="NAK">📜 Nakaz zapłaty</option>
                        </optgroup>
                        <optgroup label="💼 Umowy i dokumenty">
                            <option value="UMO">💼 Umowa</option>
                            <option value="FAK">💰 Faktura</option>
                            <option value="KOR">📧 Korespondencja</option>
                        </optgroup>
                        <optgroup label="💬 Komunikacja cyfrowa">
                            <option value="WAP">💬 WhatsApp</option>
                            <option value="WAV">🎤 WhatsApp - głosowa</option>
                            <option value="SMS">📱 SMS</option>
                            <option value="EML">📧 Email</option>
                            <option value="MSG">💬 Messenger</option>
                        </optgroup>
                        <optgroup label="📱 Social Media">
                            <option value="FB">📘 Facebook</option>
                            <option value="IG">📸 Instagram</option>
                            <option value="TW">🐦 Twitter/X</option>
                        </optgroup>
                        <optgroup label="📸 Screenshoty i multimedia">
                            <option value="SCR">📱 Screenshot</option>
                            <option value="ZDJ">📸 Zdjęcie</option>
                            <option value="NAG">🎥 Nagranie wideo</option>
                            <option value="AUD">🎤 Nagranie audio</option>
                            <option value="VOC">🗣️ Wiadomość głosowa</option>
                        </optgroup>
                        <optgroup label="📂 Inne">
                            <option value="NOT">📝 Notatka</option>
                            <option value="INN">📂 Inny dokument</option>
                        </optgroup>
                    </select>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Opis (opcjonalny)</label>
                    <textarea id="docDescription" rows="3" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; resize: vertical;"></textarea>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: #333; font-weight: 700; margin-bottom: 10px;">Plik *</label>
                    <input type="file" id="docFile" required style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                </div>
                
                <div style="display: flex; gap: 15px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                    <button type="button" onclick="document.getElementById('uploadDocumentModal').remove()" style="flex: 1; padding: 14px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem;">Anuluj</button>
                    <button type="submit" style="flex: 2; padding: 14px; background: linear-gradient(135deg, #1a2332, #2c3e50); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem;">📤 Upload</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handler formularza
    document.getElementById('uploadDocForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = document.getElementById('docTitle').value;
        const category = document.getElementById('docCategory').value;
        const description = document.getElementById('docDescription').value;
        const fileInput = document.getElementById('docFile');
        
        if (!fileInput.files.length) {
            alert('Wybierz plik!');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('title', title);
        formData.append('category', category);
        formData.append('description', description);
        
        try {
            const token = localStorage.getItem('token');
            // Dynamiczny URL - localhost lub produkcja
            const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:3500/api'
                : 'https://web-production-ef868.up.railway.app/api';
            const response = await fetch(`${API_BASE}/cases/${caseId}/documents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (response.ok) {
                alert('✅ Dokument dodany!');
                modal.remove();
                // Odśwież zakładkę dokumentów
                window.crmManager.switchCaseTab(caseId, 'documents');
            } else {
                const error = await response.json();
                alert('❌ Błąd: ' + (error.error || 'Nieznany błąd'));
            }
        } catch (error) {
            console.error('❌ Błąd uploadu:', error);
            alert('❌ Błąd uploadu: ' + error.message);
        }
    });
};

console.log('✅ Załadowano funkcje zakładek sprawy');
console.log('✅ System dynamicznych zakładek gotowy');
console.log('✅ window.saveEnhancedEvent:', typeof window.saveEnhancedEvent);
console.log('✅ window.showEnhancedEventForm:', typeof window.showEnhancedEventForm);

// === PRZYPISYWANIE SPRAW ===

// Pokaż modal przypisywania sprawy
window.showAssignCaseModal = async function(caseId) {
    try {
        // Pobierz listę personelu
        const response = await window.api.request('/cases/staff/list');
        const { lawyers, case_managers } = response;
        
        // Stwórz modal
        const modal = document.createElement('div');
        modal.id = 'assignCaseModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 10005;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s;
        `;
        
        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1a2332, #2c3e50);
                padding: 40px;
                border-radius: 20px;
                max-width: 600px;
                width: 90%;
                box-shadow: 0 10px 50px rgba(0,0,0,0.5);
            ">
                <h2 style="margin: 0 0 20px 0; color: white; font-size: 1.8rem;">✓ Przejmij sprawę</h2>
                
                <div style="background: rgba(255,255,255,0.95); padding: 30px; border-radius: 15px;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #1a2332; font-weight: 700; margin-bottom: 10px; font-size: 1.1rem;">
                            👨‍⚖️ Mecenas prowadzący sprawy *
                        </label>
                        <select id="assignLawyer" required style="
                            width: 100%;
                            padding: 15px;
                            border: 2px solid #667eea;
                            border-radius: 10px;
                            font-size: 1rem;
                            background: white;
                            color: #1a2332;
                            cursor: pointer;
                        ">
                            <option value="">-- Wybierz mecenasa --</option>
                            ${lawyers.map(l => `<option value="${l.id}">${l.name} (${l.initials || 'N/A'})</option>`).join('')}
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <label style="display: block; color: #1a2332; font-weight: 700; margin-bottom: 10px; font-size: 1.1rem;">
                            📋 Opiekun sprawy (opcjonalny)
                        </label>
                        <select id="assignManager" style="
                            width: 100%;
                            padding: 15px;
                            border: 2px solid #e0e0e0;
                            border-radius: 10px;
                            font-size: 1rem;
                            background: white;
                            color: #1a2332;
                            cursor: pointer;
                        ">
                            <option value="">-- Brak (opcjonalnie) --</option>
                            ${case_managers.map(m => `<option value="${m.id}">${m.name} (${m.initials || 'N/A'})</option>`).join('')}
                        </select>
                    </div>
                    
                    <div style="display: flex; gap: 15px;">
                        <button onclick="document.getElementById('assignCaseModal').remove()" style="
                            flex: 1;
                            padding: 15px;
                            background: #999;
                            color: white;
                            border: none;
                            border-radius: 10px;
                            font-weight: 700;
                            font-size: 1.1rem;
                            cursor: pointer;
                            transition: all 0.3s;
                        " onmouseover="this.style.background='#888'" onmouseout="this.style.background='#999'">
                            Anuluj
                        </button>
                        <button onclick="window.assignCase(${caseId})" style="
                            flex: 2;
                            padding: 15px;
                            background: linear-gradient(135deg, #4caf50, #45a049);
                            color: white;
                            border: none;
                            border-radius: 10px;
                            font-weight: 700;
                            font-size: 1.1rem;
                            cursor: pointer;
                            box-shadow: 0 4px 15px rgba(76,175,80,0.4);
                            transition: all 0.3s;
                        " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                            ✓ Przejmij sprawę
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
    } catch (error) {
        console.error('❌ Błąd ładowania personelu:', error);
        alert('Błąd ładowania listy personelu: ' + error.message);
    }
};

// Przypisz sprawę
window.assignCase = async function(caseId) {
    const lawyerId = document.getElementById('assignLawyer').value;
    const managerId = document.getElementById('assignManager').value;
    
    if (!lawyerId) {
        alert('⚠️ Wybierz mecenasa prowadzącego!');
        return;
    }
    
    try {
        await window.api.request(`/cases/${caseId}/assign`, {
            method: 'POST',
            body: JSON.stringify({
                lawyer_id: parseInt(lawyerId),
                case_manager_id: managerId ? parseInt(managerId) : null
            })
        });
        
        // Pokaż notyfikację
        const notification = document.createElement('div');
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #4caf50, #45a049); color: white; padding: 20px 30px; border-radius: 10px; box-shadow: 0 4px 20px rgba(76,175,80,0.4); z-index: 10006; font-weight: 700; font-size: 1.1rem;';
        notification.innerHTML = '✅ Sprawa przypisana!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transition = 'opacity 0.3s';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
        
        // Zamknij modal
        document.getElementById('assignCaseModal').remove();
        
        // Odśwież zakładkę szczegółów
        await window.crmManager.loadCaseTabContent(caseId, 'details');
        
    } catch (error) {
        console.error('❌ Błąd przypisywania sprawy:', error);
        alert('Błąd przypisywania sprawy: ' + error.message);
    }
};

// Oddaj sprawę
window.unassignCase = async function(caseId) {
    if (!confirm('⚠️ Czy na pewno chcesz oddać tę sprawę? Będzie ponownie dostępna dla innych.')) {
        return;
    }
    
    try {
        await window.api.request(`/cases/${caseId}/unassign`, {
            method: 'POST'
        });
        
        // Pokaż notyfikację
        const notification = document.createElement('div');
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #ff9800, #f57c00); color: white; padding: 20px 30px; border-radius: 10px; box-shadow: 0 4px 20px rgba(255,152,0,0.4); z-index: 10006; font-weight: 700; font-size: 1.1rem;';
        notification.innerHTML = '↩️ Sprawa oddana!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transition = 'opacity 0.3s';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
        
        // Odśwież zakładkę szczegółów
        await window.crmManager.loadCaseTabContent(caseId, 'details');
        
    } catch (error) {
        console.error('❌ Błąd oddawania sprawy:', error);
        alert('Błąd oddawania sprawy: ' + error.message);
    }
};

// === NOWA PROSTA FUNKCJA SZCZEGÓŁÓW WYDARZENIA ===
window.viewEventDetails = async function(eventId, caseId) {
    console.log('🆕🆕🆕 NOWA FUNKCJA - Wyświetlam szczegóły wydarzenia:', eventId);
    
    try {
        const response = await window.api.request(`/events/${eventId}`);
        const event = response.event;
        
        // Parsuj extra_data NAJPIERW
        let extraData = {};
        if (event.extra_data) {
            extraData = typeof event.extra_data === 'string' ? JSON.parse(event.extra_data) : event.extra_data;
        } else if (event.extra_fields) {
            extraData = typeof event.extra_fields === 'string' ? JSON.parse(event.extra_fields) : event.extra_fields;
        }
        
        console.log('✅ Pobrano wydarzenie:', event.title);
        console.log('📝 Opis (description):', event.description || '❌ BRAK');
        console.log('📍 Lokalizacja:', event.location);
        console.log('🔍 CAŁE EVENT:', event);
        console.log('📦 Extra data:', extraData);
        console.log('📎 Dołączone dokumenty (IDs):', extraData.existing_document_ids || '❌ BRAK');
        
        // Prosty modal - bez skomplikowanego parsowania
        const eventTypes = {
            'negotiation': '🤝 Negocjacje',
            'court': '⚖️ Rozprawa',
            'meeting': '👥 Spotkanie',
            'deadline': '⏰ Termin',
            'mediation': '🕊️ Mediacja',
            'expertise': '🔬 Ekspertyza',
            'document': '📄 Dokument',
            'hearing': '🗣️ Przesłuchanie',
            'consultation': '💼 Konsultacja',
            'task': '✅ Zadanie',
            'other': '📝 Inne'
        };
        
        const typeInfo = eventTypes[event.event_type] || '📝 Wydarzenie';
        
        // Tworzenie prostego modala
        const modal = document.createElement('div');
        modal.id = 'eventDetailsModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.8); z-index: 99999; display: flex; justify-content: center; align-items: center; padding: 20px;';
        
        // PROSTY MODAL - TYLKO PODSTAWOWE INFORMACJE
        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;">
                <!-- NAGŁÓWEK -->
                <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 25px; border-radius: 16px 16px 0 0; color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="margin: 0; font-size: 1.8rem;">${typeInfo}</h2>
                            <p style="margin: 8px 0 0 0; font-size: 1.1rem; opacity: 0.95;">📝 ${event.title}</p>
                        </div>
                        <button onclick="this.closest('#eventDetailsModal').remove()" 
                            style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 2rem; width: 50px; height: 50px; border-radius: 50%; cursor: pointer; transition: all 0.3s;"
                            onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                            onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                            ✕
                        </button>
                    </div>
                </div>
                
                <!-- ZAWARTOŚĆ -->
                <div style="padding: 30px;">
                    
                    <!-- KOD WYDARZENIA -->
                    ${event.event_code ? `
                        <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); color: white; padding: 12px 20px; border-radius: 10px; display: inline-block; font-weight: 700; margin-bottom: 25px; font-size: 1.1rem; box-shadow: 0 3px 10px rgba(102,126,234,0.3);">
                            🔢 ${event.event_code}
                        </div>
                    ` : ''}
                    
                    <!-- PODSTAWOWE INFO -->
                    <div style="background: #f8f9fa; border-left: 5px solid #667eea; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 20px 0; color: #1a2332; font-size: 1.4rem;">📋 Informacje</h3>
                        
                        <div style="display: grid; gap: 15px;">
                            <div style="background: white; padding: 15px; border-radius: 8px;">
                                <div style="color: #666; font-size: 0.9rem; margin-bottom: 5px; font-weight: 600;">📅 Data i godzina</div>
                                <div style="color: #1a2332; font-size: 1.2rem; font-weight: 700;">
                                    ${window.DateTimeUtils ? 
                                        window.DateTimeUtils.parseUTCDate(event.start_date).toLocaleString('pl-PL', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : event.start_date.replace('T', ' ').substring(0, 16)}
                                </div>
                            </div>
                            
                            <div style="background: white; padding: 15px; border-radius: 8px;">
                                <div style="color: #666; font-size: 0.9rem; margin-bottom: 5px; font-weight: 600;">📍 Lokalizacja</div>
                                <div style="color: #1a2332; font-size: 1.1rem; font-weight: 600;">
                                    ${event.location || '<span style="color: #999; font-style: italic;">Nie podano lokalizacji</span>'}
                                </div>
                            </div>
                            
                            <div style="background: white; padding: 15px; border-radius: 8px;">
                                <div style="color: #666; font-size: 0.9rem; margin-bottom: 5px; font-weight: 600;">📝 Opis / Notatki</div>
                                <div style="color: #1a2332; font-size: 1.05rem; line-height: 1.6; white-space: pre-wrap;">
                                    ${event.description || '<span style="color: #999; font-style: italic;">Brak opisu</span>'}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- SZCZEGÓŁY Z EXTRA_DATA -->
                    ${Object.keys(extraData).filter(k => k !== 'existing_document_ids' && k !== 'attachments').length > 0 ? `
                        <div style="background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15)); border-left: 5px solid #2196f3; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
                            <h3 style="margin: 0 0 20px 0; color: #0d47a1; font-size: 1.4rem;">✨ Szczegóły</h3>
                            <div style="display: grid; gap: 12px;">
                                ${extraData.new_client ? `
                                    <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; border: 2px solid #667eea;">
                                        <div style="color: #d4af37; font-size: 1rem; margin-bottom: 10px; font-weight: 700;">👤 Dane klienta</div>
                                        <div style="color: #1a2332; font-size: 1.05rem; line-height: 1.8;">
                                            <div><strong>Imię i nazwisko:</strong> ${extraData.new_client.first_name || ''} ${extraData.new_client.last_name || ''}</div>
                                            ${extraData.new_client.phone ? `<div><strong>📞 Telefon:</strong> ${extraData.new_client.phone}</div>` : ''}
                                            ${extraData.new_client.email ? `<div><strong>📧 Email:</strong> ${extraData.new_client.email}</div>` : ''}
                                            ${extraData.new_client.address ? `<div><strong>🏠 Adres:</strong> ${extraData.new_client.address}</div>` : ''}
                                        </div>
                                    </div>
                                ` : extraData.new_client_name ? `
                                    <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; border: 2px solid #667eea;">
                                        <div style="color: #d4af37; font-size: 1rem; margin-bottom: 10px; font-weight: 700;">👤 Klient</div>
                                        <div style="color: #1a2332; font-size: 1.05rem;">
                                            <strong>Nazwa:</strong> ${extraData.new_client_name}
                                        </div>
                                    </div>
                                ` : ''}
                                
                                ${extraData.assigned_lawyer ? `
                                    <div style="background: #fff3e0; padding: 12px; border-radius: 6px;">
                                        <div style="color: #1a2332; font-size: 1.05rem;">
                                            <strong>⚖️ Spotkanie z mecenasem:</strong> ${{'lawyer_a': '👨‍⚖️ Mec. Jan Kowalski', 'lawyer_b': '👩‍⚖️ Mec. Anna Nowak', 'lawyer_c': '👨‍⚖️ Mec. Piotr Wiśniewski'}[extraData.assigned_lawyer] || extraData.assigned_lawyer}
                                        </div>
                                    </div>
                                ` : ''}
                                
                                ${extraData.case_manager ? `
                                    <div style="background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.15)); padding: 12px; border-radius: 6px;">
                                        <div style="color: #1a2332; font-size: 1.05rem;">
                                            <strong>👤 Asystent/Opiekun:</strong> ${{'manager_a': '👔 Maria Lewandowska', 'manager_b': '👔 Tomasz Kamiński', 'manager_c': '👔 Katarzyna Zielińska'}[extraData.case_manager] || extraData.case_manager}
                                        </div>
                                    </div>
                                ` : ''}
                                
                                ${Object.entries(extraData).filter(([key]) => key !== 'existing_document_ids' && key !== 'attachments' && key !== 'new_client' && key !== 'new_client_name' && key !== 'assigned_lawyer' && key !== 'case_manager').map(([key, value]) => {
                                    // Polskie tłumaczenia etykiet
                                    const polishLabels = {
                                        'court_signature': 'Sygnatura akt',
                                        'judge_name': 'Sędzia prowadzący',
                                        'hearing_type': 'Typ rozprawy',
                                        'witnesses': 'Świadkowie',
                                        'documents_to_present': 'Dokumenty do przedstawienia',
                                        'negotiation_with': 'Z kim negocjacje',
                                        'subject': 'Przedmiot',
                                        'expected_result': 'Oczekiwany rezultat',
                                        'participants': 'Uczestnicy',
                                        'purpose': 'Cel',
                                        'agenda': 'Agenda',
                                        'deadline_type': 'Typ terminu',
                                        'consequences': 'Konsekwencje',
                                        'critical': 'Krytyczny termin',
                                        'mediator_name': 'Mediator',
                                        'expected_outcome': 'Oczekiwany wynik',
                                        'settlement_proposals': 'Propozycje ugody',
                                        'expertise_type': 'Rodzaj ekspertyzy',
                                        'expert_name': 'Ekspert',
                                        'scope': 'Zakres',
                                        'document_list': 'Lista dokumentów',
                                        'where_submitted': 'Gdzie składane',
                                        'submission_deadline': 'Termin złożenia',
                                        'witness_name': 'Świadek',
                                        'witness_role': 'Rola świadka',
                                        'key_questions': 'Kluczowe pytania',
                                        'consultation_with': 'Z kim konsultacja',
                                        'person_name': 'Osoba',
                                        'topic': 'Temat',
                                        'responsible': 'Odpowiedzialny',
                                        'priority': 'Priorytet',
                                        'status': 'Status'
                                    };
                                    
                                    const label = polishLabels[key] || key.replace(/_/g, ' ');
                                    
                                    // Polskie tłumaczenia wartości
                                    let displayValue = value;
                                    if (key === 'hearing_type') {
                                        const hearingTypes = {
                                            'first': 'Pierwsza rozprawa',
                                            'continued': 'Rozprawa kontynuowana',
                                            'final': 'Rozprawa końcowa',
                                            'verdict': 'Ogłoszenie wyroku'
                                        };
                                        displayValue = hearingTypes[value] || value;
                                    }
                                    
                                    return `
                                    <div style="background: white; padding: 12px; border-radius: 6px;">
                                        <div style="color: #666; font-size: 0.85rem; margin-bottom: 4px; font-weight: 600;">${label}</div>
                                        <div style="color: #1a2332; font-size: 1.05rem; font-weight: 600;">${displayValue || '<span style="color: #999;">-</span>'}</div>
                                    </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- DOŁĄCZONE DOKUMENTY -->
                    ${extraData.existing_document_ids && extraData.existing_document_ids.length > 0 ? `
                        <div style="background: #fff3e0; border-left: 5px solid #ff9800; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
                            <h3 style="margin: 0 0 20px 0; color: #e65100; font-size: 1.4rem;">📎 Dołączone dokumenty (${extraData.existing_document_ids.length})</h3>
                            <div id="attachedDocuments${eventId}" style="display: grid; gap: 12px;">
                                <div style="text-align: center; padding: 20px; color: #999;">Ładowanie dokumentów...</div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- PRZYCISKI -->
                    <div style="display: flex; gap: 15px; margin-top: 30px;">
                        <button onclick="alert('Funkcja edycji w przygotowaniu!')" 
                            style="flex: 1; padding: 16px; background: #ff9800; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 1.1rem; transition: all 0.3s;"
                            onmouseover="this.style.background='#f57c00'" 
                            onmouseout="this.style.background='#ff9800'">
                            ✏️ Edytuj
                        </button>
                        <button onclick="this.closest('#eventDetailsModal').remove()" 
                            style="flex: 1; padding: 16px; background: #95a5a6; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 1.1rem; transition: all 0.3s;"
                            onmouseover="this.style.background='#7f8c8d'" 
                            onmouseout="this.style.background='#95a5a6'">
                            Zamknij
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Zamknij po kliknięciu w tło
        modal.onclick = function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        };
        
        // Załaduj szczegóły dołączonych dokumentów
        if (extraData.existing_document_ids && extraData.existing_document_ids.length > 0) {
            loadAttachedDocumentsDetails(eventId, event.case_id, extraData.existing_document_ids);
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error);
        alert('Nie udało się załadować szczegółów: ' + error.message);
    }
};

// Funkcja ładowania szczegółów dołączonych dokumentów
async function loadAttachedDocumentsDetails(eventId, caseId, documentIds) {
    const container = document.getElementById(`attachedDocuments${eventId}`);
    if (!container) return;
    
    try {
        console.log(`📎 Ładuję szczegóły ${documentIds.length} dokumentów...`);
        
        // Pobierz wszystkie dokumenty sprawy
        const response = await window.api.request(`/documents?case_id=${caseId}`);
        const allDocuments = response.documents || [];
        
        // Filtruj tylko dołączone dokumenty
        const attachedDocs = allDocuments.filter(doc => documentIds.includes(doc.id));
        
        if (attachedDocs.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">Nie znaleziono dołączonych dokumentów</div>';
            return;
        }
        
        // Wyświetl dokumenty
        let html = '';
        attachedDocs.forEach(doc => {
            const fileName = doc.title || doc.filename || 'Bez nazwy';
            const category = doc.category || '';
            const uploadDate = doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('pl-PL') : '';
            
            // KLUCZOWE: Użyj nazwy pliku z filepath (z dysku), nie filename (oryginalna nazwa)
            let diskFileName = doc.filename; // domyślnie
            if (doc.file_path || doc.filepath) {
                const fullPath = doc.file_path || doc.filepath;
                diskFileName = fullPath.split(/[/\\]/).pop(); // Ostatni segment ścieżki
                console.log(`📁 Dokument ${doc.id}: filepath="${fullPath}" → diskFileName="${diskFileName}"`);
            }
            
            const fileExt = (diskFileName || '').split('.').pop().toLowerCase();
            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt);
            const isPDF = fileExt === 'pdf';
            
            html += `
                <div style="background: white; padding: 15px; border-radius: 8px; border: 2px solid #ff9800; display: flex; align-items: center; gap: 15px;">
                    <div style="font-size: 2.5rem;">${isImage ? '🖼️' : isPDF ? '📄' : '📎'}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: 700; color: #1a2332; font-size: 1.1rem; margin-bottom: 5px;">${fileName}</div>
                        <div style="font-size: 0.9rem; color: #666;">
                            ${category ? `<span style="background: #fff3e0; padding: 4px 10px; border-radius: 4px; margin-right: 10px; font-weight: 600;">${category}</span>` : ''}
                            ${uploadDate ? `<span style="color: #999;">📅 ${uploadDate}</span>` : ''}
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        ${isImage || isPDF ? `
                            <button onclick="window.previewDocument('${diskFileName}', '${fileName}', '${fileExt}')" 
                                style="padding: 10px 20px; background: linear-gradient(135deg, #d4af37, #FFD700); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s;"
                                onmouseover="this.style.background='#7b1fa2'" 
                                onmouseout="this.style.background='#d4af37'">
                                👁️ Podgląd
                            </button>
                        ` : ''}
                        <button onclick="window.downloadDocument('${diskFileName}', '${fileName}')" 
                            style="padding: 10px 20px; background: linear-gradient(135deg, #d4af37, #FFD700); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s;"
                            onmouseover="this.style.background='#1976d2'" 
                            onmouseout="this.style.background='#d4af37'">
                            📥 Pobierz
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        console.log(`✅ Załadowano ${attachedDocs.length} dołączonych dokumentów`);
        
    } catch (error) {
        console.error('❌ Błąd ładowania dokumentów:', error);
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">Błąd ładowania dokumentów</div>';
    }
}

// KONIEC NOWEJ FUNKCJI - USUNIĘTO STARY SKOMPLIKOWANY KOD

// Placeholder dla funkcji edycji (do późniejszej implementacji)
window.editEvent = function(eventId) {
    alert('Funkcja edycji będzie dostępna wkrótce!');
};

// === MAPBOX: MAPA + AUTOUZUPEŁNIANIE ===

// Token Mapbox (publiczny, bezpieczny do użycia w kodzie frontend)
// Sprawdź czy nie został już zadeklarowany w case-court-map.js
if (typeof MAPBOX_TOKEN === 'undefined') {
    var MAPBOX_TOKEN = 'pk.eyJ1IjoicGd3cGwiLCJhIjoiY21ob2dzbjR3MDRwcjJqcjFpenN4NWxocCJ9.fI7kCwhzW6xzN2nXJNgWAg';
}

let mapboxMap = null;
let mapboxMarker = null;

// Funkcja inicjalizująca Mapbox
function initLocationPicker() {
    console.log('🗺️🗺️🗺️ Inicjalizuję Mapbox...');
    
    // Sprawdź czy token jest ustawiony
    if (MAPBOX_TOKEN === 'WKLEJ_TUTAJ_SWOJ_TOKEN') {
        console.error('❌ BRAK TOKENA MAPBOX! Zarejestruj się na https://account.mapbox.com/');
        document.getElementById('mapboxMap').innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #fff3cd; color: #856404; padding: 20px; text-align: center;">
                <div>
                    <h3>⚠️ Wymagany token Mapbox!</h3>
                    <p>Zarejestruj się na: <a href="https://account.mapbox.com/auth/signup/" target="_blank">account.mapbox.com</a></p>
                    <p>Następnie wklej token do <code>crm-case-tabs.js</code> (linia ~4100)</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Sprawdź czy Mapbox jest załadowany
    if (typeof mapboxgl === 'undefined') {
        console.error('❌ Mapbox GL JS nie jest załadowany!');
        return;
    }
    
    console.log('✅ Mapbox GL JS załadowany!');
    
    // Ustaw token
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    // Inicjalizuj mapę (Warszawa jako centrum)
    try {
        mapboxMap = new mapboxgl.Map({
            container: 'mapboxMap',
            style: 'mapbox://styles/mapbox/streets-v12',  // Ulice
            center: [21.0122, 52.2297],  // Warszawa [lng, lat]
            zoom: 12
        });
        
        console.log('✅ Mapa Mapbox utworzona!');
        
        // Dodaj kontrolki nawigacji
        mapboxMap.addControl(new mapboxgl.NavigationControl());
        
        // Inicjalizuj wyszukiwarkę (Geocoder)
        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
            countries: 'pl',  // Tylko Polska
            language: 'pl',   // Polski język
            placeholder: 'Wpisz adres, miasto, ulicę...',
            marker: false     // Nie dodawaj automatycznego markera
        });
        
        // Dodaj geocoder do kontenera
        document.getElementById('mapboxGeocoder').appendChild(geocoder.onAdd(mapboxMap));
        
        console.log('✅ Wyszukiwarka Mapbox dodana!');
        
        // Gdy wybierzesz adres z wyszukiwarki
        geocoder.on('result', function(e) {
            const coords = e.result.geometry.coordinates;
            const address = e.result.place_name;
            
            console.log('✅ Wybrano adres:', address);
            console.log('📍 Współrzędne:', coords);
            
            // Zapisz adres do ukrytego pola
            document.getElementById('eventLocation').value = address;
            
            // Usuń stary marker
            if (mapboxMarker) {
                mapboxMarker.remove();
            }
            
            // Dodaj nowy marker
            mapboxMarker = new mapboxgl.Marker({ color: '#4285f4' })
                .setLngLat(coords)
                .addTo(mapboxMap);
            
            // Wycentruj mapę
            mapboxMap.flyTo({ center: coords, zoom: 15 });
        });
        
        // Kliknięcie na mapie
        mapboxMap.on('click', async function(e) {
            const coords = [e.lngLat.lng, e.lngLat.lat];
            
            // Usuń stary marker
            if (mapboxMarker) {
                mapboxMarker.remove();
            }
            
            // Dodaj nowy marker
            mapboxMarker = new mapboxgl.Marker({ color: '#4285f4' })
                .setLngLat(coords)
                .addTo(mapboxMap);
            
            // Pobierz adres (reverse geocoding)
            try {
                const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${MAPBOX_TOKEN}&language=pl`);
                const data = await response.json();
                
                if (data.features && data.features.length > 0) {
                    const address = data.features[0].place_name;
                    document.getElementById('eventLocation').value = address;
                    geocoder.setInput(address);
                    console.log('✅ Kliknięto lokalizację:', address);
                }
            } catch (error) {
                console.error('❌ Błąd reverse geocoding:', error);
            }
        });
        
        console.log('✅ Mapbox w pełni zainicjalizowany!');
        
    } catch (error) {
        console.error('❌ Błąd inicjalizacji Mapbox:', error);
    }
}

// === FUNKCJE POBIERANIA I PODGLĄDU DOKUMENTÓW ===

// Funkcja pobierania dokumentu
window.downloadDocument = function(filename, displayName) {
    console.log(`📥 Pobieranie dokumentu: ${filename}`);
    
    // Stwórz element <a> i kliknij go
    const link = document.createElement('a');
    link.href = `/uploads/case-documents/${filename}`;
    link.download = displayName || filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Rozpoczęto pobieranie');
};

// Funkcja podglądu dokumentu
window.previewDocument = function(filename, displayName, fileExt) {
    console.log(`👁️ Podgląd dokumentu: ${filename}`);
    
    const url = `/uploads/case-documents/${filename}`;
    
    // Stwórz modal podglądu
    const modal = document.createElement('div');
    modal.id = 'documentPreviewModal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.95); z-index: 100000; display: flex; flex-direction: column; padding: 20px;';
    
    // Nagłówek
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px 10px 0 0;';
    header.innerHTML = `
        <div style="color: white; font-size: 1.3rem; font-weight: 700;">
            📄 ${displayName}
        </div>
        <button onclick="document.getElementById('documentPreviewModal').remove()" 
            style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 2rem; width: 50px; height: 50px; border-radius: 50%; cursor: pointer; transition: all 0.3s;"
            onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
            onmouseout="this.style.background='rgba(255,255,255,0.2)'">
            ✕
        </button>
    `;
    
    // Kontener treści
    const content = document.createElement('div');
    content.style.cssText = 'flex: 1; display: flex; justify-content: center; align-items: center; overflow: auto; padding: 20px;';
    
    // W zależności od typu pliku
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt)) {
        // Obraz
        content.innerHTML = `
            <img src="${url}" alt="${displayName}" 
                style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
        `;
    } else if (fileExt === 'pdf') {
        // PDF w iframe
        content.innerHTML = `
            <iframe src="${url}" 
                style="width: 100%; height: 100%; border: none; border-radius: 10px; background: white;">
            </iframe>
        `;
    }
    
    // Footer z przyciskami
    const footer = document.createElement('div');
    footer.style.cssText = 'display: flex; gap: 15px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 0 0 10px 10px; justify-content: center;';
    footer.innerHTML = `
        <button onclick="window.downloadDocument('${filename}', '${displayName}')" 
            style="padding: 15px 30px; background: linear-gradient(135deg, #d4af37, #FFD700); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1.1rem; transition: all 0.3s;"
            onmouseover="this.style.background='#1976d2'" 
            onmouseout="this.style.background='#d4af37'">
            📥 Pobierz
        </button>
        <button onclick="document.getElementById('documentPreviewModal').remove()" 
            style="padding: 15px 30px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1.1rem; transition: all 0.3s;"
            onmouseover="this.style.background='#7f8c8d'" 
            onmouseout="this.style.background='#95a5a6'">
            Zamknij
        </button>
    `;
    
    modal.appendChild(header);
    modal.appendChild(content);
    modal.appendChild(footer);
    document.body.appendChild(modal);
    
    // Zamknij po kliknięciu w tło
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
    
    console.log('✅ Modal podglądu otwarty');
};

// Pobierz załącznik (używane w witnesses-module.js)
window.downloadAttachment = async function(attachmentId) {
    console.log(`📥 Pobieranie załącznika: ${attachmentId}`);
    
    try {
        const apiUrl = window.getApiBaseUrl ? window.getApiBaseUrl() : 'https://web-production-ef868.up.railway.app';
        const token = localStorage.getItem('token');
        
        // Pobierz blob
        const response = await fetch(`${apiUrl}/attachments/${attachmentId}/download`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Błąd pobierania pliku');
        
        // Pobierz nazwę pliku z headera Content-Disposition lub użyj domyślnej
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'attachment';
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match) filename = match[1];
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Pobierz plik
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        console.log('✅ Plik pobrany:', filename);
        
    } catch (error) {
        console.error('❌ Błąd pobierania załącznika:', error);
        alert('❌ Błąd: ' + error.message);
    }
};

// ✅ KONIEC PLIKU - NOWA PROSTA WERSJA viewEventDetails + MAPA

