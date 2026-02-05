import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { agentAPI, policyPlanAPI } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import PhotoUpload from '../components/PhotoUpload';
import toast from 'react-hot-toast';
import './AgentAddPolicy.css';

const AgentAddPolicy = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Check for renewal data passed from Renewals page
    const { renewalData } = location.state || {};

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
        paymentMethod: 'Cash', // Default payment method

        // Date fields for renewal continuity
        startDate: '',
        endDate: '',
        previousPolicyId: ''
    });

    const [photos, setPhotos] = useState({
        front: null,
        back: null,
        left: null,
        right: null
    });

    // Helper to format date for input
    const formatDateForInput = (date) => {
        return new Date(date).toISOString().split('T')[0];
    };

    // Helper to calculate End Date based on Start Date and Duration (Years)
    const calculateEndDate = (startDateStr, durationString) => {
        if (!startDateStr || !durationString) return '';
        const start = new Date(startDateStr);
        // Extract years from string like "1 Year" or "2 Years"
        const years = parseInt(durationString);
        if (isNaN(years)) return '';

        const end = new Date(start);
        end.setFullYear(end.getFullYear() + years);
        // Usually end date is minus 1 day from the full year period
        end.setDate(end.getDate() - 1);
        return end.toISOString();
    };

    // Fetch plans on mount
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await policyPlanAPI.getAll();
                if (response.success) {
                    const activePlans = response.data.plans.filter(p => p.isActive);
                    setPlans(activePlans);

                    // If renewal, try to pre-select plan
                    if (renewalData && renewalData.planId) {
                        const matchingPlan = activePlans.find(p => p.id === renewalData.planId || p._id === renewalData.planId);
                        if (matchingPlan) {
                            setSelectedPlan(matchingPlan);
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching plans:', err);
            }
        };
        fetchPlans();
    }, [renewalData]);

    // Handle Renewal Pre-filling
    useEffect(() => {
        if (renewalData) {
            console.log('Pre-filling renewal data:', renewalData);

            // 1. Set Customer Info
            setCustomerPhone(renewalData.ownerPhone);

            const prefilledCustomer = {
                fullName: renewalData.ownerName,
                email: renewalData.ownerEmail,
                phone: renewalData.ownerPhone,
                address: renewalData.ownerAddress,
                city: renewalData.ownerCity,
                state: renewalData.ownerState,
                pincode: renewalData.ownerPincode
            };
            setCustomerData(prefilledCustomer);

            // Set existing customer ID if available to link correctly
            if (renewalData.customerId) {
                setExistingCustomer({
                    _id: renewalData.customerId,
                    ...prefilledCustomer
                });
            }

            // 2. Calculate Renewal Start Date
            // Default to tomorrow if active, or today if expired
            const oldEndDate = new Date(renewalData.endDate);
            const today = new Date();

            let newStartDate = new Date();
            if (oldEndDate >= today) {
                // Policy still active, renew from next day
                newStartDate = new Date(oldEndDate);
                newStartDate.setDate(newStartDate.getDate() + 1);
            } else {
                // Policy expired, renew from today
                newStartDate = today;
            }

            // 3. Set Policy Info (Cattle & Dates)
            setPolicyData(prev => ({
                ...prev,
                cattleType: renewalData.cattleType,
                tagId: renewalData.tagId,
                age: renewalData.age ? String(parseInt(renewalData.age) + 1) : '', // Auto-increment age
                breed: renewalData.breed,
                gender: renewalData.gender,
                milkYield: renewalData.milkYield ? String(renewalData.milkYield) : '',

                ownerName: renewalData.ownerName,
                ownerPhone: renewalData.ownerPhone,
                ownerEmail: renewalData.ownerEmail,
                ownerAddress: renewalData.ownerAddress,
                ownerCity: renewalData.ownerCity,
                ownerState: renewalData.ownerState,
                ownerPincode: renewalData.ownerPincode,

                startDate: formatDateForInput(newStartDate),
                previousPolicyId: renewalData.id
            }));

            // Jump to Step 2 to verify customer details
            setStep(2);
            toast.success('Renewal details pre-filled. Please verify customer info.');
        }
    }, [renewalData]);

    // Effect to update End Date whenever Start Date or Plan changes
    useEffect(() => {
        if (policyData.startDate && selectedPlan?.duration) {
            const endDate = calculateEndDate(policyData.startDate, selectedPlan.duration);
            setPolicyData(prev => ({ ...prev, endDate }));
        }
    }, [policyData.startDate, selectedPlan]);


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
        // Validation
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

        if (!/\S+@\S+\.\S+/.test(customerData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        // Sync policy owner info
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

            // Ensure we have start and end dates
            let finalStartDate = policyData.startDate || formatDateForInput(new Date());
            let finalEndDate = policyData.endDate;

            if (!finalEndDate && selectedPlan) {
                finalEndDate = calculateEndDate(finalStartDate, selectedPlan.duration);
            }

            const payload = {
                customerId: existingCustomer?.id || existingCustomer?._id,
                customerData: existingCustomer ? null : customerData,
                policyData: {
                    ...policyData,
                    startDate: new Date(finalStartDate).toISOString(),
                    endDate: new Date(finalEndDate).toISOString(),
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
                    navigate(renewalData ? "/renewals" : "/policies"); // Go back to renewals if came from there
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
                    <h1>{renewalData ? `Renew Policy #${renewalData.policyNumber}` : 'Sell New Policy'}</h1>
                    <p>{renewalData ? 'Process renewal & ensure continuous coverage' : 'Issue a policy on behalf of your customer'}</p>
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
                        <p>Search for an existing customer by their phone number.</p>
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
                        {renewalData && <div className="info-badge">ℹ️ Reviewing existing customer details for renewal</div>}

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    value={customerData.fullName}
                                    onChange={(e) => setCustomerData({ ...customerData, fullName: e.target.value })}
                                    required
                                    readOnly={!!renewalData} // Lock for renewal to prevent accidental change
                                    className={renewalData ? 'read-only' : ''}
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
                            {!renewalData && <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>Back</button>}
                            <button type="submit" className="btn btn-primary">Confirm & Continue</button>
                        </div>
                    </form>
                )}

                {/* Step 3: Select Plan */}
                {step === 3 && (
                    <div className="form-step">
                        <h2>Step 3: Choose Insurance Plan</h2>
                        {renewalData && selectedPlan && (
                            <div className="success-badge mb-3">
                                ✨ Previous Plan: <strong>{selectedPlan.name}</strong> (Recommended)
                            </div>
                        )}
                        <div className="plans-grid">
                            {plans.map(plan => (
                                <div
                                    key={plan.id || plan._id}
                                    className={`plan-item-card ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
                                    onClick={() => handleSelectPlan(plan)}
                                >
                                    <h3>{plan.name}</h3>
                                    <div className="plan-price">{formatCurrency(plan.premium)}</div>
                                    <div className="plan-meta">
                                        <span>Coverage: <strong>{formatCurrency(plan.coverageAmount)}</strong></span>
                                        <span>Duration: <strong>{plan.duration}</strong></span>
                                    </div>
                                    <button className={`btn btn-block mt-3 ${selectedPlan?.id === plan.id ? 'btn-primary' : 'btn-outline'}`}>
                                        {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="form-actions mt-4">
                            <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>Back</button>
                        </div>
                    </div>
                )}

                {/* Step 4: Cattle Details & Dates */}
                {step === 4 && (
                    <form onSubmit={(e) => { e.preventDefault(); setStep(5); }} className="form-step">
                        <h2>Step 4: Cattle Information & Schedule</h2>
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

                            {/* Date Fields - Critical for Renewal */}
                            <div className="form-group">
                                <label>Policy Start Date *</label>
                                <input
                                    type="date"
                                    value={policyData.startDate}
                                    onChange={(e) => setPolicyData({ ...policyData, startDate: e.target.value })}
                                    required
                                />
                                <small className="helper-text">
                                    {renewalData ? 'Automatically set to maintain continuity.' : 'Default is today.'}
                                </small>
                            </div>
                            <div className="form-group">
                                <label>Policy End Date</label>
                                <input
                                    type="text" // Read-only mostly
                                    value={policyData.endDate ? new Date(policyData.endDate).toLocaleDateString() : ''}
                                    readOnly
                                    className="read-only"
                                />
                            </div>
                        </div>

                        <div className="photos-section mt-4">
                            <h3>Upload Photos (4 Sides)</h3>
                            <p className="hint-text">{renewalData ? "For renewal, please update photos to confirm current health." : "Upload clear photos for cattle identification."}</p>
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
                                <p><strong>Premium:</strong> {formatCurrency(selectedPlan?.premium)}</p>
                                <p><strong>Duration:</strong> {selectedPlan?.duration}</p>
                            </div>
                            <div className="review-section">
                                <h3>📅 Coverage Period</h3>
                                <p><strong>Start:</strong> {new Date(policyData.startDate).toLocaleDateString()}</p>
                                <p><strong>End:</strong> {new Date(policyData.endDate).toLocaleDateString()}</p>
                                {renewalData && <span className="badge badge-info">Renewal Coverage</span>}
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
