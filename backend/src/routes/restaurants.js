const express = require('express');
const { getPool, sql } = require('../config/database');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/restaurants - Get all restaurants (with optional location filter)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { locationId, cuisine, isOpen } = req.query;
    const pool = await getPool();

    let query = `
      SELECT 
        r.RestaurantId as id, r.Name as name, r.Description as description,
        r.ImagePath as image, r.CuisineTypes as cuisineTypes,
        r.Rating as rating, r.TotalRatings as totalRatings,
        r.PriceRange as priceRange, r.OpeningTime as openingTime,
        r.ClosingTime as closingTime, r.IsOpen as isOpen,
        r.LocationId as locationId, l.Name as locationName
    `;

    // Add distance calculation if user location provided
    if (locationId) {
      query += `,
        COALESCE(ld.DistanceKm, 0) as distance,
        CASE WHEN r.LocationId = @locationId THEN 1 ELSE 0 END as isSameVillage
      `;
    }

    query += `
      FROM Restaurants r
      JOIN Locations l ON r.LocationId = l.LocationId
    `;

    if (locationId) {
      query += `
        LEFT JOIN LocationDistances ld ON 
          (ld.FromLocationId = @locationId AND ld.ToLocationId = r.LocationId)
          OR (ld.FromLocationId = r.LocationId AND ld.ToLocationId = @locationId)
      `;
    }

    query += ` WHERE r.IsActive = 1`;

    if (isOpen === 'true') {
      query += ` AND r.IsOpen = 1`;
    }

    query += ` ORDER BY r.Rating DESC, r.Name`;

    const request = pool.request();
    if (locationId) {
      request.input('locationId', sql.UniqueIdentifier, locationId);
    }

    const result = await request.query(query);

    // Parse cuisine types
    const restaurants = result.recordset.map((r) => ({
      ...r,
      cuisine: r.cuisineTypes ? r.cuisineTypes.split(',').map((c) => c.trim()) : [],
      deliveryTime: '30-45 min', // Calculated based on distance
    }));

    res.json({
      success: true,
      data: restaurants,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/restaurants/:id - Get restaurant details with menu
router.get('/:id', async (req, res, next) => {
  try {
    const pool = await getPool();

    // Get restaurant
    const restaurantResult = await pool
      .request()
      .input('restaurantId', sql.UniqueIdentifier, req.params.id)
      .query(`
        SELECT 
          r.RestaurantId as id, r.Name as name, r.Description as description,
          r.ImagePath as image, r.CuisineTypes as cuisineTypes,
          r.Rating as rating, r.TotalRatings as totalRatings,
          r.PriceRange as priceRange, r.OpeningTime as openingTime,
          r.ClosingTime as closingTime, r.IsOpen as isOpen,
          r.Phone as phone, r.Email as email, r.Address as address,
          r.LocationId as locationId, l.Name as locationName
        FROM Restaurants r
        JOIN Locations l ON r.LocationId = l.LocationId
        WHERE r.RestaurantId = @restaurantId AND r.IsActive = 1
      `);

    if (restaurantResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found',
      });
    }

    const restaurant = restaurantResult.recordset[0];

    // Get menu items
    const menuResult = await pool
      .request()
      .input('restaurantId', sql.UniqueIdentifier, req.params.id)
      .query(`
        SELECT 
          f.FoodItemId as id, f.Name as name, f.Description as description,
          f.Price as price, f.ImagePath as image,
          f.IsVeg as isVeg, f.IsSpicy as isSpicy,
          f.IsBestseller as isBestseller, f.IsAvailable as isAvailable,
          f.PreparationTime as preparationTime,
          c.CategoryId as categoryId, c.Name as category
        FROM FoodItems f
        LEFT JOIN FoodCategories c ON f.CategoryId = c.CategoryId
        WHERE f.RestaurantId = @restaurantId AND f.IsAvailable = 1
        ORDER BY c.DisplayOrder, f.IsBestseller DESC, f.Name
      `);

    res.json({
      success: true,
      data: {
        ...restaurant,
        cuisine: restaurant.cuisineTypes ? restaurant.cuisineTypes.split(',').map((c) => c.trim()) : [],
        deliveryTime: '30-45 min',
        menu: menuResult.recordset,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/restaurants - Create restaurant (Admin only)
router.post('/', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const {
      name, description, imagePath, locationId, address,
      phone, email, cuisineTypes, priceRange, openingTime, closingTime,
    } = req.body;
    const pool = await getPool();

    const result = await pool
      .request()
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description || null)
      .input('imagePath', sql.VarChar, imagePath || null)
      .input('locationId', sql.UniqueIdentifier, locationId)
      .input('address', sql.NVarChar, address || null)
      .input('phone', sql.VarChar, phone || null)
      .input('email', sql.VarChar, email || null)
      .input('cuisineTypes', sql.NVarChar, cuisineTypes || null)
      .input('priceRange', sql.VarChar, priceRange || '₹₹')
      .input('openingTime', sql.Time, openingTime || '09:00:00')
      .input('closingTime', sql.Time, closingTime || '22:00:00')
      .query(`
        INSERT INTO Restaurants (Name, Description, ImagePath, LocationId, Address, 
          Phone, Email, CuisineTypes, PriceRange, OpeningTime, ClosingTime)
        OUTPUT INSERTED.RestaurantId as id, INSERTED.Name as name
        VALUES (@name, @description, @imagePath, @locationId, @address,
          @phone, @email, @cuisineTypes, @priceRange, @openingTime, @closingTime)
      `);

    res.status(201).json({
      success: true,
      data: result.recordset[0],
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/restaurants/:id - Update restaurant (Admin only)
router.put('/:id', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const {
      name, description, imagePath, locationId, address,
      phone, email, cuisineTypes, priceRange, openingTime, closingTime, isOpen, isActive,
    } = req.body;
    const pool = await getPool();

    await pool
      .request()
      .input('restaurantId', sql.UniqueIdentifier, req.params.id)
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description || null)
      .input('imagePath', sql.VarChar, imagePath || null)
      .input('locationId', sql.UniqueIdentifier, locationId)
      .input('address', sql.NVarChar, address || null)
      .input('phone', sql.VarChar, phone || null)
      .input('email', sql.VarChar, email || null)
      .input('cuisineTypes', sql.NVarChar, cuisineTypes || null)
      .input('priceRange', sql.VarChar, priceRange || '₹₹')
      .input('openingTime', sql.Time, openingTime || '09:00:00')
      .input('closingTime', sql.Time, closingTime || '22:00:00')
      .input('isOpen', sql.Bit, isOpen !== false)
      .input('isActive', sql.Bit, isActive !== false)
      .query(`
        UPDATE Restaurants
        SET Name = @name, Description = @description, ImagePath = @imagePath,
            LocationId = @locationId, Address = @address, Phone = @phone,
            Email = @email, CuisineTypes = @cuisineTypes, PriceRange = @priceRange,
            OpeningTime = @openingTime, ClosingTime = @closingTime,
            IsOpen = @isOpen, IsActive = @isActive, UpdatedAt = GETUTCDATE()
        WHERE RestaurantId = @restaurantId
      `);

    res.json({
      success: true,
      message: 'Restaurant updated successfully',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/restaurants/:id/menu - Get menu items
router.get('/:id/menu', async (req, res, next) => {
  try {
    const pool = await getPool();

    const result = await pool
      .request()
      .input('restaurantId', sql.UniqueIdentifier, req.params.id)
      .query(`
        SELECT 
          f.FoodItemId as id, f.Name as name, f.Description as description,
          f.Price as price, f.ImagePath as image,
          f.IsVeg as isVeg, f.IsSpicy as isSpicy,
          f.IsBestseller as isBestseller, f.IsAvailable as isAvailable,
          f.PreparationTime as preparationTime,
          c.CategoryId as categoryId, c.Name as category
        FROM FoodItems f
        LEFT JOIN FoodCategories c ON f.CategoryId = c.CategoryId
        WHERE f.RestaurantId = @restaurantId
        ORDER BY c.DisplayOrder, f.IsBestseller DESC, f.Name
      `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/restaurants/:id/menu - Add menu item (Admin only)
router.post('/:id/menu', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const {
      name, description, price, imagePath, categoryId,
      isVeg, isSpicy, isBestseller, preparationTime,
    } = req.body;
    const pool = await getPool();

    const result = await pool
      .request()
      .input('restaurantId', sql.UniqueIdentifier, req.params.id)
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description || null)
      .input('price', sql.Decimal(10, 2), price)
      .input('imagePath', sql.VarChar, imagePath || null)
      .input('categoryId', sql.UniqueIdentifier, categoryId || null)
      .input('isVeg', sql.Bit, isVeg !== false)
      .input('isSpicy', sql.Bit, isSpicy === true)
      .input('isBestseller', sql.Bit, isBestseller === true)
      .input('preparationTime', sql.Int, preparationTime || 15)
      .query(`
        INSERT INTO FoodItems (RestaurantId, Name, Description, Price, ImagePath,
          CategoryId, IsVeg, IsSpicy, IsBestseller, PreparationTime)
        OUTPUT INSERTED.FoodItemId as id, INSERTED.Name as name
        VALUES (@restaurantId, @name, @description, @price, @imagePath,
          @categoryId, @isVeg, @isSpicy, @isBestseller, @preparationTime)
      `);

    res.status(201).json({
      success: true,
      data: result.recordset[0],
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
