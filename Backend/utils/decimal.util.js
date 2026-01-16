import mongoose from 'mongoose';

/**
 * Utility functions for handling MongoDB Decimal128 type
 * Converts Decimal128 to plain numbers for API responses
 */

/**
 * Convert a Decimal128 value to a JavaScript number
 * @param {mongoose.Decimal128|null|undefined} value - The Decimal128 value
 * @param {number} defaultValue - Default value if conversion fails
 * @returns {number} - The converted number or default value
 */
export const decimalToNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined) {
        return defaultValue;
    }
    
    // If it's already a number, return it
    if (typeof value === 'number') {
        return value;
    }
    
    // If it's a Decimal128 object
    if (value instanceof mongoose.Types.Decimal128) {
        const parsed = parseFloat(value.toString());
        return isNaN(parsed) ? defaultValue : parsed;
    }
    
    // If it's a string representation of Decimal128
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
    }
    
    // Try to convert any other type
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Process an object or array to convert all Decimal128 fields to numbers
 * @param {Object|Array} data - The data to process
 * @returns {Object|Array} - Processed data with Decimal128 converted to numbers
 */
export const convertDecimalFields = (data) => {
    if (data === null || data === undefined) {
        return data;
    }
    
    // If it's an array, process each item
    if (Array.isArray(data)) {
        return data.map(item => convertDecimalFields(item));
    }
    
    // If it's a plain object, process each field
    if (typeof data === 'object' && !(data instanceof Date)) {
        const processed = {};
        
        for (const [key, value] of Object.entries(data)) {
            if (value instanceof mongoose.Types.Decimal128) {
                processed[key] = decimalToNumber(value);
            } else if (Array.isArray(value)) {
                processed[key] = convertDecimalFields(value);
            } else if (typeof value === 'object' && value !== null) {
                processed[key] = convertDecimalFields(value);
            } else {
                processed[key] = value;
            }
        }
        
        return processed;
    }
    
    return data;
};

/**
 * Mongoose transform function for toJSON() and toObject()
 * Automatically converts Decimal128 fields in all schemas
 */
export const decimalTransform = function(doc, ret) {
    if (ret === null || ret === undefined) {
        return ret;
    }
    
    for (const [key, value] of Object.entries(ret)) {
        if (value instanceof mongoose.Types.Decimal128) {
            ret[key] = decimalToNumber(value);
        }
    }
    
    return ret;
};

export default {
    decimalToNumber,
    convertDecimalFields,
    decimalTransform
};

