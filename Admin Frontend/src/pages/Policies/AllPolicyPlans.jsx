import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPolicyPlans, deletePolicyPlan } from '../../utils/policyUtils';
import './AllPolicyPlans.css';

const AllPolicyPlans = () => {
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = () => {
        setPlans(getAllPolicyPlans());
    };

    const handleDelete = (planId, planName) => {
        if (window.confirm(`Are you sure you want to delete: ${planName}?`)) {
            const result = deletePolicyPlan(planId);
            if (result.success) {
                alert('Plan deleted successfully');
                loadPlans();
            }
        }
    };

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

            <div className="plans-grid">
                {plans.map(plan => (
                    <div key={plan.id} className="plan-card">
                        <div className="plan-header">
                            <h3>{plan.name}</h3>
                            <span className={`status-badge ${plan.status}`}>
                                {plan.status}
                            </span>
                        </div>

                        <div className="plan-pricing">
                            <div className="premium">
                                <span className="label">Premium</span>
                                <span className="amount">₹{plan.premium}</span>
                            </div>
                            <div className="coverage">
                                <span className="label">Coverage</span>
                                <span className="amount">₹{plan.coverage.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="plan-details">
                            <div className="detail-item">
                                <span className="icon">⏱️</span>
                                <span>{plan.duration}</span>
                            </div>
                        </div>

                        <div className="plan-features">
                            <h4>Features:</h4>
                            <ul>
                                {plan.features.map((feature, index) => (
                                    <li key={index}>✓ {feature}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="plan-actions">
                            <Link
                                to={`/policy-plans/edit/${plan.id}`}
                                className="btn btn-secondary"
                            >
                                ✏️ Edit
                            </Link>
                            <button
                                onClick={() => handleDelete(plan.id, plan.name)}
                                className="btn btn-danger"
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllPolicyPlans;
