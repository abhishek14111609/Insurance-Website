# Commission Distribution System - Complete Report

## 📊 Executive Summary

The **Pashudhan Suraksha** insurance platform implements a **Multi-Level Commission (MLC) system** that rewards agents for selling policies and incentivizes building a network of sub-agents. The system distributes commissions across up to **6 levels** (1 direct seller + 5 parent levels) based on policy sales.

---

## 🎯 How Commission Distribution Works

### **1. Trigger Point: Policy Approval**

Commission calculation is **automatically triggered** when an admin approves a policy.

**File:** `Backend/controllers/admin.controller.js` (Line 605)
```javascript
// When admin approves a policy
const commissions = await calculateAndDistributeCommissions(policy, session);
```

**Workflow:**
1. Admin approves policy → Status changes to "APPROVED"
2. System automatically calls `calculateAndDistributeCommissions()`
3. Commission records are created for the selling agent and their upline
4. All commissions start with status: **"pending"**
5. Admin must manually approve each commission to release funds

---

## 💰 Commission Structure

### **Level 0: Direct Seller (Fixed Commission)**

The agent who **directly sold the policy** receives a **fixed commission** based on the policy term:

| Policy Term | Fixed Commission |
|-------------|------------------|
| **1 Year**  | ₹300            |
| **2 Years** | ₹450            |
| **3 Years** | ₹750            |

**Code Reference:** `Backend/utils/commission.util.js` (Line 5)
```javascript
const fixedMap = { 1: 300, 2: 450, 3: 750 };
```

**Example:**
- Agent sells a 2-year policy with premium ₹10,000
- Agent receives: **₹450** (fixed, regardless of premium amount)

---

### **Levels 1-5: Parent Agents (Percentage-Based)**

Parent agents in the upline receive **percentage-based commissions** from the policy premium:

| Level | Distance from Seller | Commission % | Description |
|-------|---------------------|--------------|-------------|
| **1** | 1 level up | **5%** | Direct parent of seller |
| **2** | 2 levels up | **3%** | Grandparent of seller |
| **3** | 3 levels up | **2%** | Great-grandparent |
| **4** | 4 levels up | **2%** | 4th generation up |
| **5** | 5 levels up | **1%** | 5th generation up |

**Code Reference:** `Backend/utils/commission.util.js` (Line 6)
```javascript
const parentPercents = [5, 3, 2, 2, 1];
```

**Total Percentage Distributed:** 5% + 3% + 2% + 2% + 1% = **13%** of premium

---

## 📈 Real-World Example

### **Scenario:**
- **Policy Premium:** ₹10,000
- **Policy Term:** 2 years
- **Agent Hierarchy:**

```
Level 5: Agent E (Top Leader)
    ↓
Level 4: Agent D
    ↓
Level 3: Agent C
    ↓
Level 2: Agent B (Parent)
    ↓
Level 1: Agent A (Direct Parent)
    ↓
Level 0: Agent X (Seller) ← Sold the policy
```

### **Commission Distribution:**

| Agent | Level | Type | Calculation | Amount |
|-------|-------|------|-------------|--------|
| **Agent X** (Seller) | 0 | Fixed | ₹450 (2-year term) | **₹450** |
| **Agent A** (Parent) | 1 | 5% | 10,000 × 5% | **₹500** |
| **Agent B** | 2 | 3% | 10,000 × 3% | **₹300** |
| **Agent C** | 3 | 2% | 10,000 × 2% | **₹200** |
| **Agent D** | 4 | 2% | 10,000 × 2% | **₹200** |
| **Agent E** | 5 | 1% | 10,000 × 1% | **₹100** |
| **TOTAL** | - | - | - | **₹1,750** |

**Note:** If an agent doesn't have 5 levels of parents, the system only creates commissions for existing levels.

---

## 🔄 Commission Lifecycle

### **Phase 1: Creation (Automatic)**
```
Policy Approved → Commissions Calculated → Records Created with Status: "PENDING"
```

**What Happens:**
1. System traverses agent hierarchy up to 5 levels
2. Creates commission records in database
3. All records start with `status: 'pending'`
4. **No money is transferred yet**

**File:** `Backend/utils/commission.util.js` (Lines 23-83)

---

### **Phase 2: Approval (Manual by Admin)**

**Admin must approve each commission individually or in bulk**

