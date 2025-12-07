/**
 * Employee Dashboard - SUPER SIMPLE VERSION
 */

console.log('🔥 EMPLOYEE DASHBOARD SIMPLE - LOADING...');

class EmployeeDashboard {
  constructor(userId) {
    this.userId = userId;
    this.profileData = null;
    console.log('📊 EmployeeDashboard created for user:', userId);
  }

  async loadData() {
    console.log('📥 Loading data for user:', this.userId);
    try {
      const response = await window.api.request(`/employees/${this.userId}/profile`);
      this.profileData = response;
      console.log('✅ Profile data loaded:', this.profileData);
      return true;
    } catch (error) {
      console.error('❌ Error loading data:', error);
      throw error;
    }
  }

  async render(containerId) {
    console.log('🎨 Rendering dashboard to:', containerId);
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.error('❌ Container not found:', containerId);
      return;
    }

    if (!this.profileData) {
      container.innerHTML = '<div style="padding: 40px; text-align: center; color: red;"><h2>Błąd ładowania danych</h2></div>';
      return;
    }

    const user = this.profileData.user || {};
    
    // WYMUSZENIE WYSOKOŚCI NA KONTENERZE
    container.style.cssText = 'height: 800px !important; overflow-y: auto !important; background: white !important; display: block !important; padding: 0 !important;';
    
    container.innerHTML = `
      <div style="padding: 40px; background: white; min-height: 100%; box-sizing: border-box;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; color: white; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 2.5rem;">👤 ${user.name || 'Brak nazwy'}</h1>
          <p style="margin: 10px 0 0 0; font-size: 1.2rem; opacity: 0.9;">${user.email || 'Brak email'}</p>
          <p style="margin: 5px 0 0 0; opacity: 0.8;">Rola: ${user.user_role || user.role || 'Brak roli'}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; text-align: center; border-left: 4px solid #3B82F6;">
            <div style="font-size: 3rem;">📊</div>
            <div style="font-size: 2rem; font-weight: bold; margin: 10px 0;">Dashboard</div>
            <div style="color: #666;">Employee HR</div>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; text-align: center; border-left: 4px solid #28a745;">
            <div style="font-size: 3rem;">✅</div>
            <div style="font-size: 2rem; font-weight: bold; margin: 10px 0;">Aktywny</div>
            <div style="color: #666;">Status pracownika</div>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; text-align: center; border-left: 4px solid #ffc107;">
            <div style="font-size: 3rem;">📋</div>
            <div style="font-size: 2rem; font-weight: bold; margin: 10px 0;">ID: ${this.userId}</div>
            <div style="color: #666;">User ID</div>
          </div>
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border-left: 4px solid #2196F3; border-radius: 6px;">
          <h3 style="margin: 0 0 10px 0; color: #1976D2;">✅ Dashboard działa poprawnie!</h3>
          <p style="margin: 0; color: #666;">Dane pracownika zostały załadowane. System Employee Dashboard HR jest aktywny.</p>
        </div>
      </div>
    `;
    
    console.log('✅ Dashboard rendered successfully!');
    
    // DEBUG: Check dimensions after render
    setTimeout(() => {
      console.log('🔍 After render - Container offsetHeight:', container.offsetHeight);
      console.log('🔍 After render - Container offsetWidth:', container.offsetWidth);
      console.log('🔍 After render - Container children:', container.children.length);
      if (container.children.length > 0) {
        console.log('🔍 First child offsetHeight:', container.children[0].offsetHeight);
      }
    }, 100);
  }
}

window.EmployeeDashboard = EmployeeDashboard;
console.log('✅ EmployeeDashboard class ready (SIMPLE VERSION)');
