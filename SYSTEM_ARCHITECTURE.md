# 🏗️ System Architecture - Insurance Website

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INSURANCE SYSTEM                             │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│  Customer        │◄───────►│   Backend API    │◄───────►│  Admin           │
│  Frontend        │         │   (Node.js)      │         │  Frontend        │
│  (React)         │         │                  │         │  (React)         │
│                  │         │                  │         │                  │
│  Port: 5173      │         │  Port: 5000      │         │  Port: 5174      │
│                  │         │                  │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
                                      │
                                      │
                                      ▼
                             ┌──────────────────┐
                             │                  │
                             │  MySQL Database  │
                             │                  │
                             │  insurance_db    │
                             │                  │
                             └──────────────────┘
```

---

## 🗄️ Database Schema

### Core Tables

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                              │
└─────────────────────────────────────────────────────────────────────┘

users (👥 Users)
├── id (PK)
├── email (unique)
├── password (hashed)
├── fullName
├── phone
├── address, city, state, pincode
├── role (customer/agent/admin)
├── status (active/inactive/blocked)
├── emailVerified
└── timestamps

policies (📋 Insurance Policies)
├── id (PK)
├── policyNumber (unique)
├── customerId (FK → users)
├── agentId (FK → agents)
├── cattleType, tagId, age, breed, gender
├── milkYield, healthStatus
├── coverageAmount, premium, duration
├── startDate, endDate
├── status (PENDING/APPROVED/REJECTED)
├── paymentStatus (PENDING/PAID/FAILED)
├── photos (JSON)
├── ownerName, ownerEmail, ownerPhone
├── ownerAddress, ownerCity, ownerState, ownerPincode
├── approvedBy, approvedAt
├── rejectedBy, rejectedAt, rejectionReason
└── timestamps

agents (🤝 Agents)
├── id (PK)
├── userId (FK → users, unique)
├── agentCode (unique)
├── parentAgentId (FK → agents, self-reference)
├── level (hierarchy level)
├── status (pending/active/inactive/rejected)
├── bankName, accountNumber, ifscCode
├── panNumber, aadharNumber
├── walletBalance, totalEarnings, totalWithdrawals
├── approvedBy, approvedAt
└── timestamps

payments (💳 Payments)
├── id (PK)
├── policyId (FK → policies)
├── customerId (FK → users)
├── razorpayOrderId, razorpayPaymentId, razorpaySignature
├── amount, currency
├── status (pending/success/failed/refunded)
├── paymentMethod
├── paidAt
└── timestamps

commissions (💰 Commissions)
├── id (PK)
├── policyId (FK → policies)
├── agentId (FK → agents)
├── level (commission level)
├── amount, percentage
├── status (pending/approved/paid/cancelled)
├── paidAt
└── timestamps

withdrawals (🏦 Withdrawals)
├── id (PK)
├── agentId (FK → agents)
├── amount
├── status (pending/approved/rejected/processed)
├── bankDetails (JSON)
├── processedBy (FK → users)
├── processedAt
└── timestamps

claims (📝 Claims) [TO BE CREATED]
├── id (PK)
├── policyId (FK → policies)
├── customerId (FK → users)
├── claimNumber (unique)
├── claimType (death/injury/theft/disease)
├── incidentDate
├── claimAmount
├── description
├── documents (JSON)
├── status (pending/under_review/approved/rejected/paid)
├── reviewedBy, reviewedAt
├── rejectionReason
└── timestamps

policy_plans (📦 Policy Plans) [TO BE CREATED]
├── id (PK)
├── name, description
├── cattleType (cow/buffalo/both)
├── minAge, maxAge
├── coverageAmount, premium, duration
├── features (JSON)
├── isActive
└── timestamps

notifications (🔔 Notifications) [TO BE CREATED]
├── id (PK)
├── userId (FK → users, nullable)
├── type (policy/payment/commission/withdrawal/system)
├── title, message
├── data (JSON)
├── isRead, readAt
└── timestamps

commission_settings (⚙️ Commission Settings) [TO BE CREATED]
├── id (PK)
├── level
├── percentage
├── description
├── isActive
└── timestamps
```

