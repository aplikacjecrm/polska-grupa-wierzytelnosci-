// ==========================================
// ANKIETA SPADKOWA - GŁÓWNY PLIK
// ==========================================

console.log('📜 Ładowanie ankiety spadkowej...');

// Sprawdź czy części są załadowane
const checkParts = () => {
    const part1 = window.inheritanceQuestionnairePart1;
    const part2 = window.inheritanceQuestionnairePart2;
    const part3 = inheritanceQuestionnairePart3;
    
    if (!part1 || !part2 || !part3) {
        console.warn('⚠️ Nie wszystkie części ankiety spadkowej załadowane!', {
            part1: !!part1,
            part2: !!part2,
            part3: !!part3
        });
        return false;
    }
    
    return true;
};

// Połącz wszystkie części w jedną ankietę
window.inheritanceQuestionnaire = {
    id: 'inheritance',
    title: '📜 Ankieta Spadkowa',
    description: 'Postępowanie spadkowe - nabycie spadku, dział majątku, testament',
    color: '#8B4513', // Brązowy
    icon: '🎗️',
    prefix: 'SPA',
    
    // Połącz sekcje z wszystkich części
    get sections() {
        if (!checkParts()) return [];
        
        return [
            ...window.inheritanceQuestionnairePart1.sections,
            ...window.inheritanceQuestionnairePart2.sections
        ];
    },
    
    // Procedura z części 3
    get procedure() {
        if (!window.inheritanceQuestionnairePart3) {
            console.warn('⚠️ Inheritance Part 3 nie załadowana!');
            return { title: '', phases: [] };
        }
        return window.inheritanceQuestionnairePart3.procedure;
    },
    
    // Dokumenty z części 3
    get requiredDocuments() {
        if (!window.inheritanceQuestionnairePart3) {
            console.warn('⚠️ Inheritance Part 3 nie załadowana!');
            return [];
        }
        return window.inheritanceQuestionnairePart3.requiredDocuments;
    }
};

// Sprawdź czy ankieta się załadowała
if (window.inheritanceQuestionnaire && window.inheritanceQuestionnaire.sections.length > 0) {
    console.log('✅ Pełna ankieta spadkowa załadowana!');
    console.log('📊 Sekcji:', window.inheritanceQuestionnaire.sections.length);
    console.log('📅 Faz procedury:', window.inheritanceQuestionnaire.procedure?.phases?.length || 0);
    console.log('📄 Dokumentów:', window.inheritanceQuestionnaire.requiredDocuments?.length || 0);
} else {
    console.error('❌ Błąd ładowania ankiety spadkowej!');
}
