
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

    // all the tables we need to look after
    // session.entities is an array of strings that we transform into a single string
    // where quotation marks are escaped using mysql.escape()
    const tables = mysql.escape(session.entities);
    // the query we pass
    const query = queries.columns(schemaName, tables);

    return promisedQuery(query);
};

/* return the columns for the selected tables */
const entityCandidatesColumns = (session) => {
    const promisedQuery = (query) => new Promise((resolve, reject) => {
        // store for all the columns of the selected tables
        const tableColumns = {};

        // initialise the object keys, one key for each selected table
        session.entities.forEach(entity => {
            tableColumns[entity] = [];
        }); 

        // pass the SQL query        
        session.connection.query(query, (error, results) => {
            if (error) {
                return reject(error);
            }
            // store selected columns as an array of strings
            results.forEach(el => {
                tableColumns[el.table_name].push(el.column_name);
            });

            // update the session
            session.columns = tableColumns;

            return resolve(session);
        });
    });

    const escapedSchema = mysql.escape(session.schema);
    const escapedTables = mysql.escape(session.entities);
    const columnsSelectionQuery = queries.allColumns(escapedSchema, escapedTables);

    return promisedQuery(columnsSelectionQuery);
};


module.exports = {
    connect,
    close,
    createEntities,
    entityCandidates,
    entityCandidatesColumns,
};
