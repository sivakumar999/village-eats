const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Validation rules
const placeOrderValidation = [
  body('restaurantId').isUUID().withMessage('Valid restaurant ID required'),
  body('deliveryLocationId').isUUID().withMessage('Valid delivery location required'),
  body('deliveryAddress').trim().notEmpty().withMessage('Delivery address required'),
  body('paymentModeId').isInt({ min: 1, max: 2 }).withMessage('Valid payment mode required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.foodItemId').isUUID().withMessage('Valid food item ID required'),
  body('items.*.quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be 1-10'),
];

// POST /api/orders - Place a new order
router.post('/', authenticateToken, placeOrderValidation, validate, async (req, res, next) => {
  try {
    const {
      restaurantId, deliveryLocationId, deliveryAddress,
      paymentModeId, customerNotes, items,
    } = req.body;
    const pool = await getPool();

    // Use stored procedure
    const orderItems = JSON.stringify(items.map((item) => ({
      FoodItemId: item.foodItemId,
      Quantity: item.quantity,
    })));

    const result = await pool
      .request()
      .input('CustomerId', sql.UniqueIdentifier, req.user.userId)
      .input('RestaurantId', sql.UniqueIdentifier, restaurantId)
      .input('DeliveryLocationId', sql.UniqueIdentifier, deliveryLocationId)
      .input('DeliveryAddress', sql.NVarChar, deliveryAddress)
      .input('PaymentModeId', sql.Int, paymentModeId)
      .input('CustomerNotes', sql.NVarChar, customerNotes || null)
      .input('OrderItems', sql.NVarChar, orderItems)
      .output('OrderId', sql.UniqueIdentifier)
      .output('OrderNumber', sql.NVarChar)
      .execute('sp_PlaceOrder');

    const orderId = result.output.OrderId;
    const orderNumber = result.output.OrderNumber;

    // Get full order details
    const orderDetails = await pool
      .request()
      .input('orderId', sql.UniqueIdentifier, orderId)
      .query(`
        SELECT 
          o.OrderId as id, o.OrderNumber as orderNumber,
          os.StatusName as status, o.ItemTotal as itemTotal,
          o.DeliveryBaseFee as deliveryBaseFee,
          o.DeliveryDistanceFee as deliveryDistanceFee,
          o.MultiItemDiscount as multiItemDiscount,
          o.TotalAmount as totalAmount,
          o.DeliveryAddress as deliveryAddress,
          o.IsSameVillage as isSameVillage,
          o.PlacedAt as placedAt,
          r.Name as restaurantName,
          pm.ModeName as paymentMode
        FROM Orders o
        JOIN OrderStatuses os ON o.StatusId = os.StatusId
        JOIN Restaurants r ON o.RestaurantId = r.RestaurantId
        JOIN PaymentModes pm ON o.PaymentModeId = pm.ModeId
        WHERE o.OrderId = @orderId
      `);

    res.status(201).json({
      success: true,
      data: orderDetails.recordset[0],
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders - Get user's orders
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const pool = await getPool();

    let query = `
      SELECT 
        o.OrderId as id, o.OrderNumber as orderNumber,
        os.StatusName as status, o.ItemTotal as itemTotal,
        o.TotalAmount as totalAmount,
        o.DeliveryAddress as deliveryAddress,
        o.PlacedAt as placedAt, o.DeliveredAt as deliveredAt,
        r.RestaurantId as restaurantId, r.Name as restaurantName,
        r.ImagePath as restaurantImage,
        (SELECT COUNT(*) FROM OrderItems WHERE OrderId = o.OrderId) as itemCount
      FROM Orders o
      JOIN OrderStatuses os ON o.StatusId = os.StatusId
      JOIN Restaurants r ON o.RestaurantId = r.RestaurantId
      WHERE o.CustomerId = @customerId
    `;

    if (status) {
      query += ` AND os.StatusName = @status`;
    }

    query += ` ORDER BY o.PlacedAt DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    const request = pool.request()
      .input('customerId', sql.UniqueIdentifier, req.user.userId)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit));

    if (status) {
      request.input('status', sql.VarChar, status);
    }

    const result = await request.query(query);

    // Get total count
    const countResult = await pool
      .request()
      .input('customerId', sql.UniqueIdentifier, req.user.userId)
      .query(`SELECT COUNT(*) as total FROM Orders WHERE CustomerId = @customerId`);

    res.json({
      success: true,
      data: result.recordset,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.recordset[0].total,
        totalPages: Math.ceil(countResult.recordset[0].total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id - Get order details
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const pool = await getPool();

    // Get order
    const orderResult = await pool
      .request()
      .input('orderId', sql.UniqueIdentifier, req.params.id)
      .input('userId', sql.UniqueIdentifier, req.user.userId)
      .query(`
        SELECT 
          o.OrderId as id, o.OrderNumber as orderNumber,
          os.StatusName as status, o.ItemTotal as itemTotal,
          o.DeliveryBaseFee as deliveryBaseFee,
          o.DeliveryDistanceFee as deliveryDistanceFee,
          o.MultiItemDiscount as multiItemDiscount,
          o.TotalAmount as totalAmount,
          o.DeliveryAddress as deliveryAddress,
          o.DeliveryDistance as deliveryDistance,
          o.IsSameVillage as isSameVillage,
          o.CustomerNotes as customerNotes,
          o.PlacedAt as placedAt, o.AcceptedAt as acceptedAt,
          o.PreparedAt as preparedAt, o.PickedUpAt as pickedUpAt,
          o.DeliveredAt as deliveredAt, o.CancelledAt as cancelledAt,
          o.CustomerId as customerId,
          r.RestaurantId as restaurantId, r.Name as restaurantName,
          r.ImagePath as restaurantImage, r.Phone as restaurantPhone,
          pm.ModeName as paymentMode, o.PaymentStatus as paymentStatus,
          u.Name as agentName, u.Phone as agentPhone
        FROM Orders o
        JOIN OrderStatuses os ON o.StatusId = os.StatusId
        JOIN Restaurants r ON o.RestaurantId = r.RestaurantId
        JOIN PaymentModes pm ON o.PaymentModeId = pm.ModeId
        LEFT JOIN Agents a ON o.AgentId = a.AgentId
        LEFT JOIN Users u ON a.UserId = u.UserId
        WHERE o.OrderId = @orderId
      `);

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    const order = orderResult.recordset[0];

    // Check access (customer, agent, or admin)
    // For now, allow access if it's the customer's order
    if (order.customerId !== req.user.userId) {
      // Check if user is admin or assigned agent
      const roleCheck = await pool
        .request()
        .input('userId', sql.UniqueIdentifier, req.user.userId)
        .query(`
          SELECT r.RoleName FROM UserRoles ur
          JOIN Roles r ON ur.RoleId = r.RoleId
          WHERE ur.UserId = @userId AND r.RoleName IN ('ADMIN', 'AGENT')
        `);

      if (roleCheck.recordset.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }
    }

    // Get order items
    const itemsResult = await pool
      .request()
      .input('orderId', sql.UniqueIdentifier, req.params.id)
      .query(`
        SELECT 
          oi.OrderItemId as id, oi.Quantity as quantity,
          oi.UnitPrice as unitPrice, oi.TotalPrice as totalPrice,
          f.FoodItemId as foodItemId, f.Name as foodItemName,
          f.ImagePath as image, f.IsVeg as isVeg
        FROM OrderItems oi
        JOIN FoodItems f ON oi.FoodItemId = f.FoodItemId
        WHERE oi.OrderId = @orderId
      `);

    res.json({
      success: true,
      data: {
        ...order,
        items: itemsResult.recordset,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/orders/:id/cancel - Cancel order
router.put('/:id/cancel', authenticateToken, async (req, res, next) => {
  try {
    const { reason } = req.body;
    const pool = await getPool();

    // Check if order belongs to user and is cancellable
    const orderCheck = await pool
      .request()
      .input('orderId', sql.UniqueIdentifier, req.params.id)
      .input('customerId', sql.UniqueIdentifier, req.user.userId)
      .query(`
        SELECT o.OrderId, os.StatusName
        FROM Orders o
        JOIN OrderStatuses os ON o.StatusId = os.StatusId
        WHERE o.OrderId = @orderId AND o.CustomerId = @customerId
      `);

    if (orderCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    const currentStatus = orderCheck.recordset[0].StatusName;
    if (!['placed', 'accepted'].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        error: 'Order cannot be cancelled at this stage',
      });
    }

    // Cancel order
    await pool
      .request()
      .input('orderId', sql.UniqueIdentifier, req.params.id)
      .input('reason', sql.NVarChar, reason || 'Cancelled by customer')
      .query(`
        UPDATE Orders
        SET StatusId = (SELECT StatusId FROM OrderStatuses WHERE StatusName = 'cancelled'),
            CancelledAt = GETUTCDATE(),
            CancelReason = @reason,
            UpdatedAt = GETUTCDATE()
        WHERE OrderId = @orderId
      `);

    res.json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/admin/all - Get all orders (Admin only)
router.get('/admin/all', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const pool = await getPool();

    let query = `
      SELECT 
        o.OrderId as id, o.OrderNumber as orderNumber,
        os.StatusName as status, o.TotalAmount as totalAmount,
        o.PlacedAt as placedAt,
        r.Name as restaurantName,
        cu.Name as customerName, cu.Phone as customerPhone,
        au.Name as agentName
      FROM Orders o
      JOIN OrderStatuses os ON o.StatusId = os.StatusId
      JOIN Restaurants r ON o.RestaurantId = r.RestaurantId
      JOIN Users cu ON o.CustomerId = cu.UserId
      LEFT JOIN Agents a ON o.AgentId = a.AgentId
      LEFT JOIN Users au ON a.UserId = au.UserId
      WHERE 1=1
    `;

    if (status) {
      query += ` AND os.StatusName = @status`;
    }

    query += ` ORDER BY o.PlacedAt DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    const request = pool.request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit));

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

module.exports = router;
