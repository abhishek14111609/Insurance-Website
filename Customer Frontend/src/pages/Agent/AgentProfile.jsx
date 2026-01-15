import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { agentAPI } from '../../services/api.service';
import './AgentProfile.css';

const AgentProfile = () => {
    const navigate = useNavigate();
    const { user, isAgent, updateUser, refreshUser } = useAuth();

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isEditing, setIsEditing] = useState(false);

    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        panNumber: '',
        aadharNumber: ''
    });

    const [kycFiles, setKycFiles] = useState({
        panPhoto: null,
        aadharPhotoFront: null,
        aadharPhotoBack: null,
        bankProofPhoto: null
    });

    const [agentInfo, setAgentInfo] = useState(null);

    useEffect(() => {
        if (!isAgent) {
            navigate('/');
            return;
        }

        fetchAgentProfile();
    }, [isAgent, navigate]);

    useEffect(() => {
        if (user) {
            setProfileData({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                pincode: user.pincode || '',
                bankName: user.bankName || '',
                accountNumber: user.accountNumber || '',
                ifscCode: user.ifscCode || '',
                accountHolderName: user.accountHolderName || '',
                panNumber: user.panNumber || '',
                aadharNumber: user.aadharNumber || ''
            });
        }
    }, [user]);

    const fetchAgentProfile = async () => {
        try {
            const response = await agentAPI.getProfile();
            if (response.success) {
                setAgentInfo(response.data.agent);
            }
        } catch (error) {
            console.error('Error fetching agent profile:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData({
            ...profileData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setKycFiles(prev => ({
                ...prev,
                [name]: files[0]
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await agentAPI.updateProfile(profileData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
            await refreshUser();
            await fetchAgentProfile();
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleKYCSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // Basic Validation
        const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
        if (!panRegex.test(profileData.panNumber)) {
            setMessage({ type: 'error', text: 'Invalid PAN Number format (e.g., ABCDE1234F)' });
            setLoading(false);
            return;
        }

        const aadharRegex = /^[2-9]{1}[0-9]{11}$/;
        if (!aadharRegex.test(profileData.aadharNumber)) {
            setMessage({ type: 'error', text: 'Invalid Aadhaar Number (must be 12 digits, cannot start with 0 or 1)' });
            setLoading(false);
            return;
        }

        // File Validation (Require files if not already submitted or if rejected)
        const isNewSubmission = !agentInfo.kycStatus || agentInfo.kycStatus === 'not_submitted';
        if (isNewSubmission) {
            if (!kycFiles.panPhoto || !kycFiles.aadharPhotoFront || !kycFiles.bankProofPhoto) {
                setMessage({ type: 'error', text: 'Please upload all required KYC documents (PAN, Aadhaar Front, Bank Proof)' });
                setLoading(false);
                return;
            }
        }

        try {
            const formData = new FormData();
            formData.append('panNumber', profileData.panNumber);
            formData.append('aadharNumber', profileData.aadharNumber);
            formData.append('bankName', profileData.bankName);
            formData.append('accountNumber', profileData.accountNumber);
            formData.append('ifscCode', profileData.ifscCode);
            formData.append('accountHolderName', profileData.accountHolderName);

            if (kycFiles.panPhoto) formData.append('panPhoto', kycFiles.panPhoto);
            if (kycFiles.aadharPhotoFront) formData.append('aadharPhotoFront', kycFiles.aadharPhotoFront);
            if (kycFiles.aadharPhotoBack) formData.append('aadharPhotoBack', kycFiles.aadharPhotoBack);
            if (kycFiles.bankProofPhoto) formData.append('bankProofPhoto', kycFiles.bankProofPhoto);

            await agentAPI.submitKYC(formData);
            setMessage({ type: 'success', text: 'KYC documents submitted successfully! Admin will verify soon.' });
            await refreshUser();
            await fetchAgentProfile();

            // Clear files state after successful upload
            setKycFiles({
                panPhoto: null,
                aadharPhotoFront: null,
                aadharPhotoBack: null,
                bankProofPhoto: null
            });
            // Reset file inputs visually by ID or ref? React state doesn't wipe file input value easily without ref.
            // For now, reload handles data refresh.

        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to submit KYC' });
        } finally {
            setLoading(false);
        }
    };

    if (!agentInfo) {
        return (
            <div className="agent-profile">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="agent-profile">
            <div className="profile-header">
                <h1>Agent Profile</h1>
                <p>Manage your agent account information</p>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Agent Info Card */}
            <div className="agent-info-card">
                <h2>Account Status</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label>Agent Code</label>
                        <strong>{agentInfo.agentCode}</strong>
                    </div>
                    <div className="info-item">
                        <label>Account Status</label>
                        <span className={`status-badge status-${agentInfo.status}`}>
                            {agentInfo.status}
                        </span>
                    </div>
                    <div className="info-item">
                        <label>KYC Status</label>
                        <span className={`status-badge status-${agentInfo.kycStatus || 'not_submitted'}`}>
                            {agentInfo.kycStatus || 'Not Submitted'}
                        </span>
                    </div>
                </div>
                {agentInfo.kycStatus === 'rejected' && (
                    <div className="rejection-reason mt-3">
                        <label>Rejection Reason:</label>
                        <p className="text-danger">{agentInfo.kycRejectionReason}</p>
                    </div>
                )}
            </div>

            {/* KYC Section */}
            <div className="profile-section">
                <div className="section-header">
                    <h2>KYC & Bank Verification</h2>
                    <span className="text-muted small">Update your identity and bank proofs</span>
                </div>

                {agentInfo.kycStatus === 'verified' && (
                    <div className="alert alert-success">
                        <h4>🎉 KYC Verified!</h4>
                        <p>Your documents have been approved. You have full access to all agent features.</p>
                    </div>
                )}

                {agentInfo.kycStatus === 'pending' && (
                    <div className="alert alert-warning">
                        <h4>⏳ under Review</h4>
                        <p>Your documents are currently being verified by our team. You will be notified once approved.</p>
                    </div>
                )}

                {agentInfo.kycStatus === 'rejected' && (
                    <div className="alert alert-error">
                        <h4>⚠️ Action Required: KYC Rejected</h4>
                        <p><strong>Reason:</strong> {agentInfo.kycRejectionReason}</p>
                        <p>Please correct the issues and re-upload your documents below.</p>
                    </div>
                )}

                <form onSubmit={handleKYCSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>PAN Number</label>
                            <input
                                type="text"
                                name="panNumber"
                                value={profileData.panNumber}
                                onChange={handleInputChange}
                                placeholder="Enter 10-digit PAN"
                                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                                maxLength="10"
                                required
                                disabled={agentInfo.kycStatus === 'verified'}
                            />
                        </div>
                        <div className="form-group">
                            <label>Upload PAN Card</label>
                            <input
                                type="file"
                                name="panPhoto"
                                onChange={handleFileChange}
                                accept="image/*,.pdf"
                            />
                            {agentInfo.panPhoto && <span className="text-success small">✓ PAN Document Uploaded</span>}
                        </div>
                        <div className="form-group">
                            <label>Aadhaar Number</label>
                            <input
                                type="text"
                                name="aadharNumber"
                                value={profileData.aadharNumber}
                                onChange={handleInputChange}
                                placeholder="Enter 12-digit Aadhaar"
                                pattern="[0-9]{12}"
                                maxLength="12"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Aadhaar (Front)</label>
                            <input
                                type="file"
                                name="aadharPhotoFront"
                                onChange={handleFileChange}
                                accept="image/*,.pdf"
                            />
                            {agentInfo.aadharPhotoFront && <span className="text-success small">✓ Front Uploaded</span>}
                        </div>
                        <div className="form-group">
                            <label>Aadhaar (Back)</label>
                            <input
                                type="file"
                                name="aadharPhotoBack"
                                onChange={handleFileChange}
                                accept="image/*,.pdf"
                            />
                            {agentInfo.aadharPhotoBack && <span className="text-success small">✓ Back Uploaded</span>}
                        </div>
                        <div className="form-group">
                            <label>Cancel Cheque / Passbook</label>
                            <input
                                type="file"
                                name="bankProofPhoto"
                                onChange={handleFileChange}
                                accept="image/*,.pdf"
                            />
                            {agentInfo.bankProofPhoto && <span className="text-success small">✓ Bank Proof Uploaded</span>}
                        </div>
                    </div>

                    <h3 className="section-subtitle">Bank Account Details</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Bank Name</label>
                            <input
                                type="text"
                                name="bankName"
                                value={profileData.bankName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Account Number</label>
                            <input
                                type="text"
                                name="accountNumber"
                                value={profileData.accountNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>IFSC Code</label>
                            <input
                                type="text"
                                name="ifscCode"
                                value={profileData.ifscCode}
                                onChange={handleInputChange}
                                pattern="[A-Z]{4}0[A-Z0-9]{6}"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Account Holder Name</label>
                            <input
                                type="text"
                                name="accountHolderName"
                                value={profileData.accountHolderName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    {agentInfo.kycStatus !== 'verified' && (
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit KYC for Verification'}
                        </button>
                    )}
                </form>
            </div>

            {/* Personal Information */}
            <div className="profile-section">
                <div className="section-header">
                    <h2>Personal Information</h2>
                    {!isEditing ? (
                        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                            Edit Basic Profile
                        </button>
                    ) : (
                        <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                            Cancel
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={profileData.fullName}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={profileData.email}
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={profileData.phone}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Address</label>
                            <textarea
                                name="address"
                                value={profileData.address}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label>City</label>
                            <input
                                type="text"
                                name="city"
                                value={profileData.city}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="form-group">
                            <label>State</label>
                            <input
                                type="text"
                                name="state"
                                value={profileData.state}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="form-group">
                            <label>Pincode</label>
                            <input
                                type="text"
                                name="pincode"
                                value={profileData.pincode}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                maxLength="6"
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AgentProfile;
