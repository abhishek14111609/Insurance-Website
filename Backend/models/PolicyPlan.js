import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PolicyPlan = sequelize.define('PolicyPlan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    cattleType: {
        type: DataTypes.ENUM('cow', 'buffalo', 'both'),
        allowNull: false,
        field: 'cattle_type'
    },
    minAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: 'min_age'
    },
    maxAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 15,
        field: 'max_age'
    },
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
        allowNull: false,
        defaultValue: '1 year'
    },
    features: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of plan features'
    },
    coverageDetails: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'coverage_details',
        comment: 'Detailed coverage information'
    },
    exclusions: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of exclusions'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    },
    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'display_order'
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'created_by',
        references: {
            model: 'users',
            key: 'id'
        }
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
    tableName: 'policy_plans',
    timestamps: true,
    underscored: true
});

export default PolicyPlan;
