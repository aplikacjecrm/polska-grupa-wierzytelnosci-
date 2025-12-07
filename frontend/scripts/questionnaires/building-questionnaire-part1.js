// ==========================================
// ANKIETA BUDOWLANA - CZĘŚĆ 1 (Sekcje 1-4)
// ==========================================

window.buildingQuestionnairePart1 = {
    sections: [
        {
            id: 1,
            title: 'Rodzaj Sprawy Budowlanej',
            description: 'Jaki jest główny przedmiot sprawy?',
            questions: [
                {
                    id: 'case_type',
                    type: 'select',
                    label: 'Typ sprawy budowlanej',
                    required: true,
                    options: [
                        { value: 'building_permit', label: 'Pozwolenie na budowę' },
                        { value: 'demolition_permit', label: 'Pozwolenie na rozbiórkę' },
                        { value: 'occupancy_permit', label: 'Pozwolenie na użytkowanie' },
                        { value: 'building_notification', label: 'Zgłoszenie budowy/robót' },
                        { value: 'construction_law_decision', label: 'Decyzja nadzoru budowlanego' },
                        { value: 'land_development', label: 'Warunki zabudowy / Plan zagospodarowania' },
                        { value: 'appeal_wsa', label: 'Odwołanie do WSA (Wojewódzki Sąd Administracyjny)' },
                        { value: 'appeal_nsa', label: 'Skarga kasacyjna do NSA (Naczelny Sąd Administracyjny)' },
                        { value: 'building_dispute', label: 'Spór sąsiedzi / Naruszenie praw' },
                        { value: 'illegal_construction', label: 'Samowola budowlana' },
                        { value: 'technical_expertise', label: 'Ekspertyza techniczna / Opinia biegłego' }
                    ]
                },
                {
                    id: 'urgency',
                    type: 'select',
                    label: 'Pilność sprawy',
                    required: true,
                    options: [
                        { value: 'critical', label: '🔴 Krytyczne (nakaz rozbiórki, wstrzymanie robót)' },
                        { value: 'high', label: '🟠 Wysokie (termin odwołania, zawieszona inwestycja)' },
                        { value: 'medium', label: '🟡 Średnie (w trakcie procedury)' },
                        { value: 'low', label: '🟢 Niskie (planowanie inwestycji)' }
                    ]
                },
                {
                    id: 'decision_negative',
                    type: 'select',
                    label: 'Czy otrzymano negatywną decyzję/odmowę?',
                    options: [
                        { value: 'yes', label: 'Tak, odmowa pozwolenia/decyzji' },
                        { value: 'partial', label: 'Częściowo - decyzja z ograniczeniami' },
                        { value: 'no', label: 'Nie, sprawa w toku lub pozytywna' }
                    ]
                },
                {
                    id: 'decision_date',
                    type: 'date',
                    label: 'Data wydania decyzji (jeśli dotyczy)',
                    showIf: { decision_negative: ['yes', 'partial'] }
                },
                {
                    id: 'appeal_deadline',
                    type: 'date',
                    label: 'Termin na odwołanie (14 dni od doręczenia)',
                    showIf: { decision_negative: ['yes', 'partial'] },
                    help: 'UWAGA: Termin 14 dni jest nieprzekraczalny!'
                }
            ]
        },
        {
            id: 2,
            title: '',
            description: 'Lokalizacja i opis działki/budynku',
            questions: [
                {
                    id: 'property_address',
                    type: 'text',
                    label: 'Adres nieruchomości',
                    placeholder: 'ul. Leśna 10, 00-001 Warszawa',
                    required: true
                },
                {
                    id: 'cadastral_number',
                    type: 'text',
                    label: 'Numer działki ewidencyjnej',
                    placeholder: 'np. 123/4',
                    required: true
                },
                {
                    id: 'property_area',
                    type: 'number',
                    label: 'Powierzchnia działki (m²)',
                    placeholder: 'np. 1000'
                },
                {
                    id: 'ownership',
                    type: 'select',
                    label: 'Forma własności',
                    options: [
                        { value: 'owner', label: 'Właściciel' },
                        { value: 'co_owner', label: 'Współwłaściciel' },
                        { value: 'perpetual_usufruct', label: 'Użytkowanie wieczyste' },
                        { value: 'leaseholder', label: 'Dzierżawca' },
                        { value: 'other', label: 'Inne' }
                    ]
                },
                {
                    id: 'land_register',
                    type: 'text',
                    label: 'Numer księgi wieczystej',
                    placeholder: 'np. WA1M/00012345/6'
                },
                {
                    id: 'investment_type',
                    type: 'select',
                    label: 'Rodzaj inwestycji',
                    options: [
                        { value: 'single_family', label: 'Dom jednorodzinny' },
                        { value: 'multi_family', label: 'Budynek mieszkalny wielorodzinny' },
                        { value: 'commercial', label: 'Obiekt komercyjny (sklep, biuro)' },
                        { value: 'industrial', label: 'Obiekt przemysłowy/magazyn' },
                        { value: 'extension', label: 'Rozbudowa istniejącego budynku' },
                        { value: 'renovation', label: 'Remont/przebudowa' },
                        { value: 'infrastructure', label: 'Infrastruktura (droga, parking)' },
                        { value: 'other', label: 'Inne' }
                    ]
                },
                {
                    id: 'building_area',
                    type: 'number',
                    label: 'Powierzchnia zabudowy (m²)',
                    placeholder: 'np. 150'
                },
                {
                    id: 'investment_value',
                    type: 'number',
                    label: 'Szacunkowa wartość inwestycji (PLN)',
                    placeholder: 'np. 500000'
                }
            ]
        },
        {
            id: 3,
            title: '',
            description: 'Status pozwolenia budowlanego',
            questions: [
                {
                    id: 'permit_status',
                    type: 'select',
                    label: 'Status pozwolenia na budowę',
                    options: [
                        { value: 'needed', label: 'Potrzebne - w trakcie procedury' },
                        { value: 'obtained', label: 'Uzyskane' },
                        { value: 'refused', label: 'Odmowa wydania' },
                        { value: 'not_needed', label: 'Nie jest wymagane (zgłoszenie)' }
                    ]
                },
                {
                    id: 'permit_number',
                    type: 'text',
                    label: 'Numer pozwolenia na budowę',
                    placeholder: 'np. AB.6740.123.2024',
                    showIf: { permit_status: 'obtained' }
                },
                {
                    id: 'permit_issue_date',
                    type: 'date',
                    label: 'Data wydania pozwolenia',
                    showIf: { permit_status: 'obtained' }
                },
                {
                    id: 'refusal_reason',
                    type: 'textarea',
                    label: 'Powód odmowy',
                    placeholder: 'Dlaczego odmówiono pozwolenia...',
                    rows: 4,
                    showIf: { permit_status: 'refused' }
                },
                {
                    id: 'building_design',
                    type: 'select',
                    label: 'Czy projekt budowlany jest gotowy?',
                    options: [
                        { value: 'ready', label: 'Tak, projekt gotowy' },
                        { value: 'in_progress', label: 'W trakcie przygotowania' },
                        { value: 'needed', label: 'Potrzebny' }
                    ]
                },
                {
                    id: 'designer_name',
                    type: 'text',
                    label: 'Projektant (imię, nazwisko, uprawnienia)',
                    placeholder: 'Jan Kowalski, uprawnienia budowlane nr 123/WAW/12'
                },
                {
                    id: 'construction_manager',
                    type: 'text',
                    label: 'Kierownik budowy',
                    placeholder: 'Imię, nazwisko, uprawnienia'
                }
            ]
        },
        {
            id: 4,
            title: 'Decyzje Administracyjne',
            description: 'Decyzje organów administracji',
            questions: [
                {
                    id: 'authority',
                    type: 'select',
                    label: 'Organ wydający decyzję',
                    options: [
                        { value: 'starostwo', label: 'Starostwo Powiatowe' },
                        { value: 'powiatowy_inspektor', label: 'Powiatowy Inspektor Nadzoru Budowlanego' },
                        { value: 'city_hall', label: 'Urząd Miasta/Gminy' },
                        { value: 'voivodeship', label: 'Urząd Wojewódzki' },
                        { value: 'conservation', label: 'Konserwator Zabytków' },
                        { value: 'environmental', label: 'RDOŚ (Regionalny Dyrektor Ochrony Środowiska)' },
                        { value: 'other', label: 'Inny organ' }
                    ]
                },
                {
                    id: 'decision_type',
                    type: 'select',
                    label: 'Rodzaj decyzji',
                    options: [
                        { value: 'building_permit', label: 'Pozwolenie na budowę' },
                        { value: 'demolition_order', label: 'Nakaz rozbiórki' },
                        { value: 'construction_stop', label: 'Wstrzymanie robót' },
                        { value: 'land_development', label: 'Warunki zabudowy' },
                        { value: 'environmental', label: 'Decyzja środowiskowa' },
                        { value: 'consent', label: 'Zgoda/uzgodnienie' },
                        { value: 'other', label: 'Inna decyzja' }
                    ]
                },
                {
                    id: 'decision_content',
                    type: 'textarea',
                    label: 'Treść/uzasadnienie decyzji',
                    placeholder: 'Co zawiera decyzja, na jakiej podstawie prawnej...',
                    rows: 5
                },
                {
                    id: 'appeal_filed',
                    type: 'select',
                    label: 'Czy wniesiono odwołanie?',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'planned', label: 'Planowane' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'appeal_date',
                    type: 'date',
                    label: 'Data złożenia odwołania',
                    showIf: { appeal_filed: 'yes' }
                }
            ]
        }
    ]
};

console.log('✅ Building Part 1 załadowana (Sekcje 1-4)!');