---

## 🔄 Data Flow Diagrams

### 1. Policy Creation Flow

```
Customer Frontend
       │
       │ 1. Fill Policy Form
       │    (cattle details, owner info, photos)
       ▼
   Submit Form
       │
       │ 2. POST /api/policies
       │    (with JWT token)
       ▼
Backend API
       │
       │ 3. Validate Data
       │    - Check authentication
       │    - Validate input
       │    - Find agent (if agent code provided)
       ▼
   Create Policy
       │
       │ 4. INSERT INTO policies
       │    - Generate policy number
       │    - Status: PENDING
       │    - PaymentStatus: PENDING
       ▼
MySQL Database
       │
       │ 5. Return Policy Object
       ▼
Customer Frontend
       │
       │ 6. Redirect to Payment
       ▼
Payment Gateway (Razorpay)
       │
       │ 7. Payment Success
       ▼
Backend API
       │
       │ 8. Update Policy
       │    - PaymentStatus: PAID
       │    - Status: PENDING_APPROVAL
       ▼
MySQL Database
       │
       │ 9. Notify Admin
       ▼
Admin Dashboard
```

### 2. Policy Approval Flow

```
Admin Frontend
       │
       │ 1. View Pending Policies
       │    GET /api/admin/policies?status=PENDING_APPROVAL
       ▼
Backend API
       │
       │ 2. Fetch Policies
       │    SELECT * FROM policies WHERE status = 'PENDING_APPROVAL'
       ▼
MySQL Database
       │
       │ 3. Return Policies List
       ▼
Admin Frontend
       │
       │ 4. Review Policy Details
       │    (photos, cattle info, owner details)
       │
       │ 5. Approve/Reject Decision
       ▼
   PATCH /api/policies/:id/approve
   or
   PATCH /api/policies/:id/reject
       │
       ▼
Backend API
       │
       │ 6. Update Policy Status
       │    - Status: APPROVED/REJECTED
       │    - approvedBy/rejectedBy: admin.id
       │    - approvedAt/rejectedAt: now()
       │
       │ 7. If APPROVED:
       │    - Calculate Commissions
       │    - Create Commission Records
       │    - Update Agent Wallets
       │    - Send Approval Email
       ▼
MySQL Database
       │
       │ 8. Create Notifications
       │    - Notify Customer
       │    - Notify Agent (if applicable)
       ▼
Notification System
```

### 3. Commission Distribution Flow

```
Policy Approved
       │
       │ 1. Trigger Commission Calculation
       ▼
Backend API (Commission Utility)
       │
       │ 2. Get Agent Hierarchy
       │    - Find selling agent
       │    - Get parent agents (up to configured levels)
       ▼
   Calculate Multi-Level Commissions
       │
       │ Level 1: Direct Agent (e.g., 10% of premium)
       │ Level 2: Parent Agent (e.g., 5% of premium)
       │ Level 3: Grand Parent (e.g., 2% of premium)
       ▼
   Create Commission Records
       │
       │ 3. INSERT INTO commissions
       │    - For each level
       │    - Status: PENDING
       ▼
MySQL Database
       │
       │ 4. Admin Approves Commissions
       │    PATCH /api/commissions/:id/approve
       ▼
   Update Commission Status
       │
       │ 5. Status: APPROVED
       │    Update Agent Wallets
       │    - walletBalance += commission.amount
       │    - totalEarnings += commission.amount
       ▼
   Send Notifications
       │
       │ 6. Notify Agents
       │    "You earned ₹X commission on Policy #Y"
       ▼
Agent Dashboard
```

### 4. Agent Withdrawal Flow

