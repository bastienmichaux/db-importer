/**
 * @file Command-line interface functions
 */

const inquirer = require('inquirer');
const fse = require('fs-extra');

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
 * Read the configuration file if it exists
 * then extract a configuration from its values.
 * The returned configuration is used to skip the specified questions.
 *
 * @returns {Object} Either the config object in case of success
 * or a null object in case of error
 */
const loadConfigurationFile = () => fse.readJson(cst.configFile)
    .then((config) => {
        log.info(cst.messages.loadingConfig);

        // test existence of each config key
        Object.keys(config).forEach((key) => {
            if (!inquiries[key]) {
                log.warning(`${key} is defined in ${cst.configFile} but is not a valid configuration item`);
                delete config[key];
            }
        });

        // validate value of each config value
        Object.keys(config).forEach((key) => {
            // not all inquiries have a validation method, we must thus safely access it
            if (typeof (inquiries[key].validate) === 'function' && inquiries[key].validate(config[key]).constructor.name === 'Error') {
                // warn user if the item is invalid
                log.warning(`${cst.configFile} "${key}": "${config[key]}" ${inquiries[key].validate(config[key])}`);
                delete config[key];
            }
        });

        // disable prompts for items specified by the configuration file
        Object.keys(config).forEach((key) => {
            inquiries[key].when = false;
        });

        /**
         * as inquirer won't have access to items loaded from configuration file,
         * we must handle default values relying on them here.
         */
        Object.keys(inquiries).forEach((key) => {
            if (typeof (inquiries[key].default) === 'function') {
                // if possible, deduce default from configuration, otherwise let it alone
                inquiries[key].default = inquiries[key].default(config) || inquiries[key].default;
            }
        });

        return config;
    })
    // in case of error reading the JSON file
    .catch((error) => {
        // this is the error number when fse.readJson tries to open an non existent file
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

    cst.inquiries.entities.choices = choices;

    return inquirer.prompt(cst.inquiries.entities).then(answers => Object.assign(session, answers));
};


module.exports = {
    loadConfigurationFile,
    askCredentials,
    selectEntities
};
