# ✅ SYSTEM DWUPOZIOMOWY TYPÓW SPRAW - GOTOWE!

## 🎯 PROBLEM KTÓRY ROZWIĄZANO:

**Wcześniej:**
```
Numer: ODS/JN02/003 ✅ (rozróżnienie wewnętrzne)
Typ: "compensation" ❌ (dla sądu to ŹLE - to nie jest prawny typ sprawy!)
```

**Teraz:**
```
Numer: ODS/JN02/003 ✅ (prefix z podtypu)
Typ prawny: "civil" ✅ (dla sądu - kategoria prawna)
Podtyp: "compensation" ✅ (szczegół wewnętrzny)
```

---

## 📊 DWUPOZIOMOWY SYSTEM:

### **POZIOM 1: Główny typ (case_type) - dla sądu**
- `civil` - Sprawy cywilne
- `criminal` - Sprawy karne
- `administrative` - Sprawy administracyjne
- `commercial` - Sprawy gospodarcze
- `other` - Inne

### **POZIOM 2: Podtyp (case_subtype) - dla Was**

#### **Sprawy cywilne:**
- `compensation` → Odszkodowania (ODS)
- `contract` → Umowy (UMO)
- `family` → Rodzinne (ROD)
- `property` → Majątkowe (MAJ)
- `inheritance` → Spadkowe (SPA)
- `debt` → Windykacja (DLU)

#### **Sprawy karne:**
- `assault` → Pobicie (POB)
- `theft` → Kradzież (KRA)
- `fraud` → Oszustwo (OSZ)
- `traffic` → Drogowe (DRO)
- `drugs` → Narkotyki (NAR)

#### **Sprawy administracyjne:**
- `building` → Budowlane (BUD)
- `tax` → Podatkowe (POD)
- `zoning` → Zagospodarowanie (ZAG)

#### **Sprawy gospodarcze:**
- `business` → Gospodarcze (GOS)
- `bankruptcy` → Upadłościowe (UPA)

---

## 🗄️ ZMIANY W BAZIE DANYCH:

### **Dodano kolumnę:**
```sql
ALTER TABLE cases ADD COLUMN case_subtype TEXT
```

**Teraz tabela `cases` ma:**
- `case_type` VARCHAR - główny typ (civil, criminal, etc.)
- `case_subtype` VARCHAR - podtyp (compensation, contract, etc.)
- `case_number` VARCHAR - numer z prefiksem z podtypu (ODS/...)

---

## 🔌 BACKEND API:

### **1. Endpoint generowania numeru:**
```javascript
GET /api/cases/generate-number/:clientId/:caseSubtype
```
**Zmieniono:**
- Teraz przyjmuje `caseSubtype` zamiast `caseType`
- Używa `subtypePrefixes` zamiast `caseTypeShortcuts`
- Generuje numery typu: `ODS/JN02/003`

### **2. POST /api/cases (nowa sprawa):**
```javascript
{
  case_type: "civil",           // GŁÓWNY TYP
  case_subtype: "compensation", // PODTYP
  case_number: "ODS/JN02/003"
}
```

### **3. PUT /api/cases/:id (aktualizacja):**
```javascript
{
  case_type: "civil",           // GŁÓWNY TYP
  case_subtype: "compensation", // PODTYP
}
```

---

## 🎨 FRONTEND:

### **1. Nowy plik: `case-type-config.js`**
**Zawiera:**
- Mapowanie `subtypeToMainType` (compensation → civil)
- Prefiksy `subtypePrefixes` (compensation → ODS)
- Grupy typów `typeGroups` (dla formularza)
- Polskie nazwy `mainTypeLabels` i `subtypeLabels`
- Funkcje pomocnicze:
  - `getMainTypeFromSubtype()`
  - `getPrefixForSubtype()`
  - `getFullCaseTypeLabel()`

### **2. Nowy plik: `case-type-loader.js`**
**Funkcje:**
- Ładuje dynamiczne opcje do selecta typu sprawy
- Nadpisuje `crmManager.generateCaseNumber()` żeby używało podtypu
- Obsługuje zapis sprawy z dwoma typami

### **3. Formularz nowej sprawy (`index.html`):**
```html
<select id="caseType" required>
  <option value="">Wybierz...</option>
  <optgroup label="⚖️ Sprawy cywilne">
    <option value="compensation">💰 Odszkodowania (ODS)</option>
    <option value="contract">📄 Umowy (UMO)</option>
    ...
  </optgroup>
  <optgroup label="🚔 Sprawy karne">
    ...
  </optgroup>
</select>
```

