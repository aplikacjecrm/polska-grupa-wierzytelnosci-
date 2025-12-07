// ==========================================
// ANKIETA MAJĄTKOWA - CZĘŚĆ 2 (Sekcje 5-7)
// ==========================================

console.log('🔵 START: Ładowanie property-questionnaire-part2.js');

window.propertyQuestionnairePart2 = {
    sections: [
        {
            id: 5,
            title: '',
            description: 'Wcześniejsze sprawy i decyzje dotyczące nieruchomości',
            questions: [
                {
                    id: 'previous_cases',
                    type: 'select',
                    label: 'Czy były wcześniejsze sprawy sądowe o tę nieruchomość?',
                    required: true,
                    options: [
                        { value: 'no', label: 'Nie, to pierwsza sprawa' },
                        { value: 'yes_won', label: 'Tak, wygraliśmy' },
                        { value: 'yes_lost', label: 'Tak, przegraliśmy' },
                        { value: 'yes_pending', label: 'Tak, sprawa w toku' }
                    ]
                },
                {
                    id: 'previous_case_details',
                    type: 'textarea',
                    label: 'Szczegóły poprzedniej sprawy',
                    placeholder: 'Sygnatura akt, sąd, wyrok, o co chodziło',
                    rows: 4,
                    showIf: { previous_cases: ['yes_won', 'yes_lost', 'yes_pending'] }
                },
                {
                    id: 'administrative_decisions',
                    type: 'checkbox',
                    label: 'Były decyzje administracyjne (pozwolenia budowlane, wywłaszczenia)'
                },
                {
                    id: 'admin_decision_details',
                    type: 'textarea',
                    label: 'Szczegóły decyzji administracyjnej',
                    placeholder: 'Jaki urząd, kiedy, czego dotyczyła',
                    rows: 3,
                    showIf: { administrative_decisions: true }
                },
                {
                    id: 'ownership_chain',
                    type: 'textarea',
                    label: 'Łańcuch własności (historia właścicieli)',
                    placeholder: 'Kto był właścicielem przed Tobą? Jak długo?',
                    rows: 4,
                    help: 'Ważne przy zasiedzeniu i sporach o własność'
                },
                {
                    id: 'title_defects',
                    type: 'select',
                    label: 'Czy wiesz o wadach prawnych?',
                    options: [
                        { value: 'no', label: 'Nie, tytuł prawny czysty' },
                        { value: 'uncertain', label: 'Nie jestem pewien' },
                        { value: 'yes', label: 'Tak, są problemy z tytułem' }
                    ]
                },
                {
                    id: 'title_defects_description',
                    type: 'textarea',
                    label: 'Opis wad prawnych',
                    placeholder: 'Jakie są problemy? Brakujące dokumenty, sprzeczności w KW?',
                    rows: 3,
                    showIf: { title_defects: 'yes' }
                }
            ]
        },
        {
            id: 6,
            title: '',
            description: 'Koszty, wyceny, korzyści ekonomiczne',
            questions: [
                {
                    id: 'property_valuation',
                    type: 'select',
                    label: 'Czy była przeprowadzona wycena rzeczoznawcy?',
                    required: true,
                    options: [
                        { value: 'yes', label: 'Tak, mam operát szacunkowy' },
                        { value: 'no', label: 'Nie, potrzebna wycena' },
                        { value: 'planned', label: 'Planujemy zlecić' }
                    ]
                },
                {
                    id: 'valuation_amount',
                    type: 'number',
                    label: 'Wartość z operatu (PLN)',
                    showIf: { property_valuation: 'yes' }
                },
                {
                    id: 'valuation_date',
                    type: 'date',
                    label: 'Data wyceny',
                    showIf: { property_valuation: 'yes' }
                },
                {
                    id: 'market_value_estimate',
                    type: 'number',
                    label: 'Szacunkowa wartość rynkowa (PLN)',
                    help: 'Ile jest warta nieruchomość według Ciebie?'
                },
                {
                    id: 'income_generating',
                    type: 'checkbox',
                    label: 'Nieruchomość przynosi dochody (wynajem, dzierżawa)'
                },
                {
                    id: 'monthly_income',
                    type: 'number',
                    label: 'Miesięczny dochód (PLN)',
                    showIf: { income_generating: true }
                },
                {
                    id: 'maintenance_costs',
                    type: 'number',
                    label: 'Koszty utrzymania miesięcznie (PLN)',
                    help: 'Czynsz, podatki, media, konserwacja'
                },
                {
                    id: 'improvements_made',
                    type: 'checkbox',
                    label: 'Wykonałem nakłady (remonty, ulepszenia)'
                },
                {
                    id: 'improvements_value',
                    type: 'number',
                    label: 'Wartość nakładów (PLN)',
                    showIf: { improvements_made: true },
                    help: 'Ile wydałeś na ulepszenia?'
                },
                {
                    id: 'improvements_description',
                    type: 'textarea',
                    label: 'Opis nakładów',
                    placeholder: 'Jakie remonty, ulepszenia? Masz faktury?',
                    rows: 3,
                    showIf: { improvements_made: true }
                },
                {
                    id: 'taxes_paid',
                    type: 'checkbox',
                    label: 'Płacę podatek od nieruchomości'
                },
                {
                    id: 'tax_receipts',
                    type: 'checkbox',
                    label: 'Posiadam dowody płatności podatków'
                }
            ]
        },
        {
            id: 7,
            title: '',
            description: 'Inne istotne okoliczności',
            questions: [
                {
                    id: 'preferred_outcome',
                    type: 'select',
                    label: 'Czego się domagasz?',
                    required: true,
                    options: [
                        { value: 'full_ownership', label: 'Uznanie pełnej własności' },
                        { value: 'delivery', label: 'Wydanie nieruchomości/rzeczy' },
                        { value: 'easement_recognition', label: 'Ustanowienie służebności' },
                        { value: 'partition', label: 'Podział współwłasności' },
                        { value: 'compensation', label: 'Odszkodowanie' },
                        { value: 'possession_protection', label: 'Ochrona posiadania' },
                        { value: 'other', label: 'Inne rozwiązanie' }
                    ]
                },
                {
                    id: 'willing_to_settle',
                    type: 'select',
                    label: 'Czy jesteś otwarty na ugodę?',
                    required: true,
                    options: [
                        { value: 'yes', label: 'Tak, preferuję polubowne rozwiązanie' },
                        { value: 'depends', label: 'Zależy od warunków' },
                        { value: 'no', label: 'Nie, chcę rozstrzygnięcia sądowego' }
                    ]
                },
                {
                    id: 'settlement_terms',
                    type: 'textarea',
                    label: 'Warunki ugody (jeśli jesteś otwarty)',
                    placeholder: 'Na jakich warunkach byłbyś skłonny się zgodzić?',
                    rows: 4,
                    showIf: { willing_to_settle: ['yes', 'depends'] }
                },
                {
                    id: 'witnesses_available',
                    type: 'checkbox',
                    label: 'Mam świadków, którzy potwierdzą moje racje'
                },
                {
                    id: 'witnesses_list',
                    type: 'textarea',
                    label: 'Lista świadków',
                    placeholder: 'Imię, nazwisko, co mogą zeznać',
                    rows: 3,
                    showIf: { witnesses_available: true }
                },
                {
                    id: 'expert_needed',
                    type: 'select',
                    label: 'Czy potrzebna opinia biegłego?',
                    options: [
                        { value: 'no', label: 'Nie, mamy wystarczające dowody' },
                        { value: 'surveyor', label: 'Tak, geodeta (granice, pomiary)' },
                        { value: 'appraiser', label: 'Tak, rzeczoznawca majątkowy (wycena)' },
                        { value: 'construction', label: 'Tak, budowlany (stan techniczny)' },
                        { value: 'other', label: 'Inny biegły' }
                    ]
                },
                {
                    id: 'urgent_matters',
                    type: 'textarea',
                    label: 'Pilne sprawy do załatwienia',
                    placeholder: 'Np. zabezpieczenie roszczenia, eksmisja, sprzedaż',
                    rows: 4
                },
                {
                    id: 'additional_notes',
                    type: 'textarea',
                    label: 'Dodatkowe uwagi',
                    placeholder: 'Wszystko co może być istotne dla sprawy',
                    rows: 4
                },
                {
                    id: 'deadline_pressure',
                    type: 'checkbox',
                    label: 'Sprawa jest pilna (termin egzekucji, zagrożenie utraty)'
                },
                {
                    id: 'deadline_date',
                    type: 'date',
                    label: 'Krytyczny termin',
                    showIf: { deadline_pressure: true }
                }
            ]
        }
    ]
};

console.log('✅ Property Part 2 załadowana (Sekcje 5-7)!');
