import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { RotateLoader } from 'react-spinners';
import './RouteLoader.css';

const RouteLoader = () => {
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Show loader when route changes
        setLoading(true);

        // Hide loader after a short delay (simulating page load)
        const timer = setTimeout(() => {
            setLoading(false);
        }, 300); // 300ms delay for smooth transition

        return () => clearTimeout(timer);
    }, [location.pathname]);

    if (!loading) return null;

    return (
        <div className="route-loader-overlay">
            <div className="route-loader-bar">
                <div className="route-loader-progress"></div>
            </div>
            <div className="route-loader-spinner">
                <RotateLoader color="#6366f1" size={10} margin={2} />
            </div>
        </div>
    );
};

export default RouteLoader;
