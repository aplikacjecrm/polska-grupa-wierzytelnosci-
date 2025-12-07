# 🧪 Jak przetestować historię sprawy?

## 📋 Szybki test (2 minuty)

### Krok 1: Otwórz aplikację
```
http://localhost:3500
```
Zaloguj się jako pracownik (admin, lawyer, hr, finanse)

### Krok 2: Wybierz dowolną sprawę
- Kliknij "Sprawy" w menu
- Wybierz dowolną sprawę z listy
- Otwórz szczegóły sprawy

### Krok 3: Wykonaj różne akcje

#### 📄 Dodaj dokument
1. Kliknij zakładkę "📄 Dokumenty"
2. Kliknij "Dodaj dokument"
3. Wybierz plik i dodaj

**Oczekiwany rezultat:** ✅ W historii pojawi się wpis "Dodano dokument: [nazwa]"

#### 👥 Dodaj świadka
1. Kliknij zakładkę "👥 Świadkowie"
2. Kliknij "Dodaj świadka"
3. Wypełnij formularz i zapisz

**Oczekiwany rezultat:** ✅ W historii pojawi się "Dodano świadka: [imię] [nazwisko]"

#### 🔍 Dodaj dowód
1. Kliknij zakładkę "🔍 Dowody"
2. Kliknij "Dodaj dowód"
3. Wypełnij formularz i zapisz

**Oczekiwany rezultat:** ✅ W historii pojawi się "Dodano dowód: [nazwa]"

#### 💬 Napisz komentarz
1. Kliknij zakładkę "💬 Komentarze"
2. Napisz komentarz w polu tekstowym
3. Kliknij "Dodaj komentarz"

**Oczekiwany rezultat:** ✅ W historii pojawi się "Dodano komentarz"

#### 💰 Przyjmij płatność
1. Kliknij zakładkę "💰 Płatności"
2. Kliknij "Dodaj płatność"
3. Wypełnij kwotę i zapisz

**Oczekiwany rezultat:** ✅ W historii pojawi się "Utworzono płatność: [kwota] PLN"

### Krok 4: Sprawdź historię
1. Kliknij zakładkę **"📜 Historia"**
2. Powinieneś zobaczyć **wszystkie** akcje, które wykonałeś!

## ✅ Co powinieneś zobaczyć?

Historia sprawy powinna wyglądać mniej więcej tak:

```
📜 Historia zmian

Timeline wszystkich akcji w sprawie

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🕐 24.11.2025, 13:35
💰 Utworzono płatność: 11 PLN (PAY/ODS/TN01/001/003)
   Tomasz Zygmund (lawyer)

🕐 24.11.2025, 13:34
💬 Dodano komentarz wewnętrzny
   Tomasz Zygmund (lawyer)

🕐 24.11.2025, 13:33
🔍 Dodano dowód: Faktura VAT (document)
   Admin (admin)

🕐 24.11.2025, 13:32
👥 Dodano świadka: Jan Kowalski (neutral)
   Admin (admin)

🕐 24.11.2025, 13:31
📄 Dodano dokument: umowa.pdf
   Admin (admin)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🐛 Co zrobić jeśli coś nie działa?

### Problem 1: Historia jest pusta
**Rozwiązanie:**
1. Sprawdź czy wykonałeś akcje w **tej samej sprawie**
2. Odśwież stronę (F5)
3. Sprawdź konsolę przeglądarki (F12)

### Problem 2: Brakuje niektórych wpisów
**Rozwiązanie:**
1. Sprawdź czy jesteś zalogowany jako **pracownik** (nie klient)
2. Sprawdź logi backend w terminalu
3. Sprawdź czy w konsoli nie ma błędów

### Problem 3: Backend nie działa
**Rozwiązanie:**
```bash
# Uruchom ponownie backend
cd kancelaria/komunikator-app
node backend/server.js
```

## 📊 Dodatkowe testy

### Test Employee Dashboard
1. Przejdź do "👤 Pracownicy" → "Mój Dashboard"
2. Sprawdź zakładkę "📊 Aktywność"
3. Powinieneś zobaczyć **wszystkie swoje akcje** (nie tylko z jednej sprawy)

### Test filtrowania historii
1. Otwórz historię sprawy
2. Wykonaj kilka różnych akcji
3. Sprawdź czy są pogrupowane chronologicznie
4. Sprawdź czy pokazują poprawne ikony (📄, 👥, 🔍, 💬, 💰)

## 🎯 Podsumowanie

Historia sprawy teraz automatycznie rejestruje:
- ✅ Dodawanie dokumentów
- ✅ Dodawanie świadków
- ✅ Dodawanie dowodów
- ✅ Pisanie komentarzy
- ✅ Przyjmowanie płatności
- ✅ Tworzenie wydarzeń
- ✅ Tworzenie zadań
- ✅ I wiele innych akcji...

**Wszystko działa automatycznie - nie musisz nic robić!** 🎉

---

**Pytania?** Sprawdź plik `HISTORIA-SPRAWY-KOMPLETNA.md` dla szczegółów technicznych.
