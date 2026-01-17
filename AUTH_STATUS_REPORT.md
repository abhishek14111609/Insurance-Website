# Auth & Integration Status

## What exists
- Cookies: `token` (customer/agent), `admin_token` (admin), `refresh_token` (all). Needs correct env: `COOKIE_SECURE`, `COOKIE_SAMESITE` (none if cross-origin, lax if same-origin), `COOKIE_DOMAIN` when cross-origin.
- Email verification: enforced for non-admin; tokens stored; admin-created/approved agents also get verification emails.
- Password reset: hashed token + expiry; links use `FRONTEND_URL`.
- Refresh tokens: stored in DB (`RefreshToken`); `/auth/refresh` rotates. Frontends try one refresh on 401.
- Role separation: middleware prefers route-appropriate cookie; agent routes need `token`, admin routes `admin_token`.
- Frontends: `/verify-email` page; login pages include resend link; agent dashboard keys fixed.

## Pain points
- 401/403 on refresh or agent stats: cookies not sent (SameSite/domain/secure mismatch) or refresh expired; wrong cookie on agent routes.
- If email deliverability fails, verification/reset block login.
- Frontends clear session on any `/auth/me` failure after one refresh attempt → apparent random logouts.

## Simple action plan
1) **Cookie/env sanity**
   - Same-origin dev: `COOKIE_SECURE=false`, `COOKIE_SAMESITE=lax`, no `COOKIE_DOMAIN`.
   - Cross-origin: `COOKIE_SECURE=true`, `COOKIE_SAMESITE=none`, `COOKIE_DOMAIN=<api-domain>`.
   - Restart backend after setting.
2) **Login/refresh checks**
   - One role logged in at a time; clear cookies when switching admin/agent/customer.
   - After login, ensure browser has both access cookie (`token` or `admin_token`) and `refresh_token`.
3) **Verification/reset**
   - Confirm SMTP creds. Test register → verify link → login; forgot → reset link → login.
4) **Frontend handling**
   - Only logout on confirmed 401 after a refresh attempt; treat network/CORS separately.
   - Clear `node_modules/.vite` and restart if module/default export errors or white page.
5) **Role routing**
   - Agent endpoints with agent `token`; admin endpoints with `admin_token`.

## Quick verification checklist
- Backend runs clean.
- Env set for cookies.
- Register customer/agent → receive verification → login works.
- Agent login → `/api/agents/stats` returns 200.
- Admin login → admin endpoints 200.
- Forgot/reset works end-to-end.

## Optional simplification (future)
- Collapse to single `token` + `refresh_token` for all roles (role from JWT) to reduce cross-portal confusion.
- Soften frontend logout: only clear session on confirmed 401 after refresh retry.
