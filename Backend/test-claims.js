import './models/index.js';
import { Claim, Policy, User } from './models/index.js';
import sequelize from './config/database.js';

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const claims = await Claim.findAll({
            include: [
                { model: Policy, as: 'policy' },
                { model: User, as: 'reviewer' }
            ]
        });
        console.log('Fetched claims:', claims.length);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

test();
