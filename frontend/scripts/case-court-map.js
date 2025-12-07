/**
 * MODUŁ MAPY SĄDU W SZCZEGÓŁACH SPRAWY
 * 
 * Wyświetla mapę Mapbox z lokalizacją sądu przypisanego do sprawy
 * Automatycznie inicjalizuje mapę gdy dane sądu są dostępne
 */

console.log('🗺️ Moduł Mapy Sądu załadowany!');
console.log('⚠️ UWAGA: Ten moduł NIE nadpisuje renderCaseDetailsTab - używana jest wersja z crm-case-tabs.js');

// Token Mapbox - publiczny token (sprawdź czy już nie istnieje)
if (typeof MAPBOX_TOKEN === 'undefined') {
    var MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZS11c2VyIiwiYSI6ImNrOXZ5dHR2YjBhejIzbm1yZWp2YzI0NmQifQ.example';
}

/**
 * Renderowanie zakładki szczegółów sprawy z mapą sądu
 * WYŁĄCZONE - używana jest pełna wersja z crm-case-tabs.js
 * 
 * ZABEZPIECZENIE: Jeśli funkcja już istnieje, NIE NADPISUJ!
 */
window.crmManager = window.crmManager || {};

// Sprawdź czy funkcja już istnieje (załadowana z crm-case-tabs.js)
if (window.crmManager.renderCaseDetailsTab) {
    console.log('✅ renderCaseDetailsTab już istnieje - używam istniejącej wersji');
} else {
    console.error('❌ renderCaseDetailsTab NIE ISTNIEJE - to błąd!');
}

