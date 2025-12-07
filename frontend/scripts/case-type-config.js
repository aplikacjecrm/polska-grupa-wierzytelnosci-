// ==========================================
// KONFIGURACJA TYPÓW I PODTYPÓW SPRAW
// ==========================================

console.log('📋 Case Type Config v1.0 - Loaded!');

window.caseTypeConfig = {
    // Mapowanie podtypów do głównych typów spraw
    subtypeToMainType: {
        // SPRAWY CYWILNE
        'compensation': 'civil',      // ODS - Odszkodowania
        'contract': 'civil',          // UMO - Umowy
        'family': 'civil',            // ROD - Rodzinne
        'property': 'civil',          // MAJ - Majątkowe
        'inheritance': 'civil',       // SPA - Spadkowe
        'debt': 'civil',              // DLU - Dłużne/Windykacja
        
        // SPRAWY KARNE
        'assault': 'criminal',        // POB - Pobicie
        'theft': 'criminal',          // KRA - Kradzież
        'fraud': 'criminal',          // OSZ - Oszustwo
        'traffic': 'criminal',        // DRO - Drogowe
        'drugs': 'criminal',          // NAR - Narkotyki
        
        // SPRAWY ADMINISTRACYJNE
        'building': 'administrative', // BUD - Budowlane
        'tax': 'administrative',      // POD - Podatkowe
        'zoning': 'administrative',   // ZAG - Zagospodarowanie
        
        // SPRAWY GOSPODARCZE
        'business': 'commercial',        // GOS - Gospodarcze
        'commercial': 'commercial',      // COM - Gospodarcze (główny typ)
        
        // SPRAWY UPADŁOŚCIOWE I RESTRUKTURYZACYJNE (oddzielne od gospodarczych)
        'bankruptcy': 'bankruptcy',      // UPA - Upadłościowe
        'restructuring': 'restructuring', // RES - Restrukturyzacje
        
        // SPRAWY MIĘDZYNARODOWE
        'international': 'international',      // MIE - Międzynarodowe
        'european': 'international',           // EUR - Prawo europejskie
        'arbitration': 'international',        // ARB - Arbitraż międzynarodowy
        
        // SPRAWY SPECJALNE
        'maritime': 'special',                 // MOR - Prawo morskie
        'energy': 'special',                   // ENE - Energetyka
        'renewable': 'special',                // OZE - Odnawialne źródła energii
        'aviation': 'special',                 // LOT - Prawo lotnicze
        'it': 'special',                       // INF - Prawo IT
        
        // INNE
        'other': 'other'                       // INN - Inne
    },
    
    // Prefiksy dla numeracji spraw
    subtypePrefixes: {
        // CYWILNE
        'compensation': 'ODS',
        'contract': 'UMO',
        'family': 'ROD',
        'property': 'MAJ',
        'inheritance': 'SPA',
        'debt': 'DLU',
        
        // KARNE
        'assault': 'POB',
        'theft': 'KRA',
        'fraud': 'OSZ',
        'traffic': 'DRO',
        'drugs': 'NAR',
        
        // ADMINISTRACYJNE
        'building': 'BUD',
        'tax': 'POD',
        'zoning': 'ZAG',
        
        // GOSPODARCZE
        'business': 'GOS',
        'bankruptcy': 'UPA',
        'restructuring': 'RES',
        
        // MIĘDZYNARODOWE
        'international': 'MIE',
        'european': 'EUR',
        'arbitration': 'ARB',
        
        // SPECJALNE
        'maritime': 'MOR',
        'energy': 'ENE',
        'renewable': 'OZE',
        'aviation': 'LOT',
        'it': 'INF',
        
        // INNE
        'other': 'INN'
    },
    
    // Mapowanie typ sprawy → rodzaj sądu (automatyczne)
    typeToCourtType: {
        // CYWILNE → SR lub SO (zależnie od wartości)
        'compensation': 'SR',  // Odszkodowania → SR/SO (jeśli <75k → SR, jeśli >75k → SO)
        'contract': 'SR',      // Umowy → SR/SO
        'property': 'SR',      // Majątkowe → SR/SO
        'inheritance': 'SR',   // Spadkowe → SR/SO
        'debt': 'SR',          // Windykacja → SR/SO
        
        // RODZINNE → WYDZIAŁ RODZINNY
        'family': 'SR-ROD',    // Rodzinne (rozwody, separacje) → Wydział Rodzinny (SR/SO)
        
        // KARNE → SR lub SO
        'assault': 'SR',       // Pobicie → SR/SO
        'theft': 'SR',         // Kradzież → SR
        'fraud': 'SR',         // Oszustwo → SR/SO
        'traffic': 'SR',       // Drogowe → SR
        'drugs': 'SR',         // Narkotyki → SR/SO
        
        // ADMINISTRACYJNE → WSA lub NSA
        'building': 'WSA',     // Budowlane → WSA
        'tax': 'WSA',          // Podatkowe → WSA
        'zoning': 'WSA',       // Zagospodarowanie → WSA
        
        // GOSPODARCZE → SO WYDZIAŁ GOSPODARCZY
        'business': 'SO-GOSP',     // Gospodarcze → SO (Wydział Gospodarczy)
        'bankruptcy': 'SO-GOSP',   // Upadłościowe → SO (Wydział Gospodarczy)
        'restructuring': 'SO-GOSP', // Restrukturyzacje → SO (Wydział Gospodarczy)
        
        // MIĘDZYNARODOWE
        'international': 'SO',     // Międzynarodowe → SO
        'european': 'SO',          // Prawo europejskie → SO
        'arbitration': 'ARBITRAZ', // Arbitraż → Sąd polubowny
        
        // SPECJALNE
        'maritime': 'SO',      // Morskie → SO
        'energy': 'SO',        // Energetyka → SO
        'renewable': 'SO',     // OZE → SO
        'aviation': 'SO',      // Lotnicze → SO
        'it': 'SO',            // IT → SO
        
        // INNE
        'other': ''            // Inne → wybierz ręcznie
    },
    
    // Podpowiedzi dla typów spraw
    typeHints: {
        'compensation': 'Wartość do 75 000 zł → SR, powyżej 75 000 zł → SO',
        'contract': 'Wartość do 75 000 zł → SR, powyżej 75 000 zł → SO',
        'family': 'Rozwody i separacje → ZAWSZE Sąd Okręgowy (SO)',
        'property': 'Wartość do 75 000 zł → SR, powyżej 75 000 zł → SO',
        'inheritance': 'Niezależnie od wartości → SR lub SO',
        'debt': 'Windykacja → SR lub SO',
        'assault': 'Pobicie → SR (jeśli ciężkie obrażenia → SO)',
        'theft': 'Kradzież → SR lub SO',
        'fraud': 'Oszustwo → SR lub SO (zależnie od kwoty)',
        'traffic': 'Wypadki drogowe → SR',
        'drugs': 'Narkotyki → SR lub SO',
        'building': 'Skargi na decyzje → WSA',
        'tax': 'Skargi na decyzje podatkowe → WSA',
        'zoning': 'Skargi na decyzje → WSA',
        'business': 'Spory między przedsiębiorcami → SO (Wydział Gospodarczy)',
        'bankruptcy': 'Upadłość konsumencka/przedsiębiorcy → SO (Wydział Gospodarczy)',
        'restructuring': 'Restrukturyzacja → SO (Wydział Gospodarczy)',
        'arbitration': 'Arbitraż → Sąd polubowny lub ARBITRAŻ'
    },
    
    // Grupy typów spraw (dla formularza)
    typeGroups: [
        {
            label: '⚖️ Sprawy cywilne',
            mainType: 'civil',
            subtypes: [
                { value: 'compensation', label: '💰 Odszkodowania', prefix: 'ODS', courtType: 'SR' },
                { value: 'contract', label: '📄 Umowy', prefix: 'UMO', courtType: 'SR' },
                { value: 'property', label: '🏠 Majątkowe', prefix: 'MAJ', courtType: 'SR' },
                { value: 'inheritance', label: '📜 Spadkowe', prefix: 'SPA', courtType: 'SR' },
                { value: 'debt', label: '💸 Windykacja', prefix: 'DLU', courtType: 'SR' }
            ]
        },
        {
            label: '👨‍👩‍👧 Sprawy rodzinne',
            mainType: 'civil',
            subtypes: [
                { value: 'family', label: '💍 Rodzinne (rozwody, alimenty)', prefix: 'ROD', courtType: 'SO' }
            ]
        },
        {
            label: '🚔 Sprawy karne',
            mainType: 'criminal',
            subtypes: [
                { value: 'assault', label: '🤜 Pobicie', prefix: 'POB', courtType: 'SR' },
                { value: 'theft', label: '🔓 Kradzież', prefix: 'KRA', courtType: 'SR' },
                { value: 'fraud', label: '🎭 Oszustwo', prefix: 'OSZ', courtType: 'SR' },
                { value: 'traffic', label: '🚗 Drogowe', prefix: 'DRO', courtType: 'SR' },
                { value: 'drugs', label: '💊 Narkotyki', prefix: 'NAR', courtType: 'SR' }
            ]
        },
        {
            label: '🏛️ Sprawy administracyjne',
            mainType: 'administrative',
            subtypes: [
                { value: 'building', label: '🏗️ Budowlane', prefix: 'BUD', courtType: 'WSA' },
                { value: 'tax', label: '💰 Podatkowe', prefix: 'POD', courtType: 'WSA' },
                { value: 'zoning', label: '📍 Zagospodarowanie', prefix: 'ZAG', courtType: 'WSA' }
            ]
        },
        {
            label: '💼 Sprawy gospodarcze',
            mainType: 'commercial',
            subtypes: [
                { value: 'business', label: '🏢 Gospodarcze', prefix: 'GOS', courtType: 'SO' },
                { value: 'bankruptcy', label: '📉 Upadłościowe', prefix: 'UPA', courtType: 'SO' },
                { value: 'restructuring', label: '🔄 Restrukturyzacje', prefix: 'RES', courtType: 'SO' }
            ]
        },
        {
            label: '🌍 Sprawy międzynarodowe',
            mainType: 'international',
            subtypes: [
                { value: 'international', label: '🌐 Międzynarodowe', prefix: 'MIE', courtType: 'SO' },
                { value: 'european', label: '🇪🇺 Prawo europejskie', prefix: 'EUR', courtType: 'SO' },
                { value: 'arbitration', label: '⚖️ Arbitraż międzynarodowy', prefix: 'ARB', courtType: 'ARBITRAZ' }
            ]
        },
        {
            label: '⚡ Sprawy specjalne',
            mainType: 'special',
            subtypes: [
                { value: 'maritime', label: '⚓ Prawo morskie', prefix: 'MOR', courtType: 'SO' },
                { value: 'energy', label: '⚡ Energetyka', prefix: 'ENE', courtType: 'SO' },
                { value: 'renewable', label: '🌱 OZE / Fotowoltaika', prefix: 'OZE', courtType: 'SO' },
                { value: 'aviation', label: '✈️ Prawo lotnicze', prefix: 'LOT', courtType: 'SO' },
                { value: 'it', label: '💻 Prawo IT', prefix: 'INF', courtType: 'SO' }
            ]
        },
        {
            label: '📝 Inne',
            mainType: 'other',
            subtypes: [
                { value: 'other', label: '📋 Inne', prefix: 'INN', courtType: '' }
            ]
        }
    ],
    
    // Polskie nazwy głównych typów
    mainTypeLabels: {
        'civil': 'Cywilna',
        'criminal': 'Karna',
        'administrative': 'Administracyjna',
        'commercial': 'Gospodarcza',
        'international': 'Międzynarodowa',
        'special': 'Specjalna',
        'other': 'Inna'
    },
    
    // Polskie nazwy podtypów
    subtypeLabels: {
        'compensation': 'Odszkodowania',
        'contract': 'Umowy',
        'family': 'Rodzinne',
        'property': 'Majątkowe',
        'inheritance': 'Spadkowe',
        'debt': 'Windykacja',
        'assault': 'Pobicie',
        'theft': 'Kradzież',
        'fraud': 'Oszustwo',
        'traffic': 'Drogowe',
        'drugs': 'Narkotyki',
        'building': 'Budowlane',
        'tax': 'Podatkowe',
        'zoning': 'Zagospodarowanie',
        'business': 'Gospodarcze',
        'bankruptcy': 'Upadłościowe',
        'restructuring': 'Restrukturyzacje',
        'international': 'Międzynarodowe',
        'european': 'Prawo europejskie',
        'arbitration': 'Arbitraż międzynarodowy',
        'maritime': 'Prawo morskie',
        'energy': 'Energetyka',
        'renewable': 'OZE / Fotowoltaika',
        'aviation': 'Prawo lotnicze',
        'it': 'Prawo IT',
        'other': 'Inne'
    }
};

