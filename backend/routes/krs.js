// ==========================================
// KRS API ROUTES
// Endpoints dla integracji z KRS
// ==========================================

const express = require('express');
const router = express.Router();
const krsService = require('../services/api-integrations/krs-service');

/**
 * POST /api/company/krs/full
 * Pobierz odpis pełny z KRS
 */
router.post('/full', async (req, res) => {
    console.log('📨 POST /api/company/krs/full');
    
    try {
        const { krs } = req.body;
        
        if (!krs) {
            return res.status(400).json({
                success: false,
                error: 'Brak numeru KRS w zapytaniu'
            });
        }
        
        console.log('🔍 Szukam w KRS:', krs);
        const result = await krsService.getFullReport(krs);
        
        if (result.success) {
            console.log('✅ Znaleziono firmę:', result.data.nazwa);
            return res.json(result);
        } else {
            console.log('⚠️ Nie znaleziono lub błąd:', result.error);
            return res.status(404).json(result);
        }
        
    } catch (error) {
        console.error('❌ Error in /krs/full:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd serwera podczas wyszukiwania w KRS',
            details: error.message
        });
    }
});

/**
 * POST /api/company/krs/current
 * Pobierz odpis aktualny z KRS
 */
router.post('/current', async (req, res) => {
    console.log('📨 POST /api/company/krs/current');
    
    try {
        const { krs } = req.body;
        
        if (!krs) {
            return res.status(400).json({
                success: false,
                error: 'Brak numeru KRS w zapytaniu'
            });
        }
        
        console.log('🔍 Szukam w KRS:', krs);
        const result = await krsService.getCurrentReport(krs);
        
        if (result.success) {
            console.log('✅ Znaleziono firmę:', result.data.nazwa);
            return res.json(result);
        } else {
            console.log('⚠️ Nie znaleziono lub błąd:', result.error);
            return res.status(404).json(result);
        }
        
    } catch (error) {
        console.error('❌ Error in /krs/current:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd serwera podczas wyszukiwania w KRS',
            details: error.message
        });
    }
});

/**
 * DELETE /api/company/krs/cache
 * Wyczyść cache
 */
router.delete('/cache', async (req, res) => {
    console.log('🗑️ DELETE /api/company/krs/cache');
    
    try {
        krsService.clearCache();
        return res.json({
            success: true,
            message: 'Cache KRS wyczyszczony'
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
