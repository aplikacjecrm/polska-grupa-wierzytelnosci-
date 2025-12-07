# 🎯 UNIWERSALNY SYSTEM UPLOADU PLIKÓW

## 📋 WYMAGANIA UŻYTKOWNIKA:

> "CHCIAŁBYM ŻEBY BYŁ DODATKOWY PUNKT DODAWANIA PLIKÓW:
> - Przy dodawaniu szczegółów cywilnych
> - Przy zeznaniach świadków  
> - W różnych szczegółach spraw (zaświadczenia etc)"

---

## 🏗️ ARCHITEKTURA SYSTEMU:

### **1. UNIWERSALNY ENDPOINT UPLOAD**

**Backend:** `POST /api/attachments/upload`

```javascript
// backend/routes/attachments.js
router.post('/upload', verifyToken, uploadMiddleware.single('file'), async (req, res) => {
  const { 
    entity_type,    // 'case', 'witness', 'civil_detail', 'scenario', etc.
    entity_id,      // ID encji
    case_id,        // ID sprawy (zawsze)
    title,
    description,
    category        // 'zaświadczenie', 'zeznanie', 'dowód', etc.
  } = req.body;
  
  // 1. Wygeneruj kod załącznika powiązany ze sprawą
  const attachmentCode = await generateAttachmentCode(case_id, entity_type);
  
  // 2. Zapisz do tabeli attachments
  const attachmentId = await saveAttachment({
    case_id,
    entity_type,
    entity_id,
    attachment_code: attachmentCode,
    title,
    description,
    file_name: req.file.originalname,
    file_path: req.file.path,
    file_size: req.file.size,
    file_type: req.file.mimetype,
    category,
    uploaded_by: req.user.userId
  });
  
  res.json({ success: true, attachmentId, attachmentCode });
});
```

---

### **2. STRUKTURA BAZY DANYCH**

**Nowa tabela:** `attachments` (uniwersalne załączniki)

```sql
CREATE TABLE IF NOT EXISTS attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,              -- Zawsze powiązane ze sprawą
  entity_type TEXT NOT NULL,             -- 'witness', 'civil_detail', 'scenario', etc.
  entity_id INTEGER,                     -- ID encji (nullable dla ogólnych)
  attachment_code TEXT UNIQUE NOT NULL,  -- Format: ZAL/[NR_SPRAWY]/[TYP]/XXX
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  category TEXT,                         -- 'zaświadczenie', 'zeznanie', 'dowód'
  uploaded_by INTEGER NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

---

### **3. SYSTEM NUMERACJI ZAŁĄCZNIKÓW**

**Format:** `ZAL/[NUMER_SPRAWY]/[TYP]/XXX`

**Przykłady:**
```
Sprawa: KRA/JK01/001

Załączniki:
├─ ZAL/KRA/JK01/001/SWI/001  (załącznik do świadka 1)
├─ ZAL/KRA/JK01/001/SWI/002  (załącznik do świadka 2)
├─ ZAL/KRA/JK01/001/CYW/001  (załącznik do szczegółów cywilnych)
├─ ZAL/KRA/JK01/001/SCE/001  (załącznik do scenariusza)
└─ ZAL/KRA/JK01/001/OGL/001  (załącznik ogólny)
```

**Typy (prefixy):**
```javascript
const ATTACHMENT_TYPE_PREFIXES = {
  'witness': 'SWI',           // Świadek
  'civil_detail': 'CYW',      // Szczegóły cywilne
  'criminal_detail': 'KAR',   // Szczegóły karne
  'scenario': 'SCE',          // Scenariusz
  'opposing_party': 'STR',    // Strona przeciwna
  'evidence': 'DOW',          // Dowód
  'certificate': 'ZAS',       // Zaświadczenie
  'testimony': 'ZEZ',         // Zeznanie
  'general': 'OGL'            // Ogólny
};
```

---

## 🎨 FRONTEND - UNIWERSALNY KOMPONENT

### **Reużywalny komponent uploadu:**

```javascript
// frontend/scripts/components/attachment-uploader.js

