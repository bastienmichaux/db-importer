/**
 * Pass SQL queries to a database,
 * convert the result to JSON files
 */

const base = require('./base.js');
const connect = require('./connect.js');
const cst = require('./constants.js');
const util = require('./base.js');

/**
 * Return the tables of a given MySQL database, as an array of strings
 * We expect to receive as result an array having this structure :
 * [ [ 1 RowPacket per table], [ 1 FieldPacket per table] ]
 */
const getMysqlTableNames = (credentials) => {
    if (!util.validateMysqlCredentials) {
        throw new Error(); // TODO: error message
    }

    const query = 'show tables;';
    const connection = connect.getMysqlConnectionObject(credentials);
    const tables = [];
    const prop = `Tables_in_${credentials.database}`;

    return connection.raw(query)
    .then((queryOutput) => {
        if (Array.isArray(queryOutput)) {
            queryOutput.forEach((elem) => {
                if (Array.isArray(elem)) {
                    elem.forEach((_elem) => {
                        tables.push(_elem[prop]);
                    });
                }
            });
        }

        // print the result to a file
        tables.forEach((table) => {
            console.log(table);
        });
    })
    .catch((err) => {
        console.error(err);
    });
};

/**
 * Return the tables of a database, as an array of strings
 */
const getTableNames = (credentials) => {
    const db = credentials.databaseType;

    // TODO: move database validation to base.validateCredentials ?
    if (!base.validateDatabaseType(db)) {
        throw new Error(); // TODO: error message
    }

    if (db === cst.databaseTypes.mysql) {
        return getMysqlTableNames(credentials);
    }

    // if no database matches the input parameter
    throw new Error(`database type '${db}'' not supported yet!`);
};

module.exports = {
    getMysqlTableNames,
    getTableNames,
};
