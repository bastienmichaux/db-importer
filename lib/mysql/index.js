
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

const cst = require('./constants.js');
const db = require('../db-constants.js');
const queries = require('./queries.js');


/**
 * Escape data in order to avoid SQL injection attacks.
 * Allow us to use parameters such as :param and
 * call them with connection.query(queryString, {param: paramValue})
 *
 * @param {string} query - The string query where parameters are replaced by actual values
 * @param {Object} values - Object containing parameters in a { key: value } manner
 * @returns {string} The query with escaped parameter values
 * @throws {Error} Query must have valid parameters
 */
const queryFormat = (query, values) => {
    if (!values) {
        return query;
    }
    return query.replace(/:(\w+)/g, (txt, key) => {
        if (values[key]) {
            return mysql.escape(values[key]);
        }
        throw Error(`${txt} is not a valid parameter`);
    });
};


/**
 * Open a mysql connection, in a promisified way.
 *
 * @param {Object} session - Object containing the necessary fields to connect to a database : {dbms, host, port, user, password}
 * @returns {Promise.(void|error)} Whether or not the connection to the MYSQL server succeeded
 */
const connect = (session) => {
    // the connection credentials + the SQL query (escaped)
    session.connection = mysql.createConnection({
        host: session.host,
        port: session.port,
        user: session.user,
        password: session.password,
        database: cst.metaDatabase,
        queryFormat
    });

    return new Promise((resolve, reject) => {
        session.connection.connect((error) => {
            if (error) {
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
 * @returns {Promise.(void|error)} Whether or not the connection closed
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
 * @returns {Promise.(void|error)}
const log = require('../log.js');
 */
const entityCandidates = (session) => {
    /**
     * promisified version of session.query
     *
     * @param store - the session.results property it will use to store results.
     * @param query - the query it must run
     * @param queryParameters - the query's parameters
     * @returns {Promise.(void|error)}
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

    return promisedQuery(db.fields.jhipster, jhipsterQuery)
        .then(() => promisedQuery(db.fields.liquibase, liquibaseQuery))
        .then(() => {
            // filter tables we don't want to query
            const filter = mysql.escape(lodash.flatten(lodash.values(session.results)));
            const twoTypeJunctionQuery = queries.twoTypeJunction(schema, filter);

            return promisedQuery(db.fields.twoTypeJunction, twoTypeJunctionQuery);
        })
        .then(() => {
            // filter tables we don't want to query
            const filter = mysql.escape(lodash.flatten(lodash.values(session.results)));
            const tablesQuery = queries.tables(schema, filter);

            return promisedQuery(db.fields.tables, tablesQuery);
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


module.exports = {
    connect,
    close,
    createEntities,
    entityCandidates
};
