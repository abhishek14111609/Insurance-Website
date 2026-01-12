import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Policy = sequelize.define('Policy', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    policyNumber: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
        field: 'policy_number'
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'customer_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    agentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'agent_id',
        references: {
            model: 'agents',
            key: 'id'
        }
    },
    // Cattle Details
    cattleType: {
        type: DataTypes.ENUM('cow', 'buffalo'),
        allowNull: false,
        field: 'cattle_type'
    },
    tagId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'tag_id'
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    breed: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    gender: {
        type: DataTypes.ENUM('male', 'female'),
        allowNull: false
    },
    milkYield: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'milk_yield'
    },
    healthStatus: {
        type: DataTypes.ENUM('healthy', 'under_treatment'),
        defaultValue: 'healthy',
        field: 'health_status'
    },
    // Policy Details
    coverageAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: 'coverage_amount'
    },
    premium: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    duration: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'start_date'
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'end_date'
    },
    // Status
    status: {
        type: DataTypes.ENUM('PENDING', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED'),
        defaultValue: 'PENDING',
        allowNull: false
    },
    paymentStatus: {
        type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED'),
        defaultValue: 'PENDING',
        field: 'payment_status'
    },
    paymentId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'payment_id'
    },
    paymentDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'payment_date'
    },
    // Photos (JSON array of URLs)
    photos: {
        type: DataTypes.JSON,
        allowNull: true
    },
    // Owner Details
    ownerName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'owner_name'
    },
    ownerEmail: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'owner_email'
    },
    ownerPhone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'owner_phone'
    },
    ownerAddress: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'owner_address'
    },
    ownerCity: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'owner_city'
    },
    ownerState: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'owner_state'
    },
    ownerPincode: {
        type: DataTypes.STRING(10),
        allowNull: false,
        field: 'owner_pincode'
    },
    // Agent Code
    agentCode: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'agent_code'
    },
    // Approval Details
    approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'approved_at'
    },
    approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'approved_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    rejectedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'rejected_at'
    },
    rejectedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'rejected_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'rejection_reason'
    },
    adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'admin_notes'
    }
}, {
    tableName: 'policies',
    timestamps: true,
    underscored: true
});

export default Policy;