// ==========================================
// FUNKCJE POMOCNICZE
// ==========================================

// Pobierz główny typ na podstawie podtypu
window.getMainTypeFromSubtype = function(subtype) {
    return window.caseTypeConfig.subtypeToMainType[subtype] || 'other';
};

// Pobierz prefix dla podtypu
window.getPrefixForSubtype = function(subtype) {
    return window.caseTypeConfig.subtypePrefixes[subtype] || 'INN';
};

// Pobierz polską nazwę głównego typu
window.getMainTypeLabel = function(mainType) {
    return window.caseTypeConfig.mainTypeLabels[mainType] || mainType;
};

// Pobierz polską nazwę podtypu
window.getSubtypeLabel = function(subtype) {
    return window.caseTypeConfig.subtypeLabels[subtype] || subtype;
};

// Pobierz pełną nazwę typu (główny + podtyp)
window.getFullCaseTypeLabel = function(mainType, subtype) {
    if (!subtype) return window.getMainTypeLabel(mainType);
    return `${window.getMainTypeLabel(mainType)} - ${window.getSubtypeLabel(subtype)}`;
};

// ✨ NOWA FUNKCJA: Automatyczne ustawienie rodzaju sądu na podstawie typu sprawy
window.autoSetCourtType = function(caseSubtype) {
    const courtTypeSelect = document.getElementById('editCourtType');
    
    if (!courtTypeSelect) {
        console.warn('⚠️ Select rodzaju sądu nie znaleziony');
        return;
    }
    
    // Pobierz zdefiniowany rodzaj sądu dla tego typu sprawy
    const suggestedCourtType = window.caseTypeConfig.typeToCourtType[caseSubtype];
    
    if (suggestedCourtType) {
        // Ustaw wartość selecta
        courtTypeSelect.value = suggestedCourtType;
        
        // Podświetl na zielono (pokazuje że automatycznie wybrane)
        courtTypeSelect.style.background = '#d4edda';
        courtTypeSelect.style.borderColor = '#3B82F6';
        
        console.log(`✅ Automatycznie ustawiono rodzaj sądu: ${suggestedCourtType} dla typu: ${caseSubtype}`);
        
        // Po 2 sekundach wróć do normalnego stylu
        setTimeout(() => {
            courtTypeSelect.style.background = '';
            courtTypeSelect.style.borderColor = '';
        }, 2000);
    } else {
        console.log(`ℹ️ Brak sugerowanego rodzaju sądu dla typu: ${caseSubtype}`);
    }
};

