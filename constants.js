/**
 * @file Program constants
 */

const lodash = require('lodash/object');

const packageInfo = require('./package.json');
const validation = require('./lib/validation');
const db = require('./lib/db-commons');

const toArray = lodash.values;
const pickProperty = lodash.mapValues;

/**
 * Get the default port number of the DBMS selected by the user
 *
 * @param {object} input - The current user input
 * @returns {number|null} Either the port number of the selected DBMS, or null if there is no DBMS
 */
const defaultPort = (input) => {
    if (input.dbms) {
        return db.dbmsList[input.dbms].defaultPort;
    }
    // If no DBMS is used, we offer no default port number
    return null;
};

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
        default: db.dbmsList.mysql.name
    },
    // ask the host name and validate it
    host: {
        type: 'input',
        name: 'host',
        message: 'Host address:',
        validate: input => validation.validateHost(input),
        default: 'localhost',
    },
    // ask the port and validate it
    port: {
        type: 'input',
        name: 'port',
        message: 'Port number:',
        validate: input => validation.validatePort(input),
        default: input => defaultPort(input)
    },
    // ask the username for the selected DBMS server
    user: {
        type: 'input',
        name: 'user',
        message: 'User name:',
        default: 'root'
    },
    // ask the DBMS server connection password
    password: {
        type: 'password',
        name: 'password',
        message: 'Password:'
    },
    // ask which database schema should be imported
    schema: {
        type: 'input',
        name: 'schema',
        message: 'Database schema to import:'
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
 * File where user preferences can be stored in order to automate connection
 *
 * @constant {string}
 */
const configFile = '.db-config.json';


/**
 * Messages displayed to the user
 *
 * @enum {string}
 */
const messages = {
    greeting: `/ᐠ｡ꞈ｡ᐟ\\ Oh hai. I'm Node-db-importer v${packageInfo.version}.
I need information before importing your db.\n`,
    noConfig: `${configFile} not found`,
    foundConfig: `${configFile} has been loaded`
};


/**
 * Strings dividing the result list given by prompt.js #selectEntities
 * after all the table names of a database have been retrieved
 *
 * @enum {string}
 */
const headers = {
    tables: '--- tables ---',
    twoTypeJunction: '--- two tables junctions ---',
    jhipster: '--- JHipster tables ---',
    liquibase: '--- Liquibase tables ---'
};


module.exports = {
    inquiries,
    configFile,
    messages,
    headers
};
