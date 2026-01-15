# Cookie Separation Fix - Testing Guide

## Problem Fixed
Admin login was sharing cookies with customer/agent login, causing cross-portal authentication.

## Solution
Backend now uses **different cookie names** based on user role:
- **Admin users**: `admin_token` cookie
- **Customer/Agent users**: `token` cookie

## Backend Changes Made

### 1. Login Controller (`auth.controller.js`)
```javascript
// Line 197-200
const cookieName = user.role === 'admin' ? 'admin_token' : 'token';
res.cookie(cookieName, token, { ... });
```

### 2. Logout Controller (`auth.controller.js`)
```javascript
// Clears both cookies to ensure complete logout
res.clearCookie('token', { ... });
res.clearCookie('admin_token', { ... });
```

### 3. Auth Middleware (`auth.middleware.js`)
```javascript
// Checks both cookie names
const token = req.header('Authorization')?.replace('Bearer ', '') 
    || req.cookies?.token 
    || req.cookies?.admin_token;
```

## How It Works Now

### Admin Login Flow:
1. Admin enters credentials at `http://localhost:5175/login`
2. Backend verifies `role === 'admin'`
3. Backend sets cookie named `admin_token`
4. Admin can access admin dashboard
5. **Customer portal will NOT see this cookie** (different name)

### Customer/Agent Login Flow:
1. User enters credentials at `http://localhost:5173/login`
2. Backend verifies `role === 'customer'` or `role === 'agent'`
3. Backend sets cookie named `token`
4. User can access customer/agent dashboard
5. **Admin portal will NOT see this cookie** (different name)

## Testing Steps

### Step 1: Clear All Cookies
1. Open DevTools (F12)
2. Go to Application → Cookies → localhost
3. Delete ALL cookies
4. Close all browser tabs for both portals

### Step 2: Test Admin Login
1. Go to `http://localhost:5175/login`
2. Login with: `admin` / `admin123`
3. Check DevTools → Cookies
4. Should see: `admin_token` cookie ✓
5. Should NOT see: `token` cookie ✓

### Step 3: Test Customer Portal (Same Browser)
1. Open new tab: `http://localhost:5173`
2. Should see login page (NOT logged in) ✓
3. Try to access `http://localhost:5173/dashboard`
4. Should redirect to login ✓

### Step 4: Test Customer Login
1. At `http://localhost:5173/login`
2. Register/Login as customer
3. Check DevTools → Cookies
4. Should see: `token` cookie ✓
5. Should STILL see: `admin_token` cookie (from step 2)
6. But customer portal only reads `token` ✓

### Step 5: Test Admin Portal (Same Browser)
1. Go to `http://localhost:5175`
2. Should see admin dashboard (still logged in) ✓
3. Admin portal only reads `admin_token` ✓

### Step 6: Test Logout
1. Logout from admin portal
2. Check cookies - `admin_token` should be gone ✓
3. Check customer portal - should still be logged in ✓
4. Logout from customer portal
5. Check cookies - `token` should be gone ✓

## Expected Behavior

✅ **Admin can ONLY login at Admin Portal**
✅ **Customer/Agent can ONLY login at Customer Portal**
✅ **Logging into one portal does NOT affect the other**
✅ **Each portal only reads its own cookie**
✅ **No localStorage usage - all auth via cookies**

## Verification Commands

Check what cookies are set after login:
```javascript
// In browser console
document.cookie
```

Expected for Admin:
```
admin_token=eyJhbGc...
```

Expected for Customer/Agent:
```
token=eyJhbGc...
```

## Troubleshooting

If still seeing cross-portal auth:
1. **Clear ALL cookies** completely
2. **Close all browser tabs**
3. **Restart both dev servers**
4. Test again from fresh browser session

If admin can't login:
- Check database has user with `role: 'admin'`
- Check email is `admin@insurance.com`
- Check password is `admin123`

If customer can't login:
- Make sure not using admin credentials
- Register new customer account
- Check user role is `customer` or `agent`
