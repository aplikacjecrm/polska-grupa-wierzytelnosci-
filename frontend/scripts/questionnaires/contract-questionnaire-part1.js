// ==========================================
// ANKIETA UMOWNA - CZĘŚĆ 1 (Sekcje 1-4)
// ==========================================

window.contractQuestionnairePart1 = {
    sections: [
        {
            id: 1,
            title: '',
            description: 'O jaką umowę cywilno-prawną chodzi?',
            questions: [
                {
                    id: 'contract_type',
                    type: 'select',
                    label: 'Typ umowy',
                    required: true,
                    options: [
                        { value: 'sale', label: 'Umowa sprzedaży (kupno-sprzedaż)' },
                        { value: 'rental', label: 'Umowa najmu / dzierżawy' },
                        { value: 'loan', label: 'Umowa pożyczki' },
                        { value: 'service', label: 'Umowa o świadczenie usług' },
                        { value: 'work', label: 'Umowa o dzieło' },
                        { value: 'mandate', label: 'Umowa zlecenia' },
                        { value: 'donation', label: 'Umowa darowizny' },
                        { value: 'lease', label: 'Umowa leasingu' },
                        { value: 'other', label: 'Inna umowa cywilno-prawna' }
                    ]
                },
                {
                    id: 'contract_date',
                    type: 'date',
                    label: 'Data zawarcia umowy',
                    required: true
                },
                {
                    id: 'contract_value',
                    type: 'number',
                    label: 'Wartość umowy (PLN)',
                    required: false,
                    placeholder: 'np. 50000'
                },
                {
                    id: 'contract_parties',
                    type: 'number',
                    label: 'Liczba stron umowy',
                    required: true,
                    placeholder: '2'
                }
            ]
        },
        {
            id: 2,
            title: '',
            description: 'Kim są strony umowy?',
            questions: [
                {
                    id: 'our_client',
                    type: 'text',
                    label: 'Nasz klient (imię i nazwisko lub firma)',
                    required: true,
                    placeholder: 'Jan Kowalski lub Firma Sp. z o.o.'
                },
                {
                    id: 'our_client_pesel',
                    type: 'text',
                    label: 'PESEL / NIP klienta',
                    placeholder: '12345678901'
                },
                {
                    id: 'other_party',
                    type: 'text',
                    label: 'Druga strona umowy',
                    required: true,
                    placeholder: 'Anna Nowak lub Kontrahent Sp. z o.o.'
                },
                {
                    id: 'other_party_pesel',
                    type: 'text',
                    label: 'PESEL / NIP drugiej strony',
                    placeholder: '98765432109'
                }
            ]
        },
        {
            id: 3,
            title: 'Przedmiot Sporu',
            description: 'Na czym polega problem z umową?',
            questions: [
                {
                    id: 'dispute_type',
                    type: 'select',
                    label: 'Rodzaj sporu',
                    required: true,
                    options: [
                        { value: 'non_performance', label: 'Niewykonanie umowy' },
                        { value: 'improper_performance', label: 'Nienależyte wykonanie umowy' },
                        { value: 'payment', label: 'Brak zapłaty / Zwłoka w płatności' },
                        { value: 'termination', label: 'Rozwiązanie / Wypowiedzenie umowy' },
                        { value: 'invalidity', label: 'Nieważność umowy' },
                        { value: 'warranty', label: 'Rękojmia / Gwarancja' },
                        { value: 'damages', label: 'Odszkodowanie za szkodę' },
                        { value: 'other', label: 'Inny spór' }
                    ]
                },
                {
                    id: 'dispute_description',
                    type: 'textarea',
                    label: 'Opis sporu',
                    required: true,
                    placeholder: 'Opisz dokładnie na czym polega problem z umową...',
                    rows: 6
                },
                {
                    id: 'claim_amount',
                    type: 'number',
                    label: 'Wartość roszczenia (PLN)',
                    required: true,
                    placeholder: 'np. 25000'
                }
            ]
        },
        {
            id: 4,
            title: '',
            description: 'Czy były już jakieś działania w sprawie?',
            questions: [
                {
                    id: 'prior_actions',
                    type: 'select',
                    label: 'Czy były próby rozwiązania sporu?',
                    required: true,
                    options: [
                        { value: 'none', label: 'Nie było żadnych działań' },
                        { value: 'negotiations', label: 'Negocjacje / Mediacja' },
                        { value: 'demand_letter', label: 'Wezwanie do zapłaty' },
                        { value: 'court_pending', label: 'Sprawa w sądzie' },
                        { value: 'enforcement', label: 'Postępowanie egzekucyjne' }
                    ]
                },
                {
                    id: 'prior_actions_description',
                    type: 'textarea',
                    label: 'Opis dotychczasowych działań',
                    placeholder: 'Co zostało już zrobione w sprawie...',
                    rows: 4
                },
                {
                    id: 'court_case_number',
                    type: 'text',
                    label: 'Sygnatura sprawy sądowej (jeśli istnieje)',
                    placeholder: 'np. I C 123/2025'
                }
            ]
        }
    ]
};

console.log('✅ Contract Part 1 załadowana (Sekcje 1-4)!');
