// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const BASE_URL = API_BASE_URL.replace('/api', '');

// Helper function to get auth token
const getToken = () => {
    return localStorage.getItem('admin_token');
};

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
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            // Prevent redirect loop if already on login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        throw new Error(data.message || 'API request failed');
    }

    return data;
};

// Authentication API
export const authAPI = {
    // Admin Login uses the same endpoint but we verify role in frontend or backend
    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
        const data = await handleResponse(response);

        // Verify it is an admin
        if (data.success && data.data.user.role !== 'admin') {
            throw new Error('Unauthorized access. Admin privileges required.');
        }

        // Save token and user data
        if (data.success && data.data.token) {
            localStorage.setItem('admin_token', data.data.token);
            localStorage.setItem('admin_user', JSON.stringify(data.data.user));
        }

        return data;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
    }
};

// Policy API
export const policyAPI = {
    // Get pending policies
    getPending: async () => {
        const token = getToken();
        // Since getPendingPolicies in backend requires filtering logic that might be specific to approval page
        // We use the specific admin endpoint if available or filter on client side if general get is used.
        // Backend has /api/policies/admin/pending
        const response = await fetch(`${API_BASE_URL}/policies/admin/pending`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Approve policy
    approve: async (policyId, adminNotes) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/admin/policies/${policyId}/approve`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ adminNotes })
        });
        return handleResponse(response);
    },

    // Reject policy
    reject: async (policyId, rejectionReason) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/admin/policies/${policyId}/reject`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rejectionReason })
        });
        return handleResponse(response);
    }
};

// Admin API
export const adminAPI = {
    // Dashboard Stats
    getDashboardStats: async () => {
        const token = getToken();
        // Since backend endpoint is GET /api/admin/dashboard
        const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Agent Management
    getAllAgents: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/admin/agents`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    getAgentById: async (id) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/admin/agents/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response);
    },

    createAgent: async (agentData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/admin/agents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(agentData)
        });
        return handleResponse(response);
    },

    approveAgent: async (agentId, adminNotes = '') => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/admin/agents/${agentId}/approve`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ adminNotes })
        });
        return handleResponse(response);
    },

    rejectAgent: async (agentId, rejectionReason = '') => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/admin/agents/${agentId}/reject`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rejectionReason })
        });
        return handleResponse(response);
    },


    updateAgent: async (agentId, agentData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/admin/agents/${agentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(agentData)
        });
        return handleResponse(response);
    },

    // Policy Management (Already heavily covered by policyAPI but adding admin specifics)
    getAllPolicies: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/admin/policies`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    // Financials
    getWithdrawals: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/admin/withdrawals`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    processWithdrawal: async (withdrawalId, action, reasonOrHash = null) => {
        const token = getToken();
        const body = { action };

        if (action === 'approve') {
            body.adminNotes = reasonOrHash;
        } else {
            body.rejectionReason = reasonOrHash;
        }

        const response = await fetch(`${API_BASE_URL}/admin/withdrawals/${withdrawalId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        return handleResponse(response);
    },

    // Commission Settings
    getCommissionSettings: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/admin/commission-settings`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    getAllCommissions: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/admin/commissions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    approveCommission: async (id) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/admin/commissions/${id}/approve`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    updateCommissionSettings: async (settings) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/admin/commission-settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(settings)
        });
        return handleResponse(response);
    },

    // Customer Management
    getAllCustomers: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/admin/customers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },
    getCustomerById: async (id) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/admin/customers/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return handleResponse(response);
    },

    setupDatabase: async (force = false) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/admin/setup-db`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ force })
        });
        return handleResponse(response);
    }
};

// Policy Plans API
export const policyPlanAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/plans`);
        return handleResponse(response);
    },

    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/plans/${id}`);
        return handleResponse(response);
    },

    create: async (planData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/plans`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(planData)
        });
        return handleResponse(response);
    },

    update: async (id, planData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/plans/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(planData)
        });
        return handleResponse(response);
    },

    delete: async (id) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/plans/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    }
};

// Claims API
export const claimAPI = {
    getAllPending: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/claims/admin/all?status=pending`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    updateStatus: async (claimId, statusData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/claims/${claimId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(statusData)
        });
        return handleResponse(response);
    },

    getById: async (id) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/claims/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    }
};

export default {
    auth: authAPI,
    policy: policyAPI,
    admin: adminAPI,
    policyPlan: policyPlanAPI,
    claim: claimAPI
};