**Approval Process:**
1. Admin views pending commissions
2. Admin approves commission
3. System updates commission status to "approved"
4. **Money is added to agent's wallet**
5. Agent's `totalEarnings` is updated
6. Agent receives notification

**File:** `Backend/utils/commission.util.js` (Lines 91-143)

```javascript
export const approveCommission = async (commissionId, adminId) => {
    // 1. Find commission
    // 2. Update status to 'approved'
    // 3. Add amount to agent's walletBalance
    // 4. Update agent's totalEarnings
    // 5. Send notification to agent
}
```

**What Gets Updated:**
```javascript
// Commission Record
commission.status = 'approved';
commission.paidAt = new Date();

// Agent Wallet
agent.walletBalance = currentWallet + commissionAmount;
agent.totalEarnings = currentEarnings + commissionAmount;
```

---

### **Phase 3: Withdrawal (Agent Request)**

Once commission is approved and in wallet:
1. Agent requests withdrawal
2. Admin approves withdrawal
3. Money is deducted from wallet
4. Agent receives payment via bank transfer

---

## 🗄️ Database Structure

### **Commission Record Fields**

```javascript
{
    policyId: ObjectId,           // Reference to policy
    agentId: ObjectId,            // Agent receiving commission
    level: Number,                // 0-5 (0 = seller, 1-5 = parents)
    distanceFromSeller: Number,   // How many levels up from seller
    amount: Decimal128,           // Commission amount in ₹
    percentage: Decimal128,       // Percentage used (0 for fixed)
    commissionType: String,       // 'fixed' or 'percentage'
    premiumAtSale: Decimal128,    // Policy premium at time of sale
    planTermYears: Number,        // 1, 2, or 3 years
    status: String,               // 'pending', 'approved', 'paid', 'cancelled'
    paidAt: Date,                 // When commission was approved
    notes: String,                // Admin notes
    createdAt: Date,              // Auto-generated
    updatedAt: Date               // Auto-generated
}
```

---

## 🔍 Key Features

### **1. Automatic Calculation**
✅ No manual calculation needed
✅ Triggered automatically on policy approval
✅ Prevents duplicate commissions for same policy

### **2. Multi-Level Support**
✅ Supports up to 6 levels (seller + 5 parents)
✅ Automatically stops if agent has no parent
✅ Flexible hierarchy

### **3. Dual Commission Types**
✅ **Fixed** for direct sellers (based on term)
✅ **Percentage** for parent agents (based on premium)

### **4. Transaction Safety**
✅ Uses MongoDB transactions
✅ All-or-nothing approach
✅ Prevents partial commission creation

### **5. Approval Workflow**
✅ Admin control over commission payouts
✅ Prevents fraudulent claims
✅ Audit trail with timestamps

---

## 📊 Commission Status Flow

