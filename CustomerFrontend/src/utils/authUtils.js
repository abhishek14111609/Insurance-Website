// Authentication Utility Functions
// SECURITY: Tokens are now stored in HTTP-only cookies, not localStorage
// Only minimal user data is stored in localStorage for UI purposes

// Storage key namespace for customer data
const CUSTOMER_STORAGE_PREFIX = 'customer:';

// Check if user is logged in
export const isCustomerLoggedIn = () => {
    // Token is in HTTP-only cookie, check via API or presence of user data
    const user = localStorage.getItem(CUSTOMER_STORAGE_PREFIX + 'auth_user');
    return !!user;
};

// Get current minimal customer data from localStorage
export const getCurrentCustomer = () => {
    const userStr = localStorage.getItem(CUSTOMER_STORAGE_PREFIX + 'auth_user');
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
};

// Logout customer
export const logoutCustomer = () => {
    // Token is in HTTP-only cookie, cleared by backend
    // Just clear localStorage items
    localStorage.removeItem(CUSTOMER_STORAGE_PREFIX + 'auth_user');
    localStorage.removeItem(CUSTOMER_STORAGE_PREFIX + 'agentProfile');
    // Legacy keys (for backward compatibility during migration)
    localStorage.removeItem('auth_user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('agentProfile');
    window.location.href = '/login';
};

// These functions are kept for backward compatibility but should not be used
// All authentication should go through api.service.js

export const initializeCustomerUsers = () => {
    console.warn('initializeCustomerUsers is deprecated. Use backend API.');
};

export const registerCustomer = () => {
    console.warn('registerCustomer is deprecated. Use authAPI.register() from api.service.js');
    return { success: false, message: 'Please use API service' };
};

export const loginCustomer = () => {
    console.warn('loginCustomer is deprecated. Use authAPI.login() from api.service.js');
    return { success: false, message: 'Please use API service' };
};

export const updateCustomerProfile = () => {
    console.warn('updateCustomerProfile is deprecated. Use authAPI.updateProfile() from api.service.js');
    return { success: false, message: 'Please use API service' };
};

export const changePassword = () => {
    console.warn('changePassword is deprecated. Use authAPI.changePassword() from api.service.js');
    return { success: false, message: 'Please use API service' };
};

export const getCustomerPolicies = () => {
    console.warn('getCustomerPolicies is deprecated. Use policyAPI.getAll() from api.service.js');
    return [];
};

export const addPolicyToCustomer = () => {
    console.warn('addPolicyToCustomer is deprecated. Use policyAPI.create() from api.service.js');
    return { success: false, message: 'Please use API service' };
};
