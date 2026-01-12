# 🚀 Quick Reference Guide - Full Backend Integration

## 📚 Documentation Index

### 📖 Main Documents (Read in Order)
1. **EXECUTIVE_SUMMARY.md** ⭐ START HERE
   - Overview of the entire project
   - Current state vs target state
   - Quick start guide

2. **FULL_BACKEND_INTEGRATION_PLAN.md**
   - Detailed implementation strategy
   - Missing APIs and models
   - Phase-by-phase breakdown

3. **SYSTEM_ARCHITECTURE.md**
   - Technical architecture
   - Database schema
   - Data flow diagrams
   - API structure

4. **IMPLEMENTATION_CHECKLIST.md**
   - Step-by-step tasks
   - Progress tracking
   - Detailed checklist for each phase

5. **LOCALSTORAGE_ELIMINATION_PLAN.md**
   - localStorage usage analysis
   - Migration strategy
   - File-by-file checklist

6. **THIS FILE** (QUICK_REFERENCE_GUIDE.md)
   - Quick commands
   - Code snippets
   - Common patterns

---

## ⚡ Quick Commands

### Start Development Servers
```bash
# Backend (Port 5000)
cd "d:\Reimvide\Insurance Website\Backend"
npm run dev

# Customer Frontend (Port 5173)
cd "d:\Reimvide\Insurance Website\Customer Frontend"
npm run dev

# Admin Frontend (Port 5174)
cd "d:\Reimvide\Insurance Website\Admin Frontend"
npm run dev
```

### Database Commands
```bash
# Access MySQL
mysql -u root -p

# Create database
CREATE DATABASE insurance_db;

# Use database
USE insurance_db;

# Show tables
SHOW TABLES;

# View table structure
DESCRIBE users;
DESCRIBE policies;
```

### Git Commands
```bash
# Check status
git status

# Create feature branch
git checkout -b feature/backend-integration

# Commit changes
git add .
git commit -m "feat: implement agent management APIs"

# Push changes
git push origin feature/backend-integration
```

---

## 🔧 Common Code Patterns

### 1. Create a New Model

**File**: `Backend/models/ModelName.js`

```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ModelName = sequelize.define('ModelName', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Add your fields here
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'table_name',
    timestamps: true,
    underscored: true
});

export default ModelName;
```

**Update**: `Backend/models/index.js`
```javascript
import ModelName from './ModelName.js';

// Add associations
ModelName.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Export
export {
    User,
    Policy,
    // ... other models
    ModelName  // Add here
};
```

### 2. Create a New Controller

**File**: `Backend/controllers/feature.controller.js`

```javascript
import { ModelName } from '../models/index.js';

// @desc    Get all items
// @route   GET /api/feature
// @access  Private
export const getAll = async (req, res) => {
    try {
        const items = await ModelName.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: items.length,
            data: { items }
        });
    } catch (error) {
        console.error('Get all error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching items',
            error: error.message
        });
    }
};

// @desc    Create new item
// @route   POST /api/feature
// @access  Private
export const create = async (req, res) => {
    try {
        const { name, status } = req.body;

        const item = await ModelName.create({
            name,
            status,
            userId: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Item created successfully',
            data: { item }
        });
    } catch (error) {
        console.error('Create error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating item',
            error: error.message
        });
    }
};

// @desc    Update item
// @route   PUT /api/feature/:id
// @access  Private
export const update = async (req, res) => {
    try {
        const item = await ModelName.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        await item.update(req.body);

        res.json({
            success: true,
            message: 'Item updated successfully',
            data: { item }
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating item',
            error: error.message
        });
    }
};

// @desc    Delete item
// @route   DELETE /api/feature/:id
// @access  Private
export const deleteItem = async (req, res) => {
    try {
        const item = await ModelName.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        await item.destroy();

        res.json({
            success: true,
            message: 'Item deleted successfully'
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting item',
            error: error.message
        });
    }
};
```

### 3. Create Routes

**File**: `Backend/routes/feature.route.js`

```javascript
import express from 'express';
import {
    getAll,
    create,
    update,
    deleteItem
} from '../controllers/feature.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Public routes (authenticated users)
router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', deleteItem);

// Admin only routes
router.get('/admin/all', authorize('admin'), getAllAdmin);

export default router;
```

**Update**: `Backend/server.js`
```javascript
import featureRoutes from './routes/feature.route.js';

// Add route
app.use('/api/feature', featureRoutes);
```

### 4. Frontend API Service

