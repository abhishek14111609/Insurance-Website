# 🚀 BACKEND IMPLEMENTATION - SETUP GUIDE

## ✅ COMPLETED IMPLEMENTATION

### Database & Models (MySQL + Sequelize)
- ✅ Database configuration with connection pooling
- ✅ User model with bcrypt password hashing
- ✅ Policy model with complete cattle insurance fields
- ✅ Agent model with MLM hierarchy support
- ✅ Payment model with Razorpay integration
- ✅ Commission model for agent earnings
- ✅ Withdrawal model for payout requests
- ✅ Model associations and relationships

### Authentication & Security
- ✅ JWT authentication middleware
- ✅ Role-based authorization (customer/agent/admin)
- ✅ Password hashing with bcrypt
- ✅ Token generation and verification
- ✅ CORS configuration

### Server Setup
- ✅ Express server with error handling
- ✅ Environment configuration
- ✅ Database auto-sync
- ✅ Static file serving for uploads

---

## 📦 INSTALLED PACKAGES

```json
{
  "dependencies": {
    "express": "^5.2.1",
    "mysql2": "Latest",
    "sequelize": "Latest",
    "bcryptjs": "Latest",
    "jsonwebtoken": "Latest",
    "cors": "Latest",
    "multer": "Latest",
    "nodemailer": "Latest",
    "razorpay": "Latest",
    "express-validator": "Latest",
    "dotenv": "^17.2.3",
    "nodemon": "^3.1.11"
  }
}
```

---

## 🗄️ DATABASE SETUP

### Step 1: Create MySQL Database

```sql
CREATE DATABASE insurance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env` and update:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=insurance_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Razorpay (Use your keys)
RAZORPAY_KEY_ID=rzp_test_ks9zLlM1eAiV1S
RAZORPAY_KEY_SECRET=Wl63rHSkHOK2o4s7djULBKGx
```

### Step 3: Run Server (Auto-creates tables)

```bash
npm run dev
```

The server will automatically:
1. Connect to MySQL
2. Create all tables based on models
3. Set up relationships
4. Start listening on port 5000

---

## 📊 DATABASE SCHEMA

### Tables Created Automatically:

1. **users** - Customer, Agent, and Admin accounts
2. **policies** - Insurance policies with cattle details
3. **agents** - Agent profiles with MLM hierarchy
4. **payments** - Razorpay payment transactions
5. **commissions** - Agent commission records
6. **withdrawals** - Agent withdrawal requests

### Relationships:
- User → Policies (One-to-Many)
- User → Agent Profile (One-to-One)
- Agent → Sub-Agents (Self-referencing hierarchy)
- Policy → Payments (One-to-Many)
- Policy → Commissions (One-to-Many)
- Agent → Commissions (One-to-Many)
- Agent → Withdrawals (One-to-Many)

---

## 🔧 NEXT STEPS (To Complete Backend)

### IMMEDIATE (Required for Basic Functionality)

1. **Create Auth Routes** (`routes/auth.route.js`)
   ```javascript
   POST /api/auth/register
   POST /api/auth/login
   POST /api/auth/logout
   POST /api/auth/refresh-token
   ```

2. **Create Policy Routes** (`routes/policy.route.js`)
   ```javascript
   GET    /api/policies
   GET    /api/policies/:id
   POST   /api/policies
   PUT    /api/policies/:id
   DELETE /api/policies/:id
   ```

3. **Create Payment Routes** (`routes/payment.route.js`)
   ```javascript
   POST /api/payments/create-order
   POST /api/payments/verify
   POST /api/payments/webhook
   ```

4. **Create File Upload Middleware** (`middleware/upload.middleware.js`)
   - Multer configuration for cattle photos
   - Image validation and compression
   - Cloud storage integration (optional)

5. **Create Email Service** (`services/email.service.js`)
   - Nodemailer configuration
   - Email templates
   - Send approval/rejection emails

---

## 🎯 TESTING THE BACKEND

### 1. Start MySQL Server
Make sure MySQL is running on your system.

### 2. Start Backend Server
```bash
cd "d:\Reimvide\Insurance Website\Backend"
npm run dev
```

### 3. Test Health Endpoint
```bash
curl http://localhost:5000/health
```

Expected Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-01-12T05:37:57.000Z"
}
```

