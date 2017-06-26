/**
 * Utility functions
 */

const lodash = require('lodash');

const cst = require('./constants.js');

const objectValuesToArray = obj => lodash.values(obj);

// TODO: error messages
const validateMysqlCredentials = (cred) => {
    if (typeof cred.host !== 'string') {
        return new TypeError();
    }
    if (typeof cred.username !== 'string') {
        return new TypeError();
    }
    if (typeof cred.password !== 'string') {
        return new TypeError();
    }
    if (cred.databaseType !== cst.databaseTypes.mysql) {
        return new TypeError();
    }
    if (typeof cred.database !== 'string') {
        return new TypeError();
    }
    return true;
};

/**
 * Validate that a database type is among our supported databases
 */
const validateDatabaseType = (str) => {
    const db = str.trim().toLowerCase();
    return cst.databaseTypes[db] !== undefined;
};

module.exports = {
    objectValuesToArray,
    validateDatabaseType,
    validateMysqlCredentials,
};
