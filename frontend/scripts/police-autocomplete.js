/**
 * AUTOCOMPLETE DLA KOMEND POLICJI
 * System wyszukiwania i wyboru komend policji z bazy danych
 */

let policeSearchTimeout = null;
let selectedPolice = null;

/**
 * Wyszukiwanie komend policji na żywo
 */
window.searchPoliceLive = async function(query) {
    clearTimeout(policeSearchTimeout);
    
    const suggestionsDiv = document.getElementById('policeSuggestions');
    
    if (!query || query.trim().length < 2) {
        suggestionsDiv.style.display = 'none';
        return;
    }
    
    policeSearchTimeout = setTimeout(async () => {
        try {
            console.log('🔍 Wyszukiwanie komend policji dla:', query);
            
            // Użyj window.api.request zamiast fetch (lepsze zarządzanie błędami)
            const results = await window.api.request(`/police/search?q=${encodeURIComponent(query.trim())}`);
            
            console.log('✅ Wyniki:', Array.isArray(results) ? results.length : 'Nieprawidłowy format');
            
            if (results.length === 0) {
                suggestionsDiv.innerHTML = `
                    <div style="padding: 20px; text-align: center; color: #666;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">🚫</div>
                        <div style="font-weight: 600; margin-bottom: 5px;">Nie znaleziono komendy policji</div>
                        <div style="font-size: 0.85rem;">Spróbuj wyszukać inaczej lub wpisz dane ręcznie</div>
                    </div>
                `;
                suggestionsDiv.style.display = 'block';
                return;
            }
            
            // Renderuj wyniki
            suggestionsDiv.innerHTML = results.map(police => `
                <div onclick="window.selectPoliceFromAutocomplete('${police.id}')" 
                     style="padding: 14px; border-bottom: 1px solid #F8FAFC; cursor: pointer; transition: all 0.2s;"
                     onmouseover="this.style.background='#F8FAFC'"
                     onmouseout="this.style.background='white'">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <div>
                            <div style="font-weight: 700; color: #1565c0; font-size: 1rem; margin-bottom: 4px;">
                                ${police.name}
                            </div>
                            <div style="color: #666; font-size: 0.85rem; margin-bottom: 6px;">
                                ${police.type === 'wojewodzka' ? '🏛️ Komenda Wojewódzka' : '🏢 Komenda Rejonowa'}
                            </div>
                        </div>
                        <span style="background: #3B82F6; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                            ${police.type === 'wojewodzka' ? 'KWP' : 'KRP'}
                        </span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85rem; color: #555;">
                        <div><strong>📍</strong> ${police.address}</div>
                        <div><strong>📞</strong> ${police.phone}</div>
                    </div>
                    ${police.email ? `<div style="font-size: 0.85rem; color: #555; margin-top: 4px;"><strong>✉️</strong> ${police.email}</div>` : ''}
                </div>
            `).join('');
            
            suggestionsDiv.style.display = 'block';
            
        } catch (error) {
            console.error('❌ Błąd wyszukiwania komend policji:', error.message);
            
            suggestionsDiv.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #d32f2f;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">❌</div>
                    <div style="font-weight: 600;">Błąd wyszukiwania</div>
                    <div style="font-size: 0.85rem; margin: 10px 0;">${error.message || 'Sprawdź czy backend działa'}</div>
                    <div style="font-size: 0.8rem; color: #999; margin-top: 10px;">💡 Możesz wpisać dane ręcznie w pola poniżej</div>
                </div>
            `;
            suggestionsDiv.style.display = 'block';
        }
    }, 300);
};

/**
 * Wybór komendy policji z autocomplete
 */
window.selectPoliceFromAutocomplete = async function(policeId) {
    try {
        console.log('📍 Wybieranie komendy policji:', policeId);
        
        // Użyj window.api.request
        const police = await window.api.request(`/police/${policeId}`);
        selectedPolice = police;
        
        console.log('✅ Wybrano:', police.name);
        
        // Wypełnij pola formularza
        document.getElementById('policeSearchInput').value = police.name;
        document.getElementById('manualPoliceAuthority').value = police.name;
        document.getElementById('policeAddress').value = police.address;
        document.getElementById('policePhone').value = police.phone;
        document.getElementById('policeEmail').value = police.email || '';
        document.getElementById('policeWebsite').value = police.website || '';
        
        // Ukryte pola
        document.getElementById('selectedPoliceId').value = police.id;
        document.getElementById('selectedPoliceData').value = JSON.stringify(police);
        
        // Pokaż kartę informacyjną
        const selectedPoliceInfo = document.getElementById('selectedPoliceInfo');
        if (selectedPoliceInfo) {
            document.getElementById('selectedPoliceName').textContent = police.name;
            document.getElementById('selectedPoliceAddress').textContent = police.address;
            document.getElementById('selectedPolicePhone').textContent = police.phone;
            document.getElementById('selectedPoliceEmail').textContent = police.email || 'Brak';
            
            if (police.website) {
                const websiteLink = document.getElementById('selectedPoliceWebsite');
                if (websiteLink) {
                    websiteLink.href = police.website;
                    websiteLink.textContent = 'Otwórz';
                    websiteLink.parentElement.style.display = 'block';
                }
            }
            
            // POKAŻ panel informacyjny
            selectedPoliceInfo.style.display = 'block';
            
            // UKRYJ ręczne pola (są już wypełnione automatycznie)
            const manualFields = document.getElementById('manualPoliceFields');
            if (manualFields) {
                manualFields.style.display = 'none';
            }
            
            console.log('✅ Panel szczegółów policji WIDOCZNY');
        }
        
        document.getElementById('policeSuggestions').style.display = 'none';
        
        console.log('✅ Wybrano komendę policji:', police.name);
        
    } catch (error) {
        console.error('Błąd wyboru komendy policji:', error);
        alert('Błąd wyboru komendy policji. Spróbuj ponownie.');
    }
};

/**
 * Wyczyść wybraną komendę policji
 */
window.clearSelectedPolice = function() {
    console.log('🗑️ Czyszczenie wybranej komendy policji');
    selectedPolice = null;
    
    // UKRYJ panel szczegółów
    const selectedPoliceInfo = document.getElementById('selectedPoliceInfo');
    if (selectedPoliceInfo) {
        selectedPoliceInfo.style.display = 'none';
    }
    
    // POKAŻ ręczne pola z powrotem
    const manualFields = document.getElementById('manualPoliceFields');
    if (manualFields) {
        manualFields.style.display = 'block';
    }
    
    // Wyczyść wszystkie pola
    document.getElementById('policeSearchInput').value = '';
    document.getElementById('manualPoliceAuthority').value = '';
    document.getElementById('policeAddress').value = '';
    document.getElementById('policePhone').value = '';
    document.getElementById('policeEmail').value = '';
    document.getElementById('policeWebsite').value = '';
    document.getElementById('selectedPoliceId').value = '';
    document.getElementById('selectedPoliceData').value = '';
    
    // Ukryj kartę informacyjną
    document.getElementById('selectedPoliceInfo').style.display = 'none';
    
    console.log('✅ Wyczyszczono wybraną komendę policji');
};

console.log('✅ Police autocomplete loaded');
