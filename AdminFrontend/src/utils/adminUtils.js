// Admin Utility Functions
// SECURITY: Business data should come from API, not localStorage
// These utility functions are kept for backward compatibility during migration

// Storage key namespace for admin data
const ADMIN_STORAGE_PREFIX = 'admin:';

// Get all policies (BACKWARD COMPATIBILITY - use API instead in production)
export const getAllPolicies = () => {
    // SECURITY: This is a fallback, real implementation should use API
    console.warn('getAllPolicies: Using localStorage fallback. Use policyAPI.getAll() instead.');
    return JSON.parse(localStorage.getItem(ADMIN_STORAGE_PREFIX + 'customer_policies') || '[]');
};

export const getPendingPolicies = () => {
    const policies = getAllPolicies();
    return policies.filter(p => p.status === 'PENDING');
};

export const approvePolicy = (policyId, adminNotes = '') => {
    const policies = getAllPolicies();
    const policyIndex = policies.findIndex(p => p.id === policyId);

    if (policyIndex !== -1) {
        policies[policyIndex].status = 'APPROVED';
        policies[policyIndex].approvedAt = new Date().toISOString();
        policies[policyIndex].approvedBy = 'admin';
        policies[policyIndex].adminNotes = adminNotes;

        localStorage.setItem(ADMIN_STORAGE_PREFIX + 'customer_policies', JSON.stringify(policies));
        return { success: true, policy: policies[policyIndex] };
    }

    return { success: false, message: 'Policy not found' };
};

export const rejectPolicy = (policyId, reason = '') => {
    const policies = getAllPolicies();
    const policyIndex = policies.findIndex(p => p.id === policyId);

    if (policyIndex !== -1) {
        policies[policyIndex].status = 'REJECTED';
        policies[policyIndex].rejectedAt = new Date().toISOString();
        policies[policyIndex].rejectedBy = 'admin';
        policies[policyIndex].rejectionReason = reason;

        localStorage.setItem(ADMIN_STORAGE_PREFIX + 'customer_policies', JSON.stringify(policies));
        return { success: true, policy: policies[policyIndex] };
    }

    return { success: false, message: 'Policy not found' };
};

// ============================================
// AGENT MANAGEMENT
// ============================================

export const getAllAgents = () => {
    console.warn('getAllAgents: Using localStorage fallback. Use adminAPI.getAllAgents() instead.');
    return JSON.parse(localStorage.getItem(ADMIN_STORAGE_PREFIX + 'agent_hierarchy') || '[]');
};

export const getPendingAgents = () => {
    const agents = getAllAgents();
    return agents.filter(a => a.status === 'pending');
};

export const approveAgent = (agentId, adminNotes = '') => {
    const agents = getAllAgents();
    const agentIndex = agents.findIndex(a => a.id === agentId);

    if (agentIndex !== -1) {
        agents[agentIndex].status = 'active';
        agents[agentIndex].approvedAt = new Date().toISOString();
        agents[agentIndex].approvedBy = 'admin';
        agents[agentIndex].adminNotes = adminNotes;

        localStorage.setItem(ADMIN_STORAGE_PREFIX + 'agent_hierarchy', JSON.stringify(agents));
        return { success: true, agent: agents[agentIndex] };
    }

    return { success: false, message: 'Agent not found' };
};

export const rejectAgent = (agentId, reason = '') => {
    const agents = getAllAgents();
    const agentIndex = agents.findIndex(a => a.id === agentId);

    if (agentIndex !== -1) {
        agents[agentIndex].status = 'rejected';
        agents[agentIndex].rejectedAt = new Date().toISOString();
        agents[agentIndex].rejectedBy = 'admin';
        agents[agentIndex].rejectionReason = reason;

        localStorage.setItem(ADMIN_STORAGE_PREFIX + 'agent_hierarchy', JSON.stringify(agents));
        return { success: true, agent: agents[agentIndex] };
    }

    return { success: false, message: 'Agent not found' };
};

// ============================================
// CUSTOMER MANAGEMENT
// ============================================

export const getAllCustomers = () => {
    console.warn('getAllCustomers: Using localStorage fallback. Use adminAPI.getAllCustomers() instead.');
    return JSON.parse(localStorage.getItem(ADMIN_STORAGE_PREFIX + 'customer_users') || '[]');
};

export const getCustomerById = (customerId) => {
    const customers = getAllCustomers();
    return customers.find(c => c.id === customerId);
};

export const getCustomerPolicies = (customerId) => {
    const policies = getAllPolicies();
    return policies.filter(p => p.customerId === customerId);
};

// ============================================
// COMMISSION MANAGEMENT
// ============================================

export const getCommissionSettings = () => {
    const defaultSettings = {
        level1: 15,
        level2: 10,
        level3: 5
    };

    return JSON.parse(localStorage.getItem(ADMIN_STORAGE_PREFIX + 'commission_settings') || JSON.stringify(defaultSettings));
};

export const updateCommissionSettings = (settings) => {
    localStorage.setItem(ADMIN_STORAGE_PREFIX + 'commission_settings', JSON.stringify(settings));
    return { success: true };
};

