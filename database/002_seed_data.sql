-- =========================================
-- Village Eats - Seed Data
-- Run after 001_create_schema.sql
-- =========================================

-- USE VillageEats;
-- GO

-- Roles
INSERT INTO Roles (RoleName, Description) VALUES
('CUSTOMER', 'Regular customer who orders food'),
('AGENT', 'Delivery agent who delivers food'),
('ADMIN', 'Administrator with full access');

-- Order Statuses
INSERT INTO OrderStatuses (StatusName, Description, DisplayOrder) VALUES
('placed', 'Order placed by customer', 1),
('accepted', 'Accepted by delivery agent', 2),
('preparing', 'Restaurant is preparing', 3),
('on_the_way', 'Agent is delivering', 4),
('delivered', 'Order delivered', 5),
('cancelled', 'Order cancelled', 6);

-- Payment Modes
INSERT INTO PaymentModes (ModeName, IsActive) VALUES
('COD', 0),       -- Coming soon
('PHONEPE', 1),
('GOOGLEPAY', 1);

-- App Settings
INSERT INTO AppSettings (SettingKey, SettingValue, Description) VALUES
('DELIVERY_BASE_FEE', '20', 'Base delivery fee in rupees'),
('DELIVERY_PER_KM_RATE', '9', 'Per km rate for inter-village delivery'),
('MULTI_ITEM_DISCOUNT', '10', 'Discount for 2+ items from same restaurant'),
('AGENT_BASE_EARNING', '20', 'Base earning per delivery'),
('PLATFORM_COMMISSION', '5', 'Platform fee deducted from agent'),
('REFUND_WINDOW_HOURS', '24', 'Refund window if delivery fails');

-- Locations
DECLARE @Loc1 UNIQUEIDENTIFIER = NEWID();
DECLARE @Loc2 UNIQUEIDENTIFIER = NEWID();
DECLARE @Loc3 UNIQUEIDENTIFIER = NEWID();
DECLARE @Loc4 UNIQUEIDENTIFIER = NEWID();
DECLARE @Loc5 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Locations (LocationId, Name, District, PinCode, Latitude, Longitude) VALUES
(@Loc1, 'Cherukupalli', 'Guntur', '522311', 16.1147, 80.8251),
(@Loc2, 'Kavuru', 'Guntur', '522312', 16.1280, 80.8100),
(@Loc3, 'Repalle', 'Guntur', '522265', 16.0193, 80.8280),
(@Loc4, 'Tenali', 'Guntur', '522201', 16.2383, 80.6400),
(@Loc5, 'Chirala', 'Prakasam', '523155', 15.8244, 80.3520);

-- Distances (bidirectional)
INSERT INTO LocationDistances VALUES
(@Loc1, @Loc2, 2), (@Loc2, @Loc1, 2),
(@Loc1, @Loc3, 5), (@Loc3, @Loc1, 5),
(@Loc1, @Loc4, 8), (@Loc4, @Loc1, 8),
(@Loc1, @Loc5, 12), (@Loc5, @Loc1, 12),
(@Loc2, @Loc3, 4), (@Loc3, @Loc2, 4),
(@Loc2, @Loc4, 7), (@Loc4, @Loc2, 7),
(@Loc2, @Loc5, 11), (@Loc5, @Loc2, 11),
(@Loc3, @Loc4, 6), (@Loc4, @Loc3, 6),
(@Loc3, @Loc5, 10), (@Loc5, @Loc3, 10),
(@Loc4, @Loc5, 9), (@Loc5, @Loc4, 9);

-- Users (replace @PasswordHash with bcrypt('password'))
DECLARE @PH VARCHAR(255) = '$2b$10$placeholder';

DECLARE @C1 UNIQUEIDENTIFIER = NEWID();
DECLARE @C2 UNIQUEIDENTIFIER = NEWID();
DECLARE @A1 UNIQUEIDENTIFIER = NEWID();
DECLARE @A2 UNIQUEIDENTIFIER = NEWID();
DECLARE @AD UNIQUEIDENTIFIER = NEWID();

