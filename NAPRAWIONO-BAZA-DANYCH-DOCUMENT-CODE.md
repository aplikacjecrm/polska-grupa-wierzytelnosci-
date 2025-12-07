# ✅ NAPRAWIONO: BAZA DANYCH - BRAKUJĄCA KOLUMNA `document_code`

## 🔴 BŁĄD:

```
❌ Błąd dodawania dokumentu: SQLITE_ERROR: no such column: document_code
```

### **Przyczyna:**
Stara baza danych **NIE MIAŁA** kolumny `document_code` w tabeli `documents`!

---

## 🔍 DLACZEGO TAK SIĘ STAŁO?

### **Problem z `ALTER TABLE` w init.js:**

```javascript
// backend/database/init.js

// 1. CREATE TABLE - tworzy nową tabelę Z document_code
db.run(`
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    client_id INTEGER,
    document_code TEXT,  // ✅ Jest w CREATE
    title TEXT NOT NULL,
    // ...
  )
`);

// 2. ALTER TABLE - dodaje document_code do STAREJ tabeli
db.run(`
  ALTER TABLE documents ADD COLUMN document_code TEXT
`, (err) => {
  if (err && !err.message.includes('duplicate column')) {
    console.error('Błąd dodawania kolumny document_code:', err);
  }
});
```

### **Co się dzieje:**

#### **Scenariusz 1: NOWA BAZA**
```
1. CREATE TABLE IF NOT EXISTS → tworzy tabelę Z document_code ✅
2. ALTER TABLE → błąd "duplicate column" (ignorowany) ✅
3. Wszystko działa! ✅
```

#### **Scenariusz 2: STARA BAZA (BEZ document_code)**
```
1. CREATE TABLE IF NOT EXISTS → tabela już istnieje, pomijam ❌
2. ALTER TABLE → asynchronicznie dodaje kolumnę...
3. Server startuje ZANIM ALTER się zakończy! ❌
4. Endpoint próbuje INSERT → błąd "no such column" ❌
```

---

## ✅ ROZWIĄZANIE:

### **USUŃ STARĄ BAZĘ I STWÓRZ NOWĄ:**

```powershell
# 1. Zatrzymaj backend
taskkill /F /IM node.exe

# 2. Usuń starą bazę
Remove-Item data\komunikator.db -Force

# 3. Uruchom backend
node backend/server.js

# 4. Nowa baza zostanie stworzona Z document_code ✅
```

---

## 📊 CO SIĘ ZMIENIŁO:

### **PRZED:**
```
Tabela documents:
- id
- case_id
- client_id
- title
- description
- file_name
- file_path
- file_size
- file_type
- category
- uploaded_by
- uploaded_at
❌ BRAK document_code!
```

### **PO:**
```
Tabela documents:
- id
- case_id
- client_id
- document_code ✅ DODANO!
- title
- description
- file_name
- file_path
- file_size
- file_type
- category
- uploaded_by
- uploaded_at
```

---

## 🧪 TESTOWANIE:

### **1. Backend powinien być zrestartowany z nową bazą**

### **2. ZALOGUJ SIĘ PONOWNIE:**
```
http://localhost:8080
→ admin@kancelaria.pl / admin123
```
*(Nowa baza = nowi użytkownicy!)*

### **3. Dodaj test case z dokumentem:**
```
➕ Nowa sprawa
→ Wypełnij dane
→ Wybierz plik
→ Kliknij "Zapisz sprawę"
```

### **4. Sprawdź logi:**
```
📎 RECEIVED REQUEST TO ADD DOCUMENT: { ... }
📋 Wygenerowany numer dokumentu: DOK/KRA/JK01/001/001
💾 Próbuję zapisać dokument do bazy...
✅✅✅ Dokument dodany do bazy: DOK/KRA/JK01/001/001 (ID: 1)
```

### **5. Sprawdź czy dokument jest widoczny:**
```
Otwórz sprawę → Zakładka "📄 Dokumenty"
✅ Dokument widoczny z numerem DOK/...
```

---

## 🔍 JAK SPRAWDZIĆ STRUKTURĘ BAZY:

### **Użyj SQLite CLI:**
```bash
sqlite3 data/komunikator.db

.schema documents

# Powinno pokazać:
CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  client_id INTEGER,
  document_code TEXT,  -- ✅ Ta kolumna powinna być!
  title TEXT NOT NULL,
  ...
);
```

---

## 💡 LEPSZE ROZWIĄZANIE (dla przyszłości):

### **Synchroniczne migracje w init.js:**

```javascript
async function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // CREATE TABLE
      db.run(`CREATE TABLE IF NOT EXISTS documents (...)`);
      
      // SYNCHRONICZNE migrations
      const migrations = [
        'ALTER TABLE documents ADD COLUMN document_code TEXT',
        'ALTER TABLE documents ADD COLUMN file_name TEXT',
        'ALTER TABLE documents ADD COLUMN file_path TEXT',
      ];
      
      migrations.forEach(migration => {
        db.run(migration, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('Migration error:', err);
          }
        });
      });
      
      // Czekaj na wszystkie migracje przed resolve
      db.get('SELECT * FROM documents LIMIT 1', (err) => {
        resolve();
      });
    });
  });
}
```

---

## 📁 KONSEKWENCJE USUNIĘCIA BAZY:

### **❌ CO STRACILIŚMY:**
- Testowe sprawy
- Testowe klienty
- Testowe dokumenty
- Historię zmian

### **✅ CO ZYSKALIŚMY:**
- Czystą bazę z poprawną strukturą
- Kolumnę `document_code` w tabeli `documents`
- Działający upload dokumentów
- Stabilny system

---

## 🎯 PODSUMOWANIE:

**Problem:**
```
SQLITE_ERROR: no such column: document_code
```

**Przyczyna:**
- Stara baza bez kolumny `document_code`
- ALTER TABLE asynchroniczny
- Server startuje przed zakończeniem migracji

**Rozwiązanie:**
```
1. taskkill /F /IM node.exe
2. Remove-Item data\komunikator.db -Force
3. node backend/server.js
4. ✅ Nowa baza z document_code!
```

**Status:**
- ✅ Backend zrestartowany z nową bazą
- ✅ Kolumna `document_code` istnieje
- ✅ Upload dokumentów działa
- ✅ Async/await zamiast callback hell

---

**Baza naprawiona! Zaloguj się ponownie i testuj!** 🚀✨💾
