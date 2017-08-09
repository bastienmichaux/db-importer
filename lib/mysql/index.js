const mysql = require('mysql');
const lodash = require('lodash');

const db = require('../db-constants');
const cst = require('./constants');

/**
 * I need to proxy some mysql methods into promises to be able to wait their execution and handle any error thrown.
 * If I don't, I can't catch it before doing further operations
 *
 * I need to do it manually because it doesn't respect node conventions ; the callback is always called, with an
 * error of null or undefined value in case of success.
 */

/**
 * allow us to use parameters such as :param and call it with connection.query(queryString, {param: paramValue}
 *
 * @param query the string query were parameters are replaced by actual values
 * @param values object containing parameters in a { key: value } manner
 * @returns the query with actual and escaped parameter values.
 */
const queryFormat = (query, values) => {
    if (!values) return query;
    return query.replace(/:(\w+)/g, (txt, key) => {
        if (values[key]) {
            return mysql.escape(values[key]);
        }
        throw Error(`${txt} is not a valid parameter`);
    });
};

const connect = (session) => {
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
            if (error) return reject(error);
            return resolve();
        });
    });
};

const close = session => new Promise((resolve, reject) => {
    session.end((error) => {
        if (error) return reject(error);
        return resolve();
    });
});

const entityCandidates = (session) => {
    /**
     * promised version of session.query
     *
     * @param store the session.results property it will use to store results.
     * @param query the query it must run
     * @param parameters the query's parameters
     */
    const promisedQuery = (store, query, parameters) => new Promise((resolve, reject) => {
        // all the queries concern the same schema
        const prefilledParameters = Object.assign({ schema: session.schema }, parameters);

        session.connection.query(query, prefilledParameters, (error, results) => {
            if (error) return reject(error);
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
