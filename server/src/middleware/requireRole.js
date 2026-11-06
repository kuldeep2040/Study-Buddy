// Door guard #2: "Is your role allowed here?"  Always used AFTER requireAuth.
// Usage: router.post('/start', requireAuth, requireRole('student'), controller.start)
import { AppError } from '../utils/AppError.js';

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new AppError(403, "You don't have access to this");
    }
    next();
  };
}
