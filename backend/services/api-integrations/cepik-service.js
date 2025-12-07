// ==========================================
// CEPiK API SERVICE
// Centralna Ewidencja Pojazdów i Kierowców
// API: https://api.cepik.gov.pl/
// ==========================================

const axios = require('axios');

const CEPIK_API_BASE = 'https://api.cepik.gov.pl';

// Cache dla zapytań (60 minut)
const cache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 60 minut

/**
 * Wyszukaj pojazdy po parametrach
 * UWAGA: CEPiK API nie pozwala na wyszukiwanie po numerze rejestracyjnym
 * ze względów bezpieczeństwa. Można wyszukiwać po:
 * - data-od, data-do (data pierwszej rejestracji)
 * - wojewodztwo
 * - marka, model
 * - rok-produkcji
 */
async function searchVehicles(params) {
    console.log('🚗 CEPiK: Wyszukiwanie pojazdów...', params);
    
    // Buduj cache key
    const cacheKey = `search:${JSON.stringify(params)}`;
    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('✅ CEPiK: Dane z cache');
            return cached.data;
        }
    }
    
    try {
        // Przygotuj parametry zapytania
        const queryParams = {
            ...params,
            limit: params.limit || 10,
            page: params.page || 0
        };
        
        console.log('📊 Parametry zapytania:', queryParams);
        
        // Wywołaj API
        const response = await axios.get(`${CEPIK_API_BASE}/pojazdy`, {
            params: queryParams,
            timeout: 15000
        });
        
        console.log('✅ CEPiK Response:', response.status);
        
        if (!response.data || response.data.length === 0) {
            return {
                success: true,
                data: [],
                count: 0,
                message: 'Nie znaleziono pojazdów spełniających kryteria'
            };
        }
        
        const result = {
            success: true,
            data: response.data.map(pojazd => parseVehicle(pojazd)),
            count: response.data.length
        };
        
        // Zapisz do cache
        cache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });
        
        return result;
        
    } catch (error) {
        console.error('❌ CEPiK Error:', error.message);
        
        if (error.response) {
            return {
                success: false,
                error: `Błąd API CEPiK: ${error.response.status}`,
                details: error.response.data
            };
        } else {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

/**
 * Pobierz słowniki wartości
 */
async function getDictionaries() {
    console.log('📚 CEPiK: Pobieranie słowników...');
    
    const cacheKey = 'dictionaries';
    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('✅ CEPiK: Słowniki z cache');
            return cached.data;
        }
    }
    
    try {
        const response = await axios.get(`${CEPIK_API_BASE}/slowniki`, {
            timeout: 10000
        });
        
        const result = {
            success: true,
            data: response.data
        };
        
        // Zapisz do cache
        cache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });
        
        return result;
        
    } catch (error) {
        console.error('❌ CEPiK Dictionaries Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Statystyki pojazdów (agregacje)
 * Możliwe agregacje: marka, rok_produkcji, rodzaj_paliwa, województwo
 */
async function getStatistics(aggregateBy) {
    console.log(`📊 CEPiK: Statystyki pojazdów (${aggregateBy})...`);
    
    try {
        const response = await axios.get(`${CEPIK_API_BASE}/pojazdy`, {
            params: {
                'only-data': 'false',
                [`${aggregateBy}`]: '*'
            },
            timeout: 15000
        });
        
        return {
            success: true,
            data: response.data,
            aggregateBy: aggregateBy
        };
        
    } catch (error) {
        console.error('❌ CEPiK Statistics Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Parsuj dane pojazdu do naszego formatu
 */
function parseVehicle(vehicle) {
    return {
        // Podstawowe
        marka: vehicle.marka || '',
        model: vehicle.model || '',
        typ: vehicle.typ || '',
        wariant: vehicle.wariant || '',
        wersja: vehicle.wersja || '',
        
        // Daty
        rokProdukcji: vehicle.rok_produkcji || null,
        dataPierwszejRejestracji: vehicle.data_pierwszej_rejestracji_w_kraju || null,
        
        // Silnik
        rodzajPaliwa: vehicle.rodzaj_paliwa || '',
        pojemnoscSilnika: vehicle.pojemnosc_silnika || null,
        moc: vehicle.moc || null,
        
        // Kategorie
        rodzajPojazdu: vehicle.rodzaj_pojazdu || '',
        przeznaczenie: vehicle.przeznaczenie || '',
        kategoria: vehicle.kategoria || '',
        
        // Lokalizacja
        wojewodztwo: vehicle.wojewodztwo || '',
        powiat: vehicle.powiat || '',
        
        // Pozostałe
        masaWlasna: vehicle.masa_wlasna || null,
        dopuszczalnaMasaCalkowita: vehicle.dopuszczalna_masa_calkowita || null,
        liczbaOsi: vehicle.liczba_osi || null,
        liczbaMiejsc: vehicle.liczba_miejsc || null,
        
        // Raw data (wszystkie pola)
        raw: vehicle
    };
}

/**
 * Wyczyść cache
 */
function clearCache() {
    cache.clear();
    console.log('🗑️ CEPiK: Cache wyczyszczony');
}

module.exports = {
    searchVehicles,
    getDictionaries,
    getStatistics,
    clearCache
};
