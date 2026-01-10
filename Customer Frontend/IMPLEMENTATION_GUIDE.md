# Frontend Implementation Guide - Step by Step
**Date:** 2026-01-10  
**Status:** 🚀 IMPLEMENTATION IN PROGRESS  
**Approach:** Modify existing code to match requirements

---

## 📋 IMPLEMENTATION PHASES

### **PHASE 1: POLICY PAGE REDESIGN** ✅ Starting Now
### **PHASE 2: NAVBAR RESTRUCTURING** 
### **PHASE 3: FORM UPDATES (4 PHOTOS)**
### **PHASE 4: MY POLICIES, CLAIMS, RENEWALS PAGES**
### **PHASE 5: NOTIFICATIONS**
### **PHASE 6: RAZORPAY INTEGRATION**

---

## 🎯 PHASE 1: POLICY PAGE REDESIGN

### **Current State:**
- ❌ Has premium calculator
- ❌ Dynamic pricing based on age/breed
- ❌ Complex form flow

### **Target State:**
- ✅ 3 fixed plan cards
- ✅ Simple "Select Plan" buttons
- ✅ No calculator

### **Files to Modify:**
1. `src/pages/AnimalInsurance.jsx` - Complete redesign
2. `src/pages/AnimalInsurance.css` - Update styles

### **Step 1.1: Create New Policy Page Component**

**File:** `src/pages/AnimalInsurance.jsx`

**Changes:**
```javascript
// REMOVE: Calculator logic, premium calculation
// REMOVE: Form fields (age, breed, etc.)
// ADD: 3 fixed plan cards
// ADD: "Select Plan" buttons that navigate to form
```

**New Structure:**
```jsx
<div className="policies-page">
  <Hero Section />
  
  <div className="plans-section">
    <h2>Choose Your Protection Plan</h2>
    
    <div className="plans-grid">
      {/* Plan 1: 1 Year */}
      <PlanCard 
        duration="1 Year"
        coverage="₹50,000"
        premium="₹2,460"
        features={[...]}
        onSelect={() => navigate to form}
      />
      
      {/* Plan 2: 2 Years */}
      <PlanCard 
        duration="2 Years"
        coverage="₹50,000"
        premium="₹4,620"
        features={[...]}
        onSelect={() => navigate to form}
      />
      
      {/* Plan 3: 3 Years */}
      <PlanCard 
        duration="3 Years"
        coverage="₹50,000"
        premium="₹6,590"
        features={[...]}
        onSelect={() => navigate to form}
      />
    </div>
  </div>
  
  <Benefits Section />
  <How It Works Section />
  <FAQ Section />
</div>
```

### **Step 1.2: Update CSS**

**File:** `src/pages/AnimalInsurance.css`

**Add:**
```css
.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.plan-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.plan-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}

.plan-card.recommended {
  border: 3px solid var(--primary-color);
  position: relative;
}

.plan-card.recommended::before {
  content: "BEST VALUE";
  position: absolute;
  top: -15px;
  right: 20px;
  background: var(--accent-color);
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
}
```

### **Step 1.3: Create Plan Data**

**File:** `src/constants/policyPlans.js` (NEW)

```javascript
export const POLICY_PLANS = [
  {
    id: '1_YEAR',
    duration: '1 Year',
    durationMonths: 12,
    coverage: 50000,
    premium: 2460,
    annualCost: 2460,
    recommended: false,
    features: [
      'Death due to Disease (HS, BQ, FMD)',
      'Accidental Death Coverage',
      'Natural Calamities Protection',
      'Permanent Total Disability',
      'Snake Bite Coverage',
      'Drowning Coverage',
      '24/7 Claim Support',
      'Quick Claim Settlement'
    ],
    description: 'Perfect for short-term protection'
  },
  {
    id: '2_YEAR',
    duration: '2 Years',
    durationMonths: 24,
    coverage: 50000,
    premium: 4620,
    annualCost: 2310,
    recommended: true, // Best value
    features: [
      'All 1-Year Plan Benefits',
      'Extended Coverage Period',
      'Save ₹300 vs Annual Renewal',
      'Priority Claim Processing',
      'Free Policy Renewal Reminder',
      'Dedicated Support Manager'
    ],
    description: 'Most popular choice - Best value for money'
  },
  {
    id: '3_YEAR',
    duration: '3 Years',
    durationMonths: 36,
    coverage: 50000,
    premium: 6590,
    annualCost: 2197,
    recommended: false,
    features: [
      'All 2-Year Plan Benefits',
      'Maximum Coverage Period',
      'Save ₹789 vs Annual Renewal',
      'VIP Claim Processing',
      'Free Annual Health Check Reminder',
      'Lifetime Support Access'
    ],
    description: 'Long-term peace of mind'
  }
];
```

