// ==========================================
// ANKIETA PRAWA MIĘDZYNARODOWEGO - CZĘŚĆ 2 (Sekcje 5-7)
// Arbitraż, Egzekucja, UE/TSUE
// ==========================================

window.internationalQuestionnairePart2 = {
    sections: [
        {
            id: 5,
            title: 'Arbitraż Międzynarodowy',
            description: 'Tylko dla spraw arbitrażowych (ARB/)',
            questions: [
                {
                    id: 'arbitration_institution',
                    type: 'select',
                    label: 'Instytucja arbitrażowa',
                    options: [
                        { value: 'icc', label: 'ICC - International Chamber of Commerce (Paryż)' },
                        { value: 'lcia', label: 'LCIA - London Court of International Arbitration' },
                        { value: 'sac', label: 'SAC - Sąd Arbitrażowy przy KIG (Polska)' },
                        { value: 'viac', label: 'VIAC - Vienna International Arbitral Centre' },
                        { value: 'scc', label: 'SCC - Stockholm Chamber of Commerce' },
                        { value: 'hkiac', label: 'HKIAC - Hong Kong Intl Arbitration Centre' },
                        { value: 'icsid', label: 'ICSID - Bank Światowy (inwestycje)' },
                        { value: 'ad_hoc', label: 'Arbitraż ad hoc (brak instytucji)' },
                        { value: 'other', label: 'Inna' }
                    ]
                },
                {
                    id: 'arbitration_rules',
                    type: 'select',
                    label: 'Stosowane reguły arbitrażowe',
                    options: [
                        { value: 'icc', label: 'Reguły ICC' },
                        { value: 'lcia', label: 'Reguły LCIA' },
                        { value: 'uncitral', label: 'Reguły UNCITRAL' },
                        { value: 'sac', label: 'Reguły SAC przy KIG' },
                        { value: 'icsid', label: 'Konwencja ICSID' },
                        { value: 'custom', label: 'Reguły określone w umowie' },
                        { value: 'unknown', label: 'Nieznane / do ustalenia' }
                    ]
                },
                {
                    id: 'arbitration_seat',
                    type: 'text',
                    label: 'Siedziba arbitrażu (miejsce)',
                    placeholder: 'np. Londyn, Paryż, Warszawa',
                    help: 'Bardzo ważne - określa lex arbitri i właściwy sąd!'
                },
                {
                    id: 'arbitrators_count',
                    type: 'select',
                    label: 'Liczba arbitrów',
                    options: [
                        { value: '1', label: '1 arbiter (sole arbitrator)' },
                        { value: '3', label: '3 arbitrów (tribunal)' },
                        { value: 'other', label: 'Inna liczba' },
                        { value: 'not_decided', label: 'Jeszcze nieustalona' }
                    ]
                },
                {
                    id: 'arbitrator_appointment_status',
                    type: 'select',
                    label: 'Status powołania arbitrów',
                    options: [
                        { value: 'not_started', label: 'Nie rozpoczęto' },
                        { value: 'in_progress', label: 'W trakcie (strony wybierają)' },
                        { value: 'completed', label: 'Zakończone (trybunał ukonstytuowany)' },
                        { value: 'challenge', label: 'Spór o wyłączenie arbitra' }
                    ]
                },
                {
                    id: 'arbitration_costs',
                    type: 'number',
                    label: 'Szacowane koszty arbitrażu (EUR/USD)',
                    placeholder: 'np. 50000',
                    help: 'ICC: 50k-200k EUR, LCIA: podobnie'
                },
                {
                    id: 'arbitration_stage',
                    type: 'select',
                    label: 'Etap postępowania arbitrażowego',
                    options: [
                        { value: 'pre_filing', label: 'Przed złożeniem wniosku' },
                        { value: 'request_filed', label: 'Wniosek o arbitraż złożony' },
                        { value: 'answer_pending', label: 'Czekamy na odpowiedź strony przeciwnej' },
                        { value: 'preliminary', label: 'Konferencja wstępna' },
                        { value: 'written', label: 'Faza pisemna (memoriały)' },
                        { value: 'hearing', label: 'Przesłuchanie (hearing)' },
                        { value: 'award_pending', label: 'Oczekiwanie na wyrok (award)' },
                        { value: 'award_issued', label: 'Wyrok wydany' },
                        { value: 'enforcement', label: 'Egzekucja wyroku' },
                        { value: 'annulment', label: 'Postępowanie o uchylenie' }
                    ]
                }
            ]
        },
        {
            id: 6,
            title: '',
            description: 'Dla spraw EUR/ i pytań prejudycjalnych',
            questions: [
                {
                    id: 'eu_matter_type',
                    type: 'select',
                    label: 'Typ sprawy z prawem UE',
                    options: [
                        { value: 'state_aid', label: 'Pomoc publiczna (Art. 107-109 TFUE)' },
                        { value: 'competition', label: 'Prawo konkurencji (Art. 101-102 TFUE)' },
                        { value: 'procurement', label: 'Zamówienia publiczne (dyrektywy)' },
                        { value: 'gdpr', label: 'RODO / ochrona danych' },
                        { value: 'consumer', label: 'Ochrona konsumentów' },
                        { value: 'free_movement', label: 'Swobody podstawowe (towary, usługi, kapitał)' },
                        { value: 'posted_workers', label: 'Pracownicy delegowani (dyrektywa)' },
                        { value: 'vat', label: 'VAT / podatki pośrednie' },
                        { value: 'environmental', label: 'Ochrona środowiska' },
                        { value: 'fundamental_rights', label: 'Prawa podstawowe (Karta Praw)' },
                        { value: 'other', label: 'Inne' }
                    ]
                },
                {
                    id: 'eu_directives',
                    type: 'textarea',
                    label: 'Stosowane dyrektywy/rozporządzenia UE',
                    placeholder: 'np. Dyrektywa 2000/78/WE, RODO (679/2016), Dyrektywa 93/13...',
                    rows: 3
                },
                {
                    id: 'tsue_reference',
                    type: 'select',
                    label: 'Czy planowane pytanie prejudycjalne do TSUE?',
                    options: [
                        { value: 'yes_planned', label: 'Tak - planujemy wystąpić' },
                        { value: 'yes_filed', label: 'Tak - już wystąpiliśmy do TSUE' },
                        { value: 'pending_tsue', label: 'Sprawa zawisła przed TSUE' },
                        { value: 'no', label: 'Nie' },
                        { value: 'consider', label: 'Rozważamy' }
                    ]
                },
                {
                    id: 'tsue_case_number',
                    type: 'text',
                    label: 'Sygnatura sprawy przed TSUE',
                    placeholder: 'np. C-123/21',
                    showIf: { tsue_reference: ['yes_filed', 'pending_tsue'] }
                },
                {
                    id: 'eu_commission_complaint',
                    type: 'select',
                    label: 'Czy złożono skargę do Komisji Europejskiej?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'planned', label: 'Planujemy' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'infringement_procedure',
                    type: 'select',
                    label: 'Czy Polska jest objęta postępowaniem o naruszenie?',
                    options: [
                        { value: 'yes', label: 'Tak - trwa postępowanie vs Polska' },
                        { value: 'no', label: 'Nie' },
                        { value: 'unknown', label: 'Nie wiem' }
                    ]
                }
            ]
        },
        {
            id: 7,
            title: '',
            description: 'Wykonanie wyroku zagranicznego w Polsce lub polskiego za granicą',
            questions: [
                {
                    id: 'enforcement_type',
                    type: 'select',
                    label: 'Typ egzekucji',
                    options: [
                        { value: 'none', label: 'Nie dotyczy' },
                        { value: 'foreign_in_poland', label: 'Wyrok zagraniczny → egzekucja w Polsce' },
                        { value: 'polish_abroad', label: 'Wyrok polski → egzekucja za granicą' },
                        { value: 'arbitral_award', label: 'Wyrok arbitrażowy (Konwencja Nowojorska)' }
                    ]
                },
                {
                    id: 'judgment_country',
                    type: 'text',
                    label: 'Kraj wydania wyroku',
                    placeholder: 'np. Niemcy, Francja, USA',
                    showIf: { enforcement_type: ['foreign_in_poland', 'polish_abroad'] }
                },
                {
                    id: 'judgment_date',
                    type: 'date',
                    label: 'Data wydania wyroku',
                    showIf: { enforcement_type: ['foreign_in_poland', 'polish_abroad', 'arbitral_award'] }
                },
                {
                    id: 'judgment_final',
                    type: 'select',
                    label: 'Czy wyrok jest prawomocny?',
                    options: [
                        { value: 'yes', label: 'Tak - prawomocny' },
                        { value: 'no', label: 'Nie - trwa postępowanie' },
                        { value: 'unknown', label: 'Nie wiem' }
                    ],
                    showIf: { enforcement_type: ['foreign_in_poland', 'polish_abroad', 'arbitral_award'] }
                },
                {
                    id: 'exequatur_status',
                    type: 'select',
                    label: 'Status uznania/nadania wykonalności (exequatur)',
                    options: [
                        { value: 'not_needed', label: 'Nie jest potrzebne (Bruksela I bis)' },
                        { value: 'not_filed', label: 'Nie złożono jeszcze' },
                        { value: 'pending', label: 'Wniosek złożony - oczekiwanie' },
                        { value: 'granted', label: 'Uznany / nadano klauzulę wykonalności' },
                        { value: 'refused', label: 'Odmówiono uznania' },
                        { value: 'appeal', label: 'Trwa postępowanie odwoławcze' }
                    ],
                    showIf: { enforcement_type: ['foreign_in_poland', 'polish_abroad', 'arbitral_award'] }
                },
                {
                    id: 'applicable_convention',
                    type: 'select',
                    label: 'Stosowana konwencja o uznaniu wyroków',
                    options: [
                        { value: 'brussels', label: 'Bruksela I bis (UE - automatyczne uznanie)' },
                        { value: 'lugano', label: 'Konwencja Lugano (Szwajcaria, Norwegia...)' },
                        { value: 'new_york', label: 'Konwencja Nowojorska (wyroki arbitrażowe)' },
                        { value: 'hague', label: 'Konwencja Haska' },
                        { value: 'bilateral', label: 'Umowa dwustronna Polska-[kraj]' },
                        { value: 'reciprocity', label: 'Wzajemność (bez konwencji)' },
                        { value: 'none', label: 'Brak podstawy' }
                    ],
                    showIf: { enforcement_type: ['foreign_in_poland', 'polish_abroad', 'arbitral_award'] }
                },
                {
                    id: 'enforcement_court',
                    type: 'text',
                    label: 'Właściwy sąd dla uznania/egzekucji',
                    placeholder: 'np. Sąd Okręgowy w Warszawie',
                    showIf: { enforcement_type: ['foreign_in_poland', 'polish_abroad', 'arbitral_award'] }
                },
                {
                    id: 'assets_location',
                    type: 'textarea',
                    label: 'Lokalizacja majątku dłużnika',
                    placeholder: 'Gdzie znajduje się majątek do egzekucji?',
                    rows: 3,
                    showIf: { enforcement_type: ['foreign_in_poland', 'polish_abroad', 'arbitral_award'] }
                }
            ]
        }
    ]
};

console.log('✅ International Part 2 załadowana (Sekcje 5-7)!');
