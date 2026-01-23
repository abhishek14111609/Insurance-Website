import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { agentAPI } from '../../services/api.service';
import toast from 'react-hot-toast';
import './AgentCustomers.css';

const AgentCustomers = () => {
    const navigate = useNavigate();
    const { isAgent } = useAuth();

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingNotes, setEditingNotes] = useState(null);
    const [tempNotes, setTempNotes] = useState('');

    const handleSaveNotes = async (customerId) => {
        try {
            const response = await agentAPI.updateCustomerNotes(customerId, tempNotes);
            if (response.success) {
                setEditingNotes(null);
                fetchCustomers(); // Refresh list
            }
        } catch (error) {
            console.error('Error saving notes:', error);
            toast.error('Failed to save notes');
        }
    };

    useEffect(() => {
        if (!isAgent) {
            navigate('/');
            return;
        }

        fetchCustomers();
    }, [isAgent, navigate]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await agentAPI.getCustomers();

            if (response.success) {
                const customerData = response.data.customers || [];

                // Process for table display
                const processedCustomers = customerData.map(c => ({
                    id: c.id,
                    name: c.fullName || 'Unknown',
                    email: c.email,
                    phone: c.phone || 'N/A',
                    city: c.city || 'N/A',
                    state: c.state || 'N/A',
                    status: 'Active',
                    totalPolicies: c.policyCount || 0,
                    lastPurchaseDate: c.lastPurchaseDate
                }));

                setCustomers(processedCustomers);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="agent-customers">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading customers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="agent-customers">
            <div className="page-header">
                <div>
                    <h1>My Customers</h1>
                    <p>Manage your client database</p>
                </div>
            </div>

            {/* Search Filter */}
            <div className="table-controls">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Customers Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>City</th>
                            <th>Policies</th>
                            <th>Last Active</th>
                            <th>Follow-up Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(customer => (
                                <tr key={customer.id}>
                                    <td>
                                        <div className="customer-name-cell">
                                            <div className="avatar-circle">
                                                {customer.name?.charAt(0) || 'C'}
                                            </div>
                                            {customer.name}
                                        </div>
                                    </td>
                                    <td>{customer.email}</td>
                                    <td>{customer.phone}</td>
                                    <td>{customer.city}</td>
                                    <td>
                                        <span className="status-badge active">
                                            {customer.totalPolicies} Policies
                                        </span>
                                    </td>
                                    <td>
                                        {new Date(customer.lastPurchaseDate).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="notes-cell">
                                            {editingNotes === customer.id ? (
                                                <div className="notes-edit">
                                                    <textarea
                                                        value={tempNotes}
                                                        onChange={(e) => setTempNotes(e.target.value)}
                                                        placeholder="Add follow-up notes..."
                                                    />
                                                    <div className="notes-actions">
                                                        <button className="btn btn-sm btn-success" onClick={() => handleSaveNotes(customer.id)}>Save</button>
                                                        <button className="btn btn-sm btn-outline" onClick={() => setEditingNotes(null)}>Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="notes-display" onClick={() => {
                                                    setEditingNotes(customer.id);
                                                    setTempNotes(customer.followUpNotes || '');
                                                }}>
                                                    <p className={customer.followUpNotes ? '' : 'text-muted'}>
                                                        {customer.followUpNotes || 'Click to add notes...'}
                                                    </p>
                                                    <span className="edit-icon">✏️</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">
                                    <div className="empty-state">
                                        <span className="empty-icon">👥</span>
                                        <p>No customers found.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AgentCustomers;
