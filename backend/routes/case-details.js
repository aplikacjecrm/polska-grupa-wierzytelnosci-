// API dla szczegółów spraw (wszystkie typy)
const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

// === MAPA TABEL ===
const DETAIL_TABLES = {
  'civil': 'civil_case_details',
  'criminal': 'criminal_case_details',
  'family': 'family_case_details',
  'commercial': 'commercial_case_details',
  'administrative': 'administrative_case_details'
};

// === POBIERZ SZCZEGÓŁY SPRAWY ===
router.get('/:caseId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;
  
  // Najpierw pobierz typ sprawy
  db.get('SELECT case_type FROM cases WHERE id = ?', [caseId], (err, caseRow) => {
    if (err) {
      console.error('Błąd pobierania typu sprawy:', err);
      return res.status(500).json({ error: 'Błąd pobierania typu sprawy' });
    }
    
    if (!caseRow) {
      return res.status(404).json({ error: 'Sprawa nie znaleziona' });
    }
    
    const tableName = DETAIL_TABLES[caseRow.case_type];
    
    if (!tableName) {
      return res.json({ details: null, message: 'Brak szczegółów dla tego typu sprawy' });
    }
    
    // Pobierz szczegóły
    db.get(
      `SELECT * FROM ${tableName} WHERE case_id = ?`,
      [caseId],
      (err, details) => {
        if (err) {
          console.error(`Błąd pobierania szczegółów z ${tableName}:`, err);
          return res.status(500).json({ error: 'Błąd pobierania szczegółów' });
        }
        
        // Parsuj JSON fields
        if (details && details.extra_data) {
          try {
            details.extra_data = JSON.parse(details.extra_data);
          } catch (e) {
            console.error('Błąd parsowania extra_data:', e);
          }
        }
        
        // Parsuj specyficzne JSON fields dla family
        if (details && caseRow.case_type === 'family') {
          if (details.children_data) {
            try {
              details.children_data = JSON.parse(details.children_data);
            } catch (e) {}
          }
          if (details.assets_data) {
            try {
              details.assets_data = JSON.parse(details.assets_data);
            } catch (e) {}
          }
          if (details.debts_data) {
            try {
              details.debts_data = JSON.parse(details.debts_data);
            } catch (e) {}
          }
        }
        
        res.json({ 
          details: details || null,
          case_type: caseRow.case_type
        });
      }
    );
  });
});

// === UTWÓRZ/AKTUALIZUJ SZCZEGÓŁY ===
router.post('/:caseId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;
  const detailsData = req.body;
  
  // Pobierz typ sprawy
  db.get('SELECT case_type FROM cases WHERE id = ?', [caseId], (err, caseRow) => {
    if (err) {
      console.error('Błąd pobierania typu sprawy:', err);
      return res.status(500).json({ error: 'Błąd pobierania typu sprawy' });
    }
    
    if (!caseRow) {
      return res.status(404).json({ error: 'Sprawa nie znaleziona' });
    }
    
    const tableName = DETAIL_TABLES[caseRow.case_type];
    
    if (!tableName) {
      return res.status(400).json({ error: 'Nieobsługiwany typ sprawy' });
    }
    
    // Przygotuj dane do zapisu
    const fields = Object.keys(detailsData).filter(key => key !== 'case_id');
    
    // Stringify JSON fields
    if (detailsData.extra_data && typeof detailsData.extra_data === 'object') {
      detailsData.extra_data = JSON.stringify(detailsData.extra_data);
    }
    if (detailsData.children_data && typeof detailsData.children_data === 'object') {
      detailsData.children_data = JSON.stringify(detailsData.children_data);
    }
    if (detailsData.assets_data && typeof detailsData.assets_data === 'object') {
      detailsData.assets_data = JSON.stringify(detailsData.assets_data);
    }
    if (detailsData.debts_data && typeof detailsData.debts_data === 'object') {
      detailsData.debts_data = JSON.stringify(detailsData.debts_data);
    }
    
    // Sprawdź czy już istnieją szczegóły
    db.get(
      `SELECT id FROM ${tableName} WHERE case_id = ?`,
      [caseId],
      (err, existing) => {
        if (err) {
          console.error('Błąd sprawdzania istniejących szczegółów:', err);
          return res.status(500).json({ error: 'Błąd sprawdzania szczegółów' });
        }
        
        if (existing) {
          // UPDATE
          const setClause = fields.map(f => `${f} = ?`).join(', ');
          const values = fields.map(f => detailsData[f]);
          values.push(caseId);
          
          db.run(
            `UPDATE ${tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE case_id = ?`,
            values,
            function(err) {
              if (err) {
                console.error('Błąd aktualizacji szczegółów:', err);
                return res.status(500).json({ error: 'Błąd aktualizacji szczegółów' });
              }
              
              console.log(`✅ Zaktualizowano szczegóły sprawy ${caseId}`);
              res.json({ success: true, id: existing.id, updated: true });
            }
          );
        } else {
          // INSERT
          fields.push('case_id');
          const placeholders = fields.map(() => '?').join(', ');
          const values = fields.map(f => f === 'case_id' ? caseId : detailsData[f]);
          
          db.run(
            `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`,
            values,
            function(err) {
              if (err) {
                console.error('Błąd tworzenia szczegółów:', err);
                return res.status(500).json({ error: 'Błąd tworzenia szczegółów' });
              }
              
              console.log(`✅ Utworzono szczegóły dla sprawy ${caseId}`);
              res.json({ success: true, id: this.lastID, created: true });
            }
          );
        }
      }
    );
  });
});

