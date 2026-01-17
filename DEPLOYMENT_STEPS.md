# Deployment Steps (Simple)

## 1) Fix secrets before deploying
- Remove the Razorpay secret from the customer app file: `Customer Frontend/src/config/razorpay.config.js` should not contain `keySecret`. Keep only `keyId` on the frontend. Put the secret in backend env (`RAZORPAY_KEY_SECRET`).

## 2) Backend on Render
1. Create a new Web Service on Render.
2. Connect this repo and choose the `Backend` folder as the root.
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add Environment Variables:
   - `MONGODB_URI` = your MongoDB connection string
   - `JWT_SECRET` = a long random string
   - `FRONTEND_URL` = `https://your-customer-app.vercel.app`
   - `ADMIN_URL` = `https://your-admin-app.vercel.app`
   - `CORS_ORIGINS` = `https://your-customer-app.vercel.app,https://your-admin-app.vercel.app`
   - `RAZORPAY_KEY_ID` = your Razorpay key ID
   - `RAZORPAY_KEY_SECRET` = your Razorpay secret (keep it only here)
   - `NODE_ENV` = `production`
6. Deploy. After deploy, test `https://your-render-app.onrender.com/health` and ensure it returns success.

> Note on uploads: Render file system is ephemeral. If you need to keep uploaded files (agent docs, policy PDFs), configure persistent storage (Render disk) or switch uploads to an external storage (e.g., S3). Without this, files may disappear after restarts.

## 3) Admin Frontend on Vercel
1. Create a new Vercel project; set root to `Admin Frontend`.
2. Install command: `npm install`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add Environment Variables:
   - `VITE_API_URL` = `https://your-render-app.onrender.com/api`
6. Deploy.

## 4) Customer Frontend on Vercel
1. Create another Vercel project; set root to `Customer Frontend`.
2. Install command: `npm install`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add Environment Variables:
   - `VITE_API_URL` = `https://your-render-app.onrender.com/api`
   - `VITE_RAZORPAY_KEY_ID` (optional): your public Razorpay key; do not include the secret.
6. Deploy.

## 5) Update Razorpay config (customer app)
- In `Customer Frontend/src/config/razorpay.config.js`, remove `keySecret`. Read the public key from `import.meta.env.VITE_RAZORPAY_KEY_ID` instead. The backend will use `RAZORPAY_KEY_SECRET` from env for order creation/verification.

## 6) After deployment tests
- Open both Vercel sites and ensure pages load with no CORS errors.
- Try login and basic navigation.
- Start a test payment to confirm Razorpay popup loads (use test keys).
- Verify file uploads (agent docs) if using persistent storage; otherwise expect them to be temporary.

## 7) If something fails
- Check Render logs for backend errors.
- Check Vercel build logs for frontend errors.
- Confirm all env vars are set exactly as listed above.
