import { useState, useEffect } from 'react';
import { adminAPI, policyPlanAPI } from '../services/api.service'; // Added policyPlanAPI
import toast from 'react-hot-toast'; // Added toast
import './CommissionSettings.css';

const CommissionSettings = () => {
    const [rows, setRows] = useState([]);
    const [plans, setPlans] = useState([]); // State for plans
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const normalize = (val) => {
        const num = parseFloat(val);
        if (Number.isNaN(num)) return 0;
        return num; // Don't cap at 100 for fixed amounts
    };

    const loadSettings = async () => {
        try {
            setLoading(true);
            setError('');

            // Load Parent Commission Settings
            const response = await adminAPI.getCommissionSettings();
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
                            amount: s.amount || 0,
                            commType: s.commType || 'percentage',
                            description: s.description || '',
                            isActive: s.isActive !== false,
                            label: s.description || `Level ${s.level}`
                        };
                    })
                    .sort((a, b) => a.level - b.level);
                setRows(normalized);
            } else {
                setRows([]);
            }

            // Load Policy Plans for Seller Commissions
            const plansResponse = await policyPlanAPI.getAll();
            if (plansResponse.success) {
                setPlans(plansResponse.data.plans || []);
            }

        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.message || 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleValueChange = (idx, value) => {
        const next = [...rows];
        const currentRow = next[idx];
        const numVal = normalize(value);

        if (currentRow.commType === 'percentage') {
            next[idx] = { ...currentRow, percentage: Math.min(numVal, 100) };
        } else {
            next[idx] = { ...currentRow, amount: numVal };
        }
        setRows(next);
        setSaved(false);
    };

    const handleTypeChange = (idx, newType) => {
        const next = [...rows];
        next[idx] = { ...next[idx], commType: newType };
        setRows(next);
        setSaved(false);
    };

    const handlePlanCommissionChange = (planId, newValue) => {
        const updatedPlans = plans.map(p => {
            if (p.id === planId || p._id === planId) {
                return { ...p, sellerCommission: normalize(newValue) };
            }
            return p;
        });
        setPlans(updatedPlans);
    };

    const handleSavePlans = async () => {
        try {
            setLoading(true);
            const updates = plans.map(async (plan) => {
                // We only need to update the sellerCommission field
                // This assumes standard update API can handle partial updates or we send full object.
                // Standard update usually expects full object or use PATCH. 
                // Given existing API structure, I'll send relevant fields.
                // Or better, creating a specific Loop to update each if bulk API doesn't exist.
                // But adminAPI usually doesn't have bulk plan update. 
                // I will update each plan one by one. Not efficient but works for small # of plans.

                // Re-construct the minimal payload required by EditPolicyPlan
                const payload = {
                    name: plan.name,
                    description: plan.description,
                    cattleType: plan.cattleType,
                    minAge: plan.minAge,
                    maxAge: plan.maxAge,
                    premium: parseFloat(plan.premium?.$numberDecimal || plan.premium || 0),
                    coverageAmount: parseFloat(plan.coverageAmount?.$numberDecimal || plan.coverageAmount || 0),
                    duration: plan.duration,
                    features: plan.features,
                    isActive: plan.isActive,
                    displayOrder: plan.displayOrder,
                    sellerCommission: plan.sellerCommission
                };
                return policyPlanAPI.update(plan._id || plan.id, payload);
            });

            await Promise.all(updates);
            toast.success('Seller commissions updated!');
            await loadSettings(); // Reload to confirm
        } catch (err) {
            console.error('Error updating plans:', err);
            toast.error('Failed to update plans');
        } finally {
            setLoading(false);
        }
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
                    amount: r.amount,
                    commType: r.commType,
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
                    <p>Configure the commission structure for Sellers and Parents.</p>
                </div>
            </div>

            {/* Seller Commission Section */}
            <div className="settings-card" style={{ marginBottom: '30px' }}>
                <div className="settings-info">
                    <h3>👤 Seller Commissions (Per Plan)</h3>
                    <p>Set the fixed commission amount (₹) agents receive for selling each specific policy plan.</p>
                </div>

                <div className="settings-form">
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '10px' }}>Policy Plan</th>
                                <th style={{ padding: '10px' }}>Duration</th>
                                <th style={{ padding: '10px' }}>Premium</th>
                                <th style={{ padding: '10px' }}>Seller Commission (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map((plan) => (
                                <tr key={plan.id || plan._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '15px 10px' }}><strong>{plan.name}</strong></td>
                                    <td style={{ padding: '15px 10px' }}>{plan.duration}</td>
                                    <td style={{ padding: '15px 10px' }}>₹{parseFloat(plan.premium?.$numberDecimal || plan.premium)}</td>
                                    <td style={{ padding: '15px 10px' }}>
                                        <div className="setting-input" style={{ maxWidth: '150px' }}>
                                            <input
                                                type="number"
                                                value={plan.sellerCommission || 0}
                                                onChange={(e) => handlePlanCommissionChange(plan._id || plan.id, e.target.value)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="settings-actions">
                    <button className="btn btn-primary" onClick={handleSavePlans} disabled={loading}>
                        💾 Save Plan Commissions
                    </button>
                </div>
            </div>


            {/* Parent Commission Section */}
            <div className="settings-card">
                <div className="settings-info">
                    <h3>👥 Parent Level Commissions</h3>
                    <p>Configure upline commissions for up to 5 levels above the seller.</p>
                </div>

                {error && <div className="error-banner">{error}</div>}

                <div className="settings-form">
                    {rows.map((row, idx) => (
                        <div className="setting-item" key={row.id || row.level} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr', gap: '20px', alignItems: 'center' }}>
                            <div className="setting-label">
                                <h4>{`Level ${row.level}`}</h4>
                                <p>Generation {row.level}</p>
                            </div>

                            <select
                                value={row.commType}
                                onChange={(e) => handleTypeChange(idx, e.target.value)}
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                            </select>

                            <div className="setting-input">
                                <input
                                    type="number"
                                    value={row.commType === 'percentage' ? row.percentage : row.amount}
                                    onChange={(e) => handleValueChange(idx, e.target.value)}
                                    step={row.commType === 'percentage' ? "0.1" : "1"}
                                />
                                <span>{row.commType === 'percentage' ? '%' : '₹'}</span>
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
                        {saved ? '✅ Saved!' : '💾 Save Parent Settings'}
                    </button>
                </div>

                <div className="settings-preview">
                    <h4>Current Rates:</h4>
                    <div className="preview-grid">
                        {rows.map((row) => (
                            <div className="preview-item" key={`preview-${row.level}`}>
                                <span>Level {row.level}:</span>
                                <strong>
                                    {row.commType === 'fixed'
                                        ? `₹${row.amount}`
                                        : `${row.percentage}%`
                                    }
                                </strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommissionSettings;
