// 👨‍👩‍👧‍👦 MODUŁ SPRAW RODZINNYCH - Rozwody, Alimenty, Władza rodzicielska, Nieletni
console.log('👨‍👩‍👧‍👦 Family Cases Module v1.0 - Loaded!');

// ===== GŁÓWNA FUNKCJA OTWIERAJĄCA MODUŁ =====
window.openFamilyCaseModule = function(caseId, caseType) {
    console.log(`👨‍👩‍👧‍👦 Opening family module for case ${caseId}, type: ${caseType}`);
    
    const details = window.getFamilyCaseDetails(caseType);
    if (!details) {
        alert('⚠️ Nie znaleziono szczegółów dla tego typu sprawy.');
        return;
    }
    
    showFamilyModuleModal(caseId, caseType, details);
};

// ===== MODAL Z OPCJAMI MODUŁU =====
function showFamilyModuleModal(caseId, caseType, details) {
    const modal = document.createElement('div');
    modal.id = 'familyModuleModal';
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
                <button onclick="document.getElementById('familyModuleModal').remove()" style="
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
                ${getFamilyModuleOptions(caseId, caseType, details).map(option => `
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

// ===== OPCJE MODUŁU =====
function getFamilyModuleOptions(caseId, caseType, details) {
    const options = [
        {
            icon: '📝',
            title: 'Generator dokumentów',
            desc: 'Pozwy, wnioski, pisma procesowe',
            action: `window.openFamilyDocuments('${caseId}', '${caseType}')`
        },
        {
            icon: '🤖',
            title: 'Ankieta rodzinna',
            desc: 'Zbierz dane do sprawy',
            action: `window.openFamilyQuestionnaire('${caseId}', '${caseType}')`
        },
        {
            icon: '⚖️',
            title: 'Baza orzeczeń',
            desc: 'Wyroki sądów rodzinnych',
            action: `window.openFamilyJurisprudence('${caseId}', '${caseType}')`
        }
    ];
    
    // Specyficzne opcje dla alimentów
    if (caseType.includes('alimony') || caseType.includes('ALI')) {
        options.push({
            icon: '💰',
            title: 'Kalkulator alimentów',
            desc: 'Oblicz wysokość alimentów',
            action: `window.openAlimonyCalculator('${caseId}', '${caseType}')`
        });
    }
    
    // Specyficzne opcje dla władzy rodzicielskiej
    if (caseType.includes('custody') || caseType.includes('OPI')) {
        options.push({
            icon: '📅',
            title: 'Plan kontaktów',
            desc: 'Harmonogram z dzieckiem',
            action: `window.openContactSchedule('${caseId}', '${caseType}')`
        });
    }
    
    // Specyficzne opcje dla rozwodów
    if (caseType.includes('divorce') || caseType.includes('ROZ')) {
        options.push({
            icon: '💎',
            title: 'Podział majątku',
            desc: 'Kalkulator podziału',
            action: `window.openPropertyDivision('${caseId}', '${caseType}')`
        });
    }
    
    return options;
}

// ===== KALKULATOR ALIMENTÓW =====
window.openAlimonyCalculator = function(caseId, caseType) {
    const modal = document.createElement('div');
    modal.id = 'alimonyCalculatorModal';
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
        <div style="background: white; border-radius: 20px; padding: 40px; max-width: 700px; width: 90%;">
            <h2 style="margin: 0 0 20px 0; color: #3B82F6;">💰 Kalkulator alimentów</h2>
            
            <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3B82F6;">
                <strong>ℹ️ Uwaga:</strong> To jest szacunkowe wyliczenie. Sąd może orzec inaczej.
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Dochód zobowiązanego:</label>
                    <input type="number" id="obligorIncome" placeholder="0.00 zł" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Liczba dzieci:</label>
                    <input type="number" id="childrenCount" value="1" min="1" max="10" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px;">
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Miesięczne koszty dziecka:</label>
                <input type="number" id="childCosts" placeholder="0.00 zł" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px;">
                <small style="color: #666;">Wyżywienie, odzież, edukacja, leczenie, rozrywka</small>
            </div>
            
            <button onclick="calculateAlimony()" style="
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #3B82F6, #3B82F6);
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 1.1rem;
                font-weight: 700;
                cursor: pointer;
                margin-bottom: 20px;
            ">🧮 Oblicz alimenty</button>
            
            <div id="alimonyResult" style="display: none;">
                <div style="background: linear-gradient(135deg, #3B82F6, #3B82F6); color: white; padding: 20px; border-radius: 10px; margin-bottom: 15px;">
                    <div style="font-size: 0.9rem; opacity: 0.9;">Szacowane alimenty:</div>
                    <div style="font-size: 2rem; font-weight: 700;" id="alimonyAmount">0 zł</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;" id="perChild"></div>
                </div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <div style="font-size: 0.9rem; margin-bottom: 10px;" id="calculation"></div>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 10px;">
                        💡 Sąd uwzględni: możliwości zarobkowe, usprawiedliwione potrzeby dziecka, sytuację życiową obojga rodziców
                    </div>
                </div>
            </div>
            
            <button onclick="document.getElementById('alimonyCalculatorModal').remove()" style="
                width: 100%;
                padding: 12px;
                background: #3B82F6;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
            ">Zamknij</button>
        </div>
    `;
    
    document.body.appendChild(modal);
};

window.calculateAlimony = function() {
    const income = parseFloat(document.getElementById('obligorIncome').value) || 0;
    const childrenCount = parseInt(document.getElementById('childrenCount').value) || 1;
    const costs = parseFloat(document.getElementById('childCosts').value) || 0;
    
    if (income <= 0) {
        alert('⚠️ Wprowadź dochód zobowiązanego!');
        return;
    }
    
    // Metoda proporcjonalna - alimenty to połowa kosztów dziecka (oboje rodzice partycypują)
    let alimonyPerChild = costs / 2;
    
    // Ale nie więcej niż 25% dochodu na jedno dziecko (orientacyjnie)
    const maxPerChild = income * 0.25;
    if (alimonyPerChild > maxPerChild) {
        alimonyPerChild = maxPerChild;
    }
    
    // Minimalnie 300 zł na dziecko (orientacyjnie)
    if (alimonyPerChild < 300) {
        alimonyPerChild = 300;
    }
    
    const totalAlimony = alimonyPerChild * childrenCount;
    
    document.getElementById('alimonyAmount').textContent = totalAlimony.toFixed(2) + ' zł';
    document.getElementById('perChild').textContent = `${alimonyPerChild.toFixed(2)} zł na dziecko`;
    document.getElementById('calculation').innerHTML = `
        <strong>Podstawa wyliczenia:</strong><br>
        • Dochód zobowiązanego: ${income.toFixed(2)} zł<br>
        • Koszty dziecka: ${costs.toFixed(2)} zł<br>
        • Liczba dzieci: ${childrenCount}<br>
        • Alimenty na jedno: ~${alimonyPerChild.toFixed(2)} zł
    `;
    
    document.getElementById('alimonyResult').style.display = 'block';
};

// ===== POZOSTAŁE FUNKCJE =====
window.openFamilyDocuments = function(caseId, caseType) {
    alert(`📝 Generator dokumentów rodzinnych\n\n` +
          `Dostępne wzory:\n` +
          `• Pozew o rozwód\n` +
          `• Wniosek o alimenty\n` +
          `• Wniosek o władzę rodzicielską\n` +
          `• Wniosek o kontakty\n` +
          `• Odpowiedź na pozew\n\n` +
          `🚀 W przygotowaniu!`);
};

window.openFamilyQuestionnaire = function(caseId, caseType) {
    alert(`🤖 Ankieta rodzinna\n\n` +
          `System zbierze:\n` +
          `• Dane stron\n` +
          `• Dane dzieci\n` +
          `• Sytuacja mieszkaniowa\n` +
          `• Dochody\n` +
          `• Historia małżeństwa\n\n` +
          `🚀 W przygotowaniu!`);
};

window.openFamilyJurisprudence = function(caseId, caseType) {
    alert(`⚖️ Baza orzeczeń sądów rodzinnych\n\n` +
          `Przeszukamy:\n` +
          `• Sądy okręgowe - wydziały rodzinne\n` +
          `• Sąd Najwyższy\n` +
          `• Sądy apelacyjne\n\n` +
          `🚀 W przygotowaniu!`);
};

window.openContactSchedule = function(caseId, caseType) {
    alert(`📅 Plan kontaktów z dzieckiem\n\n` +
          `Ustal harmonogram:\n` +
          `• Weekendy\n` +
          `• Wakacje\n` +
          `• Święta\n` +
          `• Ferie\n` +
          `• Odbiór ze szkoły/przedszkola\n\n` +
          `🚀 W przygotowaniu!`);
};

window.openPropertyDivision = function(caseId, caseType) {
    alert(`💎 Podział majątku małżeńskiego\n\n` +
          `System pomoże:\n` +
          `• Ustalić wspólność majątkową\n` +
          `• Wycenić majątek\n` +
          `• Podzielić 50/50\n` +
          `• Ustalić spłaty\n` +
          `• Przygotować wniosek\n\n` +
          `🚀 W przygotowaniu!`);
};

console.log('✅ Family Cases Module - All functions loaded!');
