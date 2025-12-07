# ⚙️ KONFIGURACJA PROWIZJI DLA SPRAW

## 🎯 Czym to jest?

System pozwala ustawić **różne stawki prowizji dla poszczególnych spraw**.

Zamiast stałych 15%, 10%, 5% - możesz ustawić:
- Sprawa A: Mecenas 20%, Opiekun sprawy 12%, Opiekun klienta 8%
- Sprawa B: Mecenas 10%, Opiekun sprawy 5%, Opiekun klienta 3%
- Sprawa C: Domyślne stawki (15%, 10%, 5%)

---

## 🔄 PRIORYTET STAWEK

System sprawdza stawki w kolejności:

```
1️⃣ NIESTANDARDOWA STAWKA DLA SPRAWY (najwyższy priorytet)
   ↓ jeśli nie ma
2️⃣ INDYWIDUALNA STAWKA UŻYTKOWNIKA
   ↓ jeśli nie ma
3️⃣ DOMYŚLNA STAWKA (15%, 10%, 5%)
```

**Przykład:**
- Sprawa #123 ma niestandardowe stawki: Mecenas 20%
- Jan Kowalski prowadzi sprawę #123
- Płatność 5,000 zł → Prowizja Jana: **1,000 zł (20%)** ✅
- Inna sprawa bez niestandardowych stawek → Prowizja Jana: **750 zł (15%)** ✅

---

## 🛠️ API ENDPOINTS

### **1. Pobierz konfigurację sprawy**

```http
GET /api/commissions/case/:caseId/config
Authorization: Bearer {token}
```

**Odpowiedź:**
```json
{
  "success": true,
  "hasCustom": true,
  "custom": [
    {
      "role": "lawyer",
      "commission_value": 20.0,
      "applies_to": "case:123",
      "notes": "Wyższa stawka dla tej sprawy"
    }
  ],
  "defaults": [
    {
      "role": "lawyer",
      "commission_value": 15.0,
      "applies_to": "all"
    },
    {
      "role": "case_manager",
      "commission_value": 10.0,
      "applies_to": "all"
    },
    {
      "role": "client_manager",
      "commission_value": 5.0,
      "applies_to": "all"
    }
  ]
}
```

---

### **2. Ustaw niestandardowe stawki**

```http
POST /api/commissions/case/:caseId/config
Authorization: Bearer {token}
Content-Type: application/json

{
  "lawyer_rate": 20,
  "case_manager_rate": 12,
  "client_manager_rate": 8,
  "notes": "Wyższa stawka ze względu na skomplikowanie sprawy"
}
```

**Odpowiedź:**
```json
{
  "success": true,
  "message": "Konfiguracja prowizji zapisana",
  "rates": [
    { "role": "lawyer", "value": 20 },
    { "role": "case_manager", "value": 12 },
    { "role": "client_manager", "value": 8 }
  ]
}
```

**Uprawnienia:** Tylko **admin** i **finance** mogą ustawiać

---

### **3. Usuń niestandardowe stawki (przywróć domyślne)**

```http
DELETE /api/commissions/case/:caseId/config
Authorization: Bearer {token}
```

**Odpowiedź:**
```json
{
  "success": true,
  "message": "Przywrócono domyślne stawki prowizji"
}
```

**Uprawnienia:** Tylko **admin** i **finance** mogą usuwać

---

## 💼 JAK UŻYWAĆ?

### **SCENARIUSZ 1: Skomplikowana sprawa - wyższe stawki**

**Sytuacja:** Sprawa karna, bardzo skomplikowana, wymaga więcej pracy

**Krok 1:** Finance/Admin ustawia wyższe stawki
```javascript
// Frontend
const response = await window.api.request(`/commissions/case/123/config`, 'POST', {
  lawyer_rate: 25,        // Zamiast 15%
  case_manager_rate: 15,  // Zamiast 10%
  client_manager_rate: 10, // Zamiast 5%
  notes: "Sprawa karna - wyższa stawka"
});
```

**Krok 2:** Mecenas wystawia płatność 10,000 zł

**Rezultat:**
```
✅ Mecenas: 2,500 zł (25% zamiast 1,500 zł)
✅ Opiekun sprawy: 1,500 zł (15% zamiast 1,000 zł)
✅ Opiekun klienta: 1,000 zł (10% zamiast 500 zł)

SUMA: 5,000 zł prowizji (50%)
```

---

### **SCENARIUSZ 2: Prosta sprawa - niższe stawki**

**Sytuacja:** Prosta sprawa administracyjna, mało pracy

**Krok 1:** Finance/Admin ustawia niższe stawki
```javascript
const response = await window.api.request(`/commissions/case/456/config`, 'POST', {
  lawyer_rate: 10,        // Zamiast 15%
  case_manager_rate: 5,   // Zamiast 10%
  client_manager_rate: 3, // Zamiast 5%
  notes: "Prosta sprawa administracyjna"
});
```

