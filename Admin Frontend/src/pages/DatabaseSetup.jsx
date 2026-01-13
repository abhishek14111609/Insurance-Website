import { useState } from 'react';
import { adminAPI } from '../services/api.service';
import './DatabaseSetup.css';

const DatabaseSetup = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // { success: boolean, message: string }
    const [forceReset, setForceReset] = useState(false);

    const handleSetup = async () => {
        const confirmMsg = forceReset
            ? "WARNING: This will DELETE ALL DATA and recreate tables. Are you absolutely sure?"
            : "This will initialize missing data (Admin, Commission Settings, Sample Plans). Continue?";

        if (!window.confirm(confirmMsg)) return;

        setLoading(true);
        setStatus(null);

        try {
            const response = await adminAPI.setupDatabase(forceReset);
            if (response.success) {
                setStatus({
                    success: true,
                    message: response.message || 'Database setup completed successfully!'
                });
            } else {
                setStatus({
                    success: false,
                    message: response.message || 'Failed to setup database'
                });
            }
        } catch (err) {
            console.error('Setup error:', err);
            setStatus({
                success: false,
                message: err.message || 'Error connecting to server'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="database-setup-page">
            <div className="page-header">
                <h1>🛠️ Database Maintenance</h1>
                <p>Configure and initialize your insurance system database</p>
            </div>

            <div className="setup-container">
                <div className="setup-card">
                    <div className="setup-icon">🎲</div>
                    <h2>System Initialization</h2>
                    <p>
                        Use this utility to ensure your database has all the necessary
                        structures and default data to function properly.
                    </p>

                    <div className="setup-options">
                        <div className="option-item">
                            <label className="checkbox-container">
                                <input
                                    type="checkbox"
                                    checked={forceReset}
                                    onChange={(e) => setForceReset(e.target.checked)}
                                />
                                <span className="checkmark"></span>
                                <span className="label-text">
                                    <strong>Force Reset Database</strong>
                                    <small>Drops all tables and recreates them from scratch. (Loses all data!)</small>
                                </span>
                            </label>
                        </div>
                    </div>

                    {status && (
                        <div className={`status-alert ${status.success ? 'success' : 'error'}`}>
                            {status.success ? '✅' : '❌'} {status.message}
                        </div>
                    )}

                    <button
                        className={`setup-btn ${forceReset ? 'danger' : 'primary'}`}
                        onClick={handleSetup}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (forceReset ? 'Reset & Setup Database' : 'Run Database Setup')}
                    </button>

                    <div className="setup-hint">
                        <p><strong>Note:</strong> Regular setup will not delete existing data. It only adds missing settings and the default admin if they don't exist.</p>
                    </div>
                </div>

                <div className="info-card">
                    <h3>What this does:</h3>
                    <ul>
                        <li>Synchronizes Database Models with MySQL</li>
                        <li>Initializes Commission Levels (L1: 10%, L2: 5%, L3: 2%)</li>
                        <li>Creates default Admin (admin@securelife.com)</li>
                        <li>Seeds Sample Policy Plans (if empty)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DatabaseSetup;
