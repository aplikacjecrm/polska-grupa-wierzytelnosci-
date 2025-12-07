// ========== HELPER FUNKCJE DLA MODUŁU CYWILNEGO ==========
console.log('🔧 Civil Helpers v1.0 - Loaded!');

// Globalna funkcja do odświeżania zakładki
window.renderCaseTab = async function(caseId, tabName) {
    if (window.crmManager && window.crmManager.switchCaseTab) {
        await window.crmManager.switchCaseTab(caseId, tabName);
    } else {
        console.error('❌ crmManager.switchCaseTab nie jest dostępne');
    }
};
