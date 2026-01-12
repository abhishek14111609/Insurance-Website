// Authentication Utility Functions - Backend API Version
// Only stores JWT token in localStorage, all data comes from backend

// Check if user is logged in (has valid token)
export const isCustomerLoggedIn = () => {
    const token = localStorage.getItem('token');
    return token !== null && token !== undefined && token !== '';
};

// Get JWT token
export const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Get current user from localStorage (temporary until page refresh)
export const getCurrentCustomer = () => {
    const userStr = localStorage.getItem('user');
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
