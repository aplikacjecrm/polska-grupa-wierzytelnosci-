# 📦 MODUŁ DOWODÓW - Dokumentacja

## ✅ ZAIMPLEMENTOWANE:

### 1. BAZA DANYCH
Tabele created in `/backend/database/init.js`:

**case_evidence** - Główna tabela dowodów:
- `id`, `case_id`, `evidence_code` (unikalny kod DOW/TYP/INI/NR/NR)
- **Podstawowe**: `evidence_type`, `name`, `description`
- **Pochodzenie**: `obtained_date`, `obtained_from`, `obtained_method`
- **Ocena**: `significance`, `credibility_score`, `admissibility`
- **Status**: `status`, `presented_date`, `court_decision`
- **Powiązania**: `document_id`, `witness_id`, `related_evidence_ids`
- **Przechowywanie**: `storage_location`, `physical_condition`, `chain_of_custody`
- **Analiza**: `expert_analysis`, `technical_data`
- **Strategia**: `strengths`, `weaknesses`, `usage_strategy`, `notes`

**evidence_history** - Historia zmian dowodu:
- Kto, kiedy i co zmienił
- Pełny audit trail

### 2. BACKEND API (`/backend/routes/evidence.js`)

**Endpointy:**
```
POST   /api/evidence/generate-code        - Generuj kod dowodu
GET    /api/evidence/case/:caseId         - Lista dowodów sprawy
GET    /api/evidence/:id                  - Szczegóły dowodu + historia
POST   /api/evidence                      - Dodaj dowód
PUT    /api/evidence/:id                  - Aktualizuj dowód
DELETE /api/evidence/:id                  - Usuń dowód
POST   /api/evidence/:id/present          - Oznacz jako przedstawiony w sądzie
```

**Generator kodu** (już istniał w `/backend/utils/code-generator.js`):
```javascript
generateEvidenceCode(caseId, evidenceType)
// Format: DOW/CYW/JK/001/001
```

### 3. FRONTEND MODUŁ (`/frontend/scripts/modules/evidence-module.js`)

**Funkcje:**
- `renderTab(caseId)` - Renderuje zakładkę dowodów
- `renderEvidenceList()` - Lista dowodów z kartami
- `renderStats()` - Statystyki (wszystkie, kluczowe, przedstawione, do oceny)
- `renderEvidenceCards()` - Kolorowe karty dowodów
- `applyFilters()` - Filtrowanie (typ, znaczenie, status)

**Pomocnicze:**
- `getTypeEmoji()`, `getTypeLabel()` - Ikony i etykiety typów
- `getSignificanceColor()`, `getStatusColor()` - Kolory znaczenia i statusu
- `renderSignificanceBadge()`, `renderStatusBadge()`, `renderAdmissibilityBadge()` - Odznaki

---

## 📊 TYPY DOWODÓW:

| Typ | Emoji | Opis |
|-----|-------|------|
| `physical` | 📦 | Dowody rzeczowe |
| `document` | 📄 | Dokumenty |
| `testimony` | 🗣️ | Zeznania |
| `expert` | 🎓 | Opinie biegłych |
| `recording` | 🎥 | Nagrania |
| `photo` | 📸 | Zdjęcia |
| `correspondence` | 📧 | Korespondencja |
| `protocol` | 📝 | Protokoły |
| `other` | 📋 | Inne |

---

## 🎯 ZNACZENIA DOWODU:

| Znaczenie | Emoji | Kolor | Opis |
|-----------|-------|-------|------|
| `crucial` | 🔥 | Czerwony | Kluczowy dowód |
| `important` | ⭐ | Pomarańczowy | Ważny dowód |
| `supporting` | ✅ | Niebieski | Wspierający |
| `neutral` | ➖ | Szary | Neutralny |

---

## 📊 STATUSY DOWODU:

