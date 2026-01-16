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
        try {
            const response = await authAPI.getProfile();
            if (response.success) {
                const userData = response.data.user;
                if (response.data.agentProfile) {
                    Object.assign(userData, response.data.agentProfile);
                }
                setUser(userData);
            }
        } catch (err) {
            // Silently fail - user is not logged in, this is expected
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            setError(null);
            const response = await authAPI.login(credentials);
            if (response.success) {
                const userData = response.data.user;
                if (response.data.agentProfile) {
                    Object.assign(userData, response.data.agentProfile);
                }
                setUser(userData);
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
                const registeredUser = response.data.user;
                if (response.data.agentProfile) {
                    Object.assign(registeredUser, response.data.agentProfile);
                }
                setUser(registeredUser);
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
                const updatedUserData = response.data.user;
                if (response.data.agentProfile) {
                    Object.assign(updatedUserData, response.data.agentProfile);
                }
                setUser(updatedUserData);
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
