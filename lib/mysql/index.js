
/**
 * @file Core functions for connection and retrieve data from a MySql client
 *
 * We promisify asynchronous mysql methods in order to be able to wait for their execution and get their result
 * and handle any error thrown.
 *
 * We need to do it manually because mysqljs doesn't respect node conventions:
 * the callback is always called, with an error of null or undefined value in case of success.
 */

const mysql = require('mysql');

const cst = require('./constants');
const db = require('../db-constants');
const queries = require('./queries');


/**
 * Wrapper around session.connection.query to promisify it.
 * Use the session to run the query and store the results in the session object
 *
 * @param session - the session containing the connection and the results
 * @param query - the SQL query to run against the database
 * @param store - the key under which the query results will be store into session.results (i.e.: session.results[store])
 * @param formatter - the function is called against each item of the query result array before storing it
 */
const promisedQuery = (session, query, store, formatter) => new Promise((resolve, reject) => {
    // pass the SQL query
    session.connection.query(query, (error, results) => {
        if (error) {
            return reject(error);
        }
        session.results[store] = formatter ? results.map(formatter) : results;

        return resolve(session.results[store]);
    });
});

/**
 * Open a mysql connection.
 *
 * @param {{dbms, host, port, user, password}} session - Object containing the necessary fields to connect to a database
 * @returns {Promise} Resolves if the connection succeeded, rejects otherwise
 */
const connect = (session) => {
    // the connection credentials + the SQL query (escaped)
    session.connection = mysql.createConnection({
        host: session.host,
        port: session.port,
        user: session.user,
        password: session.password,
        database: cst.metaDatabase
    });

    return new Promise((resolve, reject) => {
        session.connection.connect((error) => {
            if (error) {
                error.brokenSession = session;
                return reject(error);
            }
            return resolve();
        });
    });
};


/**
 * Close a mysql connection.
 *
 * @param {{connection}} session - The MySql session containing the connection to close
 * @returns {Promise} Resolves if the connection closed successfully, rejects otherwise
 */
const close = session => new Promise((resolve, reject) => {
    session.connection.end((error) => {
        if (error) {
            return reject(error);
        }
        return resolve();
    });
});


/**
 * Query all tables and divide them into four categories : jhipster, liquibase, junction and normal tables
 *
 * @param {{schema, connection, results: {}}} session - The current client's MYSQL session
 * @returns {Promise}
 */
const entitiesTables = (session) => {
    const jhipsterQuery = queries.jhipster(session.schema);
    const liquibaseQuery = queries.liquibase(session.schema);

    // We want an array of string ['table1', 'table2', ...]
    const formatter = tableObject => tableObject.TABLE_NAME;

    // value included by previous queries must be excluded by following queries to avoid duplicates
    let filter = [];

    return promisedQuery(session, jhipsterQuery, db.FIELDS.jhipster, formatter)
        .then((jhipster) => {
            filter = filter.concat(jhipster);
            return promisedQuery(session, liquibaseQuery, db.FIELDS.liquibase, formatter);
        })
        .then((liquibase) => {
            // filter tables we don't want to query
            filter = filter.concat(liquibase);
            const manyToManyTablesOnlyQuery = queries.manyToManyTablesOnly(session.schema, filter);

            return promisedQuery(session, manyToManyTablesOnlyQuery, db.FIELDS.manyToManyTablesOnly, formatter);
        })
        .then((manyToManyTablesOnly) => {
            filter = filter.concat(manyToManyTablesOnly);
            const tablesQuery = queries.tables(session.schema, filter);

            return promisedQuery(session, tablesQuery, db.FIELDS.tables, formatter);
        });
};

/**
 * Query junction tables which link two tables from session.entities (this excludes junction of three or more tables)
 * The junction table must not be used as an entity (be absent of session.entities) and the two tables it link must be
 * used as entities (present in session.entities)
 *
 * @param {{schema, entities}} session - the MySql session containing the schema and entities which we must query the relationships about
 * @returns {Promise} resolves the received session after storing his result under session.results.manyToManyJunctions
 */
const manyToManyJunctions = (session) => {
    const manyToManyQuery = queries.manyToManyJunction(session.schema, session.entities);

    /**
     * rename keys of the query result and parse JSON
     *
     * @param {{JUNCTION_TABLE, REFERENCES}} junction
     * junction is a RawDataPacket containing two fields :
     * - {string} JUNCTION_TABLE name of the junction table
     * - {JSON} REFERENCES array of two formatted as {key, keyType, referencedTable, referencedColumnName}
     * So you have the key from the junction table and the table referenced with the column used.
     */
    const formatter = junction => ({
        junctionTable: junction.JUNCTION_TABLE,
        references: JSON.parse(junction.REFERENCES)
    });

    return promisedQuery(session, manyToManyQuery, db.FIELDS.manyToManyJunctions, formatter)
        .then(() => session);
};

/**
 * Query columns of the tables used as entities (present in session.entities) and group them by table (GROUP_CONCAT)
 *
 * @param {{schema, entities}} session - the MySql session containing the schema and tables which we must query the columns about
 * @returns {Promise} resolves the received session after storing his result under session.results.columnsByTable
 */
const entityColumns = (session) => {
    const columnsSelectionQuery = queries.columns(session.schema, session.entities);

    /**
     * Each RawDataPacket has two fields:
     * - {string} TABLE_NAME the table which owns the columns
     * - {JSON} COLUMNS formatted as [{name, type}, ...]
     */
    const formatter = columnsByTable => ({
        tableName: columnsByTable.TABLE_NAME,
        columns: JSON.parse(columnsByTable.COLUMNS)
    });

    return promisedQuery(session, columnsSelectionQuery, db.FIELDS.columnsByTable, formatter)
        .then(() => session);
};


module.exports = {
    connect,
    close,
    entitiesTables,
    manyToManyJunctions,
    entityColumns
};
