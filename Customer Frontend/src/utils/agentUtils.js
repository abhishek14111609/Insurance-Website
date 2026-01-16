/**
 * Agent Utility Functions
 * Handles agent code generation, commission calculations, and hierarchy management
 * SECURITY: Business data should come from API, not localStorage
 */

// Storage key namespace for customer data
const CUSTOMER_STORAGE_PREFIX = 'customer:';                                                             

/**
 * Generate agent code based on parent code
 * @param {string} parentCode - Parent agent's code (e.g., "AG001")
 * @param {number} sequence - Sequence number for this sub-agent
 * @returns {string} Generated agent code (e.g., "AG001-1")
 */
export const generateAgentCode = (parentCode, sequence) => {
    if (!parentCode) {
        // Top-level agent
        return `AG${String(sequence).padStart(3, '0')}`;
    }
    // Sub-agent
    return `${parentCode}-${sequence}`;
};

/**
 * Calculate commission based on premium and agent level
 * @param {number} premium - Policy premium amount
 * @param {number} level - Agent level (1, 2, or 3)
 * @returns {number} Commission amount
 */
export const calculateCommission = (premium, level) => {
    const commissionRates = {
        1: 0.15, // 15% for Level 1
        2: 0.10, // 10% for Level 2
        3: 0.05  // 5% for Level 3
    };
    
    const rate = commissionRates[level] || 0;
    return premium * rate;
};

/**
 * Get commission rate percentage for a level
 * @param {number} level - Agent level
 * @returns {number} Commission rate as percentage
 */
export const getCommissionRate = (level) => {
    const rates = {
        1: 15,
        2: 10,
        3: 5
    };
    return rates[level] || 0;
};

/**
 * Get agent hierarchy (all descendants)
 * @param {string} agentId - Agent ID to get hierarchy for
 * @returns {Array} Array of descendant agents
 */
export const getAgentHierarchy = (agentId) => {
    console.warn('getAgentHierarchy: Using localStorage fallback. Use agentAPI.getHierarchy() instead.');
    const allAgents = JSON.parse(localStorage.getItem(CUSTOMER_STORAGE_PREFIX + 'agent_hierarchy') || '[]');
    
    const findDescendants = (parentId, depth = 0) => {
        const children = allAgents.filter(agent => agent.parentId === parentId);
        let descendants = [];
        
        children.forEach(child => {
            descendants.push({ ...child, depth });
            descendants = [...descendants, ...findDescendants(child.id, depth + 1)];
        });
        
        return descendants;
    };
    
    return findDescendants(agentId);
};

/**
 * Get agent ancestors (parent, grandparent, etc.)
 * @param {string} agentId - Agent ID
 * @returns {Array} Array of ancestor agents
 */
export const getAgentAncestors = (agentId) => {
    console.warn('getAgentAncestors: Using localStorage fallback. Use API instead.');
    const allAgents = JSON.parse(localStorage.getItem(CUSTOMER_STORAGE_PREFIX + 'agent_hierarchy') || '[]');
    const ancestors = [];
    
    let currentAgent = allAgents.find(a => a.id === agentId);
    
    while (currentAgent && currentAgent.parentId) {
        const parent = allAgents.find(a => a.id === currentAgent.parentId);
        if (parent) {
            ancestors.push(parent);
            currentAgent = parent;
        } else {
            break;
        }
    }
    
    return ancestors;
};

/**
 * Validate agent code format
 * @param {string} code - Agent code to validate
 * @returns {boolean} True if valid
 */
export const validateAgentCode = (code) => {
    if (!code) return false;
    
    // Format: AG001 or AG001-1 or AG001-1-2
    const pattern = /^AG\d{3}(-\d+)*$/;
    return pattern.test(code);
};

/**
 * Find agent by code
 * @param {string} code - Agent code
 * @returns {Object|null} Agent object or null
 */
export const findAgentByCode = (code) => {
    console.warn('findAgentByCode: Using localStorage fallback. Use authAPI.verifyAgentCode() instead.');
    const allAgents = JSON.parse(localStorage.getItem(CUSTOMER_STORAGE_PREFIX + 'agent_hierarchy') || '[]');
    return allAgents.find(agent => agent.code === code) || null;
};

/**
 * Calculate total commission distribution for a policy
 * @param {number} premium - Policy premium
 * @param {string} agentId - Selling agent ID
 * @returns {Array} Commission distribution array
 */
