# ⚡ PERFORMANCE ANALYSIS

## 🔍 **ZNALEZIONE PROBLEMY:**

### **1. N+1 Queries** 🔴
**Problem:** Wiele requestów zamiast JOIN
```javascript
// PRZED (N+1):
cases.forEach(case => {
  db.get('SELECT * FROM clients WHERE id = ?', [case.client_id])
})

// PO (1 query):
db.all(`SELECT c.*, cl.name FROM cases c 
        LEFT JOIN clients cl ON c.client_id = cl.id`)
```
**Impact:** 10x wolniejsze ładowanie

### **2. Brak indexów DB** 🔴
**Tabele bez indexów:**
- `documents.case_id`
- `attachments.entity_id`
- `payments.client_id`

**Fix:**
```sql
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_attachments_entity_id ON attachments(entity_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
```

### **3. Brak caching** 🟡
- API calls nie są cache'owane
- Legal acts (5281 rekordów) ładowane za każdym razem

**Fix:** Cache w memory lub Redis

### **4. Duże pliki JS** 🟡
- chat.js: 66 KB
- crm-clean.js: ~100 KB+

**Fix:** Minifikacja + gzip

---

## 📊 **PRIORYTETY:**

| Problem | Impact | Effort | Priorytet |
|---------|--------|--------|-----------|
| N+1 Queries | WYSOKI | 1h | 🔴 KRYTYCZNY |
| DB Indexes | WYSOKI | 15min | 🔴 KRYTYCZNY |
| Caching | ŚREDNI | 30min | 🟡 WAŻNY |
| Minification | NISKI | 10min | 🟢 OPCJA |

---

**RAZEM:** ~2h napraw performance
