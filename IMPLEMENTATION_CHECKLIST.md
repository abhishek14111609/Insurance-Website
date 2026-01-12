# ✅ Full Backend Integration - Implementation Checklist

## 🎯 Phase 1: Core Backend APIs (IMMEDIATE PRIORITY)

### Step 1: Create Missing Database Models

#### 1.1 Claim Model
- [ ] Create `Backend/models/Claim.js`
- [ ] Define schema with all fields
- [ ] Add associations with Policy and User
- [ ] Add to `models/index.js`

#### 1.2 PolicyPlan Model
- [ ] Create `Backend/models/PolicyPlan.js`
- [ ] Define schema for insurance plans
- [ ] Add associations
- [ ] Add to `models/index.js`

#### 1.3 Notification Model
- [ ] Create `Backend/models/Notification.js`
- [ ] Define schema for notifications
- [ ] Add associations with User
- [ ] Add to `models/index.js`

#### 1.4 CommissionSettings Model
- [ ] Create `Backend/models/CommissionSettings.js`
- [ ] Define commission structure
- [ ] Add to `models/index.js`

### Step 2: Agent Management Backend

#### 2.1 Agent Controller
- [ ] Create `Backend/controllers/agent.controller.js`
- [ ] `registerAgent()` - Agent registration with KYC
- [ ] `getAgentProfile()` - Get agent profile
- [ ] `updateAgentProfile()` - Update agent details
- [ ] `getAgentHierarchy()` - Get complete hierarchy tree
- [ ] `getSubAgents()` - Get direct sub-agents
- [ ] `getAgentStats()` - Get agent statistics
- [ ] `getWallet()` - Get wallet balance and transactions
- [ ] `requestWithdrawal()` - Create withdrawal request
- [ ] `getWithdrawals()` - Get withdrawal history
- [ ] `getCommissions()` - Get commission records
- [ ] `getPoliciesSold()` - Get policies sold by agent

#### 2.2 Agent Routes
- [ ] Create `Backend/routes/agent.route.js`
- [ ] Add all agent endpoints
- [ ] Add authentication middleware
- [ ] Add role-based authorization

### Step 3: Admin Management Backend

#### 3.1 Admin Controller
- [ ] Create `Backend/controllers/admin.controller.js`
- [ ] `getDashboardStats()` - Dashboard statistics
- [ ] `getAllPolicies()` - Get all policies with filters
- [ ] `getPolicyDetails()` - Get detailed policy info
- [ ] `updatePolicyStatus()` - Update policy status
- [ ] `getAllAgents()` - Get all agents with filters
- [ ] `approveAgent()` - Approve agent registration
- [ ] `rejectAgent()` - Reject agent registration
- [ ] `getAllCustomers()` - Get all customers
- [ ] `getWithdrawalRequests()` - Get withdrawal requests
- [ ] `processWithdrawal()` - Approve/reject withdrawal
- [ ] `getAllCommissions()` - Get all commissions
- [ ] `getCommissionSettings()` - Get commission settings
- [ ] `updateCommissionSettings()` - Update commission settings
- [ ] `generateReport()` - Generate various reports
- [ ] `getNotifications()` - Get admin notifications
- [ ] `createNotification()` - Create notification

#### 3.2 Admin Routes
- [ ] Create `Backend/routes/admin.route.js`
- [ ] Add all admin endpoints
- [ ] Add admin-only authorization

### Step 4: Claims Management Backend

#### 4.1 Claim Controller
- [ ] Create `Backend/controllers/claim.controller.js`
- [ ] `createClaim()` - Submit new claim
- [ ] `getClaims()` - Get user's claims
- [ ] `getClaimById()` - Get claim details
- [ ] `updateClaimStatus()` - Update claim status (admin)
- [ ] `uploadClaimDocuments()` - Upload supporting documents
- [ ] `getAllClaims()` - Get all claims (admin)
- [ ] `approveClaim()` - Approve claim (admin)
- [ ] `rejectClaim()` - Reject claim (admin)

#### 4.2 Claim Routes
- [ ] Create `Backend/routes/claim.route.js`
- [ ] Add claim endpoints
- [ ] Add proper authorization

