import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { authAPI } from '../services/api.service';

// Storage keys for auth persistence - namespaced to avoid collisions
const AUTH_STORAGE_KEY = 'customer:auth_user';
const AUTH_EVENT_KEY = 'auth:state_change';

// Create Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize user from storage on mount
    useEffect(() => {
        // Try to load minimal user data from localStorage
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Only set if has required fields
                if (parsedUser.id && parsedUser.role) {
                    setUser(parsedUser);
                }
            } catch {
                localStorage.removeItem(AUTH_STORAGE_KEY);
            }
        }

        // Load fresh user data from server (token comes from HTTP-only cookie)
        loadUser();

        // Set up cross-tab synchronization
        const handleStorageChange = (e) => {
            if (e.key === AUTH_EVENT_KEY) {
                // Another tab sent an auth state change event
                const eventData = JSON.parse(e.newValue);
                if (eventData.type === 'logout') {
                    setUser(null);
                    localStorage.removeItem(AUTH_STORAGE_KEY);
                } else if (eventData.type === 'login' && eventData.user) {
                    // Only store minimal user data (no token)
                    const minimalUser = {
                        id: eventData.user.id,
                        email: eventData.user.email,
                        fullName: eventData.user.fullName,
                        role: eventData.user.role
                    };
                    setUser(minimalUser);
                    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(minimalUser));
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Cleanup
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Broadcast auth state changes to other tabs
    const broadcastAuthState = useCallback((type, userData = null) => {
        let eventData = { type };
        if (userData) {
            // Only broadcast minimal user data (no token)
            eventData.user = {
                id: userData.id,
                email: userData.email,
                fullName: userData.fullName,
                role: userData.role
            };
        }
        localStorage.setItem(AUTH_EVENT_KEY, JSON.stringify(eventData));
    }, []);

    const loadUser = async () => {
        try {
            const response = await authAPI.getProfile();
            if (response.success) {
                const userData = response.data.user;
                
                // Reject admin users who somehow got logged in on customer portal
                if (userData.role === 'admin') {
                    setUser(null);
                    localStorage.removeItem(AUTH_STORAGE_KEY);
                    return;
                }
                
                if (response.data.agentProfile) {
                    Object.assign(userData, response.data.agentProfile);
                }
                setUser(userData);
                // Persist minimal user data only (no token - it's in HTTP-only cookie)
                const minimalUser = {
                    id: userData.id,
                    email: userData.email,
                    fullName: userData.fullName,
                    role: userData.role
                };
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(minimalUser));
            } else {
                // Clear storage if no user
                setUser(null);
                localStorage.removeItem(AUTH_STORAGE_KEY);
            }
        } catch {
            // Silently fail - user is not logged in, this is expected
            setUser(null);
            localStorage.removeItem(AUTH_STORAGE_KEY);
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
                
                // Reject admin users - they should not login on customer portal
                if (userData.role === 'admin') {
                    setUser(null);
                    localStorage.removeItem(AUTH_STORAGE_KEY);
                    const error = new Error('Admin users cannot login on the customer portal.');
                    setError(error.message);
                    throw error;
                }
                
                if (response.data.agentProfile) {
                    Object.assign(userData, response.data.agentProfile);
                }
                setUser(userData);
                // Persist minimal user data (token is in HTTP-only cookie)
                const minimalUser = {
                    id: userData.id,
                    email: userData.email,
                    fullName: userData.fullName,
                    role: userData.role
                };
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(minimalUser));
                // Broadcast to other tabs
                broadcastAuthState('login', minimalUser);
                return response;
            }
        } catch (err) {
            setError(err?.message || 'Login failed');
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
                // Persist minimal user data (token is in HTTP-only cookie)
                const minimalUser = {
                    id: registeredUser.id,
                    email: registeredUser.email,
                    fullName: registeredUser.fullName,
                    role: registeredUser.role
                };
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(minimalUser));
                // Broadcast to other tabs
                broadcastAuthState('login', minimalUser);
                return response;
            }
        } catch (err) {
            setError(err?.message || 'Registration failed');
            throw err;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        // Broadcast logout to other tabs
        broadcastAuthState('logout');
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
                // Persist minimal updated user data
                const minimalUser = {
                    id: updatedUserData.id,
                    email: updatedUserData.email,
                    fullName: updatedUserData.fullName,
                    role: updatedUserData.role
                };
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(minimalUser));
                // Broadcast to other tabs
                broadcastAuthState('login', minimalUser);
                return response;
            }
        } catch (err) {
            setError(err?.message || 'Update failed');
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
