# Razorpay Payment Integration

## Overview
This project now uses **Razorpay** as the payment gateway for processing cattle insurance premium payments.

## Configuration

### Test Credentials (Currently Active)
```javascript
Key ID: rzp_test_ks9zLlM1eAiV1S
Key Secret: Wl63rHSkHOK2o4s7djULBKGx
```

**⚠️ IMPORTANT SECURITY NOTES:**
1. The `keySecret` is currently in the frontend code for testing purposes only
2. **NEVER** expose your `keySecret` in production frontend code
3. In production, the `keySecret` should only be on your backend server
4. The frontend should only use the `keyId`

## Files Modified/Created

### 1. **src/config/razorpay.config.js** (NEW)
Contains Razorpay configuration including:
- Key ID
- Currency settings
- Company branding
- Theme customization

### 2. **src/utils/razorpayUtils.js** (NEW)
Payment utility functions:
- `initiateRazorpayPayment()` - Opens Razorpay checkout modal
- `verifyPaymentSignature()` - Placeholder for backend verification

### 3. **src/pages/PaymentPage.jsx** (MODIFIED)
- Replaced simulated payment with real Razorpay integration
- Added customer data prefill
- Integrated success/failure callbacks
- Maintains commission calculation logic

### 4. **src/pages/PaymentSuccess.jsx** (MODIFIED)
- Added Razorpay payment ID display
- Shows transaction reference for customer records

### 5. **index.html** (MODIFIED)
- Added Razorpay checkout script
- Updated page title

## How It Works

### Payment Flow

1. **User fills policy details** → Navigates to Payment Page
2. **Payment Page loads** → Razorpay checkout script is ready
3. **User clicks "Pay"** → `initiateRazorpayPayment()` is called
4. **Razorpay modal opens** → User enters payment details
5. **Payment processed** → Razorpay returns response
6. **Success/Failure** → User redirected accordingly

### Success Callback
```javascript
onSuccess: (response) => {
    // response.paymentId - Razorpay payment ID
    // response.orderId - Order ID (if created)
    // response.signature - Payment signature (if order created)
    
    // Save policy with payment details
    // Calculate agent commissions
    // Navigate to success page
}
```

### Failure Callback
```javascript
onFailure: (error) => {
    // error.error - Error message
    // error.code - Error code
    // error.reason - Failure reason
    
    // Navigate to failure page with error details
}
```

## Testing

### Test Cards (Razorpay Test Mode)

**Successful Payment:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failed Payment:**
- Card Number: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### Test UPI IDs
- Success: `success@razorpay`
- Failure: `failure@razorpay`

### Test Net Banking
- Select any bank
- Use credentials provided on Razorpay test page

## Production Deployment

### Step 1: Get Live Credentials
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Complete KYC verification
3. Get your live API keys from Settings → API Keys

### Step 2: Update Configuration
Replace test credentials in `src/config/razorpay.config.js`:
```javascript
export const RAZORPAY_CONFIG = {
    keyId: 'rzp_live_YOUR_LIVE_KEY_ID', // Replace with live key
    // Remove keySecret from frontend!
    currency: 'INR',
    companyName: 'Cattle Insurance',
    companyLogo: 'https://your-domain.com/logo.png',
    theme: {
        color: '#2563eb'
    }
};
```

### Step 3: Backend Integration (REQUIRED for Production)

**Create Backend Endpoints:**

#### A. Create Order Endpoint
```javascript
// POST /api/create-razorpay-order
app.post('/api/create-razorpay-order', async (req, res) => {
    const Razorpay = require('razorpay');
    
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    const options = {
        amount: req.body.amount * 100, // amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: req.body.notes
    };
    
    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

#### B. Verify Payment Endpoint
```javascript
// POST /api/verify-payment
app.post('/api/verify-payment', (req, res) => {
    const crypto = require('crypto');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest('hex');
    
    if (razorpay_signature === expectedSign) {
        // Payment is verified
        // Save to database
        res.json({ verified: true });
    } else {
        res.status(400).json({ verified: false });
    }
});
```

### Step 4: Update Frontend to Use Backend

Modify `src/utils/razorpayUtils.js`:
```javascript
// Before opening Razorpay, create order on backend
const createOrder = async (amount, notes) => {
    const response = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, notes })
    });
    return await response.json();
};

// In initiateRazorpayPayment function:
const order = await createOrder(amount, options.policyData);

const razorpayOptions = {
    key: RAZORPAY_CONFIG.keyId,
    amount: order.amount,
    currency: order.currency,
    order_id: order.id, // Add order ID
    // ... rest of options
};
```

## Features Implemented

✅ Real-time payment processing with Razorpay
✅ Customer data prefill (name, email, phone)
✅ Multiple payment methods (Card, UPI, Net Banking)
✅ Success/failure handling
✅ Payment ID tracking
✅ Commission calculation for agents
✅ Policy activation on successful payment
✅ Secure payment modal
✅ Mobile responsive

## Environment Variables (For Production)

Create a `.env` file:
```env
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
VITE_RAZORPAY_COMPANY_NAME=Cattle Insurance
VITE_RAZORPAY_LOGO_URL=https://your-domain.com/logo.png
```

Update `razorpay.config.js`:
```javascript
export const RAZORPAY_CONFIG = {
    keyId: import.meta.env.VITE_RAZORPAY_KEY_ID,
    // ... rest
};
```

## Support & Documentation

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Razorpay Integration Guide](https://razorpay.com/docs/payments/payment-gateway/web-integration/)
- [Razorpay Dashboard](https://dashboard.razorpay.com)

## Troubleshooting

### Payment Modal Not Opening
- Check browser console for errors
- Ensure Razorpay script is loaded in `index.html`
- Verify `window.Razorpay` is available

### Payment Failing
- Check if using test mode credentials
- Verify test card details are correct
- Check Razorpay dashboard for payment logs

### Payment Success but Policy Not Created
- Check browser console for errors
- Verify localStorage is not full
- Check commission calculation logic

## Next Steps

1. ✅ Razorpay integration complete (Test Mode)
2. ⏳ Set up backend server for order creation
3. ⏳ Implement payment verification on backend
4. ⏳ Add webhook handling for payment status
5. ⏳ Get live Razorpay credentials
6. ⏳ Deploy to production

---

**Last Updated:** January 2026
**Integration Status:** ✅ Test Mode Active
