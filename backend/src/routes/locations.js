const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/locations - Get all active locations
router.get('/', async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT 
        LocationId as id, Name as name, District as district, 
        PinCode as pinCode, IsActive as isActive
      FROM Locations
      WHERE IsActive = 1
      ORDER BY Name
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/locations/:id - Get location by ID
router.get('/:id', async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool
      .request()
      .input('locationId', sql.UniqueIdentifier, req.params.id)
      .query(`
        SELECT 
          LocationId as id, Name as name, District as district, 
          State as state, PinCode as pinCode, Latitude as latitude,
          Longitude as longitude, IsActive as isActive
        FROM Locations
        WHERE LocationId = @locationId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Location not found',
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

// GET /api/locations/:fromId/distance/:toId - Get distance between locations
router.get('/:fromId/distance/:toId', async (req, res, next) => {
  try {
    const { fromId, toId } = req.params;
    const pool = await getPool();

    // Same location
    if (fromId === toId) {
      return res.json({
        success: true,
        data: { distance: 0, isSameVillage: true },
      });
    }

    const result = await pool
      .request()
      .input('fromId', sql.UniqueIdentifier, fromId)
      .input('toId', sql.UniqueIdentifier, toId)
      .query(`
        SELECT DistanceKm as distance
        FROM LocationDistances
        WHERE (FromLocationId = @fromId AND ToLocationId = @toId)
           OR (FromLocationId = @toId AND ToLocationId = @fromId)
      `);

    if (result.recordset.length === 0) {
      return res.json({
        success: true,
        data: { distance: null, isSameVillage: false, message: 'Distance not configured' },
      });
    }

    res.json({
      success: true,
      data: {
        distance: result.recordset[0].distance,
        isSameVillage: false,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/locations - Create location (Admin only)
router.post('/', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { name, district, state, pinCode, latitude, longitude } = req.body;
    const pool = await getPool();

    const result = await pool
      .request()
      .input('name', sql.NVarChar, name)
      .input('district', sql.NVarChar, district || null)
      .input('state', sql.NVarChar, state || 'Andhra Pradesh')
      .input('pinCode', sql.VarChar, pinCode || null)
      .input('latitude', sql.Decimal(10, 8), latitude || null)
      .input('longitude', sql.Decimal(11, 8), longitude || null)
      .query(`
        INSERT INTO Locations (Name, District, State, PinCode, Latitude, Longitude)
        OUTPUT INSERTED.LocationId as id, INSERTED.Name as name
        VALUES (@name, @district, @state, @pinCode, @latitude, @longitude)
      `);

    res.status(201).json({
      success: true,
      data: result.recordset[0],
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/locations/:id - Update location (Admin only)
router.put('/:id', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { name, district, state, pinCode, latitude, longitude, isActive } = req.body;
    const pool = await getPool();

    await pool
      .request()
      .input('locationId', sql.UniqueIdentifier, req.params.id)
      .input('name', sql.NVarChar, name)
      .input('district', sql.NVarChar, district || null)
      .input('state', sql.NVarChar, state || 'Andhra Pradesh')
      .input('pinCode', sql.VarChar, pinCode || null)
      .input('latitude', sql.Decimal(10, 8), latitude || null)
      .input('longitude', sql.Decimal(11, 8), longitude || null)
      .input('isActive', sql.Bit, isActive !== false)
      .query(`
        UPDATE Locations
        SET Name = @name, District = @district, State = @state, 
            PinCode = @pinCode, Latitude = @latitude, Longitude = @longitude,
            IsActive = @isActive, UpdatedAt = GETUTCDATE()
        WHERE LocationId = @locationId
      `);

    res.json({
      success: true,
      message: 'Location updated successfully',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
