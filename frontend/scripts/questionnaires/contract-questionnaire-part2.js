// ==========================================
// ANKIETA UMOWNA - CZĘŚĆ 2 (Sekcje 5-7)
// ==========================================

window.contractQuestionnairePart2 = {
    sections: [
        {
            id: 5,
            title: '',
            description: 'Kwestie pieniężne związane ze sprawą',
            questions: [
                {
                    id: 'payments_made',
                    type: 'select',
                    label: 'Czy klient dokonał płatności?',
                    required: true,
                    options: [
                        { value: 'full', label: 'Tak, w pełnej wysokości' },
                        { value: 'partial', label: 'Tak, częściowo' },
                        { value: 'none', label: 'Nie, żadnej płatności' }
                    ]
                },
                {
                    id: 'payment_amount',
                    type: 'number',
                    label: 'Kwota wpłacona przez klienta (PLN)',
                    placeholder: 'np. 15000',
                    showIf: { payments_made: ['full', 'partial'] }
                },
                {
                    id: 'has_invoices',
                    type: 'select',
                    label: 'Czy są faktury / rachunki?',
                    required: true,
                    options: [
                        { value: 'yes', label: 'Tak, mam faktury' },
                        { value: 'no', label: 'Nie ma faktur' }
                    ]
                },
                {
                    id: 'interest_calculation',
                    type: 'select',
                    label: 'Czy żąda się odsetek?',
                    options: [
                        { value: 'statutory', label: 'Odsetki ustawowe' },
                        { value: 'contractual', label: 'Odsetki umowne' },
                        { value: 'none', label: 'Bez odsetek' }
                    ]
                }
            ]
        },
        {
            id: 6,
            title: '',
            description: 'Jakie dokumenty są dostępne?',
            questions: [
                {
                    id: 'has_written_contract',
                    type: 'select',
                    label: 'Czy umowa jest w formie pisemnej?',
                    required: true,
                    options: [
                        { value: 'yes_original', label: 'Tak, mam oryginał' },
                        { value: 'yes_copy', label: 'Tak, mam kopię' },
                        { value: 'verbal', label: 'Umowa ustna' }
                    ]
                },
                {
                    id: 'has_correspondence',
                    type: 'select',
                    label: 'Czy jest korespondencja ze stroną?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'has_witnesses',
                    type: 'select',
                    label: 'Czy są świadkowie?',
                    options: [
                        { value: 'yes', label: 'Tak, są świadkowie' },
                        { value: 'no', label: 'Nie ma świadków' }
                    ]
                },
                {
                    id: 'witnesses_list',
                    type: 'textarea',
                    label: 'Lista świadków (imię, nazwisko, kontakt)',
                    placeholder: 'Jan Kowalski, tel. 123456789\nAnna Nowak, email: anna@example.com',
                    rows: 4,
                    showIf: { has_witnesses: 'yes' }
                }
            ]
        },
        {
            id: 7,
            title: '',
            description: 'Czego oczekuje klient?',
            questions: [
                {
                    id: 'client_goal',
                    type: 'select',
                    label: 'Główny cel postępowania',
                    required: true,
                    options: [
                        { value: 'payment', label: 'Uzyskanie zapłaty' },
                        { value: 'performance', label: 'Wykonanie umowy' },
                        { value: 'termination', label: 'Rozwiązanie umowy' },
                        { value: 'damages', label: 'Odszkodowanie' },
                        { value: 'invalidity', label: 'Unieważnienie umowy' },
                        { value: 'other', label: 'Inny cel' }
                    ]
                },
                {
                    id: 'settlement_interest',
                    type: 'select',
                    label: 'Czy klient jest otwarty na ugodę?',
                    options: [
                        { value: 'yes', label: 'Tak, rozważam ugodę' },
                        { value: 'depends', label: 'Zależy od warunków' },
                        { value: 'no', label: 'Nie, chcę procesu' }
                    ]
                },
                {
                    id: 'urgency',
                    type: 'select',
                    label: 'Pilność sprawy',
                    required: true,
                    options: [
                        { value: 'critical', label: '🔴 Bardzo pilne (termin, przedawnienie)' },
                        { value: 'high', label: '🟠 Pilne (w ciągu miesiąca)' },
                        { value: 'medium', label: '🟡 Standardowe (do 3 miesięcy)' },
                        { value: 'low', label: '🟢 Niski priorytet' }
                    ]
                }
            ]
        }
    ]
};

console.log('✅ Contract Part 2 załadowana (Sekcje 5-7)!');
