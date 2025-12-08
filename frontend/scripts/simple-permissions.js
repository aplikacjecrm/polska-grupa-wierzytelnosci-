// PROSTY handler uprawnień - BEZ modułów, BEZ zależności
window.showPermissionsSimple = async function(caseId) {
    console.log('SIMPLE PERMISSIONS: START dla sprawy', caseId);
    
    const container = document.getElementById('caseTabContent');
    if (!container) {
        alert('Błąd: Nie znaleziono kontenera');
        return;
    }
    
    container.innerHTML = `
        <div style="padding: 40px; background: linear-gradient(135deg, #3B82F6, #1E40AF); border-radius: 20px; color: white;">
            <h2 style="margin: 0 0 30px 0; font-size: 2rem;">🔐 Zarządzanie dostępem do sprawy #${caseId}</h2>
            
            <div style="background: white; padding: 30px; border-radius: 15px; color: #333;">
                <button onclick="window.grantAccessSimple(${caseId})" style="
                    padding: 15px 30px;
                    background: #3B82F6;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1.2rem;
                    cursor: pointer;
                    font-weight: bold;
                ">➕ Nadaj dostęp</button>
                
                <div id="permissionsList" style="margin-top: 30px;">
                    <h3>📋 Lista uprawnień</h3>
                    <p>Ładowanie...</p>
                </div>
            </div>
        </div>
    `;
    
    // Załaduj listę
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://web-production-ef868.up.railway.app/api/case-permissions/${caseId}/list`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        const list = document.getElementById('permissionsList');
        if (data.permissions && data.permissions.length > 0) {
            list.innerHTML = '<h3>📋 Lista uprawnień</h3>' + 
                data.permissions.map(p => `
                    <div style="padding: 15px; background: #f5f5f5; margin: 10px 0; border-radius: 8px;">
                        <strong>${p.user_name}</strong> - ${p.access_type === 'temporary' ? '⏱️ Czasowy' : '✅ Stały'}
                        ${p.expires_at ? `(do ${new Date(p.expires_at).toLocaleString()})` : ''}
                    </div>
                `).join('');
        } else {
            list.innerHTML = '<h3>📋 Lista uprawnień</h3><p>📭 Brak dodatkowych uprawnień</p>';
        }
    } catch (error) {
        console.error('Błąd:', error);
        document.getElementById('permissionsList').innerHTML = '<p style="color: red;">Błąd ładowania</p>';
    }
};

window.grantAccessSimple = async function(caseId) {
    // Pobierz listę użytkowników
    const token = localStorage.getItem('token');
    const response = await fetch('https://web-production-ef868.up.railway.app/api/cases/staff/list', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const staffData = await response.json();
    
    const allUsers = [
        ...(staffData.lawyers || []),
        ...(staffData.case_managers || []),
        ...(staffData.client_managers || [])
    ];
    
    // Stwórz modal
    const modal = document.createElement('div');
    modal.id = 'grantAccessModal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100000;';
    
    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 20px; max-width: 600px; width: 90%; box-shadow: 0 10px 50px rgba(0,0,0,0.3);">
            <h2 style="margin: 0 0 30px 0; color: #3B82F6; font-size: 1.8rem;">➕ Nadaj dostęp do sprawy</h2>
            
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #555;">👤 Wybierz użytkownika:</label>
                <select id="selectedUserId" style="
                    width: 100%;
                    padding: 15px;
                    border: 2px solid #ddd;
                    border-radius: 10px;
                    font-size: 1.1rem;
                    background: white;
                    cursor: pointer;
                ">
                    <option value="">-- Wybierz użytkownika --</option>
                    ${allUsers.map(u => `<option value="${u.id}">${u.name} (${u.email})</option>`).join('')}
                </select>
            </div>
            
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #555;">⏱️ Typ dostępu:</label>
                <select id="selectedAccessType" style="
                    width: 100%;
                    padding: 15px;
                    border: 2px solid #ddd;
                    border-radius: 10px;
                    font-size: 1.1rem;
                ">
                    <option value="temporary">Czasowy</option>
                    <option value="permanent">Stały</option>
                </select>
            </div>
            
            <div id="hoursField" style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #555;">🕐 Liczba godzin:</label>
                <input type="number" id="selectedHours" value="24" min="1" max="720" style="
                    width: 100%;
                    padding: 15px;
                    border: 2px solid #ddd;
                    border-radius: 10px;
                    font-size: 1.1rem;
                ">
            </div>
            
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #555;">📝 Notatka (opcjonalnie):</label>
                <textarea id="selectedNotes" rows="3" placeholder="Powód nadania dostępu..." style="
                    width: 100%;
                    padding: 15px;
                    border: 2px solid #ddd;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-family: inherit;
                "></textarea>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: flex-end;">
                <button onclick="document.getElementById('grantAccessModal').remove()" style="
                    padding: 15px 30px;
                    background: #95a5a6;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1.1rem;
                    cursor: pointer;
                    font-weight: 600;
                ">Anuluj</button>
                
                <button onclick="window.submitGrantAccess(${caseId})" style="
                    padding: 15px 30px;
                    background: linear-gradient(135deg, #3B82F6, #1E40AF);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1.1rem;
                    cursor: pointer;
                    font-weight: 600;
                    box-shadow: 0 4px 15px rgba(76,175,80,0.3);
                ">✅ Nadaj dostęp</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Toggle hours field based on access type
    document.getElementById('selectedAccessType').addEventListener('change', function() {
        document.getElementById('hoursField').style.display = 
            this.value === 'temporary' ? 'block' : 'none';
    });
};

window.submitGrantAccess = async function(caseId) {
    const userId = document.getElementById('selectedUserId').value;
    const accessType = document.getElementById('selectedAccessType').value;
    const hours = document.getElementById('selectedHours').value;
    const notes = document.getElementById('selectedNotes').value;
    
    if (!userId) {
        alert('⚠️ Wybierz użytkownika!');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        
        // Wybierz endpoint w zależności od typu dostępu
        const endpoint = accessType === 'temporary' 
            ? `https://web-production-ef868.up.railway.app/api/case-permissions/${caseId}/grant-temporary`
            : `https://web-production-ef868.up.railway.app/api/case-permissions/${caseId}/grant-permanent`;
        
        const body = {
            user_id: parseInt(userId),
            notes: notes || null
        };
        
        // Dla czasowego dodaj hours
        if (accessType === 'temporary') {
            body.hours = parseInt(hours);
        }
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            document.getElementById('grantAccessModal').remove();
            
            // Pokaż notyfikację
            const notification = document.createElement('div');
            notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 20px 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(76,175,80,0.4); z-index: 100001; font-size: 1.2rem; font-weight: 700;';
            notification.textContent = '✅ Dostęp nadany pomyślnie!';
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.transition = 'opacity 0.5s, transform 0.5s';
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => notification.remove(), 500);
            }, 3000);
            
            // Odśwież listę
            window.showPermissionsSimple(caseId);
        } else {
            alert('❌ Błąd: ' + (result.error || 'Nie udało się nadać dostępu'));
        }
    } catch (error) {
        alert('❌ Błąd: ' + error.message);
    }
};

console.log('✅ SIMPLE PERMISSIONS loaded!');