export const getAllCommissionRecords = () => {
    console.warn('getAllCommissionRecords: Using localStorage fallback. Use adminAPI.getAllCommissions() instead.');
    return JSON.parse(localStorage.getItem(ADMIN_STORAGE_PREFIX + 'commission_records') || '[]');
};

// ============================================
// WALLET & WITHDRAWAL MANAGEMENT
// ============================================

export const getAllWithdrawals = () => {
    console.warn('getAllWithdrawals: Using localStorage fallback. Use adminAPI.getWithdrawals() instead.');
    return JSON.parse(localStorage.getItem(ADMIN_STORAGE_PREFIX + 'withdrawal_requests') || '[]');
};

export const getPendingWithdrawals = () => {
    const withdrawals = getAllWithdrawals();
    return withdrawals.filter(w => w.status === 'pending');
};

export const approveWithdrawal = (withdrawalId, adminNotes = '') => {
    const withdrawals = getAllWithdrawals();
    const withdrawalIndex = withdrawals.findIndex(w => w.id === withdrawalId);

    if (withdrawalIndex !== -1) {
        withdrawals[withdrawalIndex].status = 'approved';
        withdrawals[withdrawalIndex].approvedAt = new Date().toISOString();
        withdrawals[withdrawalIndex].approvedBy = 'admin';
        withdrawals[withdrawalIndex].adminNotes = adminNotes;

        localStorage.setItem(ADMIN_STORAGE_PREFIX + 'withdrawal_requests', JSON.stringify(withdrawals));
        return { success: true, withdrawal: withdrawals[withdrawalIndex] };
    }

    return { success: false, message: 'Withdrawal not found' };
};

export const rejectWithdrawal = (withdrawalId, reason = '') => {
    const withdrawals = getAllWithdrawals();
    const withdrawalIndex = withdrawals.findIndex(w => w.id === withdrawalId);

    if (withdrawalIndex !== -1) {
        withdrawals[withdrawalIndex].status = 'rejected';
        withdrawals[withdrawalIndex].rejectedAt = new Date().toISOString();
        withdrawals[withdrawalIndex].rejectedBy = 'admin';
        withdrawals[withdrawalIndex].rejectionReason = reason;

        localStorage.setItem(ADMIN_STORAGE_PREFIX + 'withdrawal_requests', JSON.stringify(withdrawals));
        return { success: true, withdrawal: withdrawals[withdrawalIndex] };
    }

    return { success: false, message: 'Withdrawal not found' };
};

// ============================================
// NOTIFICATION MANAGEMENT
// ============================================

export const sendNotification = (notification) => {
    console.warn('sendNotification: Using localStorage fallback. Use notification API instead.');
    const notifications = JSON.parse(localStorage.getItem(ADMIN_STORAGE_PREFIX + 'admin_notifications') || '[]');

    const newNotification = {
        id: Date.now(),
        ...notification,
        createdAt: new Date().toISOString(),
        createdBy: 'admin'
    };

    notifications.push(newNotification);
    localStorage.setItem(ADMIN_STORAGE_PREFIX + 'admin_notifications', JSON.stringify(notifications));

    return { success: true, notification: newNotification };
};

export const getAllNotifications = () => {
    return JSON.parse(localStorage.getItem(ADMIN_STORAGE_PREFIX + 'admin_notifications') || '[]');
};

// ============================================
// EMAIL SIMULATION
// ============================================

export const sendEmail = (emailData) => {
    console.warn('sendEmail: Using localStorage fallback. Use email API instead.');
    // Simulate email sending
    console.log('Email sent:', emailData);

    // Store email log
    const emailLogs = JSON.parse(localStorage.getItem(ADMIN_STORAGE_PREFIX + 'email_logs') || '[]');
    emailLogs.push({
        id: Date.now(),
        ...emailData,
        sentAt: new Date().toISOString()
    });
    localStorage.setItem(ADMIN_STORAGE_PREFIX + 'email_logs', JSON.stringify(emailLogs));

    return { success: true, message: 'Email sent successfully' };
};

// ============================================
// STATISTICS
// ============================================

export const getAdminStats = () => {
    const policies = getAllPolicies();
    const agents = getAllAgents();
    const customers = getAllCustomers();
    const withdrawals = getAllWithdrawals();

    return {
        totalPolicies: policies.length,
        pendingPolicies: policies.filter(p => p.status === 'PENDING').length,
        approvedPolicies: policies.filter(p => p.status === 'APPROVED').length,
        rejectedPolicies: policies.filter(p => p.status === 'REJECTED').length,

        totalAgents: agents.length,
        pendingAgents: agents.filter(a => a.status === 'pending').length,
        activeAgents: agents.filter(a => a.status === 'active').length,

        totalCustomers: customers.length,

        totalWithdrawals: withdrawals.length,
        pendingWithdrawals: withdrawals.filter(w => w.status === 'pending').length,

        totalRevenue: policies
            .filter(p => p.status === 'APPROVED')
            .reduce((sum, p) => sum + (p.premium || 0), 0)
    };
};
