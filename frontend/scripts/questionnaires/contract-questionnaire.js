// ==========================================
// ANKIETA UMOWNA - GŁÓWNY PLIK
// ==========================================

console.log('📄 Ładowanie ankiety umownej...');

// Sprawdź czy części są załadowane
const checkContractParts = () => {
    const part1 = window.contractQuestionnairePart1;
    const part2 = window.contractQuestionnairePart2;
    const part3 = window.contractQuestionnairePart3;
    
    if (!part1 || !part2 || !part3) {
        console.warn('⚠️ Nie wszystkie części ankiety umownej załadowane!', {
            part1: !!part1,
            part2: !!part2,
            part3: !!part3
        });
        return false;
    }
    
    return true;
};

// Połącz wszystkie części w jedną ankietę
window.contractQuestionnaire = {
    id: 'contract',
    title: '📄 Ankieta Umowna',
    description: 'Sprawy umów cywilno-prawnych - roszczenia, zapłata, wykonanie',
    color: '#1a2332', // Pro Meritum granatowy
    icon: '📄',
    prefix: 'UMO',
    
    // Połącz sekcje z wszystkich części
    get sections() {
        if (!checkContractParts()) return [];
        
        return [
            ...window.contractQuestionnairePart1.sections,
            ...window.contractQuestionnairePart2.sections
        ];
    },
    
    // Procedura z części 3
    get procedure() {
        if (!window.contractQuestionnairePart3) {
            console.warn('⚠️ Contract Part 3 nie załadowana!');
            return { title: '', phases: [] };
        }
        return window.contractQuestionnairePart3.procedure;
    },
    
    // Dokumenty z części 3
    get requiredDocuments() {
        if (!window.contractQuestionnairePart3) {
            console.warn('⚠️ Contract Part 3 nie załadowana!');
            return [];
        }
        return window.contractQuestionnairePart3.requiredDocuments;
    }
};

// Sprawdź czy ankieta się załadowała
if (window.contractQuestionnaire && window.contractQuestionnaire.sections.length > 0) {
    console.log('✅ Pełna ankieta umowna załadowana!');
    console.log('📊 Sekcji:', window.contractQuestionnaire.sections.length);
    console.log('📅 Faz procedury:', window.contractQuestionnaire.procedure?.phases?.length || 0);
    console.log('📄 Dokumentów:', window.contractQuestionnaire.requiredDocuments?.length || 0);
} else {
    console.error('❌ Błąd ładowania ankiety umownej!');
}
