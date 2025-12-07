// ==========================================
// KSeF API SERVICE v2
// Krajowy System e-Faktur - Ministerstwo Finansów
// API: https://ksef-demo.mf.gov.pl/
// Dokumentacja: https://ksef-demo.mf.gov.pl/docs/v2/index.html
// ==========================================

const axios = require('axios');

// Środowiska KSeF (API v2)
const KSEF_ENVIRONMENTS = {
    test: 'https://ksef-test.mf.gov.pl/api/v2',
    demo: 'https://ksef-demo.mf.gov.pl/api/v2',
    prod: 'https://ksef.mf.gov.pl/api/v2'
};

// Domyślnie DEMO (zmień na prod w produkcji)
const KSEF_API_BASE = KSEF_ENVIRONMENTS.demo;

// Cache tokenów (sesje)
const sessionCache = new Map();

console.log('🧾 KSeF Service załadowany');
console.log('📍 Środowisko:', KSEF_API_BASE);

// ==========================================
// AUTORYZACJA - SESJA INTERAKTYWNA
// ==========================================

/**
 * Inicjuj sesję interaktywną z tokenem (API v2)
 * Wymaga: NIP + Token autoryzacyjny
 * Dokumentacja: https://ksef-demo.mf.gov.pl/docs/v2/index.html#tag/Sesja/paths/~1api~1v2~1online~1Session~1InitToken/post
 */
async function initSession(nip, token) {
    console.log('🔐 KSeF: Inicjowanie sesji dla NIP:', nip);
    
    try {
        const response = await axios.post(
            `${KSEF_API_BASE}/online/Session/InitToken`,
            {
                contextIdentifier: {
                    type: 'onip',
                    identifier: nip
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'SessionToken': token
                },
                timeout: 30000
            }
        );
        
        if (response.data && response.data.sessionToken) {
            const sessionToken = response.data.sessionToken.token;
            const referenceNumber = response.data.referenceNumber;
            
            // Zapisz do cache
            sessionCache.set(nip, {
                token: sessionToken,
                referenceNumber,
                timestamp: Date.now(),
                expiresIn: 3600000 // 1 godzina
            });
            
            console.log('✅ KSeF: Sesja zainicjowana:', referenceNumber);
            
            return {
                success: true,
                sessionToken,
                referenceNumber
            };
        }
        
        return {
            success: false,
            error: 'Brak tokena w odpowiedzi'
        };
        
    } catch (error) {
        console.error('❌ KSeF Session Error:', error.message);
        return {
            success: false,
            error: error.response?.data?.exception?.message || error.message,
            details: error.response?.data
        };
    }
}

/**
 * Inicjuj sesję z podpisem XAdES (API v2)
 * Dla firm z certyfikatem kwalifikowanym
 * Dokumentacja: https://ksef-demo.mf.gov.pl/docs/v2/index.html#tag/Uzyskiwanie-dostepu/paths/~1api~1v2~1auth~1xades-signature/post
 */
async function initSessionWithXAdES(nip, signatureXML) {
    console.log('🔐 KSeF: Inicjowanie sesji XAdES dla NIP:', nip);
    
    try {
        const response = await axios.post(
            `${KSEF_API_BASE}/auth/xades-signature`,
            {
                contextIdentifier: {
                    type: 'onip',
                    identifier: nip
                },
                signatureXML: signatureXML
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000
            }
        );
        
        if (response.data && response.data.sessionToken) {
            const sessionToken = response.data.sessionToken.token;
            const referenceNumber = response.data.referenceNumber;
            
            // Zapisz do cache
            sessionCache.set(nip, {
                token: sessionToken,
                referenceNumber,
                timestamp: Date.now(),
                expiresIn: 3600000
            });
            
            console.log('✅ KSeF: Sesja XAdES zainicjowana:', referenceNumber);
            
            return {
                success: true,
                sessionToken,
                referenceNumber
            };
        }
        
        return {
            success: false,
            error: 'Brak tokena w odpowiedzi'
        };
        
    } catch (error) {
        console.error('❌ KSeF XAdES Error:', error.message);
        return {
            success: false,
            error: error.response?.data?.exception?.message || error.message,
            details: error.response?.data
        };
    }
}

/**
 * Pobierz token sesji (z cache lub utwórz nowy)
 */
async function getSessionToken(nip, authToken) {
    // Sprawdź cache
    if (sessionCache.has(nip)) {
        const cached = sessionCache.get(nip);
        const age = Date.now() - cached.timestamp;
        
        if (age < cached.expiresIn) {
            console.log('✅ KSeF: Token z cache');
            return cached.token;
        }
    }
    
    // Utwórz nową sesję
    const session = await initSession(nip, authToken);
    return session.success ? session.sessionToken : null;
}

