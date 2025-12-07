# 🔧 SYSTEM FINANSOWY - SPECYFIKACJA TECHNICZNA

**Dla programistów**  
**Wersja:** 1.0  
**Data:** 16.11.2025

---

## 📋 SZCZEGÓŁOWA SPECYFIKACJA BAZY DANYCH

### Tabela: revenue (Przychody)

```sql
CREATE TABLE IF NOT EXISTS revenue (
    -- Identyfikatory
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    revenue_code TEXT UNIQUE NOT NULL,           -- PRZ/2025/001
    
    -- Typ i źródło
    type TEXT NOT NULL,                          -- invoice/payment/advance/installment/other
    source TEXT,                                 -- client/case/other
    
    -- Powiązania
    client_id INTEGER,
    case_id INTEGER,
    invoice_id INTEGER,
    
    -- Kwoty
    amount DECIMAL(10,2) NOT NULL,               -- Kwota netto
    vat_rate DECIMAL(5,2) DEFAULT 23.00,         -- Stawka VAT (%)
    vat_amount DECIMAL(10,2),                    -- Kwota VAT
    gross_amount DECIMAL(10,2),                  -- Kwota brutto
    net_amount DECIMAL(10,2),                    -- Kwota netto (po VAT)
    
    -- Szczegóły
    description TEXT,
    category TEXT,                               -- legal_services/consultation/other
    
    -- Daty
    revenue_date DATE NOT NULL,                  -- Data przychodu
    payment_date DATE,                           -- Data zapłaty
    
    -- Płatność
    payment_method TEXT,                         -- bank/cash/card/blik
    bank_account TEXT,                           -- Numer konta
    
    -- Status
    status TEXT DEFAULT 'pending',               -- pending/paid/overdue/cancelled
    
    -- Metadane
    notes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- Klucze obce
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL,
    FOREIGN KEY (invoice_id) REFERENCES sales_invoices(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indeksy dla wydajności
CREATE INDEX idx_revenue_code ON revenue(revenue_code);
CREATE INDEX idx_revenue_client ON revenue(client_id);
CREATE INDEX idx_revenue_case ON revenue(case_id);
CREATE INDEX idx_revenue_date ON revenue(revenue_date);
CREATE INDEX idx_revenue_status ON revenue(status);
```

### Tabela: expenses (Wydatki)

```sql
CREATE TABLE IF NOT EXISTS expenses (
    -- Identyfikatory
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_code TEXT UNIQUE NOT NULL,           -- WYD/2025/001
    
    -- Kategoria
    category TEXT NOT NULL,                      -- rent/utilities/office/it/marketing/salaries/legal/other
    subcategory TEXT,
    
    -- Dostawca
    vendor TEXT,
    vendor_nip TEXT,
    
    -- Faktura
    invoice_number TEXT,
    invoice_date DATE,
    receipt_date DATE,
    
    -- Kwoty
    amount DECIMAL(10,2) NOT NULL,
    vat_rate DECIMAL(5,2) DEFAULT 23.00,
    vat_amount DECIMAL(10,2),
    gross_amount DECIMAL(10,2),
    net_amount DECIMAL(10,2),
    
    -- Szczegóły
    description TEXT,
    
    -- Płatność
    payment_date DATE,
    payment_method TEXT,
    bank_account TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending',               -- pending/approved/paid/rejected
    approval_status TEXT DEFAULT 'waiting',      -- waiting/approved/rejected
    approved_by INTEGER,
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    
    -- Powiązania
    case_id INTEGER,                             -- Jeśli wydatek dotyczy sprawy
    
    -- Wydatki cykliczne
    is_recurring BOOLEAN DEFAULT 0,
    recurring_period TEXT,                       -- monthly/quarterly/yearly
    
    -- Załączniki
    attachments TEXT,                            -- JSON: [{name, path, size, type}]
    
    -- Metadane
    notes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_expense_code ON expenses(expense_code);
CREATE INDEX idx_expense_category ON expenses(category);
CREATE INDEX idx_expense_status ON expenses(status);
CREATE INDEX idx_expense_date ON expenses(invoice_date);
```

### Tabela: salaries (Pensje)

