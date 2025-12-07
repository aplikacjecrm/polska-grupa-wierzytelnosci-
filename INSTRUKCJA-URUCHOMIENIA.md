# 🚀 INSTRUKCJA URUCHOMIENIA APLIKACJI

## ⚠️ PROBLEM: "Failed to fetch" przy logowaniu

**Przyczyna:** Backend nie jest uruchomiony!

---

## ✅ ROZWIĄZANIE:

### **OPCJA 1: Uruchom przez skrypt (ZALECANE)**

1. **Kliknij dwukrotnie:** `START-BACKEND.bat`
2. Poczekaj na komunikat: **"🚀 Backend uruchomiony na porcie 3500"**
3. **NIE ZAMYKAJ** tego okna!
4. Otwórz przeglądarkę: **http://localhost:3500**

---

### **OPCJA 2: Uruchom Electron (z backendem)**

```bash
npm start
```

**Uwaga:** Electron uruchamia backend automatycznie w tle.

---

### **OPCJA 3: Tylko backend (bez Electron)**

```bash
node test-backend-start.js
```

Następnie otwórz: **http://localhost:3500** w przeglądarce.

---

## 🧪 SPRAWDŹ CZY BACKEND DZIAŁA:

### **Test w przeglądarce:**
```
http://localhost:3500/api/health
```

**Oczekiwany wynik:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T17:05:09.095Z"
}
```

### **Test w PowerShell:**
```powershell
curl http://localhost:3500/api/health
```

**Oczekiwany wynik:** `StatusCode: 200`

---

## 🔍 DIAGNOSTYKA PROBLEMÓW:

### **Problem: Port 3500 zajęty**

**Znajdź proces na porcie 3500:**
```powershell
netstat -ano | findstr :3500
```

**Zabij proces (PID z poprzedniego polecenia):**
```powershell
taskkill /F /PID XXXX
```

---

### **Problem: "Cannot find module"**

**Zainstaluj zależności:**
```bash
npm install
```

---

### **Problem: Błąd bazy danych**

**Reset bazy (UWAGA: Usuwa wszystkie dane!):**
```bash
del data\komunikator.db
node backend/server.js
```

---

## 📁 STRUKTURA APLIKACJI:

```
komunikator-app/
├── START-BACKEND.bat         ← KLIKNIJ TO ABY URUCHOMIĆ BACKEND
├── test-backend-start.js     ← Skrypt diagnostyczny
├── main.js                   ← Główny plik Electron
├── backend/
│   ├── server.js            ← Serwer Express
│   ├── routes/              ← Endpointy API
│   └── database/            ← SQLite
├── frontend/
│   ├── index.html           ← Główna strona
│   └── scripts/             ← JavaScript frontendu
└── data/
    └── komunikator.db       ← Baza danych SQLite
```

---

## 🎯 WORKFLOW PRACY:

### **Rozwój z przeglądarką:**
```
1. Uruchom: START-BACKEND.bat
2. Otwórz: http://localhost:3500
3. Edytuj pliki frontend/
4. Odśwież przeglądarkę (F5)
```

### **Rozwój z Electron:**
```
1. Uruchom: npm start
2. Edytuj pliki
3. Restart Electron
```

---

## ⚙️ ZMIENNE ŚRODOWISKOWE:

Plik `.env` w głównym katalogu:
```env
PORT=3500
DB_PATH=./data/komunikator.db
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 📞 WSPARCIE:

**Backend działa gdy widzisz:**
```
✅ Moduł załadowany
✅ Backend uruchomiony!
🚀 Serwer nasłuchuje na: { address: '::', family: 'IPv6', port: 3500 }
```

**Backend NIE działa gdy:**
- Błąd "EADDRINUSE" → Port zajęty
- Błąd "Cannot find module" → Brak npm install
- Błąd "Failed to fetch" → Backend nie nasłuchuje

---

## 🎉 GOTOWE!

**Backend działa → Możesz się zalogować! ✨**
