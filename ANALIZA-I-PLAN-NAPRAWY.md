# 📋 KOMPLETNA ANALIZA I PLAN NAPRAWY SYSTEMU UPRAWNIEŃ

**Data analizy:** 14 listopada 2025, 00:05  
**Wykonawca:** Cascade AI  
**Status:** 🔍 ANALIZA ZAKOŃCZONA - PLAN GOTOWY

---

## 🎯 WYMAGANIA BIZNESOWE (przypomnienie)

### 👔 Mecenas (lawyer)
- Widzi **swoje sprawy** gdzie `cases.assigned_to = user_id`
- Widzi **klientów ze swoich spraw**
- Ma własny Employee Dashboard

### 📋 Opiekun sprawy (case_manager)  
- Widzi **swoje sprawy** gdzie `cases.additional_caretaker = user_id`
- Widzi **klientów ze swoich spraw**
- Ma własny Employee Dashboard

### 👥 Opiekun klienta (client_manager)
- Widzi **sprawy swoich klientów** gdzie `clients.assigned_to = user_id`
- Widzi **swoich klientów** gdzie `clients.assigned_to = user_id`
- Ma własny Employee Dashboard

### 📞 Recepcja (reception)
- Widzi **wszystkich klientów**
- Widzi **wszystkie sprawy**
- Ma własny Employee Dashboard
- Może przypisywać zadania, tworzyć spotkania

### 👑 Admin (admin)
- Widzi **absolutnie wszystko**
- Pełna kontrola nad systemem

---

## ✅ CO ZOSTAŁO JUŻ ZROBIONE

### 1. Backend - endpoint `/api/cases` ✅
**Plik:** `backend/routes/cases.js` linie 113-170

**Status:** ✅ ZROBIONE - dodano filtrowanie według roli

```javascript
if (userRole === ROLES.LAWYER) {
    query += ` AND c.assigned_to = ?`;
} else if (userRole === ROLES.CASE_MANAGER) {
    query += ` AND c.additional_caretaker = ?`;
} else if (userRole === ROLES.CLIENT_MANAGER) {
    query += ` AND cl.assigned_to = ?`;
}
// Admin i recepcja - bez filtra (wszystkie sprawy)
```

**Efekt:** Główny widok CRM pokazuje tylko właściwe sprawy dla każdej roli.

---

### 2. Backend - endpoint `/api/cases/my-cases` ✅
**Plik:** `backend/routes/cases.js` linie 52-110

**Status:** ✅ ZROBIONE - dedykowany endpoint dla dashboardów

```javascript
router.get('/my-cases', verifyToken, (req, res) => {
  // Zwraca sprawy według roli + user_role w odpowiedzi
});
```

**Efekt:** Dashboardy mogą pobrać sprawy użytkownika z informacją o roli.

---

### 3. Frontend - Employee Dashboard dla managerów ✅
**Plik:** `frontend/scripts/dashboards/employee-dashboard.js`

**Status:** ✅ ZROBIONE
- Dashboard używa `/cases/my-cases`
- Modalne okna pokazują właściwe tytuły według roli
- Kliknięcie w kafelek "Sprawy" pokazuje tylko właściwe sprawy

---

### 4. Frontend - widoczność przycisków ✅
**Plik:** `frontend/scripts/app.js` linie 61-68, 80-89

**Status:** ✅ ZROBIONE

```javascript
const roleVisibility = {
    client_manager: ['.lawyer-only'],
    case_manager: ['.lawyer-only'],
    reception: ['.lawyer-only']
};
```

**Efekt:** Managerowie widzą przycisk "Mój Dashboard" i inne opcje.

---

### 5. Frontend - rozpoznawanie ról ✅
**Plik:** `frontend/scripts/auth.js` linie 195-198

**Status:** ✅ ZROBIONE

```javascript
const userRole = this.currentUser.user_role || this.currentUser.role;
app.adjustUIForRole(userRole, isNewLogin);
```

**Efekt:** Aplikacja poprawnie rozpoznaje role managerów.

---

## ❌ CO JESZCZE WYMAGA NAPRAWY

### 🔴 PROBLEM #1: Endpoint `/api/clients` nie filtruje według roli!

**Plik:** `backend/routes/clients.js` linie 8-40

