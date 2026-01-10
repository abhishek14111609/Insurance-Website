// Admin Authentication Utilities

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123', // In production, this should be hashed
    email: 'admin@securelife.com',
    role: 'admin'
};

export const loginAdmin = (username, password) => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const session = {
            username: ADMIN_CREDENTIALS.username,
            email: ADMIN_CREDENTIALS.email,
            role: ADMIN_CREDENTIALS.role,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('admin_session', JSON.stringify(session));
        return { success: true, session };
    }

    return { success: false, message: 'Invalid username or password' };
};

export const logoutAdmin = () => {
    localStorage.removeItem('admin_session');
    return { success: true };
};

export const isAdminLoggedIn = () => {
    const session = localStorage.getItem('admin_session');
    return session !== null;
};

export const getAdminSession = () => {
    const session = localStorage.getItem('admin_session');
    return session ? JSON.parse(session) : null;
};

export const requireAdminAuth = () => {
    if (!isAdminLoggedIn()) {
        window.location.href = '/login';
        return false;
    }
    return true;
};
