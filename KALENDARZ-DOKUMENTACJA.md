# 📅 System Kalendarza - Kompletna Dokumentacja

**Wersja:** 8.0  
**Data:** 7 listopada 2025  
**Status:** ✅ PRODUKCYJNY - W PEŁNI FUNKCJONALNY

---

## 🎯 PRZEGLĄD SYSTEMU

System kalendarza składa się z:
1. **Backend API** - zarządzanie wydarzeniami i wpisami kalendarza
2. **Frontend Calendar Manager** - główny moduł kalendarza firmowego (3 widoki)
3. **Frontend Client Calendar** - dedykowany kalendarz dla klientów
4. **Automatyczna synchronizacja** - wydarzenia trafiają do kalendarzy wszystkich zaangażowanych osób

---

## 📁 STRUKTURA PLIKÓW

### Backend:
```
backend/
├── routes/
│   ├── events.js              # CRUD wydarzeń + auto-sync
│   └── calendar.js            # API kalendarza (GET /api/calendar/*)
└── database/
    └── init.js                # Tabela calendar_entries + indeksy
```

### Frontend:
```
frontend/
├── scripts/
│   ├── calendar-manager.js    # Główny moduł (3 widoki) v8
│   └── client-calendar.js     # Kalendarz klienta v1
└── index.html                 # Import skryptów
```

---

## 🗄️ BAZA DANYCH

### Tabela: `calendar_entries`

```sql
CREATE TABLE calendar_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    calendar_type TEXT NOT NULL CHECK(calendar_type IN ('personal', 'case', 'client')),
    visibility TEXT DEFAULT 'normal' CHECK(visibility IN ('normal', 'private', 'public')),
    reminder_enabled INTEGER DEFAULT 0,
    reminder_minutes INTEGER DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_calendar_user ON calendar_entries(user_id);
CREATE INDEX idx_calendar_event ON calendar_entries(event_id);
CREATE INDEX idx_calendar_type ON calendar_entries(calendar_type);
```

### Automatyczna synchronizacja:

Przy tworzeniu wydarzenia (`POST /api/events`), system automatycznie dodaje wpisy do `calendar_entries` dla:
- ✅ **Twórcy** wydarzenia
- ✅ **Mecenasa prowadzącego** (jeśli sprawa przypisana)
- ✅ **Opiekuna sprawy** (jeśli przypisany)
- ✅ **Klienta** (jeśli ma konto użytkownika)

---

## 🔌 BACKEND API

### **GET /api/calendar/events**
Pobiera wszystkie wydarzenia użytkownika (ze wszystkich kalendarzy)

**Query params:**
- `type` - filtr typu wydarzenia (court, meeting, etc.)
- `from_date` - od daty (YYYY-MM-DD)
- `to_date` - do daty (YYYY-MM-DD)

**Response:**
```json
{
  "events": [
    {
      "id": 1,
      "event_code": "ROZ/CYW/JK/003/001",
      "event_type": "court",
      "title": "Rozprawa sądowa",
      "start_date": "2025-11-10T10:00:00",
      "location": "Sąd Okręgowy",
      "case_number": "CYW/JK/003",
      "description": "...",
      "extra_data": { ... }
    }
  ]
}
```

---

### **GET /api/calendar/client/:clientId**
Pobiera wydarzenia klienta + statystyki

**Response:**
```json
{
  "events": [...],
  "stats": {
    "urgent": 2,      // dziś do 3 dni
    "upcoming": 5,    // 4-30 dni
    "total": 15
  }
}
```

---

### **POST /api/calendar/entries/:eventId/add-user**
Dodaje użytkownika do wydarzenia

**Body:**
```json
{
  "user_id": 123,
  "calendar_type": "case"
}
```

---

### **DELETE /api/calendar/entries/:entryId**
Usuwa wpis z kalendarza (nie usuwa wydarzenia!)

---

## 🎨 FRONTEND - CALENDAR MANAGER (Główny Kalendarz)

### Klasa: `window.calendarManager`

### Inicjalizacja:
```javascript
// Automatyczna przy przejściu do widoku kalendarza
await window.calendarManager.init();
```

### 3 WIDOKI:

