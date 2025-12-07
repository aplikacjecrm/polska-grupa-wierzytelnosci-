# 👥 EMPLOYEE DASHBOARD HR - KOMPLEKSOWY PLAN

**Data:** 13 listopada 2025 | **Wersja:** 1.0 | **Status:** 📋 Plan

---

## 🎯 WIZJA - Dashboard HR pokazuje:
- **📊 Statystyki** - sprawy, klienci, wydarzenia
- **⏰ Logowania** - kiedy i jak długo online każdego dnia
- **📋 Aktywność** - wszystkie akcje (sprawy, dokumenty, wydarzenia)
- **🎫 Zadania** - przypisane, terminy, wykonanie
- **👤 Profil HR** - zatrudnienie, stanowisko, specjalizacja
- **⭐ Oceny** - rekomendacje, oceny wydajności
- **📈 Wykresy** - trendy aktywności, obciążenie

---

## 📍 STATUS

### ✅ GOTOWE:
- Panel admina z zarządzaniem użytkownikami
- System ról: admin, lawyer, client_manager, case_manager, reception
- API `/auth/users`
- `admin-dashboard.js` z tabelą użytkowników

### ❌ BRAKUJE:
- Tabele: `employee_profiles`, `activity_logs`, `login_sessions`, `employee_reviews`, `employee_tasks`
- API dla HR
- Employee Dashboard UI
- Automatyczne logowanie aktywności

---

## 🗂️ BAZA DANYCH - 5 NOWYCH TABEL

### 1. **employee_profiles** - Dane kadrowe
```sql
CREATE TABLE employee_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  phone TEXT, position TEXT, department TEXT,
  specialization TEXT, license_number TEXT,
  hire_date DATE, contract_type TEXT,
  bio TEXT, avatar_url TEXT, skills TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 2. **login_sessions** - Historia logowań
```sql
CREATE TABLE login_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  login_time DATETIME NOT NULL,
  logout_time DATETIME,
  duration_seconds INTEGER,
  ip_address TEXT, user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. **activity_logs** - Historia akcji
```sql
CREATE TABLE activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  action_category TEXT,
  description TEXT NOT NULL,
  related_case_id INTEGER,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4. **employee_reviews** - Oceny
```sql
CREATE TABLE employee_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  reviewer_id INTEGER NOT NULL,
  review_type TEXT, rating INTEGER,
  strengths TEXT, recommendations TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 5. **employee_tasks** - Zadania
```sql
CREATE TABLE employee_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assigned_to INTEGER NOT NULL,
  title TEXT NOT NULL, description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  due_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔌 BACKEND API - 9 NOWYCH ENDPOINTÓW

### Moduł: `/api/employees`

1. **GET /api/employees/:userId/profile** - Profil + statystyki
2. **PUT /api/employees/:userId/profile** - Aktualizuj profil
3. **GET /api/employees/:userId/activity** - Historia aktywności
4. **GET /api/employees/:userId/login-history** - Logowania
5. **GET /api/employees/:userId/tasks** - Zadania
6. **POST /api/employees/:userId/tasks** - Utwórz zadanie
7. **GET /api/employees/:userId/reviews** - Oceny
8. **POST /api/employees/:userId/reviews** - Dodaj ocenę
9. **GET /api/employees/stats** - Statystyki wszystkich (admin)

### Rozszerzenia istniejących:
- **POST /auth/login** → Zapisz do `login_sessions`
- **POST /auth/logout** → Zaktualizuj `logout_time`

---

## 🎨 FRONTEND - Employee Dashboard

### Plik: `frontend/scripts/dashboards/employee-dashboard.js`

```javascript
class EmployeeDashboard {
  constructor(userId) {
    this.userId = userId;
  }
  
  async render() {
    return `
      <div class="employee-dashboard">
        <!-- HEADER: Profil -->
        ${this.renderProfileHeader()}
        
        <!-- STATS: 6 kart -->
        ${this.renderStatsCards()}
        
        <!-- TABS: 5 zakładek -->
        <div class="employee-tabs">
          📋 Aktywność | ⏰ Logowania | 🎫 Zadania | ⚖️ Sprawy | ⭐ Oceny
        </div>
      </div>
    `;
  }
  
  renderProfileHeader() {
    return `
      <div class="profile-card">
        <img src="${avatar}" />
        <h2>${name}</h2>
        <p>${role} | ${position}</p>
        <span>📅 Zatrudniony: ${hire_date}</span>
      </div>
    `;
  }
  