| Status | Emoji | Kolor | Opis |
|--------|-------|-------|------|
| `secured` | 🔒 | Niebieski | Zabezpieczony |
| `catalogued` | 📋 | Fioletowy | Skatalogowany |
| `presented` | 📤 | Pomarańczowy | Przedstawiony w sądzie |
| `accepted` | ✅ | Zielony | Przyjęty przez sąd |
| `rejected` | ❌ | Czerwony | Odrzucony przez sąd |
| `challenged` | ⚠️ | Pomarańczowy | Kwestionowany |

---

## ⚖️ DOPUSZCZALNOŚĆ (ADMISSIBILITY):

| Status | Emoji | Kolor | Opis |
|--------|-------|-------|------|
| `admissible` | ✅ | Zielony | Dopuszczony |
| `contested` | ⚠️ | Pomarańczowy | Kwestionowany |
| `rejected` | ❌ | Czerwony | Odrzucony |
| `pending` | ⏳ | Szary | Oczekujący na decyzję |

---

## 🎨 UI/UX:

### Zakładka Dowody:
```
┌────────────────────────────────────────┐
│ 🔍 Dowody w sprawie                     │
│           [➕ Dodaj dowód]             │
├────────────────────────────────────────┤
│ [15] Wszystkich | [3] Kluczowych      │
│ [7] Przedstawionych | [2] Do oceny    │
├────────────────────────────────────────┤
│ Filtry: [Typ▼] [Znaczenie▼] [Status▼] │
├────────────────────────────────────────┤
│ 📄 Umowa sprzedaży              🔥     │
│ DOW/CYW/JK/001/001 • Dokument   ✅     │
│ Opis: Umowa podpisana 15.01...         │
│ Uzyskano: 15.01.2025 | Źródło: Klient │
│ [👁️ Szczegóły] [✏️ Edytuj] [🗑️]      │
├────────────────────────────────────────┤
│ 📸 Zdjęcia uszkodzonego pojazdu ⭐     │
│ ...                                    │
└────────────────────────────────────────┘
```

### Kolorowe karty:
- **Lewa krawędź** - kolor znaczenia (czerwony/pomarańczowy/niebieski/szary)
- **Badge znaczenia** - w prawym górnym rogu
- **Badge statusu** - poniżej znaczenia
- **Badge dopuszczalności** - poniżej statusu
- **Hover effect** - uniesienie karty + cień

---

## 📋 POLA DOWODU - SZCZEGÓŁOWO:

### Podstawowe:
- **Nazwa** * - Krótka nazwa (np. "Umowa sprzedaży")
- **Typ** * - Z listy rozwijanej (9 typów)
- **Opis** - Szczegółowy opis

### Pochodzenie:
- **Data uzyskania** - Kiedy dowód został uzyskany
- **Źródło** - Od kogo/skąd (osoba/instytucja)
- **Sposób uzyskania** - Przeszukanie/wydanie/przekazanie/etc.

### Strony:
- **Przedstawiony przez** - our_side/opposing_side/court/third_party
- **Przeciwko stronie** - Przeciwko komu jest ten dowód

### Ocena:
- **Znaczenie** - crucial/important/supporting/neutral
- **Wiarygodność** - Skala 1-10
- **Dopuszczalność** - admissible/contested/rejected/pending

### Status procesowy:
- **Status** - secured/catalogued/presented/accepted/rejected/challenged
- **Data przedstawienia** - Kiedy przedstawiony w sądzie
- **Decyzja sądu** - Treść decyzji

### Powiązania:
- **ID dokumentu** - Powiązany dokument w systemie
- **ID świadka** - Powiązany świadek
- **Powiązane dowody** - JSON array z ID innych dowodów

### Fizyczne przechowywanie:
- **Miejsce przechowywania** - Gdzie fizycznie znajduje się dowód
- **Stan fizyczny** - Opis stanu
- **Łańcuch dowodowy** - JSON historia posiadania

### Analiza:
- **Opinia biegłego** - Czy była ekspertyza
- **Dane techniczne** - JSON (dla nagrań, zdjęć)

### Strategia:
- **Mocne strony** - Dlaczego jest dobry
- **Słabości** - Jakie są ryzyka
- **Strategia wykorzystania** - Jak go użyć
- **Notatki** - Dodatkowe uwagi

