/**
 * Loader opiekunów klientów dla formularza dodawania klienta
 * Ładuje użytkowników z rolą 'client_manager' i wypełnia select
 */

(function() {
    console.log('📋 client-manager-loader.js załadowany');

    let isLoading = false;
    let lastLoadTime = 0;
    const LOAD_COOLDOWN = 2000; // 2 sekundy między ładowaniami

    async function loadClientManagers() {
        // Debouncing - nie ładuj jeśli już ładuje lub był niedawno załadowany
        const now = Date.now();
        if (isLoading || (now - lastLoadTime) < LOAD_COOLDOWN) {
            console.log('⏳ Pomijam ładowanie - cooldown aktywny');
            return;
        }

        isLoading = true;
        lastLoadTime = now;
        try {
            console.log('📋 Pobieranie listy opiekunów klientów...');
            
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('⚠️ Brak tokena - pomijam ładowanie opiekunów');
                return;
            }

            const response = await fetch('https://web-production-ef868.up.railway.app/api/cases/staff/list', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('❌ Błąd API:', response.status);
                return;
            }

            const data = await response.json();
            console.log('📦 Otrzymane dane z API:', data);
            console.log('📦 client_managers:', data.client_managers);
            console.log('📦 lawyers:', data.lawyers);
            console.log('📦 case_managers:', data.case_managers);

            const clientManagers = data.client_managers || [];
            console.log(`✅ Załadowano ${clientManagers.length} opiekunów klientów:`, clientManagers);
            console.log('🔍 SZCZEGÓŁY client_managers:', JSON.stringify(clientManagers, null, 2));

            const select = document.getElementById('clientManager');
            if (!select) {
                console.warn('⚠️ Nie znaleziono selecta #clientManager');
                return;
            }

            // Wyczyść opcje (zostaw tylko default)
            select.innerHTML = '<option value="">-- Wybierz opiekuna --</option>';

            // Dodaj opiekunów
            clientManagers.forEach(manager => {
                const option = document.createElement('option');
                option.value = manager.id;
                option.textContent = `${manager.name} (${manager.initials || manager.email})`;
                select.appendChild(option);
                console.log(`➕ Dodano opcję: ${manager.name} (ID: ${manager.id}, role: ${manager.user_role})`);
            });

            console.log(`✅ Wypełniono select - ${clientManagers.length} opcji`);
            console.log(`📊 Select po wypełnieniu ma ${select.options.length} opcji total`);
            
            // Wyświetl wszystkie opcje w selectcie
            Array.from(select.options).forEach((opt, idx) => {
                console.log(`  [${idx}] value="${opt.value}" text="${opt.textContent}"`);
            });

        } catch (error) {
            console.error('❌ Błąd ładowania opiekunów klientów:', error);
        } finally {
            isLoading = false;
        }
    }

    // Załaduj przy starcie
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(loadClientManagers, 500);
        });
    } else {
        setTimeout(loadClientManagers, 500);
    }

    // Obserwuj otwieranie modala za pomocą MutationObserver
    const observer = new MutationObserver(() => {
        const clientModal = document.getElementById('clientModal');
        const select = document.getElementById('clientManager');
        
        if (clientModal && clientModal.style.display === 'flex' && select) {
            console.log('👁️ OBSERVER: Modal klienta otwarty - sprawdzam select...');
            console.log('📊 Select options count:', select.options.length);
            
            if (select.options.length <= 1) {
                console.log('🔄 OBSERVER: Lista pusta - ładuję dane...');
                loadClientManagers();
            }
        }
    });
    
    // Obserwuj zmiany w DOM
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
    });
    
    // BACKUP timer - sprawdzaj co 500ms (szybciej!)
    setInterval(() => {
        const clientModal = document.getElementById('clientModal');
        const select = document.getElementById('clientManager');
        
        if (clientModal && 
            (clientModal.style.display === 'flex' || clientModal.style.display === 'block') &&
            select && 
            select.options.length <= 1) {
            
            console.log('🔄 BACKUP: Modal klienta otwarty ale lista pusta - ładuję...');
            loadClientManagers();
        }
    }, 500);

    // Export
    window.loadClientManagers = loadClientManagers;

    console.log('✅ client-manager-loader.js gotowy');
})();

