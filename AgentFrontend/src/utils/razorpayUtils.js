import { RAZORPAY_CONFIG } from '../config/razorpay.config';

/**
 * Initialize Razorpay payment
 * @param {Object} options - Payment options
 * @param {number} options.amount - Amount in rupees (will be converted to paise)
 * @param {string} options.currency - Currency code (default: INR)
 * @param {string} options.name - Customer name
 * @param {string} options.email - Customer email
 * @param {string} options.contact - Customer contact number
 * @param {string} options.description - Payment description
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onFailure - Failure callback
 * @returns {void}
 */
export const initiateRazorpayPayment = (options) => {
    const {
        amount,
        currency = RAZORPAY_CONFIG.currency,
        name,
        email,
        contact,
        description,
        policyData,
        onSuccess,
        onFailure
    } = options;

    // Check if Razorpay is loaded
    if (typeof window.Razorpay === 'undefined') {
        console.error('Razorpay SDK not loaded');
        onFailure?.({ error: 'Payment gateway not available' });
        return;
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    const razorpayOptions = {
        key: RAZORPAY_CONFIG.keyId,
        amount: amountInPaise,
        currency: currency,
        name: RAZORPAY_CONFIG.companyName,
        description: description || 'Cattle Insurance Premium Payment',
        image: RAZORPAY_CONFIG.companyLogo,

        // Prefill customer details
        prefill: {
            name: name,
            email: email,
            contact: contact
        },

        // Additional notes
        notes: {
            policy_type: policyData?.petType || 'cattle',
            coverage_amount: policyData?.coverageAmount || '',
            tag_id: policyData?.tagId || policyData?.petName || '',
            agent_code: policyData?.agentCode || 'direct'
        },

        // Theme customization
        theme: {
            color: RAZORPAY_CONFIG.theme.color
        },

        // Payment success handler
        handler: function (response) {
            // response contains:
            // - razorpay_payment_id
            // - razorpay_order_id (if order was created)
            // - razorpay_signature (if order was created)

            console.log('Payment successful:', response);

            onSuccess?.({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                status: 'success'
            });
        },

        // Modal configuration
        modal: {
            ondismiss: function () {
                console.log('Payment cancelled by user');
                onFailure?.({
                    error: 'Payment cancelled by user',
                    status: 'cancelled'
                });
            },
            // Prevent escape key from closing
            escape: false,
            // Show close button
            confirm_close: true
        }
    };

    try {
        const razorpayInstance = new window.Razorpay(razorpayOptions);

        // Handle payment failure
        razorpayInstance.on('payment.failed', function (response) {
            console.error('Payment failed:', response.error);

            onFailure?.({
                error: response.error.description || 'Payment failed',
                code: response.error.code,
                reason: response.error.reason,
                status: 'failed'
            });
        });

        // Open Razorpay checkout
        razorpayInstance.open();

    } catch (error) {
        console.error('Error initializing Razorpay:', error);
        onFailure?.({
            error: 'Failed to initialize payment gateway',
            status: 'error'
        });
    }
};

/**
 * Verify payment signature (should be done on backend)
 * This is a placeholder - actual verification must happen on server
 */
export const verifyPaymentSignature = async (paymentId, orderId, signature) => {
    // WARNING: This should be done on your backend server
    // Never expose your key_secret on the frontend
    console.warn('Payment verification should be done on backend');

    // For now, we'll just return success
    // In production, make an API call to your backend to verify
    return {
        verified: true,
        message: 'Payment verification pending (implement backend verification)'
    };
};
