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

const validateDbms = input => (db.dbmsList[input] ? true : new Error(`ValidationError: "value" must be in the list (${Object.keys(db.dbmsList)})`));

/**
 * Validate host name
 *
 * @function
 * @returns {Error|boolean} Error for wrong input, true for correct input
 */
const validateHost = validationFromJoi(joi.string().hostname());

/**
 * Validate port number (unsigned 16-bit integer)
 *
 * @function
 * @returns {Error|boolean} Error for wrong input, true for correct input
 */
const validatePort = validationFromJoi(joi.number().min(0).max(65535));

module.exports = {
    validationFromJoi,
    validateDbms,
    validateHost,
    validatePort
};
