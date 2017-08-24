/**
 * @file Command-line interface functions
 */

const inquirer = require('inquirer');
const fse = require('fs-extra');
const lodash = require('lodash');

const log = require('./lib/log');
const cst = require('./constants');

const inquiries = cst.inquiries;


/**
 * Make a value checked for display of the retrieved tables
 */
const checkChoice = value => ({
    value,
    checked: true
});

/**
 * Make a value unchecked for display of the retrieved tables
 */
const uncheckChoice = value => ({
    value,
    checked: false
});


/**
 * Read the configuration file (.db-config.json) if it exists
 * then extract a configuration from its values.
 * The returned configuration is used to skip the specified questions.
 *
 * @returns {Object} Either the config object in case of success
 * or a null object in case of error
 */
const init = () => fse.readJson(cst.configFile)
    .then((config) => {
        // disable prompts for items specified by the configuration file
        lodash.forEach(config, (value, key) => {
            if (inquiries[key]) {
                /**
                 * .validate method returns either true or a string as error message.
                 * A non empty string is considered truthy so we compare to true.
                 * Warn user if the item is invalid, disable prompt if it isn't
                 */
                if (typeof (inquiries[key].validate) === 'function' && inquiries[key].validate(config[key]) !== true) {
                    log.warning(`${cst.configFile} "${key}": "${value}" ${inquiries[key].validate(config[key])}`);
                } else {
                    inquiries[key].when = false;
                }
            } else {
                log.warning(`${key} is defined in ${cst.configFile} but is not a valid configuration item`);
            }
        });
        lodash.forEach(inquiries, (prompt) => {
            if (typeof (prompt.default) === 'function') {
                /**
                 * inquirer won't have access to the configuration file, we must thus manually run the default functions
                 */
                prompt.default = prompt.default(config) || prompt.default;
            }
        });
        log.info(`${cst.configFile} has been loaded`);
        return config;
    })
    // in case of error reading the JSON file
    .catch((error) => {
        if (error.errno === -2) {
            log.info(cst.messages.noConfig);
        } else {
            log.failure(error);
        }
        // if an error occurs, load nothing
        return {};
    });


/**
 * Prompt steps when interacting with the user
 * Returns the user answers
 *
 * @param {Object} configuration
 */
const askCredentials = configuration => inquirer.prompt([
    inquiries.dbms,
    inquiries.host,
    inquiries.port,
    inquiries.user,
    inquiries.password,
    inquiries.schema
]).then(answers => Object.assign(configuration, answers));


/**
 * Return the list of tables the user can select for conversion to JSON entities
 *
 * @param {object} session - data retrieved during a MySQL session
 * @returns the list of tables, separated by categories
 * (tables, twoTypeJunction, jhipster, liquibase)
 */
const selectEntities = (session) => {
    const results = session.results;

    const enquiry = lodash.clone(cst.inquiries.entities);
    let choices = [];

    const tables = results.tables.map(checkChoice);
    const twoTypeJunction = results.twoTypeJunction.map(uncheckChoice);
    const jhipster = results.jhipster.map(uncheckChoice);
    const liquibase = results.liquibase.map(uncheckChoice);

    choices.push(new inquirer.Separator(cst.headers.tables));
    choices = choices.concat(tables);

    choices.push(new inquirer.Separator(cst.headers.twoTypeJunction));
    choices = choices.concat(twoTypeJunction);

    choices.push(new inquirer.Separator(cst.headers.jhipster));
    choices = choices.concat(jhipster);

    choices.push(new inquirer.Separator(cst.headers.liquibase));
    choices = choices.concat(liquibase);

    enquiry.choices = choices;

    return inquirer.prompt(enquiry).then(answers => Object.assign(session, answers));
};


module.exports = {
    init,
    askCredentials,
    selectEntities
};
