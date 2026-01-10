import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentCustomer, isCustomerLoggedIn } from '../utils/authUtils';
import PhotoUpload from '../components/PhotoUpload';
import AgentCodeInput from '../components/AgentCodeInput';
import { formatCurrency } from '../constants/policyPlans';
import './AnimalPolicyForm.css';

const AnimalPolicyForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedPlan } = location.state || {};

    // Redirect if no plan selected
    useEffect(() => {
        if (!selectedPlan) {
            navigate('/policies');
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

    const [currentUser, setCurrentUser] = useState(null);

    // Login check and pre-fill
    useEffect(() => {
        if (!isCustomerLoggedIn()) {
            navigate('/login', { state: { from: '/animal-policy-form', selectedPlan } });
            return;
        }

        const user = getCurrentCustomer();
        setCurrentUser(user);

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
    }, [navigate, selectedPlan]);

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

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate all 4 photos uploaded
        const allPhotosUploaded = Object.values(photoFiles).every(file => file !== null);

        if (!allPhotosUploaded) {
            alert('Please upload all 4 cattle photos (Front, Back, Left, Right)');
            return;
        }

        if (!formData.agreeTerms) {
            alert('Please agree to terms and conditions');
            return;
        }

        // Create policy data
        const policyData = {
            id: Date.now(),
            policyNumber: `POL-${Date.now()}`,
            ...formData,
            selectedPlan,
            photos: photoPreviews, // For now, store base64 (will be uploaded to server later)
            photoFiles, // Actual files for upload
            coverageAmount: selectedPlan.coverage,
            premium: selectedPlan.premium,
            status: 'PENDING',
            submittedAt: new Date().toISOString()
        };

        // Navigate to payment
        navigate('/payment', {
            state: {
                policyData,
                premium: selectedPlan.premium
            }
        });
    };

    if (!currentUser || !selectedPlan) return null;

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
                            <span className="plan-name">{selectedPlan.duration}</span>
                        </div>
                        <div className="plan-details">
                            <div>Coverage: <strong>{formatCurrency(selectedPlan.coverage)}</strong></div>
                            <div>Premium: <strong>{formatCurrency(selectedPlan.premium)}</strong></div>
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
                            <span>Plan Duration:</span>
                            <span>{selectedPlan.duration}</span>
                        </div>
                        <div className="summary-row">
                            <span>Coverage Amount:</span>
                            <span>{formatCurrency(selectedPlan.coverage)}</span>
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