class AttachmentUploader {
  constructor(config) {
    this.caseId = config.caseId;
    this.entityType = config.entityType;  // 'witness', 'civil_detail', etc.
    this.entityId = config.entityId;
    this.category = config.category;      // 'zaświadczenie', 'zeznanie', etc.
    this.containerId = config.containerId;
    this.onSuccess = config.onSuccess;
  }
  
  render() {
    const container = document.getElementById(this.containerId);
    container.innerHTML = `
      <div class="attachment-uploader">
        <h4>📎 Załączniki</h4>
        <div class="upload-form">
          <input type="text" id="attachment-title" placeholder="Tytuł załącznika" required>
          <select id="attachment-category">
            <option value="zaświadczenie">Zaświadczenie</option>
            <option value="zeznanie">Zeznanie</option>
            <option value="dowód">Dowód</option>
            <option value="inne">Inne</option>
          </select>
          <textarea id="attachment-description" placeholder="Opis (opcjonalnie)"></textarea>
          <input type="file" id="attachment-file" required>
          <button id="upload-btn" class="btn-primary">📤 Dodaj załącznik</button>
        </div>
        <div id="attachments-list" class="attachments-list"></div>
      </div>
    `;
    
    this.setupEventListeners();
    this.loadAttachments();
  }
  
  async uploadAttachment() {
    const formData = new FormData();
    formData.append('file', document.getElementById('attachment-file').files[0]);
    formData.append('entity_type', this.entityType);
    formData.append('entity_id', this.entityId);
    formData.append('case_id', this.caseId);
    formData.append('title', document.getElementById('attachment-title').value);
    formData.append('description', document.getElementById('attachment-description').value);
    formData.append('category', document.getElementById('attachment-category').value);
    
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3500/api/attachments/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    if (response.ok) {
      alert('✅ Załącznik dodany!');
      this.loadAttachments();
      if (this.onSuccess) this.onSuccess();
    } else {
      alert('❌ Błąd dodawania załącznika');
    }
  }
  
