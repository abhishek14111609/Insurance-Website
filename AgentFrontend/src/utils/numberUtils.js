/**
 * Utility functions for handling numeric values safely
 * Handles edge cases like Decimal128 objects, null, undefined, etc.
 */

/**
 * Safely convert any value to a number
 * @param {*} value - The value to convert
 * @param {number} defaultValue - Default value if conversion fails
 * @returns {number} - The converted number or default value
 */
export const toNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined) {
        return defaultValue;
    }

    // If it's already a number, return it
    if (typeof value === 'number') {
        return value;
    }

    // If it's a string representation of a number
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    // If it's an object with a toString method (like Decimal128)
    if (typeof value === 'object' && value !== null) {
        // Handle MongoDB Decimal128 format: { $numberDecimal: "123.45" }
        if (value.$numberDecimal) {
            const parsed = parseFloat(value.$numberDecimal);
            return isNaN(parsed) ? defaultValue : parsed;
        }

        // Handle Decimal128 objects with toString
        // Note: Check for custom toString, not Object.prototype.toString
        if (value.toString && value.toString !== Object.prototype.toString) {
            const stringValue = value.toString();
            const parsed = parseFloat(stringValue);
            return isNaN(parsed) ? defaultValue : parsed;
        }

        // Handle objects with value property (some MongoDB drivers)
        if (value.value !== undefined) {
            return toNumber(value.value, defaultValue);
        }
    }

    // Try to convert any other type
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Format a number as Indian Rupee currency
 * @param {*} value - The value to format
 * @param {string} defaultText - Text to show if value is invalid
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (value, defaultText = 'N/A') => {
    const number = toNumber(value, null);

    if (number === null || isNaN(number)) {
        return defaultText;
    }

    return `₹${number.toLocaleString('en-IN')}`;
};

/**
 * Format a number with locale-specific formatting
 * @param {*} value - The value to format
 * @param {string} defaultText - Text to show if value is invalid
 * @returns {string} - Formatted number string
 */
export const formatNumber = (value, defaultText = 'N/A') => {
    const number = toNumber(value, null);

    if (number === null || isNaN(number)) {
        return defaultText;
    }

    return number.toLocaleString('en-IN');
};

/**
 * Process an object or array to convert all numeric-like fields
 * Useful for handling API responses with Decimal128 or similar types
 * @param {Object|Array} data - The data to process
 * @returns {Object|Array} - Processed data with all numeric strings converted
 */
export const processNumericFields = (data) => {
    if (data === null || data === undefined) {
        return data;
    }

    // If it's an array, process each item
    if (Array.isArray(data)) {
        return data.map(item => processNumericFields(item));
    }

    // If it's a plain object, process each field
    if (typeof data === 'object' && !(data instanceof Date)) {
        const processed = {};

        for (const [key, value] of Object.entries(data)) {
            // Skip common non-numeric fields
            if (['id', '_id', 'policyNumber', 'claimNumber', 'email', 'phone',
                'name', 'fullName', 'ownerName', 'ownerEmail', 'ownerPhone',
                'ownerAddress', 'ownerCity', 'ownerState', 'ownerPincode',
                'tagId', 'breed', 'gender', 'cattleType', 'status', 'paymentStatus',
                'description', 'address', 'city', 'state', 'pincode',
                'incidentLocation', 'rejectionReason', 'adminNotes',
                'documents', 'photos', 'agentCode', 'type', 'icon', 'text', 'class',
                'createdAt', 'updatedAt', 'startDate', 'endDate', 'incidentDate',
                'reviewedAt', 'paidAt', 'approvedAt', 'rejectedAt', 'paymentDate',
                'url', 'side'].includes(key)) {
                processed[key] = value;
            } else if (Array.isArray(value)) {
                processed[key] = processNumericFields(value);
            } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
                processed[key] = processNumericFields(value);
            } else {
                // Try to convert numeric strings
                const converted = toNumber(value, null);
                if (converted !== null && !isNaN(converted) && typeof value === 'string') {
                    // Only convert if it looks like a number
                    if (/^\d+\.?\d*$/.test(value.trim())) {
                        processed[key] = converted;
                    } else {
                        processed[key] = value;
                    }
                } else {
                    processed[key] = value;
                }
            }
        }

        return processed;
    }

    return data;
};

export default {
    toNumber,
    formatCurrency,
    formatNumber,
    processNumericFields
};

