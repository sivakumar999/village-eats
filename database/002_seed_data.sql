-- =========================================
-- Village Eats - Sample Seed Data
-- =========================================

-- USE VillageEats;
-- GO

-- =========================================
-- Locations (Villages)
-- =========================================

DECLARE @CherukupalliId UNIQUEIDENTIFIER = NEWID();
DECLARE @KavuruId UNIQUEIDENTIFIER = NEWID();
DECLARE @RepalleeId UNIQUEIDENTIFIER = NEWID();
DECLARE @TenaaliId UNIQUEIDENTIFIER = NEWID();
DECLARE @ChinikolluId UNIQUEIDENTIFIER = NEWID();

INSERT INTO Locations (LocationId, Name, District, PinCode, Latitude, Longitude) VALUES
    (@CherukupalliId, 'Cherukupalli', 'Guntur', '522259', 16.0167, 80.7333),
    (@KavuruId, 'Kavuru', 'Guntur', '522261', 16.0280, 80.7150),
    (@RepalleeId, 'Repallee', 'Guntur', '522265', 16.0500, 80.7800),
    (@TenaaliId, 'Tenaali', 'Guntur', '522201', 16.2430, 80.6400),
    (@ChinikolluId, 'Chinikollu', 'Guntur', '522256', 16.0000, 80.7500);

-- Location Distances
INSERT INTO LocationDistances (FromLocationId, ToLocationId, DistanceKm) VALUES
    (@CherukupalliId, @KavuruId, 2.0),
    (@CherukupalliId, @RepalleeId, 5.0),
    (@CherukupalliId, @TenaaliId, 25.0),
    (@CherukupalliId, @ChinikolluId, 3.5),
    (@KavuruId, @CherukupalliId, 2.0),
    (@KavuruId, @RepalleeId, 6.5),
    (@RepalleeId, @CherukupalliId, 5.0),
    (@ChinikolluId, @CherukupalliId, 3.5);

-- =========================================
-- Admin User
-- =========================================

DECLARE @AdminUserId UNIQUEIDENTIFIER = NEWID();
DECLARE @AdminRoleId INT = (SELECT RoleId FROM Roles WHERE RoleName = 'ADMIN');

INSERT INTO Users (UserId, Email, PasswordHash, Name, Phone, LocationId) VALUES
    (@AdminUserId, 'admin@villageeats.com', '$2b$10$example_hashed_password', 'System Admin', '9876543210', @CherukupalliId);

INSERT INTO UserRoles (UserId, RoleId) VALUES
    (@AdminUserId, @AdminRoleId);

-- =========================================
-- Sample Restaurants
-- =========================================

DECLARE @SpiceGardenId UNIQUEIDENTIFIER = NEWID();
DECLARE @RoyalDhabaId UNIQUEIDENTIFIER = NEWID();
DECLARE @TasteOfVillageId UNIQUEIDENTIFIER = NEWID();
DECLARE @KavuruKitchenId UNIQUEIDENTIFIER = NEWID();
DECLARE @BiryaniHouseId UNIQUEIDENTIFIER = NEWID();

INSERT INTO Restaurants (RestaurantId, Name, Description, ImagePath, LocationId, CuisineTypes, Rating, PriceRange) VALUES
    (@SpiceGardenId, 'Spice Garden', 'Authentic South Indian cuisine with homestyle cooking', 'restaurants/spice-garden.jpg', @CherukupalliId, 'South Indian,Andhra', 4.3, '₹₹'),
    (@RoyalDhabaId, 'Royal Dhaba', 'North Indian & Punjabi specialties', 'restaurants/royal-dhaba.jpg', @CherukupalliId, 'North Indian,Punjabi', 4.5, '₹₹₹'),
    (@TasteOfVillageId, 'Taste of Village', 'Traditional village recipes passed down generations', 'restaurants/taste-of-village.jpg', @KavuruId, 'Andhra,Traditional', 4.2, '₹'),
    (@KavuruKitchenId, 'Kavuru Kitchen', 'Modern fusion with local flavors', 'restaurants/kavuru-kitchen.jpg', @KavuruId, 'Fusion,Multi-cuisine', 4.0, '₹₹'),
    (@BiryaniHouseId, 'Biryani House', 'Famous for Hyderabadi dum biryani', 'restaurants/biryani-house.jpg', @RepalleeId, 'Hyderabadi,Biryani', 4.6, '₹₹₹');

-- =========================================
-- Food Categories (already seeded in schema)
-- =========================================

