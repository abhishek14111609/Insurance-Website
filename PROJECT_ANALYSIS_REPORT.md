# Project Analysis Report: Pashudhan Suraksha Insurance Website

**Date:** 2026-01-20
**Scope:** Admin Frontend, Customer Frontend, Backend

## Executive Summary
The project is a full-stack insurance management application using the MERN stack (MongoDB, Express, React, Node.js). While the architecture follows standard practices, **two critical security vulnerabilities** were identified that require immediate attention:
1.  **Privilege Escalation:** The public registration endpoint allows anyone to create an Administrator account.
2.  **Payment Manipulation:** The payment initiation endpoint trusts the client-provided amount, allowing users to pay arbitrary amounts for policies.

## 1. Security Analysis (Critical)

### 1.1. Privilege Escalation (Critical)
-   **Location:** `Backend/controllers/auth.controller.js` -> `register` function.
-   **Issue:** The code accepts `role` from the request body (`req.body.role`) and assigns it to the new user.
    ```javascript
    const { ..., role } = req.body;
    const targetRole = role || 'customer';
    // ...
    const user = await User.create({ ..., role: targetRole, ... });
    ```
-   **Impact:** A malicious user can send a POST request to `/api/auth/register` with `"role": "admin"` and instantly gain full administrative access to the system, bypassing all checks.
-   **Recommendation:** Force `role` to be `'customer'` in the public register endpoint. Create a separate, protected endpoint (or a database seed script) for creating admins and agents.

### 1.2. Payment Amount Manipulation (Critical)
-   **Location:** `Backend/controllers/payment.controller.js` -> `createOrder` function.
-   **Issue:** The API relies on the `amount` sent by the frontend to create the Razorpay order.
    ```javascript
    const { policyId, amount } = req.body;
    // ...
    const options = { amount: Math.round(numericAmount * 100), ... };
    ```
-   **Impact:** A user can modify the API request to send `amount: 1`, paying only ₹1 for a policy worth thousands.
-   **Recommendation:** Do not accept `amount` from the client. Fetch the policy details using `policyId`, calculate the required premium on the server, and use that value to create the order.

### 1.3. File Upload & XSS Risks (Medium)
-   **Location:** `Backend/middleware/upload.middleware.js` & `server.js`.
-   **Issue:** Files are stored locally in `uploads/` and served directly via `express.static`. While extensions are filtered (`jpeg|jpg|png|pdf`), serving user-generated content from the same origin poses a Stored XSS risk if a file is crafted to execute scripts (e.g., SVG with JS, or PDF exploits).
-   **Recommendation:**
    -   Ideally, store files in a cloud object storage (AWS S3, Google Cloud Storage, Cloudinary).
    -   If keeping local storage, serve files with `Content-Disposition: attachment` header to force download instead of rendering in-browser.

### 1.4. Agent Code Generation (Low)
-   **Location:** `Backend/controllers/agent.controller.js`.
-   **Issue:** Uses `Math.random()` for generating agent codes.
    ```javascript
    const agentCode = `AG${Date.now()}${Math.floor(Math.random() * 1000)}`;
    ```
-   **Impact:** Predictable agent codes.
-   **Recommendation:** Use `crypto.randomBytes` or a dedicated library for secure random string generation.

## 2. Backend Analysis

### 2.1. Architecture & Code Quality
-   **Structure:** Clean and standard MVC (Models, Views/Routes, Controllers).
-   **Configuration:** Uses `dotenv` correctly.
-   **Database:** Mongoose schemas are well-defined. `User` model correctly handles password hashing (`bcryptjs`) and excludes sensitive fields in `toJSON`.

### 2.2. Error Handling
-   **Observation:** There is no global error handling middleware in `server.js`. Errors are caught in individual controllers, but unhandled promise rejections or synchronous errors outside try/catch blocks might crash the server or hang the request.
-   **Recommendation:** Implement a global error handler middleware (`(err, req, res, next) => ...`) at the end of the middleware chain in `server.js`.

### 2.3. Input Validation
-   **Observation:** Validation is manual inside controllers (e.g., `if (!email) ...`).
-   **Recommendation:** Adopt a validation library like `express-validator` or `Joi` to standardize input validation and sanitization at the route level.

## 3. Frontend Analysis (Admin & Customer)

### 3.1. Admin Frontend
-   **Security:** Stores user role in `localStorage` (`admin:auth_user`). While the actual security relies on the HTTP-only cookie (which is correct), the frontend UI trusts this `localStorage` value. If a user manually edits `localStorage` to set `role: 'admin'`, they might see the admin UI, though API calls should fail (assuming backend enforces role checks).
-   **API Integration:** Uses `axios` interceptors effectively to handle 401 Unauthorized responses and refresh tokens.

### 3.2. Customer Frontend
-   **Authentication:** `ProtectedRoutes` correctly checks authentication state.
-   **Forms:** Form validation is present but implemented manually in components (e.g., `Register.jsx`). Using a library like `Formik` or `React Hook Form` would improve maintainability.

## 4. Summary of Recommendations

| Priority | Category | Action Item |
| :--- | :--- | :--- |
| **P0** | **Security** | **Fix `register` endpoint:** Hardcode `role` to `'customer'` for public registration. |
| **P0** | **Security** | **Fix Payment Logic:** Calculate payment amount on the backend; do not trust `req.body.amount`. |
| **P1** | **Security** | **Secure Uploads:** Serve uploads with `Content-Disposition: attachment` or move to cloud storage. |
| **P1** | **Stability**| **Global Error Handler:** Add middleware to catch and log unhandled errors. |
| **P2** | **Code** | **Validation:** Use `express-validator` for request validation. |
| **P2** | **Code** | **Agent Codes:** Use `crypto` for generating random codes. |

## 5. Conclusion
The project has a solid foundation but contains critical vulnerabilities that must be addressed before any production deployment. The most urgent tasks are securing the registration flow and the payment processing logic.
