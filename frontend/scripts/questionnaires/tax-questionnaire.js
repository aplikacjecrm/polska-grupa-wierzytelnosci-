// ==========================================
// ANKIETA PODATKOWA - GŁÓWNY PLIK
// ==========================================

console.log('🔥 Ładowanie ankiety podatkowej...');

// Sprawdź czy części są załadowane
const checkTaxParts = () => {
    const part1 = window.taxQuestionnairePart1;
    const part2 = window.taxQuestionnairePart2;
    const part3 = window.taxQuestionnairePart3;
    
    if (!part1 || !part2 || !part3) {
        console.warn('⚠️ Nie wszystkie części ankiety podatkowej załadowane!', {
            part1: !!part1,
            part2: !!part2,
            part3: !!part3
        });
        return false;
    }
    
    return true;
};

// Połącz wszystkie części w jedną ankietę
window.taxQuestionnaire = {
    id: 'tax',
    title: '🔥 Ankieta Podatkowa',
    description: 'Prawo podatkowe - podatki, kontrole, spory, US/ZUS/GIS',
    color: '#1E40AF', // Ciemnoczerwony
    icon: '🔥',
    prefix: 'POD',
    
    // Połącz sekcje z wszystkich części
    get sections() {
        if (!checkTaxParts()) return [];
        
        return [
            ...window.taxQuestionnairePart1.sections,
            ...window.taxQuestionnairePart2.sections,
            ...window.taxQuestionnairePart3.sections
        ];
    },
    
    // Procedura z części 3
    get procedure() {
        if (!window.taxQuestionnairePart3) {
            console.warn('⚠️ Tax Part 3 nie załadowana!');
            return { title: '', phases: [] };
        }
        return window.taxQuestionnairePart3.procedure;
    },
    
    // Dokumenty z części 3
    get requiredDocuments() {
        if (!window.taxQuestionnairePart3) {
            console.warn('⚠️ Tax Part 3 nie załadowana!');
            return [];
        }
        return window.taxQuestionnairePart3.requiredDocuments;
    }
};

// Sprawdź czy ankieta się załadowała
if (window.taxQuestionnaire && window.taxQuestionnaire.sections.length > 0) {
    console.log('✅ Pełna ankieta podatkowa załadowana!');
    console.log('📊 Sekcji:', window.taxQuestionnaire.sections.length);
    console.log('📅 Faz procedury:', window.taxQuestionnaire.procedure?.phases?.length || 0);
    console.log('📄 Dokumentów:', window.taxQuestionnaire.requiredDocuments?.length || 0);
} else {
    console.error('❌ Błąd ładowania ankiety podatkowej!');
}
