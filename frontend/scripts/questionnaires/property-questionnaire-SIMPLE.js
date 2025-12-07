// ==========================================
// ANKIETA MAJĄTKOWA - PROSTY PLIK (wszystko w jednym)
// ==========================================

console.log('🏠 Ładowanie prostej ankiety majątkowej...');

window.propertyQuestionnaire = {
    id: 'property',
    title: '🏠 Ankieta Majątkowa',
    description: 'Sprawy o własność, służebności, roszczenia rzeczowe',
    color: '#16a085',
    icon: '🏠',
    prefix: 'MAJ',
    
    sections: [
        {
            id: 1,
            title: '🏠 Przedmiot Sprawy',
            description: 'O jaką nieruchomość/rzecz toczy się spór?',
            questions: [
                {
                    id: 'subject_type',
                    type: 'select',
                    label: 'Rodzaj przedmiotu sprawy',
                    required: true,
                    options: [
                        { value: 'real_estate', label: 'Nieruchomość (dom, mieszkanie, działka)' },
                        { value: 'movable', label: 'Rzecz ruchoma (samochód, sprzęt)' }
                    ]
                },
                {
                    id: 'property_address',
                    type: 'textarea',
                    label: 'Adres nieruchomości / Opis rzeczy',
                    required: true
                }
            ]
        },
        {
            id: 2,
            title: '⚖️ Rodzaj Roszczenia',
            description: 'Czego się domagasz?',
            questions: [
                {
                    id: 'claim_type',
                    type: 'select',
                    label: 'Typ roszczenia',
                    required: true,
                    options: [
                        { value: 'ownership', label: '📋 Własność - ustalenie prawa własności' },
                        { value: 'vindication', label: '🏠 Windykacja - wydanie rzeczy' },
                        { value: 'easement', label: '🚪 Służebność - przejazd, przechód' },
                        { value: 'adverse_possession', label: '⏰ Zasiedzenie - nabycie przez upływ czasu' }
                    ]
                }
            ]
        }
    ],
    
    procedure: {
        title: '⚖️ PROCEDURA POSTĘPOWANIA MAJĄTKOWEGO',
        description: 'Uproszczona procedura',
        phases: [
            {
                phase: 1,
                name: 'PRZYGOTOWANIE SPRAWY',
                duration: '1-2 tygodnie',
                icon: '📋',
                description: 'Zebranie dokumentów',
                tasks: [
                    'Wypis z księgi wieczystej (aktualny!)',
                    'Dokumenty nabycia',
                    'Analiza stanu prawnego'
                ],
                critical: true
            },
            {
                phase: 2,
                name: 'POZEW DO SĄDU',
                duration: '1-2 tygodnie',
                icon: '📄',
                description: 'Złożenie pozwu',
                tasks: [
                    'Sporządzenie pozwu',
                    'Opłata sądowa 5% wartości',
                    'Złożenie w sądzie'
                ],
                critical: true
            }
        ]
    },
    
    requiredDocuments: [
        {
            id: 'kw_extract',
            name: 'Wypis z księgi wieczystej (KW)',
            category: 'property',
            required: true,
            canGenerate: false,
            description: 'Aktualny! Nie starszy niż 3 miesiące - ekw.ms.gov.pl'
        },
        {
            id: 'ownership_docs',
            name: 'Dokumenty nabycia własności',
            category: 'ownership',
            required: true,
            canGenerate: false,
            description: 'Umowa kupna-sprzedaży, akt notarialny, akt poświadczenia dziedziczenia'
        },
        {
            id: 'lawsuit',
            name: 'Pozew/Wniosek do sądu',
            category: 'court',
            required: true,
            canGenerate: true,
            description: '🤖 AI GENERATOR - windykacja, własność, służebność'
        }
    ]
};

console.log('✅ Prosta ankieta majątkowa załadowana!');
console.log('📊 Sekcji:', window.propertyQuestionnaire.sections.length);
console.log('📅 Faz procedury:', window.propertyQuestionnaire.procedure.phases.length);
console.log('📄 Dokumentów:', window.propertyQuestionnaire.requiredDocuments.length);
