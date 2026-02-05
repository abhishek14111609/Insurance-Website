import { toNumber } from './numberUtils';

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file (without extension)
 */
export const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
        throw new Error('No data to export');
    }

    // Convert array of objects to CSV
    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            let value = row[header];

            // Try to convert object-wrapped numbers (like Decimal128) first
            if (typeof value === 'object' && value !== null) {
                // Check if it looks like a number object
                if (value.$numberDecimal || (value.toString && value.toString !== Object.prototype.toString)) {
                    const numValue = toNumber(value, null);
                    if (numValue !== null) {
                        value = numValue;
                    }
                }
            }

            // Handle special cases
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            // Escape quotes and wrap in quotes if contains comma
            const escaped = String(value).replace(/"/g, '""');
            return escaped.includes(',') ? `"${escaped}"` : escaped;
        });
        csvRows.push(values.join(','));
    }

    // Create blob and download
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Format policy data for export
 * @param {Array} policies - Array of policy objects
 * @returns {Array} Formatted data for export
 */
export const formatPoliciesForExport = (policies) => {
    return policies.map(policy => ({
        'Policy Number': policy.policyNumber || 'N/A',
        'Customer Name': policy.customerId?.fullName || policy.ownerName || 'N/A',
        'Customer Email': policy.customerId?.email || policy.ownerEmail || 'N/A',
        'Customer Phone': policy.customerId?.phone || policy.ownerPhone || 'N/A',
        'Plan Name': policy.planId?.name || 'N/A',
        'Animal Type': policy.animalType || 'N/A',
        'Coverage Amount': toNumber(policy.coverageAmount),
        'Premium': toNumber(policy.premium),
        'Duration': policy.duration || 'N/A',
        'Status': policy.status || 'PENDING',
        'Payment Status': policy.paymentStatus || 'pending',
        'Start Date': policy.startDate ? new Date(policy.startDate).toLocaleDateString() : 'N/A',
        'End Date': policy.endDate ? new Date(policy.endDate).toLocaleDateString() : 'N/A',
        'Created Date': policy.createdAt ? new Date(policy.createdAt).toLocaleDateString() : 'N/A',
        'Approved Date': policy.approvedAt ? new Date(policy.approvedAt).toLocaleDateString() : 'N/A'
    }));
};

/**
 * Format customer data for export
 * @param {Array} customers - Array of customer objects
 * @returns {Array} Formatted data for export
 */
export const formatCustomersForExport = (customers) => {
    return customers.map(customer => ({
        'Full Name': customer.fullName || 'N/A',
        'Email': customer.email || 'N/A',
        'Phone': customer.phone || 'N/A',
        'City': customer.city || 'N/A',
        'State': customer.state || 'N/A',
        'Pincode': customer.pincode || 'N/A',
        'Total Policies': toNumber(customer.policyStats?.total),
        'Active Policies': toNumber(customer.policyStats?.active),
        'Total Premium Paid': toNumber(customer.policyStats?.totalPremium),
        'Email Verified': customer.emailVerified ? 'Yes' : 'No',
        'Status': customer.status || 'active',
        'Joined Date': customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'
    }));
};

/**
 * Format commission data for export
 * @param {Array} commissions - Array of commission objects
 * @returns {Array} Formatted data for export
 */
export const formatCommissionsForExport = (commissions) => {
    return commissions.map(commission => ({
        'Commission ID': commission._id || 'N/A',
        'Policy Number': commission.policyId?.policyNumber || 'N/A',
        'Customer Name': commission.policyId?.customerId?.fullName || 'N/A',
        'Level': commission.level || 1,
        'Amount': toNumber(commission.amount),
        'Percentage': toNumber(commission.percentage),
        'Status': commission.status || 'pending',
        'Created Date': commission.createdAt ? new Date(commission.createdAt).toLocaleDateString() : 'N/A',
        'Approved Date': commission.approvedAt ? new Date(commission.approvedAt).toLocaleDateString() : 'N/A',
        'Paid Date': commission.paidAt ? new Date(commission.paidAt).toLocaleDateString() : 'N/A'
    }));
};

/**
 * Format team member data for export
 * @param {Array} members - Array of team member objects
 * @returns {Array} Formatted data for export
 */
export const formatTeamMembersForExport = (members) => {
    return members.map(member => ({
        'Agent Code': member.agentCode || 'N/A',
        'Full Name': member.userId?.fullName || 'N/A',
        'Email': member.userId?.email || 'N/A',
        'Phone': member.userId?.phone || 'N/A',
        'City': member.userId?.city || 'N/A',
        'State': member.userId?.state || 'N/A',
        'Level': member.level || 1,
        'Status': member.status || 'pending',
        'KYC Status': member.kycStatus || 'not_submitted',
        'Total Policies': toNumber(member.policyStats?.totalPolicies),
        'Total Earnings': toNumber(member.totalEarnings),
        'Wallet Balance': toNumber(member.walletBalance),
        'Joined Date': member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'
    }));
};

/**
 * Format wallet transaction data for export
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} Formatted data for export
 */
export const formatTransactionsForExport = (transactions) => {
    return transactions.map(transaction => ({
        'Transaction ID': transaction._id || 'N/A',
        'Type': transaction.type || 'N/A',
        'Amount': toNumber(transaction.amount),
        'Description': transaction.description || 'N/A',
        'Status': transaction.status || 'pending',
        'Reference': transaction.reference || 'N/A',
        'Date': transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A',
        'Time': transaction.createdAt ? new Date(transaction.createdAt).toLocaleTimeString() : 'N/A'
    }));
};

export default {
    exportToCSV,
    formatPoliciesForExport,
    formatCustomersForExport,
    formatCommissionsForExport,
    formatTeamMembersForExport,
    formatTransactionsForExport
};
