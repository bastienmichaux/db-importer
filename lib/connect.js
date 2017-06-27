/**
 * Connection to a database using the Knex library
 */

/* eslint-disable global-require */

const base = require('./base.js');
const cst = require('./constants.js');

/**
 * Connection object for a MySQL database
 */
const getMysqlConnectionObject = credentials => require('knex')({
    client: 'mysql',
    connection: {
        host: credentials.host,
        user: credentials.username,
        password: credentials.password,
        database: credentials.database
    },
    debug: true
});

const getConnectionObject = (credentials) => {
    const db = credentials.databaseType;

    // TODO: move database validation to base.validateCredentials ?
    if (!base.validateDatabaseType(db)) {
        throw new Error(); // TODO: error message
    }

    if (db === cst.databaseTypes.mysql) {
        return getMysqlConnectionObject(credentials);
    }

    // if no database matches the input parameter
    throw new Error(`database type '${db}'' not supported yet!`);
};

module.exports = {
    getConnectionObject,
    getMysqlConnectionObject,
};
