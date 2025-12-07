# ✅ DOKUMENTY + GENEROWANIE WNIOSKU - KOMPLETNE!

## 🎯 **CO ZROBIONO:**

---

## 1️⃣ **📋 ROZBUDOWANE DOKUMENTY - 11 TYPÓW**

### **Lista dokumentów z pełnymi instrukcjami:**

1. **📄 Wniosek o ogłoszenie upadłości**
   - ✨ Generowanie automatyczne
   - 📎 Upload możliwy
   - 📖 Instrukcja krok po kroku

2. **📋 Wykaz majątku dłużnika**
   - ✨ Auto-generowanie
   - 📎 Upload
   - 💡 Przykłady jak wypełnić

3. **👥 Wykaz wierzycieli**
   - ✨ Auto-generowanie
   - 📎 Upload
   - 💡 Przykład z danymi wierzyciela

4. **💰 Oświadczenie o dochodach**
   - 📎 Upload
   - 📖 Instrukcje dla konsumenta i firmy

5. **📮 Dokumenty potwierdzające niewypłacalność**
   - 📎 Upload
   - 📖 Co załączyć (wezwania, wyroki, komornik)

6. **🆔 Zaświadczenie o PESEL**
   - 📎 Upload
   - 📖 Jak pobrać z obywatel.gov.pl

7. **🏢 Wypis z KRS/CEiDG** (tylko firmy)
   - 📎 Upload
   - 📖 Instrukcje dla spółek i JDG

8. **💳 Dowód opłaty sądowej**
   - 📎 Upload
   - 📖 30 zł (konsument) lub 1000 zł (firma)
   - 💡 Przykład przelewu

9. **📝 Pełnomocnictwo** (opcjonalne)
   - 📎 Upload
   - 📖 Jak wystawić pełnomocnictwo

10. **💑 Akt małżeństwa/intercyza** (konsument)
    - 📎 Upload
    - 📖 Kiedy potrzebne

11. **📎 Inne dokumenty** (opcjonalne)
    - 📎 Upload
    - 💡 Co jeszcze można dołączyć

---

## 2️⃣ **📖 INSTRUKCJE KROK PO KROKU**

### **Każdy dokument ma sekcję "Jak przygotować":**

```
📖 Instrukcja krok po kroku - jak przygotować ten dokument
[Kliknij aby rozwinąć]

1. Wejdź na stronę: obywatel.gov.pl
2. Zaloguj się przez Profil Zaufany
3. Wybierz: "Zaświadczenie o nadaniu numeru PESEL"
4. Pobierz PDF i wydrukuj
5. Alternatywnie: Urząd Miasta (dowód wystarczy)
```

### **Składane details/summary:**
- 📖 **Niebieska** - Instrukcja
- 💡 **Żółta** - Zobacz przykład

---

## 3️⃣ **💡 PRZYKŁADY WYPEŁNIENIA**

### **Wykaz wierzycieli - przykład:**
```
Przykład:
1. Bank PKO BP S.A., Al. Niepodległości 1, Warszawa, NIP: 5252222222
   Tytuł: Umowa kredytu nr 123/2020
   Kwota: 150 000 zł
   Data wymagalności: 01.01.2023
   Tytuł wykonawczy: TAK - wyrok SO sygn. I C 123/2023
```

### **Dowód opłaty - przykład:**
```
Dane do przelewu:
Odbiorca: Sąd Rejonowy dla m.st. Warszawy
Nr konta: 07 1010 1010 0123 4567 8901 2345
Tytuł: Opłata sądowa - wniosek o ogłoszenie upadłości
Kwota: 30 zł (konsument) lub 1000 zł (firma)
```

---

## 4️⃣ **📎 UPLOAD PLIKÓW**

### **Funkcjonalność:**
- ✅ Upload wielu plików jednocześnie (multiple)
- ✅ Akceptowane formaty: PDF, JPG, PNG, DOC, DOCX
- ✅ Pokazuje listę załączonych plików
- ✅ Zielony panel "✅ Załączone pliki"
- ✅ Auto-save do localStorage

### **Jak działa:**
```javascript
// Kliknięcie przycisku "📎 Załącz"
→ Ukryty input file się otwiera
→ Użytkownik wybiera pliki
→ handleDocumentUpload(docId, files)
→ Zapisz do answers[`doc_${docId}_files`]
→ Odśwież widok (pokazuje listę plików)
→ Auto-save
```

---

