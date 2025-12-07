// UNIVERSAL FUTURISTIC DASHBOARD v1.0
class UniversalDashboard {
    constructor() {
        this.currentUser = null;
        this.myTasks = [];
        this.myCases = [];
        this.myEvents = [];
        this.myDocuments = [];
        this.workHours = { today: 5, week: 38, month: 152 };
        this.privateNotes = '';
        this.currentNewsIndex = 0;
        this.newsArticles = [];
        this.currentRadioStation = 0;
        this.radioStations = [
            { name: 'Radio ZET', url: 'https://zt.cdn.eurozet.pl/zet-net.mp3', genre: '🎶 Top Hits', color: '#3B82F6' },
            { name: 'RMF FM', url: 'http://195.150.20.242:8000/rmf_fm', genre: '🎵 Pop/Rock', color: '#3B82F6' },
            { name: 'RMF Maxxx', url: 'https://rs8-krk2-cyfronet.rmfstream.pl/rmf_maxxx', genre: '🔥 Dance/Club', color: '#3B82F6' },
            { name: 'Chillizet', url: 'https://ch.cdn.eurozet.pl/chi-net.mp3', genre: '😌 Chillout', color: '#60A5FA' },
            { name: 'Meloradio', url: 'https://ml.cdn.eurozet.pl/mel-net.mp3', genre: '🎻 Klasyka', color: '#3B82F6' }
        ];
        console.log('🚀 Universal Dashboard init');
    }

    async init(containerId = null) {
        const userStr = localStorage.getItem('currentUser');
        this.currentUser = JSON.parse(userStr || '{}');
        if (!this.currentUser.id) return;
        
        await this.loadData();
        this.loadNewsArticles();
        this.render(containerId);
        this.startClock();
    }

    loadNewsArticles() {
        this.newsArticles = [
            // Prawo
            { title: 'Nowe przepisy prawne od przyszłego miesiąca', source: 'Infor.pl', category: 'Prawo', url: 'https://www.infor.pl/prawo', color: '#3B82F6' },
            { title: 'Wyrok TK w sprawie regulacji zawodowych', source: 'LEX', category: 'Prawo', url: 'https://sip.lex.pl', color: '#3B82F6' },
            { title: 'Zmiany w KPC od nowego roku', source: 'LexLege', category: 'Prawo', url: 'https://www.lexlege.pl', color: '#3B82F6' },
            { title: 'Reforma sądownictwa - projekt w Sejmie', source: 'MS', category: 'Prawo', url: 'https://www.gov.pl/web/sprawiedliwosc', color: '#3B82F6' },
            { title: 'Nowe wytyczne dotyczące e-doręczeń', source: 'Infor.pl', category: 'Tech', url: 'https://www.infor.pl/prawo', color: '#3B82F6' },
            { title: 'Orzecznictwo NSA - najnowsze wyroki', source: 'NSA', category: 'Prawo', url: 'https://orzeczenia.nsa.gov.pl', color: '#60A5FA' },
            { title: 'Podatki 2026 - zmiany w VAT i CIT', source: 'Infor.pl', category: 'Podatki', url: 'https://www.infor.pl/prawo', color: '#3B82F6' },
            { title: 'Prawo pracy - nowe przepisy BHP', source: 'LEX', category: 'Prawo', url: 'https://sip.lex.pl', color: '#3B82F6' },
            
            // Ogólne - Onet
            { title: 'Najważniejsze wydarzenia w Polsce', source: 'Onet', category: 'Polska', url: 'https://www.onet.pl', color: '#3B82F6' },
            { title: 'Nowe inwestycje infrastrukturalne', source: 'Onet', category: 'Gospodarka', url: 'https://www.onet.pl', color: '#3B82F6' },
            
            // Interia
            { title: 'Debata w Sejmie - relacja na żywo', source: 'Interia', category: 'Polityka', url: 'https://www.interia.pl', color: '#34495e' },
            { title: 'Rekordowy wzrost gospodarczy', source: 'Interia', category: 'Gospodarka', url: 'https://www.interia.pl', color: '#34495e' },
            
            // Gazeta.pl
            { title: 'Protesty w stolicy - aktualna sytuacja', source: 'Gazeta.pl', category: 'Polska', url: 'https://www.gazeta.pl', color: '#1E40AF' },
            { title: 'Reforma edukacji - nowe propozycje', source: 'Gazeta.pl', category: 'Edukacja', url: 'https://www.gazeta.pl', color: '#1E40AF' },
            
            // Prawo.pl
            { title: 'Nowelizacja kodeksu karnego przegłosowana', source: 'Prawo.pl', category: 'Prawo', url: 'https://www.prawo.pl', color: '#16a085' },
            { title: 'Sąd Najwyższy: przełomowy wyrok', source: 'Prawo.pl', category: 'Prawo', url: 'https://www.prawo.pl', color: '#16a085' },
            
            // WP
            { title: 'Pogoda: silne wiatry w całym kraju', source: 'WP', category: 'Pogoda', url: 'https://www.wp.pl', color: '#1E40AF' },
            { title: 'Konferencja premiera - podsumowanie', source: 'WP', category: 'Polityka', url: 'https://www.wp.pl', color: '#1E40AF' },
            
            // RMF24
            { title: 'Waluty: kurs złotego w dół', source: 'RMF24', category: 'Finanse', url: 'https://www.rmf24.pl', color: '#1E40AF' },
            { title: 'Sport: Polska wygrywa mecz!', source: 'RMF24', category: 'Sport', url: 'https://www.rmf24.pl', color: '#1E40AF' }
        ];
    }

    async loadData() {
        try {
            const [tasksRes, casesRes, eventsRes, docsRes] = await Promise.all([
                api.request('/tasks').catch(() => ({ tasks: [] })),
                api.request('/cases').catch(() => ({ cases: [] })),
                api.request('/events').catch(() => ({ events: [] })),
                api.request('/documents').catch(() => ({ documents: [] }))
            ]);
            
            this.myTasks = (tasksRes.tasks || []).filter(t => t.assigned_to === this.currentUser.id);
            this.myCases = (casesRes.cases || []).filter(c => 
                c.assigned_to === this.currentUser.id || 
                c.additional_caretaker === this.currentUser.id
            );
            
            const myCaseIds = this.myCases.map(c => c.id);
            this.myEvents = (eventsRes.events || []).filter(e => myCaseIds.includes(e.case_id));
            this.myDocuments = (docsRes.documents || []).slice(0, 5);
            
            this.privateNotes = localStorage.getItem(`notes_${this.currentUser.id}`) || '';
        } catch (error) {
            console.error('Błąd ładowania:', error);
        }
    }

