/**
 * API Routes: Employee Dashboard HR
 * FIXED: Changed from async/await to callback-based API for SQLite3
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');
const { logEmployeeActivity } = require('../utils/employee-activity');
const { 
  canViewAllEmployees, 
  canAssignTasks, 
  canEditProfiles, 
  canAddReviews,
  isInGroup,
  ROLE_GROUPS 
} = require('../middleware/permissions');

// Konfiguracja multer dla uploadu umów
const contractStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'contracts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const userId = req.params.userId;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `contract-user${userId}-${uniqueSuffix}${ext}`);
  }
});

const contractUpload = multer({
  storage: contractStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Tylko pliki PDF są dozwolone!'), false);
    }
  }
});

// Konfiguracja multer dla uploadu CV
const cvStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'cv');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const userId = req.params.userId;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `cv-user${userId}-${uniqueSuffix}${ext}`);
  }
});

const cvUpload = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tylko pliki PDF, DOC, DOCX są dozwolone!'), false);
    }
  }
});

// Konfiguracja multer dla uploadu dokumentów (dyplomy, zaświadczenia)
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const userId = req.params.userId;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-user${userId}-${uniqueSuffix}${ext}`);
  }
});

const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tylko pliki PDF, JPG, PNG, DOC, DOCX są dozwolone!'), false);
    }
  }
});

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
 * GET /api/employees/stats/all
 * Statystyki wszystkich pracowników (dla staff)
 * UWAGA: Musi być PRZED endpointami z :userId aby uniknąć kolizji!
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

// ============================================
// WAŻNE: Route'y bez :userId muszą być PRZED route'ami z :userId!
// ============================================

// Storage dla załączników zadań
const taskAttachmentsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', '..', 'uploads', 'task-attachments');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const uploadTaskAttachment = multer({ storage: taskAttachmentsStorage, limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * GET /api/employees/list
 * Lista wszystkich pracowników
 */
