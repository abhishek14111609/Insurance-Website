import User from './User.js';
import Policy from './Policy.js';
import Agent from './Agent.js';
import Payment from './Payment.js';
import Commission from './Commission.js';
import Withdrawal from './Withdrawal.js';
import Claim from './Claim.js';
import PolicyPlan from './PolicyPlan.js';
import Notification from './Notification.js';
import CommissionSettings from './CommissionSettings.js';
import Inquiry from './Inquiry.js';

// ============================================
// USER ASSOCIATIONS
// ============================================

// User - Policy Associations
User.hasMany(Policy, { foreignKey: 'customerId', as: 'policies' });
Policy.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

// User - Agent Association (One-to-One)
User.hasOne(Agent, { foreignKey: 'userId', as: 'agentProfile' });
Agent.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - Payment Association
User.hasMany(Payment, { foreignKey: 'customerId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

// User - Claim Association
User.hasMany(Claim, { foreignKey: 'customerId', as: 'claims' });
Claim.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

// User - Notification Association
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ============================================
// AGENT ASSOCIATIONS
// ============================================

// Agent - Policy Association
Agent.hasMany(Policy, { foreignKey: 'agentId', as: 'policies' });
Policy.belongsTo(Agent, { foreignKey: 'agentId', as: 'agent' });

// Agent Hierarchy (Self-referencing)
Agent.hasMany(Agent, { foreignKey: 'parentAgentId', as: 'subAgents' });
Agent.belongsTo(Agent, { foreignKey: 'parentAgentId', as: 'parentAgent' });

// Agent - Commission Association
Agent.hasMany(Commission, { foreignKey: 'agentId', as: 'commissions' });
Commission.belongsTo(Agent, { foreignKey: 'agentId', as: 'agent' });

// Agent - Withdrawal Association
Agent.hasMany(Withdrawal, { foreignKey: 'agentId', as: 'withdrawals' });
Withdrawal.belongsTo(Agent, { foreignKey: 'agentId', as: 'agent' });

// ============================================
// POLICY ASSOCIATIONS
// ============================================

// Policy - Payment Association
Policy.hasMany(Payment, { foreignKey: 'policyId', as: 'payments' });
Payment.belongsTo(Policy, { foreignKey: 'policyId', as: 'policy' });

// Policy - Commission Association
Policy.hasMany(Commission, { foreignKey: 'policyId', as: 'commissions' });
Commission.belongsTo(Policy, { foreignKey: 'policyId', as: 'policy' });

// Policy - Claim Association
Policy.hasMany(Claim, { foreignKey: 'policyId', as: 'claims' });
Claim.belongsTo(Policy, { foreignKey: 'policyId', as: 'policy' });

// ============================================
// APPROVAL/ADMIN ASSOCIATIONS
// ============================================

// Policy Approvals
Policy.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
Policy.belongsTo(User, { foreignKey: 'rejectedBy', as: 'rejecter' });

// Agent Approvals
Agent.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
Agent.belongsTo(User, { foreignKey: 'rejectedBy', as: 'rejecter' });

// Withdrawal Processing
Withdrawal.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });

// Claim Reviews
Claim.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

// PolicyPlan Management
PolicyPlan.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
PolicyPlan.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

// Commission Settings Management
CommissionSettings.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

export {
    User,
    Policy,
    Agent,
    Payment,
    Commission,
    Withdrawal,
    Claim,
    PolicyPlan,
    Notification,
    CommissionSettings,
    Inquiry
};
