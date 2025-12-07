// ==========================================
// ANKIETA RODZINNA - CZĘŚĆ 2 (Sekcje 6-9)
// ==========================================

window.familyQuestionnairePart2 = {
    sections: [
        {
            id: 6,
            title: '',
            description: 'Obowiązek alimentacyjny wobec dzieci',
            questions: [
                {
                    id: 'alimony_needed',
                    type: 'select',
                    label: 'Czy żądane są alimenty na dzieci?',
                    required: true,
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ],
                    showIf: { children_count_gt: 0 }
                },
                {
                    id: 'alimony_amount_requested',
                    type: 'number',
                    label: 'Wnioskowana kwota alimentów miesięcznie (PLN)',
                    placeholder: 'np. 1500',
                    required: true,
                    showIf: { alimony_needed: 'yes' }
                },
                {
                    id: 'alimony_per_child',
                    type: 'select',
                    label: 'Alimenty',
                    options: [
                        { value: 'per_child', label: 'Kwota na każde dziecko osobno' },
                        { value: 'total', label: 'Kwota łączna na wszystkie dzieci' }
                    ],
                    showIf: { alimony_needed: 'yes' }
                },
                {
                    id: 'alimony_justification',
                    type: 'textarea',
                    label: 'Uzasadnienie wysokości alimentów',
                    placeholder: 'Koszty: przedszkole/szkoła, wyżywienie, ubrania, leki, zajęcia dodatkowe...\nDochody rodziców...',
                    rows: 6,
                    required: true,
                    showIf: { alimony_needed: 'yes' }
                },
                {
                    id: 'alimony_current',
                    type: 'select',
                    label: 'Czy alimenty są obecnie płacone?',
                    options: [
                        { value: 'yes_regular', label: 'Tak, regularnie' },
                        { value: 'yes_irregular', label: 'Tak, ale nieregularnie' },
                        { value: 'no', label: 'Nie są płacone' },
                        { value: 'no_established', label: 'Nie było ustalonej kwoty' }
                    ],
                    showIf: { alimony_needed: 'yes' }
                },
                {
                    id: 'alimony_arrears',
                    type: 'number',
                    label: 'Zaległości alimentacyjne (PLN)',
                    placeholder: 'np. 15000',
                    showIf: { alimony_current: ['yes_irregular', 'no'] }
                }
            ]
        },
        {
            id: 7,
            title: '',
            description: 'Obowiązek alimentacyjny wobec małżonka',
            questions: [
                {
                    id: 'spouse_alimony_needed',
                    type: 'select',
                    label: 'Czy żądane są alimenty na małżonka?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ],
                    showIf: { case_main_type: ['divorce', 'separation'] }
                },
                {
                    id: 'spouse_alimony_amount',
                    type: 'number',
                    label: 'Wnioskowana kwota alimentów na małżonka (PLN/miesiąc)',
                    placeholder: 'np. 2000',
                    showIf: { spouse_alimony_needed: 'yes' }
                },
                {
                    id: 'spouse_alimony_duration',
                    type: 'select',
                    label: 'Okres alimentów',
                    options: [
                        { value: 'temporary', label: 'Czasowe (do uzyskania samodzielności)' },
                        { value: 'permanent', label: 'Stałe (trwała niezdolność do pracy)' }
                    ],
                    showIf: { spouse_alimony_needed: 'yes' }
                },
                {
                    id: 'spouse_alimony_reason',
                    type: 'textarea',
                    label: 'Podstawa żądania alimentów',
                    placeholder: 'Brak możliwości zarobkowania, opieka nad małymi dziećmi, stan zdrowia, wiek...',
                    rows: 5,
                    showIf: { spouse_alimony_needed: 'yes' }
                }
            ]
        },
        {
            id: 8,
            title: '',
            description: 'Podział majątku wspólnego małżonków',
            questions: [
                {
                    id: 'property_exists',
                    type: 'select',
                    label: 'Czy istnieje majątek wspólny do podziału?',
                    required: true,
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ],
                    showIf: { case_main_type: ['divorce', 'separation'] }
                },
                {
                    id: 'property_real_estate',
                    type: 'textarea',
                    label: 'Nieruchomości (mieszkania, domy, działki)',
                    placeholder: 'Adres, właściciel, wartość, obciążenia hipoteczne...',
                    rows: 4,
                    showIf: { property_exists: 'yes' }
                },
                {
                    id: 'property_vehicles',
                    type: 'textarea',
                    label: 'Pojazdy (samochody, motocykle)',
                    placeholder: 'Marka, model, rok, wartość, właściciel...',
                    rows: 3,
                    showIf: { property_exists: 'yes' }
                },
                {
                    id: 'property_savings',
                    type: 'textarea',
                    label: 'Oszczędności, konta bankowe',
                    placeholder: 'Bank, numer konta, saldo...',
                    rows: 3,
                    showIf: { property_exists: 'yes' }
                },
                {
                    id: 'property_business',
                    type: 'textarea',
                    label: 'Firmy, udziały w spółkach',
                    placeholder: 'Nazwa firmy, wartość udziałów...',
                    rows: 3,
                    showIf: { property_exists: 'yes' }
                },
                {
                    id: 'property_other',
                    type: 'textarea',
                    label: 'Inny majątek (dzieła sztuki, biżuteria, inwestycje)',
                    placeholder: 'Opis, wartość...',
                    rows: 3,
                    showIf: { property_exists: 'yes' }
                },
                {
                    id: 'property_division_proposal',
                    type: 'select',
                    label: 'Propozycja podziału',
                    options: [
                        { value: 'equal', label: 'Po połowie (50/50)' },
                        { value: 'unequal', label: 'Nierówny (z uzasadnieniem)' },
                        { value: 'agreed', label: 'Uzgodniony polubownie' }
                    ],
                    showIf: { property_exists: 'yes' }
                },
                {
                    id: 'property_division_details',
                    type: 'textarea',
                    label: 'Szczegóły propozycji podziału',
                    placeholder: 'Kto co dostaje, ewentualne spłaty...',
                    rows: 5,
                    showIf: { property_exists: 'yes' }
                }
            ]
        },
        {
            id: 9,
            title: '',
            description: 'Dochody i zobowiązania',
            questions: [
                {
                    id: 'client_income',
                    type: 'number',
                    label: 'Miesięczne dochody klienta (netto PLN)',
                    placeholder: 'np. 5000',
                    required: true
                },
                {
                    id: 'client_income_source',
                    type: 'select',
                    label: 'Źródło dochodu klienta',
                    options: [
                        { value: 'employment', label: 'Umowa o pracę' },
                        { value: 'business', label: 'Działalność gospodarcza' },
                        { value: 'unemployment', label: 'Zasiłek dla bezrobotnych' },
                        { value: 'pension', label: 'Emerytura / Renta' },
                        { value: 'none', label: 'Brak dochodów' },
                        { value: 'other', label: 'Inne źródła' }
                    ]
                },
                {
                    id: 'spouse_income',
                    type: 'number',
                    label: 'Miesięczne dochody drugiej strony (netto PLN)',
                    placeholder: 'np. 4000'
                },
                {
                    id: 'spouse_income_source',
                    type: 'select',
                    label: 'Źródło dochodu drugiej strony',
                    options: [
                        { value: 'employment', label: 'Umowa o pracę' },
                        { value: 'business', label: 'Działalność gospodarcza' },
                        { value: 'unemployment', label: 'Zasiłek dla bezrobotnych' },
                        { value: 'pension', label: 'Emerytura / Renta' },
                        { value: 'none', label: 'Brak dochodów' },
                        { value: 'other', label: 'Inne źródła' }
                    ]
                },
                {
                    id: 'client_expenses',
                    type: 'number',
                    label: 'Miesięczne wydatki klienta (PLN)',
                    placeholder: 'Czynsz, rachunki, żywność, kredyty...'
                },
                {
                    id: 'debts_exist',
                    type: 'select',
                    label: 'Czy są wspólne długi?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'debts_description',
                    type: 'textarea',
                    label: 'Opis długów (kredyty, pożyczki)',
                    placeholder: 'Kredyt hipoteczny, kredyt samochodowy, pożyczki...\nKwota, miesięczna rata, pozostało do spłaty...',
                    rows: 5,
                    showIf: { debts_exist: 'yes' }
                }
            ]
        }
    ]
};

console.log('✅ Family Part 2 załadowana (Sekcje 6-9)!');
