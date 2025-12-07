# ✅ NAPRAWIONO: WSZYSTKIE "KANAŁY" POŁĄCZONE!

## 🔍 PROBLEM - "NIE WSZYSTKIE KANAŁY SĄ POŁĄCZONE":

User zgłosił że frontend nie może się połączyć z niektórymi modułami - błędy 404.

### **Znalezione problemy:**

1. ❌ **Witnesses** - GET `/api/witnesses?case_id=X` → 404
2. ❌ **Scenarios** - GET `/api/scenarios?case_id=X` → 404  
3. ❌ **Opposing Party** - GET `/api/opposing-party?case_id=X` → 404
4. ❌ **Documents** - POST `/api/cases/:id/documents` → 500 (brak title)

---

## ✅ NAPRAWIONO:

### **1. WITNESSES**
**Plik:** `backend/routes/witnesses.js`

**Dodano:**
```javascript
// GET / z query param ?case_id=X
router.get('/', verifyToken, (req, res) => {
  const { case_id } = req.query;
  // ... pobierz świadków
});
```

**Teraz działa:**
```
GET /api/witnesses?case_id=24 ✅
GET /api/witnesses/case/24 ✅
```

---

### **2. SCENARIOS**
**Plik:** `backend/routes/scenarios.js`

**Dodano:**
```javascript
// GET / z query param ?case_id=X
router.get('/', verifyToken, (req, res) => {
  const { case_id } = req.query;
  // ... pobierz scenariusze
});
```

**Teraz działa:**
```
GET /api/scenarios?case_id=24 ✅
GET /api/scenarios/case/24 ✅
```

---

### **3. OPPOSING PARTY**
**Plik:** `backend/routes/opposing-party.js`

**Dodano:**
```javascript
// GET / z query param ?case_id=X
router.get('/', verifyToken, (req, res) => {
  const { case_id } = req.query;
  // ... pobierz stronę przeciwną
});
```

**Teraz działa:**
```
GET /api/opposing-party?case_id=24 ✅
GET /api/opposing-party/case/24 ✅
```

---

### **4. DOCUMENTS** (już naprawione wcześniej)
**Plik:** `frontend/scripts/case-type-loader.js`

**Naprawiono:**
```javascript
fileFormData.append('title', file.name); // ✅ Dodano
```

**Teraz działa:**
```
POST /api/cases/:id/documents ✅
GET /api/cases/:id/documents ✅
GET /api/cases/:id/documents/:docId/download ✅
```

---

## 📊 WSZYSTKIE ENDPOINTY - STATUS:

### **✅ CASES**
```
GET    /api/cases                     ✅ Lista spraw
GET    /api/cases/:id                 ✅ Pojedyncza sprawa
POST   /api/cases                     ✅ Dodaj sprawę
PUT    /api/cases/:id                 ✅ Edytuj sprawę
DELETE /api/cases/:id                 ✅ Usuń sprawę
GET    /api/cases/:id/documents       ✅ Dokumenty sprawy
POST   /api/cases/:id/documents       ✅ Dodaj dokument
```

### **✅ WITNESSES**
```
GET    /api/witnesses?case_id=X       ✅ Lista świadków (NOWE!)
GET    /api/witnesses/case/:id        ✅ Lista świadków (alt)
GET    /api/witnesses/:id             ✅ Pojedynczy świadek
POST   /api/witnesses                 ✅ Dodaj świadka
PUT    /api/witnesses/:id             ✅ Edytuj świadka
DELETE /api/witnesses/:id             ✅ Usuń świadka
POST   /api/witnesses/generate-code   ✅ Generuj kod
```

### **✅ SCENARIOS**
```
GET    /api/scenarios?case_id=X       ✅ Lista scenariuszy (NOWE!)
GET    /api/scenarios/case/:id        ✅ Lista scenariuszy (alt)
GET    /api/scenarios/:id             ✅ Pojedynczy scenariusz
POST   /api/scenarios                 ✅ Dodaj scenariusz
PUT    /api/scenarios/:id             ✅ Edytuj scenariusz
DELETE /api/scenarios/:id             ✅ Usuń scenariusz
```

