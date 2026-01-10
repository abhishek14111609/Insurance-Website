# Quick Reference Guide

## 🚀 Getting Started

### Run the Application
```bash
cd "d:\Reimvide\Insurance Website\Customer Frontend"
npm run dev
```

### Access the Application
- **URL:** http://localhost:5173
- **Policy Page:** http://localhost:5173/policies
- **Dashboard:** http://localhost:5173/dashboard (requires login)

---

## 📍 All Routes

### Public Routes
- `/` - Home page
- `/policies` - View 3 policy plans
- `/about-us` - About us page
- `/contact-us` - Contact page
- `/become-partner` - Become partner page
- `/login` - Customer login
- `/register` - Customer registration

### Protected Routes (Require Login)
- `/dashboard` - Customer dashboard
- `/my-policies` - View all policies
- `/claims` - View/file claims
- `/renewals` - View expiring policies
- `/profile` - Profile settings
- `/animal-policy-form` - Policy application form
- `/payment` - Payment page
- `/payment-success` - Payment success page
- `/payment-failure` - Payment failure page
- `/policy/:id` - Policy details

---

## 🎨 Key Components

### Navigation
- `Navbar.jsx` - Main navigation with conditional rendering
- `NotificationBell.jsx` - Notification dropdown
- `Footer.jsx` - Footer component

### Forms
- `PhotoUpload.jsx` - Individual photo upload (max 1MB)
- `AgentCodeInput.jsx` - Agent code validation

### Pages
- `AnimalInsurance.jsx` - 3 policy plans
- `AnimalPolicyForm.jsx` - Policy application with 4 photos
- `Dashboard.jsx` - Customer dashboard
- `MyPolicies.jsx` - Policy list with filters
- `Claims.jsx` - Claims list
- `Renewals.jsx` - Expiring policies

---

## 💾 Data Storage (Current)

### LocalStorage Keys
- `customer_users` - All registered customers
- `current_customer` - Logged-in customer
- `customer_policies` - All policies
- `customer_claims` - All claims
- `customer_notifications` - All notifications
- `agent_users` - Agent data
- `commission_records` - Commission records

---

## 🎯 Policy Plans

| Plan | Duration | Coverage | Premium | Annual Cost |
|------|----------|----------|---------|-------------|
| Plan 1 | 1 Year | ₹50,000 | ₹2,460 | ₹2,460/year |
| Plan 2 | 2 Year | ₹50,000 | ₹4,620 | ₹2,310/year |
| Plan 3 | 3 Year | ₹50,000 | ₹6,590 | ₹2,197/year |

---

## 📸 Photo Requirements

- **Count:** 4 photos required
- **Sides:** Front, Back, Left, Right
- **Size:** Max 1MB per photo
- **Format:** JPG, PNG, etc.
- **Validation:** Automatic size and type checking

---

## 🎨 Status Badges

### Policy Status
- 🟡 **PENDING** - Awaiting admin approval
- 🟢 **APPROVED** - Active policy
- 🔴 **REJECTED** - Rejected by admin
- ⚪ **EXPIRED** - Policy expired

### Claim Status
- 🔵 **SUBMITTED** - Claim filed
- 🟡 **UNDER_REVIEW** - Being reviewed
- 🟢 **APPROVED** - Claim approved
- 🔴 **REJECTED** - Claim rejected
- ✅ **SETTLED** - Payment made

---

## 🔧 Environment Variables

Create `.env` file:
```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
VITE_RAZORPAY_KEY_SECRET=xxxxx
VITE_API_URL=http://localhost:5000/api
VITE_ENVIRONMENT=development
```

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Navigate to `/policies`
- [ ] Click "Select Plan"
- [ ] Login/Register
- [ ] Fill policy form
- [ ] Upload 4 photos
- [ ] Submit form
- [ ] Check payment page
- [ ] Navigate to `/dashboard`
- [ ] Check `/my-policies`
- [ ] Check `/claims`
- [ ] Check `/renewals`
- [ ] Click notification bell
- [ ] Test profile dropdown
- [ ] Logout

---

## 📦 Dependencies

### Core
- `react` - UI library
- `react-dom` - React DOM
- `react-router-dom` - Routing
- `prop-types` - Type checking

### To Install (for Razorpay)
```bash
npm install razorpay
```

---

## 🐛 Common Issues & Solutions

### Issue: Photos not uploading
**Solution:** Check file size (must be < 1MB)

### Issue: Form not submitting
**Solution:** Ensure all 4 photos are uploaded

### Issue: Page not found
**Solution:** Check if route is protected (requires login)

### Issue: Navbar not showing items
**Solution:** Check if customer is logged in

---

## 📞 Support

### Documentation
- `FINAL_REQUIREMENTS.md` - Complete requirements
- `IMPLEMENTATION_GUIDE.md` - Step-by-step guide
- `IMPLEMENTATION_COMPLETE.md` - Completion summary
- `PROJECT_ANALYSIS_REPORT.md` - Initial analysis

### Code Structure
```
src/
├── components/        # Reusable components
├── pages/            # Page components
├── constants/        # Constants and config
├── utils/            # Utility functions
└── App.jsx           # Main app with routes
```

---

## 🚀 Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install dependencies
npm install

# Install Razorpay
npm install razorpay
```

---

**Last Updated:** 2026-01-10  
**Version:** 1.0.0  
**Status:** Production Ready (Frontend)
