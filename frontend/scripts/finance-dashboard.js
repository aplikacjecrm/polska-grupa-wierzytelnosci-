/**
 * Finance Dashboard v2.0
 * Dashboard Finansowy - kompletny system finansowy
 * 
 * Features:
 * - 💰 Płatności (wszystkie płatności ze wszystkich spraw)
 * - 👥 Prowizje (prowizje pracowników)
 * - 💼 Wypłaty pracowników (pensje, premie)
 * - 🏢 Wydatki firmy (wszystkie wydatki)
 * - 📊 Raporty (przychody vs wydatki)
 */

class FinanceDashboard {
    constructor() {
        console.log('💰 Finance Dashboard v2.0 zainicjalizowany');
        this.currentTab = 'payments'; // payments, commissions, salaries, expenses, reports
        this.payments = [];
        this.stats = null;
        this.filters = {
            status: '',
            client_id: '',
            date_from: '',
            date_to: '',
            payment_method: ''
        };
        this.currentPage = 0;
        this.pageSize = 20;
        this.commissions = [];
        this.commissionStatusFilter = 'pending';
    }

    // =====================================
    // OTWÓRZ DASHBOARD
    // =====================================
    async open() {
        console.log('💰 Otwieranie Finance Dashboard');
        
        // Znajdź lub stwórz kontener
        let container = document.getElementById('financeDashboardContainer');
        
        if (!container) {
            console.warn('⚠️ financeDashboardContainer nie istnieje, tworzę...');
            
            // Znajdź widok rodzica
            const parentView = document.getElementById('finance-dashboardView');
            if (!parentView) {
                console.error('❌ finance-dashboardView nie istnieje!');
                return;
            }
            
            // Stwórz kontener
            container = document.createElement('div');
            container.id = 'financeDashboardContainer';
            container.style.width = '100%';
            container.style.height = '100%';
            parentView.innerHTML = '';  // Wyczyść
            parentView.appendChild(container);
            
            console.log('✅ Kontener utworzony!');
        }
        
        console.log('✅ Kontener znaleziony, ładuję dane...');
        
        await this.loadStats();
        await this.loadPayments();
        
        this.render();
    }

    // =====================================
    // ZAŁADUJ STATYSTYKI
    // =====================================
    async loadStats() {
        try {
            const response = await api.request('/payments/stats');
            this.stats = response.stats;
            console.log('📊 Statystyki załadowane:', this.stats);
        } catch (error) {
            console.error('❌ Błąd ładowania statystyk:', error);
            this.stats = null;
        }
    }

    // =====================================
    // ZAŁADUJ PŁATNOŚCI Z FILTRAMI
    // =====================================
    async loadPayments() {
        try {
            const queryParams = new URLSearchParams({
                limit: this.pageSize,
                offset: this.currentPage * this.pageSize,
                ...this.filters
            });
            
            // Usuń puste filtry
            for (const [key, value] of [...queryParams.entries()]) {
                if (!value) queryParams.delete(key);
            }
            
            const response = await api.request(`/payments/all?${queryParams}`);
            this.payments = response.payments || [];
            this.pagination = response.pagination;
            
            console.log('💳 Płatności załadowane:', this.payments.length);
        } catch (error) {
            console.error('❌ Błąd ładowania płatności:', error);
            this.payments = [];
        }
    }

    // =====================================
    // RENDEROWANIE DASHBOARD
    // =====================================
    render() {
        console.log('🎨 Renderowanie Finance Dashboard');
        console.log('📊 Stats:', this.stats);
        console.log('💳 Payments:', this.payments.length);
        
        const content = `
            <div style="padding: 20px; background: #f5f7fa; width: 100%; height: auto; overflow-y: auto;">
                <!-- Nagłówek -->
                <div style="margin-bottom: 20px;">
                    <h1 style="margin: 0 0 10px 0; color: #1a2332; font-size: 1.8rem;">
                        💰 Dashboard Finansowy
                    </h1>
                    <p style="color: #666; margin: 0;">
                        Kompletny system zarządzania finansami
                    </p>
                </div>

                <!-- Zakładki -->
                ${this.renderTabs()}

                <!-- Zawartość zakładki -->
                ${this.renderTabContent()}
            </div>
        `;

        // Znajdź kontener Finance Dashboard
        let container = document.getElementById('financeDashboardContainer');
        
        if (!container) {
            console.error('❌ financeDashboardContainer nie znaleziony!');
            return;
        }
        
        console.log('✅ Renderuję do: financeDashboardContainer');
        
        // Upewnij się że widok jest widoczny (switchView już to robi, ale dla pewności)
        const view = document.getElementById('finance-dashboardView');
        if (view) {
            view.style.display = 'block';
            view.style.overflow = 'auto';
        }
        
        container.innerHTML = content;
    }

