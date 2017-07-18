// dbi library
const cst = require('./lib/constants.js');
const prompt = require('./lib/prompt.js');

// database drivers
const dbiMysql = require('./lib/mysql.js');


// database driver selection
const getDatabaseDriver = (databaseType) => {
    if (databaseType === 'mysql') {
        return dbiMysql;
    }
    throw new Error(`No driver for db '${databaseType}'`);
};

const start = () => {
    let credentials = {};
    let connection = null;
    let databaseDriver = null;
    let queryResult = null;
    let selectedDatabase = null;

    // stores the promise rejection errors
    const errors = {};

    // greet the user
    console.log(`${cst.messages.cat} ${cst.messages.hello}`);

    // ask the database type
    prompt.askDatabaseType()
    // knowing the database type, ask the appropriate credentials
        .then(
            (onFulfilled) => {
                selectedDatabase = onFulfilled;
                databaseDriver = getDatabaseDriver(selectedDatabase);
                return prompt.askCredentials(selectedDatabase);
            },
            (onRejected) => {
                errors.askDatabaseType = onRejected;
                console.log('Promise rejected on prompt/askDatabaseType');
                console.log(errors);
            }
        )
    // having the credentials, connect to the database and get all the tables
        .then(
            (onFulfilled) => {
                credentials = onFulfilled;
                credentials.databaseType = selectedDatabase;
                return databaseDriver.getTables(credentials);
            },
            (onRejected) => {
                errors.askCredentials = onRejected;
                console.log('Promise rejected on prompt/askCredentials');
                console.log(errors);
            }
        )
    // having all the database tables,
    // get their description (fields, constraints, keys, etc)
        .then(
            (onFulfilled) => {
                tables = onFulfilled;
                console.log(tables);
            }
        );
};

start();
