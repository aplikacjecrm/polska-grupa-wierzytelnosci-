// ==========================================
// CEPiK API ROUTES
// Endpoints dla integracji z CEPiK
// ==========================================

const express = require('express');
const router = express.Router();
const cepikService = require('../services/api-integrations/cepik-service');

/**
 * POST /api/vehicle/cepik/search
 * Wyszukaj pojazdy
 */
router.post('/search', async (req, res) => {
    console.log('📨 POST /api/vehicle/cepik/search');
    
    try {
        const params = req.body;
        
        console.log('🔍 Parametry wyszukiwania:', params);
        const result = await cepikService.searchVehicles(params);
        
        if (result.success) {
            console.log(`✅ Znaleziono ${result.count} pojazdów`);
            return res.json(result);
        } else {
            console.log('⚠️ Błąd lub brak wyników');
            return res.status(400).json(result);
        }
        
    } catch (error) {
        console.error('❌ Error in /cepik/search:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd serwera podczas wyszukiwania w CEPiK',
            details: error.message
        });
    }
});

/**
 * GET /api/vehicle/cepik/dictionaries
 * Pobierz słowniki
 */
router.get('/dictionaries', async (req, res) => {
    console.log('📨 GET /api/vehicle/cepik/dictionaries');
    
    try {
        const result = await cepikService.getDictionaries();
        
        if (result.success) {
            console.log('✅ Słowniki pobrane');
            return res.json(result);
        } else {
            return res.status(500).json(result);
        }
        
    } catch (error) {
        console.error('❌ Error in /cepik/dictionaries:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd pobierania słowników',
            details: error.message
        });
    }
});

/**
 * GET /api/vehicle/cepik/statistics/:aggregateBy
 * Pobierz statystyki pojazdów
 * aggregateBy: marka, rok_produkcji, rodzaj_paliwa, wojewodztwo
 */
router.get('/statistics/:aggregateBy', async (req, res) => {
    console.log('📨 GET /api/vehicle/cepik/statistics');
    
    try {
        const { aggregateBy } = req.params;
        
        const allowedAggregates = ['marka', 'rok_produkcji', 'rodzaj_paliwa', 'wojewodztwo'];
        if (!allowedAggregates.includes(aggregateBy)) {
            return res.status(400).json({
                success: false,
                error: `Nieprawidłowy parametr agregacji. Dozwolone: ${allowedAggregates.join(', ')}`
            });
        }
        
        const result = await cepikService.getStatistics(aggregateBy);
        
        if (result.success) {
            console.log(`✅ Statystyki ${aggregateBy} pobrane`);
            return res.json(result);
        } else {
            return res.status(500).json(result);
        }
        
    } catch (error) {
        console.error('❌ Error in /cepik/statistics:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd pobierania statystyk',
            details: error.message
        });
    }
});

/**
 * DELETE /api/vehicle/cepik/cache
 * Wyczyść cache
 */
router.delete('/cache', async (req, res) => {
    console.log('🗑️ DELETE /api/vehicle/cepik/cache');
    
    try {
        cepikService.clearCache();
        return res.json({
            success: true,
            message: 'Cache CEPiK wyczyszczony'
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
