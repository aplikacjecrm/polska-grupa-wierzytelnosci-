// ==========================================
// ANKIETA BUDOWLANA - GŁÓWNY PLIK
// ==========================================

console.log('🏗️ Ładowanie ankiety budowlanej...');

// Sprawdź czy części są załadowane
const checkBuildingParts = () => {
    const part1 = window.buildingQuestionnairePart1;
    const part2 = window.buildingQuestionnairePart2;
    const part3 = window.buildingQuestionnairePart3;
    
    if (!part1 || !part2 || !part3) {
        console.warn('⚠️ Nie wszystkie części ankiety budowlanej załadowane!', {
            part1: !!part1,
            part2: !!part2,
            part3: !!part3
        });
        return false;
    }
    
    return true;
};

// Połącz wszystkie części w jedną ankietę
window.buildingQuestionnaire = {
    id: 'building',
    title: '🏗️ Ankieta Budowlana',
    description: 'Prawo budowlane - pozwolenia, decyzje, spory, WSA/NSA',
    color: '#3B82F6', // Pomarańczowy
    icon: '🏗️',
    prefix: 'BUD',
    
    // Połącz sekcje z wszystkich części
    get sections() {
        if (!checkBuildingParts()) return [];
        
        return [
            ...window.buildingQuestionnairePart1.sections,
            ...window.buildingQuestionnairePart2.sections,
            ...window.buildingQuestionnairePart3.sections
        ];
    },
    
    // Procedura z części 3
    get procedure() {
        if (!window.buildingQuestionnairePart3) {
            console.warn('⚠️ Building Part 3 nie załadowana!');
            return { title: '', phases: [] };
        }
        return window.buildingQuestionnairePart3.procedure;
    },
    
    // Dokumenty z części 3
    get requiredDocuments() {
        if (!window.buildingQuestionnairePart3) {
            console.warn('⚠️ Building Part 3 nie załadowana!');
            return [];
        }
        return window.buildingQuestionnairePart3.requiredDocuments;
    }
};

// Sprawdź czy ankieta się załadowała
if (window.buildingQuestionnaire && window.buildingQuestionnaire.sections.length > 0) {
    console.log('✅ Pełna ankieta budowlana załadowana!');
    console.log('📊 Sekcji:', window.buildingQuestionnaire.sections.length);
    console.log('📅 Faz procedury:', window.buildingQuestionnaire.procedure?.phases?.length || 0);
    console.log('📄 Dokumentów:', window.buildingQuestionnaire.requiredDocuments?.length || 0);
} else {
    console.error('❌ Błąd ładowania ankiety budowlanej!');
}
