import sequelize from './config/database.js';
import Agent from './models/Agent.js';

async function checkTable() {
    try {
        const [results] = await sequelize.query("DESCRIBE agents");
        console.log("Agents table columns:");
        results.forEach(col => console.log(`- ${col.Field}: ${col.Type}`));
        process.exit(0);
    } catch (error) {
        console.error("Error describing table:", error);
        process.exit(1);
    }
}

checkTable();
