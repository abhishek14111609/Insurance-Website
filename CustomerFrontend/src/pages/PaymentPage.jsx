import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { policyAPI, paymentAPI } from '../services/api.service';
import toast from 'react-hot-toast';
import './PaymentPage.css';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAgent } = useAuth();

    useEffect(() => {
        if (isAgent) {
            navigate('/agent/dashboard');
        }
    }, [isAgent, navigate]);

    const { policyId } = location.state || {};

    // Fallback if full data passed (legacy support or direct navigation)
    const { policyData: initialPolicyData } = location.state || {};

    const [policy, setPolicy] = useState(initialPolicyData || null);
    const [loading, setLoading] = useState(!initialPolicyData);
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchPolicy = async () => {
            if (!policyId && !initialPolicyData) {
                navigate('/policies');
                return;
            }

            if (policyId) {
                try {
                    setLoading(true);
                    const response = await policyAPI.getById(policyId);
                    if (response.success) {
                        setPolicy(response.data.policy);
                    } else {
                        setError('Failed to load policy details');
                    }
                } catch (err) {
                    console.error('Error fetching policy:', err);
                    setError('Error loading policy details');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchPolicy();
    }, [policyId, initialPolicyData, navigate]);

    const handlePayment = async () => {
        if (!policy) return;

        setIsProcessing(true);
        setError(null);

        try {
            // 1. Create Razorpay Order
            const orderResponse = await paymentAPI.createOrder({
                policyId: policy.id,
                amount: policy.premium
            });

            if (!orderResponse.success) {
                throw new Error(orderResponse.message || 'Failed to create payment order');
            }

            const { orderId, keyId, amount: orderAmount, currency } = orderResponse.data;

            // 2. Open Razorpay Checkout
            const options = {
                key: keyId,
                amount: orderAmount,
                currency: currency,
                name: "Pashudhan Suraksha",
                description: `Premium for Policy #${policy.policyNumber || 'New'}`,
                order_id: orderId,
                prefill: {
                    name: policy.ownerName || policy.customerName,
                    email: policy.ownerEmail || policy.customerEmail,
                    contact: policy.ownerPhone
                },
                theme: {
                    color: "#2C3E50"
                },
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        const verifyResponse = await paymentAPI.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            policyId: policy.id
                        });

                        if (verifyResponse.success) {
                            navigate('/payment-success', {
                                state: {
                                    policyNumber: policy.policyNumber,
                                    premium: policy.premium,
                                    paymentId: response.razorpay_payment_id,
                                    pendingApproval: true,
                                    policyData: verifyResponse.data.policy
                                }
                            });
                        } else {
                            throw new Error('Payment verification failed');
                        }
                    } catch (err) {
                        console.error('Verification Error:', err);
                        toast.error('Payment verification failed. Please contact support.');
                        setIsProcessing(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error('Payment Failed:', response.error);
                navigate('/payment-failure', {
                    state: {
                        reason: response.error.description,
                        premium: policy.premium,
                        errorCode: response.error.code
                    }
                });
            });

            rzp.open();

        } catch (err) {
            console.error('Payment Error:', err);
            setError(err.message || 'Payment processing failed');
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="payment-page">
                <div className="payment-container" style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="spinner"></div>
                    <p>Loading policy details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-page">
                <div className="payment-container" style={{ textAlign: 'center', padding: '50px' }}>
                    <h3 style={{ color: 'red' }}>Error</h3>
                    <p>{error}</p>
                    <button className="btn btn-secondary" onClick={() => navigate('/policies')}>Back to Policies</button>
                </div>
            </div>
        );
    }

    if (!policy) return null;

    return (
        <div className="payment-page">
            <div className="payment-container">
                <div className="payment-header">
                    <h1>Complete Payment</h1>
                    <p>Secure your cattle insurance policy</p>
                </div>

                <div className="payment-summary">
                    <div className="summary-row">
                        <span>Policy Type:</span>
                        <strong>{policy.cattleType || 'Cattle'} Insurance</strong>
                    </div>
                    <div className="summary-row">
                        <span>Duration:</span>
                        <strong>{policy.duration}</strong>
                    </div>
                    <div className="summary-row">
                        <span>Coverage:</span>
                        <strong>₹{policy.coverageAmount?.toLocaleString()}</strong>
                    </div>
                    <div className="summary-total">
                        <span>Total Premium:</span>
                        <strong>₹{policy.premium?.toLocaleString()}</strong>
                    </div>
                </div>

                <div className="payment-actions">
                    <button
                        className="btn btn-primary btn-lg pay-btn"
                        onClick={handlePayment}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing...' : `Pay ₹${policy.premium?.toLocaleString()}`}
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/my-policies')}
                        disabled={isProcessing}
                    >
                        Cancel
                    </button>
                </div>

                <div className="secure-badge">
                    🔒 Secured by Razorpay
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
