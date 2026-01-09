import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentCustomer, isCustomerLoggedIn } from '../utils/authUtils';
import './AnimalPolicyForm.css';

const AnimalPolicyForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { calculatorData, agentCode } = location.state || {};

    const [formData, setFormData] = useState({
        // Pet Details
        petName: '',
        petType: calculatorData?.petType || 'cow',
        petAge: calculatorData?.petAge || '',
        petBreed: calculatorData?.petBreed || '',
        tagId: calculatorData?.tagId || '', // Added
        milkYield: calculatorData?.milkYield || '', // Added
        petGender: 'female',
        petWeight: '',

        // Owner Details
        ownerName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        pincode: '',

        // Policy Details
        coverageAmount: calculatorData?.coverageAmount || '50000',
        startDate: '',

        // Agent
        agentCode: agentCode || '',

        // Payment
        paymentMethod: 'card',
        agreeTerms: false
    });

    const [petPhoto, setPetPhoto] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Initial Login Check and Data Pre-fill
    useEffect(() => {
        if (!isCustomerLoggedIn()) {
            navigate('/login', { state: { from: '/animal-policy-form' } });
            return;
        }

        const user = getCurrentCustomer();
        setCurrentUser(user);

        // Pre-fill owner details from current user session
        if (user) {
            setFormData(prev => ({
                ...prev,
                ownerName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                city: user.city || '',
                address: user.address || '',
                pincode: user.pincode || ''
            }));
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPetPhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const calculatePremium = () => {
        const baseRates = {
            cow: 2500,
            buffalo: 3000
        };

        const ageMultiplier = formData.petAge > 5 ? 1.2 : 1;
        const coverageMultiplier = parseInt(formData.coverageAmount) / 50000;
        const yieldFactor = formData.milkYield > 10 ? 1.1 : 1;

        return Math.round((baseRates[formData.petType] || 2500) * ageMultiplier * coverageMultiplier * yieldFactor);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const premium = calculatePremium();

        // Create policy data (without saving yet)
        const policyData = {
            id: Date.now(),
            ...formData,
            petPhoto,
            marketValue: formData.coverageAmount
        };

        // Navigate to payment page with policy data
        navigate('/payment', {
            state: {
                policyData,
                premium
            }
        });
    };

    if (!currentUser) return null; // Wait for redirect

    return (
        <div className="animal-policy-form">
            <div className="form-container">
                <div className="form-header">
                    <h1>Complete Cattle Insurance Application</h1>
                    <p>Secure your livestock against unforeseen risks</p>
                </div>

                <form onSubmit={handleSubmit} className="policy-form">
                    {/* Cattle Details Section */}
                    <div className="form-section">
                        <h2 className="section-title">🐄 Cattle Details</h2>

                        <div className="photo-upload">
                            <label className="photo-label">Cattle Photo (Optional)</label>
                            <div className="photo-preview">
                                {petPhoto ? (
                                    <img src={petPhoto} alt="Cattle" />
                                ) : (
                                    <div className="photo-placeholder">
                                        <span className="placeholder-icon">📷</span>
                                        <span className="placeholder-text">Upload Photo with Tag</span>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="photo-input"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Cattle Type *</label>
                                <select name="petType" value={formData.petType} onChange={handleInputChange} required>
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
                                    placeholder="Enter Ear Tag No."
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Age (Years) *</label>
                                <input
                                    type="number"
                                    name="petAge"
                                    value={formData.petAge}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="15"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Breed</label>
                                <input
                                    type="text"
                                    name="petBreed"
                                    value={formData.petBreed}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Gir, Jersey"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Milk Yield (Liters/Day)</label>
                                <input
                                    type="number"
                                    name="milkYield"
                                    value={formData.milkYield}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 12"
                                />
                            </div>
                            <div className="form-group">
                                <label>Approx Weight (kg) *</label>
                                <input
                                    type="number"
                                    name="petWeight"
                                    value={formData.petWeight}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 350"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Owner Details Section */}
                    <div className="form-section">
                        <h2 className="section-title">👤 Farmer / Owner Details</h2>
                        <div className="alert-info" style={{ marginBottom: '1rem', padding: '0.75rem', background: '#eff6ff', borderRadius: '6px', color: '#1e40af' }}>
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
                                    readOnly={!!currentUser}
                                    style={currentUser ? { backgroundColor: '#f1f5f9' } : {}}
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
                                    readOnly={!!currentUser}
                                    style={currentUser ? { backgroundColor: '#f1f5f9' } : {}}
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
                                    readOnly={!!currentUser}
                                    style={currentUser ? { backgroundColor: '#f1f5f9' } : {}}
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
                                    readOnly={!!currentUser}
                                    style={currentUser ? { backgroundColor: '#f1f5f9' } : {}}
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
                                readOnly={!!currentUser}
                                style={currentUser ? { backgroundColor: '#f1f5f9' } : {}}
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
                                readOnly={!!currentUser}
                                style={currentUser ? { backgroundColor: '#f1f5f9' } : {}}
                                required
                            />
                        </div>
                    </div>

                    {/* Policy Details Section */}
                    <div className="form-section">
                        <h2 className="section-title">📋 Policy Coverage</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Sum Insured (Market Value) *</label>
                                <select name="coverageAmount" value={formData.coverageAmount} onChange={handleInputChange} required>
                                    <option value="25000">₹25,000</option>
                                    <option value="50000">₹50,000</option>
                                    <option value="75000">₹75,000</option>
                                    <option value="100000">₹1,00,000</option>
                                    <option value="150000">₹1,50,000</option>
                                    <option value="200000">₹2,00,000</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Policy Start Date *</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                        </div>

                        {formData.agentCode && (
                            <div className="agent-info-display">
                                <span className="info-icon">👤</span>
                                <span>Referred by Agent: <strong>{formData.agentCode}</strong></span>
                            </div>
                        )}
                    </div>

                    {/* Premium Summary */}
                    <div className="premium-summary">
                        <div className="summary-row">
                            <span>Annual Premium:</span>
                            <span className="premium-amount">₹{calculatePremium().toLocaleString('en-IN')}</span>
                        </div>
                        <div className="summary-row">
                            <span>GST (18%):</span>
                            <span>₹{Math.round(calculatePremium() * 0.18).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total Amount:</span>
                            <span>₹{Math.round(calculatePremium() * 1.18).toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary btn-block btn-large">
                        Proceed to Payment - ₹{Math.round(calculatePremium() * 1.18).toLocaleString('en-IN')}
                    </button>

                    <div className="secure-badge">
                        🔒 100% Secure Payment
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AnimalPolicyForm;
