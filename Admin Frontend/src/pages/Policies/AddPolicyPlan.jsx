import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPolicyPlan } from '../../utils/policyUtils';
import './AddPolicyPlan.css';

const AddPolicyPlan = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        duration: '',
        durationYears: 1,
        premium: '',
        coverage: '',
        features: [''],
        status: 'active'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
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

    const handleSubmit = (e) => {
        e.preventDefault();

        const planData = {
            ...formData,
            features: formData.features.filter(f => f.trim() !== '')
        };

        const result = addPolicyPlan(planData);

        if (result.success) {
            alert('Policy plan created successfully!');
            navigate('/policy-plans');
        } else {
            alert('Error creating plan');
        }
    };

    return (
        <div className="add-policy-plan-page">
            <div className="page-header">
                <h1>➕ Add Policy Plan</h1>
                <p>Create a new insurance policy plan</p>
            </div>

            <form className="plan-form" onSubmit={handleSubmit}>
                <div className="form-card">
                    <h3>Plan Details</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Plan Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., 1 Year Plan"
                                required
                            />
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
                            <label>Duration (Years) *</label>
                            <input
                                type="number"
                                name="durationYears"
                                value={formData.durationYears}
                                onChange={handleChange}
                                min="1"
                                max="10"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-card">
                    <h3>Pricing</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Premium (₹) *</label>
                            <input
                                type="number"
                                name="premium"
                                value={formData.premium}
                                onChange={handleChange}
                                placeholder="300"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Coverage Amount (₹) *</label>
                            <input
                                type="number"
                                name="coverage"
                                value={formData.coverage}
                                onChange={handleChange}
                                placeholder="50000"
                                min="0"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="form-card">
                    <h3>Features</h3>

                    {formData.features.map((feature, index) => (
                        <div key={index} className="feature-row">
                            <input
                                type="text"
                                value={feature}
                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                placeholder="Enter feature"
                            />
                            {formData.features.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeFeature(index)}
                                    className="btn-remove"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addFeature}
                        className="btn btn-secondary"
                    >
                        ➕ Add Feature
                    </button>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/policy-plans')}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        Create Plan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddPolicyPlan;
