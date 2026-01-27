import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { policyPlanAPI } from '../../services/api.service';
import { SectionLoader } from '../../components/Loader';
import toast from 'react-hot-toast';
import './AllPolicyPlans.css';
import {
    ClipboardList,
    Plus,
    Clock,
    Shield,
    Check,
    Edit2,
    Trash2,
    IndianRupee,
    AlertCircle,
    Zap
} from 'lucide-react';

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

    if (loading) return <SectionLoader />;
    if (error) return (
        <div className="error-state">
            <AlertCircle size={48} className="text-danger" />
            <h3>Failed to load plans</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={loadPlans}>Retry</button>
        </div>
    );

    return (
        <div className="all-policy-plans-page">
            <div className="page-header-modern">
                <div className="header-info">
                    <h1>Policy Plans</h1>
                    <p>Manage insurance coverage options and pricing</p>
                </div>
                <Link to="/policy-plans/add" className="btn btn-primary">
                    <Plus size={20} /> Add New Plan
                </Link>
            </div>

            {plans.length === 0 ? (
                <div className="empty-state-modern">
                    <ClipboardList size={64} className="empty-icon" />
                    <h3>No Plans Created Yet</h3>
                    <p>Start by creating your first insurance policy plan.</p>
                    <Link to="/policy-plans/add" className="btn btn-primary mt-4">
                        Create Plan
                    </Link>
                </div>
            ) : (
                <div className="plans-grid-modern">
                    {plans.map(plan => (
                        <div key={plan._id || plan.id} className="plan-card-modern">
                            <div className="plan-header-modern">
                                <div className="header-top">
                                    <div className="icon-box">
                                        <Shield size={24} />
                                    </div>
                                    <span className={`status-badge-modern ${plan.isActive ? 'active' : 'inactive'}`}>
                                        {plan.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <h3>{plan.name}</h3>
                                <div className="plan-meta">
                                    <span className="meta-item"><Clock size={14} /> {plan.duration}</span>
                                    <span className="meta-item cap"><Zap size={14} /> {plan.cattleType}</span>
                                </div>
                            </div>

                            <div className="plan-pricing-modern">
                                <div className="price-item">
                                    <span className="label">Premium</span>
                                    <div className="amount">
                                        <IndianRupee size={16} />
                                        {parseFloat(plan.premium?.$numberDecimal || plan.premium || 0).toLocaleString()}
                                    </div>
                                </div>
                                <div className="divider"></div>
                                <div className="price-item">
                                    <span className="label">Coverage</span>
                                    <div className="amount highlight">
                                        <IndianRupee size={16} />
                                        {parseFloat(plan.coverageAmount?.$numberDecimal || plan.coverageAmount || 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div className="plan-features-modern">
                                <h4>Included Features</h4>
                                <ul>
                                    {Array.isArray(plan.features) && plan.features.length > 0 ? (
                                        plan.features.slice(0, 4).map((feature, index) => (
                                            <li key={index}><Check size={16} className="check-icon" /> {feature}</li>
                                        ))
                                    ) : (
                                        <li className="text-muted">No specific features listed</li>
                                    )}
                                    {plan.features?.length > 4 && (
                                        <li className="more-features">+{plan.features.length - 4} more features</li>
                                    )}
                                </ul>
                            </div>

                            <div className="plan-actions-modern">
                                <Link
                                    to={`/policy-plans/edit/${plan._id}`}
                                    className="btn-icon secondary"
                                    title="Edit Plan"
                                >
                                    <Edit2 size={18} />
                                </Link>
                                <button
                                    onClick={() => handleDelete(plan._id, plan.name)}
                                    className="btn-icon danger"
                                    title="Delete Plan"
                                >
                                    <Trash2 size={18} />
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
