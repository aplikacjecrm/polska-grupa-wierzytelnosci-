# 💻 FRONTEND - IMPLEMENTACJA PROWIZJI I WYPŁAT

## ✅ BACKEND GOTOWY!

**API Endpoints działają:**
- `/api/employees/:id/finances/summary` ✅
- `/api/employees/:id/commissions/history` ✅
- `/api/employees/:id/payments/history` ✅
- `/api/commissions/v2/stats` ✅
- `/api/commissions/v2/pending` ✅
- `/api/commissions/v2/top-earners` ✅
- `/api/commissions/v2/:id/pay` ✅

---

## 📊 FRONTEND - DO ZROBIENIA

### 1. EMPLOYEE DASHBOARD - Sekcja "Moje Finanse"

**Plik:** `frontend/scripts/dashboards/employee-dashboard.js`

**Dodaj zakładkę:**
```javascript
// W metodzie renderTabs() dodaj:
<button class="tab-btn" data-tab="finances" onclick="employeeDashboard.showTab('finances')">
    💰 Moje Finanse
</button>
```

**Dodaj funkcję:**
```javascript
async renderFinancesTab() {
    const userId = this.currentUserId;
    
    // Pobierz dane
    const summary = await api.request(`/employees/${userId}/finances/summary`);
    
    const { commissions, recent_payments, pending_expenses } = summary.summary;
    
    return `
        <div class="finance-section">
            <!-- KPI -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 20px; border-radius: 12px; color: white;">
                    <div style="font-size: 0.9rem; opacity: 0.9;">💰 Do wypłaty</div>
                    <div style="font-size: 2rem; font-weight: 700;">${this.formatMoney(commissions.approved_amount || 0)}</div>
                </div>
                <div style="background: linear-gradient(135deg, #2ecc71, #27ae60); padding: 20px; border-radius: 12px; color: white;">
                    <div style="font-size: 0.9rem; opacity: 0.9;">✅ Wypłacone (miesiąc)</div>
                    <div style="font-size: 2rem; font-weight: 700;">${this.formatMoney(commissions.paid_amount || 0)}</div>
                </div>
                <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 20px; border-radius: 12px; color: white;">
                    <div style="font-size: 0.9rem; opacity: 0.9;">📊 Oczekuje</div>
                    <div style="font-size: 2rem; font-weight: 700;">${this.formatMoney(commissions.pending_amount || 0)}</div>
                </div>
            </div>
            
            <!-- Prowizje -->
            <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h3>💼 Moje Prowizje</h3>
                <button onclick="employeeDashboard.showCommissionsHistory()" class="btn-primary">
                    📊 Zobacz wszystkie prowizje
                </button>
            </div>
            
            <!-- Wypłaty -->
            <div style="background: white; padding: 20px; border-radius: 12px;">
                <h3>💳 Historia Wypłat</h3>
                ${recent_payments.map(p => `
                    <div style="padding: 10px; border-bottom: 1px solid #eee;">
                        <strong>${p.payment_date}</strong> - ${p.description}
                        <span style="float: right; color: #2ecc71; font-weight: 700;">
                            ${this.formatMoney(p.amount)}
                        </span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
```

---

### 2. FINANCE DASHBOARD - Sekcja "Prowizje"

**Plik:** `frontend/scripts/finance-dashboard.js`

**Dodaj zakładkę w renderTabs():**
```javascript
<button class="tab-btn" data-tab="commissions" onclick="financeDashboard.showTab('commissions')">
    💰 Prowizje
</button>
```

**Dodaj funkcję:**
```javascript
async renderCommissionsTab() {
    // Pobierz dane
    const [stats, pending, topEarners] = await Promise.all([
        api.request('/commissions/v2/stats'),
        api.request('/commissions/v2/pending'),
        api.request('/commissions/v2/top-earners?limit=5')
    ]);
    
    return `
        <div class="commissions-section">
            <!-- Statystyki -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="background: #FFD700; padding: 20px; border-radius: 12px; color: #1a2332;">
                    <div>⏳ Oczekują</div>
                    <div style="font-size: 2rem; font-weight: 700;">${this.formatMoney(stats.stats.pending_amount)}</div>
                    <div style="font-size: 0.85rem;">${stats.stats.pending_count} prowizji</div>
                </div>
                <div style="background: #3B82F6; padding: 20px; border-radius: 12px; color: white;">
                    <div>✅ Zatwierdzone</div>
                    <div style="font-size: 2rem; font-weight: 700;">${this.formatMoney(stats.stats.approved_amount)}</div>
                    <div style="font-size: 0.85rem;">${stats.stats.approved_count} do wypłaty</div>
                </div>
                <div style="background: #2ecc71; padding: 20px; border-radius: 12px; color: white;">
                    <div>💳 Wypłacone</div>
                    <div style="font-size: 2rem; font-weight: 700;">${this.formatMoney(stats.stats.paid_amount)}</div>
                    <div style="font-size: 0.85rem;">${stats.stats.paid_count} prowizji</div>
                </div>
                <div style="background: #8b5cf6; padding: 20px; border-radius: 12px; color: white;">
                    <div>📊 Razem</div>
                    <div style="font-size: 2rem; font-weight: 700;">${this.formatMoney(stats.stats.total_amount)}</div>
                    <div style="font-size: 0.85rem;">${stats.stats.total_count} prowizji</div>
                </div>
            </div>
            
            <!-- Lista do wypłaty -->
            <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h3>💳 Do Wypłaty (${pending.commissions.length})</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Pracownik</th>
                            <th>Sprawa</th>
                            <th>Klient</th>
                            <th>Kwota</th>
                            <th>Data</th>
                            <th>Akcja</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pending.commissions.map(c => `
                            <tr>
                                <td><strong>${c.employee_name}</strong></td>
                                <td>${c.case_number}</td>
                                <td>${c.client_name || '-'}</td>
                                <td style="color: #2ecc71; font-weight: 700;">${this.formatMoney(c.amount)}</td>
                                <td>${c.created_at.split('T')[0]}</td>
                                <td>
                                    <button onclick="financeDashboard.payCommission(${c.id})" 
                                            class="btn-success">
                                        💳 Wypłać
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <!-- Top 5 -->
            <div style="background: white; padding: 20px; border-radius: 12px;">
                <h3>🏆 Top 5 Zarabiających (miesiąc)</h3>
                ${topEarners.top_earners.map((e, i) => `
                    <div style="padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="font-size: 1.5rem; color: ${i === 0 ? '#FFD700' : '#999'}; margin-right: 10px;">
                                ${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                            </span>
                            <strong>${e.employee_name}</strong>
                            <span style="color: #999; margin-left: 10px;">${e.commissions_count} prowizji</span>
                        </div>
                        <div style="font-size: 1.2rem; font-weight: 700; color: #2ecc71;">
                            ${this.formatMoney(e.total_earned)}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

async payCommission(commissionId) {
    if (!confirm('💳 Wypłacić prowizję?\\n\\nZostanie utworzona wypłata w employee_payments.')) {
        return;
    }
    
    try {
        const response = await api.request(`/commissions/v2/${commissionId}/pay`, {
            method: 'POST'
        });
        
        if (response.success) {
            alert(`✅ Prowizja wypłacona!\\n\\nKwota: ${this.formatMoney(response.amount)} PLN`);
            await this.showTab('commissions'); // Odśwież
        }
    } catch (error) {
        console.error('❌ Błąd wypłaty:', error);
        alert('❌ Błąd: ' + error.message);
    }
}
```

---

## 🚀 SZYBKA IMPLEMENTACJA

### Krok 1: Employee Dashboard
W pliku `employee-dashboard.js` dodaj na końcu (przed `module.exports`):

```javascript
// Format pieniędzy
formatMoney(amount) {
    return `${parseFloat(amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} PLN`;
}
```

### Krok 2: Finance Dashboard  
W pliku `finance-dashboard.js` dodaj zakładkę prowizji zgodnie z powyższym kodem.

### Krok 3: Testowanie
1. Restart serwera (już zrobione) ✅
2. Odśwież przeglądarkę (Ctrl+Shift+R)
3. Przejdź do Employee Dashboard → zakładka "💰 Moje Finanse"
4. Przejdź do Finance Dashboard → zakładka "💰 Prowizje"

---

## 📋 CHECKLIST

**Backend:**
- ✅ employee-finances.js routes
- ✅ commissions.js v2 endpoints
- ✅ Routing w server.js
- ✅ Serwer uruchomiony

**Frontend:**
- ⏳ Employee Dashboard - zakładka Finanse (do dodania)
- ⏳ Finance Dashboard - zakładka Prowizje (do dodania)
- ⏳ Funkcje payCommission, showCommissionsHistory (do dodania)

**Testowanie:**
- ⏳ Test API endpoints w Postman
- ⏳ Test UI w przeglądarce
- ⏳ Test wypłaty prowizji

---

## 🎯 NASTĘPNE KROKI

1. Dodaj kod do employee-dashboard.js
2. Dodaj kod do finance-dashboard.js
3. Odśwież przeglądarkę
4. Przetestuj przepływ: Zobacz prowizje → Wypłać → Sprawdź w employee_payments

**Backend działa! Frontend czeka na implementację powyższego kodu!** 🚀
