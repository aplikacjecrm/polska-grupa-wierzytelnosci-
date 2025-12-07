// ==========================================
// UFG API ROUTES
// Ubezpieczeniowy Fundusz Gwarancyjny
// ==========================================

const express = require('express');
const router = express.Router();
const ufgService = require('../services/api-integrations/ufg-service');

/**
 * POST /api/vehicle/ufg/history
 * Pobierz historię pojazdu
 */
router.post('/history', async (req, res) => {
    console.log('📨 POST /api/vehicle/ufg/history');
    
    try {
        const { numerRejestracyjny } = req.body;
        
        if (!numerRejestracyjny) {
            return res.status(400).json({
                success: false,
                error: 'Brak numeru rejestracyjnego'
            });
        }
        
        console.log('🔍 Szukam historii pojazdu:', numerRejestracyjny);
        const result = await ufgService.searchVehicleHistory(numerRejestracyjny);
        
        if (result.success) {
            console.log('✅ Historia pojazdu znaleziona');
            return res.json(result);
        } else {
            console.log('⚠️ Nie znaleziono lub błąd:', result.error);
            return res.status(404).json(result);
        }
        
    } catch (error) {
        console.error('❌ Error in /ufg/history:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd serwera podczas wyszukiwania w UFG',
            details: error.message
        });
    }
});

/**
 * POST /api/vehicle/ufg/damages
 * Wyszukaj szkody komunikacyjne
 */
router.post('/damages', async (req, res) => {
    console.log('📨 POST /api/vehicle/ufg/damages');
    
    try {
        const { numerRejestracyjny, dataOd, dataDo } = req.body;
        
        if (!numerRejestracyjny) {
            return res.status(400).json({
                success: false,
                error: 'Brak numeru rejestracyjnego'
            });
        }
        
        console.log('💥 Szukam szkód dla:', numerRejestracyjny);
        const result = await ufgService.searchDamages(numerRejestracyjny, dataOd, dataDo);
        
        if (result.success) {
            console.log(`✅ Znaleziono szkody: ${result.data.szkody?.length || 0}`);
            return res.json(result);
        } else {
            return res.status(404).json(result);
        }
        
    } catch (error) {
        console.error('❌ Error in /ufg/damages:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd serwera podczas wyszukiwania szkód',
            details: error.message
        });
    }
});

/**
 * POST /api/vehicle/ufg/insurance
 * Sprawdź polisę w danym dniu
 */
router.post('/insurance', async (req, res) => {
    console.log('📨 POST /api/vehicle/ufg/insurance');
    
    try {
        const { numerRejestracyjny, data } = req.body;
        
        if (!numerRejestracyjny || !data) {
            return res.status(400).json({
                success: false,
                error: 'Brak numeru rejestracyjnego lub daty'
            });
        }
        
        console.log('📋 Sprawdzam polisę dla:', numerRejestracyjny, 'na dzień:', data);
        const result = await ufgService.checkInsurance(numerRejestracyjny, data);
        
        if (result.success) {
            console.log('✅ Polisa znaleziona');
            return res.json(result);
        } else {
            return res.status(404).json(result);
        }
        
    } catch (error) {
        console.error('❌ Error in /ufg/insurance:', error);
        return res.status(500).json({
            success: false,
            error: 'Błąd serwera podczas sprawdzania polisy',
            details: error.message
        });
    }
});

/**
 * DELETE /api/vehicle/ufg/cache
 * Wyczyść cache
 */
router.delete('/cache', async (req, res) => {
    console.log('🗑️ DELETE /api/vehicle/ufg/cache');
    
    try {
        ufgService.clearCache();
        return res.json({
            success: true,
            message: 'Cache UFG wyczyszczony'
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
