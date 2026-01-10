# Cattle Insurance Platform - FINAL REQUIREMENTS
**Date:** 2026-01-10  
**Status:** ✅ APPROVED BY CLIENT  
**Implementation Ready:** YES

---

## 🎯 CLIENT CONFIRMED REQUIREMENTS

### **CRITICAL CLARIFICATIONS**

1. ✅ **Photo Storage:** Store in local folder (NOT cloud storage)
2. ✅ **Photo Size:** Max 1MB per photo (NOT 5MB)
3. ✅ **No Phone/SMS:** Email notifications only (NO SMS/OTP)
4. ✅ **Navbar Structure:** My Policies, Claims, Renewals as separate navbar items
5. ✅ **Simplified Claims:** Only Death (disease/accident) with photos
6. ✅ **Razorpay:** Client has test keys ready
7. ✅ **Renewal Reminders:** 30, 15, 7, 3 days before expiry
8. ✅ **No Loyalty Discount:** Same pricing for renewals

---

## 📋 COMPLETE FEATURE LIST

### **1. POLICY PLANS** (Fixed Pricing)

| Plan | Coverage | Duration | Premium |
|------|----------|----------|---------|
| Plan 1 | ₹50,000 | 1 Year | ₹2,460 |
| Plan 2 | ₹50,000 | 2 Years | ₹4,620 |
| Plan 3 | ₹50,000 | 3 Years | ₹6,590 |

**Policy Page Design:**
```
┌─────────────────┬─────────────────┬─────────────────┐
│   1 YEAR PLAN   │   2 YEAR PLAN   │   3 YEAR PLAN   │
│                 │                 │                 │
│   ₹50,000       │   ₹50,000       │   ₹50,000       │
│   Coverage      │   Coverage      │   Coverage      │
│                 │                 │                 │
│   ₹2,460        │   ₹4,620        │   ₹6,590        │
│   Premium       │   Premium       │   Premium       │
│                 │                 │                 │
│  [Select Plan]  │  [Select Plan]  │  [Select Plan]  │
└─────────────────┴─────────────────┴─────────────────┘
```

---

### **2. POLICY FORM FIELDS**

#### **Cattle Details**
- Cattle Type (Cow/Buffalo)
- Tag ID / Name
- Age (years)
- Breed (dropdown)
- Gender (Male/Female)
- Milk Yield (optional)
- Market Value (auto-filled: ₹50,000)
- Health Status (dropdown)

#### **Owner Details**
- Full Name (auto-filled if logged in)
- Email (auto-filled)
- Phone Number (auto-filled)
- Address
- City
- State
- Pincode

#### **Photo Upload** 🚨 CRITICAL
- **4 Photos Required:**
  1. Front view
  2. Back view
  3. Left side view
  4. Right side view
- **Max 1MB per photo**
- **Store in folder:** `public/uploads/cattle-photos/{policyId}/`
- **File naming:** `{policyId}_front.jpg`, `{policyId}_back.jpg`, etc.
- **Preview before submission**
- **Validation:** All 4 photos mandatory

#### **Agent Code**
- Optional field
- Validate against agent database
- Show agent name if valid

#### **Terms & Conditions**
- Checkbox required
- Link to T&C document

---

### **3. RAZORPAY PAYMENT INTEGRATION**

**Client Status:** ✅ Has test keys

**Payment Flow:**
1. User submits form
2. Create Razorpay order on backend
3. Open Razorpay checkout modal
4. User completes payment
5. Verify payment on backend
6. Create policy with status: PENDING
7. Send confirmation email

**Payment Options:**
- Credit/Debit Card
- UPI
- Net Banking
- Wallets (Paytm, PhonePe, etc.)

**Environment Variables Needed:**
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

---

### **4. POLICY STATUS WORKFLOW**

```
PAYMENT SUCCESS
    ↓
Status: PENDING
    ↓
Email: "Payment received, policy under review"
    ↓
Admin Dashboard: Shows new policy
    ↓
Admin Reviews: Photos + Details
    ↓
    ├─ APPROVE
    │   ↓
    │   Status: APPROVED
    │   ↓
    │   Generate PDF
    │   ↓
    │   Email PDF to customer
    │   ↓
    │   Add commission to agent (if applicable)
    │
    └─ REJECT
        ↓
        Status: REJECTED
        ↓
        Email rejection reason
        ↓
        Initiate refund
```

