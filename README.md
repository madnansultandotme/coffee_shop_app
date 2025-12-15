# Coffee Shop Pro ☕

A full-featured coffee shop management application built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- **Menu Management** - Browse items by category, search, filter by dietary preferences
- **Shopping Cart** - Add items with size variants and special instructions
- **Order Processing** - Place orders with promo codes and loyalty points
- **Loyalty Program** - Earn and redeem points on purchases
- **Role-Based Access** - Customer, Barista, Manager, and Admin roles
- **Dark/Light Mode** - Theme toggle for user preference

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT, bcryptjs |
| Security | Helmet, CORS, Rate Limiting |

## Project Structure

```
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── lib/               # Utilities and API helpers
│   └── App.tsx            # Main application
├── server/                 # Express backend
│   ├── config/            # Database and environment config
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Auth, error handling, sanitization
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API route definitions
│   └── utils/             # Helper functions
└── docs/                   # Documentation
    └── SRS.md             # Software Requirements Specification
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd coffee-shop-pro
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables

Create `.env.local` in root:
```env
VITE_API_URL=http://localhost:3001
```

Create `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/coffeeshop
JWT_SECRET=your-secret-key
PORT=3001
CORS_ORIGIN=http://localhost:5173
DEFAULT_ADMIN_EMAIL=admin@coffeeshop.com
```

4. Start development servers
```bash
npm run dev
```

This runs both frontend (http://localhost:5173) and backend (http://localhost:3001) concurrently.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend and backend in development |
| `npm run dev:frontend` | Start only Vite dev server |
| `npm run dev:backend` | Start only Express server |
| `npm run build` | Build frontend for production |
| `npm run lint` | Run TypeScript and ESLint checks |
| `npm test` | Run tests |

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in or sign up
- `POST /api/auth/anonymous` - Guest login

### Menu
- `GET /api/menu/categories` - List categories
- `GET /api/menu/items` - List menu items
- `GET /api/menu/search?term=` - Search items

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `PATCH /api/cart/:id` - Update quantity
- `DELETE /api/cart/:id` - Remove item

### Orders
- `GET /api/orders` - User's orders
- `POST /api/orders` - Create order
- `POST /api/orders/reorder` - Reorder previous

### Loyalty
- `GET /api/loyalty/summary` - Points balance
- `GET /api/loyalty/transactions` - History

## User Roles

| Role | Capabilities |
|------|-------------|
| Customer | Browse menu, order, manage cart, view loyalty |
| Barista | + View and update order status |
| Manager | + Manage menu availability |
| Admin | + User role management |

## Test Accounts

The app seeds a default admin account using the email specified in `DEFAULT_ADMIN_EMAIL`. Sign up with that email to get admin access.

## Documentation

See [docs/SRS.md](docs/SRS.md) for the complete Software Requirements Specification.

## License

MIT
