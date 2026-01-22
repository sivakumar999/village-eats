const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All routes require ADMIN role
router.use(authenticateToken, requireRole('ADMIN'));

// GET /api/admin/dashboard - Dashboard stats
router.get('/dashboard', async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM Orders) as totalOrders,
        (SELECT COALESCE(SUM(TotalAmount), 0) FROM Orders WHERE PaymentStatus = 'completed') as totalRevenue,
        (SELECT COUNT(DISTINCT CustomerId) FROM Orders) as totalCustomers,
        (SELECT COUNT(*) FROM Agents) as totalAgents,
        (SELECT COUNT(*) FROM Agents WHERE IsAvailable = 1) as activeAgents,
        (SELECT COUNT(*) FROM Orders o JOIN OrderStatuses os ON o.StatusId = os.StatusId 
         WHERE os.StatusName IN ('placed', 'accepted', 'preparing', 'on_the_way')) as pendingOrders,
        (SELECT COUNT(*) FROM Orders WHERE CAST(PlacedAt as DATE) = CAST(GETUTCDATE() as DATE)) as todayOrders,
        (SELECT COALESCE(SUM(TotalAmount), 0) FROM Orders 
         WHERE CAST(PlacedAt as DATE) = CAST(GETUTCDATE() as DATE) AND PaymentStatus = 'completed') as todayRevenue
    `);

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/settings - Get app settings
router.get('/settings', async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT SettingKey as key, SettingValue as value, Description as description
      FROM AppSettings
      ORDER BY SettingKey
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/settings - Update settings
router.put('/settings', async (req, res, next) => {
  try {
    const { settings } = req.body; // Array of { key, value }
    const pool = await getPool();

    for (const setting of settings) {
      await pool
        .request()
        .input('key', sql.VarChar, setting.key)
        .input('value', sql.NVarChar, setting.value)
        .input('updatedBy', sql.UniqueIdentifier, req.user.userId)
        .query(`
          UPDATE AppSettings
          SET SettingValue = @value, UpdatedAt = GETUTCDATE(), UpdatedBy = @updatedBy
          WHERE SettingKey = @key
        `);
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users - Get all users
router.get('/users', async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const pool = await getPool();

    let query = `
      SELECT 
        u.UserId as id, u.Email as email, u.Name as name, 
        u.Phone as phone, u.IsActive as isActive, u.CreatedAt as createdAt,
        l.Name as locationName,
        STRING_AGG(r.RoleName, ',') as roles
      FROM Users u
      LEFT JOIN Locations l ON u.LocationId = l.LocationId
      LEFT JOIN UserRoles ur ON u.UserId = ur.UserId
      LEFT JOIN Roles r ON ur.RoleId = r.RoleId
    `;

    if (role) {
      query += ` WHERE r.RoleName = @role`;
    }

    query += `
      GROUP BY u.UserId, u.Email, u.Name, u.Phone, u.IsActive, u.CreatedAt, l.Name
      ORDER BY u.CreatedAt DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const request = pool.request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit));

    if (role) {
      request.input('role', sql.VarChar, role);
    }

    const result = await request.query(query);

    // Parse roles
    const users = result.recordset.map((u) => ({
      ...u,
      roles: u.roles ? u.roles.split(',') : [],
    }));

    res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/agents - Create agent from user
router.post('/agents', async (req, res, next) => {
  try {
    const { userId, vehicleType, licenseNumber, assignedLocationId } = req.body;
    const pool = await getPool();

    // Check if already an agent
    const existingAgent = await pool
      .request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`SELECT AgentId FROM Agents WHERE UserId = @userId`);

    if (existingAgent.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'User is already an agent',
      });
    }

    // Create agent
    const result = await pool
      .request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('vehicleType', sql.VarChar, vehicleType || 'BIKE')
      .input('licenseNumber', sql.VarChar, licenseNumber || null)
      .input('assignedLocationId', sql.UniqueIdentifier, assignedLocationId)
      .query(`
        INSERT INTO Agents (UserId, VehicleType, LicenseNumber, AssignedLocationId)
        OUTPUT INSERTED.AgentId as id
        VALUES (@userId, @vehicleType, @licenseNumber, @assignedLocationId)
      `);

    // Add AGENT role
    await pool
      .request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        INSERT INTO UserRoles (UserId, RoleId)
        SELECT @userId, RoleId FROM Roles WHERE RoleName = 'AGENT'
      `);

    res.status(201).json({
      success: true,
      data: { agentId: result.recordset[0].id },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/reports/orders - Order reports
router.get('/reports/orders', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const pool = await getPool();

    const result = await pool
      .request()
      .input('startDate', sql.Date, startDate || null)
      .input('endDate', sql.Date, endDate || null)
      .query(`
        SELECT 
          CAST(PlacedAt as DATE) as date,
          COUNT(*) as orderCount,
          SUM(TotalAmount) as revenue,
          SUM(DeliveryBaseFee + DeliveryDistanceFee) as deliveryFees,
          AVG(TotalAmount) as avgOrderValue
        FROM Orders
        WHERE (@startDate IS NULL OR CAST(PlacedAt as DATE) >= @startDate)
          AND (@endDate IS NULL OR CAST(PlacedAt as DATE) <= @endDate)
          AND PaymentStatus = 'completed'
        GROUP BY CAST(PlacedAt as DATE)
        ORDER BY date DESC
      `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/reports/agents - Agent performance reports
router.get('/reports/agents', async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT 
        a.AgentId as id, u.Name as name,
        a.TotalDeliveries as totalDeliveries,
        a.Rating as rating,
        l.Name as locationName,
        COALESCE(SUM(e.TotalEarning), 0) as totalEarnings,
        COALESCE(SUM(CASE WHEN e.IsPaid = 0 THEN e.TotalEarning ELSE 0 END), 0) as pendingEarnings
      FROM Agents a
      JOIN Users u ON a.UserId = u.UserId
      LEFT JOIN Locations l ON a.AssignedLocationId = l.LocationId
      LEFT JOIN AgentEarnings e ON a.AgentId = e.AgentId
      GROUP BY a.AgentId, u.Name, a.TotalDeliveries, a.Rating, l.Name
      ORDER BY a.TotalDeliveries DESC
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
