import { Agent, Commission, CommissionSettings } from '../models/index.js';
import mongoose from 'mongoose';
import { decimal128ToNumber } from './mongoose.util.js';

const fixedMap = { 1: 300, 2: 450, 3: 750 };
const parentPercents = [5, 3, 2, 2, 1];

const getTermYears = (policy) => {
    if (!policy) return 1;
    const fromDuration = policy.duration ? parseInt(policy.duration, 10) : NaN;
    if (!Number.isNaN(fromDuration) && [1, 2, 3].includes(fromDuration)) return fromDuration;
    const planDuration = policy.planId?.duration ? parseInt(policy.planId.duration, 10) : NaN;
    if (!Number.isNaN(planDuration) && [1, 2, 3].includes(planDuration)) return planDuration;
    return 1;
};

/**
 * Calculate and distribute distance-based commissions for a policy
 * @param {Object} policy - The approved policy (should include agentId and premium)
 * @param {mongoose.ClientSession|null} session - Optional session for transactional safety
 * @returns {Promise<Array>} Array of created commission records
 */
export const calculateAndDistributeCommissions = async (policy, session = null) => {
    try {
        if (!policy || !policy.agentId) {
            console.log('No agent assigned to policy; skipping commissions');
            return [];
        }

        const alreadyExists = await Commission.exists({ policyId: policy._id }).session(session || null);
        if (alreadyExists) {
            console.log('Commission already generated for policy; skipping');
            return [];
        }

        const premium = decimal128ToNumber(policy.premium);
        const term = getTermYears(policy);

        // Fetch Plan for Seller Commission
        let sellerCommissionAmount = 0;
        if (policy.planId) {
            const plan = await mongoose.model('PolicyPlan').findById(policy.planId).session(session || null);
            if (plan) {
                sellerCommissionAmount = plan.sellerCommission || 0;
            }
        }

        // Fallback or override if still 0 (Optional: keep as 0 or use old logic? Using 0 as per dynamic req)

        const records = [];

        // Seller fixed commission (distance 0)
        records.push({
            policyId: policy._id,
            agentId: policy.agentId,
            level: 0,
            distanceFromSeller: 0,
            amount: sellerCommissionAmount,
            percentage: 0,
            commissionType: 'fixed',
            premiumAtSale: premium,
            planTermYears: term,
            status: 'pending'
        });

        // Traverse up to 5 parents
        let currentAgent = await Agent.findById(policy.agentId).select('parentAgentId').session(session || null);
        let distance = 1;

        // Fetch Global Commission Settings
        const settings = await CommissionSettings.find({ isActive: true }).session(session || null);
        const settingsMap = {};
        settings.forEach(s => params = settingsMap[s.level] = s);

        while (currentAgent?.parentAgentId && distance <= 5) {
            const levelSettings = settingsMap[distance];
            let amount = 0;
            let percentage = 0;
            let type = 'percentage';

            if (levelSettings) {
                if (levelSettings.commType === 'fixed') {
                    amount = levelSettings.amount;
                    type = 'fixed';
                } else {
                    const pct = decimal128ToNumber(levelSettings.percentage);
                    amount = (premium * pct) / 100;
                    percentage = pct;
                    type = 'percentage';
                }
            } else {
                // Fallback if settings missing (using old defaults just in case, or 0)
                const oldPercents = [5, 3, 2, 2, 1];
                const pct = oldPercents[distance - 1] || 0;
                amount = (premium * pct) / 100;
                percentage = pct;
            }

            records.push({
                policyId: policy._id,
                agentId: currentAgent.parentAgentId,
                level: distance,
                distanceFromSeller: distance,
                amount: amount,
                percentage: percentage,
                commissionType: type,
                premiumAtSale: premium,
                planTermYears: term,
                status: 'pending'
            });

            currentAgent = await Agent.findById(currentAgent.parentAgentId).select('parentAgentId').session(session || null);
            distance++;
        }

        const created = await Commission.insertMany(records, { session });
        return created;
    } catch (error) {
        console.error('Error calculating commissions:', error);
        throw error;
    }
};

/**
 * Approve commission and update agent wallet
 * @param {string} commissionId - Commission ID to approve
 * @param {string} adminId - Admin user ID
 * @returns {Promise<Object>} Updated commission
 */
