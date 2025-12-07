# 🗂️ WYBÓR DOKUMENTÓW Z CRM W ANKIETACH - DOKUMENTACJA

## ✅ **CO DODANO:**

Możliwość wybierania istniejących dokumentów z CRM i przypisywania ich do dokumentów w ankietach!

---

## 🎯 **FUNKCJONALNOŚĆ:**

### **3 OPCJE ZAŁĄCZANIA DOKUMENTÓW:**

1. **✨ Generuj AI** (zielony) - generowanie przez AI
2. **🗂️ Wybierz z CRM** (fioletowy) - wybór istniejących dokumentów
3. **📎 Załącz nowy** (niebieski) - upload nowego pliku z dysku

---

## 🎨 **NOWE PRZYCISKI:**

### **Przycisk "Wybierz z CRM":**
```css
Kolor: #9b59b6 (fioletowy)
Ikona: 🗂️
Tooltip: "Wybierz dokumenty już istniejące w CRM"
```

### **Przycisk "Załącz nowy"** (zmieniony z "Załącz"):
```css
Kolor: #3498db (niebieski)
Ikona: 📎
Tooltip: "Załącz nowy plik z dysku"
```

---

## 🔄 **JAK TO DZIAŁA:**

### **KROK 1: Kliknięcie "Wybierz z CRM"**
```javascript
window.questionnaireRenderer.showCrmDocumentsPicker(docId)
```

1. Pobiera dokumenty z aktualnej sprawy
2. Jeśli brak - pokazuje komunikat
3. Jeśli są - otwiera modal z listą

### **KROK 2: Modal z listą dokumentów**
```
┌─────────────────────────────────────────┐
│ 🗂️ Wybierz dokumenty z CRM       [×]   │
├─────────────────────────────────────────┤
│ 📋 Znaleziono 8 dokumentów w tej sprawie│
│                                          │
│ ┌──────────────────────────────────────┐│
│ │ 📄  protokol_policji.pdf             ││
│ │     Dowody • 2024-11-05    [Wybierz] ││
│ └──────────────────────────────────────┘│
│                                          │
│ ┌──────────────────────────────────────┐│
│ │ 🖼️  zdj_wypadek.jpg                  ││
│ │     Zdjęcia • 2024-11-05   [Wybierz] ││
│ └──────────────────────────────────────┘│
│                                          │
│           [Anuluj]                       │
└─────────────────────────────────────────┘
```

### **KROK 3: Wybór dokumentu**
```javascript
window.questionnaireRenderer.attachCrmDocument(docId, crmDocId, filename)
```

1. Zapisuje referencję do dokumentu CRM
2. Zamyka modal
3. Odświeża widok
4. Pokazuje toast: "✅ Dodano: nazwa_pliku.pdf"
5. Auto-save

---

## 📊 **WYŚWIETLANIE ZAŁĄCZONYCH DOKUMENTÓW:**

### **Nowy format - 2 sekcje:**

