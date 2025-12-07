const { getDatabase } = require('../database/init');

// Role użytkowników
const ROLES = {
  ADMIN: 'admin',                    // Administrator systemu
  LAWYER: 'lawyer',                  // Mecenas/Radca prawny
  CLIENT_MANAGER: 'client_manager',  // Opiekun klienta
  CASE_MANAGER: 'case_manager',      // Opiekun sprawy
  RECEPTION: 'reception',            // Recepcja
  HR: 'hr',                          // Dział HR/Kadr
  FINANCE: 'finance',                // Dział Finansowy
  PAYROLL: 'payroll',                // Dział Płacowy (HR + Finance)
  CLIENT: 'client'                   // Klient
};

// Grupy ról dla uprawnień
const ROLE_GROUPS = {
  // Pełny dostęp administracyjny
  ADMIN: ['admin'],
  
  // Managerowie spraw (takie same uprawnienia)
  CASE_MANAGERS: ['lawyer', 'client_manager', 'case_manager'],
  
  // Wszyscy pracownicy (mogą widzieć dashboardy)
  STAFF: ['admin', 'lawyer', 'client_manager', 'case_manager', 'reception', 'hr', 'finance', 'payroll'],
  
  // Mogą przypisywać zadania
  CAN_ASSIGN_TASKS: ['admin', 'lawyer', 'client_manager', 'case_manager', 'reception', 'hr'],
  
  // Mogą zarządzać HR (admin + HR + Payroll)
  CAN_MANAGE_HR: ['admin', 'hr', 'payroll'],
  
  // Pełny dostęp do finansów (admin + Finance + Payroll)
  CAN_MANAGE_FINANCES: ['admin', 'finance', 'payroll'],
  
  // Mogą zarządzać wypłatami (tylko Payroll i admin)
  CAN_MANAGE_PAYROLL: ['admin', 'payroll'],
  
  // Mają dostęp do Employee Dashboard
  HAS_EMPLOYEE_DASHBOARD: ['admin', 'lawyer', 'client_manager', 'case_manager', 'reception', 'hr', 'finance', 'payroll'],
  
  // Mają dostęp do pełnego CRM
  CAN_ACCESS_CRM: ['admin', 'lawyer', 'client_manager', 'case_manager', 'reception']
};

// Helper: Sprawdź czy rola jest w grupie
function isInGroup(userRole, groupName) {
  return ROLE_GROUPS[groupName] && ROLE_GROUPS[groupName].includes(userRole);
}

// Sprawdź czy użytkownik jest pracownikiem (nie klientem)
function isStaff(req, res, next) {
  const userRole = req.user.user_role || req.user.role;
  
  if (isInGroup(userRole, 'STAFF')) {
    return next();
  }
  
  return res.status(403).json({ error: 'Brak uprawnień. Dostęp tylko dla pracowników.' });
}

// Sprawdź czy użytkownik jest adminem, prawnikiem lub managerem
function isLawyerOrAdmin(req, res, next) {
  const userRole = req.user.user_role || req.user.role;
  
  if (isInGroup(userRole, 'CASE_MANAGERS') || userRole === ROLES.ADMIN) {
    return next();
  }
  
  return res.status(403).json({ error: 'Brak uprawnień. Dostęp tylko dla managerów spraw.' });
}

// Sprawdź czy użytkownik ma dostęp do sprawy
async function canAccessCase(req, res, next) {
  const db = getDatabase();
  const userId = req.user.userId || req.user.id;
  const userRole = req.user.user_role || req.user.role;
  const caseId = req.params.id || req.body.case_id;

  // Pracownicy (włącznie z recepcją) mają dostęp do wszystkich spraw
  if (isInGroup(userRole, 'CAN_ACCESS_CRM')) {
    return next();
  }

  // Klienci mają dostęp tylko do swoich spraw
  if (userRole === ROLES.CLIENT) {
    // Sprawdź czy klient ma dostęp do sprawy
    db.get(
      `SELECT ca.* FROM case_access ca
       WHERE ca.case_id = ? AND ca.user_id = ?`,
      [caseId, userId],
      (err, access) => {
        if (err) {
          return res.status(500).json({ error: 'Błąd sprawdzania dostępu' });
        }
        
        if (access) {
          req.caseAccess = access;
          return next();
        }

        // Sprawdź czy sprawa należy do klienta
        db.get(
          `SELECT c.* FROM cases c
           JOIN users u ON u.client_id = c.client_id
           WHERE c.id = ? AND u.id = ?`,
          [caseId, userId],
          (err, caseData) => {
            if (err) {
              return res.status(500).json({ error: 'Błąd sprawdzania dostępu' });
            }
            
            if (caseData) {
              return next();
            }
            
            return res.status(403).json({ error: 'Brak dostępu do tej sprawy' });
          }
        );
      }
    );
  } else {
    return res.status(403).json({ error: 'Nieznana rola użytkownika' });
  }
}

