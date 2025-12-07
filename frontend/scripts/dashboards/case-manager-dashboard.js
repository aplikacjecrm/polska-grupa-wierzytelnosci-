/**
 * Case Manager Dashboard v1.0
 * Dashboard dla Opiekuna Sprawy
 * 
 * Różnica od Lawyer Dashboard:
 * - Mecenas: assigned_to (prowadzący sprawę)
 * - Opiekun: case_manager_id (koordynator sprawy)
 */

class CaseManagerDashboard {
    constructor() {
        console.log('📊 Case Manager Dashboard zainicjalizowany');
        this.currentUser = {};
        this.managedCases = [];
        this.myEvents = [];
        this.stats = {};
        this.refreshInterval = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Event Bus listeners
        eventBus.on('case:created', () => this.refreshStats());
        eventBus.on('case:updated', () => this.loadManagedCases());
        eventBus.on('event:created', () => this.loadMyEvents());
        eventBus.on('document:uploaded', () => this.refreshStats());
        eventBus.on('chat:newMessage', (data) => this.handleNewChatMessage(data));
        eventBus.on('dashboard:refresh', () => this.refresh());
    }

    async init() {
        console.log('📊 Case Manager Dashboard init started');
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
            
            await this.loadManagedCases();
            await this.loadMyEvents();
            await this.loadStats();
            this.render();
            this.startAutoRefresh();
            
            console.log('✅ Case Manager Dashboard init completed');
        } catch (error) {
            console.error('❌ Case Manager Dashboard init error:', error);
            this.renderError(error);
        }
    }

    async loadManagedCases() {
        try {
            const response = await api.request('/cases');
            const allCases = response.cases || [];
            
            // Filtruj tylko sprawy gdzie jestem opiekunem (case_manager_id)
            this.managedCases = allCases.filter(c => 
                c.case_manager_id === this.currentUser.id
            );
            
            console.log(`✅ Loaded ${this.managedCases.length} managed cases`);
        } catch (error) {
            console.error('Błąd ładowania spraw:', error);
            this.managedCases = [];
        }
    }

    async loadMyEvents() {
        try {
            const response = await api.request('/events');
            const allEvents = response.events || [];
            
            // Filtruj wydarzenia z moich spraw
            const myCaseIds = this.managedCases.map(c => c.id);
            this.myEvents = allEvents.filter(e => myCaseIds.includes(e.case_id));
            
            console.log(`✅ Loaded ${this.myEvents.length} events from my managed cases`);
        } catch (error) {
            console.error('Błąd ładowania wydarzeń:', error);
            this.myEvents = [];
        }
    }

    async loadStats() {
        try {
            // Sprawy pod opieką
            const totalCases = this.managedCases.length;
            const activeCases = this.managedCases.filter(c => c.status !== 'closed').length;
            
            // Unikalni klienci
            const uniqueClients = new Set(
                this.managedCases.map(c => c.client_id).filter(Boolean)
            ).size;
            
            // Wydarzenia dziś i przyszłe
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayEvents = this.myEvents.filter(e => {
                const eventDate = new Date(e.start_date);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate.getTime() === today.getTime();
            }).length;
            
            const futureEvents = this.myEvents.filter(e => {
                return new Date(e.start_date) > new Date();
            }).length;
            
            // Nowe dokumenty (ostatnie 7 dni)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            let newDocuments = 0;
            for (const caseItem of this.managedCases) {
                try {
                    const docs = await api.request(`/documents/case/${caseItem.id}`);
                    if (docs.documents) {
                        newDocuments += docs.documents.filter(d => 
                            new Date(d.uploaded_at) > sevenDaysAgo
                        ).length;
                    }
                } catch (error) {
                    console.error(`Błąd ładowania dokumentów dla sprawy ${caseItem.id}:`, error);
                }
            }
            
            this.stats = {
                totalCases,
                activeCases,
                uniqueClients,
                todayEvents,
                futureEvents,
                newDocuments
            };
            
            // Emit event
            eventBus.emit('dashboard:statsUpdated', { stats: this.stats, dashboard: 'case-manager' });
            
        } catch (error) {
            console.error('Błąd ładowania statystyk:', error);
            this.stats = {};
        }
    }

    render() {
        console.log('🎨 RENDER START - Case Manager Dashboard');
        console.log('📊 Stats:', this.stats);
        console.log('📋 Sprawy pod opieką:', this.managedCases.length);
        console.log('📅 Wydarzenia:', this.myEvents.length);
        
        const container = document.getElementById('case-manager-dashboardView');
        if (!container) {
            console.error('❌ Element #case-manager-dashboardView not found!');
            return;
        }
        
        console.log('✅ Container znaleziony, renderuję...');

        container.innerHTML = `
            <div class="view-header">
                <h2>📂 Dashboard Opiekuna Sprawy${this.currentUser.name ? ' - ' + this.escapeHtml(this.currentUser.name) : ''}</h2>
                <div style="display: flex; gap: 10px;">
                    <button onclick="caseManagerDashboard.refresh()" class="btn-secondary">
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

            <!-- Moje sprawy pod opieką -->
            <div style="margin: 20px;">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">📋 Sprawy pod moją opieką</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
                    ${this.renderManagedCases()}
                </div>
            </div>

            <!-- Placeholder: Monitor dokumentów -->
            <div style="margin: 20px; padding: 20px; background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); border-radius: 12px; color: white;">
                <h3 style="margin-bottom: 10px;">📄 Monitor Dokumentów</h3>
                <p style="opacity: 0.9;">Nowe dokumenty: ${this.stats.newDocuments || 0} (ostatnie 7 dni)</p>
                <p style="opacity: 0.7; font-size: 0.9rem;">Moduł zarządzania dokumentami - w przygotowaniu</p>
            </div>
        `;
    }

    renderKPICards() {
        const cards = [
            {
                title: 'Sprawy pod opieką',
                value: this.stats.totalCases || 0,
                icon: '📋',
                color: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
                action: 'caseManagerDashboard.showAllCases()'
            },
            {
                title: 'Aktywne',
                value: this.stats.activeCases || 0,
                icon: '🔥',
                color: 'linear-gradient(135deg, #3B82F6 0%, #f5576c 100%)',
                action: 'caseManagerDashboard.showActiveCases()'
            },
            {
                title: 'Klienci',
                value: this.stats.uniqueClients || 0,
                icon: '👥',
                color: 'linear-gradient(135deg, #60A5FA 0%, #60A5FA 100%)',
                action: 'caseManagerDashboard.showClients()'
            },
            {
                title: 'Dziś',
                value: this.stats.todayEvents || 0,
                icon: '⏰',
                color: 'linear-gradient(135deg, #fa709a 0%, #3B82F6 100%)',
                action: 'caseManagerDashboard.showTodayEvents()'
            },
            {
                title: 'Nadchodzące',
                value: this.stats.futureEvents || 0,
                icon: '📅',
                color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                action: 'caseManagerDashboard.showUpcomingEvents()'
            }
        ];

        return cards.map(card => `
            <div onclick="${card.action}" style="
                background: ${card.color};
                padding: 20px;
                border-radius: 12px;
                color: white;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 15px rgba(0,0,0,0.2)'"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)'">
                <div style="font-size: 2.5rem; margin-bottom: 10px;">${card.icon}</div>
                <div style="font-size: 2rem; font-weight: 700; margin-bottom: 5px;">${card.value}</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">${card.title}</div>
            </div>
        `).join('');
    }

    renderTodayUrgent() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayEvents = this.myEvents.filter(e => {
            const eventDate = new Date(e.start_date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === today.getTime();
        }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

        if (todayEvents.length === 0) {
            return `
                <div style="margin: 20px; padding: 20px; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); border-radius: 12px;">
                    <h3 style="color: #2c3e50; margin-bottom: 10px;">🔥 Pilne dzisiaj</h3>
                    <p style="color: #7f8c8d;">Brak pilnych wydarzeń na dziś - świetnie!</p>
                </div>
            `;
        }

        return `
            <div style="margin: 20px; padding: 20px; background: linear-gradient(135deg, #fa709a 0%, #3B82F6 100%); border-radius: 12px; color: white;">
                <h3 style="margin-bottom: 15px;">🔥 Pilne dzisiaj (${todayEvents.length})</h3>
                <div style="display: grid; gap: 10px;">
                    ${todayEvents.slice(0, 5).map(event => {
                        const eventTime = new Date(event.start_date).toLocaleTimeString('pl-PL', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        });
                        const caseItem = this.managedCases.find(c => c.id === event.case_id);
                        
                        return `
                            <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 8px; backdrop-filter: blur(10px);">
                                <div style="font-weight: 600; margin-bottom: 5px;">${eventTime} - ${this.escapeHtml(event.title)}</div>
                                <div style="font-size: 0.85rem; opacity: 0.9;">
                                    📋 ${caseItem ? this.escapeHtml(caseItem.case_number) : 'Sprawa nieznana'}
                                </div>
                                ${event.location ? `<div style="font-size: 0.85rem; opacity: 0.9;">📍 ${this.escapeHtml(event.location)}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                    ${todayEvents.length > 5 ? `<p style="text-align: center; opacity: 0.9;">+ ${todayEvents.length - 5} więcej...</p>` : ''}
                </div>
            </div>
        `;
    }

    renderUpcomingEvents() {
        const today = new Date();
        const next7Days = new Date();
        next7Days.setDate(next7Days.getDate() + 7);
        
        const upcomingEvents = this.myEvents
            .filter(e => {
                const eventDate = new Date(e.start_date);
                return eventDate > today && eventDate <= next7Days;
            })
            .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

        if (upcomingEvents.length === 0) {
            return '';
        }

        return `
            <div style="margin: 20px; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">📅 Nadchodzące wydarzenia (7 dni) - ${upcomingEvents.length}</h3>
                <div style="display: grid; gap: 10px;">
                    ${upcomingEvents.slice(0, 5).map(event => {
                        const eventDate = new Date(event.start_date);
                        const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
                        const caseItem = this.managedCases.find(c => c.id === event.case_id);
                        
                        return `
                            <div style="border-left: 4px solid #3B82F6; padding: 12px; background: #f8f9fa; border-radius: 4px;">
                                <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px;">
                                    ${this.escapeHtml(event.title)}
                                </div>
                                <div style="font-size: 0.85rem; color: #7f8c8d;">
                                    📅 ${eventDate.toLocaleDateString('pl-PL')} - Za ${daysUntil} ${daysUntil === 1 ? 'dzień' : 'dni'}
                                </div>
                                <div style="font-size: 0.85rem; color: #7f8c8d;">
                                    📋 ${caseItem ? this.escapeHtml(caseItem.case_number) : 'Sprawa nieznana'}
                                </div>
                            </div>
                        `;
                    }).join('')}
                    ${upcomingEvents.length > 5 ? `<p style="text-align: center; color: #999;">+ ${upcomingEvents.length - 5} więcej...</p>` : ''}
                </div>
            </div>
        `;
    }

    renderManagedCases() {
        console.log(`🔍 renderManagedCases: mam ${this.managedCases.length} spraw`);
        
        if (this.managedCases.length === 0) {
            return `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #f8f9fa; border-radius: 8px; border: 2px dashed #ddd;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">📂</div>
                    <h4 style="color: #7f8c8d; margin-bottom: 10px;">Brak spraw pod Twoją opieką</h4>
                    <p style="color: #999; font-size: 0.9rem;">
                        Kiedy zostaniesz przypisany jako opiekun sprawy, pojawi się ona tutaj
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

        return this.managedCases.slice(0, 6).map(caseItem => `
            <div style="background: white; border-radius: 8px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s;"
                 onclick="app.switchView('cases'); setTimeout(() => crmManager.viewCase(${caseItem.id}), 300)"
                 onmouseover="this.style.transform='translateY(-3px)'"
                 onmouseout="this.style.transform='translateY(0)'">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div style="font-weight: 600; color: #2c3e50;">${this.escapeHtml(caseItem.case_number || 'Brak numeru')}</div>
                    <span style="background: ${statusColors[caseItem.status] || '#95a5a6'}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem;">
                        ${statusLabels[caseItem.status] || caseItem.status}
                    </span>
                </div>
                <div style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 8px;">${this.escapeHtml(caseItem.title || 'Brak tytułu')}</div>
                ${caseItem.client_name ? `
                    <div style="color: #999; font-size: 0.85rem;">👤 ${this.escapeHtml(caseItem.client_name)}</div>
                ` : ''}
            </div>
        `).join('');
    }

    // Quick actions
    showAllCases() {
        app.switchView('cases');
        // TODO: Filtruj sprawy gdzie jestem opiekunem
    }

    showActiveCases() {
        app.switchView('cases');
        // TODO: Filtruj aktywne sprawy
    }

    showClients() {
        app.switchView('crm');
    }

    showTodayEvents() {
        app.switchView('calendar');
    }

    showUpcomingEvents() {
        app.switchView('calendar');
    }

    async refresh() {
        console.log('🔄 Odświeżanie Case Manager Dashboard...');
        await this.init();
    }

    async refreshStats() {
        await this.loadManagedCases();
        await this.loadMyEvents();
        await this.loadStats();
        this.render();
    }

    handleNewChatMessage(data) {
        // TODO: Obsługa nowych wiadomości czatu
        console.log('💬 Nowa wiadomość czatu:', data);
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
        const container = document.getElementById('case-manager-dashboardView');
        if (!container) {
            console.error('❌ Element #case-manager-dashboardView not found!');
            return;
        }

        container.innerHTML = `
            <div class="view-header">
                <h2>📂 Dashboard Opiekuna</h2>
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
        const container = document.getElementById('case-manager-dashboardView');
        if (!container) return;

        container.innerHTML = `
            <div class="view-header">
                <h2>📂 Dashboard Opiekuna</h2>
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
                <button onclick="caseManagerDashboard.refresh()" class="btn-primary" style="margin-top: 15px;">
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
const caseManagerDashboard = new CaseManagerDashboard();
window.caseManagerDashboard = caseManagerDashboard;

console.log('✅ Case Manager Dashboard v1.0 załadowany');
