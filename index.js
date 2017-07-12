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
    else {
        throw new Error(`No driver for db '${databaseType}'`);
    }
};


const testConnection = (connectionObject) => {
    connectionObject.query('SELECT 1+1 AS solution', function (error, results, fields) {
        if (error) {
            throw error;
        }
        return results;
    });
};

const start = () => {
    let connection = null;
    let databaseDriver = null;
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
    // having the credentials, connect to the database
    .then(
        (onFulfilled) => {
            credentials = onFulfilled;
            connection = databaseDriver.getConnectionObject(credentials);
            console.log(connection);
            queryResult = x(connection);
        },
        (onRejected) => {
            errors.askCredentials = onRejected;
            console.log('Promise rejected on prompt/askCredentials');
            console.log(errors);
        }
    );
};

start();
