const joi = require('joi');


/**
 *
 * @param rule created with the validation framework joi
 * @returns function (input) that returns true if input passes validation of rule, the error otherwise
 */
const validation = rule =>
    (input) => {
        const error = joi.validate(input, rule).error;
        if (error) {
            return error;
        }
        return true;
    };

const validateHost = validation(joi.string().hostname());

const validatePort = validation(joi.number().min(0).max(65535));

module.exports = {
    validation,
    validateHost,
    validatePort
};
