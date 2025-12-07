// 🚔 ANKIETA KARNA - CZĘŚĆ 2 (Sekcja 4A i 4B - Szkody i Obrona)

console.log('✅ Ładuję ankietę karną część 2...');

window.criminalQuestionnaire_Part2 = {
    // SEKCJA 4A: SZKODY I KRZYWDA (DLA POKRZYWDZONEGO)
    section_4a_damages: {
        id: 'damages',
        title: '',
        description: 'Jakie szkody poniosłeś w wyniku przestępstwa?',
        showIf: ['victim', 'representative'],
        questions: [
            {
                id: 'has_injuries',
                label: 'Czy doznałeś obrażeń ciała?',
                type: 'radio',
                required: true,
                options: [
                    { value: 'yes', label: '✅ Tak, mam obrażenia' },
                    { value: 'no', label: '❌ Nie, nie doznałem obrażeń' }
                ]
            },
            {
                id: 'injury_type',
                label: 'Rodzaj obrażeń',
                type: 'checkbox',
                required: false,
                showIf: ['yes'],
                options: [
                    { value: 'light', label: 'Lekkie (siniaki, zadrapania)' },
                    { value: 'medium', label: 'Średnie (złamania, rany wymagające szycia)' },
                    { value: 'severe', label: 'Ciężkie (długotrwałe leczenie, hospitalizacja)' },
                    { value: 'permanent', label: 'Trwałe (inwalidztwo, trwały uszczerbek)' }
                ]
            },
            {
                id: 'injury_description',
                label: 'Szczegółowy opis obrażeń',
                type: 'textarea',
                required: false,
                showIf: ['yes'],
                rows: 4,
                placeholder: 'Opisz dokładnie:\n- Jakie obrażenia?\n- Która część ciała?\n- Jak wyglądają?\n- Czy są widoczne?',
                help: 'Im dokładniej, tym lepiej dla sprawy'
            },
            {
                id: 'treatment_duration',
                label: 'Czas leczenia',
                type: 'text',
                required: false,
                showIf: ['yes'],
                placeholder: 'np. 2 tygodnie, 3 miesiące',
                help: 'Jak długo trwało/trwa leczenie?'
            },
            {
                id: 'has_medical_certificate',
                label: 'Czy masz zaświadczenie lekarskie o obrażeniach?',
                type: 'radio',
                required: false,
                showIf: ['yes'],
                options: [
                    { value: 'yes', label: '✅ Tak, mam zaświadczenie' },
                    { value: 'no', label: '❌ Nie, nie mam' }
                ]
            },
            {
                id: 'permanent_damage',
                label: 'Czy są trwałe skutki?',
                type: 'radio',
                required: false,
                showIf: ['yes'],
                options: [
                    { value: 'yes', label: '✅ Tak, są trwałe skutki' },
                    { value: 'no', label: '❌ Nie, wszystko się wyleczyło' }
                ]
            },
            {
                id: 'permanent_damage_description',
                label: 'Opis trwałych skutków',
                type: 'textarea',
                required: false,
                showIf: ['yes'],
                rows: 3,
                placeholder: 'np. Blizny, utrata sprawności, ból przewlekły, niepełnosprawność...',
                help: 'Trwałe skutki znacząco wpływają na zadośćuczynienie'
            },
            {
                id: 'has_material_loss',
                label: 'Czy poniosłeś straty materialne?',
                type: 'radio',
                required: true,
                options: [
                    { value: 'yes', label: '✅ Tak, straciłem mienie/pieniądze' },
                    { value: 'no', label: '❌ Nie, brak strat materialnych' }
                ]
            },
            {
                id: 'stolen_items',
                label: 'Co zostało skradzione/zniszczone?',
                type: 'textarea',
                required: false,
                showIf: ['yes'],
                rows: 3,
                placeholder: 'Lista rzeczy:\n- Portfel (300 zł)\n- Telefon Samsung Galaxy S20 (2000 zł)\n- Zegarek Casio (500 zł)',
                help: 'Wymień wszystko dokładnie z wartością'
            },
            {
                id: 'material_loss_value',
                label: 'Łączna wartość strat materialnych',
                type: 'number',
                required: false,
                showIf: ['yes'],
                placeholder: '5000',
                help: 'Kwota w złotych (PLN)',
                min: 0
            },
            {
                id: 'has_valuation',
                label: 'Czy masz wycenę/faktury potwierdzające wartość?',
                type: 'radio',
                required: false,
                showIf: ['yes'],
                options: [
                    { value: 'yes', label: '✅ Tak, mam dokumenty' },
                    { value: 'partial', label: '⚠️ Częściowo' },
                    { value: 'no', label: '❌ Nie mam' }
                ]
            },
            {
                id: 'emotional_harm',
                label: 'Czy doznałeś krzywdy moralnej (emocjonalnej)?',
                type: 'radio',
                required: true,
                options: [
                    { value: 'yes', label: '✅ Tak' },
                    { value: 'no', label: '❌ Nie' }
                ]
            },
            {
                id: 'emotional_harm_description',
                label: 'Jak przestępstwo wpłynęło na Twoje życie?',
                type: 'textarea',
                required: false,
                showIf: ['yes'],
                rows: 5,
                placeholder: 'Opisz szczerze:\n- Czy boisz się wychodzić z domu?\n- Czy masz koszmary?\n- Czy straciłeś pracę?\n- Czy pojawiła się depresja/lęki?\n- Jak to wpłynęło na rodzinę?',
                help: 'Krzywda moralna to ważny element zadośćuczynienia',
                audioRecording: true
            },
            {
                id: 'psychological_support',
                label: 'Czy korzystasz z pomocy psychologa/terapeuty?',
                type: 'radio',
                required: false,
                showIf: ['yes'],
                options: [
                    { value: 'yes', label: '✅ Tak, jestem w terapii' },
                    { value: 'no', label: '❌ Nie' }
                ]
            },
            {
                id: 'therapy_cost',
                label: 'Koszty terapii psychologicznej',
                type: 'number',
                required: false,
                showIf: ['yes'],
                placeholder: '2000',
                help: 'Łączny koszt terapii w złotych',
                min: 0
            },
            {
                id: 'lost_income',
                label: 'Czy straciłeś dochody (nie mogłeś pracować)?',
                type: 'radio',
                required: false,
                options: [
                    { value: 'yes', label: '✅ Tak, straciłem zarobki' },
                    { value: 'no', label: '❌ Nie' }
                ]
            },
            {
                id: 'lost_income_amount',
                label: 'Kwota utraconych dochodów',
                type: 'number',
                required: false,
                showIf: ['yes'],
                placeholder: '5000',
                help: 'Ile straciłeś przez niemożność pracy?',
                min: 0
            },
            {
                id: 'compensation_expected',
                label: 'Jakiej kwoty zadośćuczynienia oczekujesz?',
                type: 'number',
                required: false,
                placeholder: '50000',
                help: 'System pomoże obliczyć realną kwotę, ale podaj swoją oczekiwaną',
                min: 0
            }
        ]
    },

    // SEKCJA 4B: ZARZUTY I OBRONA (DLA OSKARŻONEGO)
    section_4b_defense: {
        id: 'defense',
        title: 'SEKCJA 4B: ZARZUTY I STRATEGIA OBRONY',
        description: 'Informacje o zarzutach i Twojej obronie',
        showIf: ['accused'],
        questions: [
            {
                id: 'charges_description',
                label: 'Treść postawionych zarzutów',
                type: 'textarea',
                required: true,
                rows: 5,
                placeholder: 'Skopiuj dokładnie z dokumentów:\n\nZarzuca się, że w dniu... dopuścił się...',
                help: 'Przepisz dokładnie z dokumentu od prokuratora - to bardzo ważne!',
                audioRecording: true
            },
            {
                id: 'penalty_prison_min',
                label: 'Grozi Ci: Więzienie od (lat)',
                type: 'number',
                required: false,
                placeholder: '0',
                help: 'Minimalna kara więzienia',
                min: 0
            },
            {
                id: 'penalty_prison_max',
                label: 'Grozi Ci: Więzienie do (lat)',
                type: 'number',
                required: false,
                placeholder: '5',
                help: 'Maksymalna kara więzienia',
                min: 0
            },
            {
                id: 'penalty_fine',
                label: 'Grozi Ci: Grzywna (zł)',
                type: 'number',
                required: false,
                placeholder: '10000',
                help: 'Wysokość grzywny (jeśli grozi)',
                min: 0
            },
            {
                id: 'plea',
                label: 'Czy przyznałeś się do winy?',
                type: 'radio',
                required: true,
                help: 'Twoje stanowisko wobec zarzutów',
                options: [
                    { value: 'not_guilty', label: '❌ Nie przyznałem się - jestem niewinny' },
                    { value: 'guilty', label: '✅ Przyznałem się w pełni' },
                    { value: 'partial', label: '⚠️ Przyznałem się częściowo' },
                    { value: 'no_comment', label: '🔒 Skorzystałem z prawa do milczenia' }
                ]
            },
            {
                id: 'defense_strategy',
                label: 'Strategia obrony (wybierz wszystkie które pasują)',
                type: 'checkbox',
                required: true,
                help: 'Na czym opierasz swoją obronę?',
                options: [
                    { value: 'innocent', label: '🙅 NIEWINNY - nie zrobiłem tego' },
                    { value: 'alibi', label: '📍 ALIBI - byłem gdzie indziej' },
                    { value: 'self_defense', label: '🛡️ SAMOOBRONA - broniłem się/kogoś' },
                    { value: 'no_intent', label: '🤷 BRAK ZAMIARU - to był wypadek' },
                    { value: 'mistaken_identity', label: '👤 POMYŁKA - to nie ja, mylą osoby' },
                    { value: 'provocation', label: '😡 PROWOKACJA - zostałem sprowokowany' },
                    { value: 'duress', label: '⚠️ PRZYMUS - działałem pod przymusem' },
                    { value: 'intoxication', label: '🍺 NIETRZEŹWOŚĆ - byłem pod wpływem' },
                    { value: 'mitigating', label: '💚 OKOLICZNOŚCI ŁAGODZĄCE' },
                    { value: 'statute_limitations', label: '⏰ PRZEDAWNIENIE' }
                ]
            },
            {
                id: 'defense_explanation',
                label: 'Wyjaśnij swoją obronę szczegółowo',
                type: 'textarea',
                required: true,
                rows: 6,
                placeholder: 'Opisz dokładnie:\n- Dlaczego jesteś niewinny?\n- Co naprawdę się wydarzyło?\n- Jakie masz dowody?\n- Dlaczego wersja oskarżenia jest błędna?',
                help: 'To kluczowe - opisz swoją wersję wydarzeń',
                audioRecording: true
            },
            {
                id: 'has_alibi',
                label: 'Czy masz alibi (byłeś gdzie indziej)?',
                type: 'radio',
                required: false,
                options: [
                    { value: 'yes', label: '✅ Tak, mam alibi' },
                    { value: 'no', label: '❌ Nie' }
                ]
            },
            {
                id: 'alibi_description',
                label: 'Opisz swoje alibi',
                type: 'textarea',
                required: false,
                showIf: ['yes'],
                rows: 4,
                placeholder: 'Gdzie byłeś w chwili przestępstwa?\nKto Cię widział?\nCzy masz dowody (bilety, nagrania)?',
                help: 'Alibi to bardzo mocny dowód!'
            },
            {
                id: 'alibi_witnesses',
                label: 'Świadkowie potwierdzający alibi',
                type: 'textarea',
                required: false,
                showIf: ['yes'],
                rows: 3,
                placeholder: 'Imię, nazwisko, telefon świadków którzy widzieli Cię gdzie indziej',
                help: 'Kto może potwierdzić że byłeś gdzie indziej?'
            },
            {
                id: 'has_evidence_innocence',
                label: 'Czy masz dowody niewinności?',
                type: 'radio',
                required: false,
                options: [
                    { value: 'yes', label: '✅ Tak, mam dowody' },
                    { value: 'no', label: '❌ Nie mam' }
                ]
            },
            {
                id: 'evidence_innocence_list',
                label: 'Jakie masz dowody niewinności?',
                type: 'textarea',
                required: false,
                showIf: ['yes'],
                rows: 4,
                placeholder: 'Lista dowodów:\n- Nagrania z monitoringu\n- Bilety/faktury potwierdzające alibi\n- SMS/emaile\n- Zdjęcia\n- Świadkowie',
                help: 'Każdy dowód jest ważny!'
            },
            {
                id: 'mitigating_circumstances',
                label: 'Okoliczności łagodzące',
                type: 'checkbox',
                required: false,
                help: 'Co przemawia na Twoją korzyść?',
                options: [
                    { value: 'first_time', label: '✅ Niekarany wcześniej' },
                    { value: 'young', label: '👶 Młody wiek' },
                    { value: 'family', label: '👨‍👩‍👧 Mam rodzinę na utrzymaniu' },
                    { value: 'remorse', label: '😔 Szczere żal i skrucha' },
                    { value: 'restitution', label: '💰 Naprawiłem szkodę' },
                    { value: 'cooperation', label: '🤝 Współpracuję z wymiarem sprawiedliwości' },
                    { value: 'provoked', label: '😡 Zostałem sprowokowany' },
                    { value: 'health', label: '🏥 Problemy zdrowotne' },
                    { value: 'difficult_situation', label: '💔 Trudna sytuacja życiowa' }
                ]
            },
            {
                id: 'previous_convictions',
                label: 'Czy byłeś wcześniej karany?',
                type: 'radio',
                required: false,
                options: [
                    { value: 'no', label: '✅ Nie, jestem niekarany' },
                    { value: 'yes', label: '⚠️ Tak, byłem karany' }
                ]
            },
            {
                id: 'previous_convictions_details',
                label: 'Szczegóły poprzednich skazań',
                type: 'textarea',
                required: false,
                showIf: ['yes'],
                rows: 3,
                placeholder: 'Kiedy? Za co? Jaka kara?',
                help: 'Uczciwość jest ważna - prokuratura to sprawdzi'
            },
            {
                id: 'reconciliation_with_victim',
                label: 'Czy doszło do pojednania z pokrzywdzonym?',
                type: 'radio',
                required: false,
                options: [
                    { value: 'yes', label: '✅ Tak, naprawiłem szkodę/przeprosiłem' },
                    { value: 'no', label: '❌ Nie' }
                ]
            },
            {
                id: 'expected_verdict',
                label: 'Jakiego wyroku oczekujesz?',
                type: 'checkbox',
                required: false,
                help: 'Co chcesz osiągnąć?',
                options: [
                    { value: 'acquittal', label: '✅ Uniewinnienie' },
                    { value: 'dismissal', label: '📋 Umorzenie postępowania' },
                    { value: 'suspended', label: '⏸️ Kara w zawieszeniu' },
                    { value: 'fine', label: '💰 Tylko grzywna (bez więzienia)' },
                    { value: 'probation', label: '👮 Dozór kuratorski' }
                ]
            }
        ]
    }
};

console.log('✅ Ankieta karna część 2 załadowana!');
console.log('📊 Part2 - Sekcje:', Object.keys(window.criminalQuestionnaire_Part2).length);
