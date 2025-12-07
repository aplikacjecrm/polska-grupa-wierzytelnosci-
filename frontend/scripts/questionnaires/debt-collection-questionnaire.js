// 📜 ANKIETA WINDYKACYJNA - GŁÓWNY PLIK
// Łączy wszystkie 3 części w jedną całość

console.log('✅ Inicjalizuję ankietę windykacyjną...');

// Funkcja inicjalizująca (ładuje się natychmiast lub czeka na części)
function initDebtCollectionQuestionnaire() {
    // Sprawdź czy wszystkie części są załadowane
    if (!window.debtCollectionQuestionnaire_Part1 || 
        !window.debtCollectionQuestionnaire_Part2 || 
        !window.debtCollectionQuestionnaire_Part3) {
        console.log('⏳ Czekam na załadowanie wszystkich części ankiety windykacyjnej...');
        return false;
    }

    // Połącz wszystkie sekcje
    const allSections = [
        ...window.debtCollectionQuestionnaire_Part1.sections_1_6,
        ...window.debtCollectionQuestionnaire_Part2.sections_7_12
    ];

    // Utwórz pełną ankietę
    window.debtCollectionQuestionnaire = {
        id: 'debt_collection',
        title: '📜 Ankieta Windykacyjna',
        description: 'Kompleksowe dochodzenie należności cywilnych - od wezwania do egzekucji',
        color: '#3B82F6', // Czerwony - akcja, pilność, działanie!
        
        // Wszystkie sekcje (1-12)
        sections: allSections,
        
        // Procedura z Part 3
        procedure: window.debtCollectionQuestionnaire_Part3.procedure,
        
        // Dokumenty z Part 3
        requiredDocuments: window.debtCollectionQuestionnaire_Part3.requiredDocuments
    };

    console.log('✅ Pełna ankieta windykacyjna załadowana!');
    console.log('📊 Statystyki ankiety:');
    console.log('   - Sekcje:', window.debtCollectionQuestionnaire.sections.length);
    console.log('   - Fazy procedury:', window.debtCollectionQuestionnaire.procedure.phases.length);
    console.log('   - Dokumenty:', window.debtCollectionQuestionnaire.requiredDocuments.length);
    
    // Lista nazw dokumentów dla debugowania
    const docNames = window.debtCollectionQuestionnaire.requiredDocuments.map(d => d.name);
    console.log('📄 Lista dokumentów:', docNames);
    
    return true;
}

// Spróbuj załadować natychmiast
if (initDebtCollectionQuestionnaire()) {
    console.log('✅ Ankieta windykacyjna gotowa do użycia!');
} else {
    // Jeśli nie udało się, sprawdzaj co 100ms (max 5 sekund)
    console.log('⏳ Ustawiam interval sprawdzający części...');
    let attempts = 0;
    const maxAttempts = 50; // 50 * 100ms = 5 sekund
    
    const checkInterval = setInterval(() => {
        attempts++;
        
        if (initDebtCollectionQuestionnaire()) {
            console.log('✅ Ankieta windykacyjna załadowana po', attempts * 100, 'ms');
            clearInterval(checkInterval);
        } else if (attempts >= maxAttempts) {
            console.error('❌ Timeout: Nie udało się załadować ankiety windykacyjnej po 5 sekundach');
            console.error('Part1:', !!window.debtCollectionQuestionnaire_Part1);
            console.error('Part2:', !!window.debtCollectionQuestionnaire_Part2);
            console.error('Part3:', !!window.debtCollectionQuestionnaire_Part3);
            clearInterval(checkInterval);
        }
    }, 100);
}
