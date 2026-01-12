# � FIX: Database Connection Error

## Problem
```
❌ Unable to connect to the database: Unknown database 'insurance_db'
❌ Failed to connect to database. Server not started.
```

## Solution - Choose ONE method:

---

## ⚡ METHOD 1: Automatic Setup (RECOMMENDED)

### Step 1: Stop the current server
Press `Ctrl+C` in the terminal running `npm run dev`

### Step 2: Run the setup script
```bash
npm run setup:db
```

This will automatically create the database for you!

### Step 3: Start the server again
```bash
npm run dev
```

✅ Done! Server should start successfully.

---

## 🔨 METHOD 2: Manual MySQL Setup

### Option A: Using MySQL Workbench

1. Open **MySQL Workbench**
2. Connect to your local MySQL server
3. Click on "SQL" tab or create new SQL tab
4. Paste this command:
   ```sql
   CREATE DATABASE insurance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
5. Click the lightning bolt icon (⚡) to execute
6. Go back to terminal and run: `npm run dev`

### Option B: Using MySQL Command Line

1. Open **MySQL Command Line Client** or **Command Prompt**
2. Login to MySQL:
   ```bash
   mysql -u root -p
   ```
3. Enter your MySQL password
4. Create database:
   ```sql
   CREATE DATABASE insurance_db;
   ```
5. Exit MySQL:
   ```sql
   exit;
   ```
6. Go back to terminal and run: `npm run dev`

### Option C: Using XAMPP phpMyAdmin

1. Start **XAMPP Control Panel**
2. Start **MySQL** service
3. Click **Admin** button next to MySQL (opens phpMyAdmin)
4. Click **"New"** in the left sidebar
5. Database name: `insurance_db`
6. Collation: `utf8mb4_unicode_ci`
7. Click **"Create"**
8. Go back to terminal and run: `npm run dev`

---

## 🔍 Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"

**Fix:** Update your `.env` file with correct MySQL password:

1. Copy `.env.example` to `.env` (if not already done)
2. Edit `.env` file:
   ```env
   DB_PASSWORD=your_actual_mysql_password
   ```
3. Save and try again

### Error: "Can't connect to MySQL server"

**Fix:** Make sure MySQL is running:

**Windows:**
- Open **Services** (Win+R → `services.msc`)
- Find **MySQL** or **MySQL80**
- Right-click → **Start**

**XAMPP:**
- Open **XAMPP Control Panel**
- Click **Start** next to **MySQL**

### Error: "connect ECONNREFUSED 127.0.0.1:3306"

**Fix:** MySQL is not running or wrong port

1. Check if MySQL is running (see above)
2. If using different port, update `.env`:
   ```env
   DB_PORT=3307
   ```

---

## ✅ Verify Database Created

After creating the database, verify it exists:

```sql
SHOW DATABASES;
```

You should see `insurance_db` in the list.

---

## 🎯 Expected Success Output

When you run `npm run dev` successfully, you should see:

```
✅ Database connection established successfully.
✅ Database synchronized successfully.

🚀 Server running on http://localhost:5000
📊 Environment: development
🌐 Frontend URL: http://localhost:5173
🔧 Admin URL: http://localhost:5174
```

And these tables will be created automatically:
- users
- policies
- agents
- payments
- commissions
- withdrawals

---

## 🆘 Still Having Issues?

1. **Check MySQL is installed:**
   ```bash
   mysql --version
   ```

2. **Check if port 3306 is in use:**
   ```bash
   netstat -ano | findstr :3306
   ```

3. **Try connecting manually:**
   ```bash
   mysql -u root -p -h localhost -P 3306
   ```

4. **Check `.env` file exists and has correct values**

---

**Once database is created, the backend will work perfectly!** ✅
