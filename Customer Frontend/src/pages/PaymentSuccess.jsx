import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getCurrentCustomer } from '../utils/authUtils';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { policyNumber, premium, policyData } = location.state || {};

    useEffect(() => {
        if (!policyNumber) {
            navigate('/profile');
            return;
        }

        // Save policy to localStorage
        const customer = getCurrentCustomer();
        if (customer && policyData) {
            // Calculate dates
            const startDate = new Date();
            const duration = policyData.selectedPlan?.duration || '1 Year';
            const years = parseInt(duration.split(' ')[0]);
            const endDate = new Date(startDate);
            endDate.setFullYear(endDate.getFullYear() + years);

            // Create complete policy object
            const completePolicy = {
                id: policyData.id || Date.now(),
                policyNumber: policyNumber,
                customerId: customer.id,
                customerEmail: customer.email,
                customerName: customer.fullName,

                // Cattle details
                cattleType: policyData.cattleType || policyData.petType,
                tagId: policyData.tagId || policyData.petName,
                petName: policyData.tagId || policyData.petName,
                petType: policyData.cattleType || policyData.petType,
                petAge: policyData.age,
                petBreed: policyData.breed,
                age: policyData.age,
                breed: policyData.breed,
                gender: policyData.gender,
                milkYield: policyData.milkYield,
                healthStatus: policyData.healthStatus,

                // Policy details
                coverageAmount: policyData.coverageAmount || policyData.selectedPlan?.coverage,
                premium: premium || policyData.premium,
                duration: duration,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],

                // Status
                status: 'APPROVED', // Approved after payment
                paymentStatus: 'PAID',

                // Photos
                photos: policyData.photos,

                // Owner details
                ownerName: policyData.ownerName,
                email: policyData.email,
                phone: policyData.phone,
                address: policyData.address,
                city: policyData.city,
                state: policyData.state,
                pincode: policyData.pincode,

                // Agent
                agentCode: policyData.agentCode,

                // Timestamps
                createdAt: policyData.submittedAt || new Date().toISOString(),
                approvedAt: new Date().toISOString(),
                paidAt: new Date().toISOString()
            };

            // Get existing policies
            const existingPolicies = JSON.parse(localStorage.getItem('customer_policies') || '[]');

            // Find if this policy already exists (by ID, not policyNumber)
            const existingPolicyIndex = existingPolicies.findIndex(p => p.id === policyData.id);

            if (existingPolicyIndex !== -1) {
                // Update existing PENDING policy to APPROVED
                existingPolicies[existingPolicyIndex] = {
                    ...existingPolicies[existingPolicyIndex],
                    policyNumber: policyNumber,
                    status: 'APPROVED',
                    paymentStatus: 'PAID',
                    approvedAt: new Date().toISOString(),
                    paidAt: new Date().toISOString()
                };

                localStorage.setItem('customer_policies', JSON.stringify(existingPolicies));
                console.log('Policy updated to APPROVED:', existingPolicies[existingPolicyIndex]);
            } else {
                // Create new policy if not found (fallback)
                const policyExists = existingPolicies.some(p => p.policyNumber === policyNumber);

                if (!policyExists) {
                    existingPolicies.push(completePolicy);
                    localStorage.setItem('customer_policies', JSON.stringify(existingPolicies));
                    console.log('Policy created as APPROVED:', completePolicy);
                }
            }
        }
    }, [policyNumber, navigate, policyData, premium]);

    return (
        <div className="payment-success-page">
            <div className="success-container">
                <div className="success-animation">
                    <div className="checkmark-circle">
                        <div className="checkmark"></div>
                    </div>
                </div>

                <h1 className="success-title">Payment Successful!</h1>
                <p className="success-subtitle">
                    Your cattle insurance policy has been activated
                </p>

                <div className="policy-details-card">
                    <div className="policy-header">
                        <h2>Policy Details</h2>
                        <span className="status-badge active">Active</span>
                    </div>

                    <div className="policy-info">
                        <div className="info-row">
                            <span className="label">Policy Number</span>
                            <span className="value policy-number">{policyNumber}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Cattle Type</span>
                            <span className="value">
                                {policyData?.petType === 'cow' ? '🐄 Cow' : '🐃 Buffalo'}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="label">Tag ID / Name</span>
                            <span className="value">{policyData?.tagId || policyData?.petName}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Coverage Amount</span>
                            <span className="value">₹{parseInt(policyData?.coverageAmount || 0).toLocaleString()}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Annual Premium</span>
                            <span className="value premium">₹{premium?.toLocaleString()}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Policy Start Date</span>
                            <span className="value">{new Date().toLocaleDateString('en-IN')}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Policy End Date</span>
                            <span className="value">
                                {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-IN')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="next-steps">
                    <h3>What's Next?</h3>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-icon">📧</div>
                            <h4>Check Your Email</h4>
                            <p>Policy documents sent to {policyData?.email}</p>
                        </div>
                        <div className="step-card">
                            <div className="step-icon">📱</div>
                            <h4>Download Policy</h4>
                            <p>Access your policy from dashboard</p>
                        </div>
                        <div className="step-card">
                            <div className="step-icon">🏥</div>
                            <h4>Emergency Support</h4>
                            <p>24/7 helpline: 1800-123-4567</p>
                        </div>
                    </div>
                </div>

                <div className="action-buttons">
                    <Link to="/profile" state={{ activeTab: 'policies' }} className="btn btn-primary">
                        View My Policies
                    </Link>
                    <Link to="/" className="btn btn-outline">
                        Back to Home
                    </Link>
                </div>

                <div className="download-section">
                    <button className="download-btn">
                        📄 Download Policy Document
                    </button>
                    <button className="download-btn">
                        🖨️ Print Policy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
