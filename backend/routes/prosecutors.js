const express = require('express');
const router = express.Router();
const { PROSECUTORS_DATABASE } = require('../utils/prosecutors-database');
const { verifyToken } = require('../middleware/auth');

console.log('🏛️ Ładowanie routera prokuratur...');

// Wszystkie endpointy wymagają autoryzacji
router.use(verifyToken);

/**
 * GET /prosecutors/all
 * Zwraca wszystkie prokuratury
 */
router.get('/all', (req, res) => {
  console.log('📋 Pobieranie wszystkich prokuratur...');
  
  const prosecutors = Object.values(PROSECUTORS_DATABASE);
  
  console.log(`✅ Zwracam ${prosecutors.length} prokuratur`);
  
  res.json({
    count: prosecutors.length,
    prosecutors: prosecutors
  });
});

/**
 * GET /prosecutors/search?q=query
 * Wyszukuje prokuratury po nazwie, mieście, typie
 */
router.get('/search', (req, res) => {
  const query = req.query.q || '';
  
  if (!query || query.length < 2) {
    return res.json({
      count: 0,
      prosecutors: []
    });
  }
  
  console.log(`🔍 Wyszukiwanie prokuratur: "${query}"`);
  
  const searchLower = query.toLowerCase();
  
  const results = Object.values(PROSECUTORS_DATABASE).filter(prosecutor => {
    return (
      prosecutor.name.toLowerCase().includes(searchLower) ||
      prosecutor.city.toLowerCase().includes(searchLower) ||
      prosecutor.type.toLowerCase().includes(searchLower) ||
      (prosecutor.district && prosecutor.district.toLowerCase().includes(searchLower))
    );
  });
  
  console.log(`✅ Znaleziono ${results.length} prokuratur`);
  
  res.json({
    count: results.length,
    prosecutors: results
  });
});

/**
 * GET /prosecutors/:id
 * Zwraca szczegóły konkretnej prokuratury
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  console.log(`🔍 Pobieranie prokuratury: ${id}`);
  
  const prosecutor = PROSECUTORS_DATABASE[id];
  
  if (!prosecutor) {
    console.log(`❌ Prokuratura ${id} nie znaleziona`);
    return res.status(404).json({
      error: 'Prokuratura nie znaleziona'
    });
  }
  
  console.log(`✅ Zwracam prokuraturę: ${prosecutor.name}`);
  
  res.json({
    prosecutor: prosecutor
  });
});

/**
 * GET /prosecutors/by-type/:type
 * Zwraca prokuratury danego typu (regionalna/okregowa/rejonowa)
 */
router.get('/by-type/:type', (req, res) => {
  const { type } = req.params;
  
  console.log(`🔍 Pobieranie prokuratur typu: ${type}`);
  
  const prosecutors = Object.values(PROSECUTORS_DATABASE).filter(p => p.type === type);
  
  console.log(`✅ Znaleziono ${prosecutors.length} prokuratur typu ${type}`);
  
  res.json({
    count: prosecutors.length,
    prosecutors: prosecutors
  });
});

/**
 * GET /prosecutors/by-city/:city
 * Zwraca prokuratury w danym mieście
 */
router.get('/by-city/:city', (req, res) => {
  const { city } = req.params;
  
  console.log(`🔍 Pobieranie prokuratur w mieście: ${city}`);
  
  const cityLower = city.toLowerCase();
  const prosecutors = Object.values(PROSECUTORS_DATABASE).filter(p => 
    p.city.toLowerCase() === cityLower
  );
  
  console.log(`✅ Znaleziono ${prosecutors.length} prokuratur w ${city}`);
  
  res.json({
    count: prosecutors.length,
    prosecutors: prosecutors
  });
});

/**
 * GET /prosecutors/stats
 * Zwraca statystyki prokuratur
 */
router.get('/stats', (req, res) => {
  console.log('📊 Generowanie statystyk prokuratur...');
  
  const all = Object.values(PROSECUTORS_DATABASE);
  
  const stats = {
    total: all.length,
    byType: {
      regionalna: all.filter(p => p.type === 'regionalna').length,
      okregowa: all.filter(p => p.type === 'okregowa').length,
      rejonowa: all.filter(p => p.type === 'rejonowa').length
    },
    byRegion: {}
  };
  
  // Zlicz po regionach
  all.forEach(p => {
    if (!stats.byRegion[p.region]) {
      stats.byRegion[p.region] = 0;
    }
    stats.byRegion[p.region]++;
  });
  
  console.log('✅ Statystyki wygenerowane');
  
  res.json(stats);
});

console.log('✅ prosecutors.js router loaded');

module.exports = router;
