// ==========================================
// ANKIETA RODZINNA - CZĘŚĆ 3 (Sekcja 10 + Procedura + Dokumenty)
// ==========================================

window.familyQuestionnairePart3 = {
    sections: [
        {
            id: 10,
            title: '',
            description: 'Inne ważne okoliczności sprawy',
            questions: [
                {
                    id: 'mediation_attempted',
                    type: 'select',
                    label: 'Czy była próba mediacji?',
                    options: [
                        { value: 'yes_success', label: 'Tak, zakończona sukcesem (porozumienie)' },
                        { value: 'yes_failed', label: 'Tak, ale nieudana' },
                        { value: 'no', label: 'Nie było mediacji' }
                    ]
                },
                {
                    id: 'agreement_exists',
                    type: 'select',
                    label: 'Czy istnieje ugoda/porozumienie stron?',
                    options: [
                        { value: 'full', label: 'Tak, pełne porozumienie (rozwód za zgodą)' },
                        { value: 'partial', label: 'Częściowe (zgoda w niektórych kwestiach)' },
                        { value: 'no', label: 'Nie ma porozumienia (spór)' }
                    ]
                },
                {
                    id: 'agreement_details',
                    type: 'textarea',
                    label: 'Szczegóły porozumienia',
                    placeholder: 'Co zostało uzgodnione, co pozostaje sporne...',
                    rows: 5,
                    showIf: { agreement_exists: ['full', 'partial'] }
                },
                {
                    id: 'witnesses_exist',
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
                    placeholder: 'Imię, nazwisko, adres, telefon\nCo może zeznać (przemoc, zaniedbanie, warunki życia...)',
                    rows: 5,
                    showIf: { witnesses_exist: 'yes' }
                },
                {
                    id: 'expert_opinion_needed',
                    type: 'select',
                    label: 'Czy potrzebna opinia biegłego?',
                    options: [
                        { value: 'psychological', label: 'Tak, opinia psychologiczna (dziecko/rodzic)' },
                        { value: 'psychiatric', label: 'Tak, opinia psychiatryczna' },
                        { value: 'property_valuation', label: 'Tak, wycena majątku' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'additional_circumstances',
                    type: 'textarea',
                    label: 'Inne ważne okoliczności',
                    placeholder: 'Wszystko co może mieć znaczenie dla sprawy: zdrowie, uzależnienia, przeprowadzki, nowy partner...',
                    rows: 6
                }
            ]
        }
    ],
    
    procedure: {
        title: '',
        description: 'Typowa ścieżka postępowania przed sądem rodzinnym',
        phases: [
            {
                phase: 1,
                name: 'PRZYGOTOWANIE DOKUMENTACJI',
                duration: '5-10 dni',
                icon: '📋',
                description: 'Zebranie wszystkich dokumentów i dowodów',
                tasks: [
                    { name: 'Zbierz dokumenty osobowe (akty, odpisy)' },
                    { name: 'Zebrane dokumenty finansowe (PIT, zaświadczenia o dochodach)' },
                    { name: 'Dokumenty dotyczące dzieci (akt urodzenia, świadectwa)' },
                    { name: 'Dokumenty majątku (akty własności, umowy kredytów)' },
                    { name: 'Zebrane dowody (SMS, e-maile, zdjęcia, świadkowie)' }
                ],
                critical: true
            },
            {
                phase: 2,
                name: 'ZŁOŻENIE POZWU / WNIOSKU',
                duration: '3-5 dni',
                icon: '📄',
                description: 'Sporządzenie i złożenie pisma w sądzie',
                tasks: [
                    { name: 'Sporządź pozew o rozwód / wniosek o alimenty', critical: true },
                    { name: 'Dołącz wszystkie załączniki' },
                    { name: 'Opłata sądowa: 600 zł (rozwód) lub 100 zł (alimenty)' },
                    { name: 'Złóż w Sądzie Rejonowym - Wydział Rodzinny' }
                ],
                critical: true
            },
            {
                phase: 3,
                name: 'POSTĘPOWANIE POJEDNAWCZE',
                duration: '2-4 tygodnie',
                icon: '🤝',
                description: 'Sąd próbuje doprowadzić do ugody',
                tasks: [
                    { name: 'Sąd wzywa strony na posiedzenie pojednawcze' },
                    { name: 'Rozmowa z sędzią o możliwości ugody' },
                    { name: 'Opcjonalnie: skierowanie do mediatora' }
                ],
                critical: false
            },
            {
                phase: 4,
                name: 'WYWIAD ŚRODOWISKOWY (jeśli dzieci)',
                duration: '4-8 tygodni',
                icon: '🏠',
                description: 'Kurator rodzinny bada warunki życia',
                tasks: [
                    { name: 'Sąd zleca wywiad kuratora' },
                    { name: 'Kurator odwiedza obu rodziców w domu' },
                    { name: 'Rozmowy z dziećmi, placówkami (szkoła, przedszkole)' },
                    { name: 'Kurator składa opinię w sądzie' }
                ],
                critical: false
            },
            {
                phase: 5,
                name: 'ROZPRAWA SĄDOWA',
                duration: '6-12 miesięcy',
                icon: '⚖️',
                description: 'Główne posiedzenia i przesłuchania',
                tasks: [
                    { name: 'Pierwsza rozprawa - stanowiska stron' },
                    { name: 'Przesłuchanie świadków' },
                    { name: 'Ewentualnie: opinia biegłego psychologa' },
                    { name: 'Przesłuchanie dzieci (jeśli powyżej 13 lat)' },
                    { name: 'Dalsze rozprawy w razie potrzeby' }
                ],
                critical: false
            },
            {
                phase: 6,
                name: 'WYROK SĄDU',
                duration: '1-2 miesiące',
                icon: '📜',
                description: 'Orzeczenie sądu rodzinnego',
                tasks: [
                    { name: 'Sąd wydaje wyrok / postanowienie' },
                    { name: 'Orzeka o: rozwodzie, winie, władzy rodzicielskiej, alimentach, majątku' },
                    { name: 'Otrzymanie wyroku z uzasadnieniem' },
                    { name: 'Termin na apelację: 14 dni' }
                ],
                critical: false
            },
            {
                phase: 7,
                name: 'PRAWOMOCNOŚĆ I WYKONANIE',
                duration: '1-3 miesiące',
                icon: '✅',
                description: 'Uprawomocnienie i egzekucja',
                tasks: [
                    { name: 'Wyrok staje się prawomocny (brak apelacji lub po apelacji)' },
                    { name: 'USC aktualizuje akty stanu cywilnego' },
                    { name: 'Możliwość ponownego zawarcia związku' },
                    { name: 'Egzekucja alimentów (jeśli niepłacone)' }
                ],
                critical: false
            }
        ]
    },
    
    requiredDocuments: [
        {
            id: 'birth_certificates',
            name: 'Odpis aktu urodzenia dzieci',
            category: 'personal',
            required: true,
            canGenerate: false,
            description: 'Dla każdego dziecka - z USC',
            howTo: [
                '1. Zamów odpis z USC miejsca urodzenia dziecka',
                '2. Możesz zamówić online przez epuap.gov.pl',
                '3. Koszt: 22 zł za odpis zwykły',
                '4. Czas oczekiwania: 3-7 dni',
                '5. Zamów dla każdego dziecka osobno'
            ]
        },
        {
            id: 'marriage_certificate',
            name: 'Odpis skrócony aktu małżeństwa',
            category: 'personal',
            required: true,
            canGenerate: false,
            description: 'Z USC - wydany w ciągu ostatnich 3 miesięcy',
            showIf: ['divorce', 'separation'],
            howTo: [
                '1. Zamów odpis z USC gdzie braliście ślub',
                '2. KONIECZNIE: odpis skrócony (nie pełny)',
                '3. WAŻNE: musi być z ostatnich 3 miesięcy',
                '4. Koszt: 22 zł',
                '5. Zamów 2-3 egzemplarze (sąd, USC po rozwodzie)'
            ]
        },
        {
            id: 'income_proof',
            name: 'Zaświadczenie o dochodach',
            category: 'financial',
            required: true,
            canGenerate: false,
            description: 'Z pracodawcy lub PIT za ostatni rok',
            howTo: [
                '1. Poproś pracodawcę o zaświadczenie o zarobkach',
                '2. LUB pobierz PIT z ostatniego roku (z e-PIT)',
                '3. LUB zaświadczenie z ZUS (emeryci/renciści)',
                '4. Potrzebne: wynagrodzenie netto z ostatnich 12 miesięcy',
                '5. Dołącz do pozwu jako załącznik'
            ]
        },
        {
            id: 'property_titles',
            name: 'Akty własności nieruchomości',
            category: 'property',
            required: false,
            canGenerate: false,
            description: 'Jeśli istnieje wspólna nieruchomość',
            howTo: [
                '1. Znajdź akt notarialny zakupu nieruchomości',
                '2. Zamów wypis z księgi wieczystej (ekw.ms.gov.pl)',
                '3. Koszt: 19 zł za wypis online',
                '4. Pokaże: właściciel, hipoteki, wartość',
                '5. Potrzebne do podziału majątku'
            ]
        },
        {
            id: 'loan_agreements',
            name: 'Umowy kredytów / pożyczek',
            category: 'financial',
            required: false,
            canGenerate: false,
            description: 'Jeśli są wspólne długi',
            howTo: [
                '1. Znajdź umowy kredytów (hipoteczny, samochodowy)',
                '2. Poproś bank o zaświadczenie o wysokości zadłużenia',
                '3. Bank wyda bezpłatne zaświadczenie',
                '4. Potrzebne: aktualne saldo długu',
                '5. Sąd uwzględni długi przy podziale majątku'
            ]
        },
        {
            id: 'violence_reports',
            name: 'Dokumenty przemocy (jeśli dotyczy)',
            category: 'evidence',
            required: false,
            canGenerate: false,
            description: 'Notatki policji, dokumentacja medyczna, zdjęcia',
            howTo: [
                '1. Notatka z interwencji policji (jeśli była)',
                '2. Dokumentacja medyczna (karta obrzeżeń)',
                '3. Zdjęcia obrzeżeń lub zniszczeń',
                '4. SMS-y, emaile z groźbami',
                '5. Zezania świadków (sąsiedzi, rodzina)'
            ]
        },
        {
            id: 'divorce_petition',
            name: 'Pozew o rozwód',
            category: 'court',
            required: true,
            canGenerate: true,
            description: '🤖 AI GENERATOR - pozew z pełnym uzasadnieniem',
            showIf: ['divorce'],
            howTo: [
                '1. System wygeneruje pełny pozew o rozwód',
                '2. Zawiera: Twoje żądania, rozkład pożycia, wina',
                '3. Wydrukuj lub zapisz PDF',
                '4. Podpisz własnoręcznie',
                '5. Opłata sądowa: 600 zł',
                '6. Złóż w Sądzie Okręgowym - Wydział Rodzinny'
            ]
        },
        {
            id: 'alimony_petition',
            name: 'Pozew o alimenty',
            category: 'court',
            required: true,
            canGenerate: true,
            description: '🤖 AI GENERATOR - wniosek o zasądzenie alimentów',
            showIf: ['alimony'],
            howTo: [
                '1. System obliczy realistyczną kwotę alimentów',
                '2. Uwzględni: dochody, wydatki, potrzeby dzieci',
                '3. Wygeneruje pełny pozew z uzasadnieniem',
                '4. Opłata sądowa: 100 zł',
                '5. Złóż w Sądzie Rejonowym - Wydział Rodzinny',
                '6. Sąd może przyznać alimenty tymczasowe już w 2 tygodnie'
            ]
        },
        {
            id: 'custody_petition',
            name: 'Wniosek o ustalenie władzy rodzicielskiej',
            category: 'court',
            required: true,
            canGenerate: true,
            description: '🤖 AI GENERATOR - wniosek o opiekę nad dziećmi',
            howTo: [
                '1. System przygotuje wniosek o władzę rodzicielską',
                '2. Argumenty: dlaczego dzieci powinny mieszkać z Tobą',
                '3. Uwzględni: warunki mieszkaniowe, szkoła, zdrowie',
                '4. Złóż razem z pozwem o rozwód lub osobno',
                '5. Sąd zlecy wywiad kuratora (odwiedziny w domu)'
            ]
        },
        {
            id: 'contact_petition',
            name: 'Wniosek o kontakty z dzieckiem',
            category: 'court',
            required: false,
            canGenerate: true,
            description: '🤖 AI GENERATOR - wniosek o ustalenie kontaktów',
            howTo: [
                '1. System wygeneruje wniosek o kontakty',
                '2. Zaproponuje harmonogram: weekendy, wakacje, święta',
                '3. Uwzględni wiek dzieci i ich potrzeby',
                '4. Możesz zaproponować kontakty: z nocowaniem / bez',
                '5. Sąd ustali szczegółowy grafik'
            ]
        },
        {
            id: 'power_of_attorney',
            name: 'Pełnomocnictwo procesowe',
            category: 'court',
            required: true,
            canGenerate: true,
            description: '🤖 AI GENERATOR - pełnomocnictwo dla adwokata',
            howTo: [
                '1. System wygeneruje pełnomocnictwo',
                '2. Wypełnij dane adwokata/radcy prawnego',
                '3. Podpisz własnoręcznie',
                '4. Złóż w sądzie razem z pozwem',
                '5. Adwokat będzie reprezentował Cię na rozprawach'
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
                '1. System wygeneruje pełny wykaz dowódów',
                '2. Dokumenty: umowy, zaświadczenia, zdjęcia',
                '3. Świadkowie: imię, nazwisko, adres, co zeznają',
                '4. Dołącz do pozwu',
                '5. Sąd wezwie świadków na rozprawę'
            ]
        },
        {
            id: 'financial_statement',
            name: 'Oświadczenie o stanie majątkowym',
            category: 'financial',
            required: true,
            canGenerate: true,
            description: '🤖 AI GENERATOR - szczegółowe zestawienie majątku',
            showIf: ['divorce'],
            howTo: [
                '1. System wygeneruje pełne zestawienie majątku',
                '2. Nieruchomości: adresy, wartość, księgi wieczyste',
                '3. Pojazdy: marka, model, wartość',
                '4. Konta bankowe: nazwa banku, saldo',
                '5. Długi: kredyty, pożyczki, wysokość',
                '6. Sąd podzieli majątek na pół'
            ]
        }
    ]
};

console.log('✅ Family Part 3 załadowana (Sekcja 10 + Procedura + Dokumenty)!');
