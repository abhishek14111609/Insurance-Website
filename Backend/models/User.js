import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: /.+\@.+\..+/
        },
        password: {
            type: String,
            required: true
        },
        fullName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            default: null
        },
        address: {
            type: String,
            default: null
        },
        city: {
            type: String,
            default: null
        },
        state: {
            type: String,
            default: null
        },
        pincode: {
            type: String,
            default: null
        },
        role: {
            type: String,
            enum: ['customer', 'agent', 'admin'],
            default: 'customer'
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'blocked'],
            default: 'active'
        },
        emailVerified: {
            type: Boolean,
            default: false
        },
        verificationToken: {
            type: String, // Keeping for backward compatibility or reset links
            default: null
        },
        otpCode: {
            type: String,
            default: null
        },
        otpExpires: {
            type: Date,
            default: null
        },
        resetPasswordToken: {
            type: String,
            default: null
        },
        resetPasswordExpires: {
            type: Date,
            default: null
        },
        followUpNotes: {
            type: String,
            default: null
        },
        // Extended Details for Customers (KYC & Bank)
        kycDetails: {
            panNumber: { type: String, default: null },
            panPhoto: { type: String, default: null },
            aadharNumber: { type: String, default: null },
            aadharPhotoFront: { type: String, default: null },
            aadharPhotoBack: { type: String, default: null },
            isVerified: { type: Boolean, default: false },
            status: {
                type: String,
                enum: ['pending', 'verified', 'rejected', 'not_submitted'],
                default: 'not_submitted'
            }
        },
        bankDetails: {
            accountHolderName: { type: String, default: null },
            accountNumber: { type: String, default: null },
            bankName: { type: String, default: null },
            ifscCode: { type: String, default: null },
            isVerified: { type: Boolean, default: false }
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to exclude sensitive fields
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.verificationToken;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;
    return user;
};

const User = mongoose.model('User', userSchema);

export default User;