#### **1. 📋 LISTA** (Widok domyślny)
- Pokazuje WSZYSTKIE nadchodzące wydarzenia
- Sortowane chronologicznie
- Badge z datą: **🔥 DZIŚ** / **⚠️ JUTRO** / **Za X dni**
- Kolorowe karty według typu wydarzenia
- Scrollowanie jeśli > 3-4 wydarzenia
- Kliknięcie → `viewEventDetails(id)`

**Funkcja:** `renderDayView(date)`

---

#### **2. 📆 TYDZIEŃ**
- 7 kolumn: Poniedziałek - Niedziela
- Dzisiaj zaznaczony gradientem fioletowym
- Kolorowe karty wydarzeń w każdym dniu
- Sortowane po godzinie
- Hover effect na kartach
- Kliknięcie → `viewEventDetails(id)`

**Funkcja:** `renderWeekView(startDate)`

**Nawigacja:**
- ◀ Poprzedni tydzień
- ▶ Następny tydzień
- **Dzisiaj** - powrót do bieżącego tygodnia

---

#### **3. 🗓️ MIESIĄC**
- Klasyczna siatka kalendarza 7×~5 dni
- Dzisiaj: gradient fioletowy w kółku
- Mini podgląd wydarzeń (max 3 + licznik "+X więcej")
- Badge z liczbą wydarzeń w dniu
- Hover effect na dniach (scale 1.02)
- **Kliknięcie na dzień** → modal z listą wydarzeń z tego dnia

**Funkcja:** `renderMonthView(year, month)`

**Modal dnia:**
- Gradient nagłówek z datą
- Lista wszystkich wydarzeń
- Kliknięcie na wydarzenie → `viewEventDetails(id)`
- Przycisk "Zamknij"

**Nawigacja:**
- ◀ Poprzedni miesiąc
- ▶ Następny miesiąc
- **Dzisiaj** - powrót do bieżącego miesiąca

---

### Funkcje pomocnicze:

```javascript
// Załaduj wydarzenia
await calendarManager.loadAllEvents({ type: 'court' });

// Zastosuj filtry
calendarManager.applyFilters();

// Przełącz widok
calendarManager.switchView('month'); // 'day', 'week', 'month'

// Odśwież kalendarz
await calendarManager.refresh();

// Pokaż wydarzenia z konkretnego dnia (używane w widoku miesięcznym)
calendarManager.showDayEvents(2025, 10, 15);
```

---

### Event Bus Integration:

```javascript
// Kalendarz automatycznie nasłuchuje:
window.eventBus.on('event:created', () => calendarManager.refresh());
window.eventBus.on('event:updated', () => calendarManager.refresh());
window.eventBus.on('event:deleted', () => calendarManager.refresh());
```

---

## 👥 FRONTEND - CLIENT CALENDAR (Kalendarz Klienta)

### Klasa: `window.clientCalendar`

### Inicjalizacja:
```javascript
// W portalu klienta po zalogowaniu
const clientId = currentUser.clientId;
await window.clientCalendar.init(clientId);
```

### Funkcje:

```javascript
// Załaduj wydarzenia klienta
await clientCalendar.loadEvents();

// Renderuj widok
clientCalendar.render();

// Pokaż szczegóły
clientCalendar.showEventDetails(eventId);

// Zastosuj filtry
clientCalendar.applyFilters();
```

### Filtry:
- **Typ wydarzenia** - dropdown (wszystkie/rozprawa/spotkanie/etc.)
- **Przedział czasu** - all/upcoming/past
- **Przycisk odśwież** 🔄

### Statystyki:
- 🔥 **Pilne** (dziś/jutro) - różowy gradient
- 📅 **Nadchodzące** (3-30 dni) - niebieski gradient
- 📊 **Wszystkie** - zielony gradient

### Badge pilności:
- **🔥 DZIŚ!** - czerwony, pulsujący
- **Za X dni** - kolorowy według pilności

---

## 🎨 KOLORY TYPÓW WYDARZEŃ

```javascript
const typeColors = {
    'negotiation': '#3498db',    // 🤝 Negocjacje - niebieski
    'court': '#e74c3c',          // ⚖️ Rozprawa - czerwony
    'meeting': '#2ecc71',        // 👥 Spotkanie - zielony
    'deadline': '#e67e22',       // ⏰ Termin - pomarańczowy
    'mediation': '#9b59b6',      // 🕊️ Mediacja - fioletowy
    'expertise': '#f39c12',      // 🔬 Ekspertyza - pomarańczowy
    'document': '#1abc9c',       // 📄 Dokument - turkusowy
    'hearing': '#e91e63',        // 🗣️ Przesłuchanie - różowy
    'consultation': '#34495e',   // 💼 Konsultacja - szary
    'task': '#16a085',           // ✅ Zadanie - cyjan
    'other': '#95a5a6'           // 📝 Inne - szary
};
```