**Krok 2:** Mecenas wystawia płatność 2,000 zł

**Rezultat:**
```
✅ Mecenas: 200 zł (10% zamiast 300 zł)
✅ Opiekun sprawy: 100 zł (5% zamiast 200 zł)
✅ Opiekun klienta: 60 zł (3% zamiast 100 zł)

SUMA: 360 zł prowizji (18%)
```

---

### **SCENARIUSZ 3: Powrót do domyślnych**

**Sytuacja:** Sprawa zakończona, chcemy przywrócić normalne stawki

**Krok 1:** Finance/Admin usuwa niestandardowe stawki
```javascript
const response = await window.api.request(`/commissions/case/123/config`, 'DELETE');
```

**Rezultat:** Wszystkie przyszłe płatności będą miały domyślne stawki (15%, 10%, 5%)

---

## 🗄️ STRUKTURA BAZY DANYCH

### Kolumna `applies_to` w `commission_rates`:

```sql
-- Domyślna stawka dla wszystkich
applies_to = 'all' lub NULL

-- Stawka dla konkretnej sprawy
applies_to = 'case:123'

-- Stawka dla konkretnego użytkownika
user_id = 5, applies_to = 'all'
```

### Przykładowe rekordy:

```sql
-- Domyślne stawki
INSERT INTO commission_rates VALUES (0, 'lawyer', 'percentage', 15.0, 'all', 1, NULL);
INSERT INTO commission_rates VALUES (0, 'case_manager', 'percentage', 10.0, 'all', 1, NULL);
INSERT INTO commission_rates VALUES (0, 'client_manager', 'percentage', 5.0, 'all', 1, NULL);

-- Niestandardowe stawki dla sprawy 123
INSERT INTO commission_rates VALUES (0, 'lawyer', 'percentage', 20.0, 'case:123', 1, 'Wyższa stawka');
INSERT INTO commission_rates VALUES (0, 'case_manager', 'percentage', 12.0, 'case:123', 1, 'Wyższa stawka');
INSERT INTO commission_rates VALUES (0, 'client_manager', 'percentage', 8.0, 'case:123', 1, 'Wyższa stawka');
```

---

## 📊 LOGOWANIE

W logach serwera zobaczysz:

```
⚙️ [COMMISSIONS] Ustawianie niestandardowych stawek dla sprawy 123
   Mecenas: 20%, Opiekun sprawy: 12%, Opiekun klienta: 8%
✅ Konfiguracja zapisana

💰 [COMMISSIONS] Wyliczanie prowizji dla płatności 789...
⚙️ Użyto niestandardowej stawki dla sprawy 123: 20%
✅ Prowizja mecenasa: 2000.00 PLN (20%)
✅ Prowizja opiekuna sprawy: 1200.00 PLN (12%)
✅ Prowizja opiekuna klienta: 800.00 PLN (8%)
✅ [COMMISSIONS] Utworzono 3 prowizji
```

---

## 🔒 UPRAWNIENIA

| Akcja | Admin | Finance | HR | Lawyer | Inne |
|-------|-------|---------|-----|--------|------|
| **Zobacz konfigurację** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Ustaw stawki** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Usuń stawki** | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 🎯 PRZYKŁADOWE UŻYCIE W PRAKTYCE

### **1. Utwórz konfigurację w Admin Dashboard**

```javascript
// W przyszłości dodamy interfejs graficzny
// Na razie używaj Postman lub Console DevTools:

fetch('http://localhost:3000/api/commissions/case/123/config', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    lawyer_rate: 20,
    case_manager_rate: 12,
    client_manager_rate: 8,
    notes: "VIP Klient - wyższa stawka"
  })
}).then(r => r.json()).then(console.log);
```

### **2. Sprawdź obecną konfigurację**

```javascript
fetch('http://localhost:3000/api/commissions/case/123/config', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
}).then(r => r.json()).then(data => {
  if (data.hasCustom) {
    console.log('Sprawa ma niestandardowe stawki:', data.custom);
  } else {
    console.log('Sprawa używa domyślnych stawek:', data.defaults);
  }
});
```

---

## ✅ PODSUMOWANIE

**Co zyskujesz:**
- ✅ Elastyczne stawki prowizji dla każdej sprawy
- ✅ Automatyczne stosowanie niestandardowych stawek
- ✅ Łatwy powrót do domyślnych stawek
- ✅ Pełna kontrola dla Finance/Admin
- ✅ Historia i logowanie wszystkich zmian

**Gotowe do użycia! 🚀**

---

**Utworzono:** 2025-11-23 22:55  
**Wersja:** 1.0  
**Status:** ✅ Działający system
