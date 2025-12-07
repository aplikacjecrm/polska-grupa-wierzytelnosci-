// ==========================================
// ANKIETA UPADŁOŚCIOWA + PROCEDURA
// ==========================================

console.log('📋 Bankruptcy Questionnaire Module v2.0 - ENHANCED!');

window.bankruptcyQuestionnaire = {
    // Pełna struktura ankiety
    sections: [
        {
            id: 'debtor_type',
            title: 'KTO JEST DŁUŻNIKIEM?',
            icon: '👤',
            order: 1,
            questions: [
                {
                    id: 'entity_type',
                    label: 'Rodzaj dłużnika',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'entrepreneur', label: 'Przedsiębiorca (osoba fizyczna)' },
                        { value: 'sp_zoo', label: 'Spółka z o.o.' },
                        { value: 'sp_akcyjna', label: 'Spółka Akcyjna' },
                        { value: 'prosta_sa', label: 'Prosta Spółka Akcyjna' },
                        { value: 'partner', label: 'Wspólnik spółki osobowej' },
                        { value: 'consumer', label: 'Konsument (upadłość konsumencka)' }
                    ],
                    help: 'Zdolność upadłościową mają wszyscy przedsiębiorcy oraz podmioty wymienione w Prawie upadłościowym'
                },
                {
                    id: 'company_name',
                    label: 'Nazwa firmy / Imię i nazwisko',
                    type: 'text',
                    required: false
                },
                {
                    id: 'nip',
                    label: 'NIP',
                    type: 'text',
                    pattern: '[0-9]{10}',
                    required: false,
                    showIf: ['entrepreneur', 'sp_zoo', 'sp_akcyjna', 'prosta_sa', 'partner']
                },
                {
                    id: 'regon',
                    label: 'REGON',
                    type: 'text',
                    required: false,
                    showIf: ['entrepreneur', 'sp_zoo', 'sp_akcyjna', 'prosta_sa', 'partner']
                },
                {
                    id: 'krs',
                    label: 'KRS (jeśli dotyczy)',
                    type: 'text',
                    required: false,
                    showIf: ['sp_zoo', 'sp_akcyjna', 'prosta_sa']
                },
                {
                    id: 'pesel',
                    label: 'PESEL (dla osób fizycznych)',
                    type: 'text',
                    pattern: '[0-9]{11}',
                    showIf: ['entrepreneur', 'consumer']
                },
                {
                    id: 'main_activity_center',
                    label: '📍 Główny ośrodek działalności (adres)',
                    type: 'textarea',
                    required: false,
                    help: '⚠️ KLUCZOWE! To tutaj będzie właściwy sąd upadłościowy (Sąd Rejonowy - Wydział Gospodarczy)',
                    placeholder: 'np. ul. Marszałkowska 1, 00-001 Warszawa',
                    showIf: ['entrepreneur', 'sp_zoo', 'sp_akcyjna', 'prosta_sa', 'partner']
                },
                {
                    id: 'residential_address',
                    label: '🏠 Adres zamieszkania',
                    type: 'textarea',
                    required: false,
                    help: 'Adres zameldowania lub faktycznego zamieszkania - właściwy sąd upadłościowy',
                    placeholder: 'np. ul. Kwiatowa 5/10, 00-001 Warszawa',
                    showIf: ['consumer']
                }
            ]
        },
        {
            id: 'insolvency',
            title: 'NIEWYPŁACALNOŚĆ',
            icon: '💰',
            order: 2,
            questions: [
                {
                    id: 'payment_delay',
                    label: 'Czy opóźnienie w płatnościach przekracza 3 miesiące?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: 'Tak - opóźnienie > 3 miesiące' },
                        { value: 'no', label: 'Nie' }
                    ],
                    help: '⚖️ PRAWO: Domniemanie niewypłacalności gdy opóźnienie > 3 miesiące'
                },
                {
                    id: 'total_debt',
                    label: '💵 Suma wymagalnych zobowiązań pieniężnych (PLN)',
                    type: 'number',
                    required: false,
                    min: 0,
                    help: 'Wszystkie długi, które są już wymagalne'
                },
                {
                    id: 'total_assets',
                    label: '🏦 Wartość majątku dłużnika (PLN)',
                    type: 'number',
                    required: false,
                    min: 0,
                    help: 'Całkowita wartość majątku firmy/osoby'
                },
                {
                    id: 'debt_over_assets_24m',
                    label: 'Czy zobowiązania > majątek przez ponad 24 miesiące?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' },
                        { value: 'na', label: 'Nie dotyczy (osoba fizyczna)' }
                    ],
                    help: '⚖️ PRAWO: Dla osób prawnych - domniemanie niewypłacalności'
                },
                {
                    id: 'insolvency_date',
                    label: '📅 Data powstania niewypłacalności (w przybliżeniu)',
                    type: 'date',
                    required: false,
                    help: '⚠️ OBOWIĄZEK: Wniosek należy złożyć w ciągu 30 dni od daty niewypłacalności!'
                }
            ]
        },
        {
            id: 'creditors',
            title: 'WIERZYCIELE',
            icon: '👥',
            order: 3,
            type: 'repeatable',
            help: 'Lista głównych wierzycieli - będzie potrzebna do wykazu wierzycieli',
            questions: [
                {
                    id: 'creditor_name',
                    label: 'Nazwa wierzyciela',
                    type: 'text',
                    required: false
                },
                {
                    id: 'creditor_website',
                    label: '🌐 Strona internetowa wierzyciela',
                    type: 'text',
                    placeholder: 'np. https://www.bank.pl',
                    help: '💡 Podaj stronę www - automatycznie pobierzemy dane wierzyciela (adres, NIP, telefon)'
                },
                {
                    id: 'creditor_nip',
                    label: 'NIP wierzyciela',
                    type: 'text',
                    pattern: '[0-9]{10}'
                },
                {
                    id: 'creditor_address',
                    label: 'Adres wierzyciela',
                    type: 'textarea',
                    required: false
                },
                {
                    id: 'debt_amount',
                    label: 'Kwota długu (PLN)',
                    type: 'number',
                    required: false,
                    min: 0
                },
                {
                    id: 'debt_type',
                    label: 'Tytuł wierzytelności',
                    type: 'text',
                    placeholder: 'np. faktura nr 123/2024, umowa kredytu'
                },
                {
                    id: 'due_date',
                    label: 'Data wymagalności',
                    type: 'date',
                    required: false
                },
                {
                    id: 'enforcement_title',
                    label: 'Tytuł wykonawczy',
                    type: 'radio',
                    options: [
                        { value: 'yes', label: 'Tak - wierzyciel ma tytuł wykonawczy' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'enforcement_ongoing',
                    label: 'Czy toczy się egzekucja komornicza?',
                    type: 'radio',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'creditor_documents',
                    label: '📎 Dokumenty dotyczące wierzyciela',
                    type: 'file',
                    multiple: true,
                    accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png',
                    help: 'Załącz: wezwanie do zapłaty, umowę, fakturę, wyrok/tytuł wykonawczy'
                }
            ]
        },
        {
            id: 'assets',
            title: 'MAJĄTEK',
            icon: '🏠',
            order: 4,
            help: 'Majątek który wejdzie w skład masy upadłości',
            questions: [
                {
                    id: 'asset_types',
                    label: 'Rodzaje majątku (zaznacz wszystkie):',
                    type: 'checkbox',
                    options: [
                        { value: 'real_estate', label: '🏢 Nieruchomości' },
                        { value: 'fixed_assets', label: '🏭 Środki trwałe (maszyny, sprzęt)' },
                        { value: 'inventory', label: '📦 Zapasy/towary' },
                        { value: 'receivables', label: '💰 Należności od kontrahentów' },
                        { value: 'cash', label: '💵 Środki pieniężne' },
                        { value: 'securities', label: '📊 Udziały/akcje' },
                        { value: 'ip_rights', label: '©️ Prawa autorskie/licencje' },
                        { value: 'vehicles', label: '🚗 Pojazdy' },
                        { value: 'other', label: '📋 Inne' }
                    ]
                },
                {
                    id: 'real_estate_details',
                    label: 'Szczegóły nieruchomości',
                    type: 'textarea',
                    showIf: ['real_estate'],
                    placeholder: 'Adres, księga wieczysta, wartość szacunkowa'
                },
                {
                    id: 'encumbrances',
                    label: 'Czy majątek jest obciążony? (hipoteka, zastaw)',
                    type: 'radio',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'encumbrances_details',
                    label: 'Szczegóły obciążeń',
                    type: 'textarea',
                    showIf: ['yes'],
                    placeholder: 'Rodzaj obciążenia, na czyją rzecz, kwota'
                }
            ]
        },
        {
            id: 'restructuring_history',
            title: 'HISTORIA RESTRUKTURYZACJI',
            icon: '🔄',
            order: 5,
            showIf: ['entrepreneur', 'sp_zoo', 'sp_akcyjna', 'prosta_sa', 'partner'],
            questions: [
                {
                    id: 'restructuring_attempted',
                    label: 'Czy wcześniej próbowano restrukturyzacji?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'restructuring_type',
                    label: 'Rodzaj postępowania restrukturyzacyjnego',
                    type: 'select',
                    showIf: ['yes'],
                    options: [
                        { value: 'accelerated', label: 'Przyspieszone postępowanie układowe' },
                        { value: 'regular', label: 'Zwykłe postępowanie układowe' },
                        { value: 'simplified', label: 'Uproszczone postępowanie' },
                        { value: 'sanction', label: 'Postępowanie sanacyjne' }
                    ]
                },
                {
                    id: 'restructuring_end_date',
                    label: 'Data zakończenia restrukturyzacji',
                    type: 'date',
                    showIf: ['yes']
                },
                {
                    id: 'restructuring_outcome',
                    label: 'Wynik restrukturyzacji',
                    type: 'radio',
                    showIf: ['yes'],
                    options: [
                        { value: 'successful', label: 'Skuteczna - zatwierdzono układ' },
                        { value: 'discontinued', label: 'Umorzono postępowanie' },
                        { value: 'failed', label: 'Zakończono bez układu' }
                    ]
                }
            ]
        },
        {
            id: 'bankruptcy_type',
            title: 'RODZAJ UPADŁOŚCI',
            icon: '⚖️',
            order: 6,
            questions: [
                {
                    id: 'proceeding_type',
                    label: 'Cel postępowania upadłościowego',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'liquidation', label: '🔨 Likwidacja majątku (upadłość likwidacyjna)' },
                        { value: 'arrangement', label: '🤝 Zawarcie układu z wierzycielami (upadłość układowa)' }
                    ],
                    help: `
                        LIKWIDACJA: Sprzedaż całego majątku, zaspokojenie wierzycieli, zakończenie działalności
                        UKŁADOWA: Próba ratowania firmy, spłata długów w ratach/częściowo
                    `
                },
                {
                    id: 'arrangement_proposal',
                    label: 'Propozycja układowa dla wierzycieli',
                    type: 'textarea',
                    showIf: ['arrangement'],
                    placeholder: 'np. Spłata 50% długu w 24 ratach miesięcznych, odroczenie płatności o 6 miesięcy',
                    help: 'Wstępna propozycja - będzie można ją zmienić'
                }
            ]
        },
        {
            id: 'additional_info',
            title: 'INFORMACJE DODATKOWE',
            icon: '📝',
            order: 7,
            questions: [
                {
                    id: 'payment_system',
                    label: 'Czy dłużnik jest uczestnikiem systemu płatności?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ],
                    help: 'Np. system płatności kartami, systemy rozliczeniowe'
                },
                {
                    id: 'public_company',
                    label: 'Czy dłużnik jest spółką publiczną?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: 'Tak (notowana na giełdzie)' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'ongoing_enforcement',
                    label: 'Czy toczy się egzekucja komornicza?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'enforcement_details',
                    label: 'Szczegóły egzekucji',
                    type: 'textarea',
                    showIf: ['yes'],
                    placeholder: 'Komornik, sygn. sprawy, kwota egzekucji'
                },
                {
                    id: 'employees_count',
                    label: '👥 Liczba pracowników',
                    type: 'number',
                    min: 0,
                    help: 'Aktualna liczba zatrudnionych osób'
                },
                {
                    id: 'additional_notes',
                    label: '📋 Dodatkowe uwagi / okoliczności sprawy',
                    type: 'textarea',
                    rows: 5,
                    placeholder: 'Wszelkie dodatkowe informacje, które mogą być istotne...'
                }
            ]
        },
        {
            id: 'employment',
            title: 'ZATRUDNIENIE I ZUS',
            icon: '👥',
            order: 8,
            showIf: ['entrepreneur', 'sp_zoo', 'sp_akcyjna', 'prosta_sa', 'partner'],
            questions: [
                {
                    id: 'has_employees',
                    label: 'Czy zatrudniasz pracowników?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'employee_count',
                    label: 'Liczba zatrudnionych osób',
                    type: 'number',
                    min: 1,
                    showIf: ['yes'],
                    help: 'Łącznie wszystkie osoby na umowach (etat, zlecenie, B2B)'
                },
                {
                    id: 'zus_arrears',
                    label: '⚠️ Czy są zaległości w ZUS?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: 'Tak, są zaległości' },
                        { value: 'no', label: 'Nie ma zaległości' }
                    ]
                },
                {
                    id: 'zus_arrears_amount',
                    label: 'Wysokość zaległości w ZUS (PLN)',
                    type: 'number',
                    min: 0,
                    showIf: ['yes']
                },
                {
                    id: 'salary_arrears',
                    label: '⚠️ Czy są zaległości w wypłatach wynagrodzeń?',
                    type: 'radio',
                    required: false,
                    showIf: ['yes'],
                    options: [
                        { value: 'yes', label: 'Tak, są zaległości' },
                        { value: 'no', label: 'Nie ma zaległości' }
                    ]
                },
                {
                    id: 'business_start_date',
                    label: 'Kiedy rozpoczęto działalność gospodarczą?',
                    type: 'date',
                    help: 'Data wpisu do CEIDG lub KRS'
                },
                {
                    id: 'business_profile',
                    label: 'Główny profil działalności',
                    type: 'textarea',
                    rows: 3,
                    placeholder: 'np. Handel detaliczny, usługi IT, budownictwo...'
                },
                {
                    id: 'what_went_wrong',
                    label: '💬 Co doprowadziło do problemów finansowych firmy?',
                    type: 'textarea',
                    rows: 6,
                    placeholder: 'Opisz szczerze sytuację: utrata klientów, pandemia, zatory płatnicze, błędne decyzje biznesowe...',
                    audioRecording: true
                },
                {
                    id: 'rescue_attempts',
                    label: 'Czy próbowano ratować firmę?',
                    type: 'textarea',
                    rows: 4,
                    placeholder: 'Opisz podjęte działania: kredyty, pożyczki, restrukturyzacja, cięcie kosztów...'
                }
            ]
        },
        {
            id: 'personal_situation',
            title: 'TWOJA SYTUACJA OSOBISTA',
            icon: '💭',
            order: 2,
            showIf: ['consumer'],
            questions: [
                {
                    id: 'marital_status',
                    label: 'Stan cywilny',
                    type: 'select',
                    required: false,
                    options: [
                        { value: 'single', label: 'Wolny/a' },
                        { value: 'married', label: 'Żonaty/Zamężna' },
                        { value: 'divorced', label: 'Rozwiedziony/a' },
                        { value: 'widowed', label: 'Wdowiec/Wdowa' },
                        { value: 'separated', label: 'W separacji' }
                    ]
                },
                {
                    id: 'dependents',
                    label: 'Liczba osób na utrzymaniu (dzieci, rodzice)',
                    type: 'number',
                    min: 0,
                    required: false
                },
                {
                    id: 'monthly_income',
                    label: '💵 Miesięczny dochód netto (PLN)',
                    type: 'number',
                    min: 0,
                    required: false,
                    help: 'Suma wszystkich dochodów (pensja, zasiłki, alimenty, renta)'
                },
                {
                    id: 'monthly_expenses',
                    label: '💸 Miesięczne wydatki (PLN)',
                    type: 'number',
                    min: 0,
                    required: false,
                    help: 'Mieszkanie, jedzenie, opłaty, transport, leki, dzieci'
                },
                {
                    id: 'owns_property',
                    label: 'Czy posiadasz mieszkanie/dom?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie (wynajmuję/mieszkam z rodziną)' }
                    ]
                },
                {
                    id: 'property_mortgage',
                    label: 'Czy nieruchomość jest obciążona kredytem hipotecznym?',
                    type: 'radio',
                    showIf: ['yes'],
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'owns_car',
                    label: 'Czy posiadasz samochód?',
                    type: 'radio',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'how_it_happened',
                    label: '💬 Jak doszło do zadłużenia? Opowiedz swoimi słowami',
                    type: 'textarea',
                    rows: 8,
                    required: false,
                    placeholder: 'Opisz szczerze swoją sytuację: co się stało, kiedy zaczęły się problemy, co próbowałeś zrobić... To bardzo pomoże w przygotowaniu sprawy.',
                    audioRecording: true
                },
                {
                    id: 'current_employment',
                    label: 'Czy obecnie pracujesz?',
                    type: 'radio',
                    required: false,
                    options: [
                        { value: 'yes', label: 'Tak, pracuję' },
                        { value: 'no', label: 'Nie, jestem bezrobotny/a' },
                        { value: 'retirement', label: 'Jestem na emeryturze/rencie' }
                    ]
                },
                {
                    id: 'current_job_title',
                    label: 'Twoje stanowisko/zawód',
                    type: 'text',
                    showIf: ['yes'],
                    placeholder: 'np. sprzedawca, kierowca, księgowa'
                },
                {
                    id: 'years_worked_total',
                    label: 'Ile lat w sumie pracowałeś/aś w życiu?',
                    type: 'number',
                    min: 0,
                    max: 60,
                    help: 'Pomaga zrozumieć Twoją sytuację życiową i stabilność zawodową'
                },
                {
                    id: 'years_current_employer',
                    label: 'Ile lat pracujesz u obecnego pracodawcy?',
                    type: 'number',
                    min: 0,
                    showIf: ['yes']
                },
                {
                    id: 'job_stability',
                    label: 'Jak oceniasz stabilność swojego zatrudnienia?',
                    type: 'radio',
                    showIf: ['yes'],
                    options: [
                        { value: 'stable', label: 'Stabilne - umowa na czas nieokreślony' },
                        { value: 'temporary', label: 'Czasowe - umowa na czas określony' },
                        { value: 'uncertain', label: 'Niepewne - umowy zlecenia/dzieło' },
                        { value: 'seasonal', label: 'Sezonowe' }
                    ]
                },
                {
                    id: 'job_loss',
                    label: 'Czy w przeszłości utraciłeś/aś pracę?',
                    type: 'radio',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'job_loss_when',
                    label: 'Kiedy utraciłeś/aś pracę?',
                    type: 'date',
                    showIf: ['yes']
                },
                {
                    id: 'job_loss_reason',
                    label: 'Z jakiego powodu straciłeś/aś pracę?',
                    type: 'textarea',
                    rows: 3,
                    showIf: ['yes'],
                    placeholder: 'np. likwidacja stanowiska, zwolnienie grupowe, pandemia, problemy zdrowotne'
                },
                {
                    id: 'illness',
                    label: 'Czy choroba (Twoja lub w rodzinie) wpłynęła na zadłużenie?',
                    type: 'radio',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                },
                {
                    id: 'illness_details',
                    label: 'Opisz sytuację zdrowotną',
                    type: 'textarea',
                    rows: 3,
                    showIf: ['yes'],
                    placeholder: 'Koszty leczenia, utrata zdolności do pracy, opieka nad chorym członkiem rodziny...'
                },
                {
                    id: 'divorce_impact',
                    label: 'Czy rozwód/separacja wpłynęły na zadłużenie?',
                    type: 'radio',
                    options: [
                        { value: 'yes', label: 'Tak' },
                        { value: 'no', label: 'Nie' }
                    ]
                }
            ]
        }
    ],

    // PROCEDURA UPADŁOŚCIOWA - TIMELINE
    procedure: {
        title: 'PROCEDURA UPADŁOŚCIOWA - TIMELINE',
        phases: [
            {
                phase: 1,
                name: 'PRZYGOTOWANIE WNIOSKU',
                duration: '7-14 dni',
                icon: '📝',
                tasks: [
                    {
                        id: 'gather_documents',
                        name: 'Zebranie dokumentacji',
                        deadline_days: 7,
                        checklist: [
                            'Wykaz majątku',
                            'Wykaz wierzycieli i ich wierzytelności',
                            'Wykaz ksiąg i dokumentów',
                            'Ostatni bilans lub sprawozdanie finansowe',
                            'Zaświadczenie o numerze PESEL/REGON/KRS',
                            'Oświadczenie o stanie majątkowym',
                            'Dokumenty potwierdzające niewypłacalność'
                        ]
                    },
                    {
                        id: 'prepare_application',
                        name: 'Sporządzenie wniosku o ogłoszenie upadłości',
                        deadline_days: 10,
                        auto_generate: true,
                        help: 'System wygeneruje wzór wniosku na podstawie ankiety'
                    },
                    {
                        id: 'court_fee',
                        name: 'Opłata sądowa - 1000 zł',
                        deadline_days: 14,
                        amount: 1000,
                        currency: 'PLN'
                    }
                ]
            },
            {
                phase: 2,
                name: 'ZŁOŻENIE WNIOSKU',
                duration: '1 dzień',
                icon: '📨',
                tasks: [
                    {
                        id: 'file_application',
                        name: 'Złożenie wniosku do sądu upadłościowego',
                        deadline_days: 30,
                        critical: true,
                        help: '⚠️ TERMIN USTAWOWY: 30 dni od daty niewypłacalności!',
                        auto_court: true
                    },
                    {
                        id: 'receipt_confirmation',
                        name: 'Potwierdzenie wpływu wniosku',
                        deadline_days: 1
                    }
                ]
            },
            {
                phase: 3,
                name: 'POSTĘPOWANIE ZABEZPIECZAJĄCE',
                duration: '3-7 dni',
                icon: '🔒',
                tasks: [
                    {
                        id: 'preliminary_ruling',
                        name: 'Postanowienie wstępne sądu',
                        help: 'Sąd może zarządzić zabezpieczenie majątku'
                    },
                    {
                        id: 'temporary_administrator',
                        name: 'Ustanowienie tymczasowego nadzorcy sądowego',
                        help: 'Opcjonalnie - dla ochrony majątku'
                    }
                ]
            },
            {
                phase: 4,
                name: 'ROZPOZNANIE WNIOSKU',
                duration: '2-4 miesiące',
                icon: '⚖️',
                tasks: [
                    {
                        id: 'court_hearing',
                        name: 'Rozprawa / posiedzenie sądu',
                        help: 'Sąd bada czy spełnione są przesłanki upadłości'
                    },
                    {
                        id: 'creditors_notification',
                        name: 'Zawiadomienie wierzycieli',
                        help: 'Wierzyciele mogą zgłaszać uwagi'
                    },
                    {
                        id: 'bankruptcy_ruling',
                        name: 'Postanowienie o ogłoszeniu upadłości',
                        critical: true,
                        help: 'Sąd orzeka o ogłoszeniu upadłości lub oddala wniosek'
                    }
                ]
            },
            {
                phase: 5,
                name: 'OGŁOSZENIE UPADŁOŚCI',
                duration: '1 dzień',
                icon: '📢',
                tasks: [
                    {
                        id: 'announcement',
                        name: 'Ogłoszenie w Monitorze Sądowym i Gospodarczym',
                        help: 'Publiczne ogłoszenie upadłości'
                    },
                    {
                        id: 'trustee_appointment',
                        name: 'Ustanowienie syndyka masy upadłości',
                        critical: true,
                        help: '⚠️ KLUCZOWE: Od tej chwili syndyk zarządza majątkiem!',
                        has_contact: true
                    },
                    {
                        id: 'loss_of_management',
                        name: 'Utrata prawa zarządu majątkiem',
                        help: 'Dłużnik traci prawo do zarządzania swoim majątkiem'
                    }
                ]
            },
            {
                phase: 6,
                name: 'POSTĘPOWANIE UPADŁOŚCIOWE',
                duration: '6-24 miesiące',
                icon: '📊',
                tasks: [
                    {
                        id: 'handover_assets',
                        name: 'Przekazanie majątku syndykowi',
                        deadline_days: 7,
                        help: 'Wydanie majątku, ksiąg, dokumentów'
                    },
                    {
                        id: 'creditors_list',
                        name: 'Sporządzenie listy wierzycieli',
                        deadline_days: 30
                    },
                    {
                        id: 'creditors_assembly',
                        name: 'Zgromadzenie wierzycieli',
                        help: 'Wierzyciele głosują nad sposobem prowadzenia upadłości'
                    },
                    {
                        id: 'asset_valuation',
                        name: 'Inwentaryzacja i wycena majątku',
                        help: 'Syndyk spisuje i wycenia majątek'
                    },
                    {
                        id: 'arrangement_vote',
                        name: 'Głosowanie nad układem (jeśli dotyczy)',
                        showIf: 'arrangement',
                        help: 'Tylko w upadłości układowej'
                    }
                ]
            },
            {
                phase: 7,
                name: 'LIKWIDACJA / UKŁAD',
                duration: '12-36 miesięcy',
                icon: '🔨',
                tasks: [
                    {
                        id: 'asset_sale',
                        name: 'Sprzedaż majątku (likwidacja)',
                        showIf: 'liquidation',
                        help: 'Syndyk sprzedaje majątek na licytacjach'
                    },
                    {
                        id: 'arrangement_execution',
                        name: 'Realizacja układu (układowa)',
                        showIf: 'arrangement',
                        help: 'Wykonywanie postanowień układu'
                    },
                    {
                        id: 'creditors_satisfaction',
                        name: 'Zaspokojenie wierzycieli',
                        help: 'Wypłata środków wierzycielom według kolejności'
                    }
                ]
            },
            {
                phase: 8,
                name: 'ZAKOŃCZENIE POSTĘPOWANIA',
                duration: '1-3 miesiące',
                icon: '✅',
                tasks: [
                    {
                        id: 'final_report',
                        name: 'Sprawozdanie końcowe syndyka',
                        help: 'Syndyk składa sprawozdanie z przeprowadzonej likwidacji'
                    },
                    {
                        id: 'closing_hearing',
                        name: 'Rozprawa zamknięcia',
                        help: 'Sąd rozpoznaje sprawozdanie'
                    },
                    {
                        id: 'closure_ruling',
                        name: 'Postanowienie o zakończeniu postępowania',
                        critical: true,
                        help: 'Sąd zamyka postępowanie upadłościowe'
                    },
                    {
                        id: 'deletion_from_register',
                        name: 'Wykreślenie z rejestru (jeśli dotyczy)',
                        help: 'Firma zostaje wykreślona z KRS'
                    }
                ]
            },
            {
                phase: 9,
                name: 'ROZLICZENIA KOŃCOWE',
                duration: '1-2 miesiące',
                icon: '💰',
                tasks: [
                    {
                        id: 'final_distribution',
                        name: 'Ostateczny podział funduszy masy upadłości',
                        critical: true,
                        help: 'Ostateczne rozliczenie i wypłata dla wierzycieli według kolejności'
                    },
                    {
                        id: 'trustee_final_payment',
                        name: 'Wypłata wynagrodzenia syndyka',
                        help: 'Syndyk otrzymuje wynagrodzenie za przeprowadzenie postępowania'
                    },
                    {
                        id: 'unclaimed_funds',
                        name: 'Rozliczenie nieodebranych kwot',
                        help: 'Środki nieodebrane przez wierzycieli trafiają do depozytu sądowego'
                    },
                    {
                        id: 'final_accounting',
                        name: 'Zatwierdzenie ostatecznego sprawozdania finansowego',
                        help: 'Sąd zatwierdza końcowe rozliczenia finansowe'
                    }
                ]
            },
            {
                phase: 10,
                name: 'SKUTKI PRAWNE I REHABILITACJA',
                duration: '5-10 lat',
                icon: '🔄',
                tasks: [
                    {
                        id: 'debt_discharge',
                        name: 'Umorzenie pozostałych długów',
                        critical: true,
                        help: 'Długi niezaspokojone w postępowaniu zostają umorzone (z wyjątkami)'
                    },
                    {
                        id: 'business_restrictions',
                        name: 'Ograniczenia w prowadzeniu działalności',
                        deadline_days: 1825,
                        help: 'Zakaz prowadzenia działalności gospodarczej przez okres 3-10 lat (zależnie od przyczyn upadłości)'
                    },
                    {
                        id: 'credit_bureau_entry',
                        name: 'Wpis w rejestrach kredytowych (BIG, BIK)',
                        help: 'Informacja o upadłości pozostaje w bazach przez 5-10 lat'
                    },
                    {
                        id: 'rehabilitation',
                        name: 'Możliwość rehabilitacji ekonomicznej',
                        help: 'Po zakończeniu okresu ograniczeń możliwość ponownego prowadzenia działalności'
                    },
                    {
                        id: 'new_start',
                        name: 'Nowy start bez długów',
                        help: '🎉 Po zakończeniu okresu karencji - życie bez przeszłych zobowiązań!'
                    }
                ]
            }
        ]
    },
    
    // PROCEDURA UPADŁOŚCI KONSUMENCKIEJ - Uproszczona
    procedure_consumer: {
        title: 'PROCEDURA UPADŁOŚCI KONSUMENCKIEJ',
        phases: [
            {
                phase: 1,
                name: 'PRZYGOTOWANIE WNIOSKU',
                duration: '7-14 dni',
                icon: '📝',
                description: 'Na tym etapie zbierasz wszystkie niezbędne dokumenty i przygotowujesz wniosek. Możesz to zrobić sam lub z pomocą doradcy. Ważne, żeby dokładnie opisać swoją sytuację finansową i życiową - to pomoże sądowi podjąć decyzję.',
                tasks: [
                    {
                        name: 'Zebranie dokumentacji',
                        deadline_days: 7,
                        description: 'Zbierz wszystkie dokumenty dotyczące Twoich długów i majątku. Im więcej dowodów tym lepiej. Jeśli czegoś nie masz - zaznacz w ankiecie "potrzebuję pomocy doradcy".',
                        checklist: [
                            'Wykaz majątku (mieszkanie, samochód, oszczędności)',
                            'Wykaz wierzycieli (banki, pożyczki, karty kredytowe, firmy pożyczkowe)',
                            'Zaświadczenie o dochodach (jeśli pracujesz) lub decyzja o zasiłku/rencie',
                            'Dokumenty potwierdzające zadłużenie (wezwania do zapłaty, wyroki)',
                            'Zaświadczenie o numerze PESEL (można wydrukować z internetu)'
                        ]
                    },
                    {
                        name: 'Sporządzenie wniosku o ogłoszenie upadłości konsumenckiej',
                        deadline_days: 10,
                        description: 'Wniosek wypełnisz na podstawie tej ankiety. Nasz system automatycznie wygeneruje gotowy dokument, który wydrukujesz i podpiszesz. We wniosku opiszesz swoją sytuację, wyjaśnisz dlaczego nie jesteś w stanie spłacić długów.'
                    },
                    {
                        name: 'Opłata sądowa: 30 zł',
                        critical: true,
                        description: 'Opłata sądowa dla konsumenta to tylko 30 złotych (firmy płacą 1000 zł). Wpłacasz na konto sądu i dołączasz potwierdzenie do wniosku. Jeśli nie masz nawet 30 zł - możesz wnioskować o zwolnienie z opłat.'
                    }
                ]
            },
            {
                phase: 2,
                name: 'ZŁOŻENIE WNIOSKU',
                duration: '1-2 dni',
                icon: '📮',
                tasks: [
                    {
                        name: 'Złożenie wniosku do sądu rejonowego',
                        critical: true,
                        help: 'Właściwy sąd według miejsca zamieszkania'
                    }
                ]
            },
            {
                phase: 3,
                name: 'ROZPOZNANIE WNIOSKU',
                duration: '2-4 miesiące',
                icon: '⚖️',
                tasks: [
                    {
                        name: 'Sąd bada czy spełniasz warunki',
                        help: 'Czy jesteś niewypłacalny, czy działałeś w dobrej wierze'
                    },
                    {
                        name: 'Możliwe wezwanie na rozprawę',
                        help: 'Sąd może chcieć Cię przesłuchać'
                    }
                ]
            },
            {
                phase: 4,
                name: 'OGŁOSZENIE UPADŁOŚCI',
                duration: '1 dzień',
                icon: '📢',
                tasks: [
                    {
                        name: 'Postanowienie o ogłoszeniu upadłości konsumenckiej',
                        critical: true
                    },
                    {
                        name: 'Ustanowienie syndyka (lub zarządcy)',
                        help: 'Nie zawsze jest syndyk - czasami tylko zarządca'
                    }
                ]
            },
            {
                phase: 5,
                name: 'PLAN SPŁATY',
                duration: '3-7 lat',
                icon: '💰',
                tasks: [
                    {
                        name: 'Ustalenie planu spłaty wierzycieli',
                        critical: true,
                        help: 'Zazwyczaj spłata z pensji przez 3-7 lat'
                    },
                    {
                        name: 'Miesięczne raty do syndyka/zarządcy',
                        help: 'Najczęściej 20-50% dochodu po odliczeniu minimum życiowego'
                    },
                    {
                        name: 'Zakaz zaciągania nowych zobowiązań',
                        critical: true,
                        help: '⚠️ Przez cały okres spłaty!'
                    }
                ]
            },
            {
                phase: 6,
                name: 'ZAKOŃCZENIE I UMORZENIE',
                duration: '1-3 miesiące',
                icon: '✅',
                tasks: [
                    {
                        name: 'Zakończenie planu spłaty',
                        help: 'Po 3-7 latach systematycznej spłaty'
                    },
                    {
                        name: 'Umorzenie pozostałych długów',
                        critical: true,
                        help: '🎉 Reszta długów zostaje umorzona!'
                    },
                    {
                        name: 'Czysta historia kredytowa',
                        help: 'Po 5 latach wpis znika z BIG/BIK'
                    }
                ]
            }
        ]
    },

    // SYNDYK - DANE KONTAKTOWE
    trusteeFields: {
        title: 'SYNDYK MASY UPADŁOŚCI',
        help: 'Syndyka ustanawia sąd - dane zostaną uzupełnione po ogłoszeniu upadłości',
        fields: [
            {
                id: 'trustee_name',
                label: 'Imię i nazwisko syndyka',
                type: 'text'
            },
            {
                id: 'trustee_license',
                label: 'Numer licencji',
                type: 'text'
            },
            {
                id: 'trustee_phone',
                label: 'Telefon',
                type: 'tel',
                pattern: '[0-9]{9,12}'
            },
            {
                id: 'trustee_email',
                label: 'Email',
                type: 'email'
            },
            {
                id: 'trustee_address',
                label: 'Adres kancelarii',
                type: 'textarea'
            },
            {
                id: 'trustee_appointment_date',
                label: 'Data ustanowienia',
                type: 'date'
            },
            {
                id: 'trustee_notes',
                label: 'Notatki kontaktu',
                type: 'textarea',
                placeholder: 'Historia kontaktu, ustalenia...'
            }
        ]
    },

    // DOKUMENTY DO ZAŁĄCZENIA - rozbudowane z wzorami
    // Logika: Najpierw dokumenty pomocnicze, na końcu główny wniosek
    requiredDocuments: [
        {
            id: 'asset_list',
            name: '📋 Wykaz majątku dłużnika',
            required: true,
            canUpload: true,
            canGenerate: true,
            description: 'Szczegółowa lista całego majątku: nieruchomości, samochody, oszczędności, udziały w firmach, przedmioty wartościowe.',
            template: 'ASSET_LIST_TEMPLATE',
            howTo: [
                '1. Wymień WSZYSTKIE składniki majątku',
                '2. Podaj wartość szacunkową (możesz użyć cen rynkowych)',
                '3. Wskaż czy majątek jest obciążony (hipoteka, leasing)',
                '4. Mieszkanie: podaj adres, metraż, księgę wieczystą',
                '5. Samochód: marka, model, rok, nr rejestracyjny, wartość',
                '6. Konta bankowe: nazwa banku, numer konta, saldo',
                '7. Jeśli nie masz majątku - napisz: "Dłużnik nie posiada majątku"'
            ],
            example: 'Przykład:\n1. Mieszkanie: ul. Kwiatowa 5/10, Warszawa, 45m², KW WA1X/123456/7, wartość: 350 000 zł, obciążone hipoteką na rzecz Bank PKO BP\n2. Samochód: Toyota Corolla 2015, nr rej. WW12345, wartość: 25 000 zł\n3. Konto bankowe: mBank, nr: 12 3456 7890 1234 5678 9012 3456, saldo: 150 zł'
        },
        {
            id: 'creditors_list',
            name: '👥 Wykaz wierzycieli',
            required: true,
            canUpload: true,
            canGenerate: true,
            description: 'Lista wszystkich wierzycieli z kwotami długów, tytułami wierzytelności i datami wymagalności.',
            template: 'CREDITORS_LIST_TEMPLATE',
            howTo: [
                '1. Wymień WSZYSTKICH wierzycieli - nawet małe długi',
                '2. Podaj pełne dane: nazwa, adres, NIP (jeśli firma)',
                '3. Tytuł wierzytelności: umowa kredytu nr..., faktura nr...',
                '4. Kwota długu: podaj stan na dzień składania wniosku',
                '5. Data wymagalności: kiedy dług miał być spłacony',
                '6. Tytuł wykonawczy: czy wierzyciel ma wyrok/nakaz zapłaty',
                '7. Uporządkuj alfabetycznie lub według wysokości długu'
            ],
            example: 'Przykład:\n1. Bank PKO BP S.A., Al. Niepodległości 1, Warszawa, NIP: 5252222222\n   Tytuł: Umowa kredytu nr 123/2020\n   Kwota: 150 000 zł\n   Data wymagalności: 01.01.2023\n   Tytuł wykonawczy: TAK - wyrok Sądu Okręgowego sygn. I C 123/2023'
        },
        {
            id: 'income_statement',
            name: '💰 Oświadczenie o dochodach',
            required: true,
            canUpload: true,
            description: 'Dla konsumenta: zaświadczenie o dochodach lub oświadczenie o ich braku. Dla firmy: sprawozdanie finansowe.',
            howTo: [
                'KONSUMENT:',
                '• Jeśli pracujesz: zaświadczenie od pracodawcy o zarobkach (ostatnie 3 miesiące)',
                '• Jeśli na zasiłku: decyzja z urzędu pracy',
                '• Jeśli na rencie/emeryturze: decyzja ZUS',
                '• Jeśli bez dochodu: napisz oświadczenie "Nie osiągam żadnych dochodów"',
                '',
                'FIRMA:',
                '• Bilans za ostatni rok obrotowy',
                '• Rachunek zysków i strat',
                '• Zestawienie obrotów i sald (jeśli prowadziłeś księgowość)'
            ]
        },
        {
            id: 'insolvency_proof',
            name: '📮 Dokumenty potwierdzające niewypłacalność',
            required: true,
            canUpload: true,
            description: 'Dowody że nie jesteś w stanie spłacać długów: wezwania do zapłaty, wyroki, postanowienia komornika.',
            howTo: [
                '1. Zbierz WSZYSTKIE wezwania do zapłaty od wierzycieli',
                '2. Dołącz wyroki sądowe, nakazy zapłaty, tytuły wykonawcze',
                '3. Dokumenty z postępowań komorniczych (zawiadomienia, zajęcia)',
                '4. Wyciągi bankowe pokazujące brak środków',
                '5. Korespondencję z wierzycielami (próby ugody, odmowy)',
                '6. Im więcej dokumentów - tym lepiej dla sprawy',
                '7. Jeśli nie masz dokumentów - opisz sytuację w oświadczeniu'
            ]
        },
        {
            id: 'pesel_certificate',
            name: '🆔 Zaświadczenie o numerze PESEL',
            required: true,
            canUpload: true,
            description: 'Dla konsumenta: zaświadczenie o nadaniu numeru PESEL (można wydrukować z internetu)',
            howTo: [
                '1. Wejdź na stronę: obywatel.gov.pl',
                '2. Zaloguj się przez Profil Zaufany lub mObywatel',
                '3. Wybierz: "Zaświadczenie o nadaniu numeru PESEL"',
                '4. Pobierz PDF i wydrukuj',
                '5. Alternatywnie: możesz pójść do Urzędu Miasta (dowód osobisty wystarczy)'
            ]
        },
        {
            id: 'company_registration',
            name: '🏢 Wypis z KRS lub CEiDG',
            required: false,
            canUpload: true,
            showIf: ['entrepreneur', 'sp_zoo', 'sp_akcyjna', 'prosta_sa', 'partner'],
            description: 'Dla firm: aktualny wypis z Krajowego Rejestru Sądowego lub Centralnej Ewidencji i Informacji o Działalności Gospodarczej',
            howTo: [
                'SPÓŁKI (Sp. z o.o., S.A.):',
                '• Wejdź na: ekrs.ms.gov.pl',
                '• Wyszukaj swoją firmę (NIP lub nazwa)',
                '• Pobierz "Odpis aktualny" (płatny, ok. 20 zł)',
                '• Wypis nie może być starszy niż 3 miesiące',
                '',
                'JDG (Jednoosobowa Działalność):',
                '• Wejdź na: prod.ceidg.gov.pl',
                '• Wpisz swój NIP',
                '• Pobierz "Zaświadczenie o wpisie do CEIDG" (BEZPŁATNE)',
                '• Wydrukuj PDF'
            ]
        },
        {
            id: 'court_fee_proof',
            name: '💳 Dowód opłaty sądowej',
            required: true,
            canUpload: true,
            description: 'Potwierdzenie przelewu opłaty sądowej: 30 zł dla konsumenta, 1000 zł dla firmy',
            howTo: [
                '1. Sprawdź właściwy sąd (według miejsca zamieszkania/siedziby)',
                '2. Znajdź numer konta sądu na stronie internetowej sądu',
                '3. Tytuł przelewu: "Opłata sądowa - wniosek o ogłoszenie upadłości"',
                '4. KONSUMENT: 30 zł',
                '5. FIRMA: 1000 zł',
                '6. Jeśli nie masz pieniędzy - możesz wnioskować o zwolnienie z opłat',
                '7. Wydrukuj potwierdzenie przelewu z banku'
            ],
            example: 'Dane do przelewu (przykład - Sąd Rejonowy dla Warszawy-Śródmieścia):\nOdbiorca: Sąd Rejonowy dla m.st. Warszawy\nNr konta: 07 1010 1010 0123 4567 8901 2345\nTytuł: Opłata sądowa - wniosek o ogłoszenie upadłości\nKwota: 30 zł (konsument) lub 1000 zł (firma)'
        },
        {
            id: 'power_of_attorney',
            name: '📝 Pełnomocnictwo (jeśli działasz przez pełnomocnika)',
            required: false,
            canUpload: true,
            description: 'Jeśli wniosek składa pełnomocnik (adwokat/radca prawny) - potrzebne pełnomocnictwo procesowe',
            howTo: [
                '1. Pełnomocnictwo musi być na formularzu lub w formie zwykłej',
                '2. Treść: "Udzielam pełnomocnictwa [imię nazwisko mecenasa] do reprezentowania mnie w postępowaniu upadłościowym"',
                '3. Podpis mocodawcy (Twój podpis)',
                '4. Jeśli firma - pieczęć firmowa',
                '5. Nie wymaga notariusza (chyba że sąd zażąda)'
            ]
        },
        {
            id: 'marriage_certificate',
            name: '💑 Akt małżeństwa / intercyza',
            required: false,
            canUpload: true,
            showIf: ['consumer'],
            description: 'Jeśli jesteś w związku małżeńskim - akt małżeństwa i intercyza (jeśli była)',
            howTo: [
                '1. Odpis aktu małżeństwa możesz otrzymać w USC',
                '2. Jeśli masz intercyzę (rozdzielność majątkowa) - załącz odpis',
                '3. Akt małżeństwa pokazuje czy długi są wspólne czy osobiste',
                '4. Jeśli nie masz intercyzy - majątek jest wspólny (ważne dla postępowania)'
            ]
        },
        {
            id: 'other_documents',
            name: '📎 Inne dokumenty',
            required: false,
            canUpload: true,
            description: 'Wszelkie inne dokumenty które mogą pomóc w sprawie',
            howTo: [
                'Możesz dołączyć:',
                '• Umowy kredytowe/pożyczkowe',
                '• Korespondencję z bankami',
                '• Dokumentację medyczną (jeśli choroba była przyczyną zadłużenia)',
                '• Świadectwo pracy (jeśli straciłeś pracę)',
                '• Decyzję o zwolnieniu',
                '• Wszystko co pomoże wyjaśnić Twoją sytuację'
            ]
        },
        {
            id: 'bankruptcy_petition',
            name: '📄 WNIOSEK O OGŁOSZENIE UPADŁOŚCI',
            required: true,
            canUpload: true,
            canGenerate: true,
            description: '🎯 GŁÓWNY DOKUMENT - Wniosek do sądu o ogłoszenie upadłości. System wygeneruje go automatycznie na podstawie wszystkich dokumentów powyżej i wypełnionej ankiety.',
            template: 'WNIOSEK_UPADLOSC_TEMPLATE',
            howTo: [
                '⚠️ WAŻNE: Wygeneruj ten dokument NA KOŃCU, gdy masz już wszystkie dokumenty!',
                '',
                '1. Kliknij "✨ Generuj AI" - system automatycznie przygotuje wniosek',
                '2. Sprawdź wszystkie dane (imię, nazwisko, adres, NIP, PESEL)',
                '3. Upewnij się że wykaz wierzycieli jest kompletny',
                '4. Sprawdź czy wykaz majątku zawiera wszystkie składniki',
                '5. Wydrukuj dokument',
                '6. Podpisz własnoręcznie na końcu',
                '7. Dołącz WSZYSTKIE załączniki wymienione we wniosku',
                '8. Złóż w sądzie właściwym dla miejsca zamieszkania/siedziby'
            ],
            example: 'Wniosek zostanie wygenerowany automatycznie i będzie zawierał:\n✓ Dane wnioskodawcy\n✓ Podstawę prawną\n✓ Uzasadnienie niewypłacalności\n✓ Wykaz wierzycieli\n✓ Wykaz majątku\n✓ Oświadczenia\n✓ Podpis\n✓ Listę załączników'
        }
    ]
};

