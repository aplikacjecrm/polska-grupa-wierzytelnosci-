// ==========================================
// CEIDG API ROUTES
// Endpoints dla integracji z CEIDG
// ==========================================

const express = require('express');
const router = express.Router();
const ceidgService = require('../services/api-integrations/ceidg-service');

/**
 * POST /api/company/ceidg/nip
 * Wyszukaj firmę po NIP
 */
router.post('/nip', async (req, res) => {
    console.log('📨 POST /api/company/ceidg/nip');
    
    try {
        const { nip } = req.body;
        
        if (!nip) {
            return res.status(400).json({
                success: false,
                error: 'Brak numeru NIP w zapytaniu'
            });
        }
        
        console.log('🔍 Szukam w CEIDG:', nip);
        const result = await ceidgService.searchByNIP(nip);
        
        if (result.success) {
            console.log('✅ Znaleziono firmę:', result.data.nazwa);
            return res.json(result);
        } else {
            console.log('⚠️ Nie znaleziono lub błąd:', result.error);
            return res.status(404).json(result);
        }
        
    } catch (error) {
        console.error('❌ Error in /ceidg/nip:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd serwera podczas wyszukiwania w CEIDG',
            details: error.message
        });
    }
});

/**
 * POST /api/company/ceidg/regon
 * Wyszukaj firmę po REGON
 */
router.post('/regon', async (req, res) => {
    console.log('📨 POST /api/company/ceidg/regon');
    
    try {
        const { regon } = req.body;
        
        if (!regon) {
            return res.status(400).json({
                success: false,
                error: 'Brak numeru REGON w zapytaniu'
            });
        }
        
        console.log('🔍 Szukam w CEIDG:', regon);
        const result = await ceidgService.searchByREGON(regon);
        
        if (result.success) {
            console.log('✅ Znaleziono firmę:', result.data.nazwa);
            return res.json(result);
        } else {
            console.log('⚠️ Nie znaleziono lub błąd:', result.error);
            return res.status(404).json(result);
        }
        
    } catch (error) {
        console.error('❌ Error in /ceidg/regon:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd serwera podczas wyszukiwania w CEIDG',
            details: error.message
        });
    }
});

/**
 * DELETE /api/company/ceidg/cache
 * Wyczyść cache (dla testów/admina)
 */
router.delete('/cache', async (req, res) => {
    console.log('🗑️ DELETE /api/company/ceidg/cache');
    
    try {
        ceidgService.clearCache();
        return res.json({
            success: true,
            message: 'Cache CEIDG wyczyszczony'
        });
    } catch (error) {
        console.error('❌ Error clearing cache:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd czyszczenia cache'
        });
    }
});

module.exports = router;
