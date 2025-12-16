const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

// === POBIERZ SCENARIUSZE SPRAWY ===

// GET / z query param ?case_id=X
router.get('/', verifyToken, (req, res) => {
  const db = getDatabase();
  const { case_id } = req.query;
  
  if (!case_id) {
    return res.status(400).json({ error: 'Brak case_id' });
  }
  
  const query = `
    SELECT s.*, 
           u.name as created_by_name,
           (SELECT COUNT(*) FROM scenario_steps WHERE scenario_id = s.id) as steps_count,
           (SELECT COUNT(*) FROM scenario_steps WHERE scenario_id = s.id AND status = 'completed') as completed_steps
    FROM case_scenarios s
    LEFT JOIN users u ON s.created_by = u.id
    WHERE s.case_id = ?
    ORDER BY 
      CASE s.status
        WHEN 'active' THEN 1
        WHEN 'draft' THEN 2
        WHEN 'completed' THEN 3
        WHEN 'abandoned' THEN 4
      END,
      s.probability DESC
  `;
  
  db.all(query, [case_id], (err, scenarios) => {
    if (err) {
      console.error('❌ Błąd pobierania scenariuszy:', err);
      return res.status(500).json({ error: 'Błąd pobierania scenariuszy' });
    }
    
    res.json({ scenarios: scenarios || [] });
  });
});

// GET /case/:caseId (alternatywna ścieżka)
router.get('/case/:caseId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;
  
  const query = `
    SELECT s.*, 
           u.name as created_by_name,
           (SELECT COUNT(*) FROM scenario_steps WHERE scenario_id = s.id) as steps_count,
           (SELECT COUNT(*) FROM scenario_steps WHERE scenario_id = s.id AND status = 'completed') as completed_steps
    FROM case_scenarios s
    LEFT JOIN users u ON s.created_by = u.id
    WHERE s.case_id = ?
    ORDER BY 
      CASE s.status
        WHEN 'active' THEN 1
        WHEN 'draft' THEN 2
        WHEN 'completed' THEN 3
        WHEN 'abandoned' THEN 4
      END,
      s.probability DESC
  `;
  
  db.all(query, [caseId], (err, scenarios) => {
    if (err) {
      console.error('❌ Błąd pobierania scenariuszy:', err);
      return res.status(500).json({ error: 'Błąd pobierania scenariuszy' });
    }
    
    res.json({ scenarios: scenarios || [] });
  });
});

// === POBIERZ POJEDYNCZY SCENARIUSZ ===

router.get('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  // Pobierz scenariusz
  const scenarioQuery = `
    SELECT s.*, 
           u.name as created_by_name,
           c.case_number
    FROM case_scenarios s
    LEFT JOIN users u ON s.created_by = u.id
    LEFT JOIN cases c ON s.case_id = c.id
    WHERE s.id = ?
  `;
  
  db.get(scenarioQuery, [id], (err, scenario) => {
    if (err) {
      console.error('❌ Błąd pobierania scenariusza:', err);
      return res.status(500).json({ error: 'Błąd pobierania scenariusza' });
    }
    
    if (!scenario) {
      return res.status(404).json({ error: 'Scenariusz nie znaleziony' });
    }
    
    // Pobierz kroki
    db.all('SELECT * FROM scenario_steps WHERE scenario_id = ? ORDER BY step_number', [id], (err, steps) => {
      if (err) {
        console.error('❌ Błąd pobierania kroków:', err);
        return res.status(500).json({ error: 'Błąd pobierania kroków' });
      }
      
      scenario.steps = steps || [];
      res.json({ scenario });
    });
  });
});

// === DODAJ SCENARIUSZ ===

