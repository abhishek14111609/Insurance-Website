import { Navigate } from 'react-router-dom';
import { isAdminLoggedIn } from '../utils/authUtils';

const ProtectedRoute = ({ children }) => {
    if (!isAdminLoggedIn()) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
