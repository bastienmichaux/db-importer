/**
 * Pass SQL queries to a database,
 * convert the result to JSON files
 */

const base = require('./base.js');
const connect = require('./connect.js');
const cst = require('./constants.js');
const util = require('./base.js');

/**
 * Return the tables of a given MySQL database, as an array of strings.
 * We expect to receive the result as an array having this structure :
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
        console.log(`Found ${tables.length} tables`);
        return tables;
    })
    .catch((err) => {
        console.error(err);
    });
};

/**
 * Return the structure of a MySQL table as an object
 * For the reason why we do this complex process of the query output,
 * See importer/getMysqlTableNames
 */
const getMysqlTableStructure = (credentials, tableName) => {
    if (!util.validateMysqlCredentials) {
        throw new Error(); // TODO: error message
    }

    const query = `describe ${tableName};`;
    const connection = connect.getMysqlConnectionObject(credentials);
    const result = {};

    return connection.raw(query)
    .then((queryOutput) => {
        if (Array.isArray(queryOutput)) {
            queryOutput.forEach((elem) => {
                if (Array.isArray(elem)) {
                    elem.forEach((_elem) => {
                        if (_elem.constructor.name === 'RowDataPacket') {
                            const field = _elem.Field;
                            result[field] = {
                                type: _elem.Type,
                                null: _elem.Null,
                                key: _elem.Key,
                                default: _elem.Default,
                                extra: _elem.Extra
                            };
                        }
                    });
                }
            });
        }
        return result;
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

const getTableStructure = (credentials, tableName) => {
    const databaseType = credentials.databaseType;

    if (databaseType === cst.databaseTypes.mysql) {
        return getMysqlTableStructure(credentials, tableName);
    }
    // if no database matches the input parameter
    throw new Error(`database ${databaseType} not supported yet!`);
};

module.exports = {
    getMysqlTableNames,
    getMysqlTableStructure,
    getTableNames,
    getTableStructure,
};
