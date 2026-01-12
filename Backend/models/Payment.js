import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    // Razorpay Details
    razorpayOrderId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'razorpay_order_id'
    },
    razorpayPaymentId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        field: 'razorpay_payment_id'
    },
    razorpaySignature: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'razorpay_signature'
    },
    // Payment Details
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING(10),
        defaultValue: 'INR'
    },
    status: {
        type: DataTypes.ENUM('pending', 'success', 'failed', 'refunded'),
        defaultValue: 'pending',
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'payment_method'
    },
    // Additional Info
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    notes: {
        type: DataTypes.JSON,
        allowNull: true
    },
    errorCode: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'error_code'
    },
    errorDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'error_description'
    },
    // Timestamps
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'paid_at'
    }
}, {
    tableName: 'payments',
    timestamps: true,
    underscored: true
});

export default Payment;
