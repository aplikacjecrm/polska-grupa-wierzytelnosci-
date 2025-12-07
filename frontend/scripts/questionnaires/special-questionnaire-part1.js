// ==========================================
// ANKIETA PRAWA SPECJALNEGO - CZĘŚĆ 1
// Sekcje 1-3: Podstawy, Typ sprawy, Strony
// ==========================================

window.specialQuestionnairePart1 = {
    sections: [
        {
            id: 1,
            title: '',
            description: 'Wybierz dziedzinę prawa specjalnego',
            questions: [
                {
                    id: 'special_type',
                    type: 'select',
                    label: 'Główna dziedzina',
                    required: true,
                    options: [
                        { value: 'maritime', label: '⚓ Prawo morskie' },
                        { value: 'energy', label: '⚡ Energetyka' },
                        { value: 'renewable', label: '🌱 OZE / Fotowoltaika' },
                        { value: 'aviation', label: '✈️ Prawo lotnicze' },
                        { value: 'it', label: '💻 Prawo IT / Cyberbezpieczeństwo' }
                    ]
                },
                {
                    id: 'case_subject',
                    type: 'select',
                    label: 'Przedmiot sprawy',
                    required: true,
                    options: [
                        { value: 'contract', label: 'Umowa (zawarcie, wykonanie, rozwiązanie)' },
                        { value: 'liability', label: 'Odpowiedzialność (odszkodowanie, szkoda)' },
                        { value: 'license', label: 'Licencje / Koncesje / Zezwolenia' },
                        { value: 'investment', label: 'Inwestycje / Projekty' },
                        { value: 'regulatory', label: 'Sprawy regulacyjne' },
                        { value: 'insurance', label: 'Ubezpieczenia' },
                        { value: 'intellectual_property', label: 'Własność intelektualna' },
                        { value: 'data_protection', label: 'Ochrona danych (RODO)' },
                        { value: 'other', label: 'Inne' }
                    ]
                },
                {
                    id: 'urgency',
                    type: 'select',
                    label: 'Pilność sprawy',
                    required: true,
                    options: [
                        { value: 'critical', label: '🔴 Krytyczna - natychmiastowe działanie (awaria, wypadek, zagrożenie)' },
                        { value: 'high', label: '🟠 Wysoka - pilne (termin, licencja, kara)' },
                        { value: 'medium', label: '🟡 Średnia - normalne tempo' },
                        { value: 'low', label: '🟢 Niska - bez presji czasu' }
                    ]
                }
            ]
        },
        {
            id: 2,
            title: '',
            description: 'Kim jesteś i kto jest po drugiej stronie?',
            questions: [
                {
                    id: 'client_type',
                    type: 'select',
                    label: 'Rodzaj klienta',
                    required: true,
                    options: [
                        { value: 'company', label: 'Firma / Spółka' },
                        { value: 'individual', label: 'Osoba fizyczna' },
                        { value: 'public_entity', label: 'Podmiot publiczny (urząd, instytucja)' },
                        { value: 'ngo', label: 'Organizacja pozarządowa' }
                    ]
                },
                {
                    id: 'client_name',
                    type: 'text',
                    label: 'Nazwa klienta / Imię i nazwisko',
                    required: true,
                    placeholder: 'Np. Morska Flota Sp. z o.o.'
                },
                {
                    id: 'opposing_party',
                    type: 'text',
                    label: 'Druga strona (jeśli znana)',
                    required: false,
                    placeholder: 'Nazwa kontrahenta, urzędu, itp.'
                },
                {
                    id: 'value',
                    type: 'number',
                    label: 'Wartość przedmiotu sporu (PLN)',
                    required: false,
                    placeholder: '0'
                }
            ]
        },
        {
            id: 3,
            title: '',
            description: 'Tylko dla spraw morskich (MOR/)',
            showIf: (answers) => answers.special_type === 'maritime',
            questions: [
                {
                    id: 'maritime_type',
                    type: 'select',
                    label: 'Typ sprawy morskiej',
                    options: [
                        { value: 'cargo', label: 'Przewóz towarów (czarter, konosament, szkoda cargo)' },
                        { value: 'collision', label: 'Kolizja / Zderzenie statków' },
                        { value: 'salvage', label: 'Ratownictwo morskie' },
                        { value: 'pollution', label: 'Zanieczyszczenie morza' },
                        { value: 'crew', label: 'Sprawy załogowe (praca na statku)' },
                        { value: 'port', label: 'Sprawy portowe (cumowanie, opłaty)' },
                        { value: 'insurance', label: 'Ubezpieczenia morskie (P&I, kadłub)' },
                        { value: 'arrest', label: 'Zajęcie statku (ship arrest)' },
                        { value: 'other', label: 'Inne' }
                    ]
                },
                {
                    id: 'vessel_name',
                    type: 'text',
                    label: 'Nazwa statku',
                    placeholder: 'Np. MV Baltic Star'
                },
                {
                    id: 'vessel_flag',
                    type: 'text',
                    label: 'Bandera statku',
                    placeholder: 'Np. Polska, Liberia, Panama'
                },
                {
                    id: 'port',
                    type: 'text',
                    label: 'Port (jeśli dotyczy)',
                    placeholder: 'Np. Gdańsk, Rotterdam'
                }
            ]
        }
    ]
};

console.log('✅ Special Part 1 załadowana (Sekcje 1-3)!');
