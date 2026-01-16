import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Base protected route component
 * Redirects to login if user is not authenticated
 */
export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div className="loader"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

/**
 * ProtectedCustomerRoute - Only customers can access
 * Redirects to customer login if not authenticated or not a customer
 */
export const ProtectedCustomerRoute = ({ children }) => {
    const { isAuthenticated, isCustomer, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div className="loader"></div>
                <p>Verifying access...</p>
            </div>
        );
    }

    // Not logged in - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Logged in but not a customer - redirect to their appropriate portal
    if (!isCustomer) {
        if (user?.role === 'agent') {
            return <Navigate to="/agent/dashboard" replace />;
        }
        if (user?.role === 'admin') {
            return <Navigate to="/login" replace />;
        }
        // For any other role, redirect to home
        return <Navigate to="/" replace />;
    }

    return children;
};

/**
 * ProtectedAgentRoute - Only agents can access
 * Redirects to agent login if not authenticated or not an agent
 */
export const ProtectedAgentRoute = ({ children }) => {
    const { isAuthenticated, isAgent, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div className="loader"></div>
                <p>Verifying agent access...</p>
            </div>
        );
    }

    // Not logged in - redirect to agent login
    if (!isAuthenticated) {
        return <Navigate to="/agent/login" replace />;
    }

    // Logged in but not an agent - redirect to their appropriate portal
    if (!isAgent) {
        if (user?.role === 'customer') {
            return <Navigate to="/dashboard" replace />;
        }
        if (user?.role === 'admin') {
            return <Navigate to="/login" replace />;
        }
        // For any other role, redirect to home
        return <Navigate to="/" replace />;
    }

    return children;
};

/**
 * ProtectedAdminRoute - Only admins can access
 * Redirects to admin login if not authenticated or not an admin
 */
export const ProtectedAdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div className="loader"></div>
                <p>Verifying admin access...</p>
            </div>
        );
    }

    // Not logged in - redirect to admin login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Logged in but not an admin - redirect to their appropriate portal
    if (!isAdmin) {
        if (user?.role === 'customer') {
            return <Navigate to="/dashboard" replace />;
        }
        if (user?.role === 'agent') {
            return <Navigate to="/agent/dashboard" replace />;
        }
        // For any other role, redirect to home
        return <Navigate to="/" replace />;
    }

    return children;
};

/**
 * GuestRoute - Only for unauthenticated users
 * Redirects to appropriate dashboard if already logged in
 */
export const GuestRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, isCustomer, isAgent, isAdmin, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div className="loader"></div>
                <p>Loading...</p>
            </div>
        );
    }

    // If already authenticated
    if (isAuthenticated) {
        // If allowedRoles specified, check if user has any allowed role
        if (allowedRoles && allowedRoles.length > 0) {
            const hasAllowedRole = allowedRoles.some(role => {
                if (role === 'customer') return isCustomer;
                if (role === 'agent') return isAgent;
                if (role === 'admin') return isAdmin;
                return false;
            });

            if (hasAllowedRole) {
                // User has allowed role, redirect to their dashboard
                if (isAdmin) return <Navigate to="/" replace />;
                if (isAgent) return <Navigate to="/agent/dashboard" replace />;
                if (isCustomer) return <Navigate to="/dashboard" replace />;
            }
        } else {
            // No allowed roles specified, redirect to default dashboard based on role
            if (user?.role === 'admin') return <Navigate to="/" replace />;
            if (user?.role === 'agent') return <Navigate to="/agent/dashboard" replace />;
            if (user?.role === 'customer') return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;

