// 🏢 ANKIETA RESTRUKTURYZACYJNA - Ratowanie Firm
console.log('✅ Ładuję ankietę restrukturyzacyjną...');

window.restructuringQuestionnaire = {
    id: 'restructuring',
    title: 'Ankieta Restrukturyzacyjna',
    description: 'Zbieramy informacje do ratowania Twojej firmy',
    
    sections: [
        {
            id: 'company_data',
            title: 'Dane firmy',
            icon: '🏢',
            help: 'Podstawowe informacje o firmie objętej restrukturyzacją',
            questions: [
                { id: 'company_name', label: 'Pełna nazwa firmy', type: 'text', required: false, placeholder: 'np. ABC Sp. z o.o.' },
                { id: 'legal_form', label: 'Forma prawna', type: 'select', required: false, options: [
                    { value: 'sp_zoo', label: 'Spółka z o.o.' },
                    { value: 'sp_akcyjna', label: 'Spółka akcyjna' },
                    { value: 'sp_komandytowa', label: 'Spółka komandytowa' },
                    { value: 'jdg', label: 'Jednoosobowa działalność' }
                ]},
                { id: 'nip', label: 'NIP', type: 'text', required: false, placeholder: '123-456-78-90' },
                { id: 'regon', label: 'REGON', type: 'text', required: false },
                { id: 'krs', label: 'KRS', type: 'text', required: false },
                { id: 'headquarters_address', label: 'Adres siedziby', type: 'text', required: false },
                { id: 'establishment_date', label: 'Data rozpoczęcia działalności', type: 'date', required: false },
                { id: 'employees_count', label: 'Liczba pracowników', type: 'number', required: false },
                { id: 'annual_revenue', label: 'Roczne przychody (PLN)', type: 'number', required: false }
            ]
        },
        {
            id: 'management',
            title: 'Zarząd i wspólnicy',
            icon: '👔',
            help: 'Osoby zarządzające i właściciele firmy',
            questions: [
                { id: 'board_members', label: 'Członkowie zarządu (imię, nazwisko, PESEL)', type: 'textarea', required: false, placeholder: 'Jan Kowalski, PESEL: 12345678901' },
                { id: 'shareholders', label: 'Wspólnicy/Akcjonariusze', type: 'textarea', required: false, placeholder: 'Jan Kowalski - 70%\nAnna Nowak - 30%' }
            ]
        },
        {
            id: 'financial_situation',
            title: 'Sytuacja finansowa',
            icon: '💰',
            help: 'Aktualna kondycja finansowa firmy',
            questions: [
                { id: 'total_assets', label: 'Wartość aktywów (majątek firmy w PLN)', type: 'number', required: false },
                { id: 'total_liabilities', label: 'Suma zobowiązań (długi w PLN)', type: 'number', required: false },
                { id: 'monthly_revenue', label: 'Miesięczne przychody (średnio w PLN)', type: 'number', required: false },
                { id: 'monthly_costs', label: 'Miesięczne koszty (średnio w PLN)', type: 'number', required: false },
                { id: 'cash_flow', label: 'Czy firma generuje dodatni cash flow?', type: 'radio', required: false, options: [
                    { value: 'yes', label: 'Tak - przychody pokrywają koszty' },
                    { value: 'no', label: 'Nie - koszty wyższe niż przychody' },
                    { value: 'variable', label: 'Zmienne' }
                ]}
            ]
        },
        {
            id: 'creditors',
            title: 'Wierzyciele',
            icon: '👥',
            type: 'repeatable',
            help: 'Lista firm i osób, którym jesteś winien',
            questions: [
                { id: 'creditor_name', label: 'Nazwa wierzyciela', type: 'text', required: false },
                { id: 'creditor_type', label: 'Typ', type: 'select', required: false, options: [
                    { value: 'bank', label: 'Bank' },
                    { value: 'supplier', label: 'Dostawca' },
                    { value: 'tax', label: 'US/ZUS' },
                    { value: 'other', label: 'Inny' }
                ]},
                { id: 'debt_amount', label: 'Kwota długu (PLN)', type: 'number', required: false },
                { id: 'due_date', label: 'Termin płatności', type: 'date', required: false }
            ]
        },
        {
            id: 'restructuring_plan',
            title: 'Plan restrukturyzacji',
            icon: '📊',
            help: 'Jak planujesz ratować firmę?',
            questions: [
                { id: 'restructuring_mode', label: 'Tryb restrukturyzacji', type: 'select', required: false, options: [
                    { value: 'accelerated', label: '⚡ Przyspieszona (3 miesiące)' },
                    { value: 'arrangement', label: '📝 Układ (4-6 miesięcy)' },
                    { value: 'sanacja', label: '🏥 Sanacyjna (6-12 miesięcy)' }
                ]},
                { id: 'business_continuation', label: 'Czy firma kontynuuje działalność?', type: 'radio', required: false, options: [
                    { value: 'yes', label: 'Tak' },
                    { value: 'partial', label: 'Częściowo' },
                    { value: 'no', label: 'Nie' }
                ]},
                { id: 'payment_schedule_duration', label: 'Proponowany okres spłaty', type: 'select', required: false, options: [
                    { value: '12', label: '12 miesięcy' },
                    { value: '24', label: '24 miesiące' },
                    { value: '36', label: '36 miesięcy' },
                    { value: '48', label: '48 miesięcy' }
                ]}
            ]
        },
        {
            id: 'causes',
            title: 'Przyczyny problemów',
            icon: '❓',
            help: 'Co doprowadziło do kryzysu?',
            questions: [
                { id: 'crisis_causes', label: 'Główne przyczyny', type: 'checkbox', required: false, options: [
                    { value: 'pandemic', label: 'Pandemia COVID-19' },
                    { value: 'market_changes', label: 'Zmiany rynkowe' },
                    { value: 'bad_investments', label: 'Nieudane inwestycje' },
                    { value: 'debtor_default', label: 'Niewypłacalność dłużników' }
                ]},
                { id: 'crisis_description', label: 'Opis sytuacji', type: 'textarea', required: false }
            ]
        },
        {
            id: 'advisor_help',
            title: 'Pomoc doradcy',
            icon: '🆘',
            questions: [
                { id: 'additional_info', label: 'Dodatkowe informacje', type: 'textarea', required: false }
            ]
        }
    ],
    
    procedure: {
        title: 'PROCEDURA RESTRUKTURYZACYJNA',
        phases: [
            {
                phase: 1,
                name: 'PRZYGOTOWANIE WNIOSKU',
                duration: '14-30 dni',
                icon: '📝',
                description: 'Przygotowanie dokumentacji i złożenie wniosku o otwarcie postępowania',
                tasks: [
                    { name: 'Analiza sytuacji finansowej', description: 'Szczegółowa analiza bilansu, zobowiązań i perspektyw' },
                    { name: 'Wybór trybu restrukturyzacji', description: 'Przyspieszona, układ czy sanacyjna' },
                    { name: 'Przygotowanie planu', critical: true, description: 'Propozycje spłat, harmonogram, prognozy' },
                    { name: 'Zebranie dokumentacji', description: 'KRS, sprawozdania, wykaz wierzycieli' },
                    { name: 'Złożenie wniosku w sądzie', critical: true, deadline_days: 30 }
                ]
            },
            {
                phase: 2,
                name: 'OTWARCIE POSTĘPOWANIA',
                duration: '7-14 dni',
                icon: '🔓',
                tasks: [
                    { name: 'Rozpatrzenie wniosku przez sąd' },
                    { name: 'Postanowienie o otwarciu', critical: true },
                    { name: 'Ustanowienie nadzorcy sądowego' },
                    { name: 'Ogłoszenie w MSiG' }
                ]
            },
            {
                phase: 3,
                name: 'ZGROMADZENIE WIERZYCIELI',
                duration: '1-2 miesiące',
                icon: '👥',
                tasks: [
                    { name: 'Sporządzenie listy wierzycieli' },
                    { name: 'Przedstawienie planu', critical: true },
                    { name: 'Głosowanie wierzycieli', critical: true, help: 'Potrzebne 50% wartości zobowiązań' },
                    { name: 'Zatwierdzenie układu przez sąd' }
                ]
            },
            {
                phase: 4,
                name: 'REALIZACJA UKŁADU',
                duration: '12-60 miesięcy',
                icon: '⚙️',
                tasks: [
                    { name: 'Wykonywanie postanowień układu', critical: true },
                    { name: 'Nadzór nad wykonaniem' },
                    { name: 'Sprawozdania okresowe' },
                    { name: 'Kontynuacja działalności' }
                ]
            },
            {
                phase: 5,
                name: 'ZAKOŃCZENIE',
                duration: '1-3 miesiące',
                icon: '✅',
                tasks: [
                    { name: 'Wykonanie wszystkich zobowiązań', critical: true },
                    { name: 'Sprawozdanie końcowe nadzorcy' },
                    { name: 'Postanowienie o zakończeniu', critical: true },
                    { name: 'Odzyskanie pełnej kontroli', help: '🎉 Sukces! Firma uratowana!' }
                ]
            }
        ]
    },
    
    requiredDocuments: [
        {
            id: 'financial_statements',
            name: '📊 Sprawozdania finansowe',
            required: true,
            canUpload: true,
            description: 'Bilans, rachunek zysków i strat za ostatnie 3 lata',
            howTo: [
                '1. Bilans za ostatnie 3 lata obrotowe',
                '2. Rachunek zysków i strat (P&L)',
                '3. Zestawienie przepływów pieniężnych (cash flow)',
                '4. Jeśli masz księgowego - poproś o komplet sprawozdań',
                '5. Format: PDF lub skan papierowych dokumentów'
            ],
            example: 'Bilans 2022, 2023, 2024 + RZiS + Cash Flow Statement'
        },
        {
            id: 'creditors_list_restr',
            name: '👥 Wykaz wierzycieli',
            required: true,
            canUpload: true,
            canGenerate: true,
            description: 'Lista wszystkich wierzycieli z kwotami i terminami',
            howTo: [
                '1. Wymień WSZYSTKICH wierzycieli (banki, dostawcy, US, ZUS)',
                '2. Dla każdego podaj: nazwę, adres, NIP',
                '3. Kwota długu (aktualny stan)',
                '4. Data wymagalności',
                '5. Tytuł wierzytelności (umowa kredytu, faktury)',
                '6. System może wygenerować tabelę na podstawie ankiety'
            ]
        },
        {
            id: 'restructuring_plan_doc',
            name: '📋 Plan restrukturyzacyjny',
            required: true,
            canUpload: true,
            canGenerate: true,
            description: 'Szczegółowy plan ratowania firmy i spłaty długów',
            howTo: [
                '1. Analiza obecnej sytuacji finansowej',
                '2. Propozycje spłat dla wierzycieli (% kwoty, czas)',
                '3. Prognoza przychodów i kosztów',
                '4. Harmonogram spłat (raty miesięczne)',
                '5. Działania naprawcze (cięcie kosztów, nowe źródła przychodów)',
                '6. Doradca pomoże Ci go przygotować!'
            ]
        },
        {
            id: 'krs_extract',
            name: '🏢 Odpis z KRS/CEiDG',
            required: true,
            canUpload: true,
            description: 'Aktualny wypis z rejestru (max 3 miesiące)',
            howTo: [
                'SPÓŁKI (Sp. z o.o., S.A.):',
                '• Wejdź na: ekrs.ms.gov.pl',
                '• Wyszukaj swoją firmę',
                '• Pobierz "Odpis aktualny" (płatny, ok. 20 zł)',
                '',
                'JDG (Jednoosobowa Działalność):',
                '• Wejdź na: prod.ceidg.gov.pl',
                '• Wpisz swój NIP',
                '• Pobierz "Zaświadczenie o wpisie" (BEZPŁATNE)'
            ]
        },
        {
            id: 'restructuring_application',
            name: '📄 Wniosek o otwarcie postępowania',
            required: true,
            canUpload: true,
            canGenerate: true,
            description: 'Formalny wniosek do sądu o otwarcie restrukturyzacji',
            howTo: [
                '1. System może wygenerować wzór wniosku',
                '2. Zawiera: dane firmy, przyczyny problemów, propozycje',
                '3. Podpisz własnoręcznie',
                '4. Załącz wszystkie wymagane dokumenty',
                '5. Złóż w sądzie właściwym dla siedziby firmy'
            ]
        },
        {
            id: 'company_contracts',
            name: '📑 Umowy z wierzycielami',
            required: false,
            canUpload: true,
            description: 'Kopie umów kredytowych, pożyczkowych, dostaw',
            howTo: [
                '1. Umowy kredytowe z bankami',
                '2. Umowy pożyczkowe',
                '3. Umowy z dostawcami (faktury)',
                '4. Umowy leasingowe',
                '5. Inne istotne umowy'
            ]
        },
        {
            id: 'income_docs',
            name: '💰 Dokumenty potwierdzające przychody',
            required: false,
            canUpload: true,
            description: 'Faktury sprzedaży, wyciągi bankowe',
            howTo: [
                '1. Faktury sprzedażowe (ostatnie 6 miesięcy)',
                '2. Wyciągi bankowe (obroty na kontach)',
                '3. Umowy z klientami',
                '4. Prognozy sprzedaży'
            ]
        },
        {
            id: 'court_fee_proof_restr',
            name: '💳 Dowód opłaty sądowej',
            required: true,
            canUpload: true,
            description: 'Potwierdzenie przelewu opłaty sądowej - 1000 zł',
            howTo: [
                '1. Sprawdź właściwy sąd restrukturyzacyjny',
                '2. Znajdź numer konta sądu na stronie',
                '3. Tytuł: "Opłata - wniosek o otwarcie postępowania restrukturyzacyjnego"',
                '4. Kwota: 1000 zł',
                '5. Wydrukuj potwierdzenie przelewu',
                '6. Załącz do wniosku'
            ],
            example: 'Dane do przelewu:\nOdbiorca: Sąd Rejonowy...\nTytuł: Opłata - restrukturyzacja\nKwota: 1000 zł'
        },
        {
            id: 'employment_docs',
            name: '👷 Dokumenty dotyczące pracowników',
            required: false,
            canUpload: true,
            description: 'Lista pracowników, umowy, należne wynagrodzenia',
            howTo: [
                '1. Lista wszystkich pracowników',
                '2. Kopie umów o pracę',
                '3. Zestawienie należnych wynagrodzeń',
                '4. Zaległości względem pracowników (jeśli są)',
                '5. Plan zatrudnienia po restrukturyzacji'
            ]
        },
        {
            id: 'tax_docs',
            name: '🏦 Dokumenty US/ZUS',
            required: false,
            canUpload: true,
            description: 'Zaległości podatkowe i składkowe',
            howTo: [
                '1. Zaświadczenie o zaległościach US',
                '2. Zaświadczenie o zaległościach ZUS',
                '3. Decyzje podatkowe',
                '4. Plany ratalne (jeśli były)',
                '5. Korespondencja z urzędami'
            ]
        },
        {
            id: 'other_docs_restr',
            name: '📎 Inne dokumenty',
            required: false,
            canUpload: true,
            description: 'Wszelkie inne istotne dokumenty',
            howTo: [
                'Możesz dołączyć:',
                '• Korespondencję z wierzycielami',
                '• Próby ugody',
                '• Analizy finansowe',
                '• Dokumentację majątku',
                '• Wszystko co pomoże wyjaśnić sytuację'
            ]
        }
    ]
};

console.log('✅ Ankieta restrukturyzacyjna załadowana!');
console.log('📊 Restrukturyzacja - Sekcje:', window.restructuringQuestionnaire.sections.length);
console.log('📄 Restrukturyzacja - Dokumenty:', window.restructuringQuestionnaire.requiredDocuments.length);
console.log('📅 Restrukturyzacja - Fazy:', window.restructuringQuestionnaire.procedure.phases.length);
