import React from 'react';
import PropTypes from 'prop-types';
import './CommissionBadge.css';

/**
 * CommissionBadge Component
 * Displays commission status with appropriate styling
 */
const CommissionBadge = ({ status, amount }) => {
    const getStatusClass = () => {
        switch (status?.toLowerCase()) {
            case 'paid':
            case 'approved':
                return 'commission-badge success';
            case 'pending':
                return 'commission-badge warning';
            case 'rejected':
            case 'failed':
                return 'commission-badge error';
            default:
                return 'commission-badge';
        }
    };

    const getStatusIcon = () => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return '✓';
            case 'approved':
                return '✓';
            case 'pending':
                return '⏳';
            case 'rejected':
                return '✗';
            default:
                return '';
        }
    };

    return (
        <span className={getStatusClass()}>
            <span className="badge-icon">{getStatusIcon()}</span>
            <span className="badge-text">{status}</span>
            {amount && <span className="badge-amount">₹{amount.toLocaleString('en-IN')}</span>}
        </span>
    );
};

CommissionBadge.propTypes = {
    status: PropTypes.string.isRequired,
    amount: PropTypes.number
};

export default CommissionBadge;
