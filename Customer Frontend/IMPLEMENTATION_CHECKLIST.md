# Implementation Checklist - Customer Frontend

## 🔴 CRITICAL (Must Implement Before Launch)

### 1. Backend API Integration
- [ ] Create Node.js/Express backend server
- [ ] Set up MySQL/PostgreSQL database
- [ ] Implement JWT authentication endpoints
- [ ] Create policy CRUD APIs
- [ ] Add agent management APIs
- [ ] Set up CORS configuration
- [ ] Add API error handling middleware

**Files to Create:**
- `backend/server.js`
- `backend/routes/auth.js`
- `backend/routes/policies.js`
- `backend/routes/agents.js`
- `backend/middleware/auth.js`

**Frontend Changes:**
- Create `src/services/api.js`
- Update `src/utils/authUtils.js` to use API
- Add axios dependency: `npm install axios`

---

### 2. Payment Gateway Integration (Razorpay)
- [ ] Sign up for Razorpay account
- [ ] Get API keys (test & live)
- [ ] Install Razorpay SDK: `npm install razorpay`
- [ ] Update PaymentPage.jsx with real integration
- [ ] Add payment verification on backend
- [ ] Implement webhook handling
- [ ] Add refund functionality

**Files to Update:**
- `src/pages/PaymentPage.jsx` (Lines 34-98)
- Create `backend/routes/payments.js`
- Create `backend/webhooks/razorpay.js`

**Environment Variables:**
```env
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

---

### 3. Agent Authentication System
- [ ] Create `src/utils/agentAuthUtils.js`
- [ ] Add agent login API endpoint
- [ ] Update AgentLogin.jsx to use real auth
- [ ] Create AgentProtectedRoute component
- [ ] Add agent session management
- [ ] Update AgentLayout to check auth

**Files to Create:**
- `src/utils/agentAuthUtils.js`
- `src/components/Agent/AgentProtectedRoute.jsx`

**Files to Update:**
- `src/pages/Agent/AgentLogin.jsx` (Remove hardcoded credentials)
- `src/App.jsx` (Add AgentProtectedRoute wrapper)

**Code Template:**
```javascript
// src/utils/agentAuthUtils.js
export const loginAgent = async (email, password) => {
  const response = await fetch('/api/agent/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('agent_token', data.token);
    localStorage.setItem('current_agent', JSON.stringify(data.agent));
  }
  return data;
};

export const isAgentLoggedIn = () => {
  return !!localStorage.getItem('agent_token');
};

export const getCurrentAgent = () => {
  const agent = localStorage.getItem('current_agent');
  return agent ? JSON.parse(agent) : null;
};

export const logoutAgent = () => {
  localStorage.removeItem('agent_token');
  localStorage.removeItem('current_agent');
};
```

---

### 4. Environment Configuration
- [ ] Create `.env` file
- [ ] Add `.env` to `.gitignore`
- [ ] Create `.env.example` template
- [ ] Update all hardcoded URLs to use env variables
- [ ] Set up production environment variables

**Create `.env`:**
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development

# Payment Gateway
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxx

# File Upload
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_preset

# Analytics
REACT_APP_GA_TRACKING_ID=UA-XXXXXXXXX-X
```

**Create `.env.example`:**
```env
REACT_APP_API_URL=
REACT_APP_RAZORPAY_KEY_ID=
REACT_APP_CLOUDINARY_CLOUD_NAME=
```

---

## 🟡 IMPORTANT (Implement Soon)

### 5. File Upload to Cloud Storage
- [ ] Sign up for Cloudinary account
- [ ] Get API credentials
- [ ] Install cloudinary: `npm install cloudinary`
- [ ] Update AnimalPolicyForm.jsx to upload to cloud
- [ ] Remove base64 encoding
- [ ] Add image compression
- [ ] Add file type validation

**Files to Update:**
- `src/pages/AnimalPolicyForm.jsx` (Lines 77-86)

**Code Template:**
```javascript
const handlePhotoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file');
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    const data = await response.json();
    setFormData({ ...formData, petPhoto: data.secure_url });
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Failed to upload image. Please try again.');
  }
};
```

---

### 6. PDF Generation
- [ ] Install dependencies: `npm install jspdf html2canvas`
- [ ] Update PolicyDetails.jsx handleDownload
- [ ] Create PDF template
- [ ] Add company logo
- [ ] Test PDF generation
- [ ] Add email PDF functionality

**Files to Update:**
- `src/pages/PolicyDetails.jsx` (Lines 22-24)

**Code Template:**
```javascript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const handleDownload = async () => {
  const element = document.querySelector('.policy-document');
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(`policy-${policy.policyNumber}.pdf`);
};
```

---

### 7. Claims Management System
- [ ] Create ClaimForm.jsx page
- [ ] Add claim filing API endpoint
- [ ] Create claim status tracking
- [ ] Add document upload for claims
- [ ] Update CustomerProfile.jsx claims tab
- [ ] Add claim notifications

**Files to Create:**
- `src/pages/ClaimForm.jsx`
- `src/pages/ClaimDetails.jsx`

**Files to Update:**
- `src/pages/CustomerProfile.jsx` (Lines 296-308)
- `src/App.jsx` (Add claim routes)

---

### 8. Notification System
- [ ] Create NotificationBell component
- [ ] Add notification API endpoints
- [ ] Implement email notifications (SendGrid/AWS SES)
- [ ] Add SMS notifications (Twilio)
- [ ] Create notification preferences page
- [ ] Add push notifications (optional)

**Files to Create:**
- `src/components/NotificationBell.jsx`
- `src/pages/NotificationSettings.jsx`
- `backend/services/email.js`
- `backend/services/sms.js`

---

