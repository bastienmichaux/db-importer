/**
 * @file Validation functions for standard SQL and database-agnostic rules
 */

// validation framework
const joi = require('joi');


/**
 * Validate user input against rules
 *
 * @param {function} rule - Rule created with the joi validation framework
 * @returns {Error|boolean} return true if input is valid, return the error otherwise
 */
const validation = rule =>
    (input) => {
        const error = joi.validate(input, rule).error;
        if (error) {
            return error;
        }
        return true;
    };


/**
 * Validate host name
 *
 * @function
 * @returns {Error|boolean} same as validation constant
 */
const validateHost = validation(joi.string().hostname());


/**
 * Validate port number (unsigned 16-bit integer)
 *
 * @function
 * @returns {Error|boolean} same as validation constant
 */
const validatePort = validation(joi.number().min(0).max(65535));


module.exports = {
    validation,
    validateHost,
    validatePort
};