**Status Types:**
- PENDING (Yellow badge)
- APPROVED (Green badge)
- REJECTED (Red badge)
- EXPIRED (Gray badge)

---

### **5. AUTHENTICATION SYSTEM**

**Required:**
- ✅ Customer Registration
- ✅ Customer Login
- ✅ Forgot Password (Email reset link)
- ✅ Email Verification (OTP via email)
- ✅ Session Management
- ✅ Logout

**NOT Required:**
- ❌ Phone/SMS OTP
- ❌ Two-factor authentication

---

### **6. NAVBAR STRUCTURE**

**For Logged-Out Users:**
```
Logo | Home | Policies | About Us | Contact Us | Become Partner | Login | Register
```

**For Logged-In Customers:**
```
Logo | Home | Policies | My Policies | Claims | Renewals | Profile ▼ | Notifications 🔔
                                                              │
                                                              ├─ Dashboard
                                                              ├─ Profile Settings
                                                              └─ Logout
```

**Key Changes:**
- My Policies, Claims, Renewals are TOP-LEVEL navbar items (not in dropdown)
- Profile dropdown only has Dashboard, Settings, Logout

---

### **7. MY POLICIES PAGE**

**Display:**
- List all purchased policies
- Show status badge (PENDING/APPROVED/REJECTED/EXPIRED)
- Filter by status
- Search by policy number
- Sort by date

**Each Policy Card Shows:**
- Policy Number
- Cattle Type (Cow/Buffalo icon)
- Coverage: ₹50,000
- Premium paid
- Status badge
- Start date - End date
- Actions:
  - View Details (always)
  - Download PDF (only if APPROVED)
  - File Claim (only if APPROVED)
  - Renew (if expiring in 30 days or expired)

---

### **8. CLAIMS MANAGEMENT**

**Simplified Claim Types:**
1. Death due to disease
2. Accidental death

**Claim Form Fields:**
- Select policy (dropdown of APPROVED policies)
- Claim type (radio buttons)
- Date of incident
- Description of incident
- Upload photos (multiple)
- Claimed amount (max: ₹50,000)
- Bank details:
  - Account holder name
  - Account number
  - IFSC code
  - Bank name

**Claim Status:**
- SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED → SETTLED

**Photo Storage:**
- Store in: `public/uploads/claim-documents/{claimId}/`

---

### **9. RENEWALS PAGE**

**Features:**
- Show policies expiring in next 30 days
- "Renew Now" button
- Renewal form (pre-filled with existing data)
- Option to update cattle photos
- Same payment flow (Razorpay)
- Same pricing (no discount)

**Email Reminders:**
- 30 days before expiry
- 15 days before expiry
- 7 days before expiry
- 3 days before expiry

**Grace Period:** 15 days after expiry

---

### **10. NOTIFICATIONS**

**Types:**
1. **In-App Notifications**
   - Bell icon in navbar
   - Badge count for unread
   - Dropdown with recent notifications
   - Mark as read

2. **Email Notifications**
   - Welcome email on registration
   - Email verification OTP
   - Payment receipt
   - Policy pending approval
   - Policy approved (with PDF)
   - Policy rejected (with reason)
   - Claim status updates
   - Renewal reminders (30, 15, 7, 3 days)
   - Password reset

**NO SMS/Phone Notifications**

---

### **11. CONTACT US PAGE**

**Elements:**
- Contact form
- Office address
- Phone numbers
- Email addresses
- Working hours
- Social media links
- WhatsApp chat button

**NO Google Maps** (removed as per client)

---

### **12. ABOUT US PAGE**

**Content:**
- Company overview
- Mission & Vision
- Why choose us
- Team section
- IRDAI registration details
- Statistics (policies sold, claims settled)

---

### **13. BECOME A PARTNER PAGE**

**Simplified Version:**
- Agent registration form
- Requirements to become agent
- Support details
- Contact for partnership queries

**Removed:**
- Commission structure details
- Training information
- FAQs

---

## 🗂️ FILE STORAGE STRUCTURE

