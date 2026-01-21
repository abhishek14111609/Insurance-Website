import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api.service';
import toast from 'react-hot-toast';
import './AddAgent.css';

const EditAgent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAgent();
    }, [id]);

    const loadAgent = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllAgents();
            if (response.success) {
                const agents = response.data.agents || [];
                const foundFn = agents.find(a => String(a.id) === String(id));
                if (foundFn) {
                    // Map backend keys to form keys if necessary
                    setFormData({
                        ...foundFn,
                        name: foundFn.user?.fullName || foundFn.fullName || '',
                        email: foundFn.user?.email || foundFn.email || '',
                        phone: foundFn.user?.phone || foundFn.phone || '',
                        city: foundFn.user?.city || foundFn.city || '',
                        state: foundFn.user?.state || foundFn.state || '',
                        address: foundFn.user?.address || foundFn.address || '',
                        code: foundFn.agentCode || foundFn.code
                    });
                } else {
                    toast.error('Agent not found');
                    navigate('/agents');
                }
            }
        } catch (error) {
            console.error('Error loading agent:', error);
            navigate('/agents');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Map back to backend expectations
            const updatePayload = {
                ...formData,
                fullName: formData.name, // Ensure match
                // Backend might require specific fields, sending all is usually ok
            };

            const result = await adminAPI.updateAgent(id, updatePayload);
            if (result.success) {
                toast.success('Agent updated successfully!');
                navigate('/agents');
            } else {
                toast.error(result.message || 'Error updating agent');
            }
        } catch (error) {
            console.error('Error updating agent:', error);
            toast.error('An error occurred while updating agent.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div>Loading...</div>;
    if (!formData) return <div>Agent not found</div>;

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
                                value={formData.code || formData.agentCode}
                                readOnly
                                className="readonly-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name || ''}
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
                                value={formData.email || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone || ''}
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
                                value={formData.city || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>State *</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state || ''}
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
                                value={formData.commissionRate || ''}
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
                                value={formData.status || 'active'}
                                onChange={handleChange}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                                <option value="blocked">Blocked</option>
                                <option value="rejected">Rejected</option>
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
