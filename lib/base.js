/**
 * Utility functions
 */

const lodash = require('lodash');

const cst = require('./constants.js');

/** Alias for lodash.values(), return object values as an array of strings */
const objectValuesToArray = obj => lodash.values(obj);

/**
 * Validate the parameters needed by Knex in order to get a connection to a MySQL server
 * TODO: error messages
 */
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
 * Given a database type, validate the credentials according to the database type
 */
const validateCredentials = (cred) => {
    const db = cred.database;

    if (db === cst.databaseTypes.mysql) {
        return validateMysqlCredentials(cred);
    }

    // if no database matches the input parameter
    throw new Error(`database type '${db}' not supported yet!`);
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
    validateCredentials,
};
