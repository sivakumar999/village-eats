# 🍔 Village Eats - Food Delivery Application

A village-focused food delivery platform with separate modules for Customers, Admins, and Delivery Agents.

## 🚀 Quick Start

### Frontend (React)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at `http://localhost:5173`

---

## 📱 Application Modules

| Module | URL | Description |
|--------|-----|-------------|
| **Customer** | `/` | Browse restaurants, place orders, track delivery |
| **Admin** | `/admin` | Manage locations, restaurants, agents, orders |
| **Agent** | `/agent` | Accept orders, view earnings, manage deliveries |

---

## 🗄️ Database Setup (MSSQL)

### Prerequisites
- Microsoft SQL Server 2019+
- SQL Server Management Studio (SSMS)

### Installation Steps

1. **Create Database**
```sql
CREATE DATABASE VillageEats;
GO
USE VillageEats;
```

2. **Run Schema Script**
```bash
# Execute in SSMS or via sqlcmd
sqlcmd -S localhost -d VillageEats -i database/001_create_schema.sql
```

3. **Load Seed Data**
```bash
sqlcmd -S localhost -d VillageEats -i database/002_seed_data.sql
```

4. **Create Stored Procedures**
```bash
sqlcmd -S localhost -d VillageEats -i database/003_stored_procedures.sql
```

### Database Scripts Location
```
database/
├── 001_create_schema.sql    # Tables, indexes, constraints
├── 002_seed_data.sql        # Sample locations, restaurants, menu items
├── 003_stored_procedures.sql # Order placement, agent assignment
└── README.md                # Detailed database documentation
```

---

## 🔧 Backend Setup (Node.js/Express)

### Create Backend Project

```bash
mkdir village-eats-api
cd village-eats-api
npm init -y
npm install express mssql jsonwebtoken bcrypt cors dotenv
```

### Environment Configuration

Create `.env` file:
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_SERVER=localhost
DB_NAME=VillageEats
DB_USER=sa
DB_PASSWORD=YourPassword123

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Business Rules (configurable)
DELIVERY_BASE_FEE=20
DELIVERY_PER_KM_RATE=9
AGENT_BASE_EARNING=20
MULTI_ITEM_DISCOUNT=10
```

### Basic Server Structure

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database config
const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// Connect to database
sql.connect(dbConfig).then(() => {
  console.log('Connected to MSSQL');
}).catch(err => {
  console.error('Database connection failed:', err);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 💰 Business Logic

### Delivery Fee Calculation

| Scenario | Formula |
|----------|---------|
| Same Village | ₹20 flat (no per-km charge) |
| Different Village | ₹20 + (Distance × ₹9/km) |
| Multi-item (2+) | ₹10 discount on delivery |

### Agent Earnings

| Delivery Type | Agent Earns | Platform Fee |
|---------------|-------------|--------------|
| Single item, same village | ₹20 | ₹0 |
| Multi-item (discounted) | ₹25 | ₹5 |
| Different village | Full delivery fee | ₹0 |

---

## 🎨 Asset Structure

```
src/assets/
├── food/                    # Food item images
│   ├── butter-chicken.jpg
│   ├── masala-dosa.jpg
│   └── ...
└── restaurants/             # Restaurant images
    ├── spice-garden.jpg
    ├── royal-dhaba.jpg
    └── ...
```

---

## 🔐 Authentication

- JWT-based with 24-hour expiry
- Roles: `CUSTOMER`, `ADMIN`, `AGENT`
- Password hashing with bcrypt

### Auth Header
```
Authorization: Bearer <token>
```

---

## 📋 API Endpoints Reference

### Authentication
```
POST /api/auth/register    - Customer registration
POST /api/auth/login       - Login (all roles)
GET  /api/auth/profile     - Get current user
```

### Locations
```
GET  /api/locations        - List all locations
POST /api/locations        - Create location (Admin)
```

### Restaurants
```
GET  /api/restaurants                  - List restaurants
GET  /api/restaurants/:id              - Restaurant details
GET  /api/restaurants/:id/menu         - Menu items
POST /api/restaurants                  - Create (Admin)
```

### Orders
```
POST /api/orders           - Place order
GET  /api/orders/:id       - Order details
GET  /api/orders/track/:id - Live tracking
PUT  /api/orders/:id/status - Update status
```

### Agent
```
GET  /api/agent/orders     - Available orders
POST /api/agent/accept/:id - Accept order
GET  /api/agent/earnings   - Earnings summary
```

---

## 🧪 Testing

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage
```

---

## 📦 Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- React Router DOM
- TanStack Query

### Backend (to implement)
- Node.js + Express
- MSSQL with mssql package
- JWT Authentication
- bcrypt for password hashing

---

## 🚧 Development Roadmap

- [x] Customer UI - Browse, Cart, Checkout
- [x] Admin Dashboard - Locations, Restaurants, Menu, Agents, Orders
- [x] Agent Portal - Orders, Earnings
- [x] Order Tracking UI - Real-time status updates
- [x] Database Schema - MSSQL scripts
- [ ] Backend API - Express.js implementation
- [ ] Real Authentication - JWT flow
- [ ] Live Tracking - WebSocket integration
- [ ] Payment Gateway - Stripe/Razorpay

---

## 📄 License

MIT License - Built for learning and demonstration purposes.
