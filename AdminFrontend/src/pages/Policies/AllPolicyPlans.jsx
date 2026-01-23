import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { policyPlanAPI } from '../../services/api.service';
import toast from 'react-hot-toast';
import './AllPolicyPlans.css';

const AllPolicyPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const response = await policyPlanAPI.getAll();
            if (response.success) {
                setPlans(response.data.plans);
            } else {
                setError(response.message);
            }
        } catch (err) {
            console.error('Error loading plans:', err);
            setError('Failed to load plans');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (planId, planName) => {
        if (window.confirm(`Are you sure you want to delete: ${planName}?`)) {
            try {
                const response = await policyPlanAPI.delete(planId);
                if (response.success) {
                    toast.success('Plan deleted successfully');
                    loadPlans();
                } else {
                    toast.error('Failed to delete plan: ' + response.message);
                }
            } catch (err) {
                console.error('Error deleting plan:', err);
                toast.error('An error occurred while deleting the plan');
            }
        }
    };

    if (loading) return <div className="loading">Loading plans...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="all-policy-plans-page">
            <div className="page-header">
                <div>
                    <h1>📋 Policy Plans</h1>
                    <p>Manage insurance policy plans</p>
                </div>
                <Link to="/policy-plans/add" className="btn btn-primary">
                    ➕ Add New Plan
                </Link>
            </div>

            {plans.length === 0 ? (
                <div className="no-data">
                    <p>No policy plans found. Create one to get started.</p>
                </div>
            ) : (
                <div className="plans-grid">
                    {plans.map(plan => (
                        <div key={plan._id || plan.id} className="plan-card">
                            <div className="plan-header">
                                <h3>{plan.name}</h3>
                                <span className={`status-badge ${plan.isActive ? 'active' : 'inactive'}`}>
                                    {plan.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="plan-pricing">
                                <div className="premium">
                                    <span className="label">Premium</span>
                                    <span className="amount">₹{parseFloat(plan.premium?.$numberDecimal || plan.premium || 0).toLocaleString()}</span>
                                </div>
                                <div className="coverage">
                                    <span className="label">Coverage</span>
                                    <span className="amount">₹{parseFloat(plan.coverageAmount?.$numberDecimal || plan.coverageAmount || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="plan-details">
                                <div className="detail-item">
                                    <span className="icon">⏱️</span>
                                    <span>{plan.duration}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="icon">🐮</span>
                                    <span style={{ textTransform: 'capitalize' }}>{plan.cattleType}</span>
                                </div>
                            </div>

                            <div className="plan-features">
                                <h4>Features:</h4>
                                <ul>
                                    {Array.isArray(plan.features) && plan.features.map((feature, index) => (
                                        <li key={index}>✓ {feature}</li>
                                    ))}
                                    {(!plan.features || plan.features.length === 0) && (
                                        <li>No specific features listed</li>
                                    )}
                                </ul>
                            </div>

                            <div className="plan-actions">
                                <Link
                                    to={`/policy-plans/edit/${plan._id}`}
                                    className="btn btn-secondary"
                                >
                                    ✏️ Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(plan._id, plan.name)}
                                    className="btn btn-danger"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllPolicyPlans;
