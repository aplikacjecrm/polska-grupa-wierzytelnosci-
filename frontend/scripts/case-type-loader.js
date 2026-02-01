// ==========================================
// ŁADOWANIE TYPÓW SPRAW DO FORMULARZA
// ==========================================

console.log('📋 Case Type Loader v1.0 - Loading...');

// Funkcja ładująca opcje do selecta (globalna, żeby można było wywołać z zewnątrz)
window.loadCaseTypeOptions = function() {
    const select = document.getElementById('caseType');
    if (!select) {
        console.warn('⚠️ Select #caseType nie znaleziony');
        return;
    }
    
    if (!window.caseTypeConfig) {
        console.error('❌ window.caseTypeConfig nie został załadowany!');
        return;
    }
    
    // Wyczyść istniejące opcje (zostaw tylko placeholder)
    const placeholder = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (placeholder) {
        select.appendChild(placeholder);
    } else {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'Wybierz...';
        select.appendChild(opt);
    }
    
    // Dodaj grupy z podtypami
    window.caseTypeConfig.typeGroups.forEach(group => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = group.label;
        
        group.subtypes.forEach(subtype => {
            const option = document.createElement('option');
            option.value = subtype.value;
            option.textContent = `${subtype.label} (${subtype.prefix})`;
            option.dataset.mainType = group.mainType;
            option.dataset.prefix = subtype.prefix;
            optgroup.appendChild(option);
        });
        
        select.appendChild(optgroup);
    });
    
    console.log('✅ Załadowano typy spraw do selecta');
}

// Nadpisz istniejącą funkcję generateCaseNumber
if (window.crmManager) {
    const originalGenerateCaseNumber = window.crmManager.generateCaseNumber;
    
    window.crmManager.generateCaseNumber = async function() {
        const clientId = document.getElementById('caseClientId')?.value;
        const caseSubtype = document.getElementById('caseType')?.value; // To jest SUBTYPE teraz!
        const caseNumberInput = document.getElementById('caseNumber');
        
        console.log('🔢 Generowanie numeru sprawy...');
        console.log('  Klient ID:', clientId);
        console.log('  Case Subtype:', caseSubtype);
        
        if (!clientId || !caseSubtype) {
            if (caseNumberInput) {
                caseNumberInput.value = '';
                caseNumberInput.placeholder = 'Wybierz klienta i typ sprawy';
            }
            return;
        }
        
        try {
            // Wywołaj API z case_subtype
            const response = await window.api.request(`/cases/generate-number/${clientId}/${caseSubtype}`);
            
            if (response.caseNumber) {
                caseNumberInput.value = response.caseNumber;
                caseNumberInput.style.background = '#d4edda';
                
                // Pobierz główny typ dla tego podtypu
                const mainType = window.getMainTypeFromSubtype(caseSubtype);
                console.log('✅ Wygenerowano numer:', response.caseNumber);
                console.log('  Subtype:', caseSubtype, '→ Main Type:', mainType);
                
                // Zapisz main_type jako ukryty atrybut
                caseNumberInput.dataset.mainType = mainType;
                caseNumberInput.dataset.subtype = caseSubtype;
            }
        } catch (error) {
            console.error('❌ Błąd generowania numeru:', error);
            caseNumberInput.value = '';
            caseNumberInput.placeholder = 'Błąd generowania';
            caseNumberInput.style.background = '#f8d7da';
        }
    };
    
    console.log('✅ Nadpisano crmManager.generateCaseNumber()');
}

// Nadpisz funkcję zapisu sprawy (z index.html)
document.addEventListener('DOMContentLoaded', () => {
    const caseForm = document.getElementById('caseForm');
    if (caseForm && !caseForm.dataset.listenerAdded) {
        caseForm.dataset.listenerAdded = 'true'; // Zapobiega duplikatom
        caseForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const caseId = document.getElementById('caseId')?.value;
            const isEdit = caseId && caseId !== '';
            
            const caseNumberInput = document.getElementById('caseNumber');
            const caseSubtype = document.getElementById('caseType')?.value;
            const mainType = caseNumberInput?.dataset.mainType || window.getMainTypeFromSubtype(caseSubtype);
            
            const caseData = {
                client_id: document.getElementById('caseClientId')?.value,
                case_number: caseNumberInput?.value,
                title: document.getElementById('caseTitle')?.value,
                description: document.getElementById('caseDescription')?.value,
                case_type: mainType, // GŁÓWNY TYP (civil, criminal, etc.)
                case_subtype: caseSubtype, // PODTYP (compensation, contract, etc.)
                priority: document.getElementById('casePriority')?.value,
                court_name: document.getElementById('caseCourtName')?.value,
                court_signature: document.getElementById('caseCourtSignature')?.value,
                opposing_party: document.getElementById('caseOpposingParty')?.value,
                value_amount: document.getElementById('caseValue')?.value,
                assigned_to: document.getElementById('caseAssignedTo')?.value || null
            };
            
            console.log('💾 Zapisywanie sprawy:', caseData);
            
            try {
                let response;
                if (isEdit) {
                    response = await window.api.request(`/cases/${caseId}`, {
                        method: 'PUT',
                        body: JSON.stringify(caseData)
                    });
                } else {
                    response = await window.api.request('/cases', {
                        method: 'POST',
                        body: JSON.stringify(caseData)
                    });
                }
                
                if (response.success) {
                    console.log('✅ Sprawa zapisana!');
                    const savedCaseId = response.caseId || caseId;
                    
                    // Upload plików jeśli są
                    const filesInput = document.getElementById('caseFiles');
                    if (filesInput && filesInput.files.length > 0 && savedCaseId) {
                        console.log(`📎 Uploading ${filesInput.files.length} plików do sprawy ${savedCaseId}...`);
                        
                        for (const file of filesInput.files) {
                            try {
                                const fileFormData = new FormData();
                                fileFormData.append('file', file);
                                fileFormData.append('title', file.name);
                                fileFormData.append('category', 'case_document');
                                fileFormData.append('description', `Dokument sprawy: ${file.name}`);
                                
                                const token = localStorage.getItem('token');
                                const uploadResponse = await fetch(`http://localhost:3500/api/cases/${savedCaseId}/documents`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: fileFormData
                                });
                                
                                if (uploadResponse.ok) {
                                    console.log(`✅ Plik dodany: ${file.name}`);
                                } else {
                                    console.error(`❌ Błąd uploadu: ${file.name}`);
                                }
                            } catch (error) {
                                console.error('❌ Błąd uploadu pliku:', file.name, error);
                            }
                        }
                    }
                    
                    // Zamknij modal
                    document.getElementById('caseModal')?.classList.remove('active');
                    
                    // Odśwież listę spraw
                    if (window.crmManager && window.crmManager.loadCases) {
                        await window.crmManager.loadCases();
                    }
                    
                    // Pokaż notyfikację
                    if (window.crmManager && window.crmManager.customAlert) {
                        await window.crmManager.customAlert(
                            isEdit ? 'Sprawa zaktualizowana!' : 'Sprawa dodana!',
                            'success'
                        );
                    }
                } else {
                    throw new Error(response.error || 'Błąd zapisu');
                }
            } catch (error) {
                console.error('❌ Błąd zapisu sprawy:', error);
                if (window.crmManager && window.crmManager.customAlert) {
                    await window.crmManager.customAlert('Błąd zapisu: ' + error.message, 'error');
                } else {
                    alert('Błąd zapisu: ' + error.message);
                }
            }
        });
        
        console.log('✅ Dodano listener do formularza sprawy');
    }
});

console.log('✅ Case Type Loader v1.0 - Ready!');