console.log('✅ Bankruptcy Questionnaire loaded:', Object.keys(window.bankruptcyQuestionnaire));

// Helper: Nagrywanie audio
window.bankruptcyQuestionnaire.startRecording = async function(questionId) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('❌ Twoja przeglądarka nie obsługuje nagrywania audio');
        return;
    }
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];
        
        mediaRecorder.addEventListener('dataavailable', event => {
            audioChunks.push(event.data);
        });
        
        mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Zapisz audio
            window.bankruptcyQuestionnaire.savedRecordings = window.bankruptcyQuestionnaire.savedRecordings || {};
            window.bankruptcyQuestionnaire.savedRecordings[questionId] = {
                blob: audioBlob,
                url: audioUrl,
                duration: Date.now() - startTime
            };
            
            // Pokaż player
            const playerDiv = document.getElementById(`audio_${questionId}`);
            if (playerDiv) {
                playerDiv.innerHTML = `
                    <audio controls src="${audioUrl}" style="width: 100%; margin-top: 10px;"></audio>
                    <button onclick="window.bankruptcyQuestionnaire.deleteRecording('${questionId}')" 
                        style="margin-top: 10px; padding: 8px 16px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        🗑️ Usuń nagranie
                    </button>
                `;
            }
            
            stream.getTracks().forEach(track => track.stop());
        });
        
        const startTime = Date.now();
        mediaRecorder.start();
        
        // Zmień przycisk na "Stop"
        const btn = document.getElementById(`record_btn_${questionId}`);
        if (btn) {
            btn.textContent = '⏹️ Stop nagrywania';
            btn.style.background = '#3B82F6';
            btn.onclick = () => mediaRecorder.stop();
        }
        
    } catch (error) {
        console.error('❌ Błąd nagrywania:', error);
        alert('❌ Nie udało się rozpocząć nagrywania');
    }
};

window.bankruptcyQuestionnaire.deleteRecording = function(questionId) {
    if (confirm('Czy na pewno usunąć nagranie?')) {
        delete window.bankruptcyQuestionnaire.savedRecordings[questionId];
        document.getElementById(`audio_${questionId}`).innerHTML = '';
        
        const btn = document.getElementById(`record_btn_${questionId}`);
        if (btn) {
            btn.textContent = '🎤 Nagraj odpowiedź';
            btn.style.background = '#3B82F6';
            btn.onclick = () => window.bankruptcyQuestionnaire.startRecording(questionId);
        }
    }
};
