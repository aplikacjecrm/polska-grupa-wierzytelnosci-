/**
 * SYSTEM AUTOCOMPLETE PROKURATUR
 * Analogiczny do courts-autocomplete
 */

console.log('🏛️ prosecutors-autocomplete.js załadowany');

// ========== WYSZUKIWANIE PROKURATUR ==========

window.searchProsecutorsLive = async function(query) {
    console.log('🔍 searchProsecutorsLive wywołana z query:', query);
    
    const suggestionsDiv = document.getElementById('prosecutorSuggestions');
    
    if (!suggestionsDiv) {
        console.error('❌ Element prosecutorSuggestions NIE ISTNIEJE!');
        return;
    }
    
    console.log('✅ Element prosecutorSuggestions znaleziony');
    
    // Jeśli zapytanie < 2 znaki, ukryj sugestie
    if (query.length < 2) {
        console.log('⚠️  Za krótkie zapytanie (< 2 znaki)');
        suggestionsDiv.style.display = 'none';
        return;
    }
    
    try {
        console.log('🔍 Wyszukiwanie prokuratur:', query);
        const response = await window.api.request(`/prosecutors/search?q=${encodeURIComponent(query)}`);
        
        if (!response || !response.prosecutors) {
            console.error('❌ Nieprawidłowa odpowiedź API');
            return;
        }
        
        const prosecutors = response.prosecutors;
        console.log(`✅ Znaleziono ${prosecutors.length} prokuratur`);
        console.log('📦 Przykładowa prokuratura:', prosecutors[0]);
        
        if (prosecutors.length === 0) {
            suggestionsDiv.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #999;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">🔍</div>
                    <div>Nie znaleziono prokuratur dla: <strong>"${query}"</strong></div>
                    <div style="font-size: 0.85rem; margin-top: 8px;">Spróbuj wyszukać po mieście lub typie</div>
                </div>
            `;
            suggestionsDiv.style.display = 'block';
            return;
        }
        
        // Wyświetl sugestie
        suggestionsDiv.innerHTML = prosecutors.map(prosecutor => {
            const typeLabel = prosecutor.type === 'regionalna' ? 'Regionalna' : 
                              prosecutor.type === 'okregowa' ? 'Okręgowa' : 'Rejonowa';
            const typeColor = prosecutor.type === 'regionalna' ? '#3B82F6' : 
                              prosecutor.type === 'okregowa' ? '#3B82F6' : '#ff5722';
            
            return `
                <div onclick="window.selectProsecutorFromAutocomplete('${prosecutor.id}')" 
                     style="padding: 15px; border-bottom: 1px solid #e0e0e0; cursor: pointer; transition: background 0.2s;"
                     onmouseover="this.style.background='#F8FAFC'"
                     onmouseout="this.style.background='white'">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <strong style="color: #e65100; font-size: 1.05rem;">${prosecutor.name || 'Brak nazwy'}</strong>
                        <span style="background: ${typeColor}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">${typeLabel}</span>
                    </div>
                    <div style="color: #666; font-size: 0.9rem;">
                        📍 ${prosecutor.address || 'Brak adresu'}
                    </div>
                    <div style="color: #999; font-size: 0.85rem; margin-top: 4px;">
                        📞 ${prosecutor.phone || 'Brak telefonu'} | ✉️ ${prosecutor.email || 'Brak emaila'}
                    </div>
                </div>
            `;
        }).join('');
        
        suggestionsDiv.style.display = 'block';
        
    } catch (error) {
        console.error('❌ Błąd wyszukiwania prokuratur:', error);
        suggestionsDiv.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #f44336;">
                <div style="font-size: 2rem; margin-bottom: 10px;">❌</div>
                <div>Błąd wyszukiwania prokuratur</div>
                <div style="font-size: 0.85rem; margin-top: 8px;">${error.message}</div>
            </div>
        `;
        suggestionsDiv.style.display = 'block';
    }
};

// ========== WYBÓR PROKURATURY Z AUTOCOMPLETE ==========

window.selectProsecutorFromAutocomplete = async function(prosecutorId) {
    try {
        console.log('🏛️ Wybrano prokuraturę z ID:', prosecutorId);
        
        // Pobierz pełne dane prokuratury
        const response = await window.api.request(`/prosecutors/${prosecutorId}`);
        const prosecutor = response.prosecutor;
        
        console.log('✅ Dane prokuratury:', prosecutor);
        
        // 1. Ustaw ukryte pola (dla zapisu)
        document.getElementById('selectedProsecutorId').value = prosecutor.id;
        document.getElementById('selectedProsecutorData').value = JSON.stringify(prosecutor);
        
        // 2. WYPEŁNIJ WIDOCZNE POLA
        document.getElementById('manualProsecutorOffice').value = prosecutor.name || '';
        
        // 3. WYPEŁNIJ POLA SZCZEGÓŁOWE
        if (document.getElementById('prosecutorAddress')) {
            document.getElementById('prosecutorAddress').value = prosecutor.address || '';
        }
        if (document.getElementById('prosecutorPhone')) {
            document.getElementById('prosecutorPhone').value = prosecutor.phone || '';
        }
        if (document.getElementById('prosecutorEmail')) {
            document.getElementById('prosecutorEmail').value = prosecutor.email || '';
        }
        if (document.getElementById('prosecutorWebsite')) {
            document.getElementById('prosecutorWebsite').value = prosecutor.website || '';
        }
        
        // 3. Pokaż kartę informacyjną
        const infoDiv = document.getElementById('selectedProsecutorInfo');
        if (infoDiv) {
            document.getElementById('selectedProsecutorName').textContent = prosecutor.name;
            document.getElementById('selectedProsecutorAddress').textContent = prosecutor.address;
            document.getElementById('selectedProsecutorPhone').textContent = prosecutor.phone;
            document.getElementById('selectedProsecutorEmail').textContent = prosecutor.email;
            document.getElementById('selectedProsecutorWebsite').href = prosecutor.website;
            infoDiv.style.display = 'block';
        }
        
        // 4. Ukryj dropdown z sugestiami
        const suggestionsDiv = document.getElementById('prosecutorSuggestions');
        if (suggestionsDiv) {
            suggestionsDiv.style.display = 'none';
        }
        
        // 5. Wyczyść pole wyszukiwania
        const searchInput = document.getElementById('prosecutorSearchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        console.log('✅ Wszystkie pola wypełnione!');
        
        // 6. Animacja potwierdzenia
        const field = document.getElementById('manualProsecutorOffice');
        if (field) {
            field.style.background = '#d4edda';
            field.style.borderColor = '#3B82F6';
            setTimeout(() => {
                field.style.background = 'white';
                field.style.borderColor = '#ddd';
            }, 2000);
        }
        
    } catch (error) {
        console.error('❌ Błąd pobierania danych prokuratury:', error);
        alert('Błąd pobierania danych prokuratury: ' + error.message);
    }
};

// ========== CZYSZCZENIE WYBRANEJ PROKURATURY ==========

window.clearSelectedProsecutor = function() {
    // Wyczyść ukryte pola
    document.getElementById('selectedProsecutorId').value = '';
    document.getElementById('selectedProsecutorData').value = '';
    
    // Wyczyść widoczne pola szczegółowe
    if (document.getElementById('prosecutorAddress')) {
        document.getElementById('prosecutorAddress').value = '';
    }
    if (document.getElementById('prosecutorPhone')) {
        document.getElementById('prosecutorPhone').value = '';
    }
    if (document.getElementById('prosecutorEmail')) {
        document.getElementById('prosecutorEmail').value = '';
    }
    if (document.getElementById('prosecutorWebsite')) {
        document.getElementById('prosecutorWebsite').value = '';
    }
    
    // Ukryj kartę informacyjną
    const infoDiv = document.getElementById('selectedProsecutorInfo');
    if (infoDiv) {
        infoDiv.style.display = 'none';
    }
    
    console.log('🗑️ Wyczyszczono wybór prokuratury');
};