// ==========================================
// WYSYŁANIE FAKTURY
// ==========================================

/**
 * Wyślij fakturę do KSeF
 * @param {Object} invoiceData - Dane faktury (FA XML lub JSON)
 * @param {String} nip - NIP sprzedawcy
 * @param {String} authToken - Token autoryzacyjny
 */
async function sendInvoice(invoiceData, nip, authToken) {
    console.log('📤 KSeF: Wysyłanie faktury');
    
    try {
        // Pobierz token sesji
        const sessionToken = await getSessionToken(nip, authToken);
        
        if (!sessionToken) {
            return {
                success: false,
                error: 'Nie udało się uzyskać tokena sesji'
            };
        }
        
        // Konwertuj dane faktury do formatu FA_VAT
        const faXml = convertToFAFormat(invoiceData);
        
        // Wyślij fakturę
        const response = await axios.put(
            `${KSEF_API_BASE}/online/Invoice/Send`,
            {
                invoiceHash: {
                    hashSHA: calculateSHA256(faXml),
                    fileSize: Buffer.byteLength(faXml, 'utf8')
                },
                invoicePayload: {
                    type: 'plain',
                    invoiceBody: Buffer.from(faXml).toString('base64')
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'SessionToken': sessionToken
                },
                timeout: 60000
            }
        );
        
        if (response.data && response.data.elementReferenceNumber) {
            console.log('✅ KSeF: Faktura wysłana:', response.data.elementReferenceNumber);
            
            return {
                success: true,
                referenceNumber: response.data.elementReferenceNumber,
                processingCode: response.data.processingCode,
                processingDescription: response.data.processingDescription,
                timestamp: response.data.timestamp
            };
        }
        
        return {
            success: false,
            error: 'Brak numeru referencyjnego w odpowiedzi'
        };
        
    } catch (error) {
        console.error('❌ KSeF Send Error:', error.message);
        return {
            success: false,
            error: error.response?.data?.exception?.message || error.message,
            details: error.response?.data
        };
    }
}

// ==========================================
// POBIERANIE FAKTURY
// ==========================================

/**
 * Pobierz fakturę z KSeF po numerze referencyjnym
 */
async function getInvoice(referenceNumber, nip, authToken) {
    console.log('📥 KSeF: Pobieranie faktury:', referenceNumber);
    
    try {
        const sessionToken = await getSessionToken(nip, authToken);
        
        if (!sessionToken) {
            return {
                success: false,
                error: 'Nie udało się uzyskać tokena sesji'
            };
        }
        
        const response = await axios.get(
            `${KSEF_API_BASE}/online/Invoice/Get/${referenceNumber}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'SessionToken': sessionToken
                },
                timeout: 30000
            }
        );
        
        if (response.data) {
            console.log('✅ KSeF: Faktura pobrana');
            
            // Dekoduj base64
            const invoiceXml = Buffer.from(response.data.invoiceBody, 'base64').toString('utf8');
            
            return {
                success: true,
                invoice: parseInvoiceXML(invoiceXml),
                raw: invoiceXml,
                metadata: {
                    referenceNumber: response.data.elementReferenceNumber,
                    acquisitionTimestamp: response.data.acquisitionTimestamp
                }
            };
        }
        
        return {
            success: false,
            error: 'Brak danych w odpowiedzi'
        };
        
    } catch (error) {
        console.error('❌ KSeF Get Error:', error.message);
        return {
            success: false,
            error: error.response?.data?.exception?.message || error.message
        };
    }
}

// ==========================================
// WYSZUKIWANIE FAKTUR
// ==========================================

/**
 * Wyszukaj faktury (otrzymane lub wystawione)
 */
async function searchInvoices(criteria, nip, authToken) {
    console.log('🔍 KSeF: Wyszukiwanie faktur');
    
    try {
        const sessionToken = await getSessionToken(nip, authToken);
        
        if (!sessionToken) {
            return {
                success: false,
                error: 'Nie udało się uzyskać tokena sesji'
            };
        }
        
        const response = await axios.post(
            `${KSEF_API_BASE}/online/Query/Invoice/Sync`,
            {
                queryCriteria: {
                    subjectType: criteria.type || 'subject1', // subject1 = wystawione, subject2 = otrzymane
                    invoicingDateFrom: criteria.dateFrom,
                    invoicingDateTo: criteria.dateTo,
                    ...criteria
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'SessionToken': sessionToken
                },
                timeout: 30000
            }
        );
        
        if (response.data && response.data.invoiceHeaderList) {
            console.log(`✅ KSeF: Znaleziono ${response.data.numberOfElements} faktur`);
            
            return {
                success: true,
                count: response.data.numberOfElements,
                invoices: response.data.invoiceHeaderList
            };
        }
        
        return {
            success: true,
            count: 0,
            invoices: []
        };
        
    } catch (error) {
        console.error('❌ KSeF Search Error:', error.message);
        return {
            success: false,
            error: error.response?.data?.exception?.message || error.message
        };
    }
}

// ==========================================
// POBIERZ UPO (Urzędowe Poświadczenie Odbioru)
// ==========================================

/**
 * Pobierz UPO dla faktury
 */
async function getUPO(referenceNumber, nip, authToken) {
    console.log('📜 KSeF: Pobieranie UPO:', referenceNumber);
    
    try {
        const sessionToken = await getSessionToken(nip, authToken);
        
        if (!sessionToken) {
            return {
                success: false,
                error: 'Nie udało się uzyskać tokena sesji'
            };
        }
        
        const response = await axios.get(
            `${KSEF_API_BASE}/online/Invoice/Upo/${referenceNumber}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'SessionToken': sessionToken
                },
                timeout: 30000
            }
        );
        
        if (response.data && response.data.upo) {
            console.log('✅ KSeF: UPO pobrane');
            
            return {
                success: true,
                upo: response.data.upo,
                timestamp: response.data.timestamp,
                referenceNumber
            };
        }
        
        return {
            success: false,
            error: 'Brak UPO w odpowiedzi'
        };
        
    } catch (error) {
        console.error('❌ KSeF UPO Error:', error.message);
        return {
            success: false,
            error: error.response?.data?.exception?.message || error.message
        };
    }
}

