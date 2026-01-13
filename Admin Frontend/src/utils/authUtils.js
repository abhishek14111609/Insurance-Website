// Admin Authentication Utilities

export const logoutAdmin = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    // Also clear legacy session if present
    localStorage.removeItem('admin_session');

    // Redirect handled by caller or window location change in api service
    return { success: true };
};

export const isAdminLoggedIn = () => {
    const token = localStorage.getItem('admin_token');
    // Ideally verify token expiry here, but simple check for now
    return !!token;
};

export const getAdminSession = () => {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
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
