# 📋 SYSTEM PIĘKNYCH PANELI ANKIET

## ✅ **CO ZOSTAŁO ZAIMPLEMENTOWANE:**

### **NOWY MODUŁ: `questionnaire-panels.js`**

Piękne, responsywne panele dla wszystkich typów ankiet w CRM, zbudowane w tym samym stylu co ankieta odszkodowawcza.

---

## 🎨 **6 TYPÓW PANELI:**

### **1. 📜 Panel Ankiety Windykacyjnej**
- **Kolor:** Czerwony (#e74c3c → #c0392b)
- **Ikona:** 📜
- **Statystyki:**
  - 12 Sekcji pytań
  - 9 Faz procedury
  - AI Analiza siły dowodów
  - 20 Dokumentów checklist
- **Funkcja:** `window.questionnairePanels.renderDebtCollectionPanel(caseId)`
- **Procedura:** 💰 Wezwanie do zapłaty • ⚖️ Pozew • 🔨 Egzekucja komornicza

---

### **2. 💰 Panel Ankiety Odszkodowawczej**
- **Kolor:** Niebieski (#3498db → #2980b9)
- **Ikona:** 💰
- **Statystyki:**
  - 10 Sekcji pytań
  - 8 Faz procedury
  - 15 TU - Baza kontaktów
  - 22 Dokumenty checklist
- **Funkcja:** `window.questionnairePanels.renderCompensationPanel(caseId)`
- **Procedura:** ⚖️ Dochodzenie roszczeń • 🏢 Integracja z TU • 📊 Pełna procedura

---

### **3. 📉 Panel Ankiety Upadłościowej**
- **Kolor:** Fioletowy (#9b59b6 → #8e44ad)
- **Ikona:** 📉
- **Statystyki:**
  - 7 Sekcji pytań
  - 8 Faz procedury
  - 👨‍⚖️ Syndyk - Dane kontaktowe
  - 9 Dokumentów checklist
- **Funkcja:** `window.questionnairePanels.renderBankruptcyPanel(caseId)`
- **Procedura:** ⚠️ Wniosek (30 dni!) • 👨‍⚖️ Syndyk • 🔄 Likwidacja/Układ

---

### **4. 🔄 Panel Ankiety Restrukturyzacyjnej**
- **Kolor:** Turkusowy (#16a085 → #138d75)
- **Ikona:** 🔄
- **Statystyki:**
  - 8 Sekcji pytań
  - 6 Faz procedury
  - 🤝 Plan układowy - Propozycje
  - 12 Dokumentów checklist
- **Funkcja:** `window.questionnairePanels.renderRestructuringPanel(caseId)`
- **Procedura:** 🔄 4 tryby postępowania • 🤝 Układ • 📊 Plan naprawczy

---

### **5. 🚔 Panel Ankiety Karnej**
- **Kolor:** Ciemnoczerwony (#c0392b → #922b21)
- **Ikona:** 🚔
- **Statystyki:**
  - 15 Sekcji pytań
  - 7 Faz procedury
  - 🛡️ Strategia obrony - AI Analiza
  - 18 Dokumentów checklist
- **Funkcja:** `window.questionnairePanels.renderCriminalPanel(caseId)`
- **Procedura:** 🚔 Przesłuchanie • 🛡️ Obrona • ⚖️ Rozprawa • 📜 Wyrok

---

### **6. 💼 Panel Ankiety Gospodarczej** ← **NOWY!**
- **Kolor:** Pomarańczowy (#f39c12 → #e67e22)
- **Ikona:** 💼
- **Statystyki:**
  - 9 Sekcji pytań
  - 7 Faz procedury
  - 🔨 Egzekucja komornicza
  - 15 Dokumentów checklist
- **Funkcja:** `window.questionnairePanels.renderCommercialPanel(caseId)`
- **Procedura:** 💰 Wezwanie • ⚖️ Pozew • 🚨 Zabezpieczenie • 🔨 Egzekucja
- **Prefix:** GOS/
- **Case type:** 'commercial'

---

## 🎨 **DESIGN PATTERN:**

### **Struktura każdego panelu:**

```html
<div style="background: linear-gradient(135deg, COLOR1, COLOR2);">
    <!-- NAGŁÓWEK -->
    <div style="display: flex;">
        <div>EMOJI (3rem)</div>
        <div>
            <h3>TYTUŁ</h3>
            <p>OPIS</p>
        </div>
    </div>
    
    <!-- GRID STATYSTYK (4 kafelki) -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
        <div>STAT 1</div>
        <div>STAT 2</div>
        <div>STAT 3</div>
        <div>STAT 4</div>
    </div>
    
    <!-- PRZYCISK AKCJI -->
    <button onclick="FUNKCJA">
        EMOJI WYPEŁNIJ ANKIETĘ
    </button>
    
    <!-- STOPKA Z PROCEDURĄ -->
    <p>EMOJI Krok 1 • EMOJI Krok 2 • EMOJI Krok 3</p>
</div>
```

---

## 🎨 **EFEKTY WIZUALNE:**

### **Każdy panel ma:**
- ✅ **Gradient tła** - kolory specyficzne dla typu
- ✅ **Box-shadow** z kolorowym cieniem (opacity 0.4)
- ✅ **Border-radius** 12px (zaokrąglone rogi)
- ✅ **Backdrop-filter: blur(10px)** na kafelkach statystyk
- ✅ **Hover efekt** na przycisku:
  - `scale(1.05)` - powiększenie
  - Zwiększony cień (`0 8px 25px`)
- ✅ **Responsywność** - auto-fit grid (min 200px)
- ✅ **Emoji 3rem** - duża ikonka w nagłówku
- ✅ **White text** - biały tekst na gradiencie
- ✅ **rgba(255,255,255,0.8)** - półprzezroczyste teksty

---

## 🔧 **JAK UŻYWAĆ:**

### **Metoda 1: Ręczne renderowanie**

```javascript
// W kodzie CRM, tam gdzie wyświetlasz szczegóły sprawy:
const panel = window.questionnairePanels.renderDebtCollectionPanel(caseId);
document.getElementById('caseDetails').innerHTML += panel;
```

### **Metoda 2: Automatyczne renderowanie**

```javascript
// System automatycznie wykryje typ sprawy:
window.questionnairePanels.autoRender(caseData, 'caseDetailsContainer');
```

**Auto-render sprawdza:**
- `caseData.case_type` (np. 'debt_collection', 'compensation', 'bankruptcy')
- `caseData.case_number` (prefiks: WIN, ODS, UPA, RES, POB, KRA, etc.)

---

## 📦 **INTEGRACJA:**

### **Dodane do `index.html`:**

```html
<script src="scripts/questionnaires/questionnaire-panels.js?v=1&BEAUTIFUL_PANELS=TRUE&t=20251108233000"></script>
```

### **Kolejność ładowania:**
1. Wszystkie ankiety (part1, part2, part3, main)
2. `questionnaire-renderer.js` (renderowanie formularzy)
3. **`questionnaire-panels.js`** ← NOWY (piękne panele)

---

## 🎯 **AUTOMATYCZNA DETEKCJA TYPU:**

System automatycznie dopasuje panel do typu sprawy:

| Typ sprawy | Prefiks | Panel |
|-----------|---------|-------|
| `debt_collection` | WIN | 📜 Windykacyjna |
| `compensation` | ODS | 💰 Odszkodowawcza |
| `bankruptcy` | UPA | 📉 Upadłościowa |
| `restructuring` | RES | 🔄 Restrukturyzacyjna |
| `commercial` | **GOS** | 💼 **Gospodarcza** ← **NOWY!** |
| `criminal`, `POB`, `KRA`, `OSZ`, `DRO`, `NAR` | - | 🚔 Karna |

---

## 🚀 **PRZYKŁAD UŻYCIA:**

### **W crm-case-tabs.js:**

```javascript
// Gdy otwierasz szczegóły sprawy:
function renderCaseDetails(caseData) {
    // ... render innych szczegółów ...
    
    // Automatycznie dodaj panel ankiety (jeśli dostępny)
    window.questionnairePanels.autoRender(caseData, 'caseDetailsPanel');
}
```

### **Wynik:**
Piękny, kolorowy panel pojawi się automatycznie, jeśli sprawa ma przypisaną ankietę.

---

## 💡 **KORZYŚCI:**

1. **Spójny design** - wszystkie panele w tym samym stylu
2. **Responsive** - dostosowuje się do ekranu
3. **Łatwe rozszerzanie** - dodaj nowy panel w 50 linii kodu
4. **Automatyzacja** - wykrywa typ i renderuje odpowiedni panel
5. **Profesjonalny wygląd** - gradienty, cienie, animacje
6. **Czytelność** - kluczowe statystyki w kafelkach
7. **Call to action** - wyraźny przycisk z hover efektem
8. **Informacje o procedurze** - zawsze widoczne w stopce

---

## 🔮 **ROZSZERZENIA:**

### **Możliwe przyszłe panele:**
- 🏠 **Sprawy mieszkaniowe** (eksmisje, najem)
- 👶 **Sprawy rodzinne** (rozwody, alimenty)
- 🏢 **Sprawy pracownicze** (mobbing, wypowiedzenia)
- 🚗 **Sprawy komunikacyjne** (wypadki drogowe)
- 🏗️ **Sprawy budowlane** (wady, opóźnienia)

### **Dodatkowe funkcje:**
- Progress bar (% wypełnienia ankiety)
- Ostatnia edycja (timestamp)
- Status: Nowa / W trakcie / Ukończona
- Eksport do PDF
- Synchronizacja z kalendarzem (terminy z procedury)

---

## 📁 **PLIK:**

`frontend/scripts/questionnaires/questionnaire-panels.js`

**Rozmiar:** ~450 linii
**Funkcje:** 7 głównych (6 paneli + auto-render)
**Zależności:** questionnaire-renderer.js

---

## ✅ **STATUS: GOTOWE DO UŻYCIA!**

Wszystkie **6 paneli** są w pełni funkcjonalne i gotowe do integracji w CRM:
1. 📜 Windykacja (WIN/)
2. 💰 Odszkodowania (ODS/)
3. 📉 Upadłość (UPA/)
4. 🔄 Restrukturyzacja (RES/)
5. 🚔 Karne (POB/, KRA/, etc.)
6. 💼 **Gospodarcze (GOS/)** ← **NOWY!**

**Ctrl + Shift + R** → odśwież przeglądarkę → panele działają!
