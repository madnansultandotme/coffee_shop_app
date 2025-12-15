# Software Requirements Specification (SRS)
## Coffee Shop Pro - MERN Stack Application

### Document Version: 1.0
### Date: December 16, 2025

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for Coffee Shop Pro, a full-stack web application for managing coffee shop operations including menu management, order processing, customer loyalty programs, and staff management.

### 1.2 Scope
Coffee Shop Pro is a MERN stack application (MongoDB, Express.js, React, Node.js) that provides:
- Customer-facing menu browsing and ordering
- Shopping cart management
- Order tracking and history
- Loyalty rewards program
- Role-based access control (Customer, Barista, Manager, Admin)
- Staff management tools

### 1.3 Technology Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Authentication | JWT, bcryptjs |
| Security | Helmet, CORS, Rate Limiting |

---

## 2. System Overview

### 2.1 System Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React SPA     │────▶│  Express API    │────▶│    MongoDB      │
│   (Frontend)    │◀────│   (Backend)     │◀────│   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 2.2 User Roles
| Role | Description |
|------|-------------|
| Customer | Browse menu, place orders, manage cart, view loyalty points |
| Barista | All customer features + view/update order status |
| Manager | All barista features + manage menu availability, view reports |
| Admin | Full system access including user role management |

---

## 3. Functional Requirements

### 3.1 Authentication Module (FR-AUTH)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-01 | Users can sign up with email and password | High |
| FR-AUTH-02 | Users can sign in with existing credentials | High |
| FR-AUTH-03 | Anonymous guest login support | Medium |
| FR-AUTH-04 | JWT-based session management (7-day expiry) | High |
| FR-AUTH-05 | CSRF token protection | High |

### 3.2 Menu Module (FR-MENU)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-MENU-01 | Display menu items organized by categories | High |
| FR-MENU-02 | Search menu items by name, description, or ingredients | Medium |
| FR-MENU-03 | Filter items by dietary preferences (vegetarian, vegan) | Low |
| FR-MENU-04 | Display item details (price, calories, prep time, variants) | High |
| FR-MENU-05 | Admin/Manager can toggle item availability | High |

### 3.3 Cart Module (FR-CART)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CART-01 | Add items to cart with quantity and size selection | High |
| FR-CART-02 | Update item quantity in cart | High |
| FR-CART-03 | Remove items from cart | High |
| FR-CART-04 | Clear entire cart | Medium |
| FR-CART-05 | Add special instructions per item | Medium |
| FR-CART-06 | Persist cart across sessions | High |

### 3.4 Order Module (FR-ORDER)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ORDER-01 | Create order from cart items | High |
| FR-ORDER-02 | Support order types (dine-in, takeaway, delivery) | High |
| FR-ORDER-03 | Apply promo codes with validation | Medium |
| FR-ORDER-04 | Redeem loyalty points for discounts | Medium |
| FR-ORDER-05 | Calculate subtotal, tax (8%), and discounts | High |
| FR-ORDER-06 | Generate unique order numbers | High |
| FR-ORDER-07 | View order history | High |
| FR-ORDER-08 | Reorder from previous orders | Medium |
| FR-ORDER-09 | Track order status (pending, preparing, ready, completed) | High |
| FR-ORDER-10 | Estimated ready time display | Medium |

### 3.5 Loyalty Module (FR-LOYALTY)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-LOYALTY-01 | Earn points based on order total (1 point per $1) | High |
| FR-LOYALTY-02 | Redeem points for discounts ($0.01 per point) | High |
| FR-LOYALTY-03 | View total points balance | High |
| FR-LOYALTY-04 | View transaction history | Medium |

### 3.6 Admin Module (FR-ADMIN)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ADMIN-01 | View all staff members | High |
| FR-ADMIN-02 | Assign/modify user roles | High |
| FR-ADMIN-03 | Activate/deactivate user accounts | High |
| FR-ADMIN-04 | Cannot assign admin role to others | High |
| FR-ADMIN-05 | Cannot demote existing admin | High |

### 3.7 Barista Panel (FR-BARISTA)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-BARISTA-01 | View incoming orders | High |
| FR-BARISTA-02 | Update order status | High |
| FR-BARISTA-03 | Filter orders by status | Medium |

### 3.8 Manager Panel (FR-MANAGER)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-MANAGER-01 | Access all barista features | High |
| FR-MANAGER-02 | Manage menu item availability | High |
| FR-MANAGER-03 | View all orders | High |

