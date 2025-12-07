/**
 * 🕐 GLOBALNY MODUŁ OBSŁUGI DAT I CZASU
 * Rozwiązuje problem UTC vs lokalny czas
 * 
 * PROBLEM:
 * - SQLite zapisuje daty jako CURRENT_TIMESTAMP w formacie "YYYY-MM-DD HH:MM:SS" (UTC)
 * - JavaScript new Date(string) interpretuje to jako lokalny czas (błędnie!)
 * - Polska jest w strefie UTC+1 (zimą) lub UTC+2 (latem)
 * 
 * ROZWIĄZANIE:
 * - Zawsze traktuj daty z backendu jako UTC
 * - Konwertuj na lokalny czas użytkownika
 * - Formatuj zgodnie z polskimi standardami
 */

// ===== PROSTY EKSPORT JAKO OBIEKT (nie class) =====
const DateTimeUtils = {
    /**
     * Konwertuje datę z backendu (UTC) na lokalny Date object
     * @param {string|Date} dateInput - Data z backendu
     * @returns {Date} - Data w lokalnej strefie czasowej
     */
    parseUTCDate: function(dateInput) {
        if (!dateInput) return null;
        
        // Jeśli już jest Date object
        if (dateInput instanceof Date) {
            return dateInput;
        }
        
        let dateStr = dateInput.toString();
        
        // Jeśli data ma już 'Z' na końcu (UTC), użyj bezpośrednio
        if (dateStr.endsWith('Z')) {
            return new Date(dateStr);
        }
        
        // Jeśli data ma offset (+01:00, -05:00 etc), użyj bezpośrednio
        if (dateStr.match(/[+-]\d{2}:\d{2}$/)) {
            return new Date(dateStr);
        }
        
        // SQLite format: "YYYY-MM-DD HH:MM:SS" (bez Z) - traktuj jako UTC!
        // Dodaj 'Z' aby JavaScript wiedział że to UTC
        if (dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
            dateStr = dateStr.replace(' ', 'T') + 'Z';
        }
        
        return new Date(dateStr);
    },
    
    /**
     * Formatuje datę jako godzina:minuta (HH:MM)
     * @param {string|Date} dateInput - Data do sformatowania
     * @returns {string} - Godzina w formacie "23:45"
     */
    formatTime: function(dateInput) {
        const date = this.parseUTCDate(dateInput);
        if (!date || isNaN(date.getTime())) return '';
        
        return date.toLocaleTimeString('pl-PL', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        });
    },
    
    /**
     * Formatuje datę jako dzień/miesiąc/rok (DD.MM.YYYY)
     * @param {string|Date} dateInput - Data do sformatowania
     * @returns {string} - Data w formacie "19.11.2025"
     */
    formatDate: function(dateInput) {
        const date = this.parseUTCDate(dateInput);
        if (!date || isNaN(date.getTime())) return '';
        
        return date.toLocaleDateString('pl-PL', { 
            day: '2-digit', 
            month: '2-digit',
            year: 'numeric'
        });
    },
    
    /**
     * Formatuje datę jako data + godzina (DD.MM.YYYY HH:MM)
     * @param {string|Date} dateInput - Data do sformatowania
     * @returns {string} - Data i czas w formacie "19.11.2025 23:45"
     */
    formatDateTime: function(dateInput) {
        const date = this.parseUTCDate(dateInput);
        if (!date || isNaN(date.getTime())) return '';
        
        const dateStr = this.formatDate(date);
        const timeStr = this.formatTime(date);
        return `${dateStr} ${timeStr}`;
    },
    
    /**
     * INTELIGENTNE formatowanie daty (Dziś/Wczoraj/Pełna data)
     * @param {string|Date} dateInput - Data do sformatowania
     * @param {boolean} showTime - Czy pokazać godzinę (domyślnie: true)
     * @returns {string} - Sformatowana data
     */
    formatSmart: function(dateInput, showTime = true) {
        const date = this.parseUTCDate(dateInput);
        if (!date || isNaN(date.getTime())) return '';
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const timeStr = showTime ? ' ' + this.formatTime(date) : '';
        
        if (dateOnly.getTime() === today.getTime()) {
            // Dziś - tylko godzina
            return showTime ? this.formatTime(date) : 'Dziś';
        } else if (dateOnly.getTime() === yesterday.getTime()) {
            // Wczoraj
            return 'Wczoraj' + timeStr;
        } else if (date.getFullYear() === now.getFullYear()) {
            // Ten sam rok - bez roku
            return date.toLocaleDateString('pl-PL', { 
                day: '2-digit', 
                month: '2-digit'
            }) + timeStr;
        } else {
            // Pełna data
            return this.formatDate(date) + timeStr;
        }
    },
    
    /**
     * Formatuje datę dla inputa datetime-local (YYYY-MM-DDTHH:MM)
     * @param {string|Date} dateInput - Data do sformatowania
     * @returns {string} - Format dla <input type="datetime-local">
     */
    formatForInput: function(dateInput) {
        const date = this.parseUTCDate(dateInput);
        if (!date || isNaN(date.getTime())) return '';
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    },
    
    /**
     * Konwertuje lokalny czas na UTC dla wysyłania do backendu
     * @param {Date} localDate - Lokalna data
     * @returns {string} - Format ISO UTC (YYYY-MM-DDTHH:MM:SSZ)
     */
    toUTC: function(localDate) {
        if (!localDate) return null;
        if (!(localDate instanceof Date)) {
            localDate = new Date(localDate);
        }
        return localDate.toISOString();
    },
    
    /**
     * Względny czas (np. "2 minuty temu", "za godzinę")
     * @param {string|Date} dateInput - Data
     * @returns {string} - Względny opis
     */
    formatRelative: function(dateInput) {
        const date = this.parseUTCDate(dateInput);
        if (!date || isNaN(date.getTime())) return '';
        
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffSec < 60) return 'Teraz';
        if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? 'minutę' : 'minut'} temu`;
        if (diffHour < 24) return `${diffHour} ${diffHour === 1 ? 'godzinę' : 'godzin'} temu`;
        if (diffDay < 7) return `${diffDay} ${diffDay === 1 ? 'dzień' : 'dni'} temu`;
        
        return this.formatSmart(date, false);
    },
    
    /**
     * Czy data jest dziś?
     * @param {string|Date} dateInput - Data
     * @returns {boolean}
     */
    isToday: function(dateInput) {
        const date = this.parseUTCDate(dateInput);
        if (!date || isNaN(date.getTime())) return false;
        
        const now = new Date();
        return date.toDateString() === now.toDateString();
    },
    
    /**
     * Czy data jest w przyszłości?
     * @param {string|Date} dateInput - Data
     * @returns {boolean}
     */
    isFuture: function(dateInput) {
        const date = this.parseUTCDate(dateInput);
        if (!date || isNaN(date.getTime())) return false;
        
        return date > new Date();
    },
    
    /**
     * Dni do daty (może być ujemny jeśli przeszłość)
     * @param {string|Date} dateInput - Data
     * @returns {number} - Liczba dni
     */
    daysUntil: function(dateInput) {
        const date = this.parseUTCDate(dateInput);
        if (!date || isNaN(date.getTime())) return null;
        
        const now = new Date();
        const diffMs = date - now;
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }
}

// Eksport globalny
console.log('🔧 DEBUG: Przed eksportem - DateTimeUtils:', typeof DateTimeUtils);
console.log('🔧 DEBUG: Przed eksportem - window:', typeof window);

window.DateTimeUtils = DateTimeUtils;

console.log('🔧 DEBUG: Po eksporcie - window.DateTimeUtils:', typeof window.DateTimeUtils);
console.log('🔧 DEBUG: window.DateTimeUtils.parseUTCDate:', typeof window.DateTimeUtils?.parseUTCDate);

// Dodaj również skróty dla wygody
window.formatTime = (date) => DateTimeUtils.formatTime(date);
window.formatDate = (date) => DateTimeUtils.formatDate(date);
window.formatDateTime = (date) => DateTimeUtils.formatDateTime(date);
window.formatSmart = (date, showTime) => DateTimeUtils.formatSmart(date, showTime);

console.log('🕐 DateTimeUtils załadowany - strefa czasowa:', Intl.DateTimeFormat().resolvedOptions().timeZone);
console.log('✅ EKSPORT ZAKOŃCZONY - window.DateTimeUtils:', window.DateTimeUtils);
