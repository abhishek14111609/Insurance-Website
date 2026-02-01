# Dynamic Seller Commission Implementation Report

## Objective
To replace the hardcoded seller commission logic with a dynamic system configurable via the Admin Panel. Commissions will be defined "Policy Wise" (per Plan) and "Year Wise" (per Duration).

## Current Implementation Analysis
- **Location**: `Backend/utils/commission.util.js`
- **Logic**: A hardcoded `fixedMap` object defines commissions based on the term (duration):
  ```javascript
  const fixedMap = { 1: 300, 2: 450, 3: 750 };
  ```
- **Limitation**: This applies globally to all plans and cannot be changed without code deployment.

## Implementation Plan

### 1. Database Schema Updates
We need to store the commission configuration within the `PolicyPlan` model. This allows different plans to have different commission structures.

**File**: `Backend/models/PolicyPlan.js`

**Proposed Change**:
Add a new field `commissionStructure` (or `commissionRates`) to the `policyPlanSchema`.

```javascript
commissionStructure: {
    year1: { type: Number, default: 0 },
    year2: { type: Number, default: 0 },
    year3: { type: Number, default: 0 }
    // Can be extended if more durations are needed
}
```

### 2. Backend Logic Updates
We need to modify the commission calculation utility to fetch the commission rate from the specific plan associated with the policy.

**File**: `Backend/utils/commission.util.js`

**Proposed Change**:
1. In `calculateAndDistributeCommissions`, when processing the "Seller fixed commission", first retrieve the `PolicyPlan` using `policy.planId`.
2. Look up the commission amount from the plan's `commissionStructure` based on the calculated `term` (1, 2, or 3).
3. If no custom commission is defined in the plan, fallback to a default (e.g., 0 or the global default if one is kept).

**Logic Snippet (Conceptual)**:
```javascript
// Fetch plan details (ensure planId is populated or fetched)
const plan = await PolicyPlan.findById(policy.planId);
const term = getTermYears(policy);

let commissionAmount = 0;
if (plan && plan.commissionStructure) {
    if (term === 1) commissionAmount = plan.commissionStructure.year1;
    else if (term === 2) commissionAmount = plan.commissionStructure.year2;
    else if (term === 3) commissionAmount = plan.commissionStructure.year3;
}
```

### 3. Admin Frontend Updates
The Admin Panel needs these new fields so administrators can configure them when creating or editing a plan.

**Affected Pages/Components**:
- `AddPlan` Form
- `EditPlan` Form (or similar Plan Management components)

**Proposed Change**:
- Add input fields for:
  - **Commission (1 Year)**
  - **Commission (2 Years)**
  - **Commission (3 Years)**
- Validate these inputs to ensure they are varying numbers.
- Send this data in the `POST` / `PUT` request to `/api/plans`.

### 4. Parent Agent Commission Strategy
**Current Status**: Hardcoded percentages (5%, 3%, 2%, 2%, 1%) in the code.
**Proposed Change**: Enable the **Dynamic Commission Settings** from the Admin Panel.
- The system will fetch the percentages from the `CommissionSettings` database collection instead of the hardcoded array.
- This allows Admins to change the globalPercentages (e.g., change Level 1 from 5% to 7%) without code changes.
- **Note**: Parent commissions will remain **percentage-based** relative to the premium amount, which automatically scales with the value of the policy (Plan A vs Plan B).

## Summary of Benefits
- **Flexibility**: Different products (e.g., Cow vs Buffalo, Gold vs Silver) can have different agent incentives.
- **Control**: Admins can adjust commissions instantly without developer intervention.
- **Scalability**: Supports future duration additions easily.

## Next Steps
Upon your approval of this report, I will proceed with:
1.  Modifying the `PolicyPlan` model.
2.  Updating the `commission.util.js` logic.
3.  Updating the Admin Frontend form to verify the entire flow.

## Example Scenario

To visualize how this will work, let's look at two different plans with different commission structures.

### Database Data (Policy Plans)

**Plan A: "Standard Protection"**
- **Premium**: ₹2,000
- **Seller Commission (Year 2)**: ₹350 (Fixed)
- **Parent Commission Rules**: Level 1 (5%), Level 2 (3%) - *Based on Global Settings*

**Plan B: "Premium Gold Coverage"**
- **Premium**: ₹10,000
- **Seller Commission (Year 3)**: ₹1,400 (Fixed)
- **Parent Commission Rules**: Level 1 (5%), Level 2 (3%) - *Based on Global Settings*

### Calculation Results

**Scenario 1: Agent sells "Standard Protection" for 2 Years**
- **Sales Agent**: Receives **₹350** (Defined in Plan A).
- **Parent Agent (Level 1)**: Receives 5% of ₹2,000 = **₹100**.
- **Grandparent Agent (Level 2)**: Receives 3% of ₹2,000 = **₹60**.

**Scenario 2: Agent sells "Premium Gold Coverage" for 3 Years**
- **Sales Agent**: Receives **₹1,400** (Defined in Plan B).
- **Parent Agent (Level 1)**: Receives 5% of ₹10,000 = **₹500**.
- **Grandparent Agent (Level 2)**: Receives 3% of ₹10,000 = **₹300**.

*The Seller Commission is defined strictly by the Plan & Duration (Fixed Amount). The Parent Commission is dynamic based on the Premium Amount (Percentage).*

*Previously, all these scenarios would have paid a fixed, hardcoded amount (e.g., 300, 450, or 750) regardless of the plan. Now, they follow the specific rates set for each plan.*