### Step 5: Commission System Backend

#### 5.1 Commission Controller
- [ ] Create `Backend/controllers/commission.controller.js`
- [ ] `calculateCommission()` - Calculate multi-level commissions
- [ ] `getPendingCommissions()` - Get pending commissions
- [ ] `approveCommission()` - Approve commission
- [ ] `bulkApproveCommissions()` - Bulk approve
- [ ] `getCommissionHistory()` - Get commission history
- [ ] `getCommissionSettings()` - Get settings
- [ ] `updateCommissionSettings()` - Update settings (admin)

#### 5.2 Commission Routes
- [ ] Create `Backend/routes/commission.route.js`
- [ ] Add commission endpoints

#### 5.3 Commission Utilities
- [ ] Create `Backend/utils/commission.util.js`
- [ ] `calculateMultiLevelCommission()` - Auto-calculate on policy approval
- [ ] `distributeCommission()` - Distribute to agent hierarchy
- [ ] `updateAgentWallet()` - Update wallet balances

### Step 6: File Upload System

#### 6.1 Upload Middleware
- [ ] Create `Backend/middleware/upload.middleware.js`
- [ ] Configure multer for file uploads
- [ ] Add file type validation
- [ ] Add file size validation
- [ ] Create upload directory structure

#### 6.2 Upload Controller
- [ ] Create `Backend/controllers/upload.controller.js`
- [ ] `uploadPolicyPhotos()` - Upload policy photos
- [ ] `uploadClaimDocuments()` - Upload claim documents
- [ ] `uploadAgentDocuments()` - Upload agent KYC
- [ ] `deleteFile()` - Delete uploaded file

#### 6.3 Upload Routes
- [ ] Create `Backend/routes/upload.route.js`
- [ ] Add upload endpoints

### Step 7: Notification System

#### 7.1 Notification Controller
- [ ] Create `Backend/controllers/notification.controller.js`
- [ ] `getNotifications()` - Get user notifications
- [ ] `markAsRead()` - Mark notification as read
- [ ] `deleteNotification()` - Delete notification
- [ ] `broadcastNotification()` - Broadcast to all users (admin)

#### 7.2 Notification Routes
- [ ] Create `Backend/routes/notification.route.js`
- [ ] Add notification endpoints

#### 7.3 Notification Utilities
- [ ] Create `Backend/utils/notification.util.js`
- [ ] `createNotification()` - Helper to create notifications
- [ ] `notifyPolicyApproval()` - Notify on policy approval
- [ ] `notifyCommissionEarned()` - Notify on commission
- [ ] `notifyWithdrawalProcessed()` - Notify on withdrawal

### Step 8: Policy Plan Management

#### 8.1 PolicyPlan Controller
- [ ] Create `Backend/controllers/policyPlan.controller.js`
- [ ] `getAllPlans()` - Get all policy plans
- [ ] `getActivePlans()` - Get active plans (public)
- [ ] `getPlanById()` - Get plan details
- [ ] `createPlan()` - Create plan (admin)
- [ ] `updatePlan()` - Update plan (admin)
- [ ] `deletePlan()` - Delete plan (admin)

#### 8.2 PolicyPlan Routes
- [ ] Create `Backend/routes/policyPlan.route.js`
- [ ] Add policy plan endpoints

### Step 9: Update Server Configuration

#### 9.1 Update server.js
- [ ] Import new routes
- [ ] Add route handlers
- [ ] Update CORS configuration
- [ ] Add error handling middleware

#### 9.2 Database Sync
- [ ] Test database sync with new models
- [ ] Create migration scripts if needed
- [ ] Seed initial data (commission settings, policy plans)

---

## 🎯 Phase 2: Customer Frontend Integration

### Step 1: Update API Service Layer

#### 1.1 Create Comprehensive API Service
- [ ] Update `Customer Frontend/src/services/api.service.js`
- [ ] Add all new endpoints
- [ ] Implement error handling
- [ ] Add loading state management
- [ ] Add request/response interceptors

