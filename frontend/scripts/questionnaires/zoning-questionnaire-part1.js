// ==========================================
// ANKIETA ZAGOSPODAROWANIA PRZESTRZENNEGO - CZĘŚĆ 1 (Sekcje 1-4)
// ==========================================

window.zoningQuestionnairePart1 = {
    sections: [
        {
            id: 1,
            title: 'Rodzaj Sprawy Zagospodarowania',
            description: 'Jaki jest główny przedmiot sprawy?',
            questions: [
                {
                    id: 'case_type',
                    type: 'select',
                    label: 'Typ sprawy planistycznej',
                    required: true,
                    options: [
                        { value: 'mpzp', label: 'MPZP - Miejscowy Plan Zagospodarowania Przestrzennego' },
                        { value: 'building_conditions', label: 'WZ - Warunki Zabudowy' },
                        { value: 'location_decision', label: 'Decyzja o ustaleniu lokalizacji inwestycji celu publicznego' },
                        { value: 'study', label: 'Studium Uwarunkowań i Kierunków Zagospodarowania' },
                        { value: 'appeal_mpzp', label: 'Skarżenie MPZP do WSA/NSA' },
                        { value: 'appeal_wz', label: 'Odwołanie od decyzji WZ' },
                        { value: 'participation', label: 'Udział w postępowaniu planistycznym' },
                        { value: 'compensation', label: 'Odszkodowanie za ograniczenia w MPZP' },
                        { value: 'property_value', label: 'Spadek wartości nieruchomości przez plan' },
                        { value: 'other', label: 'Inna sprawa planistyczna' }
                    ]
                },
                {
                    id: 'planning_stage',
                    type: 'select',
                    label: 'Na jakim etapie jest sprawa?',
                    options: [
                        { value: 'before_procedure', label: 'Przed wszczęciem postępowania' },
                        { value: 'procedure_ongoing', label: 'Postępowanie w toku (wyłożenie, uwagi)' },
                        { value: 'decision_issued', label: 'Decyzja/plan wydany' },
                        { value: 'appeal_pending', label: 'Odwołanie/skarga w toku' },
                        { value: 'wsa', label: 'Sprawa w WSA' },
                        { value: 'nsa', label: 'Sprawa w NSA' },
                        { value: 'enforcement', label: 'Egzekucja odszkodowania' }
                    ]
                },
                {
                    id: 'urgency',
                    type: 'select',
                    label: 'Pilność sprawy',
                    required: true,
                    options: [
                        { value: 'critical', label: '🔴 Krytyczne (termin na uwagi, skargę)' },
                        { value: 'high', label: '🟠 Wysokie (wyłożenie projektu, odwołanie)' },
                        { value: 'medium', label: '🟡 Średnie (procedura w toku)' },
                        { value: 'low', label: '🟢 Niskie (wstępne konsultacje)' }
                    ]
                },
                {
                    id: 'property_owner',
                    type: 'select',
                    label: 'Czy jesteś właścicielem nieruchomości?',
                    options: [
                        { value: 'yes', label: 'Tak, jestem właścicielem' },
                        { value: 'co_owner', label: 'Współwłaściciel' },
                        { value: 'investor', label: 'Inwestor (nie właściciel)' },
                        { value: 'neighbor', label: 'Sąsiad (dotyczy mojej okolicy)' },
                        { value: 'organization', label: 'Organizacja społeczna' },
                        { value: 'other', label: 'Inna sytuacja' }
                    ]
                }
            ]
        },
        {
            id: 2,
            title: '',
            description: 'Lokalizacja i dane nieruchomości',
            questions: [
                {
                    id: 'property_address',
                    type: 'text',
                    label: 'Adres nieruchomości',
                    placeholder: 'ul., miejscowość, gmina',
                    required: true
                },
                {
                    id: 'cadastral_number',
                    type: 'text',
                    label: 'Numer działki ewidencyjnej',
                    placeholder: 'np. 123/4, obręb XYZ',
                    required: true
                },
                {
                    id: 'property_area',
                    type: 'number',
                    label: 'Powierzchnia działki (m²)',
                    placeholder: 'np. 1500'
                },
                {
                    id: 'land_register',
                    type: 'text',
                    label: 'Numer księgi wieczystej',
                    placeholder: 'np. WA1W/00123456/7'
                },
                {
                    id: 'current_use',
                    type: 'select',
                    label: 'Obecne wykorzystanie działki',
                    options: [
                        { value: 'residential', label: 'Zabudowa mieszkaniowa jednorodzinna' },
                        { value: 'multi_family', label: 'Zabudowa mieszkaniowa wielorodzinna' },
                        { value: 'commercial', label: 'Działalność gospodarcza / usługi' },
                        { value: 'agriculture', label: 'Rolna' },
                        { value: 'forest', label: 'Leśna' },
                        { value: 'undeveloped', label: 'Niezabudowana' },
                        { value: 'mixed', label: 'Zabudowa mieszana' },
                        { value: 'other', label: 'Inne' }
                    ]
                },
                {
                    id: 'existing_buildings',
                    type: 'select',
                    label: 'Czy na działce są budynki?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'building_details',
                    type: 'textarea',
                    label: 'Opis istniejących budynków',
                    placeholder: 'Rodzaj, rok budowy, powierzchnia, przeznaczenie...',
                    rows: 3,
                    showIf: { existing_buildings: 'yes' }
                }
            ]
        },
        {
            id: 3,
            title: '',
            description: 'Plany i decyzje dotyczące nieruchomości',
            questions: [
                {
                    id: 'has_mpzp',
                    type: 'select',
                    label: 'Czy dla działki obowiązuje MPZP?',
                    options: [
                        { value: 'yes', label: 'Tak, obowiązuje plan miejscowy' },
                        { value: 'in_progress', label: 'W opracowaniu (procedura w toku)' },
                        { value: 'no', label: 'Nie, brak planu miejscowego' }
                    ]
                },
                {
                    id: 'mpzp_name',
                    type: 'text',
                    label: 'Nazwa/symbol MPZP',
                    placeholder: 'np. Uchwała nr 123/2020',
                    showIf: { has_mpzp: ['yes', 'in_progress'] }
                },
                {
                    id: 'mpzp_designation',
                    type: 'textarea',
                    label: 'Przeznaczenie w MPZP',
                    placeholder: 'np. MN - zabudowa mieszkaniowa jednorodzinna, 40% zabudowy, wysokość max 10m...',
                    rows: 4,
                    showIf: { has_mpzp: 'yes' }
                },
                {
                    id: 'mpzp_issue_date',
                    type: 'date',
                    label: 'Data uchwalenia MPZP',
                    showIf: { has_mpzp: 'yes' }
                },
                {
                    id: 'mpzp_problems',
                    type: 'textarea',
                    label: 'Problemy z MPZP',
                    placeholder: 'Zbyt restrykcyjne, sprzeczne z interesem, szkodliwe dla wartości...',
                    rows: 4,
                    showIf: { has_mpzp: ['yes', 'in_progress'] }
                },
                {
                    id: 'has_wz',
                    type: 'select',
                    label: 'Czy posiadasz Warunki Zabudowy (WZ)?',
                    options: [
                        { value: 'yes', label: 'Tak, mam decyzję WZ' },
                        { value: 'applied', label: 'Złożono wniosek - oczekiwanie' },
                        { value: 'refused', label: 'Odmówiono wydania WZ' },
                        { value: 'no', label: 'Nie dotyczy' }
                    ],
                    showIf: { has_mpzp: 'no' }
                },
                {
                    id: 'wz_number',
                    type: 'text',
                    label: 'Numer decyzji WZ',
                    placeholder: 'np. AB.6740.12.2024',
                    showIf: { has_wz: ['yes', 'refused'] }
                },
                {
                    id: 'wz_date',
                    type: 'date',
                    label: 'Data wydania decyzji WZ',
                    showIf: { has_wz: ['yes', 'refused'] }
                },
                {
                    id: 'wz_content',
                    type: 'textarea',
                    label: 'Treść decyzji WZ / powód odmowy',
                    placeholder: 'Parametry zabudowy lub powód odmowy...',
                    rows: 4,
                    showIf: { has_wz: ['yes', 'refused'] }
                }
            ]
        },
        {
            id: 4,
            title: 'Organ i Procedura',
            description: 'Który organ prowadzi sprawę?',
            questions: [
                {
                    id: 'authority',
                    type: 'select',
                    label: 'Właściwy organ',
                    options: [
                        { value: 'city_hall', label: 'Urząd Miasta / Gminy' },
                        { value: 'starost', label: 'Starosta Powiatowy' },
                        { value: 'voivode', label: 'Wojewoda' },
                        { value: 'wsa', label: 'Wojewódzki Sąd Administracyjny' },
                        { value: 'nsa', label: 'Naczelny Sąd Administracyjny' }
                    ]
                },
                {
                    id: 'authority_name',
                    type: 'text',
                    label: 'Nazwa organu',
                    placeholder: 'np. Urząd Miasta Warszawa, Wydział Architektury'
                },
                {
                    id: 'case_number',
                    type: 'text',
                    label: 'Numer sprawy/decyzji',
                    placeholder: 'np. AB.6740.12.2024'
                },
                {
                    id: 'official_name',
                    type: 'text',
                    label: 'Urzędnik prowadzący',
                    placeholder: 'Imię i nazwisko'
                },
                {
                    id: 'participation_status',
                    type: 'select',
                    label: 'Status uczestnictwa w postępowaniu',
                    options: [
                        { value: 'not_started', label: 'Nie rozpoczęto' },
                        { value: 'exhibition', label: 'Wyłożenie projektu do wglądu' },
                        { value: 'comments_submitted', label: 'Złożono uwagi' },
                        { value: 'hearing', label: 'Dyskusja publiczna' },
                        { value: 'decision_issued', label: 'Wydano decyzję/uchwalono plan' },
                        { value: 'appeal_filed', label: 'Złożono odwołanie/skargę' }
                    ]
                },
                {
                    id: 'exhibition_deadline',
                    type: 'date',
                    label: 'Termin końca wyłożenia',
                    help: 'WAŻNE: Uwagi można składać przez 14 dni od zakończenia wyłożenia!',
                    showIf: { participation_status: 'exhibition' }
                },
                {
                    id: 'comments_submitted',
                    type: 'select',
                    label: 'Czy złożono uwagi do projektu?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ],
                    showIf: { participation_status: ['comments_submitted', 'hearing', 'decision_issued', 'appeal_filed'] }
                },
                {
                    id: 'comments_date',
                    type: 'date',
                    label: 'Data złożenia uwag',
                    showIf: { comments_submitted: 'yes' }
                },
                {
                    id: 'comments_content',
                    type: 'textarea',
                    label: 'Treść uwag',
                    placeholder: 'Główne zarzuty i postulaty...',
                    rows: 5,
                    showIf: { comments_submitted: 'yes' }
                }
            ]
        }
    ]
};

console.log('✅ Zoning Part 1 załadowana (Sekcje 1-4)!');
