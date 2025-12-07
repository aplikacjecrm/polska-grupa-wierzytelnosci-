// ==========================================
// ANKIETA PRAWA MIĘDZYNARODOWEGO - CZĘŚĆ 3
// Sekcja 8, Procedura (8 faz), Dokumenty (18 pozycji)
// ==========================================

window.internationalQuestionnairePart3 = {
    sections: [
        {
            id: 8,
            title: '',
            description: 'Inne istotne fakty',
            questions: [
                {
                    id: 'translation_needs',
                    type: 'select',
                    label: 'Czy potrzebne tłumaczenia przysięgłe?',
                    options: [
                        { value: 'yes_many', label: 'Tak - wiele dokumentów' },
                        { value: 'yes_few', label: 'Tak - kilka dokumentów' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'translation_languages',
                    type: 'text',
                    label: 'Języki tłumaczeń',
                    placeholder: 'np. polski ↔ angielski, polski ↔ niemiecki',
                    showIf: { translation_needs: ['yes_many', 'yes_few'] }
                },
                {
                    id: 'expert_opinions_needed',
                    type: 'select',
                    label: 'Czy potrzebne opinie ekspertów zagranicznych?',
                    options: [
                        { value: 'yes_legal', label: 'Tak - opinia o prawie obcym' },
                        { value: 'yes_technical', label: 'Tak - opinia techniczna/branżowa' },
                        { value: 'yes_valuation', label: 'Tak - wycena międzynarodowa' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'foreign_counsel',
                    type: 'select',
                    label: 'Czy zaangażowani radcowie zagraniczni?',
                    options: [
                        { value: 'yes', label: 'Tak - już współpracujemy' },
                        { value: 'needed', label: 'Potrzebni - proszę o pomoc w znalezieniu' },
                        { value: 'no', label: 'Nie są potrzebni' }
                    ]
                },
                {
                    id: 'foreign_counsel_country',
                    type: 'text',
                    label: 'Kraj radców zagranicznych',
                    placeholder: 'np. Niemcy, USA',
                    showIf: { foreign_counsel: ['yes', 'needed'] }
                },
                {
                    id: 'time_constraints',
                    type: 'textarea',
                    label: 'Krytyczne terminy',
                    placeholder: 'Np. termin odwołania, wygaśnięcie klauzuli arbitrażowej...',
                    rows: 3
                },
                {
                    id: 'political_sensitivity',
                    type: 'select',
                    label: 'Wrażliwość polityczna sprawy',
                    options: [
                        { value: 'high', label: 'Wysoka (państwo jako strona, sankcje)' },
                        { value: 'medium', label: 'Średnia' },
                        { value: 'low', label: 'Niska' },
                        { value: 'none', label: 'Brak' }
                    ]
                },
                {
                    id: 'media_attention',
                    type: 'select',
                    label: 'Zainteresowanie mediów',
                    options: [
                        { value: 'yes_high', label: 'Tak - wysokie (publikacje, sprawa znana)' },
                        { value: 'yes_some', label: 'Tak - umiarkowane' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'additional_notes',
                    type: 'textarea',
                    label: 'Dodatkowe uwagi',
                    placeholder: 'Wszystko co ważne, a nie zostało uwzględnione powyżej...',
                    rows: 5
                }
            ]
        }
    ],
    
    procedure: {
        title: 'PROCEDURA PRAWA MIĘDZYNARODOWEGO',
        phases: [
            {
                id: 1,
                icon: '🔍',
                name: 'ANALIZA PRAWNA I STRATEGIA',
                duration: '2-4 tygodnie',
                tasks: [
                    'Analiza prawa właściwego (lex causae)',
                    'Ustalenie właściwości sądu/arbitrażu (jurysdykcja)',
                    'Ocena klauzul umownych (arbitraż, wybór sądu)',
                    'Analiza stosowanych konwencji międzynarodowych',
                    'Opinia o prawie obcym (foreign law opinion)',
                    'Ocena możliwości egzekucji wyroku',
                    'Analiza kosztów (opłaty, tłumaczenia, eksperci)',
                    'Strategia: mediacja / arbitraż / sąd państwowy'
                ],
                critical: true,
                notes: '⚠️ Fundamentalna faza - błąd w określeniu prawa właściwego = przegrana!'
            },
            {
                id: 2,
                icon: '📑',
                name: 'PRZYGOTOWANIE DOKUMENTACJI',
                duration: '3-6 tygodni',
                tasks: [
                    'Zbieranie i analiza dokumentów',
                    'Tłumaczenia przysięgłe (PL ↔ obcy język)',
                    'Legalizacja/apostille dokumentów',
                    'Opinie ekspertów zagranicznych',
                    'Wyceny międzynarodowe',
                    'Korespondencja z zagranicznym kontrahentem',
                    'Próby polubownego rozwiązania',
                    'Przygotowanie memoriału/pozwu'
                ],
                critical: false,
                notes: 'Apostille - Konwencja Haska (większość krajów). Legalizacja konsularna - kraje poza Konwencją.'
            },
            {
                id: 3,
                icon: '🚀',
                name: 'INICJOWANIE POSTĘPOWANIA',
                duration: '1-3 miesiące',
                tasks: [
                    'Złożenie pozwu / Request for Arbitration',
                    'Doręczenie stronie przeciwnej (service of process)',
                    'Uiszczenie opłat (filing fees)',
                    'Wybór arbitrów (jeśli arbitraż)',
                    'Ukonstytuowanie trybunału arbitrażowego',
                    'Konferencja wstępna (preliminary conference)',
                    'Ustalenie harmonogramu (procedural calendar)',
                    'Odpowiedź strony przeciwnej / counterclaim'
                ],
                critical: true,
                notes: '💰 Opłaty arbitrażowe: ICC 50k-200k EUR, LCIA podobnie. ⏰ Terminy proceduralne mogą być SZTYWNE!'
            },
            {
                id: 4,
                icon: '✍️',
                name: 'FAZA PISEMNA (WRITTEN PHASE)',
                duration: '6-12 miesięcy',
                tasks: [
                    'Statement of Claim / Memorial',
                    'Statement of Defense / Counter-Memorial',
                    'Reply / Rejoinder',
                    'Wymiana dowodów (document production)',
                    'IBA Rules on Evidence (standard międzynarodowy)',
                    'Zeznania świadków (witness statements)',
                    'Opinie biegłych (expert reports)',
                    'Przygotowanie do hearing'
                ],
                critical: false,
                notes: 'IBA Rules - międzynarodowy standard dowodowy w arbitrażu. Common law discovery vs civil law!'
            },
            {
                id: 5,
                icon: '⚖️',
                name: 'PRZESŁUCHANIE (HEARING)',
                duration: '3-10 dni',
                tasks: [
                    'Przygotowanie świadków (witness preparation)',
                    'Przygotowanie biegłych',
                    'Opening statements',
                    'Direct examination / cross-examination',
                    'Expert testimony',
                    'Closing arguments',
                    'Post-hearing briefs (opcjonalnie)',
                    'Koszty hearing (sala, tłumacze, stenograf)'
                ],
                critical: true,
                notes: '🎯 Kluczowy moment! Często decyduje o wyniku. Koszty: 50k-500k EUR (sala, tłumacze, hotel).'
            },
            {
                id: 6,
                icon: '📜',
                name: 'WYROK / AWARD',
                duration: '3-9 miesięcy',
                tasks: [
                    'Deliberations trybunału',
                    'Draft award',
                    'Scrutiny (kontrola ICC/LCIA)',
                    'Final Award',
                    'Dissenting opinion (jeśli jest)',
                    'Costs decision (podział kosztów)',
                    'Doręczenie stronom',
                    'Ewentualne correction / interpretation'
                ],
                critical: false,
                notes: 'Arbitraż: ostateczny i wiążący. Sąd państwowy: odwołanie możliwe (zazwyczaj).'
            },
            {
                id: 7,
                icon: '🚫',
                name: 'POSTĘPOWANIE O UCHYLENIE (opcjonalne)',
                duration: '12-24 miesiące',
                tasks: [
                    'Analiza podstaw uchylenia (Art. V Konwencji Nowojorskiej)',
                    'Złożenie wniosku o uchylenie (annulment)',
                    'Sąd w miejscu siedziby arbitrażu (lex arbitri)',
                    'Bardzo wąskie przesłanki!',
                    'Proces przed sądem państwowym',
                    'Wyrok sądu (utrzymanie / uchylenie award)',
                    'Ewentualna apelacja',
                    'Ostateczność'
                ],
                critical: true,
                notes: '⚠️ Uchylenie BARDZO TRUDNE! Podstawy: przekroczenie umocowania, naruszenie due process, ład publiczny.'
            },
            {
                id: 8,
                icon: '💰',
                name: 'EGZEKUCJA WYROKU',
                duration: '6-24 miesiące',
                tasks: [
                    'Uznanie wyroku zagranicznego (exequatur)',
                    'Konwencja Nowojorska (arbitraż) / Bruksela I bis (sądy UE)',
                    'Wniosek do właściwego sądu',
                    'Nadanie klauzuli wykonalności',
                    'Wszczęcie egzekucji',
                    'Zajęcie majątku dłużnika',
                    'Współpraca z komornikami/bailiffs zagranicznymi',
                    'Realizacja świadczenia'
                ],
                critical: true,
                notes: '💰 TO JEST CEL! Bruksela I bis - automatyczne uznanie w UE. Konwencja Nowojorska - 160+ krajów!'
            }
        ]
    },
    
    documents: {
        title: 'WYMAGANE DOKUMENTY - PRAWO MIĘDZYNARODOWE',
        items: [
            {
                id: 1,
                icon: '📄',
                name: 'Umowa międzynarodowa',
                required: true,
                aiGenerator: false,
                description: 'Oryginał + tłumaczenie przysięgłe',
                deadline: 'natychmiast'
            },
            {
                id: 2,
                icon: '✉️',
                name: 'Korespondencja z kontrahentem',
                required: true,
                aiGenerator: false,
                description: 'E-maile, listy, wezwania do zapłaty (+ tłumaczenia)',
                deadline: 'natychmiast'
            },
            {
                id: 3,
                icon: '🏢',
                name: 'Dokumenty rejestrowe kontrahenta zagranicznego',
                required: true,
                aiGenerator: false,
                description: 'KRS/handelsregister, apostille/legalizacja',
                deadline: '2 tygodnie'
            },
            {
                id: 4,
                icon: '💳',
                name: 'Dowody zapłaty / brak zapłaty',
                required: true,
                aiGenerator: false,
                description: 'Przelewy, faktury, potwierdzenia',
                deadline: 'natychmiast'
            },
            {
                id: 5,
                icon: '⚖️',
                name: 'Opinia o prawie obcym (foreign law opinion)',
                required: false,
                aiGenerator: false,
                description: 'Od radcy prawnego w kraju obcego prawa',
                deadline: '1 miesiąc'
            },
            {
                id: 6,
                icon: '🌐',
                name: 'Tłumaczenia przysięgłe',
                required: true,
                aiGenerator: false,
                description: 'Wszystkie kluczowe dokumenty w języku postępowania',
                deadline: 'na bieżąco'
            },
            {
                id: 7,
                icon: '🔖',
                name: 'Apostille / legalizacja',
                required: false,
                aiGenerator: false,
                description: 'Dla dokumentów używanych za granicą (Konwencja Haska)',
                deadline: '2 tygodnie'
            },
            {
                id: 8,
                icon: '📜',
                name: 'Wyrok/orzeczenie do egzekucji',
                required: false,
                aiGenerator: false,
                description: 'Oryginał + tłumaczenie + potwierdzenie prawomocności',
                deadline: 'jeśli dotyczy'
            },
            {
                id: 9,
                icon: '🤖',
                name: 'Pełnomocnictwo procesowe (Power of Attorney)',
                required: true,
                aiGenerator: true,
                description: 'W języku obcym, notarialnie poświadczone + apostille',
                deadline: 'przed złożeniem pozwu'
            },
            {
                id: 10,
                icon: '🤖',
                name: 'Statement of Claim / Pozew',
                required: true,
                aiGenerator: true,
                description: 'W języku postępowania, zgodnie z właściwymi regułami',
                deadline: 'zależnie od sprawy'
            },
            {
                id: 11,
                icon: '🤖',
                name: 'Request for Arbitration',
                required: false,
                aiGenerator: true,
                description: 'Dla arbitrażu - zgodnie z regułami ICC/LCIA/SAC',
                deadline: 'przed wygaśnięciem terminów'
            },
            {
                id: 12,
                icon: '🤖',
                name: 'Wniosek o nadanie klauzuli wykonalności (exequatur)',
                required: false,
                aiGenerator: true,
                description: 'Dla egzekucji wyroków zagranicznych',
                deadline: 'po wyroku'
            },
            {
                id: 13,
                icon: '🤖',
                name: 'Pytanie prejudycjalne do TSUE',
                required: false,
                aiGenerator: true,
                description: 'Dla spraw z prawem UE (EUR/)',
                deadline: 'w trakcie procesu'
            },
            {
                id: 14,
                icon: '🤖',
                name: 'Skarga do Komisji Europejskiej',
                required: false,
                aiGenerator: true,
                description: 'Naruszenie prawa UE przez państwo członkowskie',
                deadline: 'bez terminu'
            },
            {
                id: 15,
                icon: '🤖',
                name: 'Wniosek o uchylenie wyroku arbitrażowego',
                required: false,
                aiGenerator: true,
                description: 'Do sądu w miejscu siedziby arbitrażu (Art. V Konwencji Nowojorskiej)',
                deadline: '30-90 dni od wyroku'
            },
            {
                id: 16,
                icon: '🤖',
                name: 'Witness Statement',
                required: false,
                aiGenerator: true,
                description: 'Zeznanie świadka w postępowaniu międzynarodowym',
                deadline: 'zgodnie z harmonogramem'
            },
            {
                id: 17,
                icon: '📊',
                name: 'Expert Report',
                required: false,
                aiGenerator: false,
                description: 'Opinia biegłego (techniczny/wycena/prawny)',
                deadline: 'zgodnie z harmonogramem'
            },
            {
                id: 18,
                icon: '🤖',
                name: 'Wykaz dowodów i wniosków',
                required: true,
                aiGenerator: true,
                description: 'Lista wszystkich dokumentów i świadków',
                deadline: 'przed hearing'
            }
        ]
    }
};

console.log('✅ International Part 3 załadowana (Sekcja 8, Procedura 8 faz, Dokumenty 18)!');
