// ==========================================
// KRS API SERVICE
// Krajowy Rejestr Sądowy - Ministerstwo Sprawiedliwości
// API: https://api-krs.ms.gov.pl/api/krs
// ==========================================

const axios = require('axios');

const KRS_API_BASE = 'https://api-krs.ms.gov.pl/api/krs';

// Cache dla zapytań (60 minut)
const cache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 60 minut

/**
 * Pobierz odpis pełny z KRS po numerze KRS
 */
async function getFullReport(krs) {
    console.log('🏢 KRS: Pobieranie odpisu pełnego dla KRS:', krs);
    
    // Walidacja numeru KRS (10 cyfr)
    const cleanKRS = String(krs).padStart(10, '0');
    
    // Sprawdź cache
    const cacheKey = `full:${cleanKRS}`;
    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('✅ KRS: Dane z cache');
            return cached.data;
        }
    }
    
    try {
        const response = await axios.get(`${KRS_API_BASE}/OdpisPelny/${cleanKRS}`, {
            timeout: 15000,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('📊 KRS Response status:', response.status);
        
        if (!response.data || !response.data.odpis) {
            return {
                success: false,
                error: 'Nie znaleziono firmy o podanym numerze KRS'
            };
        }
        
        // Parsuj dane
        const parsedData = parseKRSData(response.data.odpis, 'full');
        
        // Zapisz do cache
        cache.set(cacheKey, {
            data: parsedData,
            timestamp: Date.now()
        });
        
        console.log('✅ KRS: Dane pobrane i sparsowane');
        return parsedData;
        
    } catch (error) {
        console.error('❌ KRS Error:', error.message);
        
        if (error.response) {
            return {
                success: false,
                error: `Błąd API KRS: ${error.response.status}`,
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
 * Pobierz odpis aktualny z KRS po numerze KRS
 */
async function getCurrentReport(krs) {
    console.log('🏢 KRS: Pobieranie odpisu aktualnego dla KRS:', krs);
    
    const cleanKRS = String(krs).padStart(10, '0');
    
    const cacheKey = `current:${cleanKRS}`;
    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('✅ KRS: Dane z cache');
            return cached.data;
        }
    }
    
    try {
        const response = await axios.get(`${KRS_API_BASE}/OdpisAktualny/${cleanKRS}`, {
            timeout: 15000,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.data || !response.data.odpis) {
            return {
                success: false,
                error: 'Nie znaleziono firmy o podanym numerze KRS'
            };
        }
        
        const parsedData = parseKRSData(response.data.odpis, 'current');
        
        cache.set(cacheKey, {
            data: parsedData,
            timestamp: Date.now()
        });
        
        console.log('✅ KRS: Dane pobrane i sparsowane');
        return parsedData;
        
    } catch (error) {
        console.error('❌ KRS Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Parsuj dane z odpisu KRS
 */
function parseKRSData(odpis, type) {
    console.log('📋 KRS: Parsowanie danych...');
    
    const dane = odpis.dane || {};
    const dzial1 = dane.dzial1 || {};
    const dzial2 = dane.dzial2 || {};
    const dzial3 = dane.dzial3 || {};
    
    // Podstawowe dane (Dział 1)
    const danePodmiotu = dzial1.danePodmiotu || {};
    
    // Nazwa - bierz pierwszą z tablicy
    const nazwa = Array.isArray(danePodmiotu.nazwa) 
        ? danePodmiotu.nazwa[0]?.nazwa 
        : danePodmiotu.nazwa;
    
    // Identyfikatory - bierz ostatni wpis (najnowszy)
    const identyfikatoryArray = Array.isArray(danePodmiotu.identyfikatory) 
        ? danePodmiotu.identyfikatory 
        : [danePodmiotu.identyfikatory];
    const identyfikatory = identyfikatoryArray[identyfikatoryArray.length - 1]?.identyfikatory || {};
    
    // KRS - z nagłówka
    const numerKRS = odpis.naglowekP?.numerKRS || danePodmiotu.numerKrs || '';
    
    // Adres (Dział 1)
    const siedzibaIAdres = dzial1.siedzibaIAdres || {};
    const adres = parseAddress(siedzibaIAdres);
    
    // Kapitał zakładowy (Dział 1)
    const kapital = parseCapital(dzial1);
    
    // Reprezentacja i zarząd (Dział 2!)
    const reprezentacja = parseManagement(dzial2);
    
    // Wspólnicy/Akcjonariusze (Dział 3)
    const wspolnicy = parsePartners(dzial3);
    
    // Przedmiot działalności (Dział 3)
    const dzialalnosc = parseBusinessActivity(dzial3);
    
    return {
        success: true,
        type: type,
        data: {
            // Podstawowe
            nazwa: nazwa || '',
            krs: numerKRS,
            nip: identyfikatory.nip || '',
            regon: identyfikatory.regon || '',
            
            // Adres
            adres: adres,
            
            // Kapitał
            kapitalZakladowy: kapital,
            
            // Zarząd i reprezentacja
            reprezentacja: reprezentacja,
            
            // Wspólnicy
            wspolnicy: wspolnicy,
            
            // Działalność
            przedmiotDzialalnosci: dzialalnosc,
            
            // Dodatkowe
            dataAktualizacji: new Date().toISOString(),
            zrodlo: 'KRS MS'
        },
        raw: odpis
    };
}

/**
 * Parsuj adres
 */
function parseAddress(siedzibaIAdres) {
    // W KRS każde pole to tablica z historią - bierz ostatni (najnowszy) wpis
    const siedzibaArray = siedzibaIAdres.siedziba || [];
    const adresArray = siedzibaIAdres.adres || [];
    
    const siedziba = Array.isArray(siedzibaArray) 
        ? siedzibaArray[siedzibaArray.length - 1] || {}
        : siedzibaArray;
    
    const adres = Array.isArray(adresArray)
        ? adresArray[adresArray.length - 1] || {}
        : adresArray;
    
    // Email i strona www
    const emailArray = siedzibaIAdres.adresPocztyElektronicznej || [];
    const wwwArray = siedzibaIAdres.adresStronyInternetowej || [];
    const email = Array.isArray(emailArray) 
        ? emailArray[emailArray.length - 1]?.adresPocztyElektronicznej 
        : '';
    const www = Array.isArray(wwwArray)
        ? wwwArray[wwwArray.length - 1]?.adresStronyInternetowej
        : '';
    
    let pelnyAdres = '';
    if (adres.ulica) pelnyAdres += `ul. ${adres.ulica} `;
    if (adres.nrDomu) pelnyAdres += adres.nrDomu;
    if (adres.nrLokalu) pelnyAdres += `/${adres.nrLokalu}`;
    if (pelnyAdres) pelnyAdres += ', ';
    if (adres.kodPocztowy) pelnyAdres += `${adres.kodPocztowy} `;
    if (siedziba.miejscowosc) pelnyAdres += siedziba.miejscowosc;
    
    return {
        pelny: pelnyAdres.trim(),
        kraj: siedziba.kraj || 'POLSKA',
        wojewodztwo: siedziba.wojewodztwo || '',
        powiat: siedziba.powiat || '',
        gmina: siedziba.gmina || '',
        miejscowosc: siedziba.miejscowosc || '',
        kodPocztowy: adres.kodPocztowy || '',
        poczta: adres.poczta || '',
        ulica: adres.ulica || '',
        nrDomu: adres.nrDomu || '',
        nrLokalu: adres.nrLokalu || '',
        email: email || '',
        www: www || ''
    };
}

/**
 * Parsuj kapitał zakładowy
 */
function parseCapital(dzial1) {
    // Kapitał jest obiektem (nie tablicą)
    const kapital = dzial1.kapital || {};
    
    // wysokoscKapitaluZakladowego to tablica z historią - bierz ostatni
    const wysokoscArray = kapital.wysokoscKapitaluZakladowego || [];
    const wysokosc = Array.isArray(wysokoscArray)
        ? wysokoscArray[wysokoscArray.length - 1] || {}
        : wysokoscArray;
    
    return {
        wartosc: wysokosc.wartosc ? parseFloat(wysokosc.wartosc.replace(/\s/g, '')) : null,
        waluta: wysokosc.waluta || 'PLN'
    };
}

/**
 * Parsuj zarząd i reprezentację
 */
function parseManagement(dzial2) {
    // reprezentacja to tablica (zwykle 1 element)
    const reprezentacjaArray = dzial2.reprezentacja || [];
    const reprezentacja = Array.isArray(reprezentacjaArray) && reprezentacjaArray.length > 0
        ? reprezentacjaArray[0]
        : {};
    
    // Sposób reprezentacji
    const sposobRepArray = reprezentacja.sposobReprezentacji || [];
    const sposobRep = Array.isArray(sposobRepArray)
        ? sposobRepArray[sposobRepArray.length - 1] || {}
        : sposobRepArray;
    const sposobReprezentacji = sposobRep.sposobReprezentacji || '';
    
    // Osoby w reprezentacji - to sklad[]!
    const osoby = reprezentacja.sklad || [];
    const zarzad = [];
    
    if (Array.isArray(osoby)) {
        osoby.forEach(osoba => {
            // Imiona i nazwiska to tablice
            const nazwiskoArray = osoba.nazwisko || [];
            const imionaArray = osoba.imiona || [];
            const funkcjaArray = osoba.funkcjaWOrganie || [];
            
            const nazwiskoObj = Array.isArray(nazwiskoArray)
                ? nazwiskoArray[nazwiskoArray.length - 1] || {}
                : nazwiskoArray;
            const imionaObj = Array.isArray(imionaArray)
                ? imionaArray[imionaArray.length - 1] || {}
                : imionaArray;
            const funkcjaObj = Array.isArray(funkcjaArray)
                ? funkcjaArray[funkcjaArray.length - 1] || {}
                : funkcjaArray;
            
            const nazwisko = nazwiskoObj.nazwisko?.nazwiskoICzlon || '';
            const imie = imionaObj.imiona?.imie || '';
            const imieDrugie = imionaObj.imiona?.imieDrugie || '';
            const funkcja = funkcjaObj.funkcjaWOrganie || '';
            
            // Ogranicz dane osobowe (RODO - gwiazdki)
            const czyZawieszona = osoba.czyZawieszona?.[0]?.czyZawieszona;
            
            if (!czyZawieszona) {  // Dodaj tylko aktywnych
                zarzad.push({
                    imie: imie,
                    imieDrugie: imieDrugie,
                    nazwisko: nazwisko,
                    funkcja: funkcja
                });
            }
        });
    }
    
    // Organ nadzoru (rada nadzorcza)
    const organNadzoruArray = dzial2.organNadzoru || [];
    const radaNadzorcza = [];
    
    if (Array.isArray(organNadzoruArray) && organNadzoruArray.length > 0) {
        // Każdy organ to obiekt ze składem (podobnie jak reprezentacja)
        organNadzoruArray.forEach(organ => {
            const sklad = organ.sklad || [];
            if (Array.isArray(sklad)) {
                sklad.forEach(osoba => {
                    const nazwiskoArray = osoba.nazwisko || [];
                    const imionaArray = osoba.imiona || [];
                    const funkcjaArray = osoba.funkcjaWOrganie || [];
                    
                    const nazwiskoObj = Array.isArray(nazwiskoArray)
                        ? nazwiskoArray[nazwiskoArray.length - 1] || {}
                        : nazwiskoArray;
                    const imionaObj = Array.isArray(imionaArray)
                        ? imionaArray[imionaArray.length - 1] || {}
                        : imionaArray;
                    const funkcjaObj = Array.isArray(funkcjaArray)
                        ? funkcjaArray[funkcjaArray.length - 1] || {}
                        : funkcjaArray;
                    
                    const nazwisko = nazwiskoObj.nazwisko?.nazwiskoICzlon || '';
                    const imie = imionaObj.imiona?.imie || '';
                    const imieDrugie = imionaObj.imiona?.imieDrugie || '';
                    const funkcja = funkcjaObj.funkcjaWOrganie || '';
                    
                    const czyZawieszona = osoba.czyZawieszona?.[0]?.czyZawieszona;
                    
                    if (!czyZawieszona) {  // Dodaj tylko aktywnych
                        radaNadzorcza.push({
                            imie: imie,
                            imieDrugie: imieDrugie,
                            nazwisko: nazwisko,
                            funkcja: funkcja
                        });
                    }
                });
            }
        });
    }
    
    return {
        sposobReprezentacji: sposobReprezentacji,
        zarzad: zarzad,
        radaNadzorcza: radaNadzorcza
    };
}

/**
 * Parsuj wspólników/akcjonariuszy
 */
function parsePartners(dzial3) {
    const wspolnicy = dzial3.wspolnicy || {};
    const wspolnikList = wspolnicy.wspolnik || [];
    
    if (!Array.isArray(wspolnikList)) {
        return [];
    }
    
    return wspolnikList.map(w => ({
        nazwa: w.nazwa || (w.imie && w.nazwisko ? `${w.imie} ${w.nazwisko}` : ''),
        udzialy: w.udzialy || null,
        wartoscUdzialow: w.wartoscUdzialow || null,
        dataWpisu: w.dataWpisu || null
    }));
}

/**
 * Parsuj przedmiot działalności
 */
function parseBusinessActivity(dzial3) {
    const dzialalnosc = dzial3.przedmiotDzialalnosci || {};
    const przedmioty = dzialalnosc.przedmiotDzialalnosci || [];
    
    if (!Array.isArray(przedmioty)) {
        return [];
    }
    
    return przedmioty.map(p => ({
        opis: p.opis || '',
        pkd: p.pkd || ''
    }));
}

/**
 * Wyczyść cache
 */
function clearCache() {
    cache.clear();
    console.log('🗑️ KRS: Cache wyczyszczony');
}

module.exports = {
    getFullReport,
    getCurrentReport,
    clearCache
};
