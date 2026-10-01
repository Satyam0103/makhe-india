const http = require('http');
require('dotenv').config();

const email = process.env.ADMIN_EMAIL || 'wecare@makheindia.com';
const password = process.env.ADMIN_PASSWORD;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
    };
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runSuite() {
  console.log('--- ADMIN TEST SUITE STARTING ---');

  // Test 1: Reject unauthenticated orders request
  const unauthRes = await request('GET', '/api/admin/orders');
  console.log('Test 1 [Unauthenticated /api/admin/orders]: status', unauthRes.status, 'message:', unauthRes.data?.message);
  if (unauthRes.status !== 401) throw new Error('Unauthenticated request was not rejected with 401');

  // Test 2: Login with wrong password
  const wrongLoginRes = await request('POST', '/api/admin/login', { email, password: 'wrongpassword' });
  console.log('Test 2 [Wrong password login]: status', wrongLoginRes.status, 'message:', wrongLoginRes.data?.message);
  if (wrongLoginRes.status !== 401) throw new Error('Wrong password was not rejected');

  // Test 3: Login with correct configured credentials
  const correctLoginRes = await request('POST', '/api/admin/login', { email, password });
  console.log('Test 3 [Correct login]: status', correctLoginRes.status, 'success:', correctLoginRes.data?.success, 'admin:', correctLoginRes.data?.admin?.email);
  if (correctLoginRes.status !== 200 || !correctLoginRes.data?.token) throw new Error('Correct login failed');
  const token = correctLoginRes.data.token;

  // Test 4: Create a realistic UPI test order to test verification workflow
  const createUpiOrderRes = await request('POST', '/api/orders', {
    customer: { fullName: 'Rajesh Sharma', phone: '9820012345', email: 'rajesh@example.com' },
    shippingAddress: { addressLine1: '42 MG Road', city: 'Patna', state: 'Bihar', pincode: '800001', country: 'India' },
    items: [{ productId: 'makhe-100g', quantity: 2 }],
    paymentMethod: 'upi',
    upiTransactionId: 'UTR492819283102'
  });
  console.log('Test 4 [Create UPI Order]: status', createUpiOrderRes.status, 'Order:', createUpiOrderRes.data?.order?.orderNumber, 'PaymentStatus:', createUpiOrderRes.data?.order?.paymentStatus);
  const upiOrder = createUpiOrderRes.data?.order;
  if (!upiOrder || upiOrder.paymentStatus !== 'verification_pending') throw new Error('UPI order did not initialize with verification_pending');

  // Test 5: Fetch all orders with admin token
  const ordersListRes = await request('GET', '/api/admin/orders', null, token);
  console.log('Test 5 [Admin GET orders list]: status', ordersListRes.status, 'count:', ordersListRes.data?.count, 'first:', ordersListRes.data?.orders?.[0]?.orderNumber);
  if (ordersListRes.status !== 200 || !Array.isArray(ordersListRes.data?.orders)) throw new Error('Failed to fetch orders list');

  // Test 6: Fetch order details by orderNumber
  const singleOrderRes = await request('GET', `/api/admin/orders/${upiOrder.orderNumber}`, null, token);
  console.log('Test 6 [Admin GET single order details]: status', singleOrderRes.status, 'customer:', singleOrderRes.data?.order?.customer?.fullName, 'UTR:', singleOrderRes.data?.order?.upiTransactionId);
  if (singleOrderRes.status !== 200 || singleOrderRes.data?.order?.upiTransactionId !== 'UTR492819283102') throw new Error('Order details missing UTR');

  // Test 7: Mark UPI order as PAID (Manual Payment Verification)
  const markPaidRes = await request('PATCH', `/api/admin/orders/${upiOrder.orderNumber}/payment-status`, { paymentStatus: 'paid' }, token);
  console.log('Test 7 [Admin PATCH payment-status to paid]: status', markPaidRes.status, 'new paymentStatus:', markPaidRes.data?.order?.paymentStatus);
  if (markPaidRes.status !== 200 || markPaidRes.data?.order?.paymentStatus !== 'paid') throw new Error('Failed to update payment status to paid');

  // Test 8: Update Order Status: confirmed -> shipped
  const updateStatusRes = await request('PATCH', `/api/admin/orders/${upiOrder.orderNumber}/status`, { orderStatus: 'shipped' }, token);
  console.log('Test 8 [Admin PATCH status to shipped]: status', updateStatusRes.status, 'new orderStatus:', updateStatusRes.data?.order?.orderStatus);
  if (updateStatusRes.status !== 200 || updateStatusRes.data?.order?.orderStatus !== 'shipped') throw new Error('Failed to update order status');

  // Test 9: Verify persistence from a fresh GET request
  const verifyRes = await request('GET', `/api/admin/orders/${upiOrder.orderNumber}`, null, token);
  console.log('Test 9 [Verify MongoDB Persistence]:', {
    orderNumber: verifyRes.data?.order?.orderNumber,
    paymentStatus: verifyRes.data?.order?.paymentStatus,
    orderStatus: verifyRes.data?.order?.orderStatus
  });
  if (verifyRes.data?.order?.paymentStatus !== 'paid' || verifyRes.data?.order?.orderStatus !== 'shipped') {
    throw new Error('Persistence verification failed');
  }

  console.log('--- ALL ADMIN SUITE TESTS PASSED SUCCESSFULLY ---');
}

runSuite().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
