// 📜 ANKIETA WINDYKACYJNA - CZĘŚĆ 2 (Sekcje 7-12)

console.log('✅ Ładuję ankietę windykacyjną część 2...');

window.debtCollectionQuestionnaire_Part2 = {
    sections_7_12: [
        // SEKCJA 7: DOWODY
        {
            id: 'evidence',
            title: '7. Dowody',
            icon: '📎',
            help: '⚖️ CO MOŻE BYĆ DOWODEM? Nie musisz mieć umowy pisemnej! Screenshoty z WhatsApp, emaile, SMS-y, zeznania świadków - to wszystko ma moc dowodową w sądzie. Zaznacz co posiadasz.',
            questions: [
                {
                    id: 'legal_info_evidence',
                    label: '⚖️ WAŻNE INFORMACJE PRAWNE',
                    type: 'info',
                    content: `
                        <div style="color: #1a2332; line-height: 1.8;">
                        <strong style="color: #1a2332; font-size: 1.1rem;">CO MA MOC DOWODOWĄ W SĄDZIE?</strong><br><br>
                        
                        ✅ <strong style="color: #2e7d32;">DOWODY PISEMNE:</strong><br>
                        <span style="color: #333;">• Umowa pisemna (najsilniejszy dowód)<br>
                        • Faktury VAT, rachunki, noty księgowe<br>
                        • Potwierdzenia przelewu, wyciągi bankowe<br>
                        • Protokoły odbioru, dowody dostawy</span><br><br>
                        
                        ✅ <strong style="color: #2e7d32;">DOWODY ELEKTRONICZNE (równie ważne!):</strong><br>
                        <span style="color: #333;">• Emaile z potwierdzeniem zamówienia<br>
                        • Screenshots z WhatsApp, Messenger, SMS<br>
                        • Korespondencja mailowa<br>
                        • Zapisane rozmowy tekstowe</span><br><br>
                        
                        ✅ <strong style="color: #2e7d32;">DOWODY USTNE:</strong><br>
                        <span style="color: #333;">• Zeznania świadków (osoby obecne przy transakcji)<br>
                        • Nagrania rozmów (zgodne z prawem)</span><br><br>
                        
                        ⚠️ <strong style="color: #f57c00;">PAMIĘTAJ:</strong><br>
                        <span style="color: #333;">• NIE MUSISZ mieć umowy pisemnej!<br>
                        • Umowa ustna też jest ważna (kodeks cywilny)<br>
                        • Screenshoty z WhatsApp/Messenger = DOWÓD<br>
                        • Email = DOWÓD równy dokumentowi<br>
                        • Im więcej różnych dowodów, tym lepiej!</span>
                        </div>
                    `
                },
                {
                    id: 'evidence_strength',
                    label: 'Jak oceniasz siłę swoich dowodów?',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'strong', label: '💪 MOCNE - pisemne dokumenty, faktury, potwierdzenia' },
                        { value: 'medium', label: '⚠️ ŚREDNIE - emaile, SMS, częściowa dokumentacja' },
                        { value: 'weak', label: '❌ SŁABE - umowa ustna, świadkowie' },
                        { value: 'very_weak', label: '🚫 BARDZO SŁABE - tylko zaufanie, brak dowodów' }
                    ]
                },
                {
                    id: 'has_written_contract',
                    label: 'Czy masz umowę pisemną?',
                    type: 'checkbox',
                    required: false
                },
                {
                    id: 'has_invoice',
                    label: 'Czy masz fakturę VAT / rachunek?',
                    type: 'checkbox',
                    required: false
                },
                {
                    id: 'has_payment_proof',
                    label: 'Czy masz potwierdzenie przelewu / płatności?',
                    type: 'checkbox',
                    required: false
                },
                {
                    id: 'has_email_confirmation',
                    label: 'Czy masz email z potwierdzeniem?',
                    type: 'checkbox',
                    required: false
                },
                {
                    id: 'has_sms',
                    label: 'Czy masz SMS-y / wiadomości (WhatsApp, Messenger)?',
                    type: 'checkbox',
                    required: false
                },
                {
                    id: 'has_witnesses',
                    label: 'Czy masz świadków?',
                    type: 'checkbox',
                    required: false
                },
                {
                    id: 'witnesses_names',
                    label: 'Imiona i nazwiska świadków (jeśli są)',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Jan Kowalski - był obecny przy podpisywaniu umowy\nAnna Nowak - widziała dostawę towaru',
                    rows: 3
                },
                {
                    id: 'has_recordings',
                    label: 'Czy masz nagrania rozmów?',
                    type: 'checkbox',
                    required: false
                },
                {
                    id: 'has_photos',
                    label: 'Czy masz zdjęcia / screenshots?',
                    type: 'checkbox',
                    required: false
                },
                {
                    id: 'has_delivery_proof',
                    label: 'Czy masz potwierdzenie dostawy (kurier, poczta)?',
                    type: 'checkbox',
                    required: false
                },
                {
                    id: 'other_evidence',
                    label: 'Inne dowody (opisz)',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Np. korespondencja, historia współpracy, protokoły, zeznania...',
                    rows: 3
                },
                {
                    id: 'evidence_add_button',
                    label: '📁 Gotowy do dodania dowodów?',
                    type: 'action_button',
                    buttonText: '➕ Dodaj dowody do sprawy',
                    buttonAction: 'openEvidenceModal',
                    content: '👉 Kliknij przycisk poniżej aby otworzyć system dodawania dowodów. Możesz dodać dokumenty, zdjęcia, screenshoty - system automatycznie nadaje im numery i kategoryzuje.'
                }
            ]
        },

        // SEKCJA 8: KONTAKT Z DŁUŻNIKIEM
        {
            id: 'debtor_contact',
            title: '8. Kontakt z dłużnikiem',
            icon: '📞',
            help: 'Czy kontaktowałeś się z dłużnikiem? Jak zareagował?',
            questions: [
                {
                    id: 'contacted_debtor',
                    label: 'Czy kontaktowałeś się z dłużnikiem w sprawie długu?',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'yes_multiple', label: '✅ Tak, wielokrotnie' },
                        { value: 'yes_once', label: '⚠️ Tak, raz lub dwa razy' },
                        { value: 'no', label: '❌ Nie, nie kontaktowałem się' }
                    ]
                },
                {
                    id: 'debtor_reaction',
                    label: 'Jak zareagował dłużnik?',
                    type: 'select',
                    required: false,
                    options: [
                        { value: 'admits_promises', label: '🤝 Przyznaje dług, obiecuje zapłatę' },
                        { value: 'admits_delays', label: '⏰ Przyznaje, ale ciągle odkłada' },
                        { value: 'denies', label: '❌ Zaprzecza długowi' },
                        { value: 'ignores', label: '🚫 Ignoruje (nie odbiera, nie odpisuje)' },
                        { value: 'aggressive', label: '😡 Agresywny / groźby' },
                        { value: 'disappeared', label: '👻 Zniknął / nieznany adres' }
                    ]
                },
                {
                    id: 'promised_payment_dates',
                    label: 'Czy obiecał zapłacić? Podaj daty obietnic',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Np. Obiecał 15.01.2024 - nie zapłacił\nObiecał 01.02.2024 - też nie zapłacił',
                    rows: 3
                },
                {
                    id: 'last_contact_date',
                    label: 'Data ostatniego kontaktu z dłużnikiem',
                    type: 'date',
                    required: false
                }
            ]
        },

        // SEKCJA 9: PRÓBY ODZYSKANIA
        {
            id: 'recovery_attempts',
            title: '9. Próby odzyskania należności',
            icon: '🔄',
            help: 'Co zrobiłeś do tej pory aby odzyskać pieniądze?',
            questions: [
                {
                    id: 'sent_demand_letters',
                    label: 'Czy wysyłałeś wezwania do zapłaty?',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'yes_multiple', label: '✅ Tak, kilka wezwań' },
                        { value: 'yes_once', label: '⚠️ Tak, jedno wezwanie' },
                        { value: 'no', label: '❌ Nie wysyłałem' }
                    ]
                },
                {
                    id: 'demand_letters_dates',
                    label: 'Daty wysłanych wezwań',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Np. 1. Wezwanie: 01.01.2024 (email)\n2. Wezwanie: 15.01.2024 (list polecony)',
                    rows: 3
                },
                {
                    id: 'negotiated_settlement',
                    label: 'Czy próbowałeś negocjować ugodę?',
                    type: 'select',
                    required: false,
                    options: [
                        { value: 'yes_success', label: '✅ Tak, udało się (ale nie zapłacił)' },
                        { value: 'yes_partial', label: '⚠️ Tak, częściowo (obniżona kwota, raty)' },
                        { value: 'yes_failed', label: '❌ Tak, ale nie doszło do porozumienia' },
                        { value: 'no', label: '➖ Nie próbowałem' }
                    ]
                }
            ]
        },

        // SEKCJA 10: SYTUACJA DŁUŻNIKA
        {
            id: 'debtor_situation',
            title: '10. Sytuacja finansowa dłużnika',
            icon: '💼',
            help: 'Co wiesz o aktualnej sytuacji dłużnika?',
            questions: [
                {
                    id: 'debtor_active',
                    label: 'Czy dłużnik nadal działa (firma) / jest aktywny?',
                    type: 'select',
                    required: false,
                    options: [
                        { value: 'yes_active', label: '✅ Tak, normalnie działa' },
                        { value: 'yes_struggling', label: '⚠️ Tak, ale ma problemy finansowe' },
                        { value: 'closed', label: '❌ Firma zamknięta / osoba nieaktywna' },
                        { value: 'unknown', label: '❓ Nie wiem' }
                    ]
                },
                {
                    id: 'debtor_has_assets',
                    label: 'Czy dłużnik ma majątek?',
                    type: 'select',
                    required: false,
                    options: [
                        { value: 'yes_known', label: '✅ Tak, wiem co posiada' },
                        { value: 'probably', label: '⚠️ Prawdopodobnie tak' },
                        { value: 'no', label: '❌ Nie, jest bez majątku' },
                        { value: 'unknown', label: '❓ Nie wiem' }
                    ]
                },
                {
                    id: 'debtor_assets_list',
                    label: 'Znany majątek dłużnika (jeśli wiesz)',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Np. Mieszkanie, samochód, firma...',
                    rows: 3
                }
            ]
        },

        // SEKCJA 11: STRATEGIA
        {
            id: 'strategy',
            title: '11. Strategia i Twój cel',
            icon: '🎯',
            help: 'Co jest dla Ciebie najważniejsze?',
            questions: [
                {
                    id: 'priority',
                    label: 'Twój główny priorytet',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'quick_settlement', label: '⚡ SZYBKA UGODA - nawet za mniej' },
                        { value: 'full_amount', label: '💰 MAKSYMALNA KWOTA - pełna kwota' },
                        { value: 'court_judgment', label: '⚖️ WYROK + EGZEKUCJA' },
                        { value: 'court_settlement', label: '🤝 UGODA SĄDOWA' }
                    ]
                },
                {
                    id: 'willing_to_sue',
                    label: 'Czy jesteś gotów iść do sądu?',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'yes_ready', label: '✅ Tak, jestem gotów' },
                        { value: 'yes_last_resort', label: '⚠️ Tak, ale jako ostateczność' },
                        { value: 'prefer_not', label: '❌ Wolę uniknąć' }
                    ]
                }
            ]
        },

        // SEKCJA 12: SPECJALNE OKOLICZNOŚCI
        {
            id: 'special_circumstances',
            title: '12. Specjalne okoliczności',
            icon: '⚠️',
            help: 'Czy są jakieś dodatkowe istotne informacje?',
            questions: [
                {
                    id: 'fraud_suspected',
                    label: 'Czy podejrzewasz oszustwo?',
                    type: 'checkbox',
                    required: false
                },
                {
                    id: 'fraud_details',
                    label: 'Opis podejrzeń o oszustwo',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Np. Podał fałszywe dane, zniknął zaraz po otrzymaniu towaru...',
                    rows: 3
                },
                {
                    id: 'debtor_hiding',
                    label: 'Czy dłużnik się ukrywa?',
                    type: 'checkbox',
                    required: false
                },
                {
                    id: 'threats_received',
                    label: 'Czy otrzymałeś groźby?',
                    type: 'checkbox',
                    required: false
                },
                {
                    id: 'special_notes',
                    label: 'Inne ważne informacje',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Wszystko co może być istotne w tej sprawie...',
                    rows: 4
                }
            ]
        }
    ]
};

console.log('✅ Ankieta windykacyjna część 2 (sekcje 7-12) załadowana!');
console.log('📊 Part2 - Sekcje:', window.debtCollectionQuestionnaire_Part2.sections_7_12.length);
