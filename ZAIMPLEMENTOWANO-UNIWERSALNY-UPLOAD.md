# ✅ ZAIMPLEMENTOWANO: UNIWERSALNY SYSTEM UPLOADU

## 🎯 CO ZOSTAŁO ZROBIONE:

### **1. Backend - Routes ✅**
**Plik:** `backend/routes/attachments.js`

**Endpointy:**
- `POST /api/attachments/upload` - Upload załącznika
- `GET /api/attachments?entity_type=X&entity_id=Y` - Pobierz załączniki
- `GET /api/attachments/case/:caseId` - Pobierz wszystkie załączniki sprawy
- `GET /api/attachments/:id/download` - Pobierz plik
- `DELETE /api/attachments/:id` - Usuń załącznik

**Typy encji:**
```javascript
'witness': 'SWI',           // Świadek
'civil_detail': 'CYW',      // Szczegóły cywilne
'criminal_detail': 'KAR',   // Szczegóły karne
'scenario': 'SCE',          // Scenariusz
'opposing_party': 'STR',    // Strona przeciwna
'evidence': 'DOW',          // Dowód
'certificate': 'ZAS',       // Zaświadczenie
'testimony': 'ZEZ',         // Zeznanie
'general': 'OGL'            // Ogólny
```

---

### **2. Baza danych ✅**
**Plik:** `backend/database/init.js`

**Tabela:**
```sql
CREATE TABLE attachments (
  id INTEGER PRIMARY KEY,
  case_id INTEGER NOT NULL,      -- Zawsze powiązane ze sprawą
  entity_type TEXT NOT NULL,     -- 'witness', 'civil_detail', etc.
  entity_id INTEGER,             -- ID encji (nullable)
  attachment_code TEXT UNIQUE,   -- ZAL/[NR_SPRAWY]/[TYP]/XXX
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  category TEXT,                 -- 'zeznanie', 'zaświadczenie', etc.
  uploaded_by INTEGER NOT NULL,
  uploaded_at DATETIME,
  FOREIGN KEY (case_id) REFERENCES cases(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

---

### **3. Routing ✅**
**Plik:** `backend/server.js`

Dodano:
```javascript
const attachmentsRoutes = require('./routes/attachments');
app.use('/api/attachments', attachmentsRoutes);
```

---

### **4. Frontend komponent ✅**
**Plik:** `frontend/scripts/components/attachment-uploader.js`

**Klasa:** `AttachmentUploader`

**Użycie:**
```javascript
const uploader = new AttachmentUploader({
  caseId: 7,
  entityType: 'witness',
  entityId: 5,
  category: 'zeznanie',
  containerId: 'attachments-container',
  onSuccess: () => console.log('Załącznik dodany!')
});

uploader.render();
```

**Funkcje:**
- `render()` - Renderuje formularz i listę
- `uploadAttachment()` - Upload pliku
- `loadAttachments()` - Pobiera listę
- `renderAttachments()` - Wyświetla tabelę
- `formatFileSize()` - Formatuje rozmiar
- `formatDate()` - Formatuje datę

**Funkcje globalne:**
- `window.downloadAttachment(id)` - Pobierz plik
- `window.deleteAttachment(id, containerId)` - Usuń załącznik

---

### **5. Integracja w index.html ✅**
**Plik:** `frontend/index.html`

Dodano:
```html
<script src="scripts/components/attachment-uploader.js?v=1"></script>
```

---

### **6. Integracja w module świadków ✅**
**Plik:** `frontend/scripts/modules/witnesses-module.js`

**Funkcja:** `viewWitnessDetails(witnessId)`

Rozbudowano aby pokazywać:
- Podstawowe informacje świadka
- **Uploader załączników** (zeznania, dowody, etc.)

**Działanie:**
1. Użytkownik klika "👁️ Szczegóły" przy świadku
2. Otwiera się modal z danymi świadka
3. Na dole jest sekcja "📎 Załączniki"
4. Można dodawać pliki (zeznania, dowody)
5. Pliki są numerowane: `ZAL/KRA/JK01/001/SWI/001`

---

## 📊 SYSTEM NUMERACJI:

**Format:** `ZAL/[NUMER_SPRAWY]/[TYP]/XXX`

**Przykłady:**
```
Sprawa: KRA/JK01/001

Załączniki świadka #5:
├─ ZAL/KRA/JK01/001/SWI/001 (zeznanie)
├─ ZAL/KRA/JK01/001/SWI/002 (dowód)
└─ ZAL/KRA/JK01/001/SWI/003 (dokument)

