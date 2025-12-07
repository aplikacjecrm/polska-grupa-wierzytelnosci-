# 👥 System Personelu - Dokumentacja

**Wersja:** 11.0  
**Data:** 7 listopada 2025  
**Status:** ✅ PRODUKCYJNY - Testowe dane personelu

---

## 🎯 TESTOWY PERSONEL

System używa **tymczasowych** danych personelu do testowania funkcjonalności.  
**Później zamienisz** te dane na prawdziwych pracowników z bazy danych.

---

## 👨‍⚖️ MECENASI (3 osoby)

### **1. Mec. Jan Kowalski**
- ID: `lawyer_a`
- Ikona: 👨‍⚖️
- Wyświetlana nazwa: "Mec. Jan Kowalski"

### **2. Mec. Anna Nowak**
- ID: `lawyer_b`
- Ikona: 👩‍⚖️
- Wyświetlana nazwa: "Mec. Anna Nowak"

### **3. Mec. Piotr Wiśniewski**
- ID: `lawyer_c`
- Ikona: 👨‍⚖️
- Wyświetlana nazwa: "Mec. Piotr Wiśniewski"

---

## 👔 ASYSTENCI/OPIEKUNOWIE (3 osoby)

### **1. Maria Lewandowska**
- ID: `manager_a`
- Ikona: 👔
- Wyświetlana nazwa: "Maria Lewandowska"

### **2. Tomasz Kamiński**
- ID: `manager_b`
- Ikona: 👔
- Wyświetlana nazwa: "Tomasz Kamiński"

### **3. Katarzyna Zielińska**
- ID: `manager_c`
- Ikona: 👔
- Wyświetlana nazwa: "Katarzyna Zielińska"

---

## 📋 GDZIE UŻYWANE?

### **1. Formularz dodawania wydarzenia**

**Select "Spotkanie z mecenasem":**
```
⚖️ Spotkanie z mecenasem (opcjonalnie)
├── -- Nie wybrano --
├── 👨‍⚖️ Mec. Jan Kowalski
├── 👩‍⚖️ Mec. Anna Nowak
└── 👨‍⚖️ Mec. Piotr Wiśniewski
```

**Select "Asystent/Opiekun":**
```
👤 Asystent/Opiekun (opcjonalnie)
├── -- Nie wybrano --
├── 👔 Maria Lewandowska
├── 👔 Tomasz Kamiński
└── 👔 Katarzyna Zielińska
```

---

### **2. Wyświetlanie w kalendarzu**

**W modalu dnia:**
```
┌────────────────────────────────────┐
│ 👥 Konsultacja prawna         10:00│
│ 📍 Kancelaria, Sala 2              │
│ 👨‍⚖️ Mec. Anna Nowak               │
│ 👔 Maria Lewandowska               │
└────────────────────────────────────┘
```

---

### **3. W kartach wydarzeń**

**Widok tygodniowy/miesięczny:**
```
10:00 Konsultacja
👨‍⚖️ Mec. Anna Nowak
```

---

## 💾 ZAPIS W BAZIE DANYCH

### **Struktura `extra_data`:**

```json
{
  "assigned_lawyer": "lawyer_b",
  "case_manager": "manager_a",
  "new_client": {
    "first_name": "Jan",
    "last_name": "Kowalski",
    "phone": "123-456-789",
    "email": "jan@example.com",
    "address": "ul. Przykładowa 123"
  }
}
```

---

## 🔄 JAK ZAMIENIĆ NA PRAWDZIWYCH PRACOWNIKÓW?

### **KROK 1: Przygotuj dane**

Upewnij się, że masz tabelę `users` z pracownikami:

```sql
SELECT id, first_name, last_name, user_role 
FROM users 
WHERE user_role IN ('lawyer', 'case_manager')
```

---

### **KROK 2: Stwórz API endpoint**

**Backend: `routes/staff.js`**

```javascript
// GET /api/staff/lawyers
router.get('/lawyers', (req, res) => {
    const lawyers = db.prepare(`
        SELECT id, first_name, last_name 
        FROM users 
        WHERE user_role = 'lawyer' 
        ORDER BY last_name
    `).all();
    
    res.json({ lawyers });
});

// GET /api/staff/managers
router.get('/managers', (req, res) => {
    const managers = db.prepare(`
        SELECT id, first_name, last_name 
        FROM users 
        WHERE user_role = 'case_manager' 
        ORDER BY last_name
    `).all();
    
    res.json({ managers });
});
```

---

### **KROK 3: Zmień frontend**

**W `calendar-manager.js`, funkcja `showNewEventForm()`:**

