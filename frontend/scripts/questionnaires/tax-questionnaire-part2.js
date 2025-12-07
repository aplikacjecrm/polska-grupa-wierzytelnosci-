// ==========================================
// ANKIETA PODATKOWA - CZĘŚĆ 2 (Sekcje 5-7)
// ==========================================

window.taxQuestionnairePart2 = {
    sections: [
        {
            id: 5,
            title: 'Odwołanie i Postępowanie Sądowe',
            description: 'Status odwołań i spraw sądowych',
            questions: [
                {
                    id: 'appeal_status',
                    type: 'select',
                    label: 'Status odwołania',
                    options: [
                        { value: 'not_filed', label: 'Nie złożono - planowane' },
                        { value: 'filed_pending', label: 'Złożone - oczekiwanie na rozpatrzenie' },
                        { value: 'rejected', label: 'Odrzucone / Oddalone' },
                        { value: 'accepted', label: 'Uwzględnione' },
                        { value: 'partially', label: 'Częściowo uwzględnione' },
                        { value: 'not_needed', label: 'Nie dotyczy' }
                    ]
                },
                {
                    id: 'appeal_filed_date',
                    type: 'date',
                    label: 'Data złożenia odwołania',
                    showIf: { appeal_status: ['filed_pending', 'rejected', 'accepted', 'partially'] }
                },
                {
                    id: 'second_instance_authority',
                    type: 'text',
                    label: 'Organ II instancji',
                    placeholder: 'np. Dyrektor Krajowej Informacji Skarbowej',
                    showIf: { appeal_status: ['filed_pending', 'rejected', 'accepted', 'partially'] }
                },
                {
                    id: 'wsa_case',
                    type: 'select',
                    label: 'Czy sprawa trafiła do WSA?',
                    options: [
                        { value: 'yes_pending', label: 'Tak, w toku' },
                        { value: 'yes_finished', label: 'Tak, zakończona' },
                        { value: 'planned', label: 'Planowana skarga' },
                        { value: 'no', label: 'Nie' }
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
                    showIf: { wsa_case: ['yes_pending', 'yes_finished', 'planned'] }
                },
                {
                    id: 'wsa_signature',
                    type: 'text',
                    label: 'Sygnatura akt WSA',
                    placeholder: 'np. III SA/Wa 1234/24',
                    showIf: { wsa_case: ['yes_pending', 'yes_finished'] }
                },
                {
                    id: 'nsa_case',
                    type: 'select',
                    label: 'Czy planowana/jest skarga kasacyjna do NSA?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                }
            ]
        },
        {
            id: 6,
            title: '',
            description: 'Czy uzyskano interpretację?',
            questions: [
                {
                    id: 'has_interpretation',
                    type: 'select',
                    label: 'Czy posiadasz interpretację indywidualną?',
                    options: [
                        { value: 'yes', label: 'Tak, posiadam' },
                        { value: 'applied', label: 'Złożono wniosek - oczekiwanie' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'interpretation_number',
                    type: 'text',
                    label: 'Numer interpretacji',
                    placeholder: 'np. 0111-KDIB1-3.4010.123.2024',
                    showIf: { has_interpretation: 'yes' }
                },
                {
                    id: 'interpretation_date',
                    type: 'date',
                    label: 'Data wydania interpretacji',
                    showIf: { has_interpretation: 'yes' }
                },
                {
                    id: 'interpretation_content',
                    type: 'textarea',
                    label: 'Treść/stanowisko interpretacji',
                    placeholder: 'Czego dotyczyła interpretacja, jakie było stanowisko organu...',
                    rows: 5,
                    showIf: { has_interpretation: 'yes' }
                },
                {
                    id: 'interpretation_favorable',
                    type: 'select',
                    label: 'Czy interpretacja jest korzystna?',
                    options: [
                        { value: 'yes', label: 'Tak, korzystna' },
                        { value: 'no', label: 'Nie, niekorzystna' },
                        { value: 'partial', label: 'Częściowo' }
                    ],
                    showIf: { has_interpretation: 'yes' }
                },
                {
                    id: 'interpretation_followed',
                    type: 'select',
                    label: 'Czy stosujesz się do interpretacji?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ],
                    showIf: { has_interpretation: 'yes' }
                }
            ]
        },
        {
            id: 7,
            title: '',
            description: 'Posiadana dokumentacja',
            questions: [
                {
                    id: 'has_documentation',
                    type: 'select',
                    label: 'Czy posiadasz pełną dokumentację?',
                    options: [
                        { value: 'yes', label: 'Tak, kompletna' },
                        { value: 'partial', label: 'Częściowa' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'documents_list',
                    type: 'textarea',
                    label: 'Lista posiadanych dokumentów',
                    placeholder: 'Faktury, umowy, deklaracje, protokoły, korespondencja...',
                    rows: 5
                },
                {
                    id: 'missing_documents',
                    type: 'textarea',
                    label: 'Brakująca dokumentacja',
                    placeholder: 'Jakie dokumenty są potrzebne, ale nie są dostępne...',
                    rows: 3,
                    showIf: { has_documentation: ['partial', 'no'] }
                },
                {
                    id: 'accounting_records',
                    type: 'select',
                    label: 'Czy prowadzisz księgowość?',
                    options: [
                        { value: 'full', label: 'Pełna księgowość' },
                        { value: 'simplified', label: 'Księga przychodów i rozchodów' },
                        { value: 'lumpsum', label: 'Ryczałt ewidencjonowany' },
                        { value: 'none', label: 'Nie prowadzę' }
                    ]
                },
                {
                    id: 'accountant',
                    type: 'text',
                    label: 'Dane księgowego',
                    placeholder: 'Imię, nazwisko, biuro rachunkowe'
                },
                {
                    id: 'witnesses',
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
                    placeholder: 'Imię, nazwisko, rola, kontakt...',
                    rows: 4,
                    showIf: { witnesses: 'yes' }
                }
            ]
        }
    ]
};

console.log('✅ Tax Part 2 załadowana (Sekcje 5-7)!');
