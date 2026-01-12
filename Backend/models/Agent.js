import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Agent = sequelize.define('Agent', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    agentCode: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
        field: 'agent_code'
    },
    parentAgentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'parent_agent_id',
        references: {
            model: 'agents',
            key: 'id'
        }
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'active', 'inactive', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
    },
    // Bank Details
    bankName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'bank_name'
    },
    accountNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'account_number'
    },
    ifscCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'ifsc_code'
    },
    accountHolderName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'account_holder_name'
    },
    // KYC Details
    panNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'pan_number'
    },
    aadharNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'aadhar_number'
    },
    // Wallet
    walletBalance: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
        field: 'wallet_balance'
    },
    totalEarnings: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
        field: 'total_earnings'
    },
    totalWithdrawals: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
        field: 'total_withdrawals'
    },
    // Approval
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
    },
    commissionRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'commission_rate',
        comment: 'Custom commission rate override for this agent'
    },
    trainingStatus: {
        type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
        defaultValue: 'not_started',
        field: 'training_status'
    },
    trainingProgress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'training_progress'
    }
}, {
    tableName: 'agents',
    timestamps: true,
    underscored: true
});

export default Agent;
