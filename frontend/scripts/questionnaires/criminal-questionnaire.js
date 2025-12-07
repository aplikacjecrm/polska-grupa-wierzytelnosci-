// 🚔 ANKIETA KARNA - Główny plik

console.log('🚔 === INICJALIZACJA ANKIETY KARNEJ V1.1 === 🚔');

// Sprawdź czy wszystkie części są załadowane
if (!window.criminalQuestionnaire_Part1) {
    console.error('❌ Brak criminal-questionnaire-part1.js!');
}
if (!window.criminalQuestionnaire_Part2) {
    console.error('❌ Brak criminal-questionnaire-part2.js!');
}
if (!window.criminalQuestionnaire_Part3) {
    console.error('❌ Brak criminal-questionnaire-part3.js!');
}

// Główny obiekt ankiety karnej
window.criminalQuestionnaire = {
    metadata: {
        id: 'criminal',
        title: 'ANKIETA KARNA',
        subtitle: 'Dla pokrzywdzonych i oskarżonych',
        description: 'Uniwersalna ankieta karna - dostosowuje się do Twojej roli w postępowaniu',
        version: '1.0',
        caseType: 'criminal',
        estimatedTime: '30-45 minut',
        autoSave: true,
        audioRecording: true,
        features: [
            '✅ Dynamiczne pytania (pokrzywdzony vs oskarżony)',
            '📊 Kalkulator zadośćuczynienia (AI)',
            '🤖 Automatyczne generowanie dokumentów',
            '⚖️ Edukacja prawna (procedura krok po kroku)',
            '📎 System dowodów i świadków',
            '💡 Analiza szans (0-100%)'
        ],
        icons: {
            victim: '👤',
            accused: '⚖️',
            witness: '👁️',
            representative: '👔'
        }
    },

    // Mapowanie typów spraw karnych - obsługuje typy i prefixy numerów
    caseTypeMapping: {
        // Pełne nazwy typów
        'assault': {
            name: '👊 Pobicie',
            prefix: 'POB',
            defaultCrime: 'art157',
            category: 'life_health'
        },
        'theft': {
            name: '📊 Kradzież',
            prefix: 'KRA',
            defaultCrime: 'art278',
            category: 'property'
        },
        'fraud': {
            name: '💸 Oszustwo',
            prefix: 'OSZ',
            defaultCrime: 'art286',
            category: 'property'
        },
        'traffic': {
            name: '🚗 Drogowe',
            prefix: 'DRO',
            defaultCrime: 'art177',
            category: 'traffic'
        },
        'drugs': {
            name: '🚬 Narkotyki',
            prefix: 'NAR',
            defaultCrime: 'drugs',
            category: 'other'
        },
        
        // Aliasy - prefixy (POB/DK01/002 → assault)
        'POB': { aliasFor: 'assault' },
        'KRA': { aliasFor: 'theft' },
        'OSZ': { aliasFor: 'fraud' },
        'DRO': { aliasFor: 'traffic' },
        'NAR': { aliasFor: 'drugs' }
    },

    // Połącz wszystkie sekcje z 3 części
    sections: [
        // CZĘŚĆ 1: Sekcje 1-3
        {
            ...window.criminalQuestionnaire_Part1.section_1_role,
            order: 1
        },
        {
            ...window.criminalQuestionnaire_Part1.section_2a_basic_victim,
            order: 2,
            showIf: (answers) => {
                const role = answers.role_in_case;
                return role === 'victim' || role === 'representative';
            }
        },
        {
            ...window.criminalQuestionnaire_Part1.section_2b_basic_accused,
            order: 3,
            showIf: (answers) => {
                const role = answers.role_in_case;
                return role === 'accused';
            }
        },
        {
            ...window.criminalQuestionnaire_Part1.section_3_crime_type,
            order: 4
        },

        // CZĘŚĆ 2: Sekcje 4A i 4B
        {
            ...window.criminalQuestionnaire_Part2.section_4a_damages,
            order: 5,
            showIf: (answers) => {
                const role = answers.role_in_case;
                return role === 'victim' || role === 'representative';
            }
        },
        {
            ...window.criminalQuestionnaire_Part2.section_4b_defense,
            order: 6,
            showIf: (answers) => {
                const role = answers.role_in_case;
                return role === 'accused';
            }
        },

        // CZĘŚĆ 3: Sekcje 5-7
        {
            ...window.criminalQuestionnaire_Part3.section_5_evidence,
            order: 7
        },
        {
            ...window.criminalQuestionnaire_Part3.section_6_witnesses,
            order: 8
        },
        {
            ...window.criminalQuestionnaire_Part3.section_7_procedure,
            order: 9
        }
    ],

    // Procedura karna (z Part3)
    procedure: window.criminalQuestionnaire_Part3.criminal_procedure,

    // Dokumenty (z Part3)
    requiredDocuments: window.criminalQuestionnaire_Part3.required_documents,

    // Funkcje pomocnicze
    helpers: {
        /**
         * Sprawdź czy sekcja powinna być pokazana
         */
        shouldShowSection(section, answers) {
            if (!section.showIf) return true;
            
            if (typeof section.showIf === 'function') {
                return section.showIf(answers);
            }
            
            // Stary format showIf: ['victim', 'accused']
            if (Array.isArray(section.showIf)) {
                const role = answers.role_in_case;
                return section.showIf.includes(role);
            }
            
            return true;
        },

        /**
         * Oblicz przewidywane zadośćuczynienie (dla pokrzywdzonego)
         */
        calculateCompensation(answers) {
            let total = 0;
            let details = {};

            // Obrażenia ciała
            if (answers.has_injuries === 'yes') {
                const injuries = answers.injury_type || [];
                let injuryAmount = 0;
                
                if (injuries.includes('light')) injuryAmount += 5000;
                if (injuries.includes('medium')) injuryAmount += 15000;
                if (injuries.includes('severe')) injuryAmount += 40000;
                if (injuries.includes('permanent')) injuryAmount += 80000;
                
                details.injuries = injuryAmount;
                total += injuryAmount;
            }

            // Straty materialne
            if (answers.has_material_loss === 'yes') {
                const materialLoss = parseInt(answers.material_loss_value) || 0;
                details.materialLoss = materialLoss;
                total += materialLoss;
            }

            // Krzywda moralna
            if (answers.emotional_harm === 'yes') {
                let emotionalAmount = 10000; // Bazowa kwota
                
                // Dodatkowe czynniki
                if (answers.psychological_support === 'yes') emotionalAmount += 5000;
                if (answers.lost_income === 'yes') {
                    const lostIncome = parseInt(answers.lost_income_amount) || 0;
                    emotionalAmount += Math.min(lostIncome, 20000);
                }
                
                details.emotional = emotionalAmount;
                total += emotionalAmount;
            }

            // Koszty terapii
            if (answers.therapy_cost) {
                const therapyCost = parseInt(answers.therapy_cost) || 0;
                details.therapy = therapyCost;
                total += therapyCost;
            }

            return {
                total,
                details,
                range: {
                    min: Math.round(total * 0.7),
                    max: Math.round(total * 1.3)
                }
            };
        },

        /**
         * Oceń siłę dowodów (0-100%)
         */
        assessEvidenceStrength(answers) {
            let score = 0;
            let maxScore = 0;
            let breakdown = {};

            // Dokumenty lekarskie (+20%)
            maxScore += 20;
            if (answers.has_medical_certificate === 'yes') {
                score += 20;
                breakdown.medical = 20;
            }

            // Nagrania (+30%)
            maxScore += 30;
            if (answers.has_recordings && answers.has_recordings.length > 0) {
                score += 30;
                breakdown.recordings = 30;
            }

            // Wiadomości (+15%)
            maxScore += 15;
            if (answers.has_messages === 'yes') {
                score += 15;
                breakdown.messages = 15;
            }

            // Świadkowie (+25%)
            maxScore += 25;
            if (answers.has_witnesses === 'yes') {
                const credibility = answers.witnesses_credibility;
                if (credibility === 'high') {
                    score += 25;
                    breakdown.witnesses = 25;
                } else if (credibility === 'medium') {
                    score += 15;
                    breakdown.witnesses = 15;
                } else {
                    score += 5;
                    breakdown.witnesses = 5;
                }
            }

            // Dokumenty finansowe (+10%)
            maxScore += 10;
            if (answers.has_valuation === 'yes') {
                score += 10;
                breakdown.financial = 10;
            }

            const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

            return {
                percentage,
                score,
                maxScore,
                breakdown,
                assessment: percentage >= 70 ? 'WYSOKA' : percentage >= 40 ? 'ŚREDNIA' : 'NISKA'
            };
        },

        /**
         * Przewidywana kara dla oskarżonego
         */
        predictPenalty(answers) {
            const minYears = parseInt(answers.penalty_prison_min) || 0;
            const maxYears = parseInt(answers.penalty_prison_max) || 0;

            // Oblicz prawdopodobną karę na podstawie okoliczności
            let reduction = 0;

            const mitigating = answers.mitigating_circumstances || [];
            if (mitigating.includes('first_time')) reduction += 0.2;
            if (mitigating.includes('remorse')) reduction += 0.1;
            if (mitigating.includes('restitution')) reduction += 0.15;
            if (mitigating.includes('cooperation')) reduction += 0.15;
            if (answers.plea === 'guilty') reduction += 0.25;

            const predictedMin = Math.max(0, Math.round(minYears * (1 - reduction)));
            const predictedMax = Math.max(0, Math.round(maxYears * (1 - reduction)));

            return {
                statutory: { min: minYears, max: maxYears },
                predicted: { min: predictedMin, max: predictedMax },
                reduction: Math.round(reduction * 100) + '%',
                suspended: mitigating.length >= 3 && maxYears <= 2
            };
        }
    },

    /**
     * Generuj raport końcowy
     */
    generateReport(answers) {
        const role = answers.role_in_case;
        const report = {
            role,
            summary: {},
            recommendations: [],
            nextSteps: []
        };

        // Dla pokrzywdzonego
        if (role === 'victim' || role === 'representative') {
            // Kalkulacja zadośćuczynienia
            const compensation = this.helpers.calculateCompensation(answers);
            report.summary.compensation = compensation;

            // Ocena dowodów
            const evidence = this.helpers.assessEvidenceStrength(answers);
            report.summary.evidence = evidence;

            // Rekomendacje
            if (evidence.percentage >= 70) {
                report.recommendations.push('✅ Masz mocne dowody - wysoka szansa na wygraną');
                report.recommendations.push('💰 Spodziewane zadośćuczynienie: ' + compensation.range.min + ' - ' + compensation.range.max + ' zł');
            } else if (evidence.percentage >= 40) {
                report.recommendations.push('⚠️ Dowody średnie - wzmocnij zeznaniami świadków');
            } else {
                report.recommendations.push('❌ Słabe dowody - rozważ inne opcje (ugoda?)');
            }

            // Następne kroki
            if (answers.reported_to_police === 'no') {
                report.nextSteps.push('📢 Złóż zawiadomienie o przestępstwie (natychmiast!)');
            }
            report.nextSteps.push('📄 Wygeneruj zawiadomienie o przestępstwie');
            report.nextSteps.push('💰 Przygotuj wniosek o zadośćuczynienie');
        }

        // Dla oskarżonego
        if (role === 'accused') {
            // Przewidywana kara
            if (answers.penalty_prison_max) {
                const penalty = this.helpers.predictPenalty(answers);
                report.summary.penalty = penalty;

                if (penalty.suspended) {
                    report.recommendations.push('✅ Wysoka szansa na karę w zawieszeniu');
                }
            }

            // Strategia
            const strategy = answers.defense_strategy || [];
            if (strategy.includes('innocent')) {
                report.recommendations.push('🛡️ Strategia: NIEWINNY - zbierz dowody alibi');
            }
            if (strategy.includes('mitigating')) {
                report.recommendations.push('💚 Podkreśl okoliczności łagodzące');
            }

            // Następne kroki
            report.nextSteps.push('🛡️ Przygotuj odpowiedź na zarzuty');
            if (answers.has_alibi === 'yes') {
                report.nextSteps.push('📍 Zbierz dowody alibi (dokumenty, świadkowie)');
            }
        }

        return report;
    }
};

