-- =========================================
-- Village Eats - MSSQL Database Schema
-- Version: 1.0.0
-- =========================================

-- Create Database (run this separately if needed)
-- CREATE DATABASE VillageEats;
-- GO
-- USE VillageEats;
-- GO

-- =========================================
-- ENUM-like Tables / Lookup Tables
-- =========================================

-- User Roles
CREATE TABLE Roles (
    RoleId INT PRIMARY KEY IDENTITY(1,1),
    RoleName VARCHAR(20) NOT NULL UNIQUE,
    Description NVARCHAR(100)
);

INSERT INTO Roles (RoleName, Description) VALUES 
    ('CUSTOMER', 'Regular customer who orders food'),
    ('ADMIN', 'Administrator with full access'),
    ('AGENT', 'Delivery agent/partner');

-- Order Status
CREATE TABLE OrderStatuses (
    StatusId INT PRIMARY KEY IDENTITY(1,1),
    StatusName VARCHAR(20) NOT NULL UNIQUE,
    Description NVARCHAR(100)
);

INSERT INTO OrderStatuses (StatusName, Description) VALUES 
    ('placed', 'Order has been placed by customer'),
    ('accepted', 'Order accepted by delivery agent'),
    ('preparing', 'Restaurant is preparing the order'),
    ('on_the_way', 'Agent is on the way to deliver'),
    ('delivered', 'Order has been delivered'),
    ('cancelled', 'Order has been cancelled');

-- Payment Modes
CREATE TABLE PaymentModes (
    ModeId INT PRIMARY KEY IDENTITY(1,1),
    ModeName VARCHAR(20) NOT NULL UNIQUE,
    Description NVARCHAR(100)
);

INSERT INTO PaymentModes (ModeName, Description) VALUES 
    ('COD', 'Cash on Delivery'),
    ('ONLINE', 'Online Payment (UPI/Card)');

-- =========================================
-- Core Tables
-- =========================================

