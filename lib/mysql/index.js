
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
const queries = require('./queries.json');


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

    return promisedQuery(db.fields.jhipster, queries.jhipster)
        .then(() => promisedQuery(db.fields.liquibase, queries.liquibase))
        .then(() => {
            let filter = session.results.jhipster.concat(session.results.liquibase);

            // if array is empty, don't pass a filter at all in the query,
            // because 'NOT IN ()' causes a parse error in MySQL
            // and pass an empty string 'NOT IN (" ")' could cause issues
            // this is a temporary, dirty fix
            if (filter.length === 0) {
                filter = ['DUMMY_VALUE_DO_NOT_LOOK_AFTER_ME'];
            }

            return promisedQuery(db.fields.twoTypeJunction, queries.twoTypeJunction, { filter });
        })
        .then(() => {
            let filter = lodash.flatten(lodash.values(session.results));

            // if array is empty, don't pass a filter at all in the query,
            // because 'NOT IN ()' causes a parse error in MySQL
            // and pass an empty string 'NOT IN (" ")' could cause issues
            // this is a temporary, dirty fix
            if (filter.length === 0) {
                filter = ['DUMMY_VALUE_DO_NOT_LOOK_AFTER_ME'];
            }

            return promisedQuery(db.fields.tables, queries.tables, { filter });
        });
};


// query most important informations from INFORMATION_SCHEMA.COLUMNS
// for a given database and tables inside this database
const columnsQuery = (schemaName, tables) => {
    // tranform the array of tables into a string
    // where quotation marks are escaped
    const quotedTables = mysql.escape(tables);

    return `
        select table_schema, table_name, column_name, ordinal_position, column_default, is_nullable, data_type, character_maximum_length, character_octet_length, numeric_precision, numeric_scale, datetime_precision
        from information_schema.columns
        where table_schema like '${schemaName}'
        and table_name in (${quotedTables});
    `;
};


const createEntities = (session) => {
    console.log('Yo dawg');
    /*
    // only the 'jhi' prefixed tables, an array of strings
    const jhiTables = session.results.jhipster;

    // only the Liquibase tables, an array of strings
    const liquibaseTables = session.results.liquibase;

    // only the 2-tpes junction tables, an array of strings
    const twoTypeJunctionTables = session.results.twoTypeJunction;

    // the other, simple tables
    const simpleTables = session.results.tables;
    */
    // all the tables we need to look after, an array of strings
    const tables = session.entities;

    // schema name
    const schemaName = session.schema;

    // the query we pass
    const query = columnsQuery(schemaName, tables);

    const promisedQuery = myQuery => new Promise((resolve, reject) => {
        session.connection.query(myQuery, (error, results) => {
            if (error) {
                return reject(error);
            }

            // @TODO: write the JSON entities
            console.log(results);

            return resolve(session);
        });
    });

    return promisedQuery(query);
};


module.exports = {
    connect,
    close,
    createEntities,
    entityCandidates
};
