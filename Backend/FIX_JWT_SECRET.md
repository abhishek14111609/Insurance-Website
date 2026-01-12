# 🔧 QUICK FIX: JWT Secret Missing

## Problem
```
Error: secretOrPrivateKey must have a value
```

## Solution

The `.env` file needs to be configured with a JWT secret.

### Option 1: Manual Setup (RECOMMENDED)

1. **Copy the example file:**
   ```bash
   copy .env.example .env
   ```

2. **Edit `.env` file and update:**
   ```env
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345678
   ```

3. **Restart server:**
   ```bash
   npm run dev
   ```

### Option 2: Quick Command (Windows)

Run this in PowerShell:
```powershell
@"
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=insurance_db
DB_USER=root
DB_PASSWORD=

# JWT Secret
JWT_SECRET=insurance_jwt_secret_key_2026_change_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_ks9zLlM1eAiV1S
RAZORPAY_KEY_SECRET=Wl63rHSkHOK2o4s7djULBKGx

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=SecureLife Insurance <noreply@securelife.com>

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
"@ | Out-File -FilePath .env -Encoding UTF8
```

Then restart: `npm run dev`

---

## ✅ After Fix

Run test again:
```bash
node test-register.js
```

Should see:
```
✅ Registration successful!
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

---

**The `.env` file is gitignored for security, so you need to create it manually!**
