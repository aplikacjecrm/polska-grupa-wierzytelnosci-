// 💼 ANKIETA GOSPODARCZA - GŁÓWNY PLIK
// Łączy wszystkie 3 części w jedną całość

console.log('✅ Inicjalizuję ankietę gospodarczą...');

// Funkcja inicjalizująca (ładuje się natychmiast lub czeka na części)
function initCommercialQuestionnaire() {
    // Sprawdź czy wszystkie części są załadowane
    if (!window.commercialQuestionnaire_Part1 || 
        !window.commercialQuestionnaire_Part2 || 
        !window.commercialQuestionnaire_Part3) {
        console.log('⏳ Czekam na załadowanie wszystkich części ankiety gospodarczej...');
        return false;
    }

    // Połącz wszystkie sekcje
    const allSections = [
        ...window.commercialQuestionnaire_Part1.sections_1_5,
        ...window.commercialQuestionnaire_Part2.sections_6_9
    ];

    // Utwórz pełną ankietę
    window.commercialQuestionnaire = {
        id: 'commercial',
        title: '💼 Ankieta Gospodarcza',
        description: 'Kompleksowe prowadzenie spraw gospodarczych B2B - spory, umowy, windykacja biznesowa',
        color: '#d4af37', // Złoty - Pro Meritum brand color
        
        // Wszystkie sekcje (1-9)
        sections: allSections,
        
        // Procedura z Part 3
        procedure: window.commercialQuestionnaire_Part3.procedure,
        
        // Dokumenty z Part 3
        requiredDocuments: window.commercialQuestionnaire_Part3.requiredDocuments
    };

    console.log('✅ Pełna ankieta gospodarcza załadowana!');
    console.log('📊 Statystyki ankiety:');
    console.log('   - Sekcje:', window.commercialQuestionnaire.sections.length);
    console.log('   - Fazy procedury:', window.commercialQuestionnaire.procedure.phases.length);
    console.log('   - Dokumenty:', window.commercialQuestionnaire.requiredDocuments.length);
    
    // Lista nazw dokumentów dla debugowania
    const docNames = window.commercialQuestionnaire.requiredDocuments.map(d => d.name);
    console.log('📄 Lista dokumentów:', docNames);
    
    return true;
}

// Spróbuj załadować natychmiast
if (initCommercialQuestionnaire()) {
    console.log('✅ Ankieta gospodarcza gotowa do użycia!');
} else {
    // Jeśli nie udało się, sprawdzaj co 100ms (max 5 sekund)
    console.log('⏳ Ustawiam interval sprawdzający części...');
    let attempts = 0;
    const maxAttempts = 50; // 50 * 100ms = 5 sekund
    
    const checkInterval = setInterval(() => {
        attempts++;
        
        if (initCommercialQuestionnaire()) {
            console.log('✅ Ankieta gospodarcza załadowana po', attempts * 100, 'ms');
            clearInterval(checkInterval);
        } else if (attempts >= maxAttempts) {
            console.error('❌ Timeout: Nie udało się załadować ankiety gospodarczej po 5 sekundach');
            console.error('Part1:', !!window.commercialQuestionnaire_Part1);
            console.error('Part2:', !!window.commercialQuestionnaire_Part2);
            console.error('Part3:', !!window.commercialQuestionnaire_Part3);
            clearInterval(checkInterval);
        }
    }, 100);
}
