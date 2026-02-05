import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { policyAPI } from '../services/api.service';
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
        renewalDuration: '1',
        paymentMethod: 'card',
        agreeTerms: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

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

        fetchFullPolicyDetails();
    }, [isAgent, navigate, initialPolicy]);

    const calculateRenewalPremium = () => {
        const basePremium = policy?.premium || 2460;
        const duration = parseInt(formData.renewalDuration);

        const premiumMap = {
            1: 2460,
            2: 4620,
            3: 6590
        };

        return premiumMap[duration] || basePremium;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.agreeTerms) {
            toast.error('Please agree to terms and conditions');
            return;
        }

        try {
            setIsSubmitting(true);
            const durationYears = parseInt(formData.renewalDuration);

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
                coverageAmount: policy.coverageAmount,
                premium: calculateRenewalPremium(),
                duration: `${durationYears} Year${durationYears > 1 ? 's' : ''}`,
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
                planId: policy.planId
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

    const premium = calculateRenewalPremium();

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
                        {/* Renewal Duration */}
                        <div className="form-section">
                            <h2 className="section-title">Select Renewal Duration / રિન્યુઅલ સમયગાળો પસંદ કરો</h2>

                            <div className="duration-options">
                                <label className={`duration-card ${formData.renewalDuration === '1' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="renewalDuration"
                                        value="1"
                                        checked={formData.renewalDuration === '1'}
                                        onChange={(e) => setFormData({ ...formData, renewalDuration: e.target.value })}
                                    />
                                    <div className="duration-content">
                                        <h3>1 Year / 1 વર્ષ</h3>
                                        <p className="duration-price">₹2,460</p>
                                        <p className="duration-note">₹2,460/year / ₹2,460/વર્ષ</p>
                                    </div>
                                </label>

                                <label className={`duration-card ${formData.renewalDuration === '2' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="renewalDuration"
                                        value="2"
                                        checked={formData.renewalDuration === '2'}
                                        onChange={(e) => setFormData({ ...formData, renewalDuration: e.target.value })}
                                    />
                                    <div className="duration-content">
                                        <div className="best-value-badge">BEST VALUE</div>
                                        <h3>2 Years / 2 વર્ષ</h3>
                                        <p className="duration-price">₹4,620</p>
                                        <p className="duration-note">₹2,310/year • Save ₹300 / ₹2,310/વર્ષ • ₹300 બચાવો</p>
                                    </div>
                                </label>

                                <label className={`duration-card ${formData.renewalDuration === '3' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="renewalDuration"
                                        value="3"
                                        checked={formData.renewalDuration === '3'}
                                        onChange={(e) => setFormData({ ...formData, renewalDuration: e.target.value })}
                                    />
                                    <div className="duration-content">
                                        <div className="max-savings-badge">MAX SAVINGS</div>
                                        <h3>3 Years / 3 વર્ષ</h3>
                                        <p className="duration-price">₹6,590</p>
                                        <p className="duration-note">₹2,197/year • Save ₹789 / ₹2,197/વર્ષ • ₹789 બચાવો</p>
                                    </div>
                                </label>
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
                                <span>Renewal Duration / રિન્યુઅલ સમયગાળો:</span>
                                <span>{formData.renewalDuration} Year{formData.renewalDuration > 1 ? 's' : ''}</span>
                            </div>
                            <div className="summary-row">
                                <span>Coverage Amount / કવરેજ રકમ:</span>
                                <span>₹{policy?.coverageAmount?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="summary-row">
                                <span>Premium / પ્રીમિયમ:</span>
                                <span>{formatCurrency(premium)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total Payable / કુલ ચૂકવવાપાત્ર:</span>
                                <span>{formatCurrency(premium)}</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn btn-primary btn-block btn-large"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing...' : `Proceed to Payment / ચુકવણી માટે આગળ વધો - ${formatCurrency(premium)}`}
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
