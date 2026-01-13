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
        accountHolderName: ''
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
                accountHolderName: user.accountHolderName || ''
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
                <h2>Agent Information</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label>Agent Code</label>
                        <strong>{agentInfo.agentCode}</strong>
                    </div>
                    <div className="info-item">
                        <label>Level</label>
                        <strong>Level {agentInfo.level}</strong>
                    </div>
                    <div className="info-item">
                        <label>Status</label>
                        <span className={`status-badge status-${agentInfo.status}`}>
                            {agentInfo.status}
                        </span>
                    </div>
                    <div className="info-item">
                        <label>Joined On</label>
                        <strong>{new Date(agentInfo.createdAt).toLocaleDateString()}</strong>
                    </div>
                    {agentInfo.parentAgentId && (
                        <div className="info-item">
                            <label>Referred By</label>
                            <strong>Agent #{agentInfo.parentAgent?.agentCode}</strong>
                        </div>
                    )}
                </div>
            </div>

            {/* Personal Information */}
            <div className="profile-section">
                <div className="section-header">
                    <h2>Personal Information</h2>
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

                    {/* Bank Details */}
                    <h3 className="section-subtitle">Bank Details</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Bank Name</label>
                            <input
                                type="text"
                                name="bankName"
                                value={profileData.bankName}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="form-group">
                            <label>Account Number</label>
                            <input
                                type="text"
                                name="accountNumber"
                                value={profileData.accountNumber}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="form-group">
                            <label>IFSC Code</label>
                            <input
                                type="text"
                                name="ifscCode"
                                value={profileData.ifscCode}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="form-group">
                            <label>Account Holder Name</label>
                            <input
                                type="text"
                                name="accountHolderName"
                                value={profileData.accountHolderName}
                                onChange={handleInputChange}
                                disabled={!isEditing}
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