    // =====================================
    // ZAKŁADKI
    // =====================================
    renderTabs() {
        const tabs = [
            { id: 'payments', icon: '💰', label: 'Płatności', desc: 'Płatności klientów' },
            { id: 'commissions', icon: '👥', label: 'Prowizje', desc: 'Prowizje pracowników' },
            { id: 'commission-rates', icon: '📊', label: 'Stawki', desc: 'Zarządzanie stawkami' },
            { id: 'salaries', icon: '💼', label: 'Wypłaty', desc: 'Pensje i premie' },
            { id: 'expenses', icon: '🏢', label: 'Wydatki', desc: 'Koszty firmy' },
            { id: 'receipts', icon: '📄', label: 'Faktury', desc: 'Faktury i paragony' },
            { id: 'reports', icon: '📊', label: 'Raporty', desc: 'Podsumowania' }
        ];

        return `
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="display: flex; gap: 10px; overflow-x: auto;">
                    ${tabs.map(tab => `
                        <button onclick="financeDashboard.switchTab('${tab.id}')" 
                                style="flex: 1; min-width: 140px; padding: 15px; border: 2px solid ${this.currentTab === tab.id ? '#FFD700' : '#e0e0e0'}; 
                                       background: ${this.currentTab === tab.id ? 'linear-gradient(135deg, #FFD700 0%, #d4af37 100%)' : 'white'}; 
                                       color: ${this.currentTab === tab.id ? '#1a2332' : '#666'}; border-radius: 8px; cursor: pointer; 
                                       transition: all 0.3s; font-weight: ${this.currentTab === tab.id ? '700' : '500'};">
                            <div style="font-size: 1.5rem; margin-bottom: 5px;">${tab.icon}</div>
                            <div style="font-size: 0.95rem;">${tab.label}</div>
                            <div style="font-size: 0.75rem; opacity: 0.8; margin-top: 3px;">${tab.desc}</div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    switchTab(tabId) {
        console.log('🔄 Przełączanie zakładki:', tabId);
        this.currentTab = tabId;
        this.render();
        
        // Automatyczne ładowanie danych dla zakładek
        if (tabId === 'receipts') {
            setTimeout(() => this.loadReceipts(), 100);
        } else if (tabId === 'commissions') {
            setTimeout(() => this.loadCommissions(), 100);
        } else if (tabId === 'commission-rates') {
            setTimeout(() => this.loadCommissionRates(), 100);
        } else if (tabId === 'salaries') {
            setTimeout(() => this.loadSalaries(), 100);
        }
    }

    renderTabContent() {
        switch (this.currentTab) {
            case 'payments':
                return this.renderPaymentsContent();
            case 'commissions':
                return this.renderCommissionsContent();
            case 'commission-rates':
                return this.renderCommissionRatesContent();
            case 'salaries':
                return this.renderSalariesContent();
            case 'expenses':
                return this.renderExpensesContent();
            case 'receipts':
                return this.renderReceiptsContent();
            case 'reports':
                return this.renderReportsContent();
            default:
                return this.renderPaymentsContent();
        }
    }

    // =====================================
    // ZAWARTOŚĆ: PŁATNOŚCI
    // =====================================
    renderPaymentsContent() {
        return `
            <!-- Statystyki -->
            ${this.renderStats()}

            <!-- Filtry -->
            ${this.renderFilters()}

            <!-- Tabela płatności -->
            ${this.renderPaymentsTable()}
        `;
    }

    // =====================================
    // ZAWARTOŚĆ: PROWIZJE
    // =====================================
    renderCommissionsContent() {
        return `
            <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: #1a2332; font-weight: 700;">👥 Prowizje Pracowników</h2>
                    <button onclick="financeDashboard.loadCommissions()" 
                            style="padding: 10px 20px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        🔄 Odśwież
                    </button>
                </div>

                <!-- Zakładki statusów -->
                <div id="commissionStatusTabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">
                    <button onclick="financeDashboard.filterCommissionsByStatus('pending')" 
                            id="tab-pending"
                            class="commission-status-tab active"
                            style="padding: 10px 20px; background: #f39c12; color: white; border: none; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: 600;">
                        🟡 Oczekujące
                    </button>
                    <button onclick="financeDashboard.filterCommissionsByStatus('approved')" 
                            id="tab-approved"
                            class="commission-status-tab"
                            style="padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: 600;">
                        ✅ Zatwierdzone
                    </button>
                    <button onclick="financeDashboard.filterCommissionsByStatus('paid')" 
                            id="tab-paid"
                            class="commission-status-tab"
                            style="padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: 600;">
                        💰 Wypłacone
                    </button>
                    <button onclick="financeDashboard.filterCommissionsByStatus('rejected')" 
                            id="tab-rejected"
                            class="commission-status-tab"
                            style="padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: 600;">
                        ❌ Odrzucone
                    </button>
                </div>

                <div id="commissionsContainer" style="min-height: 300px;">
                    <div style="text-align: center; padding: 60px 20px; color: #64748b;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">👥</div>
                        <h3 style="color: #1a2332; margin-bottom: 10px; font-weight: 700;">Ładowanie prowizji...</h3>
                        <p style="color: #64748b; font-weight: 600;">Proszę czekać</p>
                    </div>
                </div>
            </div>
        `;
    }

    // =====================================
    // ZAWARTOŚĆ: STAWKI PROWIZJI
    // =====================================
    renderCommissionRatesContent() {
        return `
            <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <h2 style="margin: 0 0 5px 0; color: #1a2332; font-weight: 700;">📊 Zarządzanie Stawkami Prowizji</h2>
                        <p style="margin: 0; color: #64748b; font-size: 0.9rem;">
                            HR → ustala stawki | Admin → zatwierdza | Finance → wypłaca
                        </p>
                    </div>
                    <button onclick="financeDashboard.loadCommissionRates()" 
                            style="padding: 10px 20px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        🔄 Odśwież
                    </button>
                </div>

                <!-- Zakładki dla Admin -->
                <div id="ratesTabs" style="display: none; border-bottom: 2px solid #e0e0e0; margin-bottom: 20px;">
                    <div style="display: flex; gap: 10px; padding-bottom: 10px;">
                        <button onclick="financeDashboard.switchRatesView('employees')" 
                                id="rates-tab-employees"
                                style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: 600;">
                            👥 Pracownicy
                        </button>
                        <button onclick="financeDashboard.switchRatesView('pending')" 
                                id="rates-tab-pending"
                                style="padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: 600;">
                            🟡 Oczekujące wnioski
                        </button>
                    </div>
                </div>

                <!-- Kontener na dane -->
                <div id="commissionRatesContainer" style="min-height: 400px;">
                    <div style="text-align: center; padding: 60px 20px; color: #64748b;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">📊</div>
                        <h3 style="color: #1a2332; margin-bottom: 10px; font-weight: 700;">Ładowanie stawek prowizji...</h3>
                        <p style="color: #64748b; font-weight: 600;">Proszę czekać</p>
                    </div>
                </div>
            </div>
        `;
    }

    // =====================================
    // ZAWARTOŚĆ: WYPŁATY PRACOWNIKÓW
    // =====================================
    renderSalariesContent() {
        return `
            <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: #1a2332; font-weight: 700;"> Wypłaty Pracowników</h2>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="financeDashboard.showAddPaymentForm()" 
                                style="padding: 10px 20px; background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Dodaj Wypłatę
                        </button>
                        <button onclick="financeDashboard.loadSalaries()" 
                                style="padding: 10px 20px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Odśwież
                        </button>
                    </div>
                </div>

                <div id="salariesContainer" style="min-height: 300px;">
                    <div style="text-align: center; padding: 60px 20px; color: #64748b;">
                        <div style="font-size: 3rem; margin-bottom: 15px;"></div>
                        <h3 style="color: #1a2332; margin-bottom: 10px; font-weight: 700;">Ładowanie wypłat...</h3>
                        <p style="color: #64748b; font-weight: 600;">Proszę czekać</p>
                    </div>
                </div>
            </div>
        `;
    }

    // =====================================
    // ZAWARTOŚĆ: WYDATKI FIRMY
    // =====================================
    renderExpensesContent() {
        return `
            <div style="background: white; padding: 40px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="font-size: 3rem; margin-bottom: 15px;">🏢</div>
                <h3 style="color: #2c3e50;">Wydatki firmy</h3>
                <p style="color: #999; margin: 10px 0 20px 0;">W budowie - będzie zawierać:</p>
                <ul style="text-align: left; max-width: 500px; margin: 0 auto; color: #666;">
                    <li>Dodawanie wydatków (faktury kosztowe)</li>
                    <li>Kategorie wydatków (czynsz, media, oprogramowanie, marketing, etc.)</li>
                    <li>Upload faktur (PDF/JPG)</li>
                    <li>Zatwierdzanie wydatków</li>
                    <li>Raporty wydatków (według kategorii, miesiąca, kontrahenta)</li>
                    <li>Zestawienie VAT</li>
                </ul>
            </div>
        `;
    }

    // =====================================
    // ZAWARTOŚĆ: FAKTURY/PARAGONY
    // =====================================
    renderReceiptsContent() {
        return `
            <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: #1a2332; font-weight: 700;">📄 Faktury i Paragony</h2>
                    <button onclick="financeDashboard.loadReceipts()" 
                            style="padding: 10px 20px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        🔄 Odśwież
                    </button>
                </div>

                <div id="receiptsContainer" style="min-height: 300px;">
                    <div style="text-align: center; padding: 60px 20px; color: #64748b;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">📄</div>
                        <h3 style="color: #1a2332; margin-bottom: 10px; font-weight: 700;">Ładowanie faktur...</h3>
                        <p style="color: #64748b; font-weight: 600;">Proszę czekać</p>
                    </div>
                </div>
            </div>
        `;
    }

    // =====================================
    // ZAWARTOŚĆ: RAPORTY
    // =====================================
    renderReportsContent() {
        return `
            <div style="background: white; padding: 40px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="font-size: 3rem; margin-bottom: 15px;">📊</div>
                <h3 style="color: #2c3e50;">Raporty finansowe</h3>
                <p style="color: #999; margin: 10px 0 20px 0;">W budowie - będzie zawierać:</p>
                <ul style="text-align: left; max-width: 400px; margin: 0 auto; color: #666;">
                    <li>Przychody vs Wydatki</li>
                    <li>Zysk netto</li>
                    <li>Statystyki miesięczne</li>
                    <li>Wykresy trendów</li>
                    <li>Eksport do Excel</li>
                    <li>Prognozy finansowe</li>
                </ul>
            </div>
        `;
    }

    // =====================================
    // STATYSTYKI
    // =====================================
    renderStats() {
        if (!this.stats) {
            return '<div style="text-align: center; padding: 20px;">Ładowanie statystyk...</div>';
        }

        const general = this.stats.general;
        const monthly = this.stats.monthly;

        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <!-- Opłacone -->
                <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 20px; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);">
                    <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">✅ Opłacone</div>
                    <div style="font-size: 2rem; font-weight: 700;">${general.completed_count || 0}</div>
                    <div style="font-size: 1.1rem; margin-top: 5px;">${this.formatMoney(general.total_completed_amount || 0)}</div>
                </div>

                <!-- Oczekujące -->
                <div style="background: linear-gradient(135deg, #FFD700 0%, #d4af37 100%); padding: 20px; border-radius: 12px; color: #1a2332; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);">
                    <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">⏳ Oczekujące</div>
                    <div style="font-size: 2rem; font-weight: 700;">${general.pending_count || 0}</div>
                    <div style="font-size: 1.1rem; margin-top: 5px;">${this.formatMoney(general.total_pending_amount || 0)}</div>
                </div>

                <!-- Przeterminowane -->
                <div onclick="financeDashboard.showOverduePayments()" 
                     style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 20px; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3); cursor: pointer; transition: transform 0.2s;"
                     onmouseover="this.style.transform='scale(1.05)'"
                     onmouseout="this.style.transform='scale(1)'">
                    <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">⚠️ Przeterminowane</div>
                    <div style="font-size: 2rem; font-weight: 700;">${general.overdue_count || 0}</div>
                    <div style="font-size: 1.1rem; margin-top: 5px;">${this.formatMoney(general.overdue_amount || 0)}</div>
                    <div style="font-size: 0.8rem; margin-top: 10px; opacity: 0.9;">👆 Kliknij aby zobaczyć</div>
                </div>

                <!-- Ten miesiąc -->
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 20px; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                    <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">📅 Ten miesiąc</div>
                    <div style="font-size: 2rem; font-weight: 700;">${monthly.count || 0}</div>
                    <div style="font-size: 1.1rem; margin-top: 5px;">${this.formatMoney(monthly.revenue || 0)}</div>
                </div>
            </div>

            <!-- Zbliżające się terminy -->
            ${this.stats.upcoming_due_dates && this.stats.upcoming_due_dates.length > 0 ? `
                <div style="background: #fff3cd; border-left: 4px solid #d97706; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
                    <h4 style="margin: 0 0 10px 0; color: #92400e; font-weight: 700;">⚠️ Zbliżające się terminy (7 dni)</h4>
                    ${this.stats.upcoming_due_dates.map(p => `
                        <div style="margin-bottom: 5px; font-size: 0.9rem; color: #1a2332;">
                            <strong style="color: #92400e;">${p.payment_code}</strong> - ${p.client_name} - <strong>${this.formatMoney(p.amount)}</strong>
                            <span style="color: #92400e; font-weight: 600;">(${new Date(p.due_date).toLocaleDateString('pl-PL')})</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }

    // =====================================
    // FILTRY
    // =====================================
    renderFilters() {
        return `
            <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50;">🔍 Filtry</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <!-- Status -->
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #2c3e50;">Status</label>
                        <select id="filterStatus" onchange="financeDashboard.updateFilter('status', this.value)" 
                                style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px;">
                            <option value="">Wszystkie</option>
                            <option value="pending">⏳ Oczekujące</option>
                            <option value="completed">✅ Opłacone</option>
                            <option value="failed">❌ Nieudane</option>
                        </select>
                    </div>

                    <!-- Metoda płatności -->
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #2c3e50;">Metoda płatności</label>
                        <select id="filterMethod" onchange="financeDashboard.updateFilter('payment_method', this.value)"
                                style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-weight: 600; color: #1a2332;">
                            <option value="">Wszystkie</option>
                            <option value="blik" style="font-weight: 600;">📱 BLIK</option>
                            <option value="paypal" style="font-weight: 600;">💳 PayPal</option>
                            <option value="card" style="font-weight: 600;">💳 Karta</option>
                            <option value="cash" style="font-weight: 600;">💵 Gotówka</option>
                            <option value="crypto" style="font-weight: 600;">₿ Krypto</option>
                            <option value="balance" style="font-weight: 600;">💰 Saldo</option>
                            <option value="bank_transfer" style="font-weight: 600;">🏦 Przelew</option>
                        </select>
                    </div>

                    <!-- Data od -->
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #2c3e50;">Data od</label>
                        <input type="date" id="filterDateFrom" onchange="financeDashboard.updateFilter('date_from', this.value)"
                               style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px;">
                    </div>

                    <!-- Data do -->
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #2c3e50;">Data do</label>
                        <input type="date" id="filterDateTo" onchange="financeDashboard.updateFilter('date_to', this.value)"
                               style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px;">
                    </div>
                </div>
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button onclick="financeDashboard.resetFilters()" 
                            style="padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        🔄 Resetuj filtry
                    </button>
                </div>
            </div>
        `;
    }

