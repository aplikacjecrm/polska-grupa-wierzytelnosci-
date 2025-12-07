/**
 * ========================================
 * CALENDAR MANAGER - Centralny manager kalendarza
 * ========================================
 * 
 * Odpowiedzialny za:
 * - Ładowanie wydarzeń z API
 * - Renderowanie widoków kalendarza (dzień/tydzień/miesiąc)
 * - Synchronizację wydarzeń z kalendarzem użytkownika
 * - Filtry i kategorie wydarzeń
 * 
 * Wersja: 1.0.0
 * Data: 2025-11-07
 */

console.log('📅 Calendar Manager v1.0.0 - Ładowanie...');

class CalendarManager {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
        this.currentView = 'day'; // day, week, month - DOMYŚLNIE DZIENNY
        this.currentDate = new Date();
        this.filters = {
            types: [],      // Typy wydarzeń do wyświetlenia (pusta = wszystkie)
            urgency: 'all', // all, urgent, upcoming
            assigned: null  // user_id lub null (wszystkie)
        };
    }

    /**
     * Inicjalizacja managera kalendarza
     */
    async init() {
        console.log('🔧 Inicjalizacja Calendar Manager...');
        
        try {
            // Załaduj wszystkie wydarzenia użytkownika
            await this.loadAllEvents();
            
            // WAŻNE: Zastosuj filtry (bez tego filteredEvents jest puste!)
            this.applyFilters();
            
            // Aktualizuj statystyki
            this.updateStats();
            
            // Aktualizuj tytuł kalendarza
            this.updateCalendarTitle();
            
            // Renderuj domyślny widok
            this.renderCurrentView();
            
            // Nasłuchuj eventów
            this.attachEventListeners();
            
            console.log('✅ Calendar Manager zainicjalizowany!');
            console.log(`📊 Załadowano ${this.events.length} wydarzeń, przefiltrowano ${this.filteredEvents.length}`);
        } catch (error) {
            console.error('❌ Błąd inicjalizacji Calendar Manager:', error);
        }
    }
    
    /**
     * Aktualizuj statystyki w headerze
     */
    updateStats() {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1); // ✅ NAPRAWA: Jutro = dziś + 1 (nie +2!)
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() + 7);
        
        const urgent = this.events.filter(e => {
            const eventDate = new Date(e.start_date);
            return eventDate >= todayStart && eventDate < tomorrowStart;
        }).length;
        
        const upcoming = this.events.filter(e => {
            const eventDate = new Date(e.start_date);
            return eventDate >= tomorrowStart && eventDate < weekStart;
        }).length;
        
        // Aktualizuj elementy DOM
        const urgentEl = document.getElementById('urgentCount');
        const upcomingEl = document.getElementById('upcomingCount');
        const totalEl = document.getElementById('totalEventsCount');
        
        if (urgentEl) urgentEl.textContent = urgent;
        if (upcomingEl) upcomingEl.textContent = upcoming;
        if (totalEl) totalEl.textContent = this.events.length;
        
        console.log('📊 Statystyki zaktualizowane:', { urgent, upcoming, total: this.events.length });
    }
    
    /**
     * Aktualizuj tytuł kalendarza
     */
    updateCalendarTitle() {
        const titleEl = document.getElementById('calendarTitle');
        if (titleEl) {
            if (this.currentView === 'day') {
                // Dla widoku dziennego pokazuj "Kalendarz wydarzeń"
                titleEl.textContent = `📅 Kalendarz wydarzeń`;
            } else {
                const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                                   'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
                titleEl.textContent = `📅 ${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
            }
        }
    }

    /**
     * Załaduj wszystkie wydarzenia użytkownika
     * @param {Object} filters - Opcjonalne filtry
     */
    async loadAllEvents(filters = {}) {
        try {
            console.log('📥 Ładowanie wydarzeń...', filters);
            
            const queryParams = new URLSearchParams();
            
            // Dodaj filtry do query
            if (filters.case_id) queryParams.append('case_id', filters.case_id);
            if (filters.client_id) queryParams.append('client_id', filters.client_id);
            if (filters.event_type) queryParams.append('event_type', filters.event_type);
            if (filters.start_date) queryParams.append('start_date', filters.start_date);
            if (filters.end_date) queryParams.append('end_date', filters.end_date);
            
            const url = `/events${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await window.api.request(url);
            
            this.events = response.events || [];
            this.filteredEvents = this.events;
            
            console.log(`✅ Załadowano ${this.events.length} wydarzeń`);
            
            return this.events;
        } catch (error) {
            console.error('❌ Błąd ładowania wydarzeń:', error);
            this.events = [];
            this.filteredEvents = [];
            return [];
        }
    }

    /**
     * Załaduj wydarzenia dla konkretnej sprawy
     * @param {Number} caseId - ID sprawy
     */
    async loadCaseEvents(caseId) {
        console.log('📁 Ładowanie wydarzeń sprawy:', caseId);
        return await this.loadAllEvents({ case_id: caseId });
    }

    /**
     * Załaduj wydarzenia dla konkretnego klienta
     * @param {Number} clientId - ID klienta
     */
    async loadClientEvents(clientId) {
        console.log('👤 Ładowanie wydarzeń klienta:', clientId);
        return await this.loadAllEvents({ client_id: clientId });
    }

    /**
     * Zastosuj filtry do wydarzeń
     */
    applyFilters() {
        console.log('🔍 Stosowanie filtrów:', this.filters);
        
        this.filteredEvents = this.events.filter(event => {
            // Filtr typu
            if (this.filters.types.length > 0 && !this.filters.types.includes(event.event_type)) {
                return false;
            }
            
            // Filtr pilności
            if (this.filters.urgency !== 'all') {
                const eventDate = new Date(event.start_date);
                const now = new Date();
                const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
                
                if (this.filters.urgency === 'urgent' && daysUntil > 3) {
                    return false;
                }
                if (this.filters.urgency === 'upcoming' && (daysUntil <= 3 || daysUntil > 30)) {
                    return false;
                }
            }
            
            // Filtr przypisania
            if (this.filters.assigned && event.assigned_to !== this.filters.assigned) {
                return false;
            }
            
            return true;
        });
        
        console.log(`✅ Przefiltrowano: ${this.filteredEvents.length}/${this.events.length} wydarzeń`);
    }

    /**
     * Zmiana widoku kalendarza
     * @param {String} view - 'day', 'week', 'month'
     */
    switchView(view) {
        console.log('🔄 Zmiana widoku na:', view);
        this.currentView = view;
        
        // Aktualizuj tytuł
        this.updateCalendarTitle();
        
        // Renderuj nowy widok
        this.renderCurrentView();
    }

    /**
     * Renderuj bieżący widok
     */
    renderCurrentView() {
        console.log('🎨 Renderowanie widoku:', this.currentView);
        
        // Ukryj wszystkie widoki
        const dayView = document.getElementById('dayView');
        const weekView = document.getElementById('weekView');
        const monthView = document.getElementById('monthView');
        
        if (dayView) dayView.style.display = 'none';
        if (weekView) weekView.style.display = 'none';
        if (monthView) monthView.style.display = 'none';
        
        // Pokaż i renderuj odpowiedni widok
        switch (this.currentView) {
            case 'day':
                if (dayView) dayView.style.display = 'block';
                this.renderDayView(this.currentDate);
                break;
            case 'week':
                if (weekView) weekView.style.display = 'block';
                this.renderWeekView(this.currentDate);
                break;
            case 'month':
                if (monthView) monthView.style.display = 'block';
                this.renderMonthView(this.currentDate.getFullYear(), this.currentDate.getMonth());
                break;
            default:
                console.warn('⚠️ Nieznany widok:', this.currentView);
                if (dayView) dayView.style.display = 'block';
        }
    }

    /**
     * Renderuj widok dzienny
     * @param {Date} date - Data do wyświetlenia
     */
    renderDayView(date) {
        console.log('📅 Renderowanie widoku dziennego:', date);
        
        const dayGrid = document.getElementById('dayGrid');
        if (!dayGrid) {
            console.warn('⚠️ Brak elementu #dayGrid');
            return;
        }
        
        // ZMIANA: Pokaż wszystkie nadchodzące wydarzenia, nie tylko z dzisiaj
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Początek dnia
        
        const upcomingEvents = this.filteredEvents.filter(event => {
            const eventDate = new Date(event.start_date);
            return eventDate >= now; // Wszystkie przyszłe wydarzenia
        });
        
        // Sortuj po dacie
        upcomingEvents.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        
        if (upcomingEvents.length === 0) {
            dayGrid.innerHTML = `
                <div style="padding: 60px 20px; text-align: center; color: #999;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">📅</div>
                    <h3 style="color: #666; font-size: 1.5rem; margin-bottom: 10px;">Brak nadchodzących wydarzeń</h3>
                    <p style="font-size: 1.1rem;">Nie masz zaplanowanych wydarzeń na najbliższe dni</p>
                    <button onclick="alert('Dodaj wydarzenie przez: Sprawy → Otwórz sprawę → Wydarzenia → + Dodaj wydarzenie')" style="margin-top: 20px; padding: 12px 24px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">
                        ➕ Dodaj pierwsze wydarzenie
                    </button>
                </div>
            `;
            return;
        }
        
        const typeColors = {
            'negotiation': '#3B82F6', 'court': '#3B82F6', 'meeting': '#3B82F6',
            'deadline': '#3B82F6', 'mediation': '#3B82F6', 'expertise': '#3B82F6',
            'document': '#60A5FA', 'hearing': '#3B82F6', 'consultation': '#34495e',
            'task': '#16a085', 'other': '#95a5a6'
        };
        
        const typeIcons = {
            'negotiation': '🤝', 'court': '⚖️', 'meeting': '👥', 
            'deadline': '⏰', 'mediation': '🕊️', 'expertise': '🔬',
            'document': '📄', 'hearing': '🗣️', 'consultation': '💼',
            'task': '✅', 'other': '📝'
        };
        
        dayGrid.innerHTML = `
            <div style="padding: 20px;">
                <h3 style="margin-bottom: 20px; color: #1a2332; font-size: 1.5rem;">
                    📅 Nadchodzące wydarzenia (${upcomingEvents.length})
                </h3>
                
                ${upcomingEvents.map(event => {
                    // ✅ NAPRAWA STREFY CZASOWEJ: Używa DateTimeUtils do konwersji UTC → lokalny czas
                    const timeStr = window.DateTimeUtils 
                        ? window.DateTimeUtils.formatTime(event.start_date)
                        : new Date(event.start_date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
                    const eventDate = window.DateTimeUtils
                        ? window.DateTimeUtils.parseUTCDate(event.start_date)
                        : new Date(event.start_date);
                    const color = typeColors[event.event_type] || '#3B82F6';
                    const icon = typeIcons[event.event_type] || '📅';
                    
                    // ✅ NAPRAWA: Oblicz dni do wydarzenia (PORÓWNUJ TYLKO DATY, BEZ CZASU!)
                    const now = new Date();
                    const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
                    const daysUntil = Math.round((eventDateOnly - todayDateOnly) / (1000 * 60 * 60 * 24));
                    let dateLabel = '';
                    if (daysUntil === 0) {
                        dateLabel = '🔥 DZIŚ';
                    } else if (daysUntil === 1) {
                        dateLabel = '⚠️ JUTRO';
                    } else if (daysUntil <= 7) {
                        dateLabel = `Za ${daysUntil} dni`;
                    } else {
                        dateLabel = eventDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' });
                    }
                    
                    return `
                        <div onclick="window.viewEventDetails ? window.viewEventDetails(${event.id}) : alert('Szczegóły: ${event.title}')" style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 5px solid ${color}; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0,0,0,0.1)'">
                            <div style="display: flex; gap: 15px; align-items: start;">
                                <div style="font-size: 2.5rem; flex-shrink: 0;">${icon}</div>
                                <div style="flex: 1;">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px; flex-wrap: wrap; gap: 10px;">
                                        <h4 style="margin: 0; color: #1a2332; font-size: 1.2rem;">${this.escapeHtml(event.title)}</h4>
                                        <div style="display: flex; gap: 8px; align-items: center;">
                                            <span style="background: ${color}; color: white; padding: 4px 12px; border-radius: 6px; font-size: 0.9rem; font-weight: 600;">${dateLabel}</span>
                                            <span style="background: #f0f0f0; color: #666; padding: 4px 12px; border-radius: 6px; font-size: 0.9rem; font-weight: 600;">${timeStr}</span>
                                        </div>
                                    </div>
                                    ${event.location ? `
                                        <div style="color: #666; margin-bottom: 5px;">
                                            <strong>📍</strong> ${this.escapeHtml(event.location)}
                                        </div>
                                    ` : ''}
                                    ${event.case_number ? `
                                        <div style="color: #666; margin-bottom: 5px;">
                                            <strong>📋</strong> Sprawa: ${this.escapeHtml(event.case_number)}
                                        </div>
                                    ` : ''}
                                    ${event.description ? `
                                        <p style="margin: 10px 0 0 0; color: #666; line-height: 1.5;">
                                            ${this.escapeHtml(event.description.substring(0, 150))}${event.description.length > 150 ? '...' : ''}
                                        </p>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
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
     * Renderuj widok tygodniowy
     * @param {Date} startDate - Data bazowa
     */
    renderWeekView(startDate) {
        console.log('📅 Renderowanie widoku tygodniowego:', startDate);
        
        const weekGrid = document.getElementById('weekGrid');
        if (!weekGrid) {
            console.warn('⚠️ Brak elementu #weekGrid');
            return;
        }
        
        // Znajdź poniedziałek tego tygodnia
        const date = new Date(startDate);
        const dayOfWeek = date.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Niedziela = -6, reszta = 1 - day
        const monday = new Date(date);
        monday.setDate(date.getDate() + diff);
        monday.setHours(0, 0, 0, 0);
        
        // Generuj 7 dni (Pon-Niedz)
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(monday);
            day.setDate(monday.getDate() + i);
            weekDays.push(day);
        }
        
        // Grupuj wydarzenia według dni
        const eventsByDay = {};
        this.filteredEvents.forEach(event => {
            const eventDate = new Date(event.start_date);
            const dayKey = eventDate.toDateString();
            if (!eventsByDay[dayKey]) eventsByDay[dayKey] = [];
            eventsByDay[dayKey].push(event);
        });
        
        // Dzisiaj
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const typeColors = {
            'negotiation': '#3B82F6', 'court': '#3B82F6', 'meeting': '#3B82F6',
            'deadline': '#3B82F6', 'mediation': '#3B82F6', 'expertise': '#3B82F6',
            'document': '#60A5FA', 'hearing': '#3B82F6', 'consultation': '#34495e',
            'task': '#16a085', 'other': '#95a5a6'
        };
        
        const typeIcons = {
            'negotiation': '🤝', 'court': '⚖️', 'meeting': '👥', 
            'deadline': '⏰', 'mediation': '🕊️', 'expertise': '🔬',
            'document': '📄', 'hearing': '🗣️', 'consultation': '💼',
            'task': '✅', 'other': '📝'
        };
        
        weekGrid.innerHTML = `
            <div style="padding: 20px;">
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px;">
                    ${weekDays.map(day => {
                        const isToday = day.toDateString() === today.toDateString();
                        const dayEvents = eventsByDay[day.toDateString()] || [];
                        dayEvents.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
                        
                        return `
                            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); ${isToday ? 'border: 3px solid #3B82F6;' : ''}">
                                <div style="text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid ${isToday ? '#3B82F6' : '#e0e0e0'};">
                                    <div style="font-size: 0.8rem; color: #666; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">
                                        ${day.toLocaleDateString('pl-PL', { weekday: 'short' })}
                                    </div>
                                    <div style="
                                        ${isToday ? 'background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;' : 'color: #1a2332;'}
                                        font-size: 1.3rem;
                                        font-weight: 700;
                                    ">
                                        ${day.getDate()}
                                    </div>
                                </div>
                                
                                <div style="display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto;">
                                    ${dayEvents.length === 0 ? `
                                        <div style="text-align: center; color: #999; padding: 20px; font-size: 0.9rem;">
                                            Brak wydarzeń
                                        </div>
                                    ` : dayEvents.map(event => {
                                        const color = typeColors[event.event_type] || '#3B82F6';
                                        const icon = typeIcons[event.event_type] || '📅';
                                        // ✅ NAPRAWA STREFY CZASOWEJ: Używa DateTimeUtils
                                        const eventTime = window.DateTimeUtils
                                            ? window.DateTimeUtils.formatTime(event.start_date)
                                            : new Date(event.start_date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
                                        
                                        return `
                                            <div onclick="if(window.viewEventDetails) window.viewEventDetails(${event.id})" 
                                                 style="background: ${color}; color: white; padding: 10px; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-size: 0.85rem;"
                                                 onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'"
                                                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                                                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                                                    <span>${icon}</span>
                                                    <strong style="font-size: 0.8rem;">${eventTime}</strong>
                                                </div>
                                                <div style="font-weight: 600; line-height: 1.3;">
                                                    ${this.escapeHtml(event.title)}
                                                </div>
                                                ${event.location ? `
                                                    <div style="font-size: 0.75rem; opacity: 0.9; margin-top: 4px;">
                                                        📍 ${this.escapeHtml(event.location).substring(0, 25)}${event.location.length > 25 ? '...' : ''}
                                                    </div>
                                                ` : ''}
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Renderuj widok miesięczny
     * @param {Number} year - Rok
     * @param {Number} month - Miesiąc (0-11)
     */
    renderMonthView(year, month) {
        console.log('📅 Renderowanie widoku miesięcznego:', year, month);
        
        const monthGrid = document.getElementById('monthGrid');
        if (!monthGrid) {
            console.warn('⚠️ Brak elementu #monthGrid');
            return;
        }
        
        // Pierwszy dzień miesiąca
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Pierwszy dzień tygodnia (0=Niedziela, 1=Poniedziałek...)
        let startDay = firstDay.getDay();
        // Przekształć na polski standard (0=Poniedziałek, 6=Niedziela)
        startDay = startDay === 0 ? 6 : startDay - 1;
        
        // Dzisiejsza data
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Mapuj wydarzenia według dni
        const eventsByDay = {};
        this.filteredEvents.forEach(event => {
            const eventDate = new Date(event.start_date);
            if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
                const day = eventDate.getDate();
                if (!eventsByDay[day]) eventsByDay[day] = [];
                eventsByDay[day].push(event);
            }
        });
        
        // Generuj siatkę
        let html = `
            <div style="padding: 20px;">
                <!-- Nagłówki dni tygodnia -->
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: #e0e0e0; border: 1px solid #e0e0e0; margin-bottom: 1px;">
                    ${['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz'].map(day => `
                        <div style="background: #f5f5f5; padding: 12px; text-align: center; font-weight: 700; color: #1a2332; font-size: 0.9rem;">
                            ${day}
                        </div>
                    `).join('')}
                </div>
                
                <!-- Siatka dni -->
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: #e0e0e0; border: 1px solid #e0e0e0;">
        `;
        
        // Puste komórki przed pierwszym dniem
        for (let i = 0; i < startDay; i++) {
            html += '<div style="background: #fafafa; min-height: 100px;"></div>';
        }
        
        // Dni miesiąca
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            currentDate.setHours(0, 0, 0, 0);
            const isToday = currentDate.getTime() === today.getTime();
            const events = eventsByDay[day] || [];
            
            html += `
                <div onclick="window.calendarManager.showDayEvents(${year}, ${month}, ${day})" 
                     oncontextmenu="event.preventDefault(); window.calendarManager.quickAddEventOnDay(${year}, ${month}, ${day}); return false;"
                     style="background: white; min-height: 100px; padding: 8px; cursor: pointer; position: relative; transition: all 0.2s;"
                     onmouseover="this.style.background='#f8f9ff'; this.style.transform='scale(1.02)'"
                     onmouseout="this.style.background='white'; this.style.transform='scale(1)'"
                     title="Kliknij - zobacz wydarzenia | Prawy klik - dodaj wydarzenie">
                    
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <div style="
                            ${isToday ? 'background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white;' : 'color: #1a2332;'}
                            ${isToday ? 'width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;' : ''}
                            font-weight: ${isToday ? '700' : '600'};
                            font-size: ${isToday ? '1rem' : '0.95rem'};
                        ">
                            ${day}
                        </div>
                        ${events.length > 0 ? `
                            <div style="background: #3B82F6; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7rem; font-weight: 700;">
                                ${events.length}
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Mini podgląd wydarzeń (max 3) -->
                    ${events.slice(0, 3).map(event => {
                        const typeColors = {
                            'negotiation': '#3B82F6', 'court': '#3B82F6', 'meeting': '#3B82F6',
                            'deadline': '#3B82F6', 'mediation': '#3B82F6', 'expertise': '#3B82F6',
                            'document': '#60A5FA', 'hearing': '#3B82F6', 'consultation': '#34495e',
                            'task': '#16a085', 'other': '#95a5a6'
                        };
                        const color = typeColors[event.event_type] || '#3B82F6';
                        // ✅ NAPRAWA STREFY CZASOWEJ: Używa DateTimeUtils
                        const eventTime = window.DateTimeUtils
                            ? window.DateTimeUtils.formatTime(event.start_date)
                            : new Date(event.start_date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
                        
                        return `
                            <div style="
                                background: ${color}; 
                                color: white; 
                                padding: 4px 6px; 
                                margin-bottom: 4px; 
                                border-radius: 4px; 
                                font-size: 0.7rem; 
                                white-space: nowrap; 
                                overflow: hidden; 
                                text-overflow: ellipsis;
                                font-weight: 600;
                            ">
                                ${eventTime} ${this.escapeHtml(event.title).substring(0, 15)}${event.title.length > 15 ? '...' : ''}
                            </div>
                        `;
                    }).join('')}
                    
                    ${events.length > 3 ? `
                        <div style="color: #3B82F6; font-size: 0.7rem; font-weight: 700; text-align: center; margin-top: 4px;">
                            +${events.length - 3} więcej
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
        
        monthGrid.innerHTML = html;
    }
    
    /**
     * Pokaż wydarzenia z konkretnego dnia
     */
    showDayEvents(year, month, day) {
        console.log(`📅 Pokazuję wydarzenia z ${day}.${month + 1}.${year}`);
        
        // WAŻNE: Usuń poprzedni modal jeśli istnieje!
        const existingModal = document.getElementById('dayEventsModal');
        if (existingModal) {
            console.log('⚠️ Usuwam poprzedni modal wydarzeń dnia');
            existingModal.remove();
        }
        
        const date = new Date(year, month, day);
        const events = this.filteredEvents.filter(event => {
            const eventDate = new Date(event.start_date);
            return eventDate.toDateString() === date.toDateString();
        });
        
        if (events.length === 0) {
            alert(`Brak wydarzeń w dniu ${day}.${month + 1}.${year}`);
            return;
        }
        
        // Sortuj po godzinie
        events.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        
        // Pokaż modal z listą wydarzeń
        const modalHtml = `
            <div id="dayEventsModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="background: white; border-radius: 16px; max-width: 700px; width: 90%; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                    <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 24px; border-radius: 16px 16px 0 0; position: sticky; top: 0; z-index: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <h3 style="margin: 0; font-size: 1.5rem;">📅 ${date.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                                <p style="margin: 8px 0 0 0; opacity: 0.9;">${events.length} ${events.length === 1 ? 'wydarzenie' : 'wydarzenia'}</p>
                            </div>
                            <button onclick="document.getElementById('dayEventsModal').remove()" style="background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 1.5rem; font-weight: bold; flex-shrink: 0;">✕</button>
                        </div>
                    </div>
                    <div style="padding: 20px;">
                        ${events.map(event => {
                            const typeColors = {
                                'negotiation': '#3B82F6', 'court': '#3B82F6', 'meeting': '#3B82F6',
                                'deadline': '#3B82F6', 'mediation': '#3B82F6', 'expertise': '#3B82F6',
                                'document': '#60A5FA', 'hearing': '#3B82F6', 'consultation': '#34495e',
                                'task': '#16a085', 'other': '#95a5a6'
                            };
                            const typeIcons = {
                                'negotiation': '🤝', 'court': '⚖️', 'meeting': '👥', 
                                'deadline': '⏰', 'mediation': '🕊️', 'expertise': '🔬',
                                'document': '📄', 'hearing': '🗣️', 'consultation': '💼',
                                'task': '✅', 'other': '📝'
                            };
                            const color = typeColors[event.event_type] || '#3B82F6';
                            const icon = typeIcons[event.event_type] || '📅';
                            // ✅ NAPRAWA STREFY CZASOWEJ: Używa DateTimeUtils
                            const eventTime = window.DateTimeUtils
                                ? window.DateTimeUtils.formatTime(event.start_date)
                                : new Date(event.start_date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
                            
                            // Parsuj extra_data
                            let extraData = {};
                            try {
                                extraData = typeof event.extra_data === 'string' ? JSON.parse(event.extra_data) : (event.extra_data || {});
                            } catch (e) {
                                extraData = {};
                            }
                            
                            // Pokaż klienta czytelnie
                            let clientInfo = '';
                            if (extraData.new_client) {
                                const nc = extraData.new_client;
                                clientInfo = `<div style="background: #f8f9ff; padding: 8px; border-radius: 6px; margin-top: 8px; border-left: 3px solid ${color};">
                                    <div style="color: #3B82F6; font-weight: 600; margin-bottom: 4px;">👤 Nowy klient</div>
                                    <div style="color: #1a2332; font-weight: 600;">${this.escapeHtml(nc.first_name)} ${this.escapeHtml(nc.last_name)}</div>
                                    ${nc.phone ? `<div style="color: #666; font-size: 0.9rem;">📞 ${this.escapeHtml(nc.phone)}</div>` : ''}
                                    ${nc.email ? `<div style="color: #666; font-size: 0.9rem;">📧 ${this.escapeHtml(nc.email)}</div>` : ''}
                                </div>`;
                            }
                            
                            // Mecenas i opiekun
                            const lawyerNames = {
                                'lawyer_a': '👨‍⚖️ Mec. Jan Kowalski',
                                'lawyer_b': '👩‍⚖️ Mec. Anna Nowak',
                                'lawyer_c': '👨‍⚖️ Mec. Piotr Wiśniewski'
                            };
                            const managerNames = {
                                'manager_a': '👔 Maria Lewandowska',
                                'manager_b': '👔 Tomasz Kamiński',
                                'manager_c': '👔 Katarzyna Zielińska'
                            };
                            
                            let assignedInfo = '';
                            if (extraData.assigned_lawyer) {
                                assignedInfo += `<div style="color: #666; font-size: 0.9rem; margin-top: 4px;">${lawyerNames[extraData.assigned_lawyer] || extraData.assigned_lawyer}</div>`;
                            }
                            if (extraData.case_manager) {
                                assignedInfo += `<div style="color: #666; font-size: 0.9rem;">${managerNames[extraData.case_manager] || extraData.case_manager}</div>`;
                            }
                            
                            return `
                                <div style="background: white; border: 2px solid ${color}; border-radius: 12px; padding: 16px; margin-bottom: 12px; transition: all 0.2s;"
                                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.15)'"
                                     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                                    <div style="display: flex; gap: 12px; align-items: start;">
                                        <div style="font-size: 2rem;">${icon}</div>
                                        <div style="flex: 1;">
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                                <h4 style="margin: 0; color: #1a2332; font-size: 1.1rem;">${this.escapeHtml(event.title)}</h4>
                                                <span style="background: ${color}; color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.9rem; font-weight: 600;">${eventTime}</span>
                                            </div>
                                            ${event.location ? `<div style="color: #666; margin-bottom: 4px;"><strong>📍</strong> ${this.escapeHtml(event.location)}</div>` : ''}
                                            ${event.case_number ? `<div style="color: #666; margin-bottom: 4px;"><strong>📋</strong> ${this.escapeHtml(event.case_number)}</div>` : ''}
                                            ${assignedInfo}
                                            ${clientInfo}
                                            
                                            <div style="display: flex; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0;">
                                                <button onclick="event.stopPropagation(); if(window.viewEventDetails) window.viewEventDetails(${event.id});" style="flex: 1; background: ${color}; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                                                    👁️ Szczegóły
                                                </button>
                                                <button onclick="event.stopPropagation(); window.calendarManager.deleteEvent(${event.id});" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.2s;" onmouseover="this.style.background='#c82333'" onmouseout="this.style.background='#dc3545'">
                                                    🗑️ Usuń
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div style="padding: 16px 24px; background: #f5f5f5; border-radius: 0 0 16px 16px; text-align: center;">
                        <button onclick="document.getElementById('dayEventsModal').remove()" style="background: #3B82F6; color: white; border: none; padding: 12px 32px; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer;">
                            Zamknij
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    /**
     * Odśwież kalendarz
     */
    async refresh() {
        console.log('🔄 Odświeżanie kalendarza...');
        await this.loadAllEvents();
        this.applyFilters();
        this.renderCurrentView();
    }

    /**
     * Podłącz event listenersy
     */
    attachEventListeners() {
        console.log('🔗 Podłączanie event listenerów...');
        
        // Przyciski zmiany widoku (Dzień/Tydzień/Miesiąc)
        const viewButtons = document.querySelectorAll('.btn-view[data-calendar-view]');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.calendarView;
                console.log('👆 Kliknięto widok:', view);
                
                // Usuń active ze wszystkich
                viewButtons.forEach(b => b.classList.remove('active'));
                // Dodaj do klikniętego
                e.target.classList.add('active');
                
                // Zmień widok
                this.switchView(view);
            });
        });
        
        // Przycisk "Dzisiaj"
        const todayBtn = document.getElementById('todayBtn');
        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                console.log('👆 Kliknięto Dzisiaj');
                this.currentDate = new Date();
                this.updateCalendarTitle();
                this.renderCurrentView();
            });
        }
        
        // Przyciski nawigacji (◀ ▶)
        const prevBtn = document.getElementById('prevPeriod');
        const nextBtn = document.getElementById('nextPeriod');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                console.log('👆 Kliknięto Poprzedni okres');
                this.navigatePrevious();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                console.log('👆 Kliknięto Następny okres');
                this.navigateNext();
            });
        }
        
        // Przycisk "➕ Nowe wydarzenie"
        const newEventBtn = document.getElementById('newEventBtn');
        if (newEventBtn) {
            newEventBtn.addEventListener('click', () => {
                console.log('👆 Kliknięto Nowe wydarzenie');
                this.showNewEventForm();
            });
        }
        
        // Obsługa Event Bus
        if (window.eventBus) {
            window.eventBus.on('event:created', () => this.refresh());
            window.eventBus.on('event:updated', () => this.refresh());
            window.eventBus.on('event:deleted', () => this.refresh());
            console.log('✅ Event Bus podłączony');
        } else {
            console.warn('⚠️ Event Bus niedostępny');
        }
        
        console.log('✅ Event listenery podłączone');
    }
    
    /**
     * Szybkie dodanie wydarzenia na wybrany dzień (prawy klik)
     */
    quickAddEventOnDay(year, month, day) {
        const date = new Date(year, month, day, 10, 0, 0); // Domyślnie 10:00
        console.log(`⚡ Szybkie dodanie wydarzenia na ${day}.${month + 1}.${year}`);
        this.showNewEventForm(date);
    }
    
    /**
     * Generuj unikalny numer spotkania
     */
    generateEventCode() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0') + String(now.getSeconds()).padStart(2, '0');
        
        const code = `SPO/${year}/${month}${day}/${time}`;
        console.log('🔢 Wygenerowano numer spotkania:', code);
        return code;
    }
    
    /**
     * Pokaż formularz nowego wydarzenia (bez sprawy)
     */
    async showNewEventForm(presetDate = null) {
        console.log('📝 Pokazuję formularz nowego wydarzenia');
        
        // WAŻNE: Usuń poprzedni modal jeśli istnieje!
        const existingModal = document.getElementById('newEventModal');
        if (existingModal) {
            console.log('⚠️ Usuwam poprzedni modal');
            existingModal.remove();
        }
        
        // Domyślna data - dziś o 10:00
        const defaultDate = presetDate || new Date();
        if (!presetDate) {
            defaultDate.setHours(10, 0, 0, 0);
        }
        const dateStr = defaultDate.toISOString().slice(0, 16);
        
        // Wygeneruj unikalny numer spotkania
        const eventCode = this.generateEventCode();
        
        const modalHtml = `
            <div id="newEventModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="background: white; border-radius: 20px; max-width: 800px; width: 100%; max-height: 95vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.4);">
                    
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 30px; border-radius: 20px 20px 0 0; position: sticky; top: 0; z-index: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <h2 style="margin: 0; font-size: 1.8rem; display: flex; align-items: center; gap: 12px;">
                                    ⚡ Nowe wydarzenie
                                </h2>
                                <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 1rem;">
                                    Utwórz spotkanie, termin lub zadanie
                                </p>
                            </div>
                            <button type="button" onclick="document.getElementById('newEventModal').remove()" style="background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 1.5rem; font-weight: bold; flex-shrink: 0;">✕</button>
                        </div>
                    </div>
                    
                    <!-- Formularz -->
                    <div style="padding: 30px;">
                        <form id="quickEventForm">
                            
                            <!-- Numer spotkania (automatyczny) -->
                            <div style="margin-bottom: 24px; background: linear-gradient(135deg, #f8f9ff, #e8ecff); padding: 16px; border-radius: 10px; border: 2px solid #3B82F6;">
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #3B82F6; display: flex; align-items: center; gap: 8px;">
                                    🔢 Numer spotkania (unikalny)
                                    <span style="font-size: 0.8rem; font-weight: 400; color: #999;">(generowany automatycznie)</span>
                                </label>
                                <input type="text" id="quickEventCode" readonly value="${eventCode}" style="width: 100%; padding: 12px; border: 2px solid #3B82F6; border-radius: 8px; font-size: 1.1rem; font-weight: 700; font-family: 'Courier New', monospace; background: white; color: #3B82F6; cursor: not-allowed;">
                            </div>
                            
                            <!-- Typ wydarzenia -->
                            <div style="margin-bottom: 24px;">
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">
                                    📋 Typ wydarzenia *
                                </label>
                                <select id="quickEventType" required style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; background: white;">
                                    <option value="">-- Wybierz typ --</option>
                                    <option value="meeting">👥 Spotkanie z klientem</option>
                                    <option value="consultation">💼 Konsultacja</option>
                                    <option value="task">✅ Zadanie</option>
                                    <option value="deadline">⏰ Termin</option>
                                    <option value="other">📝 Inne</option>
                                </select>
                            </div>
                            
                            <!-- Klient -->
                            <div style="margin-bottom: 24px;">
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">
                                    👤 Klient (opcjonalnie)
                                </label>
                                <select id="quickEventClient" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; background: white;">
                                    <option value="">-- Brak klienta --</option>
                                </select>
                                
                                <!-- Nowy klient - rozszerzone dane -->
                                <div style="margin-top: 12px; display: none; padding: 16px; background: #f8f9ff; border: 2px solid #3B82F6; border-radius: 8px;" id="newClientSection">
                                    <h4 style="margin: 0 0 12px 0; color: #3B82F6; font-size: 1rem;">📋 Dane nowego klienta</h4>
                                    
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                                        <input type="text" id="newClientFirstName" placeholder="Imię *" style="width: 100%; padding: 10px; border: 1px solid #d0d0d0; border-radius: 6px; font-size: 0.95rem;">
                                        <input type="text" id="newClientLastName" placeholder="Nazwisko *" style="width: 100%; padding: 10px; border: 1px solid #d0d0d0; border-radius: 6px; font-size: 0.95rem;">
                                    </div>
                                    
                                    <input type="tel" id="newClientPhone" placeholder="📞 Telefon (np. 123-456-789)" style="width: 100%; padding: 10px; border: 1px solid #d0d0d0; border-radius: 6px; font-size: 0.95rem; margin-bottom: 12px;">
                                    
                                    <input type="email" id="newClientEmail" placeholder="📧 Email" style="width: 100%; padding: 10px; border: 1px solid #d0d0d0; border-radius: 6px; font-size: 0.95rem; margin-bottom: 12px;">
                                    
                                    <input type="text" id="newClientAddress" placeholder="🏠 Adres" style="width: 100%; padding: 10px; border: 1px solid #d0d0d0; border-radius: 6px; font-size: 0.95rem;">
                                </div>
                            </div>
                            
                            <!-- Mecenas prowadzący -->
                            <div style="margin-bottom: 24px;">
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">
                                    ⚖️ Spotkanie z mecenasem (opcjonalnie)
                                </label>
                                <select id="quickEventLawyer" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; background: white;">
                                    <option value="">-- Nie wybrano --</option>
                                    <option value="lawyer_a">👨‍⚖️ Mec. Jan Kowalski</option>
                                    <option value="lawyer_b">👩‍⚖️ Mec. Anna Nowak</option>
                                    <option value="lawyer_c">👨‍⚖️ Mec. Piotr Wiśniewski</option>
                                </select>
                            </div>
                            
                            <!-- Asystent/Opiekun -->
                            <div style="margin-bottom: 24px;">
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">
                                    👤 Asystent/Opiekun (opcjonalnie)
                                </label>
                                <select id="quickEventCaseManager" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; background: white;">
                                    <option value="">-- Nie wybrano --</option>
                                    <option value="manager_a">👔 Maria Lewandowska</option>
                                    <option value="manager_b">👔 Tomasz Kamiński</option>
                                    <option value="manager_c">👔 Katarzyna Zielińska</option>
                                </select>
                            </div>
                            
                            <!-- Tytuł -->
                            <div style="margin-bottom: 24px;">
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">
                                    📝 Tytuł wydarzenia *
                                </label>
                                <input type="text" id="quickEventTitle" required placeholder="np. Konsultacja w sprawie rozwodu" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                            </div>
                            
                            <!-- Data i godzina -->
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                                <div>
                                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">
                                        📅 Data i godzina *
                                    </label>
                                    <input type="datetime-local" id="quickEventDate" required value="${dateStr}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                                </div>
                                <div>
                                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">
                                        ⏱️ Czas trwania (min)
                                    </label>
                                    <input type="number" id="quickEventDuration" value="60" min="15" step="15" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                                </div>
                            </div>
                            
                            <!-- Lokalizacja -->
                            <div style="margin-bottom: 24px;">
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">
                                    📍 Miejsce spotkania
                                </label>
                                <input type="text" id="quickEventLocation" placeholder="np. Kancelaria, Sala 2" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                            </div>
                            
                            <!-- Notatki -->
                            <div style="margin-bottom: 24px;">
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1a2332;">
                                    📋 Notatki
                                </label>
                                <textarea id="quickEventNotes" rows="4" placeholder="Dodatkowe informacje..." style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; resize: vertical;"></textarea>
                            </div>
                            
                            <!-- Przyciski -->
                            <div style="display: flex; gap: 12px; justify-content: flex-end; padding-top: 20px; border-top: 2px solid #f0f0f0;">
                                <button type="button" onclick="document.getElementById('newEventModal').remove()" style="padding: 14px 28px; background: #e0e0e0; color: #1a2332; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer;">
                                    Anuluj
                                </button>
                                <button type="submit" style="padding: 14px 28px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                                    ✓ Utwórz wydarzenie
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Załaduj listę klientów - czekaj aż się załadują!
        await this.loadClientsForSelect();
        
        // Obsługa formularza
        const form = document.getElementById('quickEventForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveQuickEvent();
        });
        
        // Obsługa wyboru klienta
        const clientSelect = document.getElementById('quickEventClient');
        const newClientSection = document.getElementById('newClientSection');
        
        clientSelect.addEventListener('change', (e) => {
            if (e.target.value === 'new') {
                newClientSection.style.display = 'block';
            } else {
                newClientSection.style.display = 'none';
            }
        });
    }
    
    /**
     * Załaduj listę klientów do selecta
     */
    async loadClientsForSelect() {
        console.log('📥 Ładuję listę klientów...');
        try {
            const response = await window.api.request('/clients');
            const clients = response.clients || [];
            
            console.log('✅ Pobrano klientów:', clients.length);
            
            const select = document.getElementById('quickEventClient');
            if (!select) {
                console.warn('⚠️ Nie znaleziono selecta #quickEventClient');
                return;
            }
            
            // Dodaj opcję "Nowy klient" na początku
            let html = `
                <option value="">-- Brak klienta --</option>
                <option value="new">➕ Nowy klient (wpisz dane poniżej)</option>
            `;
            
            // Dodaj istniejących klientów jeśli są
            if (clients.length > 0) {
                html += `<optgroup label="Istniejący klienci">`;
                clients.forEach(client => {
                    html += `<option value="${client.id}">${client.first_name} ${client.last_name}</option>`;
                });
                html += `</optgroup>`;
            }
            
            select.innerHTML = html;
            console.log('✅ Select wypełniony opcjami');
        } catch (error) {
            console.error('❌ Błąd ładowania klientów:', error);
            // Fallback - przynajmniej opcja nowego klienta
            const select = document.getElementById('quickEventClient');
            if (select) {
                select.innerHTML = `
                    <option value="">-- Brak klienta --</option>
                    <option value="new">➕ Nowy klient (wpisz dane poniżej)</option>
                `;
            }
        }
    }
    
    /**
     * Zapisz szybkie wydarzenie
     */
    async saveQuickEvent() {
        const eventCodeEl = document.getElementById('quickEventCode');
        const typeEl = document.getElementById('quickEventType');
        const clientEl = document.getElementById('quickEventClient');
        
        // Nowy klient - rozszerzone dane
        const newClientFirstNameEl = document.getElementById('newClientFirstName');
        const newClientLastNameEl = document.getElementById('newClientLastName');
        const newClientPhoneEl = document.getElementById('newClientPhone');
        const newClientEmailEl = document.getElementById('newClientEmail');
        const newClientAddressEl = document.getElementById('newClientAddress');
        
        // Mecenas i opiekun
        const lawyerEl = document.getElementById('quickEventLawyer');
        const caseManagerEl = document.getElementById('quickEventCaseManager');
        
        const titleEl = document.getElementById('quickEventTitle');
        const dateEl = document.getElementById('quickEventDate');
        const durationEl = document.getElementById('quickEventDuration');
        const locationEl = document.getElementById('quickEventLocation');
        const notesEl = document.getElementById('quickEventNotes');
        
        if (!typeEl.value || !titleEl.value || !dateEl.value) {
            alert('Wypełnij wszystkie wymagane pola (*)');
            return;
        }
        
        const eventData = {
            event_code: eventCodeEl.value,
            event_type: typeEl.value,
            title: titleEl.value,
            start_date: dateEl.value,
            location: locationEl.value || null,
            description: notesEl.value || null,
            duration_minutes: parseInt(durationEl.value) || 60,
            client_id: null,
            case_id: null,
            extra_data: {}
        };
        
        // Jeśli wybrano istniejącego klienta
        if (clientEl.value && clientEl.value !== 'new') {
            eventData.client_id = parseInt(clientEl.value);
        }
        
        // Jeśli nowy klient - zbierz wszystkie dane
        if (clientEl.value === 'new') {
            if (!newClientFirstNameEl.value.trim() || !newClientLastNameEl.value.trim()) {
                alert('Wypełnij imię i nazwisko nowego klienta');
                return;
            }
            
            eventData.extra_data.new_client = {
                first_name: newClientFirstNameEl.value.trim(),
                last_name: newClientLastNameEl.value.trim(),
                phone: newClientPhoneEl.value.trim() || null,
                email: newClientEmailEl.value.trim() || null,
                address: newClientAddressEl.value.trim() || null
            };
        }
        
        // Mecenas prowadzący
        if (lawyerEl.value) {
            eventData.extra_data.assigned_lawyer = lawyerEl.value;
        }
        
        // Opiekun sprawy
        if (caseManagerEl.value) {
            eventData.extra_data.case_manager = caseManagerEl.value;
        }
        
        try {
            console.log('💾 Zapisuję szybkie wydarzenie:', eventData);
            
            const response = await window.api.request('/events', {
                method: 'POST',
                body: JSON.stringify(eventData)
            });
            
            console.log('✅ Wydarzenie utworzone:', response);
            
            // Wyślij email z potwierdzeniem do klienta
            if (eventData.client_id || eventData.extra_data.new_client) {
                console.log('📧 Wysyłam email z potwierdzeniem...');
                await this.sendEventConfirmationEmail(response.event || response, eventData);
            }
            
            // Zamknij modal
            document.getElementById('newEventModal').remove();
            
            // Pokaż notyfikację
            this.showNotification('✅ Wydarzenie utworzone i email wysłany!', 'success');
            
            // Odśwież kalendarz
            await this.refresh();
            
            // Emit event
            if (window.eventBus) {
                window.eventBus.emit('event:created', response);
            }
            
        } catch (error) {
            console.error('❌ Błąd zapisu wydarzenia:', error);
            alert('Błąd przy zapisywaniu wydarzenia: ' + error.message);
        }
    }
    
    /**
     * Wyślij email z potwierdzeniem spotkania
     */
    async sendEventConfirmationEmail(event, eventData) {
        try {
            // Pobierz dane klienta
            let clientData = null;
            let clientEmail = null;
            
            // Jeśli nowy klient
            if (eventData.extra_data && eventData.extra_data.new_client) {
                clientData = eventData.extra_data.new_client;
                clientEmail = clientData.email;
            } 
            // Jeśli istniejący klient
            else if (eventData.client_id) {
                const response = await window.api.request(`/clients/${eventData.client_id}`);
                clientData = response.client;
                clientEmail = clientData.email;
            }
            
            if (!clientEmail) {
                console.warn('⚠️ Brak adresu email klienta - nie wysyłam emaila');
                return;
            }
            
            // Formatuj datę
            const eventDate = new Date(eventData.start_date);
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
            
            // Typ wydarzenia po polsku
            const eventTypes = {
                'meeting': 'Spotkanie z klientem',
                'consultation': 'Konsultacja',
                'task': 'Zadanie',
                'deadline': 'Termin',
                'court': 'Rozprawa sądowa',
                'other': 'Inne'
            };
            const eventTypeName = eventTypes[eventData.event_type] || 'Spotkanie';
            
            // Szablon emaila
            const emailSubject = `✅ Potwierdzenie spotkania - ${eventData.event_code}`;
            const emailBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .content { background: #f8f9fa; padding: 30px; border: 1px solid #e0e0e0; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3B82F6; }
        .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: 600; color: #3B82F6; min-width: 150px; }
        .info-value { color: #333; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 0.9rem; color: #666; border-radius: 0 0 12px 12px; }
        .button { background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">✅ Potwierdzenie spotkania</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Kancelaria Prawna</p>
        </div>
        
        <div class="content">
            <p>Szanowny/a <strong>${clientData.first_name} ${clientData.last_name}</strong>,</p>
            
            <p>Potwierdzamy umówione spotkanie w naszej kancelarii.</p>
            
            <div class="info-box">
                <h3 style="margin: 0 0 15px 0; color: #3B82F6;">📋 Szczegóły spotkania:</h3>
                
                <div class="info-row">
                    <div class="info-label">🔢 Numer spotkania:</div>
                    <div class="info-value"><strong>${eventData.event_code}</strong></div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">📅 Data:</div>
                    <div class="info-value">${dateStr}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">⏰ Godzina:</div>
                    <div class="info-value">${timeStr}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">📋 Typ spotkania:</div>
                    <div class="info-value">${eventTypeName}</div>
                </div>
                
                ${eventData.location ? `
                <div class="info-row">
                    <div class="info-label">📍 Miejsce:</div>
                    <div class="info-value">${eventData.location}</div>
                </div>
                ` : ''}
                
                <div class="info-row">
                    <div class="info-label">⏱️ Czas trwania:</div>
                    <div class="info-value">${eventData.duration_minutes || 60} minut</div>
                </div>
            </div>
            
            ${eventData.description ? `
            <div class="info-box">
                <h3 style="margin: 0 0 15px 0; color: #3B82F6;">📝 Dodatkowe informacje:</h3>
                <p style="margin: 0;">${eventData.description}</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:kancelaria@example.com" class="button">
                    📧 Odpowiedz na tego emaila
                </a>
            </div>
            
            <div style="background: #F8FAFC; border: 1px solid #3B82F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong>⚠️ Ważne:</strong> W razie potrzeby zmiany terminu, prosimy o kontakt minimum 24 godziny przed spotkaniem.
            </div>
            
            <p>Przygotuj proszę wszystkie dokumenty związane ze sprawą.</p>
            
            <p>Do zobaczenia!</p>
            
            <p style="margin-top: 30px;">
                <strong>Z poważaniem,</strong><br>
                Zespół Kancelarii Prawnej
            </p>
        </div>
        
        <div class="footer">
            <p style="margin: 0;">📧 kancelaria@example.com | 📞 +48 123 456 789</p>
            <p style="margin: 5px 0 0 0; font-size: 0.8rem; color: #999;">
                Ten email został wygenerowany automatycznie. Prosimy nie odpowiadać na tę wiadomość.
            </p>
        </div>
    </div>
</body>
</html>
            `;
            
            // Wyślij email przez API
            const emailData = {
                to: clientEmail,
                subject: emailSubject,
                html: emailBody,
                client_id: eventData.client_id || null,
                event_id: event.id || null,
                event_code: eventData.event_code
            };
            
            console.log('📧 Próbuję wysłać email do:', clientEmail);
            
            try {
                const emailResponse = await window.api.request('/emails/send', {
                    method: 'POST',
                    body: JSON.stringify(emailData)
                });
                
                console.log('✅ Email wysłany pomyślnie:', emailResponse);
            } catch (emailError) {
                console.warn('⚠️ Email endpoint niedostępny - backend nie ma nodemailer');
                console.warn('💡 Zainstaluj: npm install nodemailer w folderze backend');
                // Nie przerywaj - to tylko dodatek
            }
            
        } catch (error) {
            console.error('❌ Błąd wysyłania emaila:', error);
            // Nie przerywaj procesu - email to dodatek
            console.warn('⚠️ Spotkanie utworzone, ale email nie został wysłany');
        }
    }
    
    /**
     * Usuń wydarzenie z kalendarza
     */
    async deleteEvent(eventId) {
        console.log('🗑️ Usuwanie wydarzenia:', eventId);
        
        // Potwierdź usunięcie
        const confirmed = confirm('Czy na pewno chcesz usunąć to wydarzenie?\n\nTa operacja jest nieodwracalna!');
        
        if (!confirmed) {
            console.log('❌ Użytkownik anulował usuwanie');
            return;
        }
        
        try {
            // Wywołaj API delete
            await window.api.request(`/events/${eventId}`, {
                method: 'DELETE'
            });
            
            console.log('✅ Wydarzenie usunięte');
            
            // Pokaż notyfikację
            this.showNotification('✅ Wydarzenie zostało usunięte!', 'success');
            
            // Zamknij modal z wydarzeniami dnia
            const dayModal = document.getElementById('dayEventsModal');
            if (dayModal) {
                dayModal.remove();
            }
            
            // Odśwież kalendarz
            await this.refresh();
            
            // Emit event przez Event Bus
            if (window.eventBus) {
                window.eventBus.emit('event:deleted', { eventId });
            }
            
        } catch (error) {
            console.error('❌ Błąd usuwania wydarzenia:', error);
            alert('Błąd przy usuwaniu wydarzenia: ' + error.message);
        }
    }
    
    /**
     * Pokaż notyfikację
     */
    showNotification(message, type = 'info') {
        const bgColors = {
            'success': 'linear-gradient(135deg, #3B82F6, #3B82F6)',
            'error': 'linear-gradient(135deg, #3B82F6, #1E40AF)',
            'info': 'linear-gradient(135deg, #3B82F6, #1E40AF)'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColors[type]};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            font-size: 1rem;
            font-weight: 600;
            z-index: 10001;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    /**
     * Nawigacja do poprzedniego okresu
     */
    navigatePrevious() {
        // W widoku dziennym (lista wszystkich) nawigacja jest nieaktywna
        if (this.currentView === 'day') {
            console.log('⚠️ Nawigacja niedostępna w widoku listy wszystkich wydarzeń');
            return;
        }
        
        if (this.currentView === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() - 7);
        } else if (this.currentView === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        }
        this.updateCalendarTitle();
        this.renderCurrentView();
    }
    
    /**
     * Nawigacja do następnego okresu
     */
    navigateNext() {
        // W widoku dziennym (lista wszystkich) nawigacja jest nieaktywna
        if (this.currentView === 'day') {
            console.log('⚠️ Nawigacja niedostępna w widoku listy wszystkich wydarzeń');
            return;
        }
        
        if (this.currentView === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() + 7);
        } else if (this.currentView === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        }
        this.updateCalendarTitle();
        this.renderCurrentView();
    }
}

// Eksportuj jako singleton
window.calendarManager = new CalendarManager();

console.log('✅ Calendar Manager załadowany!');
