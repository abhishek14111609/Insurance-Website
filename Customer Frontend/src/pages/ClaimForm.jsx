import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCustomerPolicies } from '../utils/authUtils';
import PhotoUpload from '../components/PhotoUpload';
import './ClaimForm.css';

const ClaimForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { policy: selectedPolicy } = location.state || {};

    const [policies, setPolicies] = useState([]);
    const [formData, setFormData] = useState({
        policyId: selectedPolicy?.id || '',
        claimType: 'death_disease',
        incidentDate: '',
        incidentDescription: '',
        veterinaryCertificate: '',
        bankAccountNumber: '',
        bankIFSC: '',
        bankAccountHolder: '',
        agreeTerms: false
    });

    const [photos, setPhotos] = useState({
        incident: null,
        certificate: null,
        additional: null
    });

    const [photoPreviews, setPhotoPreviews] = useState({
        incident: null,
        certificate: null,
        additional: null
    });

    useEffect(() => {
        const customerPolicies = getCustomerPolicies();
        const activePolicies = customerPolicies.filter(p => p.status === 'APPROVED');
        setPolicies(activePolicies);

        if (selectedPolicy) {
            setFormData(prev => ({ ...prev, policyId: selectedPolicy.id }));
        }
    }, [selectedPolicy]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handlePhotoChange = (side, file, preview) => {
        setPhotos(prev => ({ ...prev, [side]: file }));
        setPhotoPreviews(prev => ({ ...prev, [side]: preview }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate photos
        if (!photoPreviews.incident || !photoPreviews.certificate) {
            alert('Please upload incident photo and veterinary certificate');
            return;
        }

        if (!formData.agreeTerms) {
            alert('Please agree to terms and conditions');
            return;
        }

        const selectedPolicyData = policies.find(p => p.id === parseInt(formData.policyId));

        const claimData = {
            id: Date.now(),
            claimNumber: `CLM-${Date.now()}`,
            policyId: formData.policyId,
            policyNumber: selectedPolicyData?.policyNumber,
            claimType: formData.claimType,
            incidentDate: formData.incidentDate,
            incidentDescription: formData.incidentDescription,
            photos: photoPreviews,
            bankDetails: {
                accountNumber: formData.bankAccountNumber,
                ifsc: formData.bankIFSC,
                accountHolder: formData.bankAccountHolder
            },
            claimedAmount: selectedPolicyData?.coverageAmount,
            status: 'SUBMITTED',
            createdAt: new Date().toISOString()
        };

        // Save to localStorage
        const existingClaims = JSON.parse(localStorage.getItem('customer_claims') || '[]');
        existingClaims.push(claimData);
        localStorage.setItem('customer_claims', JSON.stringify(existingClaims));

        // Show success and redirect
        alert('Claim submitted successfully! You will receive updates via email.');
        navigate('/claims');
    };

    return (
        <div className="claim-form-page">
            <div className="container">
                <div className="form-container">
                    <div className="form-header">
                        <h1>File Insurance Claim</h1>
                        <p>Submit your claim for quick processing</p>
                    </div>

                    <form onSubmit={handleSubmit} className="claim-form">
                        {/* Policy Selection */}
                        <div className="form-section">
                            <h2 className="section-title">Select Policy</h2>

                            {policies.length > 0 ? (
                                <div className="form-group">
                                    <label>Active Policy *</label>
                                    <select
                                        name="policyId"
                                        value={formData.policyId}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">-- Select Policy --</option>
                                        {policies.map(policy => (
                                            <option key={policy.id} value={policy.id}>
                                                {policy.policyNumber} - {policy.tagId || policy.petName} (Coverage: ₹{policy.coverageAmount?.toLocaleString()})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="alert-warning">
                                    ⚠️ You don't have any active policies. Please purchase a policy first.
                                </div>
                            )}
                        </div>

                        {/* Claim Details */}
                        <div className="form-section">
                            <h2 className="section-title">Claim Details</h2>

                            <div className="form-group">
                                <label>Claim Type *</label>
                                <select
                                    name="claimType"
                                    value={formData.claimType}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="death_disease">Death due to Disease (HS, BQ, FMD)</option>
                                    <option value="death_accident">Accidental Death</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Incident Date *</label>
                                <input
                                    type="date"
                                    name="incidentDate"
                                    value={formData.incidentDate}
                                    onChange={handleInputChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Incident Description *</label>
                                <textarea
                                    name="incidentDescription"
                                    value={formData.incidentDescription}
                                    onChange={handleInputChange}
                                    rows="4"
                                    placeholder="Describe what happened in detail..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Document Upload */}
                        <div className="photo-upload-section">
                            <h3>Upload Documents</h3>
                            <p className="section-hint">Upload clear photos of required documents. Maximum 1MB per photo.</p>

                            <div className="photos-grid">
                                <PhotoUpload
                                    side="incident"
                                    label="Incident Photo *"
                                    value={photoPreviews.incident}
                                    onChange={handlePhotoChange}
                                    required
                                />
                                <PhotoUpload
                                    side="certificate"
                                    label="Veterinary Certificate *"
                                    value={photoPreviews.certificate}
                                    onChange={handlePhotoChange}
                                    required
                                />
                                <PhotoUpload
                                    side="additional"
                                    label="Additional Document (Optional)"
                                    value={photoPreviews.additional}
                                    onChange={handlePhotoChange}
                                />
                            </div>
                        </div>

                        {/* Bank Details */}
                        <div className="form-section">
                            <h2 className="section-title">Bank Details for Settlement</h2>

                            <div className="form-group">
                                <label>Account Holder Name *</label>
                                <input
                                    type="text"
                                    name="bankAccountHolder"
                                    value={formData.bankAccountHolder}
                                    onChange={handleInputChange}
                                    placeholder="As per bank records"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Account Number *</label>
                                    <input
                                        type="text"
                                        name="bankAccountNumber"
                                        value={formData.bankAccountNumber}
                                        onChange={handleInputChange}
                                        placeholder="Enter account number"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>IFSC Code *</label>
                                    <input
                                        type="text"
                                        name="bankIFSC"
                                        value={formData.bankIFSC}
                                        onChange={handleInputChange}
                                        placeholder="e.g., SBIN0001234"
                                        pattern="[A-Z]{4}0[A-Z0-9]{6}"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
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
                                    I declare that the information provided is true and accurate. I understand that false claims may result in policy cancellation and legal action.
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn btn-primary btn-block btn-large"
                            disabled={policies.length === 0}
                        >
                            Submit Claim
                        </button>

                        <div className="info-note">
                            📋 Claims are typically processed within 7 working days. You will receive updates via email.
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClaimForm;
