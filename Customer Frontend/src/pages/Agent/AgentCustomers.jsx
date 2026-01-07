import { useState, useEffect } from 'react';
import './AgentDashboard.css'; // Reusing dashboard styles for consistency (assuming AgentDashboard.css has necessary styles or we will add them)

const AgentCustomers = () => {
    // Initial dummy data
    const initialCustomers = [
        { id: 1, name: 'Rahul Sharma', email: 'rahul.s@example.com', phone: '9876543210', city: 'Mumbai', status: 'Active' },
        { id: 2, name: 'Priya Patel', email: 'priya.p@example.com', phone: '9876543211', city: 'Ahmedabad', status: 'Active' },
        { id: 3, name: 'Amit Kumar', email: 'amit.k@example.com', phone: '9876543212', city: 'Delhi', status: 'Inactive' },
    ];

    const [customers, setCustomers] = useState(() => {
        const saved = localStorage.getItem('agent_customers');
        return saved ? JSON.parse(saved) : initialCustomers;
    });

    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', city: '', status: 'Active'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Save to localStorage whenever customers change
    useEffect(() => {
        localStorage.setItem('agent_customers', JSON.stringify(customers));
    }, [customers]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            setCustomers(customers.map(c => c.id === editId ? { ...formData, id: editId } : c));
            setIsEditing(false);
            setEditId(null);
        } else {
            const newCustomer = {
                ...formData,
                id: Date.now(), // Simple unique ID
            };
            setCustomers([...customers, newCustomer]);
        }
        setShowModal(false);
        setFormData({ name: '', email: '', phone: '', city: '', status: 'Active' });
    };

    const handleEdit = (customer) => {
        setFormData(customer);
        setEditId(customer.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            setCustomers(customers.filter(c => c.id !== id));
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="agent-page-container">
            <div className="page-header">
                <div>
                    <h1>My Customers</h1>
                    <p>Manage your client database</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setIsEditing(false);
                    setFormData({ name: '', email: '', phone: '', city: '', status: 'Active' });
                    setShowModal(true);
                }}>
                    + Add New Customer
                </button>
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
            <div className="table-container fade-in">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>City</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(customer => (
                                <tr key={customer.id}>
                                    <td>
                                        <div className="customer-name-cell">
                                            <div className="avatar-circle">{customer.name.charAt(0)}</div>
                                            {customer.name}
                                        </div>
                                    </td>
                                    <td>{customer.email}</td>
                                    <td>{customer.phone}</td>
                                    <td>{customer.city}</td>
                                    <td>
                                        <span className={`status-badge ${customer.status.toLowerCase()}`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon edit"
                                                title="Edit"
                                                onClick={() => handleEdit(customer)}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-icon delete"
                                                title="Delete"
                                                onClick={() => handleDelete(customer.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-data">No customers found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-scale-in">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Edit Customer' : 'Add New Customer'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-row two-col">
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{isEditing ? 'Update' : 'Save'} Customer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentCustomers;
