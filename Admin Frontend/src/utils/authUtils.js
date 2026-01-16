// Admin Authentication Utilities
// SECURITY: Tokens are now stored in HTTP-only cookies, not localStorage
// Only minimal user data is stored in localStorage for UI purposes

export const logoutAdmin = () => {
    // Token is in HTTP-only cookie, cleared by backend
    // Just clear localStorage items
    localStorage.removeItem('admin:auth_user');
    // Legacy keys (for backward compatibility during migration)
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_session');

    // Redirect handled by caller or window location change in api service
    return { success: true };
};

export const isAdminLoggedIn = () => {
    // Token is in HTTP-only cookie, check via API or presence of user data
    const user = localStorage.getItem('admin:auth_user');
    return !!user;
};

export const getAdminSession = () => {
    // Get minimal user data from namespaced key
    const user = localStorage.getItem('admin:auth_user');
    if (user) {
        try {
            return JSON.parse(user);
        } catch {
            return null;
        }
    }
    return null;
};

// Legacy mock function - kept for reference or if any other component calls it directly
export const loginAdmin = (username, password) => {
    console.warn('loginAdmin from authUtils is deprecated. Use authAPI.login instead.');
    return { success: false, message: 'Use API login' };
};

export const requireAdminAuth = () => {
    if (!isAdminLoggedIn()) {
        window.location.href = '/login';
        return false;
    }
    return true;
};
