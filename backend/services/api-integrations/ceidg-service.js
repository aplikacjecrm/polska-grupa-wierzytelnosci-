// ==========================================
// CEIDG API SERVICE
// Centralna Ewidencja i Informacja o Działalności Gospodarczej
// API: https://dane.biznes.gov.pl/api/ceidg/v2
// ==========================================

const axios = require('axios');

const CEIDG_API_BASE = 'https://dane.biznes.gov.pl/api/ceidg/v2';
const USE_MOCK_DATA = !process.env.CEIDG_API_TOKEN; // Mock mode jeśli brak tokenu

// Cache dla zapytań (60 minut)
const cache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 60 minut

/**
 * Wyszukaj firmę w CEIDG po NIP
 */
async function searchByNIP(nip) {
    console.log('🔍 CEIDG: Wyszukiwanie po NIP:', nip);
    
    // Walidacja NIP
    const cleanNIP = nip.replace(/[-\s]/g, '');
    if (cleanNIP.length !== 10) {
        throw new Error('NIP musi mieć 10 cyfr');
    }
    
    // Sprawdź cache
    const cacheKey = `nip:${cleanNIP}`;
    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('✅ CEIDG: Dane z cache');
            return cached.data;
        }
    }
    
    try {
        // MOCK MODE - dla demonstracji bez tokenu API
        if (USE_MOCK_DATA) {
            console.log('⚠️ MOCK MODE: Generuję przykładowe dane (brak CEIDG_API_TOKEN)');
            const mockData = generateMockCEIDGData(cleanNIP);
            
            // Zapisz do cache
            cache.set(cacheKey, {
                data: mockData,
                timestamp: Date.now()
            });
            
            return mockData;
        }
        
        // PRAWDZIWE API - wymaga tokenu
        const response = await axios.get(`${CEIDG_API_BASE}/firmy`, {
            params: {
                nip: cleanNIP
            },
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${process.env.CEIDG_API_TOKEN}`
            }
        });
        
        console.log('📊 CEIDG Response status:', response.status);
        
        if (!response.data || !response.data.firmy || response.data.firmy.length === 0) {
            return {
                success: false,
                error: 'Nie znaleziono firmy o podanym NIP w CEIDG'
            };
        }
        
        // Parsuj dane (bierzemy pierwszą firmę)
        const firma = response.data.firmy[0];
        const parsedData = parseFirma(firma);
        
        // Zapisz do cache
        cache.set(cacheKey, {
            data: parsedData,
            timestamp: Date.now()
        });
        
        console.log('✅ CEIDG: Dane pobrane i sparsowane');
        return parsedData;
        
    } catch (error) {
        console.error('❌ CEIDG Error:', error.message);
        
        if (error.response) {
            // API zwróciło błąd
            return {
                success: false,
                error: `Błąd API CEIDG: ${error.response.status}`,
                details: error.response.data
            };
        } else if (error.request) {
            // Brak odpowiedzi
            return {
                success: false,
                error: 'Brak odpowiedzi z API CEIDG (timeout lub brak połączenia)'
            };
        } else {
            // Inny błąd
            return {
                success: false,
                error: error.message
            };
        }
    }
}

/**
 * Wyszukaj firmę w CEIDG po REGON
 */
async function searchByREGON(regon) {
    console.log('🔍 CEIDG: Wyszukiwanie po REGON:', regon);
    
    // Walidacja REGON (9 lub 14 cyfr)
    const cleanREGON = regon.replace(/[-\s]/g, '');
    if (cleanREGON.length !== 9 && cleanREGON.length !== 14) {
        throw new Error('REGON musi mieć 9 lub 14 cyfr');
    }
    
    // Sprawdź cache
    const cacheKey = `regon:${cleanREGON}`;
    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('✅ CEIDG: Dane z cache');
            return cached.data;
        }
    }
    
    try {
        const response = await axios.get(`${CEIDG_API_BASE}/firmy`, {
            params: {
                regon: cleanREGON
            },
            timeout: 10000,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.data || !response.data.firmy || response.data.firmy.length === 0) {
            return {
                success: false,
                error: 'Nie znaleziono firmy o podanym REGON w CEIDG'
            };
        }
        
        const firma = response.data.firmy[0];
        const parsedData = parseFirma(firma);
        
        // Zapisz do cache
        cache.set(cacheKey, {
            data: parsedData,
            timestamp: Date.now()
        });
        
        console.log('✅ CEIDG: Dane pobrane i sparsowane');
        return parsedData;
        
    } catch (error) {
        console.error('❌ CEIDG Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Parsuj dane firmy z CEIDG do naszego formatu
 */
function parseFirma(firma) {
    console.log('📋 CEIDG: Parsowanie danych firmy...');
    
    // Status firmy
    const status = firma.status || 'NIEZNANY';
    const statusInfo = getStatusInfo(status);
    
    // Adres
    const adres = parseAdres(firma.adres);
    
    // PKD (rodzaje działalności)
    const pkd = parsePKD(firma.pkd);
    
    // Daty
    const dataRozpoczecia = firma.dataRozpoczecia || null;
    const dataZawieszenia = firma.dataZawieszenia || null;
    const dataWznowienia = firma.dataWznowienia || null;
    const dataWykreslenia = firma.dataWykreslenia || null;
    
    return {
        success: true,
        data: {
            // Podstawowe dane
            nazwa: firma.nazwa || '',
            nip: firma.nip || '',
            regon: firma.regon || '',
            
            // Status
            status: status,
            statusInfo: statusInfo,
            
            // Adres
            adres: adres,
            
            // PKD
            pkd: pkd,
            pkdPodstawowe: pkd.length > 0 ? pkd[0] : null,
            pkdPozostale: pkd.slice(1),
            
            // Daty
            dataRozpoczecia: dataRozpoczecia,
            dataZawieszenia: dataZawieszenia,
            dataWznowienia: dataWznowienia,
            dataWykreslenia: dataWykreslenia,
            
            // Oblicz wiek działalności
            wiekDzialalnosci: calculateAge(dataRozpoczecia),
            
            // Dodatkowe info
            dataAktualizacji: new Date().toISOString(),
            zrodlo: 'CEIDG'
        }
    };
}

/**
 * Parsuj adres
 */
function parseAdres(adresData) {
    if (!adresData) return null;
    
    const ulica = adresData.ulica || '';
    const nrDomu = adresData.nrDomu || '';
    const nrLokalu = adresData.nrLokalu || '';
    const kodPocztowy = adresData.kodPocztowy || '';
    const miejscowosc = adresData.miejscowosc || '';
    const gmina = adresData.gmina || '';
    const powiat = adresData.powiat || '';
    const wojewodztwo = adresData.wojewodztwo || '';
    
    // Formatuj pełny adres
    let pelnyAdres = '';
    if (ulica) pelnyAdres += `ul. ${ulica} `;
    if (nrDomu) pelnyAdres += nrDomu;
    if (nrLokalu) pelnyAdres += `/${nrLokalu}`;
    if (pelnyAdres) pelnyAdres += ', ';
    if (kodPocztowy) pelnyAdres += `${kodPocztowy} `;
    if (miejscowosc) pelnyAdres += miejscowosc;
    
    return {
        pelny: pelnyAdres.trim(),
        ulica,
        nrDomu,
        nrLokalu,
        kodPocztowy,
        miejscowosc,
        gmina,
        powiat,
        wojewodztwo
    };
}

/**
 * Parsuj PKD (kody działalności)
 */
function parsePKD(pkdData) {
    if (!pkdData || !Array.isArray(pkdData)) return [];
    
    return pkdData.map(p => ({
        kod: p.kod || '',
        nazwa: p.nazwa || '',
        czyPodstawowe: p.czyPodstawowe || false
    })).sort((a, b) => {
        // Podstawowe na początku
        if (a.czyPodstawowe && !b.czyPodstawowe) return -1;
        if (!a.czyPodstawowe && b.czyPodstawowe) return 1;
        return 0;
    });
}

/**
 * Informacja o statusie firmy
 */
function getStatusInfo(status) {
    const statusMap = {
        'AKTYWNY': {
            label: 'Aktywna',
            color: 'green',
            icon: '✅',
            description: 'Firma prowadzi działalność gospodarczą'
        },
        'ZAWIESZONY': {
            label: 'Zawieszona',
            color: 'orange',
            icon: '⏸️',
            description: 'Działalność gospodarcza jest zawieszona'
        },
        'WYKRESLONY': {
            label: 'Wykreślona',
            color: 'red',
            icon: '❌',
            description: 'Firma została wykreślona z CEIDG'
        },
        'NIEZNANY': {
            label: 'Nieznany',
            color: 'gray',
            icon: '❓',
            description: 'Status nie jest określony'
        }
    };
    
    return statusMap[status] || statusMap['NIEZNANY'];
}

/**
 * Oblicz wiek działalności (w latach)
 */
function calculateAge(dataRozpoczecia) {
    if (!dataRozpoczecia) return null;
    
    const start = new Date(dataRozpoczecia);
    const now = new Date();
    const diffMs = now - start;
    const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    
    return Math.floor(diffYears);
}

/**
 * Wyczyść cache (dla testów)
 */
function clearCache() {
    cache.clear();
    console.log('🗑️ CEIDG: Cache wyczyszczony');
}

/**
 * Generuj przykładowe dane CEIDG (mock mode)
 */
function generateMockCEIDGData(nip) {
    console.log('🎭 Generuję mock data dla NIP:', nip);
    
    // Różne przykładowe firmy w zależności od NIP
    const mockFirms = {
        '1234567890': {
            nazwa: 'Jan Kowalski - Firma Budowlana',
            status: 'AKTYWNY',
            miejscowosc: 'Warszawa',
            wojewodztwo: 'MAZOWIECKIE',
            pkd: [{kod: '43.21.Z', nazwa: 'Roboty budowlane', czyPodstawowe: true}],
            dataRozpoczecia: '2018-03-15'
        },
        '9876543210': {
            nazwa: 'Anna Nowak - Usługi Księgowe',
            status: 'AKTYWNY',
            miejscowosc: 'Kraków',
            wojewodztwo: 'MAŁOPOLSKIE',
            pkd: [{kod: '69.20.Z', nazwa: 'Działalność rachunkowo-księgowa', czyPodstawowe: true}],
            dataRozpoczecia: '2020-01-10'
        },
        'default': {
            nazwa: 'Przykładowa Firma - JDG',
            status: 'AKTYWNY',
            miejscowosc: 'Poznań',
            wojewodztwo: 'WIELKOPOLSKIE',
            pkd: [{kod: '62.01.Z', nazwa: 'Działalność związana z oprogramowaniem', czyPodstawowe: true}],
            dataRozpoczecia: '2019-06-01'
        }
    };
    
    const template = mockFirms[nip] || mockFirms['default'];
    
    // Generuj REGON na podstawie NIP
    const regon = String(parseInt(nip.substring(0, 9)));
    
    return {
        success: true,
        isMockData: true,
        data: {
            // Podstawowe dane
            nazwa: template.nazwa,
            nip: nip,
            regon: regon,
            
            // Status
            status: template.status,
            statusInfo: getStatusInfo(template.status),
            
            // Adres
            adres: {
                pelny: `ul. Przykładowa 10, 00-001 ${template.miejscowosc}`,
                ulica: 'Przykładowa',
                nrDomu: '10',
                nrLokalu: '',
                kodPocztowy: '00-001',
                miejscowosc: template.miejscowosc,
                gmina: template.miejscowosc,
                powiat: template.miejscowosc,
                wojewodztwo: template.wojewodztwo
            },
            
            // PKD
            pkd: template.pkd,
            pkdPodstawowe: template.pkd[0],
            pkdPozostale: template.pkd.slice(1),
            
            // Daty
            dataRozpoczecia: template.dataRozpoczecia,
            dataZawieszenia: null,
            dataWznowienia: null,
            dataWykreslenia: null,
            
            // Oblicz wiek działalności
            wiekDzialalnosci: calculateAge(template.dataRozpoczecia),
            
            // Dodatkowe info
            dataAktualizacji: new Date().toISOString(),
            zrodlo: 'CEIDG (Mock)'
        }
    };
}

module.exports = {
    searchByNIP,
    searchByREGON,
    clearCache
};
