/**
 * API Routes: Employee Dashboard HR
 * FIXED: Changed from async/await to callback-based API for SQLite3
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');
const { 
  canViewAllEmployees, 
  canAssignTasks, 
  canEditProfiles, 
  canAddReviews,
  isInGroup,
  ROLE_GROUPS 
} = require('../middleware/permissions');

// Helper: Sprawdź czy użytkownik może zobaczyć dane pracownika
function canViewEmployeeData(req, targetUserId) {
  const userRole = req.user.user_role || req.user.role;
  const userId = req.user.userId || req.user.id;
  
  console.log('🔍 canViewEmployeeData check:', { userRole, userId, targetUserId });
  
  // Admin, lawyer, manager, reception widzą wszystkich
  if (isInGroup(userRole, 'STAFF')) {
    console.log('✅ User is STAFF - access granted');
    return true;
  }
  
  // Pracownik widzi tylko siebie
  if (userId === parseInt(targetUserId)) {
    console.log('✅ User viewing own profile - access granted');
    return true;
  }
  
  // Klient widzi tylko siebie (jeśli ma dashboard)
  if (userRole === 'client' && userId === parseInt(targetUserId)) {
    console.log('✅ Client viewing own profile - access granted');
    return true;
  }
  
  console.log('❌ Access denied');
  return false;
}

/**
 * GET /api/employees
 * Lista wszystkich pracowników (dla staff)
 */
