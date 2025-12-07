// ==========================================
// ANKIETA SPADKOWA - CZĘŚĆ 1 (Sekcje 1-4)
// ==========================================

window.inheritanceQuestionnairePart1 = {
    sections: [
        {
            id: 1,
            title: 'Spadkodawca (Zmarły)',
            description: 'Podstawowe informacje o osobie zmarłej',
            questions: [
                {
                    id: 'deceased_full_name',
                    type: 'text',
                    label: 'Imię i nazwisko zmarłego',
                    required: true,
                    placeholder: 'np. Jan Kowalski'
                },
                {
                    id: 'deceased_pesel',
                    type: 'text',
                    label: 'PESEL zmarłego',
                    required: true,
                    placeholder: '11 cyfr'
                },
                {
                    id: 'deceased_birth_date',
                    type: 'date',
                    label: 'Data urodzenia',
                    required: true
                },
                {
                    id: 'deceased_death_date',
                    type: 'date',
                    label: 'Data śmierci',
                    required: true,
                    help: 'Bardzo ważna - od niej liczą się terminy!'
                },
                {
                    id: 'deceased_death_place',
                    type: 'text',
                    label: 'Miejsce śmierci',
                    required: true,
                    placeholder: 'Miasto, adres'
                },
                {
                    id: 'deceased_last_residence',
                    type: 'text',
                    label: 'Ostatnie miejsce zamieszkania',
                    required: true,
                    placeholder: 'Adres zameldowania przed śmiercią'
                },
                {
                    id: 'deceased_marital_status',
                    type: 'select',
                    label: 'Stan cywilny w chwili śmierci',
                    required: true,
                    options: [
                        { value: 'married', label: 'W związku małżeńskim' },
                        { value: 'widow', label: 'Wdowa/Wdowiec' },
                        { value: 'divorced', label: 'Rozwiedziony/a' },
                        { value: 'single', label: 'Kawaler/Panna' }
                    ]
                },
                {
                    id: 'deceased_spouse_name',
                    type: 'text',
                    label: 'Imię i nazwisko małżonka (jeśli był)',
                    placeholder: 'Tylko jeśli zmarły był w związku małżeńskim',
                    showIf: { deceased_marital_status: ['married', 'widow'] }
                }
            ]
        },
        {
            id: 2,
            title: '',
            description: 'Lista wszystkich potencjalnych spadkobierców',
            questions: [
                {
                    id: 'heirs_count',
                    type: 'number',
                    label: 'Ile osób może dziedziczyć?',
                    required: true,
                    min: 1,
                    help: 'Uwzględnij: dzieci, małżonka, rodziców, rodzeństwo'
                },
                {
                    id: 'heirs_list',
                    type: 'repeatable',
                    label: 'Lista spadkobierców',
                    fields: [
                        {
                            id: 'heir_name',
                            type: 'text',
                            label: 'Imię i nazwisko',
                            required: true
                        },
                        {
                            id: 'heir_pesel',
                            type: 'text',
                            label: 'PESEL',
                            required: true
                        },
                        {
                            id: 'heir_relation',
                            type: 'select',
                            label: 'Stopień pokrewieństwa',
                            required: true,
                            options: [
                                { value: 'spouse', label: 'Małżonek/ka' },
                                { value: 'child', label: 'Dziecko' },
                                { value: 'parent', label: 'Rodzic' },
                                { value: 'sibling', label: 'Rodzeństwo' },
                                { value: 'grandchild', label: 'Wnuk/Wnuczka' },
                                { value: 'other', label: 'Inny krewny' }
                            ]
                        },
                        {
                            id: 'heir_address',
                            type: 'text',
                            label: 'Adres zamieszkania',
                            required: true
                        },
                        {
                            id: 'heir_contact',
                            type: 'text',
                            label: 'Telefon / Email',
                            placeholder: 'Kontakt do spadkobiercy'
                        },
                        {
                            id: 'heir_minor',
                            type: 'checkbox',
                            label: 'Osoba niepełnoletnia (poniżej 18 lat)'
                        }
                    ]
                },
                {
                    id: 'heirs_conflict',
                    type: 'select',
                    label: 'Czy są konflikty między spadkobiercami?',
                    required: true,
                    options: [
                        { value: 'no', label: 'Nie, wszyscy się zgadzają' },
                        { value: 'minor', label: 'Drobne nieporozumienia' },
                        { value: 'major', label: 'Poważny konflikt' }
                    ]
                },
                {
                    id: 'heirs_renounce',
                    type: 'textarea',
                    label: 'Kto chce odrzucić spadek?',
                    placeholder: 'Podaj imiona i nazwiska osób, które chcą odrzucić spadek (jeśli dotyczy)',
                    rows: 3
                }
            ]
        },
        {
            id: 3,
            title: '',
            description: 'Wszystko co wchodzi w skład spadku',
            questions: [
                {
                    id: 'estate_real_estate',
                    type: 'repeatable',
                    label: 'Nieruchomości (mieszkania, domy, działki)',
                    fields: [
                        {
                            id: 'property_type',
                            type: 'select',
                            label: 'Typ nieruchomości',
                            options: [
                                { value: 'apartment', label: 'Mieszkanie' },
                                { value: 'house', label: 'Dom' },
                                { value: 'land', label: 'Działka' },
                                { value: 'garage', label: 'Garaż' },
                                { value: 'commercial', label: 'Lokal użytkowy' }
                            ]
                        },
                        {
                            id: 'property_address',
                            type: 'text',
                            label: 'Adres',
                            placeholder: 'Pełny adres nieruchomości'
                        },
                        {
                            id: 'property_area',
                            type: 'text',
                            label: 'Powierzchnia',
                            placeholder: 'np. 65 m²'
                        },
                        {
                            id: 'property_value',
                            type: 'number',
                            label: 'Szacunkowa wartość (PLN)',
                            placeholder: 'Przybliżona wartość rynkowa'
                        },
                        {
                            id: 'property_mortgage',
                            type: 'checkbox',
                            label: 'Obciążona hipoteką / kredytem'
                        }
                    ]
                },
                {
                    id: 'estate_vehicles',
                    type: 'repeatable',
                    label: 'Pojazdy (samochody, motocykle)',
                    fields: [
                        {
                            id: 'vehicle_type',
                            type: 'text',
                            label: 'Marka i model',
                            placeholder: 'np. Toyota Corolla 2015'
                        },
                        {
                            id: 'vehicle_registration',
                            type: 'text',
                            label: 'Numer rejestracyjny'
                        },
                        {
                            id: 'vehicle_value',
                            type: 'number',
                            label: 'Wartość pojazdu (PLN)'
                        }
                    ]
                },
                {
                    id: 'estate_bank_accounts',
                    type: 'repeatable',
                    label: 'Rachunki bankowe',
                    fields: [
                        {
                            id: 'bank_name',
                            type: 'text',
                            label: 'Nazwa banku'
                        },
                        {
                            id: 'account_number',
                            type: 'text',
                            label: 'Numer rachunku'
                        },
                        {
                            id: 'account_balance',
                            type: 'number',
                            label: 'Saldo na dzień śmierci (PLN)',
                            help: 'Przybliżona kwota'
                        }
                    ]
                },
                {
                    id: 'estate_other_assets',
                    type: 'textarea',
                    label: 'Inne składniki majątku',
                    placeholder: 'Biżuteria, dzieła sztuki, udziały w firmie, itp.',
                    rows: 4
                },
                {
                    id: 'estate_total_value',
                    type: 'number',
                    label: 'Szacunkowa wartość całego spadku (PLN)',
                    required: true,
                    help: 'Suma wszystkich składników majątku'
                }
            ]
        },
        {
            id: 4,
            title: '',
            description: 'Czy zmarły sporządził testament?',
            questions: [
                {
                    id: 'testament_exists',
                    type: 'select',
                    label: 'Czy istnieje testament?',
                    required: true,
                    options: [
                        { value: 'yes', label: 'Tak, jest testament' },
                        { value: 'no', label: 'Nie ma testamentu' },
                        { value: 'unknown', label: 'Nie wiem / Trzeba sprawdzić' }
                    ]
                },
                {
                    id: 'testament_type',
                    type: 'select',
                    label: 'Rodzaj testamentu',
                    showIf: { testament_exists: 'yes' },
                    options: [
                        { value: 'notarial', label: 'Notarialny (u notariusza)' },
                        { value: 'holographic', label: 'Holograficzny (własnoręczny)' },
                        { value: 'allographic', label: 'Allograficzny (przy świadkach)' }
                    ]
                },
                {
                    id: 'testament_date',
                    type: 'date',
                    label: 'Data sporządzenia testamentu',
                    showIf: { testament_exists: 'yes' }
                },
                {
                    id: 'testament_location',
                    type: 'text',
                    label: 'Gdzie znajduje się testament?',
                    placeholder: 'U notariusza / W domu / W banku',
                    showIf: { testament_exists: 'yes' }
                },
                {
                    id: 'testament_beneficiaries',
                    type: 'textarea',
                    label: 'Kto jest wymieniony w testamencie?',
                    placeholder: 'Wymień osoby i co im zostało zapisane',
                    rows: 4,
                    showIf: { testament_exists: 'yes' }
                },
                {
                    id: 'testament_disputed',
                    type: 'checkbox',
                    label: 'Są wątpliwości co do ważności testamentu',
                    showIf: { testament_exists: 'yes' }
                },
                {
                    id: 'testament_search_needed',
                    type: 'checkbox',
                    label: 'Trzeba sprawdzić w Centralnym Rejestrze Testamentów',
                    showIf: { testament_exists: ['no', 'unknown'] }
                }
            ]
        }
    ]
};

console.log('✅ Inheritance Part 1 załadowana (Sekcje 1-4)!');
