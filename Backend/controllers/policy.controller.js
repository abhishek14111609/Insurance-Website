import { Policy, User, Agent, Payment, Commission } from '../models/index.js';
import { Op } from 'sequelize';

// @desc    Create new policy
// @route   POST /api/policies
// @access  Private (Customer)
export const createPolicy = async (req, res) => {
    try {
        const {
            cattleType, tagId, age, breed, gender, milkYield, healthStatus,
            coverageAmount, premium, duration, startDate, endDate,
            ownerName, ownerEmail, ownerPhone, ownerAddress, ownerCity, ownerState, ownerPincode,
            agentCode, photos, planId
        } = req.body;

        // Generate policy number
        const policyNumber = `POL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Find agent if agent code provided
        let agentId = null;
        if (agentCode) {
            const agent = await Agent.findOne({ where: { agentCode } });
            if (agent) {
                agentId = agent.id;
            }
        }

        // Create policy
        const policy = await Policy.create({
            policyNumber,
            customerId: req.user.id,
            agentId,
            planId,
            cattleType,
            tagId,
            age,
            breed,
            gender,
            milkYield,
            healthStatus,
            coverageAmount,
            premium,
            duration,
            startDate,
            endDate,
            ownerName,
            ownerEmail,
            ownerPhone,
            ownerAddress,
            ownerCity,
            ownerState,
            ownerPincode,
            agentCode,
            photos,
            status: 'PENDING',
            paymentStatus: 'PENDING'
        });

        res.status(201).json({
            success: true,
            message: 'Policy created successfully',
            data: { policy }
        });
    } catch (error) {
        console.error('Create policy error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating policy',
            error: error.message
        });
    }
};

// @desc    Get all policies for current user
// @route   GET /api/policies
// @access  Private
export const getPolicies = async (req, res) => {
    try {
        const { status, paymentStatus } = req.query;

        const where = { customerId: req.user.id };

        if (status) where.status = status;
        if (paymentStatus) where.paymentStatus = paymentStatus;

        const policies = await Policy.findAll({
            where,
            include: [
                { model: Agent, as: 'agent', include: [{ model: User, as: 'user' }] },
                { model: Payment, as: 'payments' }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: policies.length,
            data: { policies }
        });
    } catch (error) {
        console.error('Get policies error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching policies',
            error: error.message
        });
    }
};

// @desc    Get single policy by ID
// @route   GET /api/policies/:id
// @access  Private
export const getPolicyById = async (req, res) => {
    try {
        const policy = await Policy.findOne({
            where: {
                id: req.params.id,
                customerId: req.user.id
            },
            include: [
                { model: Agent, as: 'agent', include: [{ model: User, as: 'user' }] },
                { model: Payment, as: 'payments' },
                { model: Commission, as: 'commissions' }
            ]
        });

        if (!policy) {
            return res.status(404).json({
                success: false,
                message: 'Policy not found'
            });
        }

        res.json({
            success: true,
            data: { policy }
        });
    } catch (error) {
        console.error('Get policy error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching policy',
            error: error.message
        });
    }
};

// @desc    Update policy after payment
// @route   PATCH /api/policies/:id/payment-complete
// @access  Private
export const updatePolicyPayment = async (req, res) => {
    try {
        const { paymentId, orderId } = req.body;

        const policy = await Policy.findOne({
            where: {
                id: req.params.id,
                customerId: req.user.id
            }
        });

        if (!policy) {
            return res.status(404).json({
                success: false,
                message: 'Policy not found'
            });
        }

        // Update policy status
        await policy.update({
            paymentStatus: 'PAID',
            paymentId,
            paymentDate: new Date(),
            status: 'PENDING_APPROVAL' // Waiting for admin approval
        });

        res.json({
            success: true,
            message: 'Policy payment updated successfully',
            data: { policy }
        });
    } catch (error) {
        console.error('Update policy payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating policy payment',
            error: error.message
        });
    }
};

// @desc    Get pending policies for admin approval
// @route   GET /api/policies/admin/pending
// @access  Private (Admin)
export const getPendingPolicies = async (req, res) => {
    try {
        const policies = await Policy.findAll({
            where: {
                [Op.or]: [
                    { status: 'PENDING' },
                    { status: 'PENDING_APPROVAL' }
                ]
            },
            include: [
                { model: User, as: 'customer' },
                { model: Agent, as: 'agent', include: [{ model: User, as: 'user' }] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: policies.length,
            data: { policies }
        });
    } catch (error) {
        console.error('Get pending policies error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending policies',
            error: error.message
        });
    }
};

export default {
    createPolicy,
    getPolicies,
    getPolicyById,
    updatePolicyPayment,
    getPendingPolicies
};
