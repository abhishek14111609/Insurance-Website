import 'dotenv/config';
import './models/index.js';
import { Claim, Policy, User } from './models/index.js';
import sequelize from './config/database.js';

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Connection established.');

        // Try to fetch one claim with all inclusions
        const claim = await Claim.findOne({
            include: [
                { model: Policy, as: 'policy' },
                { model: User, as: 'customer' },
                { model: User, as: 'reviewer' }
            ]
        });

        console.log('Successfully fetched claim:', claim ? claim.id : 'None found');
    } catch (error) {
        console.error('Sequelize Error Details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
    } finally {
        await sequelize.close();
    }
}

test();