export const calculateCommissionDistribution = (premium, agentId) => {
    console.warn('calculateCommissionDistribution: Using localStorage fallback. Use API instead.');
    const allAgents = JSON.parse(localStorage.getItem(CUSTOMER_STORAGE_PREFIX + 'agent_hierarchy') || '[]');
    const agent = allAgents.find(a => a.id === agentId);
    
    if (!agent) return [];
    
    const distribution = [];
    
    // Commission for selling agent
    distribution.push({
        agentId: agent.id,
        agentCode: agent.code,
        agentName: agent.name,
        level: agent.level,
        rate: getCommissionRate(agent.level),
        amount: calculateCommission(premium, agent.level)
    });
    
    // Commission for ancestors
    const ancestors = getAgentAncestors(agentId);
    ancestors.forEach(ancestor => {
        distribution.push({
            agentId: ancestor.id,
            agentCode: ancestor.code,
            agentName: ancestor.name,
            level: ancestor.level,
            rate: getCommissionRate(ancestor.level),
            amount: calculateCommission(premium, ancestor.level)
        });
    });
    
    return distribution;
};

/**
 * Get agent level from code
 * @param {string} code - Agent code
 * @returns {number} Level (1, 2, or 3)
 */
export const getAgentLevelFromCode = (code) => {
    if (!code) return 1;
    const parts = code.split('-');
    return parts.length; // AG001 = 1, AG001-1 = 2, AG001-1-1 = 3
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Get next sequence number for sub-agent
 * @param {string} parentCode - Parent agent code
 * @returns {number} Next sequence number
 */
export const getNextSequence = (parentCode) => {
    console.warn('getNextSequence: Using localStorage fallback. Use API instead.');
    const allAgents = JSON.parse(localStorage.getItem(CUSTOMER_STORAGE_PREFIX + 'agent_hierarchy') || '[]');
    const siblings = allAgents.filter(agent => 
        agent.code.startsWith(parentCode + '-')
    );
    
    if (siblings.length === 0) return 1;
    
    const sequences = siblings.map(agent => {
        const parts = agent.code.split('-');
        return parseInt(parts[parts.length - 1]);
    });
    
    return Math.max(...sequences) + 1;
};

/**
 * Initialize mock agent hierarchy data
 */
export const initializeMockAgentData = () => {
    const existingData = localStorage.getItem(CUSTOMER_STORAGE_PREFIX + 'agent_hierarchy');
    
    if (!existingData) {
        const mockAgents = [
            {
                id: 'agent-1',
                code: 'AG001',
                name: 'Rajesh Kumar',
                email: 'rajesh@example.com',
                phone: '9876543210',
                parentId: null,
                level: 1,
                commissionRate: 15,
                walletBalance: 24500,
                totalEarnings: 125000,
                customersCount: 15,
                policiesSold: 18,
                joinedDate: '2023-01-15'
            },
            {
                id: 'agent-2',
                code: 'AG001-1',
                name: 'Ramesh Patel',
                email: 'ramesh@example.com',
                phone: '9876543211',
                parentId: 'agent-1',
                level: 2,
                commissionRate: 10,
                walletBalance: 12300,
                totalEarnings: 65000,
                customersCount: 8,
                policiesSold: 10,
                joinedDate: '2023-03-20'
            },
            {
                id: 'agent-3',
                code: 'AG001-1-1',
                name: 'Priya Sharma',
                email: 'priya@example.com',
                phone: '9876543212',
                parentId: 'agent-2',
                level: 3,
                commissionRate: 5,
                walletBalance: 5600,
                totalEarnings: 28000,
                customersCount: 5,
                policiesSold: 6,
                joinedDate: '2023-06-10'
            },
            {
                id: 'agent-4',
                code: 'AG001-2',
                name: 'Suresh Gupta',
                email: 'suresh@example.com',
                phone: '9876543213',
                parentId: 'agent-1',
                level: 2,
                commissionRate: 10,
                walletBalance: 8900,
                totalEarnings: 45000,
                customersCount: 6,
                policiesSold: 7,
                joinedDate: '2023-04-05'
            }
        ];
        
        localStorage.setItem(CUSTOMER_STORAGE_PREFIX + 'agent_hierarchy', JSON.stringify(mockAgents));
    }
};

/**
 * Get team statistics for an agent
 * @param {string} agentId - Agent ID
 * @returns {Object} Team statistics
 */
export const getTeamStats = (agentId) => {
    const descendants = getAgentHierarchy(agentId);
    
    const totalCustomers = descendants.reduce((sum, agent) => sum + (agent.customersCount || 0), 0);
    const totalPolicies = descendants.reduce((sum, agent) => sum + (agent.policiesSold || 0), 0);
    const totalEarnings = descendants.reduce((sum, agent) => sum + (agent.totalEarnings || 0), 0);
    
    return {
        teamSize: descendants.length,
        totalCustomers,
        totalPolicies,
        totalEarnings,
        directReports: descendants.filter(a => a.depth === 0).length
    };
};
