// 💰 ANKIETA ODSZKODOWAWCZA - CZĘŚĆ 2: Sekcje 6-10 + Procedura + Dokumenty
console.log('💰 Ładuję ankietę odszkodowawczą - część 2...');

window.compensationQuestionnaire_Part2 = {
    sections_6_10: [
        {
            id: 'injuries',
            title: 'Obrażenia i uszczerbek',
            icon: '🏥',
            help: 'Szczegóły obrażeń ciała (jeśli dotyczy)',
            questions: [
                {
                    id: 'injuries_description',
                    label: 'Szczegółowy opis obrażeń',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Złamanie kości udowej, stłuczenie głowy...',
                    help: 'Opisz wszystkie obrażenia dokładnie - im więcej szczegółów, tym wyższe odszkodowanie'
                },
                {
                    id: 'hospitalization',
                    label: 'Czy była hospitalizacja?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'hospital_days',
                    label: 'Liczba dni w szpitalu',
                    type: 'number',
                    required: false,
                    help: 'Każdy dzień hospitalizacji zwiększa wartość zadośćuczynienia!'
                },
                {
                    id: 'work_inability_days',
                    label: 'Liczba dni niezdolności do pracy',
                    type: 'number',
                    required: false,
                    help: 'Według zwolnień lekarskich'
                },
                {
                    id: 'permanent_injury',
                    label: 'Czy jest trwały uszczerbek na zdrowiu?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: 'Tak - ustalono procent' },
                        { value: 'pending', label: 'W trakcie ustalania' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'injury_percentage',
                    label: 'Procent trwałego uszczerbku (%)',
                    type: 'number',
                    required: false,
                    placeholder: '15',
                    help: 'Ustala lekarz orzecznik - im wyższy %, tym wyższe zadośćuczynienie (nawet setki tys. zł!)'
                },
                {
                    id: 'rehabilitation_needed',
                    label: 'Czy potrzebna rehabilitacja?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' },
                        { value: 'ongoing', label: 'W trakcie' }
                    ]
                }
            ]
        },
        {
            id: 'defendant',
            title: 'Strona przeciwna',
            icon: '👥',
            help: 'Dane sprawcy/pozwanego',
            questions: [
                {
                    id: 'defendant_type',
                    label: 'Typ strony przeciwnej',
                    type: 'select',
                    required: false,
                    options: [
                        { value: 'person', label: '👤 Osoba fizyczna' },
                        { value: 'company', label: '🏢 Firma' },
                        { value: 'institution', label: '🏛️ Instytucja/Urząd' },
                        { value: 'unknown', label: '❓ Nieznana' }
                    ]
                },
                {
                    id: 'defendant_name',
                    label: 'Imię i nazwisko / Nazwa firmy pozwanego',
                    type: 'text',
                    required: false,
                    placeholder: 'Jan Kowalski / ABC Sp. z o.o.',
                    help: 'Dokładne dane sprawcy - niezbędne do pozwu (sprawdzisz w protokole lub oświadczeniu)'
                },
                {
                    id: 'defendant_address',
                    label: 'Adres pozwanego',
                    type: 'text',
                    required: false,
                    placeholder: 'ul. Przykładowa 10, 00-001 Warszawa',
                    help: 'Adres do korespondencji i doręczeń sądowych - musi być aktualny!'
                },
                {
                    id: 'defendant_insurance',
                    label: 'TU pozwanego (jeśli znane)',
                    type: 'text',
                    required: false,
                    placeholder: 'PZU, Warta...',
                    help: 'TU sprawcy - to ono zapłaci odszkodowanie (nie sprawca z własnej kieszeni)'
                },
                {
                    id: 'defendant_has_lawyer',
                    label: 'Czy pozwany ma pełnomocnika?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' },
                        { value: 'unknown', label: 'Nie wiadomo' }
                    ]
                }
            ]
        },
        {
            id: 'evidence',
            title: 'Dowody',
            icon: '📎',
            help: 'Jakie dowody posiadasz?',
            questions: [
                {
                    id: 'has_photos',
                    label: 'Czy są zdjęcia miejsca/pojazdu/obrażeń?',
                    type: 'radio',
                    required: false,
                    help: 'Zdjęcia to jeden z najlepszych dowódów - rób je zawsze natychmiast po zdarzeniu!',
                    options: [
                        { value: 'yes', label: 'Tak - mam zdjęcia' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'has_video',
                    label: 'Czy są nagrania (kamera, świadkowie)?',
                    type: 'radio',
                    required: false,
                    help: 'Nagrania z dash cam lub monitoringu są bezcenne - jednoznacznie ustalają przebieg zdarzenia',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'has_witnesses',
                    label: 'Czy są świadkowie zdarzenia?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: 'Tak - mam dane świadków' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'has_medical_docs',
                    label: 'Czy są dokumenty medyczne?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: 'Tak - karty, wyniki, zwolnienia' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'has_receipts',
                    label: 'Czy są faktury/paragony za koszty?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: 'Tak - leczenie, naprawy, itp.' },
                        { value: 'no', label: 'Nie' }
                    ]
                }
            ]
        },
        {
            id: 'lawsuit_status',
            title: 'Status sprawy sądowej',
            icon: '⚖️',
            help: 'Informacje o postępowaniu',
            questions: [
                {
                    id: 'lawsuit_filed',
                    label: 'Czy złożono pozew?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: 'Tak - sprawa w sądzie' },
                        { value: 'no', label: 'Nie - przed pozwem' }
                    ]
                },
                {
                    id: 'lawsuit_date',
                    label: 'Data złożenia pozwu',
                    type: 'date',
                    required: false
                },
                {
                    id: 'court_name',
                    label: 'Nazwa sądu',
                    type: 'text',
                    required: false,
                    placeholder: 'Sąd Rejonowy w Warszawie'
                },
                {
                    id: 'case_signature',
                    label: 'Sygnatura sprawy',
                    type: 'text',
                    required: false,
                    placeholder: 'I C 123/2025'
                }
            ]
        },
        {
            id: 'goals',
            title: 'Cele i oczekiwania',
            icon: '🎯',
            help: 'Co jest najważniejsze dla klienta?',
            questions: [
                {
                    id: 'client_priorities',
                    label: 'Priorytety klienta (można zaznaczyć kilka)',
                    type: 'checkbox',
                    required: false,
                    options: [
                        { value: 'max_amount', label: '💰 Najwyższa możliwa kwota' },
                        { value: 'fast_resolution', label: '⚡ Szybkie zakończenie sprawy' },
                        { value: 'amicable_settlement', label: '🤝 Ugoda polubowna' },
                        { value: 'court_case', label: '⚖️ Proces sądowy (walka do końca)' },
                        { value: 'moral_satisfaction', label: '✊ Zadośćuczynienie moralne' }
                    ]
                },
                {
                    id: 'urgency_level',
                    label: 'Pilność sprawy',
                    type: 'select',
                    required: false,
                    options: [
                        { value: 'very_urgent', label: '🔴 Bardzo pilna (termin się kończy)' },
                        { value: 'urgent', label: '🟡 Pilna' },
                        { value: 'normal', label: '🟢 Normalna' },
                        { value: 'low', label: '🔵 Niska' }
                    ]
                },
                {
                    id: 'additional_info',
                    label: 'Dodatkowe informacje',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Wszelkie inne istotne informacje...'
                }
            ]
        }
    ],
    
    procedure: {
        title: 'PROCEDURA DOCHODZENIA ODSZKODOWANIA',
        description: 'Kompletny proces od zgłoszenia do wypłaty',
        phases: [
            {
                phase: 1,
                name: 'ZGŁOSZENIE I ANALIZA',
                duration: '1-7 dni',
                icon: '📋',
                description: 'Wstępna ocena sprawy i zebranie dokumentów',
                tasks: [
                    { name: 'Zebranie dokumentów od klienta', critical: true },
                    { name: 'Analiza szans powodzenia' },
                    { name: 'Wstępna wycena roszczenia' },
                    { name: 'Identyfikacja strony odpowiedzialnej' },
                    { name: 'Sprawdzenie polis ubezpieczeniowych' }
                ]
            },
            {
                phase: 2,
                name: 'POSTĘPOWANIE LIKWIDACYJNE',
                duration: '30-90 dni',
                icon: '🔍',
                description: 'Zgłoszenie szkody do TU i oczekiwanie na decyzję',
                tasks: [
                    { name: 'Zgłoszenie szkody do TU', critical: true },
                    { name: 'Monitorowanie postępowania TU' },
                    { name: 'Dostarczanie dokumentów na żądanie TU' },
                    { name: 'Uzyskanie opinii rzeczoznawcy TU' },
                    { name: 'Oczekiwanie na decyzję TU', help: 'TU ma 30 dni na decyzję' }
                ]
            },
            {
                phase: 3,
                name: 'NEGOCJACJE Z TU',
                duration: '30-60 dni',
                icon: '🤝',
                description: 'Rozmowy w celu zwiększenia kwoty odszkodowania',
                tasks: [
                    { name: 'Analiza decyzji TU' },
                    { name: 'Przygotowanie kontrargumentów', critical: true },
                    { name: 'Rozmowy z likwidatorem' },
                    { name: 'Przedstawienie własnej wyceny' },
                    { name: 'Negocjacje kwoty' },
                    { name: 'Próba ugody pozasądowej' }
                ]
            },
            {
                phase: 4,
                name: 'WEZWANIE PRZEDSĄDOWE',
                duration: '14-30 dni',
                icon: '⚠️',
                description: 'Ostateczne wezwanie przed pozwem',
                tasks: [
                    { name: 'Przygotowanie wezwania do zapłaty', critical: true },
                    { name: 'Wysłanie wezwania listem poleconym' },
                    { name: 'Wyznaczenie terminu odpowiedzi (14 dni)' },
                    { name: 'Oczekiwanie na odpowiedź' },
                    { name: 'Ostateczne negocjacje' }
                ]
            },
            {
                phase: 5,
                name: 'POZEW I POSTĘPOWANIE SĄDOWE',
                duration: '6-18 miesięcy',
                icon: '⚖️',
                description: 'Proces sądowy o zapłatę odszkodowania',
                tasks: [
                    { name: 'Przygotowanie pozwu', critical: true },
                    { name: 'Zebranie dowodów' },
                    { name: 'Złożenie pozwu w sądzie' },
                    { name: 'Opłata sądowa (5% wartości)' },
                    { name: 'Oczekiwanie na termin rozprawy' },
                    { name: 'Udział w rozprawach' },
                    { name: 'Opinia biegłego (jeśli potrzebna)' }
                ]
            },
            {
                phase: 6,
                name: 'DOWODY I OPINIE',
                duration: '3-6 miesięcy',
                icon: '💡',
                description: 'Postępowanie dowodowe',
                tasks: [
                    { name: 'Zeznania świadków' },
                    { name: 'Opinia biegłego z zakresu medycyny' },
                    { name: 'Opinia biegłego rzeczoznawcy (pojazdy)' },
                    { name: 'Dokumentacja fotograficzna' },
                    { name: 'Dokumentacja medyczna' }
                ]
            },
            {
                phase: 7,
                name: 'WYROK',
                duration: '1-3 miesiące',
                icon: '📜',
                description: 'Oczekiwanie i analiza wyroku',
                tasks: [
                    { name: 'Oczekiwanie na wyrok' },
                    { name: 'Analiza wyroku', critical: true },
                    { name: 'Decyzja o apelacji (14 dni)' },
                    { name: 'Uzasadnienie pisemne' },
                    { name: 'Klauzula wykonalności' }
                ]
            },
            {
                phase: 8,
                name: 'EGZEKUCJA',
                duration: '3-12 miesięcy',
                icon: '💰',
                description: 'Ściągnięcie należności',
                tasks: [
                    { name: 'Wezwanie do dobrowolnej zapłaty' },
                    { name: 'Wniosek o egzekucję komorniczą', critical: true },
                    { name: 'Zajęcie rachunków bankowych' },
                    { name: 'Zajęcie wynagrodzenia' },
                    { name: 'Ściągnięcie należności' }
                ]
            }
        ]
    },
    
    requiredDocuments: [
        {
            id: 'power_of_attorney_comp',
            name: '📋 Pełnomocnictwo',
            required: true,
            canUpload: true,
            canGenerate: true,
            description: 'Pełnomocnictwo do reprezentowania w sprawie odszkodowawczej',
            howTo: [
                '1. System wygeneruje pełnomocnictwo automatycznie',
                '2. Wydrukuj dokument (2 egzemplarze)',
                '3. Podpisz osobiście (WAŻNE: własnoręczny podpis!)',
                '4. Zeskanuj lub zrób wyraźne zdjęcie',
                '5. Załącz do sprawy - radca będzie mógł reprezentować Cię przed TU i sądem'
            ]
        },
        {
            id: 'compensation_claim',
            name: '📄 Wniosek o wypłatę odszkodowania',
            required: true,
            canUpload: true,
            canGenerate: true,
            description: 'Formalny wniosek do TU o wypłatę odszkodowania',
            howTo: [
                '1. AI wygeneruje wniosek na podstawie Twoich odpowiedzi',
                '2. Sprawdź wszystkie dane (kwota, okoliczności, dane TU)',
                '3. Podpisz wniosek',
                '4. Wyślij do TU listem poleconym za potwierdzeniem odbioru',
                '5. Zachowaj dowód nadania - to początek biegu terminów!',
                '6. TU ma 30 dni na decyzję od otrzymania wniosku'
            ]
        },
        {
            id: 'prelitigation_letter',
            name: '⚠️ Wezwanie przedsądowe',
            required: false,
            canUpload: true,
            canGenerate: true,
            description: 'Wezwanie do zapłaty przed złożeniem pozwu',
            howTo: [
                '1. Używaj TYLKO jeśli TU odmówiło lub zaoferowało za mało',
                '2. System wygeneruje wezwanie z 14-dniowym terminem',
                '3. Wyślij listem poleconym za potwierdzeniem',
                '4. Wezwanie jest WARUNKIEM złożenia pozwu',
                '5. Czekaj 14 dni - TU może jeszcze zapłacić dobrowolnie',
                '6. Po terminie możesz iść do sądu'
            ]
        },
        {
            id: 'lawsuit_compensation',
            name: '⚖️ Pozew o zapłatę odszkodowania',
            required: false,
            canUpload: true,
            canGenerate: true,
            description: 'Pozew do sądu o zasądzenie odszkodowania',
            howTo: [
                '1. AI przygotuje profesjonalny pozew',
                '2. Załącz WSZYSTKIE dowody (dokumenty medyczne, kosztorysy, zdjęcia)',
                '3. Opłata sądowa: 5% wartości przedmiotu sporu (min. 30 zł, maks. 200 000 zł)',
                '4. Złóż w sądzie właściwym (zazwyczaj sąd miejsca zamieszkania pozwanego)',
                '5. Proces trwa średnio 6-18 miesięcy',
                '6. Możliwa opinia biegłego (TU płaci koszty jeśli przegrają)'
            ]
        },
        {
            id: 'police_protocol',
            name: '🚓 Protokół policji',
            required: false,
            canUpload: true,
            description: 'Protokół z miejsca zdarzenia (jeśli policja interweniowała)',
            howTo: [
                '1. Jeśli policja była na miejscu - ZAWSZE poproś o protokół',
                '2. Pobierz w komisariacie (wniosek o udostępnienie)',
                '3. Termin: maksymalnie 14 dni',
                '4. Koszt: zazwyczaj darmowy lub symboliczny (kilka zł)',
                '5. Protokół to MOCNY dowód (ustalenia policji trudno podważyć)',
                '6. Jeśli sprawca był winny - TU szybciej wypłaci odszkodowanie'
            ]
        },
        {
            id: 'photos_evidence',
            name: '📸 Zdjęcia miejsca/pojazdu/obrażeń',
            required: false,
            canUpload: true,
            description: 'Dokumentacja fotograficzna szkody',
            howTo: [
                '1. Rób zdjęcia NATYCHMIAST po zdarzeniu!',
                '2. Sfotografuj: miejsce wypadku, uszkodzenia pojazdu/mienia, obrażenia ciała',
                '3. Zrób zdjęcia z różnych perspektyw (blisko i z daleka)',
                '4. Zdjęcia obrażeń: dzień wypadku, kilka dni później, po wygojeniu (blizny)',
                '5. Akceptowane formaty: JPG, PNG, PDF',
                '6. Dobre zdjęcia mogą zwiększyć odszkodowanie o 20-30%!'
            ]
        },
        {
            id: 'repair_estimate',
            name: '🛠️ Kosztorys naprawy',
            required: false,
            canUpload: true,
            description: 'Wycena kosztów naprawy pojazdu/mienia',
            howTo: [
                '1. Zleć kosztorys w autoryzowanym warsztacie',
                '2. Koszt: zazwyczaj darmowy (warsztat liczy na naprawę)',
                '3. Kosztorys powinien zawierać: listę części, robociznę, czas naprawy',
                '4. Możesz zlecić 2-3 kosztorysy (TU musi uznać najwyższy w rozsądnych granicach)',
                '5. Nie naprawiaj przed decyzją TU! (chyba że konieczne)',
                '6. TU często zaniża - Twój niezależny kosztorys to ochrona'
            ]
        },
        {
            id: 'expert_opinion_vehicle',
            name: '📑 Opinia rzeczoznawcy samochodowego',
            required: false,
            canUpload: true,
            description: 'Niezależna opinia o wysokości szkody'
        },
        {
            id: 'vehicle_registration',
            name: '🚙 Dowód rejestracyjny',
            required: false,
            canUpload: true,
            description: 'Kopia dowodu rejestracyjnego pojazdu'
        },
        {
            id: 'insurance_policy',
            name: '📜 Polisa OC/AC',
            required: false,
            canUpload: true,
            description: 'Kopia polisy ubezpieczeniowej'
        },
        {
            id: 'medical_documentation',
            name: '🏥 Dokumentacja medyczna',
            required: false,
            canUpload: true,
            description: 'Karty szpitalne, wyniki badań, zwolnienia lekarskie',
            howTo: [
                '1. Zbierz CAŁĄ dokumentację medyczną od dnia zdarzenia',
                '2. Potrzebne: karty szpitalne, karty informacyjne, wyniki badań RTG/TK/MRI',
                '3. Zwolnienia L4 (wszystkie!)',
                '4. Opisy leczenia ambulatoryjnego',
                '5. Recepty i dowody zakupu leków',
                '6. IM WIĘCEJ dokumentów, TYM WYŻSZA kwota odszkodowania!'
            ]
        },
        {
            id: 'medical_receipts',
            name: '💊 Recepty i paragony za leczenie',
            required: false,
            canUpload: true,
            description: 'Dowody kosztów leczenia i leków'
        },
        {
            id: 'medical_expert_opinion',
            name: '🩺 Opinia medyczna o uszczerbku',
            required: false,
            canUpload: true,
            description: 'Orzeczenie lekarskie o procentzie trwałego uszczerbku',
            howTo: [
                '1. KLUCZOWY dokument dla wysokiego zadośćuczynienia!',
                '2. Pobierz skierowanie od radcy prawnego',
                '3. Umów się na badanie u lekarza sądowego/orzecznika',
                '4. Koszt: 300-800 zł (zwróci TU jeśli wygrasz)',
                '5. Lekarz określi % trwałego uszczerbku na zdrowiu',
                '6. Im wyższy %, tym wyższe zadośćuczynienie (nawet kilkaset tys. zł!)'
            ]
        },
        {
            id: 'work_inability_certificate',
            name: '📋 Zaświadczenie o niezdolności do pracy',
            required: false,
            canUpload: true,
            description: 'Zwolnienia lekarskie L4'
        },
        {
            id: 'income_certificate',
            name: '💰 Zaświadczenie o dochodach',
            required: false,
            canUpload: true,
            description: 'Potwierdzenie wysokości wynagrodzenia'
        },
        {
            id: 'witness_testimonies',
            name: '👥 Zeznania świadków',
            required: false,
            canUpload: true,
            description: 'Pisemne zeznania lub dane kontaktowe świadków'
        },
        {
            id: 'video_evidence',
            name: '📹 Nagrania',
            required: false,
            canUpload: true,
            description: 'Nagrania z kamer, dash cam, monitoringu'
        },
        {
            id: 'bank_statements',
            name: '📊 Wyciągi bankowe',
            required: false,
            canUpload: true,
            description: 'Potwierdzenie poniesionych kosztów'
        },
        {
            id: 'other_invoices',
            name: '🧾 Faktury za koszty',
            required: false,
            canUpload: true,
            description: 'Faktury za naprawy, leczenie, transport itp.'
        },
        {
            id: 'tu_correspondence',
            name: '📧 Korespondencja z TU',
            required: false,
            canUpload: true,
            description: 'Wszystkie pisma od i do towarzystwa ubezpieczeniowego'
        },
        {
            id: 'tu_decision',
            name: '📄 Decyzja TU',
            required: false,
            canUpload: true,
            description: 'Decyzja o wypłacie lub odmowie wypłaty odszkodowania',
            howTo: [
                '1. Załącz decyzję TU (pismo o wypłacie lub odmowie)',
                '2. SPRAWDŹ datę otrzymania - masz 3 lata na pozew!',
                '3. Przeanalizuj uzasadnienie TU (często błędne!)',
                '4. Jeśli TU zaniżyło kwotę - możesz negocjować lub pozwać',
                '5. Typowe zaniżenia TU: 30-50% rzeczywistej wartości szkody',
                '6. Radca przeanalizuje decyzję i doradzi najlepszą strategię'
            ]
        },
        {
            id: 'other_evidence_comp',
            name: '📎 Inne dowody',
            required: false,
            canUpload: true,
            description: 'Wszelkie inne dokumenty mogące pomóc w sprawie'
        }
    ]
};

console.log('✅ Ankieta odszkodowawcza część 2 (sekcje 6-10, procedura, dokumenty) załadowana!');
console.log('📊 Part2 - Sekcje:', window.compensationQuestionnaire_Part2.sections_6_10.length);
console.log('📄 Part2 - Dokumenty:', window.compensationQuestionnaire_Part2.requiredDocuments.length);
console.log('📅 Part2 - Fazy procedury:', window.compensationQuestionnaire_Part2.procedure.phases.length);
