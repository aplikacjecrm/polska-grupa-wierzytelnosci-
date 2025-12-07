# 🔍 DEBUG: DOCUMENT UPLOAD - SZCZEGÓŁOWE LOGOWANIE

## 🎯 CO ZOSTAŁO DODANE:

### **1. Sanitization nazw plików**
**Problem:** Nazwy plików z nawiasami `(1) (6) (3)` mogą powodować błędy

**Rozwiązanie:**
```javascript
// backend/routes/cases.js
filename: (req, file, cb) => {
  try {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize filename - usuń problematyczne znaki
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(sanitizedName);
    cb(null, `case-${req.params.id}-${uniqueSuffix}${ext}`);
  } catch (error) {
    console.error('❌ Błąd generowania nazwy pliku:', error);
    cb(error);
  }
}
```

**Teraz:**
- `plik (1) (6).png` → `case-27-1730852456789-123456789.png` ✅
- Wszystkie znaki specjalne zamienione na `_`
- Bezpieczne nazwy plików

---

### **2. Szczegółowe logowanie**

**Punkt 1 - Otrzymanie requestu:**
```javascript
console.log('📎 RECEIVED REQUEST TO ADD DOCUMENT:', {
  caseId: id,
  hasFile: !!req.file,
  title,
  description,
  category,
  userId
});
```

**Punkt 2 - Przed zapisem do bazy:**
```javascript
console.log('💾 Próbuję zapisać dokument do bazy...', {
  documentCode,
  caseId: id,
  clientId: caseData.client_id,
  title,
  fileName: req.file.originalname,
  filePath: req.file.path,
  fileSize: req.file.size,
  fileType: req.file.mimetype
});
```

**Punkt 3 - Błąd zapisu:**
```javascript
console.error('❌❌❌ BŁĄD ZAPISU DO BAZY:', err);
console.error('❌ Error message:', err.message);
console.error('❌ Error code:', err.code);
```

**Punkt 4 - Sukces:**
```javascript
console.log('✅✅✅ Dokument dodany do bazy:', documentCode, '(ID:', this.lastID + ')');
```

---

## 🧪 JAK TESTOWAĆ:

### **1. Odśwież przeglądarkę:**
```
Ctrl + Shift + R
```

### **2. Dodaj sprawę z plikiem:**
```
➕ Nowa sprawa
→ Wypełnij dane
→ Wybierz 1 plik (najlepiej z nawiasami w nazwie)
→ Kliknij "Zapisz sprawę"
```

### **3. Otwórz Backend Terminal (gdzie node działa):**
Zobaczysz szczegółowe logi:

```
📎 RECEIVED REQUEST TO ADD DOCUMENT: {
  caseId: 27,
  hasFile: true,
  title: '1762196080079_plik_(1)_(6)_(3).png',
  description: 'Dokument sprawy: ...',
  category: 'case_document',
  userId: 1
}

📋 Wygenerowany numer dokumentu: DOK/KRA/JK01/001/001

💾 Próbuję zapisać dokument do bazy... {
  documentCode: 'DOK/KRA/JK01/001/001',
  caseId: 27,
  clientId: 8,
  title: '1762196080079_plik_(1)_(6)_(3).png',
  fileName: '1762196080079_plik_(1)_(6)_(3).png',
  filePath: 'C:\\...\\backend\\uploads\\case-documents\\case-27-1730852456789-123.png',
  fileSize: 184382,
  fileType: 'image/png'
}

✅✅✅ Dokument dodany do bazy: DOK/KRA/JK01/001/001 (ID: 45)
```

---

## 🔍 INTERPRETACJA LOGÓW:

### **✅ SUKCES:**
```
📎 RECEIVED REQUEST → hasFile: true, title: OK
💾 Próbuję zapisać → wszystkie dane OK
✅✅✅ Dokument dodany → ID: XX
```

### **❌ BŁĄD - Brak pliku:**
```
📎 RECEIVED REQUEST → hasFile: false
❌ BRAK PLIKU!
```
**Rozwiązanie:** Problem z multerem lub frontendem

### **❌ BŁĄD - Brak title:**
```
📎 RECEIVED REQUEST → title: undefined
❌ BRAK TITLE!
```
**Rozwiązanie:** Frontend nie wysyła title

### **❌ BŁĄD - Zapis do bazy:**
```
💾 Próbuję zapisać → dane OK
❌❌❌ BŁĄD ZAPISU DO BAZY: [szczegóły błędu]
```
**Rozwiązanie:** Problem ze strukturą bazy lub wartościami

---

## 📊 POTENCJALNE PROBLEMY I ROZWIĄZANIA:

### **Problem 1: Nazwa kolumny**
```
❌ Error message: no such column: filename
```
**Rozwiązanie:** W kodzie jest `file_name` ale baza ma `filename`
- Sprawdź `backend/database/init.js`
- Upewnij się że kolumny się zgadzają

### **Problem 2: NULL constraint**
```
❌ Error message: NOT NULL constraint failed: documents.client_id
```
**Rozwiązanie:** `client_id` jest NULL
- Sprawdź czy sprawa ma przypisanego klienta
- W konsoli zobacz: `clientId: null`

### **Problem 3: Foreign key**
```
❌ Error message: FOREIGN KEY constraint failed
```
**Rozwiązanie:** `case_id` lub `client_id` nie istnieje w bazie
- Sprawdź czy sprawa/klient istnieje

### **Problem 4: Multer error**
```
❌ Global error handler: Unexpected field
```
**Rozwiązanie:** Frontend wysyła złe pole (nie `file`)
- Sprawdź `fileFormData.append('file', ...)`

---

## 🎯 CO TERAZ:

**KROK 1:** Odśwież przeglądarkę (`Ctrl + Shift + R`)

**KROK 2:** Spróbuj dodać sprawę z plikiem

**KROK 3:** Pokaż mi:
- Screenshot **konsoli przeglądarki** (F12)
- Screenshot/tekst **terminal backendu** (wszystkie logi)

**KROK 4:** Na podstawie logów znajdę dokładną przyczynę błędu

---

## 📁 ZMODYFIKOWANE PLIKI:

1. **backend/routes/cases.js**
   - ✅ Sanitization nazw plików
   - ✅ Szczegółowe logowanie (5 punktów)
   - ✅ Try-catch w multer

---

**Backend działa z debug logami! Testuj i pokaż mi logi!** 🔍📊✨
