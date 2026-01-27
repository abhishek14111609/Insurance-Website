# VPS Deployment Guide for Pashudhan Suraksha

This guide provides step-by-step instructions to deploy your **MERN Stack** application to a **VPS (Virtual Private Server)** running **Ubuntu**. A typical setup uses **Nginx** as a reverse proxy and **PM2** to manage the Node.js backend.

## 📋 Prerequisites
*   **VPS**: An Ubuntu 20.04 or 22.04 server.
*   **Domain**: 3 subdomains/domains pointing to your VPS IP address:
    *   `pashudhansuraksha.com` (Customer Frontend)
    *   `admin.pashudhansuraksha.com` (Admin Frontend)
    *   `backend.pashudhansuraksha.com` (Backend API)
*   **SSH Access**: Ability to log in to your server via terminal.

---

## Step 1: Server Setup & Dependencies

Connect to your VPS and update the system:
```bash
ssh root@your_vps_ip
sudo apt update && sudo apt upgrade -y
```

Install **Node.js (LTS)**, **Nginx**, and **Git**:
```bash
# Install curl if missing
sudo apt install curl -y

# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y

# Verify installations
node -v
npm -v
nginx -v
```

Install **PM2** (Process Manager for Node.js):
```bash
sudo npm install -g pm2
```

---

## Step 2: Clone Your Project

Navigate to the web directory and clone your repository:
```bash
cd /var/www
sudo git clone <YOUR_GITHUB_REPO_URL> pashudhan
cd pashudhan
```
*Note: Replace `<YOUR_GITHUB_REPO_URL>` with your actual repository URL. You may need to generate an SSH key or use a Personal Access Token if the repo is private.*

---

## Step 3: Deploy Backend

1.  **Install Dependencies**:
    ```bash
    cd /var/www/pashudhan/Backend
    npm install
    ```

2.  **Configure Environment Variables**:
    Create a `.env` file for production:
    ```bash
    nano .env
    ```
    Paste the following (adjust secrets as needed):
    ```ini
    PORT=5000
    NODE_ENV=production
    MONGODB_URI=mongodb+srv://animavat876_db_user:ArlPFJjOdUNPhaqk@animalinsurance.y5ctxnl.mongodb.net/?appName=Animalinsurance
    JWT_SECRET=YOUR_SUPER_SECURE_GENERATED_SECRET
    JWT_EXPIRES_IN=7d
    
    # Frontend URLs
    FRONTEND_URL=https://pashudhansuraksha.com
    ADMIN_URL=https://admin.pashudhansuraksha.com
    CORS_ORIGINS=https://pashudhansuraksha.com,https://admin.pashudhansuraksha.com,https://www.pashudhansuraksha.com,https://www.admin.pashudhansuraksha.com
    
    # Cookie Settings for Production (HTTPS)
    COOKIE_SECURE=true
    COOKIE_SAMESITE=none
    COOKIE_DOMAIN=.pashudhansuraksha.com
    
    # Razorpay
    RAZORPAY_KEY_ID=rzp_test_ks9zLlM1eAiV1S
    RAZORPAY_KEY_SECRET=Wl63rHSkHOK2o4s7djULBKGx
    
    # SMTP
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_SECURE=false
    SMTP_USER=stifanzack@gmail.com
    SMTP_PASS=hjhdzmrublrxwkzo
    SMTP_FROM="Pashudhan Suraksha" <stifanzack@gmail.com>
    ```
    *Press `Ctrl+X`, then `Y`, then `Enter` to save.*

3.  **Start Backend with PM2**:
    ```bash
    pm2 start server.js --name "pashudhan-backend"
    pm2 save
    pm2 startup
    ```
    *(Run the command output by `pm2 startup` to configure auto-restart on boot).*

---

## Step 4: Deploy Frontends (Build React Apps)

### 1. Customer Frontend
```bash
cd /var/www/pashudhan/CustomerFrontend
npm install

# Create production .env
nano .env
# Add: VITE_API_URL=https://backend.pashudhansuraksha.com/api

# Build
npm run build
```

### 2. Admin Frontend
```bash
cd /var/www/pashudhan/AdminFrontend
npm install

# Create production .env
nano .env
# Add: VITE_API_URL=https://backend.pashudhansuraksha.com/api

# Build
npm run build
```

---

## Step 5: Configure Nginx (Reverse Proxy)

Create a configuration file for your domains:
```bash
sudo nano /etc/nginx/sites-available/pashudhan
```

Paste the following configuration:

```nginx
# 1. Backend API (backend.pashudhansuraksha.com)
server {
    server_name backend.pashudhansuraksha.com;

    location / {
        proxy_pass http://localhost:5000; # Forward to Node.js
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Pass real IP to backend
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# 2. Customer Frontend (pashudhansuraksha.com)
server {
    server_name pashudhansuraksha.com www.pashudhansuraksha.com;
    root /var/www/pashudhan/CustomerFrontend/dist; # Path to build folder
    index index.html;

    location / {
        try_files $uri $uri/ /index.html; # Handle React Router
    }
}

# 3. Admin Frontend (admin.pashudhansuraksha.com)
server {
    server_name admin.pashudhansuraksha.com www.admin.pashudhansuraksha.com;
    root /var/www/pashudhan/AdminFrontend/dist; # Path to build folder
    index index.html;

    location / {
        try_files $uri $uri/ /index.html; # Handle React Router
    }
}
```

**Enable the site and restart Nginx:**
```bash
# Link the config
sudo ln -s /etc/nginx/sites-available/pashudhan /etc/nginx/sites-enabled/

# Remove default site (optional but recommended)
sudo rm /etc/nginx/sites-enabled/default

# Test config for errors
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Step 6: Setup SSL (HTTPS) with Certbot

Secure all domains with free Let's Encrypt certificates.

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain Certificates
sudo certbot --nginx -d pashudhansuraksha.com -d www.pashudhansuraksha.com -d admin.pashudhansuraksha.com -d backend.pashudhansuraksha.com
```

Follow the prompts (enter email, agree to terms). Certbot will automatically update your Nginx config to force HTTPS.

---

## Step 7: Final Verification

1.  Open `https://backend.pashudhansuraksha.com/api` -> Should show "API Running" message.
2.  Open `https://pashudhansuraksha.com` -> Should load Customer Frontend.
3.  Open `https://admin.pashudhansuraksha.com` -> Should load Admin Frontend.
4.  **Login Test**: Try logging in on both frontends to ensure cookies and CORS are working.

## Troubleshooting
*   **502 Bad Gateway**: Backend is not running. Check `pm2 status` or `pm2 logs`.
*   **404 on Refresh**: Nginx `try_files` directive might be missing in the location block.
*   **CORS Errors**: Check `Backend/.env` `CORS_ORIGINS` matches the exact domain (including https://).
