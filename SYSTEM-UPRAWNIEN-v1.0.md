# 🔐 SYSTEM UPRAWNIEŃ DO SPRAW v1.0 - DOKUMENTACJA KOMPLETNA

## 📋 SPIS TREŚCI
1. [Przegląd systemu](#przegląd-systemu)
2. [Architektura](#architektura)
3. [Baza danych](#baza-danych)
4. [Backend API](#backend-api)
5. [Frontend](#frontend)
6. [Workflow użytkowania](#workflow-użytkowania)
7. [Testy](#testy)
8. [Rozszerzenia przyszłe](#rozszerzenia-przyszłe)

---

## 🎯 PRZEGLĄD SYSTEMU

### **3 poziomy dostępu do spraw:**

```
┌──────────────────────────────────────────────┐
│  POZIOM 1: Dostęp oparty na roli (built-in)  │
│  - Admin: wszystko                            │
│  - Mecenas przypisany: pełny dostęp          │
│  - Utworzyciel sprawy: pełny dostęp          │
│  - Klient: tylko swoje sprawy                │
└──────────────────────────────────────────────┘
               ▼
┌──────────────────────────────────────────────┐
│  POZIOM 2: Uprawnienia czasowe (24h-720h)    │
│  - Nadawane przez mecenasa/admina            │
│  - Automatyczne wygasanie                    │
│  - Możliwość przedłużenia                    │
│  - Powiadomienie na czat                     │
└──────────────────────────────────────────────┘
               ▼
┌──────────────────────────────────────────────┐
│  POZIOM 3: Uprawnienia stałe                 │
│  - Nigdy nie wygasają                        │
│  - Można odwołać ręcznie                     │
│  - Dla stałych współpracowników              │
└──────────────────────────────────────────────┘
               ▼
┌──────────────────────────────────────────────┐
│  POZIOM 4: Dostęp przez hasło (fallback)     │
│  - Jeśli brak uprawnień                      │
│  - Modal z prośbą o hasło                    │
│  - Auto-tworzy uprawnienie czasowe (24h)     │
└──────────────────────────────────────────────┘
```

---

## 🏗️ ARCHITEKTURA

### **Komponenty systemu:**

#### 1. **Baza danych** (`backend/database/init.js`)
- Tabela `case_permissions`
- Indeksy dla szybkiego wyszukiwania
- Relacje z `cases` i `users`

#### 2. **Backend API** (`backend/routes/case-permissions.js`)
- 6 endpointów REST
- Middleware autoryzacji
- Walidacja danych

#### 3. **Middleware** (`backend/middleware/case-access.js`)
- Funkcja `checkCaseAccess`
- 4-poziomowa weryfikacja dostępu
- Logowanie do `case_access_log`

#### 4. **Frontend** (`frontend/scripts/modules/case-permissions-module.js`)
- Zakładka "🔐 Uprawnienia" w szczegółach sprawy
- Modalne okna nadawania dostępu
- Lista aktywnych i nieaktywnych uprawnień

#### 5. **Czat firmowy** (integracja)
- Powiadomienia o nadaniu dostępu
- Socket.IO real-time
- Historia wiadomości

---

## 🗄️ BAZA DANYCH

### **Tabela: `case_permissions`**

```sql
CREATE TABLE case_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,                       -- ID sprawy
  user_id INTEGER NOT NULL,                       -- ID użytkownika
  permission_type TEXT NOT NULL                   -- 'temporary' | 'permanent'
    CHECK(permission_type IN ('temporary', 'permanent')),
  granted_by INTEGER NOT NULL,                    -- Kto nadał
  granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Kiedy nadano
  expires_at DATETIME,                            -- NULL = stałe, data = wygasa
  revoked_at DATETIME,                            -- Kiedy odwołano
  revoked_by INTEGER,                             -- Kto odwołał
  notes TEXT,                                     -- Notatka (powód, cel)
  
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES users(id),
  FOREIGN KEY (revoked_by) REFERENCES users(id)
);

-- Indeksy
CREATE INDEX idx_permissions_case ON case_permissions(case_id);
CREATE INDEX idx_permissions_user ON case_permissions(user_id);
CREATE INDEX idx_permissions_expires ON case_permissions(expires_at);
CREATE INDEX idx_permissions_active 
  ON case_permissions(case_id, user_id, revoked_at);
```

### **Przykładowe dane:**

```json
{
  "id": 1,
  "case_id": 123,
  "user_id": 5,
  "permission_type": "temporary",
  "granted_by": 2,
  "granted_at": "2025-11-14 02:00:00",
  "expires_at": "2025-11-15 02:00:00",  // 24h później
  "revoked_at": null,
  "revoked_by": null,
  "notes": "Konsultacja prawna"
}
```

---

## 🔌 BACKEND API

### **Endpoint 1: Nadaj dostęp czasowy**

```http
POST /api/case-permissions/:caseId/grant-temporary
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 5,
  "hours": 24,              // domyślnie 24, max 720 (30 dni)
  "notes": "Konsultacja prawna"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dostęp czasowy nadany pomyślnie",
  "permission": {
    "id": 1,
    "case_id": 123,
    "user_id": 5,
    "user_name": "Jan Kowalski",
    "user_email": "jan.kowalski@kancelaria.pl",
    "permission_type": "temporary",
    "expires_at": "2025-11-15T02:00:00Z",
    "hours": 24
  }
}
```

### **Endpoint 2: Nadaj dostęp stały**

```http
POST /api/case-permissions/:caseId/grant-permanent
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 5,
  "notes": "Stały współpracownik"
}
```

### **Endpoint 3: Odbierz dostęp**

```http
POST /api/case-permissions/:caseId/revoke/:permissionId
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Zakończono współpracę"
}
```

### **Endpoint 4: Przedłuż dostęp**

```http
POST /api/case-permissions/:caseId/extend/:permissionId
Authorization: Bearer {token}
Content-Type: application/json

{
  "additional_hours": 24
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dostęp przedłużony pomyślnie",
  "new_expires_at": "2025-11-16T02:00:00Z"
}
```

### **Endpoint 5: Lista uprawnień**

```http
GET /api/case-permissions/:caseId/list
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "permissions": [
    {
      "id": 1,
      "case_id": 123,
      "user_id": 5,
      "user_name": "Jan Kowalski",
      "user_email": "jan.kowalski@kancelaria.pl",
      "user_role": "case_manager",
      "permission_type": "temporary",
      "granted_by": 2,
      "granted_by_name": "Admin",
      "granted_at": "2025-11-14T02:00:00Z",
      "expires_at": "2025-11-15T02:00:00Z",
      "revoked_at": null,
      "notes": "Konsultacja prawna",
      "is_active": true,
      "is_expired": false,
      "is_revoked": false
    }
  ]
}
```

### **Endpoint 6: Historia dostępów**

```http
GET /api/case-permissions/:caseId/access-history
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "access_logs": [
    {
      "id": 1,
      "case_id": 123,
      "user_id": 5,
      "user_name": "Jan Kowalski",
      "access_method": "password",
      "created_at": "2025-11-14T01:30:00Z"
    }
  ],
  "permissions": [/* lista uprawnień */],
  "total_access_count": 5,
  "total_permissions_granted": 2
}
```

---

## 🖥️ FRONTEND

### **Zakładka "🔐 Uprawnienia" w sprawie**

#### **Lokalizacja:**
- Otwórz sprawę → Zakładka "🔐 Uprawnienia"

#### **Funkcje:**

1. **Lista aktywnych uprawnień:**
   - Karta dla każdego użytkownika
   - Typ dostępu (stały/czasowy)
   - Czas wygaśnięcia (dla czasowych)
   - Przyciski akcji

2. **Przycisk "➕ Nadaj dostęp":**
   - Modal z formularzem
   - Wybór użytkownika z listy
   - Typ dostępu (czasowy/stały)
   - Liczba godzin (dla czasowych)
   - Notatka (opcjonalna)

3. **Akcje na uprawnieniach:**
   - **⏱️ Przedłuż** - dodaj więcej godzin
   - **❌ Odbierz** - odwołaj dostęp

4. **Historia dostępów:**
   - Ostatnie 20 wpisów
   - Kto, kiedy, jak (przez hasło/uprawnienie)

### **Pliki:**
- `frontend/scripts/modules/case-permissions-module.js` (469 linii)
- `frontend/styles/case-permissions.css` (kompletne style)

---

## 💬 CZAT FIRMOWY - POWIADOMIENIA

### **Automatyczne powiadomienia:**

#### **1. Nadano dostęp czasowy:**
```
🔓 **Nadano dostęp do sprawy**

**Sprawa:** CYW/JK/001
**Tytuł:** Sprawa rozwodowa
**Typ dostępu:** ⏱️ Czasowy
⏰ **Dostęp wygasa:** 2025-11-15 02:00

Możesz teraz otworzyć tę sprawę bez hasła.
```

#### **2. Nadano dostęp stały:**
```
🔓 **Nadano dostęp do sprawy**

**Sprawa:** CYW/JK/001
**Tytuł:** Sprawa rozwodowa
**Typ dostępu:** ✅ Stały

Możesz teraz otworzyć tę sprawę bez hasła.
```

### **Funkcja:**
```javascript
async notifyChatAboutAccess(permission) {
  // Pobiera dane sprawy
  // Formatuje wiadomość
  // Wysyła przez /chat/messages
  // Socket.IO real-time delivery
}
```

---

## 🎯 WORKFLOW UŻYTKOWANIA

### **Scenariusz 1: Mecenas nadaje dostęp czasowy**

1. Mecenas otwiera sprawę
2. Przechodzi do zakładki "🔐 Uprawnienia"
3. Klika "➕ Nadaj dostęp"
4. Modal: wybiera użytkownika (np. asystent)
5. Wybiera "⏱️ Czasowy", ustawia 24h
6. Dodaje notatkę: "Konsultacja prawna"
7. Klika "✓ Nadaj dostęp"

**System:**
- Zapisuje uprawnienie do `case_permissions`
- Ustawia `expires_at` na +24h
- Wysyła powiadomienie na czat do asystenta
- Odświeża listę uprawnień

**Asystent:**
- Otrzymuje wiadomość na czacie
- Może otworzyć sprawę bez hasła przez 24h
- Po 24h dostęp automatycznie wygasa

### **Scenariusz 2: Dostęp przez hasło (auto-grant)**

1. Użytkownik bez uprawnień próbuje otworzyć sprawę
2. System zwraca 403 + `requiresPassword: true`
3. Frontend pokazuje modal: "🔒 Wymagane hasło dostępu"
4. Użytkownik wpisuje hasło (z czatu/maila)
5. Frontend ponawia request z `x-case-password` header

**System:**
- Weryfikuje hasło
- **Automatycznie tworzy uprawnienie czasowe (24h)**
- Loguje dostęp do `case_access_log`
- Zwraca dane sprawy

**Użytkownik:**
- Widzi sprawę
- Przez kolejne 24h NIE potrzebuje hasła
- Po 24h znów będzie musiał podać hasło

### **Scenariusz 3: Przedłużenie dostępu**

1. Mecenas widzi że dostęp wygasa za 2h
2. Klika "⏱️ Przedłuż" na karcie użytkownika
3. Podaje liczbę godzin: 48h
4. System dodaje 48h do `expires_at`
5. Użytkownik ma dostęp przez kolejne 48h

### **Scenariusz 4: Odwołanie dostępu**

1. Mecenas klika "❌ Odbierz"
2. Podaje powód: "Zakończono współpracę"
3. System ustawia `revoked_at` i `revoked_by`
4. Użytkownik traci dostęp natychmiast
5. Uprawnienie pojawia się w "📋 Historia nieaktywnych"

---

## ✅ TESTY

### **TEST 1: Nadanie dostępu czasowego**

```
1. Zaloguj się jako mecenas
2. Otwórz sprawę
3. Zakładka "🔐 Uprawnienia"
4. Kliknij "➕ Nadaj dostęp"
5. Wybierz użytkownika
6. Typ: Czasowy, 24h
7. Notatka: "Test"
8. Zapisz

Oczekiwany rezultat:
✅ Uprawnienie pojawia się na liście
✅ Status: "✅ Aktywne"
✅ Wygasa za: 24h
✅ Powiadomienie wysłane na czat
✅ Baza danych: rekord w case_permissions
```

### **TEST 2: Dostęp użytkownika z uprawnieniem**

```
1. Zaloguj się jako użytkownik z TEST 1
2. Otwórz listę spraw
3. Znajdź sprawę z nadanym dostępem
4. Kliknij "Otwórz sprawę"

Oczekiwany rezultat:
✅ Sprawa otwiera się BEZ prośby o hasło
✅ Backend log: "✅ Użytkownik X ma CZASOWY dostęp"
✅ Widoczne wszystkie dane sprawy
```

### **TEST 3: Przedłużenie dostępu**

```
1. Jako mecenas otwórz uprawnienia
2. Znajdź uprawnienie czasowe
3. Kliknij "⏱️ Przedłuż"
4. Podaj: 48h
5. Zatwierdź

Oczekiwany rezultat:
✅ expires_at zwiększone o 48h
✅ Lista zaktualizowana
✅ Czas wygaśnięcia: +48h od teraz
```

### **TEST 4: Odwołanie dostępu**

```
1. Jako mecenas kliknij "❌ Odbierz"
2. Powód: "Test odwołania"
3. Zatwierdź
4. Zaloguj się jako ten użytkownik
5. Spróbuj otworzyć sprawę

Oczekiwany rezultat:
✅ revoked_at zapisane w bazie
✅ Uprawnienie w sekcji "nieaktywne"
✅ Użytkownik dostaje 403 + requiresPassword
✅ Modal z prośbą o hasło
```

### **TEST 5: Dostęp przez hasło (fallback)**

```
1. Zaloguj się jako użytkownik BEZ uprawnień
2. Spróbuj otworzyć sprawę
3. Modal: "🔒 Wymagane hasło"
4. Wpisz poprawne hasło
5. Kliknij "✓ Potwierdź"

Oczekiwany rezultat:
✅ Sprawa otwiera się
✅ Backend: auto-tworzy uprawnienie 24h
✅ Log: case_access_log + case_permissions
✅ Przez 24h nie potrzebuje hasła
```

### **TEST 6: Wygasłe uprawnienie**

```
1. Nadaj uprawnienie na 1 minutę (zmień w kodzie)
2. Poczekaj 1 minutę
3. Użytkownik próbuje otworzyć sprawę

Oczekiwany rezultat:
✅ Backend log: "⏰ Dostęp czasowy WYGASŁ"
✅ 403 + requiresPassword: true
✅ Modal z prośbą o hasło
✅ Uprawnienie w sekcji "nieaktywne"
```

---

## 🚀 ROZSZERZENIA PRZYSZŁE

### **Możliwe ulepszenia:**

#### 1. **Powiadomienia Email**
- Wysyłaj email przy nadaniu dostępu
- Przypomnienie przed wygaśnięciem
- Potwierdzenie odwołania

#### 2. **Automatyczne przedłużanie**
- Checkbox "Przedłużaj automatycznie"
- Przed wygaśnięciem: +24h
- Maksymalna liczba przedłużeń

#### 3. **Poziomy dostępu**
- Nie tylko "pełny dostęp"
- Typ: tylko_odczyt, edycja_dokumentów, etc.
- Granularna kontrola

#### 4. **Grupy użytkowników**
- Nadaj dostęp całej grupie (np. zespół prawny)
- Jeden wpis → wielu użytkowników
- Centralne zarządzanie

#### 5. **Eksport uprawnień**
- Raport PDF: kto, kiedy, jak długo
- Excel: historia dostępów
- Audit trail

#### 6. **Dashboard uprawnień**
- Zakladka "Uprawnienia" w panelu admina
- Globalna lista wszystkich uprawnień
- Filtrowanie, sortowanie, eksport

#### 7. **Logowanie szczegółowe**
- Co użytkownik robił w sprawie
- Jakie dokumenty otworzył
- Jakie akcje wykonał

#### 8. **Limity czasowe**
- Max 7 dni dla czasowych
- Przypomnienie po 3 dniach
- Auto-odwołanie po X dniach nieaktywności

---

## 📊 STATYSTYKI

### **Zaimplementowane:**

- **Linie kodu (backend):** ~800
- **Linie kodu (frontend):** ~470
- **Linie kodu (CSS):** ~400
- **Endpointy API:** 6
- **Tabele bazy:** 1 nowa
- **Funkcje główne:** 12

### **Pliki zmodyfikowane:**

**Backend (4 pliki):**
1. `backend/database/init.js` - tabela + indeksy
2. `backend/routes/case-permissions.js` - NOWY - 6 endpointów
3. `backend/middleware/case-access.js` - upgrade 4-poziomowy
4. `backend/server.js` - router

**Frontend (4 pliki):**
1. `frontend/scripts/modules/case-permissions-module.js` - NOWY - moduł
2. `frontend/styles/case-permissions.css` - NOWY - style
3. `frontend/scripts/crm-clean.js` - zakładka
4. `frontend/index.html` - import

---

## ✅ STATUS KOŃCOWY

```
┌──────────────────────────────────────────────┐
│           SYSTEM KOMPLETNY ✅                │
├──────────────────────────────────────────────┤
│  ✅ Baza danych                              │
│  ✅ Backend API (6 endpointów)               │
│  ✅ Middleware (4-poziomowy)                 │
│  ✅ Frontend (zakładka + modale)             │
│  ✅ Czat firmowy (powiadomienia)             │
│  ✅ Historia dostępów                        │
│  ✅ Dokumentacja                             │
└──────────────────────────────────────────────┘
```

**Gotowy do produkcji!** 🎉

---

## 📝 AUTORZY

- **Implementacja:** Cascade AI + Dev Team
- **Data:** 2025-11-14
- **Wersja:** 1.0
- **Status:** Production Ready ✅

---

## 🔗 LINKI

- [System Haseł Spraw](./SYSTEM-HASEL-SPRAW-v1.md)
- [Architektura Modularna](./ARCHITEKTURA-MODULARNA-v1.md)
- [API Documentation](./docs/API.md)

---

**© 2025 Pro Meritum - Kancelaria Prawna**
