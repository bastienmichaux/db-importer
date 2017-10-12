
/**
 * @file Core functions for connection and processing of data
 * retrieved from a MYSQL server
 *
 * We promisify some mysql methods in order to be able to wait for their execution
 * and handle any error thrown.
 * If we don't, we can't catch the errors before doing further operations.
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
 * @param etl - the function is called against query results before storing them
 */
const promisedQuery = (session, query, store, etl) => new Promise((resolve, reject) => {
    // pass the SQL query
    session.connection.query(query, (error, results) => {
        if (error) {
            return reject(error);
        }
        session.results[store] = etl ? etl(results) : results;

        return resolve(session.results[store]);
    });
});

/**
 * Open a mysql connection, in a promisified way.
 *
 * @param {Object} session - Object containing the necessary fields to connect to a database : {dbms, host, port, user, password}
 * @returns {Promise} Whether or not the connection to the MYSQL server succeeded
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
 * Close a mysql connection, in a promisified way
 *
 * @param session - The current client's MYSQL session
 * @returns {Promise} Whether or not the connection closed
 */
const close = session => new Promise((resolve, reject) => {
    session.end((error) => {
        if (error) {
            return reject(error);
        }
        return resolve();
    });
});


/**
 * From a connection to a mysql database,
 * return tables as a list
 *
 * @param session - The current client's MYSQL session
 * @returns {Promise}
 */
const entitiesTables = (session) => {
    const jhipsterQuery = queries.jhipster(session.schema);
    const liquibaseQuery = queries.liquibase(session.schema);

    // transform array of RawDataPacket into an array of literal strings
    const etl = tablesArray => tablesArray.map(tableObject => tableObject.TABLE_NAME);

    // value included by previous queries must be excluded by following queries to avoid duplicates
    let filter = [];

    return promisedQuery(session, jhipsterQuery, db.FIELDS.jhipster, etl)
        .then((jhipster) => {
            filter = filter.concat(jhipster);
            return promisedQuery(session, liquibaseQuery, db.FIELDS.liquibase, etl);
        })
        .then((liquibase) => {
            // filter tables we don't want to query
            filter = filter.concat(liquibase);
            const manyToManyTablesOnlyQuery = queries.manyToManyTablesOnly(session.schema, filter);

            return promisedQuery(session, manyToManyTablesOnlyQuery, db.FIELDS.manyToManyTablesOnly, etl);
        })
        .then((manyToManyTablesOnly) => {
            filter = filter.concat(manyToManyTablesOnly);
            const tablesQuery = queries.tables(session.schema, filter);

            return promisedQuery(session, tablesQuery, db.FIELDS.tables, etl);
        });
};

const manyToManyJunctions = (session) => {
    const schema = mysql.escape(session.schema);
    const tables = mysql.escape(session.entities);

    const manyToManyQuery = queries.manyToManyJunction(schema, tables);

    return promisedQuery(session, manyToManyQuery, db.FIELDS.manyToManyJunctions)
        .then(() => session);
};

/**
 * Pass a query to get the data needed for mapping the columns,
 * then organize the data (organizeColumns) and update the session.entities object with them.
 *
 * @param {Object} session - the current user session
 */
const entityColumns = (session) => {
    const columnsSelectionQuery = queries.columns(session.schema, session.entities);

    /* Each RawDataPacket has two fields, first one TABLE_NAME we keep
       Second one is the result of a GROUP_CONCAT we transform into a JS ARRAY
     */
    const columnsByTableToJS = columnsByTable => ({
        tableName: columnsByTable.TABLE_NAME,
        columns: JSON.parse(`[${columnsByTable.COLUMNS}]`)
    });

    const etl = columnsByTableArray => columnsByTableArray.map(columnsByTableToJS);

    return promisedQuery(session, columnsSelectionQuery, db.FIELDS.columnsByTable, etl)
        .then(() => session);
};


module.exports = {
    connect,
    close,
    entitiesTables,
    manyToManyJunctions,
    entityColumns
};
