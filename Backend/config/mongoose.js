import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI)
        console.log('✅ MongoDB connection established successfully.');
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to MongoDB:', error.message);
        return false;
    }
};

export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('✅ MongoDB disconnected successfully.');
    } catch (error) {
        console.error('❌ Error disconnecting from MongoDB:', error.message);
    }
};

export default mongoose;