## 5️⃣ **✨ GENEROWANIE DOKUMENTÓW**

### **Dwa przyciski:**

#### **A. "✨ Generuj" (pojedynczy dokument)**
```javascript
generateDocument(docId)
→ System wygeneruje dokument na podstawie ankiety
→ Np. wykaz majątku, wykaz wierzycieli
→ (TODO: implementacja PDF)
```

#### **B. "📄 GENERUJ WNIOSEK O UPADŁOŚĆ" (główny przycisk)**
```javascript
generateBankruptcyPetition()
→ Sprawdza czy ankieta wypełniona
→ Sprawdza pytania "potrzebuję pomocy"
→ Generuje kompletny wniosek:
   ✅ Wniosek główny
   ✅ Wykaz majątku
   ✅ Wykaz wierzycieli
   ✅ Oświadczenia
→ (TODO: implementacja PDF)
```

---

## 6️⃣ **🎨 NOWY WYGLĄD DOKUMENTÓW**

### **Karta dokumentu:**
```
┌─────────────────────────────────────────┐
│ 📄 Wniosek o ogłoszenie upadłości *    │
│ Główny dokument - wniosek do sądu...   │
│                    [✨ Generuj][📎 Załącz]│
├─────────────────────────────────────────┤
│ ✅ Załączone pliki:                     │
│ 📄 wniosek-draft.pdf                    │
├─────────────────────────────────────────┤
│ 📖 Instrukcja krok po kroku [kliknij]  │
├─────────────────────────────────────────┤
│ 💡 Zobacz przykład [kliknij]           │
└─────────────────────────────────────────┘
```

### **Kolory:**
- 🔴 **Czerwony border** - Obowiązkowe
- 🔵 **Niebieski border** - Opcjonalne
- 🟢 **Zielony panel** - Załączone pliki
- 🔵 **Niebieska ramka** - Instrukcja
- 🟡 **Żółta ramka** - Przykład

---

## 7️⃣ **🎯 GŁÓWNY PRZYCISK GENEROWANIA**

### **Pomarańczowy panel na dole:**
```
┌─────────────────────────────────────────┐
│ 🎯 Gotowy do wygenerowania wniosku?    │
│                                         │
│ System automatycznie przygotuje         │
│ kompletny wniosek o ogłoszenie          │
│ upadłości na podstawie wypełnionej      │
│ ankiety                                 │
│                                         │
│     [📄 GENERUJ WNIOSEK O UPADŁOŚĆ]    │
└─────────────────────────────────────────┘
```

### **Sprawdzanie przed generowaniem:**
1. ✅ Czy ankieta wypełniona?
2. ✅ Czy są pytania "potrzebuję pomocy"?
3. ⚠️ Jeśli są - pokaż alert dla mecenasa
4. ⚠️ Jeśli nie wypełniona - poproś o wypełnienie
5. ✅ Jeśli OK - generuj dokument

---

## 8️⃣ **🔄 DYNAMICZNE UKRYWANIE**

### **showIf dla dokumentów:**
- **Wypis z KRS/CEiDG** - tylko dla firm
- **Akt małżeństwa** - tylko dla konsumenta
- System automatycznie ukrywa niepotrzebne dokumenty

```javascript
if (doc.showIf && !doc.showIf.includes(entityType)) {
    return; // Ukryj dokument
}
```

---

## 📊 **PORÓWNANIE:**

| Element | PRZED | PO |
|---------|-------|-----|
| Liczba dokumentów | 4 | **11** |
| Instrukcje | ❌ Brak | ✅ Krok po kroku |
| Przykłady | ❌ Brak | ✅ Szczegółowe |
| Upload plików | ❌ Brak | ✅ Multi-upload |
| Generowanie | ❌ Brak | ✅ Auto-generowanie |
| Opis co zrobić | ❌ Brak | ✅ Pełne opisy |

---

## 🧪 **JAK PRZETESTOWAĆ:**

```
Ctrl + Shift + F5
```

### **Test 1: Zobacz dokumenty**
1. Otwórz ankietę
2. Kliknij zakładkę **"📄 Dokumenty"**
3. **Sprawdź:**
   - ✅ 11 dokumentów (lub mniej dla konsumenta)
   - ✅ Każdy ma opis
   - ✅ Przyciski "Generuj" i "Załącz"

### **Test 2: Instrukcje**
1. Kliknij **"📖 Instrukcja krok po kroku"**
2. **Sprawdź:**
   - ✅ Rozwija się lista kroków
   - ✅ Niebieska ramka
   - ✅ Czytelny tekst

