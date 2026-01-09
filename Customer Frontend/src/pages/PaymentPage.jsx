import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addPolicyToCustomer } from '../utils/authUtils';
import { calculateCommissionDistribution, findAgentByCode } from '../utils/agentUtils';
import './PaymentPage.css';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { policyData, premium } = location.state || {};

    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        cardName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
    });
    const [upiId, setUpiId] = useState('');

    useEffect(() => {
        if (!policyData || !premium) {
            navigate('/animal-insurance');
        }
    }, [policyData, premium, navigate]);

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        setCardDetails({ ...cardDetails, [name]: value });
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            // 90% success rate simulation
            const isSuccess = Math.random() > 0.1;

            if (isSuccess) {
                // Generate policy number
                const policyNumber = `POL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

                // Save policy with payment details
                const completedPolicy = {
                    ...policyData,
                    policyNumber,
                    premium,
                    paymentMethod,
                    paymentStatus: 'completed',
                    paymentDate: new Date().toISOString(),
                    status: 'active'
                };

                addPolicyToCustomer(completedPolicy);

                // Calculate commission if agent code provided
                if (policyData.agentCode) {
                    const agent = findAgentByCode(policyData.agentCode);
                    if (agent) {
                        const commissions = calculateCommissionDistribution(premium, agent.id);

                        // Save commission records
                        const existingCommissions = JSON.parse(localStorage.getItem('commission_records') || '[]');
                        commissions.forEach(comm => {
                            existingCommissions.push({
                                id: Date.now() + Math.random(),
                                policyNumber,
                                ...comm,
                                status: 'pending',
                                date: new Date().toISOString()
                            });
                        });
                        localStorage.setItem('commission_records', JSON.stringify(existingCommissions));
                    }
                }

                // Navigate to success page
                navigate('/payment-success', {
                    state: {
                        policyNumber,
                        premium,
                        policyData: completedPolicy
                    }
                });
            } else {
                // Navigate to failure page
                navigate('/payment-failure', {
                    state: {
                        reason: 'Payment gateway error. Please try again.',
                        premium
                    }
                });
            }
        }, 2000);
    };

    if (!policyData) {
        return null;
    }

    return (
        <div className="payment-page">
            <div className="payment-container">
                <div className="payment-header">
                    <h1>Complete Your Payment</h1>
                    <p>Secure your cattle with just one final step</p>
                </div>

                <div className="payment-content">
                    {/* Order Summary */}
                    <div className="order-summary">
                        <h2>Order Summary</h2>
                        <div className="summary-card">
                            <div className="summary-item">
                                <span>Cattle Insurance Policy</span>
                                <span className="cattle-type">
                                    {policyData.petType === 'cow' ? '🐄 Cow' : '🐃 Buffalo'}
                                </span>
                            </div>
                            <div className="summary-item">
                                <span>Tag ID / Name</span>
                                <span>{policyData.tagId || policyData.petName}</span>
                            </div>
                            <div className="summary-item">
                                <span>Coverage Amount</span>
                                <span>₹{parseInt(policyData.coverageAmount).toLocaleString()}</span>
                            </div>
                            <div className="summary-item">
                                <span>Age</span>
                                <span>{policyData.petAge} years</span>
                            </div>
                            {policyData.agentCode && (
                                <div className="summary-item">
                                    <span>Agent Code</span>
                                    <span className="agent-code">{policyData.agentCode}</span>
                                </div>
                            )}
                            <div className="summary-divider"></div>
                            <div className="summary-item total">
                                <span>Annual Premium</span>
                                <span className="premium-amount">₹{premium.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="payment-form-section">
                        <h2>Payment Method</h2>

                        {/* Payment Method Selection */}
                        <div className="payment-methods">
                            <button
                                className={`method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('card')}
                            >
                                💳 Credit/Debit Card
                            </button>
                            <button
                                className={`method-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('upi')}
                            >
                                📱 UPI
                            </button>
                            <button
                                className={`method-btn ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('netbanking')}
                            >
                                🏦 Net Banking
                            </button>
                        </div>

                        <form onSubmit={handlePayment} className="payment-form">
                            {/* Card Payment */}
                            {paymentMethod === 'card' && (
                                <div className="card-form">
                                    <div className="form-group">
                                        <label>Card Number</label>
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={cardDetails.cardNumber}
                                            onChange={handleCardChange}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength="19"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Cardholder Name</label>
                                        <input
                                            type="text"
                                            name="cardName"
                                            value={cardDetails.cardName}
                                            onChange={handleCardChange}
                                            placeholder="Name on card"
                                            required
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Expiry Month</label>
                                            <select
                                                name="expiryMonth"
                                                value={cardDetails.expiryMonth}
                                                onChange={handleCardChange}
                                                required
                                            >
                                                <option value="">MM</option>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                                    <option key={month} value={month.toString().padStart(2, '0')}>
                                                        {month.toString().padStart(2, '0')}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Expiry Year</label>
                                            <select
                                                name="expiryYear"
                                                value={cardDetails.expiryYear}
                                                onChange={handleCardChange}
                                                required
                                            >
                                                <option value="">YYYY</option>
                                                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>CVV</label>
                                            <input
                                                type="password"
                                                name="cvv"
                                                value={cardDetails.cvv}
                                                onChange={handleCardChange}
                                                placeholder="123"
                                                maxLength="3"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* UPI Payment */}
                            {paymentMethod === 'upi' && (
                                <div className="upi-form">
                                    <div className="form-group">
                                        <label>UPI ID</label>
                                        <input
                                            type="text"
                                            value={upiId}
                                            onChange={(e) => setUpiId(e.target.value)}
                                            placeholder="yourname@upi"
                                            required
                                        />
                                    </div>
                                    <p className="upi-note">
                                        You will receive a payment request on your UPI app
                                    </p>
                                </div>
                            )}

                            {/* Net Banking */}
                            {paymentMethod === 'netbanking' && (
                                <div className="netbanking-form">
                                    <div className="form-group">
                                        <label>Select Your Bank</label>
                                        <select required>
                                            <option value="">Choose your bank</option>
                                            <option value="sbi">State Bank of India</option>
                                            <option value="hdfc">HDFC Bank</option>
                                            <option value="icici">ICICI Bank</option>
                                            <option value="axis">Axis Bank</option>
                                            <option value="pnb">Punjab National Bank</option>
                                            <option value="other">Other Banks</option>
                                        </select>
                                    </div>
                                    <p className="netbanking-note">
                                        You will be redirected to your bank's website
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary btn-block pay-btn"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="spinner"></span>
                                        Processing Payment...
                                    </>
                                ) : (
                                    <>Pay ₹{premium.toLocaleString()}</>
                                )}
                            </button>
                        </form>

                        <div className="security-note">
                            🔒 Your payment is secured with 256-bit SSL encryption
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
