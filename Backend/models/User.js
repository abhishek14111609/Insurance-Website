import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    fullName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'full_name'
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    state: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    pincode: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('customer', 'agent', 'admin'),
        defaultValue: 'customer',
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'blocked'),
        defaultValue: 'active',
        allowNull: false
    },
    emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'email_verified'
    },
    verificationToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'verification_token'
    },
    resetPasswordToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'reset_password_token'
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reset_password_expires'
    },
    followUpNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'follow_up_notes'
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Instance method to compare password
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate JWT token
User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.verificationToken;
    delete values.resetPasswordToken;
    delete values.resetPasswordExpires;
    return values;
};

export default User;
