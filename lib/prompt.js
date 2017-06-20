/**
 * User interface
 */

const inquirer = require('inquirer');

const cst = require('./constants.js');

/**
 * Ask to the user what is its database type (MySQL, Oracle, etc)
 * Presents a list of all supported database types (see constants.js)
 */
const askDatabaseType = () => {
    const question = {
        type: 'list',
        name: 'selectedDatabaseType',
        message: 'Database type?',
        choices: cst.databaseTypesToArray
    };

    return inquirer.prompt(question)
    .then(
        answer => answer.selectedDatabaseType,
        (onError) => { console.error(onError); }
    );
};

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
            name: 'username',
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
        (onError) => { console.error(onError); }
    );
};

const askCredentials = (databaseType) => {
    if (databaseType === cst.databaseTypes.mysql) {
        return askMysqlCredentials();
    }
    // if no database matches the input parameter
    throw new Error(`database ${databaseType} not supported yet!`);
};

module.exports = {
    askCredentials,
    askDatabaseType
};