    // =====================================
    // TABELA PŁATNOŚCI
    // =====================================
    renderPaymentsTable() {
        if (this.payments.length === 0) {
            return `
                <div style="background: white; padding: 40px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="font-size: 3rem; margin-bottom: 15px;">💳</div>
                    <h3 style="color: #7f8c8d;">Brak płatności</h3>
                    <p style="color: #999;">Spróbuj zmienić filtry</p>
                </div>
            `;
        }

        return `
            <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #FFD700 0%, #d4af37 100%);">
                                <th style="padding: 15px; text-align: left; color: #1a2332; font-weight: 700;">Kod płatności</th>
                                <th style="padding: 15px; text-align: left; color: #1a2332; font-weight: 700;">Sprawa</th>
                                <th style="padding: 15px; text-align: left; color: #1a2332; font-weight: 700;">Klient</th>
                                <th style="padding: 15px; text-align: right; color: #1a2332; font-weight: 700;">Kwota</th>
                                <th style="padding: 15px; text-align: center; color: #1a2332; font-weight: 700;">Status</th>
                                <th style="padding: 15px; text-align: center; color: #1a2332; font-weight: 700;">Metoda</th>
                                <th style="padding: 15px; text-align: left; color: #1a2332; font-weight: 700;">Data</th>
                                <th style="padding: 15px; text-align: center; color: #1a2332; font-weight: 700;">Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.payments.map((payment, index) => {
                                // Sprawdź czy przeterminowana
                                const now = new Date();
                                const isOverdue = payment.status === 'pending' && 
                                                payment.due_date && 
                                                new Date(payment.due_date) < now;
                                
                                const rowBg = isOverdue 
                                    ? 'linear-gradient(135deg, #fee 0%, #fdd 100%)' 
                                    : (index % 2 === 0 ? 'white' : '#f8f9fa');
                                
                                const borderStyle = isOverdue ? 'border-left: 4px solid #e74c3c;' : '';
                                
                                return `
                                    <tr style="border-bottom: 1px solid #ecf0f1; background: ${rowBg}; ${borderStyle}">
                                        <td style="padding: 12px; font-weight: 600; color: ${isOverdue ? '#c0392b' : '#2c3e50'};">
                                            ${isOverdue ? '⚠️ ' : ''}${this.escapeHtml(payment.payment_code)}
                                        </td>
                                        <td style="padding: 12px; color: #34495e;">${this.escapeHtml(payment.case_number || '-')}</td>
                                        <td style="padding: 12px; color: #34495e;">${this.escapeHtml(payment.company_name || payment.client_name || '-')}</td>
                                        <td style="padding: 12px; text-align: right; font-weight: 600; color: ${isOverdue ? '#e74c3c' : '#2c3e50'};">
                                            ${this.formatMoney(payment.amount)}
                                        </td>
                                        <td style="padding: 12px; text-align: center;">
                                            ${isOverdue 
                                                ? '<span style="background: #e74c3c; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">⚠️ Przeterminowana</span>'
                                                : this.renderStatusBadge(payment.status)
                                            }
                                        </td>
                                        <td style="padding: 12px; text-align: center;">${this.renderPaymentMethod(payment.payment_method)}</td>
                                        <td style="padding: 12px; color: ${isOverdue ? '#c0392b' : '#7f8c8d'}; font-size: 0.9rem; font-weight: ${isOverdue ? '600' : '400'};">
                                            ${new Date(payment.created_at).toLocaleDateString('pl-PL')}
                                            ${isOverdue && payment.due_date ? `
                                                <div style="color: #e74c3c; font-size: 0.75rem; margin-top: 2px;">
                                                    ⏰ ${new Date(payment.due_date).toLocaleDateString('pl-PL')}
                                                </div>
                                            ` : ''}
                                        </td>
                                        <td style="padding: 12px; text-align: center;">
                                            <div style="display: flex; gap: 5px; justify-content: center; flex-wrap: wrap;">
                                                ${isOverdue ? `
                                                    <button onclick="financeDashboard.sendReminder(${payment.id})"
                                                            style="padding: 6px 12px; background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; white-space: nowrap;">
                                                        📧 Przypomnienie
                                                    </button>
                                                ` : ''}
                                                <button onclick="financeDashboard.viewPaymentDetails(${payment.id}, ${payment.case_id})"
                                                        style="padding: 6px 12px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem; white-space: nowrap;">
                                                    👁️ Zobacz
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Paginacja -->
                ${this.renderPagination()}
            </div>
        `;
    }

    // =====================================
    // PAGINACJA
    // =====================================
    renderPagination() {
        if (!this.pagination || this.pagination.pages <= 1) return '';

        return `
            <div style="padding: 20px; display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #ecf0f1;">
                <div style="color: #7f8c8d;">
                    Strona ${this.currentPage + 1} z ${this.pagination.pages} 
                    (Łącznie: ${this.pagination.total} płatności)
                </div>
                <div style="display: flex; gap: 10px;">
                    <button ${this.currentPage === 0 ? 'disabled' : ''} 
                            onclick="financeDashboard.previousPage()"
                            style="padding: 8px 16px; background: ${this.currentPage === 0 ? '#ddd' : 'linear-gradient(135deg, #FFD700, #d4af37)'}; 
                                   color: #1a2332; border: none; border-radius: 6px; cursor: ${this.currentPage === 0 ? 'not-allowed' : 'pointer'}; font-weight: 600;">
                        ← Poprzednia
                    </button>
                    <button ${this.currentPage >= this.pagination.pages - 1 ? 'disabled' : ''} 
                            onclick="financeDashboard.nextPage()"
                            style="padding: 8px 16px; background: ${this.currentPage >= this.pagination.pages - 1 ? '#ddd' : 'linear-gradient(135deg, #FFD700, #d4af37)'}; 
                                   color: #1a2332; border: none; border-radius: 6px; cursor: ${this.currentPage >= this.pagination.pages - 1 ? 'not-allowed' : 'pointer'}; font-weight: 600;">
                        Następna →
                    </button>
                </div>
            </div>
        `;
    }

    // =====================================
    // AKCJE
    // =====================================
    async updateFilter(key, value) {
        this.filters[key] = value;
        this.currentPage = 0;
        await this.loadPayments();
        this.render();
    }

    async resetFilters() {
        this.filters = {
            status: '',
            client_id: '',
            date_from: '',
            date_to: '',
            payment_method: ''
        };
        this.currentPage = 0;
        await this.loadPayments();
        this.render();
    }

    async previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            await this.loadPayments();
            this.render();
        }
    }

    async nextPage() {
        if (this.currentPage < this.pagination.pages - 1) {
            this.currentPage++;
            await this.loadPayments();
            this.render();
        }
    }

    async viewPaymentDetails(paymentId, caseId) {
        // Otwórz szczegóły płatności (można użyć istniejącego modułu)
        if (window.paymentsModule) {
            paymentsModule.currentCaseId = caseId;
            await paymentsModule.viewPaymentDetails(paymentId);
        } else {
            alert('Moduł płatności nie jest załadowany');
        }
    }

    // =====================================
    // HELPER FUNCTIONS
    // =====================================
    renderStatusBadge(status) {
        const badges = {
            'pending': '<span style="background: #FFD700; color: #1a2332; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">⏳ Oczekująca</span>',
            'completed': '<span style="background: #2ecc71; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">✅ Opłacona</span>',
            'failed': '<span style="background: #e74c3c; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">❌ Nieudana</span>',
            'refunded': '<span style="background: #95a5a6; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">↩️ Zwrócona</span>'
        };
        return badges[status] || status;
    }

    renderPaymentMethod(method) {
        const methods = {
            'blik': '<span style="background: #e91e63; color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; white-space: nowrap;">📱 BLIK</span>',
            'paypal': '<span style="background: #0070ba; color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; white-space: nowrap;">💳 PayPal</span>',
            'card': '<span style="background: #6c5ce7; color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; white-space: nowrap;">💳 Karta</span>',
            'cash': '<span style="background: #27ae60; color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; white-space: nowrap;">💵 Gotówka</span>',
            'crypto': '<span style="background: #f39c12; color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; white-space: nowrap;">₿ Krypto</span>',
            'balance': '<span style="background: #9b59b6; color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; white-space: nowrap;">💰 Saldo</span>',
            'bank_transfer': '<span style="background: #34495e; color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; white-space: nowrap;">🏦 Przelew</span>'
        };
        return methods[method] || `<span style="color: #7f8c8d;">${method || '-'}</span>`;
    }

    formatMoney(amount) {
        return `${parseFloat(amount || 0).toFixed(2)} PLN`;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // =====================================
    // ŁADOWANIE FAKTUR/PARAGONÓW
    // =====================================
    async loadReceipts() {
        console.log('📄 Ładowanie faktur i paragonów...');
        
        const container = document.getElementById('receiptsContainer');
        if (!container) return;
        
        container.innerHTML = '<div style="text-align: center; padding: 40px;"><div style="font-size: 2rem;">⏳</div><p style="color: #64748b; font-weight: 600;">Ładowanie...</p></div>';
        
        try {
            const data = await api.request('/receipts');
            const receipts = data.receipts || [];
            
            console.log(`✅ Pobrano ${receipts.length} dokumentów`);
            
            if (receipts.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; color: #64748b;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">📄</div>
                        <h3 style="color: #1a2332; margin-bottom: 10px; font-weight: 700;">Brak dokumentów</h3>
                        <p style="color: #64748b; font-weight: 600;">Dokumenty będą generowane automatycznie po opłaceniu płatności</p>
                    </div>
                `;
                return;
            }
            
