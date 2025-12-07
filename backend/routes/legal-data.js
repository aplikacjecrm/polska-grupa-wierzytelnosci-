/**
 * Legal Data API Routes
 * 
 * Endpointy do pobierania danych o sądach, prokuraturach, sędziach
 */

const express = require('express');
const router = express.Router();
const legalAPI = require('../utils/legal-api-helper');
const { verifyToken } = require('../middleware/auth');

// Wszystkie endpointy wymagają autoryzacji
router.use(verifyToken);

/**
 * GET /api/legal-data/courts
 * Pobiera listę sądów
 */
router.get('/courts', async (req, res) => {
    try {
        const courts = await legalAPI.getCourts();
        res.json({ success: true, courts });
    } catch (error) {
        console.error('Błąd pobierania sądów:', error);
        res.status(500).json({ error: 'Błąd pobierania listy sądów' });
    }
});

/**
 * GET /api/legal-data/prosecutors
 * Pobiera listę prokuratur
 */
router.get('/prosecutors', async (req, res) => {
    try {
        const prosecutors = await legalAPI.getProsecutors();
        res.json({ success: true, prosecutors });
    } catch (error) {
        console.error('Błąd pobierania prokuratur:', error);
        res.status(500).json({ error: 'Błąd pobierania listy prokuratur' });
    }
});

/**
 * GET /api/legal-data/judges/search?q=nazwisko
 * Wyszukuje sędziów
 */
router.get('/judges/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Brak zapytania wyszukiwania' });
        }
        
        const judges = await legalAPI.searchJudges(q);
        res.json({ success: true, judges });
    } catch (error) {
        console.error('Błąd wyszukiwania sędziów:', error);
        res.status(500).json({ error: 'Błąd wyszukiwania sędziów' });
    }
});

/**
 * GET /api/legal-data/court/:id/statistics
 * Pobiera statystyki sądu
 */
router.get('/court/:id/statistics', async (req, res) => {
    try {
        const { id } = req.params;
        const stats = await legalAPI.getCourtStatistics(id);
        res.json({ success: true, statistics: stats });
    } catch (error) {
        console.error('Błąd pobierania statystyk:', error);
        res.status(500).json({ error: 'Błąd pobierania statystyk sądu' });
    }
});

/**
 * GET /api/legal-data/check-availability
 * Sprawdza dostępność zewnętrznych API
 */
router.get('/check-availability', async (req, res) => {
    try {
        const availability = await legalAPI.checkAPIAvailability();
        res.json({ success: true, availability });
    } catch (error) {
        console.error('Błąd sprawdzania dostępności:', error);
        res.status(500).json({ error: 'Błąd sprawdzania dostępności API' });
    }
});

module.exports = router;
