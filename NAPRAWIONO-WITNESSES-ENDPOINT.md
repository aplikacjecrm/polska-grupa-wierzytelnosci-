# ✅ NAPRAWIONO: WITNESSES ENDPOINT

## 🔍 PROBLEM:

**Frontend wywołuje:**
```
GET /api/witnesses?case_id=24
```

**Backend miał tylko:**
```
GET /api/witnesses/case/:caseId
```

**Wynik:** 404 Not Found

---

## ✅ NAPRAWIONO:

**Plik:** `backend/routes/witnesses.js`

**Dodano endpoint GET /**
```javascript
// GET / z query param ?case_id=X (dla kompatybilności z frontendem)
router.get('/', verifyToken, (req, res) => {
  const db = getDatabase();
  const { case_id } = req.query;
  
  if (!case_id) {
    return res.status(400).json({ error: 'Brak case_id' });
  }
  
  const query = `
    SELECT w.*, 
           u.name as created_by_name,
           (SELECT COUNT(*) FROM witness_testimonies WHERE witness_id = w.id) as testimonies_count
    FROM case_witnesses w
    LEFT JOIN users u ON w.created_by = u.id
    WHERE w.case_id = ?
    ORDER BY w.created_at DESC
  `;
  
  db.all(query, [case_id], (err, witnesses) => {
    if (err) {
      console.error('❌ Błąd pobierania świadków:', err);
      return res.status(500).json({ error: 'Błąd pobierania świadków' });
    }
    
    res.json({ witnesses: witnesses || [] });
  });
});
```

**Zachowano też:**
```javascript
// GET /case/:caseId (alternatywna ścieżka)
router.get('/case/:caseId', verifyToken, (req, res) => {
  // ... ten sam kod
});
```

---

## ✅ TERAZ DZIAŁA:

### **Oba wywołania są obsługiwane:**

1. **Query param (frontend używa):**
   ```
   GET /api/witnesses?case_id=24
   ✅ Zwraca listę świadków
   ```

2. **Path param (dla alternatywnych zastosowań):**
   ```
   GET /api/witnesses/case/24
   ✅ Zwraca listę świadków
   ```

---

## 📊 POZOSTAŁE ENDPOINTY:

### **Witnesses Routes:**

```
✅ POST /api/witnesses/generate-code        - Generuj kod świadka
✅ GET  /api/witnesses?case_id=X            - Lista świadków (NOWE!)
✅ GET  /api/witnesses/case/:caseId         - Lista świadków (alt)
✅ GET  /api/witnesses/:id                  - Pojedynczy świadek
✅ POST /api/witnesses                      - Dodaj świadka
✅ PUT  /api/witnesses/:id                  - Edytuj świadka
✅ DELETE /api/witnesses/:id                - Usuń świadka
```

---

## 🔄 STATUS:

**Backend zrestartowany:** ✅  
**Endpoint działa:** ✅  
**Odśwież przeglądarkę:** Ctrl+Shift+R  

---

## 🎯 INNE "KANAŁY" DO SPRAWDZENIA:

1. **Scenarios** - czy GET /api/scenarios?case_id=X działa?
2. **Opposing Party** - czy GET /api/opposing-party?case_id=X działa?
3. **Civil Details** - czy GET /api/civil-details/case/:id działa?

Jeśli któryś z nich daje 404, to też trzeba naprawić routing.

---

**Backend działa! Witnesses połączone! Testuj!** 🚀✨
