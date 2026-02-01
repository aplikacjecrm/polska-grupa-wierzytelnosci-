// ==========================================
// ADMIN DASHBOARD - PROFESJONALNY
// Wersja: 3.0 - Modułowy z integracją czatu
// ==========================================

class AdminDashboard {
    constructor() {
        this.users = [];
        this.stats = {};
        this.chartData = {};
        this.charts = {};
        this.refreshInterval = null;
        this.tickets = [];
        this.activityLogs = [];
        this.financialStats = null; // NOWE
        this.expensesStats = null; // NOWE
        this.balance = null; // NOWE
        
        // Nasłuch eventów
        this.setupEventListeners();
        
        console.log('👑 Admin Dashboard zainicjalizowany');
    }

    setupEventListeners() {
        // Nasłuchuj eventów z systemu
        eventBus.on('user:created', () => this.refreshStats());
        eventBus.on('case:created', () => this.refreshStats());
        eventBus.on('client:created', () => this.refreshStats());
        eventBus.on('payment:completed', () => this.refreshStats());
        eventBus.on('chat:newMessage', (data) => this.handleNewChatMessage(data));
        eventBus.on('dashboard:refresh', () => this.refresh());
    }

    async init() {
        console.log('📊 Admin Dashboard init started');
        try {
            await this.loadUsers();
            await this.loadStats();
            await this.loadFinancialStats(); // NOWE
            await this.loadTickets();
            await this.loadActivityLogs();
            this.render();
            this.startAutoRefresh();
            console.log('✅ Admin Dashboard init completed');
        } catch (error) {
            console.error('❌ Admin Dashboard init error:', error);
        }
    }

    async loadTickets() {
        try {
            const response = await api.request('/tickets');
            this.tickets = response.tickets || [];
            console.log(`✅ Tickets loaded: ${this.tickets.length}`);
        } catch (error) {
            console.error('Błąd ładowania ticketów:', error);
            this.tickets = [];
        }
    }

    async loadActivityLogs() {
        try {
            const response = await api.request('/activity-logs/all?limit=100');
            this.activityLogs = response.logs || [];
            console.log(`✅ Activity logs loaded: ${this.activityLogs.length}`);
        } catch (error) {
            console.error('Błąd ładowania logów:', error);
            this.activityLogs = [];
        }
    }

    async loadUsers() {
        try {
            console.log('Loading users...');
            const response = await api.request('/auth/users');
            this.users = response.users || [];
            console.log(`✅ Users loaded: ${this.users.length}`);
        } catch (error) {
            console.error('Błąd ładowania użytkowników:', error);
            this.users = [];
        }
    }

    async loadStats() {
        try {
            const [clients, cases, events, documents] = await Promise.all([
                api.request('/clients'),
                api.request('/cases'),
                api.request('/events'),
                api.request('/documents').catch(() => ({ documents: [] }))
            ]);

            const allCases = cases.cases || [];
            const allEvents = events.events || [];
            const allDocs = documents.documents || [];
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

            this.stats = {
                // Użytkownicy
                totalUsers: this.users.length,
                admins: this.users.filter(u => u.role === 'admin').length,
                lawyers: this.users.filter(u => u.role === 'lawyer' || u.user_role === 'lawyer').length,
                caseManagers: this.users.filter(u => u.user_role === 'case_manager').length,
                clients: this.users.filter(u => u.role === 'client').length,
                activeUsers: this.users.filter(u => u.is_active !== 0).length,
                
                // Klienci
                totalClients: clients.clients?.length || 0,
                activeClients: clients.clients?.filter(c => c.status === 'active').length || 0,
                
                // Sprawy
                totalCases: allCases.length,
                openCases: allCases.filter(c => c.status === 'open').length,
                inProgressCases: allCases.filter(c => c.status === 'in_progress').length,
                closedCases: allCases.filter(c => c.status === 'closed').length,
                unassignedCases: allCases.filter(c => !c.assigned_to).length,
                
                // Wydarzenia
                totalEvents: allEvents.length,
                todayEvents: allEvents.filter(e => {
                    const eventDate = new Date(e.start_date);
                    return eventDate >= today && eventDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
                }).length,
                weekEvents: allEvents.filter(e => {
                    const eventDate = new Date(e.start_date);
                    return eventDate >= today && eventDate < weekLater;
                }).length,
                
                // Dokumenty
                totalDocuments: allDocs.length,
                documentsThisMonth: allDocs.filter(d => {
                    const docDate = new Date(d.uploaded_at || d.created_at);
                    return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
                }).length
            };
            
            // Przygotuj dane do wykresów
            this.chartData = {
                casesByStatus: {
                    labels: ['Otwarte', 'W toku', 'Zamknięte'],
                    data: [this.stats.openCases, this.stats.inProgressCases, this.stats.closedCases],
                    colors: ['#3B82F6', '#10b981', '#95a5a6']
                },
                usersByRole: {
                    labels: ['Admini', 'Mecenasi', 'Opiekunowie', 'Klienci'],
                    data: [this.stats.admins, this.stats.lawyers, this.stats.caseManagers, this.stats.totalClients],
                    colors: ['#FFD700', '#8b5cf6', '#10b981', '#3B82F6']
                }
            };
            
            // Emit event
            eventBus.emit('dashboard:statsUpdated', { stats: this.stats });
            
        } catch (error) {
            console.error('Błąd ładowania statystyk:', error);
            this.stats = {};
            this.chartData = {};
        }
    }

    // ============================================
    // NOWE: STATYSTYKI FINANSOWE
    // ============================================
    async loadFinancialStats() {
        try {
            console.log('💰 Ładowanie statystyk finansowych...');
            console.log('💰 URL:', '/admin/financial-stats');
            
            // Próbuj załadować dane
            const [financial, expenses, balance] = await Promise.all([
                api.request('/admin/financial-stats').catch(err => {
                    console.error('❌ Błąd /admin/financial-stats:', err);
                    return { stats: null };
                }),
                api.request('/admin/expenses-stats').catch(err => {
                    console.error('❌ Błąd /admin/expenses-stats:', err);
                    return { stats: null };
                }),
                api.request('/admin/balance').catch(err => {
                    console.error('❌ Błąd /admin/balance:', err);
                    return { balance: null };
                })
            ]);
            
            console.log('📦 Odpowiedzi API:', { financial, expenses, balance });
            
            this.financialStats = financial.stats;
            this.expensesStats = expenses.stats;
            this.balance = balance.balance;
            
            if (this.financialStats && this.balance) {
                console.log('✅ Statystyki finansowe załadowane:', {
                    revenue: this.financialStats?.general?.total_revenue,
                    expenses: this.expensesStats?.general?.total_amount,
                    profit: this.balance?.profit
                });
            } else {
                console.warn('⚠️ Brak danych finansowych - API zwróciło null');
            }
            
        } catch (error) {
            console.error('❌ KRYTYCZNY błąd ładowania statystyk:', error);
            console.error('Stack:', error.stack);
            this.financialStats = null;
            this.expensesStats = null;
            this.balance = null;
        }
    }