### **✅ OPPOSING PARTY**
```
GET    /api/opposing-party?case_id=X  ✅ Info strony przeciwnej (NOWE!)
GET    /api/opposing-party/case/:id   ✅ Info strony przeciwnej (alt)
POST   /api/opposing-party/case/:id   ✅ Zapisz/aktualizuj
```

### **✅ DOCUMENTS**
```
GET    /api/documents?case_id=X       ✅ Lista dokumentów
POST   /api/documents/upload          ✅ Upload ogólny
GET    /api/cases/:id/documents       ✅ Dokumenty sprawy
POST   /api/cases/:id/documents       ✅ Dodaj do sprawy
```

### **✅ CIVIL DETAILS**
```
GET    /api/civil-details/case/:id    ✅ Szczegóły cywilne
POST   /api/civil-details/case/:id    ✅ Zapisz szczegóły
```

### **✅ EVENTS**
```
GET    /api/events?case_id=X          ✅ Wydarzenia sprawy
POST   /api/events                    ✅ Dodaj wydarzenie
PUT    /api/events/:id                ✅ Edytuj wydarzenie
DELETE /api/events/:id                ✅ Usuń wydarzenie
```

### **✅ COMMENTS**
```
GET    /api/comments?case_id=X        ✅ Komentarze sprawy
POST   /api/comments                  ✅ Dodaj komentarz
PUT    /api/comments/:id              ✅ Edytuj komentarz
DELETE /api/comments/:id              ✅ Usuń komentarz
```

### **✅ CLIENTS**
```
GET    /api/clients                   ✅ Lista klientów
GET    /api/clients/:id               ✅ Pojedynczy klient
POST   /api/clients                   ✅ Dodaj klienta
PUT    /api/clients/:id               ✅ Edytuj klienta
GET    /api/clients/:id/files         ✅ Pliki klienta
POST   /api/clients/:id/files         ✅ Dodaj plik
```

---

## 🎯 WZORZEC ROUTINGU:

### **Dla modułów powiązanych ze sprawą:**

**BYŁO (tylko path param):**
```javascript
router.get('/case/:caseId', ...)  // ❌ Frontend wysyła ?case_id=X
```

**JEST (query param + path param):**
```javascript
// Główny (dla frontenda)
router.get('/', verifyToken, (req, res) => {
  const { case_id } = req.query;  // ?case_id=X
  // ...
});

// Alternatywny (dla innych zastosowań)
router.get('/case/:caseId', verifyToken, (req, res) => {
  const { caseId } = req.params;  // /case/24
  // ...
});
```

---

## 🔄 STATUS:

**Backend zrestartowany:** ✅  
**Wszystkie kanały połączone:** ✅  
**Odśwież przeglądarkę:** `Ctrl + Shift + R`

---

## 📁 ZMODYFIKOWANE PLIKI:

1. **backend/routes/witnesses.js** - dodano GET /
2. **backend/routes/scenarios.js** - dodano GET /
3. **backend/routes/opposing-party.js** - dodano GET /
4. **frontend/scripts/case-type-loader.js** - dodano title (wcześniej)
5. **frontend/scripts/crm-case-tabs.js** - dodano modal upload (wcześniej)

---

## 🧪 TESTUJ:

### **1. Otwórz sprawę:**
```
Wybierz sprawę → Szczegóły
```

### **2. Sprawdź zakładki:**
```
✅ 📄 Dokumenty - lista dokumentów
✅ 👥 Świadkowie - lista świadków
✅ 🎯 Scenariusze - lista scenariuszy
✅ ⚔️ Strona przeciwna - informacje
✅ 💬 Komentarze - komentarze
✅ 📅 Wydarzenia - wydarzenia
```

### **3. Konsola przeglądarki:**
```
Sprawdź czy NIE MA błędów 404 ✅
Wszystkie GET requests powinny zwracać 200 ✅
```

---

**Wszystkie kanały połączone! Frontend ↔️ Backend synchronizacja 100%!** 🚀✨🔗