router.post('/', verifyToken, (req, res) => {
  const db = getDatabase();
  const userId = req.user.userId;
  const {
    case_id,
    scenario_name,
    scenario_type,
    description,
    probability,
    estimated_outcome,
    estimated_costs,
    estimated_duration_days,
    risks,
    advantages,
    requirements
  } = req.body;
  
  if (!case_id || !scenario_name) {
    return res.status(400).json({ error: 'ID sprawy i nazwa scenariusza są wymagane' });
  }
  
  db.run(
    `INSERT INTO case_scenarios (
      case_id, scenario_name, scenario_type, description, probability,
      estimated_outcome, estimated_costs, estimated_duration_days,
      risks, advantages, requirements, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      case_id, scenario_name, scenario_type || 'primary', description, probability || 50,
      estimated_outcome, estimated_costs, estimated_duration_days,
      risks, advantages, requirements, userId
    ],
    function(err) {
      if (err) {
        console.error('❌ Błąd dodawania scenariusza:', err);
        return res.status(500).json({ error: 'Błąd dodawania scenariusza' });
      }
      
      console.log('✅ Dodano scenariusz:', this.lastID);
      res.json({ success: true, scenarioId: this.lastID });
    }
  );
});

// === AKTUALIZUJ SCENARIUSZ ===

router.put('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const {
    scenario_name,
    scenario_type,
    description,
    probability,
    estimated_outcome,
    estimated_costs,
    estimated_duration_days,
    risks,
    advantages,
    requirements,
    status
  } = req.body;
  
  db.run(
    `UPDATE case_scenarios SET
      scenario_name = ?, scenario_type = ?, description = ?, probability = ?,
      estimated_outcome = ?, estimated_costs = ?, estimated_duration_days = ?,
      risks = ?, advantages = ?, requirements = ?, status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [
      scenario_name, scenario_type, description, probability,
      estimated_outcome, estimated_costs, estimated_duration_days,
      risks, advantages, requirements, status, id
    ],
    function(err) {
      if (err) {
        console.error('❌ Błąd aktualizacji scenariusza:', err);
        return res.status(500).json({ error: 'Błąd aktualizacji scenariusza' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Scenariusz nie znaleziony' });
      }
      
      res.json({ success: true });
    }
  );
});

// === AKTYWUJ SCENARIUSZ ===

router.post('/:id/activate', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  db.run(
    `UPDATE case_scenarios SET
      status = 'active',
      activated_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [id],
    function(err) {
      if (err) {
        console.error('❌ Błąd aktywacji scenariusza:', err);
        return res.status(500).json({ error: 'Błąd aktywacji scenariusza' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Scenariusz nie znaleziony' });
      }
      
      console.log('✅ Aktywowano scenariusz:', id);
      res.json({ success: true });
    }
  );
});

// === DODAJ KROK DO SCENARIUSZA ===

router.post('/:id/steps', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { step_title, step_description, responsible_person, deadline } = req.body;
  
  if (!step_title) {
    return res.status(400).json({ error: 'Tytuł kroku jest wymagany' });
  }
  
  // Pobierz najwyższy numer kroku
  db.get('SELECT MAX(step_number) as max_step FROM scenario_steps WHERE scenario_id = ?', [id], (err, row) => {
    if (err) {
      console.error('❌ Błąd pobierania kroków:', err);
      return res.status(500).json({ error: 'Błąd pobierania kroków' });
    }
    
    const nextStep = (row.max_step || 0) + 1;
    
    db.run(
      `INSERT INTO scenario_steps (scenario_id, step_number, step_title, step_description, responsible_person, deadline)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, nextStep, step_title, step_description, responsible_person, deadline],
      function(err) {
        if (err) {
          console.error('❌ Błąd dodawania kroku:', err);
          return res.status(500).json({ error: 'Błąd dodawania kroku' });
        }
        
        res.json({ success: true, stepId: this.lastID });
      }
    );
  });
});

// === AKTUALIZUJ KROK ===