// Funkcja pomocnicza do otwarcia ankiety karnej
window.openCriminalQuestionnaire = function(caseId, caseTypeOrNumber) {
    console.log('🚔 Otwieranie ankiety karnej dla sprawy:', caseId, 'typ/numer:', caseTypeOrNumber);
    
    if (window.questionnaireRenderer) {
        let resolvedType = caseTypeOrNumber;
        let mapping = window.criminalQuestionnaire.caseTypeMapping[caseTypeOrNumber];
        
        // Sprawdź czy to alias (POB, KRA, etc.)
        if (mapping && mapping.aliasFor) {
            resolvedType = mapping.aliasFor;
            mapping = window.criminalQuestionnaire.caseTypeMapping[resolvedType];
            console.log('🔄 Rozpoznano alias:', caseTypeOrNumber, '→', resolvedType);
        }
        
        // Sprawdź czy to prefix w numerze sprawy (POB/DK01/002)
        if (!mapping && typeof caseTypeOrNumber === 'string' && caseTypeOrNumber.includes('/')) {
            const prefix = caseTypeOrNumber.split('/')[0]; // POB
            const aliasMapping = window.criminalQuestionnaire.caseTypeMapping[prefix];
            if (aliasMapping && aliasMapping.aliasFor) {
                resolvedType = aliasMapping.aliasFor;
                mapping = window.criminalQuestionnaire.caseTypeMapping[resolvedType];
                console.log('🔄 Rozpoznano prefix z numeru:', prefix, '→', resolvedType);
            }
        }
        
        if (mapping) {
            console.log('✅ Rozpoznano typ sprawy:', mapping.name);
            console.log('📋 Domyślne przestępstwo:', mapping.defaultCrime);
            console.log('📂 Kategoria:', mapping.category);
            
            // TODO: Ustaw domyślne odpowiedzi w rendererze
            // (Na razie renderujemy standardową ankietę)
        }
        
        // Otwórz ankietę karną (przekaż typ 'criminal' do renderera)
        window.questionnaireRenderer.openQuestionnaire(caseId, 'criminal');
    } else {
        console.error('❌ QuestionnaireRenderer nie jest załadowany!');
    }
};