#### 1.2 Create Specific Service Modules
- [ ] `services/auth.service.js` - Authentication
- [ ] `services/policy.service.js` - Policy management
- [ ] `services/claim.service.js` - Claims
- [ ] `services/agent.service.js` - Agent features
- [ ] `services/payment.service.js` - Payments
- [ ] `services/notification.service.js` - Notifications

### Step 2: Authentication Integration

#### 2.1 Login/Register Pages
- [ ] Update Login.jsx - connect to backend
- [ ] Update Register.jsx - connect to backend
- [ ] Update ForgotPassword.jsx - connect to backend
- [ ] Add proper error handling
- [ ] Add loading states

#### 2.2 Profile Management
- [ ] Update Profile.jsx - fetch from backend
- [ ] Update profile form - submit to backend
- [ ] Remove localStorage usage

### Step 3: Policy Management Integration

#### 3.1 Policy Creation
- [ ] Update AnimalPolicyForm.jsx
- [ ] Connect to backend API
- [ ] Handle photo uploads
- [ ] Add validation
- [ ] Add success/error handling

#### 3.2 Policy List & Details
- [ ] Update Policies.jsx - fetch from backend
- [ ] Update PolicyDetails.jsx - fetch from backend
- [ ] Remove localStorage usage
- [ ] Add loading states
- [ ] Add error handling

### Step 4: Claims Integration

#### 4.1 Claims Pages
- [ ] Update ClaimForm.jsx - submit to backend
- [ ] Update Claims.jsx - fetch from backend
- [ ] Add document upload functionality
- [ ] Remove localStorage usage

### Step 5: Agent Features Integration

#### 5.1 Agent Dashboard
- [ ] Update AgentDashboard.jsx - fetch real data
- [ ] Connect to backend APIs
- [ ] Remove localStorage usage

#### 5.2 Agent Registration
- [ ] Update AgentLanding.jsx
- [ ] Connect registration to backend
- [ ] Add KYC document upload

#### 5.3 Agent Hierarchy
- [ ] Update AgentTeam.jsx - fetch from backend
- [ ] Remove localStorage hierarchy data
- [ ] Add real-time updates

#### 5.4 Wallet & Withdrawals
- [ ] Update AgentWallet.jsx - fetch from backend
- [ ] Connect withdrawal requests to backend
- [ ] Remove localStorage transactions

#### 5.5 Commission Tracking
- [ ] Update commission display
- [ ] Fetch from backend
- [ ] Remove localStorage usage

### Step 6: Remove All localStorage Usage

#### 6.1 Audit localStorage Usage
- [ ] Find all localStorage.getItem calls
- [ ] Find all localStorage.setItem calls
- [ ] Create replacement plan

#### 6.2 Replace with API Calls
- [ ] Replace policy data
- [ ] Replace agent data
- [ ] Replace claims data
- [ ] Replace wallet data
- [ ] Keep only JWT token

---

## 🎯 Phase 3: Admin Frontend Integration

### Step 1: Update Admin API Service

#### 1.1 Create Admin API Service
- [ ] Create `Admin Frontend/src/services/admin.service.js`
- [ ] Add all admin endpoints
- [ ] Implement error handling
- [ ] Add loading states

### Step 2: Dashboard Integration

#### 2.1 Dashboard Statistics
- [ ] Update Dashboard.jsx
- [ ] Fetch real statistics from backend
- [ ] Remove mock data
- [ ] Add charts with real data

### Step 3: Policy Management

#### 3.1 Policy List & Approval
- [ ] Update PolicyApprovals.jsx
- [ ] Fetch policies from backend
- [ ] Connect approve/reject to backend
- [ ] Remove localStorage usage

### Step 4: Agent Management

#### 4.1 Agent List & Approval
- [ ] Update AgentApprovals.jsx
- [ ] Fetch agents from backend
- [ ] Connect approve/reject to backend
- [ ] Remove localStorage usage

#### 4.2 Agent Hierarchy View
- [ ] Update agent hierarchy display
- [ ] Fetch from backend
- [ ] Remove localStorage usage

### Step 5: Commission Management

#### 5.1 Commission Settings
- [ ] Create CommissionSettings.jsx
- [ ] Fetch settings from backend
- [ ] Update settings via backend
- [ ] Remove localStorage usage

