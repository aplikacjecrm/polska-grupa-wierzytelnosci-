// 💰 ANKIETA ODSZKODOWAWCZA - CZĘŚĆ 1: Sekcje 1-5
// Pełna wersja gotowa do rozbudowy
console.log('💰 Ładuję ankietę odszkodowawczą - część 1...');

window.compensationQuestionnaire_Part1 = {
    sections_1_5: [
        {
            id: 'claim_type',
            title: 'Typ sprawy',
            icon: '🎯',
            description: 'Jaki rodzaj szkody?',
            help: 'Określ jakiego typu jest odszkodowanie',
            questions: [
                {
                    id: 'claim_category',
                    label: 'Kategoria roszczenia',
                    type: 'select',
                    required: false,
                    help: 'Wybierz typ zdarzenia - od tego zależą dalsze pytania i procedura',
                    options: [
                        { value: 'car_accident', label: '🚗 Wypadek komunikacyjny' },
                        { value: 'bodily_injury', label: '🤕 Obrażenia ciała (pobicie, upadek)' },
                        { value: 'medical_error', label: '🏥 Błąd medyczny' },
                        { value: 'property_damage', label: '🏠 Szkoda majątkowa (pożar, zalanie)' },
                        { value: 'death', label: '⚰️ Śmierć osoby bliskiej' },
                        { value: 'work_accident', label: '🏭 Wypadek przy pracy' },
                        { value: 'state_damage', label: '🏛️ Szkoda od państwa/samorządu' },
                        { value: 'other', label: '📋 Inne' }
                    ]
                },
                {
                    id: 'has_insurance_company',
                    label: 'Czy sprawa dotyczy towarzystwa ubezpieczeniowego?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: '✅ Tak - ubezpieczyciel jest stroną' },
                        { value: 'no', label: '❌ Nie - sprawa prywatna/bezpośrednia' }
                    ],
                    help: '70% spraw odszkodowawczych dotyczy TU'
                },
                {
                    id: 'claim_status',
                    label: 'Na jakim etapie jest sprawa?',
                    type: 'select',
                    required: false,
                    help: 'Określ bieżący status - pomoże to ustalić najlepszą strategię działania',
                    options: [
                        { value: 'before_claim', label: '📋 Przed zgłoszeniem do TU' },
                        { value: 'claim_pending', label: '⏳ Zgłoszone - oczekiwanie na decyzję' },
                        { value: 'claim_rejected', label: '❌ Odmowa wypłaty przez TU' },
                        { value: 'claim_partial', label: '💰 Oferta za niska' },
                        { value: 'negotiations', label: '🤝 Negocjacje' },
                        { value: 'before_lawsuit', label: '⚖️ Przed pozwem' },
                        { value: 'lawsuit_filed', label: '📄 Pozew złożony' },
                        { value: 'court_pending', label: '🏛️ W trakcie procesu' }
                    ]
                }
            ]
        },
        {
            id: 'victim',
            title: 'Poszkodowany',
            icon: '👤',
            help: 'Dane osoby poszkodowanej',
            questions: [
                {
                    id: 'victim_name',
                    label: 'Imię i nazwisko poszkodowanego',
                    type: 'text',
                    required: false,
                    placeholder: 'Jan Kowalski',
                    help: 'Osoba, która doznała szkody - może być różna od klienta'
                },
                {
                    id: 'victim_pesel',
                    label: 'PESEL',
                    type: 'text',
                    required: false,
                    placeholder: '12345678901',
                    help: 'PESEL poszkodowanego (11 cyfr) - potrzebny do dokumentów'
                },
                {
                    id: 'victim_address',
                    label: 'Adres zamieszkania',
                    type: 'text',
                    required: false,
                    placeholder: 'ul. Przykładowa 1, 00-001 Warszawa'
                },
                {
                    id: 'victim_phone',
                    label: 'Telefon kontaktowy',
                    type: 'text',
                    required: false,
                    placeholder: '+48 123 456 789'
                },
                {
                    id: 'victim_email',
                    label: 'Email',
                    type: 'email',
                    required: false,
                    placeholder: 'jan.kowalski@example.com'
                },
                {
                    id: 'relation_to_client',
                    label: 'Kim jest poszkodowany dla klienta?',
                    type: 'select',
                    required: false,
                    help: 'Określ relację - wpływa na zakres uprawnień do dochodzenia roszczenia',
                    options: [
                        { value: 'self', label: 'Sam klient (poszkodowany = klient)' },
                        { value: 'spouse', label: 'Małżonek' },
                        { value: 'child', label: 'Dziecko' },
                        { value: 'parent', label: 'Rodzic' },
                        { value: 'sibling', label: 'Rodzeństwo' },
                        { value: 'other_family', label: 'Inny członek rodziny' },
                        { value: 'third_party', label: 'Osoba trzecia' }
                    ]
                }
            ]
        },
        {
            id: 'event_details',
            title: 'Zdarzenie',
            icon: '📍',
            help: 'Szczegóły zdarzenia powodującego szkodę',
            questions: [
                {
                    id: 'event_date',
                    label: 'Data zdarzenia',
                    type: 'date',
                    required: false,
                    help: 'Dokładna data wypadku/zdarzenia - kluczowa dla terminów (przedawnienie: 3 lata!)'
                },
                {
                    id: 'event_time',
                    label: 'Godzina zdarzenia',
                    type: 'text',
                    required: false,
                    placeholder: '14:30',
                    help: 'Godzina może być istotna (np. pora dnia, oświetlenie, natężenie ruchu)'
                },
                {
                    id: 'event_place',
                    label: 'Miejsce zdarzenia (dokładny adres)',
                    type: 'text',
                    required: false,
                    placeholder: 'ul. Marszałkowska 10, Warszawa',
                    help: 'Im dokładniej, tym lepiej - podaj ulicę, numer, miasto, ewentualnie km drogi'
                },
                {
                    id: 'event_description',
                    label: 'Szczegółowy opis przebiegu zdarzenia',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Opisz dokładnie co się wydarzyło...',
                    help: 'Im więcej szczegółów, tym lepiej'
                },
                {
                    id: 'police_involved',
                    label: 'Czy wezwano policję?',
                    type: 'radio',
                    required: false,
                    help: 'Protokół policji to silny dowód - jeśli była policja, koniecznie pobierz protokół!',
                    options: [
                        { value: 'yes', label: 'Tak - policja przyjechała' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'police_report_number',
                    label: 'Numer protokołu/postępowania',
                    type: 'text',
                    required: false,
                    placeholder: 'KPP-123/2024',
                    help: 'Numer nadany przez policję - znajdziesz go na potwierdzeniu interwencji'
                },
                {
                    id: 'witnesses',
                    label: 'Świadkowie (imiona, nazwiska, telefony)',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Jan Kowalski, +48 123 456 789\nAnna Nowak, +48 987 654 321',
                    help: 'Świadkowie mogą być kluczowi! Podaj dane kontaktowe - każdy liczy się'
                }
            ]
        },
        {
            id: 'insurance_company',
            title: 'Towarzystwo ubezpieczeniowe',
            icon: '🏢',
            help: 'Dane TU i status likwidacji szkody',
            questions: [
                {
                    id: 'insurance_company_name',
                    label: 'Nazwa towarzystwa ubezpieczeniowego',
                    type: 'select',
                    required: false,
                    options: [
                        { value: 'pzu', label: 'PZU S.A.' },
                        { value: 'warta', label: 'Warta S.A.' },
                        { value: 'ergo_hestia', label: 'Ergo Hestia' },
                        { value: 'generali', label: 'Generali' },
                        { value: 'allianz', label: 'Allianz' },
                        { value: 'link4', label: 'Link4' },
                        { value: 'compensa', label: 'Compensa' },
                        { value: 'uniqa', label: 'Uniqa' },
                        { value: 'wiener', label: 'Wiener' },
                        { value: 'interrisk', label: 'InterRisk' },
                        { value: 'axa', label: 'AXA' },
                        { value: 'proama', label: 'Proama' },
                        { value: 'hdi', label: 'HDI' },
                        { value: 'gothaer', label: 'Gothaer' },
                        { value: 'trasti', label: 'Trasti' },
                        { value: 'other', label: 'Inne' }
                    ],
                    help: 'Wybierz z listy lub zaznacz "Inne"'
                },
                {
                    id: 'insurance_company_other',
                    label: 'Podaj nazwę TU',
                    type: 'text',
                    required: false
                },
                {
                    id: 'policy_number',
                    label: 'Numer polisy',
                    type: 'text',
                    required: false,
                    placeholder: 'np. POL/12345/2024',
                    help: 'Polisa sprawcy wypadku - znajdziesz w protokole lub oświadczeniu po wypadku'
                },
                {
                    id: 'claim_number',
                    label: 'Numer szkody (nadany przez TU)',
                    type: 'text',
                    required: false,
                    placeholder: 'np. SZK/2024/123456',
                    help: 'TU nadaje ten numer przy zgłoszeniu - znajdziesz w korespondencji z TU'
                },
                {
                    id: 'claim_reported_date',
                    label: 'Kiedy zgłoszono szkodę do TU?',
                    type: 'date',
                    required: false,
                    help: 'TU ma 30 dni na decyzję od tego momentu'
                },
                {
                    id: 'insurance_decision',
                    label: 'Czy TU wydało decyzję?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: 'Tak - otrzymałem decyzję' },
                        { value: 'no', label: 'Nie - czekam na decyzję' }
                    ]
                },
                {
                    id: 'insurance_decision_date',
                    label: 'Data decyzji TU',
                    type: 'date',
                    required: false,
                    help: 'Data na piśmie z decyzją - od niej liczą się terminy na odwołanie!'
                },
                {
                    id: 'insurance_decision_type',
                    label: 'Typ decyzji',
                    type: 'select',
                    required: false,
                    options: [
                        { value: 'full_accept', label: '✅ Pełna akceptacja roszczenia' },
                        { value: 'partial_accept', label: '⚠️ Częściowa akceptacja (za mało)' },
                        { value: 'rejection', label: '❌ Odmowa wypłaty' }
                    ]
                },
                {
                    id: 'insurance_offered_amount',
                    label: 'Kwota zaproponowana przez TU (PLN)',
                    type: 'number',
                    required: false,
                    placeholder: '10000',
                    help: 'TU zazwyczaj zaniża o 30-50% - porównamy z rzeczywistą szkodą'
                },
                {
                    id: 'insurance_decision_text',
                    label: 'Treść/uzasadnienie decyzji TU',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Przepisz najważniejsze fragmenty decyzji...',
                    help: 'Uzasadnienie TU często zawiera błędy - przeanalizujemy je i znajdziemy argumenty'
                }
            ]
        },
        {
            id: 'damage_and_claim',
            title: 'Szkoda i roszczenie',
            icon: '💰',
            help: 'Rodzaj i wycena szkody',
            questions: [
                {
                    id: 'damage_types',
                    label: 'Rodzaje szkody (można zaznaczyć kilka)',
                    type: 'checkbox',
                    required: false,
                    help: 'Zaznacz wszystkie rodzaje szkody - każdy zwiększa wartość odszkodowania',
                    options: [
                        { value: 'vehicle_damage', label: '🚗 Uszkodzenie pojazdu' },
                        { value: 'bodily_injury', label: '🤕 Obrażenia ciała' },
                        { value: 'lost_income', label: '💼 Utrata dochodów' },
                        { value: 'medical_costs', label: '💊 Koszty leczenia' },
                        { value: 'pain_suffering', label: '😢 Ból i cierpienie (zadośćuczynienie)' },
                        { value: 'permanent_injury', label: '♿ Trwały uszczerbek' },
                        { value: 'property_damage', label: '🏠 Szkoda majątkowa' },
                        { value: 'funeral_costs', label: '⚰️ Koszty pogrzebu' },
                        { value: 'other', label: '📋 Inne' }
                    ]
                },
                {
                    id: 'claimed_total_amount',
                    label: 'Całkowita żądana kwota odszkodowania (PLN)',
                    type: 'number',
                    required: false,
                    placeholder: '50000',
                    help: 'Suma wszystkich pozycji roszczenia'
                },
                {
                    id: 'vehicle_repair_cost',
                    label: 'Koszt naprawy pojazdu (PLN)',
                    type: 'number',
                    required: false,
                    placeholder: '15000',
                    help: 'Podaj kwotę z kosztorysu warsztatu (lub szacunkową) - zweryfikujemy u rzeczoznawcy'
                },
                {
                    id: 'medical_costs_amount',
                    label: 'Koszty leczenia (PLN)',
                    type: 'number',
                    required: false,
                    placeholder: '8000',
                    help: 'Suma: wizyty u lekarzy, badania, leki, rehabilitacja - TU musi zwrócić!'
                },
                {
                    id: 'lost_income_amount',
                    label: 'Utracone dochody (PLN)',
                    type: 'number',
                    required: false,
                    placeholder: '12000',
                    help: 'Np. wynagrodzenie za czas niezdolności do pracy'
                },
                {
                    id: 'pain_suffering_amount',
                    label: 'Zadośćuczynienie za ból i cierpienie (PLN)',
                    type: 'number',
                    required: false,
                    placeholder: '20000',
                    help: 'Zadośćuczynienie za cierpienie fizyczne i psychiczne - wycenimy na podstawie orzecznictwa'
                }
            ]
        }
    ]
};

console.log('✅ Ankieta odszkodowawcza część 1 (sekcje 1-5) załadowana!');
console.log('📊 Part1 - Sekcje:', window.compensationQuestionnaire_Part1.sections_1_5.length);