// Funkcja sprawdzająca czy typ/numer sprawy jest karny
window.isCriminalCase = function(caseTypeOrNumber) {
    if (!caseTypeOrNumber) return false;
    
    // Sprawdź bezpośrednio
    if (window.criminalQuestionnaire.caseTypeMapping[caseTypeOrNumber]) {
        return true;
    }
    
    // Sprawdź prefix w numerze (POB/DK01/002)
    if (typeof caseTypeOrNumber === 'string' && caseTypeOrNumber.includes('/')) {
        const prefix = caseTypeOrNumber.split('/')[0];
        return !!window.criminalQuestionnaire.caseTypeMapping[prefix];
    }
    
    return false;
};

console.log('✅ Ankieta karna gotowa!');
console.log('📋 criminalQuestionnaire object:', window.criminalQuestionnaire);
console.log('📦 Dostępne właściwości:', Object.keys(window.criminalQuestionnaire));
console.log('📊 Sekcji:', window.criminalQuestionnaire.sections ? window.criminalQuestionnaire.sections.length : 'UNDEFINED!');
console.log('📄 Dokumentów:', window.criminalQuestionnaire.requiredDocuments ? window.criminalQuestionnaire.requiredDocuments.length : 'UNDEFINED!');
console.log('⚖️ Faz procedury:', window.criminalQuestionnaire.procedure ? window.criminalQuestionnaire.procedure.phases.length : 'UNDEFINED!');
console.log('🎯 Funkcje AI: Kalkulator zadośćuczynienia, Ocena dowodów, Przewidywanie kary');
console.log('🚔 Obsługiwane typy:', Object.keys(window.criminalQuestionnaire.caseTypeMapping).filter(k => !k.includes('aliasFor')).join(', '));
