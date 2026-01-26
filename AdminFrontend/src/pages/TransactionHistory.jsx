import { useState, useEffect } from 'react';
import { paymentAPI } from '../services/api.service';
import { TableSkeleton } from '../components/Loader';
import { formatCurrency } from '../utils/numberUtils';
import './PolicyHistory.css'; // Reusing the clean styles from Policy History
import toast from 'react-hot-toast';

const TransactionHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        paymentMethod: ''
    });

    useEffect(() => {
        fetchPayments();
    }, [page, filters.status, filters.paymentMethod]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (filters.search !== undefined) {
                fetchPayments();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 15,
                search: filters.search,
                status: filters.status === 'all' ? '' : filters.status,
                paymentMethod: filters.paymentMethod === 'all' ? '' : filters.paymentMethod
            };
            const response = await paymentAPI.getAll(params);
            if (response.success) {
                setPayments(response.data.payments);
                setTotalPages(response.totalPages);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to load transaction history');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
        setPage(1);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'captured':
            case 'success':
            case 'completed': return 'badge-success';
            case 'failed': return 'badge-danger';
            case 'created':
            case 'pending': return 'badge-warning';
            default: return 'badge-secondary';
        }
    };

    return (
        <div className="policy-history-page">
            <div className="page-header">
                <h1>💸 Transaction History</h1>
                <p>Monitor all payment transactions and financial records</p>
            </div>

            <div className="controls-section">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search Order ID, Payment ID..."
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="filter-box">
                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="all">All Status</option>
                        <option value="captured">Success (Captured)</option>
                        <option value="created">Pending (Created)</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
                {/* <div className="filter-box">
                    <select name="paymentMethod" value={filters.paymentMethod} onChange={handleFilterChange}>
                        <option value="all">All Methods</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                        <option value="netbanking">Net Banking</option>
                    </select>
                </div> */}
            </div>

            <div className="table-container">
                {loading ? (
                    <TableSkeleton rows={10} columns={7} />
                ) : payments.length === 0 ? (
                    <div className="empty-state">
                        <h3>No Transactions Found</h3>
                        <p>No payments match your current filters</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order ID / Payment ID</th>
                                <th>Customer</th>
                                <th>Policy Reference</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment) => (
                                <tr key={payment._id}>
                                    <td>
                                        <div className="user-cell">
                                            <span className="font-mono" style={{ fontSize: '0.9em' }}>{payment.razorpayOrderId}</span>
                                            <span className="sub-text">{payment.razorpayPaymentId || '-'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="user-cell">
                                            <span className="name">{payment.customerId?.fullName || 'N/A'}</span>
                                            <span className="sub-text">{payment.customerId?.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {payment.policyId ? (
                                            <div className="plan-cell">
                                                <span>{payment.policyId.policyNumber}</span>
                                                <span className="sub-text">ID: {payment.policyId._id}</span>
                                            </div>
                                        ) : (
                                            <span className="sub-text">N/A</span>
                                        )}
                                    </td>
                                    <td className="highlight">
                                        {formatCurrency(payment.amount)}
                                    </td>
                                    <td>
                                        <span style={{ textTransform: 'capitalize' }}>
                                            {payment.paymentMethod || '-'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadgeClass(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="user-cell">
                                            <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                                            <span className="sub-text">{new Date(payment.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {!loading && payments.length > 0 && (
                <div className="pagination">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="btn-page"
                    >
                        Previous
                    </button>
                    <span className="page-info">Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="btn-page"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