router.get('/', verifyToken, canViewAllEmployees, (req, res) => {
  const db = getDatabase();
  
  db.all(`
    SELECT 
      id, name, email, user_role, initials, avatar, status, last_seen
    FROM users
    WHERE user_role IN ('admin', 'lawyer', 'client_manager', 'case_manager', 'reception')
    ORDER BY name ASC
  `, (err, employees) => {
    if (err) {
      console.error('❌ Błąd pobierania pracowników:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    res.json({ success: true, employees, count: employees.length });
  });
});

/**
 * GET /api/employees/:userId/profile
 * Profil pracownika + statystyki
 */
router.get('/:userId/profile', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  
  if (!canViewEmployeeData(req, targetUserId)) {
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  db.get(`SELECT * FROM users WHERE id = ?`, [targetUserId], (err, user) => {
    if (err || !user) {
      console.error('❌ Błąd pobierania użytkownika:', err);
      return res.status(404).json({ success: false, message: 'Użytkownik nie znaleziony' });
    }
    
    db.get(`SELECT * FROM employee_profiles WHERE user_id = ?`, [targetUserId], (err, profile) => {
      if (err) console.error('Błąd profilu:', err);
      
      // Statystyki - pobieraj równolegle
      Promise.all([
        new Promise((resolve) => db.get(`SELECT COUNT(*) as count FROM cases WHERE assigned_to = ?`, [targetUserId], (e, r) => resolve(r?.count || 0))),
        new Promise((resolve) => db.get(`SELECT COUNT(DISTINCT client_id) as count FROM cases WHERE assigned_to = ?`, [targetUserId], (e, r) => resolve(r?.count || 0))),
        new Promise((resolve) => db.get(`SELECT COUNT(*) as count FROM employee_tasks WHERE assigned_to = ?`, [targetUserId], (e, r) => resolve(r?.count || 0))),
        new Promise((resolve) => db.get(`SELECT COUNT(*) as count FROM employee_tasks WHERE assigned_to = ? AND status = 'completed'`, [targetUserId], (e, r) => resolve(r?.count || 0))),
      ]).then(([total_cases, total_clients, total_tasks, completed_tasks]) => {
        // Check if online (last 5 min)
        user.is_online = user.last_seen && (new Date() - new Date(user.last_seen)) < 5 * 60 * 1000;
        
        res.json({
          success: true,
          user,
          profile: profile || null,
          stats: { total_cases, total_clients, total_tasks, completed_tasks }
        });
      });
    });
  });
});

/**
 * PUT /api/employees/:userId/profile
 * Aktualizuj profil pracownika (tylko admin)
 */
router.put('/:userId/profile', verifyToken, canEditProfiles, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  const { phone, position, department, hire_date, bio, avatar_url } = req.body;
  
  db.get(`SELECT id FROM employee_profiles WHERE user_id = ?`, [targetUserId], (err, existing) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    if (existing) {
      // UPDATE
      db.run(`
        UPDATE employee_profiles SET
          phone = ?, position = ?, department = ?, hire_date = ?, bio = ?, avatar_url = ?
        WHERE user_id = ?
      `, [phone, position, department, hire_date, bio, avatar_url, targetUserId], (err) => {
        if (err) {
          console.error('❌ Błąd aktualizacji profilu:', err);
          return res.status(500).json({ success: false, message: 'Błąd serwera' });
        }
        res.json({ success: true, message: 'Profil zaktualizowany' });
      });
    } else {
      // INSERT
      db.run(`
        INSERT INTO employee_profiles (user_id, phone, position, department, hire_date, bio, avatar_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [targetUserId, phone, position, department, hire_date, bio, avatar_url], (err) => {
        if (err) {
          console.error('❌ Błąd tworzenia profilu:', err);
          return res.status(500).json({ success: false, message: 'Błąd serwera' });
        }
        res.json({ success: true, message: 'Profil utworzony' });
      });
    }
  });
});

/**
 * GET /api/employees/:userId/activity
 * Historia aktywności pracownika
 */
router.get('/:userId/activity', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  const { limit = 50, offset = 0 } = req.query;
  
  if (!canViewEmployeeData(req, targetUserId)) {
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  db.all(`
    SELECT * FROM employee_activity_logs 
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `, [targetUserId, parseInt(limit), parseInt(offset)], (err, activities) => {
    if (err) {
      console.error('❌ Błąd pobierania aktywności:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    db.get(`SELECT COUNT(*) as count FROM employee_activity_logs WHERE user_id = ?`, [targetUserId], (e, total) => {
      res.json({
        success: true,
        activities,
        pagination: { total: total?.count || 0, limit: parseInt(limit), offset: parseInt(offset) }
      });
    });
  });
});

/**
 * GET /api/employees/:userId/login-history
 * Historia logowań + statystyki
 */
router.get('/:userId/login-history', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  const { limit = 30, offset = 0 } = req.query;
  
  if (!canViewEmployeeData(req, targetUserId)) {
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  db.all(`
    SELECT * FROM login_sessions 
    WHERE user_id = ?
    ORDER BY login_time DESC
    LIMIT ? OFFSET ?
  `, [targetUserId, parseInt(limit), parseInt(offset)], (err, sessions) => {
    if (err) {
      console.error('❌ Błąd pobierania historii logowań:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    // Statystyki
    Promise.all([
      new Promise((resolve) => db.get(`SELECT COUNT(*) as count FROM login_sessions WHERE user_id = ?`, [targetUserId], (e, r) => resolve(r?.count || 0))),
      new Promise((resolve) => db.get(`SELECT AVG(duration_seconds) as avg FROM login_sessions WHERE user_id = ? AND duration_seconds IS NOT NULL`, [targetUserId], (e, r) => resolve(r?.avg ? (r.avg / 3600).toFixed(2) : 0))),
      new Promise((resolve) => db.get(`SELECT SUM(duration_seconds) as total FROM login_sessions WHERE user_id = ? AND strftime('%Y-%m', login_time) = strftime('%Y-%m', 'now') AND duration_seconds IS NOT NULL`, [targetUserId], (e, r) => resolve(r?.total ? (r.total / 3600).toFixed(2) : 0)))
    ]).then(([total_sessions, avg_duration_hours, total_hours_this_month]) => {
      res.json({
        success: true,
        sessions,
        stats: { total_sessions, avg_duration_hours, total_hours_this_month }
      });
    });
  });
});

/**
 * GET /api/employees/:userId/tasks
 * Zadania pracownika
 */
router.get('/:userId/tasks', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  
  if (!canViewEmployeeData(req, targetUserId)) {
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  db.all(`
    SELECT 
      t.*,
      u.name as assigned_by_name,
      c.case_number
    FROM employee_tasks t
    LEFT JOIN users u ON t.assigned_by = u.id
    LEFT JOIN cases c ON t.case_id = c.id
    WHERE t.assigned_to = ?
    ORDER BY 
      CASE t.status
        WHEN 'pending' THEN 1
        WHEN 'in_progress' THEN 2
        WHEN 'completed' THEN 3
        ELSE 4
      END,
      t.due_date ASC
  `, [targetUserId], (err, tasks) => {
    if (err) {
      console.error('❌ Błąd pobierania zadań:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    // Pogrupuj po statusie
    const grouped = {
      pending: tasks.filter(t => t.status === 'pending'),
      in_progress: tasks.filter(t => t.status === 'in_progress'),
      completed: tasks.filter(t => t.status === 'completed'),
      cancelled: tasks.filter(t => t.status === 'cancelled')
    };
    
    // Statystyki
    const stats = {
      total: tasks.length,
      completed: grouped.completed.length,
      overdue: tasks.filter(t => 
        t.status !== 'completed' && 
        t.due_date && 
        new Date(t.due_date) < new Date()
      ).length,
      completion_rate: tasks.length > 0 
        ? ((grouped.completed.length / tasks.length) * 100).toFixed(1) 
        : 0
    };
    
    res.json({
      success: true,
      tasks: grouped,
      stats
    });
  });
});

/**
 * POST /api/employees/:userId/tasks
 * Przypisz zadanie pracownikowi
 */
router.post('/:userId/tasks', verifyToken, canAssignTasks, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  const { title, description, priority, due_date, case_id } = req.body;
  const assignedBy = req.user.userId || req.user.id;
  
  if (!title) {
    return res.status(400).json({ success: false, message: 'Tytuł zadania jest wymagany' });
  }
  
  db.run(`
    INSERT INTO employee_tasks (
      assigned_to, assigned_by, title, description, 
      priority, due_date, case_id, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
  `, [targetUserId, assignedBy, title, description || null, priority || 'medium', due_date || null, case_id || null], function(err) {
    if (err) {
      console.error('❌ Błąd tworzenia zadania:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    res.json({ success: true, message: 'Zadanie utworzone', task_id: this.lastID });
  });
});

/**
 * GET /api/employees/:userId/reviews
 * Oceny pracownika
 */
router.get('/:userId/reviews', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  
  if (!canViewEmployeeData(req, targetUserId)) {
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  db.all(`
    SELECT r.*, u.name as reviewer_name
    FROM employee_reviews r
    LEFT JOIN users u ON r.reviewer_id = u.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `, [targetUserId], (err, reviews) => {
    if (err) {
      console.error('❌ Błąd pobierania ocen:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    res.json({ success: true, reviews });
  });
});

/**
 * POST /api/employees/:userId/reviews
 * Dodaj ocenę pracownika (tylko admin)
 */
router.post('/:userId/reviews', verifyToken, canAddReviews, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  const reviewerId = req.user.userId || req.user.id;
  const { review_type, rating, strengths, weaknesses, recommendations } = req.body;
  
  if (!review_type || !rating) {
    return res.status(400).json({ success: false, message: 'Typ oceny i rating są wymagane' });
  }
  
  db.run(`
    INSERT INTO employee_reviews (
      user_id, reviewer_id, review_type, rating, 
      strengths, weaknesses, recommendations, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')
  `, [targetUserId, reviewerId, review_type, rating, strengths || null, weaknesses || null, recommendations || null], function(err) {
    if (err) {
      console.error('❌ Błąd tworzenia oceny:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    res.json({ success: true, message: 'Ocena dodana', review_id: this.lastID });
  });
});

/**
 * GET /api/employees/stats/all
 * Statystyki wszystkich pracowników (dla staff)
 */
router.get('/stats/all', verifyToken, canViewAllEmployees, (req, res) => {
  const db = getDatabase();
  
  db.all(`
    SELECT user_role, COUNT(*) as count 
    FROM users 
    WHERE user_role IN ('admin', 'lawyer', 'client_manager', 'case_manager', 'reception')
    GROUP BY user_role
  `, (err, roleStats) => {
    if (err) {
      console.error('❌ Błąd pobierania statystyk:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    const stats = { by_role: {} };
    roleStats.forEach(r => {
      stats.by_role[r.user_role] = r.count;
    });
    
    res.json({ success: true, stats });
  });
});

module.exports = router;
