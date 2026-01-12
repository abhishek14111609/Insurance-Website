import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api.service';
import './WithdrawalApprovals.css';

const WithdrawalApprovals = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [notes, setNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWithdrawals();
    }, []);

    const loadWithdrawals = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getWithdrawals();
            if (response.success) {
                // Filter pending withdrawals
                const pending = (response.data.withdrawals || []).filter(w => (w.status || 'PENDING').toUpperCase() === 'PENDING');
                setWithdrawals(pending);
            }
        } catch (error) {
            console.error('Error loading withdrawals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClick = (withdrawal) => {
        setSelectedWithdrawal(withdrawal);
        setModalType('approve');
        setShowModal(true);
    };

    const handleRejectClick = (withdrawal) => {
        setSelectedWithdrawal(withdrawal);
        setModalType('reject');
        setShowModal(true);
    };

    const handleConfirmApprove = async () => {
        try {
            // Processing withdrawal with status 'APPROVED'
            const result = await adminAPI.processWithdrawal(selectedWithdrawal.id, 'APPROVED', notes);

            if (result.success) {
                alert('Withdrawal approved! Agent wallet updated.');
                loadWithdrawals();
                closeModal();
            } else {
                alert(result.message || 'Failed to approve withdrawal');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred during approval');
        }
    };

    const handleConfirmReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            const result = await adminAPI.processWithdrawal(selectedWithdrawal.id, 'REJECTED');

            if (result.success) {
                alert('Withdrawal rejected.');
                loadWithdrawals();
                closeModal();
            } else {
                alert(result.message || 'Failed to reject withdrawal');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred during rejection');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedWithdrawal(null);
        setNotes('');
        setRejectionReason('');
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div>Loading Withdrawals...</div>;

    return (
        <div className="withdrawal-approvals-page">
            <div className="page-header">
                <div>
                    <h1>💳 Withdrawal Approvals</h1>
                    <p>Review and approve pending withdrawal requests</p>
                </div>
                <div className="header-stats">
                    <span className="stat-badge">{withdrawals.length} Pending</span>
                </div>
            </div>

            {withdrawals.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">✅</div>
                    <h3>All Caught Up!</h3>
                    <p>No pending withdrawal requests.</p>
                </div>
            ) : (
                <div className="withdrawals-grid">
                    {withdrawals.map(withdrawal => (
                        <div key={withdrawal.id} className="withdrawal-card">
                            <div className="withdrawal-header">
                                <div>
                                    <h3>₹{parseFloat(withdrawal.amount || 0).toLocaleString()}</h3>
                                    <span className="status-badge pending">Pending</span>
                                </div>
                                <div className="withdrawal-date">
                                    {new Date(withdrawal.requestedAt || withdrawal.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="withdrawal-details">
                                <div className="detail-row">
                                    <span className="label">Agent:</span>
                                    <span className="value">{withdrawal.agentName || withdrawal.agent?.fullName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Agent Code:</span>
                                    <span className="value">{withdrawal.agentCode || withdrawal.agent?.agentCode}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Bank Account:</span>
                                    <span className="value">{withdrawal.bankDetails?.accountNumber || withdrawal.bankAccount || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">IFSC:</span>
                                    <span className="value">{withdrawal.bankDetails?.ifscCode || withdrawal.ifsc || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Account Holder:</span>
                                    <span className="value">{withdrawal.bankDetails?.accountHolderName || withdrawal.accountHolder || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="withdrawal-actions">
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleApproveClick(withdrawal)}
                                >
                                    ✅ Approve
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleRejectClick(withdrawal)}
                                >
                                    ❌ Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalType === 'approve' ? '✅ Approve Withdrawal' : '❌ Reject Withdrawal'}</h2>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="withdrawal-summary">
                                <p><strong>Amount:</strong> ₹{parseFloat(selectedWithdrawal?.amount || 0).toLocaleString()}</p>
                                <p><strong>Agent:</strong> {selectedWithdrawal?.agentName || selectedWithdrawal?.agent?.fullName}</p>
                            </div>

                            {modalType === 'approve' ? (
                                <div className="form-group">
                                    <label>Transaction ID / Reference (Optional):</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Enter bank transaction reference..."
                                        rows="3"
                                    />
                                    <small>This will be sent to the agent.</small>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Rejection Reason *:</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Provide reason for rejection..."
                                        rows="4"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                            <button
                                className={`btn ${modalType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                                onClick={modalType === 'approve' ? handleConfirmApprove : handleConfirmReject}
                            >
                                {modalType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WithdrawalApprovals;
