/**
 * HR - Doświadczenie/CV (Experience) Routes
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

// Pobierz CV pracownika
router.get('/:userId/cv', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();
    
    const experience = await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM employee_experience WHERE employee_id = ? ORDER BY 
        CASE experience_type
          WHEN 'work' THEN 1
          WHEN 'education' THEN 2
          WHEN 'project' THEN 3
          WHEN 'skill' THEN 4
        END,
        CASE WHEN is_current = 1 THEN 0 ELSE 1 END,
        start_date DESC
      `, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Grupuj po typie
    const cv = {
      work: experience.filter(e => e.experience_type === 'work'),
      education: experience.filter(e => e.experience_type === 'education'),
      projects: experience.filter(e => e.experience_type === 'project'),
      skills: experience.filter(e => e.experience_type === 'skill')
    };
    
    res.json({ success: true, cv });
  } catch (error) {
    console.error('❌ Error getting CV:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dodaj doświadczenie
router.post('/:userId/add', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body;
    const db = getDatabase();
    
    const expId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO employee_experience (
          employee_id, experience_type, company_name, position, start_date, end_date, is_current,
          responsibilities, achievements, institution, degree, field_of_study, project_name,
          project_role, project_description, technologies, skill_name, skill_category,
          skill_level, years_of_experience, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId, data.experience_type, data.company_name, data.position, data.start_date, data.end_date, data.is_current || 0,
        data.responsibilities, data.achievements, data.institution, data.degree, data.field_of_study, data.project_name,
        data.project_role, data.project_description, data.technologies, data.skill_name, data.skill_category,
        data.skill_level, data.years_of_experience, data.notes
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    res.json({ success: true, experience_id: expId });
  } catch (error) {
    console.error('❌ Error adding experience:', error);
    res.status(500).json({ error: error.message });
  }
});

// Usuń doświadczenie
router.delete('/:expId', verifyToken, async (req, res) => {
  try {
    const { expId } = req.params;
    const db = getDatabase();
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM employee_experience WHERE id = ?', [expId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting experience:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
