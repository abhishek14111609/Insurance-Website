import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api.service';
import './CommissionSettings.css';

const CommissionSettings = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const normalize = (val) => {
        const num = parseFloat(val);
        if (Number.isNaN(num)) return 0;
        return Math.min(num, 100);
    };

    const loadSettings = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await adminAPI.getCommissionSettings();
            console.log(response)
            if (response?.success && Array.isArray(response?.data?.settings)) {
                const normalized = response.data.settings
                    .map((s) => {
                        const rawPct = s?.percentage;
                        const pct = (() => {
                            if (typeof rawPct === 'number') return rawPct;
                            if (typeof rawPct === 'string') return parseFloat(rawPct);
                            if (rawPct && typeof rawPct === 'object' && typeof rawPct.$numberDecimal === 'string') {
                                return parseFloat(rawPct.$numberDecimal);
                            }
                            return NaN;
                        })();

                        return {
                            id: s.id || s._id || null,
                            level: s.level,
                            percentage: Number.isFinite(pct) ? pct : 0,
                            description: s.description || '',
                            isActive: s.isActive !== false,
                            label: s.description || `Level ${s.level}`
                        };
                    })
                    .sort((a, b) => a.level - b.level);
                // console.log(normalized)
                setRows(normalized);
            } else {
                setRows([]);
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
            <div className="page-header-modern">
                <div className="header-info">
                    <h1>⚙️ Commission Settings</h1>
                    <p>Configure the upline commission percentages for up to 5 parents.</p>
                </div>
            </div>

            <div className="settings-card">
                <div className="settings-info">
                    <h3>ℹ️ Distance-Based Structure</h3>
                    <p>Percentages apply to parents above the seller: Parent 1 is the direct parent, then up to Parent 5.</p>
                </div>

                {error && <div className="error-banner">{error}</div>}
                {!rows.length && !loading && !error && (
                    <div className="info-banner">No commission settings found. Please add settings via API.</div>
                )}

                <div className="settings-form">
                    {rows.map((row, idx) => (
                        <div className="setting-item" key={row.id || row.level}>
                            <div className="setting-label">
                                <h4>{row.label || `Level ${row.level}`}</h4>
                                <p>Level {row.level} upline</p>
                            </div>
                            <div className="setting-input">
                                <input
                                    type="tel"
                                    value={row.percentage}
                                    onChange={(e) => handleChange(idx, e.target.value)}

                                    max="100"

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