  async loadAttachments() {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `http://localhost:3500/api/attachments?entity_type=${this.entityType}&entity_id=${this.entityId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    const data = await response.json();
    this.renderAttachments(data.attachments);
  }
  
  renderAttachments(attachments) {
    const list = document.getElementById('attachments-list');
    list.innerHTML = attachments.map(att => `
      <div class="attachment-item">
        <span class="attachment-code">${att.attachment_code}</span>
        <span class="attachment-title">${att.title}</span>
        <span class="attachment-category">${att.category}</span>
        <button onclick="downloadAttachment(${att.id})">⬇️ Pobierz</button>
      </div>
    `).join('');
  }
}

// Eksportuj globalnie
window.AttachmentUploader = AttachmentUploader;
```

---

## 📍 UŻYCIE W RÓŻNYCH MODUŁACH:

### **1. Moduł Świadków (Witnesses)**

```javascript
// W witnesses-module.js - przy wyświetlaniu szczegółów świadka

function showWitnessDetails(witnessId, caseId) {
  // ... renderuj szczegóły świadka ...
  
  // Dodaj uploader załączników
  const uploader = new AttachmentUploader({
    caseId: caseId,
    entityType: 'witness',
    entityId: witnessId,
    category: 'zeznanie',
    containerId: 'witness-attachments',
    onSuccess: () => {
      console.log('Załącznik świadka dodany!');
    }
  });
  
  uploader.render();
}
```

---

### **2. Moduł Szczegółów Cywilnych**

```javascript
// W civil-details-module.js

function showCivilDetails(civilDetailId, caseId) {
  // ... renderuj szczegóły cywilne ...
  
  const uploader = new AttachmentUploader({
    caseId: caseId,
    entityType: 'civil_detail',
    entityId: civilDetailId,
    category: 'zaświadczenie',
    containerId: 'civil-attachments'
  });
  
  uploader.render();
}
```

---

### **3. Moduł Scenariuszy**

```javascript
// W scenarios-module.js

function showScenarioDetails(scenarioId, caseId) {
  // ... renderuj scenariusz ...
  
  const uploader = new AttachmentUploader({
    caseId: caseId,
    entityType: 'scenario',
    entityId: scenarioId,
    category: 'dowód',
    containerId: 'scenario-attachments'
  });
  
  uploader.render();
}
```

---

## 🔧 BACKEND ENDPOINTS:

### **1. Upload załącznika**
```
POST /api/attachments/upload
Body: FormData with file + metadata
Response: { success, attachmentId, attachmentCode }
```

### **2. Pobierz załączniki dla encji**
```
GET /api/attachments?entity_type=witness&entity_id=5
Response: { attachments: [...] }
```

### **3. Pobierz załączniki dla sprawy**
```
GET /api/attachments/case/:caseId
Response: { attachments: [...] }
```

### **4. Pobierz plik załącznika**
```
GET /api/attachments/:id/download
Response: File stream
```

### **5. Usuń załącznik**
```
DELETE /api/attachments/:id
Response: { success }
```

---

## 📊 PRZYKŁAD PEŁNEGO FLOW:

### **Scenariusz: Dodawanie zeznania świadka**

1. User otwiera szczegóły świadka
2. Widzi sekcję "📎 Załączniki"
3. Wypełnia:
   - Tytuł: "Zeznanie Jana Kowalskiego"
   - Kategoria: "Zeznanie"
   - Opis: "Zeznanie z dnia 2025-11-05"
   - Plik: zeznanie.pdf
4. Klika "📤 Dodaj załącznik"
5. Backend:
   - Generuje kod: `ZAL/KRA/JK01/001/SWI/001`
   - Zapisuje plik do: `uploads/attachments/`
   - Zapisuje do tabeli `attachments`
6. Frontend odświeża listę załączników
7. Załącznik widoczny w liście

---

## 🎯 KORZYŚCI TEGO SYSTEMU:

### **✅ Uniwersalność**
- Jeden endpoint dla wszystkich typów załączników
- Reużywalny komponent frontend

### **✅ Spójność**
- Jednolity system numeracji
- Wszystkie załączniki powiązane ze sprawą

### **✅ Elastyczność**
- Łatwe dodawanie nowych typów encji
- Kategorie można rozszerzać

### **✅ Relacje**
- Załącznik zawsze wie do czego należy
- Można wylistować wszystkie załączniki sprawy
- Można wylistować załączniki konkretnego świadka/scenariusza

---

## 📁 STRUKTURA PLIKÓW DO STWORZENIA:

```
backend/
├─ routes/
│  └─ attachments.js           ← Nowy router
├─ database/
│  └─ init.js                  ← Dodać tabelę attachments
└─ uploads/
   └─ attachments/             ← Folder na pliki

frontend/
└─ scripts/
   └─ components/
      └─ attachment-uploader.js  ← Uniwersalny komponent
```

---

## 🚀 PLAN IMPLEMENTACJI:

### **KROK 1: Backend**
1. Stwórz `backend/routes/attachments.js`
2. Dodaj tabelę `attachments` w `database/init.js`
3. Dodaj routing w `server.js`: `app.use('/api/attachments', attachmentsRoutes)`

### **KROK 2: Frontend**
1. Stwórz `attachment-uploader.js` (komponent)
2. Dodaj CSS dla uploadu
3. Podłącz w `index.html`

### **KROK 3: Integracja**
1. Dodaj do `witnesses-module.js`
2. Dodaj do `civil-details-module.js`  
3. Dodaj do `scenarios-module.js`
4. Dodaj do innych modułów według potrzeb

---

**CZY ZACZYNAMY IMPLEMENTACJĘ?** 🚀✨📎
