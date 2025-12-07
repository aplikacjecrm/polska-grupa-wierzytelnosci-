// ==========================================
// DASHBOARD DIAGNOSTIC TOOL
// Sprawdza dostępność dashboardów
// ==========================================

console.log('%c=== DASHBOARD DIAGNOSTIC START ===', 'background: purple; color: white; font-size: 16px; padding: 10px;');

// Sprawdź czy obiekty istnieją
const dashboards = {
    'window.adminDashboard': window.adminDashboard,
    'window.universalDashboard': window.universalDashboard,
    'window.adminPanel': window.adminPanel,
    'window.app': window.app
};

console.log('📊 Dostępne obiekty dashboardów:');
for (const [name, obj] of Object.entries(dashboards)) {
    if (obj) {
        console.log(`✅ ${name} - ISTNIEJE`);
        console.log(`   Typ:`, typeof obj);
        console.log(`   Ma init():`, typeof obj.init === 'function');
        console.log(`   Ma render():`, typeof obj.render === 'function');
    } else {
        console.log(`❌ ${name} - BRAK!`);
    }
}

// Sprawdź elementy DOM
console.log('\n📋 Elementy DOM:');
const views = ['adminView', 'lawyer-dashboardView', 'case-manager-dashboardView'];
views.forEach(id => {
    const el = document.getElementById(id);
    console.log(`${el ? '✅' : '❌'} #${id}:`, el ? 'EXISTS' : 'MISSING');
});

// Sprawdź czy skrypty zostały załadowane
console.log('\n📜 Załadowane skrypty dashboardów:');
const scripts = Array.from(document.querySelectorAll('script[src*="dashboard"]'));
scripts.forEach(script => {
    console.log(`✅ ${script.src.split('/').pop()}`);
});

console.log('%c=== DASHBOARD DIAGNOSTIC END ===', 'background: purple; color: white; font-size: 16px; padding: 10px;');
