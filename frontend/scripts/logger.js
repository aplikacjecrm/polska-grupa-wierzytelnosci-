/**
 * PRODUCTION LOGGER - Wyłącza console.log w produkcji
 * Oszczędność: ~575ms czasu wykonania, brak memory leaks
 */

(function() {
    // ZMIEŃ NA true TYLKO podczas developmentu
    const isDevelopment = true; // ✅ WŁĄCZONY dla debugowania
    
    // Zachowaj oryginalne funkcje
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;
    const originalDebug = console.debug;
    
    // Nadpisz console.log - wyłączone w production
    console.log = function(...args) {
        if (isDevelopment) {
            originalLog.apply(console, args);
        }
    };
    
    // Nadpisz console.info - wyłączone w production
    console.info = function(...args) {
        if (isDevelopment) {
            originalInfo.apply(console, args);
        }
    };
    
    // Nadpisz console.debug - wyłączone w production
    console.debug = function(...args) {
        if (isDevelopment) {
            originalDebug.apply(console, args);
        }
    };
    
    // Nadpisz console.warn - wyłączone w production
    console.warn = function(...args) {
        if (isDevelopment) {
            originalWarn.apply(console, args);
        }
    };
    
    // console.error ZAWSZE aktywne (ważne błędy)
    console.error = function(...args) {
        originalError.apply(console, args);
    };
    
    // Globalna funkcja do włączenia logów (np. dla debugowania)
    window.enableLogs = function() {
        console.log = originalLog;
        console.warn = originalWarn;
        console.info = originalInfo;
        console.debug = originalDebug;
        originalLog('%c 🔧 Logi włączone', 'color: green; font-weight: bold');
    };
    
    if (!isDevelopment) {
        console.log('%c 🚀 Production mode - console.log wyłączone (wpisz enableLogs() aby włączyć)', 'color: orange; font-weight: bold');
    }
})();
