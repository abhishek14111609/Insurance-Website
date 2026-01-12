import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api.service';
import './AddAgent.css';

const AddAgent = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        address: '',
        parentId: '',
        commissionRate: 15,
        status: 'active'
    });
    const [agents, setAgents] = useState([]);
    const [generatedCode, setGeneratedCode] = useState('');
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAgents();
    }, []);

    const loadAgents = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllAgents();
            if (response.success) {
                setAgents((response.data.agents || []).filter(a => a.status === 'active'));
            }
        } catch (error) {
            console.error('Error loading agents:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateAgentCode = (parentCode = null) => {
        const timestamp = Date.now().toString().slice(-4);
        if (!parentCode) {
            return `AG${timestamp}`;
        } else {
            return `${parentCode}-${timestamp}`;
        }
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let password = '';
        for (let i = 0; i < 10; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Generate code when parent changes
        if (name === 'parentId') {
            if (value === '') {
                setGeneratedCode(generateAgentCode(null));
            } else {
                const parent = agents.find(a => String(a.id) === String(value));
                setGeneratedCode(generateAgentCode(parent?.agentCode || null));
            }
        }
    };

    const handleGeneratePassword = () => {
        const password = generatePassword();
        setGeneratedPassword(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const agentData = {
                ...formData,
                agentCode: generatedCode || generateAgentCode(null),
                password: generatedPassword
            };

            const response = await adminAPI.createAgent(agentData);

            if (response.success) {
                alert(`Agent created successfully!\n\nAgent Code: ${agentData.agentCode}\nPassword: ${generatedPassword}\n\nPlease save these credentials!`);
                navigate('/agents');
            } else {
                alert(response.message || 'Error creating agent');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to connect to server');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading && agents.length === 0) return <div className="loading">Loading...</div>;

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
                                name="fullName"
                                value={formData.fullName}
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
                                        {agent.agentCode} - {agent.user?.fullName}
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