---

## 🎯 PHASE 2: NAVBAR RESTRUCTURING

### **Current State:**
- Profile dropdown has: Profile, My Policies, Claims, Renewals
- Become Partner in main nav

### **Target State:**
- My Policies, Claims, Renewals as TOP-LEVEL items
- Profile dropdown only has: Dashboard, Settings, Logout

### **Files to Modify:**
1. `src/components/Navbar.jsx`
2. `src/components/Navbar.css`

### **Step 2.1: Update Navbar Component**

**File:** `src/components/Navbar.jsx`

**New Structure:**
```jsx
<nav className="navbar">
  <Logo />
  
  <div className="navbar-menu">
    <Link to="/">Home</Link>
    <Link to="/policies">Policies</Link>
    
    {customer ? (
      <>
        <Link to="/my-policies">My Policies</Link>
        <Link to="/claims">Claims</Link>
        <Link to="/renewals">Renewals</Link>
        
        <div className="profile-dropdown">
          <button>
            <Avatar>{customer.name[0]}</Avatar>
            <span>▼</span>
          </button>
          <div className="dropdown-content">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile Settings</Link>
            <button onClick={logout}>Logout</button>
          </div>
        </div>
        
        <NotificationBell />
      </>
    ) : (
      <>
        <Link to="/about-us">About Us</Link>
        <Link to="/contact-us">Contact Us</Link>
        <Link to="/become-partner">Become Partner</Link>
        <Link to="/login">Login</Link>
        <Link to="/register" className="navbar-btn">Sign Up</Link>
      </>
    )}
  </div>
</nav>
```

### **Step 2.2: Create Routes**

**File:** `src/App.jsx`

**Add Routes:**
```javascript
// New top-level routes
<Route path="/my-policies" element={
  <ProtectedRoute><MyPoliciesPage /></ProtectedRoute>
} />
<Route path="/claims" element={
  <ProtectedRoute><ClaimsPage /></ProtectedRoute>
} />
<Route path="/renewals" element={
  <ProtectedRoute><RenewalsPage /></ProtectedRoute>
} />
<Route path="/dashboard" element={
  <ProtectedRoute><CustomerDashboard /></ProtectedRoute>
} />
```

---

## 🎯 PHASE 3: FORM UPDATES (4 PHOTOS)

### **Current State:**
- 1 photo upload (base64)
- Stored in localStorage

### **Target State:**
- 4 photo uploads (Front, Back, Left, Right)
- Max 1MB each
- Preview before submission
- Validation: All 4 required

### **Files to Modify:**
1. `src/pages/AnimalPolicyForm.jsx`
2. `src/pages/AnimalPolicyForm.css`

### **Step 3.1: Update Form State**

**File:** `src/pages/AnimalPolicyForm.jsx`

**Change:**
```javascript
// OLD
const [formData, setFormData] = useState({
  petPhoto: null
});

// NEW
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
```

### **Step 3.2: Create Photo Upload Component**

**File:** `src/components/PhotoUpload.jsx` (NEW)

```jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import './PhotoUpload.css';

const PhotoUpload = ({ side, label, value, onChange, required }) => {
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (1MB = 1048576 bytes)
    if (file.size > 1048576) {
      setError('File size must be less than 1MB');
      return;
    }

    setError('');
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(side, file, reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="photo-upload">
      <label className="photo-upload-label">
        {label} {required && <span className="required">*</span>}
      </label>
      
      <div className="photo-upload-container">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="photo-upload-input"
          id={`photo-${side}`}
        />
        
        <label htmlFor={`photo-${side}`} className="photo-upload-box">
          {value ? (
            <div className="photo-preview">
              <img src={value} alt={`${label} preview`} />
              <div className="photo-overlay">
                <span>Change Photo</span>
              </div>
            </div>
          ) : (
            <div className="photo-placeholder">
              <span className="upload-icon">📷</span>
              <span>Click to upload</span>
              <span className="upload-hint">Max 1MB</span>
            </div>
          )}
        </label>
      </div>
      
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

PhotoUpload.propTypes = {
  side: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool
};

export default PhotoUpload;
```

### **Step 3.3: Use in Form**

**File:** `src/pages/AnimalPolicyForm.jsx`

```jsx
import PhotoUpload from '../components/PhotoUpload';

// In the form
<div className="photo-upload-section">
  <h3>Cattle Photos (Required)</h3>
  <p className="section-hint">Upload clear photos from all 4 sides</p>
  
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
```

### **Step 3.4: Form Validation**

```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  
  // Validate all 4 photos uploaded
  const allPhotosUploaded = Object.values(photos).every(photo => photo !== null);
  
  if (!allPhotosUploaded) {
    alert('Please upload all 4 cattle photos');
    return;
  }
  
  // Proceed with form submission
  // For now, store in state (will send to backend later)
  const policyData = {
    ...formData,
    photos: photos,
    selectedPlan: location.state?.selectedPlan
  };
  
  navigate('/payment', { state: { policyData } });
};
```

---

## 🎯 PHASE 4: MY POLICIES, CLAIMS, RENEWALS PAGES

### **Step 4.1: Create My Policies Page**

**File:** `src/pages/MyPolicies.jsx` (NEW)

```jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCustomerPolicies } from '../utils/authUtils';
import './MyPolicies.css';

const MyPolicies = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED, EXPIRED

  useEffect(() => {
    const customerPolicies = getCustomerPolicies();
    setPolicies(customerPolicies);
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { class: 'status-pending', icon: '🟡', text: 'Pending Approval' },
      APPROVED: { class: 'status-approved', icon: '🟢', text: 'Active' },
      REJECTED: { class: 'status-rejected', icon: '🔴', text: 'Rejected' },
      EXPIRED: { class: 'status-expired', icon: '⚪', text: 'Expired' }
    };
    return badges[status] || badges.PENDING;
  };

  const filteredPolicies = filter === 'ALL' 
    ? policies 
    : policies.filter(p => p.status === filter);

  return (
    <div className="my-policies-page">
      <div className="page-header">
        <h1>My Policies</h1>
        <button className="btn btn-primary" onClick={() => navigate('/policies')}>
          + Buy New Policy
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={filter === 'ALL' ? 'active' : ''} 
          onClick={() => setFilter('ALL')}
        >
          All ({policies.length})
        </button>
        <button 
          className={filter === 'PENDING' ? 'active' : ''} 
          onClick={() => setFilter('PENDING')}
        >
          Pending ({policies.filter(p => p.status === 'PENDING').length})
        </button>
        <button 
          className={filter === 'APPROVED' ? 'active' : ''} 
          onClick={() => setFilter('APPROVED')}
        >
          Active ({policies.filter(p => p.status === 'APPROVED').length})
        </button>
        <button 
          className={filter === 'EXPIRED' ? 'active' : ''} 
          onClick={() => setFilter('EXPIRED')}
        >
          Expired ({policies.filter(p => p.status === 'EXPIRED').length})
        </button>
      </div>

      {/* Policies Grid */}
      {filteredPolicies.length > 0 ? (
        <div className="policies-grid">
          {filteredPolicies.map((policy) => {
            const badge = getStatusBadge(policy.status);
            return (
              <div key={policy.id} className="policy-card">
                <div className="policy-card-header">
                  <span className="policy-number">{policy.policyNumber}</span>
                  <span className={`status-badge ${badge.class}`}>
                    {badge.icon} {badge.text}
                  </span>
                </div>

                <div className="policy-card-body">
                  <div className="cattle-info">
                    <span className="cattle-icon">
                      {policy.petType === 'cow' ? '🐄' : '🐃'}
                    </span>
                    <div>
                      <strong>{policy.tagId || policy.petName}</strong>
                      <p>{policy.petBreed} • {policy.petAge} years</p>
                    </div>
                  </div>

                  <div className="policy-details">
                    <div className="detail-row">
                      <span>Coverage:</span>
                      <strong>₹{policy.coverageAmount?.toLocaleString()}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Premium:</span>
                      <strong>₹{policy.premium?.toLocaleString()}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Period:</span>
                      <span>{policy.startDate} to {policy.endDate}</span>
                    </div>
                  </div>
                </div>

                <div className="policy-card-footer">
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => navigate(`/policy/${policy.id}`)}
                  >
                    View Details
                  </button>
                  
                  {policy.status === 'APPROVED' && (
                    <>
                      <button className="btn btn-sm btn-outline">
                        Download PDF
                      </button>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate('/claims/new', { state: { policy } })}
                      >
                        File Claim
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">📄</span>
          <h3>No Policies Found</h3>
          <p>
            {filter === 'ALL' 
              ? "You haven't purchased any policies yet."
              : `No ${filter.toLowerCase()} policies found.`
            }
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/policies')}>
            Get Protected Now
          </button>
        </div>
      )}
    </div>
  );
};

export default MyPolicies;
```

