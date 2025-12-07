// 📋 HELPER - Automatyczne dodawanie przycisków ankiet
// Ten skrypt automatycznie dodaje przycisk "Ankieta" w panelu Szybkie akcje

console.log('📋 Ładuję Questionnaire Button Helper...');

window.questionnaireButtonHelper = {
    /**
     * Sprawdź typ sprawy i dodaj odpowiedni przycisk ankiety
     */
    addQuestionnaireButton(caseData, containerId = 'quickActionsPanel') {
        console.log('🔍 Sprawdzam czy dodać przycisk ankiety dla:', caseData);
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn('⚠️ Nie znaleziono kontenera:', containerId);
            return false;
        }

        // Sprawdź czy już istnieje przycisk ankiety
        if (document.getElementById('questionnaireButton')) {
            console.log('✅ Przycisk ankiety już istnieje');
            return true;
        }

        let questionnaireInfo = this.detectQuestionnaireType(caseData);
        
        if (!questionnaireInfo) {
            console.log('❌ Brak ankiety dla tego typu sprawy');
            return false;
        }

        // Utwórz przycisk
        const button = this.createQuestionnaireButton(caseData, questionnaireInfo);
        
        // Dodaj do kontenera
        container.insertAdjacentHTML('beforeend', button);
        
        console.log('✅ Dodano przycisk ankiety:', questionnaireInfo.title);
        return true;
    },

    /**
     * Wykryj typ ankiety na podstawie danych sprawy
     */
    detectQuestionnaireType(caseData) {
        const caseType = caseData.case_type;
        const caseNumber = caseData.case_number || '';
        
        // SPRAWY KARNE
        if (window.isCriminalCase && window.isCriminalCase(caseType)) {
            return {
                type: 'criminal',
                title: '🚔 Ankieta Karna',
                color: '#3B82F6',
                onClick: `window.openCriminalQuestionnaire(${caseData.id}, '${caseType}')`
            };
        }
        
        // Sprawdź po numerze sprawy (POB/KRA/OSZ/DRO/NAR)
        if (window.isCriminalCase && window.isCriminalCase(caseNumber)) {
            return {
                type: 'criminal',
                title: '🚔 Ankieta Karna',
                color: '#3B82F6',
                onClick: `window.openCriminalQuestionnaire(${caseData.id}, '${caseNumber}')`
            };
        }

        // UPADŁOŚĆ
        if (caseType === 'bankruptcy' || caseNumber.startsWith('UPA')) {
            return {
                type: 'bankruptcy',
                title: '📉 Ankieta Upadłościowa',
                color: '#3B82F6',
                onClick: `window.openBankruptcyQuestionnaire && window.openBankruptcyQuestionnaire(${caseData.id})`
            };
        }

        // RESTRUKTURYZACJA
        if (caseType === 'restructuring' || caseNumber.startsWith('RES')) {
            return {
                type: 'restructuring',
                title: '🔄 Ankieta Restrukturyzacyjna',
                color: '#3B82F6',
                onClick: `window.openRestructuringQuestionnaire && window.openRestructuringQuestionnaire(${caseData.id})`
            };
        }

        // ODSZKODOWANIE
        if (caseType === 'compensation' || caseNumber.startsWith('ODS')) {
            return {
                type: 'compensation',
                title: '💰 Ankieta Odszkodowawcza',
                color: '#3B82F6',
                onClick: `window.questionnaireRenderer && window.questionnaireRenderer.openQuestionnaire(window.compensationQuestionnaire, ${caseData.id})`
            };
        }

        // WINDYKACJA
        if (caseType === 'debt_collection' || caseNumber.startsWith('WIN')) {
            return {
                type: 'debt_collection',
                title: '📜 Ankieta Windykacyjna',
                color: '#3B82F6',
                onClick: `window.questionnaireRenderer && window.questionnaireRenderer.openQuestionnaire(window.debtCollectionQuestionnaire, ${caseData.id})`
            };
        }

        return null;
    },

    /**
     * Utwórz HTML przycisku ankiety
     */
    createQuestionnaireButton(caseData, info) {
        return `
            <button 
                id="questionnaireButton"
                onclick="${info.onClick}"
                style="
                    width: 100%;
                    background: linear-gradient(135deg, ${info.color} 0%, ${this.darkenColor(info.color)} 100%);
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: all 0.3s;
                    margin-top: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                "
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.15)'"
            >
                ${info.title}
            </button>
        `;
    },

    /**
     * Przyciemnij kolor (dla gradientu)
     */
    darkenColor(color) {
        // Prosta metoda przyciemniania hex
        const colors = {
            '#3B82F6': '#1E40AF',
            '#3B82F6': '#1E40AF',
            '#3B82F6': '#1E40AF',
            '#3B82F6': '#1E40AF',
            '#3B82F6': '#3B82F6'
        };
        return colors[color] || color;
    },

    /**
     * Auto-inicjalizacja - szuka panelu i dodaje przycisk
     */
    autoInit() {
        console.log('🔄 Auto-inicjalizacja przycisków ankiet...');
        
        // Sprawdź różne możliwe ID kontenerów
        const possibleContainers = [
            'quickActionsPanel',
            'caseActionsPanel', 
            'szybkieAkcje',
            'caseActions'
        ];

        // Próbuj znaleźć kontener
        let container = null;
        for (const id of possibleContainers) {
            container = document.getElementById(id);
            if (container) {
                console.log('✅ Znaleziono kontener:', id);
                break;
            }
        }

        if (!container) {
            console.warn('⚠️ Nie znaleziono kontenera akcji. Spróbuję za 1 sekundę...');
            setTimeout(() => this.autoInit(), 1000);
            return;
        }

        // Pobierz dane aktualnej sprawy
        if (window.currentCase || window.crmManager?.currentCaseData) {
            const caseData = window.currentCase || window.crmManager.currentCaseData;
            this.addQuestionnaireButton(caseData, container.id);
        } else {
            console.warn('⚠️ Brak danych sprawy. Czekam na załadowanie...');
        }
    }
};

// Auto-start po załadowaniu
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.questionnaireButtonHelper.autoInit(), 500);
    });
} else {
    setTimeout(() => window.questionnaireButtonHelper.autoInit(), 500);
}

console.log('✅ Questionnaire Button Helper załadowany!');
