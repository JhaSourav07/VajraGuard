const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'vajraguard_secret_change_in_prod';

/**
 * Resolves the identity of the caller from either:
 *  - Authorization: Bearer <jwt>  → req.userId (authenticated user)
 *  - X-Guest-Id: <uuid>            → req.guestId (guest session)
 *
 * Attaches req.userId / req.guestId and req.isGuest.
 * If neither header is present the request is rejected with 401.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const guestId    = req.headers['x-guest-id'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId  = decoded.userId;
      req.isGuest = false;
      return next();
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  }

  if (guestId && guestId.trim()) {
    req.guestId = guestId.trim();
    req.isGuest = true;
    return next();
  }

  return res.status(401).json({ success: false, message: 'Authentication required' });
}

module.exports = { authMiddleware, JWT_SECRET };
