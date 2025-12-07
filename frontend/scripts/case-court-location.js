/**
 * MODUŁ AUTO-WYPEŁNIANIA LOKALIZACJI WYDARZENIA Z SĄDEM
 * 
 * Automatycznie wypełnia pole lokalizacji w formularzu wydarzenia
 * gdy wybrano typ "Rozprawa sądowa" i sprawa ma przypisany sąd
 */

console.log('📍 Moduł Auto-Lokalizacji Sądu załadowany!');

// Przechowuj dane sprawy dla formularza wydarzeń
window._currentCaseData = null;

/**
 * Rozszerzenie funkcji showEnhancedEventForm - pobierz dane sprawy
 */
const originalShowEnhancedEventForm = window.showEnhancedEventForm;
window.showEnhancedEventForm = async function(caseId) {
    console.log('📋 Rozszerzenie: Pobieram dane sprawy przed otwarciem formularza');
    
    try {
        // Pobierz dane sprawy aby mieć dostęp do informacji o sądzie
        const response = await window.api.request(`/cases/${caseId}`);
        window._currentCaseData = response.case;
        
        console.log('✅ Dane sprawy pobrane:', {
            court_id: window._currentCaseData.court_id,
            court_address: window._currentCaseData.court_address,
            court_name: window._currentCaseData.court_name
        });
    } catch (error) {
        console.error('❌ Błąd pobierania danych sprawy:', error);
        window._currentCaseData = null;
    }
    
    // Wywołaj oryginalną funkcję
    if (originalShowEnhancedEventForm) {
        return originalShowEnhancedEventForm(caseId);
    }
};

/**
 * Rozszerzenie funkcji updateDynamicFields - auto-fill lokalizacji
 */
const originalUpdateDynamicFields = window.updateDynamicFields;
window.updateDynamicFields = function() {
    console.log('🔄 Rozszerzenie: updateDynamicFields wywołane');
    
    // Wywołaj oryginalną funkcję
    if (originalUpdateDynamicFields) {
        originalUpdateDynamicFields();
    }
    
    // Sprawdź typ wydarzenia
    const eventType = document.getElementById('eventTypeSelect')?.value;
    const locationInput = document.getElementById('eventLocation');
    
    console.log('📋 Typ wydarzenia:', eventType);
    console.log('📋 Dane sprawy dostępne:', !!window._currentCaseData);
    
    // Jeśli to rozprawa sądowa I sprawa ma przypisany sąd
    if (eventType === 'court' && window._currentCaseData && window._currentCaseData.court_address) {
        console.log('⚖️ Rozprawa sądowa + Sąd przypisany → Auto-wypełniam lokalizację!');
        
        if (locationInput) {
            locationInput.value = window._currentCaseData.court_address;
            
            // Wizualna notyfikacja
            const locationDiv = locationInput.closest('div[style*="background: #F8FAFC"]');
            if (locationDiv) {
                const originalBg = locationDiv.style.background;
                locationDiv.style.background = '#d4edda';
                locationDiv.style.border = '2px solid #3B82F6';
                
                // Dodaj notyfikację
                const notification = document.createElement('div');
                notification.style.cssText = 'margin-top: 10px; padding: 12px; background: linear-gradient(135deg, #3B82F6, #20c997); color: white; border-radius: 8px; font-weight: 600; animation: slideIn 0.3s ease;';
                notification.innerHTML = `
                    ✅ Automatycznie ustawiono lokalizację: <strong>${window._currentCaseData.court_name}</strong>
                    <div style="font-size: 0.9rem; margin-top: 5px; opacity: 0.9;">📍 ${window._currentCaseData.court_address}</div>
                `;
                
                // Wstaw notyfikację
                locationDiv.appendChild(notification);
                
                // Usuń notyfikację po 5 sekundach
                setTimeout(() => {
                    notification.remove();
                    locationDiv.style.background = originalBg;
                    locationDiv.style.border = '2px solid #4285f4';
                }, 5000);
            }
            
            // Aktualizuj mapę Mapbox jeśli istnieje
            if (window._currentCaseData.court_coordinates) {
                try {
                    const coords = JSON.parse(window._currentCaseData.court_coordinates);
                    console.log('🗺️ Centrowanie mapy na sądzie:', coords);
                    
                    // Jeśli mapa Mapbox jest załadowana, ustaw centrum
                    if (typeof mapboxgl !== 'undefined' && window._eventMap) {
                        window._eventMap.flyTo({
                            center: [coords.lng, coords.lat],
                            zoom: 15,
                            essential: true
                        });
                        
                        // Dodaj marker sądu
                        if (window._eventMapMarker) {
                            window._eventMapMarker.setLngLat([coords.lng, coords.lat]);
                        } else {
                            window._eventMapMarker = new mapboxgl.Marker({
                                color: '#3B82F6'
                            })
                            .setLngLat([coords.lng, coords.lat])
                            .addTo(window._eventMap);
                        }
                    }
                } catch (e) {
                    console.error('❌ Błąd parsowania koordynatów sądu:', e);
                }
            }
        }
    } else if (eventType === 'court' && (!window._currentCaseData || !window._currentCaseData.court_address)) {
        console.log('⚠️ Rozprawa sądowa, ale brak przypisanego sądu');
        
        // Pokaż ostrzeżenie
        const locationDiv = document.getElementById('eventLocation')?.closest('div[style*="background: #F8FAFC"]');
        if (locationDiv) {
            const warning = document.createElement('div');
            warning.style.cssText = 'margin-top: 10px; padding: 12px; background: #F8FAFC; border: 2px dashed #3B82F6; color: #666; border-radius: 8px; font-weight: 600;';
            warning.innerHTML = `
                ⚠️ Ta sprawa nie ma przypisanego sądu z bazy
                <div style="font-size: 0.9rem; margin-top: 5px;">💡 Edytuj sprawę i wybierz sąd aby automatycznie wypełniać lokalizację rozpraw</div>
            `;
            locationDiv.appendChild(warning);
            
            setTimeout(() => warning.remove(), 7000);
        }
    } else if (eventType && eventType !== 'court') {
        console.log('📝 Inny typ wydarzenia - lokalizacja ręczna');
    }
};

/**
 * Helper: Wyczyść dane sprawy po zamknięciu formularza
 */
window.addEventListener('click', (e) => {
    // Jeśli kliknięto "Anuluj" lub zamknięto modal
    if (e.target.closest('#enhancedEventModal') && e.target.textContent.includes('Anuluj')) {
        console.log('🗑️ Czyszczenie danych sprawy');
        window._currentCaseData = null;
    }
});

console.log('✅ Moduł Auto-Lokalizacji Sądu gotowy!');