    render() {
        console.log('🎨 Admin Dashboard render() START');
        const container = document.getElementById('adminView');
        if (!container) {
            console.error('❌ Container #adminView not found!');
            return;
        }
        console.log('✅ Container found, rendering...');

        try {
            container.innerHTML = `
            <div class="view-header">
                <h2>👑 Dashboard Admina</h2>
                <div style="display: flex; gap: 10px;">
                    <button onclick="adminDashboard.refresh()" class="btn-secondary">
                        🔄 Odśwież
                    </button>
                    <button onclick="adminDashboard.showCreateAccountModal()" class="btn-primary">
                        ➕ Nowe konto
                    </button>
                </div>
            </div>

            <!-- KPI Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px;">
                ${this.renderKPICards()}
            </div>

            <!-- Alerty -->
            ${this.renderAlerts()}

            <!-- NOWE: Sekcja Finansowa -->
            ${this.renderFinancialSection()}

            <!-- Wykresy -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px;">
                <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <canvas id="casesChart" style="max-height: 300px;"></canvas>
                </div>
                <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <canvas id="usersChart" style="max-height: 300px;"></canvas>
                </div>
            </div>

            <!-- Szybkie akcje -->
            <div style="background: white; margin: 20px; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 15px;">⚡ Szybkie akcje</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                    <button onclick="adminDashboard.showCreateAccountModal()" class="quick-action-btn">
                        👤 Dodaj użytkownika
                    </button>
                    <button onclick="event.preventDefault(); event.stopPropagation(); adminDashboard.showAllCasesModal();" class="quick-action-btn">
                        📋 Zobacz sprawy
                    </button>
                    <button onclick="event.preventDefault(); event.stopPropagation(); adminDashboard.showAllClientsModal();" class="quick-action-btn">
                        👥 Zobacz klientów
                    </button>
                    <button onclick="adminDashboard.showTicketsPanel()" class="quick-action-btn" style="background: linear-gradient(135deg, #3B82F6 0%, #3B82F6 100%); color: white; font-weight: 700;">
                        🎫 Tickety HR/IT
                    </button>
                    <button onclick="adminDashboard.showActivityLogs()" class="quick-action-btn" style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white; font-weight: 700;">
                        📊 Logi Aktywności
                    </button>
                    <button onclick="adminDashboard.showFinanceDashboard()" class="quick-action-btn" style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white;">
                        💼 Dashboard Finansowy
                    </button>
                    <button onclick="adminDashboard.exportReport()" class="quick-action-btn">
                        📊 Generuj raport
                    </button>
                </div>
            </div>

            <!-- Lista użytkowników -->
            <div style="background: white; margin: 20px; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 15px;">📋 Zarządzanie użytkownikami</h3>
                
                <div style="margin-bottom: 15px;">
                    <input type="search" id="adminUserSearch" placeholder="🔍 Szukaj użytkownika..." 
                           style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px;">
                </div>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Imię i nazwisko</th>
                            <th>Email</th>
                            <th>Rola</th>
                            <th>Status</th>
                            <th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody id="adminUsersList">
                        ${this.renderUsers()}
                    </tbody>
                </table>
            </div>

            <style>
                .quick-action-btn {
                    padding: 15px;
                    background: linear-gradient(145deg, #f0f0f0, #e0e0e0);
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                }
                .quick-action-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
            </style>
        `;

            // Event listeners
            const searchInput = document.getElementById('adminUserSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => this.filterUsers(e.target.value));
            }

            // Renderuj wykresy
            setTimeout(() => this.renderCharts(), 100);
            
            console.log('✅ Admin Dashboard render() COMPLETED');
            
            // Sprawdź wymiary po renderowaniu
            setTimeout(() => {
                console.log('📐 POST-RENDER Check:');
                console.log('   Display:', window.getComputedStyle(container).display);
                console.log('   Dimensions:', container.offsetWidth, 'x', container.offsetHeight);
                console.log('   Visibility:', window.getComputedStyle(container).visibility);
                console.log('   Content length:', container.innerHTML.length);
                console.log('   Parent:', container.parentElement?.id);
                console.log('   Parent display:', container.parentElement ? window.getComputedStyle(container.parentElement).display : 'no parent');
            }, 200);
        } catch (error) {
            console.error('❌ BŁĄD w render():', error);
            console.error('Stack trace:', error.stack);
            container.innerHTML = `
                <div style="padding: 40px; text-align: center;">
                    <h2 style="color: #e74c3c;">❌ Błąd ładowania dashboardu</h2>
                    <p style="color: #666;">${error.message}</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">
                        🔄 Odśwież stronę
                    </button>
                </div>
            `;
        }
    }

    renderKPICards() {
        const cards = [
            { label: 'Użytkownicy', value: this.stats.totalUsers, icon: '👥', gradient: 'linear-gradient(145deg, #3B82F6, #1E40AF)' },
            { label: 'Mecenasi', value: this.stats.lawyers, icon: '👔', gradient: 'linear-gradient(145deg, #8b5cf6, #7c3aed)' },
            { label: 'Sprawy aktywne', value: this.stats.inProgressCases, icon: '📋', gradient: 'linear-gradient(145deg, #f59e0b, #ea580c)' },
            { label: 'Wydarzenia dziś', value: this.stats.todayEvents, icon: '📅', gradient: 'linear-gradient(145deg, #6366f1, #4f46e5)' },
            { label: 'Klienci', value: this.stats.totalClients, icon: '👤', gradient: 'linear-gradient(145deg, #10b981, #059669)' },
            { label: 'Dokumenty', value: this.stats.documentsThisMonth, icon: '📄', gradient: 'linear-gradient(145deg, #06b6d4, #0891b2)' }
        ];

        return cards.map(card => `
            <div style="background: ${card.gradient}; padding: 20px; border-radius: 12px; color: white; text-align: center;">
                <div style="font-size: 2rem;">${card.icon}</div>
                <div style="font-size: 2.5rem; font-weight: 700; margin: 10px 0;">${card.value || 0}</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">${card.label}</div>
            </div>
        `).join('');
    }