```
public/
└── uploads/
    ├── cattle-photos/
    │   ├── POL-123456/
    │   │   ├── POL-123456_front.jpg
    │   │   ├── POL-123456_back.jpg
    │   │   ├── POL-123456_left.jpg
    │   │   └── POL-123456_right.jpg
    │   └── POL-123457/
    │       └── ...
    └── claim-documents/
        ├── CLM-789012/
        │   ├── photo1.jpg
        │   ├── photo2.jpg
        │   └── ...
        └── CLM-789013/
            └── ...
```

**Backend Implementation:**
```javascript
// Using multer for file upload
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const policyId = req.body.policyId;
    const uploadPath = `public/uploads/cattle-photos/${policyId}`;
    
    // Create directory if doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const policyId = req.body.policyId;
    const side = req.body.side; // front, back, left, right
    const ext = path.extname(file.originalname);
    cb(null, `${policyId}_${side}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files allowed'));
    }
    cb(null, true);
  }
});
```

---

## 🗄️ DATABASE SCHEMA (UPDATED)

```sql
-- Policies Table
CREATE TABLE policies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  policy_number VARCHAR(50) UNIQUE,
  user_id INT,
  plan_type ENUM('1_YEAR', '2_YEAR', '3_YEAR'),
  coverage_amount DECIMAL(10,2) DEFAULT 50000.00,
  premium DECIMAL(10,2),
  
  -- Cattle Details
  cattle_type ENUM('COW', 'BUFFALO'),
  tag_id VARCHAR(100),
  cattle_age INT,
  breed VARCHAR(100),
  gender ENUM('MALE', 'FEMALE'),
  milk_yield DECIMAL(5,2),
  market_value DECIMAL(10,2),
  health_status VARCHAR(100),
  
  -- Photos (Local file paths)
  photo_front VARCHAR(500),
  photo_back VARCHAR(500),
  photo_left VARCHAR(500),
  photo_right VARCHAR(500),
  
  -- Agent Info
  agent_code VARCHAR(50),
  agent_id INT,
  
  -- Status & Payment
  status ENUM('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'EXPIRED'),
  payment_status ENUM('SUCCESS', 'FAILED', 'REFUNDED'),
  payment_id VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  
  -- Dates
  start_date DATE,
  end_date DATE,
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by INT,
  rejection_reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Claims Table (Simplified)
CREATE TABLE claims (
  id INT PRIMARY KEY AUTO_INCREMENT,
  claim_number VARCHAR(50) UNIQUE,
  policy_id INT,
  user_id INT,
  
  claim_type ENUM('DEATH_DISEASE', 'DEATH_ACCIDENT'),
  incident_date DATE,
  description TEXT,
  claimed_amount DECIMAL(10,2),
  
  -- Photos (JSON array of file paths)
  photos JSON,
  
  -- Bank Details
  account_holder VARCHAR(255),
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  bank_name VARCHAR(255),
  
  -- Status
  status ENUM('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SETTLED'),
  admin_comments TEXT,
  settlement_amount DECIMAL(10,2),
  settlement_date DATE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (policy_id) REFERENCES policies(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Notifications Table (Email only)
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  type ENUM('POLICY', 'PAYMENT', 'CLAIM', 'RENEWAL', 'ADMIN'),
  title VARCHAR(255),
  message TEXT,
  link VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔧 BACKEND API ENDPOINTS (UPDATED)

### **Authentication**
- `POST /api/auth/register` - Customer registration
- `POST /api/auth/login` - Customer login
- `POST /api/auth/verify-email` - Email OTP verification
- `POST /api/auth/forgot-password` - Send reset link
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/logout` - Logout

### **Policies**
- `GET /api/policies/plans` - Get 3 fixed plans
- `POST /api/policies` - Create new policy (with file upload)
- `GET /api/policies/customer/:customerId` - Get customer's policies
- `GET /api/policies/:id` - Get policy details
- `GET /api/policies/:id/pdf` - Download policy PDF (if approved)

### **Payments (Razorpay)**
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment signature
- `POST /api/webhooks/razorpay` - Razorpay webhook

### **Claims**
- `POST /api/claims` - File new claim (with file upload)
- `GET /api/claims/customer/:customerId` - Get customer's claims
- `GET /api/claims/:id` - Get claim details

### **Renewals**
- `GET /api/renewals/due/:customerId` - Get expiring policies
- `POST /api/renewals` - Renew policy

### **Notifications**
- `GET /api/notifications/customer/:customerId` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read

### **File Upload**
- `POST /api/upload/cattle-photos` - Upload 4 cattle photos
- `POST /api/upload/claim-photos` - Upload claim photos

### **Admin (for Admin Frontend)**
- `GET /api/admin/policies/pending` - Get pending policies
- `PATCH /api/admin/policies/:id/approve` - Approve policy
- `PATCH /api/admin/policies/:id/reject` - Reject policy
- `POST /api/admin/send-policy-pdf` - Email PDF to customer
- `GET /api/admin/claims/pending` - Get pending claims
- `PATCH /api/admin/claims/:id/status` - Update claim status

---

## 📦 DEPENDENCIES TO INSTALL

### **Frontend**
```bash
npm install axios react-hook-form react-toastify jspdf html2canvas
```

### **Backend**
```bash
npm install express mysql2 bcryptjs jsonwebtoken razorpay multer nodemailer dotenv cors
```

---

## 📊 IMPLEMENTATION PRIORITY

### **Phase 1: Core Features** (Week 1-2) 🔴
1. ✅ Backend API setup (Node.js + Express + MySQL)
2. ✅ Authentication system (Register/Login/Email OTP)
3. ✅ Policy page redesign (3 fixed plans)
4. ✅ Policy form with 4 photo upload (local storage)
5. ✅ Razorpay payment integration
6. ✅ Policy status workflow (PENDING → APPROVED)
7. ✅ Email notification system

### **Phase 2: Customer Features** (Week 3-4) 🟡
8. ✅ My Policies page with status badges
9. ✅ Claims management system
10. ✅ Renewals system
11. ✅ Navbar restructuring
12. ✅ In-app notifications

### **Phase 3: Admin Integration** (Week 5) 🟢
13. ✅ Admin approval workflow
14. ✅ PDF generation
15. ✅ Email PDF to customers
16. ✅ Agent commission tracking

### **Phase 4: Polish** (Week 6) 🟢
17. ✅ Testing & bug fixes
18. ✅ Email templates
19. ✅ Error handling
20. ✅ Performance optimization

---

## 💰 MONTHLY COSTS (UPDATED)

| Service | Purpose | Cost |
|---------|---------|------|
| Razorpay | Payment Gateway | 2% per transaction |
| SendGrid | Email (40k/month) | ₹1,200/month |
| AWS/DigitalOcean | Server + Storage | ₹2,500/month |
| MySQL Database | Database Hosting | ₹800/month |
| SSL Certificate | Security | ₹500/year |
| Domain | Website | ₹800/year |
| **Total Monthly** | | **~₹4,500/month** |

**Savings:** ₹1,500/month (no Cloudinary, no SMS service)

---

## ✅ FINAL CHECKLIST

### **Client Confirmations:**
- [x] 3 fixed policy plans (₹2,460 / ₹4,620 / ₹6,590)
- [x] 4 photos required (max 1MB each)
- [x] Store photos in local folder (NOT cloud)
- [x] Razorpay integration (client has test keys)
- [x] Email notifications only (NO SMS)
- [x] My Policies, Claims, Renewals in navbar
- [x] Simplified claims (2 types only)
- [x] Renewal reminders (30, 15, 7, 3 days)
- [x] No loyalty discount
- [x] No Google Maps in Contact Us
- [x] Simplified Become Partner page

### **Ready to Build:**
- [x] All requirements clarified
- [x] Database schema finalized
- [x] API endpoints defined
- [x] File storage structure decided
- [x] Implementation priority set
- [x] Cost estimation done

---

## 🚀 NEXT STEPS

1. **Start Backend Development**
   - Set up Node.js + Express server
   - Create MySQL database
   - Implement authentication APIs
   - Set up file upload with multer

2. **Frontend Modifications**
   - Redesign Policy page (3 cards)
   - Update form for 4 photos
   - Integrate Razorpay
   - Add My Policies, Claims, Renewals to navbar

3. **Integration**
   - Connect frontend to backend APIs
   - Test payment flow
   - Test file uploads
   - Test email notifications

4. **Admin Panel Updates**
   - Add policy approval interface
   - Add PDF generation
   - Add email sending

---

**Status:** ✅ READY TO START DEVELOPMENT  
**Estimated Timeline:** 6 weeks  
**Last Updated:** 2026-01-10

---

**All requirements confirmed and documented. Ready for implementation!** 🎯
