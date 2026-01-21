import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../constants/policyPlans';
import toast from 'react-hot-toast';
import './RenewalForm.css';

const RenewalForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAgent } = useAuth();
    const { policy } = location.state || {};

    const [formData, setFormData] = useState({
        renewalDuration: '1',
        paymentMethod: 'card',
        agreeTerms: false
    });

    useEffect(() => {
        if (isAgent) {
            navigate('/agent/dashboard');
            return;
        }
        if (!policy) {
            navigate('/renewals');
        }
    }, [policy, navigate]);

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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.agreeTerms) {
            toast.error('Please agree to terms and conditions');
            return;
        }

        const renewalData = {
            id: Date.now(),
            policyId: policy.id,
            oldPolicyNumber: policy.policyNumber,
            newPolicyNumber: `POL-${Date.now()}`,
            duration: formData.renewalDuration,
            premium: calculateRenewalPremium(),
            status: 'PENDING',
            submittedAt: new Date().toISOString()
        };

        // Navigate to payment
        navigate('/payment', {
            state: {
                policyData: renewalData,
                premium: calculateRenewalPremium(),
                isRenewal: true
            }
        });
    };

    if (!policy) return null;

    const premium = calculateRenewalPremium();

    return (
        <div className="renewal-form-page">
            <div className="container">
                <div className="form-container">
                    <div className="form-header">
                        <h1>Renew Your Policy</h1>
                        <p>Continue your protection with Pashudhan Suraksha</p>
                    </div>

                    {/* Current Policy Info */}
                    <div className="current-policy-card">
                        <h3>Current Policy Details</h3>
                        <div className="policy-info-grid">
                            <div className="info-item">
                                <span>Policy Number:</span>
                                <strong>{policy.policyNumber}</strong>
                            </div>
                            <div className="info-item">
                                <span>Cattle Tag ID:</span>
                                <strong>{policy.tagId || policy.petName}</strong>
                            </div>
                            <div className="info-item">
                                <span>Coverage:</span>
                                <strong>₹{policy.coverageAmount?.toLocaleString()}</strong>
                            </div>
                            <div className="info-item">
                                <span>Expiry Date:</span>
                                <strong className="text-error">{policy.endDate}</strong>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="renewal-form">
                        {/* Renewal Duration */}
                        <div className="form-section">
                            <h2 className="section-title">Select Renewal Duration</h2>

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
                                        <h3>1 Year</h3>
                                        <p className="duration-price">₹2,460</p>
                                        <p className="duration-note">₹2,460/year</p>
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
                                        <h3>2 Years</h3>
                                        <p className="duration-price">₹4,620</p>
                                        <p className="duration-note">₹2,310/year • Save ₹300</p>
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
                                        <h3>3 Years</h3>
                                        <p className="duration-price">₹6,590</p>
                                        <p className="duration-note">₹2,197/year • Save ₹789</p>
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
                                    I agree to the <a href="/terms" target="_blank">Terms & Conditions</a> and confirm that the cattle is in good health
                                </label>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="payment-summary">
                            <h3>Payment Summary</h3>
                            <div className="summary-row">
                                <span>Renewal Duration:</span>
                                <span>{formData.renewalDuration} Year{formData.renewalDuration > 1 ? 's' : ''}</span>
                            </div>
                            <div className="summary-row">
                                <span>Coverage Amount:</span>
                                <span>₹{policy.coverageAmount?.toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Premium:</span>
                                <span>{formatCurrency(premium)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total Payable:</span>
                                <span>{formatCurrency(premium)}</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="btn btn-primary btn-block btn-large">
                            Proceed to Payment - {formatCurrency(premium)}
                        </button>

                        <div className="secure-badge">
                            🔒 100% Secure Payment via Razorpay
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RenewalForm;