```
┌─────────────────────────────────────────┐
│ ✅ Załączone dokumenty (3):              │
├─────────────────────────────────────────┤
│ 🗂️ Z CRM (2):                           │
│                                          │
│ ┌──────────────────────────────────────┐│
│ │ 📎 protokol_policji.pdf        [CRM] ││
│ └──────────────────────────────────────┘│
│                                          │
│ ┌──────────────────────────────────────┐│
│ │ 📎 zdj_wypadek.jpg             [CRM] ││
│ └──────────────────────────────────────┘│
│                                          │
│ 📤 Nowe pliki (1):                       │
│                                          │
│ ┌──────────────────────────────────────┐│
│ │ 📄 kosztorys.pdf              [NOWY] ││
│ └──────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### **Kolory badge:**
- **🟣 CRM** - fioletowy (#9b59b6) - dokument z CRM
- **🔵 NOWY** - niebieski (#3498db) - nowy plik

---

## 💾 **FORMAT ZAPISU:**

### **W `answers` obiekcie:**

```javascript
{
    // Nowe pliki (jak wcześniej)
    'doc_protokol_policji_files': [
        'kosztorys.pdf'
    ],
    
    // NOWE: Referencje do dokumentów CRM
    'doc_protokol_policji_crm_refs': [
        {
            id: 123,
            filename: 'protokol_policji.pdf',
            source: 'crm'
        },
        {
            id: 456,
            filename: 'zdj_wypadek.jpg',
            source: 'crm'
        }
    ]
}
```

---

## 🔧 **FUNKCJE API:**

### **1. showCrmDocumentsPicker(docId)**
```javascript
// Otwiera modal z wyborem dokumentów z CRM
window.questionnaireRenderer.showCrmDocumentsPicker('protokol_policji');
```

**Pobiera:**
- `/cases/${caseId}/documents` - lista dokumentów sprawy

**Wyświetla:**
- Modal z listą dokumentów
- Ikony według typu (📄 PDF, 🖼️ obraz, 📎 inne)
- Kategoria + data upload
- Przycisk "Wybierz" dla każdego

### **2. attachCrmDocument(docId, crmDocId, filename)**
```javascript
// Przypisuje dokument z CRM do dokumentu ankiety
window.questionnaireRenderer.attachCrmDocument(
    'protokol_policji',  // ID dokumentu w ankiecie
    123,                 // ID dokumentu w CRM
    'protokol.pdf'       // Nazwa pliku
);
```

**Wykonuje:**
- Sprawdza czy już nie przypisany (unikanie duplikatów)
- Dodaje do `doc_${docId}_crm_refs`
- Odświeża widok dokumentów
- Zapisuje (auto-save)
- Pokazuje toast notification

### **3. showToast(message, type)**
```javascript
// Pokazuje powiadomienie toast
window.questionnaireRenderer.showToast(
    '✅ Dodano: dokument.pdf',
    'success'  // lub 'error', 'info'
);
```

**Typy:**
- `success` - zielony (#27ae60)
- `error` - czerwony (#e74c3c)
- `info` - niebieski (#3498db)

---

## 📁 **ZMODYFIKOWANE PLIKI:**

### **1. questionnaire-renderer.js (v24→v25)**

**Dodane funkcje:**
- `showCrmDocumentsPicker(docId)` - modal wyboru
- `attachCrmDocument(docId, crmDocId, filename)` - przypisanie
- `showToast(message, type)` - powiadomienia

**Zmodyfikowane sekcje:**
- Przycisk "Wybierz z CRM" dodany obok "Załącz"
- Wyświetlanie załączonych dokumentów (2 sekcje)
- Rozróżnienie CRM vs NOWE

### **2. index.html**
```html
<!-- PRZED -->
<script src="...questionnaire-renderer.js?v=24&COMPENSATION_SUPPORT=TRUE"></script>

<!-- PO -->
<script src="...questionnaire-renderer.js?v=25&CRM_DOCUMENTS_PICKER=TRUE"></script>
```

---

## 🧪 **JAK PRZETESTOWAĆ:**

### **Test 1: Sprawdzenie przycisków**
```
1. Ctrl + Shift + F5
2. Otwórz ankietę (upadłość/restrukturyzacja/odszkodowanie)
3. Zakładka "📄 Dokumenty"
4. Sprawdź przyciski:
   - ✨ Generuj AI (zielony)
   - 🗂️ Wybierz z CRM (fioletowy) ← NOWY!
   - 📎 Załącz nowy (niebieski)
```

### **Test 2: Wybór dokumentu z CRM**
```
1. Kliknij "🗂️ Wybierz z CRM"
2. Jeśli brak dokumentów → komunikat
3. Jeśli są → modal z listą
4. Kliknij na dokument
5. Sprawdź:
   - ✅ Modal się zamknął
   - ✅ Toast "Dodano: nazwa.pdf"
   - ✅ Dokument w sekcji "🗂️ Z CRM"
   - ✅ Badge [CRM] (fioletowy)
