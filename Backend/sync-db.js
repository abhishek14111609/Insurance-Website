import 'dotenv/config';
import './models/index.js';
import sequelize from './config/database.js';

async function sync() {
    try {
        await sequelize.authenticate();
        console.log('Connection established.');

        // Alter tables to match models
        await sequelize.sync({ alter: true });
        console.log('Database synchronized with { alter: true }.');

    } catch (error) {
        console.error('Sync Error:', error);
    } finally {
        await sequelize.close();
    }
}

sync();
