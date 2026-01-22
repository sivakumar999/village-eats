const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/database');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

// Check if user has specific role
const requireRole = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    try {
      const pool = await getPool();
      const result = await pool
        .request()
        .input('userId', sql.UniqueIdentifier, req.user.userId)
        .query(`
          SELECT r.RoleName 
          FROM UserRoles ur
          JOIN Roles r ON ur.RoleId = r.RoleId
          WHERE ur.UserId = @userId
        `);

      const userRoles = result.recordset.map((r) => r.RoleName);
      const hasRole = roles.some((role) => userRoles.includes(role));

      if (!hasRole) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
        });
      }

      req.userRoles = userRoles;
      next();
    } catch (err) {
      console.error('Role check error:', err);
      return res.status(500).json({
        success: false,
        error: 'Authorization check failed',
      });
    }
  };
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Token invalid, but continue without user
      req.user = null;
    }
  }

  next();
};

module.exports = { authenticateToken, requireRole, optionalAuth };
