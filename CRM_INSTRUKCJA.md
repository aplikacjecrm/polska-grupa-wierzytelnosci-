# 📋 Moduł CRM - Instrukcja użytkowania

## 🎯 Co to jest moduł CRM?

Moduł CRM (Customer Relationship Management) to system zarządzania klientami i sprawami prawnych zintegrowany z komunikatorem Pro Meritum.

---

## ✨ Funkcje modułu CRM

### 👥 Zarządzanie klientami
- ✅ Dodawanie nowych klientów (osoby fizyczne i firmy)
- ✅ Przechowywanie danych kontaktowych
- ✅ PESEL, NIP, adresy
- ✅ Notatki o kliencie
- ✅ Historia spraw klienta

### 📋 Zarządzanie sprawami
- ✅ Tworzenie spraw prawnych
- ✅ Przypisywanie spraw do klientów
- ✅ Numery spraw, sygnatury sądowe
- ✅ Statusy: otwarta, w toku, zamknięta
- ✅ Priorytety: niski, średni, wysoki
- ✅ Wartość przedmiotu sporu
- ✅ Dane strony przeciwnej

### 📝 Notatki
- ✅ Notatki do spraw i klientów
- ✅ Różne typy notatek
- ✅ Oznaczanie ważnych notatek
- ✅ Historia zmian

### 📅 Kalendarz wydarzeń
- ✅ Terminy rozpraw
- ✅ Spotkania z klientami
- ✅ Przypomnienia
- ✅ Powiązanie ze sprawami

### 📎 Dokumenty
- ✅ Przechowywanie dokumentów sprawy
- ✅ Kategorie dokumentów
- ✅ Wersjonowanie

### 🔗 Integracja
- ✅ Powiązanie emaili ze sprawami
- ✅ Powiązanie czatu ze sprawami
- ✅ Historia komunikacji z klientem

---

## 🚀 Jak korzystać?

### 1️⃣ Dodawanie klienta

1. Przejdź do zakładki **"Klienci i Sprawy"** (ikona 👥)
2. Kliknij **"➕ Nowy klient"**
3. Wypełnij formularz:
   - **Imię i nazwisko** (wymagane)
   - Nazwa firmy (opcjonalnie)
   - Email, telefon
   - PESEL, NIP
   - Adres
   - Notatki
4. Kliknij **"Zapisz"**

### 2️⃣ Tworzenie sprawy

1. W zakładce **"Klienci i Sprawy"**
2. Przejdź do zakładki **"Sprawy"**
3. Kliknij **"📋 Nowa sprawa"**
4. Wypełnij formularz:
   - **Wybierz klienta** (wymagane)
   - **Numer sprawy** (np. SP/2025/001)
   - **Typ sprawy** (cywilna, rodzinna, itp.)
   - **Tytuł sprawy**
   - Opis
   - Priorytet i status
   - Dane sądowe (opcjonalnie)
5. Kliknij **"Zapisz"**

### 3️⃣ Dodawanie notatki do sprawy

1. Otwórz sprawę
2. Przejdź do zakładki **"Notatki"**
3. Kliknij **"+ Dodaj notatkę"**
4. Wpisz treść
5. Oznacz jako ważną (opcjonalnie)
6. Zapisz

### 4️⃣ Dodawanie wydarzenia (termin rozprawy)

1. Przejdź do zakładki **"Kalendarz"** (ikona 📅)
2. Kliknij **"+ Nowe wydarzenie"**
3. Wypełnij:
   - Tytuł (np. "Rozprawa - Sprawa SP/2025/001")
   - Typ: rozprawa, spotkanie, termin
   - Data i godzina
   - Lokalizacja (nazwa sądu)
   - Powiąż ze sprawą
4. Ustaw przypomnienie
5. Zapisz

### 5️⃣ Powiązanie emaila ze sprawą

1. W widoku **"Poczta"**
2. Otwórz wiadomość email
3. Kliknij **"🔗 Powiąż ze sprawą"**
4. Wybierz sprawę z listy
5. Email zostanie zapisany w historii sprawy

### 6️⃣ Powiązanie czatu ze sprawą

1. W widoku **"Czat"**
2. Podczas rozmowy kliknij **"🔗 Powiąż ze sprawą"**
3. Wybierz sprawę
4. Wiadomości zostaną zapisane w historii sprawy

---

## 📊 Typy spraw

- **Cywilna** - sprawy cywilne
- **Rodzinna** - rozwody, alimenty, opieka
- **Korporacyjna** - sprawy firm, spółek
- **Pracownicza** - sprawy z zakresu prawa pracy
- **Nieruchomości** - transakcje, sprawy sąsiedzkie
- **Inna** - pozostałe sprawy

