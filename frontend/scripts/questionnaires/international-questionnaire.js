// ==========================================
// ANKIETA PRAWA MIĘDZYNARODOWEGO - GŁÓWNY PLIK
// Łączy wszystkie części w jeden obiekt
// Obsługuje: MIE/ EUR/ ARB/
// ==========================================

(function() {
    // Czekaj na załadowanie wszystkich części
    const checkParts = setInterval(() => {
        if (window.internationalQuestionnairePart1 && 
            window.internationalQuestionnairePart2 && 
            window.internationalQuestionnairePart3) {
            
            clearInterval(checkParts);
            
            // Połącz wszystkie sekcje
            const allSections = [
                ...window.internationalQuestionnairePart1.sections,
                ...window.internationalQuestionnairePart2.sections,
                ...window.internationalQuestionnairePart3.sections
            ];
            
            // DEBUG: Sprawdź co mamy w part3
            console.log('🔍 DEBUG Part3:', {
                hasProcedure: !!window.internationalQuestionnairePart3.procedure,
                hasDocuments: !!window.internationalQuestionnairePart3.documents,
                procedurePhases: window.internationalQuestionnairePart3.procedure?.phases?.length,
                documentsItems: window.internationalQuestionnairePart3.documents?.items?.length
            });
            
            // Stwórz główny obiekt ankiety
            window.internationalQuestionnaire = {
                metadata: {
                    name: 'Ankieta Prawa Międzynarodowego',
                    version: '1.0',
                    prefixes: ['MIE', 'EUR', 'ARB'],
                    description: 'Uniwersalna ankieta dla spraw międzynarodowych, prawa europejskiego i arbitrażu',
                    icon: '🌍',
                    color: '#3B82F6', // niebieski
                    created: '2025-11-09'
                },
                sections: allSections,
                procedure: window.internationalQuestionnairePart3.procedure,
                documents: window.internationalQuestionnairePart3.documents
            };
            
            // DEBUG: Sprawdź końcowy obiekt
            console.log('🔍 DEBUG Final:', {
                hasProcedure: !!window.internationalQuestionnaire.procedure,
                hasDocuments: !!window.internationalQuestionnaire.documents,
                procedurePhases: window.internationalQuestionnaire.procedure?.phases?.length,
                documentsItems: window.internationalQuestionnaire.documents?.items?.length
            });
            
            console.log('✅ ==========================================');
            console.log('✅ ANKIETA PRAWA MIĘDZYNARODOWEGO ZAŁADOWANA!');
            console.log('✅ ==========================================');
            console.log('📊 Sekcji:', allSections.length);
            console.log('📅 Faz procedury:', window.internationalQuestionnairePart3.procedure.phases.length);
            console.log('📄 Dokumentów:', window.internationalQuestionnairePart3.documents.items.length);
            console.log('🤖 Generatorów AI:', window.internationalQuestionnairePart3.documents.items.filter(d => d.aiGenerator).length);
            console.log('🌍 Prefiksy: MIE/ EUR/ ARB/');
            console.log('✅ ==========================================');
        }
    }, 100);
    
    // Timeout zabezpieczający
    setTimeout(() => {
        clearInterval(checkParts);
        if (!window.internationalQuestionnaire) {
            console.error('❌ Nie udało się załadować ankiety międzynarodowej - brak części!');
        }
    }, 10000);
})();
