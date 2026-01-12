// Razorpay Configuration
export const RAZORPAY_CONFIG = {
    keyId: 'rzp_test_ks9zLlM1eAiV1S',
    keySecret: 'Wl63rHSkHOK2o4s7djULBKGx', // Note: Keep this secret, use only on backend
    currency: 'INR',
    companyName: 'Cattle Insurance',
    companyLogo: '', // Add your logo URL here
    theme: {
        color: '#2563eb'
    }
};

// Note: In production, the keySecret should NEVER be exposed on the frontend
// It should only be used on your backend server for order creation and verification