Załączniki cywilne:
├─ ZAL/KRA/JK01/001/CYW/001 (zaświadczenie)
└─ ZAL/KRA/JK01/001/CYW/002 (inne)
```

---

## 🧪 JAK TESTOWAĆ:

### **Test 1: Załącznik do świadka**

**Krok 1:** Otwórz sprawę
```
Kliknij na sprawę → Zakładka "👤 Świadkowie"
```

**Krok 2:** Dodaj świadka (jeśli nie ma)
```
➕ Dodaj świadka
→ Wypełnij dane
→ Zapisz
```

**Krok 3:** Otwórz szczegóły świadka
```
Kliknij "👁️ Szczegóły" przy świadku
```

**Krok 4:** Dodaj załącznik
```
Sekcja "📎 Załączniki"
→ Tytuł: "Zeznanie z 05.11.2025"
→ Kategoria: "Zeznanie"
→ Opis: "Zeznanie przed sądem"
→ Plik: [wybierz PDF/obraz]
→ Kliknij "📤 Dodaj załącznik"
```

**Krok 5:** Sprawdź wynik
```
✅ Alert: "Załącznik został dodany!"
✅ Załącznik pojawił się na liście
✅ Kod: ZAL/KRA/JK01/001/SWI/001
```

**Krok 6:** Pobierz załącznik
```
Kliknij ⬇️ przy załączniku
✅ Plik się pobiera
```

---

## 📁 CO JESZCZE MOŻNA DODAĆ?

### **Gotowe do integracji w:**

**1. Moduł szczegółów cywilnych**
```javascript
// W civil-details-module.js
const uploader = new AttachmentUploader({
  caseId: caseId,
  entityType: 'civil_detail',
  entityId: civilDetailId,
  category: 'zaświadczenie',
  containerId: 'civil-attachments'
});
uploader.render();
```

**2. Moduł scenariuszy**
```javascript
// W scenarios-module.js
const uploader = new AttachmentUploader({
  caseId: caseId,
  entityType: 'scenario',
  entityId: scenarioId,
  category: 'dowód',
  containerId: 'scenario-attachments'
});
uploader.render();
```

**3. Moduł strony przeciwnej**
```javascript
// W opposing-party-module.js
const uploader = new AttachmentUploader({
  caseId: caseId,
  entityType: 'opposing_party',
  entityId: opposingPartyId,
  category: 'inne',
  containerId: 'opposing-attachments'
});
uploader.render();
```

---

## 🎨 STYLE CSS (do dodania):

**Plik:** `frontend/styles/attachments.css` (opcjonalnie)

```css
.attachment-uploader {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
}

.section-title {
  margin: 0 0 20px 0;
  color: #1a2332;
  font-size: 1.2rem;
}

.upload-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  color: #666;
  font-weight: 600;
  margin-bottom: 5px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
}

.attachments-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.attachments-table th {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 12px;
  text-align: left;
}

.attachments-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #e0e0e0;
}

.attachment-code {
  font-family: monospace;
  font-weight: 600;
  color: #667eea;
}

.btn-download {
  background: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-delete {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 5px;
}

.no-attachments {
  padding: 20px;
  text-align: center;
  color: #999;
  font-style: italic;
}
```

---

## 🚀 STATUS IMPLEMENTACJI:

| Komponent | Status | Plik |
|-----------|--------|------|
| **Backend router** | ✅ Gotowy | `backend/routes/attachments.js` |
| **Tabela bazy** | ✅ Gotowa | `backend/database/init.js` |
| **Routing** | ✅ Gotowy | `backend/server.js` |
| **Frontend komponent** | ✅ Gotowy | `frontend/scripts/components/attachment-uploader.js` |
| **Index.html** | ✅ Dodany | `frontend/index.html` |
| **Moduł świadków** | ✅ Zintegrowany | `frontend/scripts/modules/witnesses-module.js` |
| **Moduł civil details** | ⏳ Do zrobienia | - |
| **Moduł scenariuszy** | ⏳ Do zrobienia | - |
| **Moduł opposing party** | ⏳ Do zrobienia | - |

---

## 📝 NOTATKI:

### **Bezpieczeństwo:**
- ✅ Wszystkie endpointy z `verifyToken`
- ✅ Sanitization nazw plików
- ✅ Limit 50MB na plik
- ✅ Walidacja `title`, `case_id`, `entity_type`

### **Relacje:**
- ✅ Każdy załącznik powiązany ze sprawą (`case_id`)
- ✅ Załącznik może być powiązany z encją (`entity_type` + `entity_id`)
- ✅ Można pobrać wszystkie załączniki sprawy
- ✅ Można pobrać załączniki konkretnego świadka/scenariusza

### **Numeracja:**
- ✅ Format: `ZAL/[NR_SPRAWY]/[TYP]/XXX`
- ✅ Automatyczna inkrementacja
- ✅ Unikalny kod w bazie

---

**SYSTEM GOTOWY DO UŻYCIA!** 🎉📎✨

**Odśwież przeglądarkę (Ctrl+Shift+R) i testuj!**
