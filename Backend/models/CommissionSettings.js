import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CommissionSettings = sequelize.define('CommissionSettings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        comment: 'Commission level (1 = direct agent, 2 = parent, etc.)'
    },
    percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Commission percentage for this level'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    },
    minPolicyAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: 'min_policy_amount',
        comment: 'Minimum policy amount for this commission to apply'
    },
    maxPolicyAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: 'max_policy_amount',
        comment: 'Maximum policy amount for this commission to apply'
    },
    updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'updated_by',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'commission_settings',
    timestamps: true,
    underscored: true
});

export default CommissionSettings;
