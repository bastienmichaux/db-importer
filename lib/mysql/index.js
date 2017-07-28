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

const connect = (credentials) => {
    const connection = mysql.createConnection({
        host: credentials.host,
        port: credentials.port,
        user: credentials.user,
        password: credentials.password,
        database: cst.metaDatabase,
        queryFormat
    });

    connection.connect((error) => {
        if (error) console.log(`error connecting : ${error}`);
    });

    return connection;
};

const close = (connection) => {
    connection.end((error) => {
        if (error) console.log(`error ending connection :  ${error}`);
    });
};

module.exports = {
    connect,
    close
};
