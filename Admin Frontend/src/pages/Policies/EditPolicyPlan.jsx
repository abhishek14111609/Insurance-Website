import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { policyPlanAPI } from '../../services/api.service';
import toast from 'react-hot-toast';
import './AddPolicyPlan.css'; // Reuse add styles

// Helper function to convert Decimal128 or other objects to string
const toString = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object') {
        // Handle mongoose Decimal128 and other objects
        if (value.toString && value.toString !== '[object Object]') {
            return value.toString();
        }
        // Handle objects with value property (like Decimal128)
        if (value.value !== undefined) return value.value.toString();
        return '';
    }
    return '';
};

const EditPolicyPlan = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        cattleType: 'both',
        minAge: 1,
        maxAge: 15,
        premium: '',
        coverageAmount: '',
        duration: '1 Year',
        features: [''],
        isActive: true,
        displayOrder: 0
    });

    useEffect(() => {
        if (!id) {
            toast.error('Invalid plan ID');
            navigate('/policy-plans');
            return;
        }
        loadPlan();
    }, [id, navigate]);

    const loadPlan = async () => {
        try {
            setLoading(true);
            const response = await policyPlanAPI.getById(id);
            if (response.success) {
                const plan = response.data.plan;
                setFormData({
                    name: plan.name || '',
                    description: plan.description || '',
                    cattleType: plan.cattleType || 'both',
                    minAge: plan.minAge || 1,
                    maxAge: plan.maxAge || 15,
                    premium: parseFloat(plan.premium?.$numberDecimal || plan.premium || 0),
                    coverageAmount: parseFloat(plan.coverageAmount?.$numberDecimal || plan.coverageAmount || 0),
                    duration: plan.duration || '1 Year',
                    features: Array.isArray(plan.features) ? plan.features : [''],
                    isActive: plan.isActive !== undefined ? plan.isActive : true,
                    displayOrder: plan.displayOrder || 0
                });
            }
        } catch (err) {
            console.error('Error loading plan:', err);
            toast.error('Failed to load plan details');
            navigate('/policy-plans');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData({ ...formData, features: newFeatures });
    };

    const addFeature = () => {
        setFormData({
            ...formData,
            features: [...formData.features, '']
        });
    };

    const removeFeature = (index) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: newFeatures });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const planData = {
                ...formData,
                features: formData.features.filter(f => f.trim() !== ''),
                premium: parseFloat(formData.premium),
                coverageAmount: parseFloat(formData.coverageAmount),
                minAge: parseInt(formData.minAge),
                maxAge: parseInt(formData.maxAge),
                displayOrder: parseInt(formData.displayOrder)
            };

            const response = await policyPlanAPI.update(id, planData);

            if (response.success) {
                toast.success('Policy plan updated successfully!');
                navigate('/policy-plans');
            } else {
                toast.error('Error updating plan: ' + response.message);
            }
        } catch (err) {
            console.error('Error:', err);
            toast.error('Failed to connect to server');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading">Loading plan details...</div>;

    return (
        <div className="add-policy-plan-page">
            <div className="page-header">
                <h1>✏️ Edit Policy Plan</h1>
                <p>Modify existing insurance policy details</p>
            </div>

            <form className="plan-form" onSubmit={handleSubmit}>
                <div className="form-card">
                    <h3>Basic Information</h3>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label>Plan Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Premium Cattle Guard"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe this plan..."
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Cattle Type *</label>
                            <select name="cattleType" value={formData.cattleType} onChange={handleChange}>
                                <option value="cow">Cow Only 🐄</option>
                                <option value="buffalo">Buffalo Only 🐃</option>
                                <option value="both">Both 🐮</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Duration *</label>
                            <input
                                type="text"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                placeholder="e.g., 1 Year"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Min Age (Years)</label>
                            <input type="number" name="minAge" value={formData.minAge} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Max Age (Years)</label>
                            <input type="number" name="maxAge" value={formData.maxAge} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="form-card">
                    <h3>Pricing & Coverage</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Premium (₹) *</label>
                            <input
                                type="number"
                                name="premium"
                                value={formData.premium}
                                onChange={handleChange}
                                placeholder="300"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Coverage Amount (₹) *</label>
                            <input
                                type="number"
                                name="coverageAmount"
                                value={formData.coverageAmount}
                                onChange={handleChange}
                                placeholder="50000"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="form-card">
                    <h3>Features</h3>
                    {formData.features.map((feature, index) => (
                        <div key={index} className="feature-row" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input
                                type="text"
                                value={feature}
                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                placeholder="e.g., Free Veterinary Checkup"
                                style={{ flex: 1 }}
                            />
                            <button type="button" onClick={() => removeFeature(index)} className="btn-remove" style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', padding: '0 10px', cursor: 'pointer' }}>✕</button>
                        </div>
                    ))}
                    <button type="button" onClick={addFeature} className="btn btn-secondary">➕ Add Feature</button>
                </div>

                <div className="form-card">
                    <h3>Settings</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Display Order</label>
                            <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleChange} />
                        </div>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '30px' }}>
                            <input
                                type="checkbox"
                                name="isActive"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                style={{ width: '20px', height: '20px' }}
                            />
                            <label htmlFor="isActive" style={{ marginBottom: 0 }}>Active and Visible</label>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/policy-plans')} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Update Policy Plan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPolicyPlan;
