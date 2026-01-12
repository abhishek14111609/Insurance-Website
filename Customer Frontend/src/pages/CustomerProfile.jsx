import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { policyAPI } from '../services/api.service';
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

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await updateUser(profileData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
            await refreshUser();
        } catch (error) {
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
        <div className="customer-profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <h1>My Account</h1>
                    <p>Manage your profile and view your policies</p>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="profile-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile Information
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        Security
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'policies' ? 'active' : ''}`}
                        onClick={() => setActiveTab('policies')}
                    >
                        My Policies
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'profile' && (
                        <div className="profile-section">
                            <div className="section-header">
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
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                )}
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="security-section">
                            <h2>Change Password</h2>
                            <form onSubmit={handlePasswordChange}>
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

                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                            </form>

                            <div className="logout-section">
                                <h3>Logout</h3>
                                <p>Sign out of your account</p>
                                <button className="btn btn-danger" onClick={handleLogout}>
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'policies' && (
                        <div className="policies-section">
                            <h2>My Policies</h2>
                            {policiesLoading ? (
                                <div className="loading">Loading policies...</div>
                            ) : policies.length === 0 ? (
                                <div className="no-policies">
                                    <p>You don't have any policies yet.</p>
                                    <button className="btn btn-primary" onClick={() => navigate('/animal-policy-form')}>
                                        Buy Your First Policy
                                    </button>
                                </div>
                            ) : (
                                <div className="policies-grid">
                                    {policies.map((policy) => (
                                        <div key={policy.id} className="policy-card">
                                            <div className="policy-header">
                                                <h3>{policy.policyNumber}</h3>
                                                <span className={`status-badge status-${policy.status.toLowerCase()}`}>
                                                    {policy.status}
                                                </span>
                                            </div>
                                            <div className="policy-details">
                                                <p><strong>Cattle Type:</strong> {policy.cattleType}</p>
                                                <p><strong>Tag ID:</strong> {policy.tagId}</p>
                                                <p><strong>Coverage:</strong> ₹{policy.coverageAmount?.toLocaleString()}</p>
                                                <p><strong>Premium:</strong> ₹{policy.premium?.toLocaleString()}</p>
                                                <p><strong>Duration:</strong> {policy.duration}</p>
                                            </div>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => navigate(`/policy/${policy.id}`)}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerProfile;
