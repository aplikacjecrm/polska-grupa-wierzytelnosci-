// ==========================================
// ANKIETA SPADKOWA - CZĘŚĆ 3 (Procedura + Dokumenty)
// ==========================================

window.inheritanceQuestionnairePart3 = {
    procedure: {
        title: 'PROCEDURA POSTĘPOWANIA SPADKOWEGO',
        description: 'Zależnie od sprawy',
        phases: [
            {
                phase: 1,
                name: 'ZGŁOSZENIE ZGONU',
                duration: '3 dni od śmierci',
                icon: '📋',
                description: 'Uzyskanie aktu zgonu i innych dokumentów',
                tasks: [
                    { name: 'Zgłoszenie zgonu w USC', critical: true, deadline_days: 3 },
                    { name: 'Odbiór aktu zgonu', description: 'Kilka egzemplarzy!' },
                    { name: 'Karta zgonu z przyczyn medycznych' },
                    { name: 'Wyrejestrowanie z PESEL' }
                ]
            },
            {
                phase: 2,
                name: 'SPRAWDZENIE TESTAMENTU',
                duration: '7-14 dni',
                icon: '📜',
                description: 'Czy zmarły zostawił testament?',
                tasks: [
                    { name: 'Przeszukanie dokumentów zmarłego' },
                    { name: 'Zapytanie u notariusza', description: 'Centralny Rejestr Testamentów' },
                    { name: 'Otwarcie testamentu w sądzie', critical: true, help: 'Jeśli znaleziono holograficzny' }
                ]
            },
            {
                phase: 3,
                name: 'DECYZJA SPADKOBIERCÓW',
                duration: '6 miesięcy',
                icon: '🤔',
                description: 'Przyjęcie lub odrzucenie spadku',
                tasks: [
                    { name: 'Oszacowanie majątku i długów', critical: true },
                    { name: 'Oświadczenie o przyjęciu (bezwarunkowo)', help: 'Do 6 miesięcy' },
                    { name: 'Oświadczenie o przyjęciu (z dobrodziejstwem inwentarza)', help: 'Do 6 miesięcy' },
                    { name: 'Oświadczenie o odrzuceniu spadku', help: 'Do 6 miesięcy', deadline_days: 180 }
                ]
            },
            {
                phase: 4,
                name: 'WNIOSEK DO SĄDU',
                duration: '1-2 tygodnie',
                icon: '📄',
                description: 'Złożenie wniosku o stwierdzenie nabycia spadku',
                tasks: [
                    { name: 'Przygotowanie wniosku', description: 'Przez prawnika lub samodzielnie' },
                    { name: 'Zebranie wszystkich dokumentów', critical: true },
                    { name: 'Opłata sądowa', description: '50 zł' },
                    { name: 'Złożenie wniosku w sądzie', critical: true }
                ]
            },
            {
                phase: 5,
                name: 'POSTĘPOWANIE SĄDOWE',
                duration: '3-12 miesięcy',
                icon: '⚖️',
                description: 'Sąd bada sprawę i wydaje postanowienie',
                tasks: [
                    { name: 'Wezwania do spadkobierców' },
                    { name: 'Posiedzenie sądu (opcjonalne)', help: 'Jeśli sąd wezwie' },
                    { name: 'Dodatkowe dokumenty (na żądanie sądu)' },
                    { name: 'Postanowienie o stwierdzeniu nabycia spadku', critical: true }
                ]
            },
            {
                phase: 6,
                name: 'DZIAŁ SPADKU',
                duration: '1-6 miesięcy',
                icon: '💰',
                description: 'Podział majątku między spadkobierców',
                tasks: [
                    { name: 'Ugoda pozasądowa', help: 'Najszybsza opcja' },
                    { name: 'Umowa o dział spadku u notariusza', help: 'Jeśli nieruchomości' },
                    { name: 'Wniosek o dział spadku do sądu', help: 'Jeśli brak zgody' },
                    { name: 'Wycena majątku przez biegłego' }
                ]
            },
            {
                phase: 7,
                name: 'ZAKOŃCZENIE',
                duration: '1-3 miesiące',
                icon: '✅',
                description: 'Przeniesienie własności i podział majątku',
                tasks: [
                    { name: 'Wpis do księgi wieczystej (nieruchomości)', critical: true },
                    { name: 'Przeniesienie własności pojazdów' },
                    { name: 'Wypłata środków z banków' },
                    { name: 'Rozliczenie podatkowe (podatek spadkowy)' }
                ]
            }
        ]
    },

    requiredDocuments: [
        {
            id: 'death_certificate',
            name: 'Akt zgonu',
            category: 'vital_records',
            required: true,
            description: 'Wydany przez USC - potrzebne kilka egzemplarzy!',
            howTo: [
                '1. Zgłoś zgon w USC w ciągu 3 dni',
                '2. Zabierz kartę zgonu z lekarzem/szpitalem',
                '3. USC wystawi akt zgonu (kilka egzemplarzy)',
                '4. Zamów co najmniej 5-10 odpisów aktów',
                '5. Potrzebne do: banku, ZUS, sądu, ksiąg wieczystych'
            ]
        },
        {
            id: 'birth_certificates',
            name: 'Akty urodzenia spadkobierców',
            category: 'vital_records',
            required: true,
            description: 'Wszystkich spadkobierców (dzieci, małżonek)',
            howTo: [
                '1. Zamów odpisy z USC miejsca urodzenia',
                '2. Możesz zamówić online przez epuap.gov.pl',
                '3. Koszt: 22 zł za odpis zwykły',
                '4. Potrzebne do: wniosku o stwierdzenie nabycia spadku',
                '5. Dla każdego spadkobiercy osobno'
            ]
        },
        {
            id: 'marriage_certificate',
            name: 'Akt małżeństwa (jeśli był)',
            category: 'vital_records',
            required: false,
            description: 'Jeśli zmarły był w związku małżeńskim',
            howTo: [
                '1. Zamów odpis z USC gdzie był ślub',
                '2. Potrzebne dla małżonka spadkodawcy',
                '3. Potwierdza prawo do spadku małżonka',
                '4. Koszt: 22 zł'
            ]
        },
        {
            id: 'testament',
            name: 'Testament (jeśli istnieje)',
            category: 'testament',
            required: false,
            description: 'Notarialny lub holograficzny',
            howTo: [
                '1. Przeszukaj dokumenty zmarłego',
                '2. Sprawdź u notariusza - Centralny Rejestr Testamentów',
                '3. Testament holograficzny (własnoręczny) → złóż do sądu',
                '4. Sąd otworzy testament i odczyta na rozprawie',
                '5. Testament notarialny → notariusz wyda wypis'
            ]
        },
        {
            id: 'inheritance_petition',
            name: 'Wniosek o stwierdzenie nabycia spadku',
            category: 'court',
            required: true,
            canGenerate: true,
            description: '🤖 AI wygeneruje wniosek na podstawie ankiety - imiona, relacje, majątek',
            howTo: [
                '1. System wygeneruje pełny wniosek',
                '2. Zawiera: dane zmarłego, spadkobierców, majątek',
                '3. Wydrukuj lub zapisz PDF',
                '4. Dołącz wszystkie załączniki (akty, dokumenty)',
                '5. Opłata sądowa: 50 zł',
                '6. Złóż w Sądzie Rejonowym (ostatnie miejsce zamieszkania zmarłego)'
            ]
        },
        {
            id: 'property_titles',
            name: 'Wypis z księgi wieczystej',
            category: 'property',
            required: false,
            description: 'Dla każdej nieruchomości w spadku',
            howTo: [
                '1. Sprawdź numer księgi wieczystej',
                '2. Zamów wypis przez ekw.ms.gov.pl (19 zł)',
                '3. Lub osobiście w Sądzie Rejonowym',
                '4. Potrzebne do wyceny i działu spadku',
                '5. Pokaże: właściciel, hipoteki, obciążenia'
            ]
        },
        {
            id: 'vehicle_registration',
            name: 'Dowód rejestracyjny pojazdu',
            category: 'property',
            required: false,
            description: 'Jeśli w spadku są samochody / motocykle',
            howTo: [
                '1. Poszukaj dowodu rejestracyjnego pojazdu',
                '2. Sprawdź czy pojazd jest wolny od obciążeń',
                '3. Po postanowieniu spadkowym → przerejestruj w wydziale komunikacji',
                '4. Potrzebne: postanowienie + dowód pojazdu + OC'
            ]
        },
        {
            id: 'bank_statements',
            name: 'Potwierdzenie sald rachunków bankowych',
            category: 'financial',
            required: false,
            description: 'Stan kont na dzień śmierci',
            howTo: [
                '1. Zgłoś się do banku zmarłego z aktem zgonu',
                '2. Poproś o zaświadczenie o saldzie na dzień śmierci',
                '3. Bank wyda dokument (często bezpłatnie)',
                '4. Wypłata środków: dopiero po postanowieniu spadkowym'
            ]
        },
        {
            id: 'debt_confirmations',
            name: 'Potwierdzenia długów',
            category: 'financial',
            required: false,
            description: 'Od banków, firm - ile winien zmarły',
            howTo: [
                '1. Sprawdź rachunki, umowy kredytowe zmarłego',
                '2. Poproś banki/firmy o zaświadczenie o zadłużeniu',
                '3. WAŻNE: Długi także wchodzą do spadku!',
                '4. Oceń czy warto przyjąć spadek (majątek vs długi)',
                '5. Rozważ przyjęcie z dobrodziejstwem inwentarza'
            ]
        },
        {
            id: 'acceptance_statement',
            name: 'Oświadczenie o przyjęciu/odrzuceniu spadku',
            category: 'court',
            required: true,
            canGenerate: true,
            description: '🤖 AI może wygenerować - przyjęcie bezwarunkowe, z dobrodziejstwem inwentarza, lub odrzucenie',
            howTo: [
                '1. TERMIN: 6 miesięcy od dowiedzenia się o spadku',
                '2. System pomoże wybrać: bezwarunkowo / z dobrodziejstwem / odrzucenie',
                '3. Złóż w Sądzie Rejonowym przed notariuszem lub na protokole',
                '4. Bezwarunkowo = dziedziczysz wszystko (majątek + długi)',
                '5. Z dobrodziejstwem = odpowiadasz długami tylko do wartości majątku',
                '6. Odrzucenie = nie dziedziczysz nic (ani majątku ani długów)'
            ]
        },
        {
            id: 'inventory_list',
            name: 'Spis inwentarza',
            category: 'court',
            required: false,
            canGenerate: true,
            description: '🤖 AI wygeneruje pełną listę - nieruchomości, pojazdy, rachunki, długi',
            howTo: [
                '1. System wygeneruje pełny spis majątku spadkowego',
                '2. Zawiera: nieruchomości, pojazdy, konta, akcje, długi',
                '3. Dla każdej pozycji: opis, wartość, lokalizacja',
                '4. Złóż do sądu razem z wnioskiem',
                '5. Ułatwia sądowi ocenę wartości spadku'
            ]
        },
        {
            id: 'division_agreement',
            name: 'Umowa o dział spadku',
            category: 'notarial',
            required: false,
            canGenerate: true,
            description: '🤖 AI może przygotować projekt - jak podzielić majątek między spadkobierców',
            howTo: [
                '1. System przygotuje projekt umowy podziału',
                '2. Negocjuj z innymi spadkobiercami',
                '3. Jeśli są nieruchomości → umowa u notariusza',
                '4. Jeśli tylko ruchomości → można bez notariusza',
                '5. Alternatywa: wniosek do sądu o dział spadku (gdy brak zgody)'
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
                '2. Wypełnij dane prawnika/pełnomocnika',
                '3. Podpisz osobiście',
                '4. Złóż w sądzie razem z wnioskiem',
                '5. Prawnik będzie działał w Twoim imieniu'
            ]
        },
        {
            id: 'court_fee_proof',
            name: 'Dowód opłaty sądowej (50 zł)',
            category: 'court',
            required: true,
            description: 'Przelew do sądu - 50 zł stała opłata'
        },
        {
            id: 'tax_declaration',
            name: 'Deklaracja podatkowa SD-3',
            category: 'tax',
            required: false,
            description: 'Podatek spadkowy - zależnie od grupy podatkowej i kwoty'
        }
    ]
};

console.log('✅ Inheritance Part 3 załadowana (Procedura + Dokumenty)!');
