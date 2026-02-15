-- =========================================
-- Village Eats - MSSQL Database Schema
-- Complete Setup - Run this first
-- =========================================

-- CREATE DATABASE VillageEats;
-- GO
-- USE VillageEats;
-- GO

-- Roles
CREATE TABLE Roles (
    RoleId INT PRIMARY KEY IDENTITY(1,1),
    RoleName VARCHAR(20) NOT NULL UNIQUE,
    Description NVARCHAR(100)
);

-- Users
CREATE TABLE Users (
    UserId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Phone VARCHAR(15),
    Address NVARCHAR(500),
    LocationId UNIQUEIDENTIFIER NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- User Roles
CREATE TABLE UserRoles (
    UserId UNIQUEIDENTIFIER NOT NULL,
    RoleId INT NOT NULL,
    AssignedAt DATETIME2 DEFAULT GETUTCDATE(),
    PRIMARY KEY (UserId, RoleId),
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)
);

-- Locations (Villages)
CREATE TABLE Locations (
    LocationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL,
    District NVARCHAR(100),
    PinCode VARCHAR(10),
    Latitude DECIMAL(10,7),
    Longitude DECIMAL(10,7),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Location Distances
CREATE TABLE LocationDistances (
    FromLocationId UNIQUEIDENTIFIER NOT NULL,
    ToLocationId UNIQUEIDENTIFIER NOT NULL,
    DistanceKm DECIMAL(5,2) NOT NULL,
    PRIMARY KEY (FromLocationId, ToLocationId),
    FOREIGN KEY (FromLocationId) REFERENCES Locations(LocationId),
    FOREIGN KEY (ToLocationId) REFERENCES Locations(LocationId)
);

-- Restaurants
CREATE TABLE Restaurants (
    RestaurantId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    ImageUrl VARCHAR(500),
    LocationId UNIQUEIDENTIFIER NOT NULL,
    Rating DECIMAL(2,1) DEFAULT 0,
    TotalRatings INT DEFAULT 0,
    DeliveryTime VARCHAR(20) DEFAULT '30-40 min',
    PriceRange VARCHAR(50),
    IsOpen BIT DEFAULT 1,
    OpeningTime TIME,
    ClosingTime TIME,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (LocationId) REFERENCES Locations(LocationId)
);

-- Food Categories
CREATE TABLE FoodCategories (
    CategoryId INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(200),
    DisplayOrder INT DEFAULT 0
);

-- Food Items
CREATE TABLE FoodItems (
    FoodItemId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RestaurantId UNIQUEIDENTIFIER NOT NULL,
    CategoryId INT,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    Price DECIMAL(10,2) NOT NULL,
    ImageUrl VARCHAR(500),
    IsVeg BIT DEFAULT 0,
    IsSpicy BIT DEFAULT 0,
    IsBestseller BIT DEFAULT 0,
    IsAvailable BIT DEFAULT 1,
    PreparationTime INT DEFAULT 15,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (RestaurantId) REFERENCES Restaurants(RestaurantId),
    FOREIGN KEY (CategoryId) REFERENCES FoodCategories(CategoryId)
);

-- Payment Modes
CREATE TABLE PaymentModes (
    PaymentModeId INT PRIMARY KEY IDENTITY(1,1),
    ModeName VARCHAR(20) NOT NULL,
    IsActive BIT DEFAULT 1
);

-- Order Statuses
CREATE TABLE OrderStatuses (
    StatusId INT PRIMARY KEY IDENTITY(1,1),
    StatusName VARCHAR(20) NOT NULL,
    Description NVARCHAR(100),
    DisplayOrder INT DEFAULT 0
);

-- Orders
CREATE TABLE Orders (
    OrderId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    OrderNumber VARCHAR(20) NOT NULL UNIQUE,
    CustomerId UNIQUEIDENTIFIER NOT NULL,
    RestaurantId UNIQUEIDENTIFIER NOT NULL,
    AgentId UNIQUEIDENTIFIER NULL,
    StatusId INT NOT NULL DEFAULT 1,
    DeliveryLocationId UNIQUEIDENTIFIER NOT NULL,
    DeliveryAddress NVARCHAR(500) NOT NULL,
    DeliveryDistance DECIMAL(5,2) DEFAULT 0,
    IsSameVillage BIT DEFAULT 1,
    ItemTotal DECIMAL(10,2) NOT NULL,
    DeliveryBaseFee DECIMAL(10,2) DEFAULT 20,
    DeliveryDistanceFee DECIMAL(10,2) DEFAULT 0,
    MultiItemDiscount DECIMAL(10,2) DEFAULT 0,
    TotalAmount DECIMAL(10,2) NOT NULL,
    PaymentModeId INT NOT NULL,
    PaymentStatus VARCHAR(20) DEFAULT 'pending',
    CustomerNotes NVARCHAR(500),
    PlacedAt DATETIME2 DEFAULT GETUTCDATE(),
    AcceptedAt DATETIME2,
    PreparedAt DATETIME2,
    PickedUpAt DATETIME2,
    DeliveredAt DATETIME2,
    CancelledAt DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (CustomerId) REFERENCES Users(UserId),
    FOREIGN KEY (RestaurantId) REFERENCES Restaurants(RestaurantId),
    FOREIGN KEY (AgentId) REFERENCES Users(UserId),
    FOREIGN KEY (StatusId) REFERENCES OrderStatuses(StatusId),
    FOREIGN KEY (DeliveryLocationId) REFERENCES Locations(LocationId),
    FOREIGN KEY (PaymentModeId) REFERENCES PaymentModes(PaymentModeId)
);

-- Order Items
CREATE TABLE OrderItems (
    OrderItemId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    OrderId UNIQUEIDENTIFIER NOT NULL,
    FoodItemId UNIQUEIDENTIFIER NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    UnitPrice DECIMAL(10,2) NOT NULL,
    TotalPrice DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (OrderId) REFERENCES Orders(OrderId),
    FOREIGN KEY (FoodItemId) REFERENCES FoodItems(FoodItemId)
);

-- Agents
CREATE TABLE Agents (
    AgentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL UNIQUE,
    VehicleType VARCHAR(20) DEFAULT 'BIKE',
    LicenseNumber VARCHAR(50),
    AssignedLocationId UNIQUEIDENTIFIER NOT NULL,
    IsAvailable BIT DEFAULT 1,
    CurrentLatitude DECIMAL(10,7),
    CurrentLongitude DECIMAL(10,7),
    TotalDeliveries INT DEFAULT 0,
    Rating DECIMAL(2,1) DEFAULT 5.0,
    LastActiveAt DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (AssignedLocationId) REFERENCES Locations(LocationId)
);

-- Order Assignments (audit trail)
CREATE TABLE OrderAssignments (
    AssignmentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    OrderId UNIQUEIDENTIFIER NOT NULL,
    AgentId UNIQUEIDENTIFIER NOT NULL,
    Action VARCHAR(20) NOT NULL,
    Reason NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (OrderId) REFERENCES Orders(OrderId),
    FOREIGN KEY (AgentId) REFERENCES Users(UserId)
);

-- Agent Earnings
CREATE TABLE AgentEarnings (
    EarningId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    AgentId UNIQUEIDENTIFIER NOT NULL,
    OrderId UNIQUEIDENTIFIER NOT NULL,
    BaseEarning DECIMAL(10,2) NOT NULL,
    DistanceBonus DECIMAL(10,2) DEFAULT 0,
    PlatformFee DECIMAL(10,2) DEFAULT 0,
    TotalEarning DECIMAL(10,2) NOT NULL,
    IsPaid BIT DEFAULT 0,
    PaidAt DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (AgentId) REFERENCES Agents(AgentId),
    FOREIGN KEY (OrderId) REFERENCES Orders(OrderId)
);

-- App Settings
CREATE TABLE AppSettings (
    SettingKey VARCHAR(50) PRIMARY KEY,
    SettingValue VARCHAR(255) NOT NULL,
    Description NVARCHAR(200)
);

-- Indexes
CREATE INDEX IX_Orders_CustomerId ON Orders(CustomerId);
CREATE INDEX IX_Orders_AgentId ON Orders(AgentId);
CREATE INDEX IX_Orders_RestaurantId ON Orders(RestaurantId);
CREATE INDEX IX_Orders_StatusId ON Orders(StatusId);
CREATE INDEX IX_Orders_PlacedAt ON Orders(PlacedAt DESC);
CREATE INDEX IX_OrderItems_OrderId ON OrderItems(OrderId);
CREATE INDEX IX_FoodItems_RestaurantId ON FoodItems(RestaurantId);
CREATE INDEX IX_AgentEarnings_AgentId ON AgentEarnings(AgentId);
CREATE INDEX IX_Agents_AssignedLocationId ON Agents(AssignedLocationId);
CREATE INDEX IX_Users_Email ON Users(Email);

PRINT 'Schema created successfully!';
GO