**File**: `Frontend/src/services/api.service.js`

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Set default headers
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Feature API
export const featureAPI = {
    // Get all items
    getAll: async () => {
        const response = await axios.get(`${API_URL}/feature`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Get single item
    getById: async (id) => {
        const response = await axios.get(`${API_URL}/feature/${id}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Create item
    create: async (data) => {
        const response = await axios.post(`${API_URL}/feature`, data, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Update item
    update: async (id, data) => {
        const response = await axios.put(`${API_URL}/feature/${id}`, data, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Delete item
    delete: async (id) => {
        const response = await axios.delete(`${API_URL}/feature/${id}`, {
            headers: getAuthHeader()
        });
        return response.data;
    }
};
```

### 5. React Component with API Integration

**File**: `Frontend/src/pages/FeaturePage.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { featureAPI } from '../services/api.service';

const FeaturePage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ name: '', status: 'active' });

    // Fetch items on mount
    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await featureAPI.getAll();
            setItems(response.data.items);
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching items');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await featureAPI.create(formData);
            setFormData({ name: '', status: 'active' });
            await fetchItems(); // Refresh list
            alert('Item created successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating item');
            console.error('Create error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        
        try {
            setLoading(true);
            await featureAPI.delete(id);
            await fetchItems(); // Refresh list
            alert('Item deleted successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Error deleting item');
            console.error('Delete error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && items.length === 0) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="feature-page">
            <h1>Feature Page</h1>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Create Form */}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Name"
                    required
                />
                <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Item'}
                </button>
            </form>

            {/* Items List */}
            <div className="items-list">
                {items.map(item => (
                    <div key={item.id} className="item-card">
                        <h3>{item.name}</h3>
                        <p>Status: {item.status}</p>
                        <button onClick={() => handleDelete(item.id)} disabled={loading}>
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturePage;
```

---

## 🔍 Common Sequelize Queries

### Basic Queries
```javascript
// Find all
const items = await Model.findAll();

// Find with conditions
const items = await Model.findAll({
    where: { status: 'active' }
});

// Find one
const item = await Model.findOne({
    where: { id: 1 }
});

// Find by primary key
const item = await Model.findByPk(1);

// Create
const item = await Model.create({
    name: 'Test',
    status: 'active'
});

// Update
await item.update({ name: 'Updated' });

// Delete
await item.destroy();
```

### Advanced Queries
```javascript
// With associations
const policies = await Policy.findAll({
    include: [
        { model: User, as: 'customer' },
        { model: Agent, as: 'agent' }
    ]
});

// With pagination
const { count, rows } = await Model.findAndCountAll({
    limit: 10,
    offset: 0,
    order: [['createdAt', 'DESC']]
});

// Complex where conditions
const items = await Model.findAll({
    where: {
        [Op.and]: [
            { status: 'active' },
            { createdAt: { [Op.gte]: new Date('2024-01-01') } }
        ]
    }
});

// Aggregation
const total = await Model.sum('amount', {
    where: { status: 'paid' }
});
```

---

## 🎯 Testing Endpoints

### Using Thunder Client / Postman

#### 1. Register User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User",
  "phone": "1234567890",
  "role": "customer"
}
```

#### 2. Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

Response: { token: "jwt_token_here" }
```

#### 3. Get Profile (Authenticated)
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <your_jwt_token>
```

#### 4. Create Policy
```
POST http://localhost:5000/api/policies
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "cattleType": "cow",
  "tagId": "TAG123",
  "age": 5,
  "breed": "Holstein",
  "gender": "female",
  "coverageAmount": 50000,
  "premium": 5000,
  "duration": "1 year",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "ownerName": "Test Owner",
  "ownerEmail": "owner@example.com",
  "ownerPhone": "1234567890",
  "ownerAddress": "123 Test St",
  "ownerCity": "Test City",
  "ownerState": "Test State",
  "ownerPincode": "123456"
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error
**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**: Check backend CORS configuration
```javascript
// Backend/server.js
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
```

### Issue 2: Authentication Failed
**Error**: `401 Unauthorized`

**Solution**: Check JWT token
```javascript
// Frontend - Check if token is set
const token = localStorage.getItem('token');
console.log('Token:', token);

// Backend - Check middleware
console.log('User:', req.user);
```

### Issue 3: Database Connection Failed
**Error**: `Unable to connect to the database`

**Solution**: Check .env configuration
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=insurance_db
DB_USER=root
DB_PASSWORD=your_password
```

### Issue 4: Model Not Found
**Error**: `Model is not defined`

**Solution**: Check model import and export
```javascript
// models/index.js
import Model from './Model.js';
export { Model };

// controller
import { Model } from '../models/index.js';
```

---

## 📊 Environment Variables

### Backend `.env`
```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=insurance_db
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# URLs
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

### Customer Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_key_id
```

### Admin Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🎯 Next Steps Checklist

### Immediate Actions
- [ ] Read EXECUTIVE_SUMMARY.md
- [ ] Review SYSTEM_ARCHITECTURE.md
- [ ] Set up development environment
- [ ] Test existing backend APIs
- [ ] Create missing database models
- [ ] Implement agent management APIs
- [ ] Implement admin management APIs
- [ ] Start frontend integration

### Daily Workflow
1. Check IMPLEMENTATION_CHECKLIST.md for today's tasks
2. Create/update backend APIs
3. Test with Postman/Thunder Client
4. Update frontend components
5. Test in browser
6. Commit changes
7. Update progress in checklist

---

## 📞 Quick Links

### Documentation
- [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)
- [FULL_BACKEND_INTEGRATION_PLAN.md](./FULL_BACKEND_INTEGRATION_PLAN.md)
- [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
- [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)
- [LOCALSTORAGE_ELIMINATION_PLAN.md](./LOCALSTORAGE_ELIMINATION_PLAN.md)

### External Resources
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Axios Documentation](https://axios-http.com/)

---

**Last Updated**: 2026-01-12
**Status**: Ready for Development
**Happy Coding! 🚀**
