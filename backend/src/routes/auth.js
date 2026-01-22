const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { getPool, sql } = require('../config/database');
const { validate } = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// POST /api/auth/register
router.post('/register', registerValidation, validate, async (req, res, next) => {
  try {
    const { email, password, name, phone, locationId, address } = req.body;
    const pool = await getPool();

    // Check if user exists
    const existingUser = await pool
      .request()
      .input('email', sql.VarChar, email)
      .query('SELECT UserId FROM Users WHERE Email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool
      .request()
      .input('email', sql.VarChar, email)
      .input('passwordHash', sql.VarChar, passwordHash)
      .input('name', sql.NVarChar, name)
      .input('phone', sql.VarChar, phone || null)
      .input('locationId', sql.UniqueIdentifier, locationId || null)
      .input('address', sql.NVarChar, address || null)
      .query(`
        INSERT INTO Users (Email, PasswordHash, Name, Phone, LocationId, Address)
        OUTPUT INSERTED.UserId, INSERTED.Email, INSERTED.Name, INSERTED.Phone, INSERTED.CreatedAt
        VALUES (@email, @passwordHash, @name, @phone, @locationId, @address)
      `);

    const user = result.recordset[0];

    // Assign CUSTOMER role by default
    await pool
      .request()
      .input('userId', sql.UniqueIdentifier, user.UserId)
      .query(`
        INSERT INTO UserRoles (UserId, RoleId)
        SELECT @userId, RoleId FROM Roles WHERE RoleName = 'CUSTOMER'
      `);

    // Generate JWT
    const token = jwt.sign(
      { userId: user.UserId, email: user.Email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '24h' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.UserId,
          email: user.Email,
          name: user.Name,
          phone: user.Phone,
          roles: ['CUSTOMER'],
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', loginValidation, validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const pool = await getPool();

    // Get user with roles
    const result = await pool
      .request()
      .input('email', sql.VarChar, email)
      .query(`
        SELECT 
          u.UserId, u.Email, u.PasswordHash, u.Name, u.Phone, 
          u.LocationId, u.Address, u.IsActive,
          l.Name as LocationName
        FROM Users u
        LEFT JOIN Locations l ON u.LocationId = l.LocationId
        WHERE u.Email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const user = result.recordset[0];

    if (!user.IsActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated',
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.PasswordHash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Get user roles
    const rolesResult = await pool
      .request()
      .input('userId', sql.UniqueIdentifier, user.UserId)
      .query(`
        SELECT r.RoleName 
        FROM UserRoles ur
        JOIN Roles r ON ur.RoleId = r.RoleId
        WHERE ur.UserId = @userId
      `);

    const roles = rolesResult.recordset.map((r) => r.RoleName);

    // Generate JWT
    const token = jwt.sign(
      { userId: user.UserId, email: user.Email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '24h' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.UserId,
          email: user.Email,
          name: user.Name,
          phone: user.Phone,
          locationId: user.LocationId,
          locationName: user.LocationName,
          address: user.Address,
          roles,
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool
      .request()
      .input('userId', sql.UniqueIdentifier, req.user.userId)
      .query(`
        SELECT 
          u.UserId, u.Email, u.Name, u.Phone, 
          u.LocationId, u.Address, u.IsActive, u.CreatedAt,
          l.Name as LocationName
        FROM Users u
        LEFT JOIN Locations l ON u.LocationId = l.LocationId
        WHERE u.UserId = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const user = result.recordset[0];

    // Get roles
    const rolesResult = await pool
      .request()
      .input('userId', sql.UniqueIdentifier, req.user.userId)
      .query(`
        SELECT r.RoleName 
        FROM UserRoles ur
        JOIN Roles r ON ur.RoleId = r.RoleId
        WHERE ur.UserId = @userId
      `);

    res.json({
      success: true,
      data: {
        id: user.UserId,
        email: user.Email,
        name: user.Name,
        phone: user.Phone,
        locationId: user.LocationId,
        locationName: user.LocationName,
        address: user.Address,
        roles: rolesResult.recordset.map((r) => r.RoleName),
        isActive: user.IsActive,
        createdAt: user.CreatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/profile - Update profile
router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const { name, phone, locationId, address } = req.body;
    const pool = await getPool();

    await pool
      .request()
      .input('userId', sql.UniqueIdentifier, req.user.userId)
      .input('name', sql.NVarChar, name)
      .input('phone', sql.VarChar, phone || null)
      .input('locationId', sql.UniqueIdentifier, locationId || null)
      .input('address', sql.NVarChar, address || null)
      .query(`
        UPDATE Users 
        SET Name = @name, Phone = @phone, LocationId = @locationId, 
            Address = @address, UpdatedAt = GETUTCDATE()
        WHERE UserId = @userId
      `);

    res.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
