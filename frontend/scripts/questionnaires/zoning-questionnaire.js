// ==========================================
// ANKIETA ZAGOSPODAROWANIA PRZESTRZENNEGO - GŁÓWNY PLIK
// ==========================================

console.log('🗺️ Ładowanie ankiety zagospodarowania przestrzennego...');

// Sprawdź czy części są załadowane
const checkZoningParts = () => {
    const part1 = window.zoningQuestionnairePart1;
    const part2 = window.zoningQuestionnairePart2;
    const part3 = window.zoningQuestionnairePart3;
    
    if (!part1 || !part2 || !part3) {
        console.warn('⚠️ Nie wszystkie części ankiety zagospodarowania załadowane!', {
            part1: !!part1,
            part2: !!part2,
            part3: !!part3
        });
        return false;
    }
    
    return true;
};

// Połącz wszystkie części w jedną ankietę
window.zoningQuestionnaire = {
    id: 'zoning',
    title: '🗺️ Ankieta Zagospodarowania Przestrzennego',
    description: 'MPZP, Warunki Zabudowy, decyzje lokalizacyjne, WSA/NSA',
    color: '#16a085', // Morski/Turkusowy
    icon: '🗺️',
    prefix: 'ZAG',
    
    // Połącz sekcje z wszystkich części
    get sections() {
        if (!checkZoningParts()) return [];
        
        return [
            ...window.zoningQuestionnairePart1.sections,
            ...window.zoningQuestionnairePart2.sections,
            ...window.zoningQuestionnairePart3.sections
        ];
    },
    
    // Procedura z części 3
    get procedure() {
        if (!window.zoningQuestionnairePart3) {
            console.warn('⚠️ Zoning Part 3 nie załadowana!');
            return { title: '', phases: [] };
        }
        return window.zoningQuestionnairePart3.procedure;
    },
    
    // Dokumenty z części 3
    get requiredDocuments() {
        if (!window.zoningQuestionnairePart3) {
            console.warn('⚠️ Zoning Part 3 nie załadowana!');
            return [];
        }
        return window.zoningQuestionnairePart3.requiredDocuments;
    }
};

// Sprawdź czy ankieta się załadowała
if (window.zoningQuestionnaire && window.zoningQuestionnaire.sections.length > 0) {
    console.log('✅ Pełna ankieta zagospodarowania przestrzennego załadowana!');
    console.log('📊 Sekcji:', window.zoningQuestionnaire.sections.length);
    console.log('📅 Faz procedury:', window.zoningQuestionnaire.procedure?.phases?.length || 0);
    console.log('📄 Dokumentów:', window.zoningQuestionnaire.requiredDocuments?.length || 0);
} else {
    console.error('❌ Błąd ładowania ankiety zagospodarowania przestrzennego!');
}
