// 💼 ANKIETA GOSPODARCZA - CZĘŚĆ 3: PROCEDURA I DOKUMENTY
console.log('💼 Commercial Questionnaire Part 3 - Loaded!');

window.commercialQuestionnaire_Part3 = {
    procedure: {
        title: 'PROCEDURA SPORU GOSPODARCZEGO',
        phases: [
            {
                phase: 1,
                name: 'PRZYGOTOWANIE',
                duration: '7-14 dni',
                icon: '📋',
                description: 'Analiza dokumentów i strategii',
                tasks: [
                    { name: 'Analiza dokumentów', description: 'Przegląd umów, faktur' },
                    { name: 'Ocena dowodów', description: 'Czy wygramy?' },
                    { name: 'Wyliczenie kwoty', description: 'Główna + odsetki + kary' },
                    { name: 'Określenie strategii', critical: true }
                ]
            },
            {
                phase: 2,
                name: 'PRÓBA POLUBOWNA',
                duration: '14-30 dni',
                icon: '🤝',
                description: 'Negocjacje przed sądem',
                tasks: [
                    { name: 'Wezwanie do zapłaty', critical: true, deadline_days: 7 },
                    { name: 'Negocjacje', description: 'Próba ugody' },
                    { name: 'Mediacja (opcja)', description: 'Neutralny mediator' }
                ]
            },
            {
                phase: 3,
                name: 'POZEW + ZABEZPIECZENIE',
                duration: '14-21 dni',
                icon: '📄',
                description: 'Złożenie pozwu',
                tasks: [
                    { name: 'Przygotowanie pozwu', critical: true },
                    { name: 'Zabezpieczenie (jeśli potrzeba)', description: '🚨 Zamrożenie majątku' },
                    { name: 'Opłata sądowa', description: '5% wartości sporu' },
                    { name: 'Złożenie w Sądzie Okręgowym', critical: true }
                ]
            },
            {
                phase: 4,
                name: 'POSTĘPOWANIE DOWODOWE',
                duration: '3-12 miesięcy',
                icon: '🔍',
                tasks: [
                    { name: 'Doręczenie pozwu', description: 'Komornik doręcza przeciwnikowi' },
                    { name: 'Odpowiedź na pozew', description: 'Przeciwnik ma 2 tygodnie' },
                    { name: 'Wymiana pism', description: 'Replika, duplika' },
                    { name: 'Posiedzenia przygotowawcze', description: 'Próba ugody, ustalenie faktów' }
                ]
            },
            {
                phase: 5,
                name: 'ROZPRAWA',
                duration: '6-18 miesięcy',
                icon: '⚖️',
                tasks: [
                    { name: 'Wyznaczenie terminu', description: 'Pierwsze posiedzenie' },
                    { name: 'Zeznania świadków', description: 'Przesłuchania' },
                    { name: 'Opinie biegłych (jeśli potrzeba)' },
                    { name: 'Mowy końcowe', critical: true }
                ]
            },
            {
                phase: 6,
                name: 'WYROK',
                duration: '1-3 miesiące',
                icon: '📜',
                tasks: [
                    { name: 'Ogłoszenie wyroku', critical: true },
                    { name: 'Uzasadnienie (na wniosek)', description: '14 dni na wniosek' },
                    { name: 'Apelacja (opcja)', description: '14 dni od doręczenia' }
                ]
            },
            {
                phase: 7,
                name: 'EGZEKUCJA',
                duration: '3-24 miesiące',
                icon: '🔨',
                description: 'Odzyskiwanie pieniędzy',
                tasks: [
                    { name: 'Nadanie klauzuli wykonalności', critical: true },
                    { name: 'Wniosek do komornika', description: 'Wszczęcie egzekucji' },
                    { name: 'Zajęcie kont bankowych', description: '💰 Zajęcie środków' },
                    { name: 'Zajęcie ruchomości/nieruchomości', description: 'Jeśli brak gotówki' },
                    { name: 'Windykacja długu', description: 'Ściąganie pieniędzy' }
                ]
            }
        ]
    },

    requiredDocuments: [
        { 
            id: 'commercial_lawsuit', 
            name: 'Pozew o zapłatę', 
            category: 'court', 
            required: true, 
            canGenerate: true,
            description: '🤖 AI wygeneruje pozew na podstawie ankiety - główne żądanie + uzasadnienie prawne',
            howTo: [
                '1. System wygeneruje pełny pozew gospodarczy',
                '2. Zawiera: kwota główna + odsetki + koszty',
                '3. Wydrukuj lub zapisz PDF',
                '4. Opłata sądowa: 5% wartości sporu',
                '5. Złóż w Sądzie Okręgowym - Wydział Gospodarczy',
                '6. Rozważ zabezpieczenie roszczenia (zamrożenie majątku)'
            ]
        },
        { 
            id: 'contract_copy', 
            name: 'Umowa (kopia)', 
            category: 'evidence', 
            required: true,
            description: 'Podstawa roszczenia - umowa handlowa, kontrakt B2B',
            howTo: [
                '1. Znajdź oryginalną umowę B2B',
                '2. Zrób czytelną kopię (skan PDF)',
                '3. Zaznacz najważniejsze postanowienia (kwoty, terminy)',
                '4. Jeśli brak umowy pisemnej → zbierz korespondencję',
                '5. Dołącz jako załącznik nr 1 do pozwu'
            ]
        },
        { 
            id: 'invoices', 
            name: 'Faktury VAT', 
            category: 'evidence', 
            required: true,
            description: 'Dokumenty księgowe potwierdzające zobowiązanie',
            howTo: [
                '1. Zbierz wszystkie faktury VAT (niezapłacone)',
                '2. Sprawdź daty wymagalności',
                '3. Oblicz odsetki za zwłokę',
                '4. Przygotuj zestawienie: nr faktury, kwota, data',
                '5. Dołącz kopie faktur do pozwu'
            ]
        },
        { 
            id: 'payment_demand', 
            name: 'Wezwanie do zapłaty', 
            category: 'evidence', 
            required: true,
            canGenerate: true,
            description: '🤖 AI może wygenerować wezwanie - przedsądowa próba windykacji',
            howTo: [
                '1. System wygeneruje wezwanie do zapłaty',
                '2. Wyślij listem poleconym lub mailem',
                '3. Daj 7-14 dni na zapłatę',
                '4. Zachowaj dowód wysłania (potwierdzenie poczty)',
                '5. Po terminie → składaj pozew do sądu'
            ]
        },
        { 
            id: 'correspondence', 
            name: 'Korespondencja email/listy', 
            category: 'evidence', 
            required: false,
            description: 'Uzupełniające dowody - wymiana wiadomości z kontrahentem',
            howTo: [
                '1. Zbierz emaile z kontrahentem',
                '2. SMS-y, wiadomości (np. WhatsApp)',
                '3. Listy polecone (z potwierdzeniem)',
                '4. Zrób PDF z pełnymi nagłówkami (data, nadawca)',
                '5. Dołącz jako dowód uzupełniający'
            ]
        },
        { 
            id: 'delivery_docs', 
            name: 'Dokumenty WZ/CMR (jeśli dostawa)', 
            category: 'evidence', 
            required: false,
            description: 'Dowody dostarczenia towaru - WZ, CMR, list przewozowy',
            howTo: [
                '1. Zbierz dokumenty WZ (wydanie zewnętrzne)',
                '2. CMR dla transportu międzynarodowego',
                '3. List przewozowy z podpisem odbiorcy',
                '4. Protokoły odbioru towaru',
                '5. Dowody dostarczenia usługi (protokoły, zdjęcia)'
            ]
        },
        { 
            id: 'power_of_attorney', 
            name: 'Pełnomocnictwo procesowe', 
            category: 'court', 
            required: true,
            canGenerate: true,
            description: '🤖 AI może wygenerować - reprezentacja przez prawnika',
            howTo: [
                '1. System wygeneruje pełnomocnictwo procesowe',
                '2. Wypełnij dane radcy prawnego/adwokata',
                '3. Podpisz i przybij pieczątkę firmową',
                '4. W sprawach gospodarczych: obligatoryjne dla firm',
                '5. Złóż w sądzie razem z pozwem'
            ]
        },
        { 
            id: 'court_fee', 
            name: 'Dowód uiszczenia opłaty sądowej', 
            category: 'court', 
            required: true,
            description: '5% wartości sporu (min. 30 zł, maks. 100,000 PLN) - przelew do sądu',
            howTo: [
                '1. Oblicz 5% wartości roszczenia',
                '2. Min. 30 zł, max. 100,000 zł',
                '3. Przelew na rachunek Sądu Okręgowego',
                '4. W tytule: numer sprawy (jeśli masz) lub "opłata od pozwu"',
                '5. Dołącz potwierdzenie przelewu do pozwu'
            ]
        },
        { 
            id: 'krs_extract', 
            name: 'Odpis z KRS przeciwnika', 
            category: 'identification', 
            required: false,
            description: 'Dane strony pozwanej - pobranie z ekrs.ms.gov.pl',
            howTo: [
                '1. Wejdź na ekrs.ms.gov.pl',
                '2. Wpisz NIP lub nazwę firmy pozwanego',
                '3. Pobierz aktualny odpis pełny (bezpłatnie)',
                '4. Sprawdź: adres siedziby, zarząd, kapitał',
                '5. Dołącz do pozwu dla potwierdzenia danych'
            ]
        },
        { 
            id: 'security_request', 
            name: 'Wniosek o zabezpieczenie (jeśli potrzeba)', 
            category: 'court', 
            required: false,
            canGenerate: true,
            description: '🤖 AI wygeneruje wniosek - 🚨 zamrożenie majątku przed wyrokiem',
            howTo: [
                '1. PILNE: składaj NATYCHMIAST z pozwem!',
                '2. System wygeneruje wniosek o zabezpieczenie',
                '3. Sąd może zamrozić konta bankowe pozwanego',
                '4. Lub zająć nieruchomości/pojazdy',
                '5. Decyzja w 1-3 dni (bez wysłuchania pozwanego)',
                '6. Potrzebne gdy ryzyko ukrycia majątku'
            ]
        },
        { 
            id: 'witnesses', 
            name: 'Zeznania świadków', 
            category: 'evidence', 
            required: false,
            description: 'Osoby potwierdzające fakty - lista + dane kontaktowe',
            howTo: [
                '1. Wymień świadków: imię, nazwisko, adres',
                '2. Co widzieli/słyszeli (fakty, nie opinie)',
                '3. Np. negocjacje, dostawa, jakość towaru',
                '4. Dołącz do wykazu dowodów',
                '5. Sąd wezwie ich na rozprawę'
            ]
        },
        { 
            id: 'expert_opinions', 
            name: 'Opinie ekspertów/biegłych', 
            category: 'evidence', 
            required: false,
            description: 'Jeśli sprawa skomplikowana technicznie - rzeczoznawca, biegły sądowy',
            howTo: [
                '1. Jeśli sprawa techniczna → wnioskuj o biegłego',
                '2. Np. jakość towaru, wycena szkody, IT',
                '3. Możesz załączyć prywatną opinię rzeczoznawcy',
                '4. Lub wnioskować o biegłego sądowego',
                '5. Koszt: 1000-5000 zł (zwrot od przegrywającego)'
            ]
        },
        { 
            id: 'accounting_docs', 
            name: 'Dokumentacja księgowa', 
            category: 'evidence', 
            required: false,
            description: 'Potwierdzenie transakcji - zapisy w księgach rachunkowych',
            howTo: [
                '1. Wyciąg z ksiąg rachunkowych',
                '2. Zapisy: przychody, należności, zobowiązania',
                '3. Potwierdzone przez księgową/księgowego',
                '4. Dowód że transakcja była zaksięgowana',
                '5. Dołącz jeśli brak innych dokumentów'
            ]
        },
        { 
            id: 'payment_confirmations', 
            name: 'Potwierdzenia przelewów', 
            category: 'evidence', 
            required: false,
            description: 'Jeśli były wpłaty częściowe - wyciągi bankowe',
            howTo: [
                '1. Pobierz wyciągi bankowe (historia operacji)',
                '2. Zaznacz wpłaty od pozwanego',
                '3. Oblicz ile wpłacił vs ile winien',
                '4. Dowód że był kontakt finansowy',
                '5. Dołącz jeśli były częściowe płatności'
            ]
        },
        { 
            id: 'enforcement_title', 
            name: 'Tytuł wykonawczy', 
            category: 'execution', 
            required: false,
            description: 'Po prawomocnym wyroku - nadany przez sąd klauzula wykonalności',
            howTo: [
                '1. PO WYROKU: wnioskuj o klauzulę wykonalności',
                '2. Sąd nada klauzulę na wyrok',
                '3. Z tym tytułem idź do komornika',
                '4. Komornik wszczyna egzekucję',
                '5. Zajmie konta/majątek pozwanego',
                '6. Czas egzekucji: 3-24 miesiące'
            ]
        }
    ]
};

console.log('✅ Commercial Part 3 załadowana!');
