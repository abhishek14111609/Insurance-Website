import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { policyAPI, paymentAPI } from '../services/api.service';
import PhotoUpload from '../components/PhotoUpload';
import AgentCodeInput from '../components/AgentCodeInput';
import { formatCurrency } from '../constants/policyPlans';
import './AnimalPolicyForm.css';

const AnimalPolicyForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, isAgent } = useAuth();

    useEffect(() => {
        if (isAgent) {
            navigate('/agent/dashboard');
        }
    }, [isAgent, navigate]);
    const { selectedPlanId, planData } = location.state || {};
    const selectedPlan = planData;

    // Redirect if no plan selected
    useEffect(() => {
        if (!selectedPlan) {
            navigate('/animal-insurance');
        }
    }, [selectedPlan, navigate]);

    const [formData, setFormData] = useState({
        // Cattle Details
        cattleType: 'cow',
        tagId: '',
        age: '',
        breed: '',
        gender: 'female',
        milkYield: '',
        healthStatus: 'healthy',

        // Owner Details (will be pre-filled)
        ownerName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',

        // Agent Code
        agentCode: '',

        // Terms
        agreeTerms: false
    });

    const [photos, setPhotos] = useState({
        front: null,
        back: null,
        left: null,
        right: null
    });

    const [photoPreviews, setPhotoPreviews] = useState({
        front: null,
        back: null,
        left: null,
        right: null
    });

    const [photoFiles, setPhotoFiles] = useState({
        front: null,
        back: null,
        left: null,
        right: null
    });

    // Login check and pre-fill from AuthContext
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/animal-policy-form', selectedPlan } });
            return;
        }

        if (user) {
            setFormData(prev => ({
                ...prev,
                ownerName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                city: user.city || '',
                state: user.state || '',
                address: user.address || '',
                pincode: user.pincode || ''
            }));
        }
    }, [user, isAuthenticated, navigate, selectedPlan]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handlePhotoChange = (side, file, preview) => {
        setPhotoFiles(prev => ({ ...prev, [side]: file }));
        setPhotoPreviews(prev => ({ ...prev, [side]: preview }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate photos
        if (!photoPreviews.front || !photoPreviews.back || !photoPreviews.left || !photoPreviews.right) {
            alert('Please upload all 4 required photos of the cattle.');
            return;
        }

        if (!formData.agreeTerms) {
            alert('Please agree to terms and conditions');
            return;
        }

        // Calculate dates
        const startDate = new Date();
        const endDate = new Date(startDate);
        // Assuming duration is something like "1 Year" or "2 Years"
        const durationValue = selectedPlan.duration || "1 Year";
        const yearsMatch = durationValue.match(/\d+/);
        const years = yearsMatch ? parseInt(yearsMatch[0]) : 1;
        endDate.setFullYear(endDate.getFullYear() + years);

        const policyPayload = {
            // Cattle Details
            cattleType: formData.cattleType,
            tagId: formData.tagId,
            age: parseInt(formData.age),
            breed: formData.breed,
            gender: formData.gender,
            milkYield: parseFloat(formData.milkYield || 0),
            healthStatus: formData.healthStatus,

            // Owner Details
            ownerName: formData.ownerName,
            ownerEmail: formData.email,
            ownerPhone: formData.phone,
            ownerAddress: formData.address,
            ownerCity: formData.city,
            ownerState: formData.state,
            ownerPincode: formData.pincode,

            // Plan details
            coverageAmount: selectedPlan.coverageAmount,
            premium: selectedPlan.premium,
            duration: durationValue,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],

            // Photos
            photos: photoPreviews,

            // Agent Code
            agentCode: formData.agentCode,
            planId: selectedPlan.id
        };

        try {
            // 1. Create Policy in Backend
            const policyResponse = await policyAPI.create(policyPayload);

            if (!policyResponse.success) {
                throw new Error(policyResponse.message || 'Failed to create policy');
            }

            const policy = policyResponse.data.policy;
            console.log('Policy created:', policy);

            // 2. Create Razorpay Order
            const safeAmount = parseFloat(selectedPlan.premium);
            if (isNaN(safeAmount)) {
                throw new Error('Invalid plan premium amount. Please refresh the page and try again.');
            }

            const orderResponse = await paymentAPI.createOrder({
                policyId: policy._id,
                amount: safeAmount
            });

            if (!orderResponse.success) {
                throw new Error(orderResponse.message || 'Failed to create payment order');
            }

            const { orderId, keyId, amount: orderAmount, currency } = orderResponse.data;

            // 3. Open Razorpay Checkout
            const options = {
                key: keyId,
                amount: orderAmount,
                currency: currency,
                name: "SecureLife Insurance",
                description: `Premium for Policy #${policy.policyNumber}`,
                order_id: orderId,
                prefill: {
                    name: formData.ownerName,
                    email: formData.email,
                    contact: formData.phone
                },
                theme: {
                    color: "#2C3E50"
                },
                handler: async function (response) {
                    try {
                        // 4. Verify Payment in Backend
                        const verifyResponse = await paymentAPI.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            policyId: policy._id
                        });

                        if (verifyResponse.success) {
                            // 5. Success - Navigate
                            navigate('/payment-success', {
                                state: {
                                    policyNumber: policy.policyNumber,
                                    premium: selectedPlan.premium,
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
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                modal: {
                    ondismiss: function () {
                        alert('Payment cancelled by user');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error('Payment Failed:', response.error);
                navigate('/payment-failure', {
                    state: {
                        reason: response.error.description,
                        premium: selectedPlan.premium,
                        errorCode: response.error.code
                    }
                });
            });

            rzp.open();

        } catch (error) {
            console.error('Submission Error:', error);
            alert(error.message || 'An error occurred while processing your request.');
        }
    };

    if (!user || !selectedPlan) return <div className="loading">Loading...</div>;

    return (
        <div className="animal-policy-form">
            <div className="form-container">
                <div className="form-header">
                    <h1>Cattle Insurance Application</h1>
                    <p>Complete the form to secure your livestock</p>

                    {/* Selected Plan Summary */}
                    <div className="selected-plan-summary">
                        <div className="plan-info">
                            <span className="plan-label">Selected Plan:</span>
                            <span className="plan-name">{selectedPlan.name}</span>
                        </div>
                        <div className="plan-details">
                            <div>Coverage: <strong>{formatCurrency(selectedPlan.coverageAmount)}</strong></div>
                            <div>Premium: <strong>{formatCurrency(selectedPlan.premium)}</strong></div>
                            <div style={{ fontSize: '0.85rem', marginTop: '5px', opacity: 0.8 }}>Duration: {selectedPlan.duration}</div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="policy-form">
                    {/* Cattle Details */}
                    <div className="form-section">
                        <h2 className="section-title">🐄 Cattle Details</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Cattle Type *</label>
                                <select name="cattleType" value={formData.cattleType} onChange={handleInputChange} required>
                                    <option value="cow">🐄 Cow</option>
                                    <option value="buffalo">🐃 Buffalo</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tag ID / Name *</label>
                                <input
                                    type="text"
                                    name="tagId"
                                    value={formData.tagId}
                                    onChange={handleInputChange}
                                    placeholder="Enter Ear Tag Number"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Age (Years) *</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="15"
                                    placeholder="e.g., 4"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Breed</label>
                                <input
                                    type="text"
                                    name="breed"
                                    value={formData.breed}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Gir, Jersey, Murrah"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Gender *</label>
                                <select name="gender" value={formData.gender} onChange={handleInputChange} required>
                                    <option value="female">Female</option>
                                    <option value="male">Male</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Milk Yield (Liters/Day)</label>
                                <input
                                    type="number"
                                    name="milkYield"
                                    value={formData.milkYield}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 10"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Health Status *</label>
                            <select name="healthStatus" value={formData.healthStatus} onChange={handleInputChange} required>
                                <option value="healthy">Healthy</option>
                                <option value="under_treatment">Under Treatment</option>
                            </select>
                        </div>
                    </div>

                    {/* 4 Photos Section */}
                    <div className="photo-upload-section">
                        <h3>Cattle Photos (Required)</h3>
                        <p className="section-hint">Upload clear photos from all 4 sides. Maximum 1MB per photo.</p>

                        <div className="photos-grid">
                            <PhotoUpload
                                side="front"
                                label="Front View"
                                value={photoPreviews.front}
                                onChange={handlePhotoChange}
                                required
                            />
                            <PhotoUpload
                                side="back"
                                label="Back View"
                                value={photoPreviews.back}
                                onChange={handlePhotoChange}
                                required
                            />
                            <PhotoUpload
                                side="left"
                                label="Left Side"
                                value={photoPreviews.left}
                                onChange={handlePhotoChange}
                                required
                            />
                            <PhotoUpload
                                side="right"
                                label="Right Side"
                                value={photoPreviews.right}
                                onChange={handlePhotoChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Owner Details */}
                    <div className="form-section">
                        <h2 className="section-title">👤 Owner Details</h2>
                        <div className="alert-info">
                            ℹ️ Details pre-filled from your profile
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="ownerName"
                                    value={formData.ownerName}
                                    onChange={handleInputChange}
                                    readOnly
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    readOnly
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    readOnly
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>City *</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    readOnly
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>State *</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Maharashtra"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Pincode *</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleInputChange}
                                    maxLength="6"
                                    readOnly
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Address *</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows="3"
                                readOnly
                                required
                            />
                        </div>
                    </div>

                    {/* Agent Code */}
                    <div className="form-section">
                        <h2 className="section-title">🤝 Agent Referral (Optional)</h2>
                        <AgentCodeInput
                            value={formData.agentCode}
                            onChange={(code) => setFormData({ ...formData, agentCode: code })}
                            label="Agent Code"
                        />
                    </div>

                    {/* Terms & Conditions */}
                    <div className="form-section">
                        <div className="checkbox-group">
                            <input
                                type="checkbox"
                                id="agreeTerms"
                                name="agreeTerms"
                                checked={formData.agreeTerms}
                                onChange={handleInputChange}
                                required
                            />
                            <label htmlFor="agreeTerms">
                                I agree to the <a href="/terms" target="_blank">Terms & Conditions</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
                            </label>
                        </div>
                    </div>

                    {/* Premium Summary */}
                    <div className="premium-summary">
                        <h3>Payment Summary</h3>
                        <div className="summary-row">
                            <span>Plan:</span>
                            <span>{selectedPlan.name} ({selectedPlan.duration})</span>
                        </div>
                        <div className="summary-row">
                            <span>Coverage Amount:</span>
                            <span>{formatCurrency(selectedPlan.coverageAmount)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Premium:</span>
                            <span>{formatCurrency(selectedPlan.premium)}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total Payable:</span>
                            <span>{formatCurrency(selectedPlan.premium)}</span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary btn-block btn-large">
                        Proceed to Payment - {formatCurrency(selectedPlan.premium)}
                    </button>

                    <div className="secure-badge">
                        🔒 100% Secure Payment via Razorpay
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AnimalPolicyForm;
