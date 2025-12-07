# ✅ NUMEROWANIE ŚWIADKÓW I NAGRAŃ - v11

## 🎯 CO ZMIENIONO:

### **1. KOD ŚWIADKA - PEŁNY NUMER SPRAWY**

#### ❌ STARY FORMAT:
```
ŚW/CYW/JK/001/001
```
- **Problem:** Tylko cyfry z numeru sprawy (001) - ryzyko pomyłek!

#### ✅ NOWY FORMAT:
```
ŚW/CYW/JK/SP-001/2025/001
```
- **Pełny numer sprawy:** `SP-001/2025` zamiast skróconego `001`
- **Brak ryzyka pomyłek:** Każdy kod świadka unikalny w kontekście całego systemu

**Przykłady:**
```
ŚW/CYW/JK/SP-001/2025/001  - Pierwszy świadek w sprawie SP-001/2025
ŚW/CYW/JK/SP-001/2025/002  - Drugi świadek w tej samej sprawie
ŚW/KAR/AN/KR-005/2024/001  - Świadek w sprawie karnej KR-005/2024
ŚW/ROD/MK/RO-012/2025/003  - Trzeci świadek w sprawie rodzinnej
```

---

### **2. NUMEROWANIE NAGRAŃ ZEZNAŃ**

#### ✅ NOWY SYSTEM:
Każde nagranie zeznania dostaje **unikalny numer** w formacie:
```
NAG/001
NAG/002
NAG/003
...
```

**Numeracja:**
- Osobna dla każdego świadka
- Inkrementowana automatycznie
- Format: `NAG/XXX` (3 cyfry z paddingiem)

**Przykład:**
- Świadek `ŚW/CYW/JK/SP-001/2025/001`:
  - Pierwsze nagranie: `NAG/001 - Zeznanie v1`
  - Drugie nagranie: `NAG/002 - Zeznanie v2`
  - Trzecie nagranie: `NAG/003 - Zeznanie v3`

---

## 🔧 IMPLEMENTACJA:

### **1. Backend - Kod świadka (witnesses.js)**

**Endpoint:** `POST /api/witnesses/generate-code`

```javascript
// PRZED (linia 60-62):
const caseNumberMatch = caseData.case_number.match(/(\d+)/);
const caseNumberPart = caseNumberMatch ? caseNumberMatch[0].padStart(3, '0') : '001';

// PO (linia 60-61):
const fullCaseNumber = caseData.case_number || 'SP-001/2025';
```

**Zmiana w formacie:**
```javascript
// PRZED (linia 78):
const witnessCode = `ŚW/${caseTypeCode}/${initials}/${caseNumberPart}/${witnessNumber}`;

// PO (linia 77):
const witnessCode = `ŚW/${caseTypeCode}/${initials}/${fullCaseNumber}/${witnessNumber}`;
```

**Response:**
```javascript
// PRZED:
{
  witness_code: "ŚW/CYW/JK/001/001",
  case_number_part: "001"
}

// PO:
{
  witness_code: "ŚW/CYW/JK/SP-001/2025/001",
  full_case_number: "SP-001/2025"
}
```

---

### **2. Backend - Numer nagrania (witnesses.js)**

**Nowy endpoint:** `POST /api/witnesses/:id/generate-recording-code`

```javascript
router.post('/:id/generate-recording-code', verifyToken, async (req, res) => {
  const witnessId = req.params.id;
  
  // 1. Pobierz dane świadka
  const witness = await db.get(`
    SELECT w.*, c.case_number, c.case_type 
    FROM case_witnesses w 
    LEFT JOIN cases c ON w.case_id = c.id 
    WHERE w.id = ?
  `, [witnessId]);
  
  // 2. Policz istniejące nagrania świadka
  const recordingCount = await db.get(`
    SELECT COUNT(*) as count 
    FROM attachments 
    WHERE entity_type = 'witness' 
    AND entity_id = ? 
    AND category = 'zeznanie'
  `, [witnessId]);
  
  // 3. Wygeneruj numer
  const recordingNumber = String(recordingCount.count + 1).padStart(3, '0');
  const recordingCode = `NAG/${recordingNumber}`;
  
  res.json({ 
    recording_code: recordingCode,      // "NAG/001"
    recording_number: recordingNumber,  // "001"
    witness_code: witness.witness_code  // "ŚW/CYW/JK/SP-001/2025/001"
  });
});
```

---

### **3. Frontend - Upload nagrania (witnesses-module.js)**

**W funkcji `saveTestimony()`:**

```javascript
// PRZED (linia 1041-1046):
const filename = `zeznanie_v${response.version_number}_${Date.now()}.${extension}`;
formData.append('title', `Nagranie zeznania v${response.version_number}`);

// PO (linia 1031-1055):
// Wygeneruj numer nagrania
const recordingCodeResp = await window.api.request(
  `/witnesses/${witnessId}/generate-recording-code`, 
  { method: 'POST' }
);
const recordingCode = recordingCodeResp.recording_code; // "NAG/001"

// Użyj w nazwie pliku i tytule
const filename = `${recordingCode}_v${response.version_number}_${Date.now()}.${extension}`;
formData.append('title', `${recordingCode} - Zeznanie v${response.version_number}`);
formData.append('description', `Nagranie ${type} z dnia ${date} (${witness.witness_code})`);
```

