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

const connect = (onFulfilled) => {
    onFulfilled.connection = mysql.createConnection({
        host: onFulfilled.host,
        port: onFulfilled.port,
        user: onFulfilled.user,
        password: onFulfilled.password,
        database: cst.metaDatabase,
        queryFormat
    });


    console.log('db-commons connecting');
    // connection.connect((error) => {
    //     if (error) console.log(`error connecting : ${error}`);
    // });

    function connectAsync() {
        return new Promise((resolve, reject) => {
            onFulfilled.connection.connect((error) => {
                if (error) return reject(error);
                resolve();
            });
        });
    }

    function pingAsync() {
        return new Promise((resolve, reject) => {
            onFulfilled.connection.ping((error) => {
                if (error) return reject(error);
                console.log('Server responded to ping');
                resolve();
            });
        });
    }

    return connectAsync()
        .then(pingAsync)
        .then(() => {
            console.log('db-commons returning the connection');
            return onFulfilled;
        });
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