router.put('/:scenarioId/steps/:stepId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { stepId } = req.params;
  const { step_title, step_description, responsible_person, deadline, status } = req.body;
  
  db.run(
    `UPDATE scenario_steps SET
      step_title = COALESCE(?, step_title),
      step_description = COALESCE(?, step_description),
      responsible_person = COALESCE(?, responsible_person),
      deadline = COALESCE(?, deadline),
      status = COALESCE(?, status),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [step_title, step_description, responsible_person, deadline, status, stepId],
    function(err) {
      if (err) {
        console.error('❌ Błąd aktualizacji kroku:', err);
        return res.status(500).json({ error: 'Błąd aktualizacji kroku' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Krok nie znaleziony' });
      }
      
      res.json({ success: true });
    }
  );
});

// === OZNACZ KROK JAKO UKOŃCZONY/NIEUKOŃCZONY ===

router.post('/:scenarioId/steps/:stepId/toggle', verifyToken, (req, res) => {
  const db = getDatabase();
  const { stepId } = req.params;
  
  db.get('SELECT status FROM scenario_steps WHERE id = ?', [stepId], (err, step) => {
    if (err) {
      console.error('❌ Błąd pobierania kroku:', err);
      return res.status(500).json({ error: 'Błąd pobierania kroku' });
    }
    
    if (!step) {
      return res.status(404).json({ error: 'Krok nie znaleziony' });
    }
    
    const newStatus = step.status === 'completed' ? 'pending' : 'completed';
    
    db.run(
      'UPDATE scenario_steps SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, stepId],
      function(err) {
        if (err) {
          console.error('❌ Błąd aktualizacji statusu:', err);
          return res.status(500).json({ error: 'Błąd aktualizacji statusu' });
        }
        
        res.json({ success: true, status: newStatus });
      }
    );
  });
});

// === USUŃ KROK ===

router.delete('/:scenarioId/steps/:stepId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { stepId } = req.params;
  
  db.run('DELETE FROM scenario_steps WHERE id = ?', [stepId], function(err) {
    if (err) {
      console.error('❌ Błąd usuwania kroku:', err);
      return res.status(500).json({ error: 'Błąd usuwania kroku' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Krok nie znaleziony' });
    }
    
    res.json({ success: true });
  });
});

// === PORÓWNAJ SCENARIUSZE ===

router.get('/compare/case/:caseId', verifyToken, (req, res) => {
  const db = getDatabase();
  const { caseId } = req.params;
  
  const query = `
    SELECT s.*, 
           u.name as created_by_name,
           (SELECT COUNT(*) FROM scenario_steps WHERE scenario_id = s.id) as steps_count,
           (SELECT COUNT(*) FROM scenario_steps WHERE scenario_id = s.id AND status = 'completed') as completed_steps,
           (SELECT GROUP_CONCAT(step_title, '||') FROM scenario_steps WHERE scenario_id = s.id ORDER BY step_number) as steps_list
    FROM case_scenarios s
    LEFT JOIN users u ON s.created_by = u.id
    WHERE s.case_id = ?
    ORDER BY s.probability DESC
  `;
  
  db.all(query, [caseId], (err, scenarios) => {
    if (err) {
      console.error('❌ Błąd pobierania scenariuszy do porównania:', err);
      return res.status(500).json({ error: 'Błąd pobierania scenariuszy' });
    }
    
    // Przetwórz dane dla porównania
    const comparison = {
      scenarios: scenarios.map(s => ({
        ...s,
        steps_list: s.steps_list ? s.steps_list.split('||') : [],
        completion_rate: s.steps_count > 0 ? Math.round((s.completed_steps / s.steps_count) * 100) : 0,
        risk_level: s.probability < 30 ? 'high' : s.probability < 60 ? 'medium' : 'low'
      })),
      summary: {
        total_scenarios: scenarios.length,
        avg_probability: scenarios.length > 0 ? Math.round(scenarios.reduce((sum, s) => sum + (s.probability || 0), 0) / scenarios.length) : 0,
        total_estimated_costs: scenarios.reduce((sum, s) => sum + (parseFloat(s.estimated_costs) || 0), 0),
        avg_duration: scenarios.length > 0 ? Math.round(scenarios.reduce((sum, s) => sum + (s.estimated_duration_days || 0), 0) / scenarios.length) : 0
      }
    };
    
    res.json(comparison);
  });
});

// === USUŃ SCENARIUSZ ===

router.delete('/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  // Usuń kroki
  db.run('DELETE FROM scenario_steps WHERE scenario_id = ?', [id], (err) => {
    if (err) {
      console.error('❌ Błąd usuwania kroków:', err);
      return res.status(500).json({ error: 'Błąd usuwania kroków' });
    }
    
    // Usuń scenariusz
    db.run('DELETE FROM case_scenarios WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('❌ Błąd usuwania scenariusza:', err);
        return res.status(500).json({ error: 'Błąd usuwania scenariusza' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Scenariusz nie znaleziony' });
      }
      
      console.log('✅ Usunięto scenariusz:', id);
      res.json({ success: true });
    });
  });
});

module.exports = router;
