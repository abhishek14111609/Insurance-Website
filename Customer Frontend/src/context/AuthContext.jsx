import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../services/api.service';

// Create Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user on mount
    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.getProfile();
            if (response.success) {
                setUser(response.data.user);
            }
        } catch (err) {
            console.error('Failed to load user:', err);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            setError(null);
            const response = await authAPI.login(credentials);
            if (response.success) {
                setUser(response.data.user);
                return response;
            }
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const response = await authAPI.register(userData);
            if (response.success) {
                setUser(response.data.user);
                return response;
            }
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const logout = () => {
        setUser(null);
        authAPI.logout();
    };

    const updateUser = async (profileData) => {
        try {
            setError(null);
            const response = await authAPI.updateProfile(profileData);
            if (response.success) {
                setUser(response.data.user);
                return response;
            }
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        refreshUser: loadUser,
        isAuthenticated: !!user,
        isAgent: user?.role === 'agent',
        isAdmin: user?.role === 'admin',
        isCustomer: user?.role === 'customer'
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
