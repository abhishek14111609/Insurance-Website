// Excel export functionality - Uncomment when xlsx package is installed
// import * as XLSX from 'xlsx';

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
            const value = row[header];
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
 * Export data to Excel format (REQUIRES xlsx package)
 * To enable: npm install xlsx
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file (without extension)
 * @param {String} sheetName - Name of the worksheet
 */
/*
export const exportToExcel = (data, filename, sheetName = 'Sheet1') => {
    if (!data || data.length === 0) {
        throw new Error('No data to export');
    }

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${filename}_${Date.now()}.xlsx`);
};
*/

/**
 * Format agent data for export
 * @param {Array} agents - Array of agent objects
 * @returns {Array} Formatted data for export
 */
export const formatAgentsForExport = (agents) => {
    return agents.map(agent => ({
        'Agent Code': agent.agentCode || 'N/A',
        'Full Name': agent.user?.fullName || 'N/A',
        'Email': agent.user?.email || 'N/A',
        'Phone': agent.user?.phone || 'N/A',
        'City': agent.user?.city || 'N/A',
        'State': agent.user?.state || 'N/A',
        'Level': agent.level || 1,
        'Parent Agent': agent.parentAgent?.agentCode || 'Direct',
        'Status': agent.status || 'pending',
        'KYC Status': agent.kycStatus || 'not_submitted',
        'Total Policies': agent.policyStats?.totalPolicies || 0,
        'Approved Policies': agent.policyStats?.approvedPolicies || 0,
        'Total Premium': agent.policyStats?.totalPremium || 0,
        'Total Earnings': agent.totalEarnings || 0,
        'Wallet Balance': agent.walletBalance || 0,
        'Commission Rate': agent.commissionRate || 0,
        'Joined Date': agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'N/A'
    }));
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
        'Agent Code': policy.agentId?.agentCode || 'N/A',
        'Agent Name': policy.agentId?.userId?.fullName || 'N/A',
        'Plan Name': policy.planId?.name || 'N/A',
        'Animal Type': policy.animalType || 'N/A',
        'Coverage Amount': policy.coverageAmount || 0,
        'Premium': policy.premium || 0,
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
        'Total Policies': customer.policyStats?.total || 0,
        'Active Policies': customer.policyStats?.active || 0,
        'Total Premium Paid': customer.policyStats?.totalPremium || 0,
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
        'Agent Code': commission.agentId?.agentCode || 'N/A',
        'Agent Name': commission.agentId?.userId?.fullName || 'N/A',
        'Policy Number': commission.policyId?.policyNumber || 'N/A',
        'Level': commission.level || 1,
        'Amount': commission.amount || 0,
        'Percentage': commission.percentage || 0,
        'Status': commission.status || 'pending',
        'Created Date': commission.createdAt ? new Date(commission.createdAt).toLocaleDateString() : 'N/A',
        'Approved Date': commission.approvedAt ? new Date(commission.approvedAt).toLocaleDateString() : 'N/A'
    }));
};

/**
 * Format transaction data for export
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} Formatted data for export
 */
export const formatTransactionsForExport = (transactions) => {
    return transactions.map(transaction => ({
        'Transaction ID': transaction.razorpayOrderId || transaction._id || 'N/A',
        'Policy Number': transaction.policyId?.policyNumber || 'N/A',
        'Customer Name': transaction.userId?.fullName || 'N/A',
        'Customer Email': transaction.userId?.email || 'N/A',
        'Amount': transaction.amount || 0,
        'Status': transaction.status || 'pending',
        'Payment Method': transaction.paymentMethod || 'N/A',
        'Created Date': transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A',
        'Completed Date': transaction.paidAt ? new Date(transaction.paidAt).toLocaleDateString() : 'N/A'
    }));
};

/**
 * Format claim data for export
 * @param {Array} claims - Array of claim objects
 * @returns {Array} Formatted data for export
 */
export const formatClaimsForExport = (claims) => {
    return claims.map(claim => ({
        'Claim Number': claim.claimNumber || 'N/A',
        'Policy Number': claim.policyId?.policyNumber || 'N/A',
        'Customer Name': claim.customerId?.fullName || 'N/A',
        'Customer Email': claim.customerId?.email || 'N/A',
        'Claim Amount': claim.claimAmount || 0,
        'Approved Amount': claim.approvedAmount || 0,
        'Claim Type': claim.claimType || 'N/A',
        'Status': claim.status || 'pending',
        'Incident Date': claim.incidentDate ? new Date(claim.incidentDate).toLocaleDateString() : 'N/A',
        'Filed Date': claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : 'N/A',
        'Approved Date': claim.approvedAt ? new Date(claim.approvedAt).toLocaleDateString() : 'N/A',
        'Settled Date': claim.settledAt ? new Date(claim.settledAt).toLocaleDateString() : 'N/A'
    }));
};

export default {
    exportToCSV,
    // exportToExcel, // Uncomment when xlsx package is installed
    formatAgentsForExport,
    formatPoliciesForExport,
    formatCustomersForExport,
    formatCommissionsForExport,
    formatTransactionsForExport,
    formatClaimsForExport
};
