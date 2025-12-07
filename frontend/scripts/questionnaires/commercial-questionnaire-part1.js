// 💼 ANKIETA GOSPODARCZA - CZĘŚĆ 1: SEKCJE 1-5
console.log('💼 Commercial Questionnaire Part 1 - Loaded!');

window.commercialQuestionnaire_Part1 = {
    sections_1_5: [
        // ===== SEKCJA 1: NASZA FIRMA =====
        {
            id: 'our_company',
            title: 'Nasza Firma (Powód/Wnioskodawca)',
            icon: '🏢',
            description: 'Kto występuje w sprawie?',
            help: 'Podstawowe informacje o Twojej firmie',
            questions: [
                { id: 'our_company_name', label: 'Pełna nazwa firmy', type: 'text', required: true, placeholder: 'ABC Sp. z o.o.' },
                { 
                    id: 'our_legal_form', 
                    label: 'Forma prawna', 
                    type: 'select', 
                    required: true, 
                    options: [
                        { value: 'sp_zoo', label: 'Spółka z o.o.' },
                        { value: 'sp_akcyjna', label: 'Spółka akcyjna (S.A.)' },
                        { value: 'sp_komandytowa', label: 'Spółka komandytowa' },
                        { value: 'jdg', label: 'Jednoosobowa działalność' },
                        { value: 'other', label: 'Inna' }
                    ]
                },
                { id: 'our_nip', label: 'NIP', type: 'text', required: true, placeholder: '123-456-78-90' },
                { id: 'our_krs', label: 'KRS', type: 'text', required: false },
                { id: 'our_address', label: 'Adres siedziby', type: 'text', required: true }
            ]
        },

        // ===== SEKCJA 2: STRONA PRZECIWNA =====
        {
            id: 'opposing_party',
            title: 'Strona Przeciwna',
            icon: '🎯',
            description: 'Z kim jest spór?',
            help: 'Informacje o drugiej stronie sporu',
            questions: [
                { id: 'opposing_company_name', label: 'Nazwa firmy przeciwnika', type: 'text', required: true },
                { id: 'opposing_nip', label: 'NIP (jeśli znany)', type: 'text', required: false },
                { id: 'opposing_address', label: 'Adres siedziby', type: 'text', required: false }
            ]
        },

        // ===== SEKCJA 3: PRZEDMIOT SPORU =====
        {
            id: 'dispute_subject',
            title: 'Przedmiot Sporu',
            icon: '⚖️',
            description: 'Czego dotyczy sprawa?',
            help: 'Co jest przedmiotem sprawy?',
            questions: [
                { 
                    id: 'dispute_type', 
                    label: 'Typ sporu', 
                    type: 'select', 
                    required: true,
                    options: [
                        { value: 'payment', label: '💰 Zapłata' },
                        { value: 'contract_breach', label: '📄 Niewykonanie umowy' },
                        { value: 'delivery', label: '📦 Dostawa' },
                        { value: 'warranty', label: '🛡️ Rękojmia/Gwarancja' },
                        { value: 'other', label: '📝 Inny' }
                    ]
                },
                { id: 'dispute_description', label: 'Opis sytuacji', type: 'textarea', required: true, rows: 6 }
            ]
        },

        // ===== SEKCJA 4: UMOWA =====
        {
            id: 'contract_basis',
            title: '',
            icon: '📄',
            questions: [
                { 
                    id: 'contract_exists', 
                    label: 'Czy jest umowa pisemna?', 
                    type: 'radio', 
                    required: true,
                    options: [
                        { value: 'written', label: 'Tak - pisemna' },
                        { value: 'oral', label: 'Nie - ustna' },
                        { value: 'email', label: 'Email' }
                    ]
                },
                { id: 'contract_date', label: 'Data umowy', type: 'date', required: false }
            ]
        },

        // ===== SEKCJA 5: KWOTA =====
        {
            id: 'claim_amount',
            title: '',
            icon: '💰',
            questions: [
                { id: 'main_claim', label: 'Kwota główna (PLN)', type: 'number', required: true, placeholder: '100000' },
                { 
                    id: 'interest_applicable', 
                    label: 'Odsetki?', 
                    type: 'radio', 
                    required: true,
                    options: [
                        { value: 'statutory', label: 'Tak - ustawowe' },
                        { value: 'no', label: 'Nie' }
                    ]
                }
            ]
        }
    ]
};

console.log('✅ Commercial Part 1 załadowana!');
