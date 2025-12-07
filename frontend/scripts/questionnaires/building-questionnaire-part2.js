// ==========================================
// ANKIETA BUDOWLANA - CZĘŚĆ 2 (Sekcje 5-7)
// ==========================================

window.buildingQuestionnairePart2 = {
    sections: [
        {
            id: 5,
            title: 'Postępowanie przed WSA/NSA',
            description: 'Sąd Administracyjny',
            questions: [
                {
                    id: 'admin_court_case',
                    type: 'select',
                    label: 'Czy sprawa jest/będzie w sądzie administracyjnym?',
                    options: [
                        { value: 'wsa_pending', label: 'WSA - w toku' },
                        { value: 'wsa_planned', label: 'WSA - planowane wniesienie skargi' },
                        { value: 'nsa_pending', label: 'NSA - skarga kasacyjna w toku' },
                        { value: 'nsa_planned', label: 'NSA - planowana skarga kasacyjna' },
                        { value: 'no', label: 'Nie dotyczy' }
                    ]
                },
                {
                    id: 'wsa_location',
                    type: 'select',
                    label: 'Właściwy Wojewódzki Sąd Administracyjny',
                    options: [
                        { value: 'warszawa', label: 'WSA w Warszawie' },
                        { value: 'krakow', label: 'WSA w Krakowie' },
                        { value: 'wroclaw', label: 'WSA we Wrocławiu' },
                        { value: 'poznan', label: 'WSA w Poznaniu' },
                        { value: 'gdansk', label: 'WSA w Gdańsku' },
                        { value: 'lodz', label: 'WSA w Łodzi' },
                        { value: 'bialystok', label: 'WSA w Białymstoku' },
                        { value: 'lublin', label: 'WSA w Lublinie' },
                        { value: 'olsztyn', label: 'WSA w Olsztynie' },
                        { value: 'rzeszow', label: 'WSA w Rzeszowie' },
                        { value: 'szczecin', label: 'WSA w Szczecinie' },
                        { value: 'katowice', label: 'WSA w Katowicach' },
                        { value: 'opole', label: 'WSA w Opolu' },
                        { value: 'kielce', label: 'WSA w Kielcach' },
                        { value: 'bydgoszcz', label: 'WSA w Bydgoszczy' },
                        { value: 'gorzow', label: 'WSA w Gorzowie Wlkp.' }
                    ],
                    showIf: { admin_court_case: ['wsa_pending', 'wsa_planned'] }
                },
                {
                    id: 'case_signature',
                    type: 'text',
                    label: 'Sygnatura akt sądowych',
                    placeholder: 'np. II SA/Wa 1234/24',
                    showIf: { admin_court_case: ['wsa_pending', 'nsa_pending'] }
                },
                {
                    id: 'complaint_grounds',
                    type: 'textarea',
                    label: 'Zarzuty w skardze do WSA/NSA',
                    placeholder: 'Naruszenie prawa materialnego, błędy proceduralne, niewłaściwa wykładnia...',
                    rows: 5,
                    showIf: { admin_court_case: ['wsa_pending', 'wsa_planned', 'nsa_pending', 'nsa_planned'] }
                },
                {
                    id: 'hearing_date',
                    type: 'date',
                    label: 'Data rozprawy',
                    showIf: { admin_court_case: ['wsa_pending', 'nsa_pending'] }
                }
            ]
        },
        {
            id: 6,
            title: '',
            description: 'Opinie biegłych i ekspertyzy',
            questions: [
                {
                    id: 'expertise_needed',
                    type: 'select',
                    label: 'Czy potrzebna ekspertyza techniczna?',
                    options: [
                        { value: 'yes_ordered', label: 'Tak, zamówiona' },
                        { value: 'yes_planned', label: 'Tak, planowana' },
                        { value: 'obtained', label: 'Już uzyskana' },
                        { value: 'no', label: 'Nie jest potrzebna' }
                    ]
                },
                {
                    id: 'expertise_type',
                    type: 'select',
                    label: 'Rodzaj ekspertyzy',
                    options: [
                        { value: 'construction', label: 'Budowlana (stan techniczny, uszkodzenia)' },
                        { value: 'structural', label: 'Konstrukcyjna (nośność, bezpieczeństwo)' },
                        { value: 'geological', label: 'Geotechniczna (grunt, posadowienie)' },
                        { value: 'environmental', label: 'Środowiskowa (hałas, emisje)' },
                        { value: 'valuation', label: 'Wycena nieruchomości' },
                        { value: 'fire_safety', label: 'Przeciwpożarowa' },
                        { value: 'acoustic', label: 'Akustyczna' },
                        { value: 'other', label: 'Inna' }
                    ],
                    showIf: { expertise_needed: ['yes_ordered', 'yes_planned', 'obtained'] }
                },
                {
                    id: 'expert_name',
                    type: 'text',
                    label: 'Biegły sądowy / ekspert',
                    placeholder: 'Imię, nazwisko, specjalizacja',
                    showIf: { expertise_needed: ['yes_ordered', 'obtained'] }
                },
                {
                    id: 'expertise_conclusions',
                    type: 'textarea',
                    label: 'Wnioski z ekspertyzy',
                    placeholder: 'Główne ustalenia, wnioski, zalecenia...',
                    rows: 5,
                    showIf: { expertise_needed: 'obtained' }
                },
                {
                    id: 'expertise_cost',
                    type: 'number',
                    label: 'Koszt ekspertyzy (PLN)',
                    placeholder: 'np. 5000',
                    showIf: { expertise_needed: ['yes_ordered', 'obtained'] }
                }
            ]
        },
        {
            id: 7,
            title: 'Spory Sąsiedzkie',
            description: 'Konflikty z sąsiadami lub osobami trzecimi',
            questions: [
                {
                    id: 'neighbor_dispute',
                    type: 'select',
                    label: 'Czy istnieje spór z sąsiadami?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'dispute_type',
                    type: 'select',
                    label: 'Rodzaj sporu',
                    options: [
                        { value: 'boundary', label: 'Spór graniczny (granica działek)' },
                        { value: 'access', label: 'Dostęp do działki / Droga dojazdowa' },
                        { value: 'shadow', label: 'Zacienienie / Nasłonecznienie' },
                        { value: 'noise', label: 'Hałas z budowy' },
                        { value: 'damage', label: 'Uszkodzenie nieruchomości sąsiada' },
                        { value: 'tree', label: 'Drzewa / Roślinność' },
                        { value: 'water', label: 'Woda (odprowadzanie, zalanie)' },
                        { value: 'view', label: 'Zasłonięcie widoku' },
                        { value: 'other', label: 'Inne' }
                    ],
                    showIf: { neighbor_dispute: 'yes' }
                },
                {
                    id: 'neighbor_details',
                    type: 'textarea',
                    label: 'Opis sporu sąsiedzkiego',
                    placeholder: 'Dokładny opis konfliktu, pretensji, żądań sąsiadów...',
                    rows: 5,
                    showIf: { neighbor_dispute: 'yes' }
                },
                {
                    id: 'neighbor_legal_action',
                    type: 'select',
                    label: 'Czy sąsiedzi podjęli kroki prawne?',
                    options: [
                        { value: 'yes', label: 'Tak (pozew, skarga, zawiadomienie)' },
                        { value: 'threatened', label: 'Grożą pozwem' },
                        { value: 'no', label: 'Nie' }
                    ],
                    showIf: { neighbor_dispute: 'yes' }
                },
                {
                    id: 'neighbor_mediation',
                    type: 'select',
                    label: 'Czy była mediacja?',
                    options: [
                        { value: 'yes_success', label: 'Tak, zakończona sukcesem' },
                        { value: 'yes_failed', label: 'Tak, ale nieudana' },
                        { value: 'no', label: 'Nie było mediacji' }
                    ],
                    showIf: { neighbor_dispute: 'yes' }
                }
            ]
        }
    ]
};

console.log('✅ Building Part 2 załadowana (Sekcje 5-7)!');
