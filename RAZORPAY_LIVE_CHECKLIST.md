# Makhé India — Razorpay Live Mode Activation Checklist

This document provides step-by-step instructions for switching from **Razorpay Test Mode** to **Razorpay Live Mode** for Makhé India.

> **Zero Code Change Architecture**: The Makhé India codebase automatically detects and operates in Live Mode as soon as production credentials (`rzp_live_*`) are configured. No source-code rewrite or rebuilding is required to switch modes.

---

## 14-Step Production Go-Live Checklist

- [ ] **1. Account Activation & KYC**
  Complete business KYC verification and bank account linking in the client's official [Razorpay Dashboard](https://dashboard.razorpay.com). Ensure account status is marked **Activated**.

- [ ] **2. Generate Live API Keys**
  In the Razorpay Dashboard, toggle the top-bar switch from **Test Mode** to **Live Mode**. Navigate to:
  `Settings` → `API Keys` → `Generate Key`.
  Copy down:
  - `Key ID` (starts with `rzp_live_...`)
  - `Key Secret` (a 24-character secret key)

- [ ] **3. Configure Server Environment Variables**
  Inject the Live credentials strictly into the **production server environment** (e.g. Cloud Run, Docker environment, or `.env` on your secure host):
  ```bash
  RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
  RAZORPAY_KEY_SECRET=yyyyyyyyyyyyyyyyyyyyyyyy
  ```

- [ ] **4. Maintain Frontend Boundary**
  **CRITICAL SECURITY**: Never expose `RAZORPAY_KEY_SECRET` in frontend code, `.env.local`, or client bundles. The frontend client retrieves only the safe, public Key ID dynamically from the server's payment initialization API response.

- [ ] **5. Configure Production Application URLs**
  Set your canonical live domain in the server environment:
  ```bash
  FRONTEND_URL=https://makheindia.com
  ```

- [ ] **6. Configure Razorpay Webhook URL**
  In Razorpay Dashboard (`Settings` → `Webhooks` → `Add New Webhook`):
  - **Webhook URL**: `https://<YOUR_DOMAIN>/api/webhooks/razorpay`
  - **Active Events**:
    - `order.paid`
    - `payment.captured`
    - `payment.failed`

- [ ] **7. Set Webhook Secret**
  Create a strong, unique secret string in the Webhook configuration dialog. Set this exact value in the server environment:
  ```bash
  RAZORPAY_WEBHOOK_SECRET=your_secure_random_webhook_secret_here
  ```

- [ ] **8. Verify Webhook Signature Handling**
  Ensure the server successfully receives and verifies the `x-razorpay-signature` header using `HMAC-SHA256` on raw body bytes (already implemented in `server/src/controllers/webhook.controller.ts`).

- [ ] **9. Run a Controlled Live Transaction**
  Place a real test purchase (e.g., 100g Apna Makhana pack for ₹179) using a real UPI, card, or net-banking account.

- [ ] **10. Confirm in Razorpay Dashboard**
  Confirm that the transaction appears under `Transactions` → `Payments` with status **Captured** and the corresponding order amount.

- [ ] **11. Confirm Order Marked Paid on Server**
  Confirm the Makhé internal order status transitions from `pending` to `paid` and `confirmed`.

- [ ] **12. Validate Order Confirmation UI**
  Verify the customer is automatically redirected to `/order-confirmation/:orderNumber?token=...` with:
  - `Payment: PAID` badge
  - Correct product breakdown, pack sizes, and total
  - Verified delivery address

- [ ] **13. Verify Cart Cleared Only Post-Verification**
  Confirm the user's shopping bag is emptied only *after* cryptographic server-side payment verification succeeds (never prematurely).

- [ ] **14. Verify Cancel & Failure Resilience**
  Cancel or dismiss a test checkout modal. Verify that:
  - The internal order remains `pending` (not deleted).
  - The UI displays **PAYMENT NOT COMPLETED**.
  - Clicking **TRY PAYMENT AGAIN** reuses the existing order reference without creating duplicate orders.

---

## Environment Variables Reference

| Variable | Environment | Description | Example |
| :--- | :--- | :--- | :--- |
| `RAZORPAY_KEY_ID` | Server only | Public Key ID (Test or Live) | `rzp_test_...` or `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Server only | Private API Secret | `xxxxxxxxxxxxxxxxxxxxxxxx` |
| `RAZORPAY_WEBHOOK_SECRET` | Server only | Webhook HMAC verification secret | `whsec_xxxxxxxxxxxxxxxx` |
| `PORT` | Server | Application listening port | `3000` |
| `MONGODB_URI` | Server | MongoDB connection string | `mongodb+srv://...` |
| `VITE_API_URL` | Frontend | API base endpoint | `/api` |

---

## Technical Support & Verification
For testing support or questions regarding payment reconciliation, inspect the server logs for `[Razorpay]` and `[Payment]` activity tags.
