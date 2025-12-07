/**
 * ========================================
 * CLIENT CALENDAR - Kalendarz dla klienta
 * ========================================
 * 
 * Widok kalendarza wydarzeń dostępny dla klientów
 * Pokazuje wszystkie wydarzenia powiązane ze sprawami klienta
 * 
 * Wersja: 1.0.0
 * Data: 2025-11-07
 */

console.log('📅 Client Calendar v1.0.0 - Ładowanie...');

class ClientCalendar {
    constructor() {
        this.clientId = null;
        this.events = [];
        this.currentView = 'list'; // list, timeline, month
        this.filters = {
            type: 'all',        // all, court, meeting, deadline, etc.
            timeRange: 'all'    // all, upcoming, past
        };
    }

    /**
     * Inicjalizacja kalendarza klienta
     * @param {Number} clientId - ID klienta
     */
    async init(clientId) {
        console.log('🔧 Inicjalizacja Client Calendar dla klienta:', clientId);
        
        this.clientId = clientId;
        
        try {
            await this.loadEvents();
            this.render();
            
            console.log('✅ Client Calendar zainicjalizowany!');
        } catch (error) {
            console.error('❌ Błąd inicjalizacji Client Calendar:', error);
        }
    }

    /**
     * Załaduj wydarzenia klienta
     */
    async loadEvents() {
        try {
            console.log('📥 Ładowanie wydarzeń klienta...');
            
            const response = await window.api.request(`/calendar/client/${this.clientId}`);
            
            this.events = response.events || [];
            this.stats = response.stats || {};
            
            console.log(`✅ Załadowano ${this.events.length} wydarzeń`);
            console.log('📊 Statystyki:', this.stats);
            
            return this.events;
        } catch (error) {
            console.error('❌ Błąd ładowania wydarzeń:', error);
            this.events = [];
            this.stats = {};
            return [];
        }
    }

    /**
     * Renderuj kalendarz
     */
    render() {
        const container = document.getElementById('clientCalendarContainer');
        if (!container) {
            console.warn('⚠️ Brak kontenera #clientCalendarContainer');
            return;
        }

        container.innerHTML = `
            ${this.renderHeader()}
            ${this.renderStats()}
            ${this.renderFilters()}
            ${this.renderEventsList()}
        `;

        // Attach event listeners
        this.attachEventListeners();
    }

    /**
     * Renderuj nagłówek
     */
    renderHeader() {
        return `
            <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 30px; border-radius: 16px 16px 0 0; color: white; margin-bottom: 20px;">
                <h2 style="margin: 0 0 10px 0; font-size: 2rem; font-weight: 700;">📅 Mój Kalendarz Spraw</h2>
                <p style="margin: 0; opacity: 0.9; font-size: 1.1rem;">Wszystkie Twoje terminy, rozprawy i spotkania w jednym miejscu</p>
            </div>
        `;
    }

