// ==========================================
// ANKIETA PRAWA SPECJALNEGO - GŁÓWNY PLIK
// Łączy wszystkie części w jeden obiekt
// Obsługuje: MOR/ ENE/ OZE/ LOT/ IT/
// ==========================================

(function() {
    // Czekaj na załadowanie wszystkich części
    const checkParts = setInterval(() => {
        if (window.specialQuestionnairePart1 && 
            window.specialQuestionnairePart2 && 
            window.specialQuestionnairePart3) {
            
            clearInterval(checkParts);
            
            // Połącz wszystkie sekcje
            const allSections = [
                ...window.specialQuestionnairePart1.sections,
                ...window.specialQuestionnairePart2.sections,
                ...window.specialQuestionnairePart3.sections
            ];
            
            // Stwórz główny obiekt ankiety
            window.specialQuestionnaire = {
                metadata: {
                    name: 'Ankieta Prawa Specjalnego',
                    version: '1.0',
                    prefixes: ['MOR', 'ENE', 'OZE', 'LOT', 'IT'],
                    description: 'Uniwersalna ankieta dla spraw specjalistycznych: morskich, energetycznych, OZE, lotniczych i IT',
                    icon: '⚡',
                    color: '#ff6b35', // pomarańczowy
                    created: '2025-11-09'
                },
                sections: allSections,
                procedure: window.specialQuestionnairePart3.procedure,
                documents: window.specialQuestionnairePart3.documents
            };
            
            console.log('✅ ==========================================');
            console.log('✅ ANKIETA PRAWA SPECJALNEGO ZAŁADOWANA!');
            console.log('✅ ==========================================');
            console.log('📊 Sekcji:', allSections.length);
            console.log('📅 Faz procedury:', window.specialQuestionnairePart3.procedure.phases.length);
            console.log('📄 Dokumentów:', window.specialQuestionnairePart3.documents.items.length);
            console.log('🤖 Generatorów AI:', window.specialQuestionnairePart3.documents.items.filter(d => d.aiGenerator).length);
            console.log('⚡ Prefiksy: MOR/ ENE/ OZE/ LOT/ IT/');
            console.log('✅ ==========================================');
        }
    }, 100);
    
    // Timeout zabezpieczający
    setTimeout(() => {
        clearInterval(checkParts);
        if (!window.specialQuestionnaire) {
            console.error('❌ Nie udało się załadować ankiety prawa specjalnego - brak części!');
        }
    }, 10000);
})();
