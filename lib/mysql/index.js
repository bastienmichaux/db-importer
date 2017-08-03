const mysql = require('mysql');
const lodash = require('lodash/collection');

const cst = require('./constants');


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

    /**
     * I need to proxy connection.connect into a promise to be able to handle error at the right moment
     * and thus catch it before doing further operations
     *
     * I need to do it manually because it doesn't respect nodebacks, it calls error handler on success with an
     * error of value null.
     */
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

const entityCandidates = session => new Promise((resolve, reject) => {
    session.connection.query(cst.queries.entityCandidates, { database: session.database }, (error, results) => {
        if (error) return reject(error);
        session.entityCandidates = lodash.map(results, cst.fields.entityCandidates);
        console.log(session);
        return resolve();
    });
});

module.exports = {
    connect,
    close,
    entityCandidates
};
