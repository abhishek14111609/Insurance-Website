# Auth & Session Reliability Report

## Findings (do not change code yet)
- **Auto-logout on refresh across roles**
  - Cookies are HTTP-only but persistence depends on `sameSite/secure/domain` env. Current defaults in [Backend/controllers/auth.controller.js](Backend/controllers/auth.controller.js#L6-L18) require `COOKIE_DOMAIN` and `COOKIE_SECURE/COOKIE_SAMESITE` to be correct for your deployment; mismatches prevent cookies from being sent after a reload (seen when API/frontends are on different ports/domains).
  - No refresh-token consumption: tokens are issued (`generateRefreshToken`) but never used. When access token expires, `/auth/me` returns 401 and frontends clear local state, looking like a logout.
  - Frontend error handling clears local user on any `/auth/me` failure instead of distinguishing network/CORS vs unauthorized (see [Admin Frontend/src/context/AuthContext.jsx](Admin%20Frontend/src/context/AuthContext.jsx#L18-L68) and [Customer Frontend/src/context/AuthContext.jsx](Customer%20Frontend/src/context/AuthContext.jsx#L17-L88)).
  - Cross-portal cookie mixing: `token` (customer/agent) and `admin_token` (admin) can both exist; hitting an admin-only endpoint with only `token` yields 403. Middleware now prefers `admin_token`, but stale cookies may remain across portals.

- **Email verification is absent**
  - There is no verification token model/field, no `/verify-email` endpoint, and no email with a verification link. Registration immediately activates users in [auth.controller register](Backend/controllers/auth.controller.js#L33-L86).

- **Forgot/reset password is broken**
  - `forgotPassword` issues a token, but `resetPassword` uses a Sequelize-style query (`where`, `Op`) and is not compatible with Mongoose; this endpoint will fail and cannot reset passwords (see [Backend/controllers/auth.controller.js](Backend/controllers/auth.controller.js#L327-L412)).
  - No email template/URL for agents vs customers; single flow may confuse portals.

- **Agent/customer portal role leakage**
  - Customer AuthContext rejects admins but allows agents; agents share the `token` cookie with customers. If an agent logs in then opens customer pages, data mixing can occur.

- **Security/consistency gaps**
  - Cookies are cleared with `cookieOptions`, but config for prod must be set (`COOKIE_DOMAIN`, `COOKIE_SECURE=true`, `COOKIE_SAMESITE=none`) or sessions won’t stick across origins.
  - No device/browser invalidation on password change or logout beyond cookie clear; no refresh token blacklist.

## Impact
- Users get logged out on refresh when cookies aren’t sent (SameSite/domain) or when the access token expires (no refresh handling).
- Password reset currently cannot succeed; agents/customers cannot recover accounts.
- No email verification → fake/unverified accounts possible.
- Role mixing can expose agent data in customer UI and vice versa.

## Remediation Plan (no code applied yet)
1) **Stabilize cookies**
   - Set envs for deployment: `COOKIE_DOMAIN=<api-domain>`, `COOKIE_SECURE=true`, `COOKIE_SAMESITE=none` when frontends are on different origin; keep `secure=false`, `sameSite=lax` for localhost.
2) **Implement refresh token flow**
   - Add refresh token store (DB/whitelist), `/auth/refresh`, and frontend retry logic before treating 401 as logout.
3) **Email verification**
   - Add verification token fields to `User`, create `/auth/send-verification` and `/auth/verify/:token`, send email with signed token; gate login until verified (or restrict actions).
4) **Fix password reset**
   - Replace the Sequelize-style reset with a Mongoose lookup, store hashed token + expiry, and allow agents/customers to reset via emailed link.
5) **Frontend auth robustness**
   - In both auth contexts, treat network/CORS errors separately; only clear user on confirmed 401/403. Add a retry of `/auth/refresh` before logout. Keep minimal user in storage only after successful `/me`.
6) **Role separation**
   - Enforce portal checks: block agents on customer portal and customers on agent portal; prefer role-specific cookies on requests (already in middleware, but frontends should avoid cross-login usage).

## What I need from you to proceed
- Confirm deployment origins/ports for API, admin frontend, customer/agent frontend.
- Confirm you want enforced email verification before login, or just post-registration reminder.
- Confirm refresh-token persistence approach (DB collection vs stateless short-lived access tokens).

(No code changes were made; this file is a diagnosis and plan.)
