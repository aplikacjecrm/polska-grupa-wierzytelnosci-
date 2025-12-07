// ==========================================
// ANKIETA MAJĄTKOWA - CZĘŚĆ 3 (Procedura + Dokumenty)
// ==========================================

console.log('🔵 START: Ładowanie property-questionnaire-part3.js');

window.propertyQuestionnairePart3 = {
    procedure: {
        title: 'PROCEDURA POSTĘPOWANIA MAJĄTKOWEGO',
        description: 'Zależnie od rodzaju roszczenia',
        phases: [
            {
                phase: 1,
                name: 'PRZYGOTOWANIE SPRAWY',
                duration: '1-2 tygodnie',
                icon: '📋',
                description: 'Zebranie dokumentów i analiza sytuacji prawnej',
                tasks: [
                    { name: 'Wypis z księgi wieczystej (aktualny!)', critical: true },
                    { name: 'Mapa geodezyjna lub plan sytuacyjny' },
                    { name: 'Dokumenty nabycia (umowa, akt notarialny, spadek)' },
                    { name: 'Analiza stanu prawnego przez prawnika', critical: true }
                ]
            },
            {
                phase: 2,
                name: 'WEZWANIE PRZEDSĄDOWE',
                duration: '7-14 dni',
                icon: '📨',
                description: 'Próba polubownego załatwienia (zalecana)',
                tasks: [
                    { name: 'Sporządzenie wezwania do zapłaty/wydania', description: 'Przez prawnika' },
                    { name: 'Wysłanie listem poleconym/pocztą kurierską', critical: true },
                    { name: 'Czekanie na odpowiedź (min 7 dni)', help: 'Może uniknąć procesu!' },
                    { name: 'Negocjacje (jeśli odpowiedź pozytywna)' }
                ]
            },
            {
                phase: 3,
                name: 'WNIOSEK O ZABEZPIECZENIE',
                duration: '3-7 dni',
                icon: '🔒',
                description: 'Jeśli istnieje zagrożenie (opcjonalne)',
                tasks: [
                    { name: 'Ocena potrzeby zabezpieczenia', help: 'Np. gdy przeciwnik może sprzedać' },
                    { name: 'Wniosek o wpis ostrzeżenia do KW', critical: true, help: 'Blokuje zbycie' },
                    { name: 'Wniosek o zakaz zbywania', help: 'Sąd wydaje postanowienie' },
                    { name: 'Postanowienie sądu w ciągu 1-3 dni' }
                ]
            },
            {
                phase: 4,
                name: 'POZEW DO SĄDU',
                duration: '1-2 tygodnie',
                icon: '📄',
                description: 'Złożenie pozwu lub wniosku',
                tasks: [
                    { name: 'Sporządzenie pozwu/wniosku', description: 'Przez prawnika', critical: true },
                    { name: 'Zebranie wszystkich dowodów' },
                    { name: 'Opłata sądowa', description: '5% wartości przedmiotu sporu', critical: true, help: 'Min. 30 zł, max. 200,000 zł' },
                    { name: 'Złożenie w sądzie', critical: true }
                ]
            },
            {
                phase: 5,
                name: 'POSTĘPOWANIE DOWODOWE',
                duration: '6-18 miesięcy',
                icon: '🔍',
                description: 'Sąd bada sprawę i przeprowadza dowody',
                tasks: [
                    { name: 'Doręczenie pozwu stronie przeciwnej' },
                    { name: 'Odpowiedź na pozew (30 dni)', help: 'Stanowisko przeciwnika' },
                    { name: 'Rozprawy (kilka posiedzeń)', critical: true },
                    { name: 'Zeznania świadków' },
                    { name: 'Opinia biegłego (geodeta, rzeczoznawca)', help: '2-4 miesiące' }
                ]
            },
            {
                phase: 6,
                name: 'WYROK I APELACJA',
                duration: '1-3 miesiące',
                icon: '⚖️',
                description: 'Orzeczenie sądu I instancji',
                tasks: [
                    { name: 'Wyrok sądu I instancji', critical: true },
                    { name: 'Ocena możliwości apelacji (14 dni)', help: 'Czy zaskarżyć?' },
                    { name: 'Sporządzenie apelacji (opcjonalnie)' },
                    { name: 'Postępowanie apelacyjne (6-12 miesięcy)' }
                ]
            },
            {
                phase: 7,
                name: 'EGZEKUCJA / WPIS DO KW',
                duration: '1-6 miesięcy',
                icon: '✅',
                description: 'Realizacja wyroku',
                tasks: [
                    { name: 'Uprawomocnienie wyroku', critical: true },
                    { name: 'Wpis do księgi wieczystej', help: 'Jeśli własność/służebność', critical: true },
                    { name: 'Egzekucja komornicza', help: 'Jeśli wydanie nieruchomości' },
                    { name: 'Protokół przejęcia nieruchomości' }
                ]
            }
        ]
    },

    requiredDocuments: [
        {
            id: 'land_register',
            name: 'Wypis z księgi wieczystej (KW)',
            category: 'property',
            required: true,
            description: 'Aktualny! Nie starszy niż 3 miesiące - pobierz z ekw.ms.gov.pl',
            howTo: [
                '1. Wejdź na ekw.ms.gov.pl',
                '2. Wpisz numer księgi wieczystej lub adres',
                '3. Pobierz pełny odpis (19 zł)',
                '4. KONIECZNIE aktualny (max 3 miesiące)',
                '5. Pokaże: właściciela, hipoteki, służebności'
            ]
        },
        {
            id: 'cadastral_map',
            name: 'Mapa geodezyjna / Plan sytuacyjny',
            category: 'property',
            required: true,
            description: 'Z oznaczeniem granic działki - od geodety lub z urzędu',
            howTo: [
                '1. Zamów u geodety (500-2000 zł)',
                '2. LUB pobierz z geoportal.gov.pl (bezpłatnie)',
                '3. Mapa powinna pokazywać granice działki',
                '4. Przy sporach granicznych - geodeta obowiązkowy',
                '5. Dołącz do pozwu'
            ]
        },
        {
            id: 'title_documents',
            name: 'Dokumenty nabycia własności',
            category: 'ownership',
            required: true,
            description: 'Umowa kupna-sprzedaży, akt notarialny, akt poświadczenia dziedziczenia',
            howTo: [
                '1. Znajdź akt notarialny kupna-sprzedaży',
                '2. LUB postanowienie o stwierdzeniu nabycia spadku',
                '3. LUB akt darowizny',
                '4. Dowód że jesteś właścicielem',
                '5. Kopia notarialna lub zwykła'
            ]
        },
        {
            id: 'claim_letter',
            name: 'Pozew/Wniosek do sądu',
            category: 'court',
            required: true,
            canGenerate: true,
            description: '🤖 AI wygeneruje pozew - windykacja, własność, służebność, zniesienie współwłasności',
            howTo: [
                '1. System wygeneruje pełny pozew/wniosek',
                '2. Zależnie od typu: własność, służebność, podział',
                '3. Zawiera: dane stron, nieruchomość, żądanie',
                '4. Opłata: 5% wartości lub stała',
                '5. Złóż w Sądzie Rejonowym - Wydział Cywilny'
            ]
        },
        {
            id: 'preliminary_notice',
            name: 'Wezwanie przedsądowe',
            category: 'preliminary',
            required: false,
            canGenerate: true,
            description: '🤖 AI wygeneruje wezwanie - do wydania, do zapłaty, do ustanowienia służebności',
            howTo: [
                '1. Przed pozwem - spróbuj polubownie',
                '2. System wygeneruje wezwanie',
                '3. Wyślij listem poleconym',
                '4. Daj 14 dni na reakcję',
                '5. Jeśli brak reakcji → pozew do sądu'
            ]
        },
        {
            id: 'valuation_report',
            name: 'Operát szacunkowy (wycena)',
            category: 'financial',
            required: false,
            description: 'Od rzeczoznawcy majątkowego - potrzebne przy sporach o wartość',
            howTo: [
                '1. Zamów u rzeczoznawcy majątkowego',
                '2. Koszt: 1000-5000 zł',
                '3. Czas: 2-4 tygodnie',
                '4. Potrzebne przy: podziale, spłacie współwłaściciela',
                '5. Sąd może też zlecić biegłego'
            ]
        },
        {
            id: 'survey_report',
            name: 'Opinia geodezyjna',
            category: 'technical',
            required: false,
            description: 'Przy sporach granicznych - precyzyjne pomiary',
            howTo: [
                '1. Geodeta zrobi pomiary granicy',
                '2. Koszt: 1500-3000 zł',
                '3. Porówna z mapą geodezyjną',
                '4. Potrzebne przy sporach o przesunięte ogrodzenie',
                '5. Sąd często wymaga'
            ]
        },
        {
            id: 'possession_proof',
            name: 'Dowody posiadania',
            category: 'evidence',
            required: false,
            description: 'Rachunki za media, podatki, świadectwa sąsiadów - przy zasiedzeniu',
            howTo: [
                '1. Zbierz rachunki za prąd, wodę, gaz (20/30 lat)',
                '2. Podatek od nieruchomości (dowody płatności)',
                '3. Zeznania sąsiadów (pisemne)',
                '4. Zdjęcia z różnych lat',
                '5. Potrzebne do udowodnienia zasiedzenia'
            ]
        },
        {
            id: 'improvements_invoices',
            name: 'Faktury za nakłady',
            category: 'financial',
            required: false,
            description: 'Za remonty, ulepszenia - przy dochodzeniu zwrotu nakładów',
            howTo: [
                '1. Zbierz faktury za remonty, ulepszenia',
                '2. Potrzebne gdy chcesz zwrotu nakładów',
                '3. Zdjęcia przed i po',
                '4. Oblicz wartość ulepszeń',
                '5. Sąd może przyznać zwrot'
            ]
        },
        {
            id: 'easement_agreement',
            name: 'Umowa o ustanowienie służebności',
            category: 'easement',
            required: false,
            canGenerate: true,
            description: '🤖 AI może przygotować projekt umowy - przejazd, przechód, infrastruktura',
            howTo: [
                '1. System przygotuje projekt umowy',
                '2. Typ: służebność przejazdu, przechodu, infrastruktury',
                '3. Określ trasę, zakres, wynagrodzenie',
                '4. Podpisy obu stron',
                '5. Akt notarialny + wpis do księgi wieczystej'
            ]
        },
        {
            id: 'partition_agreement',
            name: 'Ugoda o zniesienie współwłasności',
            category: 'partition',
            required: false,
            canGenerate: true,
            description: '🤖 AI może przygotować projekt - jak podzielić nieruchomość lub spłaty',
            howTo: [
                '1. System zaproponuje podział',
                '2. Fizyczny podział (nowe działki) LUB spłata',
                '3. Wycena nieruchomości',
                '4. Zgoda wszystkich współwłaścicieli',
                '5. Akt notarialny + geodeta (przy podziale)'
            ]
        },
        {
            id: 'security_motion',
            name: 'Wniosek o zabezpieczenie',
            category: 'court',
            required: false,
            canGenerate: true,
            description: '🤖 AI wygeneruje - wpis ostrzeżenia do KW, zakaz zbywania',
            howTo: [
                '1. PILNE: złóż przed pozwem lub razem!',
                '2. System wygeneruje wniosek',
                '3. Sąd może wpisać ostrzeżenie do księgi wieczystej',
                '4. Blokuje sprzedaż nieruchomości',
                '5. Decyzja w 1-3 dni'
            ]
        },
        {
            id: 'power_of_attorney',
            name: 'Pełnomocnictwo procesowe',
            category: 'court',
            required: false,
            canGenerate: true,
            description: '🤖 AI wygeneruje - jeśli reprezentuje prawnik',
            howTo: [
                '1. System wygeneruje pełnomocnictwo',
                '2. Wypełnij dane radcy prawnego/adwokata',
                '3. Podpisz',
                '4. W sprawach nieruchomościowych: zalecany prawnik',
                '5. Złóż w sądzie razem z pozwem'
            ]
        },
        {
            id: 'court_fee_proof',
            name: 'Dowód opłaty sądowej',
            category: 'court',
            required: true,
            description: '5% wartości przedmiotu sporu (min. 30 zł, max. 200,000 zł)',
            howTo: [
                '1. Oblicz wartość nieruchomości',
                '2. Opłata: 5% wartości',
                '3. Min. 30 zł, max. 200,000 zł',
                '4. Przelew na konto Sądu Rejonowego',
                '5. Dołącz potwierdzenie'
            ]
        },
        {
            id: 'utility_bills',
            name: 'Rachunki za media',
            category: 'evidence',
            required: false,
            description: 'Dowód korzystania z nieruchomości - przy zasiedzeniu',
            howTo: [
                '1. Zbierz rachunki za prąd, wodę, gaz',
                '2. Im starsze, tym lepiej (20/30 lat)',
                '3. Dowód że korzystałeś z nieruchomości',
                '4. Potrzebne do zasiedzenia',
                '5. Dołącz jako załączniki'
            ]
        },
        {
            id: 'photos',
            name: 'Zdjęcia nieruchomości',
            category: 'evidence',
            required: false,
            description: 'Stan faktyczny - ogrodzenia, budynki, drogi dojazdowe',
            howTo: [
                '1. Zrób zdjęcia z różnych kątów',
                '2. Ogrodzenie, budynki, drogi, granice',
                '3. Stan faktyczny vs mapa',
                '4. Zdjęcia z datą (metadata)',
                '5. Dowód wizualny dla sądu'
            ]
        }
    ]
};

console.log('✅ Property Part 3 załadowana (Procedura + Dokumenty)!');
