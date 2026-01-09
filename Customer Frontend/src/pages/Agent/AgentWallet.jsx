import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WalletCard from '../../components/WalletCard';
import { formatCurrency } from '../../utils/agentUtils';
import './AgentDashboard.css';

const AgentWallet = () => {
    const navigate = useNavigate();
    const [walletData, setWalletData] = useState({
        balance: 24500,
        pendingAmount: 8100,
        totalEarnings: 125000
    });

    const [transactions, setTransactions] = useState([]);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [filter, setFilter] = useState('all'); // all, earned, withdrawn

    useEffect(() => {
        // Load transactions from localStorage
        const savedTransactions = JSON.parse(localStorage.getItem('wallet_transactions') || '[]');

        if (savedTransactions.length === 0) {
            // Initialize with mock data
            const mockTransactions = [
                {
                    id: 1,
                    date: '2024-03-15',
                    type: 'earned',
                    description: 'Commission from Policy ANI-001234',
                    policyNumber: 'ANI-001234',
                    amount: 1500,
                    status: 'paid',
                    level: 1
                },
                {
                    id: 2,
                    date: '2024-03-12',
                    type: 'earned',
                    description: 'Commission from Policy ANI-001235',
                    policyNumber: 'ANI-001235',
                    amount: 1000,
                    status: 'paid',
                    level: 2
                },
                {
                    id: 3,
                    date: '2024-03-10',
                    type: 'withdrawn',
                    description: 'Withdrawal to Bank Account',
                    amount: -5000,
                    status: 'completed'
                },
                {
                    id: 4,
                    date: '2024-03-08',
                    type: 'earned',
                    description: 'Commission from Policy ANI-001236',
                    policyNumber: 'ANI-001236',
                    amount: 2250,
                    status: 'pending',
                    level: 1
                },
                {
                    id: 5,
                    date: '2024-03-05',
                    type: 'earned',
                    description: 'Commission from Policy ANI-001237',
                    policyNumber: 'ANI-001237',
                    amount: 800,
                    status: 'paid',
                    level: 3
                }
            ];
            localStorage.setItem('wallet_transactions', JSON.stringify(mockTransactions));
            setTransactions(mockTransactions);
        } else {
            setTransactions(savedTransactions);
        }
    }, []);

    const handleWithdraw = () => {
        setShowWithdrawModal(true);
    };

    const handleWithdrawSubmit = (e) => {
        e.preventDefault();
        const amount = parseFloat(withdrawAmount);
        const availableBalance = walletData.balance - walletData.pendingAmount;

        if (amount > availableBalance) {
            alert('Insufficient balance!');
            return;
        }

        if (amount < 1000) {
            alert('Minimum withdrawal amount is ₹1,000');
            return;
        }

        // Create withdrawal transaction
        const newTransaction = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            type: 'withdrawn',
            description: 'Withdrawal Request',
            amount: -amount,
            status: 'pending'
        };

        const updatedTransactions = [newTransaction, ...transactions];
        setTransactions(updatedTransactions);
        localStorage.setItem('wallet_transactions', JSON.stringify(updatedTransactions));

        // Update wallet balance
        setWalletData({
            ...walletData,
            balance: walletData.balance - amount
        });

        setShowWithdrawModal(false);
        setWithdrawAmount('');
        alert('Withdrawal request submitted! It will be processed within 2-3 business days.');
    };

    const filteredTransactions = transactions.filter(t => {
        if (filter === 'all') return true;
        return t.type === filter;
    });

    const getTransactionIcon = (type, status) => {
        if (type === 'earned') {
            return status === 'paid' ? '💰' : '⏳';
        }
        return '💸';
    };

    const getStatusBadge = (status) => {
        const badges = {
            paid: { text: 'Paid', class: 'success' },
            pending: { text: 'Pending', class: 'warning' },
            completed: { text: 'Completed', class: 'success' },
            rejected: { text: 'Rejected', class: 'error' }
        };
        return badges[status] || badges.pending;
    };

    return (
        <div className="agent-page-container">
            <div className="page-header">
                <div>
                    <h1>My Wallet</h1>
                    <p>Manage your earnings and withdrawals</p>
                </div>
            </div>

            {/* Wallet Card */}
            <div style={{ marginBottom: '2rem' }}>
                <WalletCard
                    balance={walletData.balance}
                    pendingAmount={walletData.pendingAmount}
                    transactionCount={transactions.length}
                    onWithdraw={handleWithdraw}
                    onViewTransactions={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
                />
            </div>

            {/* Stats Cards */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card" style={{ background: 'white' }}>
                    <div className="stat-content">
                        <div className="stat-title">Total Earnings</div>
                        <div className="stat-value">{formatCurrency(walletData.totalEarnings)}</div>
                        <div className="stat-change">Lifetime</div>
                    </div>
                </div>
                <div className="stat-card" style={{ background: 'white' }}>
                    <div className="stat-content">
                        <div className="stat-title">This Month</div>
                        <div className="stat-value">{formatCurrency(5650)}</div>
                        <div className="stat-change text-success">↑ 12% vs last month</div>
                    </div>
                </div>
                <div className="stat-card" style={{ background: 'white' }}>
                    <div className="stat-content">
                        <div className="stat-title">Total Withdrawn</div>
                        <div className="stat-value">{formatCurrency(100500)}</div>
                        <div className="stat-change">All time</div>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="table-container">
                <div className="table-header">
                    <h2>Transaction History</h2>
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${filter === 'earned' ? 'active' : ''}`}
                            onClick={() => setFilter('earned')}
                        >
                            Earned
                        </button>
                        <button
                            className={`filter-btn ${filter === 'withdrawn' ? 'active' : ''}`}
                            onClick={() => setFilter('withdrawn')}
                        >
                            Withdrawn
                        </button>
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Policy</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map(transaction => {
                            const statusBadge = getStatusBadge(transaction.status);
                            return (
                                <tr key={transaction.id}>
                                    <td>{new Date(transaction.date).toLocaleDateString('en-IN')}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '1.25rem' }}>
                                                {getTransactionIcon(transaction.type, transaction.status)}
                                            </span>
                                            <span>{transaction.description}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {transaction.policyNumber ? (
                                            <span className="font-medium">{transaction.policyNumber}</span>
                                        ) : (
                                            <span style={{ color: '#94a3b8' }}>—</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={transaction.amount > 0 ? 'text-success' : 'text-error'} style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${statusBadge.class}`}>
                                            {statusBadge.text}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {filteredTransactions.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        No {filter} transactions found
                    </div>
                )}
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-scale-in">
                        <div className="modal-header">
                            <h2>Withdraw Funds</h2>
                            <button className="close-btn" onClick={() => setShowWithdrawModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleWithdrawSubmit}>
                            <div className="modal-body">
                                <div className="withdraw-info">
                                    <div className="info-row">
                                        <span>Available Balance:</span>
                                        <span className="info-value">{formatCurrency(walletData.balance - walletData.pendingAmount)}</span>
                                    </div>
                                    <div className="info-row">
                                        <span>Pending Clearance:</span>
                                        <span className="info-value pending">{formatCurrency(walletData.pendingAmount)}</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Withdrawal Amount *</label>
                                    <input
                                        type="number"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder="Enter amount (Min: ₹1,000)"
                                        min="1000"
                                        max={walletData.balance - walletData.pendingAmount}
                                        required
                                    />
                                    <small style={{ color: '#64748b', marginTop: '0.5rem', display: 'block' }}>
                                        Minimum withdrawal: ₹1,000 | Processing time: 2-3 business days
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowWithdrawModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Request Withdrawal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentWallet;