```sql
CREATE TABLE IF NOT EXISTS salaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    salary_code TEXT UNIQUE NOT NULL,            -- PEN/2025/001
    
    -- Pracownik
    employee_id INTEGER NOT NULL,
    period TEXT NOT NULL,                        -- 2025-01
    
    -- Typ umowy
    contract_type TEXT NOT NULL,                 -- employment/contract/b2b/commission
    position TEXT,
    
    -- Kwoty
    gross_amount DECIMAL(10,2) NOT NULL,         -- Brutto
    net_amount DECIMAL(10,2) NOT NULL,           -- Netto
    tax_amount DECIMAL(10,2),                    -- Podatek
    zus_employee DECIMAL(10,2),                  -- ZUS pracownik
    zus_employer DECIMAL(10,2),                  -- ZUS pracodawca
    health_insurance DECIMAL(10,2),              -- Składka zdrowotna
    
    -- Dodatki i potrącenia
    bonus DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    deduction_reason TEXT,
    
    -- Godziny (dla umów godzinowych)
    hours_worked DECIMAL(5,2),
    hourly_rate DECIMAL(10,2),
    
    -- Płatność
    payment_date DATE,
    payment_method TEXT,
    bank_account TEXT,
    
    -- Status
    status TEXT DEFAULT 'calculated',            -- calculated/approved/paid/confirmed
    approved_by INTEGER,
    
    -- Metadane
    notes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_salary_code ON salaries(salary_code);
CREATE INDEX idx_salary_employee ON salaries(employee_id);
CREATE INDEX idx_salary_period ON salaries(period);
CREATE INDEX idx_salary_status ON salaries(status);
```

---

## 🔌 BACKEND API - SZCZEGÓŁY

### Revenue API (routes/finances/revenue.js)