    render(containerId = null) {
        const container = containerId ? document.getElementById(containerId) : 
                         (document.getElementById('lawyer-dashboardView') || 
                          document.getElementById('case-manager-dashboardView'));
        if (!container) return;

        const now = new Date();
        const todoTasks = this.myTasks.filter(t => t.status !== 'done');
        
        container.innerHTML = `
            <style>
                .futuristic-dash { background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460); 
                    min-height: 100vh; padding: 20px; color: white; }
                .glass-card { background: rgba(255,255,255,0.05); backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 20px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3); transition: transform 0.3s; }
                .glass-card:hover { transform: translateY(-5px); }
                .stat-card { background: linear-gradient(135deg, rgba(0,255,255,0.1), rgba(0,150,255,0.1));
                    border: 2px solid rgba(0,255,255,0.3); border-radius: 12px; padding: 10px; text-align: center; 
                    max-height: 96px; display: flex; flex-direction: column; justify-content: center; }
                .mini-tv { background: #000; border: 3px solid #333; border-radius: 10px; padding: 15px;
                    box-shadow: 0 0 20px rgba(0,255,255,0.5); }
                .tv-screen { background: linear-gradient(135deg, #001f3f, #003366); padding: 15px;
                    border-radius: 5px; font-family: monospace; font-size: 0.85rem; }
            </style>
            
            <div class="futuristic-dash">
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div class="glass-card">
                        <h1 style="margin:0; font-size: 2.5rem; text-shadow: 0 0 10px cyan;">
                            ${this.getGreeting()}, ${this.escapeHtml(this.currentUser.name)}! 👋
                        </h1>
                        <p style="margin: 10px 0 0; opacity: 0.8;">${this.getQuote()}</p>
                    </div>
                    <div class="glass-card">
                        <div id="liveClock" style="font-size: 3rem; font-weight: 700; text-align: center;
                            background: linear-gradient(135deg, #3B82F6, #1E40AF); -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;">00:00:00</div>
                        <div style="text-align: center; opacity: 0.9; margin-top: 10px;">
                            ${now.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 12px;">
                    <div class="stat-card"><div style="font-size: 1.5rem;">📋</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${this.myCases.length}</div>
                        <div style="font-size: 0.85rem;">Moich spraw</div></div>
                    <div class="stat-card"><div style="font-size: 1.5rem;">✅</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${todoTasks.length}</div>
                        <div style="font-size: 0.85rem;">Zadań do zrobienia</div></div>
                    <div class="stat-card"><div style="font-size: 1.5rem;">📅</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${this.myEvents.length}</div>
                        <div style="font-size: 0.85rem;">Wydarzeń</div></div>
                    <div class="stat-card" style="background: linear-gradient(135deg, rgba(255,0,0,0.2), rgba(0,255,0,0.2)); overflow: hidden; position: relative;">
                        ${this.renderChristmasAnimation()}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 3fr 1fr; gap: 20px;">
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div class="glass-card">
                            <h3 style="margin: 0 0 15px;">✅ Moje zadania (${todoTasks.length})</h3>
                            ${this.renderTasks(todoTasks)}
                        </div>
                        
                        <div class="glass-card">
                            <h3 style="margin: 0 0 15px;">📅 Nadchodzące wydarzenia (${this.myEvents.length})</h3>
                            ${this.renderEvents()}
                        </div>
                        
                        <div class="glass-card">
                            <h3 style="margin: 0 0 15px;">📝 Prywatne notatki <small style="opacity:0.7">Autosave</small></h3>
                            <textarea id="privateNotes" oninput="universalDashboard.saveNotes(this.value)"
                                style="width: 100%; min-height: 200px; background: rgba(0,0,0,0.3);
                                border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: white;
                                padding: 15px; resize: vertical;">${this.escapeHtml(this.privateNotes)}</textarea>
                        </div>
                        
                        <!-- EMPLOYEE DASHBOARD - Biały panel (formularze są w zakładce Tickety -> + Nowy Ticket) -->
                        <div id="embeddedEmployeeDashboard" style="background: white; border-radius: 20px; padding: 0; margin-top: 20px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
                            <div id="embeddedEmployeeDashboardContainer" style="min-height: 400px;">
                                <div style="padding: 40px; text-align: center; color: #666;">
                                    <div style="font-size: 2rem; margin-bottom: 10px;">⏳</div>
                                    Ładowanie dashboardu pracownika...
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div class="mini-tv">
                            <div style="text-align: center; color: #00ff00; font-weight: 700; margin-bottom: 10px; font-family: 'Courier New', monospace; text-shadow: 0 0 10px #00ff00;">
                                📺 PRO MERITUM TV</div>
                            <div class="tv-screen">${this.renderTV()}</div>
                        </div>
                        
                        ${this.renderCoffeeCounter()}
                        ${this.renderWeekendCountdown()}
                        
                        <div class="glass-card">
                            <h3 style="margin: 0 0 15px;">⚡ Szybkie akcje</h3>
                            <button onclick="app.switchView('crm')" style="width: 100%; background: linear-gradient(135deg, #3B82F6, #1E40AF);
                                border: none; border-radius: 12px; padding: 15px; color: white; margin-bottom: 10px; cursor: pointer;
                                font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 10px;
                                box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3); transition: all 0.3s;"
                                onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 20px rgba(52, 152, 219, 0.5)'"
                                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(52, 152, 219, 0.3)'">
                                <span style="font-size: 1.8rem;">👥</span> Klienci i Sprawy</button>
                            <button onclick="app.switchView('calendar')" style="width: 100%; background: linear-gradient(135deg, #3B82F6, #3B82F6);
                                border: none; border-radius: 12px; padding: 15px; color: white; margin-bottom: 10px; cursor: pointer;
                                font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 10px;
                                box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3); transition: all 0.3s;"
                                onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 20px rgba(46, 204, 113, 0.5)'"
                                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(46, 204, 113, 0.3)'">
                                <span style="font-size: 1.8rem;">📅</span> Kalendarz</button>
                            <button onclick="app.switchView('ai-assistant')" style="width: 100%; background: linear-gradient(135deg, #3B82F6, #1E40AF);
                                border: none; border-radius: 12px; padding: 15px; color: white; cursor: pointer;
                                font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 10px;
                                box-shadow: 0 4px 15px rgba(155, 89, 182, 0.3); transition: all 0.3s;"
                                onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 20px rgba(155, 89, 182, 0.5)'"
                                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(155, 89, 182, 0.3)'">
                                <span style="font-size: 1.8rem;">🤖</span> Asystent AI</button>
                        </div>
                        
                        <div class="glass-card">
                            <h3 style="margin: 0 0 15px;">📁 Ostatnie dokumenty</h3>
                            ${this.renderDocuments()}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Załaduj embedded employee dashboard po renderowaniu (daj czas na wstawienie HTML do DOM)
        setTimeout(() => {
            console.log('🔄 Checking for embeddedEmployeeDashboardContainer...');
            const checkContainer = document.getElementById('embeddedEmployeeDashboardContainer');
            console.log('Container found:', !!checkContainer);
            if (checkContainer) {
                this.loadEmbeddedEmployeeDashboard();
            } else {
                console.error('❌ embeddedEmployeeDashboardContainer not found in DOM!');
            }
        }, 500);
    }
    
    async loadEmbeddedEmployeeDashboard() {
        const container = document.getElementById('embeddedEmployeeDashboardContainer');
        
        try {
            console.log('🔄 Loading embedded employee dashboard...');
            console.log('Current user:', this.currentUser);
            
            if (!this.currentUser || !this.currentUser.id) {
                console.warn('No current user for embedded dashboard');
                if (container) container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Zaloguj się aby zobaczyć dashboard</div>';
                return;
            }
            
            // Sprawdź czy EmployeeDashboard jest dostępny w window
            if (!window.EmployeeDashboard) {
                console.warn('⚠️ window.EmployeeDashboard not available, waiting...');
                // Poczekaj i spróbuj ponownie
                setTimeout(() => this.loadEmbeddedEmployeeDashboard(), 500);
                return;
            }
            
            console.log('✅ EmployeeDashboard class found, creating instance...');
            
            // Utwórz nową instancję dla embedded dashboardu
            const embeddedDashboard = new window.EmployeeDashboard(this.currentUser.id);
            await embeddedDashboard.loadData();
            await embeddedDashboard.render('embeddedEmployeeDashboardContainer');
            
            // Zapisz referencję - WAŻNE: użyj tej samej nazwy co w onclick buttonów!
            window.employeeDashboard = embeddedDashboard;
            window.embeddedEmployeeDashboard = embeddedDashboard;
            
            console.log('✅ Embedded Employee Dashboard loaded successfully!');
        } catch (error) {
            console.error('❌ Error loading embedded employee dashboard:', error);
            if (container) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #dc3545;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">⚠️</div>
                        Błąd ładowania: ${error.message}
                    </div>
                `;
            }
        }
    }

    renderTasks(tasks) {
        if (!tasks.length) return '<p style="text-align: center; opacity: 0.7; padding: 20px;">✅ Brak zadań! 🎉</p>';
        return tasks.slice(0, 5).map(t => {
            // Priorytet - kolor border
            const priorityColors = {
                'high': '#F44336',
                'medium': '#FF9800',
                'low': '#4CAF50'
            };
            const borderColor = priorityColors[t.priority] || '#00ffff';
            
            // Ikona priorytetu
            const priorityIcons = {
                'high': '🔴',
                'medium': '🟡',
                'low': '🟢'
            };
            const priorityIcon = priorityIcons[t.priority] || '⚪';
            
            return `
            <div style="background: rgba(255,255,255,0.05); border-left: 4px solid ${borderColor}; padding: 12px;
                margin-bottom: 10px; border-radius: 8px; cursor: pointer; transition: all 0.3s;"
                data-task-id="${t.id}"
                data-case-id="${t.case_id || ''}"
                data-task-title="${this.escapeHtml(t.title)}"
                onclick="universalDashboard.openTask(this)"
                onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.transform='translateX(5px)'"
                onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.transform='translateX(0)'">
                
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div style="font-weight: 600; font-size: 0.95rem;">${this.escapeHtml(t.title)}</div>
                    ${t.priority ? `<span style="font-size: 1.2rem;">${priorityIcon}</span>` : ''}
                </div>
                
                <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.8rem; opacity: 0.9;">
                    ${t.case_number ? `<span style="background: rgba(52,152,219,0.2); padding: 3px 8px; border-radius: 4px; color: #3B82F6;">
                        📋 ${this.escapeHtml(t.case_number)}
                    </span>` : ''}
                    
                    ${t.due_date ? `<span style="background: rgba(241,196,15,0.2); padding: 3px 8px; border-radius: 4px; color: #f1c40f;">
                        📅 ${new Date(t.due_date).toLocaleDateString('pl-PL')}
                    </span>` : ''}
                    
                    ${t.category ? `<span style="background: rgba(155,89,182,0.2); padding: 3px 8px; border-radius: 4px; color: #3B82F6;">
                        🏷️ ${this.escapeHtml(t.category)}
                    </span>` : ''}
                </div>
                
                ${t.description ? `<div style="margin-top: 8px; font-size: 0.85rem; opacity: 0.7; font-style: italic;">
                    ${this.escapeHtml(t.description.substring(0, 80))}${t.description.length > 80 ? '...' : ''}
                </div>` : ''}
            </div>
        `;
        }).join('');
    }

    renderTV() {
        const now = new Date();
        const hour = now.getHours();
        
        let greeting = hour < 12 ? '☀️ DZIEŃ DOBRY!' : hour < 18 ? '🌤️ DOBRE POPOŁUDNIE!' : 
                      hour < 22 ? '🌆 DOBRY WIECZÓR!' : '🌙 DOBRANOC!';
        
        // Wyświetlaj 3 losowe newsy
        const displayNews = [...this.newsArticles].sort(() => Math.random() - 0.5).slice(0, 3);
        
        return `
            <style>
                @keyframes emblemPulse {
                    0%, 100% { transform: scale(1); opacity: 0.9; }
                    50% { transform: scale(1.1); opacity: 1; }
                }
                @keyframes newsSlideIn {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .news-card {
                    animation: newsSlideIn 0.5s ease-out;
                }
            </style>
            
            <div style="display: flex; flex-direction: column; height: 100%; gap: 8px;">
                <!-- Górna sekcja: Powitanie -->
                <div style="padding: 8px; background: rgba(0,255,0,0.05); border-radius: 8px; text-align: center;">
                    <div style="color: #00ff00; font-weight: 700; text-shadow: 0 0 5px #00ff00; font-size: 0.9rem;">
                        ${greeting}
                    </div>
                </div>
                
                <!-- Nowoczesne karty newsów -->
                <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
                    ${displayNews.map((news, i) => `
                        <div class="news-card" style="background: linear-gradient(135deg, ${news.color}15, ${news.color}05); 
                                    border-left: 3px solid ${news.color}; border-radius: 6px; padding: 8px;
                                    cursor: pointer; transition: all 0.3s; animation-delay: ${i * 0.1}s;"
                             onclick="window.open('${news.url}', '_blank')"
                             onmouseover="this.style.transform='translateX(5px)'; this.style.boxShadow='0 4px 12px ${news.color}40'"
                             onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='none'">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
                                <span style="background: ${news.color}; color: white; padding: 2px 6px; border-radius: 4px; 
                                            font-size: 0.6rem; font-weight: 700; text-transform: uppercase;">
                                    ${news.category}
                                </span>
                                <span style="color: ${news.color}; font-size: 0.65rem; font-weight: 600; opacity: 0.8;">
                                    ${news.source}
                                </span>
                            </div>
                            <div style="color: white; font-size: 0.75rem; font-weight: 600; line-height: 1.3;">
                                ${news.title}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Pogoda kompakt -->
                <div style="background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.1)); 
                            border-radius: 6px; padding: 6px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="font-size: 1.5rem;">⛅</div>
                        <div>
                            <div style="color: #ffd700; font-weight: 600; font-size: 0.7rem;">Wrocław</div>
                            <div style="color: #00ffff; font-size: 0.75rem; font-weight: 700;">12°C</div>
                        </div>
                    </div>
                    <div style="color: rgba(255,255,255,0.6); font-size: 0.65rem;">
                        Częściowe zachmurzenie
                    </div>
                </div>
            </div>
        `;
    }

    renderRadio() {
        const currentStation = this.radioStations[this.currentRadioStation];
        const stationColor = currentStation.color || '#ff6600';
        
        return `
            <style>
                @keyframes radioGlow {
                    0%, 100% { box-shadow: 0 0 20px ${stationColor}, 0 0 40px ${stationColor}40, inset 0 0 20px ${stationColor}20; }
                    50% { box-shadow: 0 0 30px ${stationColor}, 0 0 60px ${stationColor}60, inset 0 0 30px ${stationColor}30; }
                }
                @keyframes vinylSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes equalizer {
                    0%, 100% { height: 10px; }
                    50% { height: 25px; }
                }
                .eq-bar {
                    width: 4px;
                    background: linear-gradient(to top, ${stationColor}, #fff);
                    border-radius: 2px;
                    animation: equalizer 0.8s ease-in-out infinite;
                }
            </style>
            
            <div style="text-align: center; position: relative;">
                <div style="background: linear-gradient(135deg, ${stationColor}40, ${stationColor}20); 
                    border: 3px solid ${stationColor}; border-radius: 20px; padding: 20px; 
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5), 0 0 20px ${stationColor}60;
                    position: relative; overflow: hidden;">
                    
                    <!-- Animated background -->
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
                        background: radial-gradient(circle at 50% 50%, ${stationColor}10, transparent); 
                        animation: radioGlow 3s ease-in-out infinite; pointer-events: none;"></div>
                    
                    <!-- Station info -->
                    <div style="position: relative; z-index: 1;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                            <div id="vinylDisc" style="width: 60px; height: 60px; border-radius: 50%; 
                                background: linear-gradient(135deg, #1a1a1a, #000); 
                                border: 3px solid ${stationColor}; position: relative;
                                box-shadow: 0 5px 20px rgba(0,0,0,0.7), inset 0 0 20px rgba(0,0,0,0.8);">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                                    width: 15px; height: 15px; border-radius: 50%; background: #333;
                                    border: 2px solid ${stationColor};"></div>
                                <div style="position: absolute; top: 10%; left: 10%; right: 10%; bottom: 10%;
                                    border: 1px solid ${stationColor}40; border-radius: 50%;"></div>
                            </div>
                            
                            <div style="text-align: left;">
                                <div style="color: ${stationColor}; font-size: 1.3rem; font-weight: 700; 
                                    text-shadow: 0 0 10px ${stationColor}, 0 2px 4px rgba(0,0,0,0.5);
                                    margin-bottom: 3px;">
                                    ${currentStation.name}
                                </div>
                                <div style="color: #fff; font-size: 0.85rem; opacity: 0.9;">
                                    ${currentStation.genre}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Equalizer -->
                        <div id="equalizer" style="display: none; justify-content: center; align-items: flex-end; gap: 4px; height: 30px; margin-bottom: 15px;">
                            <div class="eq-bar" style="animation-delay: 0s;"></div>
                            <div class="eq-bar" style="animation-delay: 0.1s;"></div>
                            <div class="eq-bar" style="animation-delay: 0.2s;"></div>
                            <div class="eq-bar" style="animation-delay: 0.3s;"></div>
                            <div class="eq-bar" style="animation-delay: 0.4s;"></div>
                            <div class="eq-bar" style="animation-delay: 0.3s;"></div>
                            <div class="eq-bar" style="animation-delay: 0.2s;"></div>
                            <div class="eq-bar" style="animation-delay: 0.1s;"></div>
                        </div>
                        
                        <!-- Controls -->
                        <div style="display: flex; justify-content: center; align-items: center; gap: 15px;">
                            <button onclick="universalDashboard.prevRadio()" 
                                style="background: linear-gradient(135deg, ${stationColor}, ${stationColor}cc); 
                                border: none; border-radius: 50%; width: 45px; height: 45px; 
                                color: white; cursor: pointer; font-size: 1.3rem; font-weight: bold; 
                                box-shadow: 0 4px 15px ${stationColor}60; transition: all 0.3s;"
                                onmouseover="this.style.transform='scale(1.15) rotate(-15deg)'; this.style.boxShadow='0 6px 20px ${stationColor}'"
                                onmouseout="this.style.transform='scale(1) rotate(0deg)'; this.style.boxShadow='0 4px 15px ${stationColor}60'">
                                ⏮
                            </button>
                            
                            <button id="radioPlayBtn" onclick="universalDashboard.toggleRadio()" 
                                style="background: linear-gradient(135deg, ${stationColor}, ${stationColor}dd); 
                                border: 4px solid white; border-radius: 50%; width: 65px; height: 65px; 
                                color: white; cursor: pointer; font-size: 2rem; 
                                box-shadow: 0 8px 30px ${stationColor}80, 0 0 20px ${stationColor}; 
                                transition: all 0.3s;"
                                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 10px 40px ${stationColor}'"
                                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 8px 30px ${stationColor}80'">
                                ▶
                            </button>
                            
                            <button onclick="universalDashboard.nextRadio()" 
                                style="background: linear-gradient(135deg, ${stationColor}, ${stationColor}cc); 
                                border: none; border-radius: 50%; width: 45px; height: 45px; 
                                color: white; cursor: pointer; font-size: 1.3rem; font-weight: bold; 
                                box-shadow: 0 4px 15px ${stationColor}60; transition: all 0.3s;"
                                onmouseover="this.style.transform='scale(1.15) rotate(15deg)'; this.style.boxShadow='0 6px 20px ${stationColor}'"
                                onmouseout="this.style.transform='scale(1) rotate(0deg)'; this.style.boxShadow='0 4px 15px ${stationColor}60'">
                                ⏭
                            </button>
                        </div>
                        
                        <!-- Volume -->
                        <div style="margin-top: 15px; background: rgba(0,0,0,0.3); border-radius: 20px; padding: 10px;">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                                <span style="font-size: 1.2rem;">🔇</span>
                                <input type="range" id="volumeControl" min="0" max="100" value="70" 
                                    style="flex: 1; max-width: 150px; height: 6px; border-radius: 3px; 
                                    background: linear-gradient(to right, ${stationColor}40, ${stationColor}); 
                                    outline: none; cursor: pointer;"
                                    oninput="universalDashboard.setVolume(this.value)"
                                    onchange="universalDashboard.setVolume(this.value)">
                                <span style="font-size: 1.2rem;">🔊</span>
                                <span style="color: white; font-weight: 600; min-width: 45px; text-align: right;" id="volumeLabel">70%</span>
                            </div>
                        </div>
                        
                        <div style="color: rgba(255,255,255,0.5); font-size: 0.75rem; margin-top: 10px;">
                            Stacja ${this.currentRadioStation + 1} / ${this.radioStations.length}
                        </div>
                    </div>
                </div>
                
                <audio id="radioPlayer" preload="none" crossorigin="anonymous"></audio>
            </div>
        `;
    }

    nextNews() {
        this.currentNewsIndex = (this.currentNewsIndex + 1) % this.newsArticles.length;
        this.render();
    }

    prevNews() {
        this.currentNewsIndex = (this.currentNewsIndex - 1 + this.newsArticles.length) % this.newsArticles.length;
        this.render();
    }

    nextRadio() {
        this.currentRadioStation = (this.currentRadioStation + 1) % this.radioStations.length;
        const player = document.getElementById('radioPlayer');
        const wasPlaying = !player.paused;
        this.render();
        if (wasPlaying) {
            setTimeout(() => this.playRadio(), 100);
        }
    }

    prevRadio() {
        this.currentRadioStation = (this.currentRadioStation - 1 + this.radioStations.length) % this.radioStations.length;
        const player = document.getElementById('radioPlayer');
        const wasPlaying = !player.paused;
        this.render();
        if (wasPlaying) {
            setTimeout(() => this.playRadio(), 100);
        }
    }

    toggleRadio() {
        const player = document.getElementById('radioPlayer');
        const btn = document.getElementById('radioPlayBtn');
        const vinyl = document.getElementById('vinylDisc');
        const equalizer = document.getElementById('equalizer');
        const station = this.radioStations[this.currentRadioStation];
        
        if (player.paused) {
            this.playRadio();
        } else {
            player.pause();
            btn.innerHTML = '▶';
            btn.style.background = `linear-gradient(135deg, ${station.color}, ${station.color}dd)`;
            
            // Zatrzymaj animacje
            if (vinyl) {
                vinyl.style.animation = 'none';
            }
            if (equalizer) {
                equalizer.style.display = 'none';
            }
        }
    }

    playRadio() {
        const player = document.getElementById('radioPlayer');
        const btn = document.getElementById('radioPlayBtn');
        const vinyl = document.getElementById('vinylDisc');
        const equalizer = document.getElementById('equalizer');
        const station = this.radioStations[this.currentRadioStation];
        
        console.log(`📻 Próba odtworzenia: ${station.name} - ${station.url}`);
        
        // Reset player
        player.pause();
        player.src = '';
        player.load();
        
        // Set new source
        player.src = station.url;
        player.volume = 0.7; // 70% głośności
        
        // Try to play
        const playPromise = player.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log(`✅ Odtwarzanie: ${station.name}`);
                btn.innerHTML = '⏸';
                btn.style.background = 'linear-gradient(135deg, #00ff00, #00cc00)';
                
                // Animacje podczas grania
                if (vinyl) {
                    vinyl.style.animation = 'vinylSpin 3s linear infinite';
                }
                if (equalizer) {
                    equalizer.style.display = 'flex';
                }
            }).catch(err => {
                console.error('❌ Błąd odtwarzania radia:', err);
                console.error('Stacja:', station.name, 'URL:', station.url);
                
                // Try alternative approach for some streams
                setTimeout(() => {
                    player.load();
                    player.play().then(() => {
                        console.log(`✅ Odtwarzanie (retry): ${station.name}`);
                        btn.innerHTML = '⏸';
                        btn.style.background = 'linear-gradient(135deg, #00ff00, #00cc00)';
                        
                        if (vinyl) vinyl.style.animation = 'vinylSpin 3s linear infinite';
                        if (equalizer) equalizer.style.display = 'flex';
                    }).catch(err2 => {
                        alert(`Nie można odtworzyć: ${station.name}\nSpróbuj innej stacji lub sprawdź połączenie internetowe.`);
                    });
                }, 500);
            });
        }
    }

    setVolume(value) {
        const player = document.getElementById('radioPlayer');
        const label = document.getElementById('volumeLabel');
        
        if (player) {
            player.volume = value / 100;
            if (label) {
                label.textContent = value + '%';
            }
            console.log(`🔊 Głośność: ${value}%`);
        }
    }

    getHoliday(month, day) {
        const holidays = {
            '0-1': '🎉 NOWY ROK!', '0-6': '👑 Święto Trzech Króli',
            '4-1': '🌹 Święto Pracy', '4-3': '🇵🇱 Konstytucja 3 Maja',
            '10-11': '🇵🇱 Święto Niepodległości', '11-25': '🎄 Boże Narodzenie'
        };
        return holidays[`${month}-${day}`] || null;
    }

    getGreeting() {
        const hour = new Date().getHours();
        return hour < 12 ? 'Dzień dobry' : hour < 18 ? 'Dobre popołudnie' : 'Dobry wieczór';
    }

    getQuote() {
        const quotes = [
            'Sprawiedliwość opóźniona to sprawiedliwość odmówiona',
            'Prawo jest sztuką tego, co dobre i słuszne',
            'Wiedza to potęga, ale prawo to moc',
            'Każdy dzień to nowa szansa na sukces'
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    startClock() {
        setInterval(() => {
            const clock = document.getElementById('liveClock');
            if (clock) clock.textContent = new Date().toLocaleTimeString('pl-PL');
        }, 1000);
    }

    saveNotes(value) {
        this.privateNotes = value;
        localStorage.setItem(`notes_${this.currentUser.id}`, value);
    }

    showForm(type) {
        const formConfigs = {
            vacation: { 
                title: '🏖️ Wniosek urlopowy', 
                department: 'HR',
                ticketType: 'urlop',
                fields: [
                    { name: 'dateFrom', label: 'Data od', type: 'date', required: true },
                    { name: 'dateTo', label: 'Data do', type: 'date', required: true },
                    { name: 'reason', label: 'Rodzaj urlopu', type: 'select', options: ['Wypoczynkowy', 'Na żądanie', 'Bezpłatny', 'Okolicznościowy'], required: true },
                    { name: 'notes', label: 'Uwagi', type: 'textarea', required: false }
                ]
            },
            remote: { 
                title: '🏠 Praca zdalna', 
                department: 'HR',
                ticketType: 'praca_zdalna',
                fields: [
                    { name: 'date', label: 'Data', type: 'date', required: true },
                    { name: 'reason', label: 'Powód', type: 'textarea', required: true }
                ]
            },
            expense: { 
                title: '💰 Rozliczenie delegacji', 
                department: 'Księgowość',
                ticketType: 'delegacja',
                fields: [
                    { name: 'destination', label: 'Miejsce wyjazdu', type: 'text', required: true },
                    { name: 'dateFrom', label: 'Data od', type: 'date', required: true },
                    { name: 'dateTo', label: 'Data do', type: 'date', required: true },
                    { name: 'amount', label: 'Kwota (PLN)', type: 'number', required: true },
                    { name: 'description', label: 'Opis kosztów', type: 'textarea', required: true }
                ]
            },
            sickleave: { 
                title: '🏥 Zwolnienie lekarskie (L4)', 
                department: 'HR',
                ticketType: 'l4',
                fields: [
                    { name: 'dateFrom', label: 'Data od', type: 'date', required: true },
                    { name: 'dateTo', label: 'Data do', type: 'date', required: true },
                    { name: 'number', label: 'Numer zaświadczenia', type: 'text', required: true }
                ]
            },
            training: { 
                title: '📚 Wniosek o szkolenie', 
                department: 'HR/Rozwój',
                ticketType: 'szkolenie',
                fields: [
                    { name: 'name', label: 'Nazwa szkolenia', type: 'text', required: true },
                    { name: 'date', label: 'Termin', type: 'date', required: true },
                    { name: 'cost', label: 'Koszt (PLN)', type: 'number', required: true },
                    { name: 'justification', label: 'Uzasadnienie', type: 'textarea', required: true }
                ]
            },
            parking: { 
                title: '🚗 Wniosek o miejsce parkingowe', 
                department: 'Administracja',
                ticketType: 'parking',
                fields: [
                    { name: 'carModel', label: 'Marka i model auta', type: 'text', required: true },
                    { name: 'registration', label: 'Numer rejestracyjny', type: 'text', required: true },
                    { name: 'reason', label: 'Uzasadnienie', type: 'textarea', required: true }
                ]
            },
            advance: { 
                title: '💳 Wniosek o zaliczkę', 
                department: 'Księgowość',
                ticketType: 'zaliczka',
                fields: [
                    { name: 'amount', label: 'Kwota (PLN)', type: 'number', required: true },
                    { name: 'purpose', label: 'Cel', type: 'textarea', required: true },
                    { name: 'date', label: 'Data potrzebna', type: 'date', required: true }
                ]
            },
            overtime: { 
                title: '⏰ Rozliczenie nadgodzin', 
                department: 'HR/Płace',
                ticketType: 'nadgodziny',
                fields: [
                    { name: 'date', label: 'Data', type: 'date', required: true },
                    { name: 'hours', label: 'Liczba godzin', type: 'number', required: true },
                    { name: 'description', label: 'Opis prac', type: 'textarea', required: true }
                ]
            },
            access: { 
                title: '🔑 Wniosek o dostęp do systemów', 
                department: 'IT',
                ticketType: 'dostep_it',
                fields: [
                    { name: 'system', label: 'System/Aplikacja', type: 'select', options: [
                        '-- Bazy prawne --',
                        'LEX', 'Legalis', 'SIP', 'Baza prawna',
                        '-- Systemy wewnętrzne --',
                        'CRM', 'Email korporacyjny', 'Dysk sieciowy', 'VPN', 'System finansowy',
                        '-- Narzędzia deweloperskie --',
                        'GitHub/GitLab',
                        '-- Media społecznościowe --',
                        'Facebook', 'Instagram', 'X (Twitter)', 'TikTok', 'YouTube',
                        '-- Google Workspace --',
                        'Google Workspace', 'Gmail', 'Google Drive', 'Google Calendar', 'Google Meet',
                        '-- Inne --',
                        'Inne'
                    ], required: true, hasOtherOption: true },
                    { name: 'systemOther', label: 'Podaj nazwę systemu', type: 'text', required: false, showWhen: 'system', showWhenValue: 'Inne' },
                    { name: 'accessLevel', label: 'Poziom dostępu', type: 'select', options: ['Użytkownik', 'Administrator', 'Tylko odczyt', 'Edycja', 'Pełny dostęp'], required: true },
                    { name: 'accountType', label: 'Rodzaj konta (dla social media)', type: 'select', options: ['', 'Konto firmowe', 'Dostęp administratora', 'Dostęp do publikacji', 'Dostęp do statystyk'], required: false },
                    { name: 'justification', label: 'Uzasadnienie', type: 'textarea', required: true }
                ]
            },
            phone: { 
                title: '📱 Wniosek o sprzęt służbowy', 
                department: 'IT/Administracja',
                ticketType: 'sprzet',
                fields: [
                    { name: 'deviceType', label: 'Typ urządzenia', type: 'select', options: ['Telefon', 'Tablet', 'Laptop', 'Komputer'], required: true },
                    { name: 'model', label: 'Preferowany model (opcjonalnie)', type: 'text', required: false },
                    { name: 'justification', label: 'Uzasadnienie', type: 'textarea', required: true }
                ]
            },
            supplies: { 
                title: '🖨️ Zamówienie materiałów biurowych', 
                department: 'Administracja',
                ticketType: 'materialy',
                fields: [
                    { name: 'items', label: 'Lista artykułów', type: 'textarea', required: true },
                    { name: 'quantity', label: 'Ilości', type: 'textarea', required: true },
                    { name: 'urgency', label: 'Pilność', type: 'select', options: ['Normalna', 'Pilne', 'Bardzo pilne'], required: true }
                ]
            }
        };
        
        const config = formConfigs[type];
        if (!config) return;
        
        this.renderFormModal(config);
    }

    renderFormModal(config) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.3s;
        `;
        
        const fieldsHTML = config.fields.map((field, index) => {
            const displayStyle = field.showWhen ? 'display: none;' : '';
            const dataAttributes = field.showWhen ? `data-show-when="${field.showWhen}" data-show-value="${field.showWhenValue}"` : '';
            
            if (field.type === 'select') {
                const onChangeAttr = field.hasOtherOption ? `onchange="universalDashboard.toggleConditionalFields(this)"` : '';
                return `
                    <div style="margin-bottom: 15px; ${displayStyle}" ${dataAttributes}>
                        <label style="display: block; margin-bottom: 5px; color: white; font-weight: 600;">
                            ${field.label} ${field.required ? '<span style="color: #3B82F6;">*</span>' : ''}
                        </label>
                        <select name="${field.name}" ${field.required ? 'required' : ''} ${onChangeAttr}
                                style="width: 100%; padding: 10px; border-radius: 8px; border: 2px solid rgba(255,255,255,0.2); 
                                background: rgba(0,0,0,0.3); color: white; font-size: 1rem;">
                            <option value="">-- Wybierz --</option>
                            ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>
                    </div>
                `;
            } else if (field.type === 'textarea') {
                return `
                    <div style="margin-bottom: 15px; ${displayStyle}" ${dataAttributes}>
                        <label style="display: block; margin-bottom: 5px; color: white; font-weight: 600;">
                            ${field.label} ${field.required ? '<span style="color: #3B82F6;">*</span>' : ''}
                        </label>
                        <textarea name="${field.name}" ${field.required ? 'required' : ''} 
                                  style="width: 100%; padding: 10px; border-radius: 8px; border: 2px solid rgba(255,255,255,0.2); 
                                  background: rgba(0,0,0,0.3); color: white; font-size: 1rem; min-height: 80px; resize: vertical;"></textarea>
                    </div>
                `;
            } else {
                return `
                    <div style="margin-bottom: 15px; ${displayStyle}" ${dataAttributes}>
                        <label style="display: block; margin-bottom: 5px; color: white; font-weight: 600;">
                            ${field.label} ${field.required ? '<span style="color: #3B82F6;">*</span>' : ''}
                        </label>
                        <input type="${field.type}" name="${field.name}" ${field.required ? 'required' : ''}
                               style="width: 100%; padding: 10px; border-radius: 8px; border: 2px solid rgba(255,255,255,0.2); 
                               background: rgba(0,0,0,0.3); color: white; font-size: 1rem;" />
                    </div>
                `;
            }
        }).join('');
        
        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 20px; 
                        padding: 30px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: white; font-size: 1.8rem;">
                        ${config.title}
                    </h2>
                    <button onclick="this.closest('div[style*=fixed]').remove()" 
                            style="background: #3B82F6; border: none; border-radius: 50%; 
                            width: 40px; height: 40px; color: white; font-size: 1.5rem; 
                            cursor: pointer; font-weight: 700;">×</button>
                </div>
                
                <form id="ticketForm" onsubmit="universalDashboard.submitTicket(event, '${config.ticketType}', '${config.department}', '${config.title}')">
                    ${fieldsHTML}
                    
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="button" onclick="this.closest('div[style*=fixed]').remove()"
                                style="flex: 1; padding: 12px; background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.3); 
                                border-radius: 10px; color: white; font-weight: 600; cursor: pointer;">
                            Anuluj
                        </button>
                        <button type="submit"
                                style="flex: 1; padding: 12px; background: linear-gradient(135deg, #3B82F6, #3B82F6); 
                                border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer;">
                            ✅ Wyślij wniosek
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    toggleConditionalFields(selectElement) {
        const form = selectElement.closest('form');
        const selectedValue = selectElement.value;
        const fieldName = selectElement.name;
        
        // Znajdź wszystkie pola warunkowe związane z tym selectem
        const conditionalFields = form.querySelectorAll(`[data-show-when="${fieldName}"]`);
        
        conditionalFields.forEach(field => {
            const showValue = field.getAttribute('data-show-value');
            const input = field.querySelector('input, textarea, select');
            
            if (selectedValue === showValue) {
                field.style.display = 'block';
                if (input) input.required = true;
            } else {
                field.style.display = 'none';
                if (input) {
                    input.required = false;
                    input.value = '';
                }
            }
        });
    }

    async submitTicket(event, ticketType, department, title) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        const ticketPayload = {
            user_id: this.currentUser.id,
            ticket_type: ticketType,
            title: title,
            department: department,
            details: data,
            priority: 'normal'
        };
        
        try {
            const response = await api.request('/tickets', {
                method: 'POST',
                body: JSON.stringify(ticketPayload)
            });
            
            console.log('🎫 Utworzono ticket:', response);
            
            // Zamknij modal
            form.closest('div[style*="fixed"]').remove();
            
            // Potwierdzenie
            alert(`✅ Ticket utworzony!\n\n` +
                  `📋 Numer: ${response.ticket.ticket_number}\n` +
                  `📝 Typ: ${title}\n` +
                  `🏢 Dział: ${department}\n` +
                  `👤 Zleceniodawca: ${this.currentUser.name}\n` +
                  `📊 Status: ${response.ticket.status}\n\n` +
                  `Ticket został przekazany do działu ${department}.\n` +
                  `Otrzymasz powiadomienie o zmianie statusu.`);
        } catch (error) {
            console.error('❌ Błąd tworzenia ticketu:', error);
            alert('Błąd podczas tworzenia ticketu. Spróbuj ponownie.');
        }
    }

    renderChristmasAnimation() {
        const now = new Date();
        const hour = now.getHours();
        const daysUntilChristmas = Math.floor((new Date('2025-12-25') - now) / (1000 * 60 * 60 * 24));
        
        // Rano (6-18): Mikołaj jedzie
        // Wieczorem (18-6): Renifer i choinka
        const isDaytime = hour >= 6 && hour < 18;
        
        if (isDaytime) {
            // Animacja dzienna - Mikołaj w saniach
            return `
            <div style="position: absolute; width: 100%; height: 100%; overflow: hidden;">
                <style>
                    @keyframes sleighRide {
                        0% { left: -150px; }
                        100% { left: 100%; }
                    }
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0) scale(1); }
                        50% { transform: translateY(-8px) scale(1.05); }
                    }
                    @keyframes starTwinkle {
                        0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
                        50% { opacity: 0.6; transform: scale(1.3) rotate(180deg); }
                    }
                </style>
                <div style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); font-size: 2.5rem; animation: sleighRide 10s linear infinite;">
                    🦌🎅🛷
                </div>
                <div style="position: absolute; left: 20%; top: 50%; transform: translateY(-50%); font-size: 2.5rem; animation: bounce 1.2s ease-in-out infinite;">
                    ⛄
                </div>
                <div style="position: absolute; left: 50%; top: 30%; font-size: 1.5rem; animation: starTwinkle 2s ease-in-out infinite;">
                    ⭐
                </div>
                <div style="position: absolute; right: 15%; top: 50%; transform: translateY(-50%); font-size: 2rem; animation: bounce 1.5s ease-in-out infinite 0.3s;">
                    🎁
                </div>
                <div style="font-size: 0.85rem; font-weight: 700; color: #ffd700; text-shadow: 0 0 10px rgba(255,215,0,0.5); position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%);">
                    ${daysUntilChristmas > 0 ? `Święta za ${daysUntilChristmas} dni!` : '🎄 Wesołych Świąt! 🎄'}
                </div>
                <div class="snowflake" style="left: 75%; animation-delay: 2.4s; font-size: 1.1rem;">❄️</div>
                <div class="snowflake" style="left: 85%; animation-delay: 0.5s; font-size: 1.3rem;">❄️</div>
                <div class="snowflake" style="left: 95%; animation-delay: 1.2s; font-size: 1rem;">❄️</div>
            </div>
        `;
        } else {
            // Animacja nocna - Choinka z gwiazdkami
            return `
            <div style="position: absolute; width: 100%; height: 100%; overflow: hidden;">
                <style>
                    @keyframes treeSway {
                        0%, 100% { transform: translateY(-50%) rotate(-3deg); }
                        50% { transform: translateY(-50%) rotate(3deg); }
                    }
                    @keyframes starFloat {
                        0%, 100% { transform: translateY(0) rotate(0deg); }
                        50% { transform: translateY(-12px) rotate(180deg); }
                    }
                    @keyframes moonGlow {
                        0%, 100% { opacity: 0.7; transform: scale(1); }
                        50% { opacity: 1; transform: scale(1.1); }
                    }
                    @keyframes snowmanBounce {
                        0%, 100% { transform: translateY(-50%) scale(1); }
                        50% { transform: translateY(-55%) scale(1.05); }
                    }
                </style>
                <div style="position: absolute; left: 15%; top: 50%; font-size: 3rem; animation: treeSway 2.5s ease-in-out infinite;">
                    🎄
                </div>
                <div style="position: absolute; left: 10%; top: 25%; font-size: 1.8rem; animation: starFloat 3s ease-in-out infinite;">
                    ⭐
                </div>
                <div style="position: absolute; right: 20%; top: 20%; font-size: 2.5rem; animation: moonGlow 4s ease-in-out infinite;">
                    🌙
                </div>
                <div style="position: absolute; left: 45%; top: 50%; font-size: 2.3rem; animation: snowmanBounce 1.8s ease-in-out infinite;">
                    ⛄
                </div>
                <div style="position: absolute; right: 15%; top: 50%; transform: translateY(-50%); font-size: 1.5rem; animation: starFloat 2.5s ease-in-out infinite 0.5s;">
                    ✨
                </div>
                <div style="position: absolute; left: 70%; top: 40%; font-size: 1.3rem; animation: starFloat 2s ease-in-out infinite 1s;">
                    ⭐
                </div>
                <div style="font-size: 0.85rem; font-weight: 700; color: #ffd700; text-shadow: 0 0 10px rgba(255,215,0,0.5); position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%);">
                    ${daysUntilChristmas > 0 ? `Święta za ${daysUntilChristmas} dni!` : '🎄 Wesołych Świąt! 🎄'}
                </div>
            </div>
        `;
        }
    }

    renderEvents() {
        if (!this.myEvents || !this.myEvents.length) {
            return '<p style="text-align: center; opacity: 0.7; padding: 20px;">📅 Brak nadchodzących wydarzeń</p>';
        }
        
        const now = new Date();
        const upcomingEvents = this.myEvents
            .filter(e => new Date(e.start_date) >= now)
            .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
            .slice(0, 5);
        
        if (!upcomingEvents.length) {
            return '<p style="text-align: center; opacity: 0.7; padding: 20px;">📅 Brak nadchodzących wydarzeń</p>';
        }
        
        return upcomingEvents.map(e => {
            const eventDate = new Date(e.start_date);
            const typeEmoji = e.type === 'hearing' ? '⚖️' : e.type === 'meeting' ? '👥' : 
                            e.type === 'deadline' ? '⏰' : '📅';
            
            return `
                <div style="background: rgba(255,255,255,0.05); border-left: 4px solid #00ffff; padding: 12px;
                    margin-bottom: 10px; border-radius: 8px; cursor: pointer; transition: all 0.3s;"
                    onclick="window.viewEventDetails && window.viewEventDetails(${e.id})"
                    onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.transform='translateX(5px)'"
                    onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.transform='translateX(0)'">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="font-size: 1.5rem;">${typeEmoji}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">${this.escapeHtml(e.title || 'Wydarzenie')}</div>
                            <div style="font-size: 0.85rem; opacity: 0.8;">
                                📅 ${eventDate.toLocaleDateString('pl-PL')} 
                                🕐 ${eventDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            ${e.location ? `<div style="font-size: 0.85rem; opacity: 0.8;">📍 ${this.escapeHtml(e.location)}</div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderDocuments() {
        if (!this.myDocuments || !this.myDocuments.length) {
            return `
                <div style="font-size: 0.85rem; opacity: 0.7; text-align: center; padding: 15px;">
                    📁 Brak dokumentów<br>
                    <small>Dokumenty pojawią się gdy zostaną dodane</small>
                </div>
            `;
        }
        
        return `
            <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 8px;">
                ${this.myDocuments.map((doc, idx) => {
                    const timeAgo = this.getTimeAgo(doc.created_at);
                    const icon = this.getDocIcon(doc.name || doc.file_name);
                    const fileName = this.escapeHtml(doc.name || doc.file_name || 'Dokument');
                    const shortName = fileName.length > 25 ? fileName.substring(0, 25) + '...' : fileName;
                    
                    return `
                        <div style="padding: 8px 10px; background: rgba(255,255,255,0.05); border-radius: 6px; 
                            cursor: pointer; transition: all 0.3s; border-left: 3px solid rgba(0,255,255,0.5);"
                            onclick="window.open('${doc.file_path || '#'}', '_blank')"
                            onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.borderLeftColor='#00ffff'"
                            onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderLeftColor='rgba(0,255,255,0.5)'">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 1.2rem;">${icon}</span>
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${fileName}">
                                        ${shortName}
                                    </div>
                                    <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 2px;">${timeAgo}</div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    getDocIcon(filename) {
        if (!filename) return '📄';
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'pdf': '📕',
            'doc': '📘',
            'docx': '📘',
            'xls': '📊',
            'xlsx': '📊',
            'txt': '📝',
            'jpg': '🖼️',
            'jpeg': '🖼️',
            'png': '🖼️',
            'zip': '📦',
            'rar': '📦'
        };
        return icons[ext] || '📄';
    }

    getTimeAgo(dateStr) {
        if (!dateStr) return 'Niedawno';
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 60) return `${diffMins} min temu`;
        if (diffHours < 24) return `${diffHours}h temu`;
        if (diffDays === 1) return 'Wczoraj';
        if (diffDays < 7) return `${diffDays} dni temu`;
        return date.toLocaleDateString('pl-PL');
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    renderCoffeeCounter() {
        const today = new Date().toDateString();
        const storageKey = `coffee_${this.currentUser.id}_${today}`;
        const coffeeCount = parseInt(localStorage.getItem(storageKey) || '0');
        
        // Tygodniowe statystyki
        const weekCoffees = this.getWeeklyCoffees();
        
        return `
            <div class="glass-card" style="background: linear-gradient(135deg, rgba(101,67,33,0.3), rgba(139,69,19,0.3)); border: 2px solid rgba(139,69,19,0.5);">
                <h3 style="margin: 0 0 15px; display: flex; align-items: center; gap: 10px;">
                    ☕ Licznik Kawy
                </h3>
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 5rem; margin-bottom: 10px; cursor: pointer; transition: transform 0.3s;"
                         id="coffeeIcon"
                         onclick="universalDashboard.addCoffee()"
                         onmouseover="this.style.transform='scale(1.2) rotate(10deg)'"
                         onmouseout="this.style.transform='scale(1) rotate(0)'">
                        ☕
                    </div>
                    <div style="font-size: 3rem; font-weight: 700; color: #D2691E; text-shadow: 0 0 10px #8B4513;">
                        ${coffeeCount}
                    </div>
                    <div style="font-size: 1rem; opacity: 0.8;">dzisiaj</div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button onclick="universalDashboard.addCoffee()" 
                            style="padding: 12px; background: linear-gradient(135deg, #8B4513, #A0522D); 
                            border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; 
                            font-size: 1rem; box-shadow: 0 4px 15px rgba(139,69,19,0.4); transition: all 0.3s;"
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(139,69,19,0.6)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(139,69,19,0.4)'">
                        ➕ Dodaj
                    </button>
                    <button onclick="universalDashboard.showCoffeeCalendar()" 
                            style="padding: 12px; background: linear-gradient(135deg, #654321, #5C4033); 
                            border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; 
                            font-size: 1rem; box-shadow: 0 4px 15px rgba(101,67,33,0.4); transition: all 0.3s;"
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(101,67,33,0.6)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(101,67,33,0.4)'">
                        📊 Statystyki
                    </button>
                </div>
                
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
                    <div style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 8px;">📊 W tym tygodniu:</div>
                    <div style="display: flex; justify-content: space-around; text-align: center;">
                        ${weekCoffees.map((count, i) => {
                            const days = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'];
                            return `<div>
                                <div style="font-size: 0.7rem; opacity: 0.6;">${days[i]}</div>
                                <div style="font-weight: 600; color: #D2691E;">${count}</div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    getWeeklyCoffees() {
        const coffees = [];
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - (6 - i));
            const dateStr = date.toDateString();
            const key = `coffee_${this.currentUser.id}_${dateStr}`;
            coffees.push(parseInt(localStorage.getItem(key) || '0'));
        }
        
        return coffees;
    }

    addCoffee() {
        const today = new Date().toDateString();
        const storageKey = `coffee_${this.currentUser.id}_${today}`;
        const current = parseInt(localStorage.getItem(storageKey) || '0');
        localStorage.setItem(storageKey, (current + 1).toString());
        
        // Animacja
        const icon = document.getElementById('coffeeIcon');
        if (icon) {
            icon.style.animation = 'none';
            setTimeout(() => {
                icon.style.animation = 'pulse 0.5s';
            }, 10);
        }
        
        this.render();
    }

    showCoffeeCalendar() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.3s;
        `;
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        // Statystyki roczne
        const yearStats = this.getYearStats(currentYear);
        
        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 20px; 
                        padding: 30px; max-width: 1200px; width: 90%; max-height: 90vh; overflow-y: auto;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: white; font-size: 2rem;">
                        ☕ Kalendarz Kawy ${currentYear}
                    </h2>
                    <button onclick="this.closest('div[style*=fixed]').remove()" 
                            style="background: #3B82F6; border: none; border-radius: 50%; 
                            width: 40px; height: 40px; color: white; font-size: 1.5rem; 
                            cursor: pointer; font-weight: 700;">×</button>
                </div>
                
                <!-- Statystyki roczne -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
                    <div style="background: rgba(139,69,19,0.3); padding: 15px; border-radius: 10px; text-align: center; border: 2px solid rgba(139,69,19,0.5);">
                        <div style="font-size: 2rem; color: #D2691E; font-weight: 700;">${yearStats.total}</div>
                        <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Łącznie w ${currentYear}</div>
                    </div>
                    <div style="background: rgba(139,69,19,0.3); padding: 15px; border-radius: 10px; text-align: center; border: 2px solid rgba(139,69,19,0.5);">
                        <div style="font-size: 2rem; color: #D2691E; font-weight: 700;">${yearStats.average.toFixed(1)}</div>
                        <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Średnio dziennie</div>
                    </div>
                    <div style="background: rgba(139,69,19,0.3); padding: 15px; border-radius: 10px; text-align: center; border: 2px solid rgba(139,69,19,0.5);">
                        <div style="font-size: 2rem; color: #D2691E; font-weight: 700;">${yearStats.max}</div>
                        <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Rekord dnia</div>
                    </div>
                    <div style="background: rgba(139,69,19,0.3); padding: 15px; border-radius: 10px; text-align: center; border: 2px solid rgba(139,69,19,0.5);">
                        <div style="font-size: 2rem; color: #D2691E; font-weight: 700;">${yearStats.activeDays}</div>
                        <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Dni z kawą</div>
                    </div>
                </div>
                
                <!-- Kalendarz 12 miesięcy -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                    ${this.renderYearCalendar(currentYear, currentMonth)}
                </div>
            </div>
            
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            </style>
        `;
        
        document.body.appendChild(modal);
    }

    getYearStats(year) {
        let total = 0;
        let max = 0;
        let activeDays = 0;
        
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toDateString();
            const key = `coffee_${this.currentUser.id}_${dateStr}`;
            const count = parseInt(localStorage.getItem(key) || '0');
            
            if (count > 0) {
                total += count;
                activeDays++;
                if (count > max) max = count;
            }
        }
        
        const daysInYear = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const average = activeDays > 0 ? total / activeDays : 0;
        
        return { total, average, max, activeDays };
    }

    renderYearCalendar(year, currentMonth) {
        const months = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
                       'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
        
        return months.map((monthName, monthIndex) => {
            return `
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
                    <h3 style="margin: 0 0 10px; text-align: center; color: white; font-size: 1rem;">
                        ${monthName}
                    </h3>
                    ${this.renderMonthGrid(year, monthIndex, monthIndex === currentMonth)}
                </div>
            `;
        }).join('');
    }

    renderMonthGrid(year, month, isCurrent) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Poniedziałek = 0
        
        let html = `
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; text-align: center;">
                ${['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(day => 
                    `<div style="font-size: 0.7rem; opacity: 0.6; padding: 2px;">${day}</div>`
                ).join('')}
        `;
        
        // Puste komórki przed pierwszym dniem
        for (let i = 0; i < startDayOfWeek; i++) {
            html += `<div></div>`;
        }
        
        // Dni miesiąca
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toDateString();
            const key = `coffee_${this.currentUser.id}_${dateStr}`;
            const coffeeCount = parseInt(localStorage.getItem(key) || '0');
            
            const isToday = isCurrent && day === new Date().getDate();
            
            let bgColor = 'rgba(255,255,255,0.05)';
            let textColor = 'rgba(255,255,255,0.5)';
            
            if (coffeeCount > 0) {
                const intensity = Math.min(coffeeCount / 5, 1);
                bgColor = `rgba(139, 69, 19, ${0.3 + intensity * 0.7})`;
                textColor = 'white';
            }
            
            if (isToday) {
                bgColor = 'rgba(255, 215, 0, 0.3)';
            }
            
            // Sprawdź czy są notatki
            const noteKey = `note_${this.currentUser.id}_${dateStr}`;
            const note = localStorage.getItem(noteKey);
            
            html += `
                <div style="background: ${bgColor}; color: ${textColor}; 
                            padding: 5px; border-radius: 5px; font-size: 0.75rem; 
                            border: ${isToday ? '2px solid gold' : 'none'};
                            position: relative; cursor: pointer; min-height: 40px;
                            transition: transform 0.2s;"
                     onclick="universalDashboard.editDayNote('${dateStr}')"
                     onmouseover="this.style.transform='scale(1.05)'"
                     onmouseout="this.style.transform='scale(1)'"
                     title="${coffeeCount} kaw - ${date.toLocaleDateString('pl-PL')}${note ? '\n📝 ' + note : '\nKliknij aby dodać notatkę'}">
                    <div style="font-weight: ${isToday ? '700' : '400'};">${day}</div>
                    ${coffeeCount > 0 ? `<div style="font-size: 0.6rem; color: #FFD700;">☕${coffeeCount}</div>` : ''}
                    ${note ? `<div style="font-size: 0.5rem; color: #00BFFF; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">📝</div>` : ''}
                </div>
            `;
        }
        
        html += `</div>`;
        return html;
    }

    editDayNote(dateStr) {
        const noteKey = `note_${this.currentUser.id}_${dateStr}`;
        const currentNote = localStorage.getItem(noteKey) || '';
        const date = new Date(dateStr);
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8); z-index: 10001;
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.3s;
        `;
        
        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 20px; 
                        padding: 30px; max-width: 600px; width: 90%;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: white; font-size: 1.5rem;">
                        📝 Notatka - ${date.toLocaleDateString('pl-PL')}
                    </h2>
                    <button onclick="this.closest('div[style*=fixed]').remove()" 
                            style="background: #3B82F6; border: none; border-radius: 50%; 
                            width: 35px; height: 35px; color: white; font-size: 1.3rem; 
                            cursor: pointer; font-weight: 700;">×</button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="color: rgba(255,255,255,0.8); font-size: 0.9rem; display: block; margin-bottom: 8px;">
                        Dodaj termin, przypomnienie lub notatkę:
                    </label>
                    <textarea id="dayNoteInput" 
                              style="width: 100%; min-height: 150px; padding: 15px; 
                              background: rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.2); 
                              border-radius: 10px; color: white; font-size: 1rem; resize: vertical;
                              font-family: inherit;"
                              placeholder="Np. Spotkanie z klientem o 14:00, Deadline projektu, Wizyta u lekarza...">${this.escapeHtml(currentNote)}</textarea>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    ${currentNote ? `
                        <button onclick="universalDashboard.deleteDayNote('${dateStr}'); this.closest('div[style*=fixed]').remove();" 
                                style="padding: 12px 24px; background: #3B82F6; border: none; 
                                border-radius: 10px; color: white; font-weight: 600; cursor: pointer;
                                transition: all 0.3s;"
                                onmouseover="this.style.background='#1E40AF'"
                                onmouseout="this.style.background='#3B82F6'">
                            🗑️ Usuń
                        </button>
                    ` : ''}
                    <button onclick="this.closest('div[style*=fixed]').remove()" 
                            style="padding: 12px 24px; background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.3); 
                            border-radius: 10px; color: white; font-weight: 600; cursor: pointer;
                            transition: all 0.3s;"
                            onmouseover="this.style.background='rgba(255,255,255,0.2)'"
                            onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                        Anuluj
                    </button>
                    <button onclick="universalDashboard.saveDayNote('${dateStr}'); this.closest('div[style*=fixed]').remove();" 
                            style="padding: 12px 24px; background: linear-gradient(135deg, #3B82F6, #3B82F6); 
                            border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer;
                            transition: all 0.3s;"
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(46, 204, 113, 0.4)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        💾 Zapisz
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Focus na textarea
        setTimeout(() => {
            const textarea = document.getElementById('dayNoteInput');
            if (textarea) {
                textarea.focus();
                textarea.setSelectionRange(textarea.value.length, textarea.value.length);
            }
        }, 100);
    }

    saveDayNote(dateStr) {
        const textarea = document.getElementById('dayNoteInput');
        if (!textarea) return;
        
        const noteKey = `note_${this.currentUser.id}_${dateStr}`;
        const noteValue = textarea.value.trim();
        
        if (noteValue) {
            localStorage.setItem(noteKey, noteValue);
        } else {
            localStorage.removeItem(noteKey);
        }
        
        // Odśwież kalendarz jeśli jest otwarty
        const calendarModal = document.querySelector('div[style*="position: fixed"]');
        if (calendarModal && calendarModal.textContent.includes('Kalendarz Kawy')) {
            this.showCoffeeCalendar();
        }
    }

    deleteDayNote(dateStr) {
        const noteKey = `note_${this.currentUser.id}_${dateStr}`;
        localStorage.removeItem(noteKey);
        
        // Odśwież kalendarz
        const calendarModal = document.querySelector('div[style*="position: fixed"]');
        if (calendarModal && calendarModal.textContent.includes('Kalendarz Kawy')) {
            this.showCoffeeCalendar();
        }
    }

    renderWeekendCountdown() {
        const now = new Date();
        const friday = new Date(now);
        friday.setDate(now.getDate() + (5 - now.getDay() + 7) % 7);
        friday.setHours(17, 0, 0, 0);
        
        // Jeśli piątek już minął, ustaw na następny tydzień
        if (now.getDay() === 6 || now.getDay() === 0 || (now.getDay() === 5 && now.getHours() >= 17)) {
            friday.setDate(friday.getDate() + 7);
        }
        
        const diff = friday - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        const percentage = 100 - ((diff / (7 * 24 * 60 * 60 * 1000)) * 100);
        
        const motivationalTexts = [
            "💪 Jeszcze tylko troszkę!",
            "🎯 Jesteś coraz bliżej!",
            "🌟 Wkrótce weekend!",
            "🚀 Trzymaj się!",
            "⭐ Prawie tam!"
        ];
        const randomText = motivationalTexts[Math.floor(Math.random() * motivationalTexts.length)];
        
        return `
            <div class="glass-card" style="background: linear-gradient(135deg, rgba(255,165,0,0.2), rgba(255,69,0,0.2)); border: 2px solid rgba(255,140,0,0.5);">
                <h3 style="margin: 0 0 15px; display: flex; align-items: center; gap: 10px;">
                    ⏰ Countdown do Weekendu
                </h3>
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 4rem; margin-bottom: 10px;">🎉</div>
                    <div style="font-size: 1.1rem; opacity: 0.9; margin-bottom: 10px;">${randomText}</div>
                    
                    <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 20px;">
                        <div style="text-align: center;">
                            <div style="font-size: 2.5rem; font-weight: 700; color: #FF8C00; text-shadow: 0 0 10px #FF8C00;">
                                ${days}
                            </div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">dni</div>
                        </div>
                        <div style="font-size: 2.5rem; font-weight: 700; color: #FF8C00;">:</div>
                        <div style="text-align: center;">
                            <div style="font-size: 2.5rem; font-weight: 700; color: #FF8C00; text-shadow: 0 0 10px #FF8C00;">
                                ${hours}
                            </div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">godz</div>
                        </div>
                        <div style="font-size: 2.5rem; font-weight: 700; color: #FF8C00;">:</div>
                        <div style="text-align: center;">
                            <div style="font-size: 2.5rem; font-weight: 700; color: #FF8C00; text-shadow: 0 0 10px #FF8C00;">
                                ${minutes}
                            </div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">min</div>
                        </div>
                    </div>
                    
                    <!-- Progress Bar -->
                    <div style="background: rgba(0,0,0,0.3); border-radius: 20px; height: 30px; overflow: hidden; position: relative; border: 2px solid rgba(255,140,0,0.3);">
                        <div style="background: linear-gradient(90deg, #FF8C00, #FFD700); height: 100%; width: ${percentage}%; 
                                    transition: width 1s ease; position: relative; box-shadow: 0 0 20px rgba(255,140,0,0.6);">
                            <div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); 
                                        color: white; font-weight: 700; font-size: 0.9rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
                                ${Math.round(percentage)}%
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 10px; font-size: 0.85rem; opacity: 0.7;">
                        Do piątku 17:00
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.3); }
                }
            </style>
        `;
    }
    
    // Otwórz szczegóły zadania - NOWA WERSJA
    openTask(element) {
        try {
            const taskId = element.dataset.taskId;
            const caseId = element.dataset.caseId;
            const taskTitle = element.dataset.taskTitle;
            
            console.log('📋 Otwieranie zadania:', { taskId, caseId, taskTitle });
            
            // Pokaż szczegóły zadania bezpośrednio w modalu
            this.showTaskDetailsModal(taskId, taskTitle, caseId);
        } catch (error) {
            console.error('❌ Błąd parsowania danych zadania:', error);
        }
    }
    
    // Pokaż szczegóły zadania bezpośrednio w modalu
    async showTaskDetailsModal(taskId, taskTitle, caseId) {
        // Pobierz pełne dane zadania z API
        let taskData = null;
        let caseData = null;
        
        try {
            const tasksRes = await api.request('/tasks');
            taskData = (tasksRes.tasks || []).find(t => t.id == taskId);
            
            if (caseId && caseId !== '') {
                const casesRes = await api.request('/cases');
                caseData = (casesRes.cases || []).find(c => c.id == caseId);
            }
        } catch (e) {
            console.error('Błąd pobierania danych:', e);
        }
        
        // Usuń poprzedni modal
        const existing = document.getElementById('task-quick-modal');
        if (existing) existing.remove();
        
        const priorityColors = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
        const priorityLabels = { high: 'Wysoki', medium: 'Średni', low: 'Niski' };
        const priorityColor = priorityColors[taskData?.priority] || '#6B7280';
        const priorityLabel = priorityLabels[taskData?.priority] || 'Brak';
        
        const modal = document.createElement('div');
        modal.id = 'task-quick-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 999999; animation: fadeIn 0.2s ease;
        `;
        
        modal.innerHTML = `
            <style>
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            </style>
            <div style="background: white; border-radius: 16px; width: 95%; max-width: 550px; max-height: 90vh; overflow: auto;
                        box-shadow: 0 25px 60px rgba(0,0,0,0.4); animation: slideUp 0.3s ease;">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 20px; position: relative;">
                    <button onclick="document.getElementById('task-quick-modal').remove()" 
                            style="position: absolute; top: 15px; right: 15px; background: rgba(255,255,255,0.2); border: none; 
                                   color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 1.3rem;">✕</button>
                    <div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 5px;">📋 ZADANIE #${taskId}</div>
                    <h2 style="margin: 0; font-size: 1.3rem; padding-right: 40px;">${this.escapeHtml(taskTitle)}</h2>
                </div>
                
                <!-- Content -->
                <div style="padding: 20px;">
                    <!-- Priorytet i status -->
                    <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                        <span style="background: ${priorityColor}; color: white; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
                            ● ${priorityLabel} priorytet
                        </span>
                        ${taskData?.status ? `<span style="background: #E5E7EB; color: #374151; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem;">
                            ${taskData.status === 'completed' ? '✅ Ukończone' : taskData.status === 'in_progress' ? '🔄 W trakcie' : '📌 Do zrobienia'}
                        </span>` : ''}
                    </div>
                    
                    <!-- Sprawa -->
                    ${caseData ? `
                    <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <div style="font-weight: 600; color: #92400E; margin-bottom: 5px;">📂 Przypisane do sprawy</div>
                        <div style="color: #78350F; font-size: 1.1rem; font-weight: 600;">${caseData.case_number}</div>
                        ${caseData.title ? `<div style="color: #92400E; font-size: 0.9rem;">${caseData.title}</div>` : ''}
                    </div>
                    ` : ''}
                    
                    <!-- Termin -->
                    ${taskData?.due_date ? `
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px; padding: 12px; background: #F3F4F6; border-radius: 8px;">
                        <span style="font-size: 1.5rem;">📅</span>
                        <div>
                            <div style="font-size: 0.8rem; color: #6B7280;">Termin wykonania</div>
                            <div style="font-weight: 600; color: #111827;">${new Date(taskData.due_date).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        </div>
                    </div>
                    ` : ''}
                    
                    <!-- Opis -->
                    ${taskData?.description ? `
                    <div style="margin-bottom: 15px;">
                        <div style="font-size: 0.85rem; color: #6B7280; margin-bottom: 5px;">📝 Opis</div>
                        <div style="background: #F9FAFB; padding: 12px; border-radius: 8px; color: #374151; line-height: 1.5;">${this.escapeHtml(taskData.description)}</div>
                    </div>
                    ` : ''}
                    
                    <!-- Przyciski -->
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        ${caseData ? `
                        <button onclick="document.getElementById('task-quick-modal').remove(); window.app.switchView('crm'); setTimeout(() => window.crmManager.viewCase(${caseId}), 300);" 
                                style="flex: 1; padding: 14px; background: #3B82F6; color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1rem; font-weight: 600;">
                            📂 Otwórz sprawę
                        </button>
                        ` : ''}
                        <button onclick="document.getElementById('task-quick-modal').remove();" 
                                style="flex: 1; padding: 14px; background: #E5E7EB; color: #374151; border: none; border-radius: 10px; cursor: pointer; font-size: 1rem; font-weight: 600;">
                            Zamknij
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
    
    // Modal ze szczegółami zadania (stary)
    showTaskModal(taskId, taskTitle, caseId) {
        // Usuń poprzedni modal jeśli istnieje
        const existingModal = document.getElementById('task-detail-modal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.id = 'task-detail-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); display: flex; align-items: center;
            justify-content: center; z-index: 100000; animation: fadeIn 0.3s ease;
        `;
        
        modal.innerHTML = `
            <style>
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideIn { from { transform: scale(0.8) translateY(-20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
                @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); } 50% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); } }
            </style>
            <div style="
                background: white; border-radius: 20px; width: 95%; max-width: 500px;
                box-shadow: 0 25px 80px rgba(0,0,0,0.4); overflow: hidden;
                animation: slideIn 0.4s ease, pulse 1s ease infinite;
            ">
                <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 25px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">📋 ZADANIE #${taskId}</div>
                            <h2 style="margin: 0; font-size: 1.4rem;">${this.escapeHtml(taskTitle)}</h2>
                        </div>
                        <button onclick="document.getElementById('task-detail-modal').remove()" 
                                style="background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.5rem;">✕</button>
                    </div>
                </div>
                
                <div style="padding: 25px;">
                    <div style="background: #e8f5e9; border-left: 4px solid #4CAF50; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <div style="font-weight: 600; color: #2e7d32; margin-bottom: 5px;">✅ To jest Twoje zadanie!</div>
                        <div style="color: #388e3c; font-size: 0.9rem;">Kliknij poniżej aby przejść do szczegółów${caseId ? ' w sprawie' : ''}.</div>
                    </div>
                    
                    ${caseId ? `
                        <button onclick="document.getElementById('task-detail-modal').remove(); setTimeout(() => { const tasksTab = document.querySelector('[data-tab=\\'tasks\\']'); if(tasksTab) tasksTab.click(); }, 300);" 
                                style="width: 100%; padding: 15px; background: #3B82F6; color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1.1rem; font-weight: 600; margin-bottom: 10px;">
                            📂 Przejdź do zadań w sprawie
                        </button>
                    ` : ''}
                    
                    <button onclick="document.getElementById('task-detail-modal').remove();" 
                            style="width: 100%; padding: 12px; background: #f5f5f5; color: #333; border: none; border-radius: 10px; cursor: pointer; font-size: 1rem;">
                        Zamknij
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Zamknij po kliknięciu w tło
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
}

const universalDashboard = new UniversalDashboard();
window.universalDashboard = universalDashboard;
