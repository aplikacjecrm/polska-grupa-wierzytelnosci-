// ==========================================
// LAWYER DASHBOARD - DASHBOARD MECENASA
// Wersja: 1.0 - Modułowy z integracją czatu
// ==========================================

class LawyerDashboard {
    constructor() {
        this.currentUser = null;
        this.myCases = [];
        this.myEvents = [];
        this.stats = {};
        this.refreshInterval = null;
        
        // Nasłuch eventów
        this.setupEventListeners();
        
        console.log('👔 Lawyer Dashboard zainicjalizowany');
    }

    setupEventListeners() {
        // Nasłuchuj eventów z systemu
        eventBus.on('case:created', () => this.refreshStats());
        eventBus.on('case:updated', () => this.refreshStats());
        eventBus.on('event:created', () => this.loadMyEvents());
        eventBus.on('chat:newMessage', (data) => this.handleNewChatMessage(data));
        eventBus.on('payment:completed', () => this.refreshStats());
        eventBus.on('dashboard:refresh', () => this.refresh());
    }

    async init() {
        console.log('📊 Lawyer Dashboard init started');
        try {
            // Pobierz aktualnego użytkownika
            const userStr = localStorage.getItem('currentUser');
            console.log('🔍 currentUser z localStorage:', userStr);
            this.currentUser = JSON.parse(userStr || '{}');
            console.log('🔍 Parsed currentUser:', this.currentUser);
            
            if (!this.currentUser.id) {
                console.error('❌ Brak zalogowanego użytkownika - pokazuję komunikat');
                this.renderNoUser();
                return;
            }
            
            await this.loadMyCases();
            await this.loadMyEvents();
            await this.loadStats();
            this.render();
            this.startAutoRefresh();
            
            console.log('✅ Lawyer Dashboard init completed');
        } catch (error) {
            console.error('❌ Lawyer Dashboard init error:', error);
            this.renderError(error);
        }
    }

    async loadMyCases() {
        try {
            const response = await api.request('/cases');
            const allCases = response.cases || [];
            
            // Filtruj tylko sprawy przypisane do tego mecenasa
            this.myCases = allCases.filter(c => 
                c.assigned_to === this.currentUser.id || 
                c.case_manager_id === this.currentUser.id
            );
            
            console.log(`✅ Loaded ${this.myCases.length} my cases`);
        } catch (error) {
            console.error('Błąd ładowania spraw:', error);
            this.myCases = [];
        }
    }

    async loadMyEvents() {
        try {
            const response = await api.request('/events');
            const allEvents = response.events || [];
            
            // Filtruj wydarzenia z moich spraw
            const myCaseIds = this.myCases.map(c => c.id);
            this.myEvents = allEvents.filter(e => myCaseIds.includes(e.case_id));
            
            console.log(`✅ Loaded ${this.myEvents.length} my events`);
        } catch (error) {
            console.error('Błąd ładowania wydarzeń:', error);
            this.myEvents = [];
        }
    }

    async loadStats() {
        try {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

            this.stats = {
                // Sprawy
                totalCases: this.myCases.length,
                openCases: this.myCases.filter(c => c.status === 'open').length,
                inProgressCases: this.myCases.filter(c => c.status === 'in_progress').length,
                closedCases: this.myCases.filter(c => c.status === 'closed').length,
                
                // Wydarzenia
                todayEvents: this.myEvents.filter(e => {
                    const eventDate = new Date(e.start_date);
                    return eventDate >= today && eventDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
                }).length,
                weekEvents: this.myEvents.filter(e => {
                    const eventDate = new Date(e.start_date);
                    return eventDate >= today && eventDate < weekLater;
                }).length,
                
                // Klienci (unikalni z moich spraw)
                uniqueClients: [...new Set(this.myCases.map(c => c.client_id))].length
            };
            
            // Emit event
            eventBus.emit('dashboard:statsUpdated', { stats: this.stats, dashboard: 'lawyer' });
            
        } catch (error) {
            console.error('Błąd ładowania statystyk:', error);
            this.stats = {};
        }
    }