export const approveCommission = async (commissionId, adminId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const commission = await Commission.findById(commissionId)
            .populate('agent')
            .session(session);

        if (!commission) {
            throw new Error('Commission not found');
        }

        if (commission.status !== 'pending') {
            throw new Error('Commission is not in pending status');
        }

        // Update commission status
        commission.status = 'approved';
        commission.paidAt = new Date();
        await commission.save({ session });

        // Update agent wallet
        const agent = await Agent.findById(commission.agentId).session(session);
        const commissionAmount = decimal128ToNumber(commission.amount);
        const currentWallet = decimal128ToNumber(agent.walletBalance);
        const currentEarnings = decimal128ToNumber(agent.totalEarnings);

        agent.walletBalance = currentWallet + commissionAmount;
        agent.totalEarnings = currentEarnings + commissionAmount;
        await agent.save({ session });

        await session.commitTransaction();

        // Send notification to agent
        try {
            const { notifyCommissionEarned } = await import('./notification.util.js');
            await notifyCommissionEarned(commission, agent);
        } catch (notifyError) {
            console.error('Error sending commission approval notification:', notifyError);
            // Don't fail the approval if notification fails
        }

        console.log(`Commission ${commissionId} approved. Agent ${agent._id} wallet updated.`);
        return commission;
    } catch (error) {
        await session.abortTransaction();
        console.error('Error approving commission:', error);
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Bulk approve commissions
 * @param {Array<string>} commissionIds - Array of commission IDs
 * @param {string} adminId - Admin user ID
 * @returns {Promise<Object>} Result summary
 */
export const bulkApproveCommissions = async (commissionIds, adminId) => {
    const results = {
        success: [],
        failed: []
    };

    for (const commissionId of commissionIds) {
        try {
            await approveCommission(commissionId, adminId);
            results.success.push(commissionId);
        } catch (error) {
            results.failed.push({ commissionId, error: error.message });
        }
    }

    return results;
};

/**
 * Get commission summary for an agent
 * @param {string} agentId - Agent ID
 * @returns {Promise<Object>} Commission summary
 */
export const getAgentCommissionSummary = async (agentId) => {
    try {
        const commissions = await Commission.find({ agentId })
            .populate('policy');

        const summary = {
            total: commissions.length,
            pending: 0,
            approved: 0,
            paid: 0,
            totalAmount: 0,
            pendingAmount: 0,
            approvedAmount: 0,
            paidAmount: 0
        };

        commissions.forEach(commission => {
            const amount = decimal128ToNumber(commission.amount);
            summary.totalAmount += amount;

            switch (commission.status) {
                case 'pending':
                    summary.pending++;
                    summary.pendingAmount += amount;
                    break;
                case 'approved':
                    summary.approved++;
                    summary.approvedAmount += amount;
                    break;
                case 'paid':
                    summary.paid++;
                    summary.paidAmount += amount;
                    break;
            }
        });

        return summary;
    } catch (error) {
        console.error('Error getting commission summary:', error);
        throw error;
    }
};

/**
 * Initialize default commission settings
 * @returns {Promise<Array>} Created settings
 */
export const initializeCommissionSettings = async () => {
    try {
        const existingSettings = await CommissionSettings.find();

        if (existingSettings.length > 0) {
            console.log('Commission settings already exist');
            return existingSettings;
        }

        const defaultSettings = [
            {
                level: 1,
                percentage: 5.00,
                description: 'Level 1 - Direct parent agent commission - 5% of premium',
                isActive: true
            },
            {
                level: 2,
                percentage: 3.00,
                description: 'Level 2 - Grandparent agent commission - 3% of premium',
                isActive: true
            },
            {
                level: 3,
                percentage: 2.00,
                description: 'Level 3 - Great-grandparent agent commission - 2% of premium',
                isActive: true
            },
            {
                level: 4,
                percentage: 2.00,
                description: 'Level 4 - 4th generation agent commission - 2% of premium',
                isActive: true
            },
            {
                level: 5,
                percentage: 1.00,
                description: 'Level 5 - 5th generation agent commission - 1% of premium',
                isActive: true
            }
        ];

        const settings = await CommissionSettings.insertMany(defaultSettings);
        console.log('Default commission settings created');
        return settings;
    } catch (error) {
        console.error('Error initializing commission settings:', error);
        throw error;
    }
};

export default {
    calculateAndDistributeCommissions,
    approveCommission,
    bulkApproveCommissions,
    getAgentCommissionSummary,
    initializeCommissionSettings
};
