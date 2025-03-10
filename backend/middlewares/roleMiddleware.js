// backend/middlewares/roleMiddleware.js

/**
 * Middleware to authorize routes based on user roles.
 * Usage: authorizeRoles('admin', 'vendor')
 */
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied: insufficient permissions' });
      }
      next();
    };
  };
  