import { useState, useEffect } from 'react';
import { getPendingWithdrawals, approveWithdrawal, rejectWithdrawal, sendEmail } from '../utils/adminUtils';
import './WithdrawalApprovals.css';

const WithdrawalApprovals = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [notes, setNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        loadWithdrawals();
    }, []);

    const loadWithdrawals = () => {
        setWithdrawals(getPendingWithdrawals());
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

    const handleConfirmApprove = () => {
        const result = approveWithdrawal(selectedWithdrawal.id, notes);

        if (result.success) {
            sendEmail({
                to: selectedWithdrawal.agentEmail,
                subject: 'Withdrawal Request Approved - SecureLife',
                body: `Dear ${selectedWithdrawal.agentName},\n\nYour withdrawal request of ₹${selectedWithdrawal.amount?.toLocaleString()} has been approved.\n\nThe amount will be credited to your account within 2-3 business days.`,
                type: 'withdrawal_approval'
            });

            alert('Withdrawal approved! Email sent.');
            loadWithdrawals();
            closeModal();
        }
    };

    const handleConfirmReject = () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        const result = rejectWithdrawal(selectedWithdrawal.id, rejectionReason);

        if (result.success) {
            sendEmail({
                to: selectedWithdrawal.agentEmail,
                subject: 'Withdrawal Request Update - SecureLife',
                body: `Dear ${selectedWithdrawal.agentName},\n\nYour withdrawal request has been rejected.\n\nReason: ${rejectionReason}`,
                type: 'withdrawal_rejection'
            });

            alert('Withdrawal rejected. Email sent.');
            loadWithdrawals();
            closeModal();
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedWithdrawal(null);
        setNotes('');
        setRejectionReason('');
    };

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
                                    <h3>₹{withdrawal.amount?.toLocaleString()}</h3>
                                    <span className="status-badge pending">Pending</span>
                                </div>
                                <div className="withdrawal-date">
                                    {new Date(withdrawal.requestedAt || withdrawal.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="withdrawal-details">
                                <div className="detail-row">
                                    <span className="label">Agent:</span>
                                    <span className="value">{withdrawal.agentName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Agent Code:</span>
                                    <span className="value">{withdrawal.agentCode}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Bank Account:</span>
                                    <span className="value">{withdrawal.bankAccount}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">IFSC:</span>
                                    <span className="value">{withdrawal.ifsc}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Account Holder:</span>
                                    <span className="value">{withdrawal.accountHolder}</span>
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
                                <p><strong>Amount:</strong> ₹{selectedWithdrawal?.amount?.toLocaleString()}</p>
                                <p><strong>Agent:</strong> {selectedWithdrawal?.agentName}</p>
                                <p><strong>Account:</strong> {selectedWithdrawal?.bankAccount}</p>
                            </div>

                            {modalType === 'approve' ? (
                                <div className="form-group">
                                    <label>Admin Notes (Optional):</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add any notes..."
                                        rows="3"
                                    />
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Rejection Reason *:</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Provide reason..."
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