### **Step 4.2: Create Claims Page**

**File:** `src/pages/Claims.jsx` (NEW)

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Claims.css';

const Claims = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    // Load claims from localStorage (will be API later)
    const savedClaims = JSON.parse(localStorage.getItem('customer_claims') || '[]');
    setClaims(savedClaims);
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      SUBMITTED: { class: 'status-submitted', text: 'Submitted' },
      UNDER_REVIEW: { class: 'status-review', text: 'Under Review' },
      APPROVED: { class: 'status-approved', text: 'Approved' },
      REJECTED: { class: 'status-rejected', text: 'Rejected' },
      SETTLED: { class: 'status-settled', text: 'Settled' }
    };
    return badges[status] || badges.SUBMITTED;
  };

  return (
    <div className="claims-page">
      <div className="page-header">
        <h1>My Claims</h1>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/claims/new')}
        >
          + File New Claim
        </button>
      </div>

      {claims.length > 0 ? (
        <div className="claims-list">
          {claims.map((claim) => {
            const badge = getStatusBadge(claim.status);
            return (
              <div key={claim.id} className="claim-card">
                <div className="claim-header">
                  <div>
                    <h3>Claim #{claim.claimNumber}</h3>
                    <p>Policy: {claim.policyNumber}</p>
                  </div>
                  <span className={`status-badge ${badge.class}`}>
                    {badge.text}
                  </span>
                </div>

                <div className="claim-body">
                  <div className="claim-detail">
                    <span>Claim Type:</span>
                    <strong>{claim.claimType}</strong>
                  </div>
                  <div className="claim-detail">
                    <span>Incident Date:</span>
                    <span>{claim.incidentDate}</span>
                  </div>
                  <div className="claim-detail">
                    <span>Claimed Amount:</span>
                    <strong>₹{claim.claimedAmount?.toLocaleString()}</strong>
                  </div>
                  <div className="claim-detail">
                    <span>Filed On:</span>
                    <span>{new Date(claim.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => navigate(`/claims/${claim.id}`)}
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">🏥</span>
          <h3>No Claims Found</h3>
          <p>You have no active or past claims.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/claims/new')}
          >
            File Your First Claim
          </button>
        </div>
      )}
    </div>
  );
};

export default Claims;
```

### **Step 4.3: Create Renewals Page**

**File:** `src/pages/Renewals.jsx` (NEW)

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerPolicies } from '../utils/authUtils';
import './Renewals.css';

const Renewals = () => {
  const navigate = useNavigate();
  const [expiringPolicies, setExpiringPolicies] = useState([]);

  useEffect(() => {
    const policies = getCustomerPolicies();
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Filter policies expiring in next 30 days
    const expiring = policies.filter(policy => {
      const endDate = new Date(policy.endDate);
      return endDate >= today && endDate <= thirtyDaysLater;
    });

    setExpiringPolicies(expiring);
  }, []);

  const getDaysUntilExpiry = (endDate) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="renewals-page">
      <div className="page-header">
        <h1>Policy Renewals</h1>
        <p>Renew your policies before they expire</p>
      </div>

      {expiringPolicies.length > 0 ? (
        <div className="renewals-grid">
          {expiringPolicies.map((policy) => {
            const daysLeft = getDaysUntilExpiry(policy.endDate);
            const isUrgent = daysLeft <= 7;

            return (
              <div key={policy.id} className={`renewal-card ${isUrgent ? 'urgent' : ''}`}>
                {isUrgent && (
                  <div className="urgent-badge">⚠️ Expires in {daysLeft} days</div>
                )}

                <div className="renewal-header">
                  <h3>{policy.policyNumber}</h3>
                  <span className="expiry-date">
                    Expires: {policy.endDate}
                  </span>
                </div>

                <div className="renewal-body">
                  <div className="cattle-info">
                    <span>{policy.petType === 'cow' ? '🐄' : '🐃'}</span>
                    <div>
                      <strong>{policy.tagId || policy.petName}</strong>
                      <p>{policy.petBreed}</p>
                    </div>
                  </div>

                  <div className="renewal-details">
                    <div className="detail-row">
                      <span>Coverage:</span>
                      <strong>₹{policy.coverageAmount?.toLocaleString()}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Days Left:</span>
                      <strong className={isUrgent ? 'text-error' : ''}>
                        {daysLeft} days
                      </strong>
                    </div>
                  </div>
                </div>

                <button 
                  className="btn btn-primary btn-block"
                  onClick={() => navigate('/renew', { state: { policy } })}
                >
                  Renew Now
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">🔄</span>
          <h3>No Renewals Due</h3>
          <p>All your policies are up to date! Check back later.</p>
          <button className="btn btn-primary" onClick={() => navigate('/my-policies')}>
            View My Policies
          </button>
        </div>
      )}
    </div>
  );
};

export default Renewals;
```

---

## 🎯 PHASE 5: NOTIFICATIONS

### **Step 5.1: Create Notification Bell Component**

**File:** `src/components/NotificationBell.jsx` (NEW)

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load notifications (will be from API later)
    const saved = JSON.parse(localStorage.getItem('customer_notifications') || '[]');
    setNotifications(saved);
    setUnreadCount(saved.filter(n => !n.isRead).length);
  }, []);

  const markAsRead = (id) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('customer_notifications', JSON.stringify(updated));
    setUnreadCount(updated.filter(n => !n.isRead).length);
  };

  return (
    <div className="notification-bell">
      <button 
        className="bell-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map(notification => (
                <Link
                  key={notification.id}
                  to={notification.link}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => {
                    markAsRead(notification.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="notification-icon">{notification.icon}</div>
                  <div className="notification-content">
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {!notification.isRead && <span className="unread-dot"></span>}
                </Link>
              ))
            ) : (
              <div className="notification-empty">
                <p>No notifications</p>
              </div>
            )}
          </div>

          {notifications.length > 5 && (
            <Link to="/notifications" className="view-all-link">
              View All Notifications
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
```

---

## 🎯 PHASE 6: RAZORPAY INTEGRATION

### **Step 6.1: Install Razorpay**

```bash
npm install razorpay
```

### **Step 6.2: Create Razorpay Utility**

**File:** `src/utils/razorpayUtils.js` (NEW)

```javascript
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiatePayment = async (orderData, onSuccess, onFailure) => {
  const res = await loadRazorpayScript();

  if (!res) {
    alert('Razorpay SDK failed to load. Please check your internet connection.');
    return;
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: orderData.amount, // Amount in paise
    currency: 'INR',
    name: 'SecureLife Insurance',
    description: 'Cattle Insurance Premium',
    order_id: orderData.orderId,
    handler: function (response) {
      // Payment successful
      onSuccess({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature
      });
    },
    prefill: {
      name: orderData.customerName,
      email: orderData.customerEmail,
      contact: orderData.customerPhone
    },
    theme: {
      color: '#0f4c75'
    },
    modal: {
      ondismiss: function() {
        onFailure('Payment cancelled by user');
      }
    }
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};
```

### **Step 6.3: Update Payment Page**

**File:** `src/pages/PaymentPage.jsx`

```javascript
import { initiatePayment } from '../utils/razorpayUtils';

const handlePayment = async () => {
  setIsProcessing(true);

  try {
    // Step 1: Create order on backend
    const response = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: premium,
        policyData: policyData
      })
    });

    const { orderId, amount } = await response.json();

    // Step 2: Initiate Razorpay payment
    await initiatePayment(
      {
        orderId,
        amount,
        customerName: customer.fullName,
        customerEmail: customer.email,
        customerPhone: customer.phone
      },
      // On Success
      (paymentResponse) => {
        // Verify payment on backend
        verifyPayment(paymentResponse);
      },
      // On Failure
      (error) => {
        setIsProcessing(false);
        navigate('/payment-failure', { state: { reason: error } });
      }
    );
  } catch (error) {
    setIsProcessing(false);
    alert('Payment initiation failed. Please try again.');
  }
};

