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

const fromJoiToInquirer = (schema) => {
    const inquirer = {};
    Object.keys(schema).forEach((key) => {
        inquirer[key] = validationFromJoi(schema[key]);
    });
    return inquirer;
};

const subSchema = {
    dbms: joi.string().valid(Object.keys(db.dbmsList)),
    host: joi.string().hostname(),
    port: joi.number().min(0).max(65535),
    user: joi.string(),
    password: joi.string(),
    schema: joi.string(),
};

const inquirer = fromJoiToInquirer(subSchema);

const configuration = joi.object(subSchema).unknown(false);

module.exports = {
    validationFromJoi,
    inquirer,
    configuration,
};
