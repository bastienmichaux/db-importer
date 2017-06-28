const chalk = require('chalk');
const fs = require('fs');
const util = require('util');

const connect = require('./lib/connect.js');
const importer = require('./lib/importer.js');
const cst = require('./lib/constants.js');
const prompt = require('./lib/prompt.js');

/**
 * If the module is used as it is,
 * this function is called to greet the user.
 */
const start = () => {
    const getFilepath = tableName => `dump/${tableName}.json`;

    // oracle, mysql, sqlite, etc
    let dbType = null;

    // user, password, host address, database name
    let credentials = null;

     // knex connection object // eslint is derping here
    let connection = null;

    // the database tables as an array of strings
    let tables = null;

    // store the errors of rejected promises
    const errors = {};

    // what we will write to the files
    const fileContent = null;

    const filePath = null;

    console.log(`${cst.messages.cat} ${cst.messages.hello}`);

    prompt.askDatabaseType()
    // depending on the database type, ask the appropriate credentials
    .then(
        (onFulfilled) => {
            dbType = onFulfilled;
            return prompt.askCredentials(dbType);
        },
        (onRejected) => {
            errors.askDatabaseType = onRejected;
            console.log('Promise rejected on prompt/askDatabaseType');
            console.log(errors);
        }
    )
    // given the connection credentials, attempt to connect to the db
    // TODO: catch connection errors
    // (they're not caught at the moment, don't know why)
    .then(
        (onFulfilled) => {
            credentials = onFulfilled;
            credentials.databaseType = dbType;
            connection = connect.getConnectionObject(credentials);
        },
        (onRejected) => {
            errors.askCredentials = onRejected;
            console.log('Promise rejected on prompt/askCredentials');
            console.log(errors);
        }
    )
    // having a connection to the db, fetch all the database tables
    .then(
        (onFulfilled) => {
            console.log(chalk.bold(`Node-db-importer: Fetching all the tables for the database '${credentials.database}'`));
            return importer.getTableNames(credentials);
        },
        (onRejected) => {
            errors.getMysqlConnectionObject = onRejected;
            console.log(chalk.bold('Promise rejected on connect/getConnectionObject'));
            console.log(errors);
        }
    )
    .then(
        (onFulfilled) => {
            // here, all database tables will be written in the ./dump folder
            tables = onFulfilled;
            console.log(chalk.bold(`Node-db-importer: Found ${tables.length} tables`));
            importer.getAllTables(credentials, tables);
        },
        (onRejected) => {
            errors.getMysqlTableNames = onRejected;
            console.log(chalk.bold('Promise rejected on importer/getTableNames'));
            console.log(errors);
        }
    );
};

start();