---

## 🚀 JAK UŻYWAĆ

### 1. Portal Mecenasa:

```
1. Zaloguj się jako mecenas
2. Kliknij "📅 Kalendarz" w menu
3. Wybierz widok:
   - 📋 Lista - wszystkie nadchodzące
   - 📆 Tydzień - bieżący tydzień
   - 🗓️ Miesiąc - bieżący miesiąc
4. Nawigacja: ◀ ▶ lub "Dzisiaj"
5. Kliknij wydarzenie → szczegóły
```

### 2. Portal Klienta:

```
1. Zaloguj się jako klient
2. Kalendarz pojawia się automatycznie
3. Filtruj według typu/czasu
4. Kliknij "👁️ Szczegóły" na wydarzeniu
```

### 3. Dodawanie wydarzeń:

```
1. Sprawy → Otwórz sprawę
2. Zakładka "📅 Wydarzenia"
3. Kliknij "+ Dodaj wydarzenie"
4. Wybierz typ (11 typów dostępnych)
5. Wypełnij formularz
6. Zapisz
→ Wydarzenie automatycznie trafi do kalendarzy!
```

---

## ✨ FUNKCJE UX/UI

### Animacje:
- **Hover na kartach** - translateY(-2px) + shadow
- **Badge pilności** - pulsowanie dla "DZIŚ!"
- **Dni w miesiącu** - scale(1.02)
- **Smooth transitions** - all 0.2s

### Responsywność:
- **Grid auto-fit** - kalendarze dostosowują się do ekranu
- **Max-height + overflow** - scrollowanie list
- **Flex wrap** - na małych ekranach

### Accessibility:
- **Duże fonty** - czytelne dla każdego
- **Kontrastowe kolory** - łatwe rozróżnienie typów
- **Ikonki** - wizualna identyfikacja
- **Hover tooltips** - szczegóły przy najechaniu

---

## 📊 STATYSTYKI I LICZNIKI

### Główny kalendarz:
```
┌────────────────────────────────────┐
│ [2] Pilne  [5] Nadchodzące  [15] Wszystkie
└────────────────────────────────────┘
```

- **Pilne** - dziś + jutro (0-2 dni)
- **Nadchodzące** - 3-7 dni
- **Wszystkie** - total w bazie

### Kalendarz klienta:
```
┌────────────────────────────────────┐
│ 🔥 [3] Pilne (dziś/jutro)
│ 📅 [12] Nadchodzące (3-30 dni)
│ 📊 [15] Wszystkie wydarzenia
└────────────────────────────────────┘
```

---

## 🔄 PRZEPŁYW DANYCH

### Tworzenie wydarzenia:
```
1. Mecenas wypełnia formularz
   ↓
2. POST /api/events
   ↓
3. Backend zapisuje event
   ↓
4. Backend dodaje do calendar_entries:
   - Twórca (zawsze)
   - Mecenas prowadzący (jeśli sprawa)
   - Opiekun sprawy (jeśli przypisany)
   - Klient (jeśli ma konto)
   ↓
5. Event Bus: 'event:created'
   ↓
6. Kalendarze odświeżają się automatycznie
   ↓
7. Wszyscy widzą nowe wydarzenie!
```

### Wyświetlanie kalendarza:
```
1. Użytkownik klika "📅 Kalendarz"
   ↓
2. calendarManager.init()
   ↓
3. GET /api/calendar/events
   ↓
4. Backend zwraca wydarzenia z calendar_entries
   (tylko te, gdzie user_id = aktualny użytkownik)
   ↓
5. applyFilters() - filtruje według ustawień
   ↓
6. renderCurrentView() - renderuje widok
   ↓
7. Użytkownik widzi swoje wydarzenia!
```

---

## 🐛 ROZWIĄZYWANIE PROBLEMÓW

