import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentAPI, policyPlanAPI } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import PhotoUpload from '../components/PhotoUpload';
import toast from 'react-hot-toast';
import './AgentAddPolicy.css';

const AgentAddPolicy = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [searchingCustomer, setSearchingCustomer] = useState(false);
    const [plans, setPlans] = useState([]);

    // Form State
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerData, setCustomerData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });
    const [existingCustomer, setExistingCustomer] = useState(null);

    const [selectedPlan, setSelectedPlan] = useState(null);

    const [policyData, setPolicyData] = useState({
        cattleType: 'cow',
        tagId: '',
        age: '',
        breed: '',
        gender: 'female',
        milkYield: '',
        healthStatus: 'healthy',
        ownerName: '', // Will be matched with customer fullName
        ownerPhone: '',
        ownerEmail: '',
        ownerAddress: '',
        ownerCity: '',
        ownerState: '',
        ownerPincode: '',
        paymentMethod: 'Cash' // Default payment method
    });

    const [photos, setPhotos] = useState({
        front: null,
        back: null,
        left: null,
        right: null
    });

    // Fetch plans on mount
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await policyPlanAPI.getAll();
                if (response.success) {
                    setPlans(response.data.plans.filter(p => p.isActive));
                }
            } catch (err) {
                console.error('Error fetching plans:', err);
            }
        };
        fetchPlans();
    }, []);

    const handleSearchCustomer = async () => {
        if (!customerPhone || customerPhone.length < 10) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }

        try {
            setSearchingCustomer(true);
            const response = await agentAPI.searchCustomer(customerPhone);
            if (response.success && response.data.user) {
                const foundUser = response.data.user;
                setExistingCustomer(foundUser);
                setCustomerData({
                    fullName: foundUser.fullName,
                    email: foundUser.email,
                    phone: foundUser.phone,
                    address: foundUser.address,
                    city: foundUser.city,
                    state: foundUser.state,
                    pincode: foundUser.pincode
                });
                toast.success('Customer found!');
            } else {
                setExistingCustomer(null);
                setCustomerData(prev => ({ ...prev, phone: customerPhone }));
                toast.success('New customer. Please fill details.');
            }
            setStep(2); // Move to details
        } catch (err) {
            toast.error('Error searching customer');
        } finally {
            setSearchingCustomer(false);
        }
    };

    const handleCustomerSubmit = (e) => {
        e.preventDefault();
        // Comprehensive Validation for all fields required by Policy schema
        const requiredFields = {
            fullName: 'Full Name',
            email: 'Email Address',
            phone: 'Phone Number',
            address: 'Full Address',
            city: 'City',
            state: 'State',
            pincode: 'Pincode'
        };

        const missing = Object.entries(requiredFields).find(([key]) => !customerData[key]);
        if (missing) {
            toast.error(`${missing[1]} is required to issue a policy`);
            return;
        }

        // Basic email validation
        if (!/\S+@\S+\.\S+/.test(customerData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        // Sync policy owner info with customer info
        setPolicyData(prev => ({
            ...prev,
            ownerName: customerData.fullName,
            ownerPhone: customerData.phone,
            ownerEmail: customerData.email,
            ownerAddress: customerData.address,
            ownerCity: customerData.city,
            ownerState: customerData.state,
            ownerPincode: customerData.pincode
        }));

        setStep(3); // Choose Plan
    };

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        setPolicyData(prev => ({
            ...prev,
            premium: plan.premium,
            coverageAmount: plan.coverageAmount,
            duration: plan.duration,
            planId: plan.id || plan._id
        }));
        setStep(4); // Cattle details
    };

    const handlePhotoChange = (side, file, preview) => {
        // Since the agent might be using high-quality images, we just store the preview/base64 for simplicity if needed, 
        // or handled by PhotoUpload if it handles backend upload directly.
        // Assuming PhotoUpload provides a path or handle
        setPhotos(prev => ({ ...prev, [side]: preview }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!photos.front || !photos.back || !photos.left || !photos.right) {
            toast.error('All 4 photos are mandatory');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                customerId: existingCustomer?.id || existingCustomer?._id,
                customerData: existingCustomer ? null : customerData,
                policyData: {
                    ...policyData,
                    photos: photos
                }
            };

            const response = await agentAPI.addPolicy(payload);

            if (response.success) {
                if (response.data.requiresOnlinePayment) {
                    toast.success('Policy created! Redirecting to payment...');
                    navigate("/payment", {
                        state: {
                            policyId: response.data.policy._id || response.data.policy.id,
                            policyData: response.data.policy,
                            fromAgent: true
                        }
                    });
                } else {
                    toast.success('Policy added successfully!');
                    navigate("/policies");
                }
            }
        } catch (err) {
            toast.error(err.message || 'Failed to add policy');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amt) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);
    };

    return (
        <div className="agent-add-policy">
            <div className="page-header">
                <div>
                    <h1>Sell New Policy</h1>
                    <p>Issue a policy on behalf of your customer</p>
                </div>
                <div className="step-indicator">
                    <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>1</div>
                    <div className="step-line"></div>
                    <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>2</div>
                    <div className="step-line"></div>
                    <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'done' : ''}`}>3</div>
                    <div className="step-line"></div>
                    <div className={`step ${step >= 4 ? 'active' : ''} ${step > 4 ? 'done' : ''}`}>4</div>
                    <div className="step-line"></div>
                    <div className={`step ${step >= 5 ? 'active' : ''} ${step > 5 ? 'done' : ''}`}>5</div>
                </div>
            </div>

            <div className="card form-container">
                {/* Step 1: Search Customer */}
                {step === 1 && (
                    <div className="form-step">
                        <h2>Step 1: Find Customer</h2>
                        <p>Search for an existing customer by their phone number or start a new enrollment.</p>
                        <div className="search-box">
                            <label>Customer Phone Number</label>
                            <div className="input-with-button">
                                <input
                                    type="tel"
                                    placeholder="Enter 10 digit phone number"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    autoFocus
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSearchCustomer}
                                    disabled={searchingCustomer || customerPhone.length < 10}
                                >
                                    {searchingCustomer ? 'Searching...' : 'Search / Next'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Customer Details */}
                {step === 2 && (
                    <form onSubmit={handleCustomerSubmit} className="form-step">
                        <h2>Step 2: Customer Information</h2>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    value={customerData.fullName}
                                    onChange={(e) => setCustomerData({ ...customerData, fullName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    value={customerData.email}
                                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input type="text" value={customerData.phone} readOnly className="read-only" />
                            </div>
                            <div className="form-group">
                                <label>City *</label>
                                <input
                                    type="text"
                                    value={customerData.city}
                                    onChange={(e) => setCustomerData({ ...customerData, city: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>State *</label>
                                <input
                                    type="text"
                                    value={customerData.state}
                                    onChange={(e) => setCustomerData({ ...customerData, state: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Pincode *</label>
                                <input
                                    type="text"
                                    value={customerData.pincode}
                                    onChange={(e) => setCustomerData({ ...customerData, pincode: e.target.value })}
                                    maxLength="6"
                                    required
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Full Address *</label>
                                <textarea
                                    rows="2"
                                    value={customerData.address}
                                    onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
                            <button type="submit" className="btn btn-primary">Save & Continue</button>
                        </div>
                    </form>
                )}

                {/* Step 3: Select Plan */}
                {step === 3 && (
                    <div className="form-step">
                        <h2>Step 3: Choose Insurance Plan</h2>
                        <div className="plans-grid">
                            {plans.map(plan => (
                                <div key={plan.id || plan._id} className="plan-item-card" onClick={() => handleSelectPlan(plan)}>
                                    <h3>{plan.name}</h3>
                                    <div className="plan-price">{formatCurrency(plan.premium)}</div>
                                    <div className="plan-meta">
                                        <span>Coverage: <strong>{formatCurrency(plan.coverageAmount)}</strong></span>
                                        <span>Duration: <strong>{plan.duration}</strong></span>
                                    </div>
                                    <button className="btn btn-outline btn-block mt-3">Select Plan</button>
                                </div>
                            ))}
                        </div>
                        <div className="form-actions mt-4">
                            <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>Back</button>
                        </div>
                    </div>
                )}

                {/* Step 4: Cattle Details */}
                {step === 4 && (
                    <form onSubmit={(e) => { e.preventDefault(); setStep(5); }} className="form-step">
                        <h2>Step 4: Cattle Information</h2>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Cattle Type *</label>
                                <select
                                    value={policyData.cattleType}
                                    onChange={(e) => setPolicyData({ ...policyData, cattleType: e.target.value })}
                                >
                                    <option value="cow">Cow / ગાય</option>
                                    <option value="buffalo">Buffalo / ભેંસ</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tag ID / Name *</label>
                                <input
                                    type="text"
                                    placeholder="Check Ear Tag"
                                    value={policyData.tagId}
                                    onChange={(e) => setPolicyData({ ...policyData, tagId: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Age (Years) *</label>
                                <input
                                    type="number"
                                    min="1" max="15"
                                    value={policyData.age}
                                    onChange={(e) => setPolicyData({ ...policyData, age: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Breed</label>
                                <input
                                    type="text"
                                    value={policyData.breed}
                                    onChange={(e) => setPolicyData({ ...policyData, breed: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="photos-section mt-4">
                            <h3>Upload Photos (4 Sides)</h3>
                            <div className="photos-row">
                                <PhotoUpload side="front" label="Front" value={photos.front} onChange={handlePhotoChange} />
                                <PhotoUpload side="back" label="Back" value={photos.back} onChange={handlePhotoChange} />
                                <PhotoUpload side="left" label="Left" value={photos.left} onChange={handlePhotoChange} />
                                <PhotoUpload side="right" label="Right" value={photos.right} onChange={handlePhotoChange} />
                            </div>
                        </div>

                        <div className="form-actions mt-4">
                            <button type="button" className="btn btn-outline" onClick={() => setStep(3)}>Back</button>
                            <button type="submit" className="btn btn-primary">Review Policy</button>
                        </div>
                    </form>
                )}

                {/* Step 5: Final Review */}
                {step === 5 && (
                    <div className="form-step">
                        <h2>Step 5: Review & Submit</h2>
                        <div className="review-summary">
                            <div className="review-section">
                                <h3>👤 Customer Details</h3>
                                <p><strong>Name:</strong> {customerData.fullName}</p>
                                <p><strong>Phone:</strong> {customerData.phone}</p>
                                <p><strong>City:</strong> {customerData.city}, {customerData.state}</p>
                            </div>
                            <div className="review-section">
                                <h3>📋 Plan Details</h3>
                                <p><strong>Plan:</strong> {selectedPlan?.name}</p>
                                <p><strong>Coverage:</strong> {formatCurrency(selectedPlan?.coverageAmount)}</p>
                                <p><strong>Duration:</strong> {selectedPlan?.duration}</p>
                            </div>
                            <div className="review-section">
                                <h3>🐄 Cattle Details</h3>
                                <p><strong>Type:</strong> {policyData.cattleType}</p>
                                <p><strong>Tag ID:</strong> {policyData.tagId}</p>
                                <p><strong>Age:</strong> {policyData.age} Years</p>
                            </div>
                            <div className="total-box">
                                <span>Total Premium to Collect:</span>
                                <h2>{formatCurrency(selectedPlan?.premium)}</h2>
                            </div>
                        </div>

                        <div className="payment-method-selection mt-4">
                            <h3>Choose Payment Method</h3>
                            <div className="payment-options">
                                <label className={`payment-option ${policyData.paymentMethod === 'Cash' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="Cash"
                                        checked={policyData.paymentMethod === 'Cash'}
                                        onChange={(e) => setPolicyData({ ...policyData, paymentMethod: e.target.value })}
                                    />
                                    <div className="option-content">
                                        <span className="option-icon">💵</span>
                                        <div className="option-text">
                                            <strong>Cash / Offline Purchase</strong>
                                            <p>Select this if you have collected cash from the customer.</p>
                                        </div>
                                    </div>
                                </label>

                                <label className={`payment-option ${policyData.paymentMethod === 'Online' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="Online"
                                        checked={policyData.paymentMethod === 'Online'}
                                        onChange={(e) => setPolicyData({ ...policyData, paymentMethod: e.target.value })}
                                    />
                                    <div className="option-content">
                                        <span className="option-icon">💳</span>
                                        <div className="option-text">
                                            <strong>Digital / Online Payment</strong>
                                            <p>Pay now using UPI, Card, or Net Banking.</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="payment-confirmation mt-4">
                            <div className="checkbox-group">
                                <input type="checkbox" id="confirm-payment" required />
                                <label htmlFor="confirm-payment">
                                    {policyData.paymentMethod === 'Cash'
                                        ? "I confirm that I have collected the premium amount from the customer in Cash."
                                        : "I am ready to proceed with online payment for this policy."}
                                </label>
                            </div>
                        </div>

                        <div className="form-actions mt-4">
                            <button type="button" className="btn btn-outline" onClick={() => setStep(4)}>Back</button>
                            <button
                                type="button"
                                className="btn btn-primary btn-large"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : (policyData.paymentMethod === 'Cash' ? 'Confirm & Issue Policy' : 'Pay & Issue Policy')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentAddPolicy;
