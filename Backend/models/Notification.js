import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'Null for broadcast notifications'
    },
    type: {
        type: DataTypes.ENUM('policy', 'payment', 'commission', 'withdrawal', 'claim', 'agent', 'system'),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    data: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional data related to notification'
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_read'
    },
    readAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'read_at'
    },
    actionUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'action_url',
        comment: 'URL to navigate when notification is clicked'
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'expires_at'
    },
    isBroadcast: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_broadcast'
    }
}, {
    tableName: 'notifications',
    timestamps: true,
    underscored: true
});

export default Notification;
