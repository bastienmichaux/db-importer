/**
 * @file Validation functions for standard SQL and database-agnostic rules
 */

// validation framework
const joi = require('joi');
const db = require('./db-commons');

/**
 * Validate user input against rules
 *
 * @param {function} rule - Validation rule created with the joi validation framework
 * @returns {function} wrapper around joi.validate function. It takes the value to validate as input and returns true if the validation passes, the Error object otherwise.
 */
const validationFromJoi = rule =>
    (input) => {
        const error = joi.validate(input, rule).error;
        if (error) {
            return error;
        }
        return true;
    };

/**
 * Validate dbms name
 *
 * @param {string} input a dbms name proposal to validate
 * @return {boolean|Error} true if input is a valid DBMS, an error Object otherwise
 */
const validateDbms = (input) => {
    if (db.dbmsList[input]) {
        return true;
    }
    const error = new Error(`"value" must be in the list (${Object.keys(db.dbmsList)})`);
    error.isJoi = false;
    error.code = 'INVALID_DBMS';
    error.name = 'ValidationError';
    error._object = input;
    return error;
};

/**
 * Validate host name
 *
 * @param {string} input a host name proposal to validate
 * @returns {boolean|Error} true if input is a valid host name, an error Object otherwise
 */
const validateHost = input => validationFromJoi(joi.string().hostname())(input);

/**
 * Validate port number (unsigned 16-bit integer)
 *
 * @param {string} input a host name proposal to validate
 * @returns {boolean|Error} true if input is a valid port number, an error Object otherwise
 */
const validatePort = input => validationFromJoi(joi.number().min(0).max(65535))(input);

module.exports = {
    validationFromJoi,
    validateDbms,
    validateHost,
    validatePort
};
