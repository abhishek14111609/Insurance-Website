import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api.service';
import './CommissionSettings.css';

const DEFAULT_LEVELS = [
    { level: 1, label: 'Parent 1 (direct upline)', defaultPct: 5 },
    { level: 2, label: 'Parent 2', defaultPct: 3 },
    { level: 3, label: 'Parent 3', defaultPct: 2 },
    { level: 4, label: 'Parent 4', defaultPct: 2 },
    { level: 5, label: 'Parent 5', defaultPct: 1 }
];

const CommissionSettings = () => {
    const [rows, setRows] = useState(DEFAULT_LEVELS.map(l => ({ ...l, percentage: l.defaultPct, id: null })));
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const normalize = (val) => {
        const num = parseFloat(val);
        if (Number.isNaN(num)) return 0;
        return Math.min(100, Math.max(0, num));
    };

    const loadSettings = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await adminAPI.getCommissionSettings();
            if (response?.success && response?.data?.settings) {
                const fromApi = response.data.settings.map((s) => {
                    const pct = parseFloat(s.percentage);
                    return {
                        id: s.id || s._id,
                        level: s.level,
                        percentage: Number.isFinite(pct) ? pct : null,
                        description: s.description,
                        isActive: s.isActive !== false
                    };
                });

                // Merge API data into defaults (levels 1-5)
                const merged = DEFAULT_LEVELS.map((base) => {
                    const match = fromApi.find((s) => s.level === base.level);
                    const pct = Number.isFinite(match?.percentage) ? match.percentage : base.defaultPct;
                    return {
                        ...base,
                        id: match?.id || null,
                        percentage: pct,
                        description: match?.description || '',
                        isActive: match?.isActive !== false
                    };
                });

                setRows(merged);
            }
        } catch (err) {
            console.error('Error loading commission settings:', err);
            setError(err.message || 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (idx, value) => {
        const next = [...rows];
        next[idx] = { ...next[idx], percentage: normalize(value) };
        setRows(next);
        setSaved(false);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError('');
            const payload = {
                settings: rows.map((r) => ({
                    id: r.id,
                    level: r.level,
                    percentage: r.percentage,
                    description: r.description || undefined,
                    isActive: true
                }))
            };

            const response = await adminAPI.updateCommissionSettings(payload);
            if (response?.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
                await loadSettings();
            } else {
                setError(response?.message || 'Failed to update settings');
            }
        } catch (err) {
            console.error('Error updating settings:', err);
            setError(err.message || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div>Loading Settings...</div>;

    return (
        <div className="commission-settings-page">
            <div className="page-header">
                <h1>⚙️ Commission Settings</h1>
                <p>Configure the upline commission percentages for up to 5 parents (seller fixed commission is handled by backend).</p>
            </div>

            <div className="settings-card">
                <div className="settings-info">
                    <h3>ℹ️ Distance-Based Structure</h3>
                    <p>Percentages apply to parents above the seller: Parent 1 is the direct parent, then up to Parent 5.</p>
                </div>

                {error && <div className="error-banner">{error}</div>}

                <div className="settings-form">
                    {rows.map((row, idx) => (
                        <div className="setting-item" key={row.level}>
                            <div className="setting-label">
                                <h4>{row.label}</h4>
                                <p>Level {row.level} upline</p>
                            </div>
                            <div className="setting-input">
                                <input
                                    type="number"
                                    value={row.percentage}
                                    onChange={(e) => handleChange(idx, e.target.value)}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                />
                                <span>%</span>
                            </div>
                        </div>
                    ))}
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
                        {rows.map((row) => (
                            <div className="preview-item" key={`preview-${row.level}`}>
                                <span>Level {row.level}:</span>
                                <strong>{row.percentage}%</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommissionSettings;
