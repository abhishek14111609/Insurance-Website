import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { policyAPI, policyPlanAPI } from '../services/api.service';
import { formatCurrency } from '../constants/policyPlans';
import toast from 'react-hot-toast';
import TermsModal from '../components/TermsModal';
import './RenewalForm.css';

const RenewalForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAgent } = useAuth();
    const { policy: initialPolicy } = location.state || {}; // Rename to initialPolicy

    const [policy, setPolicy] = useState(initialPolicy); // State for the full policy object
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        paymentMethod: 'card',
        paymentMethod: 'card',
        agreeTerms: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);

    // Modal state
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: 'terms'
    });

    useEffect(() => {
        if (isAgent) {
            navigate('/agent/dashboard');
            return;
        }
        if (!initialPolicy) {
            navigate('/renewals');
            return;
        }

        // Fetch full policy details to ensure we have photos and latest data
        const fetchFullPolicyDetails = async () => {
            try {
                setLoading(true);
                const response = await policyAPI.getById(initialPolicy.id);
                if (response.success && response.data.policy) {
                    setPolicy(response.data.policy);
                } else {
                    toast.error('Failed to load latest policy details. Using cached data.');
                }
            } catch (error) {
                console.error('Error fetching full policy details:', error);
                // Fallback to initialPolicy is already set in state
            } finally {
                setLoading(false);
            }
        };

        const fetchPlans = async () => {
            try {
                const response = await policyPlanAPI.getAll();
                if (response.success) {
                    const activePlans = response.data.plans.filter(p => p.isActive);
                    setPlans(activePlans);
                    if (activePlans.length > 0) {
                        setSelectedPlan(activePlans[0]);
                    }
                }
            } catch (err) {
                console.error('Error fetching plans:', err);
            }
        };

        fetchFullPolicyDetails();
        fetchPlans();
    }, [isAgent, navigate, initialPolicy]);



    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.agreeTerms) {
            toast.error('Please agree to terms and conditions');
            return;
        }

        if (!selectedPlan) {
            toast.error('Please select a renewal plan');
            return;
        }

        try {
            setIsSubmitting(true);

            let durationYears = 1;
            const yearsMatch = String(selectedPlan.duration).match(/\d+/);
            if (yearsMatch) {
                durationYears = parseInt(yearsMatch[0]);
            }

            // Calculate new dates
            const currentEndDate = new Date(policy.endDate);
            const newStartDate = new Date(currentEndDate);
            newStartDate.setDate(newStartDate.getDate() + 1);

            const newEndDate = new Date(newStartDate);
            newEndDate.setFullYear(newEndDate.getFullYear() + durationYears);

            // Construct payload for new policy
            const payload = {
                // Cattle Details (copied from old policy)
                cattleType: policy.cattleType,
                tagId: policy.tagId,
                age: policy.age + durationYears, // Aging the cattle
                breed: policy.breed,
                gender: policy.gender,
                milkYield: policy.milkYield,
                healthStatus: 'healthy', // User confirmed health via checkbox

                // New Policy Details
                coverageAmount: selectedPlan.coverageAmount,
                premium: selectedPlan.premium,
                duration: selectedPlan.duration,
                startDate: newStartDate.toISOString(),
                endDate: newEndDate.toISOString(),

                // Owner Details
                ownerName: policy.ownerName,
                ownerEmail: policy.ownerEmail,
                ownerPhone: policy.ownerPhone,
                ownerAddress: policy.ownerAddress,
                ownerCity: policy.ownerCity,
                ownerState: policy.ownerState,
                ownerPincode: policy.ownerPincode,

                // Agent Info
                agentCode: policy.agentCode,

                // Photos (MUST pass existing photos if we want to reuse them)
                // If API returns photos object, reuse it. Check structure.
                photos: policy.photos || {},
                planId: selectedPlan.id || selectedPlan._id,
                previousPolicyId: policy.id || policy._id
            };

            // Call API to create the REAL policy in backend
            const response = await policyAPI.create(payload);

            if (response.success && response.data.policy) {
                // Success! Now navigate to payment with the REAL policy ID
                toast.success('Renewal policy created! Proceeding to payment...');
                navigate('/payment', {
                    state: {
                        policyId: response.data.policy.id
                    }
                });
            } else {
                throw new Error(response.message || 'Failed to create renewal policy');
            }

        } catch (error) {
            console.error('Renewal Error:', error);
            toast.error(error.message || 'Failed to process renewal. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="renewal-form-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading policy details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!policy) return null;

    return (
        <div className="renewal-form-page">
            <div className="container">
                <div className="form-container">
                    <div className="form-header">
                        <h1>Renew Your Policy / તમારી પોલિસી રિન્યુ કરો</h1>
                        <p>Continue your protection with Pashudhan Suraksha / પશુધન સુરક્ષા સાથે તમારું રક્ષણ ચાલુ રાખો</p>
                    </div>

                    {/* Current Policy Info */}
                    <div className="current-policy-card">
                        <h3>Current Policy Details / વર્તમાન પોલિસી વિગતો</h3>
                        <div className="policy-info-grid">
                            <div className="info-item">
                                <span>Policy Number / પોલિસી નંબર:</span>
                                <strong>{policy.policyNumber}</strong>
                            </div>
                            <div className="info-item">
                                <span>Cattle Tag ID / પશુ ટેગ આઈડી:</span>
                                <strong>{policy.tagId || policy.petName}</strong>
                            </div>
                            <div className="info-item">
                                <span>Coverage / કવરેજ:</span>
                                <strong>₹{policy.coverageAmount?.toLocaleString()}</strong>
                            </div>
                            <div className="info-item">
                                <span>Expiry Date / સમાપ્તિ તારીખ:</span>
                                <strong className="text-error">{new Date(policy.endDate).toLocaleDateString()}</strong>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="renewal-form">
                        {/* Renewal Plan Selection */}
                        <div className="form-section">
                            <h2 className="section-title">Select Renewal Plan / રિન્યુઅલ પ્લાન પસંદ કરો</h2>

                            <div className="duration-options">
                                {plans.map((plan, index) => {
                                    const isSelected = selectedPlan && (
                                        (plan.id && selectedPlan.id === plan.id) ||
                                        (plan._id && selectedPlan._id === plan._id)
                                    );
                                    const badgeText = index === 1 ? 'BEST VALUE' : (index === 2 ? 'MAX SAVINGS' : null);

                                    return (
                                        <label key={plan.id || plan._id || index} className={`duration-card ${isSelected ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="renewalPlan"
                                                value={plan.id || plan._id}
                                                checked={isSelected}
                                                onChange={() => setSelectedPlan(plan)}
                                            />
                                            <div className="duration-content">
                                                {badgeText && <div className={badgeText === 'BEST VALUE' ? 'best-value-badge' : 'max-savings-badge'}>{badgeText}</div>}
                                                <h3>{plan.name}</h3>
                                                <p className="duration-price">{formatCurrency(plan.premium)}</p>
                                                <p className="duration-note">Coverage: {formatCurrency(plan.coverageAmount)}</p>
                                                <p className="duration-note">Duration: {plan.duration}</p>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="form-section">
                            <div className="checkbox-group">
                                <input
                                    type="checkbox"
                                    id="agreeTerms"
                                    checked={formData.agreeTerms}
                                    onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                                    required
                                />
                                <label htmlFor="agreeTerms">
                                    I agree to the <button type="button" className="link-button" onClick={() => setModalState({ isOpen: true, type: 'terms' })}>Terms & Conditions</button> and confirm that the cattle is in good health / હું નિયમો અને શરતો સાથે સંમત છું અને પુષ્ટિ કરું છું કે પશુની તબિયત સારી છે
                                </label>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="payment-summary">
                            <h3>Payment Summary / ચુકવણી સારાંશ</h3>
                            <div className="summary-row">
                                <span>Renewal Plan / રિન્યુઅલ પ્લાન:</span>
                                <span>{selectedPlan?.name || '-'}</span>
                            </div>
                            <div className="summary-row">
                                <span>Renewal Duration / રિન્યુઅલ સમયગાળો:</span>
                                <span>{selectedPlan?.duration || '-'}</span>
                            </div>
                            <div className="summary-row">
                                <span>Coverage Amount / કવરેજ રકમ:</span>
                                <span>{formatCurrency(selectedPlan?.coverageAmount || 0)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Premium / પ્રીમિયમ:</span>
                                <span>{formatCurrency(selectedPlan?.premium || 0)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total Payable / કુલ ચૂકવવાપાત્ર:</span>
                                <span>{formatCurrency(selectedPlan?.premium || 0)}</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn btn-primary btn-block btn-large"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing...' : `Proceed to Payment / ચુકવણી માટે આગળ વધો - ${formatCurrency(selectedPlan?.premium || 0)}`}
                        </button>

                        <div className="secure-badge">
                            🔒 100% Secure Payment via Razorpay
                        </div>
                    </form>
                </div>

                {/* Terms Modal */}
                <TermsModal
                    isOpen={modalState.isOpen}
                    onClose={() => setModalState({ ...modalState, isOpen: false })}
                    type={modalState.type}
                />
            </div>
        </div>
    );
};

export default RenewalForm;
