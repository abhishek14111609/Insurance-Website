# Production Report: Agent Referral Links & Customer Details Logic

## 1. Agent Referral Link Fix (Production)

### Current Issue
The **Agent Team** page currently generates a referral link using:
`window.location.origin + '/become-agent'`

Example: `https://agent.yourdomain.com/become-agent?ref=CODE123`

However, checking the **Agent Frontend Routes**, the `/become-agent` route **does not exist**.
*   Existing Route: `/register` (renders `AgentLanding` page)
*   Redirect: `/become-partner` -> redirects to `/register`

### Recommended Solution
To ensure the link works in production, you must update the path in `AgentTeam.jsx` to point to the actual registration route.

**Proposed Change:**
Modify `AgentFrontend/src/pages/AgentTeam.jsx`:

**From:**
```javascript
value={`${window.location.origin}/become-agent?ref=${user?.agentCode || ''}`}
```

**To:**
```javascript
// Pointing to the internal registration page of the Agent Portal
value={`${window.location.origin}/register?ref=${user?.agentCode || ''}`}
```

**For Cross-Portal Referrals:**
If you want the link to direct users to the **Customer Website** (e.g., `pashudhansuraksha.com`) instead of the Agent Portal, you should strictly define the URL using an environment variable instead of `window.location.origin`.

1.  Add to `.env` (in AgentFrontend):
    `VITE_MAIN_WEBSITE_URL=https://pashudhansuraksha.com`
2.  Update code to:
    `value={${import.meta.env.VITE_MAIN_WEBSITE_URL}/become-partner?ref=${user?.agentCode || ''}}`

---

## 2. Customer Details Logic (PAN, Aadhar, Bank)

Currently, the `User` model (which stores Customer data) **does not** have fields for PAN, Aadhar, or Bank details. Only the `Agent` model has these.

### Logical Implementation Plan

To implement this feature "properly" without breaking existing flows, follow this architectural plan:

### A. Database Schema Updates (`User.js`)

We need to extend the `User` schema to store sensitive verification details. Since these are optional for casual users but required for claims/payouts, they should be grouped.

**Proposed Schema Additions:**
```javascript
// Add to Backend/models/User.js

kycDetails: {
    panNumber: { type: String, default: null },
    panPhoto: { type: String, default: null }, // URL to uploaded image
    aadharNumber: { type: String, default: null },
    aadharPhotoFront: { type: String, default: null },
    aadharPhotoBack: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'verified', 'rejected', 'not_submitted'], default: 'not_submitted' }
},

bankDetails: {
    accountHolderName: { type: String, default: null },
    accountNumber: { type: String, default: null },
    bankName: { type: String, default: null },
    ifscCode: { type: String, default: null },
    isVerified: { type: Boolean, default: false }
}
```

### B. Backend API Routes

1.  **Update Profile Endpoint (`PUT /api/auth/profile`)**:
    *   Allow customers to send `kycDetails` and `bankDetails` in the body.
    *   Add validation to ensure PAN is 10 chars, Aadhar is 12 digits, etc.

2.  **File Upload (`POST /api/upload`)**:
    *   Ensure the existing upload route can handle `pan`, `aadhar_front`, `aadhar_back` file types for Customers.

### C. Frontend Implementation (Customer Portal)

1.  **Profile Page (`CustomerProfile.jsx`)**:
    *   Add a new tab or section: **"KYC & Bank Details"**.
    *   **KYC Form**: Inputs for PAN/Aadhar Numbers + File Upload inputs (input type='file').
    *   **Bank Form**: Inputs for Account No, IFSC, etc.
    *   **Status Indicators**: Show badges like "Pending Verification" or "Verified".

2.  **Registration Flow (Optional)**:
    *   You can strictly enforce these during registration, but it reduces conversion rates. **Recommendation**: Keep registration simple, and prompt for these details only when the user buys a policy or claims insurance.

### D. Security Considerations

*   **Data Privacy**: PAN and Aadhar numbers are sensitive. In a strict enterprise environment, these fields should be encrypted at rest (using a dedicated encryption key) rather than stored as plain text.
*   **File Access**: The uploaded photos (PAN/Aadhar cards) should **not** be publicly accessible via simple URL guessing. Ensure your `uploads` folder is served with permission checks, or use signed URLs (like AWS S3 Presigned URLs) if moving to cloud storage.

### Summary
1.  **Fix Agent Link**: Change `/become-agent` to `/register` in `AgentTeam.jsx`.
2.  **Add Customer Data**: Add `kycDetails` and `bankDetails` objects to `User.js` model and build the UI to populate them.
