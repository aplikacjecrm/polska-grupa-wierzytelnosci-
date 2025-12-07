# 📄 JAK DODAĆ OBSŁUGĘ DOKUMENTÓW DO AI

**Data utworzenia:** 2 grudnia 2025  
**Cel:** AI będzie miał dostęp do treści PDF i DOCX

---

## 🎯 CO TO DAJE:

**PRZED:**
```
AI: "Nie mam dostępu do dokumentów sprawy."
```

**PO:**
```
AI: "Analizując pozew z dnia 15.11.2024 widzę że powód domaga się 
     kwoty 50 000 zł na podstawie art. 471 KC. W odpowiedzi na pozew 
     strona pozwana podnosi zarzut przedawnienia..."
```

---

## 📦 KROK 1: Zainstaluj biblioteki

```bash
cd c:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app\backend

npm install pdf-parse mammoth
```

**Co to robi:**
- `pdf-parse` - czyta pliki PDF
- `mammoth` - czyta pliki DOCX

---

## 🔧 KROK 2: Zintegruj z AI Legal Search

### Plik: `backend/routes/ai.js`

Dodaj na początku pliku:

```javascript
const documentParser = require('../services/document-parser');
const path = require('path');
```

### Zaktualizuj endpoint `/gemini/legal-search` (około linii 1268):

**PRZED:**
```javascript
router.post('/gemini/legal-search', verifyToken, async (req, res) => {
    // ... istniejący kod ...
    
    // Pobierz kontekst sprawy
    if (includeCaseCtx && window.crmManager?.currentCaseData) {
        const caseData = window.crmManager.currentCaseData;
        caseContext = {
            case_number: caseData.case_number,
            title: caseData.title,
            // ...
        };
    }
    
    // Wywołaj Gemini
    const result = await geminiService.legalSearch(query, type, {
        caseContext: caseContext,
        searchJurisprudence: searchJurisprudence,
        lawsContext: safeLawsContext
    });
```

**PO (z dokumentami):**
```javascript
router.post('/gemini/legal-search', verifyToken, async (req, res) => {
    // ... istniejący kod ...
    
    // 📄 NOWE: Pobierz dokumenty sprawy jeśli kontekst włączony
    let documentsContext = null;
    
    if (includeCaseCtx && caseContext) {
        try {
            const caseId = req.body.caseId; // Musisz przekazać caseId z frontend!
            
            if (caseId) {
                console.log(`📄 Pobieranie dokumentów sprawy ${caseId}...`);
                
                // Pobierz listę dokumentów z bazy
                const db = getDatabase(); // Dodaj jeśli nie ma
                const documents = await new Promise((resolve, reject) => {
                    db.all(
                        `SELECT id, case_id, title, filename, 
                                filepath, category
                         FROM documents 
                         WHERE case_id = ?
                         LIMIT 5`,  // Max 5 dokumentów aby nie przekroczyć limitu
                        [caseId],
                        (err, rows) => {
                            if (err) reject(err);
                            else resolve(rows);
                        }
                    );
                });
                
                if (documents.length > 0) {
                    // Ścieżka do uploads
                    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
                    
                    // Parsuj dokumenty (max 3000 znaków z każdego)
                    const extracted = await documentParser.extractCaseDocuments(
                        documents, 
                        uploadsDir, 
                        3000  // Max znaków z 1 dokumentu
                    );
                    
                    // Formatuj do promptu
                    documentsContext = documentParser.formatDocumentsForPrompt(extracted);
                    
                    console.log(`📄 Dodano ${extracted.successCount} dokumentów do kontekstu AI (${extracted.totalChars} znaków)`);
                } else {
                    console.log('📄 Brak dokumentów w sprawie');
                }
            }
        } catch (error) {
            console.error('❌ Błąd pobierania dokumentów:', error);
            // Kontynuuj bez dokumentów
        }
    }
    
    // Wywołaj Gemini Z DOKUMENTAMI
    const result = await geminiService.legalSearch(query, type, {
        caseContext: caseContext,
        searchJurisprudence: searchJurisprudence,
        lawsContext: safeLawsContext,
        documentsContext: documentsContext  // 🆕 DODAJ TO!
    });
```

---

## 🔧 KROK 3: Zaktualizuj gemini-service.js

### Plik: `backend/services/ai/gemini-service.js`

### Funkcja `legalSearch` (około linii 312):

**Dodaj `documentsContext` do opcji:**

```javascript
async function legalSearch(query, type = 'legal', options = {}) {
    const { 
        caseContext = null, 
        searchJurisprudence = false,
        lawsContext = null,
        documentsContext = null  // 🆕 DODAJ TO!
    } = options;
    
    // ... system prompt ...
    
    // Dodaj kontekst sprawy
    if (caseContext) {
        userPrompt = `KONTEKST SPRAWY: ...`;
    }
    
    // Dodaj kontekst przepisów
    if (lawsContext) {
        userPrompt += lawsContext;
    }
    
    // 🆕 DODAJ DOKUMENTY
    if (documentsContext) {
        userPrompt += documentsContext;
        console.log('📄 Dodano treść dokumentów do promptu Gemini');
    }
    
    // ... reszta kodu ...
}
```

---

## 🔧 KROK 4: Zaktualizuj frontend (ai-search.js)

### Przekaż `caseId` do API:

**Plik:** `frontend/scripts/ai-search.js` (około linii 166)

**PRZED:**
```javascript
const response = await window.api.request('/ai/gemini/legal-search', {
    method: 'POST',
    body: JSON.stringify({
        query: query,
        type: searchType,
        includeCaseContext: includeCaseCtx,
        searchJurisprudence: searchJuris,
        caseContext: caseContext
    })
});
```