**USUŃ:**
```javascript
<select id="quickEventLawyer" ...>
    <option value="">-- Nie wybrano --</option>
    <option value="lawyer_a">👨‍⚖️ Mec. Jan Kowalski</option>
    <option value="lawyer_b">👩‍⚖️ Mec. Anna Nowak</option>
    <option value="lawyer_c">👨‍⚖️ Mec. Piotr Wiśniewski</option>
</select>
```

**DODAJ:**
```javascript
<select id="quickEventLawyer" ...>
    <option value="">-- Nie wybrano --</option>
</select>
```

**I funkcję ładującą:**
```javascript
async loadStaffForSelects() {
    try {
        // Mecenasi
        const lawyersResp = await window.api.request('/staff/lawyers');
        const lawyers = lawyersResp.lawyers || [];
        
        const lawyerSelect = document.getElementById('quickEventLawyer');
        if (lawyerSelect) {
            lawyerSelect.innerHTML = `
                <option value="">-- Nie wybrano --</option>
                ${lawyers.map(l => `
                    <option value="${l.id}">
                        👨‍⚖️ Mec. ${l.first_name} ${l.last_name}
                    </option>
                `).join('')}
            `;
        }
        
        // Opiekunowie
        const managersResp = await window.api.request('/staff/managers');
        const managers = managersResp.managers || [];
        
        const managerSelect = document.getElementById('quickEventCaseManager');
        if (managerSelect) {
            managerSelect.innerHTML = `
                <option value="">-- Nie wybrano --</option>
                ${managers.map(m => `
                    <option value="${m.id}">
                        👔 ${m.first_name} ${m.last_name}
                    </option>
                `).join('')}
            `;
        }
    } catch (error) {
        console.error('❌ Błąd ładowania personelu:', error);
    }
}
```

**Wywołaj w `showNewEventForm()`:**
```javascript
// Załaduj listę klientów
this.loadClientsForSelect();

// DODAJ:
this.loadStaffForSelects();
```

---

### **KROK 4: Zmień mapowanie w wyświetlaniu**

**W funkcji wyświetlania wydarzeń:**

**USUŃ:**
```javascript
const lawyerNames = {
    'lawyer_a': '👨‍⚖️ Mec. Jan Kowalski',
    'lawyer_b': '👩‍⚖️ Mec. Anna Nowak',
    'lawyer_c': '👨‍⚖️ Mec. Piotr Wiśniewski'
};
```

**DODAJ:**
```javascript
// Pobierz dane z API lub cache
let lawyerName = '';
if (extraData.assigned_lawyer) {
    const lawyer = await this.getLawyerById(extraData.assigned_lawyer);
    if (lawyer) {
        lawyerName = `👨‍⚖️ Mec. ${lawyer.first_name} ${lawyer.last_name}`;
    }
}
```

---

### **KROK 5: Zapis**

Zamiast zapisywać `"lawyer_a"`, zapisuj prawdziwe `user_id`:

```javascript
eventData.extra_data.assigned_lawyer = parseInt(lawyerSelect.value);
```

---

## 📊 PORÓWNANIE

### **TERAZ (testowe):**
```javascript
extra_data: {
    assigned_lawyer: "lawyer_a",  // string
    case_manager: "manager_a"     // string
}
```

### **DOCELOWO (prawdziwe):**
```javascript
extra_data: {
    assigned_lawyer: 5,    // user_id z bazy
    case_manager: 12       // user_id z bazy
}
```

---

## ✅ ZALETY OBECNEGO SYSTEMU

**Testowe dane pozwalają:**
- ✅ Testować funkcjonalność bez bazy użytkowników
- ✅ Pokazać klientowi demo systemu
- ✅ Rozwijać UI bez zależności od backendu
- ✅ Łatwo zmienić na produkcyjne dane (jeden plik)

---

## 🎯 KIEDY ZAMIENIĆ?

**Zamień na prawdziwych pracowników gdy:**
1. Masz gotową tabelę `users` z personelem
2. System autoryzacji działa
3. Chcesz trackować kto prowadzi spotkania
4. Potrzebujesz raportów i statystyk

---

## 📁 PLIKI DO MODYFIKACJI

**Gdy będziesz zamieniać:**

1. `frontend/scripts/calendar-manager.js` - linia ~704, ~928, ~941
2. Dodaj: `backend/routes/staff.js` - nowy plik
3. Dodaj: `backend/server.js` - `app.use('/api/staff', staffRouter)`

---

## 🚀 GOTOWE!

System działa z testowymi danymi i jest **gotowy** na zamianę na prawdziwych pracowników!

**Wszystkie nazwy są teraz PO POLSKU! 🇵🇱**