---

## 4. Non-Functional Requirements

### 4.1 Security (NFR-SEC)

| ID | Requirement |
|----|-------------|
| NFR-SEC-01 | Password hashing using bcrypt (10 rounds) |
| NFR-SEC-02 | JWT authentication with secure secret |
| NFR-SEC-03 | CSRF token validation on state-changing requests |
| NFR-SEC-04 | HTTP security headers via Helmet |
| NFR-SEC-05 | Rate limiting: 100 req/15min (auth), 300 req/min (write) |
| NFR-SEC-06 | Input sanitization middleware |
| NFR-SEC-07 | CORS configuration with allowed origins |

### 4.2 Performance (NFR-PERF)

| ID | Requirement |
|----|-------------|
| NFR-PERF-01 | Response compression enabled |
| NFR-PERF-02 | Database indexes on frequently queried fields |
| NFR-PERF-03 | Frontend code splitting via Vite |

### 4.3 Usability (NFR-USE)

| ID | Requirement |
|----|-------------|
| NFR-USE-01 | Responsive design for mobile and desktop |
| NFR-USE-02 | Dark/Light mode toggle |
| NFR-USE-03 | Toast notifications for user feedback |
| NFR-USE-04 | Loading states and animations |

---

## 5. Data Models

### 5.1 User
```javascript
{
  email: String (unique),
  name: String,
  passwordHash: String,
  isAnonymous: Boolean,
  timestamps: true
}
```

### 5.2 UserProfile
```javascript
{
  userId: ObjectId (ref: User),
  role: String (customer|barista|manager|admin),
  isActive: Boolean,
  permissions: [String]
}
```

### 5.3 MenuItem
```javascript
{
  name: String,
  description: String,
  categoryId: ObjectId (ref: Category),
  basePrice: Number,
  imageUrl: String,
  ingredients: [String],
  isAvailable: Boolean,
  isVegetarian: Boolean,
  isVegan: Boolean,
  calories: Number,
  preparationTime: Number,
  variants: [{ size: String, priceModifier: Number }]
}
```

### 5.4 Order
```javascript
{
  customerId: ObjectId (ref: User),
  orderNumber: String,
  items: [OrderItem],
  subtotal: Number,
  tax: Number,
  discount: Number,
  totalAmount: Number,
  orderType: String,
  status: String,
  paymentStatus: String,
  paymentMethod: String,
  customerNotes: String,
  estimatedReadyTime: Number,
  deliveryAddress: Object,
  promoCode: String,
  loyaltyPointsUsed: Number,
  loyaltyPointsEarned: Number
}
```

---

## 6. API Endpoints

### 6.1 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signin | Sign in or sign up |
| POST | /api/auth/anonymous | Anonymous login |

### 6.2 Menu
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/menu/categories | List active categories |
| GET | /api/menu/items | List available items |
| GET | /api/menu/search | Search menu items |
| PATCH | /api/menu/items/:id/availability | Toggle availability |

### 6.3 Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cart | Get user's cart |
| POST | /api/cart | Add item to cart |
| PATCH | /api/cart/:id | Update cart item |
| DELETE | /api/cart/:id | Remove cart item |
| DELETE | /api/cart | Clear cart |

### 6.4 Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/orders | Get user's orders |
| POST | /api/orders | Create order |
| POST | /api/orders/reorder | Reorder previous order |
| GET | /api/orders/all | Get all orders (staff) |
| PATCH | /api/orders/:id/status | Update order status |

### 6.5 Loyalty
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/loyalty/summary | Get points summary |
| GET | /api/loyalty/transactions | Get transaction history |

### 6.6 Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/staff | List staff members |
| PATCH | /api/admin/users/:id/role | Update user role |

---

## 7. Constraints and Assumptions

### 7.1 Constraints
- Single coffee shop location (no multi-tenant support)
- Tax rate fixed at 8%
- Loyalty points conversion: 1 point = $0.01

### 7.2 Assumptions
- Users have modern browsers with JavaScript enabled
- MongoDB instance is available and configured
- Environment variables are properly set

---

## 8. Future Enhancements
- Payment gateway integration
- Real-time order notifications (WebSocket)
- Inventory management
- Multi-location support
- Mobile app (React Native)
- Analytics dashboard
- Customer reviews and ratings
