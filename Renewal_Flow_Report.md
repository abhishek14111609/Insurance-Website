# Policy Renewals System Report

## 1. The Full Flow of Renewals

### Customer Panel Flow
- The customer navigates to `Renewals.jsx` which queries all their policies. It filters out policies with statuses like `PENDING`, `CANCELLED`, or `REJECTED`, and checks if `daysToExpiry <= 60`. If so, it places them in an "Expiring Soon" or "Expired" list.
- Clicking **"Renew Now"** navigates to `RenewalForm.jsx` carrying the old policy details.
- The user selects a renewal duration (1, 2, or 3 years). The system automatically increases the cattle's age and adjusts the start date to exactly 1 day after the old policy's end date.
- Upon submission, it constructs a payload that duplicates all cattle specs and photos, and sends this to `policyAPI.create`. 
- **Result:** Instead of migrating or updating the old policy, it inherently creates a **brand-new policy** with a `PENDING` status, redirecting the user to `/payment`.

### Agent Panel Flow
- The agent navigates to `AgentRenewals.jsx`. The frontend dynamically calculates whether a policy is `expiring-soon` (≤ 30 days) or `expired` based on the old end date. 
- Clicking **"Renew"** redirects the agent to `AgentAddPolicy.jsx` where step-by-step fields are pre-filled with the old policy's `renewalData`.
- The frontend intentionally binds a `previousPolicyId` to the `policyData` object to notify the backend that this is a renewal.
- The agent finishes the wizard, indicates cash or online payment, and submits. The request flows to `agentAPI.addPolicy`. 
- **Result:** Just like the customer panel, it creates a **brand-new policy** on the backend marked as `PENDING_APPROVAL`.

---

## 2. Bugs, Errors, and Critical Issues Found

### Critical Issue A: `RENEWED` Status is Missing from the Backend Schema
Both the Customer frontend and Agent frontend expect a policy status to be `'RENEWED'` (e.g., in `CustomerFrontend` it tries to filter out `policy.status === 'RENEWED'` to avoid showing already-renewed policies). However, looking at the Mongoose `Backend/models/Policy.js` schema, the `status` enumeration is strictly limited to:  
`['PENDING', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED']`
Because `RENEWED` does not exist as an allowable status in the database schema, the backend can never actually mark a policy as successfully renewed, breaking frontend filtering logic.

### Critical Issue B: Original Policies Are Never Updated (Infinite Expiration Bug)
When a renewal is executed in either panel, the backend receives data to create a *new* policy but executes **no logic to update or link the original policy**:
* In the **Customer** panel, the original policy's ID isn't even dispatched to the backend.
* In the **Agent** panel, `previousPolicyId` is sent with the JSON, but `Backend/controllers/agent.controller.js` entirely ignores this field when building the new `Policy.create(...)` object.

Since the original policy is never updated or disabled, it simply hits its expiration date and marks itself as `EXPIRED`. As a result, users and agents will permanently see the old policy alerting them that it is "Expired" and requesting them to renew it, even if they have already purchased the new linked policy.

### Bug C: Flawed Photo Payload Structure in Customer Renewals
During Customer renewals (`RenewalForm.jsx`), the code directly grabs the existing URL objects via `photos: policy.photos || {}` and sends them inside the JSON payload to the `policyAPI.create` endpoint. The backend endpoint inside `Backend/controllers/policy.controller.js`, however, is specifically designed to extract relative paths from uploaded files relying heavily on string manipulations like replacing `\\` with `/` and looking for `uploads/`. Passing direct, pre-populated picture strings into a brand-new creation request may bypass proper file ingestion logic depending on how URLs are stored initially, and could lead to missing or undefined paths in the new policy.

---

## Summary
The renewal process currently functions purely as a "clone policy" shortcut rather than a true internal lifecycle update. Because the backend is not programmed to receive, link, or track `previousPolicyId`—and because it outright lacks a database schema and logic for the `"RENEWED"` status—the system simply generates duplicate active policies while stranding older policies in an infinite "Expired" state on the frontend.