### 9. Error Boundaries & Loading States
- [ ] Create ErrorBoundary component
- [ ] Wrap App in ErrorBoundary
- [ ] Create LoadingSpinner component
- [ ] Add loading states to all async operations
- [ ] Create skeleton screens
- [ ] Add error retry logic

**Files to Create:**
- `src/components/ErrorBoundary.jsx`
- `src/components/LoadingSpinner.jsx`
- `src/components/SkeletonLoader.jsx`

**Files to Update:**
- `src/main.jsx` (Wrap with ErrorBoundary)

---

### 10. Form Validation Enhancement
- [ ] Install react-hook-form: `npm install react-hook-form`
- [ ] Update all forms to use react-hook-form
- [ ] Add custom validation rules
- [ ] Add real-time error messages
- [ ] Add field-level validation

**Files to Update:**
- `src/pages/Register.jsx`
- `src/pages/Login.jsx`
- `src/pages/AnimalPolicyForm.jsx`
- `src/pages/CustomerProfile.jsx`

---

## 🟢 NICE TO HAVE (Future Enhancements)

### 11. Testing Suite
- [ ] Install testing libraries: `npm install --save-dev vitest @testing-library/react`
- [ ] Write unit tests for utils
- [ ] Write component tests
- [ ] Add integration tests
- [ ] Set up E2E tests with Cypress
- [ ] Add test coverage reports

**Files to Create:**
- `src/utils/__tests__/authUtils.test.js`
- `src/components/__tests__/Navbar.test.jsx`
- `cypress/e2e/purchase-flow.cy.js`

---

### 12. SEO Optimization
- [ ] Install react-helmet-async: `npm install react-helmet-async`
- [ ] Add meta tags to all pages
- [ ] Create sitemap.xml
- [ ] Add robots.txt
- [ ] Implement structured data (JSON-LD)
- [ ] Add Open Graph tags

**Files to Update:**
- All page components (add Helmet)
- `public/robots.txt`
- `public/sitemap.xml`

---

### 13. Performance Optimization
- [ ] Implement code splitting
- [ ] Add lazy loading for routes
- [ ] Optimize images
- [ ] Add service worker for caching
- [ ] Implement virtual scrolling for large lists
- [ ] Add bundle analyzer

**Code Changes:**
```javascript
// Lazy load routes
const Home = lazy(() => import('./pages/Home'));
const AnimalInsurance = lazy(() => import('./pages/AnimalInsurance'));

// In App.jsx
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<Home />} />
    ...
  </Routes>
</Suspense>
```

---

### 14. Accessibility Improvements
- [ ] Add ARIA labels to all interactive elements
- [ ] Implement keyboard navigation
- [ ] Add focus management in modals
- [ ] Test with screen readers
- [ ] Ensure color contrast compliance
- [ ] Add skip to content link

---

### 15. Analytics Integration
- [ ] Set up Google Analytics
- [ ] Add event tracking
- [ ] Track user journeys
- [ ] Monitor conversion rates
- [ ] Add heatmap tracking (Hotjar)

---

## 📋 Quick Fixes (Can Do Now)

### Fix 1: Remove Unused Import
**File:** `src/App.jsx` (Line 1)
```javascript
// Change from:
import { useState, useEffect } from 'react';

// To:
import { useEffect } from 'react';
```

### Fix 2: Replace Alerts with Toast
**Install:** `npm install react-toastify`

**Files to Update:**
- `src/pages/Agent/AgentTeam.jsx` (Lines 49, 78, 151)
- `src/pages/PolicyDetails.jsx` (Line 23)

```javascript
import { toast } from 'react-toastify';

// Replace alert() with:
toast.success('Success message');
toast.error('Error message');
toast.info('Info message');
```

### Fix 3: Create Constants File
**Create:** `src/constants/index.js`
```javascript
export const MAX_AGENT_LEVELS = 3;
export const COMMISSION_RATES = {
  LEVEL_1: 15,
  LEVEL_2: 10,
  LEVEL_3: 5
};
export const PAYMENT_METHODS = {
  CARD: 'card',
  UPI: 'upi',
  NETBANKING: 'netbanking'
};
export const POLICY_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};
```

---

## 📦 Dependencies to Install

### Production Dependencies
```bash
npm install axios react-hook-form react-toastify react-helmet-async jspdf html2canvas dompurify
```

### Development Dependencies
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom cypress
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All critical features implemented
- [ ] Backend API deployed and tested
- [ ] Database migrations run
- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Payment gateway in live mode
- [ ] Error monitoring setup (Sentry)
- [ ] Analytics configured
- [ ] SEO meta tags added
- [ ] Performance testing done
- [ ] Security audit passed
- [ ] Backup strategy in place

### Deployment Steps
1. [ ] Build production bundle: `npm run build`
2. [ ] Test production build locally: `npm run preview`
3. [ ] Deploy to hosting (Vercel/Netlify/AWS)
4. [ ] Configure custom domain
5. [ ] Set up SSL/HTTPS
6. [ ] Configure CDN
7. [ ] Set up monitoring
8. [ ] Test all features in production
9. [ ] Monitor error logs
10. [ ] Set up automated backups

---

## 📊 Progress Tracking

**Overall Completion:** 60%

- ✅ Frontend UI: 95%
- ✅ Customer Flow: 90%
- ✅ Agent Portal: 85%
- ⚠️ Backend Integration: 0%
- ⚠️ Payment Gateway: 0%
- ⚠️ File Upload: 20%
- ❌ Claims System: 0%
- ❌ Notifications: 0%
- ❌ Testing: 0%

**Estimated Time to Production:** 4-6 weeks

---

**Last Updated:** 2026-01-10  
**Next Review:** After backend integration
