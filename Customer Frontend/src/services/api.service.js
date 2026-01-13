// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getToken = () => {
    return localStorage.getItem('token');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        throw new Error(data.message || 'API request failed');
    }

    return data;
};

// Authentication API
export const authAPI = {
    // Register new user
    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        const data = await handleResponse(response);

        // Save token and user data
        if (data.success && data.data.token) {
            localStorage.setItem('token', data.data.token);
            if (data.data.user) {
                localStorage.setItem('user', JSON.stringify(data.data.user));
            }
            if (data.data.agentProfile) {
                localStorage.setItem('agentProfile', JSON.stringify(data.data.agentProfile));
            }
        }

        return data;
    },

    // Login user
    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
        const data = await handleResponse(response);

        // Save token and user data
        if (data.success && data.data.token) {
            localStorage.setItem('token', data.data.token);
            if (data.data.user) {
                localStorage.setItem('user', JSON.stringify(data.data.user));
            }
            if (data.data.agentProfile) {
                localStorage.setItem('agentProfile', JSON.stringify(data.data.agentProfile));
            }
        }

        return data;
    },

    // Get current user profile
    getProfile: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    updateProfile: async (profileData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });
        return handleResponse(response);
    },

    // Verify agent code (Public)
    verifyAgentCode: async (code) => {
        const response = await fetch(`${API_BASE_URL}/auth/verify-code/${code}`);
        return handleResponse(response);
    },

    // Change password
    changePassword: async (passwordData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(passwordData)
        });
        return handleResponse(response);
    },

    // Forgot password
    forgotPassword: async (email) => {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        return handleResponse(response);
    },

    // Reset password
    resetPassword: async (token, newPassword) => {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newPassword })
        });
        return handleResponse(response);
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('agentProfile');
        window.location.href = '/login';
    }
};

// Policy API
export const policyAPI = {
    // Create new policy
    create: async (policyData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/policies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(policyData)
        });
        return handleResponse(response);
    },

    // Get all policies for current user
    getAll: async (filters = {}) => {
        const token = getToken();
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/policies${queryParams ? `?${queryParams}` : ''}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Get single policy by ID
    getById: async (policyId) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/policies/${policyId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Update policy after payment
    updatePayment: async (policyId, paymentData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/policies/${policyId}/payment-complete`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(paymentData)
        });
        return handleResponse(response);
    }
};

// Payment API
export const paymentAPI = {
    // Create Razorpay order
    createOrder: async (orderData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/payments/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });
        return handleResponse(response);
    },

    // Verify payment
    verifyPayment: async (paymentData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/payments/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(paymentData)
        });
        return handleResponse(response);
    },

    // Get payment history
    getHistory: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/payments/history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    }
};

// Agent API
export const agentAPI = {
    // Register as agent
    register: async (agentData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register-agent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(agentData)
        });
        return handleResponse(response);
    },

    // Get agent profile
    getProfile: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/agents/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Update agent profile
    updateProfile: async (profileData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/agents/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });
        return handleResponse(response);
    },

    // Get agent hierarchy
    getHierarchy: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/agents/hierarchy`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Get team (direct sub-agents)
    getTeam: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/agents/team`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Get agent statistics
    getStats: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/agents/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Get wallet information
    getWallet: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/agents/wallet`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Request withdrawal
    requestWithdrawal: async (withdrawalData) => {
        const token = getToken();
        // Handle both simple amount and object with amount
        const body = typeof withdrawalData === 'object' ? withdrawalData : { amount: withdrawalData };

        const response = await fetch(`${API_BASE_URL}/agents/withdraw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        return handleResponse(response);
    },

    // Get withdrawal history
    getWithdrawals: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/agents/withdrawals`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Get commissions
    getCommissions: async (filters = {}) => {
        const token = getToken();
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/agents/commissions${queryParams ? `?${queryParams}` : ''}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Get policies sold
    getPolicies: async (filters = {}) => {
        const token = getToken();
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/agents/policies${queryParams ? `?${queryParams}` : ''}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Get customers
    getCustomers: async (filters = {}) => {
        const token = getToken();
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/agents/customers${queryParams ? `?${queryParams}` : ''}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Update customer follow-up notes
    updateCustomerNotes: async (customerId, notes) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/agents/customers/${customerId}/notes`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ notes })
        });
        return handleResponse(response);
    },

    // Update sub-agent training progress
    updateSubAgentTraining: async (agentId, trainingData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/agents/team/${agentId}/training`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(trainingData)
        });
        return handleResponse(response);
    }
};

// Claim API
export const claimAPI = {
    // Create new claim
    create: async (claimData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/claims`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(claimData)
        });
        return handleResponse(response);
    },

    // Get all claims for current user
    getAll: async (filters = {}) => {
        const token = getToken();
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/claims${queryParams ? `?${queryParams}` : ''}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Get single claim by ID
    getById: async (claimId) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/claims/${claimId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Upload claim documents
    uploadDocuments: async (claimId, documents) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/claims/${claimId}/documents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ documents })
        });
        return handleResponse(response);
    }
};

// Notification API
export const notificationAPI = {
    // Get notifications
    getAll: async (filters = {}) => {
        const token = getToken();
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/notifications${queryParams ? `?${queryParams}` : ''}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Mark all as read
    markAllAsRead: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Delete notification
    delete: async (notificationId) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    }
};

// Policy Plan API
export const policyPlanAPI = {
    // Get all plans
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/plans`);
        return handleResponse(response);
    },

    // Get plan by ID
    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/plans/${id}`);
        return handleResponse(response);
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
    policyPlan: policyPlanAPI
};
