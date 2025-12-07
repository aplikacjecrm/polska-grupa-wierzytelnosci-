// 📜 ANKIETA WINDYKACYJNA - CZĘŚĆ 1 (Sekcje 1-6)
// Moduł do dochodzenia należności cywilnych

console.log('✅ Ładuję ankietę windykacyjną część 1...');

window.debtCollectionQuestionnaire_Part1 = {
    sections_1_6: [
        // SEKCJA 1: TYP NALEŻNOŚCI
        {
            id: 'debt_type',
            title: '1. Typ należności',
            icon: '🎯',
            description: 'Jakiego długu dotyczy sprawa?',
            help: 'Jaki rodzaj długu chcesz odzyskać?',
            questions: [
                {
                    id: 'debt_category',
                    label: 'Kategoria należności',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'invoice_b2b', label: '📄 Nieopłacone faktury (B2B - firma do firmy)' },
                        { value: 'invoice_b2c', label: '🛒 Nieopłacone faktury (B2C - firma do konsumenta)' },
                        { value: 'contract_civil', label: '📋 Umowa cywilna (zlecenie, dzieło, kupna-sprzedaży)' },
                        { value: 'loan_private', label: '💰 Pożyczka prywatna' },
                        { value: 'rent', label: '🏠 Czynsz / najem' },
                        { value: 'damage', label: '⚠️ Roszczenie z tytułu szkody' },
                        { value: 'compensation_claim', label: '💸 Odszkodowanie (delikt, wypadek)' },
                        { value: 'other', label: '📎 Inne' }
                    ]
                },
                {
                    id: 'debt_type_description',
                    label: 'Opis należności (krótko)',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Np. Nieopłacone faktury za dostawę towaru, umowa zlecenia wykonania strony www, pożyczka dla znajomego...',
                    rows: 3
                },
                {
                    id: 'business_relation',
                    label: 'Jaka była relacja biznesowa?',
                    type: 'select',
                    required: false,
                    options: [
                        { value: 'regular_client', label: '🤝 Stały klient / współpraca długoterminowa' },
                        { value: 'one_time', label: '🔄 Jednorazowa transakcja' },
                        { value: 'friend_family', label: '👥 Znajomy / rodzina' },
                        { value: 'unknown', label: '❓ Nieznana osoba / pierwsza transakcja' }
                    ]
                }
            ]
        },

        // SEKCJA 2: WIERZYCIEL (TY)
        {
            id: 'creditor_data',
            title: '2. Wierzyciel (Twoje dane)',
            icon: '👤',
            help: 'Kim jesteś? Osoba fizyczna czy firma?',
            questions: [
                {
                    id: 'creditor_type',
                    label: 'Jesteś',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'individual', label: '👤 Osoba fizyczna (bez działalności)' },
                        { value: 'entrepreneur', label: '💼 Przedsiębiorca (JDG)' },
                        { value: 'company', label: '🏢 Firma (Sp. z o.o., SA, itp.)' }
                    ]
                },
                {
                    id: 'creditor_name',
                    label: 'Imię i nazwisko / Nazwa firmy',
                    type: 'text',
                    required: true,
                    placeholder: 'Jan Kowalski / ABC Sp. z o.o.'
                },
                {
                    id: 'creditor_pesel',
                    label: 'PESEL (dla osoby fizycznej)',
                    type: 'text',
                    required: false,
                    placeholder: '12345678901'
                },
                {
                    id: 'creditor_nip',
                    label: 'NIP (dla przedsiębiorcy/firmy)',
                    type: 'text',
                    required: false,
                    placeholder: '123-456-78-90'
                },
                {
                    id: 'creditor_regon',
                    label: 'REGON (dla firmy)',
                    type: 'text',
                    required: false
                },
                {
                    id: 'creditor_krs',
                    label: 'KRS (dla spółek)',
                    type: 'text',
                    required: false,
                    placeholder: '0000123456'
                },
                {
                    id: 'creditor_address',
                    label: 'Adres zamieszkania / siedziby',
                    type: 'text',
                    required: true,
                    placeholder: 'ul. Przykładowa 1, 00-001 Warszawa'
                },
                {
                    id: 'creditor_phone',
                    label: 'Telefon kontaktowy',
                    type: 'tel',
                    required: true,
                    placeholder: '+48 123 456 789'
                },
                {
                    id: 'creditor_email',
                    label: 'Email',
                    type: 'email',
                    required: true,
                    placeholder: 'jan.kowalski@example.com'
                }
            ]
        },

        // SEKCJA 3: DŁUŻNIK
        {
            id: 'debtor_data',
            title: '3. Dłużnik (dane osoby/firmy która jest winna)',
            icon: '🎯',
            help: 'Kto jest Ci winien pieniądze?',
            questions: [
                {
                    id: 'debtor_type',
                    label: 'Dłużnik to',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'individual', label: '👤 Osoba fizyczna' },
                        { value: 'entrepreneur', label: '💼 Przedsiębiorca (JDG)' },
                        { value: 'company', label: '🏢 Firma (Sp. z o.o., SA)' },
                        { value: 'unknown', label: '❓ Nieznany / częściowe dane' }
                    ]
                },
                {
                    id: 'debtor_known',
                    label: 'Czy znasz pełne dane dłużnika?',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'full', label: '✅ Tak, mam pełne dane (imię, nazwisko, adres)' },
                        { value: 'partial', label: '⚠️ Częściowe dane (brak adresu lub inne luki)' },
                        { value: 'minimal', label: '❌ Minimalne (tylko imię, telefon, email)' },
                        { value: 'none', label: '🚫 Nie znam / dłużnik się ukrywa' }
                    ]
                },
                {
                    id: 'debtor_name',
                    label: 'Imię i nazwisko / Nazwa firmy dłużnika',
                    type: 'text',
                    required: true,
                    placeholder: 'Anna Nowak / XYZ Sp. z o.o.'
                },
                {
                    id: 'debtor_pesel',
                    label: 'PESEL dłużnika (jeśli znasz)',
                    type: 'text',
                    required: false,
                    placeholder: '98765432101'
                },
                {
                    id: 'debtor_nip',
                    label: 'NIP dłużnika (dla firmy/przedsiębiorcy)',
                    type: 'text',
                    required: false,
                    placeholder: '987-654-32-10'
                },
                {
                    id: 'debtor_regon',
                    label: 'REGON (jeśli znasz)',
                    type: 'text',
                    required: false
                },
                {
                    id: 'debtor_krs',
                    label: 'KRS (dla spółek)',
                    type: 'text',
                    required: false
                },
                {
                    id: 'debtor_address',
                    label: 'Adres zamieszkania / siedziby dłużnika',
                    type: 'text',
                    required: false,
                    placeholder: 'ul. Dłużnicza 10, 00-002 Kraków (podaj jeśli znasz)'
                },
                {
                    id: 'debtor_phone',
                    label: 'Telefon dłużnika (jeśli masz)',
                    type: 'tel',
                    required: false,
                    placeholder: '+48 987 654 321'
                },
                {
                    id: 'debtor_email',
                    label: 'Email dłużnika (jeśli masz)',
                    type: 'email',
                    required: false,
                    placeholder: 'dluznik@example.com'
                },
                {
                    id: 'debtor_size',
                    label: 'Wielkość dłużnika (jeśli firma)',
                    type: 'select',
                    required: false,
                    options: [
                        { value: 'individual', label: '👤 Osoba fizyczna / mikrofirma (1-9 osób)' },
                        { value: 'small', label: '🏪 Mała firma (10-49 osób)' },
                        { value: 'medium', label: '🏢 Średnia firma (50-249 osób)' },
                        { value: 'large', label: '🏗️ Duża firma (250+ osób) / korporacja' },
                        { value: 'unknown', label: '❓ Nie wiem' }
                    ]
                }
            ]
        },

        // SEKCJA 4: PODSTAWA PRAWNA
        {
            id: 'legal_basis',
            title: '4. Podstawa prawna należności',
            icon: '📄',
            help: 'Na jakiej podstawie dłużnik jest Ci winien pieniądze?',
            questions: [
                {
                    id: 'contract_type',
                    label: 'Rodzaj umowy / podstawy (możesz wybrać kilka)',
                    type: 'checkbox',
                    required: true,
                    options: [
                        { value: 'written_contract', label: '📝 Umowa pisemna (podpisana przez obie strony)' },
                        { value: 'verbal_contract', label: '🗣️ Umowa ustna (zgoda słowna)' },
                        { value: 'invoice_only', label: '📄 Tylko faktura (bez formalnej umowy)' },
                        { value: 'email_agreement', label: '📧 Porozumienie emailowe' },
                        { value: 'no_contract', label: '❌ Brak umowy (zaufanie, zobowiązanie moralne)' },
                        { value: 'court_decision', label: '⚖️ Wyrok sądowy / akt notarialny' }
                    ]
                },
                {
                    id: 'contract_date',
                    label: 'Data zawarcia umowy / powstania zobowiązania',
                    type: 'date',
                    required: false
                },
                {
                    id: 'contract_subject',
                    label: 'Przedmiot umowy (co było przedmiotem transakcji?)',
                    type: 'textarea',
                    required: true,
                    placeholder: 'Np. Dostawa 100 szt. towaru X, wykonanie strony internetowej, pożyczka 10,000 zł na remont mieszkania...',
                    rows: 3
                },
                {
                    id: 'contract_parties',
                    label: 'Strony umowy (kto z kim?)',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Np. Wierzyciel: Jan Kowalski, Dłużnik: Anna Nowak',
                    rows: 2
                },
                {
                    id: 'payment_terms',
                    label: 'Warunki płatności (jak ustaliliście?)',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Np. Płatność w ciągu 14 dni od dostawy, przelew na konto, raty miesięczne 500 zł...',
                    rows: 3
                },
                {
                    id: 'contract_fulfilled',
                    label: 'Czy wykonałeś swoją część umowy?',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'yes_full', label: '✅ Tak, w pełni (dostawa, usługa wykonana)' },
                        { value: 'yes_partial', label: '⚠️ Częściowo (część wykonana)' },
                        { value: 'no', label: '❌ Nie (oczekiwanie na zapłatę przed wykonaniem)' }
                    ]
                },
                {
                    id: 'contract_proof',
                    label: 'Czy posiadasz dowód wykonania? (możesz wybrać kilka)',
                    type: 'checkbox',
                    required: false,
                    options: [
                        { value: 'protocol', label: '📋 Protokół odbioru (podpisany)' },
                        { value: 'email_confirm', label: '📧 Email z potwierdzeniem' },
                        { value: 'delivery_proof', label: '📦 Potwierdzenie dostawy (kurier)' },
                        { value: 'witnesses', label: '👥 Świadkowie' },
                        { value: 'photos', label: '📸 Zdjęcia / dokumentacja' },
                        { value: 'none', label: '❌ Brak formalnego potwierdzenia' }
                    ]
                }
            ]
        },

        // SEKCJA 5: WYSOKOŚĆ NALEŻNOŚCI
        {
            id: 'debt_amount',
            title: '5. Wysokość należności',
            icon: '💰',
            help: 'Ile dokładnie jest Ci winien dłużnik?',
            questions: [
                {
                    id: 'principal_amount',
                    label: 'Kwota główna (bez odsetek)',
                    type: 'number',
                    required: true,
                    placeholder: '10000',
                    help: 'Podaj kwotę w PLN'
                },
                {
                    id: 'currency',
                    label: 'Waluta',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'PLN', label: 'PLN (złoty polski)' },
                        { value: 'EUR', label: 'EUR (euro)' },
                        { value: 'USD', label: 'USD (dolar amerykański)' },
                        { value: 'GBP', label: 'GBP (funt brytyjski)' },
                        { value: 'other', label: 'Inna' }
                    ]
                },
                {
                    id: 'interest_type',
                    label: 'Rodzaj odsetek',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'statutory', label: '⚖️ Odsetki ustawowe (automatyczne)' },
                        { value: 'contractual', label: '📋 Odsetki umowne (ustalone w umowie)' },
                        { value: 'none', label: '❌ Brak odsetek (tylko kwota główna)' }
                    ]
                },
                {
                    id: 'interest_rate',
                    label: 'Stopa odsetek umownych (% rocznie, jeśli dotyczy)',
                    type: 'number',
                    required: false,
                    placeholder: '10',
                    help: 'Podaj procent roczny, np. 10 dla 10%'
                },
                {
                    id: 'interest_calculated',
                    label: 'Czy wyliczono odsetki?',
                    type: 'select',
                    required: false,
                    options: [
                        { value: 'yes', label: '✅ Tak, mam wyliczoną kwotę odsetek' },
                        { value: 'no_need_help', label: '❌ Nie, potrzebuję pomocy w wyliczeniu' },
                        { value: 'not_applicable', label: '➖ Nie dotyczy (brak odsetek)' }
                    ]
                },
                {
                    id: 'interest_amount',
                    label: 'Kwota odsetek (jeśli już wyliczona)',
                    type: 'number',
                    required: false,
                    placeholder: '500',
                    help: 'Podaj kwotę odsetek w PLN'
                },
                {
                    id: 'additional_costs',
                    label: 'Dodatkowe koszty (jeśli są)',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Np. Koszty wezwań: 200 zł, opłata skarbowa: 17 zł...',
                    rows: 2
                },
                {
                    id: 'additional_costs_amount',
                    label: 'Suma dodatkowych kosztów',
                    type: 'number',
                    required: false,
                    placeholder: '217'
                },
                {
                    id: 'total_claimed',
                    label: 'SUMA CAŁKOWITA do odzyskania',
                    type: 'number',
                    required: false,
                    placeholder: '10717',
                    help: 'Kwota główna + odsetki + koszty'
                }
            ]
        },

        // SEKCJA 6: TERMIN PŁATNOŚCI I OPÓŹNIENIE
        {
            id: 'payment_deadline',
            title: '6. Termin płatności i opóźnienie',
            icon: '⏰',
            help: 'Kiedy dłużnik miał zapłacić?',
            questions: [
                {
                    id: 'due_date',
                    label: 'Data wymagalności (termin płatności)',
                    type: 'date',
                    required: true,
                    help: 'Kiedy dłużnik miał zapłacić?'
                },
                {
                    id: 'days_overdue',
                    label: 'Ile dni opóźnienia? (automatycznie wyliczane)',
                    type: 'number',
                    required: false,
                    placeholder: '30',
                    help: 'Zostanie wyliczone automatycznie na podstawie daty wymagalności'
                },
                {
                    id: 'payment_deadline_extended',
                    label: 'Czy termin był przedłużany?',
                    type: 'select',
                    required: false,
                    options: [
                        { value: 'no', label: '❌ Nie, oryginalny termin' },
                        { value: 'yes_once', label: '⚠️ Tak, raz (jedna zgoda na przesunięcie)' },
                        { value: 'yes_multiple', label: '🔄 Tak, kilka razy (dłużnik wielokrotnie prosił)' }
                    ]
                },
                {
                    id: 'extension_dates',
                    label: 'Daty przedłużeń (jeśli były)',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Np. Pierwotnie: 01.01.2024, przedłużono do: 15.01.2024, następnie: 01.02.2024...',
                    rows: 2
                },
                {
                    id: 'payment_status',
                    label: 'Status płatności',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'not_paid', label: '❌ Nie zapłacone w ogóle' },
                        { value: 'partial', label: '⚠️ Zapłacone częściowo' },
                        { value: 'late_full', label: '⏰ Zapłacone z opóźnieniem (pełna kwota)' },
                        { value: 'promised', label: '🤝 Obiecane (ale nie wpłynęło)' }
                    ]
                },
                {
                    id: 'partial_payment_amount',
                    label: 'Kwota wpłacona (jeśli częściowa płatność)',
                    type: 'number',
                    required: false,
                    placeholder: '2000',
                    help: 'Ile już zapłacono z całości?'
                },
                {
                    id: 'partial_payment_date',
                    label: 'Data częściowej wpłaty',
                    type: 'date',
                    required: false
                }
            ]
        }
    ]
};

console.log('✅ Ankieta windykacyjna część 1 (sekcje 1-6) załadowana!');
console.log('📊 Part1 - Sekcje:', window.debtCollectionQuestionnaire_Part1.sections_1_6.length);
