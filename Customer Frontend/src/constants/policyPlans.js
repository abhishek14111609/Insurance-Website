// Fixed Policy Plans for Cattle Insurance
// Coverage: ₹50,000 for all plans
// Pricing: 1 Year - ₹2,460 | 2 Years - ₹4,620 | 3 Years - ₹6,590

export const POLICY_PLANS = [
    {
        id: '1_YEAR',
        duration: '1 Year',
        durationMonths: 12,
        coverage: 50000,
        premium: 2460,
        annualCost: 2460,
        recommended: false,
        badge: null,
        features: [
            'Death due to Disease (HS, BQ, FMD)',
            'Accidental Death Coverage',
            'Natural Calamities Protection',
            'Permanent Total Disability',
            'Snake Bite Coverage',
            'Drowning Coverage',
            '24/7 Claim Support',
            'Quick Claim Settlement'
        ],
        description: 'Perfect for short-term protection',
        savings: null
    },
    {
        id: '2_YEAR',
        duration: '2 Years',
        durationMonths: 24,
        coverage: 50000,
        premium: 4620,
        annualCost: 2310,
        recommended: true,
        badge: 'BEST VALUE',
        features: [
            'All 1-Year Plan Benefits',
            'Extended Coverage Period',
            'Save ₹300 vs Annual Renewal',
            'Priority Claim Processing',
            'Free Policy Renewal Reminder',
            'Dedicated Support Manager'
        ],
        description: 'Most popular choice - Best value for money',
        savings: 300
    },
    {
        id: '3_YEAR',
        duration: '3 Years',
        durationMonths: 36,
        coverage: 50000,
        premium: 6590,
        annualCost: 2197,
        recommended: false,
        badge: 'MAXIMUM SAVINGS',
        features: [
            'All 2-Year Plan Benefits',
            'Maximum Coverage Period',
            'Save ₹789 vs Annual Renewal',
            'VIP Claim Processing',
            'Free Annual Health Check Reminder',
            'Lifetime Support Access'
        ],
        description: 'Long-term peace of mind',
        savings: 789
    }
];

// Helper function to get plan by ID
export const getPlanById = (planId) => {
    return POLICY_PLANS.find(plan => plan.id === planId);
};

// Helper function to format currency
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
