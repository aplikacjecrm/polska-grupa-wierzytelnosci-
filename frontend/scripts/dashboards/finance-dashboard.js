/**
 * Finance Dashboard Module v2.0 - NOWY SYSTEM FINANSOWY
 * Kompletny dashboard finansowy z integracją nowego API
 * 
 * Features:
 * - Dashboard z wykresami Chart.js
 * - Przychody (Revenue API)
 * - Wydatki (Expenses API)
 * - Pensje (Salaries API)
 * - Kalkulator pensji
 * - Płatności online (BLIK/PayPal/Revolut/Apple Pay/Bitcoin)
 */

console.log('🔥 FINANCE DASHBOARD V2.0 - NOWY SYSTEM!');

class FinanceDashboard {
    constructor() {
        console.log('💼 Finance Dashboard V2.0 zainicjalizowany');
        this.currentData = null;
        this.charts = {};
        this.currentView = 'dashboard'; // dashboard/revenue/expenses/salaries
    }

    // =====================================
    // GŁÓWNY RENDER DASHBOARDU
    // =====================================
    async render() {
        try {
            console.log('📊 Renderowanie dashboardu finansowego...');
            
            // Załaduj dane z API
            await this.loadDashboardData();
            
            const container = document.getElementById('financeContent');
            if (!container) {
                console.error('❌ Kontener #financeContent nie znaleziony');
                return;
            }
            
            container.innerHTML = `
                <!-- Sticky Header -->
                <div style="
                    position: sticky;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                    color: white;
                    padding: 15px 20px;
                    margin: 0;
                    z-index: 100;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h1 style="margin: 0; font-size: clamp(1.2rem, 4vw, 2rem);">💼 Dashboard Finansowy Firmy</h1>
                    <button onclick="document.getElementById('financeDashboardModal').remove()" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        font-size: 24px;
                        cursor: pointer;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        flex-shrink: 0;
                    ">✕</button>
                </div>
                
                <div style="padding: 20px 10px; max-width: 100%; overflow-x: hidden; box-sizing: border-box;">
                    <!-- Statystyki podsumowujące -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                        ${this.renderSummaryCards()}
                    </div>
                    
                    <!-- Wykresy -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin-bottom: 20px; max-width: 100%;">
                        ${this.renderChartContainers()}
                    </div>
                    
                    <!-- Przyciski akcji -->
                    <div style="display: flex; gap: 15px; margin-bottom: 30px; flex-wrap: wrap;">
                        <button onclick="installmentsDashboard.showDashboard()" style="
                            padding: 12px 24px;
                            background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            box-shadow: 0 4px 12px rgba(155, 89, 182, 0.4);
                        ">
                            💳 Płatności ratalne
                        </button>
                        <button onclick="salesInvoices.showInvoicesList()" style="
                            padding: 12px 24px;
                            background: linear-gradient(135deg, #3B82F6 0%, #3B82F6 100%);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            box-shadow: 0 4px 12px rgba(46, 204, 113, 0.4);
                        ">
                            📄 Faktury dla klientów
                        </button>
                        <button onclick="financeDashboard.showAddExpenseModal()" style="
                            padding: 12px 24px;
                            background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                        ">
                            ➕ Dodaj wydatek
                        </button>
                        <button onclick="financeDashboard.showExpensesList()" style="
                            padding: 12px 24px;
                            background: #3B82F6;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            📋 Lista wydatków
                        </button>
                        <button onclick="financeDashboard.showSalariesList()" style="
                            padding: 12px 24px;
                            background: #3B82F6;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            💰 Pensje
                        </button>
                        <button onclick="financeDashboard.showInvoicesList()" style="
                            padding: 12px 24px;
                            background: #3B82F6;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            📄 Faktury kosztowe
                        </button>
                        <button onclick="financeDashboard.showCommissionsList()" style="
                            padding: 12px 24px;
                            background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            box-shadow: 0 4px 12px rgba(243, 156, 18, 0.4);
                        ">
                            💰 Prowizje
                        </button>
                    </div>
                    
                    <!-- Lista aktywności (placeholder) -->
                    <div id="financeActivityList" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <h3 style="margin: 0 0 15px 0;">📊 Ostatnie transakcje</h3>
                        <p style="color: #999;">Wybierz opcję powyżej aby zobaczyć szczegóły</p>
                    </div>
                </div>
            `;
            
            // Renderuj wykresy
            await this.renderCharts();
            
        } catch (error) {
            console.error('❌ Błąd renderowania dashboardu:', error);
            alert('Błąd ładowania dashboardu finansowego: ' + error.message);
        }
    }

    // =====================================
    // KARTY PODSUMOWUJĄCE
    // =====================================
    renderSummaryCards() {
        if (!this.currentData) return '';
        
        const { revenue, expenses, salaries, invoices, summary } = this.currentData;
        
        return `
            <!-- Przychody -->
            <div style="background: linear-gradient(135deg, #3B82F6 0%, #3B82F6 100%); padding: 20px; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);">
                <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">💰 Przychody</div>
                <div style="font-size: 2rem; font-weight: 700; margin-bottom: 10px;">${this.formatMoney(revenue.paid)}</div>
                <div style="font-size: 0.85rem; opacity: 0.9;">
                    ${revenue.count} płatności opłaconych
                </div>
                <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 5px;">
                    Oczekujące: ${this.formatMoney(revenue.pending)}
                </div>
            </div>
            
            <!-- Wydatki -->
            <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 20px; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);">
                <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">💸 Wydatki</div>
                <div style="font-size: 2rem; font-weight: 700; margin-bottom: 10px;">${this.formatMoney(expenses.paid)}</div>
                <div style="font-size: 0.85rem; opacity: 0.9;">
                    ${expenses.count} wydatków opłaconych
                </div>
                <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 5px;">
                    Oczekujące: ${this.formatMoney(expenses.pending)}
                </div>
            </div>
            
            <!-- Pensje -->
            <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 20px; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);">
                <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">👥 Pensje</div>
                <div style="font-size: 2rem; font-weight: 700; margin-bottom: 10px;">${this.formatMoney(salaries.paid)}</div>
                <div style="font-size: 0.85rem; opacity: 0.9;">
                    ${salaries.count} wypłat w tym miesiącu
                </div>
                <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 5px;">
                    Do wypłaty: ${this.formatMoney(salaries.pending)}
                </div>
            </div>
            
            <!-- Bilans -->
            <div style="background: linear-gradient(135deg, ${summary.profit ? '#3B82F6' : '#3B82F6'} 0%, ${summary.profit ? '#1E40AF' : '#1E40AF'} 100%); padding: 20px; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(155, 89, 182, 0.3);">
                <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">📊 Bilans</div>
                <div style="font-size: 2rem; font-weight: 700; margin-bottom: 10px;">${this.formatMoney(summary.balance)}</div>
                <div style="font-size: 0.85rem; opacity: 0.9;">
                    ${summary.profit ? '✅ Zysk' : '⚠️ Strata'}
                </div>
                <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 5px;">
                    Przychody: ${this.formatMoney(summary.totalRevenue)}
                </div>
            </div>
        `;
    }

