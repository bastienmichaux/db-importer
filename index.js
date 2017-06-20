// const fs = require('fs');
// const jsBeautify = require('js-beautify').js_beautify;
// const lodash = require('lodash');
// const util = require('util');

const connect = require('./lib/connect.js');
const importer = require('./lib/importer.js');
const cst = require('./lib/constants.js');
const prompt = require('./lib/prompt.js');

/**
 * If the module is used as it is, this function is called to greet the user.
 */
const start = () => {
    let dbType = null;
    let credentials = null;
    let connection = null;
    const errors = {};

    console.log(`${cst.messages.cat} ${cst.messages.hello}`);

    prompt.askDatabaseType()
    .then(
        (onFulfilled) => {
            dbType = onFulfilled;
            return prompt.askCredentials(dbType);
        },
        (onRejected) => {
            errors.askDatabaseType = onRejected;
            console.log('Promise rejected');
            console.log(errors);
        }
    )
    .then(
        (onFulfilled) => {
            credentials = onFulfilled;
            credentials.databaseType = dbType;
            connection = connect.getMysqlConnectionObject(credentials);
        },
        (onRejected) => {
            errors.askCredentials = onRejected;
            console.log('Promise rejected');
            console.log(errors);
        }
    )
    .then(
        (onFulfilled) => {
            console.log('Fetching all your tables for the given database...');
            importer.getMysqlTableNames(credentials);
        },
        (onRejected) => {
            errors.getMysqlConnectionObject = onRejected;
            console.log('Promise rejected');
            console.log(errors);
        }
    );
};

start();