    render() {
        console.log('🎨 RENDER START - Lawyer Dashboard');
        console.log('📊 Stats:', this.stats);
        console.log('📋 Sprawy:', this.myCases.length);
        console.log('📅 Wydarzenia:', this.myEvents.length);
        
        const container = document.getElementById('lawyer-dashboardView');
        if (!container) {
            console.error('❌ Element #lawyer-dashboardView not found!');
            return;
        }
        
        console.log('✅ Container znaleziony, renderuję...');

        container.innerHTML = `
            <div class="view-header">
                <h2>👔 Mój Dashboard${this.currentUser.name ? ' - ' + this.escapeHtml(this.currentUser.name) : ''}</h2>
                <div style="display: flex; gap: 10px;">
                    <button onclick="lawyerDashboard.refresh()" class="btn-secondary">
                        🔄 Odśwież
                    </button>
                </div>
            </div>

            <!-- KPI Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin: 20px;">
                ${this.renderKPICards()}
            </div>

            <!-- Pilne dzisiaj -->
            ${this.renderTodayUrgent()}

            <!-- Nadchodzące wydarzenia (7 dni) -->
            ${this.renderUpcomingEvents()}

            <!-- Moje sprawy - szybki przegląd -->
            <div style="background: white; margin: 20px; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 15px;">📋 Moje sprawy (szybki dostęp)</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
                    ${this.renderQuickCases()}
                </div>
            </div>

            <!-- Monitor płatności (TODO: integracja z przyszłym modułem płatności) -->
            <div style="background: white; margin: 20px; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 15px;">💰 Monitor płatności</h3>
                <p style="color: #999; text-align: center; padding: 20px;">
                    🔜 Będzie dostępny po implementacji modułu płatności<br>
                    <small>Tutaj zobaczysz klientów z zaległościami</small>
                </p>
            </div>
        `;
    }

    renderKPICards() {
        const cards = [
            { label: 'Moje sprawy', value: this.stats.totalCases, icon: '📋', gradient: 'linear-gradient(145deg, #3B82F6, #1E40AF)' },
            { label: 'W toku', value: this.stats.inProgressCases, icon: '⚖️', gradient: 'linear-gradient(145deg, #3B82F6, #3B82F6)' },
            { label: 'Dziś', value: this.stats.todayEvents, icon: '🔥', gradient: 'linear-gradient(145deg, #3B82F6, #1E40AF)' },
            { label: 'Tydzień', value: this.stats.weekEvents, icon: '📅', gradient: 'linear-gradient(145deg, #3B82F6, #3B82F6)' },
            { label: 'Klientów', value: this.stats.uniqueClients, icon: '👥', gradient: 'linear-gradient(145deg, #3B82F6, #1E40AF)' }
        ];

        return cards.map(card => `
            <div style="background: ${card.gradient}; padding: 20px; border-radius: 12px; color: white; text-align: center; cursor: pointer;" 
                 onclick="lawyerDashboard.quickAction('${card.label}')">
                <div style="font-size: 2rem;">${card.icon}</div>
                <div style="font-size: 2.5rem; font-weight: 700; margin: 10px 0;">${card.value || 0}</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">${card.label}</div>
            </div>
        `).join('');
    }

