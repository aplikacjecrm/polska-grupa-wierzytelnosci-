// 💼 MODUŁ SPRAW GOSPODARCZYCH - Gospodarcze, Upadłościowe, Restrukturyzacja
console.log('💼 Commercial Cases Module v1.0 - Loaded!');

// ===== GŁÓWNA FUNKCJA =====
window.openCommercialCaseModule = function(caseId, caseType) {
    console.log(`💼 Opening commercial module for case ${caseId}, type: ${caseType}`);
    
    const details = window.getCommercialCaseDetails(caseType);
    if (!details) {
        alert('⚠️ Nie znaleziono szczegółów dla tego typu sprawy.');
        return;
    }
    
    showCommercialModuleModal(caseId, caseType, details);
};

// ===== MODAL =====
function showCommercialModuleModal(caseId, caseType, details) {
    const modal = document.createElement('div');
    modal.id = 'commercialModuleModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 40px; max-width: 900px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="font-size: 3rem;">${details.icon}</div>
                    <div>
                        <h2 style="margin: 0; color: ${details.color};">${details.name}</h2>
                        <p style="margin: 5px 0 0 0; color: #666;">${details.desc}</p>
                    </div>
                </div>
                <button onclick="document.getElementById('commercialModuleModal').remove()" style="
                    background: #3B82F6;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s;
                " onmouseover="this.style.transform='rotate(90deg)'" onmouseout="this.style.transform='rotate(0)'">×</button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px;">
                ${getCommercialModuleOptions(caseId, caseType, details).map(option => `
                    <button onclick="${option.action}" style="
                        background: linear-gradient(135deg, ${details.color}, ${details.color}dd);
                        color: white;
                        border: none;
                        border-radius: 15px;
                        padding: 25px;
                        text-align: left;
                        cursor: pointer;
                        transition: all 0.3s;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.2)'">
                        <div style="font-size: 2rem; margin-bottom: 10px;">${option.icon}</div>
                        <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 5px;">${option.title}</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">${option.desc}</div>
                    </button>
                `).join('')}
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid ${details.color};">
                <h3 style="margin: 0 0 15px 0; color: ${details.color};">📋 Procedura:</h3>
                <p style="margin: 0; font-size: 1.1rem; color: #333;">${details.procedures}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ===== OPCJE =====
function getCommercialModuleOptions(caseId, caseType, details) {
    const options = [
        {
            icon: '📝',
            title: 'Generator dokumentów',
            desc: 'Pozwy, wnioski, umowy',
            action: `window.openCommercialDocuments('${caseId}', '${caseType}')`
        },
        {
            icon: '💰',
            title: 'Windykacja',
            desc: 'Odzyskaj należności',
            action: `window.openDebtCollection('${caseId}', '${caseType}')`
        },
        {
            icon: '⚖️',
            title: 'Baza orzeczeń',
            desc: 'Sądy gospodarcze',
            action: `window.openCommercialJurisprudence('${caseId}', '${caseType}')`
        },
        {
            icon: '📊',
            title: 'Analiza finansowa',
            desc: 'Ocena przedsiębiorstwa',
            action: `window.openFinancialAnalysis('${caseId}', '${caseType}')`
        }
    ];
    
    // Specyficzne dla upadłości
    if (caseType.includes('bankruptcy') || caseType.includes('UPA')) {
        options.push({
            icon: '📋',
            title: 'Ankieta upadłościowa',
            desc: 'Zbierz dane do wniosku',
            action: `window.openBankruptcyQuestionnaire('${caseId}', '${caseType}')`
        });
    }
    
    // Specyficzne dla restrukturyzacji
    if (caseType.includes('restructuring') || caseType.includes('RES')) {
        options.push({
            icon: '🔄',
            title: 'Plan restrukturyzacji',
            desc: 'Przygotuj propozycje',
            action: `window.openRestructuringPlan('${caseId}', '${caseType}')`
        });
    }
    
    return options;
}

// ===== WINDYKACJA =====
window.openDebtCollection = function(caseId, caseType) {
    alert(`💰 Moduł windykacji\n\n` +
          `Funkcje:\n` +
          `• Generator wezwań do zapłaty\n` +
          `• Kalkulator odsetek i opłat\n` +
          `• Elektroniczny nakaz zapłaty\n` +
          `• Wniosek o zabezpieczenie\n` +
          `• Monitoring KRS/CEIDG\n\n` +
          `🚀 W przygotowaniu!`);
};

// ===== POZOSTAŁE =====
window.openCommercialDocuments = function(caseId, caseType) {
    alert(`📝 Generator dokumentów gospodarczych\n\nDostępne wzory:\n• Pozew o zapłatę\n• Wniosek o upadłość\n• Wniosek o restrukturyzację\n• Umowy handlowe\n• Faktury VAT\n\n🚀 W przygotowaniu!`);
};

window.openCommercialJurisprudence = function(caseId, caseType) {
    alert(`⚖️ Baza orzeczeń sądów gospodarczych\n\nPrzeszukamy:\n• Sądy gospodarcze\n• Sąd Najwyższy - izba cywilna\n• Sądy apelacyjne\n\n🚀 W przygotowaniu!`);
};

window.openFinancialAnalysis = function(caseId, caseType) {
    alert(`📊 Analiza finansowa\n\nSystem oceni:\n• Płynność finansową\n• Zadłużenie\n• Rentowność\n• Wypłacalność\n• Ryzyko bankructwa\n\n🚀 W przygotowaniu!`);
};

window.openBankruptcyQuestionnaire = function(caseId, caseType) {
    alert(`📋 Ankieta upadłościowa\n\nZbierzemy:\n• Dane przedsiębiorcy\n• Listę wierzycieli\n• Zobowiązania\n• Majątek\n• Przychody i koszty\n\n🚀 W przygotowaniu!`);
};

window.openRestructuringPlan = function(caseId, caseType) {
    alert(`🔄 Plan restrukturyzacji\n\nPrzygotuj:\n• Propozycje układowe\n• Harmonogram spłat\n• Redukcję długu\n• Plan naprawczy\n\n🚀 W przygotowaniu!`);
};

console.log('✅ Commercial Cases Module - All functions loaded!');
