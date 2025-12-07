// ==========================================
// ANKIETA MAJĄTKOWA - GŁÓWNY PLIK
// ==========================================

console.log('🏠 Ładowanie ankiety majątkowej...');

// Sprawdź czy części są załadowane
const checkPropertyParts = () => {
    const part1 = window.propertyQuestionnairePart1;
    const part2 = window.propertyQuestionnairePart2;
    const part3 = window.propertyQuestionnairePart3;
    
    if (!part1 || !part2 || !part3) {
        console.warn('⚠️ Nie wszystkie części ankiety majątkowej załadowane!', {
            part1: !!part1,
            part2: !!part2,
            part3: !!part3
        });
        return false;
    }
    
    return true;
};

// Połącz wszystkie części w jedną ankietę
window.propertyQuestionnaire = {
    id: 'property',
    title: '🏠 Ankieta Majątkowa',
    description: 'Sprawy o własność, służebności, roszczenia rzeczowe',
    color: '#16a085', // Turkusowy
    icon: '🏠',
    prefix: 'MAJ',
    
    // Połącz sekcje z wszystkich części
    get sections() {
        if (!checkPropertyParts()) return [];
        
        return [
            ...window.propertyQuestionnairePart1.sections,
            ...window.propertyQuestionnairePart2.sections
        ];
    },
    
    // Procedura z części 3
    get procedure() {
        if (!window.propertyQuestionnairePart3) {
            console.warn('⚠️ Property Part 3 nie załadowana!');
            return { title: '', phases: [] };
        }
        return window.propertyQuestionnairePart3.procedure;
    },
    
    // Dokumenty z części 3
    get requiredDocuments() {
        if (!window.propertyQuestionnairePart3) {
            console.warn('⚠️ Property Part 3 nie załadowana!');
            return [];
        }
        return window.propertyQuestionnairePart3.requiredDocuments;
    }
};

// Sprawdź czy ankieta się załadowała
if (window.propertyQuestionnaire && window.propertyQuestionnaire.sections.length > 0) {
    console.log('✅ Pełna ankieta majątkowa załadowana!');
    console.log('📊 Sekcji:', window.propertyQuestionnaire.sections.length);
    console.log('📅 Faz procedury:', window.propertyQuestionnaire.procedure?.phases?.length || 0);
    console.log('📄 Dokumentów:', window.propertyQuestionnaire.requiredDocuments?.length || 0);
} else {
    console.error('❌ Błąd ładowania ankiety majątkowej!');
}