**Obecny kod:**
```javascript
router.get('/', verifyToken, (req, res) => {
  let query = 'SELECT * FROM clients WHERE (status IS NULL OR status != "deleted")';
  // BRAK FILTROWANIA WEDŁUG ROLI!
});
```

**Problem:**
- ✅ Mecenas widzi **WSZYSTKICH** klientów (powinien tylko swoich ze spraw)
- ✅ Opiekun sprawy widzi **WSZYSTKICH** klientów (powinien tylko ze swoich spraw)  
- ✅ Opiekun klienta widzi **WSZYSTKICH** klientów (powinien tylko swoich assigned_to)
- ✅ Recepcja widzi wszystkich (OK ✅)
- ✅ Admin widzi wszystkich (OK ✅)

**Priorytet:** 🔥 WYSOKI - naruszenie bezpieczeństwa danych!

---

### 🔴 PROBLEM #2: Brak endpointu `/api/clients/my-clients` dla dashboardów

**Problem:**
Dashboard używa logiki pobierania klientów ze spraw, ale brakuje dedykowanego endpointu podobnego do `/cases/my-cases`.

**Efekt:**
- Dashboard Employee musi ręcznie filtrować klientów z pobranych spraw
- Niekonsystentne z podejściem do spraw
- Trudniejsze debugowanie

**Priorytet:** 🟡 ŚREDNI - funkcjonalnie działa, ale kod jest niespójny

---

### 🔴 PROBLEM #3: CRM może pokazywać nieodpowiednie karty klientów

**Plik:** `frontend/scripts/crm.js` (prawdopodobnie)

**Problem:**
Jeśli główny widok CRM ładuje klientów przez `/clients`, to pokazuje wszystkich mimo że nie powinien.

**Priorytet:** 🔥 WYSOKI

---

## 📝 SZCZEGÓŁOWY PLAN NAPRAWY

### KROK 1: Napraw endpoint `/api/clients` 🔥
**Priorytet:** KRYTYCZNY  
**Szacowany czas:** 15 minut

**Akcje:**
1. Dodać filtrowanie według roli w `backend/routes/clients.js`
2. Mecenas → klienci ze spraw gdzie `assigned_to`
3. Opiekun sprawy → klienci ze spraw gdzie `additional_caretaker`
4. Opiekun klienta → klienci gdzie `clients.assigned_to`
5. Recepcja/Admin → wszyscy klienci

**Kod:**
```javascript
router.get('/', verifyToken, (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.user_role || req.user.role;
  
  let query = `SELECT DISTINCT c.* FROM clients c WHERE (c.status IS NULL OR c.status != "deleted")`;
  const params = [];
  
  if (userRole === 'lawyer') {
    query = `SELECT DISTINCT c.* FROM clients c
             JOIN cases ca ON ca.client_id = c.id
             WHERE (c.status IS NULL OR c.status != "deleted")
             AND ca.assigned_to = ?`;
    params.push(userId);
  } else if (userRole === 'case_manager') {
    query = `SELECT DISTINCT c.* FROM clients c
             JOIN cases ca ON ca.client_id = c.id
             WHERE (c.status IS NULL OR c.status != "deleted")
             AND ca.additional_caretaker = ?`;
    params.push(userId);
  } else if (userRole === 'client_manager') {
    query += ` AND c.assigned_to = ?`;
    params.push(userId);
  }
  // Admin i recepcja - bez filtra
});
```

---

### KROK 2: Dodaj endpoint `/api/clients/my-clients` 🟡
**Priorytet:** ŚREDNI  
**Szacowany czas:** 10 minut

**Akcje:**
1. Utworzyć nowy endpoint `/clients/my-clients`
2. Zwracać klientów + `user_role` w odpowiedzi (konsystencja z `/cases/my-cases`)
3. Użyć tej samej logiki filtrowania co w KROK 1

**Kod:**
```javascript
router.get('/my-clients', verifyToken, (req, res) => {
  // Taka sama logika jak /clients ale z user_role w odpowiedzi
  res.json({ clients: clients || [], user_role: userRole });
});
```

---

### KROK 3: Zaktualizuj frontend dashboardów 🟡
**Priorytet:** ŚREDNI  
**Szacowany czas:** 5 minut

**Akcje:**
1. Zmienić `employee-dashboard.js` aby używał `/clients/my-clients` zamiast logiki ze spraw
2. Uprościć kod `showClientsModal()`

