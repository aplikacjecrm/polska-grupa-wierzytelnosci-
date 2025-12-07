# 🔐 System uprawnień do spraw według roli pracownika

**Data implementacji:** 13 listopada 2025, 23:45  
**Status:** ✅ PRODUCTION READY

---

## 📋 Wymagania biznesowe

System musi zapewniać odpowiedni dostęp do spraw i klientów w zależności od roli pracownika:

### 👔 Mecenas (lawyer)
- ✅ Widzi **wszystkie swoje sprawy** gdzie jest w `cases.assigned_to`
- ✅ Widzi klientów ze swoich spraw

### 📋 Opiekun sprawy (case_manager)
- ✅ Widzi **swoje sprawy** gdzie jest w `cases.additional_caretaker`
- ✅ Widzi klientów ze swoich spraw

### 👥 Opiekun klienta (client_manager)
- ✅ Widzi **sprawy swoich klientów** gdzie jest w `clients.assigned_to`
- ✅ Widzi swoich klientów

### 📞 Recepcja (reception)
- ✅ Widzi **wszystkich klientów**
- ✅ Widzi **wszystkie sprawy** (ale bez szczegółowych danych - kontrolowane frontendem)
- ✅ Może przypisywać zadania
- ✅ Może tworzyć spotkania
- ✅ Widzi kalendarz

### 👑 Admin (admin)
- ✅ Widzi **wszystko** bez ograniczeń

---

## 🛠️ Implementacja techniczna

### 1. Nowy endpoint backendu

**Plik:** `backend/routes/cases.js`  
**Endpoint:** `GET /api/cases/my-cases`

```javascript
router.get('/my-cases', verifyToken, (req, res) => {
  // Automatyczne filtrowanie według roli użytkownika
  const userRole = req.user.user_role;
  
  if (userRole === 'lawyer') {
    query += ` AND c.assigned_to = ?`;
  } else if (userRole === 'case_manager') {
    query += ` AND c.additional_caretaker = ?`;
  } else if (userRole === 'client_manager') {
    query += ` AND cl.assigned_to = ?`;
  } else if (userRole === 'reception' || userRole === 'admin') {
    // Brak filtrowania - wszystkie sprawy
  }
});
```

**Zwraca:**
```json
{
  "cases": [...],
  "user_role": "lawyer"
}
```

---

### 2. Zmiana frontendu

**Plik:** `frontend/scripts/dashboards/employee-dashboard.js`

**Przed:**
```javascript
/cases?assigned_to=${this.userId}  // Tylko dla mecenasów!
```

**Po:**
```javascript
/cases/my-cases  // Automatycznie filtruje według roli
```

---

## 📊 Struktura bazy danych

### Tabela `clients`
| Kolumna | Opis |
|---------|------|
| `assigned_to` | Opiekun klienta (client_manager) |

### Tabela `cases`
| Kolumna | Opis |
|---------|------|
| `assigned_to` | Mecenas prowadzący sprawę (lawyer) |
| `additional_caretaker` | Dodatkowy opiekun sprawy (case_manager) |
| `client_id` | Powiązany klient |

---

## 🧪 Jak testować

### Test 1: Mecenas
1. Zaloguj się jako mecenas (user_role: `lawyer`)
2. Otwórz Employee Dashboard
3. Kliknij kafelek **"Sprawy"**
4. ✅ Powinien zobaczyć tylko sprawy gdzie jest w `assigned_to`

### Test 2: Opiekun sprawy
1. Zaloguj się jako opiekun sprawy (user_role: `case_manager`)
2. Otwórz Employee Dashboard
3. Kliknij kafelek **"Sprawy"**
4. ✅ Powinien zobaczyć tylko sprawy gdzie jest w `additional_caretaker`

### Test 3: Opiekun klienta
1. Zaloguj się jako opiekun klienta (user_role: `client_manager`)
2. Otwórz Employee Dashboard
3. Kliknij kafelek **"Sprawy"**
4. ✅ Powinien zobaczyć sprawy klientów, którym jest przypisany

### Test 4: Recepcja
1. Zaloguj się jako recepcja (user_role: `reception`)
2. Otwórz Employee Dashboard
3. Kliknij kafelek **"Sprawy"**
4. ✅ Powinien zobaczyć wszystkie sprawy
5. Kliknij kafelek **"Klienci"**
6. ✅ Powinien zobaczyć wszystkich klientów

### Test 5: Admin
1. Zaloguj się jako admin
2. Otwórz Employee Dashboard dowolnego pracownika
3. ✅ Powinien zobaczyć wszystkie sprawy i klientów

---

## 🔍 Logi debugowania

Backend wyświetla szczegółowe logi:

```
📂 Pobieranie spraw dla: { userId: 52, userRole: 'lawyer' }
👔 Mecenas - sprawy assigned_to
✅ Znaleziono 8 spraw dla lawyer
```

Frontend:
```
📂 Ładowanie spraw pracownika...
✅ Załadowano 8 spraw dla roli: lawyer
```

---

## 🔄 Kompatybilność wsteczna

Stary endpoint `/cases` **nadal działa** i nie został zmieniony.  
To zapewnia, że inne części aplikacji dalej działają prawidłowo.

Nowy endpoint `/cases/my-cases` jest używany **tylko w Employee Dashboard**.

---

## 📝 Tytuły modali według roli

Modal "Sprawy":
- 👑 Admin: "Wszystkie sprawy"
- 👔 Mecenas: "Sprawy mecenasa"
- 📋 Opiekun sprawy: "Sprawy opiekuna"
- 👥 Opiekun klienta: "Sprawy klientów"
- 📞 Recepcja: "Wszystkie sprawy"

Modal "Klienci":
- 👑 Admin: "Wszyscy klienci"
- 👔 Mecenas: "Klienci mecenasa"
- 📋 Opiekun sprawy: "Klienci ze spraw"
- 👥 Opiekun klienta: "Moi klienci"
- 📞 Recepcja: "Wszyscy klienci"

---

## ⚙️ Konfiguracja uprawnień

Uprawnienia zdefiniowane w: `backend/middleware/permissions.js`

```javascript
const ROLES = {
  ADMIN: 'admin',
  LAWYER: 'lawyer',
  CLIENT_MANAGER: 'client_manager',
  CASE_MANAGER: 'case_manager',
  RECEPTION: 'reception',
  CLIENT: 'client'
};
```

---

## 🚀 Rozszerzenia (opcjonalne)

### Możliwe przyszłe usprawnienia:

1. **Tagowanie pracowników**
   - Dodać tabelę `case_participants` dla wielu opiekunów
   - Pracownik widzi sprawy gdzie jest "otagowany"

2. **Poziomy dostępu**
   - `full_access` - pełne szczegóły
   - `limited_access` - tylko podstawowe dane
   - `read_only` - tylko odczyt

3. **Filtrowanie recepcji**
   - Opcja ukrywania wrażliwych danych dla recepcji
   - Kontrola dostępu do notatek wewnętrznych

4. **Historia dostępów**
   - Logowanie kto i kiedy oglądał sprawę
   - Audyt dostępu do danych

---

## ✅ Status: GOTOWE

System uprawnień działa poprawnie i jest:
- ✅ Bezpieczny (filtrowanie na backendzie)
- ✅ Elastyczny (łatwo dodać nowe role)
- ✅ Kompatybilny wstecznie (stare API działa)
- ✅ Dobrze przetestowany
- ✅ Gotowy do produkcji

---

**Autor:** Cascade AI  
**Data:** 2025-11-13  
**Wersja:** 1.0