// ✨ NOWE: Pobierz rodzaj sądu na podstawie typu sprawy
window.getCourtTypeForCaseType = function(caseType) {
    return window.caseTypeConfig.typeToCourtType[caseType] || '';
};

// ✨ NOWE: Pobierz podpowiedź dla typu sprawy
window.getHintForCaseType = function(caseType) {
    return window.caseTypeConfig.typeHints[caseType] || '';
};

// ✨ NOWE: Ustaw automatycznie rodzaj sądu w formularzu
window.autoSetCourtType = function(caseType) {
    const courtType = window.getCourtTypeForCaseType(caseType);
    const courtTypeSelect = document.getElementById('editCourtType') || document.querySelector('select[name="court_type"]');
    
    if (courtTypeSelect && courtType) {
        console.log(`🏛️ Auto-ustawiam rodzaj sądu: ${caseType} → ${courtType}`);
        courtTypeSelect.value = courtType;
        
        // Pokaż podpowiedź
        const hint = window.getHintForCaseType(caseType);
        if (hint) {
            console.log(`💡 Podpowiedź: ${hint}`);
        }
    }
};

// ✨ NOWA FUNKCJA: Wypełnij select typów spraw w formularzu
window.loadCaseTypeOptions = function() {
    // Szukaj selecta po różnych ID (może być w różnych formularzach)
    const caseTypeSelect = 
        document.getElementById('caseType') || 
        document.getElementById('caseTypeAddForm') || 
        document.querySelector('select[name="case_type"]');
    
    if (!caseTypeSelect) {
        console.warn('⚠️ Nie znaleziono selecta typów spraw');
        return;
    }
    
    console.log('📋 Wypełniam select:', caseTypeSelect.id || caseTypeSelect.name);
    
    // Wyczyść stare opcje
    caseTypeSelect.innerHTML = '<option value="">Wybierz...</option>';
    
    // Dodaj zgrupowane typy z config
    if (window.caseTypeConfig && window.caseTypeConfig.typeGroups) {
        window.caseTypeConfig.typeGroups.forEach(group => {
            // Dodaj nagłówek grupy (optgroup)
            const optgroup = document.createElement('optgroup');
            optgroup.label = group.label;
            
            // Dodaj podtypy w grupie
            group.subtypes.forEach(subtype => {
                const option = document.createElement('option');
                option.value = subtype.value;
                option.textContent = subtype.label;
                option.setAttribute('data-court-type', subtype.courtType || '');
                option.setAttribute('data-prefix', subtype.prefix);
                optgroup.appendChild(option);
            });
            
            caseTypeSelect.appendChild(optgroup);
        });
        
        console.log('✅ Załadowano', caseTypeSelect.options.length - 1, 'typów spraw do selecta');
    } else {
        console.error('❌ Brak window.caseTypeConfig!');
    }
    
    // Dodaj event listener dla automatycznego ustawania rodzaju sądu
    caseTypeSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const courtType = selectedOption.getAttribute('data-court-type');
        
        if (courtType && window.autoSetCourtType) {
            window.autoSetCourtType(this.value);
        }
    });
};

console.log('✅ Załadowano konfigurację typów spraw');
console.log('📊 Dostępne grupy:', window.caseTypeConfig.typeGroups.length);
console.log('🏛️ Mapowanie typ → sąd:', Object.keys(window.caseTypeConfig.typeToCourtType).length, 'typów');
console.log('✅ Funkcja loadCaseTypeOptions() gotowa');