### 4. Check Database Tables
```sql
USE insurance_db;
SHOW TABLES;
```

You should see:
- users
- policies
- agents
- payments
- commissions
- withdrawals

---

## 🔐 SECURITY NOTES

### ⚠️ IMPORTANT:
1. **Change JWT_SECRET** in `.env` to a strong random string
2. **Never commit `.env`** file to Git
3. **Use HTTPS** in production
4. **Enable rate limiting** for API endpoints
5. **Validate all inputs** before database operations

---

## 📁 BACKEND STRUCTURE

```
Backend/
├── config/
│   └── database.js          ✅ Created
├── models/
│   ├── User.js              ✅ Created
│   ├── Policy.js            ✅ Created
│   ├── Agent.js             ✅ Created
│   ├── Payment.js           ✅ Created
│   ├── Commission.js        ✅ Created
│   ├── Withdrawal.js        ✅ Created
│   └── index.js             ✅ Created (Associations)
├── middleware/
│   ├── auth.middleware.js   ✅ Created
│   └── upload.middleware.js ⏳ To Create
├── routes/
│   ├── auth.route.js        ⏳ To Create
│   ├── policy.route.js      ⏳ To Create
│   ├── payment.route.js     ⏳ To Create
│   ├── agent.route.js       ⏳ To Create
│   └── admin.route.js       ⏳ To Create
├── controllers/
│   ├── auth.controller.js   ⏳ To Create
│   ├── policy.controller.js ⏳ To Create
│   ├── payment.controller.js⏳ To Create
│   └── agent.controller.js  ⏳ To Create
├── services/
│   ├── email.service.js     ⏳ To Create
│   └── payment.service.js   ⏳ To Create
├── uploads/                 📁 Create this folder
├── .env                     ✅ Configure
├── .env.example             ✅ Created
├── server.js                ✅ Updated
└── package.json             ✅ Updated
```

---

## 🚨 TROUBLESHOOTING

### Error: "Access denied for user"
- Check MySQL username/password in `.env`
- Ensure MySQL server is running
- Grant proper permissions to user

### Error: "Database does not exist"
- Create database manually: `CREATE DATABASE insurance_db;`
- Or update `DB_NAME` in `.env`

### Error: "Port 5000 already in use"
- Change `PORT` in `.env`
- Or kill process using port 5000

### Error: "Cannot find module"
- Run `npm install` again
- Check all imports use `.js` extension

---

## 📈 PERFORMANCE TIPS

1. **Add Database Indexes**
   ```sql
   CREATE INDEX idx_policy_customer ON policies(customer_id);
   CREATE INDEX idx_policy_status ON policies(status);
   CREATE INDEX idx_agent_code ON agents(agent_code);
   ```

2. **Enable Query Logging** (Development only)
   ```javascript
   // In database.js
   logging: console.log
   ```

3. **Use Connection Pooling** (Already configured)
   ```javascript
   pool: {
       max: 5,
       min: 0,
       acquire: 30000,
       idle: 10000
   }
   ```

---

## 🎉 WHAT'S WORKING

✅ MySQL database connection
✅ All tables auto-created with relationships
✅ User authentication structure ready
✅ Password hashing with bcrypt
✅ JWT token generation
✅ CORS configured for frontend
✅ Error handling middleware
✅ Environment configuration
✅ Model associations
✅ Server auto-restart with nodemon

---

## 🔜 WHAT'S NEXT

1. Create authentication routes and controllers
2. Create policy management routes
3. Implement Razorpay payment verification
4. Add file upload for cattle photos
5. Set up email service
6. Create admin routes for approvals
7. Add input validation
8. Implement rate limiting
9. Add API documentation
10. Write unit tests

---

## 📞 SUPPORT

If you encounter any issues:
1. Check the console for error messages
2. Verify MySQL is running
3. Ensure all environment variables are set
4. Check database connection settings

---

**Backend Foundation Complete!** ✅
**Ready for Route Implementation** 🚀
