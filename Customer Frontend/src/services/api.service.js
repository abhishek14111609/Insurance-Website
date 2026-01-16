import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Send cookies with requests
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
    response => {
        return response.data; // Return only the data
    },
    error => {
        // Handle 401 errors
        if (error.response?.status === 401) {
            // Only redirect if not already on the login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        
        // Re-throw the error for the caller to handle
        const message = error.response?.data?.message || error.message || 'API request failed';
        throw new Error(message);
    }
);

// Authentication API
export const authAPI = {
    // Register new user
    register: async (userData) => {
        return axiosInstance.post('/auth/register', userData);
    },

    // Login user
    login: async (credentials) => {
        return axiosInstance.post('/auth/login', credentials);
    },

    // Get current user profile
    getProfile: async () => {
        return axiosInstance.get('/auth/me');
    },

    // Update profile
    updateProfile: async (profileData) => {
        return axiosInstance.put('/auth/profile', profileData);
    },

    // Verify agent code (Public)
    verifyAgentCode: async (code) => {
        return axiosInstance.get(`/auth/verify-code/${code}`);
    },

    // Change password
    changePassword: async (passwordData) => {
        return axiosInstance.put('/auth/change-password', passwordData);
    },

    // Forgot password
    forgotPassword: async (email) => {
        return axiosInstance.post('/auth/forgot-password', { email });
    },

    // Reset password
    resetPassword: async (token, newPassword) => {
        return axiosInstance.post(`/auth/reset-password/${token}`, { newPassword });
    },

    // Logout
    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
        } catch (error) {
            // Silently fail on logout error
        }
        window.location.href = '/login';
    }
};

// Policy API
export const policyAPI = {
    // Create new policy
    create: async (policyData) => {
        return axiosInstance.post('/policies', policyData);
    },

    // Get all policies for current user
    getAll: async (filters = {}) => {
        return axiosInstance.get('/policies', { params: filters });
    },

    // Get single policy by ID
    getById: async (policyId) => {
        return axiosInstance.get(`/policies/${policyId}`);
    },

    // Update policy after payment
    updatePayment: async (policyId, paymentData) => {
        return axiosInstance.patch(`/policies/${policyId}/payment-complete`, paymentData);
    }
};

// Payment API
export const paymentAPI = {
    // Create Razorpay order
    createOrder: async (orderData) => {
        return axiosInstance.post('/payments/create-order', orderData);
    },

    // Verify payment
    verifyPayment: async (paymentData) => {
        return axiosInstance.post('/payments/verify', paymentData);
    },

    // Get payment history
    getHistory: async () => {
        return axiosInstance.get('/payments/history');
    }
};

// Agent API
export const agentAPI = {
    // Register as agent
    register: async (agentData) => {
        return axiosInstance.post('/auth/register-agent', agentData);
    },

    // Get agent profile
    getProfile: async () => {
        return axiosInstance.get('/agents/profile');
    },

    // Update agent profile
    updateProfile: async (profileData) => {
        return axiosInstance.put('/agents/profile', profileData);
    },

    // Get agent hierarchy
    getHierarchy: async () => {
        return axiosInstance.get('/agents/hierarchy');
    },

    // Get team (direct sub-agents)
    getTeam: async () => {
        return axiosInstance.get('/agents/team');
    },

    // Get agent statistics
    getStats: async () => {
        return axiosInstance.get('/agents/stats');
    },

    // Get wallet information
    getWallet: async () => {
        return axiosInstance.get('/agents/wallet');
    },

    // Request withdrawal
    requestWithdrawal: async (withdrawalData) => {
        const body = typeof withdrawalData === 'object' ? withdrawalData : { amount: withdrawalData };
        return axiosInstance.post('/agents/withdraw', body);
    },

    // Get withdrawal history
    getWithdrawals: async () => {
        return axiosInstance.get('/agents/withdrawals');
    },

    // Get commissions
    getCommissions: async (filters = {}) => {
        return axiosInstance.get('/agents/commissions', { params: filters });
    },

    // Get policies sold
    getPolicies: async (filters = {}) => {
        return axiosInstance.get('/agents/policies', { params: filters });
    },

    // Get customers
    getCustomers: async (filters = {}) => {
        return axiosInstance.get('/agents/customers', { params: filters });
    },

    // Update customer follow-up notes
    updateCustomerNotes: async (customerId, notes) => {
        return axiosInstance.patch(`/agents/customers/${customerId}/notes`, { notes });
    },

    // Update sub-agent training progress
    updateSubAgentTraining: async (agentId, trainingData) => {
        return axiosInstance.patch(`/agents/team/${agentId}/training`, trainingData);
    },

    // Submit KYC documents
    submitKYC: async (formData) => {
        return axiosInstance.post('/agents/submit-kyc', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};

// Claim API
export const claimAPI = {
    // Create new claim
    create: async (claimData) => {
        return axiosInstance.post('/claims', claimData);
    },

    // Get all claims for current user
    getAll: async (filters = {}) => {
        return axiosInstance.get('/claims', { params: filters });
    },

    // Get single claim by ID
    getById: async (claimId) => {
        return axiosInstance.get(`/claims/${claimId}`);
    },

    // Upload claim documents
    uploadDocuments: async (claimId, documents) => {
        return axiosInstance.post(`/claims/${claimId}/documents`, { documents });
    }
};

// Notification API
export const notificationAPI = {
    // Get notifications
    getAll: async (filters = {}) => {
        return axiosInstance.get('/notifications', { params: filters });
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        return axiosInstance.patch(`/notifications/${notificationId}/read`);
    },

    // Mark all as read
    markAllAsRead: async () => {
        return axiosInstance.patch('/notifications/read-all');
    },

    // Delete notification
    delete: async (notificationId) => {
        return axiosInstance.delete(`/notifications/${notificationId}`);
    }
};

// Policy Plan API
export const policyPlanAPI = {
    // Get all plans
    getAll: async () => {
        return axiosInstance.get('/plans');
    },

    // Get plan by ID
    getById: async (id) => {
        return axiosInstance.get(`/plans/${id}`);
    }
};

// Contact API
export const contactAPI = {
    // Submit inquiry
    submit: async (formData) => {
        return axiosInstance.post('/contact/submit', formData);
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
