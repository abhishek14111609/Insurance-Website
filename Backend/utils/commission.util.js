import { Agent, Commission, CommissionSettings, Policy } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Calculate and distribute multi-level commissions for a policy
 * @param {Object} policy - The approved policy
 * @returns {Promise<Array>} Array of created commission records
 */
export const calculateAndDistributeCommissions = async (policy, transaction = null) => {
    try {
        // Get commission settings
        const settings = await CommissionSettings.findAll({
            where: { isActive: true },
            order: [['level', 'ASC']],
            transaction
        });

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
        let currentAgent = await Agent.findByPk(policy.agentId, { transaction });
        let level = 1;

        // Traverse up the agent hierarchy
        while (currentAgent && level <= settings.length) {
            const setting = settings.find(s => s.level === level);

            if (setting) {
                // Check if policy amount is within range
                const policyAmount = parseFloat(policy.premium);
                const minAmount = setting.minPolicyAmount ? parseFloat(setting.minPolicyAmount) : 0;
                const maxAmount = setting.maxPolicyAmount ? parseFloat(setting.maxPolicyAmount) : Infinity;

                if (policyAmount >= minAmount && policyAmount <= maxAmount) {
                    // Use agent's custom percentage if level 1 and it exists
                    let percentage = parseFloat(setting.percentage);
                    if (level === 1 && currentAgent.commissionRate) {
                        percentage = parseFloat(currentAgent.commissionRate);
                    }

                    const commissionAmount = (policyAmount * percentage) / 100;

                    // Create commission record
                    const commission = await Commission.create({
                        policyId: policy.id,
                        agentId: currentAgent.id,
                        level: level,
                        amount: commissionAmount,
                        percentage: percentage,
                        status: 'pending'
                    }, { transaction });

                    commissions.push(commission);
                    console.log(`[CommissionUtil] Created level ${level} commission: ₹${commissionAmount} (${percentage}%) for agent ID ${currentAgent.id} (User: ${currentAgent.userId})`);
                }
            }

            // Move to parent agent
            if (currentAgent.parentAgentId) {
                currentAgent = await Agent.findByPk(currentAgent.parentAgentId, { transaction });
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
 * @param {number} commissionId - Commission ID to approve
 * @param {number} adminId - Admin user ID
 * @returns {Promise<Object>} Updated commission
 */
export const approveCommission = async (commissionId, adminId) => {
    const transaction = await sequelize.transaction();

    try {
        const commission = await Commission.findByPk(commissionId, {
            include: [{ model: Agent, as: 'agent' }]
        });

        if (!commission) {
            throw new Error('Commission not found');
        }

        if (commission.status !== 'pending') {
            throw new Error('Commission is not in pending status');
        }

        // Update commission status
        await commission.update({
            status: 'approved',
            paidAt: new Date()
        }, { transaction });

        // Update agent wallet
        const agent = commission.agent;
        await agent.update({
            walletBalance: parseFloat(agent.walletBalance) + parseFloat(commission.amount),
            totalEarnings: parseFloat(agent.totalEarnings) + parseFloat(commission.amount)
        }, { transaction });

        await transaction.commit();

        console.log(`Commission ${commissionId} approved. Agent ${agent.id} wallet updated.`);
        return commission;
    } catch (error) {
        await transaction.rollback();
        console.error('Error approving commission:', error);
        throw error;
    }
};

/**
 * Bulk approve commissions
 * @param {Array<number>} commissionIds - Array of commission IDs
 * @param {number} adminId - Admin user ID
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
 * @param {number} agentId - Agent ID
 * @returns {Promise<Object>} Commission summary
 */
export const getAgentCommissionSummary = async (agentId) => {
    try {
        const commissions = await Commission.findAll({
            where: { agentId },
            include: [{ model: Policy, as: 'policy' }]
        });

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
            const amount = parseFloat(commission.amount);
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
        const existingSettings = await CommissionSettings.findAll();

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

        const settings = await CommissionSettings.bulkCreate(defaultSettings);
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
