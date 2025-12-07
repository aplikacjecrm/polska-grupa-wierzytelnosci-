// ==========================================
// KSeF API ROUTES
// Endpoints dla Krajowego Systemu e-Faktur
// ==========================================

const express = require('express');
const router = express.Router();
const ksef = require('../services/api-integrations/ksef-service');
const { authenticateToken } = require('../middleware/auth');

console.log('🧾 KSeF Routes załadowane');

// ==========================================
// INICJUJ SESJĘ
// ==========================================

/**
 * POST /api/ksef/session/init
 * Inicjuj sesję KSeF z tokenem (API v2)
 * Dokumentacja: https://ksef-demo.mf.gov.pl/docs/v2/index.html
 */
router.post('/session/init', authenticateToken, async (req, res) => {
    console.log('📨 POST /api/ksef/session/init');
    
    try {
        const { nip, token } = req.body;
        
        if (!nip || !token) {
            return res.status(400).json({
                success: false,
                error: 'Brak NIP lub tokena autoryzacyjnego'
            });
        }
        
        const result = await ksef.initSession(nip, token);
        
        if (result.success) {
            return res.json(result);
        } else {
            return res.status(400).json(result);
        }
        
    } catch (error) {
        console.error('❌ Error in /ksef/session/init:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd inicjowania sesji KSeF',
            details: error.message
        });
    }
});

/**
 * POST /api/ksef/session/init-xades
 * Inicjuj sesję KSeF z podpisem XAdES (dla firm z certyfikatem)
 * Dokumentacja: https://ksef-demo.mf.gov.pl/docs/v2/index.html#tag/Uzyskiwanie-dostepu
 */
router.post('/session/init-xades', authenticateToken, async (req, res) => {
    console.log('📨 POST /api/ksef/session/init-xades');
    
    try {
        const { nip, signatureXML } = req.body;
        
        if (!nip || !signatureXML) {
            return res.status(400).json({
                success: false,
                error: 'Brak NIP lub podpisu XAdES'
            });
        }
        
        const result = await ksef.initSessionWithXAdES(nip, signatureXML);
        
        if (result.success) {
            return res.json(result);
        } else {
            return res.status(400).json(result);
        }
        
    } catch (error) {
        console.error('❌ Error in /ksef/session/init-xades:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd inicjowania sesji XAdES KSeF',
            details: error.message
        });
    }
});

// ==========================================
// WYŚLIJ FAKTURĘ DO KSEF
// ==========================================

/**
 * POST /api/ksef/invoice/send
 * Wyślij fakturę do KSeF
 */
router.post('/invoice/send', authenticateToken, async (req, res) => {
    console.log('📨 POST /api/ksef/invoice/send');
    
    try {
        const { invoiceData, nip, authToken } = req.body;
        
        if (!invoiceData || !nip || !authToken) {
            return res.status(400).json({
                success: false,
                error: 'Brak wymaganych danych'
            });
        }
        
        console.log('📤 Wysyłanie faktury do KSeF dla NIP:', nip);
        const result = await ksef.sendInvoice(invoiceData, nip, authToken);
        
        if (result.success) {
            console.log('✅ Faktura wysłana do KSeF:', result.referenceNumber);
            return res.json(result);
        } else {
            console.log('⚠️ Błąd wysyłania:', result.error);
            return res.status(400).json(result);
        }
        
    } catch (error) {
        console.error('❌ Error in /ksef/invoice/send:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd wysyłania faktury do KSeF',
            details: error.message
        });
    }
});

// ==========================================
// POBIERZ FAKTURĘ Z KSEF
// ==========================================

/**
 * POST /api/ksef/invoice/get
 * Pobierz fakturę z KSeF po numerze referencyjnym
 */
router.post('/invoice/get', authenticateToken, async (req, res) => {
    console.log('📨 POST /api/ksef/invoice/get');
    
    try {
        const { referenceNumber, nip, authToken } = req.body;
        
        if (!referenceNumber || !nip || !authToken) {
            return res.status(400).json({
                success: false,
                error: 'Brak wymaganych danych'
            });
        }
        
        console.log('📥 Pobieranie faktury z KSeF:', referenceNumber);
        const result = await ksef.getInvoice(referenceNumber, nip, authToken);
        
        if (result.success) {
            console.log('✅ Faktura pobrana z KSeF');
            return res.json(result);
        } else {
            console.log('⚠️ Błąd pobierania:', result.error);
            return res.status(404).json(result);
        }
        
    } catch (error) {
        console.error('❌ Error in /ksef/invoice/get:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd pobierania faktury z KSeF',
            details: error.message
        });
    }
});

