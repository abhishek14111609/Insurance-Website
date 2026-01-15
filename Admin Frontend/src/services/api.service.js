// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Helper to get raw base url for static files
export const BASE_URL = API_BASE_URL.replace('/api', '');

// Helper function to handle API responses
const handleResponse = async (response) => {
    let data;
    try {
        data = await response.json();
    } catch (err) {
        // Handle non-JSON responses or empty responses
        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        return { success: true }; // Maybe it's a 204 No Content
    }

    if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
            // Prevent redirect loop if already on login page
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
    // Get current admin user profile
    getProfile: async () => {
        return apiClient('/auth/me');
    },

    // Admin Login uses the same endpoint but we verify role in frontend or backend
    login: async (credentials) => {
        const data = await apiClient('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        // Verify it is an admin
        if (data.success && data.data.user.role !== 'admin') {
            throw new Error('Unauthorized access. Admin privileges required.');
        }

        return data;
    },

    // Logout
    logout: async () => {
        try {
            await apiClient('/auth/logout', { method: 'POST' });
        } catch (err) {
            console.error('Logout error:', err);
        }
        window.location.href = '/login';
    }
};

// Policy API
export const policyAPI = {
    // Get pending policies
    getPending: async () => {
        return apiClient('/policies/admin/pending');
    },

    // Approve policy
    approve: async (policyId, adminNotes) => {
        return apiClient(`/admin/policies/${policyId}/approve`, {
            method: 'PATCH',
            body: JSON.stringify({ adminNotes })
        });
    },

    // Reject policy
    reject: async (policyId, rejectionReason) => {
        return apiClient(`/admin/policies/${policyId}/reject`, {
            method: 'PATCH',
            body: JSON.stringify({ rejectionReason })
        });
    }
};

// Admin API
export const adminAPI = {
    // Dashboard Stats
    getDashboardStats: async () => {
        return apiClient('/admin/dashboard');
    },

    // Agent Management
    getAllAgents: async () => {
        return apiClient('/admin/agents');
    },

    getAgentById: async (id) => {
        return apiClient(`/admin/agents/${id}`);
    },

    createAgent: async (agentData) => {
        return apiClient('/admin/agents', {
            method: 'POST',
            body: JSON.stringify(agentData)
        });
    },

    approveAgent: async (agentId, adminNotes = '') => {
        return apiClient(`/admin/agents/${agentId}/approve`, {
            method: 'PATCH',
            body: JSON.stringify({ adminNotes })
        });
    },

    rejectAgent: async (agentId, rejectionReason = '') => {
        return apiClient(`/admin/agents/${agentId}/reject`, {
            method: 'PATCH',
            body: JSON.stringify({ rejectionReason })
        });
    },

    verifyAgentKYC: async (agentId, status, reason = '') => {
        return apiClient(`/admin/agents/${agentId}/verify-kyc`, {
            method: 'PATCH',
            body: JSON.stringify({ status, reason })
        });
    },

    updateAgent: async (agentId, agentData) => {
        return apiClient(`/admin/agents/${agentId}`, {
            method: 'PUT',
            body: JSON.stringify(agentData)
        });
    },

    // Policy Management
    getAllPolicies: async () => {
        return apiClient('/admin/policies');
    },

    // Financials
    getWithdrawals: async () => {
        return apiClient('/admin/withdrawals');
    },

    processWithdrawal: async (withdrawalId, action, reasonOrHash = null) => {
        const body = { action };
        if (action === 'approve') {
            body.adminNotes = reasonOrHash;
        } else {
            body.rejectionReason = reasonOrHash;
        }

        return apiClient(`/admin/withdrawals/${withdrawalId}`, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    },

    // Commission Settings
    getCommissionSettings: async () => {
        return apiClient('/admin/commission-settings');
    },

    getAllCommissions: async () => {
        return apiClient('/admin/commissions');
    },

    approveCommission: async (id) => {
        return apiClient(`/admin/commissions/${id}/approve`, {
            method: 'PATCH'
        });
    },

    updateCommissionSettings: async (settings) => {
        return apiClient('/admin/commission-settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    },

    // Customer Management
    getAllCustomers: async () => {
        return apiClient('/admin/customers');
    },

    getCustomerById: async (id) => {
        return apiClient(`/admin/customers/${id}`);
    },

    setupDatabase: async (force = false) => {
        return apiClient('/admin/setup-db', {
            method: 'POST',
            body: JSON.stringify({ force })
        });
    }
};

// Policy Plans API
export const policyPlanAPI = {
    getAll: async () => {
        return apiClient('/plans');
    },

    getById: async (id) => {
        return apiClient(`/plans/${id}`);
    },

    create: async (planData) => {
        return apiClient('/plans', {
            method: 'POST',
            body: JSON.stringify(planData)
        });
    },

    update: async (id, planData) => {
        return apiClient(`/plans/${id}`, {
            method: 'PUT',
            body: JSON.stringify(planData)
        });
    },

    delete: async (id) => {
        return apiClient(`/plans/${id}`, {
            method: 'DELETE'
        });
    }
};

// Claims API
export const claimAPI = {
    getAllPending: async () => {
        return apiClient('/claims/admin/all?status=pending');
    },

    updateStatus: async (claimId, statusData) => {
        return apiClient(`/claims/${claimId}/status`, {
            method: 'PATCH',
            body: JSON.stringify(statusData)
        });
    },

    getById: async (id) => {
        return apiClient(`/claims/${id}`);
    }
};

// Contact/Inquiries API
export const contactAPI = {
    getAll: async () => {
        return apiClient('/contact/all');
    },

    reply: async (id, message) => {
        return apiClient(`/contact/reply/${id}`, {
            method: 'POST',
            body: JSON.stringify({ message })
        });
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
