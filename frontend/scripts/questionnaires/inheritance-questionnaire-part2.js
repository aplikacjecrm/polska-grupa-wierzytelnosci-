// ==========================================
// ANKIETA SPADKOWA - CZĘŚĆ 2 (Sekcje 5-7)
// ==========================================

window.inheritanceQuestionnairePart2 = {
    sections: [
        {
            id: 5,
            title: '',
            description: 'Czy zmarły miał długi?',
            questions: [
                {
                    id: 'debts_exist',
                    type: 'select',
                    label: 'Czy zmarły miał długi?',
                    required: true,
                    options: [
                        { value: 'no', label: 'Nie, nie było żadnych długów' },
                        { value: 'yes_minor', label: 'Tak, niewielkie (poniżej 10,000 zł)' },
                        { value: 'yes_major', label: 'Tak, poważne (powyżej 10,000 zł)' },
                        { value: 'unknown', label: 'Nie wiem, trzeba sprawdzić' }
                    ]
                },
                {
                    id: 'debts_list',
                    type: 'repeatable',
                    label: 'Lista długów',
                    showIf: { debts_exist: ['yes_minor', 'yes_major'] },
                    fields: [
                        {
                            id: 'debt_type',
                            type: 'select',
                            label: 'Rodzaj długu',
                            options: [
                                { value: 'mortgage', label: 'Kredyt hipoteczny' },
                                { value: 'consumer_loan', label: 'Kredyt konsumpcyjny' },
                                { value: 'credit_card', label: 'Karta kredytowa' },
                                { value: 'utility', label: 'Rachunki (prąd, gaz, czynsz)' },
                                { value: 'tax', label: 'Podatki / ZUS' },
                                { value: 'other', label: 'Inne zobowiązania' }
                            ]
                        },
                        {
                            id: 'creditor_name',
                            type: 'text',
                            label: 'Kto jest wierzycielem?',
                            placeholder: 'Bank, firma, osoba prywatna'
                        },
                        {
                            id: 'debt_amount',
                            type: 'number',
                            label: 'Kwota długu (PLN)',
                            required: true
                        },
                        {
                            id: 'debt_secured',
                            type: 'checkbox',
                            label: 'Zabezpieczony (hipoteka, poręczenie)'
                        }
                    ]
                },
                {
                    id: 'debts_total',
                    type: 'number',
                    label: 'Suma wszystkich długów (PLN)',
                    showIf: { debts_exist: ['yes_minor', 'yes_major'] },
                    help: 'Ile w sumie winien zmarły?'
                },
                {
                    id: 'debts_vs_assets',
                    type: 'info',
                    label: 'ℹ️ Porównanie',
                    content: 'Jeśli długi > majątek → można odrzucić spadek! Masz 6 miesięcy na decyzję.',
                    showIf: { debts_exist: ['yes_minor', 'yes_major'] }
                },
                {
                    id: 'acceptance_decision',
                    type: 'select',
                    label: 'Czy spadkobiercy chcą przyjąć spadek?',
                    required: true,
                    options: [
                        { value: 'accept_unconditional', label: 'Przyjąć bezwarunkowo (za wszystkie długi)' },
                        { value: 'accept_conditional', label: 'Przyjąć z dobrodziejstwem inwentarza (do wartości majątku)' },
                        { value: 'reject', label: 'Odrzucić spadek (nie dziedziczymy nic)' },
                        { value: 'undecided', label: 'Jeszcze nie wiemy' }
                    ]
                }
            ]
        },
        {
            id: 6,
            title: 'Postępowanie Sądowe',
            description: 'Informacje o sprawie w sądzie',
            questions: [
                {
                    id: 'court_case_filed',
                    type: 'select',
                    label: 'Czy wniosek do sądu został już złożony?',
                    required: true,
                    options: [
                        { value: 'no', label: 'Nie, dopiero przygotowujemy' },
                        { value: 'yes', label: 'Tak, sprawa już w sądzie' }
                    ]
                },
                {
                    id: 'court_name',
                    type: 'text',
                    label: 'Nazwa sądu',
                    showIf: { court_case_filed: 'yes' },
                    placeholder: 'Sąd Rejonowy w ...'
                },
                {
                    id: 'court_signature',
                    type: 'text',
                    label: 'Sygnatura akt',
                    showIf: { court_case_filed: 'yes' },
                    placeholder: 'np. I Ns 123/2025'
                },
                {
                    id: 'case_type',
                    type: 'select',
                    label: 'Rodzaj postępowania',
                    required: true,
                    options: [
                        { value: 'inheritance_acquisition', label: 'Stwierdzenie nabycia spadku' },
                        { value: 'inheritance_division', label: 'Dział spadku' },
                        { value: 'testament_validation', label: 'Stwierdzenie ważności testamentu' },
                        { value: 'inventory', label: 'Spis inwentarza' }
                    ]
                },
                {
                    id: 'jurisdiction_court',
                    type: 'select',
                    label: 'Właściwy sąd (według miejsca)',
                    required: true,
                    options: [
                        { value: 'last_residence', label: 'Ostatniego zamieszkania zmarłego' },
                        { value: 'property_location', label: 'Położenia nieruchomości' },
                        { value: 'petitioner_residence', label: 'Zamieszkania wnioskodawcy' }
                    ]
                },
                {
                    id: 'court_hearing_date',
                    type: 'date',
                    label: 'Data rozprawy (jeśli wyznaczona)',
                    showIf: { court_case_filed: 'yes' }
                },
                {
                    id: 'legal_representation',
                    type: 'checkbox',
                    label: 'Potrzebna reprezentacja prawnika w sądzie'
                }
            ]
        },
        {
            id: 7,
            title: '',
            description: 'Inne istotne okoliczności',
            questions: [
                {
                    id: 'deceased_business',
                    type: 'checkbox',
                    label: 'Zmarły prowadził działalność gospodarczą'
                },
                {
                    id: 'business_details',
                    type: 'textarea',
                    label: 'Szczegóły działalności gospodarczej',
                    placeholder: 'NIP, nazwa firmy, czy firma nadal działa',
                    rows: 3,
                    showIf: { deceased_business: true }
                },
                {
                    id: 'life_insurance',
                    type: 'checkbox',
                    label: 'Zmarły miał ubezpieczenie na życie'
                },
                {
                    id: 'insurance_details',
                    type: 'textarea',
                    label: 'Szczegóły polisy',
                    placeholder: 'Nazwa ubezpieczyciela, numer polisy, uposażony',
                    rows: 3,
                    showIf: { life_insurance: true }
                },
                {
                    id: 'foreign_assets',
                    type: 'checkbox',
                    label: 'Majątek za granicą (nieruchomości, rachunki)'
                },
                {
                    id: 'foreign_assets_location',
                    type: 'text',
                    label: 'Kraj, w którym znajduje się majątek',
                    showIf: { foreign_assets: true }
                },
                {
                    id: 'minor_heirs',
                    type: 'checkbox',
                    label: 'Są spadkobiercy niepełnoletni (wymagane sprawozdania)'
                },
                {
                    id: 'disabled_heirs',
                    type: 'checkbox',
                    label: 'Są spadkobiercy ubezwłasnowolnieni / niepełnosprawni'
                },
                {
                    id: 'urgent_matters',
                    type: 'textarea',
                    label: 'Pilne sprawy do załatwienia',
                    placeholder: 'Np. płatności, zachowek, sprzedaż nieruchomości',
                    rows: 4
                },
                {
                    id: 'additional_notes',
                    type: 'textarea',
                    label: 'Dodatkowe uwagi',
                    placeholder: 'Wszystko co może być istotne dla sprawy',
                    rows: 4
                },
                {
                    id: 'preferred_solution',
                    type: 'select',
                    label: 'Preferowane rozwiązanie',
                    required: true,
                    options: [
                        { value: 'amicable', label: 'Polubowne między spadkobiercami' },
                        { value: 'court', label: 'Przez sąd (dział spadku)' },
                        { value: 'sell_divide', label: 'Sprzedaż majątku i podział pieniędzy' },
                        { value: 'undecided', label: 'Jeszcze nie wiemy' }
                    ]
                }
            ]
        }
    ]
};

console.log('✅ Inheritance Part 2 załadowana (Sekcje 5-7)!');
