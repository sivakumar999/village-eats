-- =========================================
-- Village Eats - Stored Procedures
-- =========================================

-- USE VillageEats;
-- GO

-- =========================================
-- Generate Order Number
-- =========================================

CREATE OR ALTER PROCEDURE sp_GenerateOrderNumber
    @OrderNumber VARCHAR(20) OUTPUT
AS
BEGIN
    DECLARE @Date VARCHAR(8) = FORMAT(GETUTCDATE(), 'yyyyMMdd');
    DECLARE @Sequence INT;
    
    SELECT @Sequence = ISNULL(MAX(CAST(RIGHT(OrderNumber, 4) AS INT)), 0) + 1
    FROM Orders
    WHERE OrderNumber LIKE 'VE' + @Date + '%';
    
    SET @OrderNumber = 'VE' + @Date + RIGHT('0000' + CAST(@Sequence AS VARCHAR(4)), 4);
END;
GO

-- =========================================
-- Calculate Delivery Fee
-- =========================================

CREATE OR ALTER FUNCTION fn_CalculateDeliveryFee
(
    @RestaurantLocationId UNIQUEIDENTIFIER,
    @CustomerLocationId UNIQUEIDENTIFIER,
    @ItemCount INT
)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        CAST((SELECT SettingValue FROM AppSettings WHERE SettingKey = 'DELIVERY_BASE_FEE') AS DECIMAL(10,2)) AS BaseFee,
        CASE 
            WHEN @RestaurantLocationId = @CustomerLocationId THEN 0  -- Same village = no distance fee
            ELSE ISNULL(
                (SELECT DistanceKm * CAST((SELECT SettingValue FROM AppSettings WHERE SettingKey = 'DELIVERY_PER_KM_RATE') AS DECIMAL(10,2))
                 FROM LocationDistances 
                 WHERE FromLocationId = @RestaurantLocationId AND ToLocationId = @CustomerLocationId),
                0
            )
        END AS DistanceFee,
        CASE 
            WHEN @ItemCount >= 2 THEN CAST((SELECT SettingValue FROM AppSettings WHERE SettingKey = 'MULTI_ITEM_DISCOUNT') AS DECIMAL(10,2))
            ELSE 0
        END AS MultiItemDiscount,
        @RestaurantLocationId = @CustomerLocationId AS IsSameVillage
);
GO

-- =========================================
-- Calculate Agent Earnings
-- =========================================

CREATE OR ALTER FUNCTION fn_CalculateAgentEarning
(
    @IsSameVillage BIT,
    @ItemCount INT,
    @DistanceKm DECIMAL(5,2)
)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        CAST((SELECT SettingValue FROM AppSettings WHERE SettingKey = 'AGENT_BASE_EARNING') AS DECIMAL(10,2)) AS BaseEarning,
        CASE 
            WHEN @IsSameVillage = 0 THEN @DistanceKm * 5  -- ₹5 per km bonus for inter-village
            ELSE 0
        END AS DistanceBonus,
        CASE 
            WHEN @ItemCount >= 2 THEN CAST((SELECT SettingValue FROM AppSettings WHERE SettingKey = 'PLATFORM_COMMISSION') AS DECIMAL(10,2))
            ELSE 0
        END AS PlatformFee
);
GO

-- =========================================
-- Place Order
-- =========================================

CREATE OR ALTER PROCEDURE sp_PlaceOrder
    @CustomerId UNIQUEIDENTIFIER,
    @RestaurantId UNIQUEIDENTIFIER,
    @DeliveryLocationId UNIQUEIDENTIFIER,
    @DeliveryAddress NVARCHAR(500),
    @PaymentModeId INT,
    @CustomerNotes NVARCHAR(500) = NULL,
    @OrderItems NVARCHAR(MAX), -- JSON: [{"foodItemId": "...", "quantity": 2}]
    @OrderId UNIQUEIDENTIFIER OUTPUT,
    @OrderNumber VARCHAR(20) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Generate order number
        EXEC sp_GenerateOrderNumber @OrderNumber OUTPUT;
        
        SET @OrderId = NEWID();
        
        -- Get restaurant location
        DECLARE @RestaurantLocationId UNIQUEIDENTIFIER;
        SELECT @RestaurantLocationId = LocationId FROM Restaurants WHERE RestaurantId = @RestaurantId;
        
        -- Check if same village
        DECLARE @IsSameVillage BIT = CASE WHEN @RestaurantLocationId = @DeliveryLocationId THEN 1 ELSE 0 END;
        
        -- Get distance
        DECLARE @Distance DECIMAL(5,2) = 0;
        IF @IsSameVillage = 0
        BEGIN
            SELECT @Distance = DistanceKm 
            FROM LocationDistances 
            WHERE FromLocationId = @RestaurantLocationId AND ToLocationId = @DeliveryLocationId;
        END
        
        -- Calculate item total
        DECLARE @ItemTotal DECIMAL(10,2);
        DECLARE @ItemCount INT;
        
        SELECT 
            @ItemTotal = SUM(fi.Price * items.Quantity),
            @ItemCount = SUM(items.Quantity)
        FROM OPENJSON(@OrderItems)
        WITH (FoodItemId UNIQUEIDENTIFIER, Quantity INT) AS items
        JOIN FoodItems fi ON fi.FoodItemId = items.FoodItemId;
        
        -- Calculate delivery fees
        DECLARE @BaseFee DECIMAL(10,2), @DistanceFee DECIMAL(10,2), @Discount DECIMAL(10,2);
        SELECT @BaseFee = BaseFee, @DistanceFee = DistanceFee, @Discount = MultiItemDiscount
        FROM fn_CalculateDeliveryFee(@RestaurantLocationId, @DeliveryLocationId, @ItemCount);
        
        DECLARE @TotalAmount DECIMAL(10,2) = @ItemTotal + @BaseFee + @DistanceFee - @Discount;
        
        -- Insert order
        INSERT INTO Orders (
            OrderId, OrderNumber, CustomerId, RestaurantId, StatusId,
            DeliveryLocationId, DeliveryAddress, DeliveryDistance, IsSameVillage,
            ItemTotal, DeliveryBaseFee, DeliveryDistanceFee, MultiItemDiscount, TotalAmount,
            PaymentModeId, CustomerNotes
        )
        VALUES (
            @OrderId, @OrderNumber, @CustomerId, @RestaurantId, 1,
            @DeliveryLocationId, @DeliveryAddress, @Distance, @IsSameVillage,
            @ItemTotal, @BaseFee, @DistanceFee, @Discount, @TotalAmount,
            @PaymentModeId, @CustomerNotes
        );
        
        -- Insert order items
        INSERT INTO OrderItems (OrderId, FoodItemId, Quantity, UnitPrice, TotalPrice)
        SELECT 
            @OrderId,
            items.FoodItemId,
            items.Quantity,
            fi.Price,
            fi.Price * items.Quantity
        FROM OPENJSON(@OrderItems)
        WITH (FoodItemId UNIQUEIDENTIFIER, Quantity INT) AS items
        JOIN FoodItems fi ON fi.FoodItemId = items.FoodItemId;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- =========================================
