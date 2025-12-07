// 💼 ANKIETA GOSPODARCZA - CZĘŚĆ 2: SEKCJE 6-9
console.log('💼 Commercial Questionnaire Part 2 - Loaded!');

window.commercialQuestionnaire_Part2 = {
    sections_6_9: [
        // ===== SEKCJA 6: DOWODY =====
        {
            id: 'evidence',
            title: '',
            icon: '📎',
            help: 'Jakie dowody posiadasz?',
            questions: [
                { 
                    id: 'evidence_types', 
                    label: 'Rodzaje dowodów', 
                    type: 'checkbox', 
                    required: false,
                    options: [
                        { value: 'contract', label: '📄 Umowa pisemna' },
                        { value: 'invoices', label: '📊 Faktury VAT' },
                        { value: 'emails', label: '📧 Korespondencja email' },
                        { value: 'delivery_notes', label: '📦 Dokumenty WZ/CMR' },
                        { value: 'payment_proofs', label: '💳 Potwierdzenia płatności' },
                        { value: 'witnesses', label: '👥 Świadkowie' }
                    ]
                },
                { 
                    id: 'evidence_strength', 
                    label: 'Siła dowodów?', 
                    type: 'radio', 
                    required: false,
                    options: [
                        { value: 'strong', label: '💪 Mocne' },
                        { value: 'medium', label: '👍 Średnie' },
                        { value: 'weak', label: '🤷 Słabe' }
                    ]
                }
            ]
        },

        // ===== SEKCJA 7: HISTORIA =====
        {
            id: 'case_history',
            title: '',
            icon: '📅',
            questions: [
                { 
                    id: 'demand_letters_sent', 
                    label: 'Czy wysłano wezwanie?', 
                    type: 'radio', 
                    required: false,
                    options: [
                        { value: 'yes_formal', label: '✅ Tak - formalne' },
                        { value: 'yes_email', label: '📧 Tak - mailem' },
                        { value: 'no', label: '❌ Nie' }
                    ]
                },
                { id: 'demand_date', label: 'Kiedy wysłano?', type: 'date', required: false },
                { id: 'opposing_response', label: 'Reakcja przeciwnika', type: 'textarea', required: false, rows: 4 }
            ]
        },

        // ===== SEKCJA 8: STRATEGIA =====
        {
            id: 'strategy',
            title: '',
            icon: '🎯',
            help: 'Twoje cele i priorytety',
            questions: [
                { 
                    id: 'main_goal', 
                    label: 'Główny cel', 
                    type: 'radio', 
                    required: true,
                    options: [
                        { value: 'fast_settlement', label: '⚡ Szybka ugoda' },
                        { value: 'full_amount', label: '💰 Pełna kwota' },
                        { value: 'judgment', label: '⚖️ Wyrok sądowy' }
                    ]
                },
                { 
                    id: 'urgency_level', 
                    label: 'Pilność', 
                    type: 'radio', 
                    required: true,
                    options: [
                        { value: 'critical', label: '🚨 KRYTYCZNA' },
                        { value: 'high', label: '⚠️ WYSOKA' },
                        { value: 'medium', label: '📋 ŚREDNIA' }
                    ]
                },
                { 
                    id: 'security_needed', 
                    label: 'Zabezpieczenie roszczenia?', 
                    type: 'radio', 
                    required: false,
                    options: [
                        { value: 'yes_urgent', label: '🚨 TAK - pilnie!' },
                        { value: 'yes', label: '✅ Tak' },
                        { value: 'no', label: '❌ Nie' }
                    ]
                }
            ]
        },

        // ===== SEKCJA 9: DODATKOWE =====
        {
            id: 'additional_info',
            title: '',
            icon: '📋',
            questions: [
                { 
                    id: 'bankruptcy_risk', 
                    label: 'Ryzyko upadłości przeciwnika?', 
                    type: 'radio', 
                    required: false,
                    options: [
                        { value: 'high', label: '⚠️ Wysokie' },
                        { value: 'medium', label: '🟡 Średnie' },
                        { value: 'low', label: '🟢 Niskie' }
                    ]
                },
                { id: 'special_circumstances', label: 'Szczególne okoliczności', type: 'textarea', required: false, rows: 4 }
            ]
        }
    ]
};

console.log('✅ Commercial Part 2 załadowana!');
