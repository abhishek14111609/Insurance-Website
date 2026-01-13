import { User, PolicyPlan, CommissionSettings } from '../models/index.js';
import sequelize from '../config/database.js';
import { initializeCommissionSettings } from './commission.util.js';

/**
 * Seed the database with initial data
 * @param {boolean} force - Whether to drop tables and recreate them
 * @returns {Promise<Object>} Status of the seeding operation
 */
export const seedDatabase = async (force = false) => {
    try {
        console.log(`🔧 Starting database seeding (force: ${force})...`);

        // Sync tables
        await sequelize.sync({ force });
        console.log('✅ Tables synchronized');

        // Initialize commission settings
        await initializeCommissionSettings();
        console.log('✅ Commission settings initialized');

        // Create admin user if not exists
        const adminEmail = 'admin@securelife.com';
        const adminExists = await User.findOne({ where: { email: adminEmail } });

        if (!adminExists) {
            await User.create({
                email: adminEmail,
                password: 'admin123',
                fullName: 'System Administrator',
                phone: '1234567890',
                address: 'Main St',
                city: 'Global City',
                state: 'State',
                pincode: '123456',
                role: 'admin',
                status: 'active'
            });
            console.log('✅ Admin user created');
        }

        // Create sample policy plans if none exist
        const planCount = await PolicyPlan.count();
        if (planCount === 0) {
            await PolicyPlan.bulkCreate([
                {
                    name: 'Basic Cow Guard',
                    description: 'Essential coverage for dairy cows',
                    cattleType: 'cow',
                    minAge: 1,
                    maxAge: 12,
                    premium: 299,
                    coverageAmount: 50000,
                    duration: '1 Year',
                    features: ['Death due to accident', 'Death due to disease', 'Permanent disability'],
                    isActive: true,
                    displayOrder: 1
                },
                {
                    name: 'Premium Buffalo Shield',
                    description: 'Comprehensive protection for high-yield buffaloes',
                    cattleType: 'buffalo',
                    minAge: 1,
                    maxAge: 10,
                    premium: 499,
                    coverageAmount: 100000,
                    duration: '1 Year',
                    features: ['Theft protection', 'Transit coverage', 'Veterinary assistance'],
                    isActive: true,
                    displayOrder: 2
                }
            ]);
            console.log('✅ Sample policy plans created');
        }

        return {
            success: true,
            message: force ? 'Database reset and seeded successfully' : 'Database seeded successfully',
            summary: {
                adminCreated: !adminExists,
                plansCreated: planCount === 0
            }
        };
    } catch (error) {
        console.error('❌ Seeding error:', error);
        throw error;
    }
};
