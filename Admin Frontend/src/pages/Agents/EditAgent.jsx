import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAgentById, updateAgent, getAllAgents } from '../../utils/agentUtils';
import './AddAgent.css';

const EditAgent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const agent = getAgentById(id);
        if (agent) {
            setFormData(agent);
        } else {
            alert('Agent not found');
            navigate('/agents');
        }
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const result = updateAgent(id, formData);

        if (result.success) {
            alert('Agent updated successfully!');
            navigate('/agents');
        } else {
            alert('Error updating agent');
            setIsSubmitting(false);
        }
    };

    if (!formData) return <div>Loading...</div>;

    const agents = getAllAgents().filter(a => a.status === 'active' && a.id !== id);

    return (
        <div className="add-agent-page">
            <div className="page-header">
                <h1>✏️ Edit Agent</h1>
                <p>Update agent information</p>
            </div>

            <form className="add-agent-form" onSubmit={handleSubmit}>
                <div className="form-card">
                    <h3>Basic Information</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Agent Code</label>
                            <input
                                type="text"
                                value={formData.code}
                                readOnly
                                className="readonly-input"
                            />
                        </div>

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
                    </div>

                    <div className="form-row">
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
                    </div>

                    <div className="form-row">
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
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-card">
                    <h3>Agent Settings</h3>

                    <div className="form-row">
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
                                <option value="blocked">Blocked</option>
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
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Updating...' : 'Update Agent'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditAgent;