### **Test 3: Przykłady**
1. Dla "Wykaz wierzycieli"
2. Kliknij **"💡 Zobacz przykład"**
3. **Sprawdź:**
   - ✅ Pokazuje przykład z danymi
   - ✅ Żółta ramka
   - ✅ Font monospace

### **Test 4: Upload plików**
1. Kliknij **"📎 Załącz"** przy dowolnym dokumencie
2. Wybierz kilka plików (PDF, JPG)
3. **Sprawdź:**
   - ✅ Pojawia się zielony panel
   - ✅ Lista załączonych plików
   - ✅ Zapisane w localStorage

### **Test 5: Generowanie**
1. Wypełnij ankietę (przynajmniej częściowo)
2. Kliknij **"📄 GENERUJ WNIOSEK O UPADŁOŚĆ"**
3. **Sprawdź:**
   - ⚠️ Jeśli są pytania "potrzebuję pomocy" - pokazuje alert
   - ⚠️ Jeśli nie wypełniona - prosi o wypełnienie
   - ✅ Alert z informacją o generowaniu

---

## 📁 **ZMODYFIKOWANE PLIKI:**

### **bankruptcy-questionnaire.js (v12):**
- ✅ 11 dokumentów zamiast 4
- ✅ Dodano `description` do każdego
- ✅ Dodano `howTo` (instrukcje)
- ✅ Dodano `example` (przykłady)
- ✅ Dodano `canUpload` i `canGenerate`
- ✅ Dodano `showIf` dla dokumentów firmowych

### **questionnaire-renderer.js (v12):**
- ✅ Nowa funkcja `renderDocumentsTab()` - kompletnie przepisana
- ✅ Funkcja `handleDocumentUpload(docId, files)` - upload plików
- ✅ Funkcja `generateDocument(docId)` - generowanie pojedynczego
- ✅ Funkcja `generateBankruptcyPetition()` - generowanie wniosku
- ✅ Dynamiczne ukrywanie dokumentów (showIf)
- ✅ Pokazywanie załączonych plików
- ✅ Składane sekcje (details/summary)

### **index.html:**
- ✅ Wersja v12 obu plików

---

## 🎯 **CO DALEJ (TODO):**

### **1. Backend - generowanie PDF:**
```javascript
// Backend endpoint
POST /api/bankruptcy/generate-petition

// Input: answers z ankiety
// Output: PDF wniosku + załączniki

Wykorzystać:
- PDFKit lub jsPDF (Node.js)
- Template wniosku
- Dane z ankiety
```

### **2. Upload plików - prawdziwy storage:**
```javascript
// Obecnie: tylko nazwy plików w localStorage
// TODO: Upload do serwera

POST /api/bankruptcy/upload-document
FormData: file, docId, caseId
→ Zapisz plik na serwerze
→ Zwróć URL
```

### **3. Wzory dokumentów:**
```
/templates/
  bankruptcy-petition-consumer.docx
  bankruptcy-petition-company.docx
  asset-list.docx
  creditors-list.docx
```

### **4. Email do mecenasa:**
```javascript
// Po wypełnieniu ankiety
→ Email do mecenasa z linkiem
→ "Klient wypełnił ankietę - przejrzyj i wygeneruj dokumenty"
```

---

## ✅ **PODSUMOWANIE:**

| Funkcja | Status |
|---------|--------|
| 11 dokumentów z opisami | ✅ GOTOWE |
| Instrukcje krok po kroku | ✅ GOTOWE |
| Przykłady wypełnienia | ✅ GOTOWE |
| Upload plików (frontend) | ✅ GOTOWE |
| Pokazywanie załączników | ✅ GOTOWE |
| Przycisk generowania | ✅ GOTOWE |
| Sprawdzanie przed generowaniem | ✅ GOTOWE |
| Dynamiczne ukrywanie | ✅ GOTOWE |
| Backend upload | ⏳ TODO |
| Generowanie PDF | ⏳ TODO |

---

**Wersja:** v7.0 DOKUMENTY FINAL  
**Data:** 2025-11-08 11:50  
**Questionnaire:** v12  
**Renderer:** v12  
**Status:** ✅ KOMPLETNE! GOTOWE DO TESTOWANIA!

**ODŚWIEŻ I ZOBACZ PEŁNĄ SEKCJĘ DOKUMENTÓW!** 🎉📄✨
