import { PolicyPlan, User } from '../models/index.js';

// @desc    Get all policy plans
// @route   GET /api/plans
// @access  Public
export const getAllPlans = async (req, res) => {
    try {
        const { isActive } = req.query;
        const where = {};

        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        const plans = await PolicyPlan.find(where)
            .sort({ displayOrder: 1, premium: 1 });

        res.json({
            success: true,
            data: { plans }
        });
    } catch (error) {
        console.error('Get all plans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching policy plans',
            error: error.message
        });
    }
};

// @desc    Get policy plan by ID
// @route   GET /api/plans/:id
// @access  Public
export const getPlanById = async (req, res) => {
    try {
        const plan = await PolicyPlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Policy plan not found'
            });
        }

        res.json({
            success: true,
            data: { plan }
        });
    } catch (error) {
        console.error('Get plan by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching policy plan',
            error: error.message
        });
    }
};

// @desc    Create policy plan
// @route   POST /api/plans
// @access  Private (admin)
export const createPlan = async (req, res) => {
    try {
        const planData = req.body;

        const newPlan = await PolicyPlan.create({
            ...planData,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Policy plan created successfully',
            data: { plan: newPlan }
        });
    } catch (error) {
        console.error('Create plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating policy plan',
            error: error.message
        });
    }
};

// @desc    Update policy plan
// @route   PUT /api/plans/:id
// @access  Private (admin)
export const updatePlan = async (req, res) => {
    try {
        const plan = await PolicyPlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Policy plan not found'
            });
        }

        Object.assign(plan, req.body, { updatedBy: req.user._id });
        await plan.save();

        res.json({
            success: true,
            message: 'Policy plan updated successfully',
            data: { plan }
        });
    } catch (error) {
        console.error('Update plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating policy plan',
            error: error.message
        });
    }
};

// @desc    Delete policy plan
// @route   DELETE /api/plans/:id
// @access  Private (admin)
export const deletePlan = async (req, res) => {
    try {
        const plan = await PolicyPlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Policy plan not found'
            });
        }

        await plan.deleteOne();

        res.json({
            success: true,
            message: 'Policy plan deleted successfully'
        });
    } catch (error) {
        console.error('Delete plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting policy plan',
            error: error.message
        });
    }
};