-- Accept Order (Agent)
-- =========================================

CREATE OR ALTER PROCEDURE sp_AcceptOrder
    @OrderId UNIQUEIDENTIFIER,
    @AgentId UNIQUEIDENTIFIER,
    @Success BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check if order is still pending
        DECLARE @CurrentStatus INT;
        SELECT @CurrentStatus = StatusId FROM Orders WHERE OrderId = @OrderId;
        
        IF @CurrentStatus != 1  -- Not 'placed'
        BEGIN
            SET @Success = 0;
            SET @Message = 'Order is no longer available for acceptance';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Assign agent
        UPDATE Orders 
        SET AgentId = @AgentId, 
            StatusId = 2,  -- 'accepted'
            AcceptedAt = GETUTCDATE(),
            UpdatedAt = GETUTCDATE()
        WHERE OrderId = @OrderId AND StatusId = 1;
        
        IF @@ROWCOUNT = 0
        BEGIN
            SET @Success = 0;
            SET @Message = 'Order was already accepted by another agent';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Log assignment
        INSERT INTO OrderAssignments (OrderId, AgentId, Action)
        VALUES (@OrderId, @AgentId, 'accepted');
        
        -- Calculate and record earnings
        DECLARE @IsSameVillage BIT, @Distance DECIMAL(5,2), @ItemCount INT;
        SELECT @IsSameVillage = IsSameVillage, @Distance = DeliveryDistance 
        FROM Orders WHERE OrderId = @OrderId;
        
        SELECT @ItemCount = SUM(Quantity) FROM OrderItems WHERE OrderId = @OrderId;
        
        DECLARE @BaseEarning DECIMAL(10,2), @DistanceBonus DECIMAL(10,2), @PlatformFee DECIMAL(10,2);
        SELECT @BaseEarning = BaseEarning, @DistanceBonus = DistanceBonus, @PlatformFee = PlatformFee
        FROM fn_CalculateAgentEarning(@IsSameVillage, @ItemCount, @Distance);
        
        INSERT INTO AgentEarnings (AgentId, OrderId, BaseEarning, DistanceBonus, PlatformFee, TotalEarning)
        VALUES (@AgentId, @OrderId, @BaseEarning, @DistanceBonus, @PlatformFee, @BaseEarning + @DistanceBonus - @PlatformFee);
        
        SET @Success = 1;
        SET @Message = 'Order accepted successfully';
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @Success = 0;
        SET @Message = ERROR_MESSAGE();
    END CATCH
END;
GO

-- =========================================
-- Get Agent Earnings Summary
-- =========================================

CREATE OR ALTER PROCEDURE sp_GetAgentEarnings
    @AgentId UNIQUEIDENTIFIER,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @StartDate IS NULL SET @StartDate = CAST(GETUTCDATE() AS DATE);
    IF @EndDate IS NULL SET @EndDate = CAST(GETUTCDATE() AS DATE);
    
    -- Daily earnings
    SELECT 
        CAST(ae.CreatedAt AS DATE) AS Date,
        COUNT(*) AS Deliveries,
        SUM(ae.TotalEarning) AS TotalEarning
    FROM AgentEarnings ae
    WHERE ae.AgentId = @AgentId
      AND CAST(ae.CreatedAt AS DATE) BETWEEN @StartDate AND @EndDate
    GROUP BY CAST(ae.CreatedAt AS DATE)
    ORDER BY Date DESC;
    
    -- Summary
    SELECT 
        COUNT(*) AS TotalDeliveries,
        SUM(ae.TotalEarning) AS TotalEarning,
        SUM(ae.BaseEarning) AS BaseEarnings,
        SUM(ae.DistanceBonus) AS DistanceBonuses,
        SUM(ae.PlatformFee) AS PlatformFees,
        SUM(CASE WHEN ae.IsPaid = 1 THEN ae.TotalEarning ELSE 0 END) AS PaidAmount,
        SUM(CASE WHEN ae.IsPaid = 0 THEN ae.TotalEarning ELSE 0 END) AS PendingAmount
    FROM AgentEarnings ae
    WHERE ae.AgentId = @AgentId
      AND CAST(ae.CreatedAt AS DATE) BETWEEN @StartDate AND @EndDate;
END;
GO

PRINT 'Stored procedures created successfully!';
