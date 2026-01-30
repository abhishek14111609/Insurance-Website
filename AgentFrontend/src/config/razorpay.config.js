// Razorpay configuration for the browser. Only the public key is kept here.
export const RAZORPAY_CONFIG = {
    keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_ks9zLlM1eAiV1S',
    currency: 'INR',
    companyName: 'Cattle Insurance',
    companyLogo: '', // Add your logo URL here
    theme: {
        color: '#2563eb'
    }
};

// Keep the secret key only on the backend (RAZORPAY_KEY_SECRET env) for order creation/verification.
