# Comprehensive Project Analysis & Implementation Plan

## 1. Project Status Analysis

### 🟢 Backend (Port 5000)
*   **Status:** Operational. Connected to MySQL.
*   **Capabilities:**
    *   Authentication (Register, Login, JWT).
    *   Policy Management (Create, Read, Update).
    *   Payment Processing (Razorpay Integration complete).
*   **CRITICAL BLOCKER (Identified):** The server uses the default `express.json()` limit (100kb). The Frontend sends images as Base64 strings within the JSON payload, which typically exceeds this limit, causing the **"Request Entity Too Large" (HTTP 413)** error you are seeing.
*   **Missing:**
    *   Admin user seeding (Admin account doesn't exist yet).
    *   Claims & Agent API endpoints.

### 🟢 Customer Frontend (Port 5173)
*   **Status:** Integrated.
*   **Completed Integrations:**
    *   **Login/Register:** Connected to Backend API.
    *   **Dashboard:** Fetches live data from Backend.
    *   **Policy Purchase:** Submits data to Backend API (subject to 413 error).
    *   **Payment:** Fully integrated with Backend & Razorpay.
    *   **My Policies:** Fetches live data.
    *   **Profile:** Fetches live data.
*   **Pending:**
    *   Claims submission.
    *   Renewals.

### 🔴 Admin Frontend (Port ~5174)
*   **Status:** **DISCONNECTED**.
*   **Issue:** The Admin Panel currently runs on mock data stored in `localStorage`. It **cannot see** the policies created by the Customer Frontend because they are stored in the MySQL database.
*   **Impact:** You cannot complete the "Buy -> Approve" workflow. Policies will remain "Pending Approval" forever.

### 🔴 Agent Frontend
*   **Status:** **DISCONNECTED**.
*   **Issue:** Similar to Admin, it likely runs on `localStorage` and is not connected to the real backend.

---

## 2. Immediate Fixes Required (To Be Implemented)

### Priority 1: Fix the "Request Entity Too Large" Error
**Why:** Customers cannot buy policies with photos.
**Fix:** Update `Backend/server.js` to increase the JSON body limit.
```javascript
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
```

### Priority 2: Create Admin Account
**Why:** You cannot log in to the Admin Panel to approve policies.
**Fix:** Run a script or manually insert an admin user into the `Users` table in MySQL.

### Priority 3: Integrate Admin Frontend
**Why:** The Admin Panel needs to fetch pending policies from the API, not localStorage.
**Fix:**
1.  Create `api.service.js` in Admin Frontend (pointing to `http://localhost:5000/api`).
2.  Update `AdminLogin.jsx` to authenticate via API.
3.  Update `PolicyApprovals.jsx` to fetch pending policies via API and send Approve/Reject commands.

---

## 3. Implementation Roadmap

If I were to proceed, I would execute the following steps in order:

1.  **Backend Fix:** Increase `body-parser` limit in `server.js` to 50MB.
2.  **Database:** Execute the `create-admin.js` script to ensure an Admin user (`admin@securelife.com`) exists.
3.  **Admin Integration:**
    *   Copy `api.service.js` structure to Admin Frontend.
    *   Refactor `AdminLogin.jsx` to use the API.
    *   Refactor `PolicyApprovals.jsx` to use `policyAPI.getPending()` and `policyAPI.approve()`.
4.  **Verification:**
    *   Buy a policy (with photos) -> Success (No 413 error).
    *   Log in as Admin -> Success.
    *   See Policy in Admin Dashboard -> Success.
    *   Approve Policy -> Success.
    *   Check Customer Dashboard -> Policy Status is "Active".

This will complete the full End-to-End lifecycle of the application.
