// 📜 ANKIETA WINDYKACYJNA - CZĘŚĆ 3 (Procedura + Dokumenty)

console.log('✅ Ładuję ankietę windykacyjną część 3 (procedura + dokumenty)...');

window.debtCollectionQuestionnaire_Part3 = {
    // PROCEDURA WINDYKACYJNA (9 FAZ)
    procedure: {
        title: '',
        description: 'Kompleksowy proces od analizy do egzekucji',
        phases: [
            {
                phase: 1,
                name: 'ANALIZA I OCENA',
                duration: '1-3 dni',
                icon: '🔍',
                description: 'Ocena szans powodzenia i opłacalności windykacji',
                tasks: [
                    { name: 'Weryfikacja dokumentów i dowodów', critical: true },
                    { name: 'Ocena siły dowodów (AI 0-100%)', help: 'System analizuje szanse wygranej' },
                    { name: 'Kalkulator kosztów vs korzyści', help: 'Opłaty sądowe, pełnomocnik, komornik' },
                    { name: 'Sprawdzenie dłużnika w bazach', help: 'CEIDG, KRS - czy istnieje?' },
                    { name: 'Określenie strategii', critical: true, help: 'Ugoda / Wezwanie / Sąd?' }
                ]
            },
            {
                phase: 2,
                name: 'WEZWANIE PRZEDSĄDOWE',
                duration: '14 dni',
                icon: '📨',
                description: 'Ostatnia szansa przed sądem',
                tasks: [
                    { name: 'Generator wezwania (3 warianty)', help: 'Grzeczne / Stanowcze / Ostre' },
                    { name: 'Wysłanie listem poleconym', critical: true, deadline_days: 1 },
                    { name: 'Termin do zapłaty: 7-14 dni', deadline_days: 14 },
                    { name: 'Monitoring odpowiedzi', help: 'Czy zapłaci? Czy odpowie?' }
                ]
            },
            {
                phase: 3,
                name: 'NEGOCJACJE',
                duration: '7-30 dni',
                icon: '🤝',
                description: 'Próba polubownego rozwiązania',
                tasks: [
                    { name: 'Rozmowy z dłużnikiem', help: 'Telefon, email, spotkanie' },
                    { name: 'Kalkulator rat', help: 'Ile miesięcznie? Na ile rat?' },
                    { name: 'Generator ugody', help: 'Dokument gotowy do podpisu' },
                    { name: 'Tracking płatności', help: 'Czy dotrzymuje terminów?' }
                ]
            },
            {
                phase: 4,
                name: 'ZEBRANIE DOWODÓW',
                duration: 'ciągłe',
                icon: '📎',
                description: 'Wzmocnienie pozycji przed procesem',
                tasks: [
                    { name: 'Mocne dowody: faktura, umowa', help: 'To co masz na pewno' },
                    { name: 'Wzmocnienie słabych: świadkowie', help: 'Brak umowy? Znajdź świadków!' },
                    { name: 'Korespondencja email/SMS', help: 'Każda wiadomość to dowód' },
                    { name: 'Żądanie wyjaśnień', help: 'Email do dłużnika - przyznanie!' }
                ]
            },
            {
                phase: 5,
                name: 'POZEW DO SĄDU',
                duration: '1-7 dni',
                icon: '⚖️',
                description: 'Formalne rozpoczęcie postępowania',
                tasks: [
                    { name: 'AI generator pozwu', critical: true, help: 'Gotowy pozew do podpisu' },
                    { name: 'Lista załączników', help: 'Wszystkie dowody!' },
                    { name: 'Opłata sądowa (5%)', help: 'Max 200,000 zł' },
                    { name: 'E-Sąd instrukcja', help: 'Krok po kroku przez internet!' },
                    { name: 'Złożenie pozwu', critical: true, deadline_days: 3 }
                ]
            },
            {
                phase: 6,
                name: 'POSTĘPOWANIE SĄDOWE',
                duration: '6-18 miesięcy',
                icon: '🏛️',
                description: 'Proces od pozwu do wyroku',
                tasks: [
                    { name: 'Nadanie sygnatury', help: 'Sprawa dostaje numer' },
                    { name: 'Doręczenie pozwu dłużnikowi', help: 'Sąd doręcza automatycznie' },
                    { name: 'Odpowiedź dłużnika (30 dni)', deadline_days: 30 },
                    { name: 'Rozprawa lub bez', help: 'Czasem sąd orzeka bez rozprawy' },
                    { name: 'Przesłuchanie stron', help: 'Ty i dłużnik zeznajecie' },
                    { name: 'WYROK', critical: true }
                ]
            },
            {
                phase: 7,
                name: 'WYROK I APELACJA',
                duration: '1-3 miesiące',
                icon: '📋',
                description: 'Analiza wyroku',
                tasks: [
                    { name: 'Przeczytaj uzasadnienie', help: 'Dlaczego sąd tak orzekł?' },
                    { name: 'AI analiza: czy apelować?', help: 'Szanse w II instancji' },
                    { name: 'Termin na apelację (30 dni)', deadline_days: 30 },
                    { name: 'Klauzula wykonalności', critical: true, help: 'Wyrok wykonalny' },
                    { name: 'Tytuł wykonawczy', critical: true, help: 'Dla komornika' }
                ]
            },
            {
                phase: 8,
                name: 'EGZEKUCJA KOMORNICZA',
                duration: '3-24 miesiące',
                icon: '👮',
                description: 'Przymusowe odzyskanie należności',
                tasks: [
                    { name: 'Wybór komornika', help: 'Rejon dłużnika' },
                    { name: 'Wniosek o egzekucję', critical: true },
                    { name: 'Wskazanie majątku', help: 'Im więcej wiesz, tym lepiej' },
                    { name: 'Zajęcie kont bankowych', help: 'Automatyczne' },
                    { name: 'Zajęcie wynagrodzenia', help: 'Do 50% pensji' },
                    { name: 'Zajęcie ruchomości', help: 'Auto, sprzęt' },
                    { name: 'Licytacja (jeśli trzeba)', help: 'Sprzedaż majątku' }
                ]
            },
            {
                phase: 9,
                name: 'ZAKOŃCZENIE',
                duration: 'zmienne',
                icon: '✅',
                description: 'Odzyskanie lub umorzenie',
                tasks: [
                    { name: 'Sukces: pełna spłata', critical: true },
                    { name: 'Sukces: ugoda komornicza', help: 'Częściowa spłata' },
                    { name: 'Porażka: brak majątku', help: 'Dłużnik niewypłacalny' },
                    { name: 'Umorzenie postępowania', help: 'Bezskuteczność' },
                    { name: 'Plan B: oczekiwanie', help: 'Może się wzbogaci' }
                ]
            }
        ]
    },

    // DOKUMENTY WINDYKACYJNE (20 PODSTAWOWYCH)
    requiredDocuments: [
        // PRZEDSĄDOWE (1-3)
        {
            id: 'demand_letter_1',
            name: '📨 Wezwanie przedsądowe #1 (grzeczne)',
            required: false,
            canUpload: true,
            canGenerate: true,
            description: 'Pierwsze wezwanie - uprzejme przypomnienie o długu',
            howTo: [
                '1. System wygeneruje wezwanie na podstawie ankiety',
                '2. Wariant GRZECZNY - dla pierwszego kontaktu',
                '3. Zawiera: kwotę, termin, dane do przelewu',
                '4. Wyślij emailem LUB listem poleconym',
                '5. Zachowaj potwierdzenie wysłania!'
            ]
        },
        {
            id: 'demand_letter_2',
            name: '📨 Wezwanie przedsądowe #2 (stanowcze)',
            required: false,
            canUpload: true,
            canGenerate: true,
            description: 'Drugie wezwanie - stanowcze po braku reakcji',
            howTo: [
                '1. Jeśli nie zapłacił po 1. wezwaniu',
                '2. Wariant STANOWCZY - ostrzejszy ton',
                '3. Wzmianka o konsekwencjach prawnych',
                '4. Termin krótszy: 7 dni',
                '5. List polecony za potwierdzeniem!'
            ]
        },
        {
            id: 'demand_letter_3',
            name: '⚠️ Wezwanie ostateczne (ostre)',
            required: true,
            canUpload: true,
            canGenerate: true,
            description: 'Ostatnie wezwanie przed sądem - twarde ultimatum',
            howTo: [
                '1. Ostatnia szansa przed pozwem',
                '2. Wariant OSTRY - ultimatum',
                '3. Wzmianka o pozwie, kosztach, komorniku',
                '4. Dla oszustów: zawiadomienie prokuratury',
                '5. KONIECZNIE list polecony!'
            ]
        },

        // UGODA (4-5)
        {
            id: 'settlement_agreement',
            name: '🤝 Ugoda pozasądowa',
            required: false,
            canUpload: true,
            canGenerate: true,
            description: 'Porozumienie o spłacie długu bez sądu',
            howTo: [
                '1. Generator przygotuje wzór ugody',
                '2. Określ: kwotę, raty, terminy',
                '3. Podpis obu stron',
                '4. Świadkowie (opcjonalnie)',
                '5. Egzemplarz dla każdej strony'
            ]
        },
        {
            id: 'payment_plan',
            name: '📅 Plan spłat (harmonogram)',
            required: false,
            canUpload: true,
            canGenerate: true,
            description: 'Szczegółowy harmonogram rat',
            howTo: [
                '1. Kalkulator rat pomoże',
                '2. Określ: kwota raty, ilość rat, termin',
                '3. Tabela z datami wszystkich rat',
                '4. Podpis dłużnika = zgoda'
            ]
        },

        // DOWODY (6-12)
        {
            id: 'written_contract',
            name: '📝 Umowa pisemna',
            required: false,
            canUpload: true,
            description: 'Najważniejszy dowód - umowa podpisana',
            howTo: ['Zeskanuj/zrób zdjęcie umowy', 'Format: PDF lub JPG']
        },
        {
            id: 'invoice_doc',
            name: '📄 Faktura VAT / Rachunek',
            required: false,
            canUpload: true,
            description: 'Faktura dokumentująca należność',
            howTo: ['Oryginał faktury', 'Jeśli kilka faktur - wszystkie']
        },
        {
            id: 'payment_confirmation',
            name: '💳 Potwierdzenie przelewu / płatności',
            required: false,
            canUpload: true,
            description: 'Dowód że zapłaciłeś (wykonałeś swoją część)',
            howTo: ['Potwierdzenie z banku', 'Historia przelewów']
        },
        {
            id: 'email_correspondence',
            name: '📧 Korespondencja email',
            required: false,
            canUpload: true,
            description: 'Emaile potwierdzające umowę/dług',
            howTo: ['Screenshoty lub wydruki emaili', 'Pokaż nagłówek (data, od kogo)']
        },
        {
            id: 'sms_messages',
            name: '📱 Wiadomości SMS / WhatsApp',
            required: false,
            canUpload: true,
            description: 'Rozmowy potwierdzające zobowiązanie',
            howTo: ['Screenshoty z numerem telefonu', 'Data i godzina widoczna']
        },
        {
            id: 'witness_statements',
            name: '👥 Zeznania świadków (pisemne)',
            required: false,
            canUpload: true,
            description: 'Oświadczenia osób które widziały/słyszały',
            howTo: [
                'Imię, nazwisko, PESEL świadka',
                'Opis: co widział/słyszał',
                'Data i podpis',
                'Najlepiej notarialnie!'
            ]
        },
        {
            id: 'other_evidence',
            name: '📎 Inne dowody',
            required: false,
            canUpload: true,
            description: 'Nagrania, zdjęcia, protokoły, itp.',
            howTo: ['Wszystko co może pomóc']
        },

        // POZEW (13-15)
        {
            id: 'lawsuit_document',
            name: '⚖️ Pozew o zapłatę',
            required: true,
            canUpload: true,
            canGenerate: true,
            description: 'Formalny pozew do sądu',
            howTo: [
                '1. AI wygeneruje pełny pozew',
                '2. Dane stron, kwota, uzasadnienie',
                '3. Podpis (własnoręczny lub kwalifikowany)',
                '4. Załącz wszystkie dowody',
                '5. Złóż w sądzie (papier) lub e-Sąd (online)'
            ]
        },
        {
            id: 'court_fee_proof',
            name: '💳 Dowód opłaty sądowej',
            required: true,
            canUpload: true,
            description: 'Potwierdzenie uiszczenia opłaty (5% wartości)',
            howTo: [
                'Kwota: 5% wartości przedmiotu sporu',
                'Max: 200,000 zł',
                'Min: 30 zł',
                'Przelew na konto sądu',
                'Zachowaj potwierdzenie!'
            ]
        },
        {
            id: 'power_of_attorney',
            name: '📋 Pełnomocnictwo (jeśli masz pełnomocnika)',
            required: false,
            canUpload: true,
            description: 'Upoważnienie dla adwokata/radcy',
            howTo: ['Wzór dostaniesz od pełnomocnika', 'Podpis notarialny (opcjonalnie)']
        },

        // EGZEKUCJA (16-18)
        {
            id: 'enforcement_application',
            name: '👮 Wniosek o wszczęcie egzekucji',
            required: false,
            canUpload: true,
            canGenerate: true,
            description: 'Wniosek do komornika o przymusowe ściągnięcie',
            howTo: [
                '1. Po prawomocnym wyroku',
                '2. Generator przygotuje wzór',
                '3. Tytuł wykonawczy w załączeniu',
                '4. Wskazanie majątku dłużnika (jeśli znasz)',
                '5. Złóż u komornika (rejon dłużnika)'
            ]
        },
        {
            id: 'execution_title',
            name: '📜 Tytuł wykonawczy',
            required: false,
            canUpload: true,
            description: 'Wyrok z klauzulą wykonalności',
            howTo: [
                'Wyrok sądu + klauzula wykonalności',
                'Wydaje sąd I instancji',
                'Potrzebne do komornika',
                'Termin: 3 lata od uprawomocnienia'
            ]
        },
        {
            id: 'debtor_assets_info',
            name: '🏠 Wskazanie majątku dłużnika',
            required: false,
            canUpload: true,
            description: 'Informacje o majątku dłużnika dla komornika',
            howTo: [
                'Im więcej wiesz, tym lepiej:',
                '• Konta bankowe (numer, bank)',
                '• Nieruchomości (adres)',
                '• Pojazdy (marka, nr rej.)',
                '• Miejsce pracy (wynagrodzenie)',
                '• Firma (przychody)'
            ]
        },

        // SPECJALNE (19-20)
        {
            id: 'fraud_notification',
            name: '🚨 Zawiadomienie o oszustwie (prokuratura)',
            required: false,
            canUpload: true,
            canGenerate: true,
            description: 'Zawiadomienie o podejrzeniu popełnienia przestępstwa',
            howTo: [
                '1. Jeśli podejrzewasz oszustwo (art. 286 KK)',
                '2. Generator przygotuje wzór',
                '3. Opisz jak dłużnik wyłudził/oszukał',
                '4. Załącz dowody',
                '5. Złóż w prokuraturze (papier) lub e-Prokuratura'
            ]
        },
        {
            id: 'securing_claim',
            name: '🔒 Wniosek o zabezpieczenie roszczenia',
            required: false,
            canUpload: true,
            canGenerate: true,
            description: 'Zabezpieczenie majątku PRZED wyrokiem',
            howTo: [
                '1. Jeśli ryzyko że dłużnik ukryje majątek',
                '2. Złóż PRZED pozwem lub razem z pozwem',
                '3. Sąd może zajać majątek tymczasowo',
                '4. Kaucja: 10% wartości roszczenia',
                '5. Działa błyskawicznie!'
            ]
        }
    ]
};

console.log('✅ Ankieta windykacyjna część 3 (procedura + dokumenty) załadowana!');
console.log('📅 Part3 - Fazy procedury:', window.debtCollectionQuestionnaire_Part3.procedure.phases.length);
console.log('📄 Part3 - Dokumenty:', window.debtCollectionQuestionnaire_Part3.requiredDocuments.length);