---

## 🔄 PRZEPŁYW PRACY:

1. **Zabezpieczenie** → `secured`
2. **Katalogowanie** → `catalogued` (dodanie szczegółów, ocena)
3. **Przedstawienie** → `presented` (wysłanie/przedłożenie sądowi)
4. **Decyzja sądu** → `accepted` / `rejected` / `challenged`

---

## ⚠️ DO ZROBIENIA (TODO):

### Frontend - Brakujące funkcje:
- [ ] `showAddForm()` - Formularz dodawania dowodu
- [ ] `showEditForm()` - Formularz edycji
- [ ] `viewDetails()` - Szczegóły dowodu z historią
- [ ] `presentEvidence()` - Oznacz jako przedstawiony
- [ ] `deleteEvidence()` - Usuń dowód (z potwierdzeniem)
- [ ] `applyFilters()` - Implementacja filtrów
- [ ] `exportEvidence()` - Eksport do PDF/Excel

### Integracja:
- [ ] Dodać zakładkę "📦 Dowody" do `app-config.js`
- [ ] Import modułu w `index.html`
- [ ] Event Bus integration (`evidence:created`, `evidence:presented`)

### Dodatkowe funkcje:
- [ ] Upload plików do dowodów (zdjęcia, dokumenty)
- [ ] Timeline łańcucha dowodowego (kto kiedy miał)
- [ ] Podgląd powiązanych dokumentów i świadków
- [ ] Masowe akcje (zaznacz wiele → przedstaw wszystkie)
- [ ] Raporty (lista dowodów do PDF, analiza)

---

## 🧪 JAK TESTOWAĆ:

### 1. Restart backendu (już zrobione ✅)

### 2. Sprawdź czy tabele są stworzone:
```sql
SELECT * FROM case_evidence;
SELECT * FROM evidence_history;
```

### 3. Przetestuj API ręcznie:
```javascript
// Generuj kod
await window.api.request('/evidence/generate-code', {
  method: 'POST',
  body: { case_id: 11 }
});

// Dodaj dowód
await window.api.request('/evidence', {
  method: 'POST',
  body: {
    case_id: 11,
    evidence_code: 'DOW/CYW/JK/001/001',
    evidence_type: 'document',
    name: 'Umowa sprzedaży',
    description: 'Umowa podpisana 15.01.2025',
    significance: 'crucial'
  }
});

// Pobierz dowody
const response = await window.api.request('/evidence/case/11');
console.log('Dowody:', response.evidence);
```

---

## 🎯 KORZYŚCI MODUŁU DOWODÓW:

1. **Organizacja** - Wszystkie dowody w jednym miejscu
2. **Śledzenie** - Historia każdego dowodu (kto, kiedy, co)
3. **Ocena** - Wiarygodność, znaczenie, dopuszczalność
4. **Strategia** - Mocne/słabe strony, plan wykorzystania
5. **Łańcuch dowodowy** - Kto miał dowód i kiedy
6. **Powiązania** - Łączenie z dokumentami, świadkami, innymi dowodami
7. **Statusy** - Jasny przepływ od zabezpieczenia do decyzji sądu
8. **Analiza** - Opinie biegłych, dane techniczne
9. **Przechowywanie** - Gdzie fizycznie znajduje się dowód
10. **Event Bus** - Automatyczne powiadomienia o zmianach

---

## 📁 STRUKTURA PLIKÓW:

```
backend/
├── database/
│   ├── init.js                    ✅ Tabele dodane
│   └── evidence-schema.sql        ✅ Dokumentacja SQL
├── routes/
│   └── evidence.js                ✅ API routes
├── utils/
│   └── code-generator.js          ✅ Generator już był
└── server.js                      ✅ Router dodany

frontend/
└── scripts/
    └── modules/
        └── evidence-module.js     ✅ Frontend moduł (część 1)
```

---

**Status:** 🟡 70% GOTOWE  
**Do zrobienia:** Formularze + Szczegóły + Zakładka w UI  
**Czas:** ~2-3 godziny dodatkowej pracy

