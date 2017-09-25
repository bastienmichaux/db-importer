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
                log.warning(`${key} is defined in ${cst.configFile} but is not a valid configuration property`);
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

        /**
         * as inquirer won't have access to items loaded from configuration file,
         * we must handle default values relying on them here.
         */
        Object.keys(inquiries).forEach((key) => {
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
 * Ask any information not provided by the configuration
 *
 * @param {{dbms, host, port, user, password, schema}} configuration empty, partial or full
 * @return {{dbms, host, port, user, password, schema}} items missing from the configuration
 */
const askCredentials = (configuration) => {
    const missingItems = [];
    // ask only questions for items not provided by the configuration
    ['dbms', 'host', 'port', 'user', 'password', 'schema'].forEach((item) => {
        if (!configuration[item]) {
            const enquiryCopy = Object.assign({}, inquiries[item]);
            missingItems.push(enquiryCopy);

            // if possible, deduce default from configuration, otherwise let it alone
            if (typeof enquiryCopy.default === 'function') {
                enquiryCopy.default = enquiryCopy.default(configuration) || enquiryCopy.default;
            }
        }
    });
    return inquirer.prompt(missingItems);
};


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


// get the 'choices' property for the inquirer question for the column selection
const selectColumnsQuestionChoices = (entities) => {
    const choices = [];
    const tables = Object.keys(entities);

    if (tables.length === 0) {
        throw new Error('selectColumns.getChoices: no entities');
    }

    // create the choices as a list of checked boxes, one box per column
    tables.forEach((table) => {
        const tableColumns = Object.keys(entities[table]);

        // separate columns belonging to the same table with an inquirer separator
        choices.push(new inquirer.Separator(table));

        tableColumns.forEach((tableColumn) => {
            // the column object, with its data
            const column = entities[table][tableColumn];
            const columnType = column.columnType;

            choices.push({
                // the displayed choice gives us the column's name and its type
                // @todo: add relationship hint
                name: `${tableColumn} (${columnType})`, // @todo: color column type
                value: `${table}.${tableColumn}`,
                checked: true
            });
        });
    });

    return choices;
};


// get the inquirer question for the selectColumns method
const selectColumnsQuestion = entities => ({
    type: 'checkbox',
    name: 'selectedColumns',
    message: 'Select the columns you want to import:',
    pageSize: 25,
    choices: selectColumnsQuestionChoices(entities)
});


// ask which columns should be imported as a list of checkboxes
const selectColumns = (session) => {
    const question = selectColumnsQuestion(session.entities);
    return inquirer.prompt(question)
        .then((answers) => {
            session.selectedColumns = answers;
            return session;
        });
};


module.exports = {
    loadConfigurationFile,
    askCredentials,
    selectEntities,
    selectColumnsQuestionChoices,
    selectColumnsQuestion,
    selectColumns,
};
