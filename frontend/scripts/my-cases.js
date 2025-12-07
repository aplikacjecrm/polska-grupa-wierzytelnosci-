// =====================================
// MOJE SPRAWY - Widok spraw przypisanych do zalogowanego użytkownika
// =====================================

console.log('📂 Moduł Moje Sprawy załadowany!');

// Funkcja ładowania moich spraw
window.loadMyCases = async function() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user || !user.id) {
            console.error('❌ Brak zalogowanego użytkownika');
            return;
        }

        console.log('📂 Ładowanie spraw dla użytkownika:', user.id, 'Rola:', user.role);

        // Pobierz wszystkie sprawy
        const response = await window.api.request('/cases');
        let allCases = response.cases || [];

        console.log('📊 Wszystkich spraw w systemie:', allCases.length);
        
        // DEBUG: Pokaż pierwsze 3 sprawy
        if (allCases.length > 0) {
            console.log('🔍 Przykładowa sprawa:', {
                id: allCases[0].id,
                assigned_to: allCases[0].assigned_to,
                additional_caretaker: allCases[0].additional_caretaker,
                case_manager_id: allCases[0].case_manager_id,
                client_id: allCases[0].client_id
            });
        }

        // Filtruj sprawy przypisane do zalogowanego użytkownika
        // - assigned_to (mecenas prowadzący)
        // - additional_caretaker (opiekun sprawy) ⚠️ BACKEND UŻYWA TEJ NAZWY!
        const myCases = allCases.filter(c => {
            const match = c.assigned_to == user.id || 
                         c.additional_caretaker == user.id;
            
            if (match) {
                console.log('✅ Dopasowana sprawa:', c.case_number, 'assigned_to:', c.assigned_to, 'case_manager_id:', c.case_manager_id);
            }
            
            return match;
        });

        console.log(`✅ Znaleziono ${myCases.length} spraw przypisanych do użytkownika`);

        // Aktualizuj statystyki
        updateMyCasesStats(myCases);

        // Renderuj listę
        renderMyCasesList(myCases);

        // Dodaj obsługę filtrów
        setupMyCasesFilters(myCases);

    } catch (error) {
        console.error('❌ Błąd ładowania moich spraw:', error);
        document.getElementById('myCasesList').innerHTML = `
            <div style="text-align: center; padding: 40px; color: #dc3545;">
                <p style="font-size: 1.2rem; margin-bottom: 10px;">❌ Błąd ładowania spraw</p>
                <p style="color: #666;">${error.message}</p>
            </div>
        `;
    }
};

// Aktualizacja statystyk
function updateMyCasesStats(cases) {
    const total = cases.length;
    const active = cases.filter(c => c.status === 'in_progress').length;
    const closed = cases.filter(c => c.status === 'closed').length;

    document.getElementById('myTotalCases').textContent = total;
    document.getElementById('myActiveCases').textContent = active;
    document.getElementById('myClosedCases').textContent = closed;

    // Pobierz nadchodzące wydarzenia dla moich spraw
    loadMyUpcomingEvents(cases.map(c => c.id));
}

// Ładowanie nadchodzących wydarzeń
async function loadMyUpcomingEvents(caseIds) {
    try {
        if (caseIds.length === 0) {
            document.getElementById('myUpcomingEvents').textContent = '0';
            return;
        }

        const response = await window.api.request('/events');
        const allEvents = response.events || [];

        // Filtruj wydarzenia dla moich spraw
        const myEvents = allEvents.filter(e => caseIds.includes(e.case_id));

        // Policz nadchodzące (w przyszłości)
        const now = new Date();
        const upcoming = myEvents.filter(e => new Date(e.start_date) > now).length;

        document.getElementById('myUpcomingEvents').textContent = upcoming;

    } catch (error) {
        console.error('❌ Błąd ładowania wydarzeń:', error);
        document.getElementById('myUpcomingEvents').textContent = '0';
    }
}

