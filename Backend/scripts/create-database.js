import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createDatabase = async () => {
    let connection;

    try {
        console.log('🔄 Connecting to MySQL...');

        // Connect to MySQL without specifying database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('✅ Connected to MySQL server');

        // Create database
        const dbName = process.env.DB_NAME || 'insurance_db';
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

        console.log(`✅ Database '${dbName}' created successfully!`);
        console.log('\n🎉 Setup complete! You can now run: npm run dev\n');

    } catch (error) {
        console.error('❌ Error creating database:', error.message);
        console.error('\n📝 Please check:');
        console.error('   1. MySQL is running');
        console.error('   2. DB_USER and DB_PASSWORD in .env are correct');
        console.error('   3. MySQL port is 3306 (or update DB_PORT in .env)\n');
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

createDatabase();
