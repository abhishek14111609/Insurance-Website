import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addAgent, generateAgentCode, generatePassword, getAllAgents } from '../../utils/agentUtils';
import './AddAgent.css';

const AddAgent = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        address: '',
        parentId: '',
        commissionRate: 15,
        status: 'active'
    });
    const [generatedCode, setGeneratedCode] = useState('');
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Generate code when parent changes
        if (name === 'parentId') {
            const agents = getAllAgents();
            const parent = agents.find(a => a.id === value);
            const code = generateAgentCode(parent?.code || null);
            setGeneratedCode(code);
        }
    };

    const handleGeneratePassword = () => {
        const password = generatePassword();
        setGeneratedPassword(password);
        setFormData({ ...formData, password });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const agentData = {
            ...formData,
            code: generatedCode,
            password: generatedPassword || generatePassword()
        };

        const result = addAgent(agentData);

        if (result.success) {
            alert(`Agent created successfully!\n\nAgent Code: ${result.agent.code}\nPassword: ${result.agent.password}\n\nPlease save these credentials!`);
            navigate('/agents');
        } else {
            alert('Error creating agent');
            setIsSubmitting(false);
        }
    };

    const agents = getAllAgents().filter(a => a.status === 'active');

    return (
        <div className="add-agent-page">
            <div className="page-header">
                <h1>➕ Add New Agent</h1>
                <p>Create a new agent account</p>
            </div>

            <form className="add-agent-form" onSubmit={handleSubmit}>
                <div className="form-card">
                    <h3>Basic Information</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Phone *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>City *</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>State *</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-card">
                    <h3>Agent Hierarchy</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Parent Agent (Optional)</label>
                            <select
                                name="parentId"
                                value={formData.parentId}
                                onChange={handleChange}
                            >
                                <option value="">None (Root Level)</option>
                                {agents.map(agent => (
                                    <option key={agent.id} value={agent.id}>
                                        {agent.code} - {agent.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Generated Agent Code</label>
                            <input
                                type="text"
                                value={generatedCode}
                                readOnly
                                placeholder="Will be generated automatically"
                                className="readonly-input"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-card">
                    <h3>Login Credentials</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Password</label>
                            <div className="password-generator">
                                <input
                                    type="text"
                                    value={generatedPassword}
                                    readOnly
                                    placeholder="Click generate to create password"
                                    className="readonly-input"
                                />
                                <button
                                    type="button"
                                    onClick={handleGeneratePassword}
                                    className="btn btn-secondary"
                                >
                                    🔑 Generate Password
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Commission Rate (%)</label>
                            <input
                                type="number"
                                name="commissionRate"
                                value={formData.commissionRate}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                step="0.5"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/agents')}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting || !generatedPassword}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Agent'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddAgent;
