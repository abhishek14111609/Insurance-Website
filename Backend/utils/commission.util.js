import { Agent, Commission, CommissionSettings, Policy } from '../models/index.js';
import mongoose from 'mongoose';
import { decimal128ToNumber } from './mongoose.util.js';

/**
 * Calculate and distribute multi-level commissions for a policy
 * @param {Object} policy - The approved policy
 * @returns {Promise<Array>} Array of created commission records
 */
export const calculateAndDistributeCommissions = async (policy, session = null) => {
    try {
        // Get commission settings
        const settings = await CommissionSettings.find({ isActive: true })
            .sort({ level: 1 })
            .session(session);

        if (!settings || settings.length === 0) {
            console.log('No active commission settings found');
            return [];
        }

        // If no agent, no commissions
        if (!policy.agentId) {
            console.log('No agent assigned to policy');
            return [];
        }

        const commissions = [];
        let currentAgent = await Agent.findById(policy.agentId).session(session);
        let level = 1;

        // Traverse up the agent hierarchy
        while (currentAgent && level <= settings.length) {
            const setting = settings.find(s => s.level === level);

            if (setting) {
                // Check if policy amount is within range
                const policyAmount = decimal128ToNumber(policy.premium);
                const minAmount = setting.minPolicyAmount ? decimal128ToNumber(setting.minPolicyAmount) : 0;
                const maxAmount = setting.maxPolicyAmount ? decimal128ToNumber(setting.maxPolicyAmount) : Infinity;

                if (policyAmount >= minAmount && policyAmount <= maxAmount) {
                    // Use agent's custom percentage if level 1 and it exists
                    let percentage = decimal128ToNumber(setting.percentage);
                    if (level === 1 && currentAgent.commissionRate) {
                        percentage = decimal128ToNumber(currentAgent.commissionRate);
                    }

                    const commissionAmount = (policyAmount * percentage) / 100;

                    // Create commission record
                    const commission = await Commission.create([{
                        policyId: policy._id,
                        agentId: currentAgent._id,
                        level: level,
                        amount: commissionAmount,
                        percentage: percentage,
                        status: 'pending'
                    }], { session });

                    commissions.push(commission[0]);
                    console.log(`[CommissionUtil] Created level ${level} commission: ₹${commissionAmount} (${percentage}%) for agent ID ${currentAgent._id} (User: ${currentAgent.userId})`);
                }
            }

            // Move to parent agent
            if (currentAgent.parentAgentId) {
                currentAgent = await Agent.findById(currentAgent.parentAgentId).session(session);
                level++;
            } else {
                break;
            }
        }

        return commissions;
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
                percentage: 10.00,
                description: 'Direct agent commission - 10% of premium',
                isActive: true
            },
            {
                level: 2,
                percentage: 5.00,
                description: 'Parent agent commission - 5% of premium',
                isActive: true
            },
            {
                level: 3,
                percentage: 2.00,
                description: 'Grand parent agent commission - 2% of premium',
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