---

## 📋 PRZYKŁAD DZIAŁANIA:

### **KROK 1: Użytkownik wybiera typ sprawy**
```
Select: "💰 Odszkodowania (ODS)"
↓
Value: "compensation"
Dataset: mainType="civil", prefix="ODS"
```

### **KROK 2: Generowanie numeru**
```
API Call: GET /api/cases/generate-number/123/compensation
↓
Backend: prefix = "ODS" (z subtypePrefixes)
↓
Response: { caseNumber: "ODS/JN02/003" }
```

### **KROK 3: Zapisywanie sprawy**
```javascript
POST /api/cases
{
  case_number: "ODS/JN02/003",
  case_type: "civil",           // ✅ dla sądu
  case_subtype: "compensation", // ✅ dla Was
  title: "Odszkodowanie za wypadek"
}
```

### **KROK 4: Wyświetlanie**
```
Numer: ODS/JN02/003
Typ: Cywilna - Odszkodowania
```

---

## 🚀 JAK UŻYWAĆ:

### **1. Dodawanie nowej sprawy:**
1. Wybierz klienta
2. Wybierz **podtyp** z listy (np. "💰 Odszkodowania (ODS)")
3. System automatycznie:
   - Wygeneruje numer z prefiksem ODS
   - Ustawi `case_type` na "civil"
   - Ustawi `case_subtype` na "compensation"

### **2. W bazie danych:**
```sql
SELECT 
  case_number,        -- ODS/JN02/003
  case_type,          -- civil (dla sądu)
  case_subtype,       -- compensation (dla Was)
  title
FROM cases;
```

### **3. W szczegółach sprawy:**
```
Typ sprawy: Cywilna - Odszkodowania
```

---

## ✅ CO DZIAŁA:

✅ Dwupoziomowy system typów (główny + podtyp)  
✅ Automatyczne mapowanie podtypu → główny typ  
✅ Generowanie numerów z prefiksem podtypu  
✅ Zapisywanie obu typów do bazy  
✅ Dynamiczny formularz z grupami  
✅ Polskie nazwy wszystkich typów  

---

## 📁 ZMODYFIKOWANE PLIKI:

### Backend:
1. `backend/database/init.js` - dodano kolumnę `case_subtype`
2. `backend/routes/cases.js` - obsługa case_subtype w API

### Frontend:
1. `frontend/scripts/case-type-config.js` - NOWY - konfiguracja typów
2. `frontend/scripts/case-type-loader.js` - NOWY - ładowanie formularza
3. `frontend/index.html` - zmieniony select typu sprawy

---

## 🔄 MIGRACJA ISTNIEJĄCYCH SPRAW:

**Dla spraw które już istnieją w bazie:**
```sql
-- Przykład: Ustaw case_type dla ODS
UPDATE cases 
SET case_type = 'civil', case_subtype = 'compensation'
WHERE case_number LIKE 'ODS/%';

-- Przykład: Ustaw case_type dla UMO
UPDATE cases 
SET case_type = 'civil', case_subtype = 'contract'
WHERE case_number LIKE 'UMO/%';
```

---

## 🎯 ZALETY SYSTEMU:

1. **Dla sądu:** Zawsze poprawny typ prawny (civil, criminal)
2. **Dla kancelarii:** Szczegółowa kategoryzacja (compensation, contract)
3. **Numeracja:** Czytelne prefiksy (ODS, UMO, POB)
4. **Elastyczność:** Łatwo dodać nowe podtypy
5. **Raportowanie:** Grupowanie według głównego typu LUB podtypu

---

## 🚀 NASTĘPNE KROKI:

**Możliwe rozszerzenia:**
1. Filtrowanie spraw według głównego typu lub podtypu
2. Raporty grupowane według typów
3. Statystyki dla każdego podtypu
4. Szabłony dokumentów per podtyp
5. Automatyczne sugestie pól według podtypu

---

**Status:** ✅ Gotowe do użycia!  
**Wersja:** 1.0  
**Data:** 5 listopada 2025  

🎉 **SYSTEM DWUPOZIOMOWY ZAIMPLEMENTOWANY!** 🎉