    renderTodayUrgent() {
        const todayEvents = this.myEvents.filter(e => {
            const eventDate = new Date(e.start_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            return eventDate >= today && eventDate < tomorrow;
        });

        if (todayEvents.length === 0) {
            return `
                <div style="background: linear-gradient(145deg, #3B82F6, #3B82F6); margin: 20px; padding: 20px; border-radius: 12px; color: white; text-align: center;">
                    <h3 style="margin: 0;">✅ Brak pilnych spraw na dziś</h3>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Świetnie! Możesz skupić się na planowaniu</p>
                </div>
            `;
        }

        return `
            <div style="background: linear-gradient(145deg, #3B82F6, #1E40AF); margin: 20px; padding: 20px; border-radius: 12px; color: white;">
                <h3 style="margin-bottom: 15px;">🔥 Pilne dzisiaj (${todayEvents.length})</h3>
                <div style="display: grid; gap: 10px;">
                    ${todayEvents.slice(0, 3).map(event => `
                        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; cursor: pointer;"
                             onclick="window.viewEventDetails && window.viewEventDetails(${event.id})">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: 600; font-size: 1.1rem;">${this.escapeHtml(event.title)}</div>
                                    <div style="opacity: 0.9; margin-top: 5px;">
                                        🕐 ${new Date(event.start_date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                        ${event.location ? `📍 ${this.escapeHtml(event.location)}` : ''}
                                    </div>
                                </div>
                                <div style="font-size: 1.5rem;">▶</div>
                            </div>
                        </div>
                    `).join('')}
                    ${todayEvents.length > 3 ? `<p style="text-align: center; opacity: 0.9;">+ ${todayEvents.length - 3} więcej...</p>` : ''}
                </div>
            </div>
        `;
    }

    renderUpcomingEvents() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const upcomingEvents = this.myEvents.filter(e => {
            const eventDate = new Date(e.start_date);
            return eventDate > new Date(today.getTime() + 24 * 60 * 60 * 1000) && eventDate < weekLater;
        }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

        if (upcomingEvents.length === 0) {
            return '';
        }

        return `
            <div style="background: white; margin: 20px; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 15px;">📅 Nadchodzące wydarzenia (7 dni) - ${upcomingEvents.length}</h3>
                <div style="display: grid; gap: 10px;">
                    ${upcomingEvents.slice(0, 5).map(event => {
                        const eventDate = new Date(event.start_date);
                        const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
                        return `
                            <div style="border-left: 4px solid #3B82F6; padding: 12px; background: #f8f9fa; border-radius: 6px; cursor: pointer;"
                                 onclick="window.viewEventDetails && window.viewEventDetails(${event.id})">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; color: #2c3e50;">${this.escapeHtml(event.title)}</div>
                                        <div style="color: #7f8c8d; font-size: 0.9rem; margin-top: 5px;">
                                            📅 ${eventDate.toLocaleDateString('pl-PL')} ${eventDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                            ${event.location ? `<br>📍 ${this.escapeHtml(event.location)}` : ''}
                                        </div>
                                    </div>
                                    <div style="text-align: right; color: #3B82F6; font-weight: 600;">
                                        Za ${daysUntil} ${daysUntil === 1 ? 'dzień' : 'dni'}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                    ${upcomingEvents.length > 5 ? `<p style="text-align: center; color: #999;">+ ${upcomingEvents.length - 5} więcej...</p>` : ''}
                </div>
            </div>
        `;
    }

    renderQuickCases() {
        console.log(`🔍 renderQuickCases: mam ${this.myCases.length} spraw`);
        
        if (this.myCases.length === 0) {
            return `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #f8f9fa; border-radius: 8px; border: 2px dashed #ddd;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">📋</div>
                    <h4 style="color: #7f8c8d; margin-bottom: 10px;">Brak przypisanych spraw</h4>
                    <p style="color: #999; font-size: 0.9rem;">
                        Kiedy zostaną Ci przypisane sprawy, pojawią się tutaj
                    </p>
                </div>
            `;
        }

        const statusColors = {
            'open': '#3B82F6',
            'in_progress': '#3B82F6',
            'closed': '#3B82F6'
        };

        const statusLabels = {
            'open': 'Otwarta',
            'in_progress': 'W toku',
            'closed': 'Zamknięta'
        };

        return this.myCases.slice(0, 6).map(caseItem => `
            <div style="border: 2px solid ${statusColors[caseItem.status] || '#ccc'}; padding: 15px; border-radius: 8px; cursor: pointer; transition: all 0.3s;"
                 onclick="window.viewCase && window.viewCase(${caseItem.id})"
                 onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
                 onmouseout="this.style.transform=''; this.style.boxShadow=''">
                <div style="font-weight: 600; color: #2c3e50; margin-bottom: 8px;">${this.escapeHtml(caseItem.case_number || `Sprawa #${caseItem.id}`)}</div>
                <div style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 8px;">${this.escapeHtml(caseItem.title || 'Bez tytułu')}</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                    <span style="background: ${statusColors[caseItem.status]}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem;">
                        ${statusLabels[caseItem.status] || caseItem.status}
                    </span>
                    <span style="color: #3B82F6;">▶</span>
                </div>
            </div>
        `).join('');
    }

    quickAction(actionType) {
        console.log('Quick action:', actionType);
        // TODO: Implementacja szybkich akcji
        if (actionType === 'Moje sprawy') {
            window.location.hash = '#crm';
        }
    }

    async refresh() {
        console.log('🔄 Odświeżanie lawyer dashboard...');
        await this.loadMyCases();
        await this.loadMyEvents();
        await this.loadStats();
        this.render();
    }

    async refreshStats() {
        await this.loadStats();
        // Aktualizuj tylko KPI cards bez pełnego re-renderu
        const kpiContainer = document.querySelector('[style*="grid-template-columns: repeat(auto-fit"]');
        if (kpiContainer) {
            kpiContainer.innerHTML = this.renderKPICards();
        }
    }

    handleNewChatMessage(data) {
        console.log('💬 Nowa wiadomość czatu:', data);
        // TODO: Pokaż notyfikację w dashboardzie
        eventBus.emit('dashboard:alertShow', {
            title: 'Nowa wiadomość',
            message: `Wiadomość od ${data.from}`,
            type: 'info'
        });
    }

    startAutoRefresh() {
        // Odświeżaj statystyki co 5 minut
        this.refreshInterval = setInterval(() => this.refreshStats(), 5 * 60 * 1000);
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    renderNoUser() {
        const container = document.getElementById('lawyer-dashboardView');
        if (!container) {
            console.error('❌ Element #lawyer-dashboardView not found!');
            return;
        }

        container.innerHTML = `
            <div class="view-header">
                <h2>👔 Mój Dashboard</h2>
            </div>
            <div style="background: white; margin: 20px; padding: 40px; border-radius: 12px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 20px;">⚠️</div>
                <h3 style="color: #3B82F6; margin-bottom: 15px;">Nie można załadować danych użytkownika</h3>
                <p style="color: #7f8c8d; margin-bottom: 20px;">
                    Brak informacji o zalogowanym użytkowniku.<br>
                    Sprawdź localStorage.currentUser w konsoli.
                </p>
                <button onclick="location.reload()" class="btn-primary">
                    🔄 Odśwież stronę
                </button>
            </div>
        `;
    }

    renderError(error) {
        const container = document.getElementById('lawyer-dashboardView');
        if (!container) return;

        container.innerHTML = `
            <div class="view-header">
                <h2>👔 Mój Dashboard</h2>
            </div>
            <div style="background: white; margin: 20px; padding: 40px; border-radius: 12px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 20px;">❌</div>
                <h3 style="color: #3B82F6; margin-bottom: 15px;">Wystąpił błąd</h3>
                <p style="color: #7f8c8d; margin-bottom: 20px;">
                    ${this.escapeHtml(error.message || 'Nieznany błąd')}
                </p>
                <p style="color: #999; font-size: 0.9rem;">
                    Sprawdź konsolę przeglądarki (F12) aby zobaczyć szczegóły.
                </p>
                <button onclick="lawyerDashboard.refresh()" class="btn-primary" style="margin-top: 15px;">
                    🔄 Spróbuj ponownie
                </button>
            </div>
        `;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Utwórz globalną instancję
const lawyerDashboard = new LawyerDashboard();
window.lawyerDashboard = lawyerDashboard;

console.log('✅ Lawyer Dashboard v1.0 załadowany');
