// Commission Calculation Utilities

// Commission rates by level (percentage of premium)
const COMMISSION_RATES = {
    level1: 100, // Seller gets full premium
    level2: 5,   // Parent gets 5%
    level3: 3,   // Grandparent gets 3%
    level4: 2,   // Great-grandparent gets 2%
    level5: 2,   // Great-great-grandparent gets 2%
    level6: 1    // Root gets 1%
};

// Calculate commission for a policy sale
export const calculateCommissions = (policyData) => {
    const { agentId, premium } = policyData;
    const commissions = [];

    // Get agent hierarchy
    const hierarchy = getAgentHierarchyForCommission(agentId);

    // Calculate commission for each level
    hierarchy.forEach((agent, index) => {
        const level = index + 1;
        let amount = 0;

        if (level === 1) {
            // Seller gets full premium
            amount = premium;
        } else if (level <= 6) {
            // Upper levels get percentage
            const rate = COMMISSION_RATES[`level${level}`] || 0;
            amount = (premium * rate) / 100;
        }

        if (amount > 0) {
            commissions.push({
                id: `${Date.now()}-${agent.id}`,
                policyId: policyData.id,
                policyNumber: policyData.policyNumber,
                agentId: agent.id,
                agentCode: agent.code,
                agentName: agent.name,
                amount: Math.round(amount * 100) / 100, // Round to 2 decimals
                level: level,
                rate: level === 1 ? 100 : COMMISSION_RATES[`level${level}`],
                status: 'pending',
                createdAt: new Date().toISOString()
            });
        }
    });

    return commissions;
};

// Get agent hierarchy for commission calculation
const getAgentHierarchyForCommission = (agentId) => {
    const agents = JSON.parse(localStorage.getItem('agent_hierarchy') || '[]');
    const hierarchy = [];
    let currentAgent = agents.find(a => a.id === agentId);

    while (currentAgent && hierarchy.length < 6) {
        hierarchy.push(currentAgent);
        currentAgent = currentAgent.parentId ? agents.find(a => a.id === currentAgent.parentId) : null;
    }

    return hierarchy;
};

// Save commission records
export const saveCommissionRecords = (commissions) => {
    const existingCommissions = JSON.parse(localStorage.getItem('commission_records') || '[]');
    const updatedCommissions = [...existingCommissions, ...commissions];
    localStorage.setItem('commission_records', JSON.stringify(updatedCommissions));

    // Update agent wallets
    commissions.forEach(commission => {
        updateAgentWallet(commission.agentId, commission.amount);
    });

    return { success: true, commissions };
};

// Update agent wallet
const updateAgentWallet = (agentId, amount) => {
    const agents = JSON.parse(localStorage.getItem('agent_hierarchy') || '[]');
    const agentIndex = agents.findIndex(a => a.id === agentId);

    if (agentIndex !== -1) {
        if (!agents[agentIndex].wallet) {
            agents[agentIndex].wallet = {
                balance: 0,
                totalEarned: 0,
                totalWithdrawn: 0
            };
        }

        agents[agentIndex].wallet.balance += amount;
        agents[agentIndex].wallet.totalEarned += amount;

        localStorage.setItem('agent_hierarchy', JSON.stringify(agents));
    }
};

// Get all commission records
export const getAllCommissions = () => {
    return JSON.parse(localStorage.getItem('commission_records') || '[]');
};

// Get commission by agent
export const getCommissionsByAgent = (agentId) => {
    const commissions = getAllCommissions();
    return commissions.filter(c => c.agentId === agentId);
};

// Get commission by policy
export const getCommissionsByPolicy = (policyId) => {
    const commissions = getAllCommissions();
    return commissions.filter(c => c.policyId === policyId);
};

// Approve commission
export const approveCommission = (commissionId) => {
    const commissions = getAllCommissions();
    const commissionIndex = commissions.findIndex(c => c.id === commissionId);

    if (commissionIndex !== -1) {
        commissions[commissionIndex].status = 'approved';
        commissions[commissionIndex].approvedAt = new Date().toISOString();
        commissions[commissionIndex].approvedBy = 'admin';

        localStorage.setItem('commission_records', JSON.stringify(commissions));
        return { success: true, commission: commissions[commissionIndex] };
    }

    return { success: false, message: 'Commission not found' };
};

// Get commission summary
export const getCommissionSummary = () => {
    const commissions = getAllCommissions();

    return {
        total: commissions.length,
        pending: commissions.filter(c => c.status === 'pending').length,
        approved: commissions.filter(c => c.status === 'approved').length,
        paid: commissions.filter(c => c.status === 'paid').length,
        totalAmount: commissions.reduce((sum, c) => sum + c.amount, 0),
        pendingAmount: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0),
        paidAmount: commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0)
    };
};

// Example calculation
export const exampleCommissionCalculation = (premium) => {
    return {
        seller: premium,
        parent: Math.round((premium * 5) / 100 * 100) / 100,
        grandparent: Math.round((premium * 3) / 100 * 100) / 100,
        greatGrandparent: Math.round((premium * 2) / 100 * 100) / 100,
        greatGreatGrandparent: Math.round((premium * 2) / 100 * 100) / 100,
        root: Math.round((premium * 1) / 100 * 100) / 100
    };
};
