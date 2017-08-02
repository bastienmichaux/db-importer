const mysql = require('mysql');
const cst = require('constants');


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

const close = (session) => {
    const endAsync = () => new Promise((resolve, reject) => {
        session.end((error) => {
            if (error) return reject(error);
            return resolve();
        });
    });

    return endAsync();
};

module.exports = {
    connect,
    close
};
