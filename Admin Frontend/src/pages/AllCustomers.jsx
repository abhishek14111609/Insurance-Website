import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api.service';
import './AllCustomers.css';

const AllCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCustomers();
    }, []);

    useEffect(() => {
        const filtered = customers.filter(customer =>
            customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone?.includes(searchTerm)
        );
        setFilteredCustomers(filtered);
    }, [searchTerm, customers]);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllCustomers();
            if (response.success) {
                setCustomers(response.data.customers || []);
            } else {
                setError(response.message);
            }
        } catch (err) {
            console.error('Error loading customers:', err);
            setError('Failed to fetch customers from server');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-state">Loading customers...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div className="customers-page">
            <div className="page-header">
                <div>
                    <h1>👥 Customer Management</h1>
                    <p>View and manage all registered users</p>
                </div>
                <div className="header-stats">
                    <div className="stat-card">
                        <span className="stat-value">{customers.length}</span>
                        <span className="stat-label">Total Customers</span>
                    </div>
                </div>
            </div>

            <div className="filters-section">
                <div className="search-bar">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="customers-table-container">
                <table className="customers-table">
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Contact Info</th>
                            <th>Location</th>
                            <th>Joined Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(customer => (
                                <tr key={customer.id}>
                                    <td>
                                        <div className="customer-info">
                                            <div className="customer-avatar">
                                                {customer.fullName?.charAt(0)}
                                            </div>
                                            <div className="customer-name-wrap">
                                                <span className="name">{customer.fullName}</span>
                                                <span className="id">ID: #{customer.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-info">
                                            <span>📧 {customer.email}</span>
                                            <span>📱 {customer.phone || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="location-info">
                                            <span>{customer.city || 'N/A'}</span>
                                            <span className="state-label">{customer.state || ''}</span>
                                        </div>
                                    </td>
                                    <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge ${customer.status?.toLowerCase() || 'active'}`}>
                                            {customer.status || 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-view" title="View Details">👁️</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-results">No customers found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllCustomers;
