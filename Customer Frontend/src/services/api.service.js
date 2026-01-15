// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
            // Only redirect if not already on the login page to prevent refresh loops
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        throw new Error(data.message || 'API request failed');
    }

    return data;
};

// Helper for making requests with credentials
const apiClient = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    // Default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Remove Content-Type if body is FormData (let browser set it)
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const config = {
        ...options,
        headers,
        credentials: 'include' // Important: Send cookies with every request
    };

    const response = await fetch(url, config);
    return handleResponse(response);
};

// Authentication API
export const authAPI = {
    // Register new user
    register: async (userData) => {
        return apiClient('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    // Login user
    login: async (credentials) => {
        return apiClient('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    // Get current user profile
    getProfile: async () => {
        return apiClient('/auth/me');
    },

    updateProfile: async (profileData) => {
        return apiClient('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    // Verify agent code (Public)
    verifyAgentCode: async (code) => {
        // Public endpoint, but apiClient is fine
        return apiClient(`/auth/verify-code/${code}`);
    },

    // Change password
    changePassword: async (passwordData) => {
        return apiClient('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify(passwordData)
        });
    },

    // Forgot password
    forgotPassword: async (email) => {
        return apiClient('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    },

    // Reset password
    resetPassword: async (token, newPassword) => {
        return apiClient(`/auth/reset-password/${token}`, {
            method: 'POST',
            body: JSON.stringify({ newPassword })
        });
    },

    // Logout
    logout: async () => {
        try {
            await apiClient('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        }
        window.location.href = '/login';
    }
};

// Policy API
export const policyAPI = {
    // Create new policy
    create: async (policyData) => {
        return apiClient('/policies', {
            method: 'POST',
            body: JSON.stringify(policyData)
        });
    },

    // Get all policies for current user
    getAll: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return apiClient(`/policies${queryParams ? `?${queryParams}` : ''}`);
    },

    // Get single policy by ID
    getById: async (policyId) => {
        return apiClient(`/policies/${policyId}`);
    },

    // Update policy after payment
    updatePayment: async (policyId, paymentData) => {
        return apiClient(`/policies/${policyId}/payment-complete`, {
            method: 'PATCH',
            body: JSON.stringify(paymentData)
        });
    }
};

// Payment API
export const paymentAPI = {
    // Create Razorpay order
    createOrder: async (orderData) => {
        return apiClient('/payments/create-order', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },

    // Verify payment
    verifyPayment: async (paymentData) => {
        return apiClient('/payments/verify', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    },

    // Get payment history
    getHistory: async () => {
        return apiClient('/payments/history');
    }
};

// Agent API
export const agentAPI = {
    // Register as agent
    register: async (agentData) => {
        return apiClient('/auth/register-agent', {
            method: 'POST',
            body: JSON.stringify(agentData)
        });
    },

    // Get agent profile
    getProfile: async () => {
        return apiClient('/agents/profile');
    },

    // Update agent profile
    updateProfile: async (profileData) => {
        return apiClient('/agents/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    // Get agent hierarchy
    getHierarchy: async () => {
        return apiClient('/agents/hierarchy');
    },

    // Get team (direct sub-agents)
    getTeam: async () => {
        return apiClient('/agents/team');
    },

    // Get agent statistics
    getStats: async () => {
        return apiClient('/agents/stats');
    },

    // Get wallet information
    getWallet: async () => {
        return apiClient('/agents/wallet');
    },

    // Request withdrawal
    requestWithdrawal: async (withdrawalData) => {
        const body = typeof withdrawalData === 'object' ? withdrawalData : { amount: withdrawalData };
        return apiClient('/agents/withdraw', {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    // Get withdrawal history
    getWithdrawals: async () => {
        return apiClient('/agents/withdrawals');
    },

    // Get commissions
    getCommissions: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return apiClient(`/agents/commissions${queryParams ? `?${queryParams}` : ''}`);
    },

    // Get policies sold
    getPolicies: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return apiClient(`/agents/policies${queryParams ? `?${queryParams}` : ''}`);
    },

    // Get customers
    getCustomers: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return apiClient(`/agents/customers${queryParams ? `?${queryParams}` : ''}`);
    },

    // Update customer follow-up notes
    updateCustomerNotes: async (customerId, notes) => {
        return apiClient(`/agents/customers/${customerId}/notes`, {
            method: 'PATCH',
            body: JSON.stringify({ notes })
        });
    },

    // Update sub-agent training progress
    updateSubAgentTraining: async (agentId, trainingData) => {
        return apiClient(`/agents/team/${agentId}/training`, {
            method: 'PATCH',
            body: JSON.stringify(trainingData)
        });
    },

    // Submit KYC documents
    submitKYC: async (formData) => {
        return apiClient('/agents/submit-kyc', {
            method: 'POST',
            body: formData
        });
    }
};

// Claim API
export const claimAPI = {
    // Create new claim
    create: async (claimData) => {
        return apiClient('/claims', {
            method: 'POST',
            body: JSON.stringify(claimData)
        });
    },

    // Get all claims for current user
    getAll: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return apiClient(`/claims${queryParams ? `?${queryParams}` : ''}`);
    },

    // Get single claim by ID
    getById: async (claimId) => {
        return apiClient(`/claims/${claimId}`);
    },

    // Upload claim documents
    uploadDocuments: async (claimId, documents) => {
        return apiClient(`/claims/${claimId}/documents`, {
            method: 'POST',
            body: JSON.stringify({ documents })
        });
    }
};

// Notification API
export const notificationAPI = {
    // Get notifications
    getAll: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return apiClient(`/notifications${queryParams ? `?${queryParams}` : ''}`);
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        return apiClient(`/notifications/${notificationId}/read`, {
            method: 'PATCH'
        });
    },

    // Mark all as read
    markAllAsRead: async () => {
        return apiClient('/notifications/read-all', {
            method: 'PATCH'
        });
    },

    // Delete notification
    delete: async (notificationId) => {
        return apiClient(`/notifications/${notificationId}`, {
            method: 'DELETE'
        });
    }
};

// Policy Plan API
export const policyPlanAPI = {
    // Get all plans
    getAll: async () => {
        return apiClient('/plans');
    },

    // Get plan by ID
    getById: async (id) => {
        return apiClient(`/plans/${id}`);
    }
};

// Contact API
export const contactAPI = {
    // Submit inquiry
    submit: async (formData) => {
        return apiClient('/contact/submit', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    }
};

// Export all APIs
export default {
    auth: authAPI,
    policy: policyAPI,
    payment: paymentAPI,
    agent: agentAPI,
    claim: claimAPI,
    notification: notificationAPI,
    policyPlan: policyPlanAPI,
    contact: contactAPI
};
