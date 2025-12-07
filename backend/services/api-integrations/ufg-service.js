// ==========================================
// UFG API SERVICE
// Ubezpieczeniowy Fundusz Gwarancyjny
// Portal: https://www.ufg.pl/infoportal/
// ==========================================

const axios = require('axios');

const UFG_API_BASE = 'https://www.ufg.pl/api'; // Placeholder - prawdziwy URL po rejestracji
const USE_MOCK_DATA = !process.env.UFG_API_TOKEN; // Mock mode jeśli brak tokenu

// Cache dla zapytań (60 minut)
const cache = new Map();
const CACHE_DURATION = 60 * 60 * 1000;

/**
 * Wyszukaj historię pojazdu po numerze rejestracyjnym
 */
async function searchVehicleHistory(numerRejestracyjny) {
    console.log('🚗 UFG: Wyszukiwanie historii pojazdu:', numerRejestracyjny);
    
    const cleanNumer = numerRejestracyjny.replace(/[\s-]/g, '').toUpperCase();
    
    // Sprawdź cache
    const cacheKey = `vehicle:${cleanNumer}`;
    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('✅ UFG: Dane z cache');
            return cached.data;
        }
    }
    
    try {
        // MOCK MODE
        if (USE_MOCK_DATA) {
            console.log('⚠️ MOCK MODE: Generuję przykładowe dane (brak UFG_API_TOKEN)');
            const mockData = generateMockVehicleHistory(cleanNumer);
            
            cache.set(cacheKey, {
                data: mockData,
                timestamp: Date.now()
            });
            
            return mockData;
        }
        
        // PRAWDZIWE API (gdy dostaniesz token)
        const response = await axios.get(`${UFG_API_BASE}/vehicle/${cleanNumer}`, {
            headers: {
                'Authorization': `Bearer ${process.env.UFG_API_TOKEN}`,
                'Accept': 'application/json'
            },
            timeout: 15000
        });
        
        if (!response.data) {
            return {
                success: false,
                error: 'Nie znaleziono pojazdu w bazie UFG'
            };
        }
        
        const result = {
            success: true,
            data: parseVehicleHistory(response.data)
        };
        
        cache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });
        
        return result;
        
    } catch (error) {
        console.error('❌ UFG Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Wyszukaj szkody komunikacyjne po numerze rejestracyjnym
 */
async function searchDamages(numerRejestracyjny, dataOd, dataDo) {
    console.log('💥 UFG: Wyszukiwanie szkód dla:', numerRejestracyjny);
    
    const cleanNumer = numerRejestracyjny.replace(/[\s-]/g, '').toUpperCase();
    
    try {
        if (USE_MOCK_DATA) {
            console.log('⚠️ MOCK MODE: Generuję przykładowe szkody');
            return generateMockDamages(cleanNumer, dataOd, dataDo);
        }
        
        // PRAWDZIWE API
        const response = await axios.get(`${UFG_API_BASE}/damages`, {
            params: {
                vehicle: cleanNumer,
                dateFrom: dataOd,
                dateTo: dataDo
            },
            headers: {
                'Authorization': `Bearer ${process.env.UFG_API_TOKEN}`,
                'Accept': 'application/json'
            },
            timeout: 15000
        });
        
        return {
            success: true,
            data: response.data.damages || []
        };
        
    } catch (error) {
        console.error('❌ UFG Damages Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Sprawdź polisę OC/AC w danym dniu
 */
async function checkInsurance(numerRejestracyjny, data) {
    console.log('📋 UFG: Sprawdzanie polisy dla:', numerRejestracyjny, 'na dzień:', data);
    
    const cleanNumer = numerRejestracyjny.replace(/[\s-]/g, '').toUpperCase();
    
    try {
        if (USE_MOCK_DATA) {
            console.log('⚠️ MOCK MODE: Generuję przykładową polisę');
            return generateMockInsurance(cleanNumer, data);
        }
        
        // PRAWDZIWE API
        const response = await axios.get(`${UFG_API_BASE}/insurance`, {
            params: {
                vehicle: cleanNumer,
                date: data
            },
            headers: {
                'Authorization': `Bearer ${process.env.UFG_API_TOKEN}`,
                'Accept': 'application/json'
            },
            timeout: 15000
        });
        
        return {
            success: true,
            data: response.data
        };
        
    } catch (error) {
        console.error('❌ UFG Insurance Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Parsuj historię pojazdu
 */
function parseVehicleHistory(data) {
    return {
        numerRejestracyjny: data.registrationNumber,
        marka: data.make,
        model: data.model,
        rokProdukcji: data.year,
        vin: data.vin,
        
        // Historia właścicieli
        wlasciciele: data.owners || [],
        
        // Historia ubezpieczeń
        ubezpieczenia: data.insurances || [],
        
        // Szkody
        szkody: data.damages || [],
        
        // Dodatkowe
        dataAktualizacji: new Date().toISOString(),
        zrodlo: 'UFG'
    };
}

/**
 * MOCK DATA - Historia pojazdu
 */
function generateMockVehicleHistory(numerRejestracyjny) {
    const mockVehicles = {
        'WA12345': {
            marka: 'TOYOTA',
            model: 'COROLLA',
            rok: 2018
        },
        'KR98765': {
            marka: 'VOLKSWAGEN',
            model: 'GOLF',
            rok: 2020
        },
        'default': {
            marka: 'BMW',
            model: '320i',
            rok: 2019
        }
    };
    
    const vehicle = mockVehicles[numerRejestracyjny] || mockVehicles['default'];
    
    return {
        success: true,
        isMockData: true,
        data: {
            numerRejestracyjny: numerRejestracyjny,
            marka: vehicle.marka,
            model: vehicle.model,
            rokProdukcji: vehicle.rok,
            vin: `VIN${numerRejestracyjny}MOCK123456`,
            
            // Historia właścicieli (2 właścicieli)
            wlasciciele: [
                {
                    nrWlasciciela: 1,
                    okresOd: '2018-03-15',
                    okresDo: '2021-06-20',
                    typ: 'Osoba fizyczna'
                },
                {
                    nrWlasciciela: 2,
                    okresOd: '2021-06-21',
                    okresDo: null,
                    typ: 'Osoba fizyczna'
                }
            ],
            
            // Historia ubezpieczeń
            ubezpieczenia: [
                {
                    ubezpieczyciel: 'PZU S.A.',
                    nrPolisy: 'PZU/123456/2024',
                    typ: 'OC',
                    okresOd: '2024-01-01',
                    okresDo: '2024-12-31',
                    status: 'Aktywna'
                },
                {
                    ubezpieczyciel: 'Warta S.A.',
                    nrPolisy: 'W/987654/2023',
                    typ: 'OC+AC',
                    okresOd: '2023-01-01',
                    okresDo: '2023-12-31',
                    status: 'Zakończona'
                }
            ],
            
            // Szkody (2 szkody)
            szkody: [
                {
                    dataSzkody: '2022-05-15',
                    miejsceSzkody: 'Warszawa, ul. Marszałkowska',
                    rodzajSzkody: 'Kolizja',
                    sprawca: 'Pojazd trzeci',
                    wartoscSzkody: 8500.00,
                    waluta: 'PLN',
                    status: 'Rozliczona'
                },
                {
                    dataSzkody: '2023-11-03',
                    miejsceSzkody: 'Kraków, al. Słowackiego',
                    rodzajSzkody: 'Stłuczka',
                    sprawca: 'Współwina',
                    wartoscSzkody: 3200.00,
                    waluta: 'PLN',
                    status: 'W trakcie'
                }
            ],
            
            // Podsumowanie
            liczbaSzkod: 2,
            lacznaWartoscSzkod: 11700.00,
            
            dataAktualizacji: new Date().toISOString(),
            zrodlo: 'UFG (Mock)'
        }
    };
}

/**
 * MOCK DATA - Szkody
 */
function generateMockDamages(numerRejestracyjny, dataOd, dataDo) {
    return {
        success: true,
        isMockData: true,
        data: {
            numerRejestracyjny: numerRejestracyjny,
            okresOd: dataOd,
            okresDo: dataDo,
            szkody: [
                {
                    id: 'SZK-001',
                    dataSzkody: '2023-06-15',
                    godzina: '14:30',
                    miejsceSzkody: 'Warszawa, ul. Puławska 120',
                    rodzajZdarzenia: 'Kolizja drogowa',
                    sprawca: {
                        typ: 'Pojazd trzeci',
                        numerRejestracyjny: 'WX54321',
                        ubezpieczyciel: 'Allianz Polska S.A.'
                    },
                    poszkodowani: [
                        {
                            typ: 'Kierowca',
                            obrażenia: 'Lekkie',
                            hospitalizacja: false
                        }
                    ],
                    wartoscSzkody: 12500.00,
                    waluta: 'PLN',
                    status: 'Rozliczona',
                    dataRozliczenia: '2023-08-22'
                }
            ],
            liczbaSzkod: 1,
            lacznaWartosc: 12500.00
        }
    };
}

/**
 * MOCK DATA - Polisa
 */
function generateMockInsurance(numerRejestracyjny, data) {
    return {
        success: true,
        isMockData: true,
        data: {
            numerRejestracyjny: numerRejestracyjny,
            dataSprawdzenia: data,
            
            // OC
            oc: {
                czyUbezpieczony: true,
                ubezpieczyciel: 'PZU S.A.',
                nrPolisy: 'PZU/OC/2024/123456',
                okresOd: '2024-01-01',
                okresDo: '2024-12-31',
                sumaGwarancyjna: 5000000.00,
                waluta: 'EUR'
            },
            
            // AC (opcjonalnie)
            ac: {
                czyUbezpieczony: true,
                ubezpieczyciel: 'PZU S.A.',
                nrPolisy: 'PZU/AC/2024/123456',
                okresOd: '2024-01-01',
                okresDo: '2024-12-31',
                zakres: 'Pełne AC',
                franchise: 300.00
            },
            
            statusWDniuZdarzenia: 'AKTYWNA',
            ostrzeżenia: []
        }
    };
}

/**
 * Wyczyść cache
 */
function clearCache() {
    cache.clear();
    console.log('🗑️ UFG: Cache wyczyszczony');
}

module.exports = {
    searchVehicleHistory,
    searchDamages,
    checkInsurance,
    clearCache
};
