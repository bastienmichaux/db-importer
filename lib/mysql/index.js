const mysql = require('mysql');
const lodash = require('lodash');

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
    const promisedQuery = (store, query, parameters) => new Promise((resolve, reject) => {
        // all the queries concern the same database
        const prefilledParameters = Object.assign({ database: session.database }, parameters);

        session.connection.query(query, prefilledParameters, (error, results) => {
            if (error) return reject(error);
            session.results[store] = lodash.map(results, cst.fields.tableName);
            return resolve();
        });
    });

    return promisedQuery('jhipster', cst.queries.jhipster)
        .then(() => promisedQuery('liquibase', cst.queries.liquibase))
        .then(() => {
            const filter = session.results.jhipster.concat(session.results.liquibase);
            return promisedQuery('twoTypeJunction', cst.queries.twoTypeJunction, { filter });
        })
        .then(() => {
            const filter = lodash.flatten(lodash.values(session.results));
            return promisedQuery('entityCandidates', cst.queries.tables, { filter });
        });
};

module.exports = {
    connect,
    close,
    entityCandidates
};
