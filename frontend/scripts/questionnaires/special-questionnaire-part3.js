// ==========================================
// ANKIETA PRAWA SPECJALNEGO - CZĘŚĆ 3
// Sekcja 8, Procedura (6 faz), Dokumenty (12 pozycji)
// ==========================================

window.specialQuestionnairePart3 = {
    sections: [
        {
            id: 8,
            title: '',
            description: 'Inne istotne fakty',
            questions: [
                {
                    id: 'technical_expertise_needed',
                    type: 'select',
                    label: 'Czy potrzebne opinie techniczne / ekspertyzy?',
                    options: [
                        { value: 'yes_critical', label: 'Tak - kluczowe dla sprawy' },
                        { value: 'yes_helpful', label: 'Tak - pomocne' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'regulatory_body',
                    type: 'text',
                    label: 'Właściwy organ regulacyjny (jeśli dotyczy)',
                    placeholder: 'Np. URE, ULC, UODO, UKE, Urząd Morski'
                },
                {
                    id: 'deadline',
                    type: 'date',
                    label: 'Czy są krytyczne terminy?'
                },
                {
                    id: 'additional_info',
                    type: 'textarea',
                    label: 'Dodatkowe informacje',
                    placeholder: 'Wszystko co ważne, a nie zostało uwzględnione powyżej...',
                    rows: 5
                }
            ]
        }
    ],
    
    procedure: {
        title: 'PROCEDURA SPRAW SPECJALNYCH',
        phases: [
            {
                id: 1,
                icon: '🔍',
                name: 'ANALIZA SPRAWY I STRATEGIA',
                duration: '1-2 tygodnie',
                tasks: [
                    'Analiza stanu faktycznego i prawnego',
                    'Identyfikacja właściwych przepisów specjalistycznych',
                    'Ocena właściwości sądu/organu',
                    'Analiza dokumentacji technicznej',
                    'Konsultacje z ekspertami technicznymi',
                    'Określenie strategii procesowej'
                ],
                critical: true,
                notes: '⚠️ Prawo specjalne wymaga wiedzy technicznej + prawniczej!'
            },
            {
                id: 2,
                icon: '📑',
                name: 'ZBIERANIE DOKUMENTACJI',
                duration: '2-4 tygodnie',
                tasks: [
                    'Dokumentacja techniczna',
                    'Pozwolenia / Koncesje / Licencje',
                    'Umowy i korespondencja',
                    'Dokumenty rejestrowe',
                    'Protokoły / Raporty',
                    'Opinie techniczne'
                ],
                critical: false,
                notes: 'Dokumentacja techniczna często obszerniejsza niż prawna!'
            },
            {
                id: 3,
                icon: '🚀',
                name: 'POSTĘPOWANIE PRZED ORGANEM / SĄDEM',
                duration: '3-12 miesięcy',
                tasks: [
                    'Złożenie pozwu / Wniosku / Odwołania',
                    'Odpowiedź strony przeciwnej',
                    'Postępowanie dowodowe',
                    'Opinia biegłego (często kluczowa!)',
                    'Rozprawy / Posiedzenia',
                    'Stanowiska stron'
                ],
                critical: true,
                notes: '⚖️ Opinia biegłego technicznego często decyduje o wyniku!'
            },
            {
                id: 4,
                icon: '📜',
                name: 'WYROK / DECYZJA',
                duration: '1-6 miesięcy',
                tasks: [
                    'Wydanie wyroku/decyzji',
                    'Analiza uzasadnienia',
                    'Ocena możliwości odwołania',
                    'Przygotowanie apelacji (jeśli potrzeba)',
                    'Środki zaskarżenia do sądu wyższej instancji'
                ],
                critical: false,
                notes: 'W sprawach specjalnych często są 2-3 instancje.'
            },
            {
                id: 5,
                icon: '⚖️',
                name: 'POSTĘPOWANIE ODWOŁAWCZE',
                duration: '6-18 miesięcy',
                tasks: [
                    'Apelacja / Skarga',
                    'Postępowanie II instancji',
                    'Ewentualna kasacja / Skarga do NSA',
                    'Postępowanie przed sądem najwyższym'
                ],
                critical: false,
                notes: 'Sprawy specjalne często trafiają do NSA/SN (precedensy).'
            },
            {
                id: 6,
                icon: '💰',
                name: 'EGZEKUCJA / WYKONANIE',
                duration: '3-12 miesięcy',
                tasks: [
                    'Nadanie klauzuli wykonalności',
                    'Wszczęcie egzekucji',
                    'Zajęcie majątku',
                    'Realizacja świadczenia',
                    'Monitoring wykonania decyzji organu'
                ],
                critical: true,
                notes: 'Egzekucja często trudniejsza - aktywa specyficzne (statki, instalacje, systemy IT).'
            }
        ]
    },
    
    documents: {
        title: 'WYMAGANE DOKUMENTY - PRAWO SPECJALNE',
        items: [
            {
                id: 1,
                icon: '📄',
                name: 'Umowa główna',
                required: true,
                aiGenerator: false,
                description: 'Umowa będąca podstawą sporu',
                deadline: 'natychmiast'
            },
            {
                id: 2,
                icon: '📋',
                name: 'Dokumentacja techniczna',
                required: true,
                aiGenerator: false,
                description: 'Schematy, specyfikacje, protokoły, certyfikaty',
                deadline: 'natychmiast'
            },
            {
                id: 3,
                icon: '📜',
                name: 'Pozwolenia / Koncesje / Licencje',
                required: true,
                aiGenerator: false,
                description: 'Wszystkie wymagane pozwolenia regulacyjne',
                deadline: '1 tydzień'
            },
            {
                id: 4,
                icon: '✉️',
                name: 'Korespondencja',
                required: true,
                aiGenerator: false,
                description: 'E-maile, listy, wezwania',
                deadline: 'natychmiast'
            },
            {
                id: 5,
                icon: '🏢',
                name: 'Dokumenty rejestrowe',
                required: true,
                aiGenerator: false,
                description: 'KRS, CEIDG kontrahenta',
                deadline: '2 tygodnie'
            },
            {
                id: 6,
                icon: '💳',
                name: 'Dowody finansowe',
                required: true,
                aiGenerator: false,
                description: 'Faktury, przelewy, zestawienia',
                deadline: 'natychmiast'
            },
            {
                id: 7,
                icon: '🤖',
                name: 'Pozew / Wniosek',
                required: true,
                aiGenerator: true,
                description: 'Dokument wszczynający postępowanie',
                deadline: 'przed złożeniem'
            },
            {
                id: 8,
                icon: '🤖',
                name: 'Pełnomocnictwo',
                required: true,
                aiGenerator: true,
                description: 'Pełnomocnictwo procesowe',
                deadline: 'przed złożeniem'
            },
            {
                id: 9,
                icon: '🤖',
                name: 'Wniosek o zabezpieczenie',
                required: false,
                aiGenerator: true,
                description: 'Jeśli potrzebne zabezpieczenie roszczenia',
                deadline: 'pilnie'
            },
            {
                id: 10,
                icon: '🤖',
                name: 'Wniosek o opinię biegłego',
                required: false,
                aiGenerator: true,
                description: 'Dopuszczenie dowodu z opinii biegłego technicznego',
                deadline: 'w toku postępowania'
            },
            {
                id: 11,
                icon: '🤖',
                name: 'Apelacja',
                required: false,
                aiGenerator: true,
                description: 'Od wyroku I instancji',
                deadline: '14 dni od doręczenia'
            },
            {
                id: 12,
                icon: '🤖',
                name: 'Skarga do organu regulacyjnego',
                required: false,
                aiGenerator: true,
                description: 'Skarga do URE/ULC/UODO/UKE',
                deadline: 'zależnie od organu'
            }
        ]
    }
};

console.log('✅ Special Part 3 załadowana (Sekcja 8, Procedura 6 faz, Dokumenty 12)!');
