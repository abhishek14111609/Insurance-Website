import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Withdrawal = sequelize.define('Withdrawal', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    agentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'agent_id',
        references: {
            model: 'agents',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    bankDetails: {
        type: DataTypes.JSON,
        allowNull: false,
        field: 'bank_details'
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'paid'),
        defaultValue: 'pending',
        allowNull: false
    },
    requestedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'requested_at'
    },
    processedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'processed_at'
    },
    processedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'processed_by',
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
    transactionId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'transaction_id'
    },
    adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'admin_notes'
    }
}, {
    tableName: 'withdrawals',
    timestamps: true,
    underscored: true
});

export default Withdrawal;
