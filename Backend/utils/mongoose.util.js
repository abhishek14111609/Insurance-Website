/**
 * Mongoose Helper Utilities
 * Provides common patterns for working with MongoDB/Mongoose
 */

import mongoose from 'mongoose';

/**
 * Safely convert string ID to MongoDB ObjectId
 * @param {string|ObjectId} id - The ID to convert
 * @returns {ObjectId} MongoDB ObjectId
 */
export const toObjectId = (id) => {
    if (typeof id === 'string') {
        return new mongoose.Types.ObjectId(id);
    }
    return id;
};

/**
 * Convert Decimal128 to number
 * @param {Decimal128} value - The Decimal128 value
 * @returns {number} The converted number
 */
export const decimal128ToNumber = (value) => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    return parseFloat(value.toString());
};

/**
 * Validate if string is valid MongoDB ObjectId
 * @param {string} id - The ID string to validate
 * @returns {boolean} True if valid ObjectId
 */
export const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Get pagination options
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {object} MongoDB skip and limit options
 */
export const getPaginationOptions = (page = 1, limit = 10) => {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    return { skip, limit: limitNum, page: pageNum };
};

/**
 * Format paginated response
 * @param {array} data - The data array
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} Formatted paginated response
 */
export const formatPaginatedResponse = (data, total, page, limit) => {
    return {
        success: true,
        data,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Handle Mongoose validation errors
 * @param {Error} error - Mongoose error object
 * @returns {object} Formatted error response
 */
export const handleMongooseError = (error) => {
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return {
            success: false,
            message: 'Validation error',
            errors: messages
        };
    }

    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return {
            success: false,
            message: `${field} already exists`
        };
    }

    if (error.name === 'CastError') {
        return {
            success: false,
            message: `Invalid ${error.kind}: ${error.value}`
        };
    }

    return {
        success: false,
        message: error.message || 'Database error'
    };
};

/**
 * Safely populate nested fields
 * @param {object} query - Mongoose query object
 * @param {array|string} populateFields - Fields to populate
 * @returns {object} Query with populated fields
 */
export const safePopulate = (query, populateFields) => {
    if (!populateFields) return query;

    const fields = Array.isArray(populateFields) ? populateFields : [populateFields];
    return fields.reduce((q, field) => q.populate(field), query);
};

/**
 * Build MongoDB filter query
 * @param {object} filters - Filter object
 * @param {array} allowedFields - Allowed filter fields
 * @returns {object} MongoDB filter query
 */
export const buildFilterQuery = (filters = {}, allowedFields = []) => {
    const query = {};

    allowedFields.forEach(field => {
        if (filters[field] !== undefined && filters[field] !== null && filters[field] !== '') {
            query[field] = filters[field];
        }
    });

    return query;
};

/**
 * Build MongoDB sort query
 * @param {string} sortBy - Sort field (prefix with - for descending)
 * @param {string} defaultField - Default sort field
 * @returns {object} MongoDB sort query
 */
export const buildSortQuery = (sortBy = '', defaultField = '-createdAt') => {
    const sortField = sortBy || defaultField;
    const field = sortField.startsWith('-') ? sortField.slice(1) : sortField;
    const direction = sortField.startsWith('-') ? -1 : 1;

    return { [field]: direction };
};

/**
 * Format MongoDB document for API response
 * @param {object} doc - Mongoose document
 * @param {array} fieldsToOmit - Fields to exclude
 * @returns {object} Formatted document
 */
export const formatDocument = (doc, fieldsToOmit = ['__v']) => {
    if (!doc) return null;

    const obj = doc.toObject ? doc.toObject() : doc;
    fieldsToOmit.forEach(field => delete obj[field]);
    return obj;
};

/**
 * Bulk update with error handling
 * @param {Model} Model - Mongoose model
 * @param {array} updates - Array of {filter, update} objects
 * @returns {Promise} Bulk update result
 */
export const bulkUpdate = async (Model, updates) => {
    try {
        const operations = updates.map(({ filter, update }) => ({
            updateOne: {
                filter,
                update: { $set: update }
            }
        }));

        const result = await Model.bulkWrite(operations);
        return {
            success: true,
            modifiedCount: result.modifiedCount,
            matchedCount: result.matchedCount
        };
    } catch (error) {
        return handleMongooseError(error);
    }
};

/**
 * Aggregate with pagination
 * @param {Model} Model - Mongoose model
 * @param {array} pipeline - Aggregation pipeline
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise} Aggregation result with pagination
 */
export const aggregateWithPagination = async (Model, pipeline = [], page = 1, limit = 10) => {
    const { skip, limit: limitNum } = getPaginationOptions(page, limit);

    const countPipeline = [...pipeline, { $count: 'total' }];
    const dataPipeline = [...pipeline, { $skip: skip }, { $limit: limitNum }];

    const [countResult, data] = await Promise.all([
        Model.aggregate(countPipeline),
        Model.aggregate(dataPipeline)
    ]);

    const total = countResult[0]?.total || 0;

    return formatPaginatedResponse(data, total, page, limitNum);
};

/**
 * Create with auto-generated code/number
 * @param {Model} Model - Mongoose model
 * @param {string} codeField - Field name for code
 * @param {string} prefix - Code prefix
 * @param {object} data - Document data
 * @returns {Promise} Created document
 */
export const createWithAutoCode = async (Model, codeField, prefix, data) => {
    try {
        const count = await Model.countDocuments();
        const code = `${prefix}${String(count + 1).padStart(6, '0')}`;

        const newData = {
            ...data,
            [codeField]: code
        };

        const document = await Model.create(newData);
        return {
            success: true,
            data: formatDocument(document)
        };
    } catch (error) {
        return handleMongooseError(error);
    }
};

export default {
    toObjectId,
    decimal128ToNumber,
    isValidObjectId,
    getPaginationOptions,
    formatPaginatedResponse,
    handleMongooseError,
    safePopulate,
    buildFilterQuery,
    buildSortQuery,
    formatDocument,
    bulkUpdate,
    aggregateWithPagination,
    createWithAutoCode
};
