// 📜 MODUŁ SPRAW CYWILNYCH - Umowy, Majątkowe, Spadkowe
console.log('📜 Civil Cases Module v1.0 - Loaded!');

// ===== GŁÓWNA FUNKCJA OTWIERAJĄCA MODUŁ =====
window.openCivilCaseModule = function(caseId, caseType) {
    console.log(`📜 Opening civil module for case ${caseId}, type: ${caseType}`);
    
    const details = window.getCivilCaseDetails(caseType);
    if (!details) {
        alert('⚠️ Nie znaleziono szczegółów dla tego typu sprawy.');
        return;
    }
    
    // Pokaż modal z opcjami
    showCivilModuleModal(caseId, caseType, details);
};

// ===== MODAL Z OPCJAMI MODUŁU =====
function showCivilModuleModal(caseId, caseType, details) {
    const modal = document.createElement('div');
    modal.id = 'civilModuleModal';
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
        <div style="
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 900px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: slideIn 0.3s;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="font-size: 3rem;">${details.icon}</div>
                    <div>
                        <h2 style="margin: 0; color: ${details.color};">${details.name}</h2>
                        <p style="margin: 5px 0 0 0; color: #666;">${details.desc}</p>
                    </div>
                </div>
                <button onclick="document.getElementById('civilModuleModal').remove()" style="
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
                ${getModuleOptions(caseId, caseType, details).map(option => `
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
                <h3 style="margin: 0 0 15px 0; color: ${details.color};">📋 Procedura prawna:</h3>
                <p style="margin: 0; font-size: 1.1rem; color: #333;">${details.procedures}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ===== OPCJE MODUŁU DLA RÓŻNYCH TYPÓW =====
function getModuleOptions(caseId, caseType, details) {
    const baseOptions = [
        {
            icon: '📝',
            title: 'Generator dokumentów',
            desc: 'Automatyczne tworzenie pism procesowych',
            action: `window.openDocumentGenerator('${caseId}', '${caseType}')`
        },
        {
            icon: '💰',
            title: 'Kalkulator roszczeń',
            desc: 'Oblicz wartość sprawy i koszty',
            action: `window.openClaimsCalculator('${caseId}', '${caseType}')`
        },
        {
            icon: '📊',
            title: 'Analiza AI',
            desc: 'Sztuczna inteligencja oceni sprawę',
            action: `window.openAIAnalysis('${caseId}', '${caseType}')`
        },
        {
            icon: '⚖️',
            title: 'Baza orzeczeń',
            desc: 'Znajdź podobne wyroki sądowe',
            action: `window.openJurisprudence('${caseId}', '${caseType}')`
        }
    ];
    
    // Dodaj specyficzne opcje dla typu
    if (caseType.includes('contract') || caseType.includes('UMO') || caseType.includes('SPR') || caseType.includes('NAJ') || caseType.includes('DZI') || caseType.includes('KRE')) {
        baseOptions.push({
            icon: '✍️',
            title: 'Kreator umów',
            desc: 'Przygotuj profesjonalną umowę',
            action: `window.openContractCreator('${caseId}', '${caseType}')`
        });
    }
    
    if (caseType.includes('property') || caseType.includes('MAJ') || caseType.includes('WLA') || caseType.includes('SLU') || caseType.includes('ZAS') || caseType.includes('WIN')) {
        baseOptions.push({
            icon: '📋',
            title: 'Analiza KW',
            desc: 'Sprawdź księgę wieczystą online',
            action: `window.openLandRegisterCheck('${caseId}', '${caseType}')`
        });
    }
    
    if (caseType.includes('inheritance') || caseType.includes('SPA') || caseType.includes('TES') || caseType.includes('DZS') || caseType.includes('ZAC') || caseType.includes('ODR')) {
        baseOptions.push({
            icon: '👥',
            title: 'Kalkulator działu',
            desc: 'Oblicz udziały spadkobierców',
            action: `window.openInheritanceCalculator('${caseId}', '${caseType}')`
        });
    }
    
    return baseOptions;
}

// ===== GENERATOR DOKUMENTÓW =====
window.openDocumentGenerator = function(caseId, caseType) {
    alert(`📝 Generator dokumentów dla sprawy ${caseId}\n\n` +
          `Dostępne wzory:\n` +
          `• Pozew\n` +
          `• Odpowiedź na pozew\n` +
          `• Wezwanie do zapłaty\n` +
          `• Wniosek o zabezpieczenie\n` +
          `• Apelacja\n` +
          `• Zażalenie\n\n` +
          `🚀 W przygotowaniu!`);
};

// ===== KALKULATOR ROSZCZEŃ =====
window.openClaimsCalculator = function(caseId, caseType) {
    const modal = document.createElement('div');
    modal.id = 'claimsCalculatorModal';
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
        z-index: 10001;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 40px; max-width: 600px; width: 90%;">
            <h2 style="margin: 0 0 20px 0; color: #2c3e50;">💰 Kalkulator roszczeń</h2>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Wartość główna:</label>
                <input type="number" id="mainAmount" placeholder="0.00" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1.1rem;">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Odsetki ustawowe od:</label>
                <input type="date" id="interestFrom" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px;">
            </div>
            
            <button onclick="calculateClaims()" style="
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #3B82F6, #1E40AF);
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 1.1rem;
                font-weight: 700;
                cursor: pointer;
                margin-bottom: 20px;
            ">🧮 Oblicz</button>
            
            <div id="calculationResult" style="background: #f8f9fa; padding: 20px; border-radius: 10px; display: none;">
                <h3 style="margin: 0 0 15px 0; color: #3B82F6;">Wynik:</h3>
                <div id="resultContent"></div>
            </div>
            
            <button onclick="document.getElementById('claimsCalculatorModal').remove()" style="
                width: 100%;
                padding: 12px;
                background: #3B82F6;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                margin-top: 10px;
            ">Zamknij</button>
        </div>
    `;
    
    document.body.appendChild(modal);
};

window.calculateClaims = function() {
    const mainAmount = parseFloat(document.getElementById('mainAmount').value) || 0;
    const interestFrom = document.getElementById('interestFrom').value;
    
    if (mainAmount <= 0) {
        alert('⚠️ Wprowadź wartość główną!');
        return;
    }
    
    const today = new Date();
    const startDate = interestFrom ? new Date(interestFrom) : new Date();
    const days = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    // Uproszczone odsetki ustawowe 8% rocznie
    const interestRate = 0.08;
    const interest = (mainAmount * interestRate * days) / 365;
    
    const courtFee = calculateCourtFee(mainAmount);
    const total = mainAmount + interest + courtFee;
    
    const resultDiv = document.getElementById('calculationResult');
    const resultContent = document.getElementById('resultContent');
    
    resultContent.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong>Wartość główna:</strong> ${mainAmount.toFixed(2)} zł
        </div>
        <div style="margin-bottom: 10px;">
            <strong>Odsetki (${days} dni):</strong> ${interest.toFixed(2)} zł
        </div>
        <div style="margin-bottom: 10px;">
            <strong>Opłata sądowa:</strong> ${courtFee.toFixed(2)} zł
        </div>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #3B82F6;">
            <strong style="font-size: 1.2rem;">RAZEM:</strong> 
            <strong style="font-size: 1.3rem; color: #3B82F6;">${total.toFixed(2)} zł</strong>
        </div>
    `;
    
    resultDiv.style.display = 'block';
};

function calculateCourtFee(amount) {
    if (amount <= 20000) return amount * 0.05;
    if (amount <= 50000) return 1000 + (amount - 20000) * 0.03;
    return 1900 + (amount - 50000) * 0.02;
}

// ===== ANALIZA AI =====
window.openAIAnalysis = function(caseId, caseType) {
    alert(`🤖 Analiza AI dla sprawy ${caseId}\n\n` +
          `System przeanalizuje:\n` +
          `• Dokumenty sprawy\n` +
          `• Podobne orzeczenia\n` +
          `• Szanse wygranej\n` +
          `• Optymalne strategie\n` +
          `• Ryzyko kosztowe\n\n` +
          `🚀 Funkcja w przygotowaniu!`);
};

// ===== BAZA ORZECZEŃ =====
window.openJurisprudence = function(caseId, caseType) {
    alert(`⚖️ Baza orzeczeń dla typu: ${caseType}\n\n` +
          `Przeszukamy:\n` +
          `• Sąd Najwyższy\n` +
          `• Sądy Apelacyjne\n` +
          `• Sądy Okręgowe\n` +
          `• ETS/ETPC\n\n` +
          `🚀 W przygotowaniu!`);
};

// ===== KREATOR UMÓW =====
window.openContractCreator = function(caseId, caseType) {
    alert(`✍️ Kreator umów\n\n` +
          `Dostępne szablony:\n` +
          `• Umowa sprzedaży\n` +
          `• Umowa najmu\n` +
          `• Umowa o dzieło\n` +
          `• Umowa zlecenia\n` +
          `• Umowa pożyczki\n\n` +
          `🚀 W przygotowaniu!`);
};

// ===== ANALIZA KW =====
window.openLandRegisterCheck = function(caseId, caseType) {
    alert(`📋 Analiza księgi wieczystej\n\n` +
          `Sprawdź:\n` +
          `• Właściciela\n` +
          `• Obciążenia\n` +
          `• Służebności\n` +
          `• Hipoteki\n` +
          `• Ograniczenia\n\n` +
          `🚀 W przygotowaniu!`);
};

// ===== KALKULATOR DZIAŁU SPADKU =====
window.openInheritanceCalculator = function(caseId, caseType) {
    alert(`👥 Kalkulator działu spadku\n\n` +
          `Oblicz:\n` +
          `• Udziały ustawowe\n` +
          `• Udziały testamentowe\n` +
          `• Zachowek\n` +
          `• Darowizny do uwzględnienia\n` +
          `• Podział rzeczowy\n\n` +
          `🚀 W przygotowaniu!`);
};

console.log('✅ Civil Cases Module - All functions loaded!');
