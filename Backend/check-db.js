import sequelize from './config/database.js';
import { Policy, Agent, User, CommissionSettings } from './models/index.js';

async function check() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        const policyCount = await Policy.count();
        const pendingPolicies = await Policy.findAll({ where: { status: 'PENDING' } });
        const agentCount = await Agent.count();
        const settingsCount = await CommissionSettings.count();

        console.log(`Policies: ${policyCount}`);
        console.log(`Pending: ${pendingPolicies.length}`);
        console.log(`Agents: ${agentCount}`);
        console.log(`Commission Settings: ${settingsCount}`);

        if (pendingPolicies.length > 0) {
            const first = pendingPolicies[0];
            console.log('\nSample Pending Policy:');
            console.log(`ID: ${first.id}`);
            console.log(`Number: ${first.policyNumber}`);
            console.log(`Premium: ${first.premium}`);
            console.log(`AgentId: ${first.agentId}`);

            if (first.agentId) {
                const agent = await Agent.findByPk(first.agentId);
                if (agent) {
                    console.log(`Agent found: ${agent.agentCode}`);
                } else {
                    console.log('❌ Agent ID exists in policy but NOT in Agent table!');
                }
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
