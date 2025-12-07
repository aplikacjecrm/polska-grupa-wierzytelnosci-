// ==========================================
// ANKIETA RODZINNA - GŁÓWNY PLIK
// ==========================================

console.log('👨‍👩‍👧‍👦 Ładowanie ankiety rodzinnej...');

// Sprawdź czy części są załadowane
const checkFamilyParts = () => {
    const part1 = window.familyQuestionnairePart1;
    const part2 = window.familyQuestionnairePart2;
    const part3 = window.familyQuestionnairePart3;
    
    if (!part1 || !part2 || !part3) {
        console.warn('⚠️ Nie wszystkie części ankiety rodzinnej załadowane!', {
            part1: !!part1,
            part2: !!part2,
            part3: !!part3
        });
        return false;
    }
    
    return true;
};

// Połącz wszystkie części w jedną ankietę
window.familyQuestionnaire = {
    id: 'family',
    title: '👨‍👩‍👧‍👦 Ankieta Rodzinna',
    description: 'Sprawy rodzinne - rozwody, alimenty, opieka nad dziećmi, władza rodzicielska',
    color: '#3B82F6', // Różowy
    icon: '👨‍👩‍👧‍👦',
    prefix: 'ROD',
    
    // Połącz sekcje z wszystkich części
    get sections() {
        if (!checkFamilyParts()) return [];
        
        return [
            ...window.familyQuestionnairePart1.sections,
            ...window.familyQuestionnairePart2.sections,
            ...window.familyQuestionnairePart3.sections
        ];
    },
    
    // Procedura z części 3
    get procedure() {
        if (!window.familyQuestionnairePart3) {
            console.warn('⚠️ Family Part 3 nie załadowana!');
            return { title: '', phases: [] };
        }
        return window.familyQuestionnairePart3.procedure;
    },
    
    // Dokumenty z części 3
    get requiredDocuments() {
        if (!window.familyQuestionnairePart3) {
            console.warn('⚠️ Family Part 3 nie załadowana!');
            return [];
        }
        return window.familyQuestionnairePart3.requiredDocuments;
    }
};

// Sprawdź czy ankieta się załadowała
if (window.familyQuestionnaire && window.familyQuestionnaire.sections.length > 0) {
    console.log('✅ Pełna ankieta rodzinna załadowana!');
    console.log('📊 Sekcji:', window.familyQuestionnaire.sections.length);
    console.log('📅 Faz procedury:', window.familyQuestionnaire.procedure?.phases?.length || 0);
    console.log('📄 Dokumentów:', window.familyQuestionnaire.requiredDocuments?.length || 0);
} else {
    console.error('❌ Błąd ładowania ankiety rodzinnej!');
}