**PO:**
```javascript
const response = await window.api.request('/ai/gemini/legal-search', {
    method: 'POST',
    body: JSON.stringify({
        query: query,
        type: searchType,
        includeCaseContext: includeCaseCtx,
        searchJurisprudence: searchJuris,
        caseContext: caseContext,
        caseId: window.crmManager?.currentCaseData?.id  // 🆕 DODAJ ID SPRAWY!
    })
});
```

---

## 🧪 KROK 5: Testowanie

### 1. Zainstaluj biblioteki:
```bash
cd backend
npm install pdf-parse mammoth
```

### 2. Zrestartuj backend:
```bash
taskkill /F /IM node.exe
$env:DB_PATH='c:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app\data\komunikator.db'
node server.js
```

### 3. Testuj w aplikacji:

1. Otwórz sprawę która ma dokumenty PDF/DOCX
2. Kliknij `🤖 AI Legal Search`
3. ✅ Zaznacz "Dołącz kontekst sprawy"
4. Zadaj pytanie: **"Przeanalizuj dokumenty w sprawie"**
5. Kliknij `🚀 Wyszukaj z AI`

### Oczekiwany wynik:

```
🤖 Odpowiedź Gemini AI
📚 3 przepisów · 📁 Kontekst sprawy · 📄 2 dokumenty

Na podstawie analizy pozwu z dnia 15.11.2024 oraz odpowiedzi 
na pozew widzę że:

1. Powód domaga się zapłaty 50 000 zł tytułem kar umownych
2. Podstawa prawna: art. 471 KC i art. 483 § 1 KC
3. Pozwany podnosi zarzut przedawnienia na podstawie art. 118 KC

Dokumenty sprawy:
- pozew.pdf (2 strony, 1234 znaków)
- odpowiedz_na_pozew.pdf (3 strony, 2345 znaków)

Moja analiza prawna:
...
```

---

## 📊 MONITOROWANIE

### Sprawdź logi backendu:

Powinny pokazywać:

```
📄 Pobieranie dokumentów sprawy 123...
📄 Próba parsowania: pozew.pdf
   ✅ Wyekstrahowano 12345 znaków (skrócono)
📄 Próba parsowania: odpowiedz.pdf
   ✅ Wyekstrahowano 23456 znaków (pełny)
📚 Ekstrakcja zakończona: 15345 znaków z 2/2 dokumentów
📄 Dodano 2 dokumentów do kontekstu AI (15345 znaków)
📄 Dodano treść dokumentów do promptu Gemini
```

---

## ⚠️ WAŻNE LIMITY:

### Limity Gemini 2.5 Flash:

- **Max tokens:** ~1M input tokens (około 750,000 słów)
- **Zalecane:** Do 100,000 znaków na request

### Dlatego ograniczamy:

```javascript
extractCaseDocuments(
    documents, 
    uploadsDir, 
    3000  // Max 3000 znaków z JEDNEGO dokumentu
)
```

**Jeśli masz 5 dokumentów:**
- 5 × 3000 = 15,000 znaków z dokumentów
- + ~2000 znaków przepisy prawne
- + ~500 znaków kontekst sprawy
- + ~200 znaków pytanie użytkownika
- **= ~18,000 znaków total** ✅ OK!

---

## 🎯 OPCJONALNE ULEPSZENIA:

### 1. **Inteligentny wybór dokumentów**

Zamiast brać pierwsze 5 dokumentów, wybierz najbardziej istotne:

```javascript
// Preferuj dokumenty które pasują do pytania
const query = req.body.query.toLowerCase();

let sql = `SELECT * FROM documents WHERE case_id = ?`;

if (query.includes('pozew')) {
    sql += ` AND (category = 'pozew' OR title LIKE '%pozew%')`;
} else if (query.includes('odpowiedź')) {
    sql += ` AND (category = 'odpowiedź' OR title LIKE '%odpowiedź%')`;
}

sql += ` ORDER BY uploaded_at DESC LIMIT 5`;
```

### 2. **Cache wyekstrahowanego tekstu**

Przechowuj wyekstrahowany tekst w bazie:

```sql
ALTER TABLE documents ADD COLUMN extracted_text TEXT;
ALTER TABLE documents ADD COLUMN extracted_at DATETIME;
```

### 3. **OCR dla skanów**

Jeśli PDF to skan (obrazek), użyj Tesseract OCR:

```bash
npm install tesseract.js
```

---

## 🚀 PODSUMOWANIE

**Po tych zmianach AI będzie miał dostęp do:**

✅ Podstawowych danych sprawy (numer, tytuł, typ)  
✅ 15 aktów prawnych z bazy danych  
✅ **Treści dokumentów PDF i DOCX** 🆕  
✅ Metadanych dokumentów (kategoria, data)  

**Nadal NIE będzie miał:**
❌ Dostępu do notatek (trzeba dodać osobno)  
❌ Dostępu do plików klienta (client_files)  
❌ Dostępu do zdjęć/skanów (bez OCR)  

---

## 📞 JEŚLI COŚ NIE DZIAŁA:

1. **Sprawdź czy biblioteki zainstalowane:**
   ```bash
   npm list pdf-parse mammoth
   ```

2. **Sprawdź logi backendu** - powinny pokazywać parsowanie

3. **Sprawdź ścieżki do plików** - czy `uploads/` istnieje

4. **Test pojedynczego pliku:**
   ```javascript
   const parser = require('./services/document-parser');
   parser.extractTextFromPDF('./uploads/test.pdf').then(console.log);
   ```

---

**GOTOWE! Teraz AI może czytać dokumenty! 📄🤖**