```
┌─────────────────────────────────────────────────────────┐
│                    PENDING                              │
│  (Created when policy approved)                         │
│  • Commission calculated                                │
│  • Record created in database                           │
│  • No money transferred yet                             │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Admin Approves
                 ↓
┌─────────────────────────────────────────────────────────┐
│                   APPROVED                              │
│  (Admin approved, money added to wallet)                │
│  • Status changed to 'approved'                         │
│  • Amount added to agent.walletBalance                  │
│  • Agent.totalEarnings updated                          │
│  • Notification sent to agent                           │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Agent Withdraws
                 ↓
┌─────────────────────────────────────────────────────────┐
│                     PAID                                │
│  (Agent withdrew money from wallet)                     │
│  • Money deducted from wallet                           │
│  • Withdrawal record created                            │
│  • Payment processed                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 Business Logic Highlights

### **Why Fixed Commission for Sellers?**
- Encourages agents to sell policies regardless of premium amount
- Provides predictable income for agents
- Higher term = higher fixed commission (incentivizes longer terms)

### **Why Percentage for Parents?**
- Rewards building a strong network
- Higher premium policies = higher commissions for upline
- Creates passive income for senior agents

### **Why Manual Approval?**
- Prevents fraud and errors
- Allows admin to verify policy validity
- Provides financial control and oversight

---

## 🔐 Security & Validation

### **Duplicate Prevention**
```javascript
const alreadyExists = await Commission.exists({ policyId: policy._id });
if (alreadyExists) {
    console.log('Commission already generated for policy; skipping');
    return [];
}
```

### **Transaction Safety**
```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
    // All database operations
    await session.commitTransaction();
} catch (error) {
    await session.abortTransaction();
    throw error;
}
```

### **Status Validation**
```javascript
if (commission.status !== 'pending') {
    throw new Error('Commission is not in pending status');
}
```

---

## 📱 Agent Notifications

When commission is approved, agent receives:
- **In-app notification**
- **Email notification** (optional)
- **Notification details:**
  - Commission amount
  - Level (0-5)
  - Policy number
  - Link to view commission details

**File:** `Backend/utils/notification.util.js` (Lines 78-91)

---

## 📈 Commission Summary for Agents

Agents can view their commission summary:

```javascript
{
    total: 15,                    // Total commission records
    pending: 5,                   // Awaiting approval
    approved: 8,                  // Approved and in wallet
    paid: 2,                      // Already withdrawn
    totalAmount: 5250,            // Total of all commissions
    pendingAmount: 1500,          // Pending approval
    approvedAmount: 3000,         // In wallet
    paidAmount: 750               // Already withdrawn
}
```

---

## 🎯 Admin Controls

### **Commission Management**
1. **View All Commissions** - Filter by status, agent, date
2. **Approve Individual** - Approve single commission
3. **Bulk Approve** - Approve multiple commissions at once
4. **View Commission Details** - See full breakdown
5. **Cancel Commission** - Cancel fraudulent commissions

### **Financial Oversight**
- Dashboard shows total pending commissions
- Dashboard shows total approved commissions
- Track commission expenses
- Monitor agent earnings

---

## 🔧 Technical Implementation

### **Main Functions**

1. **`calculateAndDistributeCommissions(policy, session)`**
   - Calculates all commissions for a policy
   - Creates commission records
   - Returns array of created commissions

2. **`approveCommission(commissionId, adminId)`**
   - Approves single commission
   - Updates agent wallet
   - Sends notification

3. **`bulkApproveCommissions(commissionIds, adminId)`**
   - Approves multiple commissions
   - Returns success/failure summary

4. **`getAgentCommissionSummary(agentId)`**
   - Gets commission statistics for agent
   - Used in agent dashboard

---

## 📊 Example Commission Scenarios

### **Scenario 1: New Agent (No Parents)**
- Agent sells 1-year policy, premium ₹5,000
- **Commission:** ₹300 (fixed only)
- **Total distributed:** ₹300

### **Scenario 2: Agent with 1 Parent**
- Agent sells 3-year policy, premium ₹15,000
- **Seller:** ₹750 (fixed)
- **Parent:** ₹750 (5% of ₹15,000)
- **Total distributed:** ₹1,500

### **Scenario 3: Full 6-Level Hierarchy**
- Agent sells 2-year policy, premium ₹20,000
- **Level 0 (Seller):** ₹450 (fixed)
- **Level 1:** ₹1,000 (5%)
- **Level 2:** ₹600 (3%)
- **Level 3:** ₹400 (2%)
- **Level 4:** ₹400 (2%)
- **Level 5:** ₹200 (1%)
- **Total distributed:** ₹3,050

---

## 🎓 Key Takeaways

1. ✅ **Automatic** - Commissions calculated automatically on policy approval
2. ✅ **Multi-Level** - Up to 6 levels of commission distribution
3. ✅ **Dual System** - Fixed for sellers, percentage for parents
4. ✅ **Controlled** - Admin approval required before payout
5. ✅ **Transparent** - Full audit trail and notifications
6. ✅ **Secure** - Transaction-based, duplicate prevention
7. ✅ **Scalable** - Supports unlimited agent hierarchy depth (limited to 5 parents)

---

## 📁 Related Files

| File | Purpose |
|------|---------|
| `Backend/utils/commission.util.js` | Core commission logic |
| `Backend/models/Commission.js` | Commission data model |
| `Backend/controllers/admin.controller.js` | Admin approval endpoints |
| `Backend/utils/notification.util.js` | Commission notifications |

---

## 🔮 Future Enhancements (Potential)

- Auto-approval for trusted agents
- Commission tiers based on performance
- Bonus commissions for high performers
- Commission clawback for policy cancellations
- Real-time commission tracking dashboard

---

**Report Generated:** 2026-01-28
**System Version:** Pashudhan Suraksha v1.0
**Status:** Production Active
