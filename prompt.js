const inquirer = require('inquirer');
const cst = require('./constants');
const joi = require('joi');

const inquiries = cst.inquiries;

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


const askCredentials = () => inquirer.prompt([
    inquiries.dbms,
    inquiries.host,
    inquiries.port,
    inquiries.user,
    inquiries.password,
    inquiries.schema
]);

module.exports = {
    validation,
    askCredentials
};
