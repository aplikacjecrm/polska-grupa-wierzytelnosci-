# 🔄 JAK ZRESTARTOWAĆ BACKEND

**Powód:** Zmiany w `code-generator.js` wymagają restartu serwera

---

## 🛑 KROK 1: ZATRZYMAJ BACKEND

### **Opcja A: Przez terminal gdzie działa serwer**
```
Ctrl + C
```

### **Opcja B: Przez PowerShell**
```powershell
# Znajdź proces Node.js na porcie 3500
netstat -ano | findstr :3500

# Zabij proces (zamień PID na numer z poprzedniej komendy)
taskkill /PID [numer_procesu] /F
```

### **Opcja C: Zabij wszystkie procesy Node.js**
```powershell
taskkill /IM node.exe /F
```

---

## ▶️ KROK 2: URUCHOM BACKEND PONOWNIE

### **W terminalu w folderze projektu:**
```bash
cd backend
node server.js
```

### **Lub użyj skryptu:**
```bash
START-BACKEND.bat
```

---

## ✅ KROK 3: SPRAWDŹ CZY DZIAŁA

### **Powinno pokazać:**
```
🚀 Server running on http://localhost:3500
📊 Database initialized successfully
✅ Code generator loaded
```

### **Test API:**
```bash
curl http://localhost:3500/api/health
```

Odpowiedź:
```json
{"status":"ok"}
```

---

## 🧪 KROK 4: PRZETESTUJ NOWY FORMAT

1. Odśwież przeglądarkę (`Ctrl + Shift + R`)
2. Otwórz sprawę
3. Zakładka "👤 Świadkowie"
4. Dodaj nowego świadka
5. Kod powinien być: `ŚW/SP-001/2025/001` ✅

---

## ⚠️ JEŚLI NADAL NIE DZIAŁA:

### **1. Sprawdź logi backendu:**
```
console.log('✅ NOWY SYSTEM: Wygenerowano kod świadka:', witnessCode);
```

### **2. Sprawdź cache Node.js:**
```bash
# Wyczyść cache
npm cache clean --force

# Usuń node_modules i zainstaluj ponownie
rm -rf node_modules
npm install
```

### **3. Sprawdź czy plik został zapisany:**
```powershell
# Pokaż ostatnią modyfikację pliku
Get-Item backend/utils/code-generator.js | Select-Object LastWriteTime
```

---

## 🎯 SZYBKIE ROZWIĄZANIE:

```bash
# 1. Zatrzymaj backend (Ctrl + C w terminalu gdzie działa)
# 2. Uruchom ponownie:
cd c:/Users/horyz/CascadeProjects/windsurf-project/kancelaria/komunikator-app/backend
node server.js
```

**To powinno wystarczyć!** ✅
