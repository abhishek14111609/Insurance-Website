import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Commission = sequelize.define('Commission', {
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
    agentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'agent_id',
        references: {
            model: 'agents',
            key: 'id'
        }
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'paid', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
    },
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'paid_at'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'commissions',
    timestamps: true,
    underscored: true
});

export default Commission;
