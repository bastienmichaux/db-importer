/**
 * @file Command-line interface functions
 */

const lodash = require('lodash');
const inquirer = require('inquirer');
const fse = require('fs-extra');

const log = require('./lib/log');
const cst = require('./constants');
const validation = require('./lib/validation');
const db = require('./lib/db-commons');

const toArray = lodash.values;
const pickProperty = lodash.mapValues;


/**
 * Make a value checked for display of the retrieved tables
 */
const inquirerChoice = (value, name, checked) => ({
    value,
    name,
    checked
});

/**
 * Question objects required by the inquirer node module for user interaction.
 *
 * @enum {Object}
 * @see {@link https://www.npmjs.com/package/inquirer#question|How to use inquirer questions}
 */
const inquiries = {
    // ask the user which DBMS will be used (default is MySQL)
    dbms: {
        type: 'list',
        name: 'dbms',
        message: 'DBMS:',
        choices: toArray(pickProperty(db.dbmsList, 'name')),
        validate: validation.inquirer.dbms,
        default: db.dbmsList.mysql.name
    },
    // ask the host name and validate it
    host: {
        type: 'input',
        name: 'host',
        message: 'Host address:',
        validate: validation.inquirer.host,
        default: 'localhost',
    },
    // ask the port and validate it
    port: {
        type: 'input',
        name: 'port',
        message: 'port:',
        validate: validation.inquirer.port,
        default: (input) => {
            if (input.dbms) {
                return db.dbmsList[input.dbms].defaultPort;
            }
            // It means we offer no default
            return null;
        }
    },
    // ask the username for the selected DBMS server
    user: {
        type: 'input',
        name: 'user',
        message: 'User name:',
        validate: validation.inquirer.user,
        default: 'root'
    },
    // ask the DBMS server connection password
    password: {
        type: 'password',
        name: 'password',
        message: 'Password:',
        validate: validation.inquirer.password,
    },
    // ask which database schema should be imported
    schema: {
        type: 'input',
        name: 'schema',
        message: 'Database schema to import:',
        validate: validation.inquirer.schema,
    },
    // ask which tables should be used as entities
    entities: {
        type: 'checkbox',
        name: 'entities',
        message: 'Select the tables you want to use as entities:',
        pageSize: 25,
    },
    // ask which columns should be used as files
    fields: {
        type: 'checkbox',
        name: 'fields',
        message: 'Select the columns you want to use as fields:',
        pageSize: 25,
    }
};

/**
 * Read the configuration file if it exists
 * then extract a configuration from its values.
 * The returned configuration is used to skip the specified questions.
 *
 * @returns {Object} The config object, possibly empty.
 */
const loadConfigurationFile = () => fse.pathExists(cst.configFile)
    .then((exist) => {
        if (exist) {
            log.info(cst.messages.loadingConfig);
            return fse.readJson(cst.configFile);
        }
        log.info(cst.messages.noConfig);
        return {};
    })
    .then(config => validation.validateConfiguration(config));


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
 * @param {object} session - data retrieved during a sql session
 * @returns {Promise} the list of tables, separated by categories
 * (tables, manyToManyTablesOnly, jhipster, liquibase)
 */
const selectEntities = (session) => {
    const results = session.results;

    let choices = [];

    const tables = results.tables.map(table => inquirerChoice(table, null, true));
    const twoTypeJunction = results.manyToManyTablesOnly.map(table => inquirerChoice(table, null, false));
    const jhipster = results.jhipster.map(table => inquirerChoice(table, null, false));
    const liquibase = results.liquibase.map(table => inquirerChoice(table, null, false));

    choices.push(new inquirer.Separator(cst.headers.tables));
    choices = choices.concat(tables);

    choices.push(new inquirer.Separator(cst.headers.manyToManyTablesOnly));
    choices = choices.concat(twoTypeJunction);

    choices.push(new inquirer.Separator(cst.headers.jhipster));
    choices = choices.concat(jhipster);

    choices.push(new inquirer.Separator(cst.headers.liquibase));
    choices = choices.concat(liquibase);

    const inquiryCopy = Object.assign({ choices }, inquiries.entities);

    return inquirer.prompt(inquiryCopy).then(answers => Object.assign({}, session, answers));
};

/**
 * Ask which columns should be imported as a list of checkboxes.
 *
 * @param {object} session - data retrieved during a sql session
 */
const selectColumns = (session) => {
    const { columnsByTable } = session.results;

    let choices = [];

    columnsByTable.forEach((table) => {
        choices.push(new inquirer.Separator(`--- ${table.tableName} ---`));

        const columns = table.columns;

        const columnsChoices = columns.map(column => inquirerChoice({
            tableName: table.tableName,
            columnName: column.name,
            columnType: column.type
        },
        `${column.name} - ${column.type}`,
        true));

        choices = choices.concat(columnsChoices);
    });

    const inquiryCopy = Object.assign({ choices }, inquiries.fields);

    return inquirer.prompt(inquiryCopy).then(answers => Object.assign({}, session, answers));
};


module.exports = {
    inquiries,
    loadConfigurationFile,
    askCredentials,
    selectEntities,
    selectColumns,
};