```

### **Test 3: Mix dokumentów**
```
1. Wybierz 2 dokumenty z CRM
2. Załącz 1 nowy plik
3. Sprawdź wyświetlanie:
   - ✅ "Załączone dokumenty (3):"
   - ✅ Sekcja "🗂️ Z CRM (2):"
   - ✅ Sekcja "📤 Nowe pliki (1):"
   - ✅ Różne kolory badge
```

### **Test 4: Auto-save**
```
1. Wybierz dokument z CRM
2. Poczekaj 30 sekund
3. Sprawdź console:
   - ✅ "💾 Auto-save: zapisano"
4. Zamknij i otwórz ponownie ankietę
5. Sprawdź:
   - ✅ Dokumenty z CRM nadal widoczne
```

---

## ✅ **ZALETY:**

1. **🚀 Szybkość** - nie trzeba ponownie uploadować
2. **📁 Organizacja** - wszystkie dokumenty w jednym miejscu
3. **🔗 Powiązanie** - jasne źródło dokumentu
4. **💾 Oszczędność** - brak duplikatów
5. **🎨 Wizualne** - łatwo rozróżnić źródło
6. **🔄 Synchronizacja** - zmiany w CRM widoczne od razu

---

## 🎯 **PRZYKŁADY UŻYCIA:**

### **Przykład 1: Ankieta odszkodowawcza**
```
Dokument: "Protokół policji"

1. W CRM dodano protokół z wypadku
2. Otwieramy ankietę odszkodowawczą
3. Zakładka "Dokumenty"
4. Klikamy "🗂️ Wybierz z CRM"
5. Wybieramy "protokol_wypadek_20241105.pdf"
6. ✅ Dodany z badge [CRM]
```

### **Przykład 2: Mix źródeł**
```
Dokument: "Dokumentacja medyczna"

Z CRM:
- karta_szpitalna.pdf [CRM]
- wyniki_badań.pdf [CRM]

Nowe:
- zwolnienie_lekarskie.pdf [NOWY]
- recepta_scan.jpg [NOWY]

Wszystkie widoczne w jednej sekcji!
```

---

## 🚀 **PRZYSZŁE ROZSZERZENIA:**

### **1. Usuwanie dokumentów**
```javascript
removeAttachment(docId, refId) {
    // Usuń z listy
    // Odśwież widok
}
```

### **2. Podgląd dokumentu**
```javascript
previewCrmDocument(crmDocId) {
    // Otwórz podgląd dokumentu z CRM
}
```

### **3. Filtry w modal**
```javascript
// Filtruj po kategorii, dacie, typie pliku
<select onchange="filterDocuments(this.value)">
    <option>Wszystkie</option>
    <option>Dowody</option>
    <option>Zdjęcia</option>
</select>
```

### **4. Zaznaczanie wielu**
```javascript
// Checkboxy zamiast kliknięcia
// Przycisk "Dodaj zaznaczone"
```

---

## 📊 **STATYSTYKI:**

```
✅ 3 PRZYCISKI załączania
✅ 2 ŹRÓDŁA dokumentów (CRM + nowe)
✅ 3 FUNKCJE API (picker, attach, toast)
✅ 2 KOLORY badge (fioletowy, niebieski)
✅ 1 MODAL wyboru
✅ 0 DUPLIKATÓW (auto-sprawdzanie)
```

---

**Wersja:** 25 (`CRM_DOCUMENTS_PICKER=TRUE`)  
**Data:** 2025-11-08 13:38  
**Status:** ✅ **GOTOWE!**

**WYBIERAJ DOKUMENTY Z CRM ZAMIAST UPLOADOWAĆ PONOWNIE!** 🗂️📎✨
