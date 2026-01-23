import axios from 'axios';

// API Configuration with safer defaults for deployed builds
const DEFAULT_PROD_API = 'https://pashudhansurakshabackend.onrender.com/api';
const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && /(localhost|127\.0\.0\.1)/.test(window.location.hostname);
const API_BASE_URL = import.meta.env.VITE_API_URL
    || (isLocalhost ? 'http://localhost:5000/api' : DEFAULT_PROD_API);
// Helper to get raw base url for static files
export const BASE_URL = API_BASE_URL.replace('/api', '');

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
    (response) => {
        return response.data; // Return only the data
    },
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
                return axiosInstance(originalRequest);
            } catch (refreshErr) {
                // fall through
            }
        }

        if (status === 401) {
            if (window.location.pathname !== '/login') {
                localStorage.removeItem('admin:auth_user');
                window.location.href = '/login';
            }
        }

        const message = error.response?.data?.message || error.message || 'API request failed';
        throw new Error(message);
    }
);

// Authentication API
export const authAPI = {
    // Get current admin user profile
    getProfile: async () => {
        return axiosInstance.get('/auth/me');
    },

    // Admin Login uses the same endpoint but we verify role in frontend or backend
    login: async (credentials) => {
        const data = await axiosInstance.post('/auth/login', credentials);

        // Verify it is an admin
        if (data.success && data.data.user.role !== 'admin') {
            throw new Error('Unauthorized access. Admin privileges required.');
        }

        // Token is now stored in HTTP-only cookie by backend
        // No localStorage token handling needed - XSS safe!
        // Only store minimal user data for UI purposes
        if (data.success) {
            const minimalUser = {
                id: data.data.user.id,
                email: data.data.user.email,
                fullName: data.data.user.fullName,
                role: data.data.user.role
            };
            localStorage.setItem('admin:auth_user', JSON.stringify(minimalUser));
        }

        return data;
    },

    // Logout
    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
        } catch {
            // Silently fail on logout - cookie will still be cleared
        }
        // Clear localStorage (no token to remove - it's in HTTP-only cookie)
        localStorage.removeItem('admin:auth_user');
        // Token in HTTP-only cookie is cleared by the backend
        window.location.href = '/login';
    }
};

// Policy API
export const policyAPI = {
    // Get pending policies
    getPending: async () => {
        return axiosInstance.get('/policies/admin/pending');
    },

    // Get all policies (history)
    getAll: async (params) => {
        return axiosInstance.get('/admin/policies', { params });
    },

    // Approve policy
    approve: async (policyId, adminNotes) => {
        return axiosInstance.patch(`/admin/policies/${policyId}/approve`, { adminNotes });
    },

    // Reject policy
    reject: async (policyId, rejectionReason) => {
        return axiosInstance.patch(`/admin/policies/${policyId}/reject`, { rejectionReason });
    }
};

// Payment/Transaction API
export const paymentAPI = {
    getAll: async (params) => {
        return axiosInstance.get('/admin/payments', { params });
    }
};



// Admin API
export const adminAPI = {
    // Dashboard Stats
    getDashboardStats: async () => {
        return axiosInstance.get('/admin/dashboard');
    },

    // Agent Management
    getAllAgents: async () => {
        return axiosInstance.get('/admin/agents');
    },

    getAgentById: async (id) => {
        return axiosInstance.get(`/admin/agents/${id}`);
    },

    createAgent: async (agentData) => {
        return axiosInstance.post('/admin/agents', agentData);
    },

    approveAgent: async (agentId, adminNotes = '') => {
        return axiosInstance.patch(`/admin/agents/${agentId}/approve`, { adminNotes });
    },

    rejectAgent: async (agentId, rejectionReason = '') => {
        return axiosInstance.patch(`/admin/agents/${agentId}/reject`, { rejectionReason });
    },

    verifyAgentKYC: async (agentId, status, reason = '') => {
        return axiosInstance.patch(`/admin/agents/${agentId}/verify-kyc`, { status, reason });
    },

    updateAgent: async (agentId, agentData) => {
        return axiosInstance.put(`/admin/agents/${agentId}`, agentData);
    },

    // Policy Management
    getAllPolicies: async () => {
        return axiosInstance.get('/admin/policies');
    },

    // Financials
    getWithdrawals: async () => {
        return axiosInstance.get('/admin/withdrawals');
    },

    processWithdrawal: async (withdrawalId, action, reasonOrHash = null) => {
        const body = { action };
        if (action === 'approve') {
            body.adminNotes = reasonOrHash;
        } else {
            body.rejectionReason = reasonOrHash;
        }

        return axiosInstance.patch(`/admin/withdrawals/${withdrawalId}`, body);
    },

    // Commission Settings
    getCommissionSettings: async () => {
        return axiosInstance.get('/admin/commission-settings');
    },

    getAllCommissions: async () => {
        return axiosInstance.get('/admin/commissions');
    },

    approveCommission: async (id) => {
        return axiosInstance.patch(`/admin/commissions/${id}/approve`);
    },

    rejectCommission: async (id, notes = '') => {
        return axiosInstance.patch(`/admin/commissions/${id}/reject`, { notes });
    },

    updateCommissionSettings: async (settings) => {
        return axiosInstance.put('/admin/commission-settings', settings);
    },

    // Customer Management
    getAllCustomers: async () => {
        return axiosInstance.get('/admin/customers');
    },

    getCustomerById: async (id) => {
        return axiosInstance.get(`/admin/customers/${id}`);
    },

    setupDatabase: async (force = false) => {
        return axiosInstance.post('/admin/setup-db', { force });
    }
};

// Policy Plans API
export const policyPlanAPI = {
    getAll: async () => {
        return axiosInstance.get('/plans');
    },

    getById: async (id) => {
        return axiosInstance.get(`/plans/${id}`);
    },

    create: async (planData) => {
        return axiosInstance.post('/plans', planData);
    },

    update: async (id, planData) => {
        return axiosInstance.put(`/plans/${id}`, planData);
    },

    delete: async (id) => {
        return axiosInstance.delete(`/plans/${id}`);
    }
};

// Claims API
export const claimAPI = {
    getAll: async (params) => {
        return axiosInstance.get('/admin/claims', { params });
    },

    getAllPending: async () => {
        return axiosInstance.get('/claims/admin/all?status=pending');
    },

    updateStatus: async (claimId, statusData) => {
        return axiosInstance.patch(`/claims/${claimId}/status`, statusData);
    },

    getById: async (id) => {
        return axiosInstance.get(`/claims/${id}`);
    }
};

// Contact/Inquiries API
export const contactAPI = {
    getAll: async () => {
        return axiosInstance.get('/contact/all');
    },

    reply: async (id, message) => {
        return axiosInstance.post(`/contact/reply/${id}`, { message });
    }
};

export default {
    auth: authAPI,
    policy: policyAPI,
    admin: adminAPI,
    policyPlan: policyPlanAPI,
    claim: claimAPI,
    contact: contactAPI
};
