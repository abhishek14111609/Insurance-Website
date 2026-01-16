import { useState } from 'react';
import { adminAPI } from '../services/api.service';
import './DatabaseSetup.css';

const DatabaseSetup = () => {
    const [status, setStatus] = useState({
        loading: false,
        error: null,
        success: null,
        details: null
    });

    const handleSetup = async (force) => {
        if (force && !window.confirm('WARNING: varied "Force Reset" will DELETE ALL DATA. Are you sure?')) {
            return;
        }

        setStatus({ loading: true, error: null, success: null, details: null });

        try {
            const response = await adminAPI.setupDatabase(force);
            if (response.success) {
                setStatus({
                    loading: false,
                    error: null,
                    success: response.message,
                    details: response.summary
                });
            } else {
                setStatus({
                    loading: false,
                    error: response.message || 'Setup failed',
                    success: null,
                    details: null
                });
            }
        } catch (error) {
            setStatus({
                loading: false,
                error: error.message || 'Connection error',
                success: null,
                details: null
            });
        }
    };

    return (
        <div className="database-setup-container">
            <div className="setup-card">
                <h1>🛠️ Database Setup</h1>
                <p className="description">
                    Initialize the MongoDB database with formatted seed data.
                    This ensures all necessary collections (Admin User, Policy Plans, Commission Settings) exist.
                </p>

                <div className="actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => handleSetup(false)}
                        disabled={status.loading}
                    >
                        {status.loading ? 'Initializing...' : 'Initialize Data'}
                    </button>

                    <button
                        className="btn btn-danger"
                        onClick={() => handleSetup(true)}
                        disabled={status.loading}
                    >
                        Force Reset & Seed (Dangerous)
                    </button>
                </div>

                {status.success && (
                    <div className="alert alert-success">
                        <h3>✅ {status.success}</h3>
                        {status.details && (
                            <pre>{JSON.stringify(status.details, null, 2)}</pre>
                        )}
                    </div>
                )}

                {status.error && (
                    <div className="alert alert-error">
                        <h3>❌ Error</h3>
                        <p>{status.error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DatabaseSetup;
