/**
 * Utility functions
 */

const cst = require('./constants.js');


/**
 * Validate that a database type is among our supported databases
 * Note: currently not used
 */
const validateDatabaseType = (str) => {
    const db = str.trim().toLowerCase();
    return cst.databaseTypes[db] !== undefined;
};

module.exports = {
    validateDatabaseType,
};
