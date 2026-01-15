import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Inquiry = sequelize.define('Inquiry', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'replied'),
        defaultValue: 'pending'
    },
    adminReply: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    repliedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'inquiries',
    timestamps: true
});

export default Inquiry;
