import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../utils/agentUtils';
import './WalletCard.css';

/**
 * WalletCard Component
 * Displays wallet balance and quick actions
 */
const WalletCard = ({
    balance,
    pendingAmount,
    transactionCount,
    onWithdraw,
    onViewTransactions,
    variant = 'default'
}) => {
    const availableBalance = balance - (pendingAmount || 0);

    return (
        <div className={`wallet-card ${variant}`}>
            <div className="wallet-header">
                <div className="wallet-icon">💰</div>
                <div className="wallet-title">My Wallet</div>
            </div>

            <div className="wallet-balance-section">
                <div className="balance-label">Available Balance</div>
                <div className="balance-amount">{formatCurrency(availableBalance)}</div>

                {pendingAmount > 0 && (
                    <div className="pending-info">
                        <span className="pending-icon">⏳</span>
                        <span className="pending-text">
                            {formatCurrency(pendingAmount)} pending approval
                        </span>
                    </div>
                )}
            </div>

            <div className="wallet-stats">
                <div className="wallet-stat">
                    <div className="stat-icon">💳</div>
                    <div className="stat-content">
                        <div className="stat-value">{formatCurrency(balance)}</div>
                        <div className="stat-label">Total Balance</div>
                    </div>
                </div>
                <div className="wallet-stat">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <div className="stat-value">{transactionCount || 0}</div>
                        <div className="stat-label">Transactions</div>
                    </div>
                </div>
            </div>

            <div className="wallet-actions">
                <button
                    className="wallet-btn primary"
                    onClick={onWithdraw}
                    disabled={availableBalance <= 0}
                >
                    <span className="btn-icon">💸</span>
                    Withdraw Funds
                </button>
                <button
                    className="wallet-btn secondary"
                    onClick={onViewTransactions}
                >
                    <span className="btn-icon">📜</span>
                    View History
                </button>
            </div>

            {availableBalance <= 0 && (
                <div className="wallet-notice">
                    <span className="notice-icon">ℹ️</span>
                    <span className="notice-text">
                        No funds available for withdrawal. Sell more policies to earn commissions!
                    </span>
                </div>
            )}
        </div>
    );
};

WalletCard.propTypes = {
    balance: PropTypes.number.isRequired,
    pendingAmount: PropTypes.number,
    transactionCount: PropTypes.number,
    onWithdraw: PropTypes.func.isRequired,
    onViewTransactions: PropTypes.func.isRequired,
    variant: PropTypes.oneOf(['default', 'compact', 'detailed'])
};

export default WalletCard;
