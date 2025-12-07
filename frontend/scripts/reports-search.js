// 🔍 MODUŁ WYSZUKIWARKI RAPORTÓW
console.log('🔍 Reports Search Module - Ładowanie...');

window.reportsSearchModule = {
    
    // Renderuj sekcję wyszukiwarki
    renderSearchSection: function() {
        const container = document.getElementById('reportsSearchContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div style="background: white; border-radius: 15px; padding: 25px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <h2 style="color: #3B82F6; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <span>🔍</span>
                    <span>Wyszukiwarka Raportów</span>
                </h2>
                
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <input 
                        type="text" 
                        id="reportSearchInput"
                        placeholder="Wpisz kod raportu: RAP/CYW/JK/..."
                        style="flex: 1; padding: 12px 20px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 1rem;"
                    >
                    <button 
                        onclick="window.reportsSearchModule.search()"
                        style="padding: 12px 30px; background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: transform 0.2s;"
                    >
                        🔍 Szukaj
                    </button>
                </div>
                
                <div id="reportSearchResults"></div>
            </div>
        `;
        
        // Enter key
        document.getElementById('reportSearchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.search();
            }
        });
    },
    
    // Wyszukaj raporty
    search: async function() {
        const query = document.getElementById('reportSearchInput').value.trim();
        const resultsContainer = document.getElementById('reportSearchResults');
        
        if (!query) {
            resultsContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #999;">
                    💡 Wpisz kod raportu aby wyszukać
                </div>
            `;
            return;
        }
        
        try {
            resultsContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #3B82F6;">
                    ⏳ Wyszukiwanie...
                </div>
            `;
            
            const response = await window.api.request(`/reports/search?q=${encodeURIComponent(query)}`);
            
            if (!response.reports || response.reports.length === 0) {
                resultsContainer.innerHTML = `
                    <div style="padding: 20px; text-align: center; color: #999;">
                        ❌ Nie znaleziono raportów dla: "${query}"
                    </div>
                `;
                return;
            }
            
            this.renderResults(response.reports);
            
        } catch (error) {
            console.error('❌ Błąd wyszukiwania:', error);
            resultsContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #3B82F6;">
                    ❌ Błąd wyszukiwania: ${error.message}
                </div>
            `;
        }
    },
    
    // Renderuj wyniki
    renderResults: function(reports) {
        const resultsContainer = document.getElementById('reportSearchResults');
        
        let html = `
            <div style="margin-top: 20px;">
                <h3 style="color: #3B82F6; margin-bottom: 15px;">📋 Znaleziono: ${reports.length}</h3>
                <div style="display: grid; gap: 15px;">
        `;
        
        reports.forEach(report => {
            const generatedDate = new Date(report.generated_at);
            const expiresDate = new Date(report.expires_at);
            const now = new Date();
            const daysLeft = Math.ceil((expiresDate - now) / (1000 * 60 * 60 * 24));
            
            const isExpired = daysLeft < 0;
            const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;
            
            html += `
                <div style="
                    background: ${isExpired ? '#f8d7da' : isExpiringSoon ? '#F8FAFC' : '#f8f9fa'};
                    border: 2px solid ${isExpired ? '#f5c6cb' : isExpiringSoon ? '#3B82F6' : '#e0e0e0'};
                    border-radius: 10px;
                    padding: 20px;
                    transition: transform 0.2s, box-shadow 0.2s;
                    cursor: pointer;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div style="flex: 1;">
                            <div style="font-size: 1.3rem; font-weight: 700; color: #3B82F6; margin-bottom: 5px;">
                                ${report.report_code}
                            </div>
                            <div style="color: #666; font-size: 0.9rem;">
                                📅 ${generatedDate.toLocaleDateString('pl-PL')} ${generatedDate.toLocaleTimeString('pl-PL')}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            ${isExpired ? 
                                '<span style="background: #dc3545; color: white; padding: 5px 10px; border-radius: 5px; font-size: 0.85rem;">❌ Wygasł</span>' :
                                isExpiringSoon ?
                                '<span style="background: #3B82F6; color: #333; padding: 5px 10px; border-radius: 5px; font-size: 0.85rem;">⚠️ ' + daysLeft + ' dni</span>' :
                                '<span style="background: #3B82F6; color: white; padding: 5px 10px; border-radius: 5px; font-size: 0.85rem;">✅ ' + daysLeft + ' dni</span>'
                            }
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <div style="background: white; padding: 10px; border-radius: 5px;">
                            <div style="font-size: 0.85rem; color: #999; margin-bottom: 3px;">Wydarzenie</div>
                            <div style="font-weight: 600; color: #333;">${report.event_title || 'Brak tytułu'}</div>
                        </div>
                        <div style="background: white; padding: 10px; border-radius: 5px;">
                            <div style="font-size: 0.85rem; color: #999; margin-bottom: 3px;">Sprawa</div>
                            <div style="font-weight: 600; color: #333;">${report.case_number || 'Brak numeru'}</div>
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                        <div style="font-size: 0.85rem; color: #999; margin-bottom: 3px;">👁️ Wyświetleń</div>
                        <div style="font-weight: 600; color: #3B82F6; font-size: 1.1rem;">${report.view_count || 0}</div>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button 
                            onclick="window.reportsSearchModule.showQR('${report.report_code}')"
                            style="flex: 1; padding: 10px; background: #3B82F6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;"
                        >
                            📱 Pokaż QR
                        </button>
                        <button 
                            onclick="window.reportsSearchModule.copyLink('${report.report_code}')"
                            style="flex: 1; padding: 10px; background: #1E40AF; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;"
                        >
                            🔗 Kopiuj link
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        resultsContainer.innerHTML = html;
    },
    
    // Pokaż QR kod
    showQR: function(reportCode) {
        alert('📱 Funkcja pokazywania QR w przygotowaniu!\n\nKod raportu: ' + reportCode);
        // TODO: Modal z QR kodem
    },
    
    // Kopiuj link
    copyLink: function(reportCode) {
        // TODO: Pobierz token z API i skopiuj link
        alert('🔗 Funkcja kopiowania linku w przygotowaniu!\n\nKod raportu: ' + reportCode);
    }
};

// Inicjalizacja po załadowaniu DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ Reports Search Module - Gotowy do użycia');
    });
} else {
    console.log('✅ Reports Search Module - Gotowy do użycia');
}
