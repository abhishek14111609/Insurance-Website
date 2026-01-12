# 🚀 QUICK START - Backend Setup

## Prerequisites
- ✅ Node.js installed
- ✅ MySQL installed (or XAMPP)

## Setup in 5 Steps

### 1️⃣ Create Database
Open MySQL and run:
```sql
CREATE DATABASE insurance_db;
```

### 2️⃣ Configure Environment
In `Backend` folder, copy `.env.example` to `.env` and update:
```env
DB_PASSWORD=your_mysql_password
```

### 3️⃣ Start Server
```bash
cd "d:\Reimvide\Insurance Website\Backend"
npm run dev
```

### 4️⃣ Verify
You should see:
```
✅ Database connection established successfully.
✅ Database synchronized successfully.
🚀 Server running on http://localhost:5000
```

### 5️⃣ Test
Open browser: http://localhost:5000/health

Should return:
```json
{
  "success": true,
  "message": "Server is running"
}
```

## ✅ Done!

Tables created automatically:
- users
- policies
- agents
- payments
- commissions
- withdrawals

## Next: Implement API Routes

See `BACKEND_SETUP_GUIDE.md` for detailed instructions.

---

**Backend is ready!** 🎉
