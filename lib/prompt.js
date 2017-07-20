/**
 * User interface prompts, using inquirer
 */

const inquirer = require('inquirer');

const cst = require('../constants.js');


/**
 * Ask the user for connection credentials specific to a MySQL database
 */
const askMysqlCredentials = () => {
    const questions = [
        {
            type: 'input',
            name: 'host',
            message: 'Host address:',
        },
        {
            type: 'input',
            name: 'user',
            message: 'User name:',
        },
        {
            type: 'input',
            name: 'database',
            message: 'Database name:',
        },
        {
            type: 'password',
            name: 'password',
            message: 'Password',
        }
    ];

    return inquirer.prompt(questions)
        .then(
            answers => answers,
            onError => onError // TODO: right way to handle promise rejection in this case ?
        );
};

/** Proxy for the connection credentials prompt corresponding to the current database system */
const askCredentials = (databaseType) => {
    if (databaseType === cst.databaseTypes.mysql) {
        return askMysqlCredentials();
    }

    // if no database matches the input parameter
    throw new Error(`database ${databaseType} not supported yet!`);
};

module.exports = {
    askCredentials
};
