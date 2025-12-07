// TEST - Najprostsza wersja ankiety majątkowej
console.log('🟢 TEST: property-questionnaire-TEST.js się załadował!');

window.propertyQuestionnaire = {
    id: 'property',
    title: '🏠 Ankieta Majątkowa TEST',
    description: 'Test wersja',
    color: '#16a085',
    icon: '🏠',
    prefix: 'MAJ',
    
    sections: [
        {
            id: 1,
            title: 'Test Sekcja',
            description: 'To jest test',
            questions: [
                {
                    id: 'test_question',
                    type: 'text',
                    label: 'Test pytanie',
                    required: true
                }
            ]
        }
    ],
    
    procedure: {
        title: 'TEST Procedura',
        description: 'Test',
        phases: [
            {
                phase: 1,
                name: 'TEST',
                duration: '1 dzień',
                icon: '📋',
                description: 'Test faza',
                tasks: ['Test zadanie'],
                critical: false
            }
        ]
    },
    
    requiredDocuments: [
        {
            id: 'test_doc',
            name: 'Test dokument',
            category: 'court',
            required: true,
            canGenerate: false,
            description: 'Test opis'
        }
    ]
};

console.log('✅ TEST: propertyQuestionnaire utworzone:', !!window.propertyQuestionnaire);
console.log('✅ TEST: Sekcji:', window.propertyQuestionnaire.sections.length);