router.get('/list', verifyToken, (req, res) => {
  const db = getDatabase();
  db.all(`SELECT id, name, email, role FROM users WHERE role != 'client' ORDER BY name`, [], (err, employees) => {
    if (err) {
      console.error('❌ Błąd pobierania pracowników:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    res.json({ success: true, employees });
  });
});

/**
 * POST /api/employees/tasks/:taskId/attachments
 */
router.post('/tasks/:taskId/attachments', verifyToken, uploadTaskAttachment.single('file'), (req, res) => {
  console.log('📤 POST /tasks/:taskId/attachments - taskId:', req.params.taskId);
  console.log('📁 File:', req.file);
  
  const db = getDatabase();
  const taskId = parseInt(req.params.taskId);
  const userId = req.user.userId || req.user.id;
  
  if (!req.file) {
    console.error('❌ Brak pliku w request');
    return res.status(400).json({ success: false, message: 'Brak pliku' });
  }
  
  console.log('💾 Zapisuję do bazy:', req.file.filename);
  
  db.run(`
    INSERT INTO task_attachments (task_id, filename, original_name, file_path, file_size, mime_type, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [taskId, req.file.filename, req.file.originalname, req.file.path, req.file.size, req.file.mimetype, userId], function(err) {
    if (err) {
      console.error('❌ Błąd dodawania załącznika do bazy:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera: ' + err.message });
    }
    console.log('✅ Załącznik zapisany, ID:', this.lastID);
    res.json({ success: true, message: 'Załącznik dodany', attachment: { id: this.lastID, filename: req.file.filename, original_name: req.file.originalname, file_size: req.file.size } });
  });
});

/**
 * GET /api/employees/tasks/:taskId/attachments
 */
router.get('/tasks/:taskId/attachments', verifyToken, (req, res) => {
  const db = getDatabase();
  const taskId = parseInt(req.params.taskId);
  
  db.all(`SELECT a.*, u.name as uploader_name FROM task_attachments a LEFT JOIN users u ON a.uploaded_by = u.id WHERE a.task_id = ? ORDER BY a.created_at DESC`, [taskId], (err, attachments) => {
    if (err) {
      console.error('❌ Błąd pobierania załączników:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    res.json({ success: true, attachments });
  });
});

/**
 * GET /api/employees/tasks/attachments/:attachmentId/download
 */
router.get('/tasks/attachments/:attachmentId/download', verifyToken, (req, res) => {
  const db = getDatabase();
  const attachmentId = parseInt(req.params.attachmentId);
  
  db.get('SELECT * FROM task_attachments WHERE id = ?', [attachmentId], (err, attachment) => {
    if (err || !attachment) {
      return res.status(404).json({ success: false, message: 'Załącznik nie znaleziony' });
    }
    res.download(attachment.file_path, attachment.original_name);
  });
});

/**
 * GET /api/employees/tasks/:taskId/comments
 * Lista komentarzy zadania
 */
router.get('/tasks/:taskId/comments', verifyToken, (req, res) => {
  const db = getDatabase();
  const taskId = parseInt(req.params.taskId);
  
  db.all(`
    SELECT c.*, u.name as author_name 
    FROM task_comments c 
    LEFT JOIN users u ON c.author_id = u.id 
    WHERE c.task_id = ? 
    ORDER BY c.created_at DESC
  `, [taskId], (err, comments) => {
    if (err) {
      console.error('❌ Błąd pobierania komentarzy:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    res.json({ success: true, comments: comments || [] });
  });
});

/**
 * POST /api/employees/tasks/:taskId/comments
 * Dodaj komentarz do zadania
 */
router.post('/tasks/:taskId/comments', verifyToken, (req, res) => {
  const db = getDatabase();
  const taskId = parseInt(req.params.taskId);
  const authorId = req.user.userId || req.user.id;
  const { content } = req.body;
  
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: 'Treść komentarza jest wymagana' });
  }
  
  db.run(`
    INSERT INTO task_comments (task_id, author_id, content, created_at)
    VALUES (?, ?, ?, datetime('now', 'localtime'))
  `, [taskId, authorId, content.trim()], function(err) {
    if (err) {
      console.error('❌ Błąd dodawania komentarza:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    res.json({ success: true, comment_id: this.lastID, message: 'Komentarz dodany' });
  });
});

// ============================================
// Route'y z :userId
// ============================================

/**
 * GET /api/employees/:userId/profile
 * Profil pracownika + statystyki
 */
router.get('/:userId/profile', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  
  console.log('📊 GET /api/employees/:userId/profile - User:', targetUserId);
  
  if (!canViewEmployeeData(req, targetUserId)) {
    console.log('❌ Brak uprawnień dla user:', req.user.userId);
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  console.log('✅ Wykonuję zapytanie SQL do users...');
  db.get(`SELECT * FROM users WHERE id = ?`, [targetUserId], (err, user) => {
    if (err || !user) {
      console.error('❌ Błąd SQL pobierania użytkownika:', err);
      return res.status(404).json({ success: false, message: 'Użytkownik nie znaleziony' });
    }
    
    db.get(`SELECT * FROM employee_profiles WHERE user_id = ?`, [targetUserId], (err, profile) => {
      if (err) console.error('Błąd profilu:', err);
      
      // Statystyki - pobieraj równolegle
      // ✅ NAPRAWIONE: Uwzględnia assigned_to, additional_caretaker i case_manager_id
      Promise.all([
        new Promise((resolve) => db.get(`
          SELECT COUNT(*) as count FROM cases 
          WHERE assigned_to = ? OR additional_caretaker = ? OR case_manager_id = ?
        `, [targetUserId, targetUserId, targetUserId], (e, r) => resolve(r?.count || 0))),
        new Promise((resolve) => db.get(`
          SELECT COUNT(DISTINCT id) as count FROM clients
          WHERE assigned_to = ? 
          OR id IN (
            SELECT DISTINCT client_id FROM cases 
            WHERE assigned_to = ? OR additional_caretaker = ? OR case_manager_id = ?
          )
        `, [targetUserId, targetUserId, targetUserId, targetUserId], (e, r) => resolve(r?.count || 0))),
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
 * PUT /api/employees/:userId/financial-data
 * Aktualizacja danych finansowych pracownika (tylko HR i Finance)
 */
router.put('/:userId/financial-data', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  const userRole = req.user.user_role || req.user.role;
  
  // Tylko HR, Finance i Admin mogą edytować
  const canEdit = ['admin', 'hr', 'finance'].includes(userRole);
  
  if (!canEdit) {
    return res.status(403).json({ success: false, message: 'Brak uprawnień do edycji danych finansowych' });
  }
  
  const {
    monthly_salary,
    bank_account,
    contract_type,
    contract_start_date,
    contract_end_date,
    tax_office,
    nip,
    insurance_type,
    work_hours_per_week,
    financial_notes
  } = req.body;
  
  console.log('💰 Aktualizacja danych finansowych dla user:', targetUserId);
  
  // Sprawdź czy profil istnieje
  db.get('SELECT id FROM employee_profiles WHERE user_id = ?', [targetUserId], (err, profile) => {
    if (err) {
      console.error('❌ Błąd sprawdzania profilu:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    if (profile) {
      // UPDATE
      db.run(`
        UPDATE employee_profiles SET
          monthly_salary = ?,
          bank_account = ?,
          contract_type = ?,
          contract_start_date = ?,
          contract_end_date = ?,
          tax_office = ?,
          nip = ?,
          insurance_type = ?,
          work_hours_per_week = ?,
          financial_notes = ?,
          updated_at = datetime('now')
        WHERE user_id = ?
      `, [
        monthly_salary, bank_account, contract_type, contract_start_date,
        contract_end_date, tax_office, nip, insurance_type,
        work_hours_per_week, financial_notes, targetUserId
      ], (err) => {
        if (err) {
          console.error('❌ Błąd aktualizacji danych finansowych:', err);
          return res.status(500).json({ success: false, message: 'Błąd serwera' });
        }
        console.log('✅ Dane finansowe zaktualizowane');
        res.json({ success: true, message: 'Dane finansowe zaktualizowane' });
      });
    } else {
      // Profil nie istnieje - utwórz z danymi finansowymi
      db.run(`
        INSERT INTO employee_profiles (
          user_id, monthly_salary, bank_account, contract_type,
          contract_start_date, contract_end_date, tax_office, nip,
          insurance_type, work_hours_per_week, financial_notes,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [
        targetUserId, monthly_salary, bank_account, contract_type,
        contract_start_date, contract_end_date, tax_office, nip,
        insurance_type, work_hours_per_week, financial_notes
      ], (err) => {
        if (err) {
          console.error('❌ Błąd tworzenia profilu z danymi finansowymi:', err);
          return res.status(500).json({ success: false, message: 'Błąd serwera' });
        }
        console.log('✅ Profil z danymi finansowymi utworzony');
        res.json({ success: true, message: 'Dane finansowe zapisane' });
      });
    }
  });
});

/**
 * GET /api/employees/:userId/activity
 * Historia aktywności pracownika
 * Parametry query:
 *   - limit: liczba wpisów (domyślnie 50)
 *   - offset: przesunięcie (domyślnie 0)
 *   - case_id: filtruj po sprawie (dla historii sprawy)
 */
