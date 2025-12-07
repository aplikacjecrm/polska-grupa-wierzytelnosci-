// 🚔 ANKIETA KARNA - CZĘŚĆ 1 (Sekcje 1-3)

console.log('✅ Ładuję ankietę karną część 1 - z pytaniem o zagrożenie + porady o prawach!');

window.criminalQuestionnaire_Part1 = {
    // SEKCJA 1: ROLA W SPRAWIE
    section_1_role: {
        id: 'role',
        title: '',
        description: 'Określ swoją rolę - od tego zależą kolejne pytania',
        questions: [
            {
                id: 'role_in_case',
                label: 'Kim jesteś w tej sprawie karnej?',
                type: 'radio',
                required: true,
                help: 'Wybierz swoją perspektywę - ankieta dostosuje pytania',
                options: [
                    { 
                        value: 'victim', 
                        label: '👤 POKRZYWDZONY - Przestępstwo mnie dotknęło (zgłaszam przestępstwo)' 
                    },
                    { 
                        value: 'accused', 
                        label: '⚖️ OSKARŻONY/PODEJRZANY - Jestem oskarżony o przestępstwo (bronię się)' 
                    },
                    { 
                        value: 'witness', 
                        label: '👁️ ŚWIADEK - Widziałem/słyszałem przestępstwo' 
                    },
                    { 
                        value: 'representative', 
                        label: '👔 PEŁNOMOCNIK - Reprezentuję pokrzywdzonego lub oskarżonego' 
                    }
                ]
            },
            {
                id: 'representing_who',
                label: 'Kogo reprezentujesz?',
                type: 'text',
                required: false,
                showIf: ['representative'],
                placeholder: 'Imię i nazwisko osoby, którą reprezentujesz',
                help: 'To pytanie pojawi się tylko dla pełnomocnika'
            },
            {
                id: 'has_lawyer',
                label: 'Czy masz już adwokata/radcę prawnego?',
                type: 'radio',
                required: false,
                options: [
                    { value: 'yes', label: 'Tak, mam pełnomocnika' },
                    { value: 'no', label: 'Nie, szukam pomocy prawnej' },
                    { value: 'appointed', label: 'Mam obrońcę z urzędu' }
                ]
            }
        ]
    },

    // SEKCJA 2A: INFORMACJE PODSTAWOWE (DLA POKRZYWDZONEGO)
    section_2a_basic_victim: {
        id: 'basic_victim',
        title: '',
        description: 'Podstawowe dane o przestępstwie',
        showIf: ['victim', 'representative'],
        questions: [
            {
                id: 'case_title',
                label: 'Krótki tytuł sprawy',
                type: 'text',
                required: true,
                placeholder: 'np. Pobicie w barze "Pod Orłem" w dniu 15.10.2024',
                help: 'Zwięzły opis - łatwiej będzie znaleźć sprawę'
            },
            {
                id: 'crime_date',
                label: 'Data przestępstwa',
                type: 'date',
                required: true,
                help: 'Kiedy dokładnie miało miejsce przestępstwo?'
            },
            {
                id: 'crime_time',
                label: 'Godzina przestępstwa (jeśli pamiętasz)',
                type: 'text',
                required: false,
                placeholder: 'np. 22:30',
                help: 'Przybliżona godzina'
            },
            {
                id: 'crime_location',
                label: 'Miejsce przestępstwa (dokładny adres)',
                type: 'textarea',
                required: true,
                rows: 2,
                placeholder: 'ul. Kwiatowa 15, 00-001 Warszawa\nlub: Bar "Pod Orłem", ul. Główna 20, Kraków',
                help: 'Im dokładniej, tym lepiej - może być monitoring!'
            },
            {
                id: 'life_danger',
                label: '🚨 Czy Twoje życie lub zdrowie jest obecnie zagrożone?',
                type: 'radio',
                required: true,
                options: [
                    { value: 'yes_immediate', label: '🔴 TAK - zagrożenie BEZPOŚREDNIE (teraz!)' },
                    { value: 'yes_ongoing', label: '🟠 TAK - sprawca mnie śledzi/straszy' },
                    { value: 'was', label: '🟡 BYŁO (w chwili przestępstwa)' },
                    { value: 'no', label: '🟢 NIE - nie czuję zagrożenia' }
                ],
                help: '⚠️ Jeśli jesteś w bezpośrednim niebezpieczeństwie - ZADZWOŃ NA 112 lub POLICJĘ (997)!'
            },
            {
                id: 'emergency_info',
                label: '⚠️ WAŻNA INFORMACJA',
                type: 'info',
                content: `
                    <div style="background: #F8FAFC; border: 2px solid #3B82F6; padding: 20px; border-radius: 12px; margin: 15px 0;">
                        <h4 style="color: #666; margin: 0 0 15px 0; font-size: 1.2rem;">🚨 JEŚLI JESTEŚ W NIEBEZPIECZEŃSTWIE:</h4>
                        <ul style="color: #666; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
                            <li><strong>112</strong> - Numer alarmowy (policja, pogotowie, straż)</li>
                            <li><strong>997</strong> - Bezpośrednio do policji</li>
                            <li><strong>Niebieska Karta</strong> - Zgłoś przemoc domową</li>
                            <li><strong>Zakaz zbliżania</strong> - Możesz złożyć wniosek w prokuraturze (natychmiast!)</li>
                            <li><strong>Telefon zaufania</strong> - 116 111 (pomoc psychologiczna)</li>
                        </ul>
                        <p style="color: #666; margin: 15px 0 0 0; font-weight: 600;">
                            💡 NIE CZEKAJ! Twoje bezpieczeństwo jest najważniejsze!
                        </p>
                    </div>
                `,
                showIf: ['yes_immediate', 'yes_ongoing']
            },
            {
                id: 'perpetrator_known',
                label: 'Czy znasz sprawcę?',
                type: 'radio',
                required: true,
                options: [
                    { value: 'yes', label: '✅ Tak, znam sprawcę (imię, nazwisko)' },
                    { value: 'partial', label: '⚠️ Znam tylko z widzenia / pseudonim' },
                    { value: 'no', label: '❌ Nie znam, nieznany sprawca' }
                ]
            },
            {
                id: 'perpetrator_name',
                label: 'Imię i nazwisko sprawcy',
                type: 'text',
                required: false,
                showIf: ['yes', 'partial'],
                placeholder: 'Jan Kowalski',
                help: 'Jeśli znasz sprawcę'
            },
            {
                id: 'perpetrator_pesel',
                label: 'PESEL sprawcy (jeśli znasz)',
                type: 'text',
                required: false,
                showIf: ['yes'],
                pattern: '[0-9]{11}',
                placeholder: '12345678901'
            },
            {
                id: 'perpetrator_address',
                label: 'Adres zamieszkania sprawcy',
                type: 'textarea',
                required: false,
                showIf: ['yes'],
                rows: 2,
                placeholder: 'ul. Słoneczna 10, 00-002 Warszawa',
                help: 'Jeśli znasz adres sprawcy'
            },
            {
                id: 'perpetrator_description',
                label: 'Rysopis sprawcy',
                type: 'textarea',
                required: false,
                showIf: ['partial', 'no'],
                rows: 3,
                placeholder: 'Wzrost ok. 180 cm, krótkie ciemne włosy, tatuaż na prawym ramieniu...',
                help: 'Opisz jak wyglądał sprawca - każdy szczegół się liczy'
            },
            {
                id: 'reported_to_police',
                label: 'Czy zgłosiłeś przestępstwo na policję?',
                type: 'radio',
                required: true,
                options: [
                    { value: 'yes', label: '✅ Tak, zgłosiłem' },
                    { value: 'no', label: '❌ Nie, jeszcze nie zgłosiłem' }
                ]
            },
            {
                id: 'police_case_number',
                label: 'Numer sprawy policyjnej / prokuratorskiej',
                type: 'text',
                required: false,
                showIf: ['yes'],
                placeholder: 'RSD 123/2024',
                help: 'Numer z zawiadomienia lub protokołu'
            },
            {
                id: 'prosecutor_office',
                label: 'Prokuratura prowadząca',
                type: 'text',
                required: false,
                showIf: ['yes'],
                placeholder: 'Prokuratura Rejonowa w Warszawie'
            },
            {
                id: 'why_not_reported',
                label: 'Dlaczego nie zgłosiłeś na policję?',
                type: 'textarea',
                required: false,
                showIf: ['no'],
                rows: 2,
                placeholder: 'np. Nie wiedziałem czy warto, Bałem się odwetu...',
                help: 'Możemy pomóc w przygotowaniu zawiadomienia!'
            },
            {
                id: 'victim_rights_info',
                label: '📚 TWOJE PRAWA I OBOWIĄZKI JAKO POKRZYWDZONY',
                type: 'info',
                content: `
                    <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 25px; border-radius: 12px; color: white; margin: 20px 0;">
                        <h3 style="margin: 0 0 20px 0; font-size: 1.3rem;">⚖️ PRAWA POKRZYWDZONEGO</h3>
                        
                        <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <h4 style="margin: 0 0 10px 0; font-size: 1.1rem;">✅ MASZ PRAWO DO:</h4>
                            <ul style="line-height: 1.8; margin: 0; padding-left: 20px;">
                                <li><strong>Złożenia zawiadomienia</strong> - Ustnie lub pisemnie na policji/w prokuraturze</li>
                                <li><strong>Informacji o postępach</strong> - Możesz pytać o stan śledztwa</li>
                                <li><strong>Pełnomocnika</strong> - Adwokat/radca może Cię reprezentować (bezpłatnie jeśli jesteś ubogi)</li>
                                <li><strong>Zadośćuczynienia</strong> - Możesz żądać odszkodowania + zadośćuczynienia</li>
                                <li><strong>Odwołania</strong> - Jeśli prokurator umorzy sprawę, możesz się odwołać</li>
                                <li><strong>Tłumacza</strong> - Jeśli nie znasz polskiego</li>
                                <li><strong>Zapoznania z aktami</strong> - Możesz przeglądać dokumenty sprawy</li>
                                <li><strong>Przesłuchania bez obecności oskarżonego</strong> - W szczególnych przypadkach</li>
                            </ul>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <h4 style="margin: 0 0 10px 0; font-size: 1.1rem;">📋 TWOJE OBOWIĄZKI:</h4>
                            <ul style="line-height: 1.8; margin: 0; padding-left: 20px;">
                                <li><strong>Stawienie się na wezwanie</strong> - Policja/prokuratura/sąd może Cię wezwać</li>
                                <li><strong>Złożenie prawdziwych zeznań</strong> - Kłamstwo = przestępstwo (art. 233 KK)</li>
                                <li><strong>Przedstawienie dowodów</strong> - Jeśli masz dokumenty, zdjęcia, nagrania</li>
                                <li><strong>Współpraca ze śledztwem</strong> - Odpowiadanie na pytania śledczych</li>
                            </ul>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px;">
                            <h4 style="margin: 0 0 10px 0; font-size: 1.1rem;">💰 ZADOŚĆUCZYNIENIE:</h4>
                            <p style="margin: 0 0 10px 0;">Możesz żądać pieniędzy za:</p>
                            <ul style="line-height: 1.8; margin: 0; padding-left: 20px;">
                                <li><strong>Krzywdę</strong> - Cierpienie fizyczne i psychiczne</li>
                                <li><strong>Koszty leczenia</strong> - Wizyty, lekarstwa, rehabilitacja</li>
                                <li><strong>Zniszczone rzeczy</strong> - Ubrania, telefon, samochód</li>
                                <li><strong>Utracone zarobki</strong> - Jeśli nie mogłeś pracować</li>
                                <li><strong>Pomoc psychologiczną</strong> - Terapia po traumie</li>
                            </ul>
                            <p style="margin: 15px 0 0 0; font-weight: 600;">
                                💡 Możesz złożyć pozew cywilny już w procesie karnym (szybciej i taniej)!
                            </p>
                        </div>
                        
                        <div style="background: #F8FAFC; color: #666; padding: 15px; border-radius: 8px; margin-top: 15px;">
                            <strong>⚠️ WAŻNE:</strong> Jeśli nie masz pieniędzy na adwokata - możesz prosić o <strong>bezpłatną pomoc prawną</strong> 
                            (złóż wniosek do prokuratury/sądu + załącz zaświadczenie o dochodach).
                        </div>
                    </div>
                `
            }
        ]
    },

    // SEKCJA 2B: INFORMACJE PODSTAWOWE (DLA OSKARŻONEGO)
    section_2b_basic_accused: {
        id: 'basic_accused',
        title: '',
        description: 'Podstawowe dane o toczącym się postępowaniu',
        showIf: ['accused'],
        questions: [
            {
                id: 'case_stage',
                label: 'Na jakim etapie jest postępowanie?',
                type: 'radio',
                required: true,
                help: 'Wybierz obecny etap - określi to dalsze kroki',
                options: [
                    { value: 'witness', label: '🔍 Przesłuchanie jako świadek' },
                    { value: 'suspect', label: '⚠️ Status podejrzanego' },
                    { value: 'charged', label: '📋 Postawiono mi zarzuty' },
                    { value: 'indictment', label: '⚖️ Akt oskarżenia do sądu' },
                    { value: 'trial', label: '🏛️ Proces w sądzie (rozprawy)' },
                    { value: 'verdict', label: '📜 Wyrok - chcę się odwołać' }
                ]
            },
            {
                id: 'case_number_accused',
                label: 'Numer sprawy karnej',
                type: 'text',
                required: false,
                placeholder: 'RSD 456/2024 lub II K 123/2024',
                help: 'Znajdziesz w dokumentach od prokuratury/sądu'
            },
            {
                id: 'prosecutor_name',
                label: 'Prokurator prowadzący',
                type: 'text',
                required: false,
                placeholder: 'Jan Nowak, Prokuratura Rejonowa w Krakowie'
            },
            {
                id: 'court_name',
                label: 'Sąd rozpatrujący sprawę',
                type: 'text',
                required: false,
                showIf: ['indictment', 'trial', 'verdict'],
                placeholder: 'Sąd Rejonowy w Warszawie'
            },
            {
                id: 'court_signature',
                label: 'Sygnatura akt sądowych',
                type: 'text',
                required: false,
                showIf: ['indictment', 'trial', 'verdict'],
                placeholder: 'II K 123/2024'
            },
            {
                id: 'next_hearing_date',
                label: 'Data najbliższej rozprawy',
                type: 'date',
                required: false,
                showIf: ['trial'],
                help: 'Kiedy jest następna rozprawa?'
            }
        ]
    },

    // SEKCJA 3: RODZAJ PRZESTĘPSTWA
    section_3_crime_type: {
        id: 'crime_type',
        title: '',
        description: 'Określ jakiego przestępstwa dotyczy sprawa',
        questions: [
            {
                id: 'crime_category',
                label: 'Kategoria przestępstwa',
                type: 'select',
                required: true,
                help: 'Wybierz główną kategorię - potem precyzujemy',
                options: [
                    { value: '', label: '-- Wybierz kategorię --' },
                    { value: 'life_health', label: '❤️ Przeciwko życiu i zdrowiu' },
                    { value: 'property', label: '💰 Przeciwko mieniu (kradzież, oszustwo)' },
                    { value: 'sexual', label: '🚫 Przeciwko wolności seksualnej' },
                    { value: 'honor', label: '📢 Przeciwko czci (zniesławienie)' },
                    { value: 'economic', label: '💼 Gospodarcze' },
                    { value: 'traffic', label: '🚗 Drogowe' },
                    { value: 'family', label: '👨‍👩‍👧 Przeciwko rodzinie (alimony, znęcanie)' },
                    { value: 'other', label: '📋 Inne' }
                ]
            },
            {
                id: 'specific_crime_life',
                label: 'Konkretne przestępstwo (przeciwko życiu/zdrowiu)',
                type: 'select',
                required: false,
                showIf: ['life_health'],
                options: [
                    { value: '', label: '-- Wybierz --' },
                    { value: 'art148', label: 'art. 148 KK - Zabójstwo' },
                    { value: 'art156', label: 'art. 156 KK - Ciężkie uszkodzenie ciała' },
                    { value: 'art157', label: 'art. 157 KK - Pobicie, średnie/lekkie uszkodzenie ciała' },
                    { value: 'art190', label: 'art. 190 KK - Groźby karalne' },
                    { value: 'art191', label: 'art. 191 KK - Zmuszanie' },
                    { value: 'art207', label: 'art. 207 KK - Znęcanie się' }
                ]
            },
            {
                id: 'specific_crime_property',
                label: 'Konkretne przestępstwo (przeciwko mieniu)',
                type: 'select',
                required: false,
                showIf: ['property'],
                options: [
                    { value: '', label: '-- Wybierz --' },
                    { value: 'art278', label: 'art. 278 KK - Kradzież' },
                    { value: 'art279', label: 'art. 279 KK - Kradzież z włamaniem' },
                    { value: 'art280', label: 'art. 280 KK - Rozbój' },
                    { value: 'art286', label: 'art. 286 KK - Oszustwo' },
                    { value: 'art287', label: 'art. 287 KK - Oszustwo komputerowe' },
                    { value: 'art288', label: 'art. 288 KK - Przywłaszczenie' },
                    { value: 'art291', label: 'art. 291 KK - Zniszczenie mienia' }
                ]
            },
            {
                id: 'specific_crime_sexual',
                label: 'Konkretne przestępstwo (przeciwko wolności seksualnej)',
                type: 'select',
                required: false,
                showIf: ['sexual'],
                options: [
                    { value: '', label: '-- Wybierz --' },
                    { value: 'art197', label: 'art. 197 KK - Zgwałcenie' },
                    { value: 'art199', label: 'art. 199 KK - Seksualne wykorzystanie bezradności' },
                    { value: 'art200', label: 'art. 200 KK - Obcowanie płciowe z małoletnim' },
                    { value: 'art200a', label: 'art. 200a KK - Pedofilia' },
                    { value: 'art202', label: 'art. 202 KK - Pornografia' }
                ]
            },
            {
                id: 'specific_crime_honor',
                label: 'Konkretne przestępstwo (przeciwko czci)',
                type: 'select',
                required: false,
                showIf: ['honor'],
                options: [
                    { value: '', label: '-- Wybierz --' },
                    { value: 'art212', label: 'art. 212 KK - Zniesławienie' },
                    { value: 'art216', label: 'art. 216 KK - Zniewaga' }
                ]
            },
            {
                id: 'specific_crime_economic',
                label: 'Konkretne przestępstwo (gospodarcze)',
                type: 'select',
                required: false,
                showIf: ['economic'],
                options: [
                    { value: '', label: '-- Wybierz --' },
                    { value: 'art270', label: 'art. 270 KK - Fałszerstwo dokumentów' },
                    { value: 'art296', label: 'art. 296 KK - Oszustwo gospodarcze' },
                    { value: 'art297', label: 'art. 297 KK - Fałszerstwo faktur' },
                    { value: 'art299', label: 'art. 299 KK - Pranie brudnych pieniędzy' }
                ]
            },
            {
                id: 'specific_crime_traffic',
                label: 'Konkretne przestępstwo (drogowe)',
                type: 'select',
                required: false,
                showIf: ['traffic'],
                options: [
                    { value: '', label: '-- Wybierz --' },
                    { value: 'art177', label: 'art. 177 KK - Spowodowanie wypadku (śmierć/ciężki uszczerbek)' },
                    { value: 'art178', label: 'art. 178 KK - Jazda pod wpływem alkoholu/narkotyków' },
                    { value: 'art178a', label: 'art. 178a KK - Ucieczka z miejsca wypadku' }
                ]
            },
            {
                id: 'specific_crime_family',
                label: 'Konkretne przestępstwo (przeciwko rodzinie)',
                type: 'select',
                required: false,
                showIf: ['family'],
                options: [
                    { value: '', label: '-- Wybierz --' },
                    { value: 'art207', label: 'art. 207 KK - Znęcanie się nad rodziną' },
                    { value: 'art208', label: 'art. 208 KK - Niealimentacja (niepłacenie alimentów)' },
                    { value: 'art209', label: 'art. 209 KK - Uprowadzenie dziecka' }
                ]
            },
            {
                id: 'crime_description',
                label: 'Szczegółowy opis przestępstwa',
                type: 'textarea',
                required: true,
                rows: 5,
                placeholder: 'Opisz dokładnie co się stało:\n- Gdzie i kiedy?\n- Co zrobił sprawca?\n- Jak wyglądała sytuacja?\n- Jakie były konsekwencje?\n\nPamiętaj: Im więcej szczegółów, tym lepiej!',
                help: 'To najważniejsze pytanie - opisz wszystko dokładnie',
                audioRecording: true
            },
            {
                id: 'crime_circumstances',
                label: 'Okoliczności przestępstwa',
                type: 'textarea',
                required: false,
                rows: 3,
                placeholder: 'Jak doszło do przestępstwa? Co się działo wcześniej? Czy była prowokacja?',
                help: 'Kontekst sytuacji - co doprowadziło do zdarzenia'
            }
        ]
    }
};

console.log('✅ Ankieta karna część 1 załadowana!');
console.log('📊 Part1 - Sekcje:', Object.keys(window.criminalQuestionnaire_Part1).length);
console.log('🚨 Nowe: Pytanie o zagrożenie życia + panel z numerami alarmowymi');
console.log('📚 Nowe: Panel edukacyjny - Prawa i obowiązki pokrzywdzonego');
