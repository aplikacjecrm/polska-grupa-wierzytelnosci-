// ==========================================
// ANKIETA BUDOWLANA - CZĘŚĆ 3 (Sekcja 8 + Procedura + Dokumenty)
// ==========================================

window.buildingQuestionnairePart3 = {
    sections: [
        {
            id: 8,
            title: '',
            description: 'Inne ważne okoliczności',
            questions: [
                {
                    id: 'illegal_construction',
                    type: 'select',
                    label: 'Czy istnieje samowola budowlana?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'suspected', label: 'Podejrzenie samowoli' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'illegal_details',
                    type: 'textarea',
                    label: 'Opis samowoli budowlanej',
                    placeholder: 'Co zostało wybudowane bez pozwolenia, kiedy...',
                    rows: 4,
                    showIf: { illegal_construction: ['yes', 'suspected'] }
                },
                {
                    id: 'conservation_area',
                    type: 'select',
                    label: 'Czy nieruchomość w strefie ochrony konserwatorskiej?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'environmental_restrictions',
                    type: 'select',
                    label: 'Czy są ograniczenia środowiskowe?',
                    options: [
                        { value: 'natura2000', label: 'Obszar Natura 2000' },
                        { value: 'park', label: 'Park krajobrazowy / Park narodowy' },
                        { value: 'water', label: 'Ochrona wód' },
                        { value: 'forest', label: 'Obszar leśny' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'utilities',
                    type: 'textarea',
                    label: 'Przyłącza i media',
                    placeholder: 'Prąd, woda, gaz, kanalizacja - status uzgodnień...',
                    rows: 3
                },
                {
                    id: 'witnesses',
                    type: 'select',
                    label: 'Czy są świadkowie?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'witnesses_list',
                    type: 'textarea',
                    label: 'Lista świadków',
                    placeholder: 'Imię, nazwisko, kontakt\nCo mogą zeznać...',
                    rows: 4,
                    showIf: { witnesses: 'yes' }
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
        title: 'PROCEDURA W SPRAWACH BUDOWLANYCH',
        description: 'Typowa ścieżka postępowania administracyjnego i sądowego',
        phases: [
            {
                phase: 1,
                name: 'PRZYGOTOWANIE WNIOSKU',
                duration: '7-14 dni',
                icon: '📋',
                description: 'Zebranie dokumentacji i sporządzenie wniosku',
                tasks: [
                    { name: 'Przygotuj projekt budowlany (jeśli wymagany)', critical: true },
                    { name: 'Zbierz dokumenty działki (wyrysy, odpisy KW)' },
                    { name: 'Uzyskaj uzgodnienia (gestorzy sieci, konserwator, RDOŚ)' },
                    { name: 'Sporządź wniosek o pozwolenie na budowę' },
                    { name: 'Opłata skarbowa: 378 zł (pozwolenie), 17 zł (zgłoszenie)' }
                ],
                critical: true
            },
            {
                phase: 2,
                name: 'ZŁOŻENIE WNIOSKU W STAROSTWIE',
                duration: '1 dzień',
                icon: '🏢',
                description: 'Wniesienie dokumentów do organu',
                tasks: [
                    { name: 'Złóż wniosek w Starostwie Powiatowym' },
                    { name: 'Otrzymasz potwierdzenie przyjęcia (data wpływu!)' },
                    { name: 'Organ ma 65 dni na wydanie decyzji', critical: true }
                ],
                critical: true
            },
            {
                phase: 3,
                name: 'POSTĘPOWANIE WYJAŚNIAJĄCE',
                duration: '30-60 dni',
                icon: '🔍',
                description: 'Weryfikacja przez organ administracji',
                tasks: [
                    { name: 'Organ bada kompletność dokumentów' },
                    { name: 'Możliwe wezwanie do uzupełnień (7 dni)' },
                    { name: 'Czas postępowania przedłuża się o 30 dni' },
                    { name: 'Organ może zażądać opinii biegłego' }
                ],
                critical: false
            },
            {
                phase: 4,
                name: 'DECYZJA ORGANU',
                duration: '1-7 dni',
                icon: '📜',
                description: 'Wydanie pozwolenia lub odmowa',
                tasks: [
                    { name: 'Pozwolenie wydane' },
                    { name: 'LUB Odmowa wydania pozwolenia', critical: true },
                    { name: 'Otrzymasz decyzję pocztą (data doręczenia!)' },
                    { name: 'Termin na odwołanie: 14 dni od doręczenia', critical: true }
                ],
                critical: true
            },
            {
                phase: 5,
                name: 'ODWOŁANIE DO ORGANU II INSTANCJI',
                duration: '60 dni',
                icon: '⚖️',
                description: 'Samorządowe Kolegium Odwoławcze / Wojewoda',
                tasks: [
                    { name: 'Złóż odwołanie (przez organ I instancji)', critical: true },
                    { name: 'Organ II instancji rozpatruje sprawę' },
                    { name: 'Może: utrzymać decyzję, zmienić lub uchylić' },
                    { name: 'Termin: 60 dni (możliwe przedłużenie)' }
                ],
                critical: false
            },
            {
                phase: 6,
                name: 'SKARGA DO WSA',
                duration: '6-18 miesięcy',
                icon: '🏛️',
                description: 'Wojewódzki Sąd Administracyjny',
                tasks: [
                    { name: 'Sporządź skargę do WSA (30 dni od doręczenia decyzji)', critical: true },
                    { name: 'Opłata: 200 zł' },
                    { name: 'WSA bada zgodność decyzji z prawem' },
                    { name: 'Wyrok: oddalenie skargi LUB uchylenie decyzji' }
                ],
                critical: false
            },
            {
                phase: 7,
                name: 'SKARGA KASACYJNA DO NSA',
                duration: '12-24 miesiące',
                icon: '⚖️',
                description: 'Naczelny Sąd Administracyjny',
                tasks: [
                    { name: 'Skarga kasacyjna do NSA (30 dni od doręczenia wyroku WSA)' },
                    { name: 'Wymaga sporządzenia przez adwokata/radcę prawnego', critical: true },
                    { name: 'NSA weryfikuje wykładnię prawa przez WSA' },
                    { name: 'Wyrok końcowy i prawomocny' }
                ],
                critical: false
            }
        ]
    },
    
    requiredDocuments: [
        {
            id: 'building_project',
            name: 'Projekt budowlany',
            category: 'technical',
            required: true,
            canGenerate: false,
            description: 'Sporządzony przez uprawnionego projektanta',
            howTo: [
                '1. Zamów u architekta/projektanta z uprawnieniami',
                '2. Koszt: 5000-30000 zł (zależy od skali)',
                '3. Musi zawierać: rzuty, przekroje, detale',
                '4. Projekt + opinie techniczne',
                '5. Architekt składa projekt w urzędzie'
            ]
        },
        {
            id: 'land_title',
            name: 'Wypis z rejestru gruntów',
            category: 'property',
            required: true,
            canGenerate: false,
            description: 'Z Starostwa - aktualny (max 3 miesiące)',
            howTo: [
                '1. Idź do Starostwa Powiatowego',
                '2. Wydział Geodezji i Kartografii',
                '3. Koszt: ~30 zł',
                '4. Gotowe od ręki lub w 3 dni',
                '5. Musi być aktualny (max 3 miesiące)'
            ]
        },
        {
            id: 'land_map',
            name: 'Wyrys z mapy ewidencyjnej',
            category: 'property',
            required: true,
            canGenerate: false,
            description: 'Z Starostwa - aktualny (max 3 miesiące)',
            howTo: [
                '1. To samo Starostwo co wypis',
                '2. Mapa z zaznaczoną działką',
                '3. Koszt: ~30 zł',
                '4. Razem z wypisem taniej',
                '5. Aktualny (max 3 miesiące)'
            ]
        },
        {
            id: 'land_register_copy',
            name: 'Odpis księgi wieczystej',
            category: 'property',
            required: true,
            canGenerate: false,
            description: 'Z Sądu Rejonowego - Wydział Ksiąg Wieczystych',
            howTo: [
                '1. Wejdź na ekw.ms.gov.pl',
                '2. Wpisz numer księgi wieczystej',
                '3. Pobierz pełny odpis (19 zł)',
                '4. Dowód własności działki',
                '5. Musi być bez hipoteki/obciążeń'
            ]
        },
        {
            id: 'development_conditions',
            name: 'Warunki zabudowy / Wypis z planu zagospodarowania',
            category: 'administrative',
            required: true,
            canGenerate: false,
            description: 'Z Urzędu Miasta/Gminy',
            howTo: [
                '1. Sprawdź czy jest plan zagospodarowania',
                '2. Jeśli TAK → pobierz wypis z planu (Urząd)',
                '3. Jeśli NIE → wnioskuj o warunki zabudowy',
                '4. Warunki: 2-3 miesiące, ~500 zł',
                '5. Określa co można budować'
            ]
        },
        {
            id: 'utilities_agreements',
            name: 'Uzgodnienia z gestorami sieci',
            category: 'technical',
            required: true,
            canGenerate: false,
            description: 'Prąd, gaz, woda, kanalizacja, telekom',
            howTo: [
                '1. Lista gestorów: Enea, PGNiG, Aquanet, Orange',
                '2. Wyślij projekt do każdego',
                '3. Uzgodnienie: 1-2 miesiące',
                '4. Bezpłatne lub symboliczna opłata',
                '5. Potrzebne do pozwolenia na budowę'
            ]
        },
        {
            id: 'conservation_agreement',
            name: 'Uzgodnienie konserwatora zabytków',
            category: 'administrative',
            required: false,
            canGenerate: false,
            description: 'Jeśli strefa ochrony konserwatorskiej',
            howTo: [
                '1. TYLKO jeśli budynek/teren zabytkowy',
                '2. Wniosek do Wojewódzkiego Konserwatora Zabytków',
                '3. Koszt: bezpłatnie',
                '4. Czas: 1-3 miesiące',
                '5. Może wymusić zmiany w projekcie'
            ]
        },
        {
            id: 'environmental_decision',
            name: 'Decyzja środowiskowa',
            category: 'administrative',
            required: false,
            canGenerate: false,
            description: 'Jeśli wymagana ocena oddziaływania na środowisko',
            howTo: [
                '1. TYLKO dla dużych inwestycji',
                '2. Wniosek o wydanie decyzji środowiskowej',
                '3. RDOS lub Wojewoda rozpatruje',
                '4. Czas: 2-6 miesięcy',
                '5. Koszt: 500-5000 zł'
            ]
        },
        {
            id: 'building_permit_application',
            name: 'Wniosek o pozwolenie na budowę',
            category: 'administrative',
            required: true,
            canGenerate: true,
            description: '🤖 AI GENERATOR - kompletny wniosek',
            howTo: [
                '1. System wygeneruje wniosek',
                '2. Załącz: projekt + uzgodnienia + tytuł prawny',
                '3. Opłata skarbowa: 538 zł (dom do 300m2)',
                '4. Złóż w Starostwie/Urzędzie Miasta',
                '5. Decyzja: 65 dni (może przedłużyć)'
            ]
        },
        {
            id: 'appeal_to_sko',
            name: 'Odwołanie do SKO/Wojewody',
            category: 'court',
            required: false,
            canGenerate: true,
            description: '🤖 AI GENERATOR - odwołanie od decyzji I instancji',
            howTo: [
                '1. Jeśli odmowa pozwolenia',
                '2. System wygeneruje odwołanie',
                '3. Złóż przez organ I instancji (14 dni)',
                '4. Bezpłatne',
                '5. Decyzja SKO: 60 dni'
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
                '1. Po oddaleniu odwołania przez SKO',
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
            description: '🤖 AI GENERATOR - skarga do sądu najwyższego',
            howTo: [
                '1. OSTATNIA INSTANCJA',
                '2. Tylko przez adwokata/radcę prawnego',
                '3. Opłata: 200 zł',
                '4. Złóż w NSA (30 dni)',
                '5. Wyrok: 12-24 miesiące (końcowy)'
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
                '2. Wypełnij dane radcy prawnego',
                '3. Podpisz',
                '4. W sprawach administracyjnych zalecane',
                '5. Złóż razem z wnioskiem/skargą'
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
                '2. Wymień: dokumenty, świadkowie, opinie',
                '3. Każdy dowód musi być opisany',
                '4. Dołącz do odwołania/skargi',
                '5. Możesz dopełnić później'
            ]
        }
    ]
};

console.log('✅ Building Part 3 załadowana (Sekcja 8 + Procedura + Dokumenty)!');
