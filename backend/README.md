# Village Eats - Backend API

Express.js REST API for the Village Eats food delivery platform.

## Prerequisites

- Node.js 18+
- Microsoft SQL Server 2019+
- Database created using scripts in `/database` folder

## Quick Start

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Start development server
npm run dev
```

Server runs at: `http://localhost:3001`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new customer |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Locations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/locations` | List all locations |
| GET | `/api/locations/:id` | Get location |
| GET | `/api/locations/:from/distance/:to` | Get distance |
| POST | `/api/locations` | Create (Admin) |
| PUT | `/api/locations/:id` | Update (Admin) |

### Restaurants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants` | List restaurants |
| GET | `/api/restaurants/:id` | Get with menu |
| GET | `/api/restaurants/:id/menu` | Get menu items |
| POST | `/api/restaurants` | Create (Admin) |
| PUT | `/api/restaurants/:id` | Update (Admin) |
| POST | `/api/restaurants/:id/menu` | Add item (Admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place order |
| GET | `/api/orders` | Get my orders |
| GET | `/api/orders/:id` | Get order details |
| PUT | `/api/orders/:id/cancel` | Cancel order |
| GET | `/api/orders/admin/all` | All orders (Admin) |

### Agents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents/available-orders` | Available pickups |
| POST | `/api/agents/accept-order/:id` | Accept order |
| PUT | `/api/agents/orders/:id/status` | Update status |
| GET | `/api/agents/my-orders` | Current orders |
| GET | `/api/agents/earnings` | Earnings report |
| PUT | `/api/agents/availability` | Toggle online |
| GET | `/api/agents/profile` | Agent profile |
| GET | `/api/agents/admin/all` | All agents (Admin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/settings` | App settings |
| PUT | `/api/admin/settings` | Update settings |
| GET | `/api/admin/users` | List users |
| POST | `/api/admin/agents` | Create agent |
| GET | `/api/admin/reports/orders` | Order reports |
| GET | `/api/admin/reports/agents` | Agent reports |

## Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ]
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_SERVER` | SQL Server host | localhost |
| `DB_NAME` | Database name | VillageEats |
| `DB_USER` | Database user | sa |
| `DB_PASSWORD` | Database password | - |
| `DB_PORT` | Database port | 1433 |
| `JWT_SECRET` | JWT signing key | - |
| `JWT_EXPIRY` | Token expiry | 24h |
| `PORT` | Server port | 3001 |
| `FRONTEND_URL` | CORS origin | http://localhost:5173 |

## Order Status Flow

```
placed → accepted → preparing → on_the_way → delivered
           ↓
        cancelled
```

## Delivery Fee Calculation

- **Same village**: ₹20 flat (no per-km charge)
- **Different village**: ₹20 + (distance × ₹9/km)
- **Multi-item discount**: ₹10 off for 2+ items

## Agent Earnings

- **Same village single**: ₹20
- **Same village multi**: ₹25 (₹5 platform fee)
- **Inter-village**: ₹20 + ₹5/km bonus
