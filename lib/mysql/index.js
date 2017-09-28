
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

const lodash = require('lodash');
const mysql = require('mysql');

const cst = require('./constants');
const db = require('../db-constants');
const queries = require('./queries');


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
const entityCandidates = (session) => {
    /**
     * promisified version of session.query
     *
     * @param store - the session.results property it will use to store results.
     * @param query - the query it must run
     * @returns {Promise}
     */
    const promisedQuery = (store, query) => new Promise((resolve, reject) => {
        // pass the SQL query
        session.connection.query(query, (error, results) => {
            if (error) {
                return reject(error);
            }
            // store results as an array of strings
            session.results[store] = lodash.map(results, cst.fields.tableName);
            return resolve();
        });
    });

    const schema = mysql.escape(session.schema);
    const jhipsterQuery = queries.jhipster(schema);
    const liquibaseQuery = queries.liquibase(schema);

    return promisedQuery(db.FIELDS.jhipster, jhipsterQuery)
        .then(() => promisedQuery(db.FIELDS.liquibase, liquibaseQuery))
        .then(() => {
            // filter tables we don't want to query
            const filter = mysql.escape(lodash.flatten(lodash.values(session.results)));
            const twoTypeJunctionQuery = queries.twoTypeJunction(schema, filter);

            return promisedQuery(db.FIELDS.twoTypeJunction, twoTypeJunctionQuery);
        })
        .then(() => {
            // filter tables we don't want to query
            const filter = mysql.escape(lodash.flatten(lodash.values(session.results)));
            const tablesQuery = queries.tables(schema, filter);

            return promisedQuery(db.FIELDS.tables, tablesQuery);
        });
};


const createEntities = (session) => {
    const promisedQuery = myQuery => new Promise((resolve, reject) => {
        session.connection.query(myQuery, (error, results) => {
            if (error) {
                return reject(error);
            }
            // @TODO: write the JSON entities
            return resolve(session);
        });
    });

    // schema name
    const schemaName = mysql.escape(session.schema);

    // the array of columns we look after
    const columns = mysql.escape(session.selectedColumns);

    // the query we pass
    const query = queries.columns(schemaName, columns);

    return promisedQuery(query);
};


/**
 * Use the raw query results of mysqljs to create an object representing the database structure.
 * This function returns an object with as many properties as there are tables.
 * Each table is an array of objects, each one of these objects represents a column.
 *
 * @param { Object[] } queryResults - an array of RowDataPacket objects, the output of queries.allColumns (see .entityCandidatesColumns)
 * @returns { Object } the returned object has this structure : { table_name: { column_name: { column properties } } }
 */
const organizeColumns = (queryResults) => {
    const result = {};

    // modify this loop to add more column values
    queryResults.forEach((queryResult, index) => {
        const tableName = queryResult.table_name;
        const columnName = queryResult.column_name;
        const ordinalPosition = queryResult.ordinal_position;
        const columnType = queryResult.column_type;

        const columnProperties = {
            ordinalPosition,
            columnType
        };

        // initialise result.tableName if it doesn't exist yet
        result[tableName] = result[tableName] || {};
        result[tableName][columnName] = columnProperties;
    });

    return result;
};


/**
 * Pass a query to get the data needed for mapping the columns,
 * then organize the data (organizeColumns) and update the session.entities object with them.
 *
 * @param {Object} session - the current user session
 */
const entityCandidatesColumns = (session) => {
    const promisedQuery = query => new Promise((resolve, reject) => {
        const tables = session.entities;

        // pass the SQL query        
        session.connection.query(query, (error, results) => {
            if (error) {
                return reject(error);
            }

            // update the session entities
            session.entities = organizeColumns(results, tables);

            return resolve(session);
        });
    });

    const schema = mysql.escape(session.schema);
    const tables = mysql.escape(session.entities);
    const columnsSelectionQuery = queries.allColumns(schema, tables);

    return promisedQuery(columnsSelectionQuery);
};


module.exports = {
    connect,
    close,
    createEntities,
    entityCandidates,
    entityCandidatesColumns,
    organizeColumns
};