router.get('/:userId/activity', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  const { limit = 50, offset = 0, case_id } = req.query;
  
  if (!canViewEmployeeData(req, targetUserId)) {
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  // KLUCZOWE: Buduj zapytanie z opcjonalnym filtrem case_id
  let query = `SELECT * FROM employee_activity_logs WHERE user_id = ?`;
  let params = [targetUserId];
  let countQuery = `SELECT COUNT(*) as count FROM employee_activity_logs WHERE user_id = ?`;
  let countParams = [targetUserId];
  
  // Jeśli jest case_id, filtruj po sprawie (dla historii sprawy)
  if (case_id) {
    query += ` AND related_case_id = ?`;
    params.push(parseInt(case_id));
    countQuery += ` AND related_case_id = ?`;
    countParams.push(parseInt(case_id));
    console.log(`📜 HISTORIA SPRAWY: Filtrowanie aktywności dla case_id=${case_id}`);
  }
  
  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(query, params, (err, activities) => {
    if (err) {
      console.error('❌ Błąd pobierania aktywności:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    db.get(countQuery, countParams, (e, total) => {
      console.log(`✅ Zwrócono ${activities.length} wpisów aktywności${case_id ? ' dla sprawy ' + case_id : ''}`);
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
  
  console.log('📊 GET /api/employees/:userId/login-history - User:', targetUserId);
  
  if (!canViewEmployeeData(req, targetUserId)) {
    console.log('❌ Brak uprawnień dla user:', req.user.userId);
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  console.log('✅ Wykonuję zapytanie SQL do login_sessions...');
  db.all(`
    SELECT * FROM login_sessions 
    WHERE user_id = ?
    ORDER BY login_time DESC
    LIMIT ? OFFSET ?
  `, [targetUserId, parseInt(limit), parseInt(offset)], (err, sessions) => {
    if (err) {
      console.error('❌ Błąd SQL pobierania historii logowań:', err);
      console.error('❌ SQL Error details:', err.message);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    console.log('✅ Znaleziono', sessions.length, 'sesji logowania');
    
    // Statystyki - obliczane na podstawie login_time i logout_time zamiast błędnego duration_seconds
    Promise.all([
      new Promise((resolve) => db.get(`SELECT COUNT(*) as count FROM login_sessions WHERE user_id = ?`, [targetUserId], (e, r) => resolve(r?.count || 0))),
      // Średnia - obliczana z różnicy czasu
      new Promise((resolve) => {
        db.all(`SELECT login_time, logout_time FROM login_sessions WHERE user_id = ? AND logout_time IS NOT NULL`, [targetUserId], (e, rows) => {
          if (!rows || rows.length === 0) return resolve(0);
          const totalSeconds = rows.reduce((sum, row) => {
            // SQLite zwraca czas w formacie 'YYYY-MM-DD HH:MM:SS', dodaj 'Z' dla UTC
            const loginStr = row.login_time.includes('Z') ? row.login_time : row.login_time.replace(' ', 'T') + 'Z';
            const logoutStr = row.logout_time.includes('Z') ? row.logout_time : row.logout_time.replace(' ', 'T') + 'Z';
            const login = new Date(loginStr);
            const logout = new Date(logoutStr);
            return sum + Math.floor((logout - login) / 1000);
          }, 0);
          const avgHours = (totalSeconds / rows.length / 3600).toFixed(2);
          resolve(avgHours);
        });
      }),
      // Suma godzin w tym miesiącu
      new Promise((resolve) => {
        db.all(`SELECT login_time, logout_time FROM login_sessions WHERE user_id = ? AND strftime('%Y-%m', login_time) = strftime('%Y-%m', 'now')`, [targetUserId], (e, rows) => {
          if (!rows || rows.length === 0) return resolve(0);
          const totalSeconds = rows.reduce((sum, row) => {
            const loginStr = row.login_time.includes('Z') ? row.login_time : row.login_time.replace(' ', 'T') + 'Z';
            const logoutStr = row.logout_time ? 
              (row.logout_time.includes('Z') ? row.logout_time : row.logout_time.replace(' ', 'T') + 'Z') : 
              new Date().toISOString();
            const login = new Date(loginStr);
            const logout = new Date(logoutStr);
            return sum + Math.floor((logout - login) / 1000);
          }, 0);
          const totalHours = (totalSeconds / 3600).toFixed(2);
          resolve(totalHours);
        });
      })
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
 * GET /api/employees/:userId/monthly-reports
 * Raporty miesięczne pracownika
 */
router.get('/:userId/monthly-reports', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  
  console.log('📊 GET monthly-reports - userId:', targetUserId, 'db:', db ? 'OK' : 'NULL');
  
  if (!db) {
    console.error('❌ Database connection is NULL!');
    return res.status(500).json({ success: false, message: 'Błąd połączenia z bazą danych' });
  }
  
  if (!canViewEmployeeData(req, targetUserId)) {
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  // Pobierz wszystkie raporty miesięczne
  db.all(`
    SELECT 
      id, report_year, report_month,
      total_work_hours, total_login_sessions, avg_session_duration,
      total_cases, total_clients,
      completed_tasks, total_tasks,
      avg_rating,
      status, generated_at
    FROM monthly_reports
    WHERE user_id = ?
    ORDER BY report_year DESC, report_month DESC
  `, [targetUserId], (err, reports) => {
    if (err) {
      console.error('❌ Błąd pobierania raportów miesięcznych:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    res.json({ success: true, reports });
  });
});

/**
 * GET /api/employees/:userId/monthly-reports/:year/:month
 * Szczegółowy raport miesięczny
 */
router.get('/:userId/monthly-reports/:year/:month', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  const year = parseInt(req.params.year);
  const month = parseInt(req.params.month);
  
  if (!canViewEmployeeData(req, targetUserId)) {
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  // Pobierz szczegółowy raport
  db.get(`
    SELECT *
    FROM monthly_reports
    WHERE user_id = ? AND report_year = ? AND report_month = ?
  `, [targetUserId, year, month], (err, report) => {
    if (err) {
      console.error('❌ Błąd pobierania raportu:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Raport nie znaleziony' });
    }
    
    // Parse JSON fields
    try {
      if (report.work_time_details) report.work_time_details = JSON.parse(report.work_time_details);
      if (report.activity_summary) report.activity_summary = JSON.parse(report.activity_summary);
    } catch (parseErr) {
      console.error('⚠️ Błąd parsowania JSON:', parseErr);
    }
    
    res.json({ success: true, report });
  });
});

/**
 * GET /api/employees/:userId/salary-history
 * Historia wypłat pracownika
 */
router.get('/:userId/salary-history', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  
  console.log('💰 GET /api/employees/:userId/salary-history - User:', targetUserId);
  
  if (!canViewEmployeeData(req, targetUserId)) {
    console.log('❌ Brak uprawnień dla user:', req.user.userId);
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  // Pobierz historię wypłat
  db.all(`
    SELECT 
      s.*,
      u.name as created_by_name
    FROM employee_salaries s
    LEFT JOIN users u ON s.created_by = u.id
    WHERE s.employee_id = ?
    ORDER BY s.year DESC, s.month DESC
    LIMIT 100
  `, [targetUserId], (err, salaries) => {
    if (err) {
      console.error('❌ Błąd pobierania historii wypłat:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    // Oblicz statystyki
    const stats = {
      totalPayments: salaries.length,
      totalGross: salaries.reduce((sum, s) => sum + (s.gross_amount || 0), 0),
      totalNet: salaries.reduce((sum, s) => sum + (s.net_amount || 0), 0),
      avgGross: salaries.length > 0 ? salaries.reduce((sum, s) => sum + (s.gross_amount || 0), 0) / salaries.length : 0,
      avgNet: salaries.length > 0 ? salaries.reduce((sum, s) => sum + (s.net_amount || 0), 0) / salaries.length : 0,
      lastPayment: salaries.length > 0 ? salaries[0] : null
    };
    
    console.log(`✅ Znaleziono ${salaries.length} wypłat dla user ${targetUserId}`);
    
    res.json({ 
      success: true, 
      salaries,
      stats
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
  
  console.log('📊 GET /api/employees/:userId/tasks - User:', targetUserId);
  
  if (!canViewEmployeeData(req, targetUserId)) {
    console.log('❌ Brak uprawnień dla user:', req.user.userId);
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  console.log('✅ Wykonuję zapytanie SQL do employee_tasks...');
  db.all(`
    SELECT 
      t.*,
      u.name as assigned_by_name
    FROM employee_tasks t
    LEFT JOIN users u ON t.assigned_by = u.id
    WHERE t.assigned_to = ?
    ORDER BY t.created_at DESC
  `, [targetUserId], (err, tasks) => {
    if (err) {
      console.error('❌ Błąd SQL pobierania zadań:', err);
      console.error('❌ SQL Error message:', err.message);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    console.log('✅ Znaleziono', tasks.length, 'zadań');
    
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
router.post('/:userId/tasks', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  const { title, description, priority, due_date, case_id, assigned_by } = req.body;
  // Użyj assigned_by z formularza lub domyślnie zalogowany użytkownik
  const assignedBy = assigned_by || req.user.userId || req.user.id;
  
  if (!title) {
    return res.status(400).json({ success: false, message: 'Tytuł zadania jest wymagany' });
  }
  
  // Generuj unikalny numer zadania TASK-YYYYMMDD-XXX
  const today = new Date();
  const dateStr = today.toISOString().slice(0,10).replace(/-/g, '');
  
  db.get(`SELECT COUNT(*) as count FROM employee_tasks WHERE date(created_at) = date('now')`, [], (err, row) => {
    const seqNum = (row?.count || 0) + 1;
    const taskNumber = `TASK-${dateStr}-${String(seqNum).padStart(3, '0')}`;
    
    db.run(`
      INSERT INTO employee_tasks (
        assigned_to, assigned_by, title, description, 
        priority, due_date, case_id, status, task_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `, [targetUserId, assignedBy, title, description || null, priority || 'medium', due_date || null, case_id || null, taskNumber], function(err) {
      if (err) {
        console.error('❌ Błąd tworzenia zadania:', err);
        return res.status(500).json({ success: false, message: 'Błąd serwera' });
      }
      
      const taskId = this.lastID;
      console.log('✅ Zadanie HR utworzone dla pracownika', { taskId, taskNumber, targetUserId, title });

      // 📊 LOGUJ AKTYWNOŚĆ DO HR DASHBOARD - używamy helpera
      logEmployeeActivity({
        userId: targetUserId,
        actionType: 'task_assigned',
        actionCategory: 'task',
        description: `Przypisano zadanie: ${title} (${taskNumber})`,
        caseId: case_id || null,
        taskId
      });
      
      res.json({ success: true, message: 'Zadanie utworzone', task_id: taskId, task_number: taskNumber });
    });
  });
});

/**
 * PUT /api/employees/tasks/:taskId
 * Aktualizuj status zadania (dla drag & drop)
 */
router.put('/tasks/:taskId', verifyToken, (req, res) => {
  const db = getDatabase();
  const taskId = parseInt(req.params.taskId);
  const { status } = req.body;
  
  if (!status || !['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Nieprawidłowy status' });
  }
  
  db.run(`
    UPDATE employee_tasks 
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [status, taskId], function(err) {
    if (err) {
      console.error('❌ Błąd aktualizacji zadania:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Zadanie nie znalezione' });
    }
    
    res.json({ success: true, message: 'Status zadania zaktualizowany' });
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
    WHERE r.employee_id = ?
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
      employee_id, reviewer_id, rating, review_text
    ) VALUES (?, ?, ?, ?)
  `, [targetUserId, reviewerId, rating, req.body.review_text || null], function(err) {
    if (err) {
      console.error('❌ Błąd tworzenia oceny:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    res.json({ success: true, message: 'Ocena dodana', review_id: this.lastID });
  });
});

/**
 * GET /api/employees/:userId/tickets
 * Tickety HR/IT pracownika
 */
router.get('/:userId/tickets', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  
  if (!canViewEmployeeData(req, targetUserId)) {
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  db.all(`
    SELECT * FROM tickets 
    WHERE user_id = ?
    ORDER BY created_at DESC
  `, [targetUserId], (err, tickets) => {
    if (err) {
      console.error('❌ Błąd pobierania ticketów:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    // Statystyki
    const stats = {
      total: tickets.length,
      new: tickets.filter(t => t.status === 'Nowy').length,
      inProgress: tickets.filter(t => t.status === 'W realizacji').length,
      completed: tickets.filter(t => t.status === 'Zakończony').length
    };
    
    res.json({ success: true, tickets, stats });
  });
});

/**
 * GET /api/employees/:userId/finances/summary
 * Podsumowanie finansów pracownika (prowizje, wypłaty)
 */
router.get('/:userId/finances/summary', verifyToken, async (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  
  console.log('💰 GET /api/employees/:userId/finances/summary - User:', targetUserId);
  
  if (!canViewEmployeeData(req, targetUserId)) {
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  try {
    // Pobierz prowizje pracownika (jeśli tabela istnieje)
    let commissions = [];
    try {
      commissions = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            lc.*,
            p.payment_code,
            p.amount as payment_amount,
            p.created_at as payment_date,
            c.case_number,
            c.title as case_title
          FROM lawyer_commissions lc
          LEFT JOIN payments p ON lc.payment_id = p.id
          LEFT JOIN cases c ON lc.case_id = c.id
          WHERE lc.user_id = ?
          ORDER BY lc.created_at DESC
        `, [targetUserId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    } catch (err) {
      console.warn('⚠️ Tabela lawyer_commissions nie istnieje lub błąd:', err.message);
    }
    
    // Podziel prowizje na kategorie
    const pending = commissions.filter(c => c.status === 'pending');
    const approved = commissions.filter(c => c.status === 'approved');
    const paid = commissions.filter(c => c.status === 'paid');
    const rejected = commissions.filter(c => c.status === 'rejected');
    const edited = commissions.filter(c => c.is_edited === 1);
    
    // Pobierz ostatnie wypłaty (jeśli tabela istnieje)
    let recentPayments = [];
    try {
      recentPayments = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            sp.id,
            sp.payment_date,
            sp.amount,
            sp.payment_type,
            sp.description,
            u.name as created_by_name
          FROM salary_payments sp
          LEFT JOIN users u ON sp.created_by = u.id
          WHERE sp.employee_id = ?
          ORDER BY sp.payment_date DESC
          LIMIT 10
        `, [targetUserId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    } catch (err) {
      console.warn('⚠️ Tabela salary_payments nie istnieje lub błąd:', err.message);
    }
    
    // Pobierz historię zmian stawek
    let rateChanges = [];
    try {
      rateChanges = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            crc.*,
            u.name as changed_by_name
          FROM commission_rate_changes crc
          LEFT JOIN users u ON crc.changed_by = u.id
          WHERE crc.user_id = ?
          ORDER BY crc.created_at DESC
          LIMIT 10
        `, [targetUserId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    } catch (err) {
      console.warn('⚠️ Tabela commission_rate_changes nie istnieje lub błąd:', err.message);
    }
    
    const summary = {
      commissions: {
        pending_count: pending.length,
        pending_amount: pending.reduce((sum, c) => sum + (c.commission_amount || 0), 0),
        approved_count: approved.length,
        approved_amount: approved.reduce((sum, c) => sum + (c.commission_amount || 0), 0),
        paid_count: paid.length,
        paid_amount: paid.reduce((sum, c) => sum + (c.commission_amount || 0), 0),
        rejected_count: rejected.length,
        rejected_amount: rejected.reduce((sum, c) => sum + (c.commission_amount || 0), 0)
      },
      rejected_commissions: rejected.slice(0, 10),
      rate_changes: rateChanges,
      recent_payments: recentPayments.map(p => ({
        ...p,
        payment_date: p.payment_date ? new Date(p.payment_date).toISOString().split('T')[0] : null
      }))
    };
    
    console.log('✅ Podsumowanie finansów:', summary.commissions);
    res.json({ success: true, summary });
    
  } catch (error) {
    console.error('❌ Błąd pobierania podsumowania finansów:', error);
    res.status(500).json({ success: false, message: 'Błąd serwera: ' + error.message });
  }
});

/**
 * GET /api/employees/:userId/salary-history
 * Historia wypłat pracownika
 */
router.get('/:userId/salary-history', verifyToken, async (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  
  console.log('💼 GET /api/employees/:userId/salary-history - User:', targetUserId);
  
  if (!canViewEmployeeData(req, targetUserId)) {
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  try {
    let salaries = [];
    try {
      salaries = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            sp.*,
            u.name as created_by_name
          FROM salary_payments sp
          LEFT JOIN users u ON sp.created_by = u.id
          WHERE sp.employee_id = ? AND sp.payment_type = 'salary'
          ORDER BY sp.year DESC, sp.month DESC
        `, [targetUserId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    } catch (err) {
      console.warn('⚠️ Tabela salary_payments nie istnieje:', err.message);
    }
    
    // Oblicz statystyki
    const stats = {
      totalPayments: salaries.length,
      totalGross: salaries.reduce((sum, s) => sum + (s.gross_amount || 0), 0),
      totalNet: salaries.reduce((sum, s) => sum + (s.net_amount || 0), 0),
      avgGross: salaries.length > 0 ? salaries.reduce((sum, s) => sum + (s.gross_amount || 0), 0) / salaries.length : 0
    };
    
    res.json({ success: true, salaries, stats });
    
  } catch (error) {
    console.error('❌ Błąd pobierania historii wypłat:', error);
    res.status(500).json({ success: false, message: 'Błąd serwera: ' + error.message });
  }
});

/**
 * PUT /api/employees/:userId/personal-data
 * Aktualizacja danych osobowych pracownika (HR/Admin)
 */
router.put('/:userId/personal-data', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  const userRole = req.user.user_role || req.user.role;
  
  // Tylko HR i Admin mogą edytować
  const canEdit = ['admin', 'hr'].includes(userRole);
  
  if (!canEdit) {
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  const { pesel, id_number, address, phone } = req.body;
  
  console.log('📝 Aktualizacja danych osobowych dla user:', targetUserId);
  
  // Sprawdź czy profil istnieje
  db.get('SELECT id FROM employee_profiles WHERE user_id = ?', [targetUserId], (err, profile) => {
    if (err) {
      console.error('❌ Błąd sprawdzania profilu:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    if (profile) {
      // UPDATE
      db.run(`
        UPDATE employee_profiles SET
          pesel = ?,
          id_number = ?,
          address = ?,
          phone = ?,
          updated_at = datetime('now')
        WHERE user_id = ?
      `, [pesel, id_number, address, phone, targetUserId], (err) => {
        if (err) {
          console.error('❌ Błąd aktualizacji danych osobowych:', err);
          return res.status(500).json({ success: false, message: 'Błąd serwera' });
        }
        console.log('✅ Dane osobowe zaktualizowane');
        res.json({ success: true, message: 'Dane osobowe zaktualizowane' });
      });
    } else {
      // INSERT
      db.run(`
        INSERT INTO employee_profiles (
          user_id, pesel, id_number, address, phone,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [targetUserId, pesel, id_number, address, phone], (err) => {
        if (err) {
          console.error('❌ Błąd tworzenia profilu:', err);
          return res.status(500).json({ success: false, message: 'Błąd serwera' });
        }
        console.log('✅ Profil z danymi osobowymi utworzony');
        res.json({ success: true, message: 'Dane osobowe zapisane' });
      });
    }
  });
});

/**
 * PUT /api/employees/:userId/family-data
 * Aktualizacja danych rodziny pracownika (HR/Admin)
 */
router.put('/:userId/family-data', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  const userRole = req.user.user_role || req.user.role;
  
  const canEdit = ['admin', 'hr'].includes(userRole);
  
  if (!canEdit) {
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  const {
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_relation,
    emergency_contact_address
  } = req.body;
  
  console.log('👨‍👩‍👧‍👦 Aktualizacja danych rodziny dla user:', targetUserId);
  
  db.get('SELECT id FROM employee_profiles WHERE user_id = ?', [targetUserId], (err, profile) => {
    if (err) {
      console.error('❌ Błąd sprawdzania profilu:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    if (profile) {
      // UPDATE
      db.run(`
        UPDATE employee_profiles SET
          emergency_contact_name = ?,
          emergency_contact_phone = ?,
          emergency_contact_relation = ?,
          emergency_contact_address = ?,
          updated_at = datetime('now')
        WHERE user_id = ?
      `, [
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relation,
        emergency_contact_address,
        targetUserId
      ], (err) => {
        if (err) {
          console.error('❌ Błąd aktualizacji danych rodziny:', err);
          return res.status(500).json({ success: false, message: 'Błąd serwera' });
        }
        console.log('✅ Dane rodziny zaktualizowane');
        res.json({ success: true, message: 'Dane rodziny zaktualizowane' });
      });
    } else {
      // INSERT
      db.run(`
        INSERT INTO employee_profiles (
          user_id, emergency_contact_name, emergency_contact_phone,
          emergency_contact_relation, emergency_contact_address,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [
        targetUserId,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relation,
        emergency_contact_address
      ], (err) => {
        if (err) {
          console.error('❌ Błąd tworzenia profilu:', err);
          return res.status(500).json({ success: false, message: 'Błąd serwera' });
        }
        console.log('✅ Profil z danymi rodziny utworzony');
        res.json({ success: true, message: 'Dane rodziny zapisane' });
      });
    }
  });
});

/**
 * PUT /api/employees/:userId/education-data
 * Aktualizacja wykształcenia pracownika (HR/Admin)
 */
router.put('/:userId/education-data', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  const userRole = req.user.user_role || req.user.role;
  
  const canEdit = ['admin', 'hr'].includes(userRole);
  
  if (!canEdit) {
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  const {
    education_level,
    school_name,
    field_of_study,
    graduation_year,
    degree,
    specializations
  } = req.body;
  
  console.log('🎓 Aktualizacja wykształcenia dla user:', targetUserId);
  
  db.get('SELECT id FROM employee_profiles WHERE user_id = ?', [targetUserId], (err, profile) => {
    if (err) {
      console.error('❌ Błąd sprawdzania profilu:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    if (profile) {
      // UPDATE
      db.run(`
        UPDATE employee_profiles SET
          education_level = ?,
          school_name = ?,
          field_of_study = ?,
          graduation_year = ?,
          degree = ?,
          specializations = ?,
          updated_at = datetime('now')
        WHERE user_id = ?
      `, [
        education_level,
        school_name,
        field_of_study,
        graduation_year,
        degree,
        specializations,
        targetUserId
      ], (err) => {
        if (err) {
          console.error('❌ Błąd aktualizacji wykształcenia:', err);
          return res.status(500).json({ success: false, message: 'Błąd serwera' });
        }
        console.log('✅ Wykształcenie zaktualizowane');
        res.json({ success: true, message: 'Wykształcenie zaktualizowane' });
      });
    } else {
      // INSERT
      db.run(`
        INSERT INTO employee_profiles (
          user_id, education_level, school_name, field_of_study,
          graduation_year, degree, specializations,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [
        targetUserId,
        education_level,
        school_name,
        field_of_study,
        graduation_year,
        degree,
        specializations
      ], (err) => {
        if (err) {
          console.error('❌ Błąd tworzenia profilu:', err);
          return res.status(500).json({ success: false, message: 'Błąd serwera' });
        }
        console.log('✅ Profil z wykształceniem utworzony');
        res.json({ success: true, message: 'Wykształcenie zapisane' });
      });
    }
  });
});

/**
 * POST /api/employees/:userId/upload-contract
 * Upload pliku umowy (PDF) - tylko HR i Admin
 */
router.post('/:userId/upload-contract', verifyToken, contractUpload.single('contract'), (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  const userRole = req.user.user_role || req.user.role;
  
  const canEdit = ['admin', 'hr'].includes(userRole);
  
  if (!canEdit) {
    // Usuń plik jeśli brak uprawnień
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nie przesłano pliku' });
  }
  
  console.log('📄 Upload umowy dla user:', targetUserId, 'Plik:', req.file.filename);
  
  // Zapisz ścieżkę pliku w bazie danych
  const fileUrl = `/uploads/contracts/${req.file.filename}`;
  
  db.get('SELECT id, contract_file_url FROM employee_profiles WHERE user_id = ?', [targetUserId], (err, profile) => {
    if (err) {
      console.error('❌ Błąd sprawdzania profilu:', err);
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    // Usuń stary plik jeśli istnieje
    if (profile && profile.contract_file_url) {
      const oldFilePath = path.join(__dirname, '..', '..', profile.contract_file_url);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
        console.log('🗑️  Usunięto starą umowę:', profile.contract_file_url);
      }
    }
    
    if (profile) {
      // UPDATE
      db.run(`
        UPDATE employee_profiles SET
          contract_file_url = ?,
          updated_at = datetime('now')
        WHERE user_id = ?
      `, [fileUrl, targetUserId], (err) => {
        if (err) {
          console.error('❌ Błąd aktualizacji profilu:', err);
          fs.unlinkSync(req.file.path);
          return res.status(500).json({ success: false, message: 'Błąd serwera' });
        }
        console.log('✅ Umowa zaktualizowana w profilu');
        res.json({ success: true, message: 'Umowa przesłana', fileUrl });
      });
    } else {
      // INSERT nowy profil z umową
      db.run(`
        INSERT INTO employee_profiles (
          user_id, contract_file_url,
          created_at, updated_at
        ) VALUES (?, ?, datetime('now'), datetime('now'))
      `, [targetUserId, fileUrl], (err) => {
        if (err) {
          console.error('❌ Błąd tworzenia profilu:', err);
          fs.unlinkSync(req.file.path);
          return res.status(500).json({ success: false, message: 'Błąd serwera' });
        }
        console.log('✅ Profil z umową utworzony');
        res.json({ success: true, message: 'Umowa przesłana', fileUrl });
      });
    }
  });
});

/**
 * GET /api/employees/:userId/download-contract
 * Pobierz umowę pracownika
 */
router.get('/:userId/download-contract', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  const userRole = req.user.user_role || req.user.role;
  
  // HR, Admin i sam pracownik mogą pobrać umowę
  const canDownload = ['admin', 'hr'].includes(userRole) || (req.user.userId === targetUserId);
  
  if (!canDownload) {
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  db.get('SELECT contract_file_url FROM employee_profiles WHERE user_id = ?', [targetUserId], (err, profile) => {
    if (err || !profile || !profile.contract_file_url) {
      return res.status(404).json({ success: false, message: 'Umowa nie znaleziona' });
    }
    
    const filePath = path.join(__dirname, '..', '..', profile.contract_file_url);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Plik nie istnieje' });
    }
    
    res.download(filePath);
  });
});

/**
 * POST /api/employees/:userId/upload-cv
 * Upload CV pracownika (PDF, DOC, DOCX) - HR, Admin i sam pracownik
 */
router.post('/:userId/upload-cv', verifyToken, cvUpload.single('cv'), (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  const userRole = req.user.user_role || req.user.role;
  const currentUserId = req.user.userId || req.user.id;
  
  const canEdit = ['admin', 'hr'].includes(userRole) || (currentUserId === targetUserId);
  
  if (!canEdit) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nie przesłano pliku' });
  }
  
  console.log('💼 Upload CV dla user:', targetUserId, 'Plik:', req.file.filename);
  
  const fileUrl = `/uploads/cv/${req.file.filename}`;
  
  db.get('SELECT id, cv_file_url FROM employee_profiles WHERE user_id = ?', [targetUserId], (err, profile) => {
    if (err) {
      console.error('❌ Błąd sprawdzania profilu:', err);
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    // Usuń stare CV jeśli istnieje
    if (profile && profile.cv_file_url) {
      const oldFilePath = path.join(__dirname, '..', '..', profile.cv_file_url);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
        console.log('🗑️  Usunięto stare CV:', profile.cv_file_url);
      }
    }
    
    if (profile) {
      db.run(`
        UPDATE employee_profiles SET
          cv_file_url = ?,
          cv_uploaded_at = datetime('now'),
          updated_at = datetime('now')
        WHERE user_id = ?
      `, [fileUrl, targetUserId], (err) => {
        if (err) {
          console.error('❌ Błąd aktualizacji CV:', err);
          fs.unlinkSync(req.file.path);
          return res.status(500).json({ success: false, message: 'Błąd serwera' });
        }
        console.log('✅ CV zaktualizowane');
        res.json({ success: true, message: 'CV przesłane', fileUrl });
      });
    } else {
      db.run(`
        INSERT INTO employee_profiles (
          user_id, cv_file_url, cv_uploaded_at,
          created_at, updated_at
        ) VALUES (?, ?, datetime('now'), datetime('now'), datetime('now'))
      `, [targetUserId, fileUrl], (err) => {
        if (err) {
          console.error('❌ Błąd tworzenia profilu:', err);
          fs.unlinkSync(req.file.path);
          return res.status(500).json({ success: false, message: 'Błąd serwera' });
        }
        console.log('✅ Profil z CV utworzony');
        res.json({ success: true, message: 'CV przesłane', fileUrl });
      });
    }
  });
});

/**
 * POST /api/employees/:userId/upload-document
 * Upload dokumentu (dyplom, zaświadczenie) - HR i Admin
 */
router.post('/:userId/upload-document', verifyToken, documentUpload.single('document'), (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  const userRole = req.user.user_role || req.user.role;
  const uploadedBy = req.user.userId || req.user.id;
  
  const canEdit = ['admin', 'hr'].includes(userRole);
  
  if (!canEdit) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nie przesłano pliku' });
  }
  
  const { document_type, document_name, notes } = req.body;
  
  if (!document_type || !document_name) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ success: false, message: 'Brakuje typu lub nazwy dokumentu' });
  }
  
  console.log('📄 Upload dokumentu dla user:', targetUserId, 'Typ:', document_type);
  
  const fileUrl = `/uploads/documents/${req.file.filename}`;
  
  db.run(`
    INSERT INTO employee_documents (
      user_id, document_type, document_name, file_url,
      uploaded_by, notes, uploaded_at
    ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `, [targetUserId, document_type, document_name, fileUrl, uploadedBy, notes || null], (err) => {
    if (err) {
      console.error('❌ Błąd zapisu dokumentu:', err);
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    console.log('✅ Dokument zapisany');
    res.json({ success: true, message: 'Dokument przesłany', fileUrl, documentId: this.lastID });
  });
});

/**
 * GET /api/employees/:userId/documents
 * Lista dokumentów pracownika
 */
router.get('/:userId/documents', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  const userRole = req.user.user_role || req.user.role;
  const currentUserId = req.user.userId || req.user.id;
  
  const canView = ['admin', 'hr'].includes(userRole) || (currentUserId === targetUserId);
  
  if (!canView) {
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  // Sprawdź czy tabela istnieje
  db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='employee_documents'`, (err, table) => {
    if (err || !table) {
      console.warn('⚠️ Tabela employee_documents nie istnieje - zwracam pustą listę');
      return res.json({ success: true, documents: [] });
    }
    
    // Tabela istnieje - pobierz dokumenty
    db.all(`
      SELECT 
        d.*,
        u.name as uploaded_by_name
      FROM employee_documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.user_id = ?
      ORDER BY d.uploaded_at DESC
    `, [targetUserId], (err, documents) => {
      if (err) {
        console.error('❌ Błąd pobierania dokumentów:', err);
        return res.status(500).json({ success: false, message: 'Błąd serwera', error: err.message });
      }
      res.json({ success: true, documents: documents || [] });
    });
  });
});

/**
 * DELETE /api/employees/:userId/documents/:documentId
 * Usuń dokument pracownika
 */
router.delete('/:userId/documents/:documentId', verifyToken, (req, res) => {
  const db = getDatabase();
  const targetUserId = parseInt(req.params.userId);
  const documentId = parseInt(req.params.documentId);
  const userRole = req.user.user_role || req.user.role;
  
  const canDelete = ['admin', 'hr'].includes(userRole);
  
  if (!canDelete) {
    return res.status(403).json({ success: false, message: 'Brak uprawnień' });
  }
  
  db.get('SELECT file_url FROM employee_documents WHERE id = ? AND user_id = ?', [documentId, targetUserId], (err, doc) => {
    if (err || !doc) {
      return res.status(404).json({ success: false, message: 'Dokument nie znaleziony' });
    }
    
    // Usuń plik
    const filePath = path.join(__dirname, '..', '..', doc.file_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Usuń z bazy
    db.run('DELETE FROM employee_documents WHERE id = ?', [documentId], (err) => {
      if (err) {
        console.error('❌ Błąd usuwania dokumentu:', err);
        return res.status(500).json({ success: false, message: 'Błąd serwera' });
      }
      console.log('✅ Dokument usunięty');
      res.json({ success: true, message: 'Dokument usunięty' });
    });
  });
});

// ============================================
// PAYROLL ENDPOINTS
// ============================================

// GET /employees/payroll/summary - Podsumowanie dla Payroll
router.get('/payroll/summary', verifyToken, (req, res) => {
  const db = getDatabase();
  
  // Pobierz pracowników z ich profilami
  const query = `
    SELECT 
      u.id as user_id,
      u.name,
      u.email,
      u.role,
      ep.salary,
      ep.monthly_salary,
      ep.base_salary,
      ep.bank_account,
      ep.contract_type,
      ep.position,
      ep.department,
      ep.hire_date,
      (SELECT COALESCE(SUM(amount), 0) FROM employee_commissions WHERE employee_id = ep.id AND status = 'paid') as pending_commissions_emp,
      (SELECT COALESCE(SUM(commission_amount), 0) FROM lawyer_commissions WHERE user_id = u.id AND status = 'paid') as pending_commissions_lawyer,
      (SELECT COALESCE(SUM(amount), 0) FROM employee_commissions WHERE employee_id = ep.id AND status = 'approved') as approved_commissions_emp,
      (SELECT COALESCE(SUM(commission_amount), 0) FROM lawyer_commissions WHERE user_id = u.id AND status = 'approved') as approved_commissions_lawyer
    FROM users u
    LEFT JOIN employee_profiles ep ON ep.user_id = u.id
    WHERE u.role NOT IN ('client', 'admin')
    ORDER BY u.name
  `;
  
  db.all(query, [], (err, employees) => {
    if (err) {
      console.error('❌ Błąd pobierania danych payroll:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    // Oblicz podsumowanie
    const summary = employees.map(e => ({
      user_id: e.user_id,
      name: e.name,
      email: e.email,
      role: e.role,
      position: e.position || '-',
      department: e.department || '-',
      salary: e.salary || e.monthly_salary || e.base_salary || 0,
      bank_account: e.bank_account || 'Brak',
      contract_type: e.contract_type || 'Brak danych',
      hire_date: e.hire_date,
      pending_commissions: (e.pending_commissions_emp || 0) + (e.pending_commissions_lawyer || 0),
      approved_commissions: (e.approved_commissions_emp || 0) + (e.approved_commissions_lawyer || 0)
    }));
    
    const totals = {
      total_employees: employees.length,
      total_salaries: summary.reduce((s, e) => s + e.salary, 0),
      total_pending_commissions: summary.reduce((s, e) => s + e.pending_commissions, 0),
      total_approved_commissions: summary.reduce((s, e) => s + e.approved_commissions, 0)
    };
    
    res.json({ 
      success: true, 
      employees: summary,
      totals 
    });
  });
});

// GET /employees/payroll/commissions - Wszystkie prowizje do wypłaty
router.get('/payroll/commissions', verifyToken, (req, res) => {
  const db = getDatabase();
  
  // Pobierz prowizje gotowe do wypłaty:
  // - lawyer_commissions: status 'approved' lub 'paid' (do wypłaty na konto)
  // - employee_commissions: status 'paid' (do wypłaty na konto)
  const query = `
    SELECT 
      lc.id,
      lc.user_id,
      u.name as user_name,
      u.email,
      lc.commission_amount as amount,
      lc.status,
      lc.paid_at,
      lc.payment_id,
      c.case_number,
      'lawyer' as commission_type
    FROM lawyer_commissions lc
    JOIN users u ON u.id = lc.user_id
    LEFT JOIN cases c ON c.id = lc.case_id
    WHERE lc.status IN ('approved', 'paid')
    
    UNION ALL
    
    SELECT 
      ec.id,
      ep.user_id,
      u.name as user_name,
      u.email,
      ec.amount,
      ec.status,
      ec.paid_at,
      ec.payment_id,
      c.case_number,
      'employee' as commission_type
    FROM employee_commissions ec
    JOIN employee_profiles ep ON ep.id = ec.employee_id
    JOIN users u ON u.id = ep.user_id
    LEFT JOIN cases c ON c.id = ec.case_id
    WHERE ec.status = 'paid'
    
    ORDER BY paid_at DESC
  `;
  
  db.all(query, [], (err, commissions) => {
    if (err) {
      console.error('❌ Błąd pobierania prowizji:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
    
    res.json({ 
      success: true, 
      commissions,
      total: commissions.reduce((s, c) => s + (c.amount || 0), 0)
    });
  });
});

// POST /employees/payroll/upload-confirmation - Upload potwierdzenia przelewu
router.post('/payroll/upload-confirmation', verifyToken, (req, res) => {
  const multer = require('multer');
  const path = require('path');
  const fs = require('fs');
  
  // Utwórz folder jeśli nie istnieje
  const uploadDir = path.join(__dirname, '../../data/transfer-confirmations');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      cb(null, `transfer_${timestamp}${ext}`);
    }
  });
  
  const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Tylko pliki PDF są dozwolone'), false);
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }).single('confirmation');
  
  upload(req, res, (err) => {
    if (err) {
      console.error('❌ Błąd uploadu:', err);
      return res.status(400).json({ success: false, message: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Brak pliku' });
    }
    
    const fileUrl = `/data/transfer-confirmations/${req.file.filename}`;
    console.log('✅ Upload potwierdzenia:', fileUrl);
    
    res.json({ success: true, file_url: fileUrl, filename: req.file.filename });
  });
});

// POST /employees/payroll/mark-transferred/:id - Oznacz prowizję jako przelana
router.post('/payroll/mark-transferred/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { type } = req.body || {}; // 'lawyer' or 'employee'
  
  console.log('💰 Mark as transferred - id:', id, 'type:', type, 'body:', req.body);
  
  if (!type) {
    return res.status(400).json({ success: false, message: 'Brak typu prowizji (lawyer/employee)' });
  }
  
  const table = type === 'lawyer' ? 'lawyer_commissions' : 'employee_commissions';
  
  // Status 'approved' oznacza przelew wykonany (constraint nie pozwala na 'transferred')
  db.run(`UPDATE ${table} SET status = 'approved' WHERE id = ?`, [id], function(err) {
    if (err) {
      console.error('❌ Błąd aktualizacji prowizji:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera: ' + err.message });
    }
    
    console.log('✅ Prowizja', id, 'oznaczona jako przelana, changes:', this.changes);
    res.json({ success: true, message: 'Prowizja oznaczona jako przelana', changes: this.changes });
  });
});

module.exports = router;
