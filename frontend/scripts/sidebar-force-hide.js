// WYMUSZENIE UKRYCIA SIDEBARA - musi być na początku!
console.log('🔥 SIDEBAR FORCE HIDE - START');

function forceSidebarHide() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) {
        console.log('⚠️ Sidebar nie znaleziony, retry...');
        setTimeout(forceSidebarHide, 100);
        return;
    }
    
    console.log('✅ Sidebar znaleziony, wymuszam style...');
    
    // WYMUSZENIE inline styles z !important (najwyższy priorytet)
    sidebar.style.setProperty('width', '0px', 'important');
    sidebar.style.setProperty('min-width', '0px', 'important');
    sidebar.style.setProperty('max-width', '0px', 'important');
    sidebar.style.setProperty('position', 'fixed', 'important');
    sidebar.style.setProperty('left', '0', 'important');
    sidebar.style.setProperty('top', '0', 'important');
    sidebar.style.setProperty('height', '100vh', 'important');
    sidebar.style.setProperty('overflow', 'hidden', 'important');
    sidebar.style.setProperty('transition', 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', 'important');
    sidebar.style.setProperty('z-index', '10000', 'important');
    
    // NOWA LOGIKA: Używam pozycji myszy zamiast mouseenter
    let isExpanded = false;
    let mouseInZone = false;
    
    document.addEventListener('mousemove', (e) => {
        const inTriggerZone = e.clientX < 50;
        
        // Wejście do trigger zone
        if (inTriggerZone && !mouseInZone) {
            mouseInZone = true;
            console.log('🟢 WCHODZĘ w trigger zone!');
            
            if (!isExpanded) {
                console.log('🟢 ROZWIJAM SIDEBAR!');
                sidebar.style.setProperty('width', '280px', 'important');
                sidebar.style.setProperty('min-width', '280px', 'important');
                sidebar.style.setProperty('max-width', '280px', 'important');
                sidebar.style.setProperty('overflow-y', 'auto', 'important');
                sidebar.style.setProperty('overflow-x', 'hidden', 'important');
                isExpanded = true;
            }
        }
        
        // Wyjście z trigger zone
        if (!inTriggerZone && mouseInZone) {
            mouseInZone = false;
            console.log('🔴 WYCHODZĘ z trigger zone!');
            
            // Daj chwilę na przejście do rozszerzonego sidebara
            setTimeout(() => {
                // Sprawdź czy mysz nie jest w sidebarze
                if (e.clientX > 280 || e.clientX < 50) {
                    console.log('🔴 ZWIJAM SIDEBAR!');
                    sidebar.style.setProperty('width', '0px', 'important');
                    sidebar.style.setProperty('min-width', '0px', 'important');
                    sidebar.style.setProperty('max-width', '0px', 'important');
                    sidebar.style.setProperty('overflow', 'hidden', 'important');
                    isExpanded = false;
                }
            }, 300);
        }
        
        // Jeśli rozwinięty i mysz wyszła daleko
        if (isExpanded && e.clientX > 300) {
            console.log('🔴 Mysz daleko - ZWIJAM!');
            sidebar.style.setProperty('width', '0px', 'important');
            sidebar.style.setProperty('min-width', '0px', 'important');
            sidebar.style.setProperty('max-width', '0px', 'important');
            sidebar.style.setProperty('overflow', 'hidden', 'important');
            isExpanded = false;
        }
    });
    
    console.log('✅ Sidebar styles wymuszone!');
}

// Uruchom natychmiast
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceSidebarHide);
} else {
    forceSidebarHide();
}

// Także po zmianie theme
document.addEventListener('themeChanged', forceSidebarHide);

// Mutacja observer dla pewności
const observer = new MutationObserver(() => {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const currentWidth = sidebar.style.width;
        if (currentWidth !== '0px' && currentWidth !== '280px') {
            console.log('⚠️ Sidebar width zmieniony przez inny skrypt, przywracam...');
            forceSidebarHide();
        }
    }
});

setTimeout(() => {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        observer.observe(sidebar, { 
            attributes: true, 
            attributeFilter: ['style', 'class'] 
        });
    }
}, 1000);

console.log('🔥 SIDEBAR FORCE HIDE - Załadowany i aktywny');