// Sprawdź czy użytkownik może modyfikować sprawę
function canModifyCase(req, res, next) {
  const userRole = req.user.user_role || req.user.role;
  
  // Pracownicy (włącznie z recepcją) mogą modyfikować sprawy
  if (isInGroup(userRole, 'CAN_ACCESS_CRM')) {
    return next();
  }
  
  return res.status(403).json({ error: 'Brak uprawnień do modyfikacji sprawy' });
}

// Sprawdź czy użytkownik może widzieć wewnętrzne notatki
function canViewInternalNotes(req, res, next) {
  const userRole = req.user.user_role || req.user.role;
  
  // Wszyscy pracownicy widzą wewnętrzne notatki
  if (isInGroup(userRole, 'STAFF')) {
    req.canViewInternal = true;
  } else {
    req.canViewInternal = false;
  }
  
  next();
}

// Sprawdź czy użytkownik może widzieć wszystkich pracowników
function canViewAllEmployees(req, res, next) {
  const userRole = req.user.user_role || req.user.role;
  
  if (isInGroup(userRole, 'STAFF')) {
    return next();
  }
  
  return res.status(403).json({ error: 'Brak uprawnień do przeglądania pracowników' });
}

// Sprawdź czy użytkownik może przypisywać zadania
function canAssignTasks(req, res, next) {
  const userRole = req.user.user_role || req.user.role;
  
  if (isInGroup(userRole, 'CAN_ASSIGN_TASKS')) {
    return next();
  }
  
  return res.status(403).json({ error: 'Brak uprawnień do przypisywania zadań' });
}

// Sprawdź czy użytkownik może edytować profile pracowników
function canEditProfiles(req, res, next) {
  const userRole = req.user.user_role || req.user.role;
  
  if (isInGroup(userRole, 'CAN_MANAGE_HR')) {
    return next();
  }
  
  return res.status(403).json({ error: 'Tylko administrator może edytować profile pracowników' });
}

// Sprawdź czy użytkownik może dodawać oceny
function canAddReviews(req, res, next) {
  const userRole = req.user.user_role || req.user.role;
  
  if (isInGroup(userRole, 'CAN_MANAGE_HR')) {
    return next();
  }
  
  return res.status(403).json({ error: 'Tylko administrator może dodawać oceny pracowników' });
}

// Sprawdź czy użytkownik ma dostęp do finansów
function canManageFinances(req, res, next) {
  const userRole = req.user.user_role || req.user.role;
  
  if (isInGroup(userRole, 'CAN_MANAGE_FINANCES')) {
    return next();
  }
  
  return res.status(403).json({ error: 'Brak uprawnień do zarządzania finansami' });
}

// Sprawdź czy użytkownik może zarządzać HR
function canManageHR(req, res, next) {
  const userRole = req.user.user_role || req.user.role;
  
  if (isInGroup(userRole, 'CAN_MANAGE_HR')) {
    return next();
  }
  
  return res.status(403).json({ error: 'Brak uprawnień do zarządzania HR' });
}

module.exports = {
  ROLES,
  ROLE_GROUPS,
  isInGroup,
  isStaff,
  isLawyerOrAdmin,
  canAccessCase,
  canModifyCase,
  canViewInternalNotes,
  canViewAllEmployees,
  canAssignTasks,
  canEditProfiles,
  canAddReviews,
  canManageFinances,
  canManageHR
};