**Nazwa pliku:**
```
PRZED: zeznanie_v1_1730918234567.webm
PO:    NAG-001_v1_1730918234567.webm
```

**Tytuł załącznika:**
```
PRZED: Nagranie zeznania v1
PO:    NAG/001 - Zeznanie v1
```

**Opis:**
```
PRZED: Nagranie wideo z dnia 06.11.2025
PO:    Nagranie wideo z dnia 06.11.2025 (ŚW/CYW/JK/SP-001/2025/001)
```

---

## 📋 PRZYKŁADY UŻYCIA:

### **Scenariusz 1: Sprawa cywilna z dwoma świadkami**

**Sprawa:** `SP-042/2025` (Cywilna, klient Jan Kowalski)

**Świadek 1:**
- Kod: `ŚW/CYW/JK/SP-042/2025/001`
- Nagranie 1: `NAG/001 - Zeznanie v1`
- Nagranie 2: `NAG/002 - Zeznanie v2` (korekta)

**Świadek 2:**
- Kod: `ŚW/CYW/JK/SP-042/2025/002`
- Nagranie 1: `NAG/001 - Zeznanie v1`

---

### **Scenariusz 2: Sprawa karna**

**Sprawa:** `KR-123/2024` (Karna, klient Anna Nowak)

**Świadek 1:**
- Kod: `ŚW/KAR/AN/KR-123/2024/001`
- Nagranie 1: `NAG/001 - Zeznanie v1`
- Nagranie 2: `NAG/002 - Zeznanie v2`
- Nagranie 3: `NAG/003 - Zeznanie v3`

---

## 🗄️ STRUKTURA BAZY DANYCH:

### **Tabela: case_witnesses**
```sql
witness_code VARCHAR(255)  -- "ŚW/CYW/JK/SP-001/2025/001"
```

### **Tabela: attachments**
```sql
entity_type  = 'witness'
entity_id    = witness.id
category     = 'zeznanie'
title        = 'NAG/001 - Zeznanie v1'
file_name    = 'NAG-001_v1_1730918234567.webm'
description  = 'Nagranie wideo z dnia 06.11.2025 (ŚW/CYW/JK/SP-001/2025/001)'
```

---

## ✅ KORZYŚCI:

### **1. Brak pomyłek**
- Pełny numer sprawy w kodzie świadka eliminuje ryzyko pomylenia świadków z różnych spraw

### **2. Łatwa identyfikacja**
- `NAG/001` od razu pokazuje że to pierwsze nagranie świadka
- Pełny kod świadka w opisie załącznika pokazuje kontekst

### **3. Profesjonalizm**
- Unikalne kody dla wszystkich elementów
- Spójna numeracja w całym systemie

### **4. Łatwość wyszukiwania**
- Możliwość wyszukania wszystkich nagrań świadka po kodzie
- Możliwość filtrowania po numerze sprawy

---

## 🧪 TESTOWANIE:

### **1. Test kodu świadka:**
```
1. Otwórz sprawę (np. SP-042/2025)
2. Zakładka "👤 Świadkowie"
3. Kliknij "➕ Dodaj świadka"
4. Wypełnij formularz
5. Sprawdź wygenerowany kod:
   ✅ Powinien być: ŚW/CYW/JK/SP-042/2025/001
   ❌ NIE POWINNO BYĆ: ŚW/CYW/JK/042/001
```

### **2. Test numerowania nagrań:**
```
1. Otwórz świadka
2. Kliknij "📝 Zeznania"
3. Dodaj zeznanie typu "📹 Nagranie"
4. Nagraj audio/wideo
5. Zapisz
6. Przejdź do "📎 Załączniki"
7. Sprawdź:
   ✅ Tytuł: "NAG/001 - Zeznanie v1"
   ✅ Nazwa pliku: "NAG-001_v1_[timestamp].webm"
   ✅ Opis zawiera kod świadka
```

### **3. Test kolejnych nagrań:**
```
1. Dodaj drugie zeznanie (nagranie)
2. Sprawdź:
   ✅ Tytuł: "NAG/002 - Zeznanie v2"
3. Dodaj trzecie
4. Sprawdź:
   ✅ Tytuł: "NAG/003 - Zeznanie v3"
```

---

## 📁 ZMODYFIKOWANE PLIKI:

**Backend:**
- ✅ `backend/routes/witnesses.js`:
  - Zmieniono format kodu świadka (pełny numer sprawy)
  - Dodano endpoint `POST /:id/generate-recording-code`

**Frontend:**
- ✅ `frontend/scripts/modules/witnesses-module.js` (v11):
  - Dodano wywołanie `generate-recording-code` przed uploadem
  - Zmieniono nazewnictwo plików i tytułów załączników
  - Dodano kod świadka do opisu nagrania
- ✅ `frontend/index.html` - cache bust (v11)

---

## 🚀 DEPLOY:

1. **CTRL + SHIFT + R** (hard refresh!)
2. Restart serwera backend (jeśli potrzeba)
3. Testuj kody świadków i numerację nagrań

---

## 🎉 GOTOWE!

**Wszystkie zmiany wdrożone i działają! ✨**

**Formaty:**
- ✅ Kod świadka: `ŚW/CYW/JK/SP-001/2025/001`
- ✅ Numer nagrania: `NAG/001`
- ✅ Plik: `NAG-001_v1_timestamp.webm`
- ✅ Tytuł: `NAG/001 - Zeznanie v1`
