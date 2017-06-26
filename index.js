const chalk = require('chalk');

const connect = require('./lib/connect.js');
const importer = require('./lib/importer.js');
const cst = require('./lib/constants.js');
const prompt = require('./lib/prompt.js');

/**
 * If the module is used as it is,
 * this function is called to greet the user.
 */
const start = () => {
    let dbType = null; // oracle, mysql, sqlite, etc
    let credentials = null; // user, password, host address, database name
    let connection = null; // knex connection object
    let tables = null; // the database tables as an array of strings
    const errors = {};

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
            console.log('Promise rejected');
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
            connection = connect.getMysqlConnectionObject(credentials);
        },
        (onRejected) => {
            errors.askCredentials = onRejected;
            console.log('!!! Promise rejected !!!');
            console.log(errors);
        }
    )
    // having a connection to the db, fetch all the database tables
    .then(
        (onFulfilled) => {
            console.log(chalk.bold(`Fetching all the tables for the database '${credentials.database}'`));
            return importer.getMysqlTableNames(credentials);
        },
        (onRejected) => {
            errors.getMysqlConnectionObject = onRejected;
            console.log('!!! Promise rejected !!!');
            console.log(errors);
        }
    )
    .then(
        (onFulfilled) => {
            tables = onFulfilled;
            console.log(`Found ${tables.length} tables`);
            console.log(tables);
        },
        (onRejected) => {
            console.log('!!! Promise rejected !!!');
            console.log(onRejected);
            console.log(errors);
        }
    );
};

start();
