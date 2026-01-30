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
        // Handle MongoDB Decimal128 in JSON ({ $numberDecimal: "..." })
        if (value.$numberDecimal) {
            return parseFloat(value.$numberDecimal) || defaultValue;
        }

        // Handle Decimal128 objects (Standard BSON)
        if (value.toString && typeof value.toString === 'function') {
            const stringValue = value.toString();
            // If toString returns [object Object], fail gracefully or try parsing if possible
            if (stringValue === '[object Object]') {
                return defaultValue;
            }
            const parsed = parseFloat(stringValue);
            return isNaN(parsed) ? defaultValue : parsed;
        }

        // Handle objects with value property
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

export default {
    toNumber,
    formatCurrency,
    formatNumber
};

