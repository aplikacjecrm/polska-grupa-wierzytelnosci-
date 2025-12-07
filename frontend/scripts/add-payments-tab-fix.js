/**
 * FIX: Automatyczne dodawanie zakładki Płatności do widoku sprawy
 * 
 * Ten skrypt rozszerza funkcjonalność CRM o zakładkę płatności
 * Uruchamia się automatycznie po załadowaniu strony
 */

console.log('💰 Inicjalizacja fix-a zakładki płatności...');

// Czekaj na załadowanie CRM Manager
function initPaymentsTabFix() {
    if (!window.crmManager) {
        console.log('⏳ Czekam na crmManager...');
        setTimeout(initPaymentsTabFix, 500);
        return;
    }
    
    console.log('✅ crmManager znaleziony!');
    
    // NIE NADPISUJEMY - handlery są już w crm-case-tabs.js!
    console.log('✅ Handlery płatności i uprawnień w crm-case-tabs.js!');
    // Dodaj listener na otwieranie sprawy
    if (window.eventBus) {
        window.eventBus.on('case:opened', (data) => {
            console.log('📋 Sprawa otwarta:', data.caseId);
            addPaymentsTabButton(data.caseId);
        });
    }
}

// Funkcja dodająca przycisk zakładki płatności
function addPaymentsTabButton(caseId) {
    // Poczekaj chwilę aż zakładki się wyrenderują
    setTimeout(() => {
        const existingPaymentBtn = document.querySelector('.tab-btn[onclick*="payments"]');
        
        if (existingPaymentBtn) {
            console.log('✅ Przycisk płatności już istnieje');
            return;
        }
        
        const tabs = document.querySelectorAll('.tab-btn');
        
        if (tabs.length === 0) {
            console.log('⚠️ Nie znaleziono przycisków zakładek');
            return;
        }
        
        // Znajdź przycisk "Dokumenty" lub ostatni przed "Historia"
        let insertBefore = null;
        tabs.forEach((tab, index) => {
            const text = tab.textContent.trim();
            if (text.includes('Komentarze') || text.includes('Historia')) {
                insertBefore = tab;
            }
        });
        
        if (!insertBefore) {
            insertBefore = tabs[tabs.length - 1];
        }
        
        // Utwórz nowy przycisk
        const paymentBtn = document.createElement('button');
        paymentBtn.className = 'tab-btn';
        paymentBtn.innerHTML = '💰 Płatności';
        paymentBtn.setAttribute('onclick', `crmManager.loadCaseTabContent(${caseId}, 'payments')`);
        
        // Wstaw przed wybraną zakładką
        insertBefore.parentElement.insertBefore(paymentBtn, insertBefore);
        
        console.log('✅ Dodano przycisk zakładki "💰 Płatności"!');
    }, 300);
}

// Uruchom fix
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPaymentsTabFix);
} else {
    initPaymentsTabFix();
}

console.log('💰 Fix zakładki płatności załadowany!');
