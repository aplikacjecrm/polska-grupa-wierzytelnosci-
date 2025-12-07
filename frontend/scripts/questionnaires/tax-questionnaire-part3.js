// ==========================================
// ANKIETA PODATKOWA - CZĘŚĆ 3 (Sekcja 8 + Procedura + Dokumenty)
// ==========================================

window.taxQuestionnairePart3 = {
    sections: [
        {
            id: 8,
            title: '',
            description: 'Inne ważne okoliczności',
            questions: [
                {
                    id: 'tax_optimization',
                    type: 'select',
                    label: 'Czy dotyczy optymalizacji podatkowej?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'optimization_details',
                    type: 'textarea',
                    label: 'Opis struktury/mechanizmu',
                    placeholder: 'Schemat optymalizacyjny, zastosowane rozwiązania...',
                    rows: 4,
                    showIf: { tax_optimization: 'yes' }
                },
                {
                    id: 'related_parties',
                    type: 'select',
                    label: 'Czy są podmioty powiązane?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'transfer_pricing_doc',
                    type: 'select',
                    label: 'Czy posiadasz dokumentację cen transferowych?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' },
                        { value: 'not_required', label: 'Nie dotyczy' }
                    ],
                    showIf: { related_parties: 'yes' }
                },
                {
                    id: 'previous_cases',
                    type: 'select',
                    label: 'Czy były wcześniejsze sprawy podatkowe?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'previous_cases_details',
                    type: 'textarea',
                    label: 'Opis poprzednich spraw',
                    placeholder: 'Jakie były sprawy, wyniki, daty...',
                    rows: 4,
                    showIf: { previous_cases: 'yes' }
                },
                {
                    id: 'expert_needed',
                    type: 'select',
                    label: 'Czy potrzebna opinia biegłego?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'obtained', label: 'Już posiadam' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'expert_type',
                    type: 'select',
                    label: 'Rodzaj opinii',
                    options: [
                        { value: 'tax', label: 'Doradca podatkowy' },
                        { value: 'accountant', label: 'Biegły rewident' },
                        { value: 'valuation', label: 'Wycena rzeczoznawcy' },
                        { value: 'it', label: 'Ekspert IT / Systemy' },
                        { value: 'other', label: 'Inna' }
                    ],
                    showIf: { expert_needed: ['yes', 'obtained'] }
                },
                {
                    id: 'additional_info',
                    type: 'textarea',
                    label: 'Inne ważne informacje',
                    placeholder: 'Wszystko co może mieć znaczenie dla sprawy...',
                    rows: 5
                }
            ]
        }
    ],
    
    procedure: {
        title: '',
        description: 'Typowa ścieżka postępowania podatkowego i sądowego',
        phases: [
            {
                phase: 1,
                name: 'WERYFIKACJA / KONTROLA',
                duration: '30-90 dni',
                icon: '🔍',
                description: 'Organ podatkowy bada prawidłowość rozliczeń',
                tasks: [
                    { name: 'Organ wszczyna postępowanie kontrolne', critical: false },
                    { name: 'Przygotuj dokumentację dla kontroli' },
                    { name: 'Uczestnictwo w czynnościach kontrolnych' },
                    { name: 'Otrzymanie protokołu kontroli' },
                    { name: 'Złożenie zastrzeżeń do protokołu (14 dni)', critical: true }
                ],
                critical: false
            },
            {
                phase: 2,
                name: 'DECYZJA WYMIAROWA',
                duration: '7-30 dni',
                icon: '📜',
                description: 'Wydanie decyzji określającej zobowiązanie',
                tasks: [
                    { name: 'Organ wydaje decyzję wymiarową' },
                    { name: 'Otrzymanie decyzji pocztą', critical: true },
                    { name: 'Analiza decyzji i podstawy prawnej' },
                    { name: 'Sprawdź termin na odwołanie (14 dni!)', critical: true },
                    { name: 'Opłata: brak opłaty od odwołania' }
                ],
                critical: true
            },
            {
                phase: 3,
                name: 'ODWOŁANIE DO ORGANU II INSTANCJI',
                duration: '60 dni (możliwe przedłużenie)',
                icon: '⚖️',
                description: 'Dyrektor KIS / Samorządowe Kolegium Odwoławcze',
                tasks: [
                    { name: 'Sporządź odwołanie (14 dni od doręczenia)', critical: true },
                    { name: 'Złóż odwołanie przez organ I instancji' },
                    { name: 'Możliwe: wniosek o wstrzymanie wykonania decyzji' },
                    { name: 'Organ II instancji rozpatruje odwołanie' },
                    { name: 'Decyzja: utrzymanie, zmiana lub uchylenie' }
                ],
                critical: true
            },
            {
                phase: 4,
                name: 'SKARGA DO WSA',
                duration: '6-18 miesięcy',
                icon: '🏛️',
                description: 'Wojewódzki Sąd Administracyjny',
                tasks: [
                    { name: 'Sporządź skargę do WSA (30 dni)', critical: true },
                    { name: 'Opłata: 200 zł (zwolnienia dla osób fizycznych)' },
                    { name: 'WSA bada zgodność decyzji z prawem' },
                    { name: 'Możliwe: rozprawa lub rozstrzygnięcie na posiedzeniu' },
                    { name: 'Wyrok: oddalenie LUB uchylenie decyzji' }
                ],
                critical: false
            },
            {
                phase: 5,
                name: 'SKARGA KASACYJNA DO NSA',
                duration: '12-24 miesiące',
                icon: '⚖️',
                description: 'Naczelny Sąd Administracyjny',
                tasks: [
                    { name: 'Skarga kasacyjna do NSA (30 dni)', critical: true },
                    { name: 'Wymaga sporządzenia przez adwokata/radcę', critical: true },
                    { name: 'NSA weryfikuje wykładnię prawa' },
                    { name: 'Wyrok NSA jest prawomocny i ostateczny' }
                ],
                critical: false
            },
            {
                phase: 6,
                name: 'EGZEKUCJA ADMINISTRACYJNA',
                duration: 'Równolegle do odwołań',
                icon: '💰',
                description: 'Przymusowe ściągnięcie należności',
                tasks: [
                    { name: 'Upomnienie (7 dni na zapłatę)' },
                    { name: 'Tytuł wykonawczy' },
                    { name: 'Zajęcie rachunku bankowego' },
                    { name: 'Zajęcie wynagrodzenia (do 50%)' },
                    { name: 'Zajęcie nieruchomości / Hipoteka przymusowa' },
                    { name: 'UWAGA: Odwołanie NIE wstrzymuje egzekucji!', critical: true }
                ],
                critical: true
            },
            {
                phase: 7,
                name: 'WNIOSEK O WSTRZYMANIE WYKONANIA',
                duration: '14-30 dni',
                icon: '⏸️',
                description: 'Zabezpieczenie przed egzekucją',
                tasks: [
                    { name: 'Złóż wniosek o wstrzymanie wykonania decyzji' },
                    { name: 'Uzasadnij: nieodwracalne skutki LUB oczywista bezzasadność' },
                    { name: 'Organ/sąd rozpatruje wniosek' },
                    { name: 'Jeśli uwzględniono - egzekucja wstrzymana do rozstrzygnięcia' }
                ],
                critical: false
            }
        ]
    },
    
    requiredDocuments: [
        {
            id: 'tax_returns',
            name: 'Deklaracje podatkowe',
            category: 'tax',
            required: true,
            canGenerate: false,
            description: 'Za sporny okres rozliczeniowy',
            howTo: [
                '1. Zbierz deklaracje: PIT, CIT, VAT',
                '2. Za wszystkie miesiące/lata sporne',
                '3. Pobierz kopie z e-Deklaracji',
                '4. Sprawdź daty złożenia',
                '5. Dołącz do odwołania'
            ]
        },
        {
            id: 'invoices',
            name: 'Faktury VAT / Faktury kosztowe',
            category: 'accounting',
            required: true,
            canGenerate: false,
            description: 'Dokumentujące transakcje',
            howTo: [
                '1. Zbierz wszystkie faktury z okresu',
                '2. Faktury sprzedaży i zakupu',
                '3. Sprawdź poprawność formalną',
                '4. Posortuj chronologicznie',
                '5. Przygotuj zestawienie'
            ]
        },
        {
            id: 'accounting_books',
            name: 'Księgi rachunkowe / KPiR',
            category: 'accounting',
            required: true,
            canGenerate: false,
            description: 'Ewidencja księgowa za okres',
            howTo: [
                '1. Wydrukuj księgi za sporny okres',
                '2. Księga Przychodów i Rozchodów (KPiR)',
                '3. LUB pełna księgowość (bilans, RZiS)',
                '4. Zatwierdzenie przez księgową',
                '5. Dołącz jako załącznik'
            ]
        },
        {
            id: 'bank_statements',
            name: 'Wyciągi bankowe',
            category: 'accounting',
            required: true,
            canGenerate: false,
            description: 'Potwierdzenie transakcji',
            howTo: [
                '1. Pobierz wyciągi za cały okres',
                '2. Z rachunku firmowego',
                '3. Zaznacz kluczowe transakcje',
                '4. Dowód rzeczywistego przepływu środków',
                '5. Format PDF z banku'
            ]
        },
        {
            id: 'contracts',
            name: 'Umowy / Dokumenty źródłowe',
            category: 'documents',
            required: true,
            canGenerate: false,
            description: 'Umowy sprzedaży, usług, współpracy',
            howTo: [
                '1. Zbierz umowy związane ze sporem',
                '2. Umowy z kontrahentami',
                '3. Dokumenty dostawy (WZ, CMR)',
                '4. Protokoły odbioru',
                '5. Dowód rzeczywistości transakcji'
            ]
        },
        {
            id: 'audit_protocol',
            name: 'Protokół kontroli',
            category: 'control',
            required: false,
            canGenerate: false,
            description: 'Jeśli była kontrola',
            howTo: [
                '1. Protokół z kontroli US/ZUS',
                '2. Twoje uwagi do protokołu',
                '3. Wszystkie załączniki',
                '4. Korespondencja z kontrolą',
                '5. To podstawa decyzji urzędu'
            ]
        },
        {
            id: 'tax_decision',
            name: 'Decyzja wymiarowa',
            category: 'administrative',
            required: true,
            canGenerate: false,
            description: 'Decyzja organu podatkowego',
            howTo: [
                '1. Decyzja US/ZUS określająca podatek',
                '2. Sprawdź datę doręczenia',
                '3. Masz 14 dni na odwołanie!',
                '4. Przeczytaj uzasadnienie',
                '5. To dokument który zaskarżasz'
            ]
        },
        {
            id: 'interpretation',
            name: 'Interpretacja indywidualna',
            category: 'administrative',
            required: false,
            canGenerate: false,
            description: 'Jeśli została wydana',
            howTo: [
                '1. Jeśli wnioskowałeś o interpretację',
                '2. Odpowiedź KIS/DIS',
                '3. Jeśli postępowałeś zgodnie - ochrona',
                '4. US nie może cię ukarąć',
                '5. Dołącz jako dowód obrony'
            ]
        },
        {
            id: 'appeal',
            name: 'Odwołanie od decyzji',
            category: 'court',
            required: false,
            canGenerate: true,
            description: '🤖 AI GENERATOR - odwołanie do organu II instancji',
            howTo: [
                '1. System wygeneruje odwołanie',
                '2. Złóż przez urząd I instancji (14 dni)',
                '3. Bezpłatne',
                '4. Organ II instancji: Dyrektor KIS/ZUS',
                '5. Decyzja: 60 dni'
            ]
        },
        {
            id: 'wsa_complaint',
            name: 'Skarga do WSA',
            category: 'court',
            required: false,
            canGenerate: true,
            description: '🤖 AI GENERATOR - skarga do sądu administracyjnego',
            howTo: [
                '1. Po oddaleniu odwołania',
                '2. System wygeneruje skargę',
                '3. Opłata: 200 zł',
                '4. Złóż w WSA (30 dni)',
                '5. Wyrok: 6-18 miesięcy'
            ]
        },
        {
            id: 'nsa_cassation',
            name: 'Skarga kasacyjna do NSA',
            category: 'court',
            required: false,
            canGenerate: true,
            description: '🤖 AI GENERATOR - skarga kasacyjna',
            howTo: [
                '1. OSTATNIA INSTANCJA',
                '2. Tylko przez doradcę podatkowego/prawnika',
                '3. Opłata: 200 zł',
                '4. Złóż w NSA (30 dni)',
                '5. Wyrok: 12-24 miesiące (końcowy)'
            ]
        },
        {
            id: 'suspension_motion',
            name: 'Wniosek o wstrzymanie wykonania',
            category: 'court',
            required: false,
            canGenerate: true,
            description: '🤖 AI GENERATOR - zabezpieczenie przed egzekucją',
            howTo: [
                '1. PILNE: egzekucja działa natychmiast!',
                '2. System wygeneruje wniosek',
                '3. Uzasadnienie: nieodwracalne skutki',
                '4. Złóż razem z odwołaniem/skargą',
                '5. Decyzja: 7-14 dni'
            ]
        },
        {
            id: 'power_of_attorney',
            name: 'Pełnomocnictwo procesowe',
            category: 'court',
            required: true,
            canGenerate: true,
            description: '🤖 AI GENERATOR - pełnomocnictwo dla pełnomocnika',
            howTo: [
                '1. System wygeneruje pełnomocnictwo',
                '2. Dla doradcy podatkowego/radcy prawnego',
                '3. Podpisz i przybij pieczątkę',
                '4. W sprawach podatkowych: ZALECANY specjalista',
                '5. Złóż razem z odwołaniem'
            ]
        },
        {
            id: 'evidence_list',
            name: 'Wykaz dowodów',
            category: 'court',
            required: true,
            canGenerate: true,
            description: '🤖 AI GENERATOR - lista dokumentów i świadków',
            howTo: [
                '1. System wygeneruje listę',
                '2. Wszystkie dokumenty księgowe',
                '3. Interpretacje, decyzje',
                '4. Opinie ekspertów',
                '5. Dołącz do odwołania/skargi'
            ]
        },
        {
            id: 'installment_request',
            name: 'Wniosek o rozłożenie na raty',
            category: 'administrative',
            required: false,
            canGenerate: true,
            description: '🤖 AI GENERATOR - rozłożenie zobowiązania na raty',
            howTo: [
                '1. Jeśli nie stać cię od razu',
                '2. System wygeneruje wniosek',
                '3. Uzasadnienie: sytuacja finansowa',
                '4. Zaproponuj wysokość rat',
                '5. Złóż w US - PRZED egzekucją!'
            ]
        }
    ]
};

console.log('✅ Tax Part 3 załadowana (Sekcja 8 + Procedura + Dokumenty)!');