```javascript
const express = require('express');
const router = express.Router();
const db = require('../../database/connection');

// GET /api/finances/revenue - Lista przychodów
router.get('/', async (req, res) => {
    try {
        const { 
            client_id, 
            case_id, 
            status, 
            date_from, 
            date_to,
            limit = 50,
            offset = 0
        } = req.query;
        
        let sql = `
            SELECT r.*, 
                   c.first_name || ' ' || c.last_name as client_name,
                   cs.case_number,
                   u.first_name || ' ' || u.last_name as created_by_name
            FROM revenue r
            LEFT JOIN clients c ON r.client_id = c.id
            LEFT JOIN cases cs ON r.case_id = cs.id
            LEFT JOIN users u ON r.created_by = u.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (client_id) {
            sql += ' AND r.client_id = ?';
            params.push(client_id);
        }
        
        if (case_id) {
            sql += ' AND r.case_id = ?';
            params.push(case_id);
        }
        
        if (status) {
            sql += ' AND r.status = ?';
            params.push(status);
        }
        
        if (date_from) {
            sql += ' AND r.revenue_date >= ?';
            params.push(date_from);
        }
        
        if (date_to) {
            sql += ' AND r.revenue_date <= ?';
            params.push(date_to);
        }
        
        sql += ' ORDER BY r.revenue_date DESC, r.id DESC';
        sql += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        const revenues = await db.all(sql, params);
        
        // Podsumowanie
        const summary = await db.get(`
            SELECT 
                COUNT(*) as total_count,
                SUM(CASE WHEN status = 'paid' THEN gross_amount ELSE 0 END) as total_paid,
                SUM(CASE WHEN status = 'pending' THEN gross_amount ELSE 0 END) as total_pending,
                SUM(CASE WHEN status = 'overdue' THEN gross_amount ELSE 0 END) as total_overdue
            FROM revenue
            WHERE 1=1
        `);
        
        res.json({
            success: true,
            revenues,
            summary,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: summary.total_count
            }
        });
    } catch (error) {
        console.error('Error fetching revenues:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// POST /api/finances/revenue - Dodaj przychód
router.post('/', async (req, res) => {
    try {
        const {
            type,
            source,
            client_id,
            case_id,
            invoice_id,
            amount,
            vat_rate = 23,
            description,
            category,
            revenue_date,
            payment_date,
            payment_method,
            bank_account,
            status = 'pending'
        } = req.body;
        
        // Walidacja
        if (!type || !amount || !revenue_date) {
            return res.status(400).json({
                success: false,
                error: 'Brak wymaganych pól: type, amount, revenue_date'
            });
        }
        
        // Generuj kod
        const year = new Date(revenue_date).getFullYear();
        const revenue_code = await generateRevenueCode(year);
        
        // Oblicz kwoty
        const vat_amount = (amount * vat_rate / 100).toFixed(2);
        const gross_amount = (parseFloat(amount) + parseFloat(vat_amount)).toFixed(2);
        const net_amount = amount;
        
        // Zapisz do bazy
        const result = await db.run(`
            INSERT INTO revenue (
                revenue_code, type, source, client_id, case_id, invoice_id,
                amount, vat_rate, vat_amount, gross_amount, net_amount,
                description, category, revenue_date, payment_date,
                payment_method, bank_account, status, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            revenue_code, type, source, client_id, case_id, invoice_id,
            amount, vat_rate, vat_amount, gross_amount, net_amount,
            description, category, revenue_date, payment_date,
            payment_method, bank_account, status, req.user.id
        ]);
        
        // Automatyczne księgowanie
        if (status === 'paid') {
            await autoPostJournalEntry('revenue', result.lastID);
        }
        
        res.json({
            success: true,
            revenue_id: result.lastID,
            revenue_code
        });
    } catch (error) {
        console.error('Error creating revenue:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Funkcja generowania kodu
async function generateRevenueCode(year) {
    const lastCode = await db.get(`
        SELECT revenue_code 
        FROM revenue 
        WHERE revenue_code LIKE 'PRZ/${year}/%'
        ORDER BY id DESC 
        LIMIT 1
    `);
    
    let number = 1;
    if (lastCode) {
        const parts = lastCode.revenue_code.split('/');
        number = parseInt(parts[2]) + 1;
    }
    
    return `PRZ/${year}/${number.toString().padStart(3, '0')}`;
}

module.exports = router;
```

---

## 🎨 FRONTEND - PRZYKŁAD MODUŁU

### Revenue Module (modules/finances/revenue-module.js)

```javascript
class RevenueModule {
    constructor() {
        this.revenues = [];
        this.filters = {
            status: 'all',
            date_from: null,
            date_to: null
        };
    }
    
    async init() {
        await this.loadRevenues();
        this.render();
    }
    
    async loadRevenues() {
        try {
            const params = new URLSearchParams(this.filters);
            const response = await window.api.request(`/finances/revenue?${params}`);
            
            if (response.success) {
                this.revenues = response.revenues;
                this.summary = response.summary;
            }
        } catch (error) {
            console.error('Error loading revenues:', error);
            alert('Błąd ładowania przychodów');
        }
    }
    
    render() {
        const container = document.getElementById('revenueContainer');
        
        container.innerHTML = `
            <div style="padding: 20px;">
                <!-- Nagłówek -->
                <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                    <h2>💰 Przychody</h2>
                    <button onclick="revenueModule.showAddForm()" class="btn-primary">
                        ➕ Dodaj przychód
                    </button>
                </div>
                
                <!-- Podsumowanie -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                    ${this.renderSummaryCards()}
                </div>
                
                <!-- Filtry -->
                <div style="margin-bottom: 20px;">
                    ${this.renderFilters()}
                </div>
                
                <!-- Tabela -->
                <div style="overflow-x: auto;">
                    ${this.renderTable()}
                </div>
            </div>
        `;
    }
    
    renderSummaryCards() {
        return `
            <div class="summary-card">
                <div class="card-icon">✅</div>
                <div class="card-value">${this.formatMoney(this.summary.total_paid)}</div>
                <div class="card-label">Zapłacone</div>
            </div>
            <div class="summary-card">
                <div class="card-icon">⏳</div>
                <div class="card-value">${this.formatMoney(this.summary.total_pending)}</div>
                <div class="card-label">Oczekujące</div>
            </div>
            <div class="summary-card">
                <div class="card-icon">⚠️</div>
                <div class="card-value">${this.formatMoney(this.summary.total_overdue)}</div>
                <div class="card-label">Przeterminowane</div>
            </div>
        `;
    }
    
    renderTable() {
        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Kod</th>
                        <th>Data</th>
                        <th>Klient</th>
                        <th>Sprawa</th>
                        <th>Kwota</th>
                        <th>Status</th>
                        <th>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.revenues.map(r => this.renderRow(r)).join('')}
                </tbody>
            </table>
        `;
    }
    
    renderRow(revenue) {
        const statusColors = {
            paid: '#10b981',
            pending: '#f59e0b',
            overdue: '#ef4444'
        };
        
        return `
            <tr>
                <td>${revenue.revenue_code}</td>
                <td>${this.formatDate(revenue.revenue_date)}</td>
                <td>${revenue.client_name || '-'}</td>
                <td>${revenue.case_number || '-'}</td>
                <td style="font-weight: 600;">${this.formatMoney(revenue.gross_amount)}</td>
                <td>
                    <span style="
                        padding: 4px 8px;
                        border-radius: 4px;
                        background: ${statusColors[revenue.status]};
                        color: white;
                        font-size: 12px;
                    ">
                        ${this.getStatusLabel(revenue.status)}
                    </span>
                </td>
                <td>
                    <button onclick="revenueModule.viewDetails(${revenue.id})">👁️</button>
                    <button onclick="revenueModule.edit(${revenue.id})">✏️</button>
                </td>
            </tr>
        `;
    }
    
    formatMoney(amount) {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount || 0);
    }
    
    formatDate(date) {
        return new Date(date).toLocaleDateString('pl-PL');
    }
    
    getStatusLabel(status) {
        const labels = {
            paid: 'Zapłacone',
            pending: 'Oczekujące',
            overdue: 'Przeterminowane'
        };
        return labels[status] || status;
    }
}

// Globalna instancja
const revenueModule = new RevenueModule();
window.revenueModule = revenueModule;
```

---

## 📊 AUTOMATYCZNE KSIĘGOWANIE

### Przykład: Przychód zapłacony

```javascript
async function autoPostJournalEntry(type, referenceId) {
    if (type === 'revenue') {
        const revenue = await db.get('SELECT * FROM revenue WHERE id = ?', [referenceId]);
        
        // Generuj kod zapisu
        const entryCode = await generateJournalCode();
        
        // Utwórz zapis księgowy
        const entryId = await db.run(`
            INSERT INTO journal_entries (
                entry_code, entry_date, description, 
                reference_type, reference_id, total_amount
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
            entryCode,
            revenue.payment_date,
            `Przychód ${revenue.revenue_code}`,
            'revenue',
            referenceId,
            revenue.gross_amount
        ]);
        
        // Dt 100 (Kasa/Bank)
        await db.run(`
            INSERT INTO journal_entry_lines (
                journal_entry_id, account_id, debit, description
            ) VALUES (?, ?, ?, ?)
        `, [entryId.lastID, 100, revenue.gross_amount, 'Wpływ środków']);
        
        // Ct 700 (Przychody)
        await db.run(`
            INSERT INTO journal_entry_lines (
                journal_entry_id, account_id, credit, description
            ) VALUES (?, ?, ?, ?)
        `, [entryId.lastID, 700, revenue.net_amount, 'Przychód ze sprzedaży']);
        
        // Ct 225 (VAT należny)
        await db.run(`
            INSERT INTO journal_entry_lines (
                journal_entry_id, account_id, credit, description
            ) VALUES (?, ?, ?, ?)
        `, [entryId.lastID, 225, revenue.vat_amount, 'VAT należny']);
        
        // Aktualizuj salda kont
        await updateAccountBalances(entryId.lastID);
    }
}
```

---

## 🎯 CHECKLIST IMPLEMENTACJI

### Backend
- [ ] Utworzenie tabel w bazie danych
- [ ] Routes dla revenue
- [ ] Routes dla expenses
- [ ] Routes dla salaries
- [ ] Routes dla accounts
- [ ] Routes dla journal
- [ ] Routes dla reports
- [ ] Generowanie kodów
- [ ] Automatyczne księgowanie
- [ ] Testy API

### Frontend
- [ ] Revenue module
- [ ] Expenses module
- [ ] Salaries module
- [ ] Accounting module
- [ ] Reports module
- [ ] Finance dashboard
- [ ] Integracja z CRM
- [ ] Testy UI

---

**KONIEC SPECYFIKACJI TECHNICZNEJ**