            // Tabela z fakturami
            container.innerHTML = `
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #FFD700 0%, #d4af37 100%);">
                                <th style="padding: 15px; text-align: left; color: #1a2332; font-weight: 700;">Numer</th>
                                <th style="padding: 15px; text-align: left; color: #1a2332; font-weight: 700;">Typ</th>
                                <th style="padding: 15px; text-align: left; color: #1a2332; font-weight: 700;">Klient</th>
                                <th style="padding: 15px; text-align: left; color: #1a2332; font-weight: 700;">Sprawa</th>
                                <th style="padding: 15px; text-align: right; color: #1a2332; font-weight: 700;">Kwota</th>
                                <th style="padding: 15px; text-align: center; color: #1a2332; font-weight: 700;">Data</th>
                                <th style="padding: 15px; text-align: center; color: #1a2332; font-weight: 700;">Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${receipts.map((receipt, index) => `
                                <tr style="border-bottom: 1px solid #ecf0f1; background: ${index % 2 === 0 ? 'white' : '#f8f9fa'};">
                                    <td style="padding: 12px; font-weight: 600; color: #1a2332;">${this.escapeHtml(receipt.receipt_number)}</td>
                                    <td style="padding: 12px;">
                                        ${receipt.receipt_type === 'invoice' 
                                            ? '<span style="background: #3B82F6; color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;">📄 Faktura</span>'
                                            : '<span style="background: #27ae60; color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;">📋 Paragon</span>'
                                        }
                                    </td>
                                    <td style="padding: 12px; color: #1a2332; font-weight: 600;">${this.escapeHtml(receipt.client_name || receipt.company_name || 'Brak')}</td>
                                    <td style="padding: 12px; color: #64748b; font-weight: 600;">${this.escapeHtml(receipt.case_number || '-')}</td>
                                    <td style="padding: 12px; text-align: right; font-weight: 700; color: #1a2332;">${this.formatMoney(receipt.gross_amount || receipt.amount)}</td>
                                    <td style="padding: 12px; text-align: center; color: #64748b; font-weight: 600;">${new Date(receipt.issue_date).toLocaleDateString('pl-PL')}</td>
                                    <td style="padding: 12px; text-align: center;">
                                        <button onclick="financeDashboard.viewReceiptDetails(${receipt.id})"
                                                style="padding: 6px 12px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; margin-right: 5px;">
                                            👁️ Zobacz
                                        </button>
                                        <button onclick="financeDashboard.downloadReceipt(${receipt.id})"
                                                style="padding: 6px 12px; background: linear-gradient(135deg, #27ae60, #229954); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                                            📥 Pobierz
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; font-weight: 600; color: #1a2332;">
                    <strong>Razem dokumentów:</strong> ${receipts.length} | 
                    <strong>Faktury:</strong> ${receipts.filter(r => r.receipt_type === 'invoice').length} | 
                    <strong>Paragony:</strong> ${receipts.filter(r => r.receipt_type === 'receipt').length}
                </div>
            `;
            
        } catch (error) {
            console.error('❌ Błąd ładowania faktur:', error);
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #e74c3c;">
                    <div style="font-size: 2rem; margin-bottom: 15px;">❌</div>
                    <h3 style="font-weight: 700;">Błąd ładowania</h3>
                    <p style="font-weight: 600;">${error.message}</p>
                </div>
            `;
        }
    }

    viewReceiptDetails(receiptId) {
        console.log('Szczegóły faktury:', receiptId);
        alert(`Szczegóły faktury ${receiptId} - w budowie`);
    }

    downloadReceipt(receiptId) {
        console.log('Pobieranie faktury:', receiptId);
        alert(`Pobieranie faktury ${receiptId} - w budowie (PDF generator)`);
    }

    // =====================================
    // ŁADOWANIE PROWIZJI Z FILTRAMI
    // =====================================
    async loadCommissions(status = null) {
        if (status) this.commissionStatusFilter = status;
        
        console.log(`👥 Ładowanie prowizji (status: ${this.commissionStatusFilter})...`);
        
        const container = document.getElementById('commissionsContainer');
        if (!container) return;
        
        container.innerHTML = '<div style="text-align: center; padding: 40px;"><div style="font-size: 2rem;">⏳</div><p style="color: #64748b; font-weight: 600;">Ładowanie...</p></div>';
        
        try {
            // Pobierz prowizje z NOWEGO API v2 z filtrem statusu
            let endpoint = '/commissions/v2/pending';
            
            // Dodaj parametr status do URL jeśli konkretny status
            if (this.commissionStatusFilter && this.commissionStatusFilter !== 'all') {
                endpoint = `/commissions/v2/pending?status=${this.commissionStatusFilter}`;
            }
            
            const response = await api.request(endpoint);
            let commissions = response.commissions || [];
            
            console.log(`✅ Pobrano ${commissions.length} prowizji (${this.commissionStatusFilter})`);
            
            if (commissions.length === 0) {
                const emptyMessages = {
                    pending: { emoji: '✅', title: 'Brak oczekujących prowizji', text: 'Wszystkie prowizje zostały przetworzone' },
                    approved: { emoji: '💰', title: 'Brak zatwierdzonych prowizji', text: 'Brak prowizji gotowych do wypłaty' },
                    paid: { emoji: '📊', title: 'Brak wypłaconych prowizji', text: 'Nie wypłacono jeszcze żadnych prowizji' },
                    rejected: { emoji: '🗑️', title: 'Brak odrzuconych prowizji', text: 'Nie odrzucono żadnych prowizji' }
                };
                const msg = emptyMessages[this.commissionStatusFilter] || emptyMessages.pending;
                
                container.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; color: #64748b; background: #f8f9fa; border-radius: 12px;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">${msg.emoji}</div>
                        <h3 style="color: #1a2332; margin-bottom: 10px; font-weight: 700;">${msg.title}</h3>
                        <p style="color: #64748b; font-weight: 600;">${msg.text}</p>
                    </div>
                `;
                return;
            }
            
            // Tabela z prowizjami
            container.innerHTML = `
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #FFD700 0%, #d4af37 100%);">
                                <th style="padding: 15px; text-align: left; color: #1a2332; font-weight: 700;">Pracownik</th>
                                <th style="padding: 15px; text-align: left; color: #1a2332; font-weight: 700;">Rola</th>
                                <th style="padding: 15px; text-align: left; color: #1a2332; font-weight: 700;">Płatność</th>
                                <th style="padding: 15px; text-align: left; color: #1a2332; font-weight: 700;">Klient</th>
                                <th style="padding: 15px; text-align: right; color: #1a2332; font-weight: 700;">Kwota płat.</th>
                                <th style="padding: 15px; text-align: right; color: #1a2332; font-weight: 700;">Stawka</th>
                                <th style="padding: 15px; text-align: right; color: #1a2332; font-weight: 700;">Prowizja</th>
                                <th style="padding: 15px; text-align: center; color: #1a2332; font-weight: 700;">Data</th>
                                <th style="padding: 15px; text-align: center; color: #1a2332; font-weight: 700;">Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${commissions.map((comm, index) => {
                                let actionButtons = '';
                                
                                if (comm.status === 'pending') {
                                    actionButtons = `
                                        <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                                            <button onclick="financeDashboard.showEditCommissionForm(${comm.id}, ${comm.commission_rate}, ${comm.commission_amount}, ${comm.payment_amount})"
                                                    style="padding: 6px 12px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                                                📝 Edytuj
                                            </button>
                                            <button onclick="financeDashboard.approveCommission(${comm.id})"
                                                    style="padding: 6px 12px; background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                                                ✅ Zatwierdź
                                            </button>
                                            <button onclick="financeDashboard.rejectCommission(${comm.id})"
                                                    style="padding: 6px 12px; background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                                                ❌ Odrzuć
                                            </button>
                                        </div>
                                    `;
                                } else if (comm.status === 'approved') {
                                    // Sprawdź czy płatność jest opłacona
                                    const paymentPaid = comm.payment_status === 'completed';
                                    
                                    if (paymentPaid) {
                                        actionButtons = `
                                            <button onclick="financeDashboard.payCommissionV2(${comm.id})"
                                                    style="padding: 6px 12px; background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                                                💰 Wypłać
                                            </button>
                                        `;
                                    } else {
                                        actionButtons = `
                                            <button disabled
                                                    title="Płatność od klienta nie jest opłacona (status: ${comm.payment_status || 'brak'}). Prowizję można wypłacić tylko gdy klient opłaci usługę."
                                                    style="padding: 6px 12px; background: #95a5a6; color: white; border: none; border-radius: 6px; cursor: not-allowed; font-size: 0.85rem; font-weight: 600;">
                                                🔒 Płatność nieopłacona
                                            </button>
                                            <div style="font-size: 0.7rem; color: #e74c3c; margin-top: 3px; font-weight: 600;">
                                                ⚠️ Status płatności: ${comm.payment_status || 'brak'}
                                            </div>
                                        `;
                                    }
                                } else if (comm.status === 'paid') {
                                    actionButtons = `
                                        <span style="color: #2ecc71; font-weight: 600; font-size: 0.85rem;">✅ Wypłacono</span>
                                        <div style="font-size: 0.75rem; color: #64748b; margin-top: 3px;">${comm.paid_at ? new Date(comm.paid_at).toLocaleDateString('pl-PL') : ''}</div>
                                    `;
                                } else if (comm.status === 'rejected') {
                                    actionButtons = `
                                        <span style="color: #e74c3c; font-weight: 600; font-size: 0.85rem;">❌ Odrzucono</span>
                                        ${comm.rejection_reason ? `<div style="font-size: 0.75rem; color: #64748b; margin-top: 3px;">${this.escapeHtml(comm.rejection_reason)}</div>` : ''}
                                    `;
                                }
                                
                                return `
                                    <tr style="border-bottom: 1px solid #ecf0f1; background: ${index % 2 === 0 ? 'white' : '#f8f9fa'};">
                                        <td style="padding: 12px; font-weight: 600; color: #1a2332;">${this.escapeHtml(comm.user_name || 'Nieznany')}</td>
                                        <td style="padding: 12px;">
                                            ${comm.user_role === 'lawyer' 
                                                ? '<span style="background: #3B82F6; color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;">⚖️ Mecenas</span>'
                                                : '<span style="background: #9b59b6; color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;">👤 Opiekun</span>'
                                            }
                                        </td>
                                        <td style="padding: 12px; color: #64748b; font-weight: 600;">${this.escapeHtml(comm.payment_code || '-')}</td>
                                        <td style="padding: 12px; color: #1a2332; font-weight: 600;">${this.escapeHtml(comm.client_name || '-')}</td>
                                        <td style="padding: 12px; text-align: right; font-weight: 600; color: #1a2332;">${this.formatMoney(comm.payment_amount)}</td>
                                        <td style="padding: 12px; text-align: right; font-weight: 700; color: #3B82F6;">${parseFloat(comm.commission_rate).toFixed(2)}%</td>
                                        <td style="padding: 12px; text-align: right; font-weight: 700; color: #2ecc71; font-size: 1.1rem;">${this.formatMoney(comm.commission_amount)}</td>
                                        <td style="padding: 12px; text-align: center; color: #64748b; font-weight: 600;">${new Date(comm.created_at).toLocaleDateString('pl-PL')}</td>
                                        <td style="padding: 12px; text-align: center;">
                                            ${actionButtons}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; font-weight: 600; color: #1a2332;">
                    <strong>Suma:</strong> ${this.formatMoney(commissions.reduce((sum, c) => sum + parseFloat(c.commission_amount), 0))}
                </div>
            `;
            
        } catch (error) {
            console.error('❌ Błąd ładowania prowizji:', error);
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #e74c3c;">
                    <div style="font-size: 2rem; margin-bottom: 15px;">❌</div>
                    <h3 style="font-weight: 700;">Błąd ładowania</h3>
                    <p style="font-weight: 600;">${error.message}</p>
                </div>
            `;
        }
    }

    // =====================================
    // FILTROWANIE PROWIZJI WEDŁUG STATUSU
    // =====================================
    filterCommissionsByStatus(status) {
        console.log(`🔄 Filtrowanie prowizji: ${status}`);
        
        // Aktualizuj kolory zakładek
        ['pending', 'approved', 'paid', 'rejected'].forEach(s => {
            const tab = document.getElementById(`tab-${s}`);
            if (tab) {
                if (s === status) {
                    tab.style.background = s === 'pending' ? '#f39c12' : s === 'approved' ? '#2ecc71' : s === 'paid' ? '#9b59b6' : '#e74c3c';
                    tab.classList.add('active');
                } else {
                    tab.style.background = '#95a5a6';
                    tab.classList.remove('active');
                }
            }
        });
        
        // Załaduj prowizje
        this.loadCommissions(status);
    }

    // =====================================
    // ZATWIERDZANIE PROWIZJI
    // =====================================
    async approveCommission(commissionId) {
        if (!confirm('Czy na pewno chcesz zatwierdzić tę prowizję?')) return;
        
        try {
            const response = await api.request(`/commissions/${commissionId}/approve`, {
                method: 'POST'
            });
            
            if (response.success) {
                alert('✅ Prowizja zatwierdzona pomyślnie!');
                await this.loadCommissions(); // Odśwież listę
            }
            
        } catch (error) {
            console.error('❌ Błąd zatwierdzania prowizji:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    // =====================================
    // ODRZUCANIE PROWIZJI
    // =====================================
    async rejectCommission(commissionId) {
        const reason = prompt('Podaj powód odrzucenia prowizji (opcjonalnie):');
        if (reason === null) return; // Anulowano
        
        try {
            const response = await api.request(`/commissions/${commissionId}/reject`, {
                method: 'POST',
                body: JSON.stringify({
                    reason: reason || 'Odrzucona przez administratora'
                })
            });
            
            if (response.success) {
                alert('❌ Prowizja odrzucona');
                await this.loadCommissions(); // Odśwież listę
            }
            
        } catch (error) {
            console.error('❌ Błąd odrzucania prowizji:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    // =====================================
    // EDYCJA PROWIZJI (PRZED ZATWIERDZENIEM)
    // =====================================
    showEditCommissionForm(commissionId, currentRate, currentAmount, paymentAmount) {
        const modal = document.createElement('div');
        modal.id = 'editCommissionModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;';
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 500px; width: 90%;">
                <h2 style="margin: 0 0 20px 0; color: #1a2332;">📝 Edycja prowizji</h2>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 10px;">Aktualne wartości:</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                        <div>
                            <div style="font-size: 0.85rem; color: #64748b;">Płatność:</div>
                            <div style="font-size: 1rem; color: #1a2332; font-weight: 600;">${parseFloat(paymentAmount).toFixed(2)} PLN</div>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: #64748b;">Stawka:</div>
                            <div style="font-size: 1.2rem; color: #3B82F6; font-weight: 700;">${parseFloat(currentRate).toFixed(2)}%</div>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: #64748b;">Kwota:</div>
                            <div style="font-size: 1.2rem; color: #2ecc71; font-weight: 700;">${parseFloat(currentAmount).toFixed(2)} PLN</div>
                        </div>
                    </div>
                </div>
                
                <form id="editCommissionForm" onsubmit="financeDashboard.submitCommissionEdit(event, ${commissionId}); return false;">
                    <input type="hidden" name="payment_amount" value="${paymentAmount}">
                    
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #2c3e50;">Nowa stawka (%) *</label>
                        <input type="number" id="commission_rate_input" name="commission_rate" step="0.01" min="0" max="100" 
                               value="${parseFloat(currentRate).toFixed(2)}"
                               required 
                               oninput="financeDashboard.calculateCommissionAmount()"
                               style="width: 100%; padding: 10px; border: 2px solid #3B82F6; border-radius: 6px; font-size: 1rem;">
                        <small style="color: #64748b; display: block; margin-top: 5px;">
                            💡 Kwota obliczy się automatycznie
                        </small>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #2c3e50;">Nowa kwota (PLN) *</label>
                        <input type="number" id="commission_amount_input" name="commission_amount" step="0.01" min="0" 
                               value="${parseFloat(currentAmount).toFixed(2)}"
                               required 
                               style="width: 100%; padding: 10px; border: 2px solid #2ecc71; border-radius: 6px; font-size: 1rem;">
                        <small style="color: #64748b; display: block; margin-top: 5px;">
                            ✏️ Można też ręcznie edytować
                        </small>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #2c3e50;">Powód edycji *</label>
                        <textarea name="edit_reason" rows="3" required 
                                  placeholder="Np. Korekta stawki zgodnie z nową umową..."
                                  style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; resize: vertical;"></textarea>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 12px; border-radius: 6px; border-left: 4px solid #ffc107; margin-bottom: 20px; font-size: 0.9rem;">
                        <strong style="color: #856404;">⚠️ Uwaga:</strong>
                        <p style="margin: 5px 0 0 0; color: #856404;">
                            Zmiany są zapisywane w historii prowizji. Po edycji prowizję nadal trzeba zatwierdzić.
                        </p>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem;">
                            ✅ Zapisz zmiany
                        </button>
                        <button type="button" onclick="document.getElementById('editCommissionModal').remove()" 
                                style="flex: 1; padding: 12px; background: #e0e0e0; color: #333; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            ❌ Anuluj
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Automatyczne przeliczanie kwoty prowizji
    calculateCommissionAmount() {
        const rateInput = document.getElementById('commission_rate_input');
        const amountInput = document.getElementById('commission_amount_input');
        const form = document.getElementById('editCommissionForm');
        
        if (!rateInput || !amountInput || !form) return;
        
        const paymentAmount = parseFloat(form.querySelector('[name="payment_amount"]').value);
        const rate = parseFloat(rateInput.value);
        
        if (!isNaN(paymentAmount) && !isNaN(rate)) {
            const commissionAmount = (paymentAmount * rate) / 100;
            amountInput.value = commissionAmount.toFixed(2);
            
            // Dodaj wizualną animację
            amountInput.style.background = '#d4edda';
            setTimeout(() => {
                amountInput.style.background = '';
            }, 500);
        }
    }
    
    async submitCommissionEdit(event, commissionId) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        const data = {
            commission_rate: parseFloat(formData.get('commission_rate')),
            commission_amount: parseFloat(formData.get('commission_amount')),
            edit_reason: formData.get('edit_reason')
        };
        
        console.log('📝 Edycja prowizji:', data);
        
        try {
            const response = await fetch(`/api/commissions/${commissionId}/edit`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Błąd edycji prowizji');
            }
            
            const result = await response.json();
            
            // Zamknij modal
            document.getElementById('editCommissionModal').remove();
            
            alert(`✅ Prowizja zaktualizowana!\n\nStara stawka: ${result.old_rate}%\nNowa stawka: ${result.new_rate}%\n\nStara kwota: ${result.old_amount} PLN\nNowa kwota: ${result.new_amount} PLN`);
            
            // Odśwież listę
            this.loadCommissions();
            
        } catch (error) {
            console.error('❌ Błąd edycji prowizji:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    // =====================================
    // WYPŁATA PROWIZJI (TYLKO APPROVED!)
    // =====================================
    async payoutCommission(commissionId) {
        if (!confirm('Czy na pewno chcesz wypłacić tę prowizję?\n\nProwizja musi być zatwierdzona!')) return;
        
        try {
            const response = await fetch(`/api/commissions/${commissionId}/pay`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    payment_method: 'bank_transfer',
                    notes: 'Wypłata z Finance Dashboard'
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || error.message || 'Błąd wypłaty prowizji');
            }
            
            alert('✅ Prowizja wypłacona pomyślnie!');
            this.loadCommissions(); // Odśwież listę
            
        } catch (error) {
            console.error('❌ Błąd wypłaty prowizji:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    // =====================================
    // ŁADOWANIE WYPŁAT PRACOWNIKÓW
    // =====================================
    async loadSalaries() {
        console.log('💼 Ładowanie wypłat pracowników...');
        
        const container = document.getElementById('salariesContainer');
        if (!container) return;
        
        container.innerHTML = '<div style="text-align: center; padding: 40px;"><div style="font-size: 2rem;">⏳</div><p style="color: #64748b; font-weight: 600;">Ładowanie...</p></div>';
        
        try {
            // Pobierz wypłaty oczekujące i statystyki
            const [pendingData, statsData] = await Promise.all([
                api.request('/employee-payments/pending'),
                api.request('/employee-payments/stats')
            ]);
            
            const payments = pendingData.payments || [];
            const stats = statsData || {};
            
            console.log(`✅ Pobrano ${payments.length} wypłat do zrealizowania`);
            
            // Statystyki
            const statsHtml = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    <div style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); padding: 20px; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);">
                        <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">⏳ Oczekujące</div>
                        <div style="font-size: 2rem; font-weight: 700;">${stats.pending_count || 0}</div>
                        <div style="font-size: 1.1rem; margin-top: 5px;">${this.formatMoney(stats.pending_total || 0)}</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 20px; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);">
                        <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">✅ Wypłacone (miesiąc)</div>
                        <div style="font-size: 2rem; font-weight: 700;">${stats.paid_this_month_count || 0}</div>
                        <div style="font-size: 1.1rem; margin-top: 5px;">${this.formatMoney(stats.paid_this_month || 0)}</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); padding: 20px; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(155, 89, 182, 0.3);">
                        <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">📊 Razem (rok)</div>
                        <div style="font-size: 2rem; font-weight: 700;">${stats.paid_this_year_count || 0}</div>
                        <div style="font-size: 1.1rem; margin-top: 5px;">${this.formatMoney(stats.paid_this_year || 0)}</div>
                    </div>
                </div>
            `;
            
            if (payments.length === 0) {
                container.innerHTML = statsHtml + `
                    <div style="text-align: center; padding: 60px 20px; color: #64748b; background: #f8f9fa; border-radius: 12px;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">✅</div>
                        <h3 style="color: #1a2332; margin-bottom: 10px; font-weight: 700;">Brak oczekujących wypłat</h3>
                        <p style="color: #64748b; font-weight: 600;">Wszystkie wypłaty zostały zrealizowane</p>
                    </div>
                `;
                return;
            }
            
            // Tabela z wypłatami
            container.innerHTML = statsHtml + `
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #FFD700 0%, #d4af37 100%);">
                                <th style="padding: 15px; text-align: left; color: #1a2332; font-weight: 700;">Pracownik</th>
                                <th style="padding: 15px; text-align: left; color: #1a2332; font-weight: 700;">Typ</th>
                                <th style="padding: 15px; text-align: left; color: #1a2332; font-weight: 700;">Opis</th>
                                <th style="padding: 15px; text-align: center; color: #1a2332; font-weight: 700;">Okres</th>
                                <th style="padding: 15px; text-align: right; color: #1a2332; font-weight: 700;">Kwota</th>
                                <th style="padding: 15px; text-align: center; color: #1a2332; font-weight: 700;">Data utworzenia</th>
                                <th style="padding: 15px; text-align: center; color: #1a2332; font-weight: 700;">Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${payments.map((payment, index) => {
                                const typeLabel = payment.payment_type === 'salary' ? '💰 Pensja' 
                                    : payment.payment_type === 'bonus' ? '🎁 Premia'
                                    : '💸 Prowizja';
                                const typeColor = payment.payment_type === 'salary' ? '#3B82F6' 
                                    : payment.payment_type === 'bonus' ? '#2ecc71'
                                    : '#9b59b6';
                                    
                                return `
                                    <tr style="border-bottom: 1px solid #ecf0f1; background: ${index % 2 === 0 ? 'white' : '#f8f9fa'};">
                                        <td style="padding: 12px; font-weight: 600; color: #1a2332;">${this.escapeHtml(payment.employee_name || 'Nieznany')}</td>
                                        <td style="padding: 12px;">
                                            <span style="background: ${typeColor}; color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;">${typeLabel}</span>
                                        </td>
                                        <td style="padding: 12px; color: #64748b; font-weight: 600;">${this.escapeHtml(payment.description || '-')}</td>
                                        <td style="padding: 12px; text-align: center; color: #1a2332; font-weight: 600;">
                                            ${payment.period_month && payment.period_year ? `${payment.period_month}/${payment.period_year}` : '-'}
                                        </td>
                                        <td style="padding: 12px; text-align: right; font-weight: 700; color: #2ecc71; font-size: 1.1rem;">${this.formatMoney(payment.amount)}</td>
                                        <td style="padding: 12px; text-align: center; color: #64748b; font-weight: 600;">${new Date(payment.created_at).toLocaleDateString('pl-PL')}</td>
                                        <td style="padding: 12px; text-align: center;">
                                            <button onclick="financeDashboard.paySalary(${payment.id})"
                                                    style="padding: 6px 12px; background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                                                💰 Wypłać
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; font-weight: 600; color: #1a2332;">
                    <strong>Suma do wypłaty:</strong> ${this.formatMoney(payments.reduce((sum, p) => sum + parseFloat(p.amount), 0))}
                </div>
            `;
            
        } catch (error) {
            console.error('❌ Błąd ładowania wypłat:', error);
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #e74c3c;">
                    <div style="font-size: 2rem; margin-bottom: 15px;">❌</div>
                    <h3 style="font-weight: 700;">Błąd ładowania</h3>
                    <p style="font-weight: 600;">${error.message}</p>
                </div>
            `;
        }
    }

    async paySalary(paymentId) {
        if (!confirm('Czy na pewno chcesz oznaczyć tę wypłatę jako zrealizowaną?')) return;
        
        try {
            const response = await fetch(`/api/employee-payments/${paymentId}/pay`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    transaction_reference: `PAY-${paymentId}-${Date.now()}`,
                    notes: 'Wypłata zrealizowana z Finance Dashboard'
                })
            });
            
            if (!response.ok) throw new Error('Błąd wypłaty');
            
            alert('✅ Wypłata zrealizowana pomyślnie!');
            this.loadSalaries(); // Odśwież listę
            
        } catch (error) {
            console.error('❌ Błąd wypłaty:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    showAddPaymentForm() {
        alert('Formularz dodawania wypłaty - w budowie\n\nW pełnej wersji będzie:\n- Wybór pracownika\n- Typ wypłaty (pensja/premia/prowizja)\n- Kwota\n- Okres\n- Opis');
    }

    // =====================================
    // ZARZĄDZANIE STAWKAMI PROWIZJI
    // =====================================
    
    async loadCommissionRates() {
        console.log('📊 Ładowanie stawek prowizji...');
        
        const container = document.getElementById('commissionRatesContainer');
        if (!container) return;
        
        container.innerHTML = '<div style="text-align: center; padding: 40px;"><div style="font-size: 2rem;">⏳</div><p style="color: #64748b; font-weight: 600;">Ładowanie...</p></div>';
        
        try {
            const data = await api.request('/hr-compensation/employees');
            const employees = data.employees || [];
            
            console.log(`✅ Pobrano ${employees.length} pracowników`);
            
            // Sprawdź czy użytkownik to Admin - pokaż zakładki
            const userRole = localStorage.getItem('userRole');
            if (userRole === 'admin') {
                const ratesTabs = document.getElementById('ratesTabs');
                if (ratesTabs) ratesTabs.style.display = 'block';
            }
            
            this.renderEmployeesRates(employees);
            
        } catch (error) {
            console.error('❌ Błąd ładowania stawek:', error);
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #e74c3c;">
                    <div style="font-size: 2rem; margin-bottom: 15px;">❌</div>
                    <h3 style="font-weight: 700;">Błąd ładowania</h3>
                    <p style="font-weight: 600;">${error.message}</p>
                </div>
            `;
        }
    }
    
    renderEmployeesRates(employees) {
        const container = document.getElementById('commissionRatesContainer');
        if (!container) return;
        
        if (employees.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #64748b; background: #f8f9fa; border-radius: 12px;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">👥</div>
                    <h3 style="color: #1a2332; margin-bottom: 10px; font-weight: 700;">Brak pracowników</h3>
                    <p style="color: #64748b; font-weight: 600;">Nie znaleziono pracowników w systemie</p>
                </div>
            `;
            return;
        }
        
        const userRole = localStorage.getItem('userRole');
        const canEdit = ['admin', 'hr'].includes(userRole);
        
        container.innerHTML = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: linear-gradient(135deg, #FFD700 0%, #d4af37 100%);">
                            <th style="padding: 15px; text-align: left; color: #1a2332; font-weight: 700;">Pracownik</th>
                            <th style="padding: 15px; text-align: left; color: #1a2332; font-weight: 700;">Rola</th>
                            <th style="padding: 15px; text-align: center; color: #1a2332; font-weight: 700;">Wynagrodzenie</th>
                            <th style="padding: 15px; text-align: center; color: #1a2332; font-weight: 700;">Prowizje</th>
                            <th style="padding: 15px; text-align: center; color: #1a2332; font-weight: 700;">Stawka prowizji</th>
                            <th style="padding: 15px; text-align: center; color: #1a2332; font-weight: 700;">Ostatnia zmiana</th>
                            ${canEdit ? '<th style="padding: 15px; text-align: center; color: #1a2332; font-weight: 700;">Akcje</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${employees.map((emp, index) => {
                            const roleLabel = emp.user_role === 'lawyer' ? '⚖️ Mecenas' 
                                : emp.user_role === 'case_manager' ? '👔 Opiekun sprawy'
                                : emp.user_role === 'client_manager' ? '👤 Opiekun klienta'
                                : emp.user_role === 'hr' ? '👥 HR'
                                : emp.user_role === 'finance' ? '💰 Finance'
                                : '👤 ' + emp.user_role;
                            
                            const commissionEnabled = emp.commission_enabled ? '✅ Tak' : '❌ Nie';
                            const commissionEnabledColor = emp.commission_enabled ? '#2ecc71' : '#e74c3c';
                            
                            return `
                                <tr style="border-bottom: 1px solid #ecf0f1; background: ${index % 2 === 0 ? 'white' : '#f8f9fa'};">
                                    <td style="padding: 12px; font-weight: 600; color: #1a2332;">${this.escapeHtml(emp.name)}</td>
                                    <td style="padding: 12px;">
                                        <span style="background: #3B82F6; color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;">
                                            ${roleLabel}
                                        </span>
                                    </td>
                                    <td style="padding: 12px; text-align: center; font-weight: 600; color: #1a2332;">
                                        ${emp.base_salary ? this.formatMoney(emp.base_salary) + ' ' + (emp.currency || 'PLN') : '-'}
                                    </td>
                                    <td style="padding: 12px; text-align: center;">
                                        <span style="color: ${commissionEnabledColor}; font-weight: 700; font-size: 0.9rem;">${commissionEnabled}</span>
                                    </td>
                                    <td style="padding: 12px; text-align: center;">
                                        <span style="font-weight: 700; color: #3B82F6; font-size: 1.1rem;">
                                            ${emp.default_commission_rate ? parseFloat(emp.default_commission_rate).toFixed(2) + '%' : '-'}
                                        </span>
                                    </td>
                                    <td style="padding: 12px; text-align: center; color: #64748b; font-size: 0.85rem; font-weight: 600;">
                                        ${emp.updated_at ? new Date(emp.updated_at).toLocaleDateString('pl-PL') : '-'}
                                    </td>
                                    ${canEdit ? `
                                        <td style="padding: 12px; text-align: center;">
                                            <button onclick="financeDashboard.showEditRateForm(${emp.id}, '${this.escapeHtml(emp.name)}', ${emp.default_commission_rate || 0})"
                                                    style="padding: 6px 12px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                                                📝 Edytuj
                                            </button>
                                        </td>
                                    ` : ''}
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    showEditRateForm(userId, userName, currentRate) {
        const modal = document.createElement('div');
        modal.id = 'editRateModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;';
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <h2 style="margin: 0 0 20px 0; color: #1a2332;">📝 Zmiana stawki prowizji</h2>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px;">Pracownik:</div>
                    <div style="font-size: 1.1rem; color: #3B82F6; font-weight: 700;">${userName}</div>
                </div>
                
                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3B82F6;">
                    <div style="font-weight: 600; color: #1565c0; margin-bottom: 5px;">Aktualna stawka:</div>
                    <div style="font-size: 1.5rem; color: #3B82F6; font-weight: 700;">${currentRate}%</div>
                </div>
                
                <form id="editRateForm" onsubmit="financeDashboard.submitRateChange(event, ${userId}); return false;">
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #2c3e50;">Nowa stawka (%) *</label>
                        <input type="number" name="new_rate" step="0.01" min="0" max="100" required 
                               placeholder="np. 18.00"
                               style="width: 100%; padding: 10px; border: 2px solid #3B82F6; border-radius: 6px; font-size: 1rem;">
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #2c3e50;">Powód zmiany *</label>
                        <select name="change_reason" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                            <option value="">Wybierz powód...</option>
                            <option value="Awans">Awans</option>
                            <option value="Doskonałe wyniki">Doskonałe wyniki</option>
                            <option value="Zwiększona odpowiedzialność">Zwiększona odpowiedzialność</option>
                            <option value="Słabe wyniki">Słabe wyniki</option>
                            <option value="Zmniejszenie obowiązków">Zmniejszenie obowiązków</option>
                            <option value="Korekta stawki">Korekta stawki</option>
                            <option value="Inne">Inne</option>
                        </select>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #2c3e50;">Komentarz *</label>
                        <textarea name="comment" rows="4" required 
                                  placeholder="Szczegółowe uzasadnienie zmiany stawki prowizji..."
                                  style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; resize: vertical;"></textarea>
                        <small style="color: #64748b; display: block; margin-top: 5px;">
                            Opisz powód zmiany, osiągnięcia lub inne okoliczności
                        </small>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #2c3e50;">Data wejścia w życie</label>
                        <input type="date" name="effective_date"
                               value="${new Date().toISOString().split('T')[0]}"
                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
                        <strong style="color: #856404;">⚠️ Uwaga:</strong>
                        <p style="margin: 5px 0 0 0; color: #856404; font-size: 0.9rem;">
                            ${localStorage.getItem('userRole') === 'admin' 
                                ? 'Jako Admin, zmiana zostanie zatwierdzona automatycznie i wejdzie w życie natychmiast.' 
                                : 'Wniosek zostanie wysłany do zatwierdzenia przez Admina. Zmiana wejdzie w życie po zatwierdzeniu.'}
                        </p>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem;">
                            ✅ Zatwierdź zmianę
                        </button>
                        <button type="button" onclick="document.getElementById('editRateModal').remove()" 
                                style="flex: 1; padding: 12px; background: #e0e0e0; color: #333; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            ❌ Anuluj
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    async submitRateChange(event, userId) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        const data = {
            new_rate: parseFloat(formData.get('new_rate')),
            change_reason: formData.get('change_reason'),
            comment: formData.get('comment'),
            effective_date: formData.get('effective_date')
        };
        
        console.log('📝 Wysyłanie zmiany stawki:', data);
        
        try {
            const response = await fetch(`/api/hr-compensation/employees/${userId}/commission-rate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Błąd zmiany stawki');
            }
            
            const result = await response.json();
            
            // Zamknij modal
            document.getElementById('editRateModal').remove();
            
            // Pokaż komunikat
            if (result.status === 'approved') {
                alert(`✅ Stawka prowizji zmieniona pomyślnie!\n\nStara stawka: ${result.old_rate}%\nNowa stawka: ${result.new_rate}%\n\nZmiana weszła w życie natychmiast.`);
            } else {
                alert(`🟡 Wniosek o zmianę stawki został wysłany!\n\nStara stawka: ${result.old_rate}%\nProponowana stawka: ${result.new_rate}%\n\nOczekuje na zatwierdzenie przez Admina.`);
            }
            
            // Odśwież listę
            this.loadCommissionRates();
            
        } catch (error) {
            console.error('❌ Błąd zmiany stawki:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }
    
    switchRatesView(view) {
        console.log('🔄 Przełączanie widoku:', view);
        
        // Aktualizuj kolory zakładek
        const employeesTab = document.getElementById('rates-tab-employees');
        const pendingTab = document.getElementById('rates-tab-pending');
        
        if (employeesTab && pendingTab) {
            if (view === 'employees') {
                employeesTab.style.background = '#3B82F6';
                pendingTab.style.background = '#95a5a6';
                this.loadCommissionRates();
            } else if (view === 'pending') {
                employeesTab.style.background = '#95a5a6';
                pendingTab.style.background = '#f39c12';
                this.loadPendingRateChanges();
            }
        }
    }
    
    async loadPendingRateChanges() {
        console.log('🟡 Ładowanie oczekujących zmian stawek...');
        
        const container = document.getElementById('commissionRatesContainer');
        if (!container) return;
        
        container.innerHTML = '<div style="text-align: center; padding: 40px;"><div style="font-size: 2rem;">⏳</div><p style="color: #64748b; font-weight: 600;">Ładowanie...</p></div>';
        
        try {
            const data = await api.request('/hr-compensation/rate-changes/pending');
            const changes = data.pendingChanges || [];
            
            console.log(`✅ Pobrano ${changes.length} oczekujących zmian`);
            
            if (changes.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; color: #64748b; background: #f8f9fa; border-radius: 12px;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">✅</div>
                        <h3 style="color: #1a2332; margin-bottom: 10px; font-weight: 700;">Brak oczekujących wniosków</h3>
                        <p style="color: #64748b; font-weight: 600;">Wszystkie wnioski zostały przetworzone</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = `
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);">
                                <th style="padding: 15px; text-align: left; color: white; font-weight: 700;">Pracownik</th>
                                <th style="padding: 15px; text-align: left; color: white; font-weight: 700;">Rola</th>
                                <th style="padding: 15px; text-align: center; color: white; font-weight: 700;">Stara stawka</th>
                                <th style="padding: 15px; text-align: center; color: white; font-weight: 700;">Nowa stawka</th>
                                <th style="padding: 15px; text-align: left; color: white; font-weight: 700;">Powód</th>
                                <th style="padding: 15px; text-align: left; color: white; font-weight: 700;">Wnioskodawca</th>
                                <th style="padding: 15px; text-align: center; color: white; font-weight: 700;">Data</th>
                                <th style="padding: 15px; text-align: center; color: white; font-weight: 700;">Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${changes.map((change, index) => `
                                <tr style="border-bottom: 1px solid #ecf0f1; background: ${index % 2 === 0 ? 'white' : '#f8f9fa'};">
                                    <td style="padding: 12px; font-weight: 600; color: #1a2332;">${this.escapeHtml(change.user_name)}</td>
                                    <td style="padding: 12px;">
                                        <span style="background: #3B82F6; color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;">
                                            ${change.user_role}
                                        </span>
                                    </td>
                                    <td style="padding: 12px; text-align: center; font-weight: 700; color: #e74c3c; font-size: 1rem;">
                                        ${parseFloat(change.old_rate).toFixed(2)}%
                                    </td>
                                    <td style="padding: 12px; text-align: center; font-weight: 700; color: #2ecc71; font-size: 1rem;">
                                        ${parseFloat(change.new_rate).toFixed(2)}%
                                    </td>
                                    <td style="padding: 12px; color: #1a2332; font-weight: 600;">
                                        ${this.escapeHtml(change.change_reason)}<br>
                                        <small style="color: #64748b;">${this.escapeHtml(change.comment || '')}</small>
                                    </td>
                                    <td style="padding: 12px; color: #64748b; font-weight: 600;">
                                        ${this.escapeHtml(change.changed_by_name)}<br>
                                        <small>${change.changed_by_department}</small>
                                    </td>
                                    <td style="padding: 12px; text-align: center; color: #64748b; font-size: 0.85rem; font-weight: 600;">
                                        ${new Date(change.created_at).toLocaleDateString('pl-PL')}
                                    </td>
                                    <td style="padding: 12px; text-align: center;">
                                        <button onclick="financeDashboard.approveRateChange(${change.id})"
                                                style="padding: 6px 12px; background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; margin-right: 5px;">
                                            ✅ Zatwierdź
                                        </button>
                                        <button onclick="financeDashboard.rejectRateChange(${change.id})"
                                                style="padding: 6px 12px; background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                                            ❌ Odrzuć
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            
        } catch (error) {
            console.error('❌ Błąd ładowania oczekujących zmian:', error);
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #e74c3c;">
                    <div style="font-size: 2rem; margin-bottom: 15px;">❌</div>
                    <h3 style="font-weight: 700;">Błąd ładowania</h3>
                    <p style="font-weight: 600;">${error.message}</p>
                </div>
            `;
        }
    }
    
    async approveRateChange(changeId) {
        if (!confirm('Czy na pewno chcesz zatwierdzić tę zmianę stawki?')) return;
        
        try {
            const response = await fetch(`/api/hr-compensation/rate-changes/${changeId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Błąd zatwierdzania zmiany');
            }
            
            const result = await response.json();
            
            alert(`✅ Zmiana stawki zatwierdzona!\n\nStara stawka: ${result.old_rate}%\nNowa stawka: ${result.new_rate}%\n\nZmiana weszła w życie.`);
            
            // Odśwież listę
            this.loadPendingRateChanges();
            
        } catch (error) {
            console.error('❌ Błąd zatwierdzania zmiany:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }
    
    async rejectRateChange(changeId) {
        const reason = prompt('Podaj powód odrzucenia zmiany stawki:');
        if (reason === null) return; // Anulowano
        
        if (!reason.trim()) {
            alert('❌ Musisz podać powód odrzucenia!');
            return;
        }
        
        try {
            const response = await fetch(`/api/hr-compensation/rate-changes/${changeId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rejection_reason: reason
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Błąd odrzucania zmiany');
            }
            
            alert('❌ Zmiana stawki odrzucona');
            
            // Odśwież listę
            this.loadPendingRateChanges();
            
        } catch (error) {
            console.error('❌ Błąd odrzucania zmiany:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    // =====================================
    // POKAŻ PRZETERMINOWANE PŁATNOŚCI
    // =====================================
    async showOverduePayments() {
        try {
            console.log('🔴 Ładowanie przeterminowanych płatności...');
            
            // Pobierz wszystkie płatności z filtrem przeterminowanych
            const response = await api.request('/payments/all?status=pending');
            const allPayments = response.payments || [];
            
            // Filtruj przeterminowane
            const now = new Date();
            const overduePayments = allPayments.filter(p => 
                p.status === 'pending' && 
                p.due_date && 
                new Date(p.due_date) < now
            );
            
            console.log('🔴 Znaleziono przeterminowanych:', overduePayments.length);
            
            if (overduePayments.length === 0) {
                alert('✅ Brak przeterminowanych płatności!');
                return;
            }
            
            // Sortuj według daty (najpóźniejsze najpierw)
            overduePayments.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
            
            // Utwórz modal
            const modal = this.createModal('overduePaymentsModal', `
                <div style="max-width: 1200px; margin: 0 auto;">
                    <h2 style="margin-bottom: 20px; color: #e74c3c;">🔴 Przeterminowane płatności (${overduePayments.length})</h2>
                    
                    <div style="background: #fee; border-left: 4px solid #e74c3c; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <strong style="color: #c0392b;">⚠️ Uwaga!</strong>
                        <div style="color: #c0392b; margin-top: 5px;">
                            Te płatności przekroczyły termin. Możesz wysłać przypomnienie do klienta.
                        </div>
                    </div>
                    
                    <div style="max-height: 600px; overflow-y: auto;">
                        ${overduePayments.map(payment => {
                            const dueDate = new Date(payment.due_date);
                            const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
                            
                            return `
                                <div style="background: linear-gradient(135deg, #fee 0%, #fdd 100%); border: 3px solid #e74c3c; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                                        <div style="flex: 1;">
                                            <div style="font-weight: 700; font-size: 1.1rem; color: #c0392b; margin-bottom: 5px;">
                                                ⚠️ ${this.escapeHtml(payment.payment_code)}
                                            </div>
                                            <div style="color: #666; font-size: 0.9rem;">
                                                <strong>Sprawa:</strong> ${this.escapeHtml(payment.case_number || '-')} - ${this.escapeHtml(payment.case_title || '')}
                                            </div>
                                            <div style="color: #666; font-size: 0.9rem;">
                                                <strong>Klient:</strong> ${this.escapeHtml(payment.company_name || payment.client_name || '-')}
                                            </div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-weight: 700; font-size: 1.5rem; color: #e74c3c;">
                                                ${this.formatMoney(payment.amount)}
                                            </div>
                                            <div style="font-size: 0.85rem; color: #c0392b; margin-top: 5px;">
                                                ⏰ Opóźnienie: <strong>${daysOverdue} dni</strong>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px; padding: 10px; background: rgba(255,255,255,0.5); border-radius: 6px;">
                                        <div>
                                            <div style="font-size: 0.8rem; color: #999;">Typ płatności</div>
                                            <div style="font-weight: 600; color: #1a2332;">${payment.payment_type || '-'}</div>
                                        </div>
                                        <div>
                                            <div style="font-size: 0.8rem; color: #999;">Termin płatności</div>
                                            <div style="font-weight: 600; color: #e74c3c;">${dueDate.toLocaleDateString('pl-PL')}</div>
                                        </div>
                                        <div>
                                            <div style="font-size: 0.8rem; color: #999;">Utworzona</div>
                                            <div style="font-weight: 600; color: #666;">${new Date(payment.created_at).toLocaleDateString('pl-PL')}</div>
                                        </div>
                                    </div>
                                    
                                    <div style="display: flex; gap: 10px;">
                                        <button onclick="financeDashboard.sendReminder(${payment.id})" 
                                                style="flex: 1; padding: 12px; background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.95rem;">
                                            📧 Wyślij przypomnienie
                                        </button>
                                        <button onclick="financeDashboard.viewPaymentDetails(${payment.id}, ${payment.case_id}); financeDashboard.closeModal('overduePaymentsModal')" 
                                                style="padding: 12px 20px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                            👁️ Zobacz szczegóły
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="financeDashboard.closeModal('overduePaymentsModal')" 
                                style="padding: 12px 30px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            ❌ Zamknij
                        </button>
                    </div>
                </div>
            `);
            
            document.body.appendChild(modal);
            modal.classList.add('active');
            
        } catch (error) {
            console.error('❌ Błąd ładowania przeterminowanych:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    // =====================================
    // WYŚLIJ PRZYPOMNIENIE
    // =====================================
    async sendReminder(paymentId) {
        const confirmed = confirm('📧 Wysłać przypomnienie o płatności do klienta?\n\nKlient otrzyma:\n• Email z przypomnieniem\n• Powiadomienie w aplikacji');
        
        if (!confirmed) return;

        try {
            const response = await api.request(`/payments/${paymentId}/send-reminder`, {
                method: 'POST'
            });

            if (response.success) {
                alert(`✅ Przypomnienie wysłane!\n\n📧 Email: ${response.email_sent ? 'TAK' : 'NIE'}\n🔔 Powiadomienie: ${response.notification_sent ? 'TAK' : 'NIE'}\n\n⏰ Opóźnienie: ${response.days_overdue} dni`);
                
                // Odśwież listę
                this.closeModal('overduePaymentsModal');
                await this.loadPayments();
                this.render();
            }
        } catch (error) {
            console.error('❌ Błąd wysyłania przypomnienia:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    // =====================================
    // POMOCNICZE - MODAL
    // =====================================
    createModal(id, content) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000; opacity: 0; transition: opacity 0.3s;';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = 'background: white; border-radius: 12px; padding: 30px; max-width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);';
        modalContent.innerHTML = content;
        
        modal.appendChild(modalContent);
        
        // Animacja
        setTimeout(() => modal.style.opacity = '1', 10);
        
        return modal;
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        }
    }

    // =====================================
    // WYPŁAĆ PROWIZJĘ - NOWE API V2
    // =====================================
    async payCommissionV2(commissionId) {
        const confirmed = confirm('💳 Wypłacić prowizję?\n\nZostanie utworzona wypłata w employee_payments.');
        
        if (!confirmed) return;
        
        try {
            const response = await api.request(`/commissions/v2/${commissionId}/pay`, {
                method: 'POST'
            });
            
            if (response.success) {
                alert(`✅ Prowizja wypłacona!\n\nKwota: ${response.amount} PLN\nStatus: Utworzono employee_payment`);
                
                // Odśwież listę prowizji
                await this.loadCommissions();
            }
        } catch (error) {
            console.error('❌ Błąd wypłaty prowizji:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }
}

// Globalna instancja
window.financeDashboard = new FinanceDashboard();
console.log('✅ Finance Dashboard załadowany');
