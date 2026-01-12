// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getToken = () => {
    return localStorage.getItem('admin_token');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            window.location.href = '/login';
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
        const response = await fetch(`${API_BASE_URL}/policies/${policyId}/approve`, {
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
        const response = await fetch(`${API_BASE_URL}/policies/${policyId}/reject`, {
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

export default {
    auth: authAPI,
    policy: policyAPI
};