INSERT INTO Users (UserId, Email, PasswordHash, Name, Phone, Address, LocationId) VALUES
(@C1, 'customer@villageeats.com', @PH, 'Ravi Kumar', '9876543210', 'Main Road, Near Temple, Cherukupalli', @Loc1),
(@C2, 'lakshmi@villageeats.com', @PH, 'Lakshmi Devi', '9876543213', 'Temple Street, House 45, Kavuru', @Loc2),
(@A1, 'agent@villageeats.com', @PH, 'Sunny', '9876543211', 'Bus Stand, Cherukupalli', @Loc1),
(@A2, 'raju@villageeats.com', @PH, 'Raju', '9876543214', 'Market Road, Kavuru', @Loc2),
(@AD, 'admin@villageeats.com', @PH, 'Admin User', '9876543212', 'Office, Cherukupalli', @Loc1);

INSERT INTO UserRoles (UserId, RoleId) VALUES
(@C1, 1), (@C2, 1), (@A1, 2), (@A2, 2), (@AD, 3);

-- Agents
INSERT INTO Agents (UserId, VehicleType, AssignedLocationId, IsAvailable, TotalDeliveries, Rating) VALUES
(@A1, 'BIKE', @Loc1, 1, 127, 4.8),
(@A2, 'SCOOTER', @Loc2, 1, 85, 4.5);

-- Food Categories
INSERT INTO FoodCategories (Name, DisplayOrder) VALUES
('Biryani', 1), ('South Indian', 2), ('Main Course', 3),
('Tandoor', 4), ('Breads', 5), ('Meals', 6),
('Starters', 7), ('Breakfast', 8), ('Seafood', 9);

-- Restaurants
DECLARE @R1 UNIQUEIDENTIFIER = NEWID();
DECLARE @R2 UNIQUEIDENTIFIER = NEWID();
DECLARE @R3 UNIQUEIDENTIFIER = NEWID();
DECLARE @R4 UNIQUEIDENTIFIER = NEWID();
DECLARE @R5 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Restaurants (RestaurantId, Name, Description, LocationId, Rating, TotalRatings, DeliveryTime, PriceRange, IsOpen) VALUES
(@R1, 'Spice Garden', 'Authentic South Indian & Biryani', @Loc1, 4.5, 230, '25-30 min', '₹150 for two', 1),
(@R2, 'Royal Dhaba', 'North Indian & Tandoor', @Loc1, 4.2, 180, '30-35 min', '₹200 for two', 1),
(@R3, 'Taste of Village', 'Traditional Andhra food', @Loc1, 4.7, 310, '20-25 min', '₹120 for two', 1),
(@R4, 'Kavuru Kitchen', 'Home-cooked meals', @Loc2, 4.3, 95, '35-40 min', '₹180 for two', 1),
(@R5, 'Biryani House', 'Premium biryani & kebabs', @Loc2, 4.6, 150, '40-45 min', '₹250 for two', 0);

-- Food Items
INSERT INTO FoodItems (RestaurantId, CategoryId, Name, Description, Price, IsVeg, IsSpicy, IsBestseller) VALUES
(@R1, 1, 'Hyderabadi Chicken Biryani', 'Aromatic basmati rice with tender chicken', 180, 0, 1, 1),
(@R1, 2, 'Masala Dosa', 'Crispy dosa with spiced potato masala', 80, 1, 0, 0),
(@R1, 3, 'Butter Chicken', 'Chicken in creamy tomato gravy', 220, 0, 1, 0),
(@R1, 3, 'Paneer Butter Masala', 'Paneer in rich tomato gravy', 180, 1, 0, 1),
(@R2, 4, 'Tandoori Chicken', 'Clay oven roasted chicken', 280, 0, 1, 1),
(@R2, 3, 'Dal Makhani', 'Slow-cooked black lentils', 160, 1, 0, 0),
(@R2, 5, 'Naan Basket', 'Assorted naans and parathas', 120, 1, 0, 0),
(@R3, 6, 'Andhra Thali', 'Complete meal with rice and curries', 150, 1, 0, 1),
(@R3, 3, 'Gongura Chicken', 'Spicy chicken with gongura leaves', 200, 0, 1, 0),
(@R3, 8, 'Pesarattu', 'Green moong dal dosa', 70, 1, 0, 0),
(@R4, 6, 'Special Meals', 'Rice with dal, sambar, curries', 100, 1, 0, 1),
(@R4, 9, 'Fish Curry', 'Fish in tangy tamarind gravy', 180, 0, 1, 0),
(@R5, 1, 'Mutton Biryani', 'Dum cooked biryani with mutton', 250, 0, 1, 1),
(@R5, 7, 'Seekh Kebab', 'Grilled minced meat kebabs', 180, 0, 0, 0);

PRINT 'Seed data inserted successfully!';
GO
