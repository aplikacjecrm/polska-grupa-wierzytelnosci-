// ==========================================
// ANKIETA ZAGOSPODAROWANIA PRZESTRZENNEGO - CZĘŚĆ 3 (Sekcja 8 + Procedura + Dokumenty)
// ==========================================

window.zoningQuestionnairePart3 = {
    sections: [
        {
            id: 8,
            title: '',
            description: 'Inne ważne okoliczności',
            questions: [
                {
                    id: 'investment_plans',
                    type: 'select',
                    label: 'Czy masz plany inwestycyjne?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'investment_description',
                    type: 'textarea',
                    label: 'Opis planowanej inwestycji',
                    placeholder: 'Budowa domu, rozbudowa, działalność gospodarcza...',
                    rows: 4,
                    showIf: { investment_plans: 'yes' }
                },
                {
                    id: 'investment_blocked',
                    type: 'select',
                    label: 'Czy plan/decyzja blokuje inwestycję?',
                    options: [
                        { value: 'yes_completely', label: 'Tak, całkowicie' },
                        { value: 'yes_partially', label: 'Tak, częściowo (wymaga zmian)' },
                        { value: 'no', label: 'Nie' }
                    ],
                    showIf: { investment_plans: 'yes' }
                },
                {
                    id: 'environmental_issues',
                    type: 'select',
                    label: 'Czy są uwarunkowania środowiskowe?',
                    options: [
                        { value: 'natura2000', label: 'Obszar Natura 2000' },
                        { value: 'park', label: 'Park krajobrazowy / narodowy' },
                        { value: 'monuments', label: 'Ochrona zabytków / konserwator' },
                        { value: 'water', label: 'Strefa ochronna ujęcia wody' },
                        { value: 'flood', label: 'Obszar zagrożenia powodziowego' },
                        { value: 'noise', label: 'Ochrona przed hałasem' },
                        { value: 'none', label: 'Brak' }
                    ]
                },
                {
                    id: 'infrastructure_issues',
                    type: 'select',
                    label: 'Czy są problemy z infrastrukturą?',
                    options: [
                        { value: 'no_road', label: 'Brak drogi dojazdowej' },
                        { value: 'no_water', label: 'Brak wodociągu' },
                        { value: 'no_sewage', label: 'Brak kanalizacji' },
                        { value: 'no_electricity', label: 'Brak energii elektrycznej' },
                        { value: 'no_gas', label: 'Brak gazu' },
                        { value: 'none', label: 'Wszystko dostępne' }
                    ]
                },
                {
                    id: 'previous_plans',
                    type: 'select',
                    label: 'Czy wcześniej obowiązywał inny plan?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie / nie wiem' }
                    ]
                },
                {
                    id: 'previous_plan_details',
                    type: 'textarea',
                    label: 'Szczegóły poprzedniego planu',
                    placeholder: 'Przeznaczenie, data obowiązywania, różnice z obecnym...',
                    rows: 4,
                    showIf: { previous_plans: 'yes' }
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
        title: 'PROCEDURA W SPRAWACH ZAGOSPODAROWANIA PRZESTRZENNEGO',
        description: 'Typowa ścieżka postępowania planistycznego i sądowego',
        phases: [
            {
                phase: 1,
                name: 'PRZYGOTOWANIE PROJEKTU MPZP',
                duration: '3-6 miesięcy',
                icon: '📐',
                description: 'Gmina przygotowuje projekt planu miejscowego',
                tasks: [
                    { name: 'Rada Gminy podejmuje uchwałę o przystąpieniu do MPZP' },
                    { name: 'Opracowanie projektu przez urbanistów' },
                    { name: 'Uzgodnienia z gestorami infrastruktury' },
                    { name: 'Uzyskanie opinii organów (konserwator, sanepid, itp.)' },
                    { name: 'Strategiczna ocena oddziaływania na środowisko (jeśli wymagana)' }
                ],
                critical: false
            },
            {
                phase: 2,
                name: 'WYŁOŻENIE PROJEKTU DO WGLĄDU',
                duration: '21 dni (min.)',
                icon: '👁️',
                description: 'Publiczny dostęp do projektu planu',
                tasks: [
                    { name: 'Obwieszczenie o wyłożeniu projektu (min. 7 dni wcześniej)' },
                    { name: 'Projekt dostępny w urzędzie i online (21 dni)', critical: true },
                    { name: 'Dyskusja publiczna (termin podany w obwieszczeniu)' },
                    { name: 'Składanie uwag przez mieszkańców', critical: true },
                    { name: 'UWAGA: 14 dni od zakończenia wyłożenia na uwagi!', critical: true }
                ],
                critical: true
            },
            {
                phase: 3,
                name: 'ROZPATRZENIE UWAG',
                duration: '2-4 miesiące',
                icon: '⚖️',
                description: 'Wójt/Burmistrz rozpatruje złożone uwagi',
                tasks: [
                    { name: 'Analiza wszystkich złożonych uwag' },
                    { name: 'Wójt może uwzględnić lub odrzucić uwagi' },
                    { name: 'Jeśli uwzględniono → projekt zostaje zmieniony' },
                    { name: 'Jeśli odrzucono → Rada Gminy rozpatrza na sesji' },
                    { name: 'Możliwe ponowne wyłożenie (jeśli duże zmiany)' }
                ],
                critical: false
            },
            {
                phase: 4,
                name: 'UCHWALENIE MPZP',
                duration: '1-2 miesiące',
                icon: '📜',
                description: 'Rada Gminy uchwala plan miejscowy',
                tasks: [
                    { name: 'Rada Gminy uchwala MPZP (sesja publiczna)' },
                    { name: 'Przekazanie do Wojewody i organów nadzoru' },
                    { name: 'Publikacja w Dzienniku Urzędowym Województwa' },
                    { name: 'Ogłoszenie na tablicy ogłoszeń gminy' },
                    { name: 'Plan wchodzi w życie po 14 dniach od ogłoszenia' }
                ],
                critical: false
            },
            {
                phase: 5,
                name: 'SKARGA DO WSA',
                duration: '6-18 miesięcy',
                icon: '🏛️',
                description: 'Zaskarżenie uchwały do sądu administracyjnego',
                tasks: [
                    { name: 'Skarga w ciągu 30 dni od ogłoszenia', critical: true },
                    { name: 'Opłata: 200 zł (zwolnienia dla osób fizycznych)' },
                    { name: 'WSA bada zgodność uchwały z prawem' },
                    { name: 'Możliwa rozprawa lub rozstrzygnięcie na posiedzeniu' },
                    { name: 'Wyrok: oddalenie LUB stwierdzenie nieważności (całości lub części)' }
                ],
                critical: true
            },
            {
                phase: 6,
                name: 'SKARGA KASACYJNA DO NSA',
                duration: '12-24 miesiące',
                icon: '⚖️',
                description: 'Ostatnia instancja - Naczelny Sąd Administracyjny',
                tasks: [
                    { name: 'Skarga kasacyjna do NSA (30 dni)', critical: true },
                    { name: 'Wymaga sporządzenia przez adwokata/radcę', critical: true },
                    { name: 'NSA weryfikuje wykładnię prawa' },
                    { name: 'Wyrok NSA jest prawomocny i ostateczny' }
                ],
                critical: false
            },
            {
                phase: 7,
                name: 'ODSZKODOWANIE ZA SZKODĘ',
                duration: '12-36 miesięcy',
                icon: '💰',
                description: 'Dochodzenie odszkodowania od gminy',
                tasks: [
                    { name: 'Wycena rzeczoznawcy majątkowego (operat szacunkowy)' },
                    { name: 'Wniosek o odszkodowanie do Wójta/Burmistrza' },
                    { name: 'Podstawa: Art. 36 ustawy o planowaniu' },
                    { name: 'Jeśli odmowa → odwołanie do SKO' },
                    { name: 'Jeśli nadal odmowa → powództwo do sądu cywilnego' },
                    { name: 'UWAGA: Termin 5 lat od wejścia w życie planu!', critical: true }
                ],
                critical: false
            }
        ]
    },
    
    requiredDocuments: [
        {
            id: 'land_register',
            name: 'Odpis księgi wieczystej',
            category: 'property',
            required: true,
            canGenerate: false,
            description: 'Aktualny odpis z Sądu Rejonowego (nie starszy niż 3 miesiące)'
        },
        {
            id: 'cadastral_map',
            name: 'Wypis i wyrys z ewidencji gruntów',
            category: 'property',
            required: true,
            canGenerate: false,
            description: 'Ze Starostwa Powiatowego'
        },
        {
            id: 'mpzp_text',
            name: 'Uchwała w sprawie MPZP',
            category: 'planning',
            required: false,
            canGenerate: false,
            description: 'Tekst uchwały Rady Gminy + część graficzna'
        },
        {
            id: 'wz_decision',
            name: 'Decyzja o Warunkach Zabudowy',
            category: 'planning',
            required: false,
            canGenerate: false,
            description: 'Jeśli została wydana'
        },
        {
            id: 'study',
            name: 'Studium uwarunkowań i kierunków',
            category: 'planning',
            required: false,
            canGenerate: false,
            description: 'Obowiązujące dla gminy'
        },
        {
            id: 'valuation',
            name: 'Operat szacunkowy (wycena)',
            category: 'financial',
            required: false,
            canGenerate: false,
            description: 'Od uprawnionego rzeczoznawcy majątkowego'
        },
        {
            id: 'photos',
            name: 'Dokumentacja fotograficzna',
            category: 'evidence',
            required: false,
            canGenerate: false,
            description: 'Zdjęcia działki i otoczenia'
        },
        {
            id: 'comments_submitted',
            name: 'Złożone uwagi do projektu',
            category: 'procedural',
            required: false,
            canGenerate: false,
            description: 'Jeśli składano uwagi w procedurze'
        },
        {
            id: 'complaint_wsa',
            name: 'Skarga do WSA',
            category: 'court',
            required: false,
            canGenerate: true,
            description: '🤖 AI GENERATOR - skarga na uchwałę o MPZP',
            howTo: [
                '1. System wygeneruje skargę do WSA',
                '2. Opłata: 200 zł',
                '3. Termin: 30 dni od doręczenia uchwały',
                '4. Złóż w Wojewódzkim Sądzie Administracyjnym',
                '5. Wyrok: 6-18 miesięcy'
            ]
        },
        {
            id: 'complaint_nsa',
            name: 'Skarga kasacyjna do NSA',
            category: 'court',
            required: false,
            canGenerate: true,
            description: '🤖 AI GENERATOR - skarga kasacyjna',
            howTo: [
                '1. OSTATNIA INSTANCJA',
                '2. Tylko przez radcę prawnego/adwokata',
                '3. Opłata: 200 zł',
                '4. Termin: 30 dni od doręczenia wyroku WSA',
                '5. Wyrok: 12-24 miesiące (końcowy)'
            ]
        },
        {
            id: 'compensation_claim',
            name: 'Wniosek o odszkodowanie',
            category: 'financial',
            required: false,
            canGenerate: true,
            description: '🤖 AI GENERATOR - wniosek do Wójta/Burmistrza',
            howTo: [
                '1. System wygeneruje wniosek o odszkodowanie',
                '2. Za zmniejszenie wartości nieruchomości',
                '3. Termin: 5 lat od wejścia w życie MPZP',
                '4. Złóż w Urzędzie Gminy',
                '5. Decyzja: 30-60 dni'
            ]
        },
        {
            id: 'appeal_wz',
            name: 'Odwołanie od decyzji WZ',
            category: 'administrative',
            required: false,
            canGenerate: true,
            description: '🤖 AI GENERATOR - odwołanie do SKO/Wojewody',
            howTo: [
                '1. System wygeneruje odwołanie',
                '2. Termin: 14 dni od doręczenia decyzji',
                '3. Złóż przez organ I instancji',
                '4. Bezpłatne',
                '5. Decyzja: 60 dni'
            ]
        },
        {
            id: 'comments_template',
            name: 'Uwagi do projektu MPZP',
            category: 'procedural',
            required: false,
            canGenerate: true,
            description: '🤖 AI GENERATOR - szablon uwag mieszkańca'
        },
        {
            id: 'power_of_attorney',
            name: 'Pełnomocnictwo procesowe',
            category: 'court',
            required: true,
            canGenerate: true,
            description: '🤖 AI GENERATOR - pełnomocnictwo dla pełnomocnika'
        },
        {
            id: 'evidence_list',
            name: 'Wykaz dowodów',
            category: 'court',
            required: true,
            canGenerate: true,
            description: '🤖 AI GENERATOR - lista dokumentów i świadków'
        }
    ]
};

console.log('✅ Zoning Part 3 załadowana (Sekcja 8 + Procedura + Dokumenty)!');
