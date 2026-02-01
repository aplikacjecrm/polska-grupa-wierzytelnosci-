const jwt = require('jsonwebtoken');

// SECURITY: JWT_SECRET MUST be set in .env - no fallback allowed!
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET is not defined in .env!');
}

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Brak tokenu autoryzacji' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Nieprawidłowy token' });
  }
}

// Middleware do sprawdzania roli
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    // Sprawdź rolę w user_role lub role (kompatybilność)
    const userRole = req.user?.user_role || req.user?.role;
    
    if (!req.user || !userRole) {
      return res.status(403).json({ error: 'Brak informacji o roli użytkownika' });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Brak uprawnień',
        message: `Tylko ${allowedRoles.join(', ')} mogą wykonać tę akcję. Twoja rola: ${userRole}`
      });
    }

    next();
  };
}

// Export z dwoma nazwami dla kompatybilności
const authenticateToken = verifyToken;

module.exports = { verifyToken, authenticateToken, requireRole };