// ==========================================
// POMOCNICZE FUNKCJE
// ==========================================

/**
 * Konwertuj dane faktury do formatu FA_VAT (XML)
 */
function convertToFAFormat(invoiceData) {
    // To jest uproszczona wersja - w produkcji użyj biblioteki XML builder
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Faktura xmlns="http://crd.gov.pl/wzor/2023/06/29/12648/">
    <Naglowek>
        <KodFormularza kodSystemowy="FA(2)" wersjaSchemy="1-0E">FA</KodFormularza>
        <WariantFormularza>2</WariantFormularza>
        <DataWytworzeniaFa>${new Date().toISOString().split('T')[0]}</DataWytworzeniaFa>
        <SystemInfo>Pro Meritum CRM v1.0</SystemInfo>
    </Naglowek>
    <Podmiot1>
        <DaneIdentyfikacyjne>
            <NIP>${invoiceData.sellerNIP}</NIP>
            <Nazwa>${invoiceData.sellerName}</Nazwa>
        </DaneIdentyfikacyjne>
        <Adres>
            <KodKraju>PL</KodKraju>
            <AdresL1>${invoiceData.sellerAddress}</AdresL1>
        </Adres>
    </Podmiot1>
    <Fa>
        <KodWaluty>PLN</KodWaluty>
        <P_1>${invoiceData.invoiceDate}</P_1>
        <P_2>${invoiceData.invoiceNumber}</P_2>
        <P_13_1>${invoiceData.amount}</P_13_1>
        <P_15>${invoiceData.amount}</P_15>
    </Fa>
</Faktura>`;
    
    return xml;
}

/**
 * Parsuj XML faktury do obiektu JS
 */
function parseInvoiceXML(xml) {
    // Uproszczone parsowanie - w produkcji użyj xml2js
    return {
        parsed: false,
        raw: xml,
        message: 'Pełne parsowanie wymaga biblioteki xml2js'
    };
}

/**
 * Oblicz hash SHA256
 */
function calculateSHA256(data) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data, 'utf8').digest('base64');
}

/**
 * Wyczyść cache sesji
 */
function clearCache() {
    sessionCache.clear();
    console.log('🗑️ KSeF: Cache wyczyszczony');
}

/**
 * Sprawdź status API KSeF (Health Check)
 */
async function checkHealth() {
    console.log('🏥 KSeF: Sprawdzanie health');
    
    try {
        const response = await axios.get(`${KSEF_API_BASE}/common/Status`, {
            timeout: 10000
        });
        
        if (response.data) {
            console.log('✅ KSeF API:', response.data.status);
            return {
                success: true,
                ...response.data
            };
        }
        
        return {
            success: false,
            error: 'Brak odpowiedzi'
        };
        
    } catch (error) {
        console.error('❌ KSeF Health Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// ==========================================
// EKSPORT
// ==========================================

module.exports = {
    // Autoryzacja
    initSession,
    initSessionWithXAdES,
    getSessionToken,
    
    // Faktury
    sendInvoice,
    getInvoice,
    searchInvoices,
    getUPO,
    
    // Utility
    clearCache,
    checkHealth,
    
    // Konfiguracja
    KSEF_API_BASE,
    KSEF_ENVIRONMENTS
};

console.log('✅ KSeF Service v2 gotowy!');
