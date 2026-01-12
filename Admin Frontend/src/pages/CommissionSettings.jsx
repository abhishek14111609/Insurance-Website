import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api.service';
import './CommissionSettings.css';

const CommissionSettings = () => {
    const [settings, setSettings] = useState({
        level1: 15,
        level2: 10,
        level3: 5
    });
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getCommissionSettings();
            if (response.success && response.data && response.data.settings) {
                const settingsArray = response.data.settings;
                const newSettings = { ...settings };

                settingsArray.forEach(s => {
                    if (s.level === 1) newSettings.level1 = parseFloat(s.percentage);
                    if (s.level === 2) newSettings.level2 = parseFloat(s.percentage);
                    if (s.level === 3) newSettings.level3 = parseFloat(s.percentage);
                    // Store the actual record IDs for updating
                    newSettings[`id${s.level}`] = s.id;
                });

                setSettings(newSettings);
            }
        } catch (error) {
            console.error('Error loading commission settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (level, value) => {
        setSettings({
            ...settings,
            [level]: parseFloat(value) || 0
        });
        setSaved(false);
    };

    const handleSave = async () => {
        try {
            // Transform back to array of settings for backend
            const payload = {
                settings: [
                    { id: settings.id1, level: 1, percentage: settings.level1 },
                    { id: settings.id2, level: 2, percentage: settings.level2 },
                    { id: settings.id3, level: 3, percentage: settings.level3 }
                ]
            };

            const response = await adminAPI.updateCommissionSettings(payload);
            if (response.success) {
                setSaved(true);
                alert('Commission settings updated successfully!');
                setTimeout(() => setSaved(false), 3000);
                loadSettings(); // Reload to get potential new IDs if created
            } else {
                alert(response.message || 'Failed to update settings');
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            alert('An error occurred while saving');
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div>Loading Settings...</div>;

    return (
        <div className="commission-settings-page">
            <div className="page-header">
                <h1>⚙️ Commission Settings</h1>
                <p>Configure commission rates for each agent level</p>
            </div>

            <div className="settings-card">
                <div className="settings-info">
                    <h3>ℹ️ Commission Structure</h3>
                    <p>Set the commission percentage for each agent level. Higher levels typically receive higher commissions.</p>
                </div>

                <div className="settings-form">
                    <div className="setting-item">
                        <div className="setting-label">
                            <h4>Level 1 Agents</h4>
                            <p>Top-level agents (no parent)</p>
                        </div>
                        <div className="setting-input">
                            <input
                                type="number"
                                value={settings.level1}
                                onChange={(e) => handleChange('level1', e.target.value)}
                                min="0"
                                max="100"
                                step="0.5"
                            />
                            <span>%</span>
                        </div>
                    </div>

                    <div className="setting-item">
                        <div className="setting-label">
                            <h4>Level 2 Agents</h4>
                            <p>Sub-agents of Level 1</p>
                        </div>
                        <div className="setting-input">
                            <input
                                type="number"
                                value={settings.level2}
                                onChange={(e) => handleChange('level2', e.target.value)}
                                min="0"
                                max="100"
                                step="0.5"
                            />
                            <span>%</span>
                        </div>
                    </div>

                    <div className="setting-item">
                        <div className="setting-label">
                            <h4>Level 3 Agents</h4>
                            <p>Sub-agents of Level 2</p>
                        </div>
                        <div className="setting-input">
                            <input
                                type="number"
                                value={settings.level3}
                                onChange={(e) => handleChange('level3', e.target.value)}
                                min="0"
                                max="100"
                                step="0.5"
                            />
                            <span>%</span>
                        </div>
                    </div>
                </div>

                <div className="settings-actions">
                    <button
                        className="btn btn-primary btn-large"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {saved ? '✅ Saved!' : '💾 Save Settings'}
                    </button>
                </div>

                <div className="settings-preview">
                    <h4>Current Rates:</h4>
                    <div className="preview-grid">
                        <div className="preview-item">
                            <span>Level 1:</span>
                            <strong>{settings.level1}%</strong>
                        </div>
                        <div className="preview-item">
                            <span>Level 2:</span>
                            <strong>{settings.level2}%</strong>
                        </div>
                        <div className="preview-item">
                            <span>Level 3:</span>
                            <strong>{settings.level3}%</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommissionSettings;