### Kalendarz nie pokazuje wydarzeń:
```
✓ Sprawdź konsolę: "Załadowano X wydarzeń"
✓ Sprawdź filtry: czy nie blokują wszystkiego?
✓ Sprawdź widok: czy to właściwy widok?
✓ Sprawdź daty: czy wydarzenia są w przyszłości?
```

### Nie można scrollować:
```
✓ Sprawdź czy jest > 3-4 wydarzenia
✓ Sprawdź CSS: overflow-y: auto
✓ Sprawdź max-height: calc(100vh - 400px)
```

### Przyciski nie przełączają widoków:
```
✓ Sprawdź konsolę: "🔄 Zmiana widoku na: X"
✓ Sprawdź event listenery: czy zostały podłączone?
✓ Sprawdź DOM: czy div#dayView / #weekView / #monthView istnieją?
```

### Wydarzenia nie trafiają do kalendarza klienta:
```
✓ Sprawdź case.client_id - czy klient jest przypisany do sprawy?
✓ Sprawdź users.id - czy klient ma konto użytkownika?
✓ Sprawdź calendar_entries - czy wpis został utworzony?
✓ Sprawdź GET /api/calendar/client/:clientId
```

---

## 📈 PRZYSZŁE ROZSZERZENIA

### Planowane:
- ⏰ **Email reminders** - powiadomienia przed wydarzeniem
- 📤 **Eksport iCal** - synchronizacja z Google Calendar
- 🔔 **Push notifications** - powiadomienia w przeglądarce
- 🔍 **Wyszukiwanie** - szybkie filtrowanie
- 📱 **Mobile app** - natywna aplikacja
- 🌐 **Wielojęzyczność** - wsparcie dla EN/DE
- 🎨 **Motywy** - ciemny/jasny tryb

### Możliwe:
- 📊 **Statystyki** - raporty wykorzystania
- 🤖 **AI sugestie** - optymalne terminy
- 👥 **Współdzielenie** - udostępnianie kalendarzy
- 🔗 **Integracje** - Outlook, Apple Calendar

---

## ✅ CHECKLIST WDROŻENIA

### Backend:
- [x] Tabela calendar_entries z indeksami
- [x] POST /events - automatyczna synchronizacja
- [x] GET /api/calendar/events
- [x] GET /api/calendar/client/:clientId
- [x] POST /api/calendar/entries/:eventId/add-user
- [x] DELETE /api/calendar/entries/:entryId

### Frontend - Calendar Manager:
- [x] Klasa CalendarManager
- [x] Widok Lista - wszystkie nadchodzące
- [x] Widok Tydzień - 7 kolumn
- [x] Widok Miesiąc - siatka dni
- [x] Nawigacja ◀ ▶ Dzisiaj
- [x] Przełączanie widoków
- [x] Scrollowanie list
- [x] Statystyki
- [x] Event Bus integration

### Frontend - Client Calendar:
- [x] Klasa ClientCalendar
- [x] Filtry (typ, czas)
- [x] Statystyki (pilne/nadchodzące/wszystkie)
- [x] Badge pilności
- [x] Animacje (pulsujący DZIŚ)
- [x] Szczegóły wydarzenia

### Testy:
- [x] Dodawanie wydarzenia → trafia do kalendarzy
- [x] Przełączanie widoków → działa
- [x] Nawigacja między okresami → działa
- [x] Scrollowanie długich list → działa
- [x] Kliknięcie na wydarzenie → szczegóły
- [x] Modal dnia (widok miesięczny) → działa
- [x] Filtry w kalendarzu klienta → działają

---

## 🎉 PODSUMOWANIE

System kalendarza jest **w pełni funkcjonalny** i gotowy do użycia produkcyjnego!

**Zalety:**
- ✅ Automatyczna synchronizacja - zero ręcznej pracy
- ✅ 3 widoki - elastyczność dla użytkownika
- ✅ Piękny UI - gradient, animacje, kolory
- ✅ Responsywny - działa na każdym ekranie
- ✅ Intuicyjny - kliknij i używaj
- ✅ Wydajny - indeksy w bazie, cache w przeglądarce
- ✅ Modułowy - łatwe rozszerzanie

**Wsparcie:**
- Backend: Node.js + Express + SQLite
- Frontend: Vanilla JS (zero dependencies!)
- Styling: Inline styles + transitions
- Komunikacja: Event Bus

**Używaj i ciesz się! 🚀**
