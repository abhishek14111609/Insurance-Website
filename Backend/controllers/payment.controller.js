import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Payment, Policy, Commission, Agent } from '../models/index.js';
import { calculateAndDistributeCommissions } from '../utils/commission.util.js';
import { sendEmail } from '../utils/email.util.js';
import { notifyPaymentSuccess } from '../utils/notification.util.js';

// Initialize Razorpay only if keys are present
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
} else {
    console.warn('⚠️  Razorpay keys not configured. Payment features will be limited.');
}

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
export const createOrder = async (req, res) => {
    try {
        console.log('[CreateOrder] Starting payment order creation...');
        console.log('[CreateOrder] Request body:', req.body);
        console.log('[CreateOrder] User:', req.user?._id);

        if (!razorpay) {
            return res.status(503).json({
                success: false,
                message: 'Payment service not configured. Please contact administrator.'
            });
        }

        const { policyId } = req.body;
        console.log(`[CreateOrder] Request received for Policy: ${policyId}`);

        // Verify policy belongs to user
        const policy = await Policy.findOne({
            _id: policyId,
            customerId: req.user._id
        });

        if (!policy) {
            return res.status(404).json({
                success: false,
                message: 'Policy not found'
            });
        }

        // SECURITY: Use premium from policy record, not from client
        // Handle Decimal128 conversion
        const numericAmount = parseFloat(policy.premium.toString());

        if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid policy premium amount'
            });
        }

        // Create Razorpay order
        const receipt = `pol_${policy.policyNumber}_${Date.now().toString().slice(-6)}`.slice(0, 40);
        const options = {
            amount: Math.round(numericAmount * 100), // Convert to paise
            currency: 'INR',
            receipt,
            notes: {
                policyId: policyId,
                policyNumber: policy.policyNumber,
                customerId: req.user._id.toString(),
                customerEmail: req.user.email
            }
        };

        let order;
        try {
            order = await razorpay.orders.create(options);
        } catch (orderErr) {
            console.error('[CreateOrder] Razorpay order creation failed:', orderErr);
            const rpMsg = orderErr?.error?.description || orderErr?.message || 'Razorpay order creation failed';
            return res.status(500).json({
                success: false,
                message: `Error creating payment order: ${rpMsg}`
            });
        }

        // Create payment record
        const payment = await Payment.create({
            policyId,
            customerId: req.user._id,
            razorpayOrderId: order.id,
            amount: numericAmount,
            currency: 'INR',
            status: 'pending',
            description: `Premium payment for policy ${policy.policyNumber}`
        });

        res.json({
            success: true,
            message: 'Order created successfully',
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
                payment
            }
        });
    } catch (error) {
        console.error('Create order error details:', error);
        console.error('Create order error stack:', error?.stack);
        const message = error?.error?.description || error?.message || error?.description || 'Unknown error while creating payment order';
        res.status(500).json({
            success: false,
            message: `Error creating payment order: ${message}`,
            error: message
        });
    }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, policyId } = req.body;

        // Verify signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // Update payment record (authoritative fetch by order + customer)
        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id,
            customerId: req.user._id
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found'
            });
        }

        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.status = 'success';
        payment.paidAt = new Date();
        await payment.save();

        // Use policy tied to payment to avoid client tampering / missing id
        const policy = await Policy.findById(payment.policyId || policyId);
        if (policy) {
            policy.paymentStatus = 'PAID';
            policy.paymentId = razorpay_payment_id;
            policy.paymentDate = new Date();
            policy.status = 'PENDING_APPROVAL';
            await policy.save();
        }

        // Send Notification
        try {
            await notifyPaymentSuccess(payment, policy);
        } catch (notifyError) {
            console.error('[VerifyPayment] Notification failed (non-blocking):', notifyError);
        }

        let paymentEmailSent = false;
        let paymentEmailError = null;
        try {
            const customerEmail = policy?.ownerEmail || req.user?.email;
            const customerName = policy?.ownerName || req.user?.fullName || 'Customer';
            const amountPaid = payment?.amount ? parseFloat(payment.amount) : null;

            if (customerEmail) {
                const amountText = amountPaid ? `₹${amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'N/A';
                const policyLabel = policy?.policyNumber || policyId || payment.policyId?.toString();

                const html = `
                    <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto;">
                        <h2 style="color: #2563eb;">Payment Received</h2>
                        <p>Hi ${customerName},</p>
                        <p>We have received your payment for policy <strong>${policyLabel}</strong>.</p>
                        <p><strong>Amount:</strong> ${amountText}</p>
                        <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                        <p>Your policy is now under review for approval. You will receive the policy documents once approved.</p>
                        <p>Thank you for your payment.</p>
                    </div>
                `;

                await sendEmail({
                    to: customerEmail,
                    subject: `Payment Successful for Policy ${policyLabel || ''}`,
                    html,
                    text: `Payment received for policy ${policyLabel}. Amount: ${amountText}. Payment ID: ${razorpay_payment_id}.`
                });
                paymentEmailSent = true;
            }
        } catch (mailError) {
            paymentEmailError = mailError?.message || 'Unknown email error';
            console.error('[VerifyPayment] Payment success email failed (non-blocking):', mailError);
        }

        res.json({
            success: true,
            message: 'Payment verified successfully',
            data: {
                payment,
                policy,
                paymentEmailSent,
                paymentEmailError
            }
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying payment',
            error: error.message
        });
    }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ customerId: req.user._id })
            .populate('policy')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: payments.length,
            data: { payments }
        });
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment history',
            error: error.message
        });
    }
};

// @desc    Razorpay webhook handler
// @route   POST /api/payments/webhook
// @access  Public (Razorpay)
export const handleWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Verify webhook signature
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest !== req.headers['x-razorpay-signature']) {
            return res.status(400).json({
                success: false,
                message: 'Invalid webhook signature'
            });
        }

        const event = req.body.event;
        const paymentEntity = req.body.payload.payment.entity;

        // Handle different events
        switch (event) {
            case 'payment.captured':
                await handlePaymentCaptured(paymentEntity);
                break;
            case 'payment.failed':
                await handlePaymentFailed(paymentEntity);
                break;
            default:
                console.log('Unhandled webhook event:', event);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook processing error',
            error: error.message
        });
    }
};

// Helper function to calculate commissions - REPLACED by centralized utility
// async function calculateCommissions(policy) {
//     // ... Logic moved to utils/commission.util.js
// }

// Helper function for payment captured event
async function handlePaymentCaptured(paymentEntity) {
    const payment = await Payment.findOne({ razorpayPaymentId: paymentEntity.id });

    if (payment && payment.status !== 'success') {
        payment.status = 'success';
        payment.paidAt = new Date();
        await payment.save();

        const policy = await Policy.findById(payment.policyId);

        // Send Notification
        try {
            await notifyPaymentSuccess(payment, policy);
        } catch (notifyError) {
            console.error('[Webhook] Notification failed (non-blocking):', notifyError);
        }

        // Send payment confirmation email via webhook path as a fallback if app-side verify missed
        try {
            const customerEmail = policy?.ownerEmail;
            const customerName = policy?.ownerName || 'Customer';
            const amountPaid = payment?.amount ? parseFloat(payment.amount) : null;

            if (customerEmail) {
                const amountText = amountPaid ? `₹${amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'N/A';
                const policyLabel = policy?.policyNumber || payment.policyId?.toString();

                const html = `
                    <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto;">
                        <h2 style="color: #2563eb;">Payment Received</h2>
                        <p>Hi ${customerName},</p>
                        <p>We have received your payment for policy <strong>${policyLabel}</strong>.</p>
                        <p><strong>Amount:</strong> ${amountText}</p>
                        <p><strong>Payment ID:</strong> ${paymentEntity.id}</p>
                        <p>Your policy is now under review for approval. You will receive the policy documents once approved.</p>
                        <p>Thank you for your payment.</p>
                    </div>
                `;

                await sendEmail({
                    to: customerEmail,
                    subject: `Payment Successful for Policy ${policyLabel || ''}`,
                    html,
                    text: `Payment received for policy ${policyLabel}. Amount: ${amountText}. Payment ID: ${paymentEntity.id}.`
                });
            }
        } catch (mailErr) {
            console.error('[Webhook] Payment email failed (non-blocking):', mailErr);
        }
    }
}

// Helper function for payment failed event
async function handlePaymentFailed(paymentEntity) {
    const payment = await Payment.findOne({ razorpayPaymentId: paymentEntity.id });

    if (payment) {
        payment.status = 'failed';
        payment.errorCode = paymentEntity.error_code;
        payment.errorDescription = paymentEntity.error_description;
        await payment.save();
    }
}
