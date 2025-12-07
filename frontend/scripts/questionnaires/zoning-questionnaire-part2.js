// ==========================================
// ANKIETA ZAGOSPODAROWANIA PRZESTRZENNEGO - CZĘŚĆ 2 (Sekcje 5-7)
// ==========================================

window.zoningQuestionnairePart2 = {
    sections: [
        {
            id: 5,
            title: 'Odwołanie i Skargi',
            description: 'Status odwołań i spraw sądowych',
            questions: [
                {
                    id: 'appeal_status',
                    type: 'select',
                    label: 'Status odwołania/skargi',
                    options: [
                        { value: 'not_filed', label: 'Nie złożono - planowane' },
                        { value: 'filed_samorząd', label: 'Odwołanie do Samorządowego Kolegium Odwoławczego' },
                        { value: 'filed_wsa', label: 'Skarga do WSA' },
                        { value: 'filed_nsa', label: 'Skarga kasacyjna do NSA' },
                        { value: 'rejected', label: 'Odrzucone / Oddalone' },
                        { value: 'accepted', label: 'Uwzględnione' },
                        { value: 'not_needed', label: 'Nie dotyczy' }
                    ]
                },
                {
                    id: 'appeal_deadline',
                    type: 'date',
                    label: 'Termin na złożenie odwołania/skargi',
                    help: 'UWAGA: 14 dni od doręczenia decyzji / 30 dni na skargę do WSA!',
                    showIf: { appeal_status: 'not_filed' }
                },
                {
                    id: 'appeal_filed_date',
                    type: 'date',
                    label: 'Data złożenia odwołania/skargi',
                    showIf: { appeal_status: ['filed_samorząd', 'filed_wsa', 'filed_nsa', 'rejected', 'accepted'] }
                },
                {
                    id: 'appeal_grounds',
                    type: 'textarea',
                    label: 'Podstawy odwołania/skargi',
                    placeholder: 'Naruszenie procedury, niezgodność z prawem, niewspółmierność...',
                    rows: 5,
                    showIf: { appeal_status: ['filed_samorząd', 'filed_wsa', 'filed_nsa', 'rejected', 'accepted'] }
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
                    showIf: { appeal_status: ['filed_wsa', 'filed_nsa'] }
                },
                {
                    id: 'wsa_signature',
                    type: 'text',
                    label: 'Sygnatura akt WSA',
                    placeholder: 'np. II SA/Wa 1234/24',
                    showIf: { appeal_status: ['filed_wsa', 'filed_nsa'] }
                }
            ]
        },
        {
            id: 6,
            title: '',
            description: 'Szkoda i roszczenia finansowe',
            questions: [
                {
                    id: 'property_value_before',
                    type: 'number',
                    label: 'Szacunkowa wartość nieruchomości PRZED planem (PLN)',
                    placeholder: 'np. 500000'
                },
                {
                    id: 'property_value_after',
                    type: 'number',
                    label: 'Szacunkowa wartość nieruchomości PO planie (PLN)',
                    placeholder: 'np. 300000'
                },
                {
                    id: 'value_loss',
                    type: 'number',
                    label: 'Szacunkowa strata wartości (PLN)',
                    placeholder: 'Obliczone automatycznie lub ręcznie'
                },
                {
                    id: 'compensation_claim',
                    type: 'select',
                    label: 'Czy domagasz się odszkodowania?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'considering', label: 'Rozważam' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'compensation_amount',
                    type: 'number',
                    label: 'Kwota roszczenia odszkodowawczego (PLN)',
                    placeholder: 'np. 200000',
                    showIf: { compensation_claim: ['yes', 'considering'] }
                },
                {
                    id: 'compensation_basis',
                    type: 'textarea',
                    label: 'Podstawa roszczenia',
                    placeholder: 'Art. 36 ustawy o planowaniu - niemożność dotychczasowego lub zgodnego z przeznaczeniem wykorzystania...',
                    rows: 4,
                    showIf: { compensation_claim: ['yes', 'considering'] }
                },
                {
                    id: 'has_valuation',
                    type: 'select',
                    label: 'Czy masz operatoat szacunkowy (wycenę)?',
                    options: [
                        { value: 'yes', label: 'Tak, posiadam' },
                        { value: 'ordered', label: 'Zamówiona - w trakcie' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'valuation_expert',
                    type: 'text',
                    label: 'Rzeczoznawca majątkowy',
                    placeholder: 'Imię, nazwisko, numer uprawnień',
                    showIf: { has_valuation: ['yes', 'ordered'] }
                },
                {
                    id: 'valuation_date',
                    type: 'date',
                    label: 'Data wyceny',
                    showIf: { has_valuation: 'yes' }
                }
            ]
        },
        {
            id: 7,
            title: 'Sąsiedzi i Strony',
            description: 'Inne zainteresowane strony',
            questions: [
                {
                    id: 'other_stakeholders',
                    type: 'select',
                    label: 'Czy są inni zainteresowani właściciele?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'stakeholders_list',
                    type: 'textarea',
                    label: 'Lista innych zainteresowanych',
                    placeholder: 'Sąsiedzi, współwłaściciele, organizacje...',
                    rows: 4,
                    showIf: { other_stakeholders: 'yes' }
                },
                {
                    id: 'joint_action',
                    type: 'select',
                    label: 'Czy planujecie wspólne działania?',
                    options: [
                        { value: 'yes', label: 'Tak, wspólnie' },
                        { value: 'considering', label: 'Rozważamy' },
                        { value: 'no', label: 'Nie' }
                    ],
                    showIf: { other_stakeholders: 'yes' }
                },
                {
                    id: 'opposition_organized',
                    type: 'select',
                    label: 'Czy jest zorganizowany sprzeciw mieszkańców?',
                    options: [
                        { value: 'yes', label: 'Tak (petycje, protesty)' },
                        { value: 'informal', label: 'Nieformalna grupa' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'ngo_involved',
                    type: 'select',
                    label: 'Czy zaangażowane są organizacje społeczne?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'ngo_names',
                    type: 'text',
                    label: 'Nazwy organizacji',
                    placeholder: 'np. Stowarzyszenie Obrony Mieszkańców...',
                    showIf: { ngo_involved: 'yes' }
                },
                {
                    id: 'media_coverage',
                    type: 'select',
                    label: 'Czy sprawa była w mediach?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'media_details',
                    type: 'textarea',
                    label: 'Publikacje medialne',
                    placeholder: 'Tytuły, daty, linki...',
                    rows: 3,
                    showIf: { media_coverage: 'yes' }
                }
            ]
        }
    ]
};

console.log('✅ Zoning Part 2 załadowana (Sekcje 5-7)!');
