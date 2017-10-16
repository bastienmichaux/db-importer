/**
 * @file Program constants
 */

const packageInfo = require('../package.json');


/**
 * File where user preferences can be stored in order to automate connection
 *
 * @constant {string}
 */
const configFile = '.db-config.json';

/**
 * File to store export results
 *
 * @type {string}
 */
const exportFile = 'db-export.json';

/**
 * defines how the program must behave
 * - automatic: the whole process happens without user intervention
 * the program will fail if the configuration isn't full and correct
 *
 * - default: the selection happens without user intervention
 * the program will ask user help if it needs some (like missing or incorrect login)
 *
 * manual: the program prompts the user for each possible choice
 *
 * @type {{automatic: string, default: string, manual: string}}
 */
const modes = {
    automatic: 'automatic',
    default: 'default',
    manual: 'manual',
};

/**
 * Messages displayed to the user
 *
 * @enum {string}
 */
const messages = {
    connectionSuccess: 'connected to the database',
    connectionFailure: 'failed to connect to the database ',
    contributeOnFailure: `Would you kindly fill an issue ? https://github.com/bastienmichaux/db-importer/issues
Also check if the issue is already being tracked before posting, would you kindly ?
"I forked, I fixed, I PR'ed" - Julius Caesar`,
    goodbye: `Everything we got was exported into the file '${exportFile}'
/ᐠ｡ꞈ｡ᐟ\\ C U`,
    greeting: `/ᐠ｡ꞈ｡ᐟ\\ Oh hai. I'm Node-db-importer v${packageInfo.version}.
I need information before importing your db.\n`,
    loadingConfig: `loading ${configFile}`,
    noConfig: `${configFile} not found`,
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
    configFile,
    exportFile,
    modes,
    messages,
    headers
};