/* WYŁĄCZONE - pełna wersja jest w crm-case-tabs.js
window.crmManager.renderCaseDetailsTab = async function(caseId) {
    try {
        console.log('📋 Renderowanie szczegółów sprawy:', caseId);
        
        // Pobierz dane sprawy
        const response = await window.api.request(`/cases/${caseId}`);
        const caseData = response.case;
        
        console.log('✅ Dane sprawy:', caseData);
        
        // Sprawdź czy sprawa ma przypisany sąd z bazy
        const hasCourtFromDatabase = caseData.court_id && caseData.court_coordinates;
        
        let courtCoords = null;
        if (hasCourtFromDatabase) {
            try {
                courtCoords = JSON.parse(caseData.court_coordinates);
                console.log('🏛️ Koordynaty sądu:', courtCoords);
            } catch (e) {
                console.error('❌ Błąd parsowania koordynatów:', e);
            }
        }
        
        // Renderuj HTML
        const html = `
            <div style="padding: 20px;">
                <!-- Panel podstawowych informacji -->
                <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 25px; border-radius: 12px; color: white; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(102,126,234,0.3);">
                    <h2 style="margin: 0 0 20px 0; font-size: 1.8rem;">${window.crmManager.escapeHtml(caseData.title)}</h2>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                        <div>
                            <strong style="font-size: 0.9rem; opacity: 0.9;">📋 Numer sprawy:</strong>
                            <div style="font-size: 1.1rem; font-weight: 600; margin-top: 5px;">${window.crmManager.escapeHtml(caseData.case_number)}</div>
                        </div>
                        <div>
                            <strong style="font-size: 0.9rem; opacity: 0.9;">📊 Status:</strong>
                            <div style="font-size: 1.1rem; font-weight: 600; margin-top: 5px;">
                                ${caseData.status === 'open' ? '🟢 Otwarta' : 
                                  caseData.status === 'in_progress' ? '🟡 W toku' : '🔴 Zamknięta'}
                            </div>
                        </div>
                        <div>
                            <strong style="font-size: 0.9rem; opacity: 0.9;">⚖️ Typ sprawy:</strong>
                            <div style="font-size: 1.1rem; font-weight: 600; margin-top: 5px;">
                                ${window.crmManager.getCaseTypeLabel(caseData.case_type)}
                            </div>
                        </div>
                        <div>
                            <strong style="font-size: 0.9rem; opacity: 0.9;">🎯 Priorytet:</strong>
                            <div style="font-size: 1.1rem; font-weight: 600; margin-top: 5px;">
                                ${caseData.priority === 'high' ? '🔴 Wysoki' : 
                                  caseData.priority === 'medium' ? '🟡 Średni' : '🔵 Niski'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Sekcja Sądu z Mapą -->
                ${hasCourtFromDatabase && courtCoords ? `
                    <div style="background: white; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-left: 4px solid #3B82F6;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="margin: 0; color: #0d47a1; font-size: 1.5rem; display: flex; align-items: center; gap: 10px;">
                                🏛️ Sąd rozpatrujący sprawę
                            </h3>
                            <button onclick="window.openCourtWebsite('${caseData.court_id}')" 
                                style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;"
                                onmouseover="this.style.background='#1E40AF'"
                                onmouseout="this.style.background='#3B82F6'">
                                🌐 Strona sądu
                            </button>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                            <!-- Dane kontaktowe -->
                            <div>
                                <div style="background: linear-gradient(135deg, #F8FAFC, #bbdefb); padding: 20px; border-radius: 12px; height: 100%;">
                                    <h4 style="margin: 0 0 15px 0; color: #0d47a1; font-size: 1.2rem;">📞 Dane kontaktowe</h4>
                                    
                                    <div style="display: flex; flex-direction: column; gap: 15px;">
                                        <div>
                                            <div style="color: #666; font-size: 0.85rem; margin-bottom: 5px; font-weight: 600;">Nazwa:</div>
                                            <div style="color: #1a2332; font-size: 1.05rem; font-weight: 600;">${window.crmManager.escapeHtml(caseData.court_name || 'Brak danych')}</div>
                                        </div>
                                        
                                        <div>
                                            <div style="color: #666; font-size: 0.85rem; margin-bottom: 5px; font-weight: 600;">📍 Adres:</div>
                                            <div style="color: #1a2332; font-size: 1rem;">${window.crmManager.escapeHtml(caseData.court_address || 'Brak danych')}</div>
                                        </div>
                                        
                                        <div>
                                            <div style="color: #666; font-size: 0.85rem; margin-bottom: 5px; font-weight: 600;">📞 Telefon:</div>
                                            <div style="color: #1a2332; font-size: 1rem;">
                                                <a href="tel:${caseData.court_phone}" style="color: #3B82F6; text-decoration: none;">${window.crmManager.escapeHtml(caseData.court_phone || 'Brak danych')}</a>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div style="color: #666; font-size: 0.85rem; margin-bottom: 5px; font-weight: 600;">✉️ Email:</div>
                                            <div style="color: #1a2332; font-size: 1rem;">
                                                <a href="mailto:${caseData.court_email}" style="color: #3B82F6; text-decoration: none;">${window.crmManager.escapeHtml(caseData.court_email || 'Brak danych')}</a>
                                            </div>
                                        </div>
                                        
                                        ${caseData.court_signature ? `
                                            <div>
                                                <div style="color: #666; font-size: 0.85rem; margin-bottom: 5px; font-weight: 600;">📑 Sygnatura akt:</div>
                                                <div style="color: #1a2332; font-size: 1.1rem; font-weight: 700; background: white; padding: 10px; border-radius: 6px;">${window.crmManager.escapeHtml(caseData.court_signature)}</div>
                                            </div>
                                        ` : ''}
                                        
                                        <button onclick="window.openGoogleMapsNavigation(${courtCoords.lat}, ${courtCoords.lng})" 
                                            style="padding: 12px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem; margin-top: 10px; transition: all 0.3s;"
                                            onmouseover="this.style.background='#388e3c'"
                                            onmouseout="this.style.background='#3B82F6'">
                                            🧭 Nawiguj do sądu
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Mapa -->
                            <div>
                                <div style="background: #f5f5f5; border-radius: 12px; overflow: hidden; height: 100%; min-height: 400px; position: relative;">
                                    <div id="courtMap_${caseId}" style="width: 100%; height: 100%; min-height: 400px;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : `
                    <!-- Brak przypisanego sądu -->
                    <div style="background: #F8FAFC; border: 2px dashed #3B82F6; border-radius: 12px; padding: 25px; margin-bottom: 25px; text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 10px;">⚠️</div>
                        <h4 style="margin: 0 0 10px 0; color: #e65100;">Brak przypisanego sądu</h4>
                        <p style="margin: 0; color: #666;">Edytuj sprawę i wybierz sąd z bazy aby zobaczyć mapę lokalizacji</p>
                        <button onclick="window.showEditCaseModal(${caseId})" 
                            style="margin-top: 15px; padding: 12px 24px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            ✏️ Edytuj sprawę
                        </button>
                    </div>
                `}
                
                <!-- Informacje o sprawie -->
                ${caseData.description ? `
                    <div style="background: white; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <h3 style="margin: 0 0 15px 0; color: #1a2332; font-size: 1.3rem;">📄 Opis sprawy</h3>
                        <div style="color: #666; line-height: 1.8; white-space: pre-wrap; background: #f9f9f9; padding: 20px; border-radius: 8px;">
                            ${window.crmManager.escapeHtml(caseData.description)}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Informacje sądowe (ręczne) -->
                ${(caseData.judge_name || caseData.referent || caseData.court_department) && !hasCourtFromDatabase ? `
                    <div style="background: white; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <h3 style="margin: 0 0 15px 0; color: #1a2332; font-size: 1.3rem;">⚖️ Informacje sądowe</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                            ${caseData.court_name ? `
                                <div>
                                    <div style="color: #666; font-size: 0.85rem; margin-bottom: 5px;">🏛️ Sąd:</div>
                                    <div style="color: #1a2332; font-size: 1rem; font-weight: 600;">${window.crmManager.escapeHtml(caseData.court_name)}</div>
                                </div>
                            ` : ''}
                            ${caseData.court_department ? `
                                <div>
                                    <div style="color: #666; font-size: 0.85rem; margin-bottom: 5px;">🏢 Wydział:</div>
                                    <div style="color: #1a2332; font-size: 1rem; font-weight: 600;">${window.crmManager.escapeHtml(caseData.court_department)}</div>
                                </div>
                            ` : ''}
                            ${caseData.judge_name ? `
                                <div>
                                    <div style="color: #666; font-size: 0.85rem; margin-bottom: 5px;">👨‍⚖️ Sędzia:</div>
                                    <div style="color: #1a2332; font-size: 1rem; font-weight: 600;">${window.crmManager.escapeHtml(caseData.judge_name)}</div>
                                </div>
                            ` : ''}
                            ${caseData.referent ? `
                                <div>
                                    <div style="color: #666; font-size: 0.85rem; margin-bottom: 5px;">📋 Referent:</div>
                                    <div style="color: #1a2332; font-size: 1rem; font-weight: 600;">${window.crmManager.escapeHtml(caseData.referent)}</div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Inicjalizuj mapę po wyrenderowaniu HTML
        if (hasCourtFromDatabase && courtCoords) {
            setTimeout(() => {
                window.initCourtMap(caseId, courtCoords, caseData.court_name);
            }, 100);
        }
        
        return html;
        
    } catch (error) {
        console.error('❌ Błąd renderowania szczegółów sprawy:', error);
        return '<p style="text-align: center; color: #dc3545; padding: 40px;">Błąd ładowania szczegółów sprawy</p>';
    }
};
*/
// KONIEC zakomentowanej funkcji renderCaseDetailsTab
// Aktywna wersja znajduje się w crm-case-tabs.js (pełna z wszystkimi funkcjami)

