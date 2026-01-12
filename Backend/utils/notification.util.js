import { Notification } from '../models/index.js';

/**
 * Create a notification
 * @param {Object} data - Notification data
 * @returns {Promise<Object>} Created notification
 */
export const createNotification = async (data) => {
    try {
        const notification = await Notification.create({
            userId: data.userId || null,
            type: data.type,
            title: data.title,
            message: data.message,
            data: data.data || null,
            priority: data.priority || 'medium',
            actionUrl: data.actionUrl || null,
            expiresAt: data.expiresAt || null,
            isBroadcast: data.isBroadcast || false
        });

        console.log(`Notification created: ${notification.title}`);
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

/**
 * Notify user about policy approval
 * @param {Object} policy - Approved policy
 * @returns {Promise<Object>} Created notification
 */
export const notifyPolicyApproval = async (policy) => {
    return await createNotification({
        userId: policy.customerId,
        type: 'policy',
        title: 'Policy Approved! 🎉',
        message: `Your policy ${policy.policyNumber} has been approved. Coverage is now active.`,
        data: {
            policyId: policy.id,
            policyNumber: policy.policyNumber,
            coverageAmount: policy.coverageAmount
        },
        priority: 'high',
        actionUrl: `/policies/${policy.id}`
    });
};

/**
 * Notify user about policy rejection
 * @param {Object} policy - Rejected policy
 * @returns {Promise<Object>} Created notification
 */
export const notifyPolicyRejection = async (policy) => {
    return await createNotification({
        userId: policy.customerId,
        type: 'policy',
        title: 'Policy Application Rejected',
        message: `Your policy application ${policy.policyNumber} has been rejected. Reason: ${policy.rejectionReason}`,
        data: {
            policyId: policy.id,
            policyNumber: policy.policyNumber,
            rejectionReason: policy.rejectionReason
        },
        priority: 'high',
        actionUrl: `/policies/${policy.id}`
    });
};

/**
 * Notify agent about commission earned
 * @param {Object} commission - Commission record
 * @param {Object} agent - Agent who earned commission
 * @returns {Promise<Object>} Created notification
 */
export const notifyCommissionEarned = async (commission, agent) => {
    return await createNotification({
        userId: agent.userId,
        type: 'commission',
        title: 'Commission Earned! 💰',
        message: `You earned ₹${commission.amount} commission (Level ${commission.level}) on policy.`,
        data: {
            commissionId: commission.id,
            amount: commission.amount,
            level: commission.level,
            policyId: commission.policyId
        },
        priority: 'medium',
        actionUrl: '/agent/commissions'
    });
};

/**
 * Notify agent about withdrawal approval
 * @param {Object} withdrawal - Withdrawal record
 * @param {Object} agent - Agent
 * @returns {Promise<Object>} Created notification
 */
export const notifyWithdrawalApproved = async (withdrawal, agent) => {
    return await createNotification({
        userId: agent.userId,
        type: 'withdrawal',
        title: 'Withdrawal Approved! ✅',
        message: `Your withdrawal request of ₹${withdrawal.amount} has been approved and processed.`,
        data: {
            withdrawalId: withdrawal.id,
            amount: withdrawal.amount
        },
        priority: 'high',
        actionUrl: '/agent/wallet'
    });
};

/**
 * Notify agent about withdrawal rejection
 * @param {Object} withdrawal - Withdrawal record
 * @param {Object} agent - Agent
 * @returns {Promise<Object>} Created notification
 */
export const notifyWithdrawalRejected = async (withdrawal, agent) => {
    return await createNotification({
        userId: agent.userId,
        type: 'withdrawal',
        title: 'Withdrawal Rejected',
        message: `Your withdrawal request of ₹${withdrawal.amount} has been rejected. Reason: ${withdrawal.rejectionReason}`,
        data: {
            withdrawalId: withdrawal.id,
            amount: withdrawal.amount,
            rejectionReason: withdrawal.rejectionReason
        },
        priority: 'high',
        actionUrl: '/agent/wallet'
    });
};

/**
 * Notify user about claim status update
 * @param {Object} claim - Claim record
 * @returns {Promise<Object>} Created notification
 */
export const notifyClaimStatusUpdate = async (claim) => {
    const statusMessages = {
        under_review: 'Your claim is now under review by our team.',
        approved: `Your claim has been approved! Amount: ₹${claim.approvedAmount}`,
        rejected: `Your claim has been rejected. Reason: ${claim.rejectionReason}`,
        paid: `Your claim payment of ₹${claim.paidAmount} has been processed.`
    };

    return await createNotification({
        userId: claim.customerId,
        type: 'claim',
        title: `Claim ${claim.status.replace('_', ' ').toUpperCase()}`,
        message: statusMessages[claim.status] || `Claim status updated to ${claim.status}`,
        data: {
            claimId: claim.id,
            claimNumber: claim.claimNumber,
            status: claim.status
        },
        priority: claim.status === 'approved' || claim.status === 'paid' ? 'high' : 'medium',
        actionUrl: `/claims/${claim.id}`
    });
};

/**
 * Notify agent about registration approval
 * @param {Object} agent - Agent record
 * @returns {Promise<Object>} Created notification
 */
export const notifyAgentApproval = async (agent) => {
    return await createNotification({
        userId: agent.userId,
        type: 'agent',
        title: 'Agent Registration Approved! 🎉',
        message: `Congratulations! Your agent registration has been approved. Your agent code is: ${agent.agentCode}`,
        data: {
            agentId: agent.id,
            agentCode: agent.agentCode
        },
        priority: 'high',
        actionUrl: '/agent/dashboard'
    });
};

/**
 * Notify agent about registration rejection
 * @param {Object} agent - Agent record
 * @returns {Promise<Object>} Created notification
 */
export const notifyAgentRejection = async (agent) => {
    return await createNotification({
        userId: agent.userId,
        type: 'agent',
        title: 'Agent Registration Rejected',
        message: `Your agent registration has been rejected. Reason: ${agent.rejectionReason}`,
        data: {
            agentId: agent.id,
            rejectionReason: agent.rejectionReason
        },
        priority: 'high',
        actionUrl: '/profile'
    });
};

/**
 * Notify payment success
 * @param {Object} payment - Payment record
 * @param {Object} policy - Related policy
 * @returns {Promise<Object>} Created notification
 */
export const notifyPaymentSuccess = async (payment, policy) => {
    return await createNotification({
        userId: payment.customerId,
        type: 'payment',
        title: 'Payment Successful! ✅',
        message: `Payment of ₹${payment.amount} received for policy ${policy.policyNumber}. Your policy is now pending approval.`,
        data: {
            paymentId: payment.id,
            policyId: policy.id,
            amount: payment.amount
        },
        priority: 'high',
        actionUrl: `/policies/${policy.id}`
    });
};

/**
 * Broadcast notification to all users or specific role
 * @param {Object} data - Notification data
 * @param {string} role - User role (optional)
 * @returns {Promise<Object>} Created notification
 */
export const broadcastNotification = async (data, role = null) => {
    return await createNotification({
        userId: null, // Broadcast to all
        type: 'system',
        title: data.title,
        message: data.message,
        data: { role, ...data.data },
        priority: data.priority || 'medium',
        isBroadcast: true,
        expiresAt: data.expiresAt || null
    });
};

export default {
    createNotification,
    notifyPolicyApproval,
    notifyPolicyRejection,
    notifyCommissionEarned,
    notifyWithdrawalApproved,
    notifyWithdrawalRejected,
    notifyClaimStatusUpdate,
    notifyAgentApproval,
    notifyAgentRejection,
    notifyPaymentSuccess,
    broadcastNotification
};
