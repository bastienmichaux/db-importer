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
    // ask which tables should be imported
    entities: {
        type: 'checkbox',
        name: 'entities',
        message: 'Select the tables you want to import:',
        pageSize: 25
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
 * If there are no columns in the entities object that match a selectedColumn,
 * delete it from the entities object.
 *
 * @param { string[] } selectedColumns - array of strings like "tableName.columnName" returned by an inquirer prompt
 * @param { object } entities - an object having the structure { tableName { columnName { columnProperty: columnValue } } }
 * @returns { object } the entities object after the removal of 0 or more columns
 */
const removeColumns = (entities, selectedColumns) => {
    const tables = Object.keys(entities);
    const updatedEntities = lodash.cloneDeep(entities);
    let columns = null;
    let soughtColumn = null;

    tables.forEach((table) => {
        columns = Object.keys(entities[table]);
        columns.forEach((column) => {
            soughtColumn = `${table}.${column}`;
            if (!selectedColumns.includes(soughtColumn)) {
                delete updatedEntities[table][column];
            }
        });
    });

    return updatedEntities;
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

    const tables = results.tables.map(checkChoice);
    const twoTypeJunction = results.manyToManyTablesOnly.map(uncheckChoice);
    const jhipster = results.jhipster.map(uncheckChoice);
    const liquibase = results.liquibase.map(uncheckChoice);

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
 * Get the 'choices' property for the inquirer question for the column selection (see .selectColumns)
 * @param { object } entities - the session's entities organized in an object like { tables : { columns : { columnsProperties } } }
 * @returns the choices property for the inquirer question used by .selectColumns
 */
const selectColumnsQuestionChoices = (entities) => {
    const choices = [];
    const tables = Object.keys(entities);

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
                // the displayed choice gives us the column's name and its type, such as 'id (bigint(11))'
                // @todo: add relationship hint
                name: `${tableColumn} (${columnType})`, // @todo: color column type
                value: `${table}.${tableColumn}`,
                checked: true // checks the checkbox
            });
        });
    });

    return choices;
};


/**
 * Get the inquirer question for the selectColumns method.
 *
 * @param { object } entities - the session's entities organized in an object like { tables : { columns : { columnsProperties } } }
 */
const selectColumnsQuestion = entities => ({
    type: 'checkbox',
    name: 'selectedColumns',
    message: 'Select the columns you want to import:',
    pageSize: 25,
    choices: selectColumnsQuestionChoices(entities)
});


/**
 * Ask which columns should be imported as a list of checkboxes.
 *
 * @param {object} session - data retrieved during a sql session
 */
const selectColumns = (session) => {
    const question = selectColumnsQuestion(session.entities);
    return inquirer.prompt(question)
        .then((answer) => {
            session.entities = removeColumns(session.entities, answer.selectedColumns);
            return session;
        });
};


module.exports = {
    inquiries,
    loadConfigurationFile,
    askCredentials,
    selectEntities,
    selectColumnsQuestionChoices,
    selectColumns,
    removeColumns,
};
