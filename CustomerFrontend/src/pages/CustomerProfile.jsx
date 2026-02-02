import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, policyAPI, BASE_URL } from '../services/api.service';
import toast from 'react-hot-toast';
import './CustomerProfile.css';

const CustomerProfile = () => {
    const navigate = useNavigate();
    const { user, isAgent, updateUser, logout, refreshUser } = useAuth();

    useEffect(() => {
        if (isAgent) {
            navigate('/agent/profile');
        }
    }, [isAgent, navigate]);

    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [policies, setPolicies] = useState([]);
    const [policiesLoading, setPoliciesLoading] = useState(true);

    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

    const [kycData, setKycData] = useState({
        panNumber: '',
        aadharNumber: '',
        status: 'not_submitted'
    });

    const [bankData, setBankData] = useState({
        accountHolderName: '',
        accountNumber: '',
        bankName: '',
        ifscCode: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [message, setMessage] = useState({ type: '', text: '' });

    // Load user data
    useEffect(() => {
        if (user) {
            setProfileData({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                pincode: user.pincode || ''
            });
            if (user.kycDetails) {
                setKycData({
                    panNumber: user.kycDetails.panNumber || '',
                    aadharNumber: user.kycDetails.aadharNumber || '',
                    status: user.kycDetails.status || 'not_submitted',
                    panPhoto: user.kycDetails.panPhoto || null,
                    aadharPhotoFront: user.kycDetails.aadharPhotoFront || null,
                    aadharPhotoBack: user.kycDetails.aadharPhotoBack || null
                });
            }
            if (user.bankDetails) {
                setBankData({
                    accountHolderName: user.bankDetails.accountHolderName || '',
                    accountNumber: user.bankDetails.accountNumber || '',
                    bankName: user.bankDetails.bankName || '',
                    ifscCode: user.bankDetails.ifscCode || '',
                    bankProofPhoto: user.bankDetails.bankProofPhoto || null
                });
            }
        }
    }, [user]);

    // Fetch policies
    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            setPoliciesLoading(true);
            const response = await policyAPI.getAll();
            if (response.success) {
                setPolicies(response.data.policies || []);
            }
        } catch (error) {
            console.error('Error fetching policies:', error);
        } finally {
            setPoliciesLoading(false);
        }
    };

    const [files, setFiles] = useState({});

    const handleFileChange = (e, field) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [field]: e.target.files[0] }));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const formData = new FormData();

            // Append basic profile data
            Object.keys(profileData).forEach(key => {
                if (profileData[key]) formData.append(key, profileData[key]);
            });

            // Append structured data as JSON strings
            formData.append('kycDetails', JSON.stringify(kycData));
            formData.append('bankDetails', JSON.stringify(bankData));

            // Append Files
            if (files.panPhoto) formData.append('panPhoto', files.panPhoto);
            if (files.aadharPhotoFront) formData.append('aadharPhotoFront', files.aadharPhotoFront);
            if (files.aadharPhotoBack) formData.append('aadharPhotoBack', files.aadharPhotoBack);
            if (files.bankProofPhoto) formData.append('bankProofPhoto', files.bankProofPhoto);

            await updateUser(formData);

            setMessage({ type: 'success', text: 'Profile & KYC submitted for verification!' });
            setIsEditing(false);
            setFiles({});
            await refreshUser();
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            setLoading(false);
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            setLoading(false);
            return;
        }

        try {
            const { authAPI } = await import('../services/api.service');
            await authAPI.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
    };

    if (!user) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <>
            <br />  <br /> <br /> <br />
            <div className="customer-profile-page">
                <div className="profile-container">
                    {/* Left Sidebar */}
                    <div className="profile-sidebar">
                        <div className="user-brief">
                            <div className="avatar-circle">
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <h3>{user.fullName}</h3>
                            <p>{user.email}</p>
                            {kycData.status === 'verified' && <span className="badge-verified">KYC Verified</span>}
                        </div>
                        <div className="profile-nav">
                            <button
                                className={activeTab === 'profile' ? 'active' : ''}
                                onClick={() => setActiveTab('profile')}
                            >
                                <span className="icon">👤</span> Profile Information
                            </button>
                            <button
                                className={activeTab === 'kyc' ? 'active' : ''}
                                onClick={() => setActiveTab('kyc')}
                            >
                                <span className="icon">📋</span> KYC & Bank Details
                            </button>
                            <button
                                className={activeTab === 'security' ? 'active' : ''}
                                onClick={() => setActiveTab('security')}
                            >
                                <span className="icon">🔒</span> Security
                            </button>
                            <button
                                className={activeTab === 'policies' ? 'active' : ''}
                                onClick={() => setActiveTab('policies')}
                            >
                                <span className="icon">📄</span> My Policies
                            </button>
                        </div>
                        <div className="profile-nav" style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                            <button className="logout-btn" onClick={handleLogout}>
                                <span className="icon">🚪</span> Logout
                            </button>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="profile-content">
                        {message.text && (
                            <div className={`alert alert-${message.type}`} style={{ marginBottom: '20px' }}>
                                {message.text}
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="profile-section">
                                <div className="content-header">
                                    <h2>Profile Information</h2>
                                    {!isEditing ? (
                                        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                                            Edit Profile
                                        </button>
                                    ) : (
                                        <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                                            Cancel
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleProfileUpdate}>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input
                                                type="text"
                                                value={profileData.fullName}
                                                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                                disabled={!isEditing}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                disabled
                                                className="disabled-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Phone</label>
                                            <input
                                                type="tel"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                disabled={!isEditing}
                                                required
                                            />
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Address</label>
                                            <textarea
                                                value={profileData.address}
                                                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                                disabled={!isEditing}
                                                rows="3"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>City</label>
                                            <input
                                                type="text"
                                                value={profileData.city}
                                                onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>State</label>
                                            <input
                                                type="text"
                                                value={profileData.state}
                                                onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Pincode</label>
                                            <input
                                                type="text"
                                                value={profileData.pincode}
                                                onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                                                disabled={!isEditing}
                                                maxLength="6"
                                            />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="form-actions">
                                            <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                                                Cancel
                                            </button>
                                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

                        {activeTab === 'kyc' && (
                            <div className="kyc-section">
                                <div className="content-header">
                                    <h2>KYC & Bank Details</h2>
                                    {!isEditing ? (
                                        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                                            Edit Details
                                        </button>
                                    ) : (
                                        <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                                            Cancel
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleProfileUpdate}>
                                    <h3 className="section-sub-title">Identity Proof (KYC)</h3>
                                    <div className="form-grid">

                                        <div className="form-group">
                                            <label>PAN Number</label>
                                            <input
                                                type="text"
                                                value={kycData.panNumber}
                                                onChange={(e) => setKycData({ ...kycData, panNumber: e.target.value.toUpperCase() })}
                                                disabled={!isEditing}
                                                placeholder="ABCDE1234F"
                                                maxLength="10"
                                            />
                                            <label style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>Upload PAN Document</label>
                                            <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'panPhoto')} disabled={!isEditing} style={{ padding: '5px' }} />
                                            {kycData.panPhoto && <a href={`${BASE_URL}/${kycData.panPhoto}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85em', color: '#007bff', marginTop: '5px', display: 'block' }}>View Uploaded Document</a>}
                                        </div>
                                        <div className="form-group">
                                            <label>Aadhar Number</label>
                                            <input
                                                type="text"
                                                value={kycData.aadharNumber}
                                                onChange={(e) => setKycData({ ...kycData, aadharNumber: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="1234 5678 9012"
                                                maxLength="12"
                                            />

                                            <label style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>Aadhar Front Photo</label>
                                            <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'aadharPhotoFront')} disabled={!isEditing} style={{ padding: '5px' }} />
                                            {kycData.aadharPhotoFront && <a href={`${BASE_URL}/${kycData.aadharPhotoFront}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85em', color: '#007bff', marginTop: '5px', display: 'block' }}>View Front Photo</a>}

                                            <label style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>Aadhar Back Photo</label>
                                            <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'aadharPhotoBack')} disabled={!isEditing} style={{ padding: '5px' }} />
                                            {kycData.aadharPhotoBack && <a href={`${BASE_URL}/${kycData.aadharPhotoBack}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85em', color: '#007bff', marginTop: '5px', display: 'block' }}>View Back Photo</a>}
                                        </div>
                                        <div className="form-group">
                                            <label>KYC Status</label>
                                            <div className={`status-display ${kycData.status}`}>
                                                {kycData.status.replace('_', ' ').toUpperCase()}
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="section-sub-title" style={{ marginTop: '20px' }}>Bank Details</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Account Holder Name</label>
                                            <input
                                                type="text"
                                                value={bankData.accountHolderName}
                                                onChange={(e) => setBankData({ ...bankData, accountHolderName: e.target.value })}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Bank Name</label>
                                            <input
                                                type="text"
                                                value={bankData.bankName}
                                                onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Account Number</label>
                                            <input
                                                type="text"
                                                value={bankData.accountNumber}
                                                onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>IFSC Code</label>
                                            <input
                                                type="text"
                                                value={bankData.ifscCode}
                                                onChange={(e) => setBankData({ ...bankData, ifscCode: e.target.value.toUpperCase() })}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>Upload Bank Proof (Passbook/Cheque)</label>
                                            <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'bankProofPhoto')} disabled={!isEditing} style={{ padding: '5px' }} />
                                            {bankData.bankProofPhoto && (
                                                <a href={`${BASE_URL}/${bankData.bankProofPhoto}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85em', color: '#007bff', marginTop: '5px', display: 'block' }}>
                                                    View Bank Proof
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <>
                                            <div className="alert-info" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '0.9em', color: '#0c5460', border: '1px solid #bee5eb' }}>
                                                ℹ️ Note: Submitting changes will send your KYC for Admin Verification.
                                            </div>
                                            <div className="form-actions" style={{ marginTop: '15px' }}>
                                                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                                                    Cancel
                                                </button>
                                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                                    {loading ? 'Submitting...' : 'Submit for Verification'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="security-section">
                                <div className="content-header">
                                    <h2>Security Settings</h2>
                                </div>
                                <h3>Change Password</h3>
                                <form onSubmit={handlePasswordChange}>
                                    <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                                        <div className="form-group">
                                            <label>Current Password</label>
                                            <input
                                                type="password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>New Password</label>
                                            <input
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                required
                                                minLength="6"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button type="submit" className="btn btn-primary" disabled={loading}>
                                            {loading ? 'Changing...' : 'Change Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'policies' && (
                            <div className="policies-section">
                                <div className="content-header">
                                    <h2>My Policies</h2>
                                    <button className="btn btn-primary" onClick={() => navigate('/animal-policy-form')}>
                                        + New Policy
                                    </button>
                                </div>

                                {policiesLoading ? (
                                    <div className="loading">Loading policies...</div>
                                ) : policies.length === 0 ? (
                                    <div className="empty-state">
                                        <h3>No Policies Found</h3>
                                        <p>You don't have any policies active at the moment.</p>
                                        <button className="btn btn-outline-primary mt-3" onClick={() => navigate('/animal-policy-form')}>
                                            Buy Your First Policy
                                        </button>
                                    </div>
                                ) : (
                                    <div className="policy-grid">
                                        {policies.map((policy) => (
                                            <div key={policy.id} className="policy-card">
                                                <div className="policy-header">
                                                    <div className="policy-type">
                                                        🐮 {policy.cattleType || 'Cattle'}
                                                    </div>
                                                    <span className={`status-badge status-${policy.status.toLowerCase()}`}>
                                                        {policy.status}
                                                    </span>
                                                </div>
                                                <div className="policy-body">
                                                    <p><strong>Policy No:</strong> {policy.policyNumber}</p>
                                                    <p><strong>Tag ID:</strong> {policy.tagId}</p>
                                                    <p><strong>Coverage:</strong> ₹{policy.coverageAmount?.toLocaleString()}</p>
                                                    <p><strong>Premium:</strong> ₹{policy.premium?.toLocaleString()}</p>
                                                    <p><strong>Expiry:</strong> {new Date(policy.endDate).toLocaleDateString()}</p>
                                                </div>
                                                <div className="policy-footer">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary w-100"
                                                        onClick={() => navigate(`/policy/${policy.id}`)}
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CustomerProfile;
