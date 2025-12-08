const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'zmien-to-na-bezpieczny-klucz';

function verifyToken(req, res, next) {
  console.log('🔐 AUTH MIDDLEWARE START:', req.method, req.path);
  
  // Pobierz token z headera lub query string (dla streamingu wideo)
  let token = req.headers.authorization?.split(' ')[1];
  
  // Fallback na token z query string (dla elementów <video> i <audio>)
  if (!token && req.query.token) {
    console.log('🔐 Using token from query string');
    token = req.query.token;
  }

  if (!token) {
    console.log('❌ AUTH FAILED: No token');
    return res.status(401).json({ error: 'Brak tokenu autoryzacji' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log('✅ AUTH SUCCESS: User', decoded.userId);
    next();
  } catch (error) {
    console.log('❌ AUTH FAILED: Invalid token', error.message);
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
