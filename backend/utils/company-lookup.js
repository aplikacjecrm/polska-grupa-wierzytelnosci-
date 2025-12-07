// ==========================================
// WSPÓLNY HELPER DO LOOKUP FIRM
// Używany przez: clients, opposing-party
// v1.0 - 2025-11-09
// ==========================================

// Import fetch - dla Node < 18 użyj node-fetch
let fetch;
try {
  // Spróbuj native fetch (Node 18+)
  fetch = globalThis.fetch;
  if (!fetch) {
    // Fallback do node-fetch
    fetch = require('node-fetch');
    console.log('✅ Using node-fetch (Node < 18)');
  } else {
    console.log('✅ Using native fetch (Node 18+)');
  }
} catch (error) {
  console.error('❌ Fetch not available - install node-fetch: npm install node-fetch');
  fetch = null;
}

/**
 * Pobiera dane firmy z CEIDG API po NIP
 * @param {string} nip - NIP firmy (10 cyfr)
 * @returns {Object} Dane firmy lub null
 */
async function lookupByNIP(nip) {
  console.log('🔍 COMPANY-LOOKUP: Lookup NIP:', nip);
  
  if (!fetch) {
    console.error('❌ Fetch not available! Install node-fetch or upgrade to Node 18+');
    return null;
  }
  
  try {
    // CEIDG API - Publiczny endpoint (bez autoryzacji)
    // Format: dane.biznes.gov.pl/api/ceidg/v2/przedsiebiorcy
    const url = `https://dane.biznes.gov.pl/api/ceidg/v2/przedsiebiorcy`;
    const params = new URLSearchParams({
      'nip': nip,
      'status': 'Aktywny'
    });
    const fullUrl = `${url}?${params.toString()}`;
    
    console.log('📡 CEIDG URL:', fullUrl);
    
    const response = await fetch(fullUrl, {
      headers: { 
        'Accept': 'application/json'
      }
    });
    
    console.log('📥 CEIDG Response status:', response.status);
    
    if (!response.ok) {
      console.log('⚠️ CEIDG API nie odpowiedział prawidłowo, status:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('📦 CEIDG Full response:', JSON.stringify(data).substring(0, 300));
    
    // CEIDG v2 zwraca obiekt z polem "przedsiebiorcy" jako array
    const przedsiebiorcy = data.przedsiebiorcy || data.firma || [];
    
    if (!przedsiebiorcy || przedsiebiorcy.length === 0) {
      console.log('⚠️ Brak danych w CEIDG dla NIP:', nip);
      console.log('💡 Zwracam mock data jako fallback');
      return getMockDataByNIP(nip);
    }
    
    const firma = przedsiebiorcy[0];
    console.log('✅ CEIDG Firma znaleziona:', firma.nazwa || firma.firmaNazwa);
    
    // Buduj adres
    const address = buildAddress(firma.adres);
    
    const result = {
      name: firma.nazwa || null,
      nip: nip,
      regon: firma.regon || null,
      address: address,
      phone: firma.telefon || null,
      email: firma.email || null,
      status: firma.status || null,
      registrationDate: firma.dataRozpoczecia || null
    };
    
    console.log('📤 COMPANY-LOOKUP zwraca:', result);
    return result;
    
  } catch (error) {
    console.error('❌ CEIDG API Error:', error.message);
    console.log('💡 Zwracam mock data jako fallback');
    return getMockDataByNIP(nip);
  }
}

/**
 * Pobiera dane firmy z GUS API po REGON
 * @param {string} regon - REGON firmy (9 cyfr)
 * @returns {Object} Dane firmy lub null
 */
async function lookupByREGON(regon) {
  console.log('🔍 COMPANY-LOOKUP: Lookup REGON:', regon);
  
  // GUS API wymaga klucza
  const GUS_API_KEY = process.env.GUS_API_KEY;
  
  if (!GUS_API_KEY) {
    console.log('⚠️ Brak klucza GUS_API_KEY w .env');
    console.log('💡 Zarejestruj się: https://api.stat.gov.pl/Home/RegonApi');
    return null;
  }
  
  // TODO: Implementacja GUS API (SOAP)
  console.log('⚠️ GUS API nie zaimplementowane (SOAP), zwracam null');
  return null;
}

/**
 * Mock lookup po KRS (brak darmowego API)
 * @param {string} krs - Numer KRS (10+ cyfr)
 * @returns {Object} Komunikat dla użytkownika
 */
function lookupByKRS(krs) {
  console.log('🔍 COMPANY-LOOKUP: Lookup KRS:', krs);
  console.log('⚠️ KRS API nie jest darmowe');
  console.log('💡 Użytkownik powinien użyć wyszukiwarki KRS ręcznie');
  
  return {
    name: `[KRS: ${krs}] Użyj wyszukiwarki KRS`,
    krs: krs,
    address: 'Kliknij "Wyszukiwarka KRS" i skopiuj dane',
    message: 'KRS nie ma darmowego API. Pobierz dane ręcznie z wyszukiwarki.'
  };
}

/**
 * Mapuje dane z lookup na pola tabeli 'clients'
 * @param {Object} lookupData - Dane z CEIDG/GUS/KRS
 * @returns {Object} Obiekt z polami dla clients
 */
function mapToClientFields(lookupData) {
  if (!lookupData) return {};
  
  return {
    company_name: lookupData.name,
    nip: lookupData.nip || null,
    regon: lookupData.regon || null,
    krs: lookupData.krs || null,
    phone: lookupData.phone || null,
    email: lookupData.email || null,
    address_street: extractStreet(lookupData.address),
    address_city: extractCity(lookupData.address),
    address_postal: extractPostal(lookupData.address),
    notes: lookupData.status ? `Status: ${lookupData.status}` : null
  };
}

/**
 * Mapuje dane z lookup na pola tabeli 'opposing_party'
 * @param {Object} lookupData - Dane z CEIDG/GUS/KRS
 * @returns {Object} Obiekt z polami dla opposing_party
 */
function mapToOpposingFields(lookupData) {
  console.log('🗺️ COMPANY-LOOKUP: Mapowanie na opposing_party:', lookupData);
  
  if (!lookupData) {
    console.log('⚠️ Brak danych do mapowania');
    return {};
  }
  
  const mapped = {
    name: lookupData.name,
    nip: lookupData.nip || null,
    regon: lookupData.regon || null,
    krs: lookupData.krs || null,
    phone: lookupData.phone || null,
    email: lookupData.email || null,
    address: lookupData.address || null,
    party_type: lookupData.nip || lookupData.krs ? 'company' : 'individual',
    financial_status: lookupData.status || 'unknown'
  };
  
  console.log('✅ Zmapowane dane:', mapped);
  return mapped;
}

// ==========================================
// POMOCNICZE FUNKCJE
// ==========================================

/**
 * Buduje pełny adres z obiektu CEIDG
 */
function buildAddress(adresObj) {
  if (!adresObj) return null;
  
  const parts = [];
  
  if (adresObj.ulica) {
    parts.push(`ul. ${adresObj.ulica}`);
  }
  if (adresObj.nrDomu) {
    parts.push(adresObj.nrDomu);
  }
  if (adresObj.nrLokalu) {
    parts.push(`/${adresObj.nrLokalu}`);
  }
  
  let street = parts.join(' ');
  
  const cityParts = [];
  if (adresObj.kodPocztowy) {
    cityParts.push(adresObj.kodPocztowy);
  }
  if (adresObj.miejscowosc) {
    cityParts.push(adresObj.miejscowosc);
  }
  
  let city = cityParts.join(' ');
  
  if (street && city) {
    return `${street}, ${city}`;
  } else if (street) {
    return street;
  } else if (city) {
    return city;
  }
  
  return null;
}

/**
 * Wyciąga ulicę z pełnego adresu
 */
function extractStreet(fullAddress) {
  if (!fullAddress) return null;
  
  const parts = fullAddress.split(',');
  return parts[0]?.trim() || null;
}

/**
 * Wyciąga miasto z pełnego adresu
 */
function extractCity(fullAddress) {
  if (!fullAddress) return null;
  
  const parts = fullAddress.split(',');
  if (parts.length < 2) return null;
  
  const cityPart = parts[1].trim();
  // Usuń kod pocztowy
  return cityPart.replace(/^\d{2}-\d{3}\s+/, '');
}

/**
 * Wyciąga kod pocztowy z pełnego adresu
 */
function extractPostal(fullAddress) {
  if (!fullAddress) return null;
  
  const match = fullAddress.match(/\d{2}-\d{3}/);
  return match ? match[0] : null;
}

/**
 * Mock data - używane gdy CEIDG API nie odpowiada
 */
function getMockDataByNIP(nip) {
  console.log('📦 Zwracam MOCK DATA dla NIP:', nip);
  return {
    name: 'ACME SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ',
    nip: nip,
    regon: '123456789',
    krs: '0000123456',
    address: 'ul. Przykładowa 123, 00-001 Warszawa',
    phone: '+48 22 123 45 67',
    email: 'kontakt@acme.pl',
    status: 'Aktywna (DANE TESTOWE - CEIDG nie odpowiedział)'
  };
}

// ==========================================
// EKSPORT
// ==========================================

console.log('✅ COMPANY-LOOKUP helper loaded');

module.exports = {
  lookupByNIP,
  lookupByREGON,
  lookupByKRS,
  mapToClientFields,
  mapToOpposingFields
};