    // =====================================
    // KONTENERY NA WYKRESY
    // =====================================
    renderChartContainers() {
        return `
            <!-- Wykres przychody vs wydatki -->
            <div style="background: white; padding: 15px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-width: 0; width: 100%; box-sizing: border-box;">
                <h3 style="margin: 0 0 15px 0; font-size: clamp(0.9rem, 2.5vw, 1.2rem);">📈 Przychody vs Wydatki</h3>
                <div style="position: relative; height: 300px; width: 100%;">
                    <canvas id="revenueVsExpensesChart"></canvas>
                </div>
            </div>
            
            <!-- Wykres kategorii wydatków -->
            <div style="background: white; padding: 15px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-width: 0; width: 100%; box-sizing: border-box;">
                <h3 style="margin: 0 0 15px 0; font-size: clamp(0.9rem, 2.5vw, 1.2rem);">🎯 Kategorie wydatków</h3>
                <div style="position: relative; height: 300px; width: 100%;">
                    <canvas id="expenseCategoriesChart"></canvas>
                </div>
            </div>
        `;
    }

    // =====================================
    // RENDEROWANIE WYKRESÓW
    // =====================================
    async renderCharts() {
        if (!this.currentData || !window.Chart) {
            console.warn('⚠️ Chart.js nie załadowany lub brak danych');
            return;
        }
        
        // Wykres 1: Przychody vs Wydatki
        const ctx1 = document.getElementById('revenueVsExpensesChart');
        if (ctx1) {
            this.charts.revenueVsExpenses = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: ['Przychody', 'Wydatki', 'Pensje', 'Faktury'],
                    datasets: [{
                        label: 'Opłacone (PLN)',
                        data: [
                            this.currentData.revenue.paid,
                            this.currentData.expenses.paid,
                            this.currentData.salaries.paid,
                            this.currentData.invoices.paid
                        ],
                        backgroundColor: [
                            'rgba(46, 204, 113, 0.7)',
                            'rgba(231, 76, 60, 0.7)',
                            'rgba(52, 152, 219, 0.7)',
                            'rgba(230, 126, 34, 0.7)'
                        ],
                        borderColor: [
                            'rgba(46, 204, 113, 1)',
                            'rgba(231, 76, 60, 1)',
                            'rgba(52, 152, 219, 1)',
                            'rgba(230, 126, 34, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) => this.formatMoney(value)
                            }
                        }
                    }
                }
            });
        }
        
        // Wykres 2: Kategorie wydatków (placeholder - będzie załadowany z API)
        const ctx2 = document.getElementById('expenseCategoriesChart');
        if (ctx2) {
            this.charts.expenseCategories = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: ['Wynajem', 'IT', 'Marketing', 'Materiały', 'Inne'],
                    datasets: [{
                        data: [30, 25, 20, 15, 10],
                        backgroundColor: [
                            'rgba(231, 76, 60, 0.7)',
                            'rgba(52, 152, 219, 0.7)',
                            'rgba(155, 89, 182, 0.7)',
                            'rgba(241, 196, 15, 0.7)',
                            'rgba(149, 165, 166, 0.7)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }
    }

    // =====================================
    // ŁADOWANIE DANYCH Z API
    // =====================================
    async loadDashboardData() {
        try {
            console.log('🔄 Ładowanie danych dashboardu...');
            this.currentData = await window.api.request('/finances/dashboard');
            console.log('✅ Dane załadowane:', this.currentData);
        } catch (error) {
            console.error('❌ Błąd ładowania danych:', error);
            // Mockowe dane dla testów
            this.currentData = {
                revenue: { count: 0, total: 0, paid: 0, pending: 0 },
                expenses: { count: 0, total: 0, paid: 0, pending: 0 },
                salaries: { count: 0, total: 0, paid: 0, pending: 0 },
                invoices: { count: 0, total: 0, paid: 0, unpaid: 0 },
                clientBalances: { count: 0, total: 0 },
                summary: { totalRevenue: 0, totalExpenses: 0, balance: 0, profit: true }
            };
        }
    }

    // =====================================
    // MODAL DODAWANIA WYDATKU
    // =====================================
    showAddExpenseModal() {
        console.log('🔥 showAddExpenseModal() wywołane!');
        const modal = document.createElement('div');
        modal.id = 'addExpenseModal';
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; width: 90%;">
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 20px; border-radius: 12px 12px 0 0; color: white;">
                    <h2 style="margin: 0;">➕ Dodaj wydatek firmy</h2>
                </div>
                
                <form id="addExpenseForm" style="padding: 30px;">
                    <!-- Kategoria -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a2332;">Kategoria *</label>
                        <select name="category" required style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                            <option value="">Wybierz kategorię...</option>
                            <option value="Wynajem i media">🏢 Wynajem i media</option>
                            <option value="Materiały biurowe">📎 Materiały biurowe</option>
                            <option value="IT i oprogramowanie">💻 IT i oprogramowanie</option>
                            <option value="Marketing">📢 Marketing</option>
                            <option value="Księgowość">📊 Księgowość</option>
                            <option value="Transport">🚗 Transport</option>
                            <option value="Szkolenia">🎓 Szkolenia</option>
                            <option value="Inne">📝 Inne</option>
                        </select>
                    </div>
                    
                    <!-- Kwota -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a2332;">Kwota (PLN) *</label>
                        <input type="number" name="amount" step="0.01" min="0" required 
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                    </div>
                    
                    <!-- Opis -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a2332;">Opis</label>
                        <textarea name="description" rows="3" 
                                  style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;"></textarea>
                    </div>
                    
                    <!-- Dostawca -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a2332;">Dostawca/Sprzedawca</label>
                        <input type="text" name="vendor" 
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                    </div>
                    
                    <!-- Numer faktury -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a2332;">Numer faktury</label>
                        <input type="text" name="invoice_number" 
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                    </div>
                    
                    <!-- Data faktury -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a2332;">Data faktury</label>
                        <input type="date" name="invoice_date" 
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                    </div>
                    
                    <!-- Metoda płatności -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a2332;">Metoda płatności</label>
                        <select name="payment_method" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                            <option value="">Wybierz...</option>
                            <option value="bank_transfer">🏦 Przelew bankowy</option>
                            <option value="cash">💵 Gotówka</option>
                            <option value="card">💳 Karta</option>
                            <option value="blik">📱 BLIK</option>
                        </select>
                    </div>
                    
                    <!-- Przyciski -->
                    <div style="display: flex; gap: 12px; margin-top: 30px;">
                        <button type="button" onclick="financeDashboard.closeModal('addExpenseModal')" style="
                            flex: 1;
                            padding: 12px;
                            background: #e0e0e0;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            ❌ Anuluj
                        </button>
                        <button type="submit" style="
                            flex: 2;
                            padding: 12px;
                            background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            ✓ Dodaj wydatek
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log('✅ Modal dodany do DOM');
        
        // Dodaj event listener do formularza
        const form = document.getElementById('addExpenseForm');
        if (form) {
            console.log('✅ Formularz znaleziony, dodaję event listener');
            form.addEventListener('submit', (e) => {
                console.log('🔥 Submit event przechwycony!');
                this.saveExpense(e);
            });
        } else {
            console.error('❌ Formularz NIE znaleziony!');
        }
    }

    async saveExpense(event) {
        console.log('🔥 saveExpense() wywołane!', event);
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        const data = {
            category: formData.get('category'),
            amount: parseFloat(formData.get('amount')),
            description: formData.get('description'),
            vendor: formData.get('vendor'),
            invoice_number: formData.get('invoice_number'),
            invoice_date: formData.get('invoice_date'),
            payment_method: formData.get('payment_method')
        };
        
        console.log('📦 Dane do wysłania:', data);
        
        try {
            console.log('📡 Wysyłam request do /finances/expenses...');
            const response = await window.api.request('/finances/expenses', 'POST', data);
            console.log('✅ Odpowiedź:', response);
            
            if (response.success) {
                alert(`✅ Wydatek dodany!\nKod: ${response.expense_code}`);
                this.closeModal('addExpenseModal');
                await this.render(); // Odśwież dashboard
            } else {
                console.error('❌ Response.success = false');
                alert('Błąd: Nie udało się dodać wydatku');
            }
        } catch (error) {
            console.error('❌ Błąd dodawania wydatku:', error);
            alert('Błąd: ' + error.message);
        }
    }

    // =====================================
    // LISTA WYDATKÓW
    // =====================================
    async showExpensesList() {
        try {
            const expenses = await window.api.request('/finances/expenses?limit=50');
            
            const container = document.getElementById('financeActivityList');
            container.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">📋 Lista wydatków</h3>
                    <button onclick="financeDashboard.showAddExpenseModal()" style="
                        padding: 8px 16px;
                        background: #3B82F6;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                    ">
                        ➕ Dodaj wydatek
                    </button>
                </div>
                
                ${expenses.expenses && expenses.expenses.length > 0 ? `
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f8f9fa; border-bottom: 2px solid #e0e0e0;">
                                    <th style="padding: 12px; text-align: left;">Kod</th>
                                    <th style="padding: 12px; text-align: left;">Kategoria</th>
                                    <th style="padding: 12px; text-align: left;">Opis</th>
                                    <th style="padding: 12px; text-align: right;">Kwota</th>
                                    <th style="padding: 12px; text-align: center;">Status</th>
                                    <th style="padding: 12px; text-align: left;">Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${expenses.expenses.map(expense => `
                                    <tr style="border-bottom: 1px solid #f0f0f0;">
                                        <td style="padding: 12px; font-weight: 600; color: #3B82F6;">${this.escapeHtml(expense.expense_code)}</td>
                                        <td style="padding: 12px;">${this.escapeHtml(expense.category)}</td>
                                        <td style="padding: 12px;">${this.escapeHtml(expense.description || '-')}</td>
                                        <td style="padding: 12px; text-align: right; font-weight: 600;">${this.formatMoney(expense.amount)}</td>
                                        <td style="padding: 12px; text-align: center;">
                                            <span style="
                                                padding: 4px 8px;
                                                border-radius: 12px;
                                                font-size: 0.8rem;
                                                background: ${expense.payment_status === 'paid' ? '#d4edda' : '#F8FAFC'};
                                                color: ${expense.payment_status === 'paid' ? '#155724' : '#666'};
                                            ">
                                                ${expense.payment_status === 'paid' ? '✓ Opłacone' : '⏳ Oczekuje'}
                                            </span>
                                        </td>
                                        <td style="padding: 12px;">${new Date(expense.created_at).toLocaleDateString('pl-PL')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <p style="text-align: center; color: #999; padding: 40px;">
                        Brak wydatków. Kliknij "Dodaj wydatek" aby rozpocząć.
                    </p>
                `}
            `;
        } catch (error) {
            console.error('❌ Błąd ładowania wydatków:', error);
            alert('Błąd: ' + error.message);
        }
    }

    // =====================================
    // LISTA PENSJI
    // =====================================
    async showSalariesList() {
        try {
            const salaries = await window.api.request('/finances/salaries?limit=50');
            
            const container = document.getElementById('financeActivityList');
            container.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">💰 Lista pensji pracowników</h3>
                    <button onclick="financeDashboard.showAddSalaryModal()" style="
                        padding: 8px 16px;
                        background: #3B82F6;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                    ">
                        ➕ Wypłać pensję
                    </button>
                </div>
                
                ${salaries.salaries && salaries.salaries.length > 0 ? `
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f8f9fa; border-bottom: 2px solid #e0e0e0;">
                                    <th style="padding: 12px; text-align: left;">Pracownik</th>
                                    <th style="padding: 12px; text-align: left;">Miesiąc</th>
                                    <th style="padding: 12px; text-align: right;">Kwota brutto</th>
                                    <th style="padding: 12px; text-align: right;">Kwota netto</th>
                                    <th style="padding: 12px; text-align: center;">Status</th>
                                    <th style="padding: 12px; text-align: left;">Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${salaries.salaries.map(salary => `
                                    <tr style="border-bottom: 1px solid #f0f0f0;">
                                        <td style="padding: 12px; font-weight: 600;">${this.escapeHtml(salary.employee_name)}</td>
                                        <td style="padding: 12px;">${salary.month}/${salary.year}</td>
                                        <td style="padding: 12px; text-align: right; font-weight: 600;">${this.formatMoney(salary.gross_amount)}</td>
                                        <td style="padding: 12px; text-align: right; font-weight: 600; color: #3B82F6;">${this.formatMoney(salary.net_amount)}</td>
                                        <td style="padding: 12px; text-align: center;">
                                            <span style="
                                                padding: 4px 8px;
                                                border-radius: 12px;
                                                font-size: 0.8rem;
                                                background: ${salary.payment_status === 'paid' ? '#d4edda' : '#F8FAFC'};
                                                color: ${salary.payment_status === 'paid' ? '#155724' : '#666'};
                                            ">
                                                ${salary.payment_status === 'paid' ? '✓ Wypłacone' : '⏳ Oczekuje'}
                                            </span>
                                        </td>
                                        <td style="padding: 12px;">${new Date(salary.payment_date).toLocaleDateString('pl-PL')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <p style="text-align: center; color: #999; padding: 40px;">
                        Brak wypłat. Kliknij "Wypłać pensję" aby rozpocząć.
                    </p>
                `}
            `;
        } catch (error) {
            console.error('❌ Błąd ładowania pensji:', error);
            alert('Błąd: ' + error.message);
        }
    }
    
    async showAddSalaryModal() {
        // Pobierz listę pracowników
        let employees = [];
        try {
            const response = await window.api.request('/employees');
            employees = response.employees || [];
        } catch (error) {
            console.error('❌ Błąd pobierania pracowników:', error);
        }
        
        const modal = document.createElement('div');
        modal.id = 'addSalaryModal';
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; width: 90%;">
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #3B82F6 100%); padding: 20px; border-radius: 12px 12px 0 0; color: white;">
                    <h2 style="margin: 0;">💰 Wypłać pensję pracownikowi</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.9rem;">Wypłata zostanie zapisana w historii pracownika</p>
                </div>
                
                <form id="addSalaryForm" onsubmit="financeDashboard.saveSalary(event); return false;" style="padding: 30px;">
                    <!-- Pracownik - dropdown -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">👤 Pracownik *</label>
                        ${employees.length > 0 ? `
                            <select name="employee_id" id="employeeSelect" required 
                                    onchange="financeDashboard.loadEmployeeSalaryData(this.value)"
                                    style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px;">
                                <option value="">-- Wybierz pracownika --</option>
                                ${employees.map(emp => `
                                    <option value="${emp.user_id}" data-name="${this.escapeHtml(emp.full_name || emp.name)}">
                                        ${this.escapeHtml(emp.full_name || emp.name)} 
                                        ${emp.position ? `(${this.escapeHtml(emp.position)})` : ''}
                                    </option>
                                `).join('')}
                            </select>
                            <input type="hidden" name="employee_name" id="employeeName">
                        ` : `
                            <input type="text" name="employee_name" required placeholder="Imię i nazwisko"
                                   style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                            <small style="color: #666; display: block; margin-top: 5px;">⚠️ Brak pracowników w systemie - wpisz ręcznie</small>
                        `}
                    </div>
                    
                    <!-- Miesiąc i Rok -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Miesiąc *</label>
                            <select name="month" required style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                                <option value="1">Styczeń</option>
                                <option value="2">Luty</option>
                                <option value="3">Marzec</option>
                                <option value="4">Kwiecień</option>
                                <option value="5">Maj</option>
                                <option value="6">Czerwiec</option>
                                <option value="7">Lipiec</option>
                                <option value="8">Sierpień</option>
                                <option value="9">Wrzesień</option>
                                <option value="10">Październik</option>
                                <option value="11" selected>Listopad</option>
                                <option value="12">Grudzień</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Rok *</label>
                            <input type="number" name="year" value="2025" required min="2020" max="2030"
                                   style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                        </div>
                    </div>
                    
                    <!-- Kwoty -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Kwota brutto (PLN) *</label>
                            <input type="number" name="gross_amount" step="0.01" required
                                   style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Kwota netto (PLN) *</label>
                            <input type="number" name="net_amount" step="0.01" required
                                   style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                        </div>
                    </div>
                    
                    <!-- Uwagi -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Uwagi</label>
                        <textarea name="notes" rows="3"
                                  style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;"></textarea>
                    </div>
                    
                    <!-- Przyciski -->
                    <div style="display: flex; gap: 12px; margin-top: 30px;">
                        <button type="button" onclick="financeDashboard.closeModal('addSalaryModal')" style="
                            flex: 1;
                            padding: 12px;
                            background: #e0e0e0;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            ❌ Anuluj
                        </button>
                        <button type="submit" style="
                            flex: 2;
                            padding: 12px;
                            background: linear-gradient(135deg, #3B82F6 0%, #3B82F6 100%);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            ✓ Wypłać
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    async loadEmployeeSalaryData(userId) {
        if (!userId) return;
        
        // Ustaw nazwę pracownika w hidden input
        const select = document.getElementById('employeeSelect');
        const selectedOption = select.options[select.selectedIndex];
        const employeeName = selectedOption.dataset.name;
        
        const nameInput = document.getElementById('employeeName');
        if (nameInput) {
            nameInput.value = employeeName;
        }
        
        // Można tutaj dodać ładowanie danych pracownika (np. ostatnia pensja)
        try {
            const profile = await window.api.request(`/employees/${userId}/profile`);
            console.log('📋 Dane pracownika:', profile);
            
            // TODO: Jeśli pracownik ma zdefiniowaną pensję w profilu, uzupełnij automatycznie
            if (profile.profile && profile.profile.salary) {
                const grossInput = document.querySelector('[name="gross_amount"]');
                if (grossInput) {
                    grossInput.value = profile.profile.salary;
                }
            }
        } catch (error) {
            console.warn('⚠️ Nie udało się pobrać danych pracownika:', error);
        }
    }
    
    async saveSalary(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        const data = {
            employee_id: formData.get('employee_id') || null, // ID pracownika jeśli wybrany z listy
            employee_name: formData.get('employee_name'),
            month: parseInt(formData.get('month')),
            year: parseInt(formData.get('year')),
            gross_amount: parseFloat(formData.get('gross_amount')),
            net_amount: parseFloat(formData.get('net_amount')),
            notes: formData.get('notes')
        };
        
        try {
            const response = await window.api.request('/finances/salaries', 'POST', data);
            
            if (response.success) {
                alert(`✅ Pensja wypłacona!`);
                this.closeModal('addSalaryModal');
                await this.showSalariesList(); // Odśwież listę
            }
        } catch (error) {
            console.error('❌ Błąd wypłaty pensji:', error);
            alert('Błąd: ' + error.message);
        }
    }

    // =====================================
    // LISTA FAKTUR Z OCR
    // =====================================
    async showInvoicesList() {
        try {
            const invoices = await window.api.request('/finances/invoices?limit=50');
            
            const container = document.getElementById('financeActivityList');
            container.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">📄 Lista faktur kosztowych</h3>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="financeDashboard.showKsefConfigModal()" style="
                            padding: 8px 16px;
                            background: #3B82F6;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                        ">
                            🧾 Konfiguracja KSeF
                        </button>
                        <button onclick="financeDashboard.showAddInvoiceModal()" style="
                            padding: 8px 16px;
                            background: #3B82F6;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                        ">
                            ➕ Dodaj fakturę
                        </button>
                    </div>
                </div>
                
                ${invoices.invoices && invoices.invoices.length > 0 ? `
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f8f9fa; border-bottom: 2px solid #e0e0e0;">
                                    <th style="padding: 12px; text-align: left;">Numer faktury</th>
                                    <th style="padding: 12px; text-align: left;">Dostawca</th>
                                    <th style="padding: 12px; text-align: right;">Kwota</th>
                                    <th style="padding: 12px; text-align: left;">Termin</th>
                                    <th style="padding: 12px; text-align: center;">Status</th>
                                    <th style="padding: 12px; text-align: center;">KSeF</th>
                                    <th style="padding: 12px; text-align: center;">Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${invoices.invoices.map(invoice => `
                                    <tr style="border-bottom: 1px solid #f0f0f0;">
                                        <td style="padding: 12px; font-weight: 600; color: #3B82F6;">${this.escapeHtml(invoice.invoice_number)}</td>
                                        <td style="padding: 12px;">${this.escapeHtml(invoice.vendor)}</td>
                                        <td style="padding: 12px; text-align: right; font-weight: 600;">${this.formatMoney(invoice.amount)}</td>
                                        <td style="padding: 12px;">${new Date(invoice.due_date).toLocaleDateString('pl-PL')}</td>
                                        <td style="padding: 12px; text-align: center;">
                                            <span style="
                                                padding: 4px 8px;
                                                border-radius: 12px;
                                                font-size: 0.8rem;
                                                background: ${invoice.payment_status === 'paid' ? '#d4edda' : '#f8d7da'};
                                                color: ${invoice.payment_status === 'paid' ? '#155724' : '#721c24'};
                                            ">
                                                ${invoice.payment_status === 'paid' ? '✓ Opłacona' : '⚠️ Nieopłacona'}
                                            </span>
                                        </td>
                                        <td style="padding: 12px; text-align: center;">
                                            ${invoice.ksef_reference_number ? `
                                                <span style="
                                                    padding: 4px 8px;
                                                    border-radius: 12px;
                                                    font-size: 0.8rem;
                                                    background: #d4edda;
                                                    color: #155724;
                                                ">
                                                    ✓ Wysłana
                                                </span>
                                                <br>
                                                <button onclick="financeDashboard.downloadUPO('${invoice.ksef_reference_number}')" style="
                                                    margin-top: 5px;
                                                    padding: 3px 6px;
                                                    background: #3B82F6;
                                                    color: white;
                                                    border: none;
                                                    border-radius: 4px;
                                                    cursor: pointer;
                                                    font-size: 0.75rem;
                                                ">
                                                    📜 UPO
                                                </button>
                                            ` : `
                                                <button onclick="financeDashboard.sendToKsef(${invoice.id}, '${this.escapeHtml(invoice.invoice_number)}')" style="
                                                    padding: 4px 8px;
                                                    background: #3B82F6;
                                                    color: white;
                                                    border: none;
                                                    border-radius: 4px;
                                                    cursor: pointer;
                                                    font-size: 0.85rem;
                                                ">
                                                    📤 Wyślij do KSeF
                                                </button>
                                            `}
                                        </td>
                                        <td style="padding: 12px; text-align: center;">
                                            ${invoice.file_path ? `
                                                <button onclick="window.open('/uploads/${invoice.file_path}', '_blank')" style="
                                                    padding: 4px 8px;
                                                    background: #3B82F6;
                                                    color: white;
                                                    border: none;
                                                    border-radius: 4px;
                                                    cursor: pointer;
                                                    font-size: 0.85rem;
                                                ">
                                                    👁️ Zobacz
                                                </button>
                                            ` : '-'}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <p style="text-align: center; color: #999; padding: 40px;">
                        Brak faktur. Kliknij "Dodaj fakturę" aby rozpocząć.
                    </p>
                `}
            `;
        } catch (error) {
            console.error('❌ Błąd ładowania faktur:', error);
            alert('Błąd: ' + error.message);
        }
    }
    
    showAddInvoiceModal() {
        const modal = document.createElement('div');
        modal.id = 'addInvoiceModal';
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px; width: 90%;">
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 20px; border-radius: 12px 12px 0 0; color: white;">
                    <h2 style="margin: 0;">📄 Dodaj fakturę kosztową</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.9rem;">Możesz przesłać skan faktury - system automatycznie odczyta dane (OCR)</p>
                </div>
                
                <form id="addInvoiceForm" onsubmit="financeDashboard.saveInvoice(event); return false;" style="padding: 30px;">
                    <!-- Upload faktury -->
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">📎 Skan faktury (PDF/JPG/PNG)</label>
                        <input type="file" id="invoiceFile" accept=".pdf,.jpg,.jpeg,.png" 
                               onchange="financeDashboard.handleInvoiceUpload(event)"
                               style="width: 100%; padding: 12px; border: 2px dashed #e0e0e0; border-radius: 8px; background: #f8f9fa;">
                        <div id="ocrStatus" style="margin-top: 10px; padding: 10px; display: none; border-radius: 6px;"></div>
                    </div>
                    
                    <!-- Numer faktury -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Numer faktury *</label>
                        <input type="text" id="invoice_number" name="invoice_number" required placeholder="np. FV/2025/11/001"
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                    </div>
                    
                    <!-- Dostawca -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Dostawca *</label>
                        <input type="text" id="vendor" name="vendor" required placeholder="Nazwa firmy/sprzedawcy"
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                    </div>
                    
                    <!-- Kwota i data -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Kwota brutto (PLN) *</label>
                            <input type="number" id="amount" name="amount" step="0.01" required
                                   style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Termin płatności *</label>
                            <input type="date" id="due_date" name="due_date" required
                                   style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                        </div>
                    </div>
                    
                    <!-- Data wystawienia -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Data wystawienia</label>
                        <input type="date" name="issue_date"
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                    </div>
                    
                    <!-- Opis -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Opis/Uwagi</label>
                        <textarea name="description" rows="3"
                                  style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;"></textarea>
                    </div>
                    
                    <input type="hidden" id="file_path" name="file_path">
                    
                    <!-- Przyciski -->
                    <div style="display: flex; gap: 12px; margin-top: 30px;">
                        <button type="button" onclick="financeDashboard.closeModal('addInvoiceModal')" style="
                            flex: 1;
                            padding: 12px;
                            background: #e0e0e0;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            ❌ Anuluj
                        </button>
                        <button type="submit" style="
                            flex: 2;
                            padding: 12px;
                            background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            ✓ Dodaj fakturę
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    async handleInvoiceUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const statusDiv = document.getElementById('ocrStatus');
        statusDiv.style.display = 'block';
        statusDiv.style.background = '#F8FAFC';
        statusDiv.style.color = '#666';
        statusDiv.innerHTML = '🔄 Przesyłam fakturę i próbuję odczytać dane...';
        
        try {
            // Upload pliku
            const formData = new FormData();
            formData.append('file', file);
            
            const uploadResponse = await fetch('/api/finances/invoices/upload', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: formData
            });
            
            if (!uploadResponse.ok) throw new Error('Błąd uploadu');
            
            const result = await uploadResponse.json();
            
            // Zapisz ścieżkę do pliku
            document.getElementById('file_path').value = result.file_path;
            
            statusDiv.style.background = '#d4edda';
            statusDiv.style.color = '#155724';
            statusDiv.innerHTML = '✅ Faktura przesłana! Plik zapisany.';
            
            // OCR - próba automatycznego odczytu (jeśli backend obsługuje)
            if (result.ocr_data) {
                if (result.ocr_data.invoice_number) {
                    document.getElementById('invoice_number').value = result.ocr_data.invoice_number;
                }
                if (result.ocr_data.vendor) {
                    document.getElementById('vendor').value = result.ocr_data.vendor;
                }
                if (result.ocr_data.amount) {
                    document.getElementById('amount').value = result.ocr_data.amount;
                }
                statusDiv.innerHTML = '✅ Faktura przesłana! Dane odczytane automatycznie (OCR).';
            }
            
        } catch (error) {
            console.error('Błąd uploadu:', error);
            statusDiv.style.background = '#f8d7da';
            statusDiv.style.color = '#721c24';
            statusDiv.innerHTML = '❌ Błąd przesyłania faktury. Możesz wpisać dane ręcznie.';
        }
    }
    
    async saveInvoice(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        const data = {
            invoice_number: formData.get('invoice_number'),
            vendor: formData.get('vendor'),
            amount: parseFloat(formData.get('amount')),
            due_date: formData.get('due_date'),
            issue_date: formData.get('issue_date'),
            description: formData.get('description'),
            file_path: formData.get('file_path')
        };
        
        try {
            const response = await window.api.request('/finances/invoices', 'POST', data);
            
            if (response.success) {
                alert(`✅ Faktura dodana!`);
                this.closeModal('addInvoiceModal');
                await this.showInvoicesList(); // Odśwież listę
            }
        } catch (error) {
            console.error('❌ Błąd dodawania faktury:', error);
            alert('Błąd: ' + error.message);
        }
    }

    // =====================================
    // KSEF - KRAJOWY SYSTEM E-FAKTUR
    // =====================================
    
    showKsefConfigModal() {
        const modal = document.createElement('div');
        modal.id = 'ksefConfigModal';
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        // Pobierz zapisane dane z localStorage
        const savedNip = localStorage.getItem('ksef_nip') || '';
        const savedToken = localStorage.getItem('ksef_token') || '';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; width: 90%;">
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 20px; border-radius: 12px 12px 0 0; color: white;">
                    <h2 style="margin: 0;">🧾 Konfiguracja KSeF</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.9rem;">Krajowy System e-Faktur</p>
                </div>
                
                <form id="ksefConfigForm" onsubmit="financeDashboard.saveKsefConfig(event); return false;" style="padding: 30px;">
                    <!-- NIP -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">NIP firmy *</label>
                        <input type="text" name="nip" value="${savedNip}" required placeholder="1234567890"
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                        <small style="color: #666;">10 cyfr bez kresek</small>
                    </div>
                    
                    <!-- Token -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Token autoryzacyjny *</label>
                        <textarea name="token" rows="3" required placeholder="Wklej token z Portalu Podatkowego"
                                  style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">${savedToken}</textarea>
                        <small style="color: #666;">Token uzyskany z <a href="https://www.podatki.gov.pl/" target="_blank">Portalu Podatkowego</a></small>
                    </div>
                    
                    <!-- Środowisko -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Środowisko</label>
                        <select name="environment" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;">
                            <option value="demo">DEMO (testowe)</option>
                            <option value="prod">PRODUKCJA (prawdziwe faktury)</option>
                        </select>
                    </div>
                    
                    <!-- Status API -->
                    <div id="ksefStatus" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; display: none;">
                        <div style="font-weight: 600; margin-bottom: 5px;">Status API KSeF:</div>
                        <div id="ksefStatusText">Sprawdzanie...</div>
                    </div>
                    
                    <!-- Przyciski -->
                    <div style="display: flex; gap: 12px; margin-top: 30px;">
                        <button type="button" onclick="financeDashboard.testKsefConnection()" style="
                            flex: 1;
                            padding: 12px;
                            background: #3B82F6;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            🔍 Test połączenia
                        </button>
                        <button type="button" onclick="financeDashboard.closeModal('ksefConfigModal')" style="
                            flex: 1;
                            padding: 12px;
                            background: #e0e0e0;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            ❌ Anuluj
                        </button>
                        <button type="submit" style="
                            flex: 2;
                            padding: 12px;
                            background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            ✓ Zapisz konfigurację
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    async saveKsefConfig(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        const nip = formData.get('nip');
        const token = formData.get('token');
        
        // Zapisz do localStorage
        localStorage.setItem('ksef_nip', nip);
        localStorage.setItem('ksef_token', token);
        
        alert('✅ Konfiguracja KSeF zapisana!');
        this.closeModal('ksefConfigModal');
    }
    
    async testKsefConnection() {
        const statusDiv = document.getElementById('ksefStatus');
        const statusText = document.getElementById('ksefStatusText');
        
        statusDiv.style.display = 'block';
        statusText.innerHTML = '🔄 Sprawdzanie połączenia z KSeF...';
        
        try {
            const result = await window.api.request('/ksef/health');
            
            if (result.success) {
                statusDiv.style.background = '#d4edda';
                statusDiv.style.color = '#155724';
                statusText.innerHTML = `
                    ✅ Połączenie OK!<br>
                    Status: ${result.status}<br>
                    Wersja: ${result.version}<br>
                    Produkt: ${result.product}
                `;
            } else {
                statusDiv.style.background = '#f8d7da';
                statusDiv.style.color = '#721c24';
                statusText.innerHTML = `❌ Błąd: ${result.error}`;
            }
        } catch (error) {
            statusDiv.style.background = '#f8d7da';
            statusDiv.style.color = '#721c24';
            statusText.innerHTML = `❌ Błąd połączenia: ${error.message}`;
        }
    }
    
    async sendToKsef(invoiceId, invoiceNumber) {
        // Sprawdź czy jest konfiguracja
        const nip = localStorage.getItem('ksef_nip');
        const token = localStorage.getItem('ksef_token');
        
        if (!nip || !token) {
            alert('⚠️ Brak konfiguracji KSeF!\n\nKliknij "Konfiguracja KSeF" i uzupełnij dane.');
            return;
        }
        
        if (!confirm(`Wysłać fakturę ${invoiceNumber} do KSeF?`)) {
            return;
        }
        
        try {
            // Tutaj będzie logika wysyłania faktury do KSeF
            // Na razie placeholder
            alert('🔄 Funkcja wysyłania do KSeF będzie dostępna wkrótce!\n\nPotrzebne dane:\n- NIP: ' + nip + '\n- Invoice: ' + invoiceNumber);
            
            // TODO: Implementacja wysyłania
            // const result = await window.api.request('/ksef/invoice/send', 'POST', {...});
            
        } catch (error) {
            console.error('❌ Błąd wysyłania do KSeF:', error);
            alert('Błąd: ' + error.message);
        }
    }
    
    async downloadUPO(referenceNumber) {
        const nip = localStorage.getItem('ksef_nip');
        const token = localStorage.getItem('ksef_token');
        
        if (!nip || !token) {
            alert('⚠️ Brak konfiguracji KSeF!');
            return;
        }
        
        try {
            const result = await window.api.request('/ksef/invoice/upo', 'POST', {
                referenceNumber,
                nip,
                authToken: token
            });
            
            if (result.success) {
                // Utwórz link do pobrania UPO
                const blob = new Blob([result.upo], { type: 'application/xml' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `UPO_${referenceNumber}.xml`;
                a.click();
                window.URL.revokeObjectURL(url);
                
                alert('✅ UPO pobrane!');
            } else {
                alert('❌ Błąd pobierania UPO: ' + result.error);
            }
        } catch (error) {
            console.error('❌ Błąd pobierania UPO:', error);
            alert('Błąd: ' + error.message);
        }
    }

    // =====================================
    // POMOCNICZE
    // =====================================
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.remove();
    }

    formatMoney(amount) {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount || 0);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // =====================================
    // PROWIZJE - LISTA
    // =====================================
    async showCommissionsList() {
        try {
            console.log('💰 Pobieranie listy prowizji...');
            
            // Pobierz statystyki i listę prowizji
            const [statsResponse, pendingResponse] = await Promise.all([
                window.api.request('/commissions/stats', 'GET'),
                window.api.request('/commissions/pending', 'GET')
            ]);
            
            if (!statsResponse.success || !pendingResponse.success) {
                throw new Error('Błąd pobierania danych prowizji');
            }
            
            const stats = statsResponse.stats;
            const commissions = pendingResponse.commissions;
            
            const container = document.getElementById('financeActivityList');
            if (!container) return;
            
            container.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; color: #2c3e50;">💰 System Prowizji</h3>
                    
                    <!-- Statystyki -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
                        <div style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); padding: 20px; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);">
                            <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">⏳ Do wypłaty</div>
                            <div style="font-size: 2rem; font-weight: 700;">${this.formatMoney(stats.pending_amount)}</div>
                            <div style="font-size: 0.85rem; opacity: 0.9; margin-top: 5px;">${stats.pending_count} prowizji</div>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #27ae60 0%, #229954 100%); padding: 20px; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);">
                            <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">✅ Wypłacone</div>
                            <div style="font-size: 2rem; font-weight: 700;">${this.formatMoney(stats.paid_amount)}</div>
                            <div style="font-size: 0.85rem; opacity: 0.9; margin-top: 5px;">${stats.paid_count} prowizji</div>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); padding: 20px; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);">
                            <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">📊 Łącznie</div>
                            <div style="font-size: 2rem; font-weight: 700;">${this.formatMoney(stats.total_amount)}</div>
                            <div style="font-size: 0.85rem; opacity: 0.9; margin-top: 5px;">${stats.total_commissions} prowizji</div>
                        </div>
                    </div>
                    
                    <!-- Informacja o stawkach -->
                    <div style="background: #ecf0f1; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f39c12;">
                        <strong style="color: #2c3e50;">📋 Stawki prowizji:</strong><br>
                        <span style="color: #34495e; font-size: 0.9rem;">
                            • Mecenas: <strong>15%</strong> od kwoty płatności<br>
                            • Opiekun sprawy: <strong>10%</strong> od kwoty płatności<br>
                            • Opiekun klienta: <strong>5%</strong> od kwoty płatności
                        </span>
                    </div>
                    
                    <!-- Lista prowizji do wypłaty -->
                    <div style="margin-top: 25px;">
                        <h4 style="margin: 0 0 15px 0; color: #2c3e50;">⏳ Prowizje do wypłaty (${commissions.length})</h4>
                        ${commissions.length === 0 ? `
                            <div style="text-align: center; padding: 40px; color: #95a5a6;">
                                <div style="font-size: 3rem;">✅</div>
                                <p>Brak prowizji do wypłaty</p>
                            </div>
                        ` : `
                            <div style="overflow-x: auto;">
                                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                    <thead>
                                        <tr style="background: #34495e; color: white;">
                                            <th style="padding: 12px; text-align: left;">Pracownik</th>
                                            <th style="padding: 12px; text-align: left;">Rola</th>
                                            <th style="padding: 12px; text-align: right;">Prowizja</th>
                                            <th style="padding: 12px; text-align: right;">Płatność</th>
                                            <th style="padding: 12px; text-align: left;">Sprawa</th>
                                            <th style="padding: 12px; text-align: left;">Klient</th>
                                            <th style="padding: 12px; text-align: center;">Data</th>
                                            <th style="padding: 12px; text-align: center;">Akcje</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${commissions.map(comm => `
                                            <tr style="border-bottom: 1px solid #ecf0f1;">
                                                <td style="padding: 12px;">
                                                    <strong style="color: #2c3e50;">${this.escapeHtml(comm.user_name)}</strong><br>
                                                    <small style="color: #95a5a6;">${this.escapeHtml(comm.user_email)}</small>
                                                </td>
                                                <td style="padding: 12px;">
                                                    <span style="background: ${this.getRoleBadgeColor(comm.user_role)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">
                                                        ${this.getRoleLabel(comm.user_role)}
                                                    </span>
                                                </td>
                                                <td style="padding: 12px; text-align: right;">
                                                    <strong style="color: #f39c12; font-size: 1.1rem;">${this.formatMoney(comm.commission_amount)}</strong><br>
                                                    <small style="color: #95a5a6;">${comm.commission_rate}%</small>
                                                </td>
                                                <td style="padding: 12px; text-align: right;">
                                                    <strong style="color: #27ae60;">${this.formatMoney(comm.payment_amount)}</strong><br>
                                                    <small style="color: #95a5a6;">${this.escapeHtml(comm.payment_code)}</small>
                                                </td>
                                                <td style="padding: 12px;">
                                                    ${comm.case_number ? `
                                                        <strong style="color: #3498db;">${this.escapeHtml(comm.case_number)}</strong><br>
                                                        <small style="color: #7f8c8d;">${this.escapeHtml(comm.case_title || '').substring(0, 30)}...</small>
                                                    ` : '<span style="color: #95a5a6;">-</span>'}
                                                </td>
                                                <td style="padding: 12px; color: #2c3e50;">
                                                    ${this.escapeHtml(comm.client_name || '-')}
                                                </td>
                                                <td style="padding: 12px; text-align: center; color: #7f8c8d; font-size: 0.9rem;">
                                                    ${new Date(comm.created_at).toLocaleDateString('pl-PL')}
                                                </td>
                                                <td style="padding: 12px; text-align: center;">
                                                    <button onclick="financeDashboard.payCommission(${comm.id})" style="
                                                        background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
                                                        color: white;
                                                        border: none;
                                                        padding: 8px 16px;
                                                        border-radius: 6px;
                                                        cursor: pointer;
                                                        font-weight: 600;
                                                        box-shadow: 0 2px 6px rgba(39, 174, 96, 0.3);
                                                    ">
                                                        💸 Wypłać
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `}
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('❌ Błąd ładowania prowizji:', error);
            alert('Błąd ładowania prowizji: ' + error.message);
        }
    }

    // =====================================
    // WYPŁAĆ PROWIZJĘ
    // =====================================
    async payCommission(commissionId) {
        const payment_method = prompt('Metoda wypłaty:\n\nWpisz jedną z opcji:\n- bank_transfer\n- cash\n- other', 'bank_transfer');
        if (!payment_method) return;
        
        const notes = prompt('Notatka (opcjonalnie):', `Wypłata prowizji - ${new Date().toLocaleDateString('pl-PL')}`);
        
        if (!confirm('Czy na pewno chcesz oznaczyć tę prowizję jako wypłaconą?')) return;
        
        try {
            const result = await window.api.request(`/commissions/${commissionId}/pay`, 'POST', {
                payment_method,
                notes
            });
            
            if (result.success) {
                alert('✅ Prowizja została wypłacona!');
                // Odśwież listę
                this.showCommissionsList();
            } else {
                alert('❌ Błąd: ' + result.error);
            }
        } catch (error) {
            console.error('❌ Błąd wypłaty prowizji:', error);
            alert('Błąd wypłaty prowizji: ' + error.message);
        }
    }

    // =====================================
    // POMOCNICZE DLA PROWIZJI
    // =====================================
    getRoleBadgeColor(role) {
        const colors = {
            'lawyer': '#3498db',
            'case_manager': '#9b59b6',
            'client_manager': '#e74c3c'
        };
        return colors[role] || '#95a5a6';
    }

    getRoleLabel(role) {
        const labels = {
            'lawyer': '⚖️ Mecenas',
            'case_manager': '📋 Opiekun sprawy',
            'client_manager': '👥 Opiekun klienta'
        };
        return labels[role] || role;
    }
}

// Utwórz globalną instancję
const financeDashboard = new FinanceDashboard();
window.financeDashboard = financeDashboard;

console.log('✅ Finance Dashboard v3.0 załadowany - KSeF INTEGRATED! 🧾');
console.log('📄 Sales Invoices Module ready!');