// ==========================================
// WYSZUKAJ FAKTURY
// ==========================================

/**
 * POST /api/ksef/invoice/search
 * Wyszukaj faktury w KSeF
 */
router.post('/invoice/search', authenticateToken, async (req, res) => {
    console.log('📨 POST /api/ksef/invoice/search');
    
    try {
        const { criteria, nip, authToken } = req.body;
        
        if (!criteria || !nip || !authToken) {
            return res.status(400).json({
                success: false,
                error: 'Brak wymaganych danych'
            });
        }
        
        console.log('🔍 Wyszukiwanie faktur w KSeF');
        const result = await ksef.searchInvoices(criteria, nip, authToken);
        
        if (result.success) {
            console.log(`✅ Znaleziono ${result.count} faktur`);
            return res.json(result);
        } else {
            console.log('⚠️ Błąd wyszukiwania:', result.error);
            return res.status(400).json(result);
        }
        
    } catch (error) {
        console.error('❌ Error in /ksef/invoice/search:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd wyszukiwania faktur w KSeF',
            details: error.message
        });
    }
});

// ==========================================
// POBIERZ UPO
// ==========================================

/**
 * POST /api/ksef/invoice/upo
 * Pobierz UPO (Urzędowe Poświadczenie Odbioru) dla faktury
 */
router.post('/invoice/upo', authenticateToken, async (req, res) => {
    console.log('📨 POST /api/ksef/invoice/upo');
    
    try {
        const { referenceNumber, nip, authToken } = req.body;
        
        if (!referenceNumber || !nip || !authToken) {
            return res.status(400).json({
                success: false,
                error: 'Brak wymaganych danych'
            });
        }
        
        console.log('📜 Pobieranie UPO z KSeF:', referenceNumber);
        const result = await ksef.getUPO(referenceNumber, nip, authToken);
        
        if (result.success) {
            console.log('✅ UPO pobrane');
            return res.json(result);
        } else {
            console.log('⚠️ Błąd pobierania UPO:', result.error);
            return res.status(404).json(result);
        }
        
    } catch (error) {
        console.error('❌ Error in /ksef/invoice/upo:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd pobierania UPO z KSeF',
            details: error.message
        });
    }
});

// ==========================================
// WYCZYŚĆ CACHE
// ==========================================

/**
 * DELETE /api/ksef/cache
 * Wyczyść cache sesji KSeF
 */
router.delete('/cache', authenticateToken, async (req, res) => {
    console.log('🗑️ DELETE /api/ksef/cache');
    
    try {
        ksef.clearCache();
        return res.json({
            success: true,
            message: 'Cache KSeF wyczyszczony'
        });
    } catch (error) {
        console.error('❌ Error clearing cache:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd czyszczenia cache'
        });
    }
});

// ==========================================
// INFO O ŚRODOWISKU
// ==========================================

/**
 * GET /api/ksef/info
 * Informacje o konfiguracji KSeF
 */
router.get('/info', authenticateToken, async (req, res) => {
    console.log('📨 GET /api/ksef/info');
    
    try {
        return res.json({
            success: true,
            environment: ksef.KSEF_API_BASE,
            availableEnvironments: ksef.KSEF_ENVIRONMENTS,
            status: 'Gotowy do użycia',
            features: [
                'Wysyłanie faktur',
                'Pobieranie faktur',
                'Wyszukiwanie faktur',
                'Pobieranie UPO',
                'Health check API'
            ]
        });
    } catch (error) {
        console.error('❌ Error in /ksef/info:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd pobierania informacji'
        });
    }
});

/**
 * GET /api/ksef/health
 * Sprawdź status API KSeF (Health Check)
 */
router.get('/health', authenticateToken, async (req, res) => {
    console.log('📨 GET /api/ksef/health');
    
    try {
        const result = await ksef.checkHealth();
        
        if (result.success) {
            return res.json(result);
        } else {
            return res.status(503).json(result);
        }
    } catch (error) {
        console.error('❌ Error in /ksef/health:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd sprawdzania health'
        });
    }
});

module.exports = router;

console.log('✅ KSeF Routes gotowe!');
