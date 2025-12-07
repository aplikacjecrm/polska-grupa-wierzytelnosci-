// ==========================================
// ANKIETA PODATKOWA - CZĘŚĆ 1 (Sekcje 1-4)
// ==========================================

window.taxQuestionnairePart1 = {
    sections: [
        {
            id: 1,
            title: '',
            description: 'Jaki jest główny przedmiot sprawy?',
            questions: [
                {
                    id: 'case_type',
                    type: 'select',
                    label: 'Typ sprawy podatkowej',
                    required: true,
                    options: [
                        { value: 'tax_assessment', label: 'Kontrola podatkowa / Weryfikacja deklaracji' },
                        { value: 'tax_decision', label: 'Decyzja wymiarowa (określenie zobowiązania)' },
                        { value: 'tax_interpretation', label: 'Interpretacja podatkowa (indywidualna/ogólna)' },
                        { value: 'vat_refund', label: 'Zwrot VAT / Nadpłata' },
                        { value: 'tax_arrears', label: 'Zaległości podatkowe / Egzekucja' },
                        { value: 'tax_penalty', label: 'Kara skarbowa / Postępowanie karnoskarbowe' },
                        { value: 'tax_appeal', label: 'Odwołanie / Skarga do WSA/NSA' },
                        { value: 'tax_correction', label: 'Korekta deklaracji / Zeznania' },
                        { value: 'transfer_pricing', label: 'Ceny transferowe' },
                        { value: 'international_tax', label: 'Podwójne opodatkowanie / Międzynarodowe' }
                    ]
                },
                {
                    id: 'tax_type',
                    type: 'select',
                    label: 'Rodzaj podatku',
                    required: true,
                    options: [
                        { value: 'vat', label: 'VAT (podatek od towarów i usług)' },
                        { value: 'pit', label: 'PIT (podatek dochodowy od osób fizycznych)' },
                        { value: 'cit', label: 'CIT (podatek dochodowy od osób prawnych)' },
                        { value: 'excise', label: 'Akcyza' },
                        { value: 'property', label: 'Podatek od nieruchomości' },
                        { value: 'inheritance', label: 'Podatek od spadków i darowizn' },
                        { value: 'civil_law', label: 'PCC (podatek od czynności cywilnoprawnych)' },
                        { value: 'withholding', label: 'Podatek u źródła (WHT)' },
                        { value: 'other', label: 'Inny podatek' }
                    ]
                },
                {
                    id: 'tax_period',
                    type: 'text',
                    label: 'Okres rozliczeniowy',
                    placeholder: 'np. 2023, I kwartał 2024, styczeń 2024',
                    required: true
                },
                {
                    id: 'taxpayer_type',
                    type: 'select',
                    label: 'Typ podatnika',
                    options: [
                        { value: 'individual', label: 'Osoba fizyczna' },
                        { value: 'sole_proprietor', label: 'Przedsiębiorca - osoba fizyczna' },
                        { value: 'company', label: 'Spółka (sp. z o.o., S.A.)' },
                        { value: 'partnership', label: 'Spółka osobowa' },
                        { value: 'foundation', label: 'Fundacja / Stowarzyszenie' },
                        { value: 'other', label: 'Inny podmiot' }
                    ]
                },
                {
                    id: 'urgency',
                    type: 'select',
                    label: 'Pilność sprawy',
                    required: true,
                    options: [
                        { value: 'critical', label: '🔴 Krytyczne (egzekucja, zajęcie konta, termin odwołania)' },
                        { value: 'high', label: '🟠 Wysokie (kontrola w toku, zaległości)' },
                        { value: 'medium', label: '🟡 Średnie (decyzja, oczekiwanie na zwrot)' },
                        { value: 'low', label: '🟢 Niskie (planowanie, interpretacja)' }
                    ]
                }
            ]
        },
        {
            id: 2,
            title: '',
            description: 'Który organ prowadzi sprawę?',
            questions: [
                {
                    id: 'tax_authority',
                    type: 'select',
                    label: 'Właściwy organ',
                    options: [
                        { value: 'us', label: 'Urząd Skarbowy' },
                        { value: 'knis', label: 'Krajowa Informacja Skarbowa (KIS)' },
                        { value: 'customs', label: 'Urząd Celno-Skarbowy' },
                        { value: 'local_tax', label: 'Urząd Miasta/Gminy (podatki lokalne)' },
                        { value: 'wsa', label: 'Wojewódzki Sąd Administracyjny' },
                        { value: 'nsa', label: 'Naczelny Sąd Administracyjny' },
                        { value: 'prosecutor', label: 'Prokuratura (postępowanie karnoskarbowe)' }
                    ]
                },
                {
                    id: 'office_name',
                    type: 'text',
                    label: 'Nazwa urzędu/sądu',
                    placeholder: 'np. Urząd Skarbowy Warszawa-Śródmieście'
                },
                {
                    id: 'case_number',
                    type: 'text',
                    label: 'Numer sprawy/decyzji',
                    placeholder: 'np. 1234-KAN.5401.123.2024'
                },
                {
                    id: 'inspector_name',
                    type: 'text',
                    label: 'Inspektor/urzędnik prowadzący',
                    placeholder: 'Imię i nazwisko'
                },
                {
                    id: 'has_decision',
                    type: 'select',
                    label: 'Czy wydano decyzję?',
                    options: [
                        { value: 'yes', label: 'Tak, otrzymałem decyzję' },
                        { value: 'no', label: 'Nie, w trakcie postępowania' }
                    ]
                },
                {
                    id: 'decision_date',
                    type: 'date',
                    label: 'Data wydania decyzji',
                    showIf: { has_decision: 'yes' }
                },
                {
                    id: 'decision_received',
                    type: 'date',
                    label: 'Data doręczenia decyzji',
                    showIf: { has_decision: 'yes' },
                    help: 'WAŻNE: Termin na odwołanie liczy się od daty doręczenia!'
                },
                {
                    id: 'appeal_deadline',
                    type: 'date',
                    label: 'Termin na odwołanie (14 dni od doręczenia)',
                    showIf: { has_decision: 'yes' },
                    help: 'UWAGA: Termin 14 dni jest nieprzekraczalny!'
                }
            ]
        },
        {
            id: 3,
            title: '',
            description: 'Wartość przedmiotu sporu',
            questions: [
                {
                    id: 'amount_disputed',
                    type: 'number',
                    label: 'Kwota sporna (PLN)',
                    placeholder: 'np. 50000',
                    required: true
                },
                {
                    id: 'amount_type',
                    type: 'select',
                    label: 'Rodzaj kwoty',
                    options: [
                        { value: 'tax_liability', label: 'Zobowiązanie podatkowe' },
                        { value: 'penalty', label: 'Kara / Sankcja' },
                        { value: 'interest', label: 'Odsetki' },
                        { value: 'refund', label: 'Zwrot / Nadpłata' },
                        { value: 'total', label: 'Łączna kwota (podatek + odsetki + kary)' }
                    ]
                },
                {
                    id: 'amount_paid',
                    type: 'number',
                    label: 'Kwota już zapłacona (PLN)',
                    placeholder: 'np. 10000'
                },
                {
                    id: 'payment_deadline',
                    type: 'date',
                    label: 'Termin płatności'
                },
                {
                    id: 'enforcement',
                    type: 'select',
                    label: 'Czy wszczęto egzekucję?',
                    options: [
                        { value: 'yes', label: 'Tak, trwa egzekucja' },
                        { value: 'suspended', label: 'Zawieszona' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'enforcement_details',
                    type: 'textarea',
                    label: 'Szczegóły egzekucji',
                    placeholder: 'Zajęcie konta, zajęcie nieruchomości, inne działania...',
                    rows: 3,
                    showIf: { enforcement: ['yes', 'suspended'] }
                }
            ]
        },
        {
            id: 4,
            title: '',
            description: 'Czy była/jest kontrola?',
            questions: [
                {
                    id: 'has_audit',
                    type: 'select',
                    label: 'Czy przeprowadzono kontrolę?',
                    options: [
                        { value: 'yes_finished', label: 'Tak, kontrola zakończona' },
                        { value: 'yes_ongoing', label: 'Tak, kontrola w toku' },
                        { value: 'no', label: 'Nie było kontroli' }
                    ]
                },
                {
                    id: 'audit_type',
                    type: 'select',
                    label: 'Rodzaj kontroli',
                    options: [
                        { value: 'desk', label: 'Kontrola kameralna (w urzędzie)' },
                        { value: 'field', label: 'Kontrola podatkowa (u podatnika)' },
                        { value: 'customs', label: 'Kontrola celno-skarbowa' },
                        { value: 'vat', label: 'Kontrola VAT' },
                        { value: 'kas', label: 'Kontrola KAS (Krajowa Administracja Skarbowa)' }
                    ],
                    showIf: { has_audit: ['yes_finished', 'yes_ongoing'] }
                },
                {
                    id: 'audit_start_date',
                    type: 'date',
                    label: 'Data rozpoczęcia kontroli',
                    showIf: { has_audit: ['yes_finished', 'yes_ongoing'] }
                },
                {
                    id: 'audit_end_date',
                    type: 'date',
                    label: 'Data zakończenia kontroli',
                    showIf: { has_audit: 'yes_finished' }
                },
                {
                    id: 'audit_findings',
                    type: 'textarea',
                    label: 'Ustalenia kontroli / Protokół',
                    placeholder: 'Główne nieprawidłowości stwierdzone przez organ...',
                    rows: 5,
                    showIf: { has_audit: ['yes_finished', 'yes_ongoing'] }
                },
                {
                    id: 'audit_objection',
                    type: 'select',
                    label: 'Czy złożono zastrzeżenia do protokołu?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'planned', label: 'Planowane' },
                        { value: 'no', label: 'Nie' }
                    ],
                    showIf: { has_audit: ['yes_finished', 'yes_ongoing'] }
                }
            ]
        }
    ]
};

console.log('✅ Tax Part 1 załadowana (Sekcje 1-4)!');
