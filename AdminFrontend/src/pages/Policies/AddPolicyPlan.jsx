import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { policyPlanAPI } from '../../services/api.service';
import toast from 'react-hot-toast';
import './AddPolicyPlan.css';

const AddPolicyPlan = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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
        sellerCommission: '',
        isActive: true,
        displayOrder: 0
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // ... feature handlers stay the same ...

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
        setLoading(true);

        try {
            const planData = {
                ...formData,
                features: formData.features.filter(f => f.trim() !== ''),
                premium: parseFloat(formData.premium),
                coverageAmount: parseFloat(formData.coverageAmount),
                minAge: parseInt(formData.minAge),
                maxAge: parseInt(formData.maxAge),
                displayOrder: parseInt(formData.displayOrder),
                sellerCommission: parseFloat(formData.sellerCommission) || 0
            };

            const response = await policyPlanAPI.create(planData);

            if (response.success) {
                toast.success('Policy plan created successfully!');
                navigate('/policy-plans');
            } else {
                toast.error('Error creating plan: ' + response.message);
            }
        } catch (err) {
            console.error('Error:', err);
            toast.error('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-policy-plan-page">
            <div className="page-header">
                <h1>➕ Add Policy Plan</h1>
                <p>Create a new insurance policy plan for the portal</p>
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
                    <h3>Seller Commission</h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>
                        Define the fixed commission amount (₹) an agent receives for selling this policy plan.
                    </p>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label>Commission Amount (₹)</label>
                            <input
                                type="number"
                                name="sellerCommission"
                                value={formData.sellerCommission}
                                onChange={handleChange}
                                placeholder="e.g. 200"
                            />
                        </div>
                    </div>
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
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Policy Plan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddPolicyPlan;
