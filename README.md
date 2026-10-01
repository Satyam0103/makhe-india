# Makhé India — Full-Stack Production Application

Makhé India is a contemporary Indian direct-to-consumer superfood brand celebrating Bihar's authentic makhana heritage. This repository contains the complete frontend web experience and decoupled Node.js/Express production backend foundation.

---

## Architecture Overview

```text
/
├── server.ts                   # Unified Full-Stack entry point (mounts /api and Vite)
├── package.json                # Root package configuration
├── src/                        # React 19 + TypeScript frontend application
│   ├── components/             # Reusable UI components (Header, Footer, CartDrawer)
│   ├── context/                # CartContext (persists { productId, quantity } only)
│   ├── data/                   # Canonical frontend product catalog
│   ├── pages/                  # Route views (Home, OurStory, Wholesale, Contact, Cart, Checkout, ProductDetail, OrderConfirmation)
│   └── services/               # Frontend API client (src/services/api.ts)
└── server/                     # Standalone Production Backend
    ├── package.json            # Backend dependencies
    ├── tsconfig.json           # Backend TypeScript configuration
    ├── .env.example            # Environment variables template
    └── src/
        ├── config/             # MongoDB connection & product seeding
        ├── controllers/        # Express route controllers
        ├── middleware/         # Security (Helmet, CORS, rate limiting, validation, error handler)
        ├── models/             # Mongoose schemas (Product, Order, WholesaleEnquiry, ContactEnquiry)
        ├── routes/             # REST route definitions (/api/*)
        ├── services/           # Business logic (orderService, paymentService, shippingService, productService)
        ├── utils/              # Order number generator, logger, API response helpers
        ├── app.ts              # Express application factory
        └── server.ts           # Standalone backend server entry point
```

---

## Getting Started

### 1. Unified Full-Stack Mode (Recommended for AI Studio Preview & Local Dev)

In this mode, `server.ts` boots Express on port 3000, mounts all `/api/*` endpoints, and attaches Vite's development middleware.

```bash
# Install root dependencies
npm install

# Run full-stack dev server
npm run dev
```

The application is accessible at `http://localhost:3000`.

---

### 2. Standalone Frontend Development

```bash
# Run Vite directly (frontend only)
npx vite --port=3000 --host=0.0.0.0
```

---

### 3. Standalone Backend Development

```bash
cd server

# Install backend dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Configure environment variables in .env (see below)
# Run backend development server with watch mode
npm run dev
```

The standalone backend runs on `http://localhost:5000`.

---

## Environment Variables Configuration

Create `server/.env` based on `server/.env.example`:

```ini
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/makhe_india?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:3000
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
EMAIL_FROM=orders@makheindia.com
EMAIL_TO=operations@makheindia.com
```

### Critical Security Rules:
1. **Never Commit Secrets**: Never commit `.env` or real API keys to version control. The `.gitignore` file enforces this rule.
2. **Server-Side Authority for Pricing**: Product pricing is strictly authoritative on the server. Frontend only transmits `{ productId, quantity }`; the server calculates subtotal and order totals from verified database records.
3. **Razorpay Key Secret**: Razorpay Key Secret must live exclusively on the backend server. Payment verification uses HMAC SHA-256 signatures evaluated server-side.

---

## Available API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint |
| `POST` | `/api/orders` | Create a verified pending order with server-calculated pricing |
| `GET` | `/api/orders/:orderNumber` | Retrieve sanitized order details for confirmation |
| `POST` | `/api/payments/create` | Initiate Razorpay payment intent using server-side key secret |
| `POST` | `/api/payments/verify` | Verify cryptographic HMAC SHA-256 payment signature |
| `POST` | `/api/wholesale-enquiry` | Submit B2B wholesale inquiry to MongoDB |
| `POST` | `/api/contact` | Submit customer support message to MongoDB |

---

## Testing Server Pricing Calculation

When creating an order:
- `makhe-100g` × 1 = ₹179
- `makhe-250g` × 1 = ₹399
- `makhe-100g` × 2 + `makhe-250g` × 1 = `(179 * 2) + 399` = ₹757

Any frontend-supplied price attributes are ignored and rejected.
