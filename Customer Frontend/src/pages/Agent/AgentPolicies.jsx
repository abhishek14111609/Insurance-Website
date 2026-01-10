import { useState, useEffect } from 'react';
import './AgentDashboard.css';

const AgentPolicies = () => {
    // Initial dummy data
    const initialPolicies = [
        { id: 101, policyNo: 'POL-8821', customer: 'Rahul Sharma', type: 'Car Insurance', premium: '₹12,400', status: 'Active', date: '2024-01-15' },
        { id: 102, policyNo: 'POL-9932', customer: 'Priya Patel', type: 'Health Insurance', premium: '₹8,500', status: 'Pending', date: '2024-02-01' },
        { id: 103, policyNo: 'POL-7711', customer: 'Amit Kumar', type: 'Bike Insurance', premium: '₹1,200', status: 'Expired', date: '2023-12-10' },
    ];

    const [policies, setPolicies] = useState(() => {
        const saved = localStorage.getItem('agent_policies');
        return saved ? JSON.parse(saved) : initialPolicies;
    });

    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        policyNo: '', customer: '', type: 'Car Insurance', premium: '', status: 'Active', date: ''
    });

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('agent_policies', JSON.stringify(policies));
    }, [policies]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newPolicy = {
            ...formData,
            id: Date.now(),
            policyNo: formData.policyNo || `POL-${Math.floor(Math.random() * 10000)}`
        };
        setPolicies([newPolicy, ...policies]);
        setShowModal(false);
        setFormData({ policyNo: '', customer: '', type: 'Car Insurance', premium: '', status: 'Active', date: '' });
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this policy record?')) {
            setPolicies(policies.filter(p => p.id !== id));
        }
    };

    const filteredPolicies = policies.filter(p =>
        p.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.policyNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="agent-page-container">
            <div className="page-header">
                <div>
                    <h1>Policy Management</h1>
                    <p>Track and manage insurance policies sold</p>
                </div>
                {/* <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + New Policy
                </button> */}
            </div>

            <div className="table-controls">
                <input
                    type="text"
                    placeholder="Search by policy number or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="table-container fade-in">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Policy No</th>
                            <th>Customer</th>
                            <th>Type</th>
                            <th>Premium</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPolicies.length > 0 ? (
                            filteredPolicies.map(policy => (
                                <tr key={policy.id}>
                                    <td><span className="font-medium">{policy.policyNo}</span></td>
                                    <td>{policy.customer}</td>
                                    <td>{policy.type}</td>
                                    <td>{policy.premium}</td>
                                    <td>{policy.date}</td>
                                    <td>
                                        <span className={`status-badge ${policy.status.toLowerCase()}`}>
                                            {policy.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-icon delete"
                                            title="Delete"
                                            onClick={() => handleDelete(policy.id)}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-data">No policies found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Policy Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-scale-in">
                        <div className="modal-header">
                            <h2>Draft New Policy</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Customer Name</label>
                                    <input
                                        type="text"
                                        name="customer"
                                        value={formData.customer}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter customer name"
                                    />
                                </div>
                                <div className="form-row two-col">
                                    <div className="form-group">
                                        <label>Policy Type</label>
                                        <select name="type" value={formData.type} onChange={handleInputChange}>
                                            <option value="Car Insurance">Car Insurance</option>
                                            <option value="Bike Insurance">Bike Insurance</option>
                                            <option value="Health Insurance">Health Insurance</option>
                                            <option value="Travel Insurance">Travel Insurance</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Premium Amount (₹)</label>
                                        <input
                                            type="text"
                                            name="premium"
                                            value={formData.premium}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="e.g. 12000"
                                        />
                                    </div>
                                </div>
                                <div className="form-row two-col">
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select name="status" value={formData.status} onChange={handleInputChange}>
                                            <option value="Active">Active</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Expired">Expired</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Policy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentPolicies;