    /**
     * Renderuj statystyki
     */
    renderStats() {
        const { urgent_count = 0, upcoming_count = 0, total = 0 } = this.stats;

        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; padding: 0 20px;">
                <div style="background: linear-gradient(135deg, #3B82F6, #f5576c); padding: 25px; border-radius: 12px; color: white; box-shadow: 0 4px 15px rgba(245,87,108,0.3);">
                    <div style="font-size: 3rem; font-weight: 700; margin-bottom: 5px;">${urgent_count}</div>
                    <div style="font-size: 1.1rem; opacity: 0.9;">🔥 Pilne (dziś-3 dni)</div>
                </div>
                
                <div style="background: linear-gradient(135deg, #60A5FA, #60A5FA); padding: 25px; border-radius: 12px; color: white; box-shadow: 0 4px 15px rgba(79,172,254,0.3);">
                    <div style="font-size: 3rem; font-weight: 700; margin-bottom: 5px;">${upcoming_count}</div>
                    <div style="font-size: 1.1rem; opacity: 0.9;">📅 Nadchodzące (4-30 dni)</div>
                </div>
                
                <div style="background: linear-gradient(135deg, #3B82F6, #60A5FA); padding: 25px; border-radius: 12px; color: white; box-shadow: 0 4px 15px rgba(67,233,123,0.3);">
                    <div style="font-size: 3rem; font-weight: 700; margin-bottom: 5px;">${total}</div>
                    <div style="font-size: 1.1rem; opacity: 0.9;">📊 Wszystkie wydarzenia</div>
                </div>
            </div>
        `;
    }

    /**
     * Renderuj filtry
     */
    renderFilters() {
        return `
            <div style="background: white; padding: 20px; border-radius: 12px; margin: 0 20px 20px 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="display: flex; gap: 15px; flex-wrap: wrap; align-items: center;">
                    <div style="flex: 1; min-width: 200px;">
                        <label style="display: block; color: #666; font-size: 0.9rem; margin-bottom: 5px; font-weight: 600;">Typ wydarzenia:</label>
                        <select id="filterType" onchange="clientCalendar.applyFilters()" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                            <option value="all">Wszystkie</option>
                            <option value="court">⚖️ Rozprawy</option>
                            <option value="meeting">👥 Spotkania</option>
                            <option value="deadline">⏰ Terminy procesowe</option>
                            <option value="mediation">🕊️ Mediacje</option>
                            <option value="consultation">💼 Konsultacje</option>
                        </select>
                    </div>
                    
                    <div style="flex: 1; min-width: 200px;">
                        <label style="display: block; color: #666; font-size: 0.9rem; margin-bottom: 5px; font-weight: 600;">Przedział czasu:</label>
                        <select id="filterTimeRange" onchange="clientCalendar.applyFilters()" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                            <option value="all">Wszystkie</option>
                            <option value="upcoming">📅 Nadchodzące</option>
                            <option value="past">📜 Przeszłe</option>
                        </select>
                    </div>
                    
                    <button onclick="clientCalendar.refresh()" style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem; margin-top: 20px; transition: all 0.3s;" onmouseover="this.style.background='#5568d3'" onmouseout="this.style.background='#3B82F6'">
                        🔄 Odśwież
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Renderuj listę wydarzeń
     */
    renderEventsList() {
        const filteredEvents = this.getFilteredEvents();

        if (filteredEvents.length === 0) {
            return `
                <div style="padding: 60px 20px; text-align: center; color: #999;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">📅</div>
                    <h3 style="color: #666; font-size: 1.5rem; margin-bottom: 10px;">Brak wydarzeń</h3>
                    <p style="font-size: 1.1rem;">Nie znaleziono wydarzeń spełniających wybrane kryteria.</p>
                </div>
            `;
        }

        return `
            <div style="padding: 0 20px 20px 20px;">
                ${filteredEvents.map(event => this.renderEventCard(event)).join('')}
            </div>
        `;
    }

    /**
     * Renderuj kartę wydarzenia
     */
    renderEventCard(event) {
        const typeIcons = {
            'negotiation': '🤝', 'court': '⚖️', 'meeting': '👥', 
            'deadline': '⏰', 'mediation': '🕊️', 'expertise': '🔬',
            'document': '📄', 'hearing': '🗣️', 'consultation': '💼',
            'task': '✅', 'other': '📝'
        };

        const typeColors = {
            'negotiation': '#3B82F6', 'court': '#3B82F6', 'meeting': '#3B82F6',
            'deadline': '#3B82F6', 'mediation': '#3B82F6', 'expertise': '#3B82F6',
            'document': '#60A5FA', 'hearing': '#3B82F6', 'consultation': '#34495e',
            'task': '#16a085', 'other': '#95a5a6'
        };

        const icon = typeIcons[event.event_type] || '📅';
        const color = typeColors[event.event_type] || '#3B82F6';
        
        // Formatuj datę
        const eventDate = new Date(event.start_date);
        const dateStr = eventDate.toLocaleDateString('pl-PL', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const timeStr = eventDate.toLocaleTimeString('pl-PL', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        // Urgency
        const daysUntil = event.days_until || 0;
        let urgencyBadge = '';
        if (daysUntil < 0) {
            urgencyBadge = `<span style="background: #95a5a6; color: white; padding: 4px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">Minął</span>`;
        } else if (daysUntil === 0) {
            urgencyBadge = `<span style="background: #3B82F6; color: white; padding: 4px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; animation: pulse 1.5s infinite;">🔥 DZIŚ!</span>`;
        } else if (daysUntil <= 3) {
            urgencyBadge = `<span style="background: #3B82F6; color: white; padding: 4px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">Za ${daysUntil} ${daysUntil === 1 ? 'dzień' : 'dni'}</span>`;
        } else if (daysUntil <= 7) {
            urgencyBadge = `<span style="background: #3B82F6; color: white; padding: 4px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">Za ${daysUntil} dni</span>`;
        } else {
            urgencyBadge = `<span style="background: #3B82F6; color: white; padding: 4px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">Za ${daysUntil} dni</span>`;
        }

        return `
            <div onclick="clientCalendar.showEventDetails(${event.id})" style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 5px solid ${color}; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0,0,0,0.1)'">
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 15px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 300px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <span style="font-size: 2rem;">${icon}</span>
                            <h3 style="margin: 0; color: #1a2332; font-size: 1.3rem; font-weight: 700;">${this.escapeHtml(event.title)}</h3>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 8px; color: #666; font-size: 1rem;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-weight: 600;">📅</span>
                                <span>${dateStr} o ${timeStr}</span>
                            </div>
                            
                            ${event.location ? `
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-weight: 600;">📍</span>
                                    <span>${this.escapeHtml(event.location)}</span>
                                </div>
                            ` : ''}
                            
                            ${event.case_number ? `
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-weight: 600;">📋</span>
                                    <span>Sprawa: <strong>${this.escapeHtml(event.case_number)}</strong></span>
                                </div>
                            ` : ''}
                        </div>
                        
                        ${event.description ? `
                            <p style="margin: 15px 0 0 0; color: #666; line-height: 1.6;">
                                ${this.escapeHtml(event.description.substring(0, 150))}${event.description.length > 150 ? '...' : ''}
                            </p>
                        ` : ''}
                    </div>
                    
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
                        ${urgencyBadge}
                        <button onclick="event.stopPropagation(); clientCalendar.showEventDetails(${event.id})" style="padding: 8px 16px; background: ${color}; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.3s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                            👁️ Szczegóły
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Pokaż szczegóły wydarzenia
     */
    async showEventDetails(eventId) {
        console.log('👁️ Pokazuję szczegóły wydarzenia:', eventId);
        
        try {
            const response = await window.api.request(`/events/${eventId}`);
            const event = response.event;
            
            if (!event) {
                alert('Nie znaleziono wydarzenia');
                return;
            }
            
            // Użyj istniejącej funkcji z crm-case-tabs.js jeśli istnieje
            if (typeof window.viewEventDetails === 'function') {
                window.viewEventDetails(eventId);
            } else {
                alert(`Szczegóły wydarzenia: ${event.title}\n\nData: ${new Date(event.start_date).toLocaleString('pl-PL')}\n\nLokalizacja: ${event.location || 'Brak'}\n\nOpis: ${event.description || 'Brak'}`);
            }
        } catch (error) {
            console.error('❌ Błąd ładowania szczegółów:', error);
            alert('Błąd ładowania szczegółów wydarzenia');
        }
    }

    /**
     * Zastosuj filtry
     */
    applyFilters() {
        const typeSelect = document.getElementById('filterType');
        const timeRangeSelect = document.getElementById('filterTimeRange');
        
        if (typeSelect) {
            this.filters.type = typeSelect.value;
        }
        
        if (timeRangeSelect) {
            this.filters.timeRange = timeRangeSelect.value;
        }
        
        console.log('🔍 Zastosowano filtry:', this.filters);
        
        // Re-render listy
        const listContainer = document.querySelector('#clientCalendarContainer > div:last-child');
        if (listContainer) {
            listContainer.outerHTML = this.renderEventsList();
        }
    }

    /**
     * Pobierz przefiltrowane wydarzenia
     */
    getFilteredEvents() {
        return this.events.filter(event => {
            // Filtr typu
            if (this.filters.type !== 'all' && event.event_type !== this.filters.type) {
                return false;
            }
            
            // Filtr czasu
            if (this.filters.timeRange === 'upcoming' && event.days_until < 0) {
                return false;
            }
            if (this.filters.timeRange === 'past' && event.days_until >= 0) {
                return false;
            }
            
            return true;
        });
    }

    /**
     * Odśwież kalendarz
     */
    async refresh() {
        console.log('🔄 Odświeżanie kalendarza klienta...');
        await this.loadEvents();
        this.render();
    }

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Event listeners są już dodane inline w HTML
        console.log('✅ Event listeners podłączone');
    }
}

// Eksportuj jako singleton
window.clientCalendar = new ClientCalendar();

// Dodaj CSS dla animacji
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
`;
document.head.appendChild(style);

console.log('✅ Client Calendar załadowany!');
