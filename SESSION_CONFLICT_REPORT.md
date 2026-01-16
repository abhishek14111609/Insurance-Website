# Session Conflict Analysis & Fix Report

## 1. Issue Explanation
You are experiencing automatic logouts because of a **Cookie Conflict** between the Admin and Customer portals.

### The Mechanism
1.  **Shared Domain**: Both your Admin and Customer frontends run on `localhost`. Browsers share cookies across all ports on the same domain.
2.  **Overwriting**:
    *   When you log in as **Admin**, the backend sets a cookie named `token` (with Admin data) AND `admin_token`.
    *   When you log in as **Customer**, the backend sets the **same cookie name** `token` (with Customer data), overwriting the Admin's `token`.
3.  **Authentication Failure**:
    *   When you go back to the **Admin Portal**, your browser sends the new `token` (which is now a Customer token).
    *   The Backend reads `token` first. It sees "Customer".
    *   The Admin Portal asks for Admin Data. Backend says "You are a Customer, not Admin" (403 Forbidden).
    *   Your Admin Frontend interprets this error as "Session Expired" and logs you out.

---

## 2. Solution Strategy
To support simultaneous logins (Multi-Persona), we must strictly separate the sessions and teach the Backend how to distinguish them.

### Step 1: Distinct Cookies
We will modify the login logic to:
*   **Admins**: Set ONLY `admin_token`. Do NOT set the generic `token`.
*   **Customers**: Set ONLY `token` (or `customer_token`).

### Step 2: Intelligent Token Selection
We will modify the authentication middleware to pick the correct cookie based on who is asking.
*   If the request comes from the **Admin Port** (e.g., 5175), look for `admin_token`.
*   If the request comes from the **Customer Port** (e.g., 5173), look for `token`.

---

## 3. Required Code Changes

### A. Backend: `controllers/auth.controller.js`
**Current:** Sets `token` for *everyone*.
**Fix:** 
```javascript
// Remove the generic 'token' set for admins
if (user.role === 'admin') {
    res.cookie('admin_token', token, { ... });
} else {
    res.cookie('token', token, { ... });
}
```

### B. Backend: `middleware/auth.middleware.js`
**Current:** Always prefers `token`.
**Fix:**
```javascript
export const authenticate = async (req, res, next) => {
    let token = null;
    
    // Check Origin/Referer to guess context (robust for localhost)
    const origin = req.headers.origin || req.headers.referer;
    const isAdminFrontend = origin && origin.includes('5175'); // Adjust port as needed

    if (isAdminFrontend && req.cookies?.admin_token) {
        token = req.cookies.admin_token;
    } else if (req.cookies?.token) {
        token = req.cookies.token;
    } 
    // ...
};
```
*Note: This port-based check is specifically to help your development environment. In production, different subdomains (admin.site.com vs site.com) would handle this naturally.*
