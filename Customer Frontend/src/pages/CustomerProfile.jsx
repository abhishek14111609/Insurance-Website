import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    getCurrentCustomer,
    updateCustomerProfile,
    changePassword,
    getCustomerPolicies,
    logoutCustomer
} from '../utils/authUtils';
import './CustomerProfile.css';

const CustomerProfile = () => {
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'profile'); // profile, policies, claims, renewals, password
    const [isEditing, setIsEditing] = useState(false);

    // Forms State
    const [profileForm, setProfileForm] = useState({});
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Feedback State
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const current = getCurrentCustomer();
        if (!current) {
            navigate('/login');
            return;
        }
        setCustomer(current);
        setProfileForm(current);
    }, [navigate]);

    const handleLogout = () => {
        logoutCustomer();
        navigate('/');
    };

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        const result = updateCustomerProfile(profileForm);
        if (result.success) {
            setCustomer(result.user);
            setIsEditing(false);
            setSuccessMsg('Profile updated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } else {
            setErrorMsg(result.message);
        }
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setErrorMsg('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setErrorMsg('New password must be at least 6 characters');
            return;
        }

        const result = changePassword(passwordForm.currentPassword, passwordForm.newPassword);
        if (result.success) {
            setSuccessMsg(result.message);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccessMsg(''), 3000);
        } else {
            setErrorMsg(result.message);
        }
    };

    if (!customer) return null;

    const policies = getCustomerPolicies();

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-sidebar">
                    <div className="user-brief">
                        <div className="avatar-circle">
                            {customer.fullName.charAt(0)}
                        </div>
                        <h3>{customer.fullName}</h3>
                        <p>{customer.email}</p>
                    </div>

                    <nav className="profile-nav">
                        <button
                            className={activeTab === 'profile' ? 'active' : ''}
                            onClick={() => setActiveTab('profile')}
                        >
                            <span className="icon">👤</span> My Profile
                        </button>
                        <button
                            className={activeTab === 'policies' ? 'active' : ''}
                            onClick={() => setActiveTab('policies')}
                        >
                            <span className="icon">📄</span> My Policies
                        </button>
                        <button
                            className={activeTab === 'claims' ? 'active' : ''}
                            onClick={() => setActiveTab('claims')}
                        >
                            <span className="icon">🏥</span> My Claims
                        </button>
                        <button
                            className={activeTab === 'renewals' ? 'active' : ''}
                            onClick={() => setActiveTab('renewals')}
                        >
                            <span className="icon">🔄</span> Renewals
                        </button>
                        <button
                            className={activeTab === 'password' ? 'active' : ''}
                            onClick={() => setActiveTab('password')}
                        >
                            <span className="icon">🔒</span> Change Password
                        </button>
                        <button className="logout-btn" onClick={handleLogout}>
                            <span className="icon">🚪</span> Logout
                        </button>
                    </nav>
                </div>

                <div className="profile-content">
                    {successMsg && <div className="alert-success">{successMsg}</div>}
                    {errorMsg && <div className="alert-error">{errorMsg}</div>}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="tab-content animate-fade-in">
                            <div className="content-header">
                                <h2>Personal Information</h2>
                                {!isEditing && (
                                    <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
                                        ✏️ Edit Profile
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleProfileUpdate}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            value={profileForm.fullName || ''}
                                            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                            disabled={!isEditing}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            value={profileForm.email || ''}
                                            disabled={true}
                                            className="disabled-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            value={profileForm.phone || ''}
                                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                            disabled={!isEditing}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Date of Birth</label>
                                        <input
                                            type="date"
                                            value={profileForm.dateOfBirth || ''}
                                            onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                                            disabled={!isEditing}
                                            required
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Address</label>
                                        <textarea
                                            value={profileForm.address || ''}
                                            onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                            disabled={!isEditing}
                                            rows="2"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            value={profileForm.city || ''}
                                            onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                                            disabled={!isEditing}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <input
                                            type="text"
                                            value={profileForm.state || ''}
                                            onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                                            disabled={!isEditing}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Pincode</label>
                                        <input
                                            type="text"
                                            value={profileForm.pincode || ''}
                                            onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                                            disabled={!isEditing}
                                            required
                                        />
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="form-actions">
                                        <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary">Save Changes</button>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {/* Policies Tab */}
                    {activeTab === 'policies' && (
                        <div className="tab-content animate-fade-in">
                            <div className="content-header">
                                <h2>My Policies</h2>
                                <button className="btn btn-primary" onClick={() => navigate('/')}>+ Buy New Policy</button>
                            </div>

                            {policies.length > 0 ? (
                                <div className="policy-grid">
                                    {policies.map((policy, index) => (
                                        <div key={index} className="policy-card">
                                            <div className="policy-header">
                                                <span className="policy-type">🐾 Cattle Insurance</span>
                                                <span className="policy-status active">Active</span>
                                            </div>
                                            <div className="policy-body">
                                                <p><strong>Cattle Type:</strong> {policy.petType}</p>
                                                <p><strong>Tag/Name:</strong> {policy.tagId || policy.petName}</p>
                                                <p><strong>Value:</strong> ₹{policy.marketValue}</p>
                                                <p><strong>Premium:</strong> ₹{policy.premium}</p>
                                            </div>
                                            <div className="policy-footer">
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => navigate(`/policy/${policy.id}`)}
                                                >
                                                    View Details
                                                </button>
                                                <button className="btn btn-sm btn-outline">Download PDF</button>
                                                <button className="btn btn-sm btn-primary">File Claim</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <span style={{ fontSize: '4rem' }}>📄</span>
                                    <h3>No Policies Found</h3>
                                    <p>You haven't purchased any insurance policies yet.</p>
                                    <button className="btn btn-primary" onClick={() => navigate('/animal-insurance')}>
                                        Get Protected Now
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Claims Tab */}
                    {activeTab === 'claims' && (
                        <div className="tab-content animate-fade-in">
                            <div className="content-header">
                                <h2>My Claims</h2>
                                <button className="btn btn-primary">File New Claim</button>
                            </div>
                            <div className="empty-state">
                                <span style={{ fontSize: '4rem' }}>🏥</span>
                                <h3>No Claims Found</h3>
                                <p>You have no active or past claims.</p>
                            </div>
                        </div>
                    )}

                    {/* Renewals Tab */}
                    {activeTab === 'renewals' && (
                        <div className="tab-content animate-fade-in">
                            <div className="content-header">
                                <h2>Upcoming Renewals</h2>
                            </div>
                            <div className="empty-state">
                                <span style={{ fontSize: '4rem' }}>🔄</span>
                                <h3>No Renewals Due</h3>
                                <p>All your policies are up to date! Check back later.</p>
                            </div>
                        </div>
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <div className="tab-content animate-fade-in">
                            <div className="content-header">
                                <h2>Change Password</h2>
                            </div>
                            <form onSubmit={handlePasswordChange} style={{ maxWidth: '500px' }}>
                                <div className="form-group mb-3">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-4">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">Update Password</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerProfile;
