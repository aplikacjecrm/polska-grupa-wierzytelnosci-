const express = require('express');
const { verifyToken } = require('../middleware/auth');
const {
  searchCourts,
  getCourtById,
  getCourtsByCity,
  getCourtsByType,
  suggestCourtsForCaseType,
  COURTS_DATABASE
} = require('../utils/courts-database');

const router = express.Router();

/**
 * GET /api/courts/search?q=warszawa
 * Wyszukiwanie sądów po zapytaniu tekstowym
 */
router.get('/search', verifyToken, (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Zapytanie musi mieć minimum 2 znaki' });
  }
  
  const results = searchCourts(q);
  
  console.log(`🔍 Wyszukiwanie sądów: "${q}" → znaleziono ${results.length}`);
  
  res.json({ courts: results, count: results.length });
});

/**
 * GET /api/courts/:id
 * Pobierz szczegóły sądu po ID
 */
router.get('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  
  const court = getCourtById(id);
  
  if (!court) {
    return res.status(404).json({ error: 'Sąd nie znaleziony' });
  }
  
  res.json({ court });
});

/**
 * GET /api/courts/city/:cityName
 * Pobierz wszystkie sądy w danym mieście
 */
router.get('/city/:cityName', verifyToken, (req, res) => {
  const { cityName } = req.params;
  
  const courts = getCourtsByCity(cityName);
  
  console.log(`🏛️ Sądy w mieście: ${cityName} → znaleziono ${courts.length}`);
  
  res.json({ courts, count: courts.length, city: cityName });
});

/**
 * GET /api/courts/type/:courtType
 * Pobierz sądy według typu (rejonowy/okregowy/administracyjny)
 */
router.get('/type/:courtType', verifyToken, (req, res) => {
  const { courtType } = req.params;
  
  const courts = getCourtsByType(courtType);
  
  console.log(`⚖️ Sądy typu: ${courtType} → znaleziono ${courts.length}`);
  
  res.json({ courts, count: courts.length, type: courtType });
});

/**
 * GET /api/courts/suggest?caseType=family&city=Warszawa
 * Zasugeruj sąd dla danego typu sprawy
 */
router.get('/suggest', verifyToken, (req, res) => {
  const { caseType, city } = req.query;
  
  if (!caseType) {
    return res.status(400).json({ error: 'Parametr caseType jest wymagany' });
  }
  
  const courts = suggestCourtsForCaseType(caseType, city);
  
  console.log(`💡 Sugestie dla typu: ${caseType}, miasto: ${city || 'wszystkie'} → znaleziono ${courts.length}`);
  
  res.json({ 
    courts, 
    count: courts.length, 
    caseType, 
    city: city || 'wszystkie',
    message: courts.length > 0 
      ? `Znaleziono ${courts.length} sąd(ów) odpowiednich dla spraw typu "${caseType}"`
      : 'Nie znaleziono odpowiednich sądów'
  });
});

/**
 * GET /api/courts/all
 * Pobierz wszystkie sądy z bazy
 */
router.get('/all', verifyToken, (req, res) => {
  const courts = Object.values(COURTS_DATABASE);
  
  console.log(`📋 Pobrano wszystkie sądy: ${courts.length}`);
  
  res.json({ 
    courts, 
    count: courts.length,
    cities: [...new Set(courts.map(c => c.city))].sort(),
    types: [...new Set(courts.map(c => c.type))]
  });
});

/**
 * GET /api/courts/stats
 * Statystyki bazy sądów
 */
router.get('/stats', verifyToken, (req, res) => {
  const courts = Object.values(COURTS_DATABASE);
  
  const stats = {
    total: courts.length,
    byType: {
      rejonowy: courts.filter(c => c.type === 'rejonowy').length,
      okregowy: courts.filter(c => c.type === 'okregowy').length,
      administracyjny: courts.filter(c => c.type === 'administracyjny').length,
      gospodarczy: courts.filter(c => c.type === 'gospodarczy').length
    },
    byCity: {},
    cities: [...new Set(courts.map(c => c.city))].sort()
  };
  
  // Zlicz sądy w każdym mieście
  courts.forEach(court => {
    if (!stats.byCity[court.city]) {
      stats.byCity[court.city] = 0;
    }
    stats.byCity[court.city]++;
  });
  
  res.json({ stats });
});

module.exports = router;
