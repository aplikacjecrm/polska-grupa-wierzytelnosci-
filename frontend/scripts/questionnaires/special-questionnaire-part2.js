// ==========================================
// ANKIETA PRAWA SPECJALNEGO - CZĘŚĆ 2
// Sekcje 4-6: Energetyka, OZE, Lotnicze, IT
// ==========================================

window.specialQuestionnairePart2 = {
    sections: [
        {
            id: 4,
            title: '',
            description: 'Tylko dla spraw energetycznych (ENE/)',
            showIf: (answers) => answers.special_type === 'energy',
            questions: [
                {
                    id: 'energy_type',
                    type: 'select',
                    label: 'Typ sprawy energetycznej',
                    options: [
                        { value: 'generation', label: 'Wytwarzanie energii (elektrownia, ciepłownia)' },
                        { value: 'distribution', label: 'Dystrybucja energii (sieci, przyłącza)' },
                        { value: 'trading', label: 'Obrót energią (umowy sprzedaży, TGE)' },
                        { value: 'license', label: 'Koncesje URE' },
                        { value: 'tariffs', label: 'Taryfy i ceny' },
                        { value: 'capacity_market', label: 'Rynek mocy' },
                        { value: 'balancing', label: 'Rynek bilansujący' },
                        { value: 'regulatory', label: 'Spory z URE' },
                        { value: 'other', label: 'Inne' }
                    ]
                },
                {
                    id: 'license_number',
                    type: 'text',
                    label: 'Numer koncesji (jeśli dotyczy)',
                    placeholder: 'Np. WEE/123/456/W/2023'
                },
                {
                    id: 'capacity_mw',
                    type: 'number',
                    label: 'Moc zainstalowana (MW)',
                    placeholder: '0'
                }
            ]
        },
        {
            id: 5,
            title: '',
            description: 'Tylko dla spraw OZE (OZE/)',
            showIf: (answers) => answers.special_type === 'renewable',
            questions: [
                {
                    id: 'renewable_type',
                    type: 'select',
                    label: 'Typ źródła odnawialnego',
                    options: [
                        { value: 'solar_pv', label: 'Fotowoltaika (panele PV)' },
                        { value: 'wind', label: 'Energia wiatrowa (farma wiatrowa)' },
                        { value: 'biogas', label: 'Biogaz / Biomasa' },
                        { value: 'hydro', label: 'Energia wodna (MEW)' },
                        { value: 'storage', label: 'Magazyny energii (ESS)' },
                        { value: 'hybrid', label: 'Instalacja hybrydowa' },
                        { value: 'other', label: 'Inne' }
                    ]
                },
                {
                    id: 'renewable_issue',
                    type: 'select',
                    label: 'Główny problem',
                    options: [
                        { value: 'grid_connection', label: 'Przyłączenie do sieci (warunki przyłączenia, umowa)' },
                        { value: 'permits', label: 'Pozwolenia / Decyzje (budowlane, środowiskowe, lokalizacyjne)' },
                        { value: 'land', label: 'Grunty (dzierżawa, służebność, wykup)' },
                        { value: 'auction', label: 'Aukcje OZE' },
                        { value: 'ppa', label: 'Umowa PPA (Power Purchase Agreement)' },
                        { value: 'green_certificates', label: 'Świadectwa pochodzenia' },
                        { value: 'feed_in_tariff', label: 'Taryfa feed-in' },
                        { value: 'construction', label: 'Budowa instalacji (wykonawca, opóźnienia)' },
                        { value: 'operation', label: 'Eksploatacja (serwis, awarie)' },
                        { value: 'other', label: 'Inne' }
                    ]
                },
                {
                    id: 'installation_power',
                    type: 'number',
                    label: 'Moc instalacji (kWp lub MWp)',
                    placeholder: '0'
                }
            ]
        },
        {
            id: 6,
            title: 'Szczegóły - Prawo Lotnicze',
            description: 'Tylko dla spraw lotniczych (LOT/)',
            showIf: (answers) => answers.special_type === 'aviation',
            questions: [
                {
                    id: 'aviation_type',
                    type: 'select',
                    label: 'Typ sprawy lotniczej',
                    options: [
                        { value: 'passenger_rights', label: 'Prawa pasażerów (opóźnienie, odwołanie, overbooking) - Rozp. 261/2004' },
                        { value: 'accident', label: 'Wypadek lotniczy / Incydent' },
                        { value: 'liability', label: 'Odpowiedzialność przewoźnika (bagaż, szkoda)' },
                        { value: 'aircraft_lease', label: 'Leasing samolotu' },
                        { value: 'maintenance', label: 'Serwis / Konserwacja statku powietrznego' },
                        { value: 'licensing', label: 'Licencje (AOC, SPL, PPL, ATPL)' },
                        { value: 'regulatory', label: 'Sprawy regulacyjne (ULC, EASA)' },
                        { value: 'insurance', label: 'Ubezpieczenia lotnicze' },
                        { value: 'drone', label: 'Drony / UAV' },
                        { value: 'other', label: 'Inne' }
                    ]
                },
                {
                    id: 'flight_number',
                    type: 'text',
                    label: 'Numer lotu (jeśli dotyczy)',
                    placeholder: 'Np. LO123'
                },
                {
                    id: 'aircraft_registration',
                    type: 'text',
                    label: 'Znaki rejestracyjne statku powietrznego',
                    placeholder: 'Np. SP-LRA'
                },
                {
                    id: 'incident_date',
                    type: 'date',
                    label: 'Data incydentu / opóźnienia'
                }
            ]
        },
        {
            id: 7,
            title: '',
            description: 'Tylko dla spraw IT (IT/)',
            showIf: (answers) => answers.special_type === 'it',
            questions: [
                {
                    id: 'it_type',
                    type: 'select',
                    label: 'Typ sprawy IT',
                    options: [
                        { value: 'software_contract', label: 'Umowa na oprogramowanie (licencja, SaaS, development)' },
                        { value: 'data_breach', label: 'Wyciek danych / Naruszenie RODO' },
                        { value: 'cybersecurity', label: 'Cyberbezpieczeństwo (atak, ransomware)' },
                        { value: 'ip_software', label: 'Własność intelektualna oprogramowania' },
                        { value: 'domain', label: 'Domena internetowa (spór, cybersquatting)' },
                        { value: 'cloud', label: 'Usługi chmurowe (AWS, Azure, GCP)' },
                        { value: 'e_commerce', label: 'E-commerce (sklep internetowy, marketplace)' },
                        { value: 'telecom', label: 'Telekomunikacja (UKE, numery,频率)' },
                        { value: 'gdpr_compliance', label: 'Zgodność z RODO / GDPR' },
                        { value: 'blockchain', label: 'Blockchain / Kryptowaluty / NFT' },
                        { value: 'other', label: 'Inne' }
                    ]
                },
                {
                    id: 'system_name',
                    type: 'text',
                    label: 'Nazwa systemu / Oprogramowania',
                    placeholder: 'Np. CRM System v2.0'
                },
                {
                    id: 'data_breach_records',
                    type: 'number',
                    label: 'Liczba naruszonych rekordów (jeśli RODO)',
                    placeholder: '0',
                    showIf: (answers) => answers.it_type === 'data_breach' || answers.it_type === 'gdpr_compliance'
                }
            ]
        }
    ]
};

console.log('✅ Special Part 2 załadowana (Sekcje 4-7)!');
