// ==========================================
// ANKIETA PRAWA MIĘDZYNARODOWEGO - CZĘŚĆ 1 (Sekcje 1-4)
// Obsługuje: MIE/ (Międzynarodowe), EUR/ (Prawo europejskie), ARB/ (Arbitraż)
// ==========================================

window.internationalQuestionnairePart1 = {
    sections: [
        {
            id: 1,
            title: '',
            description: 'Określ typ sprawy z elementem międzynarodowym',
            questions: [
                {
                    id: 'case_subtype',
                    type: 'select',
                    label: 'Główny typ sprawy',
                    required: true,
                    options: [
                        { value: 'international', label: '🌍 Międzynarodowe (MIE) - transgraniczne spory, egzekucja' },
                        { value: 'european', label: '🇪🇺 Prawo Europejskie (EUR) - UE, TSUE, dyrektywy' },
                        { value: 'arbitration', label: '⚖️ Arbitraż Międzynarodowy (ARB) - ICC, LCIA, sądy polubowne' }
                    ]
                },
                {
                    id: 'subject_matter',
                    type: 'select',
                    label: 'Przedmiot sprawy',
                    options: [
                        { value: 'commercial', label: 'Umowy handlowe międzynarodowe' },
                        { value: 'investment', label: 'Inwestycje zagraniczne' },
                        { value: 'competition', label: 'Prawo konkurencji / antymonopolowe' },
                        { value: 'ip', label: 'Własność intelektualna (patenty, znaki)' },
                        { value: 'transport', label: 'Transport międzynarodowy' },
                        { value: 'employment', label: 'Zatrudnienie pracowników delegowanych' },
                        { value: 'data_protection', label: 'RODO / ochrona danych' },
                        { value: 'state_aid', label: 'Pomoc publiczna UE' },
                        { value: 'human_rights', label: 'Prawa człowieka (ETPC)' },
                        { value: 'recognition', label: 'Uznanie i wykonanie wyroków' },
                        { value: 'other', label: 'Inne' }
                    ]
                },
                {
                    id: 'jurisdiction',
                    type: 'select',
                    label: 'Właściwość sądu/organu',
                    options: [
                        { value: 'polish_court', label: 'Sąd polski' },
                        { value: 'foreign_court', label: 'Sąd zagraniczny' },
                        { value: 'tsue', label: 'Trybunał Sprawiedliwości UE (TSUE)' },
                        { value: 'etpc', label: 'Europejski Trybunał Praw Człowieka (ETPC)' },
                        { value: 'icc', label: 'ICC - Międzynarodowa Izba Handlowa' },
                        { value: 'lcia', label: 'LCIA - London Court of Intl Arbitration' },
                        { value: 'sac', label: 'Sąd Arbitrażowy przy KIG w Polsce' },
                        { value: 'icsid', label: 'ICSID - Bank Światowy (inwestycje)' },
                        { value: 'ad_hoc', label: 'Arbitraż ad hoc' },
                        { value: 'not_decided', label: 'Jeszcze nieustalona' }
                    ]
                },
                {
                    id: 'urgency',
                    type: 'select',
                    label: 'Pilność sprawy',
                    required: true,
                    options: [
                        { value: 'critical', label: '🔴 Krytyczne (egzekucja, nakaz zatrzymania)' },
                        { value: 'high', label: '🟠 Wysokie (termin sądowy, arbitraż)' },
                        { value: 'medium', label: '🟡 Średnie (negocjacje, przygotowanie)' },
                        { value: 'low', label: '🟢 Niskie (analiza prawna, opinia)' }
                    ]
                }
            ]
        },
        {
            id: 2,
            title: '',
            description: 'Kto jest stroną? Gdzie?',
            questions: [
                {
                    id: 'client_country',
                    type: 'text',
                    label: 'Kraj siedziby klienta',
                    placeholder: 'Polska',
                    required: true
                },
                {
                    id: 'opposing_party_country',
                    type: 'text',
                    label: 'Kraj siedziby strony przeciwnej',
                    placeholder: 'Niemcy, Francja, USA...'
                },
                {
                    id: 'opposing_party_name',
                    type: 'text',
                    label: 'Nazwa strony przeciwnej',
                    placeholder: 'Firma XYZ GmbH'
                },
                {
                    id: 'contract_countries',
                    type: 'textarea',
                    label: 'Kraje wykonania umowy / związane ze sprawą',
                    placeholder: 'Np. umowa zawarta w Polsce, wykonywana w Niemczech...',
                    rows: 3
                },
                {
                    id: 'applicable_law',
                    type: 'select',
                    label: 'Prawo właściwe (lex causae)',
                    options: [
                        { value: 'polish', label: 'Prawo polskie' },
                        { value: 'german', label: 'Prawo niemieckie' },
                        { value: 'french', label: 'Prawo francuskie' },
                        { value: 'english', label: 'Prawo angielskie' },
                        { value: 'us', label: 'Prawo USA' },
                        { value: 'eu', label: 'Prawo Unii Europejskiej' },
                        { value: 'vienna', label: 'Konwencja Wiedeńska (CISG)' },
                        { value: 'other', label: 'Inne' },
                        { value: 'disputed', label: 'Sporne / do ustalenia' }
                    ]
                },
                {
                    id: 'applicable_law_details',
                    type: 'textarea',
                    label: 'Szczegóły prawa właściwego',
                    placeholder: 'Dlaczego to prawo? Podstawa wyboru...',
                    rows: 3
                },
                {
                    id: 'language',
                    type: 'select',
                    label: 'Język postępowania',
                    options: [
                        { value: 'polish', label: 'Polski' },
                        { value: 'english', label: 'Angielski' },
                        { value: 'german', label: 'Niemiecki' },
                        { value: 'french', label: 'Francuski' },
                        { value: 'other', label: 'Inny' }
                    ]
                }
            ]
        },
        {
            id: 3,
            title: '',
            description: 'Podstawa prawna roszczenia',
            questions: [
                {
                    id: 'has_contract',
                    type: 'select',
                    label: 'Czy istnieje umowa pisemna?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie (umowa ustna / de facto)' }
                    ]
                },
                {
                    id: 'contract_date',
                    type: 'date',
                    label: 'Data zawarcia umowy',
                    showIf: { has_contract: 'yes' }
                },
                {
                    id: 'contract_value',
                    type: 'number',
                    label: 'Wartość umowy',
                    placeholder: 'np. 100000',
                    showIf: { has_contract: 'yes' }
                },
                {
                    id: 'contract_currency',
                    type: 'select',
                    label: 'Waluta umowy',
                    options: [
                        { value: 'PLN', label: 'PLN' },
                        { value: 'EUR', label: 'EUR' },
                        { value: 'USD', label: 'USD' },
                        { value: 'GBP', label: 'GBP' },
                        { value: 'CHF', label: 'CHF' },
                        { value: 'other', label: 'Inna' }
                    ],
                    showIf: { has_contract: 'yes' }
                },
                {
                    id: 'arbitration_clause',
                    type: 'select',
                    label: 'Czy umowa zawiera klauzulę arbitrażową?',
                    options: [
                        { value: 'yes_institutional', label: 'Tak - arbitraż instytucjonalny (ICC, LCIA, SAC)' },
                        { value: 'yes_ad_hoc', label: 'Tak - arbitraż ad hoc' },
                        { value: 'no', label: 'Nie' },
                        { value: 'unclear', label: 'Niejasna / sporna' }
                    ]
                },
                {
                    id: 'arbitration_details',
                    type: 'textarea',
                    label: 'Treść klauzuli arbitrażowej',
                    placeholder: 'Skopiuj pełną treść klauzuli...',
                    rows: 4,
                    showIf: { arbitration_clause: ['yes_institutional', 'yes_ad_hoc', 'unclear'] }
                },
                {
                    id: 'jurisdiction_clause',
                    type: 'select',
                    label: 'Czy umowa wskazuje właściwy sąd?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'jurisdiction_details',
                    type: 'textarea',
                    label: 'Treść klauzuli jurysdykcyjnej',
                    placeholder: 'Jaki sąd? W którym kraju?',
                    rows: 3,
                    showIf: { jurisdiction_clause: 'yes' }
                },
                {
                    id: 'applicable_conventions',
                    type: 'select',
                    label: 'Stosowane konwencje międzynarodowe',
                    multiple: true,
                    options: [
                        { value: 'cisg', label: 'CISG - Konwencja Wiedeńska (sprzedaż towarów)' },
                        { value: 'brussels', label: 'Bruksela I bis - jurysdykcja w UE' },
                        { value: 'rome_i', label: 'Rzym I - prawo właściwe dla umów' },
                        { value: 'rome_ii', label: 'Rzym II - prawo właściwe dla deliktów' },
                        { value: 'new_york', label: 'Konwencja Nowojorska - uznanie wyroków arbitrażowych' },
                        { value: 'hague', label: 'Konwencja Haska - uznanie wyroków' },
                        { value: 'lugano', label: 'Konwencja Lugano' },
                        { value: 'none', label: 'Brak / nie wiem' }
                    ]
                }
            ]
        },
        {
            id: 4,
            title: '',
            description: 'Czego dotyczy spór?',
            questions: [
                {
                    id: 'claim_type',
                    type: 'select',
                    label: 'Typ roszczenia',
                    options: [
                        { value: 'payment', label: 'Zapłata należności' },
                        { value: 'performance', label: 'Wykonanie zobowiązania' },
                        { value: 'damages', label: 'Odszkodowanie za szkodę' },
                        { value: 'termination', label: 'Rozwiązanie/unieważnienie umowy' },
                        { value: 'declaratory', label: 'Ustalenie (interpretacja, ważność)' },
                        { value: 'injunction', label: 'Zakaz / nakaz (IP, konkurencja)' },
                        { value: 'recognition', label: 'Uznanie i wykonanie wyroku' },
                        { value: 'annulment', label: 'Uchylenie wyroku arbitrażowego' },
                        { value: 'other', label: 'Inne' }
                    ]
                },
                {
                    id: 'claim_amount',
                    type: 'number',
                    label: 'Wartość roszczenia',
                    placeholder: 'np. 250000'
                },
                {
                    id: 'claim_currency',
                    type: 'select',
                    label: 'Waluta roszczenia',
                    options: [
                        { value: 'PLN', label: 'PLN' },
                        { value: 'EUR', label: 'EUR' },
                        { value: 'USD', label: 'USD' },
                        { value: 'GBP', label: 'GBP' },
                        { value: 'other', label: 'Inna' }
                    ]
                },
                {
                    id: 'claim_description',
                    type: 'textarea',
                    label: 'Opis roszczenia / sporu',
                    placeholder: 'Krótki opis: co się stało, czego domagamy się...',
                    rows: 6,
                    required: true
                },
                {
                    id: 'legal_basis',
                    type: 'textarea',
                    label: 'Podstawa prawna roszczenia',
                    placeholder: 'Przepisy, artykuły umowy, konwencje...',
                    rows: 4
                },
                {
                    id: 'time_limit',
                    type: 'date',
                    label: 'Termin przedawnienia / prekluzji',
                    help: 'Bardzo ważne dla spraw międzynarodowych!'
                }
            ]
        }
    ]
};

console.log('✅ International Part 1 załadowana (Sekcje 1-4)!');
