// ==========================================
// ANKIETA MAJĄTKOWA - CZĘŚĆ 1 (Sekcje 1-4)
// ==========================================

console.log('🔵 START: Ładowanie property-questionnaire-part1.js');

window.propertyQuestionnairePart1 = {
    sections: [
        {
            id: 1,
            title: '',
            description: 'O jaką nieruchomość/rzecz toczy się spór?',
            questions: [
                {
                    id: 'subject_type',
                    type: 'select',
                    label: 'Rodzaj przedmiotu sprawy',
                    required: true,
                    options: [
                        { value: 'real_estate', label: 'Nieruchomość (mieszkanie, dom, działka)' },
                        { value: 'movable', label: 'Rzecz ruchoma (samochód, maszyny)' },
                        { value: 'both', label: 'Obie kategorie' }
                    ]
                },
                {
                    id: 'property_address',
                    type: 'text',
                    label: 'Adres nieruchomości',
                    placeholder: 'Pełny adres z kodem pocztowym',
                    showIf: { subject_type: ['real_estate', 'both'] }
                },
                {
                    id: 'property_area',
                    type: 'text',
                    label: 'Powierzchnia',
                    placeholder: 'np. 65 m² lub 1200 m² działki',
                    showIf: { subject_type: ['real_estate', 'both'] }
                },
                {
                    id: 'land_register_number',
                    type: 'text',
                    label: 'Numer księgi wieczystej (KW)',
                    required: true,
                    placeholder: 'np. WA1W/00123456/7',
                    showIf: { subject_type: ['real_estate', 'both'] }
                },
                {
                    id: 'cadastral_number',
                    type: 'text',
                    label: 'Numer działki ewidencyjnej',
                    placeholder: 'np. 123/45',
                    showIf: { subject_type: ['real_estate', 'both'] }
                },
                {
                    id: 'movable_description',
                    type: 'textarea',
                    label: 'Opis rzeczy ruchomej',
                    placeholder: 'Dokładny opis, marka, model, VIN itp.',
                    rows: 3,
                    showIf: { subject_type: ['movable', 'both'] }
                },
                {
                    id: 'property_value',
                    type: 'number',
                    label: 'Szacunkowa wartość (PLN)',
                    required: true,
                    help: 'Przybliżona wartość rynkowa'
                },
                {
                    id: 'property_current_use',
                    type: 'select',
                    label: 'Obecne wykorzystanie',
                    options: [
                        { value: 'residential', label: 'Zamieszkanie' },
                        { value: 'commercial', label: 'Działalność gospodarcza' },
                        { value: 'agricultural', label: 'Rolnicze' },
                        { value: 'vacant', label: 'Puste/nieużytkowane' },
                        { value: 'rented', label: 'Wynajmowane' }
                    ]
                }
            ]
        },
        {
            id: 2,
            title: 'Rodzaj Roszczenia',
            description: 'Czego dotyczy sprawa?',
            questions: [
                {
                    id: 'claim_type',
                    type: 'select',
                    label: 'Typ roszczenia/sprawy',
                    required: true,
                    options: [
                        { value: 'ownership', label: '📋 Własność - ustalenie prawa własności' },
                        { value: 'vindication', label: '🏠 Windykacja - wydanie rzeczy' },
                        { value: 'easement', label: '🚪 Służebność - przejazd, przechód' },
                        { value: 'prescription', label: '⏰ Zasiedzenie - nabycie przez upływ czasu' },
                        { value: 'partition', label: '✂️ Zniesienie współwłasności - podział' },
                        { value: 'possession', label: '🔑 Ochrona posiadania - naruszenie' },
                        { value: 'boundary', label: '📏 Rozgraniczenie - spór o granice' },
                        { value: 'usufruct', label: '🌳 Użytkowanie wieczyste' },
                        { value: 'other', label: '📝 Inne roszczenie rzeczowe' }
                    ]
                },
                {
                    id: 'claim_description',
                    type: 'textarea',
                    label: 'Szczegółowy opis roszczenia',
                    required: true,
                    placeholder: 'Czego konkretnie się domagasz? Jaki jest stan faktyczny?',
                    rows: 5,
                    help: 'Im więcej szczegółów, tym lepiej!'
                },
                {
                    id: 'easement_type',
                    type: 'select',
                    label: 'Rodzaj służebności',
                    showIf: { claim_type: 'easement' },
                    options: [
                        { value: 'passage', label: 'Przejazd (drogowa)' },
                        { value: 'walkway', label: 'Przechód (piesza)' },
                        { value: 'utility', label: 'Infrastruktura (woda, prąd, gaz)' },
                        { value: 'view', label: 'Widoku' },
                        { value: 'light', label: 'Światła' },
                        { value: 'other', label: 'Inna' }
                    ]
                },
                {
                    id: 'prescription_period',
                    type: 'select',
                    label: 'Okres zasiedzenia',
                    showIf: { claim_type: 'prescription' },
                    options: [
                        { value: '20_years', label: '20 lat (w dobrej wierze)' },
                        { value: '30_years', label: '30 lat (w złej wierze)' },
                        { value: 'uncertain', label: 'Nie jestem pewien' }
                    ]
                },
                {
                    id: 'possession_since',
                    type: 'date',
                    label: 'Posiadanie od kiedy?',
                    showIf: { claim_type: 'prescription' },
                    help: 'Kiedy zacząłeś korzystać z nieruchomości?'
                },
                {
                    id: 'boundary_dispute',
                    type: 'textarea',
                    label: 'Szczegóły sporu granicznego',
                    placeholder: 'Kto i gdzie postawił ogrodzenie? Jakie są różnice w interpretacji?',
                    rows: 4,
                    showIf: { claim_type: 'boundary' }
                }
            ]
        },
        {
            id: 3,
            title: '',
            description: 'Kto jest właścicielem? Kto ma roszczenia?',
            questions: [
                {
                    id: 'current_owner',
                    type: 'select',
                    label: 'Kto jest formalnym właścicielem (wg KW)?',
                    required: true,
                    options: [
                        { value: 'me', label: 'Ja (wnioskodawca)' },
                        { value: 'opponent', label: 'Strona przeciwna' },
                        { value: 'co_owners', label: 'Współwłasność (kilka osób)' },
                        { value: 'uncertain', label: 'Niepewna sytuacja prawna' }
                    ]
                },
                {
                    id: 'co_owners_list',
                    type: 'repeatable',
                    label: 'Lista współwłaścicieli',
                    showIf: { current_owner: 'co_owners' },
                    fields: [
                        {
                            id: 'owner_name',
                            type: 'text',
                            label: 'Imię i nazwisko',
                            required: true
                        },
                        {
                            id: 'owner_share',
                            type: 'text',
                            label: 'Udział',
                            placeholder: 'np. 1/2, 1/4'
                        },
                        {
                            id: 'owner_relation',
                            type: 'text',
                            label: 'Relacja',
                            placeholder: 'np. małżonek, spadkobierca'
                        }
                    ]
                },
                {
                    id: 'opponent_name',
                    type: 'text',
                    label: 'Imię i nazwisko strony przeciwnej',
                    required: true,
                    placeholder: 'Osoba/firma, z którą toczy się spór'
                },
                {
                    id: 'opponent_claim',
                    type: 'textarea',
                    label: 'Roszczenie strony przeciwnej',
                    placeholder: 'Czego domaga się przeciwnik? Na jakiej podstawie?',
                    rows: 4
                },
                {
                    id: 'acquisition_basis',
                    type: 'select',
                    label: 'Podstawa nabycia własności (Twoja)',
                    required: true,
                    options: [
                        { value: 'purchase', label: 'Umowa kupna-sprzedaży' },
                        { value: 'inheritance', label: 'Dziedziczenie (spadek)' },
                        { value: 'donation', label: 'Darowizna' },
                        { value: 'prescription', label: 'Zasiedzenie' },
                        { value: 'court_decision', label: 'Orzeczenie sądu' },
                        { value: 'expropriation', label: 'Wywłaszczenie/reprywatyzacja' },
                        { value: 'other', label: 'Inna podstawa' }
                    ]
                },
                {
                    id: 'acquisition_date',
                    type: 'date',
                    label: 'Data nabycia',
                    help: 'Kiedy nabyłeś własność?'
                },
                {
                    id: 'acquisition_documents',
                    type: 'checkbox',
                    label: 'Posiadam dokumenty potwierdzające nabycie'
                }
            ]
        },
        {
            id: 4,
            title: '',
            description: 'Czy nieruchomość ma jakieś ograniczenia?',
            questions: [
                {
                    id: 'has_mortgage',
                    type: 'checkbox',
                    label: 'Hipoteka (kredyt zabezpieczony na nieruchomości)'
                },
                {
                    id: 'mortgage_amount',
                    type: 'number',
                    label: 'Wysokość hipoteki (PLN)',
                    showIf: { has_mortgage: true }
                },
                {
                    id: 'mortgage_creditor',
                    type: 'text',
                    label: 'Bank/wierzyciel hipoteczny',
                    showIf: { has_mortgage: true }
                },
                {
                    id: 'has_easements',
                    type: 'checkbox',
                    label: 'Służebności (przejazd, instalacje, itp.)'
                },
                {
                    id: 'easements_description',
                    type: 'textarea',
                    label: 'Opis służebności',
                    placeholder: 'Jakie służebności są wpisane w KW?',
                    rows: 3,
                    showIf: { has_easements: true }
                },
                {
                    id: 'has_rent_lease',
                    type: 'checkbox',
                    label: 'Umowa najmu/dzierżawy (ktoś wynajmuje)'
                },
                {
                    id: 'tenant_name',
                    type: 'text',
                    label: 'Imię i nazwisko najemcy',
                    showIf: { has_rent_lease: true }
                },
                {
                    id: 'lease_until',
                    type: 'date',
                    label: 'Najem do kiedy?',
                    showIf: { has_rent_lease: true }
                },
                {
                    id: 'has_restrictions',
                    type: 'checkbox',
                    label: 'Inne ograniczenia (plan zagospodarowania, ochrona zabytków)'
                },
                {
                    id: 'restrictions_description',
                    type: 'textarea',
                    label: 'Opis ograniczeń',
                    placeholder: 'np. strefa ochrony konserwatorskiej, obszar chroniony',
                    rows: 3,
                    showIf: { has_restrictions: true }
                },
                {
                    id: 'has_debts',
                    type: 'checkbox',
                    label: 'Zaległości (czynsz, podatek, opłaty)'
                },
                {
                    id: 'debts_amount',
                    type: 'number',
                    label: 'Wysokość zaległości (PLN)',
                    showIf: { has_debts: true }
                }
            ]
        }
    ]
};

console.log('✅ Property Part 1 załadowana (Sekcje 1-4)!');
