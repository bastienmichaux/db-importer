/**
 * @file Validation functions for standard SQL and database-agnostic rules
 */

// validation framework
const joi = require('joi');
const db = require('./db-commons');
const cst = require('../constants');

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
 * create a validation library for inquirer from a joi schema.
 * the resulting object shares the same keys as the input schema but replace each joi rule with a validation method
 * compatible with the inquirer framework
 *
 * @param schema joi schema to transform
 * @return {{key: function}}
 */
const fromJoiToInquirer = (schema) => {
    const inquirer = {};
    Object.keys(schema).forEach((key) => {
        inquirer[key] = validationFromJoi(schema[key]);
    });
    return inquirer;
};

/**
 * schema for the configuration according to the joi validation framework
 *
 * @type {{mode, dbms, host, port, user, password, schema}}
 */
const schema = {
    mode: joi.string().valid(Object.keys(cst.modes)),
    dbms: joi.string().valid(Object.keys(db.dbmsList)),
    host: joi.string().hostname(),
    port: joi.number().min(0).max(65535),
    user: joi.string(),
    password: joi.string(),
    schema: joi.string(),
};

/**
 * validation methods usable by the prompt framework inquirer,
 * one method for each key of the schema object
 */
const inquirer = fromJoiToInquirer(schema);

/**
 *
 * @param configuration that must respect the schema
 * also there can't be any extraneous keys
 * if configuration.mode is 'automatic', validation will fail on absent keys
 * @return {{mode, dbms, host, port, user, password, schema}}
 * @throws {Error} ValidationError if the configuration doesn't satisfy the schema rules
 * get all validationError's rather than stopping at the first one
 */
const validateConfiguration = (configuration) => {
    let validator = joi.object(schema).unknown(false);
    if (configuration.mode === cst.modes.automatic) {
        validator = validator.requiredKeys(Object.keys(schema));
    }

    const { error, value } = validator.validate(configuration, { abortEarly: false });

    if (error) {
        throw error;
    }

    return value;
};


module.exports = {
    validationFromJoi,
    inquirer,
    validateConfiguration,
};
