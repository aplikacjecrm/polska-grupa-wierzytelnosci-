// ==========================================
// ANKIETA RODZINNA - CZĘŚĆ 1 (Sekcje 1-5)
// ==========================================

window.familyQuestionnairePart1 = {
    sections: [
        {
            id: 1,
            title: '',
            description: 'Jaka jest główna kwestia rodzinna?',
            questions: [
                {
                    id: 'case_main_type',
                    type: 'select',
                    label: 'Główny typ sprawy',
                    required: true,
                    options: [
                        { value: 'divorce', label: 'Rozwód' },
                        { value: 'separation', label: 'Separacja' },
                        { value: 'alimony', label: 'Alimenty' },
                        { value: 'custody', label: 'Opieka nad dziećmi / Władza rodzicielska' },
                        { value: 'contact', label: 'Kontakty z dzieckiem' },
                        { value: 'parental_rights', label: 'Pozbawienie władzy rodzicielskiej' },
                        { value: 'paternity', label: 'Ustalenie ojcostwa' },
                        { value: 'adoption', label: 'Adopcja / Przysposobienie' },
                        { value: 'guardianship', label: 'Kuratela / Opieka prawna' },
                        { value: 'other', label: 'Inna sprawa rodzinna' }
                    ]
                },
                {
                    id: 'case_urgency',
                    type: 'select',
                    label: 'Pilność sprawy',
                    required: true,
                    options: [
                        { value: 'critical', label: '🔴 Bardzo pilne (przemoc, zagrożenie dziecka)' },
                        { value: 'high', label: '🟠 Pilne (brak alimentów, konflikt o opiekę)' },
                        { value: 'medium', label: '🟡 Standardowe (rozwód, kontakty)' },
                        { value: 'low', label: '🟢 Niski priorytet' }
                    ]
                },
                {
                    id: 'violence_threat',
                    type: 'select',
                    label: 'Czy występuje przemoc domowa lub zagrożenie?',
                    required: true,
                    options: [
                        { value: 'yes_immediate', label: 'Tak, bezpośrednie zagrożenie (wymagane natychmiastowe działanie)' },
                        { value: 'yes_past', label: 'Tak, była przemoc w przeszłości' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'violence_description',
                    type: 'textarea',
                    label: 'Opis sytuacji przemocy (jeśli dotyczy)',
                    placeholder: 'Opisz sytuację, daty, świadków...',
                    rows: 5,
                    showIf: { violence_threat: ['yes_immediate', 'yes_past'] }
                }
            ]
        },
        {
            id: 2,
            title: '',
            description: 'Informacje o małżeństwie lub związku',
            questions: [
                {
                    id: 'marriage_date',
                    type: 'date',
                    label: 'Data zawarcia małżeństwa',
                    required: true,
                    showIf: { case_main_type: ['divorce', 'separation', 'alimony'] }
                },
                {
                    id: 'separation_date',
                    type: 'date',
                    label: 'Data faktycznego rozstania / separacji',
                    placeholder: 'Od kiedy nie mieszkacie razem?'
                },
                {
                    id: 'marriage_regime',
                    type: 'select',
                    label: 'Ustrój majątkowy małżeński',
                    options: [
                        { value: 'community', label: 'Wspólność ustawowa (domyślny)' },
                        { value: 'separation', label: 'Rozdzielność majątkowa (intercyza)' },
                        { value: 'limited_community', label: 'Wspólność ograniczona' }
                    ],
                    showIf: { case_main_type: ['divorce', 'separation'] }
                },
                {
                    id: 'prenup_exists',
                    type: 'select',
                    label: 'Czy była zawarta intercyza (umowa majątkowa)?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ],
                    showIf: { case_main_type: ['divorce', 'separation'] }
                },
                {
                    id: 'fault_divorce',
                    type: 'select',
                    label: 'Czy rozwód z winy?',
                    options: [
                        { value: 'mutual', label: 'Rozwód za porozumieniem stron' },
                        { value: 'fault_spouse', label: 'Rozwód z winy współmałżonka' },
                        { value: 'no_fault', label: 'Rozwód bez orzekania o winie' }
                    ],
                    showIf: { case_main_type: 'divorce' }
                },
                {
                    id: 'fault_reason',
                    type: 'textarea',
                    label: 'Powody winy współmałżonka',
                    placeholder: 'Zdrada, przemoc, alkoholizm, zaniedbywanie rodziny...',
                    rows: 4,
                    showIf: { fault_divorce: 'fault_spouse' }
                }
            ]
        },
        {
            id: 3,
            title: '',
            description: 'Informacje o dzieciach z małżeństwa/związku',
            questions: [
                {
                    id: 'children_count',
                    type: 'number',
                    label: 'Liczba wspólnych dzieci',
                    required: true,
                    placeholder: '0'
                },
                {
                    id: 'children_minors_count',
                    type: 'number',
                    label: 'Liczba dzieci niepełnoletnich',
                    placeholder: '0',
                    showIf: { children_count_gt: 0 }
                },
                {
                    id: 'child_1_name',
                    type: 'text',
                    label: 'Imię i nazwisko dziecka 1',
                    placeholder: 'Jan Kowalski',
                    showIf: { children_count_gte: 1 }
                },
                {
                    id: 'child_1_birthdate',
                    type: 'date',
                    label: 'Data urodzenia dziecka 1',
                    showIf: { children_count_gte: 1 }
                },
                {
                    id: 'child_1_pesel',
                    type: 'text',
                    label: 'PESEL dziecka 1',
                    placeholder: '01234567890',
                    showIf: { children_count_gte: 1 }
                },
                {
                    id: 'child_2_name',
                    type: 'text',
                    label: 'Imię i nazwisko dziecka 2',
                    placeholder: 'Anna Kowalska',
                    showIf: { children_count_gte: 2 }
                },
                {
                    id: 'child_2_birthdate',
                    type: 'date',
                    label: 'Data urodzenia dziecka 2',
                    showIf: { children_count_gte: 2 }
                },
                {
                    id: 'child_2_pesel',
                    type: 'text',
                    label: 'PESEL dziecka 2',
                    placeholder: '01234567890',
                    showIf: { children_count_gte: 2 }
                },
                {
                    id: 'child_3_name',
                    type: 'text',
                    label: 'Imię i nazwisko dziecka 3',
                    showIf: { children_count_gte: 3 }
                },
                {
                    id: 'child_3_birthdate',
                    type: 'date',
                    label: 'Data urodzenia dziecka 3',
                    showIf: { children_count_gte: 3 }
                },
                {
                    id: 'children_more_info',
                    type: 'textarea',
                    label: 'Dodatkowe informacje o dzieciach (więcej niż 3)',
                    placeholder: 'Lista wszystkich dzieci z datami urodzenia...',
                    rows: 4,
                    showIf: { children_count_gte: 4 }
                }
            ]
        },
        {
            id: 4,
            title: 'Władza Rodzicielska i Opieka',
            description: 'Kto ma sprawować opiekę nad dziećmi?',
            questions: [
                {
                    id: 'custody_type',
                    type: 'select',
                    label: 'Preferowany model opieki',
                    required: true,
                    options: [
                        { value: 'joint', label: 'Opieka naprzemian / Wspólna władza rodzicielska' },
                        { value: 'mother', label: 'Opieka u matki' },
                        { value: 'father', label: 'Opieka u ojca' },
                        { value: 'shared_mother', label: 'Wspólna władza, miejsce zamieszkania u matki' },
                        { value: 'shared_father', label: 'Wspólna władza, miejsce zamieszkania u ojca' },
                        { value: 'revoke', label: 'Pozbawienie władzy rodzicielskiej' }
                    ],
                    showIf: { children_count_gt: 0 }
                },
                {
                    id: 'custody_reason',
                    type: 'textarea',
                    label: 'Uzasadnienie preferowanego modelu opieki',
                    placeholder: 'Dlaczego taki model będzie najlepszy dla dziecka...',
                    rows: 5,
                    required: true,
                    showIf: { children_count_gt: 0 }
                },
                {
                    id: 'parental_fitness_mother',
                    type: 'textarea',
                    label: 'Ocena zdolności wychowawczych matki',
                    placeholder: 'Warunki mieszkaniowe, praca, zaangażowanie w wychowanie...',
                    rows: 4,
                    showIf: { children_count_gt: 0 }
                },
                {
                    id: 'parental_fitness_father',
                    type: 'textarea',
                    label: 'Ocena zdolności wychowawczych ojca',
                    placeholder: 'Warunki mieszkaniowe, praca, zaangażowanie w wychowanie...',
                    rows: 4,
                    showIf: { children_count_gt: 0 }
                },
                {
                    id: 'child_preference',
                    type: 'select',
                    label: 'Czy dziecko wyraziło preferencje?',
                    options: [
                        { value: 'yes_mother', label: 'Tak, chce mieszkać z matką' },
                        { value: 'yes_father', label: 'Tak, chce mieszkać z ojcem' },
                        { value: 'no', label: 'Nie wyraziło preferencji' },
                        { value: 'too_young', label: 'Dziecko zbyt małe' }
                    ],
                    showIf: { children_count_gt: 0 }
                }
            ]
        },
        {
            id: 5,
            title: '',
            description: 'Ustalenie kontaktów rodzica z dzieckiem',
            questions: [
                {
                    id: 'contact_proposal',
                    type: 'select',
                    label: 'Proponowany zakres kontaktów',
                    options: [
                        { value: 'weekends', label: 'Co drugi weekend + połowa wakacji' },
                        { value: 'weekly', label: 'Raz w tygodniu + weekend' },
                        { value: 'supervised', label: 'Kontakty pod nadzorem (ośrodek, kurator)' },
                        { value: 'limited', label: 'Kontakty ograniczone' },
                        { value: 'none', label: 'Brak kontaktów (w interesie dziecka)' }
                    ],
                    showIf: { children_count_gt: 0 }
                },
                {
                    id: 'contact_schedule',
                    type: 'textarea',
                    label: 'Szczegółowy harmonogram kontaktów',
                    placeholder: 'Przykład:\n- Co drugi weekend piątek 18:00 - niedziela 18:00\n- Środa 16:00-19:00\n- Święta: naprzemiennie\n- Wakacje: po 14 dni',
                    rows: 6,
                    showIf: { children_count_gt: 0 }
                },
                {
                    id: 'contact_obstacles',
                    type: 'textarea',
                    label: 'Przeszkody w kontaktach (jeśli są)',
                    placeholder: 'Przemoc, alkoholizm, zaniedbanie, niepłacenie alimentów...',
                    rows: 4,
                    showIf: { children_count_gt: 0 }
                },
                {
                    id: 'supervised_reason',
                    type: 'textarea',
                    label: 'Powód kontaktów pod nadzorem',
                    placeholder: 'Zagrożenie dla dziecka, przemoc, brak umiejętności opiekuńczych...',
                    rows: 4,
                    required: true,
                    showIf: { contact_proposal: 'supervised' }
                }
            ]
        }
    ]
};

console.log('✅ Family Part 1 załadowana (Sekcje 1-5)!');
