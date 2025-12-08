/**
 * Loader personelu dla formularza dodawania sprawy
 * Ładuje mecenasów (lawyers) i opiekunów spraw (case_managers)
 */

(function() {
    console.log('📋 case-staff-loader.js załadowany');

    let isLoading = false;
    let lastLoadTime = 0;
    const LOAD_COOLDOWN = 2000; // 2 sekundy między ładowaniami

    async function loadCaseStaff() {
        // Debouncing - nie ładuj jeśli już ładuje lub był niedawno załadowany
        const now = Date.now();
        if (isLoading || (now - lastLoadTime) < LOAD_COOLDOWN) {
            console.log('⏳ Pomijam ładowanie personelu sprawy - cooldown aktywny');
            return;
        }

        isLoading = true;
        lastLoadTime = now;
        try {
            console.log('📋 Pobieranie listy personelu dla sprawy...');
            
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('⚠️ Brak tokena - pomijam ładowanie personelu');
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

            const lawyers = data.lawyers || [];
            const caseManagers = data.case_managers || [];
            
            console.log(`✅ Załadowano z mecenasów:`, lawyers.length);
            console.log(`✅ Załadowano ${caseManagers.length} opiekunów spraw:`, caseManagers);

            // Wypełnij select mecenasów
            const lawyerSelect = document.getElementById('caseLawyerId');
            if (lawyerSelect) {
                lawyerSelect.innerHTML = '<option value="">-- Wybierz mecenasa --</option>';
                lawyers.forEach(lawyer => {
                    const option = document.createElement('option');
                    option.value = lawyer.id;
                    option.textContent = `${lawyer.name} (${lawyer.initials || lawyer.email})`;
                    lawyerSelect.appendChild(option);
                });
                console.log(`✅ Wypełniono select mecenasów - ${lawyers.length} opcji`);
            } else {
                console.warn('⚠️ Nie znaleziono selecta #caseLawyerId');
            }

            // Wypełnij select opiekunów spraw
            const caretakerSelect = document.getElementById('caseAdditionalCaretaker');
            if (caretakerSelect) {
                caretakerSelect.innerHTML = '<option value="">-- Wybierz opiekuna --</option>';
                caseManagers.forEach(manager => {
                    const option = document.createElement('option');
                    option.value = manager.id;
                    option.textContent = `${manager.name} (${manager.initials || manager.email})`;
                    caretakerSelect.appendChild(option);
                });
                console.log(`✅ Wypełniono select opiekunów - ${caseManagers.length} opcji`);
            } else {
                console.warn('⚠️ Nie znaleziono selecta #caseAdditionalCaretaker');
            }

        } catch (error) {
            console.error('❌ Błąd ładowania personelu:', error);
        } finally {
            isLoading = false;
        }
    }

    // Załaduj przy starcie
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(loadCaseStaff, 500);
        });
    } else {
        setTimeout(loadCaseStaff, 500);
    }

    // BACKUP timer - sprawdzaj co sekundę czy modal otwarty i listy puste
    setInterval(() => {
        const caseModal = document.getElementById('caseModal');
        const lawyerSelect = document.getElementById('caseLawyerId');
        const caretakerSelect = document.getElementById('caseAdditionalCaretaker');
        
        if (caseModal && 
            (caseModal.style.display === 'flex' || caseModal.style.display === 'block') &&
            ((lawyerSelect && lawyerSelect.options.length <= 1) ||
             (caretakerSelect && caretakerSelect.options.length <= 1))) {
            
            console.log('🔄 BACKUP: Modal sprawy otwarty ale listy puste - ładuję...');
            loadCaseStaff();
        }
    }, 1000);

    // Export
    window.loadCaseStaff = loadCaseStaff;

    console.log('✅ case-staff-loader.js gotowy');
})();