    renderAlerts() {
        const alerts = [];
        
        if (this.stats.unassignedCases > 0) {
            alerts.push({
                type: 'warning',
                icon: '⚠️',
                message: `${this.stats.unassignedCases} spraw bez przypisanego mecenasa`,
                action: () => window.location.href = '#cases'
            });
        }
        
        if (this.stats.todayEvents > 0) {
            alerts.push({
                type: 'info',
                icon: '📅',
                message: `${this.stats.todayEvents} wydarzeń zaplanowanych na dziś`,
                action: () => window.location.href = '#calendar'
            });
        }

        if (alerts.length === 0) return '';

        return `
            <div style="background: white; margin: 20px; padding: 15px; border-radius: 12px; border-left: 4px solid #3B82F6;">
                <h4 style="margin-bottom: 10px;">🔔 Powiadomienia</h4>
                ${alerts.map(alert => `
                    <div style="padding: 10px; margin: 5px 0; background: #f8f9fa; border-radius: 6px; cursor: pointer;" 
                         onclick="(${alert.action.toString()})()">
                        ${alert.icon} ${alert.message}
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ============================================
    // NOWE: RENDEROWANIE SEKCJI FINANSOWEJ
    // ============================================
    renderFinancialSection() {
        if (!this.financialStats || !this.balance) {
            return `
                <div style="background: white; margin: 20px; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3>💰 Finanse</h3>
                    <p style="color: #999;">Ładowanie statystyk finansowych...</p>
                </div>
            `;
        }

        const general = this.financialStats.general;
        const thisMonth = this.financialStats.this_month;
        const topClients = this.financialStats.top_clients || [];
        const balance = this.balance;

        const formatMoney = (amount) => {
            return `${parseFloat(amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} PLN`;
        };

        return `
            <div style="background: white; margin: 20px; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">💰 Dashboard Finansowy</h3>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="window.open('/test-commissions.html', '_blank')" 
                                style="padding: 10px 20px; background: linear-gradient(135deg, #FFD700, #FFA500); color: #1a2332; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            💰 Test Prowizji
                        </button>
                        <button onclick="window.open('/test-commissions.html', '_blank')" class="btn-primary">
                            📊 Pełny Dashboard Prowizji
                        </button>
                    </div>
                </div>

                <!-- KPI Finansowe -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    <!-- Przychody ogółem -->
                    <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 20px; border-radius: 12px; color: white;">
                        <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">💰 Przychody ogółem</div>
                        <div style="font-size: 1.8rem; font-weight: 700;">${formatMoney(general.total_revenue)}</div>
                        <div style="font-size: 0.85rem; opacity: 0.9; margin-top: 5px;">${general.completed_count || 0} płatności</div>
                    </div>

                    <!-- Ten miesiąc -->
                    <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 20px; border-radius: 12px; color: white;">
                        <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">📅 Ten miesiąc</div>
                        <div style="font-size: 1.8rem; font-weight: 700;">${formatMoney(thisMonth.revenue)}</div>
                        <div style="font-size: 0.85rem; opacity: 0.9; margin-top: 5px;">${thisMonth.count || 0} płatności</div>
                    </div>

                    <!-- Średnia płatność -->
                    <div style="background: linear-gradient(135deg, #FFD700 0%, #d4af37 100%); padding: 20px; border-radius: 12px; color: #1a2332;">
                        <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">💳 Średnia płatność</div>
                        <div style="font-size: 1.8rem; font-weight: 700;">${formatMoney(general.average_payment)}</div>
                        <div style="font-size: 0.85rem; opacity: 0.9; margin-top: 5px;">na transakcję</div>
                    </div>

                    <!-- Wskaźnik realizacji -->
                    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 20px; border-radius: 12px; color: white;">
                        <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">📊 Realizacja</div>
                        <div style="font-size: 1.8rem; font-weight: 700;">${general.realization_rate || 0}%</div>
                        <div style="font-size: 0.85rem; opacity: 0.9; margin-top: 5px;">${general.completed_count}/${general.total_payments}</div>
                    </div>
                </div>

                <!-- Bilans i Top Klienci -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <!-- Bilans -->
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <h4 style="margin: 0 0 15px 0;">💼 Bilans</h4>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Przychody:</span>
                            <strong style="color: #2ecc71;">${formatMoney(balance.revenue)}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Koszty:</span>
                            <strong style="color: #e74c3c;">${formatMoney(balance.expenses)}</strong>
                        </div>
                        <hr style="border: none; border-top: 2px solid #ddd; margin: 15px 0;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: 700;">Zysk:</span>
                            <strong style="color: ${balance.profit >= 0 ? '#2ecc71' : '#e74c3c'}; font-size: 1.2rem;">
                                ${formatMoney(balance.profit)}
                            </strong>
                        </div>
                        <div style="text-align: right; color: #999; font-size: 0.85rem; margin-top: 5px;">
                            Marża: ${balance.profit_margin}%
                        </div>
                    </div>

                    <!-- Top Klienci -->
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <h4 style="margin: 0 0 15px 0;">🏆 Top 5 Klientów</h4>
                        ${topClients.length > 0 ? topClients.map((client, index) => `
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 8px; background: white; border-radius: 6px;">
                                <div>
                                    <span style="font-weight: 600; color: #FFD700; margin-right: 5px;">#${index + 1}</span>
                                    <span>${client.company_name || client.client_name}</span>
                                </div>
                                <strong style="color: #2ecc71;">${formatMoney(client.total_revenue)}</strong>
                            </div>
                        `).join('') : '<p style="color: #999;">Brak danych</p>'}
                    </div>
                </div>

                <!-- Wykres przychodów (placeholder) -->
                ${this.financialStats.revenue_chart && this.financialStats.revenue_chart.length > 0 ? `
                    <div style="margin-top: 20px; background: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <h4 style="margin: 0 0 15px 0;">📈 Przychody ostatnich 12 miesięcy</h4>
                        <canvas id="revenueChart" style="max-height: 250px;"></canvas>
                    </div>
                ` : ''}
            </div>
        `;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    renderUsers() {
        const roleLabels = {
            admin: '👑 Administrator',
            lawyer: '👔 Mecenas',
            case_manager: '📋 Opiekun sprawy',
            client_manager: '👤 Opiekun klienta',
            reception: '📞 Recepcja',
            hr: '👥 HR',
            finance: '💰 Finanse',
            payroll: '💼 Payroll',
            client: '👤 Klient'
        };

        const roleColors = {
            admin: '#FFD700',
            lawyer: '#8b5cf6',
            case_manager: '#10b981',
            client_manager: '#f59e0b',
            reception: '#06b6d4',
            hr: '#ec4899',
            finance: '#22c55e',
            payroll: '#dc2626',
            client: '#95a5a6'
        };

        return this.users.map(user => {
            const role = user.user_role || user.role || 'client';
            const roleLower = role.toLowerCase();
            return `
                <tr>
                    <td><strong>#${user.id}</strong></td>
                    <td>${this.escapeHtml(user.name)}</td>
                    <td>${this.escapeHtml(user.email)}</td>
                    <td><span style="background: ${roleColors[roleLower] || '#95a5a6'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem;">
                        ${roleLabels[roleLower] || roleLower || 'Klient'}
                    </span></td>
                    <td>${user.is_active !== 0 ? '✅ Aktywny' : '❌ Nieaktywny'}</td>
                    <td>
                        ${roleLower !== 'client' ? `<button class="btn-small" style="background: #3B82F6; color: white;" onclick="adminDashboard.viewEmployeeDashboard(${user.id})">📊 Dashboard</button>` : ''}
                        <button class="btn-small" onclick="adminDashboard.viewUser(${user.id})">👁️ Zobacz</button>
                        <button class="btn-small" style="background: #3B82F6; color: white;" onclick='adminDashboard.showChangePasswordModal(${user.id}, "${this.escapeHtml(user.name).replace(/"/g, '&quot;')}")'>🔑 Hasło</button>
                        ${roleLower !== 'admin' ? `<button class="btn-small" style="background: #3B82F6; color: white;" onclick="adminDashboard.deleteUser(${user.id})">🗑️ Usuń</button>` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderCharts() {
        // Wykres spraw według statusu
        const casesCtx = document.getElementById('casesChart');
        if (casesCtx && this.chartData?.casesByStatus) {
            if (this.charts.cases) this.charts.cases.destroy();
            this.charts.cases = new Chart(casesCtx, {
                type: 'doughnut',
                data: {
                    labels: this.chartData.casesByStatus.labels,
                    datasets: [{
                        data: this.chartData.casesByStatus.data,
                        backgroundColor: this.chartData.casesByStatus.colors,
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' },
                        title: {
                            display: true,
                            text: 'Sprawy według statusu',
                            font: { size: 16, weight: 'bold' }
                        }
                    }
                }
            });
        }

        // Wykres użytkowników według ról
        const usersCtx = document.getElementById('usersChart');
        if (usersCtx && this.chartData?.usersByRole) {
            if (this.charts.users) this.charts.users.destroy();
            this.charts.users = new Chart(usersCtx, {
                type: 'bar',
                data: {
                    labels: this.chartData.usersByRole.labels,
                    datasets: [{
                        label: 'Liczba użytkowników',
                        data: this.chartData.usersByRole.data,
                        backgroundColor: this.chartData.usersByRole.colors,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: 'Użytkownicy według ról',
                            font: { size: 16, weight: 'bold' }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                        }
                    }
                }
            });
        }

        // NOWE: Wykres przychodów
        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx && this.financialStats?.revenue_chart && this.financialStats.revenue_chart.length > 0) {
            if (this.charts.revenue) this.charts.revenue.destroy();
            
            const revenueData = this.financialStats.revenue_chart;
            const labels = revenueData.map(item => {
                const [year, month] = item.month.split('-');
                return `${month}/${year}`;
            });
            const data = revenueData.map(item => item.revenue || 0);
            
            this.charts.revenue = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Przychody (PLN)',
                        data: data,
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: 'Przychody ostatnich 12 miesięcy',
                            font: { size: 14, weight: 'bold' }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value.toLocaleString('pl-PL') + ' PLN';
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    filterUsers(query) {
        const rows = document.querySelectorAll('#adminUsersList tr');
        const lowerQuery = query.toLowerCase();

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(lowerQuery) ? '' : 'none';
        });
    }

    async viewUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        alert(`👤 Szczegóły użytkownika:\n\nID: ${user.id}\nImię: ${user.name}\nEmail: ${user.email}\nRola: ${user.user_role || user.role}`);
    }

    async deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const confirmDelete = confirm(`⚠️ UWAGA!\n\nCzy na pewno chcesz usunąć użytkownika:\n${user.name} (${user.email})?`);
        if (!confirmDelete) return;

        try {
            await api.request(`/auth/users/${userId}`, { method: 'DELETE' });
            eventBus.emit('user:deleted', { userId });
            await this.refresh();
            alert('✅ Użytkownik został usunięty');
        } catch (error) {
            alert('❌ Błąd podczas usuwania użytkownika: ' + error.message);
        }
    }

    showCreateAccountModal() {
        // USUŃ WSZYSTKIE stare modale (uniknij duplikatów)
        document.querySelectorAll('.modal').forEach(m => {
            if (m.querySelector('#createAccountForm')) {
                m.remove();
            }
        });
        const oldModal = document.getElementById('createAccountModal');
        if (oldModal) {
            oldModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.id = 'createAccountModal';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; width: 90%;">
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 20px; border-radius: 12px 12px 0 0; color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0;">👤 Utwórz Nowe Konto</h2>
                        <button id="closeCreateAccountModal" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 24px; cursor: pointer; width: 40px; height: 40px; border-radius: 50%;">✕</button>
                    </div>
                </div>
                
                <div style="padding: 30px;">
                    <form id="createAccountForm" autocomplete="off">
                        <!-- Typ użytkownika -->
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">
                                Typ użytkownika *
                            </label>
                            <select id="accountType" required style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
                                <option value="">-- Wybierz typ --</option>
                                <option value="admin">👑 Administrator</option>
                                <option value="lawyer">👔 Mecenas</option>
                                <option value="client_manager">👤 Opiekun klienta</option>
                                <option value="case_manager">📋 Opiekun sprawy</option>
                                <option value="reception">📞 Recepcja</option>
                                <option value="hr">🎓 Dział HR (Kadry)</option>
                                <option value="finance">💰 Dział Finansowy</option>
                                <option value="client">👤 Klient</option>
                            </select>
                        </div>
                        
                        <!-- Imię i nazwisko -->
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">
                                Imię i nazwisko *
                            </label>
                            <input type="text" id="accountName" required placeholder="Jan Kowalski" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
                        </div>
                        
                        <!-- Email -->
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">
                                Email (login) *
                            </label>
                            <textarea id="accountEmailNew" name="email_new_account" required placeholder="jan.kowalski@pro-meritum.pl" rows="1" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; resize: none; font-family: inherit; overflow: hidden;" oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"></textarea>
                            <small style="color: #7f8c8d; display: block; margin-top: 5px;">
                                💡 Dla pracowników: @pro-meritum.pl | ⚡ Textarea - Chrome NIE autouzupełnia!
                            </small>
                        </div>
                        
                        <!-- Hasło -->
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">
                                Hasło *
                            </label>
                            <div style="position: relative;">
                                <input type="text" id="accountPassword" required placeholder="Min. 8 znaków, wielka litera, znak specjalny" style="width: 100%; padding: 12px; padding-right: 90px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
                                <button type="button" id="copyPasswordBtn" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: #3B82F6; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; display: none;">
                                    📋 Kopiuj
                                </button>
                            </div>
                            <button type="button" id="generatePasswordBtn" style="margin-top: 8px; padding: 10px 15px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.95rem; font-weight: 600;">
                                🎲 Wygeneruj losowe hasło
                            </button>
                            <div id="generatedPasswordDisplay" style="display: none; margin-top: 10px; padding: 12px; background: #d4edda; border-left: 4px solid #3B82F6; border-radius: 6px;">
                                <strong style="color: #155724;">✅ Hasło wygenerowane:</strong>
                                <div id="passwordValue" style="font-family: monospace; font-size: 1.1rem; margin-top: 5px; color: #000; font-weight: 700;"></div>
                            </div>
                        </div>
                        
                        <!-- Dodatkowe opcje dla klienta -->
                        <div id="clientOptions" style="display: none; background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">
                                Powiąż z istniejącym klientem (opcjonalnie)
                            </label>
                            <select id="clientLink" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;">
                                <option value="">-- Nowy klient --</option>
                            </select>
                        </div>
                        
                        <!-- Przyciski -->
                        <div style="display: flex; gap: 10px; margin-top: 30px;">
                            <button type="submit" style="flex: 1; padding: 15px; background: linear-gradient(135deg, #3B82F6 0%, #3B82F6 100%); color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: 700; cursor: pointer;">
                                ✅ Utwórz konto
                            </button>
                            <button type="button" id="cancelCreateAccountBtn" style="padding: 15px 30px; background: #95a5a6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                                Anuluj
                            </button>
                        </div>
                    </form>
                    
                    <div id="accountCreationStatus" style="margin-top: 20px;"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // WAŻNE: Czekaj aż DOM będzie gotowy
        setTimeout(() => {
            // Event listeners
            document.getElementById('accountType')?.addEventListener('change', (e) => {
                const clientOptions = document.getElementById('clientOptions');
                clientOptions.style.display = e.target.value === 'client' ? 'block' : 'none';
            });
            
            document.getElementById('createAccountForm')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // DEBUG: Sprawdź wartości przed wysłaniem
                console.log('🔍 PRZED WYSŁANIEM:');
                console.log('Email input element:', document.getElementById('accountEmailNew'));
                console.log('Email value:', document.getElementById('accountEmailNew')?.value);
                console.log('Name value:', document.getElementById('accountName')?.value);
                console.log('Password value:', document.getElementById('accountPassword')?.value);
                console.log('Role value:', document.getElementById('accountType')?.value);
                
                await this.createNewAccount();
            });
            
            // Generator hasła
            document.getElementById('generatePasswordBtn')?.addEventListener('click', () => {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%&';
            let password = '';
            for (let i = 0; i < 12; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            
            // Wypełnij pole
            const input = document.getElementById('accountPassword');
            input.value = password;
            
            // Pokaż hasło w zielonym boxie
            const display = document.getElementById('generatedPasswordDisplay');
            const passwordValue = document.getElementById('passwordValue');
            passwordValue.textContent = password;
            display.style.display = 'block';
            
            // Pokaż przycisk kopiowania
            const copyBtn = document.getElementById('copyPasswordBtn');
            copyBtn.style.display = 'block';
            
            // Automatycznie skopiuj
            navigator.clipboard.writeText(password).then(() => {
                console.log('✅ Hasło skopiowane do schowka');
            }).catch(err => {
                console.error('Błąd kopiowania:', err);
            });
            });
            
            // Przycisk kopiowania
            document.getElementById('copyPasswordBtn')?.addEventListener('click', () => {
                const password = document.getElementById('accountPassword').value;
                if (password) {
                    navigator.clipboard.writeText(password).then(() => {
                        const btn = document.getElementById('copyPasswordBtn');
                        btn.textContent = '✅ Skopiowano!';
                        btn.style.background = '#3B82F6';
                        setTimeout(() => {
                            btn.textContent = '📋 Kopiuj';
                            btn.style.background = '#3B82F6';
                        }, 2000);
                    });
                }
            });
            
            // Pokaż przycisk kopiowania gdy użytkownik wpisuje hasło ręcznie
            document.getElementById('accountPassword')?.addEventListener('input', (e) => {
                const copyBtn = document.getElementById('copyPasswordBtn');
                copyBtn.style.display = e.target.value.length > 0 ? 'block' : 'none';
            });
            
            // Przycisk zamknięcia
            document.getElementById('closeCreateAccountModal')?.addEventListener('click', () => {
                modal.remove();
            });
            
            // Przycisk Anuluj
            document.getElementById('cancelCreateAccountBtn')?.addEventListener('click', () => {
                modal.remove();
            });
            
            // Zamknij po kliknięciu tła
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
            // Focus na pierwszym polu
            document.getElementById('accountType')?.focus();
        }, 50); // Zamknięcie setTimeout
    }
    
    async createNewAccount() {
        const statusDiv = document.getElementById('accountCreationStatus');
        
        try {
            // Sprawdź czy pola istnieją
            const emailInput = document.getElementById('accountEmailNew');
            const passwordInput = document.getElementById('accountPassword');
            const nameInput = document.getElementById('accountName');
            const typeInput = document.getElementById('accountType');
            
            console.log('🔍 DEBUG - Sprawdzam elementy:', {
                emailInput: emailInput,
                emailExists: !!emailInput,
                emailValue: emailInput?.value,
                emailValueLength: emailInput?.value?.length,
                passwordInput: passwordInput,
                passwordExists: !!passwordInput,
                nameInput: nameInput,
                nameExists: !!nameInput,
                typeInput: typeInput,
                typeExists: !!typeInput
            });
            
            if (!emailInput || !passwordInput || !nameInput || !typeInput) {
                console.error('❌ Brak jednego z pól formularza!', {
                    email: !!emailInput,
                    password: !!passwordInput,
                    name: !!nameInput,
                    type: !!typeInput
                });
                statusDiv.innerHTML = '<div style="padding: 15px; background: #fee; border-left: 4px solid #3B82F6; border-radius: 6px; color: #1E40AF;">❌ Błąd formularza! Odśwież stronę i spróbuj ponownie.</div>';
                return;
            }
            
            // OBEJŚCIE dla autocomplete - czekaj chwilę i odczytaj ponownie
            await new Promise(resolve => setTimeout(resolve, 100));
            
            console.log('🔍 RAW INPUTS:');
            console.log('emailInput tagName:', emailInput?.tagName);
            console.log('emailInput value property:', emailInput?.value);
            console.log('emailInput textContent:', emailInput?.textContent);
            console.log('emailInput innerHTML:', emailInput?.innerHTML);
            
            // Pobierz wartości - TEXTAREA zawsze ma .value
            const emailValue = (emailInput.value || '').trim();
            const passwordValue = (passwordInput.value || '').trim();
            const nameValue = (nameInput.value || '').trim();
            const roleValue = (typeInput.value || '').trim();
            
            console.log('🔍 DEBUG - Surowe wartości:', {
                emailValue: emailValue,
                emailValueType: typeof emailValue,
                emailValueLength: emailValue.length,
                passwordValue: passwordValue,
                passwordValueLength: passwordValue.length,
                nameValue: nameValue,
                nameValueLength: nameValue.length,
                roleValue: roleValue
            });
            
            const formData = {
                email: emailValue,
                password: passwordValue,
                name: nameValue,
                role: roleValue,
                client_id: document.getElementById('clientLink')?.value || null
            };
            
            console.log('📝 Dane formularza:', formData);
            console.log('🔍 Wartości pól:', {
                email: formData.email,
                emailLength: formData.email.length,
                name: formData.name,
                nameLength: formData.name.length,
                role: formData.role,
                password: '***' + formData.password.slice(-3)
            });
            
            // Walidacja z dokładnymi informacjami
            if (!formData.email || !formData.password || !formData.name || !formData.role) {
                const missing = [];
                if (!formData.email) missing.push('Email');
                if (!formData.password) missing.push('Hasło');
                if (!formData.name) missing.push('Imię i nazwisko');
                if (!formData.role) missing.push('Typ użytkownika');
                
                console.error('❌ Brakujące pola:', missing);
                statusDiv.innerHTML = `<div style="padding: 15px; background: #fee; border-left: 4px solid #3B82F6; border-radius: 6px; color: #1E40AF;">
                    ❌ Wypełnij wszystkie wymagane pola!<br>
                    <small style="margin-top: 5px; display: block;">Brakuje: ${missing.join(', ')}</small>
                </div>`;
                return;
            }
            
            if (formData.password.length < 6) {
                statusDiv.innerHTML = '<div style="padding: 15px; background: #fee; border-left: 4px solid #3B82F6; border-radius: 6px; color: #1E40AF;">❌ Hasło musi mieć minimum 6 znaków!</div>';
                return;
            }
            
            statusDiv.innerHTML = '<div style="padding: 15px; background: #e8f4f8; border-left: 4px solid #3B82F6; border-radius: 6px; color: #2c3e50;">⏳ Tworzenie konta...</div>';
            
            console.log('🔄 Wysyłam request do /auth/register...');
            
            const response = await api.request('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            console.log('📨 Odpowiedź serwera:', response);
            
            if (response.success || response.user) {
                statusDiv.innerHTML = `
                    <div style="padding: 20px; background: #d4edda; border-left: 4px solid #3B82F6; border-radius: 6px; color: #155724;">
                        <strong style="font-size: 1.2rem;">✅ Konto utworzone pomyślnie!</strong><br><br>
                        <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 10px;">
                            <div style="margin-bottom: 8px;"><strong>📧 Email (login):</strong><br>
                            <span style="font-family: monospace; font-size: 1.1rem; color: #2c3e50;">${formData.email}</span></div>
                            
                            <div style="margin-bottom: 8px;"><strong>🔑 Hasło:</strong><br>
                            <span style="font-family: monospace; font-size: 1.1rem; color: #3B82F6; font-weight: 700;">${formData.password}</span></div>
                            
                            <div><strong>👤 Rola:</strong> ${this.getRoleLabel(formData.role)}</div>
                        </div>
                        <div style="margin-top: 15px; padding: 10px; background: #F8FAFC; border-radius: 4px;">
                            <strong>⚠️ WAŻNE:</strong> Zapisz te dane! Hasło nie będzie już widoczne po zamknięciu.
                        </div>
                    </div>
                `;
                
                // Odśwież listę użytkowników
                console.log('🔄 Odświeżam listę użytkowników...');
                setTimeout(async () => {
                    try {
                        await this.loadUsers();
                        this.render();
                        eventBus.emit('user:created', { user: response.user });
                        console.log('✅ Lista użytkowników odświeżona');
                    } catch (refreshError) {
                        console.error('❌ Błąd odświeżania:', refreshError);
                    }
                }, 2000);
            } else {
                throw new Error(response.error || 'Nieznany błąd serwera');
            }
        } catch (error) {
            console.error('❌ Błąd tworzenia konta:', error);
            statusDiv.innerHTML = `<div style="padding: 15px; background: #fee; border-left: 4px solid #3B82F6; border-radius: 6px; color: #1E40AF;">
                <strong>❌ Błąd tworzenia konta</strong><br>
                ${error.message || 'Nieznany błąd'}
            </div>`;
        }
    }
    
    getRoleLabel(role) {
        const labels = {
            'admin': '👑 Administrator',
            'lawyer': '👔 Mecenas',
            'client_manager': '👤 Opiekun klienta',
            'case_manager': '📋 Opiekun sprawy',
            'reception': '📞 Recepcja',
            'hr': '🎓 Dział HR (Kadry)',
            'finance': '💰 Dział Finansowy',
            'client': '👤 Klient'
        };
        return labels[role] || role;
    }

    async exportReport() {
        alert('📊 Generowanie raportu...\n\nFunkcja w przygotowaniu!');
    }

    async refresh() {
        console.log('🔄 Odświeżanie dashboardu...');
        await this.loadUsers();
        await this.loadStats();
        this.render();
    }

    async refreshStats() {
        await this.loadStats();
        // Aktualizuj tylko statystyki bez pełnego re-renderu
        const kpiContainer = document.querySelector('[style*="grid-template-columns: repeat(auto-fit"]');
        if (kpiContainer) {
            kpiContainer.innerHTML = this.renderKPICards();
        }
    }

    handleNewChatMessage(data) {
        console.log('💬 Nowa wiadomość czatu:', data);
        // TODO: Pokaż notyfikację w dashboardzie
    }

    startAutoRefresh() {
        // Odświeżaj statystyki co 5 minut
        this.refreshInterval = setInterval(() => this.refreshStats(), 5 * 60 * 1000);
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        // Zniszcz wykresy
        Object.values(this.charts).forEach(chart => chart.destroy());
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // =====================================
    // PANEL TICKETÓW HR/IT
    // =====================================
    showTicketsPanel() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        const ticketStats = {
            total: this.tickets?.length || 0,
            new: this.tickets?.filter(t => t.status === 'Nowy').length || 0,
            inProgress: this.tickets?.filter(t => t.status === 'W realizacji').length || 0,
            completed: this.tickets?.filter(t => t.status === 'Zakończony').length || 0
        };
        
        const statusColors = {
            'Nowy': '#3B82F6',
            'W realizacji': '#3B82F6',
            'Zakończony': '#3B82F6',
            'Odrzucony': '#3B82F6'
        };
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 95vw; width: 1400px; max-height: 90vh; overflow-y: auto;">
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #3B82F6 100%); padding: 20px; border-radius: 12px 12px 0 0; color: white; position: sticky; top: 0; z-index: 10;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0;">🎫 Panel Ticketów HR/IT</h2>
                        <button onclick="this.closest('.modal').remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 24px; cursor: pointer; width: 40px; height: 40px; border-radius: 50%;">✕</button>
                    </div>
                    
                    <!-- Statystyki -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 20px;">
                        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700;">${ticketStats.total}</div>
                            <div style="font-size: 0.9rem; opacity: 0.9;">Wszystkie</div>
                        </div>
                        <div style="background: rgba(52,152,219,0.3); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700;">${ticketStats.new}</div>
                            <div style="font-size: 0.9rem; opacity: 0.9;">Nowe</div>
                        </div>
                        <div style="background: rgba(243,156,18,0.3); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700;">${ticketStats.inProgress}</div>
                            <div style="font-size: 0.9rem; opacity: 0.9;">W realizacji</div>
                        </div>
                        <div style="background: rgba(46,204,113,0.3); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700;">${ticketStats.completed}</div>
                            <div style="font-size: 0.9rem; opacity: 0.9;">Zakończone</div>
                        </div>
                    </div>
                </div>
                
                <div style="padding: 20px;">
                    <!-- Filtry -->
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 10px;">
                            <input type="search" id="ticketSearch" placeholder="🔍 Szukaj..." style="padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                            <select id="ticketDepartmentFilter" style="padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                                <option value="">Wszystkie działy</option>
                                <option value="HR">HR</option>
                                <option value="IT">IT</option>
                                <option value="Księgowość">Księgowość</option>
                                <option value="Administracja">Administracja</option>
                            </select>
                            <select id="ticketStatusFilter" style="padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                                <option value="">Wszystkie statusy</option>
                                <option value="Nowy">Nowe</option>
                                <option value="W realizacji">W realizacji</option>
                                <option value="Zakończony">Zakończone</option>
                            </select>
                            <button onclick="adminDashboard.loadTickets(); adminDashboard.showTicketsPanel();" style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                                🔄 Odśwież
                            </button>
                        </div>
                    </div>
                    
                    <!-- Lista ticketów -->
                    <div id="ticketsList">
                        ${this.renderTicketsList()}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners dla filtrów
        ['ticketSearch', 'ticketDepartmentFilter', 'ticketStatusFilter'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => this.filterTickets());
        });
    }
    
    renderTicketsList() {
        if (!this.tickets || this.tickets.length === 0) {
            return '<div style="text-align: center; padding: 40px; color: #999;">📭 Brak ticketów</div>';
        }
        
        const statusColors = {
            'Nowy': '#3B82F6',
            'W realizacji': '#3B82F6',
            'Zakończony': '#3B82F6',
            'Odrzucony': '#3B82F6'
        };
        
        return this.tickets.map(ticket => {
            const details = typeof ticket.details === 'string' ? JSON.parse(ticket.details) : ticket.details;
            const statusColor = statusColors[ticket.status] || '#95a5a6';
            
            return `
                <div class="ticket-card" style="background: white; border-left: 4px solid ${statusColor}; margin-bottom: 15px; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <div style="font-weight: 700; font-size: 1.1rem; color: #2c3e50;">
                                ${ticket.ticket_number}
                            </div>
                            <div style="color: #7f8c8d; font-size: 0.9rem; margin-top: 5px;">
                                ${ticket.title}
                            </div>
                        </div>
                        <select onchange="adminDashboard.updateTicketStatus(${ticket.id}, this.value)" 
                                style="padding: 8px 12px; border: 2px solid ${statusColor}; border-radius: 6px; background: white; color: ${statusColor}; font-weight: 600; cursor: pointer;">
                            <option value="Nowy" ${ticket.status === 'Nowy' ? 'selected' : ''}>🆕 Nowy</option>
                            <option value="W realizacji" ${ticket.status === 'W realizacji' ? 'selected' : ''}>⏳ W realizacji</option>
                            <option value="Zakończony" ${ticket.status === 'Zakończony' ? 'selected' : ''}>✅ Zakończony</option>
                            <option value="Odrzucony" ${ticket.status === 'Odrzucony' ? 'selected' : ''}>❌ Odrzucony</option>
                        </select>
                    </div>
                    
                    <div style="display: flex; gap: 15px; margin-bottom: 10px; flex-wrap: wrap;">
                        <span style="background: #e8f4f8; padding: 5px 10px; border-radius: 4px; font-size: 0.85rem;">
                            🏢 ${ticket.department}
                        </span>
                        <span style="background: #f0e6f6; padding: 5px 10px; border-radius: 4px; font-size: 0.85rem;">
                            👤 ${ticket.requester_name || 'N/A'}
                        </span>
                        <span style="background: #F8FAFC; padding: 5px 10px; border-radius: 4px; font-size: 0.85rem;">
                            📅 ${new Date(ticket.created_at).toLocaleDateString('pl-PL')}
                        </span>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; font-size: 0.9rem; margin-bottom: 10px;">
                        <strong>Szczegóły:</strong><br>
                        ${Object.entries(details || {}).map(([key, value]) => `
                            <div style="margin-top: 5px;"><strong>${key}:</strong> ${value}</div>
                        `).join('')}
                    </div>
                    
                    ${ticket.admin_note ? `
                        <div style="background: #d1ecf1; border-left: 3px solid #17a2b8; padding: 10px; border-radius: 4px; font-size: 0.9rem; margin-top: 10px;">
                            <strong>📝 Notatka admin:</strong> ${ticket.admin_note}
                        </div>
                    ` : ''}
                    
                    <div style="margin-top: 10px;">
                        <button onclick="adminDashboard.addAdminNote(${ticket.id})" style="padding: 8px 15px; background: #17a2b8; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 10px;">
                            📝 Dodaj notatkę
                        </button>
                        <button onclick="adminDashboard.viewTicketDetails(${ticket.id})" style="padding: 8px 15px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            👁️ Szczegóły
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    filterTickets() {
        const search = document.getElementById('ticketSearch')?.value.toLowerCase() || '';
        const department = document.getElementById('ticketDepartmentFilter')?.value || '';
        const status = document.getElementById('ticketStatusFilter')?.value || '';
        
        const cards = document.querySelectorAll('.ticket-card');
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const matchesSearch = !search || text.includes(search);
            const matchesDepartment = !department || text.includes(department.toLowerCase());
            const matchesStatus = !status || text.includes(status.toLowerCase());
            
            card.style.display = (matchesSearch && matchesDepartment && matchesStatus) ? 'block' : 'none';
        });
    }
    
    async updateTicketStatus(ticketId, newStatus) {
        try {
            await api.request(`/tickets/${ticketId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            
            alert(`✅ Status ticketu zmieniony na: ${newStatus}`);
            await this.loadTickets();
            this.showTicketsPanel();
        } catch (error) {
            alert('❌ Błąd zmiany statusu: ' + error.message);
        }
    }
    
    async addAdminNote(ticketId) {
        const note = prompt('📝 Wprowadź notatkę administratora:');
        if (!note) return;
        
        try {
            await api.request(`/tickets/${ticketId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ admin_note: note })
            });
            
            alert('✅ Notatka dodana');
            await this.loadTickets();
            this.showTicketsPanel();
        } catch (error) {
            alert('❌ Błąd dodawania notatki: ' + error.message);
        }
    }
    
    viewTicketDetails(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;
        
        alert(`🎫 Szczegóły Ticketu\n\n${JSON.stringify(ticket, null, 2)}`);
    }

    // =====================================
    // LOGI AKTYWNOŚCI
    // =====================================
    showActivityLogs() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        const todayLogins = this.activityLogs?.filter(log => {
            const logDate = new Date(log.created_at);
            const today = new Date();
            return log.action === 'login' && logDate.toDateString() === today.toDateString();
        }).length || 0;
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 95vw; width: 1400px; max-height: 90vh; overflow-y: auto;">
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 20px; border-radius: 12px 12px 0 0; color: white; position: sticky; top: 0; z-index: 10;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0;">📊 Logi Aktywności</h2>
                        <button onclick="this.closest('.modal').remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 24px; cursor: pointer; width: 40px; height: 40px; border-radius: 50%;">✕</button>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px;">
                        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700;">${todayLogins}</div>
                            <div style="font-size: 0.9rem;">Logowania dziś</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700;">${this.activityLogs?.length || 0}</div>
                            <div style="font-size: 0.9rem;">Wszystkie logi</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700;">${new Set(this.activityLogs?.map(l => l.user_id)).size || 0}</div>
                            <div style="font-size: 0.9rem;">Aktywni użytkownicy</div>
                        </div>
                    </div>
                </div>
                
                <div style="padding: 20px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Użytkownik</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Akcja</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">IP</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(this.activityLogs || []).map(log => `
                                <tr style="border-bottom: 1px solid #dee2e6;">
                                    <td style="padding: 12px;">${log.user_name || 'N/A'}</td>
                                    <td style="padding: 12px;">
                                        <span style="padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; background: ${log.action === 'login' ? '#d4edda' : '#f8d7da'}; color: ${log.action === 'login' ? '#155724' : '#721c24'};">
                                            ${log.action === 'login' ? '🟢 Login' : '🔴 Logout'}
                                        </span>
                                    </td>
                                    <td style="padding: 12px; font-family: monospace;">${log.ip_address || 'N/A'}</td>
                                    <td style="padding: 12px;">${new Date(log.created_at).toLocaleString('pl-PL')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // =====================================
    // ZMIANA HASŁA UŻYTKOWNIKA
    // =====================================
    showChangePasswordModal(userId, userName) {
        const modal = document.createElement('div');
        modal.id = 'changePasswordModal';
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; width: 95%;">
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #3B82F6 100%); padding: 25px; border-radius: 12px 12px 0 0; color: white;">
                    <h2 style="margin: 0;">🔑 Zmiana hasła</h2>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Użytkownik: <strong>${this.escapeHtml(userName)}</strong></p>
                </div>
                
                <form id="changePasswordForm" style="padding: 30px;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #2c3e50;">
                            Nowe hasło *
                        </label>
                        <input type="password" id="newPassword" required 
                               placeholder="Min. 8 znaków, wielka litera, znak specjalny" 
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #2c3e50;">
                            Potwierdź nowe hasło *
                        </label>
                        <input type="password" id="confirmPassword" required 
                               placeholder="Wpisz ponownie" 
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    </div>
                    
                    <div id="passwordStrength" style="margin-bottom: 15px; padding: 10px; border-radius: 6px; display: none;"></div>
                    
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button type="submit" style="
                            padding: 12px 30px;
                            background: linear-gradient(135deg, #3B82F6 0%, #3B82F6 100%);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 1rem;
                        ">
                            ✓ Zmień hasło
                        </button>
                        <button type="button" onclick="this.closest('.modal').remove()" style="
                            padding: 12px 30px;
                            background: #e0e0e0;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 1rem;
                        ">
                            ✕ Anuluj
                        </button>
                    </div>
                    
                    <div id="changePasswordStatus" style="margin-top: 20px;"></div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        const form = document.getElementById('changePasswordForm');
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const strengthDiv = document.getElementById('passwordStrength');
        
        // Sprawdzanie siły hasła
        newPasswordInput.addEventListener('input', () => {
            const password = newPasswordInput.value;
            if (password.length > 0) {
                let strength = 0;
                let feedback = [];
                
                if (password.length >= 8) { strength++; feedback.push('✓ Długość OK'); }
                else { feedback.push('✗ Min. 8 znaków'); }
                
                if (/[A-Z]/.test(password)) { strength++; feedback.push('✓ Wielka litera'); }
                else { feedback.push('✗ Brak wielkiej litery'); }
                
                if (/[0-9]/.test(password)) { strength++; feedback.push('✓ Cyfra'); }
                else { feedback.push('✗ Brak cyfry'); }
                
                if (/[^A-Za-z0-9]/.test(password)) { strength++; feedback.push('✓ Znak specjalny'); }
                else { feedback.push('✗ Brak znaku specjalnego'); }
                
                const colors = ['#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6'];
                const labels = ['Słabe', 'Średnie', 'Dobre', 'Silne'];
                
                strengthDiv.style.display = 'block';
                strengthDiv.style.background = colors[strength - 1] + '22';
                strengthDiv.style.border = `2px solid ${colors[strength - 1]}`;
                strengthDiv.innerHTML = `
                    <strong style="color: ${colors[strength - 1]};">Siła hasła: ${labels[strength - 1]}</strong>
                    <div style="margin-top: 8px; font-size: 0.9rem; color: #555;">
                        ${feedback.join(' • ')}
                    </div>
                `;
            } else {
                strengthDiv.style.display = 'none';
            }
        });
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const statusDiv = document.getElementById('changePasswordStatus');
            
            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            if (newPassword !== confirmPassword) {
                statusDiv.innerHTML = '<div style="padding: 12px; background: #f8d7da; color: #721c24; border-radius: 6px;">❌ Hasła nie są identyczne</div>';
                return;
            }
            
            if (newPassword.length < 8) {
                statusDiv.innerHTML = '<div style="padding: 12px; background: #f8d7da; color: #721c24; border-radius: 6px;">❌ Hasło musi mieć minimum 8 znaków</div>';
                return;
            }
            
            try {
                statusDiv.innerHTML = '<div style="padding: 12px; background: #d4edda; color: #155724; border-radius: 6px;">⏳ Zmienianie hasła...</div>';
                
                const response = await api.request('/auth/change-password', {
                    method: 'PUT',
                    body: JSON.stringify({
                        userId: userId,
                        newPassword: newPassword
                    })
                });
                
                if (response.success) {
                    statusDiv.innerHTML = '<div style="padding: 12px; background: #d4edda; color: #155724; border-radius: 6px;">✅ Hasło zostało zmienione!</div>';
                    setTimeout(() => modal.remove(), 2000);
                } else {
                    statusDiv.innerHTML = `<div style="padding: 12px; background: #f8d7da; color: #721c24; border-radius: 6px;">❌ ${response.error || 'Błąd zmiany hasła'}</div>`;
                }
            } catch (error) {
                statusDiv.innerHTML = `<div style="padding: 12px; background: #f8d7da; color: #721c24; border-radius: 6px;">❌ ${error.message}</div>`;
            }
        });
    }

    // =====================================
    // EMPLOYEE DASHBOARD HR
    // =====================================
    async viewEmployeeDashboard(userId) {
        console.log('📊 Opening Employee Dashboard for user:', userId);
        
        // Create fullscreen modal
        const modal = document.createElement('div');
        modal.id = 'employeeDashboardModal';
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 95vw; width: 1400px; max-height: 90vh; overflow-y: auto;">
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 20px; border-radius: 12px 12px 0 0; color: white; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 10;">
                    <h2 style="margin: 0;">📊 Employee Dashboard HR</h2>
                    <button onclick="this.closest('.modal').remove()" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        font-size: 24px;
                        cursor: pointer;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                    ">✕</button>
                </div>
                
                <div id="employeeDashboardContainer" style="padding: 20px;">
                    <div style="text-align: center; padding: 60px 20px;">
                        <div class="spinner" style="margin: 0 auto 20px;"></div>
                        <p style="color: #666; font-size: 18px;">⏳ Ładowanie danych pracownika...</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Load and render employee dashboard
        try {
            if (!window.EmployeeDashboard) {
                throw new Error('Employee Dashboard module not loaded');
            }
            
            const dashboard = new window.EmployeeDashboard(userId);
            window.employeeDashboard = dashboard;
            
            await dashboard.loadData();
            await dashboard.render('employeeDashboardContainer');
            
            console.log('✅ Employee Dashboard rendered successfully');
        } catch (error) {
            console.error('❌ Error loading Employee Dashboard:', error);
            document.getElementById('employeeDashboardContainer').innerHTML = `
                <div style="padding: 40px; text-align: center;">
                    <p style="color: #3B82F6; font-weight: 600; font-size: 18px;">❌ Błąd ładowania dashboardu</p>
                    <p style="color: #666; margin-top: 10px;">${error.message}</p>
                    <p style="color: #999; margin-top: 20px; font-size: 14px;">
                        Upewnij się że employee-dashboard.js jest zaimportowany w index.html
                    </p>
                </div>
            `;
        }
    }

    // =====================================
    // MODAL WSZYSTKICH SPRAW
    // =====================================
    async showAllCasesModal() {
        console.log('🚀 showAllCasesModal() WYWOŁANA!');
        try {
            console.log('📋 Ładowanie wszystkich spraw...');
            
            const response = await window.api.request('/cases');
            const cases = response.cases || [];
            
            console.log(`✅ Załadowano ${cases.length} spraw`);
            
            this.renderCasesModal(cases);
        } catch (error) {
            console.error('❌ Błąd ładowania spraw:', error);
            alert('Nie udało się pobrać spraw');
        }
    }
    
    renderCasesModal(cases) {
        const modal = document.createElement('div');
        modal.id = 'allCasesModal';
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        const statusColors = {
            'open': '#3B82F6',
            'in_progress': '#10b981',
            'closed': '#95a5a6'
        };
        
        const statusLabels = {
            'open': '🟢 Otwarta',
            'in_progress': '🟡 W toku',
            'closed': '🔴 Zamknięta'
        };
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1200px; width: 90%; max-height: 80vh; overflow-y: auto; background: white; border-radius: 12px;">
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 20px; border-radius: 12px 12px 0 0; color: white; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 10;">
                    <h2 style="margin: 0;">📋 Wszystkie sprawy</h2>
                    <button onclick="this.closest('.modal').remove()" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        font-size: 24px;
                        cursor: pointer;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                    ">✕</button>
                </div>
                
                <div style="padding: 20px;">
                    ${cases.length > 0 ? `
                        <div style="margin-bottom: 20px; padding: 15px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3B82F6;">
                            <strong style="font-size: 1.1rem;">📊 Podsumowanie:</strong>
                            <span style="margin-left: 20px;">Razem: <strong>${cases.length}</strong> spraw</span>
                            <span style="margin-left: 20px;">Otwarte: <strong>${cases.filter(c => c.status === 'open').length}</strong></span>
                            <span style="margin-left: 20px;">W toku: <strong>${cases.filter(c => c.status === 'in_progress').length}</strong></span>
                            <span style="margin-left: 20px;">Zamknięte: <strong>${cases.filter(c => c.status === 'closed').length}</strong></span>
                        </div>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f5f5f5; text-align: left;">
                                    <th style="padding: 12px; border-bottom: 2px solid #ddd; color: #1a2332; font-weight: 700;">Numer</th>
                                    <th style="padding: 12px; border-bottom: 2px solid #ddd; color: #1a2332; font-weight: 700;">Tytuł</th>
                                    <th style="padding: 12px; border-bottom: 2px solid #ddd; color: #1a2332; font-weight: 700;">Typ</th>
                                    <th style="padding: 12px; border-bottom: 2px solid #ddd; color: #1a2332; font-weight: 700;">Status</th>
                                    <th style="padding: 12px; border-bottom: 2px solid #ddd; color: #1a2332; font-weight: 700;">Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${cases.map(caseItem => `
                                    <tr style="border-bottom: 1px solid #e0e0e0;">
                                        <td style="padding: 12px; color: #1a2332;"><strong>${caseItem.case_number || `#${caseItem.id}`}</strong></td>
                                        <td style="padding: 12px; color: #1a2332;">${caseItem.title || 'Bez tytułu'}</td>
                                        <td style="padding: 12px; color: #666;">${caseItem.case_type || '-'}</td>
                                        <td style="padding: 12px;">
                                            <span style="background: ${statusColors[caseItem.status] || '#999'}; color: white; padding: 4px 12px; border-radius: 12px; font-weight: 600; font-size: 0.85rem;">
                                                ${statusLabels[caseItem.status] || caseItem.status}
                                            </span>
                                        </td>
                                        <td style="padding: 12px;">
                                            <button class="view-case-btn" data-case-id="${caseItem.id}" style="
                                                padding: 6px 12px;
                                                background: #3B82F6;
                                                color: white;
                                                border: none;
                                                border-radius: 6px;
                                                cursor: pointer;
                                                font-size: 0.9rem;
                                            ">
                                                👁️ Zobacz
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p style="text-align: center; padding: 40px; color: #999;">Brak spraw</p>'}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Dodaj event listenery do przycisków "Zobacz"
        const viewButtons = modal.querySelectorAll('.view-case-btn');
        
        viewButtons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const caseId = btn.getAttribute('data-case-id');
                console.log(`🔘 Przycisk Zobacz kliknięty dla sprawy ID: ${caseId}`);
                
                // Zamknij modal
                modal.remove();
                
                // Otwórz szczegóły sprawy
                if (window.crmManager && window.crmManager.viewCase) {
                    window.crmManager.viewCase(caseId);
                } else {
                    console.log('⚠️ Funkcja viewCase nie istnieje');
                    alert(`Szczegóły sprawy #${caseId} - funkcja w przygotowaniu`);
                }
            });
        });
    }

    // =====================================
    // MODAL WSZYSTKICH KLIENTÓW
    // =====================================
    async showAllClientsModal() {
        console.log('🚀🚀🚀 showAllClientsModal() WYWOŁANA! 🚀🚀🚀');
        try {
            console.log('👥 Ładowanie wszystkich klientów...');
            
            const response = await window.api.request('/clients');
            const clients = response.clients || [];
            
            console.log(`✅ Załadowano ${clients.length} klientów`);
            
            // Pobierz liczbę spraw dla każdego klienta
            const casesResponse = await window.api.request('/cases');
            const allCases = casesResponse.cases || [];
            
            clients.forEach(client => {
                client.cases_count = allCases.filter(c => c.client_id === client.id).length;
            });
            
            this.renderClientsModal(clients);
        } catch (error) {
            console.error('❌ Błąd ładowania klientów:', error);
            alert('Nie udało się pobrać klientów');
        }
    }
    
    renderClientsModal(clients) {
        const modal = document.createElement('div');
        modal.id = 'allClientsModal';
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1000px; width: 90%; max-height: 80vh; overflow-y: auto; background: white; border-radius: 12px;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 12px 12px 0 0; color: white; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 10;">
                    <h2 style="margin: 0;">👥 Wszyscy klienci</h2>
                    <button onclick="this.closest('.modal').remove()" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        font-size: 24px;
                        cursor: pointer;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                    ">✕</button>
                </div>
                
                <div style="padding: 20px;">
                    ${clients.length > 0 ? `
                        <div style="margin-bottom: 20px; padding: 15px; background: #f0fff4; border-radius: 8px; border-left: 4px solid #10b981;">
                            <strong style="font-size: 1.1rem;">📊 Podsumowanie:</strong>
                            <span style="margin-left: 20px;">Razem: <strong>${clients.length}</strong> klientów</span>
                            <span style="margin-left: 20px;">Łączna liczba spraw: <strong>${clients.reduce((sum, c) => sum + c.cases_count, 0)}</strong></span>
                        </div>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f5f5f5; text-align: left;">
                                    <th style="padding: 12px; border-bottom: 2px solid #ddd; color: #1a2332; font-weight: 700;">ID</th>
                                    <th style="padding: 12px; border-bottom: 2px solid #ddd; color: #1a2332; font-weight: 700;">Klient</th>
                                    <th style="padding: 12px; border-bottom: 2px solid #ddd; color: #1a2332; font-weight: 700;">Email</th>
                                    <th style="padding: 12px; border-bottom: 2px solid #ddd; color: #1a2332; font-weight: 700;">Telefon</th>
                                    <th style="padding: 12px; border-bottom: 2px solid #ddd; color: #1a2332; font-weight: 700;">Liczba spraw</th>
                                    <th style="padding: 12px; border-bottom: 2px solid #ddd; color: #1a2332; font-weight: 700;">Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${clients.map(client => {
                                    const clientName = client.company_name || `${client.first_name || ''} ${client.last_name || ''}`;
                                    return `
                                        <tr style="border-bottom: 1px solid #e0e0e0;">
                                            <td style="padding: 12px; color: #1a2332;"><strong>#${client.id}</strong></td>
                                            <td style="padding: 12px; color: #1a2332;">
                                                ${client.company_name ? `<strong>🏢 ${client.company_name}</strong>` : `👤 ${clientName}`}
                                            </td>
                                            <td style="padding: 12px; color: #1a2332;">${client.email || '-'}</td>
                                            <td style="padding: 12px; color: #1a2332;">${client.phone || '-'}</td>
                                            <td style="padding: 12px;">
                                                <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-weight: 600;">
                                                    ${client.cases_count || 0} ${client.cases_count === 1 ? 'sprawa' : 'spraw'}
                                                </span>
                                            </td>
                                            <td style="padding: 12px;">
                                                <button class="view-client-btn" data-client-id="${client.id}" style="
                                                    padding: 6px 12px;
                                                    background: #3B82F6;
                                                    color: white;
                                                    border: none;
                                                    border-radius: 6px;
                                                    cursor: pointer;
                                                    font-size: 0.9rem;
                                                ">
                                                    👁️ Zobacz
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    ` : '<p style="text-align: center; padding: 40px; color: #999;">Brak klientów</p>'}
                </div>
            </div>
        `;
        
        console.log('📦 Dodaję modal do body...');
        document.body.appendChild(modal);
        console.log('✅ Modal dodany do body!');
        
        // Dodaj event listenery do przycisków "Zobacz"
        console.log('🔍 Szukam przycisków .view-client-btn...');
        const viewButtons = modal.querySelectorAll('.view-client-btn');
        console.log(`🔍 Znaleziono ${viewButtons.length} przycisków Zobacz`);
        
        viewButtons.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const clientId = btn.getAttribute('data-client-id');
                console.log(`🔘 Przycisk Zobacz kliknięty dla klienta ID: ${clientId}`);
                
                // Zamknij modal
                console.log('🗑️ Zamykam modal...');
                modal.remove();
                
                // Otwórz dashboard klienta
                console.log('📊 Otwieram dashboard klienta...');
                if (window.crmManager && window.crmManager.viewClient) {
                    window.crmManager.viewClient(clientId);
                } else {
                    console.log('⚠️ Funkcja viewClient nie istnieje, próbuję alternatywnie...');
                    alert(`Dashboard klienta #${clientId} - funkcja w przygotowaniu`);
                }
            });
        });
        
        console.log(`✅ Dodano ${viewButtons.length} event listenerów`);
    }

    // =====================================
    // EMPLOYEE DASHBOARD - SUPER SIMPLE
    // =====================================
    async viewEmployeeDashboard(userId) {
        console.log('🚀 viewEmployeeDashboard START for user:', userId);
        
        // Ukryj admin dashboard
        const adminView = document.getElementById('adminView');
        if (adminView) {
            adminView.style.display = 'none';
            console.log('✅ Admin view hidden');
        }
        
        // Znajdź lub stwórz kontener
        let container = document.getElementById('employeeDashboardView');
        if (!container) {
            container = document.createElement('div');
            container.id = 'employeeDashboardView';
            // Dodaj do main-container (obok adminView)
            const mainContainer = document.querySelector('.main-container');
            if (mainContainer) {
                mainContainer.appendChild(container);
                console.log('✅ Created employee dashboard container in main-container');
            } else {
                document.body.appendChild(container);
                console.log('⚠️ main-container not found, appended to body');
            }
        }
        
        // Ustaw style kontenera - ABSOLUTE positioning z overflow
        container.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; width: 100%; background: white; overflow: hidden; z-index: 1000;';
        
        // Dodaj header i miejsce na dashboard
        container.innerHTML = `
            <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 20px; color: white; flex-shrink: 0;">
                <button onclick="window.adminDashboard.closeEmployeeDashboard()" style="float: right; background: rgba(255,255,255,0.2); border: none; color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer;">← Powrót</button>
                <h1 style="margin: 0;">👥 Employee Dashboard HR</h1>
            </div>
            <div id="employeeDashboardContent" style="flex: 1; overflow-y: auto; padding: 20px; background: #f5f5f5;">
                <p style="text-align: center; padding: 40px; font-size: 1.2rem;">⏳ Ładowanie...</p>
            </div>
        `;
        
        console.log('✅ HTML inserted');
        
        // Załaduj i renderuj dashboard
        setTimeout(async () => {
            try {
                console.log('📊 Loading EmployeeDashboard...');
                if (!window.EmployeeDashboard) {
                    throw new Error('EmployeeDashboard class not loaded');
                }
                
                const dashboard = new window.EmployeeDashboard(userId);
                await dashboard.loadData();
                await dashboard.render('employeeDashboardContent');
                window.employeeDashboard = dashboard;
                console.log('✅ Dashboard loaded and rendered!');
            } catch (error) {
                console.error('❌ Error:', error);
                document.getElementById('employeeDashboardContent').innerHTML = `
                    <div style="padding: 40px; text-align: center; color: red;">
                        <h2>❌ Błąd ładowania</h2>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        }, 100);
    }
    
    closeEmployeeDashboard() {
        console.log('🔙 Closing employee dashboard');
        const container = document.getElementById('employeeDashboardView');
        if (container) {
            container.remove();
        }
        const adminView = document.getElementById('adminView');
        if (adminView) {
            adminView.style.display = 'block';
        }
    }

    // =====================================
    // DASHBOARD FINANSOWY - PROWIZJE
    // =====================================
    showFinanceDashboard() {
        console.log('🔥 showFinanceDashboard() wywołane - otwiera test prowizji!');
        window.open('/test-commissions.html', '_blank');
    }
}

// Utwórz globalną instancję
const adminDashboard = new AdminDashboard();
window.adminDashboard = adminDashboard;

console.log('✅ Admin Dashboard v3.0 załadowany');