/**
 * Inicjalizacja mapy Mapbox dla sądu
 */
window.initCourtMap = function(caseId, coordinates, courtName) {
    try {
        console.log('🗺️ Inicjalizacja mapy sądu:', coordinates);
        
        const mapContainer = document.getElementById(`courtMap_${caseId}`);
        if (!mapContainer) {
            console.error('❌ Kontener mapy nie znaleziony');
            return;
        }
        
        // Sprawdź czy Mapbox jest załadowany
        if (typeof mapboxgl === 'undefined') {
            console.error('❌ Mapbox GL JS nie jest załadowany');
            mapContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #dc3545; font-weight: 600;">Błąd: Mapbox nie załadowany</div>';
            return;
        }
        
        // Ustaw token (użyj własnego tokenu w produkcji!)
        mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';
        
        // Stwórz mapę
        const map = new mapboxgl.Map({
            container: `courtMap_${caseId}`,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [coordinates.lng, coordinates.lat],
            zoom: 15,
            attributionControl: false
        });
        
        // Dodaj kontrolki zoom
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Dodaj marker
        const marker = new mapboxgl.Marker({
            color: '#3B82F6',
            scale: 1.2
        })
        .setLngLat([coordinates.lng, coordinates.lat])
        .setPopup(
            new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
                <div style="padding: 10px;">
                    <strong style="color: #0d47a1; font-size: 1.1rem;">🏛️ ${courtName || 'Sąd'}</strong>
                    <div style="margin-top: 8px; color: #666; font-size: 0.9rem;">
                        <div>📍 Kliknij "Nawiguj" aby otworzyć Google Maps</div>
                    </div>
                </div>
            `)
        )
        .addTo(map);
        
        // Otwórz popup automatycznie
        marker.togglePopup();
        
        console.log('✅ Mapa sądu załadowana pomyślnie');
        
    } catch (error) {
        console.error('❌ Błąd inicjalizacji mapy:', error);
    }
};

/**
 * Otwórz Google Maps z nawigacją do sądu
 */
window.openGoogleMapsNavigation = function(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
    console.log('🧭 Otwarto nawigację Google Maps do:', { lat, lng });
};

/**
 * Otwórz stronę sądu
 */
window.openCourtWebsite = async function(courtId) {
    try {
        const response = await window.api.request(`/courts/${courtId}`);
        const court = response.court;
        
        if (court.website) {
            window.open(court.website, '_blank');
        } else {
            alert('Brak strony internetowej dla tego sądu');
        }
    } catch (error) {
        console.error('❌ Błąd otwierania strony sądu:', error);
        alert('Błąd: ' + error.message);
    }
};

/**
 * Helper: Label typu sprawy
 */
window.crmManager.getCaseTypeLabel = function(type) {
    const labels = {
        'civil': 'Cywilna',
        'criminal': 'Karna',
        'family': 'Rodzinna',
        'commercial': 'Gospodarcza',
        'administrative': 'Administracyjna',
        'labor': 'Prawa pracy',
        'compensation': 'Odszkodowawcza',
        'bankruptcy': 'Upadłościowa',
        'other': 'Inna'
    };
    return labels[type] || type;
};

console.log('✅ Moduł Mapy Sądu gotowy!');
