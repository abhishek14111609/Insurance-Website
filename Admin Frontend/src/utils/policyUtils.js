// Policy Management Utilities

// Get all policy plans
export const getAllPolicyPlans = () => {
    const defaultPlans = [
        {
            id: 'plan-1yr',
            name: '1 Year Plan',
            duration: '1 Year',
            durationYears: 1,
            premium: 300,
            coverage: 50000,
            features: ['Accident Coverage', 'Disease Coverage', '24/7 Support'],
            status: 'active',
            createdAt: '2026-01-01'
        },
        {
            id: 'plan-2yr',
            name: '2 Year Plan',
            duration: '2 Years',
            durationYears: 2,
            premium: 450,
            coverage: 100000,
            features: ['Accident Coverage', 'Disease Coverage', '24/7 Support', 'Free Health Checkup'],
            status: 'active',
            createdAt: '2026-01-01'
        },
        {
            id: 'plan-3yr',
            name: '3 Year Plan',
            duration: '3 Years',
            durationYears: 3,
            premium: 750,
            coverage: 150000,
            features: ['Accident Coverage', 'Disease Coverage', '24/7 Support', 'Free Health Checkup', 'Premium Waiver'],
            status: 'active',
            createdAt: '2026-01-01'
        }
    ];

    const plans = localStorage.getItem('policy_plans');
    if (!plans) {
        localStorage.setItem('policy_plans', JSON.stringify(defaultPlans));
        return defaultPlans;
    }

    return JSON.parse(plans);
};

// Get policy plan by ID
export const getPolicyPlanById = (planId) => {
    const plans = getAllPolicyPlans();
    return plans.find(p => p.id === planId);
};

// Add policy plan
export const addPolicyPlan = (planData) => {
    const plans = getAllPolicyPlans();

    const newPlan = {
        id: `plan-${Date.now()}`,
        name: planData.name,
        duration: planData.duration,
        durationYears: planData.durationYears,
        premium: parseFloat(planData.premium),
        coverage: parseFloat(planData.coverage),
        features: planData.features || [],
        status: planData.status || 'active',
        createdAt: new Date().toISOString(),
        createdBy: 'admin'
    };

    plans.push(newPlan);
    localStorage.setItem('policy_plans', JSON.stringify(plans));

    return { success: true, plan: newPlan };
};

// Update policy plan
export const updatePolicyPlan = (planId, updates) => {
    const plans = getAllPolicyPlans();
    const planIndex = plans.findIndex(p => p.id === planId);

    if (planIndex === -1) {
        return { success: false, message: 'Plan not found' };
    }

    plans[planIndex] = {
        ...plans[planIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
    };

    localStorage.setItem('policy_plans', JSON.stringify(plans));

    return { success: true, plan: plans[planIndex] };
};

// Delete policy plan
export const deletePolicyPlan = (planId) => {
    const plans = getAllPolicyPlans();
    const filteredPlans = plans.filter(p => p.id !== planId);

    localStorage.setItem('policy_plans', JSON.stringify(filteredPlans));

    return { success: true };
};

// Get all customer policies
export const getAllCustomerPolicies = () => {
    return JSON.parse(localStorage.getItem('customer_policies') || '[]');
};

// Get policy by ID
export const getPolicyById = (policyId) => {
    const policies = getAllCustomerPolicies();
    return policies.find(p => p.id === policyId);
};

// Get policies by customer
export const getPoliciesByCustomer = (customerId) => {
    const policies = getAllCustomerPolicies();
    return policies.filter(p => p.customerId === customerId);
};

// Get policies by agent
export const getPoliciesByAgent = (agentId) => {
    const policies = getAllCustomerPolicies();
    return policies.filter(p => p.agentId === agentId);
};

// Get policies by status
export const getPoliciesByStatus = (status) => {
    const policies = getAllCustomerPolicies();
    return policies.filter(p => p.status === status);
};

// Get policy statistics
export const getPolicyStats = () => {
    const policies = getAllCustomerPolicies();

    return {
        total: policies.length,
        pending: policies.filter(p => p.status === 'PENDING').length,
        approved: policies.filter(p => p.status === 'APPROVED').length,
        rejected: policies.filter(p => p.status === 'REJECTED').length,
        expired: policies.filter(p => p.status === 'EXPIRED').length,
        totalPremium: policies.filter(p => p.status === 'APPROVED').reduce((sum, p) => sum + (p.premium || 0), 0),
        totalCoverage: policies.filter(p => p.status === 'APPROVED').reduce((sum, p) => sum + (p.coverageAmount || 0), 0)
    };
};

// Get revenue by period
export const getRevenueByPeriod = (startDate, endDate) => {
    const policies = getAllCustomerPolicies();
    const filteredPolicies = policies.filter(p => {
        const policyDate = new Date(p.createdAt);
        return policyDate >= new Date(startDate) && policyDate <= new Date(endDate) && p.status === 'APPROVED';
    });

    return {
        count: filteredPolicies.length,
        totalRevenue: filteredPolicies.reduce((sum, p) => sum + (p.premium || 0), 0),
        policies: filteredPolicies
    };
};

// Get revenue by plan
export const getRevenueByPlan = () => {
    const policies = getAllCustomerPolicies().filter(p => p.status === 'APPROVED');
    const plans = getAllPolicyPlans();

    return plans.map(plan => {
        const planPolicies = policies.filter(p => p.selectedPlan?.id === plan.id || p.duration === plan.duration);
        return {
            planName: plan.name,
            count: planPolicies.length,
            revenue: planPolicies.reduce((sum, p) => sum + (p.premium || 0), 0)
        };
    });
};
