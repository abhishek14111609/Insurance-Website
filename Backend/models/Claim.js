import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Claim = sequelize.define('Claim', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    claimNumber: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
        field: 'claim_number'
    },
    policyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'policy_id',
        references: {
            model: 'policies',
            key: 'id'
        }
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
    claimType: {
        type: DataTypes.ENUM('death', 'injury', 'theft', 'disease', 'accident', 'natural_disaster', 'disability', 'other'),
        allowNull: false,
        field: 'claim_type'
    },
    incidentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'incident_date'
    },
    incidentLocation: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'incident_location'
    },
    claimAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: 'claim_amount'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    documents: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of document URLs'
    },
    status: {
        type: DataTypes.ENUM('pending', 'under_review', 'approved', 'rejected', 'paid'),
        defaultValue: 'pending',
        allowNull: false
    },
    reviewedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'reviewed_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reviewed_at'
    },
    approvedAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: 'approved_amount'
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'rejection_reason'
    },
    paidAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: 'paid_amount'
    },
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'paid_at'
    },
    paymentReference: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'payment_reference'
    },
    adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'admin_notes'
    }
}, {
    tableName: 'claims',
    timestamps: true,
    underscored: true
});

export default Claim;
