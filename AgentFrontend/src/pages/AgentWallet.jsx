import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { agentAPI } from '../services/api.service';
import { exportToCSV, formatTransactionsForExport } from '../utils/exportUtils';
import toast from 'react-hot-toast';
import './AgentWallet.css';

const AgentWallet = () => {
    const navigate = useNavigate();
    const { user, isAgent } = useAuth();

    const [walletData, setWalletData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawing, setWithdrawing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!isAgent) {
            navigate('/');
            return;
        }

        fetchWalletData();
    }, [isAgent, navigate]);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const response = await agentAPI.getWallet();
            if (response.success) {
                setWalletData(response.data.wallet);
                setTransactions(response.data.transactions || []);
            }
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawRequest = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        const amount = parseFloat(withdrawAmount);
        if (!amount || amount <= 0) {
            setMessage({ type: 'error', text: 'Please enter a valid amount' });
            return;
        }

        if (amount > walletData.balance) {
            setMessage({ type: 'error', text: 'Insufficient balance' });
            return;
        }

        if (amount < 100) {
            setMessage({ type: 'error', text: 'Minimum withdrawal amount is ₹100' });
            return;
        }

        try {
            setWithdrawing(true);
            const response = await agentAPI.requestWithdrawal({ amount });
            if (response.success) {
                setMessage({ type: 'success', text: 'Withdrawal request submitted successfully!' });
                setShowWithdrawModal(false);
                setWithdrawAmount('');
                await fetchWalletData();
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to submit withdrawal request' });
        } finally {
            setWithdrawing(false);
        }
    };

    const getTransactionIcon = (type) => {
        const icons = {
            commission: '💰',
            withdrawal: '💳',
            bonus: '🎁',
            refund: '↩️'
        };
        return icons[type] || '💵';
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: 'status-pending', text: 'Pending' },
            approved: { class: 'status-approved', text: 'Approved' },
            rejected: { class: 'status-rejected', text: 'Rejected' },
            paid: { class: 'status-paid', text: 'Paid' }
        };
        return badges[status] || { class: 'status-pending', text: status };
    };

    const handleExport = () => {
        try {
            if (transactions.length === 0) {
                toast.error('No data to export');
                return;
            }
            const formattedData = formatTransactionsForExport(transactions);
            exportToCSV(formattedData, 'wallet_transactions');
            toast.success(`Exported ${transactions.length} transactions successfully`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        }
    };

    if (loading) {
        return (
            <div className="agent-wallet">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading wallet...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="agent-wallet">
            <div className="wallet-header">
                <div>
                    <h1>My Wallet</h1>
                    <p>Manage your earnings and withdrawals</p>
                </div>
                <button onClick={handleExport} className="btn btn-primary">
                    📥 Export CSV
                </button>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Wallet Balance Card */}
            <div className="wallet-balance-card">
                <div className="balance-info">
                    <h2>Available Balance</h2>
                    <p className="balance-amount">₹{walletData?.balance?.toLocaleString() || '0'}</p>
                    <small>Total Earnings: ₹{walletData?.totalEarnings?.toLocaleString() || '0'}</small>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowWithdrawModal(true)}
                    disabled={!walletData?.balance || walletData.balance < 100 || !walletData?.bankDetails?.accountNumber}
                >
                    Request Withdrawal
                </button>
                {(!walletData?.balance || walletData.balance < 100) && (
                    <p className="withdrawal-notice">
                        Need minimum ₹100 balance to withdraw
                    </p>
                )}
                {walletData?.balance >= 100 && !walletData?.bankDetails?.accountNumber && (
                    <p className="withdrawal-notice">
                        Please update bank details in Profile to withdraw
                    </p>
                )}
            </div>

            {/* Stats Grid */}
            <div className="wallet-stats-grid">
                <div className="stat-card">
                    <h3>Total Withdrawn</h3>
                    <p className="stat-value">₹{walletData?.totalWithdrawn?.toLocaleString() || '0'}</p>
                </div>
                <div className="stat-card">
                    <h3>Pending Withdrawals</h3>
                    <p className="stat-value">₹{walletData?.pendingWithdrawals?.toLocaleString() || '0'}</p>
                </div>
                <div className="stat-card">
                    <h3>This Month</h3>
                    <p className="stat-value">₹{walletData?.thisMonthEarnings?.toLocaleString() || '0'}</p>
                </div>
            </div>

            {/* Transactions List */}
            <div className="transactions-section">
                <h2>Transaction History</h2>

                {transactions.length > 0 ? (
                    <div className="transactions-list">
                        {transactions.map((transaction) => {
                            const badge = getStatusBadge(transaction.status);
                            return (
                                <div key={transaction.id} className="transaction-item">
                                    <div className="transaction-icon">
                                        {getTransactionIcon(transaction.type)}
                                    </div>
                                    <div className="transaction-content">
                                        <h4>{transaction.description || transaction.type}</h4>
                                        <p>{new Date(transaction.createdAt).toLocaleDateString()}</p>
                                        {transaction.status && (
                                            <span className={`status-badge ${badge.class}`}>
                                                {badge.text}
                                            </span>
                                        )}
                                    </div>
                                    <div className={`transaction-amount ${transaction.type === 'withdrawal' ? 'debit' : 'credit'}`}>
                                        {transaction.type === 'withdrawal' ? '-' : '+'}₹{transaction.amount?.toLocaleString()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No transactions yet</p>
                    </div>
                )}
            </div>

            {/* Withdrawal Modal */}
            {showWithdrawModal && (
                <>
                    <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)} />
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Request Withdrawal</h3>
                            <button className="close-btn" onClick={() => setShowWithdrawModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleWithdrawRequest}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Available Balance</label>
                                    <p className="balance-display">₹{walletData?.balance?.toLocaleString()}</p>
                                </div>
                                <div className="form-group">
                                    <label>Withdrawal Amount *</label>
                                    <input
                                        type="number"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        min="100"
                                        max={walletData?.balance}
                                        required
                                    />
                                    <small>Minimum: ₹100 | Maximum: ₹{walletData?.balance?.toLocaleString()}</small>
                                </div>
                                <div className="info-box">
                                    <p>📌 Withdrawal requests are processed within 3-5 business days</p>
                                    <div className="bank-preview">
                                        <p><strong>Credited to:</strong></p>
                                        <p>{walletData?.bankDetails?.bankName} ({walletData?.bankDetails?.accountNumber})</p>
                                        <p>A/C Holder: {walletData?.bankDetails?.accountHolderName}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowWithdrawModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={withdrawing}
                                >
                                    {withdrawing ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default AgentWallet;
