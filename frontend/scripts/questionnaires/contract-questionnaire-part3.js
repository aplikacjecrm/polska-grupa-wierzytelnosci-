// ==========================================
// ANKIETA UMOWNA - CZĘŚĆ 3 (Procedura + Dokumenty)
// ==========================================

window.contractQuestionnairePart3 = {
    procedure: {
        title: 'PROCEDURA SPORU UMOWNEGO',
        description: 'Typowa ścieżka postępowania w sprawach umownych',
        phases: [
            {
                phase: 1,
                name: 'ANALIZA UMOWY I DOKUMENTACJI',
                duration: '3-5 dni',
                icon: '📋',
                description: 'Szczegółowa analiza umowy i ocena szans',
                tasks: [
                    { name: 'Przeanalizuj umowę i wszystkie aneksy' },
                    { name: 'Zbierz całą dokumentację (faktury, korespondencja)' },
                    { name: 'Oceń zasadność roszczeń klienta' },
                    { name: 'Zidentyfikuj postanowienia umowne kluczowe dla sprawy' }
                ],
                critical: true
            },
            {
                phase: 2,
                name: 'WEZWANIE DO ZAPŁATY / WYKONANIA',
                duration: '7-14 dni',
                icon: '📨',
                description: 'Przedsądowa próba rozwiązania sporu',
                tasks: [
                    { name: 'Sporządź wezwanie do zapłaty / wykonania umowy' },
                    { name: 'Wyznacz termin do dobrowolnego spełnienia świadczenia' },
                    { name: 'Wyślij wezwanie listem poleconym' },
                    { name: 'Poczekaj na odpowiedź strony przeciwnej' }
                ],
                critical: true
            },
            {
                phase: 3,
                name: 'PRZYGOTOWANIE POZWU',
                duration: '5-7 dni',
                icon: '📄',
                description: 'Sporządzenie pozwu do sądu',
                tasks: [
                    { name: 'Sporządź pozew z dokładnym opisem roszczenia' },
                    { name: 'Oblicz wartość przedmiotu sporu' },
                    { name: 'Załącz umowę i dowody (faktury, korespondencja)' },
                    { name: 'Opłać należne koszty sądowe' }
                ],
                critical: true
            },
            {
                phase: 4,
                name: 'ZŁOŻENIE POZWU W SĄDZIE',
                duration: '1 dzień',
                icon: '🏛️',
                description: 'Wniesienie sprawy do sądu',
                tasks: [
                    { name: 'Złóż pozew w sądzie właściwym (rejonowym lub okręgowym)' },
                    { name: 'Opłata: 5% wartości przedmiotu sporu (max 100 000 zł)' },
                    { name: 'Sąd wyznacza termin rozprawy (zwykle 3-6 miesięcy)' }
                ],
                critical: true
            },
            {
                phase: 5,
                name: 'POSTĘPOWANIE SĄDOWE',
                duration: '6-18 miesięcy',
                icon: '⚖️',
                description: 'Rozprawa i przedstawienie dowodów',
                tasks: [
                    { name: 'Uczestnictwo w rozprawach' },
                    { name: 'Przesłuchanie świadków' },
                    { name: 'Przedstawienie dowodów' },
                    { name: 'Odpowiedź na argumenty strony przeciwnej' }
                ],
                critical: false
            },
            {
                phase: 6,
                name: 'WYROK SĄDU',
                duration: '1-3 miesiące',
                icon: '📜',
                description: 'Orzeczenie sądu',
                tasks: [
                    { name: 'Sąd wydaje wyrok' },
                    { name: 'Otrzymanie uzasadnienia wyroku' },
                    { name: 'Ocena możliwości apelacji' },
                    { name: 'Ewentualne złożenie apelacji (14 dni)' }
                ],
                critical: false
            },
            {
                phase: 7,
                name: 'EGZEKUCJA WYROKU',
                duration: 'zależnie',
                icon: '💰',
                description: 'Wyegzekwowanie zasądzonej kwoty',
                tasks: [
                    { name: 'Uzyskaj klauzulę wykonalności' },
                    { name: 'Złóż wniosek do komornika' },
                    { name: 'Wskaż majątek dłużnika do zajęcia' },
                    { name: 'Monitoruj postępowanie egzekucyjne' }
                ],
                critical: false
            }
        ]
    },
    
    requiredDocuments: [
        {
            id: 'contract',
            name: 'Umowa (oryginał lub kopia)',
            category: 'contract',
            required: true,
            canGenerate: false,
            description: 'Umowa będąca podstawą roszczenia + ewentualne aneksy',
            howTo: [
                '1. Znajdź oryginalną umowę (podpisaną)',
                '2. Zbierz wszystkie aneksy i załączniki',
                '3. Zrób czytelne kopie/skany',
                '4. To podstawowy dowód w sądzie',
                '5. Dołącz do pozwu'
            ]
        },
        {
            id: 'invoices',
            name: 'Faktury / Rachunki',
            category: 'financial',
            required: false,
            canGenerate: false,
            description: 'Wszystkie faktury i rachunki związane z umową',
            howTo: [
                '1. Zbierz wszystkie faktury VAT',
                '2. Rachunki za wykonane usługi',
                '3. Sprawdź daty wymagalności',
                '4. Oblicz sumę do zapłaty',
                '5. Dołącz kopie do pozwu'
            ]
        },
        {
            id: 'payment_proof',
            name: 'Potwierdzenia przelewów',
            category: 'financial',
            required: false,
            canGenerate: false,
            description: 'Wyciągi bankowe potwierdzające płatności',
            howTo: [
                '1. Pobierz wyciągi z banku',
                '2. Zaznacz przelewy związane ze sprawą',
                '3. Dowód wykonania Twoich zobowiązań',
                '4. Jeśli płaciłeś - strona musi wykonać',
                '5. Dołącz jako dowód'
            ]
        },
        {
            id: 'correspondence',
            name: 'Korespondencja ze stroną',
            category: 'correspondence',
            required: false,
            canGenerate: false,
            description: 'E-maile, listy, SMS-y ze stroną umowy',
            howTo: [
                '1. Zbierz emaile (z pełnymi nagłówkami)',
                '2. SMS-y, wiadomości WhatsApp (screenshoty)',
                '3. Listy polecone (z potwierdzeniem)',
                '4. Każda korespondencja to dowód',
                '5. Dołącz w formie PDF'
            ]
        },
        {
            id: 'demand_letter',
            name: 'Wezwanie do zapłaty / wykonania',
            category: 'court',
            required: true,
            canGenerate: true,
            description: '🤖 AI GENERATOR - przedsądowe wezwanie',
            howTo: [
                '1. System wygeneruje wezwanie',
                '2. Określ: co ma zrobić strona (zapłacić/wykonać)',
                '3. Termin: 7-14 dni',
                '4. Wyślij listem poleconym',
                '5. Jeśli brak reakcji → pozew'
            ]
        },
        {
            id: 'lawsuit',
            name: 'Pozew do sądu',
            category: 'court',
            required: true,
            canGenerate: true,
            description: '🤖 AI GENERATOR - pozew o zapłatę / wykonanie umowy',
            howTo: [
                '1. System wygeneruje pełny pozew',
                '2. Roszczenie: kwota LUB wykonanie umowy',
                '3. Opłata: 5% wartości (max 100,000 zł)',
                '4. Załącz: umowę + faktury + korespondencję',
                '5. Złóż w Sądzie Okręgowym/Rejonowym'
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
                '2. Wypełnij dane radcy prawnego/adwokata',
                '3. Podpisz',
                '4. Jeśli sprawa powyżej 20,000 zł → pełnomocnik obowiązkowy',
                '5. Złóż w sądzie razem z pozwem'
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
                '1. System wygeneruje wykaz',
                '2. Lista wszystkich dokumentów',
                '3. Lista świadków (jeśli są)',
                '4. Każdy dowód opisany',
                '5. Dołącz do pozwu'
            ]
        },
        {
            id: 'witnesses_list',
            name: 'Lista świadków',
            category: 'evidence',
            required: false,
            canGenerate: false,
            description: 'Imiona, nazwiska, adresy świadków',
            howTo: [
                '1. Wymień świadków: imię, nazwisko, adres',
                '2. Co widzieli/słyszeli',
                '3. Np. podpisanie umowy, rozmowy',
                '4. Dołącz do wykazu dowodów',
                '5. Sąd wezwie ich na rozprawę'
            ]
        },
        {
            id: 'expert_opinion',
            name: 'Opinia biegłego (jeśli potrzebna)',
            category: 'evidence',
            required: false,
            canGenerate: false,
            description: 'Np. w sprawach budowlanych, technicznych',
            howTo: [
                '1. Jeśli sprawa techniczna/skomplikowana',
                '2. Możesz załączyć prywatną opinię',
                '3. LUB wnioskować o biegłego sądowego',
                '4. Koszt: 1000-5000 zł',
                '5. Zwrot od przegrywającego'
            ]
        }
    ]
};

console.log('✅ Contract Part 3 załadowana (Procedura + Dokumenty)!');