// Renderowanie listy spraw
function renderMyCasesList(cases) {
    const container = document.getElementById('myCasesList');

    if (cases.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px; color: #999;">
                <div style="font-size: 4rem; margin-bottom: 20px;">📂</div>
                <p style="font-size: 1.3rem; margin-bottom: 10px; color: #666;">Brak przypisanych spraw</p>
                <p style="color: #999;">Sprawy przypisane do Ciebie pojawią się tutaj</p>
            </div>
        `;
        return;
    }

    const html = cases.map(c => {
        const statusColors = {
            open: { bg: '#e3f2fd', border: '#2196f3', text: 'Otwarta' },
            in_progress: { bg: '#fff3e0', border: '#ff9800', text: 'W toku' },
            closed: { bg: '#e8f5e9', border: '#4caf50', text: 'Zamknięta' }
        };

        const status = statusColors[c.status] || statusColors.open;

        const user = JSON.parse(localStorage.getItem('currentUser'));
        const myRole = c.assigned_to == user.id ? 'Mecenas prowadzący' : 'Opiekun sprawy';

        return `
            <div class="case-card" onclick="window.crmManager.viewCase(${c.id})" style="
                background: white;
                border-radius: 12px;
                padding: 20px;
                cursor: pointer;
                border: 2px solid ${status.border};
                transition: all 0.3s;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.15)'"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'">
                
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">
                            ${window.crmManager.escapeHtml(c.case_number || 'Brak numeru')}
                        </div>
                        <div style="font-size: 1.2rem; font-weight: 700; color: #1a2332; margin-bottom: 8px;">
                            ${window.crmManager.escapeHtml(c.title || 'Bez tytułu')}
                        </div>
                        <div style="display: inline-block; padding: 4px 12px; background: ${status.bg}; color: ${status.border}; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
                            ${status.text}
                        </div>
                    </div>
                    <div style="font-size: 2rem;">📂</div>
                </div>

                <!-- Moja rola -->
                <div style="background: #f5f5f5; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="font-size: 0.85rem; color: #666; margin-bottom: 3px;">Moja rola:</div>
                    <div style="font-weight: 600; color: #667eea;">👤 ${myRole}</div>
                </div>

                <!-- Informacje -->
                <div style="display: grid; gap: 8px; font-size: 0.9rem; color: #666;">
                    ${c.client_name ? `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span>👤</span>
                            <span>${window.crmManager.escapeHtml(c.client_name)}</span>
                        </div>
                    ` : ''}
                    ${c.case_type ? `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span>📋</span>
                            <span>${getCaseTypeName(c.case_type)}</span>
                        </div>
                    ` : ''}
                    ${c.created_at ? `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span>📅</span>
                            <span>Utworzono: ${new Date(c.created_at).toLocaleDateString('pl-PL')}</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Akcje -->
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0; display: flex; gap: 10px;">
                    <button onclick="event.stopPropagation(); window.crmManager.viewCase(${c.id})" style="
                        flex: 1;
                        padding: 10px;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 0.9rem;
                        transition: all 0.2s;
                    " onmouseover="this.style.transform='scale(1.05)'"
                       onmouseout="this.style.transform='scale(1)'">
                        👁️ Szczegóły
                    </button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Nazwa typu sprawy
function getCaseTypeName(type) {
    const types = {
        civil: 'Cywilna',
        criminal: 'Karna',
        family: 'Rodzinna',
        commercial: 'Gospodarcza',
        administrative: 'Administracyjna',
        compensation: 'Odszkodowawcza',
        contract: 'Umowna',
        property: 'Majątkowa',
        inheritance: 'Spadkowa',
        bankruptcy: 'Upadłościowa'
    };
    return types[type] || type;
}

// Konfiguracja filtrów
function setupMyCasesFilters(allCases) {
    const searchInput = document.getElementById('myCaseSearch');
    const statusFilter = document.getElementById('myCaseStatusFilter');
    const typeFilter = document.getElementById('myCaseTypeFilter');

    const applyFilters = () => {
        let filtered = [...allCases];

        // Filtr wyszukiwania
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(c => 
                (c.title && c.title.toLowerCase().includes(searchTerm)) ||
                (c.case_number && c.case_number.toLowerCase().includes(searchTerm)) ||
                (c.client_name && c.client_name.toLowerCase().includes(searchTerm))
            );
        }

        // Filtr statusu
        const status = statusFilter.value;
        if (status) {
            filtered = filtered.filter(c => c.status === status);
        }

        // Filtr typu
        const type = typeFilter.value;
        if (type) {
            filtered = filtered.filter(c => c.case_type === type);
        }

        renderMyCasesList(filtered);
    };

    searchInput.addEventListener('input', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    typeFilter.addEventListener('change', applyFilters);
}

// Funkcja odświeżania
window.refreshMyCases = function() {
    console.log('🔄 Odświeżanie moich spraw...');
    window.loadMyCases();
};

// Automatyczne ładowanie przy przełączeniu na widok
document.addEventListener('DOMContentLoaded', () => {
    // Nasłuchuj na przełączanie widoków - sprawdzaj style.display zamiast klasy
    const observer = new MutationObserver(() => {
        const myCasesView = document.getElementById('my-casesView');
        if (myCasesView) {
            const isVisible = window.getComputedStyle(myCasesView).display !== 'none';
            if (isVisible) {
                console.log('📂 Widok Moje Sprawy aktywny - ładuję dane');
                window.loadMyCases();
            }
        }
    });

    const myCasesView = document.getElementById('my-casesView');
    if (myCasesView) {
        observer.observe(myCasesView, { attributes: true, attributeFilter: ['style'] });
    }
});
