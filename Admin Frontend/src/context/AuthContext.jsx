import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../services/api.service';

// Storage keys for auth persistence - namespaced to avoid collisions
const ADMIN_STORAGE_KEY = 'admin:auth_user';

// Create Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user on mount
    useEffect(() => {
        // Try to load minimal user data from localStorage
        const storedUser = localStorage.getItem(ADMIN_STORAGE_KEY);
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Only set user if role is admin (basic validation)
                if (parsedUser.role === 'admin') {
                    setUser(parsedUser);
                }
            } catch {
                localStorage.removeItem(ADMIN_STORAGE_KEY);
            }
        }

        // Load fresh user data from server (token comes from HTTP-only cookie)
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const response = await authAPI.getProfile();
            if (response.success && response.data.user.role === 'admin') {
                setUser(response.data.user);
                // Persist minimal user data only (no token!)
                const minimalUser = {
                    id: response.data.user.id,
                    email: response.data.user.email,
                    fullName: response.data.user.fullName,
                    role: response.data.user.role
                };
                localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(minimalUser));
            } else {
                // User is logged in but not an admin - clear state
                setUser(null);
                localStorage.removeItem(ADMIN_STORAGE_KEY);
            }
        } catch {
            // Authentication failed - user is not logged in or not admin
            setUser(null);
            localStorage.removeItem(ADMIN_STORAGE_KEY);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            setError(null);
            const response = await authAPI.login(credentials);
            if (response.success) {
                // Verify user is admin - reject if not
                if (response.data.user.role !== 'admin') {
                    setUser(null);
                    localStorage.removeItem(ADMIN_STORAGE_KEY);
                    const error = new Error('Only admin users can access the admin panel');
                    setError(error.message);
                    throw error;
                }
                
                setUser(response.data.user);
                // Persist minimal user data (token is in HTTP-only cookie)
                const minimalUser = {
                    id: response.data.user.id,
                    email: response.data.user.email,
                    fullName: response.data.user.fullName,
                    role: response.data.user.role
                };
                localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(minimalUser));
                return response;
            }
        } catch (err) {
            setError(err?.message || 'Login failed');
            throw err;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } finally {
            setUser(null);
            localStorage.removeItem(ADMIN_STORAGE_KEY);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        refreshUser: loadUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;

