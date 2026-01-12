import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Payment, Policy, Commission, Agent } from '../models/index.js';

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
        if (!razorpay) {
            return res.status(503).json({
                success: false,
                message: 'Payment service not configured. Please contact administrator.'
            });
        }

        const { policyId, amount } = req.body;

        // Verify policy belongs to user
        const policy = await Policy.findOne({
            where: {
                id: policyId,
                customerId: req.user.id
            }
        });

        if (!policy) {
            return res.status(404).json({
                success: false,
                message: 'Policy not found'
            });
        }

        // Create Razorpay order
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            receipt: `policy_${policyId}_${Date.now()}`,
            notes: {
                policyId: policyId,
                policyNumber: policy.policyNumber,
                customerId: req.user.id,
                customerEmail: req.user.email
            }
        };

        const order = await razorpay.orders.create(options);

        // Create payment record
        const payment = await Payment.create({
            policyId,
            customerId: req.user.id,
            razorpayOrderId: order.id,
            amount,
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
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment order',
            error: error.message
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

        // Update payment record
        const payment = await Payment.findOne({
            where: {
                razorpayOrderId: razorpay_order_id,
                customerId: req.user.id
            }
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found'
            });
        }

        await payment.update({
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            status: 'success',
            paidAt: new Date()
        });

        // Update policy status
        const policy = await Policy.findByPk(policyId);
        if (policy) {
            await policy.update({
                paymentStatus: 'PAID',
                paymentId: razorpay_payment_id,
                paymentDate: new Date(),
                status: 'PENDING_APPROVAL'
            });

            // Calculate and create commissions if agent involved
            if (policy.agentId) {
                await calculateCommissions(policy);
            }
        }

        res.json({
            success: true,
            message: 'Payment verified successfully',
            data: {
                payment,
                policy
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
        const payments = await Payment.findAll({
            where: { customerId: req.user.id },
            include: [{ model: Policy, as: 'policy' }],
            order: [['createdAt', 'DESC']]
        });

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

// Helper function to calculate commissions
async function calculateCommissions(policy) {
    try {
        const agent = await Agent.findByPk(policy.agentId);
        if (!agent) return;

        // Commission settings (can be fetched from database)
        const commissionRates = {
            level1: 15, // 15%
            level2: 10, // 10%
            level3: 5   // 5%
        };

        const commissions = [];

        // Level 1 - Direct agent
        commissions.push({
            policyId: policy.id,
            agentId: agent.id,
            level: 1,
            percentage: commissionRates.level1,
            amount: (policy.premium * commissionRates.level1) / 100,
            status: 'pending'
        });

        // Level 2 - Parent agent
        if (agent.parentAgentId) {
            const parentAgent = await Agent.findByPk(agent.parentAgentId);
            if (parentAgent) {
                commissions.push({
                    policyId: policy.id,
                    agentId: parentAgent.id,
                    level: 2,
                    percentage: commissionRates.level2,
                    amount: (policy.premium * commissionRates.level2) / 100,
                    status: 'pending'
                });

                // Level 3 - Grandparent agent
                if (parentAgent.parentAgentId) {
                    const grandparentAgent = await Agent.findByPk(parentAgent.parentAgentId);
                    if (grandparentAgent) {
                        commissions.push({
                            policyId: policy.id,
                            agentId: grandparentAgent.id,
                            level: 3,
                            percentage: commissionRates.level3,
                            amount: (policy.premium * commissionRates.level3) / 100,
                            status: 'pending'
                        });
                    }
                }
            }
        }

        // Create commission records
        await Commission.bulkCreate(commissions);
    } catch (error) {
        console.error('Calculate commissions error:', error);
    }
}

// Helper function for payment captured event
async function handlePaymentCaptured(paymentEntity) {
    const payment = await Payment.findOne({
        where: { razorpayPaymentId: paymentEntity.id }
    });

    if (payment && payment.status !== 'success') {
        await payment.update({
            status: 'success',
            paidAt: new Date()
        });
    }
}

// Helper function for payment failed event
async function handlePaymentFailed(paymentEntity) {
    const payment = await Payment.findOne({
        where: { razorpayPaymentId: paymentEntity.id }
    });

    if (payment) {
        await payment.update({
            status: 'failed',
            errorCode: paymentEntity.error_code,
            errorDescription: paymentEntity.error_description
        });
    }
}