```
Agent Frontend
       │
       │ 1. Request Withdrawal
       │    POST /api/agents/withdraw
       │    { amount, bankDetails }
       ▼
Backend API
       │
       │ 2. Validate Request
       │    - Check wallet balance
       │    - Verify bank details
       │    - Check minimum withdrawal amount
       ▼
   Create Withdrawal Request
       │
       │ 3. INSERT INTO withdrawals
       │    - Status: PENDING
       ▼
MySQL Database
       │
       │ 4. Notify Admin
       ▼
Admin Frontend
       │
       │ 5. Review Withdrawal Request
       │    GET /api/admin/withdrawals
       │
       │ 6. Approve/Reject
       │    PATCH /api/admin/withdrawals/:id
       ▼
Backend API
       │
       │ 7. If APPROVED:
       │    - Update withdrawal status
       │    - Deduct from wallet balance
       │    - Update totalWithdrawals
       │    - Process bank transfer (external)
       │
       │ 8. If REJECTED:
       │    - Update withdrawal status
       │    - Add rejection reason
       ▼
   Send Notification
       │
       │ 9. Notify Agent
       ▼
Agent Dashboard
```

---

## 🔐 Authentication Flow

```
User Login
       │
       │ 1. Enter Email & Password
       │    POST /api/auth/login
       ▼
Backend API
       │
       │ 2. Validate Credentials
       │    - Find user by email
       │    - Compare password hash
       │    - Check user status
       ▼
   Generate JWT Tokens
       │
       │ 3. Create Tokens
       │    - Access Token (7 days)
       │    - Refresh Token (30 days)
       │
       │ 4. Return User Data
       │    { user, token, refreshToken }
       ▼
Frontend
       │
       │ 5. Store Token
       │    localStorage.setItem('token', token)
       │
       │ 6. Set Authorization Header
       │    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
       ▼
Authenticated Requests
       │
       │ 7. All API Calls Include Token
       │    Authorization: Bearer <token>
       ▼
Backend Middleware
       │
       │ 8. Verify Token
       │    - Decode JWT
       │    - Check expiration
       │    - Extract user info
       │
       │ 9. Attach User to Request
       │    req.user = decodedUser
       ▼
Protected Route Handler
```

---

## 📡 API Endpoints Overview

### Authentication (`/api/auth`)
```
POST   /register              - Register new user
POST   /login                 - Login user
GET    /me                    - Get current user
PUT    /profile               - Update profile
PUT    /change-password       - Change password
POST   /forgot-password       - Request password reset
POST   /reset-password/:token - Reset password
```

### Policies (`/api/policies`)
```
POST   /                      - Create policy (customer/agent)
GET    /                      - Get user's policies
GET    /:id                   - Get policy details
PATCH  /:id/payment-complete  - Update after payment
GET    /admin/pending         - Get pending policies (admin)
PATCH  /:id/approve           - Approve policy (admin)
PATCH  /:id/reject            - Reject policy (admin)
```

### Payments (`/api/payments`)
```
POST   /create-order          - Create Razorpay order
POST   /verify                - Verify payment
GET    /history               - Get payment history
POST   /webhook               - Razorpay webhook
```

### Agents (`/api/agents`) [TO BE IMPLEMENTED]
```
POST   /register              - Register as agent
GET    /profile               - Get agent profile
PUT    /profile               - Update agent profile
GET    /hierarchy             - Get agent hierarchy
GET    /team                  - Get sub-agents
GET    /stats                 - Get statistics
GET    /wallet                - Get wallet info
POST   /withdraw              - Request withdrawal
GET    /withdrawals           - Get withdrawal history
GET    /commissions           - Get commissions
GET    /policies              - Get policies sold
```

### Admin (`/api/admin`) [TO BE IMPLEMENTED]
```
GET    /dashboard             - Dashboard stats
GET    /policies              - All policies
GET    /policies/:id          - Policy details
PATCH  /policies/:id/status   - Update policy status
GET    /agents                - All agents
PATCH  /agents/:id/approve    - Approve agent
PATCH  /agents/:id/reject     - Reject agent
GET    /customers             - All customers
GET    /withdrawals           - Withdrawal requests
PATCH  /withdrawals/:id       - Process withdrawal
GET    /commissions           - All commissions
GET    /commission-settings   - Get settings
POST   /commission-settings   - Update settings
GET    /reports               - Generate reports
```