  renderStatsCards() {
    return `
      <div class="stat-card">⚖️ ${cases_count} Sprawy</div>
      <div class="stat-card">👥 ${clients_count} Klienci</div>
      <div class="stat-card">📅 ${events_count} Wydarzenia</div>
      <div class="stat-card">🎫 ${tasks_done}/${tasks_total} Zadania</div>
      <div class="stat-card">⏰ ${today_hours}h Dzisiaj</div>
      <div class="stat-card">📊 ${month_hours}h Miesiąc</div>
    `;
  }
}
```

---

## 🔄 AUTO-TRACKING AKTYWNOŚCI

### Middleware: `backend/middleware/activity-logger.js`

```javascript
function logActivity(actionType, category) {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      if (data.success) {
        db.run(`INSERT INTO activity_logs 
          (user_id, action_type, action_category, description) 
          VALUES (?, ?, ?, ?)`,
          [req.user.id, actionType, category, generateDesc(actionType, data)]
        );
      }
      return originalJson.call(this, data);
    };
    next();
  };
}

// Użycie:
router.post('/cases', verifyToken, logActivity('case_created', 'case'), ...);
router.post('/documents', verifyToken, logActivity('doc_uploaded', 'doc'), ...);
```

---

## 🎯 PLAN IMPLEMENTACJI

### **FAZA 1: Baza (1-2 dni)** ⏱️
- [ ] Migracja: 5 nowych tabel
- [ ] Indeksy dla wydajności
- [ ] Testy migracji

### **FAZA 2: Backend (2-3 dni)** ⏱️
- [ ] 9 nowych endpointów `/api/employees`
- [ ] Middleware: activity-logger
- [ ] Rozszerzenie login/logout
- [ ] Testy API

### **FAZA 3: Frontend (3-4 dni)** ⏱️
- [ ] `employee-dashboard.js` - główna klasa
- [ ] Profile Header + Stats Cards
- [ ] Tab: Activity Timeline
- [ ] Tab: Login History + Chart
- [ ] Tab: Tasks
- [ ] Tab: Cases
- [ ] Tab: Reviews
- [ ] CSS + responsywność

### **FAZA 4: Integracja (1 dzień)** ⏱️
- [ ] Przycisk "Dashboard" w admin-dashboard.js
- [ ] Event bus integration
- [ ] Chart.js dla wykresów
- [ ] Testy end-to-end

### **FAZA 5: Funkcje zaawansowane (2-3 dni)** ⏱️
- [ ] Wykresy: Line, Bar, Heatmap, Radar
- [ ] Eksport do PDF/Excel
- [ ] Powiadomienia o zadaniach
- [ ] System rekomendacji AI

---

## 📊 WYKRESY (Chart.js)

1. **Wykres czasu pracy** (Line) - trendy miesięczne
2. **Wykres obciążenia** (Bar) - sprawy vs zadania
3. **Heatmap aktywności** - godziny x dni
4. **Radar wydajności** - 5 metryk

---

## 💡 FUNKCJE ZAAWANSOWANE

### Auto-raporty
- Raport dzienny: email z podsumowaniem dnia
- Raport tygodniowy: statystyki zespołu
- Raport miesięczny: ocena wydajności

### AI Insights
- Sugestie obciążenia: "Pracownik ma za dużo spraw"
- Anomalie: "Nietypowy czas logowania"
- Trendy: "Spadek wydajności w tym miesiącu"

### Gamifikacja
- Badge'e za osiągnięcia
- Ranking pracowników (opcjonalny)
- Cele miesięczne

---

## 📈 METRYKI WYDAJNOŚCI

### KPI Pracownika:
1. **Produktywność** = Sprawy zakończone / Sprawy przypisane
2. **Punktualność** = Zadania na czas / Wszystkie zadania
3. **Aktywność** = Średni czas online dziennie
4. **Jakość** = Średnia ocena z reviews
5. **Obciążenie** = (Sprawy + Zadania) / Norma

---

## 🔒 UPRAWNIENIA

- **Admin** - widzi wszystko, może edytować
- **Manager** - widzi swoich podwładnych
- **Pracownik** - widzi tylko swój dashboard (read-only)
- **Client** - brak dostępu

---

## ✅ CHECKLIST PRZED STARTEM

- [ ] Czy backend ma tabele users?
- [ ] Czy jest middleware auth?
- [ ] Czy jest event-bus.js?
- [ ] Czy Chart.js jest dodany?
- [ ] Czy SQLite wspiera DATE?

---

## 🚀 NASTĘPNE KROKI

1. **Stwórz migrację** - 5 tabel
2. **Napisz API** - employees routes
3. **Zbuduj UI** - employee-dashboard.js
4. **Dodaj przycisk** - w admin-dashboard
5. **Testuj** - różne role

**Szacowany czas:** 8-12 dni pracy

---

**Gotowy do implementacji?** 🚀
