import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { policyAPI, paymentAPI } from '../../services/api.service';
import toast from 'react-hot-toast';
import './AgentPayment.css';

const AgentPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Support either direct polyId or full policyData from state
    const { policyId, policyData: initialPolicyData } = location.state || {};

    const [policy, setPolicy] = useState(initialPolicyData || null);
    const [loading, setLoading] = useState(!initialPolicyData);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchPolicy = async () => {
            if (!policyId && !initialPolicyData) {
                toast.error('No policy information provided');
                navigate('/agent/sell');
                return;
            }

            if (policyId && !policy) {
                try {
                    setLoading(true);
                    const response = await policyAPI.getById(policyId);
                    if (response.success) {
                        setPolicy(response.data.policy);
                    } else {
                        toast.error('Failed to load policy details');
                    }
                } catch (err) {
                    toast.error('Error loading policy details');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchPolicy();
    }, [policyId, initialPolicyData, navigate, policy]);

    const handlePayment = async () => {
        if (!policy) return;

        setIsProcessing(true);

        try {
            // 1. Create Razorpay Order
            const orderResponse = await paymentAPI.createOrder({
                policyId: policy._id || policy.id,
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
                description: `Premium for Policy #${policy.policyNumber}`,
                order_id: orderId,
                prefill: {
                    name: policy.ownerName,
                    email: policy.ownerEmail,
                    contact: policy.ownerPhone
                },
                theme: {
                    color: "#4299e1"
                },
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        const verifyResponse = await paymentAPI.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            policyId: policy._id || policy.id
                        });

                        if (verifyResponse.success) {
                            toast.success('Payment successful!');
                            navigate('/agent/policies', {
                                state: {
                                    paymentSuccess: true,
                                    paymentId: response.razorpay_payment_id
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
                toast.error(`Payment Failed: ${response.error.description}`);
                setIsProcessing(false);
            });

            rzp.open();

        } catch (err) {
            toast.error(err.message || 'Payment processing failed');
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="agent-loading">Loading policy...</div>;
    if (!policy) return null;

    return (
        <div className="agent-payment-page">
            <div className="payment-card">
                <div className="payment-header">
                    <h2>Complete Online Payment</h2>
                    <p>Issue policy instantly by paying premium online</p>
                </div>

                <div className="summary-section">
                    <div className="summary-item">
                        <span>Policy Number</span>
                        <strong>{policy.policyNumber}</strong>
                    </div>
                    <div className="summary-item">
                        <span>Customer Name</span>
                        <strong>{policy.ownerName}</strong>
                    </div>
                    <div className="summary-item">
                        <span>Total Premium</span>
                        <strong className="premium-amount">₹{parseFloat(policy.premium).toLocaleString()}</strong>
                    </div>
                </div>

                <div className="payment-warning">
                    <span className="icon">ℹ️</span>
                    <p>You can pay using UPI, NetBanking, or Card. After successful payment, the policy will be sent to admin for final verification.</p>
                </div>

                <div className="payment-actions">
                    <button
                        className="btn btn-primary btn-block btn-large"
                        onClick={handlePayment}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing...' : `Pay ₹${parseFloat(policy.premium).toLocaleString()} Now`}
                    </button>
                    <button
                        className="btn btn-outline btn-block mt-3"
                        onClick={() => navigate('/agent/policies')}
                        disabled={isProcessing}
                    >
                        Pay Later (Offline)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgentPayment;
