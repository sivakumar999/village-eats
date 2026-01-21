# Village Eats - Database Setup Guide

## Prerequisites

- Microsoft SQL Server 2019+ (Developer Edition is free)
- SQL Server Management Studio (SSMS) or Azure Data Studio
- Node.js 18+ and npm

## Database Setup

### Step 1: Create Database

Open SSMS and run:

```sql
CREATE DATABASE VillageEats;
GO
USE VillageEats;
GO
```

### Step 2: Run Schema Script

Execute `001_create_schema.sql` to create all tables.

### Step 3: Seed Sample Data

Execute `002_seed_data.sql` to add sample locations, restaurants, and food items.

### Step 4: Create Stored Procedures

Execute `003_stored_procedures.sql` for business logic functions.

## Table Overview

| Table | Purpose |
|-------|---------|
| `Roles` | User role types (CUSTOMER, ADMIN, AGENT) |
| `Users` | All users (customers, admins, agents) |
| `UserRoles` | User-to-role mapping |
| `Locations` | Villages/areas for delivery |
| `LocationDistances` | Distance between locations (km) |
| `Restaurants` | Restaurant information |
| `FoodCategories` | Menu categories |
| `FoodItems` | Menu items/dishes |
| `Orders` | Customer orders |
| `OrderItems` | Items in each order |
| `Agents` | Delivery agent details |
| `AgentEarnings` | Agent earnings per delivery |
| `Payments` | Payment transactions |
| `AppSettings` | Configurable business rules |

## Delivery Fee Logic

### Same Village Delivery
- Base fee: ₹20 (configurable)
- **No per-km charges** for same village

### Inter-Village Delivery
- Base fee: ₹20
- Distance fee: Distance × ₹9/km

### Multi-Item Discount
- 2+ items from same restaurant: ₹10 discount

## Agent Earnings

| Scenario | Agent Earning |
|----------|---------------|
| Single item, same village | ₹20 |
| Multi-item, same village | ₹25 (₹5 platform fee) |
| Inter-village | ₹20 + ₹5/km bonus |

## Environment Variables

Create a `.env` file in your backend folder:

```env
# Database
DB_SERVER=localhost
DB_NAME=VillageEats
DB_USER=sa
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRY=24h

# Server
PORT=3001
NODE_ENV=development
```

## Folder Structure for Images

```
public/
├── images/
│   ├── restaurants/
│   │   ├── spice-garden.jpg
│   │   ├── royal-dhaba.jpg
│   │   └── ...
│   └── food/
│       ├── masala-dosa.jpg
│       ├── butter-chicken.jpg
│       └── ...
```

## Default Login Credentials

After seeding, these accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@villageeats.com | (set via bcrypt) |
| Agent | raju@villageeats.com | (set via bcrypt) |
| Customer | customer@example.com | (set via bcrypt) |

**Note:** Passwords are hashed. For development, update the `PasswordHash` column with a bcrypt hash of your test password.

Generate a hash:
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('your_password', 10);
console.log(hash);
```
