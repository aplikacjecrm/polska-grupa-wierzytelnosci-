// 💰 ANKIETA ODSZKODOWAWCZA - KOMPLETNA WERSJA
// Wersja: 1.0 - Pełna podstawowa gotowa do rozbudowy
// Data: 2025-11-08

console.log('💰 Ładuję pełną ankietę odszkodowawczą...');

// Funkcja łącząca części ankiety
function initCompensationQuestionnaire() {
    if (window.compensationQuestionnaire_Part1 && window.compensationQuestionnaire_Part2) {
        window.compensationQuestionnaire = {
            id: 'compensation',
            title: '💰 Ankieta Odszkodowawcza',
            description: 'Kompleksowe zbieranie informacji do dochodzenia odszkodowania',
            color: '#3B82F6', // Niebieski - profesjonalizm i zaufanie
            
            // Łączenie wszystkich sekcji
            sections: [
                ...window.compensationQuestionnaire_Part1.sections_1_5,
                ...window.compensationQuestionnaire_Part2.sections_6_10
            ],
            
            // Procedura z Part 2
            procedure: window.compensationQuestionnaire_Part2.procedure,
            
            // Dokumenty z Part 2
            requiredDocuments: window.compensationQuestionnaire_Part2.requiredDocuments
        };
        
        console.log('✅ Pełna ankieta odszkodowawcza załadowana!');
        console.log(`📊 Statystyki ankiety:`);
        console.log(`   - Sekcje: ${window.compensationQuestionnaire.sections.length}`);
        console.log(`   - Fazy procedury: ${window.compensationQuestionnaire.procedure.phases.length}`);
        console.log(`   - Dokumenty: ${window.compensationQuestionnaire.requiredDocuments.length}`);
        console.log('📄 Lista dokumentów:', window.compensationQuestionnaire.requiredDocuments.map(d => d.name));
        return true;
    } else {
        console.warn('⏳ Oczekiwanie na załadowanie części ankiety...');
        return false;
    }
}

// Próbuj natychmiast
if (!initCompensationQuestionnaire()) {
    // Jeśli nie udało się, czekaj z setInterval
    const checkInterval = setInterval(() => {
        if (initCompensationQuestionnaire()) {
            clearInterval(checkInterval);
        }
    }, 100); // Sprawdzaj co 100ms
    
    // Timeout po 10 sekundach
    setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.compensationQuestionnaire) {
            console.error('❌ TIMEOUT: Nie załadowano wszystkich części ankiety!');
        }
    }, 10000);
}
