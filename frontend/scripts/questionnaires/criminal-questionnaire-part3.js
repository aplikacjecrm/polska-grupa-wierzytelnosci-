// 🚔 ANKIETA KARNA - CZĘŚĆ 3 (Sekcje 5-7: Dowody, Świadkowie, Procedura)

console.log('✅ Ładuję ankietę karną część 3...');

window.criminalQuestionnaire_Part3 = {
    // SEKCJA 5: DOWODY
    section_5_evidence: {
        id: 'evidence',
        title: '',
        description: 'Jakie dowody posiadasz w sprawie?',
        questions: [
            {
                id: 'has_medical_documents',
                label: 'Czy masz dokumenty lekarskie?',
                type: 'radio',
                required: false,
                showIf: ['victim'],
                options: [
                    { value: 'yes', label: '✅ Tak' },
                    { value: 'no', label: '❌ Nie' }
                ]
            },
            {
                id: 'medical_documents_list',
                label: 'Jakie dokumenty lekarskie?',
                type: 'checkbox',
                required: false,
                showIf: ['yes'],
                options: [
                    { value: 'medical_card', label: 'Karta medyczna' },
                    { value: 'certificate', label: 'Zaświadczenie o obrażeniach' },
                    { value: 'hospital_discharge', label: 'Karta wypisu ze szpitala' },
                    { value: 'therapy_costs', label: 'Koszty leczenia/leków' },
                    { value: 'disability_certificate', label: 'Orzeczenie o niepełnosprawności' }
                ]
            },
            {
                id: 'has_photos_injuries',
                label: 'Czy masz zdjęcia obrażeń?',
                type: 'radio',
                required: false,
                showIf: ['victim'],
                options: [
                    { value: 'yes', label: '✅ Tak, mam zdjęcia' },
                    { value: 'no', label: '❌ Nie mam' }
                ]
            },
            {
                id: 'has_recordings',
                label: 'Czy masz nagrania?',
                type: 'checkbox',
                required: false,
                help: 'Wszystkie typy nagrań które mogą być dowodem',
                options: [
                    { value: 'cctv', label: 'Monitoring (CCTV)' },
                    { value: 'phone', label: 'Nagranie z telefonu' },
                    { value: 'dashcam', label: 'Kamera samochodowa' },
                    { value: 'doorbell', label: 'Kamera domowa/domofon' },
                    { value: 'audio', label: 'Nagranie audio rozmowy' }
                ]
            },
            {
                id: 'has_messages',
                label: 'Czy masz wiadomości (SMS/email/komunikatory)?',
                type: 'radio',
                required: false,
                options: [
                    { value: 'yes', label: '✅ Tak' },
                    { value: 'no', label: '❌ Nie' }
                ]
            },
            {
                id: 'messages_type',
                label: 'Jakie wiadomości?',
                type: 'checkbox',
                required: false,
                showIf: ['yes'],
                options: [
                    { value: 'sms', label: 'SMS-y' },
                    { value: 'email', label: 'Emaile' },
                    { value: 'whatsapp', label: 'WhatsApp' },
                    { value: 'messenger', label: 'Messenger' },
                    { value: 'other', label: 'Inne komunikatory' }
                ]
            },
            {
                id: 'has_financial_documents',
                label: 'Czy masz dokumenty finansowe?',
                type: 'checkbox',
                required: false,
                showIf: ['victim'],
                help: 'Dowody strat materialnych',
                options: [
                    { value: 'receipts', label: 'Paragony/faktury' },
                    { value: 'bank_statements', label: 'Wyciągi bankowe' },
                    { value: 'transfer_proofs', label: 'Potwierdzenia przelewów' },
                    { value: 'valuation', label: 'Wycena rzeczoznawcy' },
                    { value: 'insurance', label: 'Dokumenty ubezpieczenia' }
                ]
            },
            {
                id: 'has_alibidocuments',
                label: 'Czy masz dowody alibi?',
                type: 'checkbox',
                required: false,
                showIf: ['accused'],
                help: 'Dokumenty potwierdzające że byłeś gdzie indziej',
                options: [
                    { value: 'tickets', label: 'Bilety (pociąg/samolot/kino)' },
                    { value: 'receipts', label: 'Paragony z miejsca alibi' },
                    { value: 'gps', label: 'Lokalizacja GPS (Google Maps)' },
                    { value: 'reservations', label: 'Potwierdzenia rezerwacji' },
                    { value: 'work_schedule', label: 'Grafik pracy' }
                ]
            },
            {
                id: 'other_evidence',
                label: 'Inne dowody',
                type: 'textarea',
                required: false,
                rows: 3,
                placeholder: 'Wymień wszystkie inne dowody które masz...',
                help: 'Każdy dowód się liczy!'
            }
        ]
    },

    // SEKCJA 6: ŚWIADKOWIE
    section_6_witnesses: {
        id: 'witnesses',
        title: '',
        description: 'Osoby które mogą zeznawać w sprawie',
        questions: [
            {
                id: 'has_witnesses',
                label: 'Czy są świadkowie przestępstwa?',
                type: 'radio',
                required: true,
                options: [
                    { value: 'yes', label: '✅ Tak, są świadkowie' },
                    { value: 'no', label: '❌ Nie było świadków' }
                ]
            },
            {
                id: 'witness_count',
                label: 'Ile osób widziało/słyszało?',
                type: 'number',
                required: false,
                showIf: ['yes'],
                placeholder: '2',
                min: 0,
                max: 50
            },
            {
                id: 'witnesses_list',
                label: 'Lista świadków (po jednym w wierszu)',
                type: 'textarea',
                required: false,
                showIf: ['yes'],
                rows: 6,
                placeholder: 'Format:\nImię Nazwisko, tel: 123456789, co widział\nAnna Kowalska, tel: 987654321, słyszała krzyk\n\nMożesz dodać więcej szczegółów w sekcji Świadkowie w CRM',
                help: 'Podstawowe dane - szczegóły dodasz w module świadków'
            },
            {
                id: 'witnesses_credibility',
                label: 'Czy świadkowie są wiarygodni?',
                type: 'radio',
                required: false,
                showIf: ['yes'],
                options: [
                    { value: 'high', label: '✅ Tak, bardzo wiarygodni (niezależni)' },
                    { value: 'medium', label: '⚠️ Średnio (znajomi, ale uczciwi)' },
                    { value: 'low', label: '❌ Mogą być kwestionowani (rodzina, zainteresowanie)' }
                ]
            }
        ]
    },

    // SEKCJA 7: PROCEDURA I DOKUMENTY
    section_7_procedure: {
        id: 'procedure',
        title: '',
        description: 'Zrozum proces i przygotuj dokumenty',
        questions: [
            {
                id: 'understanding_procedure',
                label: 'Czy rozumiesz jak przebiega postępowanie karne?',
                type: 'radio',
                required: false,
                options: [
                    { value: 'yes', label: '✅ Tak, znam proces' },
                    { value: 'partial', label: '⚠️ Częściowo' },
                    { value: 'no', label: '❌ Nie, potrzebuję wyjaśnienia' }
                ]
            },
            {
                id: 'what_to_generate',
                label: 'Jakie dokumenty chcesz wygenerować?',
                type: 'checkbox',
                required: false,
                help: 'System AI przygotuje te dokumenty na podstawie ankiety',
                options: [
                    { value: 'complaint', label: '📄 Zawiadomienie o przestępstwie' },
                    { value: 'prosecution_request', label: '⚖️ Wniosek o ściganie' },
                    { value: 'compensation_request', label: '💰 Wniosek o zadośćuczynienie' },
                    { value: 'testimony_preparation', label: '📝 Przygotowanie do zeznań' },
                    { value: 'defense_response', label: '🛡️ Odpowiedź na zarzuty' },
                    { value: 'acquittal_motion', label: '✅ Wniosek o uniewinnienie' },
                    { value: 'appeal', label: '📋 Apelacja' }
                ]
            },
            {
                id: 'urgent_deadline',
                label: 'Czy masz pilny termin?',
                type: 'radio',
                required: false,
                options: [
                    { value: 'yes', label: '🔥 Tak, mam pilny termin!' },
                    { value: 'no', label: '⏰ Nie, mam czas' }
                ]
            },
            {
                id: 'deadline_date',
                label: 'Jaki to termin?',
                type: 'date',
                required: false,
                showIf: ['yes'],
                help: 'Do kiedy musisz złożyć dokumenty?'
            }
        ]
    },

    // PROCEDURA KARNA (Timeline edukacyjny)
    criminal_procedure: {
        title: 'PROCEDURA KARNA - JAK PRZEBIEGA PROCES?',
        description: 'Krok po kroku przez postępowanie karne',
        phases: [
            {
                phase: 1,
                name: 'ZAWIADOMIENIE O PRZESTĘPSTWIE',
                duration: '1 dzień',
                icon: '📢',
                description: 'Pierwsze zgłoszenie na policję',
                steps: [
                    { name: 'Złożenie zawiadomienia (ustnie lub pisemnie)', critical: true },
                    { name: 'Protokół przesłuchania pokrzywdzonego', critical: true },
                    { name: 'Przekazanie dowodów', help: 'Dokumenty, zdjęcia, nagrania' },
                    { name: 'Numer sprawy RSD', help: 'Dostaniesz potwierdzenie' }
                ]
            },
            {
                phase: 2,
                name: 'POSTĘPOWANIE PRZYGOTOWAWCZE',
                duration: '2-6 miesięcy',
                icon: '🔍',
                description: 'Policja i prokuratura zbierają dowody',
                steps: [
                    { name: 'Śledztwo policyjne', help: 'Oględziny, zabezpieczenie dowodów' },
                    { name: 'Przesłuchania świadków', critical: true },
                    { name: 'Ekspertyzy (jeśli potrzebne)', help: 'Medyczne, techniczne' },
                    { name: 'Konfrontacje', help: 'Pokrzywdzony vs sprawca' },
                    { name: 'Decyzja prokuratora', critical: true, help: 'Akt oskarżenia lub umorzenie' }
                ]
            },
            {
                phase: 3,
                name: 'AKT OSKARŻENIA',
                duration: '1-2 tygodnie',
                icon: '📋',
                description: 'Sprawa trafia do sądu',
                steps: [
                    { name: 'Prokuratura sporządza akt oskarżenia', critical: true },
                    { name: 'Przekazanie do sądu', help: 'Sąd nadaje sygnaturę' },
                    { name: 'Doręczenie aktu oskarżonemu', critical: true },
                    { name: 'Termin na odpowiedź (30 dni)', deadline_days: 30 }
                ]
            },
            {
                phase: 4,
                name: 'POSTĘPOWANIE SĄDOWE',
                duration: '6-18 miesięcy',
                icon: '⚖️',
                description: 'Proces przed sądem',
                steps: [
                    { name: 'Wyznaczenie terminu rozprawy', help: '2-6 miesięcy oczekiwania' },
                    { name: 'Pierwsza rozprawa', critical: true },
                    { name: 'Przesłuchanie stron', help: 'Oskarżony, pokrzywdzony' },
                    { name: 'Zeznania świadków', critical: true },
                    { name: 'Opinie biegłych (jeśli są)', help: 'Ekspertyzy' },
                    { name: 'Mowy końcowe', help: 'Prokurator i obrońca' },
                    { name: 'Ostatnie słowo oskarżonego', critical: true },
                    { name: 'WYROK', critical: true }
                ]
            },
            {
                phase: 5,
                name: 'WYROK I APELACJA',
                duration: '1-3 miesiące',
                icon: '📜',
                description: 'Ogłoszenie wyroku i możliwość odwołania',
                steps: [
                    { name: 'Ogłoszenie wyroku', critical: true },
                    { name: 'Uzasadnienie pisemne (7 dni)', help: 'Jeśli strona wnioskowała' },
                    { name: 'Termin na apelację (14 dni)', critical: true, deadline_days: 14 },
                    { name: 'Sporządzenie apelacji', help: 'Jeśli nie zgadzasz się z wyrokiem' },
                    { name: 'Rozprawa apelacyjna (Sąd II instancji)', help: '6-12 miesięcy' },
                    { name: 'Wyrok prawomocny', critical: true }
                ]
            },
            {
                phase: 6,
                name: 'WYKONANIE WYROKU',
                duration: 'zmienne',
                icon: '👮',
                description: 'Realizacja kary lub zadośćuczynienia',
                steps: [
                    { name: 'Kara więzienia → wezwanie do odbycia', help: 'Jeśli skazanie' },
                    { name: 'Grzywna → wezwanie do zapłaty', help: 'Termin 30 dni' },
                    { name: 'Zadośćuczynienie → egzekucja komornicza', help: 'Jeśli sprawca nie płaci' },
                    { name: 'Dozór kuratorski → obowiązki', help: 'Jeśli zawieszenie' }
                ]
            }
        ]
    },

    // DOKUMENTY DO WYGENEROWANIA
    required_documents: [
        // DLA POKRZYWDZONEGO
        {
            id: 'complaint_notification',
            name: '📄 Zawiadomienie o przestępstwie',
            for_role: 'victim',
            required: true,
            canGenerate: true,
            description: 'Formalne zgłoszenie przestępstwa na policję/prokuraturę',
            howTo: [
                '1. System wygeneruje pełne zawiadomienie',
                '2. Zawiera: Twoje dane, dane sprawcy, opis czynu, dowody',
                '3. Wydrukuj lub zapisz PDF',
                '4. Złóż osobiście na komisariacie LUB wyślij pocztą',
                '5. Zachowaj potwierdzenie przyjęcia!'
            ]
        },
        {
            id: 'prosecution_request',
            name: '⚖️ Wniosek o ściganie',
            for_role: 'victim',
            required: false,
            canGenerate: true,
            description: 'Dla przestępstw ściganych z oskarżenia prywatnego',
            howTo: [
                '1. Potrzebne gdy przestępstwo wymaga Twojego wniosku',
                '2. Np. pobicie lekkie, zniszczenie mienia do 500 zł',
                '3. System sprawdzi czy potrzebne',
                '4. Złożyć razem z zawiadomieniem'
            ]
        },
        {
            id: 'compensation_claim',
            name: '💰 Wniosek o zadośćuczynienie i odszkodowanie',
            for_role: 'victim',
            required: false,
            canGenerate: true,
            description: 'Roszczenie cywilne w postępowaniu karnym',
            howTo: [
                '1. Możesz złożyć w trakcie procesu karnego',
                '2. System obliczy realistyczną kwotę',
                '3. Obrażenia + straty + krzywda moralna',
                '4. Alternatywa: osobny proces cywilny (później)'
            ]
        },
        {
            id: 'testimony_prep',
            name: '📝 Przygotowanie do zeznań pokrzywdzonego',
            for_role: 'victim',
            required: false,
            canGenerate: true,
            description: 'Jak zeznawać na policji i w sądzie',
            howTo: [
                '1. System przygotuje Cię do przesłuchania',
                '2. Jakie pytania zadadzą?',
                '3. Jak odpowiadać?',
                '4. Czego unikać?',
                '5. Twoje prawa podczas przesłuchania'
            ]
        },

        // DLA OSKARŻONEGO
        {
            id: 'defense_response',
            name: '🛡️ Odpowiedź na zarzuty',
            for_role: 'accused',
            required: true,
            canGenerate: true,
            description: 'Pismo do prokuratury z Twoją wersją wydarzeń',
            howTo: [
                '1. System wygeneruje odpowiedź na podstawie Twojej strategii',
                '2. Zawiera: stanowisko, wyjaśnienia, dowody obrony',
                '3. Złożyć w prokuraturze prowadzącej',
                '4. Termin: najlepiej szybko (brak limitu czasu)',
                '5. UWAGA: Możesz skorzystać z prawa do milczenia!'
            ]
        },
        {
            id: 'acquittal_motion',
            name: '✅ Wniosek o uniewinnienie',
            for_role: 'accused',
            required: false,
            canGenerate: true,
            description: 'Wniosek składany w sądzie podczas procesu',
            howTo: [
                '1. Składany podczas rozprawy lub po zebraniu dowodów',
                '2. System przygotuje argumentację prawną',
                '3. Dlaczego powinieneś być uniewinniony',
                '4. Analiza błędów oskarżenia',
                '5. Wskazanie sprzeczności w dowodach'
            ]
        },
        {
            id: 'closing_statement',
            name: '📢 Mowa końcowa (obrona)',
            for_role: 'accused',
            required: false,
            canGenerate: true,
            description: 'Twoja ostatnia mowa przed wyrokiem',
            howTo: [
                '1. Składana na końcu rozprawy',
                '2. System przygotuje szkic',
                '3. Podsumowanie Twojej obrony',
                '4. Apel do sądu',
                '5. Możesz czytać z kartki!'
            ]
        },
        {
            id: 'appeal',
            name: '📋 Apelacja od wyroku',
            for_role: 'accused',
            required: false,
            canGenerate: true,
            description: 'Odwołanie od wyroku do sądu II instancji',
            howTo: [
                '1. Termin: 14 dni od doręczenia wyroku!',
                '2. System przygotuje apelację',
                '3. Wskaże błędy sądu I instancji',
                '4. Złożyć w sądzie który wydał wyrok',
                '5. Rozprawa apelacyjna za 6-12 miesięcy'
            ]
        },

        // DLA OBOICH
        {
            id: 'witness_list',
            name: '👥 Lista świadków z danymi kontaktowymi',
            for_role: 'both',
            required: false,
            canGenerate: true,
            description: 'Uporządkowana lista świadków do wezwania',
            howTo: [
                '1. System zbierze wszystkich świadków z ankiety',
                '2. Przygotuje tabelę: imię, nazwisko, adres, czego dotyczy zeznanie',
                '3. Możesz załączyć do wniosków',
                '4. Sąd/prokuratura wezwie świadków'
            ]
        }
    ]
};

console.log('✅ Ankieta karna część 3 załadowana!');
console.log('📅 Part3 - Fazy procedury:', window.criminalQuestionnaire_Part3.criminal_procedure.phases.length);
console.log('📄 Part3 - Dokumenty:', window.criminalQuestionnaire_Part3.required_documents.length);