#### 5.2 Commission Approvals
- [ ] Update CommissionApprovals.jsx
- [ ] Fetch from backend
- [ ] Connect approval to backend

### Step 6: Withdrawal Management

#### 6.1 Withdrawal Requests
- [ ] Create WithdrawalManagement.jsx
- [ ] Fetch requests from backend
- [ ] Process withdrawals via backend
- [ ] Remove localStorage usage

### Step 7: Customer Management

#### 7.1 Customer List
- [ ] Create CustomerManagement.jsx
- [ ] Fetch customers from backend
- [ ] View customer details
- [ ] View customer policies

### Step 8: Remove All localStorage Usage

#### 8.1 Audit and Replace
- [ ] Find all localStorage usage
- [ ] Replace with backend API calls
- [ ] Keep only admin JWT token

---

## 🎯 Phase 4: Advanced Features

### Step 1: Commission Automation

#### 1.1 Auto-calculation
- [ ] Trigger commission calculation on policy approval
- [ ] Distribute to agent hierarchy
- [ ] Update wallet balances
- [ ] Create notifications

### Step 2: Email Notifications

#### 2.1 Email Service
- [ ] Create `Backend/utils/email.util.js`
- [ ] Configure email service (Nodemailer)
- [ ] Create email templates

#### 2.2 Email Triggers
- [ ] Policy approval email
- [ ] Policy rejection email
- [ ] Commission earned email
- [ ] Withdrawal processed email
- [ ] Claim status update email

### Step 3: Analytics & Reports

#### 3.1 Analytics Endpoints
- [ ] Dashboard analytics
- [ ] Policy analytics
- [ ] Agent performance
- [ ] Revenue analytics

#### 3.2 Report Generation
- [ ] PDF report generation
- [ ] Excel export
- [ ] Custom date ranges

---

## 🎯 Phase 5: Testing & Optimization

### Step 1: API Testing

#### 1.1 Unit Tests
- [ ] Test all controllers
- [ ] Test all models
- [ ] Test utilities

#### 1.2 Integration Tests
- [ ] Test API endpoints
- [ ] Test authentication
- [ ] Test authorization

### Step 2: Frontend Testing

#### 2.1 Component Tests
- [ ] Test all components
- [ ] Test API integration
- [ ] Test error handling

#### 2.2 E2E Tests
- [ ] Test user flows
- [ ] Test admin flows
- [ ] Test agent flows

### Step 3: Performance Optimization

#### 3.1 Database Optimization
- [ ] Add indexes
- [ ] Optimize queries
- [ ] Add caching

#### 3.2 Frontend Optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Image optimization

### Step 4: Security Audit

#### 4.1 Backend Security
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting

#### 4.2 Frontend Security
- [ ] XSS prevention
- [ ] Secure token storage
- [ ] Input sanitization

---

## 📊 Progress Tracking

### Overall Progress
- [ ] Phase 1: Core Backend APIs (0%)
- [ ] Phase 2: Customer Frontend Integration (0%)
- [ ] Phase 3: Admin Frontend Integration (0%)
- [ ] Phase 4: Advanced Features (0%)
- [ ] Phase 5: Testing & Optimization (0%)

### Key Milestones
- [ ] All database models created
- [ ] All backend APIs implemented
- [ ] Customer frontend fully integrated
- [ ] Admin frontend fully integrated
- [ ] Zero localStorage usage (except tokens)
- [ ] All tests passing
- [ ] Production ready

---

## 🚀 Quick Start Commands

### Backend Development
```bash
cd "d:\Reimvide\Insurance Website\Backend"
npm run dev
```

### Customer Frontend Development
```bash
cd "d:\Reimvide\Insurance Website\Customer Frontend"
npm run dev
```

### Admin Frontend Development
```bash
cd "d:\Reimvide\Insurance Website\Admin Frontend"
npm run dev
```

### Database Reset (Development Only)
```bash
# Update server.js: syncDatabase(true)
# Then restart backend
```

---

**Last Updated**: 2026-01-12
**Current Phase**: Phase 1 - Core Backend APIs
**Next Action**: Create missing database models
