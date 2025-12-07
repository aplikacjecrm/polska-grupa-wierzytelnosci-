// ==========================================
// MODUŁ SCENARIUSZY
// ==========================================

console.log('🔀 Ładuję moduł scenariuszy...');

if (!window.isModuleEnabled || !window.isModuleEnabled('scenarios')) {
    console.warn('⚠️ Moduł scenariuszy jest wyłączony');
} else {

// === RENDEROWANIE ZAKŁADKI ===

window.renderScenariosTab = async function(caseId) {
    console.log('🔀 Renderuję zakładkę scenariuszy dla sprawy:', caseId);
    
    try {
        const response = await window.api.request(`/scenarios/case/${caseId}`);
        const scenarios = response.scenarios || [];
        
        // Oblicz statystyki
        const stats = {
            total: scenarios.length,
            active: scenarios.filter(s => s.status === 'active').length,
            avgProbability: scenarios.length > 0 ? Math.round(scenarios.reduce((sum, s) => sum + (s.probability || 0), 0) / scenarios.length) : 0,
            totalCosts: scenarios.reduce((sum, s) => sum + (parseFloat(s.estimated_costs) || 0), 0)
        };
        
        return `
            <div style="padding: 20px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100%;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <div>
                        <h2 style="margin: 0 0 8px 0; color: #1a2332 !important; font-size: 1.8rem;">🔀 Scenariusze sprawy</h2>
                        <p style="margin: 0; color: #666 !important; font-size: 0.95rem;">Zarządzaj możliwymi ścieżkami rozwoju sprawy</p>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        ${scenarios.length > 1 ? `
                            <button onclick="scenariosModule.showComparison(${caseId})" style="padding: 12px 24px; background: white; color: #3B82F6; border: 2px solid #3B82F6; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 1rem; transition: all 0.3s; box-shadow: 0 2px 8px rgba(59,130,246,0.2);"
                                onmouseover="this.style.background='#3B82F6'; this.style.color='white'"
                                onmouseout="this.style.background='white'; this.style.color='#3B82F6'">
                                📊 Porównaj scenariusze
                            </button>
                        ` : ''}
                        <button onclick="scenariosModule.showAddForm(${caseId})" style="padding: 12px 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 15px rgba(102,126,234,0.3); transition: transform 0.2s;"
                            onmouseover="this.style.transform='translateY(-2px)'"
                            onmouseout="this.style.transform='translateY(0)'">
                            ➕ Nowy scenariusz
                        </button>
                    </div>
                </div>
                
                <!-- Statystyki -->
                ${scenarios.length > 0 ? `
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
                        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #3B82F6;">
                            <div style="font-size: 0.85rem; color: #666 !important; margin-bottom: 8px; font-weight: 600;">Łącznie scenariuszy</div>
                            <div style="font-size: 2rem; font-weight: 700; color: #1a2332 !important;">${stats.total}</div>
                        </div>
                        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #10b981;">
                            <div style="font-size: 0.85rem; color: #666 !important; margin-bottom: 8px; font-weight: 600;">Aktywne</div>
                            <div style="font-size: 2rem; font-weight: 700; color: #10b981 !important;">${stats.active}</div>
                        </div>
                        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #f59e0b;">
                            <div style="font-size: 0.85rem; color: #666 !important; margin-bottom: 8px; font-weight: 600;">Średnie prawdopodobieństwo</div>
                            <div style="font-size: 2rem; font-weight: 700; color: #f59e0b !important;">${stats.avgProbability}%</div>
                        </div>
                        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #8b5cf6;">
                            <div style="font-size: 0.85rem; color: #666 !important; margin-bottom: 8px; font-weight: 600;">Łączne koszty</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: #8b5cf6 !important;">${stats.totalCosts.toLocaleString('pl-PL')} PLN</div>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Lista scenariuszy -->
                
                ${scenarios.length === 0 ? `
                    <div style="text-align: center; padding: 60px 20px; background: #f9f9f9; border-radius: 12px;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">🔀</div>
                        <p style="color: #666 !important; font-size: 1.1rem; font-weight: 600;">Brak scenariuszy</p>
                    </div>
                ` : `
                    <div style="display: grid; gap: 15px;">
                        ${scenarios.map(s => `
                            <div style="background: white; border: 2px solid ${s.status === 'active' ? '#3B82F6' : '#e0e0e0'}; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                                    <div style="flex: 1;">
                                        <h4 style="margin: 0 0 8px 0; color: #1a2332 !important; font-size: 1.2rem;">${s.scenario_name}</h4>
                                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                            <span style="padding: 4px 10px; background: ${s.status === 'active' ? '#3B82F6' : s.status === 'draft' ? '#95a5a6' : '#3B82F6'}; color: white; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
                                                ${s.status === 'active' ? '✓ Aktywny' : s.status === 'draft' ? '📝 Szkic' : s.status === 'completed' ? '✓ Ukończony' : '❌ Porzucony'}
                                            </span>
                                            <span style="padding: 4px 10px; background: #f0f0f0; color: #666; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
                                                Szansa: ${s.probability}%
                                            </span>
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-size: 2rem; font-weight: 700; color: ${s.probability >= 70 ? '#3B82F6' : s.probability >= 40 ? '#3B82F6' : '#3B82F6'};">
                                            ${s.probability}%
                                        </div>
                                        <div style="font-size: 0.75rem; color: #999;">prawdopodobieństwo</div>
                                    </div>
                                </div>
                                
                                ${s.description ? `<p style="color: #666 !important; margin: 12px 0;">${s.description}</p>` : ''}
                                
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 15px 0; padding: 15px; background: #f9f9f9; border-radius: 8px;">
                                    ${s.estimated_costs ? `
                                        <div>
                                            <div style="font-size: 0.75rem; color: #999 !important; margin-bottom: 4px;">💰 Szacunkowe koszty</div>
                                            <div style="font-weight: 700; color: #1a2332 !important;">${parseFloat(s.estimated_costs).toLocaleString('pl-PL')} PLN</div>
                                        </div>
                                    ` : ''}
                                    ${s.estimated_duration_days ? `
                                        <div>
                                            <div style="font-size: 0.75rem; color: #999 !important; margin-bottom: 4px;">⏱️ Czas trwania</div>
                                            <div style="font-weight: 700; color: #1a2332 !important;">${s.estimated_duration_days} dni</div>
                                        </div>
                                    ` : ''}
                                    ${s.steps_count > 0 ? `
                                        <div>
                                            <div style="font-size: 0.75rem; color: #999 !important; margin-bottom: 4px;">📋 Postęp kroków</div>
                                            <div style="font-weight: 700; color: #1a2332 !important;">${s.completed_steps}/${s.steps_count}</div>
                                        </div>
                                    ` : ''}
                                </div>
                                
                                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                                    <button onclick="scenariosModule.viewDetails(${s.id})" style="padding: 8px 16px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 600;">
                                        👁️ Szczegóły
                                    </button>
                                    ${s.status !== 'active' ? `
                                        <button onclick="scenariosModule.activate(${s.id}, ${caseId})" style="padding: 8px 16px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 600;">
                                            ✓ Aktywuj
                                        </button>
                                    ` : ''}
                                    <button onclick="if(confirm('Na pewno usunąć?')) scenariosModule.delete(${s.id}, ${caseId})" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 600;">
                                        🗑️ Usuń
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    } catch (error) {
        console.error('❌ Błąd ładowania scenariuszy:', error);
        return `<div style="padding: 40px; text-align: center; color: #dc3545;">❌ Błąd ładowania</div>`;
    }
};

// === MODUŁ SCENARIUSZY - FUNKCJE ===

window.scenariosModule = {
    
    showAddForm: function(caseId) {
        const modal = document.createElement('div');
        modal.id = 'addScenarioModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.7); z-index: 10001; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(4px);';
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 20px; padding: 0; max-width: 900px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 25px; border-radius: 20px 20px 0 0; color: white; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 1;">
                    <div>
                        <h3 style="margin: 0 0 5px 0; font-size: 1.6rem;">🔀 Nowy scenariusz</h3>
                        <p style="margin: 0; opacity: 0.9; font-size: 0.95rem;">Zaplanuj możliwą ścieżkę rozwoju sprawy</p>
                    </div>
                    <button onclick="document.getElementById('addScenarioModal').remove()" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.8rem; transition: all 0.2s;"
                        onmouseover="this.style.background='white'; this.style.color='#667eea'"
                        onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.color='white'">×</button>
                </div>
                <div style="padding: 30px; display: grid; gap: 20px;">
                    <!-- Podstawowe informacje -->
                    <div style="background: #f9fafb; padding: 20px; border-radius: 12px;">
                        <h4 style="margin: 0 0 15px 0; color: #1a2332; font-size: 1.2rem;">📋 Podstawowe informacje</h4>
                        <div style="display: grid; gap: 15px;">
                            <div>
                                <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Nazwa scenariusza *</label>
                                <input type="text" id="scenarioName" placeholder="np. Plan A: Ugoda sądowa" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s;"
                                    onfocus="this.style.borderColor='#667eea'"
                                    onblur="this.style.borderColor='#e5e7eb'">
                            </div>
                            <div>
                                <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Typ scenariusza</label>
                                <select id="scenarioType" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem;">
                                    <option value="primary">Główny</option>
                                    <option value="alternative">Alternatywny</option>
                                    <option value="fallback">Awaryjny</option>
                                    <option value="optimal">Optymalny</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Opis scenariusza</label>
                                <textarea id="scenarioDesc" placeholder="Opisz szczegółowo ten scenariusz..." style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; min-height: 100px; resize: vertical;"
                                    onfocus="this.style.borderColor='#667eea'"
                                    onblur="this.style.borderColor='#e5e7eb'"></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Analiza -->
                    <div style="background: #eff6ff; padding: 20px; border-radius: 12px;">
                        <h4 style="margin: 0 0 15px 0; color: #1a2332; font-size: 1.2rem;">📊 Analiza i prognozy</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Prawdopodobieństwo (%)</label>
                                <input type="number" id="scenarioProbability" min="0" max="100" value="50" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem;">
                            </div>
                            <div>
                                <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Szacunkowe koszty (PLN)</label>
                                <input type="number" id="scenarioCosts" placeholder="0" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem;">
                            </div>
                            <div>
                                <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Czas trwania (dni)</label>
                                <input type="number" id="scenarioDuration" placeholder="0" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem;">
                            </div>
                        </div>
                        <div style="margin-top: 15px;">
                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Oczekiwany rezultat</label>
                            <textarea id="scenarioOutcome" placeholder="Opisz oczekiwany rezultat tego scenariusza..." style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; min-height: 80px; resize: vertical;"></textarea>
                        </div>
                    </div>
                    
                    <!-- Ryzyka i korzyści -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div style="background: #fef2f2; padding: 20px; border-radius: 12px;">
                            <h4 style="margin: 0 0 15px 0; color: #ef4444; font-size: 1.2rem;">⚠️ Ryzyka</h4>
                            <textarea id="scenarioRisks" placeholder="Wymień potencjalne ryzyka..." style="width: 100%; padding: 12px; border: 2px solid #fecaca; border-radius: 8px; font-size: 1rem; min-height: 120px; resize: vertical;"></textarea>
                        </div>
                        <div style="background: #f0fdf4; padding: 20px; border-radius: 12px;">
                            <h4 style="margin: 0 0 15px 0; color: #10b981; font-size: 1.2rem;">✓ Korzyści</h4>
                            <textarea id="scenarioAdvantages" placeholder="Wymień korzyści i zalety..." style="width: 100%; padding: 12px; border: 2px solid #bbf7d0; border-radius: 8px; font-size: 1rem; min-height: 120px; resize: vertical;"></textarea>
                        </div>
                    </div>
                    
                    <!-- Wymagania -->
                    <div style="background: #fef3c7; padding: 20px; border-radius: 12px;">
                        <h4 style="margin: 0 0 15px 0; color: #f59e0b; font-size: 1.2rem;">📌 Wymagania i warunki</h4>
                        <textarea id="scenarioRequirements" placeholder="Co jest wymagane do realizacji tego scenariusza?" style="width: 100%; padding: 12px; border: 2px solid #fde68a; border-radius: 8px; font-size: 1rem; min-height: 100px; resize: vertical;"></textarea>
                    </div>
                    
                    <!-- Przyciski -->
                    <div style="display: flex; gap: 12px; margin-top: 10px;">
                        <button onclick="document.getElementById('addScenarioModal').remove()" style="flex: 1; padding: 16px; background: #6b7280; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 1rem; transition: all 0.2s;"
                            onmouseover="this.style.background='#4b5563'"
                            onmouseout="this.style.background='#6b7280'">Anuluj</button>
                        <button onclick="scenariosModule.save(${caseId})" style="flex: 2; padding: 16px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 15px rgba(102,126,234,0.3); transition: all 0.2s;"
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102,126,234,0.4)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(102,126,234,0.3)'">✓ Dodaj scenariusz</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    save: async function(caseId) {
        const name = document.getElementById('scenarioName').value.trim();
        const type = document.getElementById('scenarioType').value;
        const description = document.getElementById('scenarioDesc').value.trim();
        const probability = parseInt(document.getElementById('scenarioProbability').value);
        const costs = document.getElementById('scenarioCosts').value;
        const duration = document.getElementById('scenarioDuration').value;
        const outcome = document.getElementById('scenarioOutcome').value.trim();
        const risks = document.getElementById('scenarioRisks').value.trim();
        const advantages = document.getElementById('scenarioAdvantages').value.trim();
        const requirements = document.getElementById('scenarioRequirements').value.trim();
        
        if (!name) {
            alert('Podaj nazwę scenariusza!');
            return;
        }
        
        try {
            await window.api.request('/scenarios', {
                method: 'POST',
                body: JSON.stringify({
                    case_id: caseId,
                    scenario_name: name,
                    scenario_type: type,
                    description: description,
                    probability: probability,
                    estimated_costs: costs,
                    estimated_duration_days: duration,
                    estimated_outcome: outcome,
                    risks: risks,
                    advantages: advantages,
                    requirements: requirements
                })
            });
            
            alert('✅ Dodano scenariusz!');
            
            if (window.eventBus) {
                window.eventBus.emit('scenario:created', { caseId });
            }
            
            document.getElementById('addScenarioModal').remove();
            window.crmManager.switchCaseTab(caseId, 'scenarios');
            
        } catch (error) {
            console.error('❌ Błąd:', error);
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    viewDetails: async function(scenarioId, caseId) {
        try {
            const response = await window.api.request(`/scenarios/${scenarioId}`);
            const scenario = response.scenario;
            
            scenariosModule.showDetailsModal(scenario, caseId);
        } catch (error) {
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    showDetailsModal: function(scenario, caseId) {
        const modal = document.createElement('div');
        modal.id = 'scenarioDetailsModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.7); z-index: 10001; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(4px);';
        
        const completionRate = scenario.steps && scenario.steps.length > 0 ? 
            Math.round((scenario.steps.filter(s => s.status === 'completed').length / scenario.steps.length) * 100) : 0;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 20px; padding: 0; max-width: 1000px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 25px; border-radius: 20px 20px 0 0; color: white; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 1;">
                    <div>
                        <h3 style="margin: 0 0 5px 0; font-size: 1.8rem;">${window.crmManager.escapeHtml(scenario.scenario_name)}</h3>
                        <p style="margin: 0; opacity: 0.9;">Szczegóły scenariusza i kroki realizacji</p>
                    </div>
                    <button onclick="document.getElementById('scenarioDetailsModal').remove()" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.8rem;">×</button>
                </div>
                
                <div style="padding: 30px;">
                    <!-- Kroki scenariusza -->
                    <div style="margin-bottom: 30px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h4 style="margin: 0; font-size: 1.4rem; color: #1a2332;">📋 Kroki realizacji</h4>
                            <button onclick="scenariosModule.showAddStepForm(${scenario.id}, ${caseId})" style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                + Dodaj krok
                            </button>
                        </div>
                        
                        ${scenario.steps && scenario.steps.length > 0 ? `
                            <div style="margin-bottom: 20px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="font-size: 0.9rem; color: #666; font-weight: 600;">Postęp: ${scenario.steps.filter(s => s.status === 'completed').length}/${scenario.steps.length}</span>
                                    <span style="font-size: 0.9rem; color: #666; font-weight: 700;">${completionRate}%</span>
                                </div>
                                <div style="width: 100%; height: 12px; background: #e5e7eb; border-radius: 10px; overflow: hidden;">
                                    <div style="width: ${completionRate}%; height: 100%; background: linear-gradient(90deg, #10b981, #059669); transition: width 0.3s;"></div>
                                </div>
                            </div>
                            
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                ${scenario.steps.map((step, idx) => `
                                    <div style="background: ${step.status === 'completed' ? '#f0fdf4' : '#f9fafb'}; border: 2px solid ${step.status === 'completed' ? '#10b981' : '#e5e7eb'}; border-radius: 12px; padding: 16px; display: flex; gap: 15px; align-items: start;">
                                        <div style="flex-shrink: 0;">
                                            <input type="checkbox" ${step.status === 'completed' ? 'checked' : ''} 
                                                onchange="scenariosModule.toggleStep(${scenario.id}, ${step.id}, ${caseId})"
                                                style="width: 24px; height: 24px; cursor: pointer; accent-color: #10b981;">
                                        </div>
                                        <div style="flex: 1;">
                                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                                <div>
                                                    <div style="font-weight: 700; color: #1a2332; font-size: 1.05rem; margin-bottom: 4px;">
                                                        ${idx + 1}. ${window.crmManager.escapeHtml(step.step_title)}
                                                    </div>
                                                    ${step.step_description ? `
                                                        <div style="color: #666; font-size: 0.9rem; line-height: 1.5;">
                                                            ${window.crmManager.escapeHtml(step.step_description)}
                                                        </div>
                                                    ` : ''}
                                                </div>
                                                <button onclick="if(confirm('Usunąć krok?')) scenariosModule.deleteStep(${scenario.id}, ${step.id}, ${caseId})" 
                                                    style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                                                    🗑️
                                                </button>
                                            </div>
                                            <div style="display: flex; gap: 15px; font-size: 0.85rem; color: #666;">
                                                ${step.responsible_person ? `<span>👤 ${window.crmManager.escapeHtml(step.responsible_person)}</span>` : ''}
                                                ${step.deadline ? `<span>📅 ${new Date(step.deadline).toLocaleDateString('pl-PL')}</span>` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div style="text-align: center; padding: 40px; background: #f9fafb; border-radius: 12px; border: 2px dashed #e5e7eb;">
                                <div style="font-size: 2.5rem; margin-bottom: 12px; opacity: 0.5;">📋</div>
                                <p style="color: #999; margin: 0;">Brak kroków. Dodaj pierwszy krok realizacji scenariusza.</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    showAddStepForm: function(scenarioId, caseId) {
        const modal = document.createElement('div');
        modal.id = 'addStepModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.8); z-index: 10002; display: flex; justify-content: center; align-items: center;';
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 0; max-width: 600px; width: 90%;">
                <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 20px; border-radius: 16px 16px 0 0; color: white; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0;">➕ Nowy krok</h3>
                    <button onclick="document.getElementById('addStepModal').remove()" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 1.5rem;">×</button>
                </div>
                <div style="padding: 25px; display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Tytuł kroku *</label>
                        <input type="text" id="stepTitle" placeholder="np. Złożenie pozwu" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Opis</label>
                        <textarea id="stepDesc" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; min-height: 80px;"></textarea>
                    </div>
                    <div>
                        <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Osoba odpowiedzialna</label>
                        <input type="text" id="stepResponsible" placeholder="Imię i nazwisko" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Termin</label>
                        <input type="date" id="stepDeadline" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button onclick="document.getElementById('addStepModal').remove()" style="flex: 1; padding: 14px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700;">Anuluj</button>
                        <button onclick="scenariosModule.saveStep(${scenarioId}, ${caseId})" style="flex: 2; padding: 14px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700;">✓ Dodaj krok</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    saveStep: async function(scenarioId, caseId) {
        const title = document.getElementById('stepTitle').value.trim();
        const description = document.getElementById('stepDesc').value.trim();
        const responsible = document.getElementById('stepResponsible').value.trim();
        const deadline = document.getElementById('stepDeadline').value;
        
        if (!title) {
            alert('Podaj tytuł kroku!');
            return;
        }
        
        try {
            await window.api.request(`/scenarios/${scenarioId}/steps`, {
                method: 'POST',
                body: JSON.stringify({
                    step_title: title,
                    step_description: description,
                    responsible_person: responsible,
                    deadline: deadline
                })
            });
            
            alert('✅ Dodano krok!');
            document.getElementById('addStepModal').remove();
            
            // Odśwież widok szczegółów
            scenariosModule.viewDetails(scenarioId, caseId);
        } catch (error) {
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    toggleStep: async function(scenarioId, stepId, caseId) {
        try {
            await window.api.request(`/scenarios/${scenarioId}/steps/${stepId}/toggle`, {
                method: 'POST'
            });
            
            // Odśwież widok
            scenariosModule.viewDetails(scenarioId, caseId);
        } catch (error) {
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    deleteStep: async function(scenarioId, stepId, caseId) {
        try {
            await window.api.request(`/scenarios/${scenarioId}/steps/${stepId}`, {
                method: 'DELETE'
            });
            
            alert('✅ Usunięto krok!');
            scenariosModule.viewDetails(scenarioId, caseId);
        } catch (error) {
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    showComparison: async function(caseId) {
        try {
            const response = await window.api.request(`/scenarios/compare/case/${caseId}`);
            scenariosModule.showComparisonModal(response, caseId);
        } catch (error) {
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    showComparisonModal: function(data, caseId) {
        const modal = document.createElement('div');
        modal.id = 'comparisonModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.7); z-index: 10001; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(4px);';
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 20px; padding: 0; max-width: 1200px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 25px; border-radius: 20px 20px 0 0; color: white; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 1;">
                    <div>
                        <h3 style="margin: 0 0 5px 0; font-size: 1.8rem;">📊 Porównanie scenariuszy</h3>
                        <p style="margin: 0; opacity: 0.9;">Analiza wszystkich możliwych ścieżek</p>
                    </div>
                    <button onclick="document.getElementById('comparisonModal').remove()" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.8rem;">×</button>
                </div>
                
                <div style="padding: 30px;">
                    <!-- Podsumowanie -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
                        <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 20px; border-radius: 12px; color: white; text-align: center;">
                            <div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 8px;">Scenariuszy</div>
                            <div style="font-size: 2.5rem; font-weight: 700;">${data.summary.total_scenarios}</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; border-radius: 12px; color: white; text-align: center;">
                            <div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 8px;">Śr. prawdopodobieństwo</div>
                            <div style="font-size: 2.5rem; font-weight: 700;">${data.summary.avg_probability}%</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 20px; border-radius: 12px; color: white; text-align: center;">
                            <div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 8px;">Łączne koszty</div>
                            <div style="font-size: 1.8rem; font-weight: 700;">${data.summary.total_estimated_costs.toLocaleString('pl-PL')} PLN</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 12px; color: white; text-align: center;">
                            <div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 8px;">Śr. czas trwania</div>
                            <div style="font-size: 2.5rem; font-weight: 700;">${data.summary.avg_duration} <span style="font-size: 1.2rem;">dni</span></div>
                        </div>
                    </div>
                    
                    <!-- Tabela porównawcza -->
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <thead>
                                <tr style="background: linear-gradient(135deg, #f3f4f6, #e5e7eb);">
                                    <th style="padding: 15px; text-align: left; font-weight: 700; color: #1a2332; border-bottom: 2px solid #d1d5db;">Scenariusz</th>
                                    <th style="padding: 15px; text-align: center; font-weight: 700; color: #1a2332; border-bottom: 2px solid #d1d5db;">Status</th>
                                    <th style="padding: 15px; text-align: center; font-weight: 700; color: #1a2332; border-bottom: 2px solid #d1d5db;">Prawdopodobieństwo</th>
                                    <th style="padding: 15px; text-align: center; font-weight: 700; color: #1a2332; border-bottom: 2px solid #d1d5db;">Koszty</th>
                                    <th style="padding: 15px; text-align: center; font-weight: 700; color: #1a2332; border-bottom: 2px solid #d1d5db;">Czas</th>
                                    <th style="padding: 15px; text-align: center; font-weight: 700; color: #1a2332; border-bottom: 2px solid #d1d5db;">Postęp</th>
                                    <th style="padding: 15px; text-align: center; font-weight: 700; color: #1a2332; border-bottom: 2px solid #d1d5db;">Ryzyko</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.scenarios.map((s, idx) => `
                                    <tr style="border-bottom: 1px solid #f3f4f6; ${idx % 2 === 0 ? 'background: #fafafa;' : ''}">
                                        <td style="padding: 15px; font-weight: 600; color: #1a2332;">${window.crmManager.escapeHtml(s.scenario_name)}</td>
                                        <td style="padding: 15px; text-align: center;">
                                            <span style="padding: 4px 12px; background: ${s.status === 'active' ? '#10b981' : '#6b7280'}; color: white; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">
                                                ${s.status === 'active' ? '✓ Aktywny' : s.status}
                                            </span>
                                        </td>
                                        <td style="padding: 15px; text-align: center;">
                                            <div style="font-size: 1.3rem; font-weight: 700; color: ${s.probability >= 70 ? '#10b981' : s.probability >= 40 ? '#f59e0b' : '#ef4444'};">
                                                ${s.probability}%
                                            </div>
                                        </td>
                                        <td style="padding: 15px; text-align: center; font-weight: 600;">
                                            ${s.estimated_costs ? parseFloat(s.estimated_costs).toLocaleString('pl-PL') + ' PLN' : '-'}
                                        </td>
                                        <td style="padding: 15px; text-align: center; font-weight: 600;">
                                            ${s.estimated_duration_days || '-'} ${s.estimated_duration_days ? 'dni' : ''}
                                        </td>
                                        <td style="padding: 15px; text-align: center;">
                                            <div style="font-weight: 700; color: #1a2332; margin-bottom: 4px;">${s.completion_rate}%</div>
                                            <div style="width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
                                                <div style="width: ${s.completion_rate}%; height: 100%; background: #10b981;"></div>
                                            </div>
                                        </td>
                                        <td style="padding: 15px; text-align: center;">
                                            <span style="padding: 4px 12px; background: ${s.risk_level === 'low' ? '#10b981' : s.risk_level === 'medium' ? '#f59e0b' : '#ef4444'}; color: white; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">
                                                ${s.risk_level === 'low' ? 'Niskie' : s.risk_level === 'medium' ? 'Średnie' : 'Wysokie'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    editScenario: function(scenarioId, caseId) {
        alert('Edycja scenariusza w budowie!');
    },
    
    activate: async function(scenarioId, caseId) {
        try {
            await window.api.request(`/scenarios/${scenarioId}/activate`, { method: 'POST' });
            alert('✅ Aktywowano scenariusz!');
            
            if (window.eventBus) {
                window.eventBus.emit('scenario:activated', { scenarioId });
            }
            
            window.crmManager.switchCaseTab(caseId, 'scenarios');
        } catch (error) {
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    delete: async function(scenarioId, caseId) {
        try {
            await window.api.request(`/scenarios/${scenarioId}`, { method: 'DELETE' });
            alert('✅ Usunięto!');
            window.crmManager.switchCaseTab(caseId, 'scenarios');
        } catch (error) {
            alert('❌ Błąd: ' + error.message);
        }
    }
};

console.log('✅ Moduł scenariuszy załadowany');

} // Koniec sprawdzania czy moduł włączony