**Przed:**
```javascript
const casesResponse = await window.api.request(`/cases/my-cases`);
// Ręczne wyciąganie klientów ze spraw...
```

**Po:**
```javascript
const response = await window.api.request(`/clients/my-clients`);
const clients = response.clients;
const userRole = response.user_role;
```

---

### KROK 4: Restart i testy 🧪
**Priorytet:** KRYTYCZNY  
**Szacowany czas:** 15 minut

**Scenariusze testowe:**

**Test 1: Mecenas**
- Zaloguj jako mecenas ID=52
- CRM → zakładka Klienci → powinien widzieć tylko klientów ze swoich spraw
- Dashboard → kafelek Klienci → powinien widzieć tych samych
- ✅ PASS jeśli liczby się zgadzają

**Test 2: Opiekun klienta**  
- Zaloguj jako client_manager ID=51
- CRM → zakładka Klienci → powinien widzieć tylko swoich klientów (assigned_to)
- Dashboard → kafelek Klienci → powinien widzieć tych samych
- ✅ PASS jeśli liczby się zgadzają

**Test 3: Opiekun sprawy**
- Zaloguj jako case_manager
- CRM → zakładka Klienci → powinien widzieć klientów ze spraw gdzie jest opiekunem
- Dashboard → kafelek Klienci → powinien widzieć tych samych
- ✅ PASS jeśli liczby się zgadzają

**Test 4: Recepcja**
- Zaloguj jako recepcja
- CRM → zakładka Klienci → powinien widzieć WSZYSTKICH klientów
- Dashboard → kafelek Klienci → powinien widzieć WSZYSTKICH
- ✅ PASS jeśli widzi wszystko

**Test 5: Admin**
- Zaloguj jako admin
- Wszystko działa bez ograniczeń
- ✅ PASS

---

## 📊 PODSUMOWANIE STANU

| Komponent | Status | Problem | Priorytet |
|-----------|--------|---------|-----------|
| `/api/cases` | ✅ DZIAŁA | - | - |
| `/api/cases/my-cases` | ✅ DZIAŁA | - | - |
| `/api/clients` | ❌ WYMAGA NAPRAWY | Brak filtrowania | 🔥 WYSOKI |
| `/api/clients/my-clients` | ❌ NIE ISTNIEJE | Brak endpointu | 🟡 ŚREDNI |
| Employee Dashboard (sprawy) | ✅ DZIAŁA | - | - |
| Employee Dashboard (klienci) | 🟡 DZIAŁA CZĘŚCIOWO | Ręczne filtrowanie | 🟡 ŚREDNI |
| CRM widok spraw | ✅ DZIAŁA | - | - |
| CRM widok klientów | ❌ WYMAGA NAPRAWY | Pokazuje wszystkich | 🔥 WYSOKI |
| Widoczność przycisków | ✅ DZIAŁA | - | - |
| Rozpoznawanie ról | ✅ DZIAŁA | - | - |

---

## 🎯 KOLEJNOŚĆ WYKONANIA (rekomendowana)

1. **KROK 1** - Napraw `/api/clients` (🔥 KRYTYCZNE)
2. **KROK 4** - Testy podstawowe (sprawdź czy KROK 1 działa)
3. **KROK 2** - Dodaj `/api/clients/my-clients` (🟡 nice-to-have)
4. **KROK 3** - Zaktualizuj dashboard (🟡 nice-to-have)
5. **KROK 4** - Pełne testy wszystkich ról

---

## ⏱️ SZACOWANY CZAS CAŁKOWITY

- KROK 1: 15 min (krytyczny)
- KROK 2: 10 min (opcjonalny)
- KROK 3: 5 min (opcjonalny)
- KROK 4: 15 min (testy)

**RAZEM:** 45 minut (z pełnymi testami)  
**MINIMUM:** 30 minut (tylko krytyczne kroki 1 + 4)

---

## 🚀 GOTOWY DO WDROŻENIA

Czy mam rozpocząć implementację według tego planu?

**Rekomendacja:** Zacznijmy od KROKU 1 (napraw `/api/clients`) i podstawowych testów. Potem możemy zdecydować czy potrzebujemy KROK 2 i 3.

---

**Autor:** Cascade AI  
**Data:** 2025-11-14 00:05  
**Wersja:** 1.0
