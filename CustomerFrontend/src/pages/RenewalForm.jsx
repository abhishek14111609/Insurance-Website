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
                                <strong className="text-error">{policy.endDate}</strong>
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
                                    I agree to the <a href="/terms" target="_blank">Terms & Conditions</a> and confirm that the cattle is in good health / હું નિયમો અને શરતો સાથે સંમત છું અને પુષ્ટિ કરું છું કે પશુની તબિયત સારી છે
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
                                <span>₹{policy.coverageAmount?.toLocaleString()}</span>
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
                        <button type="submit" className="btn btn-primary btn-block btn-large">
                            Proceed to Payment / ચુકવણી માટે આગળ વધો - {formatCurrency(premium)}
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