-- Locations (Villages/Areas)
CREATE TABLE Locations (
    LocationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL,
    District NVARCHAR(100),
    State NVARCHAR(100) DEFAULT 'Andhra Pradesh',
    PinCode VARCHAR(10),
    Latitude DECIMAL(10, 8),
    Longitude DECIMAL(11, 8),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Distance between locations (for delivery calculations)
CREATE TABLE LocationDistances (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FromLocationId UNIQUEIDENTIFIER NOT NULL REFERENCES Locations(LocationId),
    ToLocationId UNIQUEIDENTIFIER NOT NULL REFERENCES Locations(LocationId),
    DistanceKm DECIMAL(5, 2) NOT NULL,
    CONSTRAINT UQ_LocationDistance UNIQUE (FromLocationId, ToLocationId)
);

-- Users (All roles use this table)
CREATE TABLE Users (
    UserId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Phone VARCHAR(15),
    LocationId UNIQUEIDENTIFIER REFERENCES Locations(LocationId),
    Address NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- User Roles Mapping (Many-to-Many)
CREATE TABLE UserRoles (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL REFERENCES Users(UserId) ON DELETE CASCADE,
    RoleId INT NOT NULL REFERENCES Roles(RoleId),
    AssignedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_UserRole UNIQUE (UserId, RoleId)
);

-- Agents (Extended info for delivery partners)
CREATE TABLE Agents (
    AgentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL UNIQUE REFERENCES Users(UserId) ON DELETE CASCADE,
    VehicleType VARCHAR(20) DEFAULT 'BIKE', -- BIKE, SCOOTER, CYCLE
    LicenseNumber VARCHAR(50),
    AssignedLocationId UNIQUEIDENTIFIER REFERENCES Locations(LocationId),
    IsAvailable BIT DEFAULT 1,
    CurrentLatitude DECIMAL(10, 8),
    CurrentLongitude DECIMAL(11, 8),
    LastActiveAt DATETIME2,
    TotalDeliveries INT DEFAULT 0,
    Rating DECIMAL(3, 2) DEFAULT 5.00,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Restaurants
CREATE TABLE Restaurants (
    RestaurantId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500),
    ImagePath VARCHAR(255),
    LocationId UNIQUEIDENTIFIER NOT NULL REFERENCES Locations(LocationId),
    Address NVARCHAR(500),
    Phone VARCHAR(15),
    Email VARCHAR(255),
    CuisineTypes NVARCHAR(255), -- Comma-separated: "Indian,Chinese,South Indian"
    Rating DECIMAL(3, 2) DEFAULT 4.00,
    TotalRatings INT DEFAULT 0,
    PriceRange VARCHAR(10) DEFAULT '₹₹', -- ₹, ₹₹, ₹₹₹
    OpeningTime TIME DEFAULT '09:00:00',
    ClosingTime TIME DEFAULT '22:00:00',
    IsOpen BIT DEFAULT 1,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Food Categories
CREATE TABLE FoodCategories (
    CategoryId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    DisplayOrder INT DEFAULT 0,
    IsActive BIT DEFAULT 1
);

INSERT INTO FoodCategories (Name, Description, DisplayOrder) VALUES
    ('Starters', 'Appetizers and snacks', 1),
    ('Main Course', 'Main dishes', 2),
    ('Biryanis', 'Rice specialties', 3),
    ('Breads', 'Naan, Roti, Paratha', 4),
    ('Beverages', 'Drinks and refreshments', 5),
    ('Desserts', 'Sweet dishes', 6);

-- Food Items / Menu Items
CREATE TABLE FoodItems (
    FoodItemId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RestaurantId UNIQUEIDENTIFIER NOT NULL REFERENCES Restaurants(RestaurantId) ON DELETE CASCADE,
    CategoryId UNIQUEIDENTIFIER REFERENCES FoodCategories(CategoryId),
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500),
    Price DECIMAL(10, 2) NOT NULL,
    ImagePath VARCHAR(255),
    IsVeg BIT DEFAULT 1,
    IsSpicy BIT DEFAULT 0,
    IsBestseller BIT DEFAULT 0,
    IsAvailable BIT DEFAULT 1,
    PreparationTime INT DEFAULT 15, -- in minutes
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- =========================================
-- Order & Payment Tables
-- =========================================

-- Orders
CREATE TABLE Orders (
    OrderId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    OrderNumber VARCHAR(20) NOT NULL UNIQUE,
    CustomerId UNIQUEIDENTIFIER NOT NULL REFERENCES Users(UserId),
    RestaurantId UNIQUEIDENTIFIER NOT NULL REFERENCES Restaurants(RestaurantId),
    AgentId UNIQUEIDENTIFIER REFERENCES Agents(AgentId),
    StatusId INT NOT NULL REFERENCES OrderStatuses(StatusId) DEFAULT 1,
    
    -- Delivery Details
    DeliveryLocationId UNIQUEIDENTIFIER REFERENCES Locations(LocationId),
    DeliveryAddress NVARCHAR(500),
    DeliveryDistance DECIMAL(5, 2), -- in km
    IsSameVillage BIT DEFAULT 1,
    
    -- Pricing
    ItemTotal DECIMAL(10, 2) NOT NULL,
    DeliveryBaseFee DECIMAL(10, 2) NOT NULL,
    DeliveryDistanceFee DECIMAL(10, 2) DEFAULT 0,
    MultiItemDiscount DECIMAL(10, 2) DEFAULT 0,
    TotalAmount DECIMAL(10, 2) NOT NULL,
    
    -- Payment
    PaymentModeId INT REFERENCES PaymentModes(ModeId),
    PaymentStatus VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
    
    -- Timestamps
    PlacedAt DATETIME2 DEFAULT GETUTCDATE(),
    AcceptedAt DATETIME2,
    PreparedAt DATETIME2,
    PickedUpAt DATETIME2,
    DeliveredAt DATETIME2,
    CancelledAt DATETIME2,
    CancelReason NVARCHAR(255),
    
    -- Notes
    CustomerNotes NVARCHAR(500),
    RestaurantNotes NVARCHAR(500),
    
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Order Items
CREATE TABLE OrderItems (
    OrderItemId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    OrderId UNIQUEIDENTIFIER NOT NULL REFERENCES Orders(OrderId) ON DELETE CASCADE,
    FoodItemId UNIQUEIDENTIFIER NOT NULL REFERENCES FoodItems(FoodItemId),
    Quantity INT NOT NULL DEFAULT 1,
    UnitPrice DECIMAL(10, 2) NOT NULL,
    TotalPrice DECIMAL(10, 2) NOT NULL,
    Notes NVARCHAR(255)
);

-- Payments
CREATE TABLE Payments (
    PaymentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    OrderId UNIQUEIDENTIFIER NOT NULL REFERENCES Orders(OrderId),
    Amount DECIMAL(10, 2) NOT NULL,
    PaymentModeId INT NOT NULL REFERENCES PaymentModes(ModeId),
    TransactionId VARCHAR(100),
    Status VARCHAR(20) DEFAULT 'pending', -- pending, success, failed
    GatewayResponse NVARCHAR(MAX), -- JSON response from payment gateway
    PaidAt DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- =========================================
-- Agent Earnings & Assignments
-- =========================================

-- Agent Earnings (per delivery)
CREATE TABLE AgentEarnings (
    EarningId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    AgentId UNIQUEIDENTIFIER NOT NULL REFERENCES Agents(AgentId),
    OrderId UNIQUEIDENTIFIER NOT NULL REFERENCES Orders(OrderId),
    BaseEarning DECIMAL(10, 2) NOT NULL,
    DistanceBonus DECIMAL(10, 2) DEFAULT 0,
    PlatformFee DECIMAL(10, 2) DEFAULT 0, -- Deducted by platform
    TotalEarning DECIMAL(10, 2) NOT NULL,
    IsPaid BIT DEFAULT 0,
    PaidAt DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Order Assignment Log (tracking which agents see/accept orders)
CREATE TABLE OrderAssignments (
    AssignmentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    OrderId UNIQUEIDENTIFIER NOT NULL REFERENCES Orders(OrderId),
    AgentId UNIQUEIDENTIFIER NOT NULL REFERENCES Agents(AgentId),
    Action VARCHAR(20) NOT NULL, -- offered, viewed, accepted, rejected, expired
    ActionAt DATETIME2 DEFAULT GETUTCDATE(),
    Notes NVARCHAR(255)
);

-- =========================================
-- Configuration Table (Admin-editable settings)
-- =========================================

CREATE TABLE AppSettings (
    SettingId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SettingKey VARCHAR(100) NOT NULL UNIQUE,
    SettingValue NVARCHAR(255) NOT NULL,
    Description NVARCHAR(500),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedBy UNIQUEIDENTIFIER REFERENCES Users(UserId)
);

-- Default Settings
INSERT INTO AppSettings (SettingKey, SettingValue, Description) VALUES
    ('DELIVERY_BASE_FEE', '20', 'Base delivery fee in rupees'),
    ('DELIVERY_PER_KM_RATE', '9', 'Per kilometer charge for inter-village delivery'),
    ('MULTI_ITEM_DISCOUNT', '10', 'Discount for 2+ items from same restaurant'),
    ('AGENT_BASE_EARNING', '20', 'Agent earning for same-village single order'),
    ('AGENT_MULTI_ITEM_EARNING', '25', 'Agent earning for multi-item delivery'),
    ('PLATFORM_COMMISSION', '5', 'Platform commission from multi-item delivery'),
    ('JWT_EXPIRY_HOURS', '24', 'JWT token expiry time in hours');

-- =========================================
-- Indexes for Performance
-- =========================================

CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_LocationId ON Users(LocationId);
CREATE INDEX IX_Restaurants_LocationId ON Restaurants(LocationId);
CREATE INDEX IX_FoodItems_RestaurantId ON FoodItems(RestaurantId);
CREATE INDEX IX_Orders_CustomerId ON Orders(CustomerId);
CREATE INDEX IX_Orders_RestaurantId ON Orders(RestaurantId);
CREATE INDEX IX_Orders_AgentId ON Orders(AgentId);
CREATE INDEX IX_Orders_StatusId ON Orders(StatusId);
CREATE INDEX IX_Orders_PlacedAt ON Orders(PlacedAt);
CREATE INDEX IX_Agents_AssignedLocationId ON Agents(AssignedLocationId);
CREATE INDEX IX_AgentEarnings_AgentId ON AgentEarnings(AgentId);

PRINT 'Village Eats database schema created successfully!';
