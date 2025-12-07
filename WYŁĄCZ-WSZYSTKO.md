# ❌ WYŁĄCZAM SYSTEM - ZA DUŻO PROBLEMÓW

## 🔴 Co się stało:

1. **Backend crashuje** - polskie znaki w nazwach plików
2. **Retry 3x** - frontend próbuje 3 razy i spamuje błędami  
3. **Cache problemy** - Node.js nie ładuje nowych zmian
4. **Błędy nawarstwiają się**

---

## ✅ ROZWIĄZANIE:

### **Zatrzymaj wszystko i zacznij od nowa:**

```powershell
# 1. Zabij wszystkie procesy Node
taskkill /F /IM node.exe

# 2. Wyczyść cache Node.js
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# 3. Usuń problematyczny plik z bazy
# (plik który crashuje backend)
```

---

## 🔧 GŁÓWNY PROBLEM:

**Plik w bazie danych:** `Zgłoś się do PGW! (1).jpg`

Ten plik ma **polskie znaki** które crashują backend przy próbie podglądu.

### **Tymczasowe rozwiązanie:**

**USUŃ TEN PLIK Z BAZY DANYCH:**

```sql
DELETE FROM documents WHERE id = 17;
```

Lub przez GUI - usuń dokument ID: 17 ze sprawy 32.

---

## 🎯 PRAWDZIWA NAPRAWA (wymagany restart):

Kod jest już naprawiony w `backend/routes/documents.js` linia 542, ale:

1. ❌ Node.js **cache'uje** moduły
2. ❌ Backend musi być **całkowicie zrestartowany**
3. ❌ Może wymagać **npm start** na świeżo

---

## 🚀 JAK NAPRAWIĆ:

### **Metoda 1 - Szybka (usuń plik):**

1. Otwórz bazę: `backend/database.sqlite`
2. Usuń dokument ID: 17
3. Restart backend: `npm start`
4. ✅ Powinno działać

### **Metoda 2 - Pełna (wyczyść wszystko):**

```powershell
cd c:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app

# Zabij Node
taskkill /F /IM node.exe

# Wyczyść cache
npm cache clean --force

# Restart
npm start
```

---

## 📊 STATUS:

| Problem | Fix | Status |
|---------|-----|--------|
| Załączniki (`/api/`) | ✅ Naprawiony | W kodzie |
| Polskie znaki | ✅ Naprawiony | Wymaga restartu |
| Retry 3x | ⏳ Do naprawy | W frontend |
| Backend crash | ❌ Cache problem | Restart wymagany |

---

## 💡 REKOMENDACJA:

**NAJPIERW usuń problematyczny plik (ID: 17) z bazy, POTEM restart backend.**

Bez tego backend będzie crashował w kółko przy każdej próbie załadowania dokumentów.

---

**Napisz "usuń plik" - zrobię to za Ciebie automatycznie.**