### Claims (`/api/claims`) [TO BE IMPLEMENTED]
```
POST   /                      - Create claim
GET    /                      - Get user claims
GET    /:id                   - Get claim details
PATCH  /:id/status            - Update status (admin)
POST   /:id/documents         - Upload documents
```

### Commissions (`/api/commissions`) [TO BE IMPLEMENTED]
```
POST   /calculate             - Calculate commissions
GET    /pending               - Get pending
PATCH  /:id/approve           - Approve commission
POST   /bulk-approve          - Bulk approve
```

### Notifications (`/api/notifications`) [TO BE IMPLEMENTED]
```
GET    /                      - Get notifications
PATCH  /:id/read              - Mark as read
DELETE /:id                   - Delete notification
POST   /broadcast             - Broadcast (admin)
```

### Uploads (`/api/upload`) [TO BE IMPLEMENTED]
```
POST   /policy-photos         - Upload policy photos
POST   /claim-documents       - Upload claim docs
POST   /agent-documents       - Upload agent KYC
DELETE /:fileId               - Delete file
```

---

## 🔄 State Management

### Customer Frontend State
```
Authentication State
├── user (from backend)
├── token (localStorage)
└── isAuthenticated

Policy State
├── policies (from backend)
├── currentPolicy (from backend)
└── loading

Agent State
├── agentProfile (from backend)
├── hierarchy (from backend)
├── wallet (from backend)
├── commissions (from backend)
└── withdrawals (from backend)

Claim State
├── claims (from backend)
├── currentClaim (from backend)
└── loading

Notification State
├── notifications (from backend)
└── unreadCount
```

### Admin Frontend State
```
Authentication State
├── admin (from backend)
├── token (localStorage)
└── isAuthenticated

Dashboard State
├── stats (from backend)
├── recentActivities (from backend)
└── loading

Policy State
├── allPolicies (from backend)
├── pendingPolicies (from backend)
└── loading

Agent State
├── allAgents (from backend)
├── pendingAgents (from backend)
├── hierarchy (from backend)
└── loading

Commission State
├── commissions (from backend)
├── settings (from backend)
└── loading

Withdrawal State
├── withdrawalRequests (from backend)
└── loading
```

---

## 🛡️ Security Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                              │
└─────────────────────────────────────────────────────────────────────┘

Frontend Security
├── Input Validation
├── XSS Prevention
├── CSRF Token
└── Secure Token Storage

API Security
├── JWT Authentication
├── Role-Based Authorization
├── Rate Limiting
├── CORS Configuration
└── Helmet.js Headers

Backend Security
├── Password Hashing (bcrypt)
├── SQL Injection Prevention (Sequelize)
├── Input Sanitization
├── File Upload Validation
└── Environment Variables

Database Security
├── Encrypted Connections
├── User Permissions
├── Backup Strategy
└── Audit Logs
```

---

## 📊 Performance Optimization

### Database Level
- Indexes on frequently queried fields
- Query optimization with Sequelize
- Connection pooling
- Caching strategy (Redis - future)

### API Level
- Response compression
- Pagination for large datasets
- Lazy loading
- Request debouncing

### Frontend Level
- Code splitting
- Lazy component loading
- Image optimization
- Memoization

---

## 🚀 Deployment Architecture

```
Production Environment

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│  Customer App    │         │   Backend API    │         │  Admin App       │
│  (Vercel/        │◄───────►│   (Railway/      │◄───────►│  (Vercel/        │
│   Netlify)       │         │    Heroku)       │         │   Netlify)       │
│                  │         │                  │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
                                      │
                                      │
                                      ▼
                             ┌──────────────────┐
                             │                  │
                             │  MySQL Database  │
                             │  (PlanetScale/   │
                             │   AWS RDS)       │
                             │                  │
                             └──────────────────┘
```

---

**Last Updated**: 2026-01-12
**Status**: Architecture Defined - Ready for Implementation
