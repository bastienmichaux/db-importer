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
const lodash = require('lodash');

const db = require('../db-constants');
const cst = require('./constants');


/**
 * Escape data in order to avoid SQL injection attacks.
 * Allow us to use parameters such as :param and
 * call them with connection.query(queryString, {param: paramValue})
 * 
 * @param {string} query - The string query where parameters are replaced by actual values
 * @param {Object} values - Object containing parameters in a { key: value } manner
 * @returns {string} The query with actual and escaped parameter values
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
    const promisedQuery = (store, query, queryParameters) => new Promise((resolve, reject) => {
        // all the queries concern the same schema
        const prefilledParameters = Object.assign({ schema: session.schema }, queryParameters);

        session.connection.query(query, prefilledParameters, (error, results) => {
            if (error) { 
                return reject(error);
            }
            // store results as an array of strings
            session.results[store] = lodash.map(results, cst.fields.tableName);
            return resolve();
        });
    });

    return promisedQuery(db.fields.jhipster, cst.queries.jhipster)
        .then(() => promisedQuery(db.fields.liquibase, cst.queries.liquibase))
        .then(() => {
            const filter = session.results.jhipster.concat(session.results.liquibase);
            return promisedQuery(db.fields.twoTypeJunction, cst.queries.twoTypeJunction, { filter });
        })
        .then(() => {
            const filter = lodash.flatten(lodash.values(session.results));
            return promisedQuery(db.fields.tables, cst.queries.tables, { filter });
        });
};


module.exports = {
    connect,
    close,
    entityCandidates
};