DECLARE @StartersId UNIQUEIDENTIFIER = (SELECT CategoryId FROM FoodCategories WHERE Name = 'Starters');
DECLARE @MainCourseId UNIQUEIDENTIFIER = (SELECT CategoryId FROM FoodCategories WHERE Name = 'Main Course');
DECLARE @BiryanisId UNIQUEIDENTIFIER = (SELECT CategoryId FROM FoodCategories WHERE Name = 'Biryanis');
DECLARE @BreadsId UNIQUEIDENTIFIER = (SELECT CategoryId FROM FoodCategories WHERE Name = 'Breads');
DECLARE @BeveragesId UNIQUEIDENTIFIER = (SELECT CategoryId FROM FoodCategories WHERE Name = 'Beverages');

-- =========================================
-- Food Items - Spice Garden
-- =========================================

INSERT INTO FoodItems (RestaurantId, CategoryId, Name, Description, Price, ImagePath, IsVeg, IsBestseller) VALUES
    (@SpiceGardenId, @StartersId, 'Masala Dosa', 'Crispy dosa with spiced potato filling, served with sambar and chutneys', 80, 'food/masala-dosa.jpg', 1, 1),
    (@SpiceGardenId, @MainCourseId, 'Andhra Thali', 'Complete meal with rice, dal, curries, pickle, and papad', 150, 'food/andhra-thali.jpg', 1, 1),
    (@SpiceGardenId, @MainCourseId, 'Gongura Chicken', 'Andhra special chicken cooked with tangy gongura leaves', 220, 'food/gongura-chicken.jpg', 0, 1);

-- =========================================
-- Food Items - Royal Dhaba
-- =========================================

INSERT INTO FoodItems (RestaurantId, CategoryId, Name, Description, Price, ImagePath, IsVeg, IsSpicy, IsBestseller) VALUES
    (@RoyalDhabaId, @MainCourseId, 'Butter Chicken', 'Tender chicken in creamy tomato-butter gravy', 280, 'food/butter-chicken.jpg', 0, 0, 1),
    (@RoyalDhabaId, @MainCourseId, 'Paneer Butter Masala', 'Cottage cheese cubes in rich buttery tomato sauce', 220, 'food/paneer-butter-masala.jpg', 1, 0, 1),
    (@RoyalDhabaId, @MainCourseId, 'Dal Makhani', 'Slow-cooked black lentils in creamy butter sauce', 180, 'food/dal-makhani.jpg', 1, 0, 1),
    (@RoyalDhabaId, @BreadsId, 'Naan Basket', 'Assorted naan - butter, garlic, and plain', 90, 'food/naan-basket.jpg', 1, 0, 0),
    (@RoyalDhabaId, @StartersId, 'Tandoori Chicken', 'Marinated chicken roasted in clay oven', 260, 'food/tandoori-chicken.jpg', 0, 1, 1),
    (@RoyalDhabaId, @StartersId, 'Seekh Kebab', 'Minced meat kebabs with aromatic spices', 240, 'food/seekh-kebab.jpg', 0, 1, 0);

-- =========================================
-- Sample Agents
-- =========================================

DECLARE @Agent1UserId UNIQUEIDENTIFIER = NEWID();
DECLARE @Agent2UserId UNIQUEIDENTIFIER = NEWID();
DECLARE @AgentRoleId INT = (SELECT RoleId FROM Roles WHERE RoleName = 'AGENT');

INSERT INTO Users (UserId, Email, PasswordHash, Name, Phone, LocationId) VALUES
    (@Agent1UserId, 'raju@villageeats.com', '$2b$10$example_hashed_password', 'Raju Kumar', '9876543211', @CherukupalliId),
    (@Agent2UserId, 'venkat@villageeats.com', '$2b$10$example_hashed_password', 'Venkat Reddy', '9876543212', @KavuruId);

INSERT INTO UserRoles (UserId, RoleId) VALUES
    (@Agent1UserId, @AgentRoleId),
    (@Agent2UserId, @AgentRoleId);

INSERT INTO Agents (UserId, AssignedLocationId, VehicleType) VALUES
    (@Agent1UserId, @CherukupalliId, 'BIKE'),
    (@Agent2UserId, @KavuruId, 'SCOOTER');

-- =========================================
-- Sample Customer
-- =========================================

DECLARE @CustomerUserId UNIQUEIDENTIFIER = NEWID();
DECLARE @CustomerRoleId INT = (SELECT RoleId FROM Roles WHERE RoleName = 'CUSTOMER');

INSERT INTO Users (UserId, Email, PasswordHash, Name, Phone, LocationId, Address) VALUES
    (@CustomerUserId, 'customer@example.com', '$2b$10$example_hashed_password', 'Test Customer', '9876543213', @CherukupalliId, 'Main Road, Near Temple, Cherukupalli');

INSERT INTO UserRoles (UserId, RoleId) VALUES
    (@CustomerUserId, @CustomerRoleId);

PRINT 'Seed data inserted successfully!';
