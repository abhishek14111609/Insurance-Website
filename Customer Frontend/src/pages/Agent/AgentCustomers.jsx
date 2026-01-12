import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { agentAPI } from '../../services/api.service';
import './AgentCustomers.css';

const AgentCustomers = () => {
    const navigate = useNavigate();
    const { isAgent } = useAuth();

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!isAgent) {
            navigate('/');
            return;
        }

        fetchCustomersFromPolicies();
    }, [isAgent, navigate]);

    const fetchCustomersFromPolicies = async () => {
        try {
            setLoading(true);
            // We get customers by fetching all policies sold by this agent
            const response = await agentAPI.getPolicies();

            if (response.success) {
                const policies = response.data.policies || [];

                // Extract unique customers from policies
                const uniqueCustomers = [];
                const seenEmails = new Set();

                policies.forEach(policy => {
                    // Assuming policy object contains customer details
                    // If the API structure puts user details in a 'user' object or directly on policy
                    // Based on previous files, it seemed to be direct fields like ownerName

                    if (policy.email && !seenEmails.has(policy.email)) {
                        seenEmails.add(policy.email);
                        uniqueCustomers.push({
                            id: policy.userId || Date.now() + Math.random(), // fallback ID
                            name: policy.ownerName,
                            email: policy.email,
                            phone: policy.phone,
                            city: policy.city,
                            state: policy.state,
                            status: 'Active', // Default status for someone with a policy
                            totalPolicies: 1,
                            lastPurchaseDate: policy.createdAt
                        });
                    } else if (policy.email && seenEmails.has(policy.email)) {
                        // Update existing customer stats
                        const customer = uniqueCustomers.find(c => c.email === policy.email);
                        if (customer) {
                            customer.totalPolicies += 1;
                            if (new Date(policy.createdAt) > new Date(customer.lastPurchaseDate)) {
                                customer.lastPurchaseDate = policy.createdAt;
                            }
                        }
                    }
                });

                setCustomers(uniqueCustomers);
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