// === USUŃ SZCZEGÓŁY ===
router.delete('/:caseId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;
  
  // Pobierz typ sprawy
  db.get('SELECT case_type FROM cases WHERE id = ?', [caseId], (err, caseRow) => {
    if (err) {
      console.error('Błąd pobierania typu sprawy:', err);
      return res.status(500).json({ error: 'Błąd pobierania typu sprawy' });
    }
    
    if (!caseRow) {
      return res.status(404).json({ error: 'Sprawa nie znaleziona' });
    }
    
    const tableName = DETAIL_TABLES[caseRow.case_type];
    
    if (!tableName) {
      return res.status(400).json({ error: 'Nieobsługiwany typ sprawy' });
    }
    
    db.run(
      `DELETE FROM ${tableName} WHERE case_id = ?`,
      [caseId],
      function(err) {
        if (err) {
          console.error('Błąd usuwania szczegółów:', err);
          return res.status(500).json({ error: 'Błąd usuwania szczegółów' });
        }
        
        console.log(`✅ Usunięto szczegóły sprawy ${caseId}`);
        res.json({ success: true, deleted: this.changes > 0 });
      }
    );
  });
});

// === GENERUJ PRZYKŁADOWE DANE (Development) ===
router.post('/:caseId/generate-sample', verifyToken, (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;
  
  db.get('SELECT case_type FROM cases WHERE id = ?', [caseId], (err, caseRow) => {
    if (err || !caseRow) {
      return res.status(404).json({ error: 'Sprawa nie znaleziona' });
    }
    
    const caseType = caseRow.case_type;
    let sampleData = {};
    
    // Przykładowe dane w zależności od typu
    switch (caseType) {
      case 'civil':
        sampleData = {
          civil_subtype: 'ODS',
          incident_date: '2024-05-15',
          incident_type: 'wypadek_komunikacyjny',
          incident_location: 'ul. Główna 15, Kraków',
          material_damage: 15000.00,
          personal_injury: 1,
          injury_description: 'Złamanie nogi',
          medical_costs: 5000.00,
          claimed_amount: 50000.00,
          perpetrator_name: 'Jan Kowalski',
          perpetrator_insurance: 'PZU S.A.'
        };
        break;
        
      case 'criminal':
        sampleData = {
          criminal_subtype: 'POB',
          offense_date: '2024-08-12',
          offense_location: 'ul. Słowackiego 10',
          offense_type: 'uszkodzenie_ciała',
          severity: 'średni',
          victim_injuries: 'Złamany nos, siniaki',
          accused_plea: 'not_guilty',
          alcohol_involved: 1,
          alcohol_level: 1.5
        };
        break;
        
      case 'family':
        sampleData = {
          family_case_type: 'rozwód',
          marriage_date: '2015-06-20',
          separation_date: '2024-01-10',
          fault_based: 1,
          at_fault_party: 'defendant',
          children_count: 2,
          child_support_amount: 1500.00,
          property_division: 1,
          marital_property_value: 500000.00
        };
        break;
        
      case 'commercial':
        sampleData = {
          commercial_subtype: 'GOS',
          plaintiff_company_name: 'ABC Sp. z o.o.',
          plaintiff_tax_id: '1234567890',
          defendant_company_name: 'XYZ S.A.',
          contract_value: 500000.00,
          claimed_amount: 500000.00,
          dispute_subject: 'Niewykonanie umowy dostawy'
        };
        break;
        
      case 'administrative':
        sampleData = {
          admin_subtype: 'BUD',
          authority_name: 'Urząd Miasta Kraków',
          decision_type: 'pozwolenie_na_budowę',
          permit_denied: 1,
          appeal_filed: 1
        };
        break;
    }
    
    // Zapisz przykładowe dane
    req.body = sampleData;
    router.handle({ 
      method: 'POST', 
      url: `/${caseId}`, 
      params: { caseId }, 
      body: sampleData,
      user: req.user 
    }, res);
  });
});

module.exports = router;