---

## 🎨 Statusy spraw

- **Otwarta** 🟢 - Nowa sprawa, oczekuje na działanie
- **W toku** 🟡 - Sprawa jest aktywnie prowadzona
- **Zamknięta** 🔴 - Sprawa zakończona

---

## ⚡ Priorytety

- **Niski** - Sprawy rutynowe, bez pilności
- **Średni** - Standardowe sprawy
- **Wysoki** - Pilne sprawy, bliskie terminy

---

## 📋 Przykładowy workflow

### Obsługa nowego klienta:

1. **Klient dzwoni** → Dodaj klienta w CRM
2. **Umów spotkanie** → Dodaj wydarzenie w kalendarzu
3. **Spotkanie odbyło się** → Dodaj notatkę ze spotkania
4. **Klient zleca sprawę** → Utwórz nową sprawę
5. **Korespondencja email** → Powiąż emaile ze sprawą
6. **Termin rozprawy** → Dodaj wydarzenie w kalendarzu
7. **Dokumenty** → Dodaj dokumenty do sprawy
8. **Sprawa zakończona** → Zmień status na "Zamknięta"

---

## 🔍 Wyszukiwanie

### Szukanie klienta:
- Po imieniu i nazwisku
- Po nazwie firmy
- Po emailu
- Po numerze telefonu

### Szukanie sprawy:
- Po numerze sprawy
- Po tytule
- Po nazwisku klienta
- Po sygnaturze sądowej

---

## 💡 Wskazówki

### Organizacja:
- Używaj spójnych numerów spraw (np. SP/ROK/NUMER)
- Dodawaj szczegółowe notatki po każdym kontakcie
- Regularnie aktualizuj statusy spraw
- Powiązuj całą korespondencję ze sprawami

### Bezpieczeństwo:
- Dane klientów są przechowywane lokalnie w bazie SQLite
- Regularnie twórz kopie zapasowe bazy danych
- Nie udostępniaj dostępu osobom nieupoważnionym

### Efektywność:
- Używaj filtrów do szybkiego znajdowania spraw
- Oznaczaj ważne notatki
- Ustawiaj przypomnienia dla ważnych terminów
- Przypisuj sprawy do odpowiednich prawników

---

## 📁 Struktura bazy danych

### Tabele:
- `clients` - Klienci
- `cases` - Sprawy
- `notes` - Notatki
- `events` - Wydarzenia/Terminy
- `documents` - Dokumenty
- `case_emails` - Powiązania email-sprawa
- `case_chats` - Powiązania czat-sprawa
- `tasks` - Zadania

---

## 🔧 Konfiguracja

### Automatyczna numeracja spraw:

Możesz skonfigurować automatyczną numerację w ustawieniach:
- Format: `SP/YYYY/NNN`
- Przykład: `SP/2025/001`, `SP/2025/002`

### Typy wydarzeń:

Możesz dostosować typy wydarzeń:
- Rozprawa
- Spotkanie z klientem
- Termin procesowy
- Konsultacja
- Inne

---

## ❓ FAQ

### Jak usunąć klienta?
Klienci nie są usuwani, tylko oznaczani jako "nieaktywni". To zachowuje historię spraw.

### Czy mogę przenieść sprawę do innego klienta?
Tak, edytuj sprawę i zmień klienta.

### Jak eksportować dane?
Baza danych SQLite znajduje się w `data/komunikator.db`. Możesz ją skopiować lub użyć narzędzi SQLite do eksportu.

### Czy mogę dodać własne pola?
Obecnie nie, ale możesz używać pola "Notatki" do dodatkowych informacji.

---

## 🎯 Planowane funkcje

- 🔜 Szablony dokumentów
- 🔜 Generowanie raportów
- 🔜 Eksport do PDF
- 🔜 Synchronizacja z kalendarzem Google
- 🔜 Automatyczne przypomnienia SMS/Email
- 🔜 Statystyki i wykresy
- 🔜 Fakturowanie
- 🔜 Czas pracy nad sprawą

---

## 📞 Wsparcie

W razie pytań lub problemów:
1. Sprawdź tę dokumentację
2. Zobacz `README.md` dla informacji technicznych
3. Skontaktuj się z administratorem

---

**© 2025 Pro Meritum - Kancelaria Radców Prawnych**

Moduł CRM został zaprojektowany specjalnie dla kancelarii prawnych! 🎉
