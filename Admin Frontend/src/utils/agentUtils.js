// Agent Management Utilities
// SECURITY: Business data should come from API, not localStorage

// Storage key namespace for admin data
const ADMIN_STORAGE_PREFIX = 'admin:';

// Generate unique agent code
export const generateAgentCode = (parentCode = null) => {
    const agents = getAllAgents();

    if (!parentCode) {
        // Generate root level code (AG001, AG002, etc.)
        const rootAgents = agents.filter(a => !a.parentId);
        const nextNumber = rootAgents.length + 1;
        return `AG${String(nextNumber).padStart(3, '0')}`;
    } else {
        // Generate sub-agent code (AG001-1, AG001-1-1, etc.)
        const subAgents = agents.filter(a => a.parentId && a.code.startsWith(parentCode + '-'));
        const nextNumber = subAgents.length + 1;
        return `${parentCode}-${nextNumber}`;
    }
};

// Generate random password
export const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// Calculate agent level based on code
export const getAgentLevel = (code) => {
    if (!code) return 0;
    const parts = code.split('-');
    return parts.length;
};

// Get all agents (BACKWARD COMPATIBILITY - use API instead)
export const getAllAgents = () => {
    console.warn('getAllAgents: Using localStorage fallback. Use adminAPI.getAllAgents() instead.');
    return JSON.parse(localStorage.getItem(ADMIN_STORAGE_PREFIX + 'agent_hierarchy') || '[]');
};

// Get agent by ID
export const getAgentById = (id) => {
    const agents = getAllAgents();
    return agents.find(a => a.id === id);
};

// Get agent by code
export const getAgentByCode = (code) => {
    const agents = getAllAgents();
    return agents.find(a => a.code === code);
};

// Get agent's parent
export const getAgentParent = (agentId) => {
    const agent = getAgentById(agentId);
    if (!agent || !agent.parentId) return null;
    return getAgentById(agent.parentId);
};

// Get agent's children (sub-agents)
export const getAgentChildren = (agentId) => {
    const agents = getAllAgents();
    return agents.filter(a => a.parentId === agentId);
};

// Get agent's hierarchy (all ancestors)
export const getAgentHierarchy = (agentId) => {
    const hierarchy = [];
    let currentAgent = getAgentById(agentId);

    while (currentAgent) {
        hierarchy.unshift(currentAgent);
        currentAgent = currentAgent.parentId ? getAgentById(currentAgent.parentId) : null;
    }

    return hierarchy;
};

// Add new agent
export const addAgent = (agentData) => {
    console.warn('addAgent: Using localStorage. Use adminAPI.createAgent() instead.');
    const agents = getAllAgents();

    const newAgent = {
        id: Date.now().toString(),
        code: agentData.code || generateAgentCode(agentData.parentId ? getAgentById(agentData.parentId)?.code : null),
        name: agentData.name,
        email: agentData.email,
        phone: agentData.phone,
        password: agentData.password || generatePassword(),
        parentId: agentData.parentId || null,
        level: getAgentLevel(agentData.code),
        status: agentData.status || 'active',
        commissionRate: agentData.commissionRate || 15,
        city: agentData.city || '',
        state: agentData.state || '',
        address: agentData.address || '',
        joinedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: 'admin',
        wallet: {
            balance: 0,
            totalEarned: 0,
            totalWithdrawn: 0
        }
    };

    agents.push(newAgent);
    localStorage.setItem(ADMIN_STORAGE_PREFIX + 'agent_hierarchy', JSON.stringify(agents));

    return { success: true, agent: newAgent };
};

// Update agent
export const updateAgent = (agentId, updates) => {
    const agents = getAllAgents();
    const agentIndex = agents.findIndex(a => a.id === agentId);

    if (agentIndex === -1) {
        return { success: false, message: 'Agent not found' };
    }

    agents[agentIndex] = {
        ...agents[agentIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
    };

    localStorage.setItem(ADMIN_STORAGE_PREFIX + 'agent_hierarchy', JSON.stringify(agents));

    return { success: true, agent: agents[agentIndex] };
};

// Delete agent
export const deleteAgent = (agentId) => {
    const agents = getAllAgents();

    // Check if agent has sub-agents
    const hasChildren = agents.some(a => a.parentId === agentId);
    if (hasChildren) {
        return { success: false, message: 'Cannot delete agent with sub-agents' };
    }

    const filteredAgents = agents.filter(a => a.id !== agentId);
    localStorage.setItem(ADMIN_STORAGE_PREFIX + 'agent_hierarchy', JSON.stringify(filteredAgents));

    return { success: true };
};

// Get agent statistics
export const getAgentStats = (agentId) => {
    console.warn('getAgentStats: Using localStorage fallback. Use API instead.');
    const policies = JSON.parse(localStorage.getItem(ADMIN_STORAGE_PREFIX + 'customer_policies') || '[]');
    const commissions = JSON.parse(localStorage.getItem(ADMIN_STORAGE_PREFIX + 'commission_records') || '[]');

    const agentPolicies = policies.filter(p => p.agentId === agentId);
    const agentCommissions = commissions.filter(c => c.agentId === agentId);

    return {
        totalPolicies: agentPolicies.length,
        activePolicies: agentPolicies.filter(p => p.status === 'APPROVED').length,
        totalEarnings: agentCommissions.reduce((sum, c) => sum + (c.amount || 0), 0),
        pendingCommissions: agentCommissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + (c.amount || 0), 0)
    };
};
