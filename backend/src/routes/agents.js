const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/agents/available-orders - Get orders available for pickup
router.get('/available-orders', authenticateToken, requireRole('AGENT'), async (req, res, next) => {
  try {
    const pool = await getPool();

    // Get agent's assigned location
    const agentResult = await pool
      .request()
      .input('userId', sql.UniqueIdentifier, req.user.userId)
      .query(`
        SELECT AgentId, AssignedLocationId FROM Agents WHERE UserId = @userId
      `);

    if (agentResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agent profile not found',
      });
    }

    const agent = agentResult.recordset[0];

    // Get orders waiting for pickup in agent's location
    const result = await pool
      .request()
      .input('locationId', sql.UniqueIdentifier, agent.AssignedLocationId)
      .query(`
        SELECT 
          o.OrderId as id, o.OrderNumber as orderNumber,
          o.ItemTotal as itemTotal, o.TotalAmount as totalAmount,
          o.DeliveryAddress as deliveryAddress,
          o.DeliveryDistance as deliveryDistance,
          o.IsSameVillage as isSameVillage,
          o.PlacedAt as placedAt,
          r.Name as restaurantName, r.Address as restaurantAddress,
          r.Phone as restaurantPhone,
          l.Name as deliveryLocationName,
          (SELECT COUNT(*) FROM OrderItems WHERE OrderId = o.OrderId) as itemCount
        FROM Orders o
        JOIN OrderStatuses os ON o.StatusId = os.StatusId
        JOIN Restaurants r ON o.RestaurantId = r.RestaurantId
        JOIN Locations l ON o.DeliveryLocationId = l.LocationId
        WHERE os.StatusName = 'placed'
          AND r.LocationId = @locationId
          AND o.AgentId IS NULL
        ORDER BY o.PlacedAt ASC
      `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/agents/accept-order/:orderId - Accept an order
router.post('/accept-order/:orderId', authenticateToken, requireRole('AGENT'), async (req, res, next) => {
  try {
    const pool = await getPool();

    // Get agent ID
    const agentResult = await pool
      .request()
      .input('userId', sql.UniqueIdentifier, req.user.userId)
      .query(`SELECT AgentId FROM Agents WHERE UserId = @userId`);

    if (agentResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agent profile not found',
      });
    }

    const agentId = agentResult.recordset[0].AgentId;

    // Use stored procedure
    const result = await pool
      .request()
      .input('OrderId', sql.UniqueIdentifier, req.params.orderId)
      .input('AgentId', sql.UniqueIdentifier, agentId)
      .output('Success', sql.Bit)
      .output('Message', sql.NVarChar)
      .execute('sp_AcceptOrder');

    if (!result.output.Success) {
      return res.status(400).json({
        success: false,
        error: result.output.Message,
      });
    }

    res.json({
      success: true,
      message: result.output.Message,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/agents/orders/:orderId/status - Update order status
router.put('/orders/:orderId/status', authenticateToken, requireRole('AGENT'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['preparing', 'on_the_way', 'delivered'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: preparing, on_the_way, or delivered',
      });
    }

    const pool = await getPool();

    // Get agent ID and verify assignment
    const agentResult = await pool
      .request()
      .input('userId', sql.UniqueIdentifier, req.user.userId)
      .query(`SELECT AgentId FROM Agents WHERE UserId = @userId`);

    if (agentResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agent profile not found',
      });
    }

    const agentId = agentResult.recordset[0].AgentId;

    // Verify order is assigned to this agent
    const orderCheck = await pool
      .request()
      .input('orderId', sql.UniqueIdentifier, req.params.orderId)
      .input('agentId', sql.UniqueIdentifier, agentId)
      .query(`SELECT OrderId FROM Orders WHERE OrderId = @orderId AND AgentId = @agentId`);

    if (orderCheck.recordset.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Order not assigned to you',
      });
    }

    // Update status
    let updateQuery = `
      UPDATE Orders
      SET StatusId = (SELECT StatusId FROM OrderStatuses WHERE StatusName = @status),
          UpdatedAt = GETUTCDATE()
    `;

    if (status === 'preparing') {
      updateQuery += `, PreparedAt = GETUTCDATE()`;
    } else if (status === 'on_the_way') {
      updateQuery += `, PickedUpAt = GETUTCDATE()`;
    } else if (status === 'delivered') {
      updateQuery += `, DeliveredAt = GETUTCDATE(), PaymentStatus = 'completed'`;
    }

    updateQuery += ` WHERE OrderId = @orderId`;

    await pool
      .request()
      .input('orderId', sql.UniqueIdentifier, req.params.orderId)
      .input('status', sql.VarChar, status)
      .query(updateQuery);

    // If delivered, update agent stats
    if (status === 'delivered') {
      await pool
        .request()
        .input('agentId', sql.UniqueIdentifier, agentId)
        .query(`
          UPDATE Agents 
          SET TotalDeliveries = TotalDeliveries + 1, LastActiveAt = GETUTCDATE()
          WHERE AgentId = @agentId
        `);
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/agents/my-orders - Get agent's current orders
router.get('/my-orders', authenticateToken, requireRole('AGENT'), async (req, res, next) => {
  try {
    const { status } = req.query;
    const pool = await getPool();

    // Get agent ID
    const agentResult = await pool
      .request()
      .input('userId', sql.UniqueIdentifier, req.user.userId)
      .query(`SELECT AgentId FROM Agents WHERE UserId = @userId`);

    if (agentResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agent profile not found',
      });
    }

    const agentId = agentResult.recordset[0].AgentId;

    let query = `
      SELECT 
        o.OrderId as id, o.OrderNumber as orderNumber,
        os.StatusName as status, o.TotalAmount as totalAmount,
        o.DeliveryAddress as deliveryAddress,
        o.PlacedAt as placedAt, o.AcceptedAt as acceptedAt,
        o.DeliveredAt as deliveredAt,
        r.Name as restaurantName, r.Address as restaurantAddress,
        r.Phone as restaurantPhone,
        cu.Name as customerName, cu.Phone as customerPhone,
        (SELECT COUNT(*) FROM OrderItems WHERE OrderId = o.OrderId) as itemCount
      FROM Orders o
      JOIN OrderStatuses os ON o.StatusId = os.StatusId
      JOIN Restaurants r ON o.RestaurantId = r.RestaurantId
      JOIN Users cu ON o.CustomerId = cu.UserId
      WHERE o.AgentId = @agentId
    `;

    if (status) {
      query += ` AND os.StatusName = @status`;
    } else {
      query += ` AND os.StatusName NOT IN ('delivered', 'cancelled')`;
    }

    query += ` ORDER BY o.AcceptedAt DESC`;

    const request = pool.request().input('agentId', sql.UniqueIdentifier, agentId);

    if (status) {
      request.input('status', sql.VarChar, status);
    }

    const result = await request.query(query);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/agents/earnings - Get agent earnings
router.get('/earnings', authenticateToken, requireRole('AGENT'), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const pool = await getPool();

    // Get agent ID
    const agentResult = await pool
      .request()
      .input('userId', sql.UniqueIdentifier, req.user.userId)
      .query(`SELECT AgentId FROM Agents WHERE UserId = @userId`);

    if (agentResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agent profile not found',
      });
    }

    const agentId = agentResult.recordset[0].AgentId;

    // Use stored procedure
    const result = await pool
      .request()
      .input('AgentId', sql.UniqueIdentifier, agentId)
      .input('StartDate', sql.Date, startDate || null)
      .input('EndDate', sql.Date, endDate || null)
      .execute('sp_GetAgentEarnings');

    res.json({
      success: true,
      data: {
        dailyEarnings: result.recordsets[0] || [],
        summary: result.recordsets[1]?.[0] || {
          totalDeliveries: 0,
          totalEarning: 0,
          paidAmount: 0,
          pendingAmount: 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/agents/availability - Update availability status
router.put('/availability', authenticateToken, requireRole('AGENT'), async (req, res, next) => {
  try {
    const { isAvailable } = req.body;
    const pool = await getPool();

    await pool
      .request()
      .input('userId', sql.UniqueIdentifier, req.user.userId)
      .input('isAvailable', sql.Bit, isAvailable)
      .query(`
        UPDATE Agents 
        SET IsAvailable = @isAvailable, LastActiveAt = GETUTCDATE()
        WHERE UserId = @userId
      `);

    res.json({
      success: true,
      message: `Availability set to ${isAvailable ? 'online' : 'offline'}`,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/agents/profile - Get agent profile
router.get('/profile', authenticateToken, requireRole('AGENT'), async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool
      .request()
      .input('userId', sql.UniqueIdentifier, req.user.userId)
      .query(`
        SELECT 
          a.AgentId as id, a.VehicleType as vehicleType,
          a.LicenseNumber as licenseNumber,
          a.IsAvailable as isAvailable,
          a.TotalDeliveries as totalDeliveries,
          a.Rating as rating, a.LastActiveAt as lastActiveAt,
          u.Name as name, u.Email as email, u.Phone as phone,
          l.LocationId as assignedLocationId, l.Name as assignedLocationName
        FROM Agents a
        JOIN Users u ON a.UserId = u.UserId
        LEFT JOIN Locations l ON a.AssignedLocationId = l.LocationId
        WHERE a.UserId = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agent profile not found',
      });
    }

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (err) {
    next(err);
  }
});

// Admin routes
// GET /api/agents/admin/all - Get all agents (Admin only)
router.get('/admin/all', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT 
        a.AgentId as id, a.VehicleType as vehicleType,
        a.IsAvailable as isAvailable,
        a.TotalDeliveries as totalDeliveries,
        a.Rating as rating, a.LastActiveAt as lastActiveAt,
        u.UserId as userId, u.Name as name, u.Email as email, u.Phone as phone,
        l.LocationId as assignedLocationId, l.Name as assignedLocationName
      FROM Agents a
      JOIN Users u ON a.UserId = u.UserId
      LEFT JOIN Locations l ON a.AssignedLocationId = l.LocationId
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
