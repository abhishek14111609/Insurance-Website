# 🧪 Testing Guide - Customer Insurance Website

## ✅ **Quick Test Checklist**

### **1. Registration & Login (2 minutes)**
- [ ] Go to http://localhost:5174
- [ ] Click "Sign Up (Farmer)"
- [ ] Fill all required fields
- [ ] Click "Create Account"
- [ ] ✅ Should auto-login and redirect to home
- [ ] Logout from navbar dropdown
- [ ] Login again with same credentials
- [ ] ✅ Should successfully login

### **2. Cattle Insurance Purchase Flow (5 minutes)**
- [ ] Click "🐮 Cattle Insurance" in navbar
- [ ] Fill calculator:
  - Cattle Type: Cow or Buffalo
  - Age: 3-5 years
  - Breed: Any
  - Tag ID: TEST123
  - Milk Yield: 10-15 liters
  - Coverage: ₹50,000 - ₹2,00,000
- [ ] (Optional) Enter agent code: AG001
- [ ] Click "Proceed to Buy"
- [ ] ✅ Should navigate to policy form
- [ ] Review pre-filled owner details
- [ ] Click "Submit Application"
- [ ] ✅ **NEW:** Should navigate to Payment Page

### **3. Payment Simulation (3 minutes)**
- [ ] **Payment Page should show:**
  - Order summary on left
  - Payment methods: Card, UPI, Net Banking
  - Cattle details
  - Premium amount
- [ ] Select "Credit/Debit Card"
- [ ] Fill card details:
  - Card Number: 1234 5678 9012 3456
  - Name: Test User
  - Expiry: Any future date
  - CVV: 123
- [ ] Click "Pay ₹XXXX"
- [ ] ✅ Processing animation should show
- [ ] **90% chance:** Success page appears
- [ ] **10% chance:** Failure page appears (click retry)

### **4. Payment Success Verification (2 minutes)**
- [ ] **Success page should show:**
  - ✅ Animated checkmark
  - Policy number (POL-XXXXX)
  - Complete policy details
  - Next steps cards
  - Download & Print buttons
- [ ] Click "View My Policies"
- [ ] ✅ Should navigate to dashboard with policies tab active

### **5. Dashboard & Policies (3 minutes)**
- [ ] **Dashboard should show:**
  - Profile sidebar with avatar
  - Tabs: Profile, Policies, Claims, Renewals, Password
  - Active tab: "My Policies"
- [ ] **Policy card should display:**
  - Cattle type (Cow/Buffalo emoji)
  - Tag ID
  - Coverage amount
  - Premium
  - "Active" status badge (green)
  - Three buttons: View Details, Download PDF, File Claim
- [ ] Click "View Details"
- [ ] ✅ **NEW:** Should navigate to policy details page

### **6. Policy Details Page (2 minutes)**
- [ ] **Policy document should show:**
  - Company header (SecureLife Insurance)
  - Policy number
  - Active status badge
  - Policy information grid
  - Insured details
  - Cattle information
  - Coverage details
  - What's covered section
  - Terms & conditions
- [ ] Click "Download PDF" → Alert shown (placeholder)
- [ ] Click "Print Policy" → Browser print dialog
- [ ] Click "Back to Dashboard"
- [ ] ✅ Should return to dashboard

### **7. Profile Management (2 minutes)**
- [ ] Click "Profile" tab
- [ ] Click "Edit Profile"
- [ ] Modify any field (e.g., phone number)
- [ ] Click "Save Changes"
- [ ] ✅ Success message should appear
- [ ] Click "Change Password" tab
- [ ] Fill password fields
- [ ] Click "Update Password"
- [ ] ✅ Success message should appear

### **8. Navigation & Logout (1 minute)**
- [ ] Click "Home" in navbar
- [ ] Click "Cattle Insurance"
- [ ] Click profile dropdown in navbar
- [ ] Click "My Policies" → Should go to policies tab
- [ ] Click "Logout"
- [ ] ✅ Should redirect to home (logged out)

---

## 🎯 **Payment Failure Testing**

To test payment failure (10% random chance):
1. Complete steps 1-3 above
2. On payment page, submit payment multiple times
3. Eventually, you'll hit the 10% failure rate
4. **Failure page should show:**
   - ❌ Error icon
   - Error reason
   - Common issues grid
   - "Retry Payment" button
   - Help & support links
5. Click "Retry Payment"
6. ✅ Should go back to payment page

---

## 📱 **Responsive Testing**

### **Desktop (1920x1080)**
- [ ] All pages display properly
- [ ] Sidebar layouts work
- [ ] Grids show multiple columns

### **Tablet (768x1024)**
- [ ] Navigation collapses to hamburger
- [ ] Grids stack appropriately
- [ ] Touch-friendly buttons

### **Mobile (375x667)**
- [ ] Single column layout
- [ ] Hamburger menu works
- [ ] All buttons accessible
- [ ] Forms are usable

---

## 🔍 **Edge Cases to Test**

### **Authentication**
- [ ] Try accessing `/payment` without login → Redirects to login
- [ ] Try accessing `/profile` without login → Redirects to login
- [ ] Try accessing `/policy/123` without login → Redirects to login

### **Data Validation**
- [ ] Try registering with existing email → Error shown
- [ ] Try login with wrong password → Error shown
- [ ] Try submitting policy form without required fields → Validation errors

### **Policy Details**
- [ ] Try accessing `/policy/999999` (non-existent) → Redirects to profile
- [ ] View policy details for multiple policies
- [ ] Print functionality works

---

## 🐛 **Known Limitations (By Design)**

1. **localStorage-based:** Data clears on browser cache clear
2. **No real payment:** Simulation only (90% success rate)
3. **PDF Download:** Shows alert (not implemented yet)
4. **Email notifications:** Not implemented
5. **Claims processing:** Placeholder only

---

## ✅ **Success Criteria**

Your implementation is successful if:
- ✅ All 8 main tests pass
- ✅ Payment flow works (success & failure)
- ✅ Policy details page displays correctly
- ✅ Dashboard shows policies
- ✅ Navigation works smoothly
- ✅ Responsive on all devices
- ✅ No console errors
- ✅ Build completes successfully

---

## 🚀 **Quick Start Commands**

```bash
# Start development server
cd "d:\Reimvide\Insurance Website\Customer Frontend"
npm run dev

# Open browser
# Navigate to: http://localhost:5174

# Build for production
npm run build
```

---

## 📊 **Test Data**

### **Sample Customer:**
- Name: Ramesh Kumar
- Email: ramesh@example.com
- Password: test123
- Phone: 9876543210
- City: Mumbai
- Pincode: 400001

### **Sample Cattle:**
- Type: Cow
- Age: 4 years
- Breed: Jersey
- Tag ID: MH01-2024-001
- Milk Yield: 12 liters/day
- Coverage: ₹1,00,000

### **Sample Agent Code:**
- Code: AG001 (if agents are set up)

---

## 🎉 **Expected Results**

After completing all tests, you should have:
1. ✅ Registered customer account
2. ✅ Active cattle insurance policy
3. ✅ Policy visible in dashboard
4. ✅ Full policy document accessible
5. ✅ Commission recorded (if agent code used)
6. ✅ All navigation working
7. ✅ Responsive design verified

---

**Happy Testing!** 🧪

If you encounter any issues, check:
1. Browser console for errors
2. Network tab for failed requests
3. localStorage for data persistence
4. React DevTools for component state

---

**Last Updated:** 2026-01-09 19:15 IST