const verifyPayment = async (paymentResponse) => {
  try {
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentResponse)
    });

    const result = await response.json();

    if (result.success) {
      // Payment verified, create policy
      navigate('/payment-success', {
        state: {
          policyNumber: result.policyNumber,
          premium: premium
        }
      });
    } else {
      navigate('/payment-failure', {
        state: { reason: 'Payment verification failed' }
      });
    }
  } catch (error) {
    navigate('/payment-failure', {
      state: { reason: 'Payment verification error' }
    });
  }
};
```

---

## 📋 IMPLEMENTATION CHECKLIST

### **Phase 1: Policy Page** ✅ IN PROGRESS
- [ ] Create `src/constants/policyPlans.js`
- [ ] Redesign `src/pages/AnimalInsurance.jsx`
- [ ] Update `src/pages/AnimalInsurance.css`
- [ ] Remove calculator logic
- [ ] Add 3 plan cards
- [ ] Test navigation to form

### **Phase 2: Navbar**
- [ ] Update `src/components/Navbar.jsx`
- [ ] Update `src/components/Navbar.css`
- [ ] Add My Policies, Claims, Renewals links
- [ ] Simplify profile dropdown
- [ ] Add NotificationBell component
- [ ] Test responsive menu

### **Phase 3: 4 Photos**
- [ ] Create `src/components/PhotoUpload.jsx`
- [ ] Create `src/components/PhotoUpload.css`
- [ ] Update `src/pages/AnimalPolicyForm.jsx`
- [ ] Add 4 photo upload fields
- [ ] Add validation (all 4 required, max 1MB)
- [ ] Add preview functionality
- [ ] Test file uploads

### **Phase 4: New Pages**
- [ ] Create `src/pages/MyPolicies.jsx`
- [ ] Create `src/pages/MyPolicies.css`
- [ ] Create `src/pages/Claims.jsx`
- [ ] Create `src/pages/Claims.css`
- [ ] Create `src/pages/Renewals.jsx`
- [ ] Create `src/pages/Renewals.css`
- [ ] Add routes in `src/App.jsx`
- [ ] Test all pages

### **Phase 5: Notifications**
- [ ] Create `src/components/NotificationBell.jsx`
- [ ] Create `src/components/NotificationBell.css`
- [ ] Add to Navbar
- [ ] Test notification dropdown

### **Phase 6: Razorpay**
- [ ] Install razorpay package
- [ ] Create `src/utils/razorpayUtils.js`
- [ ] Update `src/pages/PaymentPage.jsx`
- [ ] Add environment variables
- [ ] Test payment flow (test mode)

---

## 🚀 NEXT STEPS

**I will now start implementing Phase 1 (Policy Page Redesign).**

After each phase, I'll:
1. Show you what was changed
2. Ask for your approval
3. Move to next phase

**Ready to begin!** 🎯
