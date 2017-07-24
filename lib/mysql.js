const mysql = require('mysql');


/**
 * Validate the parameters needed
 * in order to get a connection to a MySQL server
 * TODO: error messages
 */
const validateMysqlCredentials = (cred) => {
    if (typeof cred.host !== 'string') {
        throw new TypeError(`validateMysqlCredentials: wrong host '${cred.host}'`);
    }
    if (typeof cred.user !== 'string') {
        throw new TypeError(`validateMysqlCredentials: wrong user '${cred.user}'`);
    }
    if (typeof cred.password !== 'string') {
        throw new TypeError('validateMysqlCredentials: wrong password');
    }
    if (typeof cred.database !== 'string') {
        throw new TypeError(`validateMysqlCredentials: wrong database name : '${cred.database}'`);
    }
    if (cred.databaseType !== 'mysql') {
        throw new TypeError(`validateMysqlCredentials: database type '${cred.database}' unknown`);
    }
    return true;
};

/**
 * return a connection object to the database,
 * this object will establish the connection when the .connect() method is called
 */
const getMysqlConnectionObject = (credentials) => {
    if (validateMysqlCredentials(credentials) !== true) {
        throw new Error('Wrong MySQL credentials');
    }

    const connection = mysql.createConnection({
        host: credentials.host,
        user: credentials.user,
        password: credentials.password,
        database: credentials.database
    });

    return connection;
};

const getMysqlTables = (credentials) => {
    if (validateMysqlCredentials(credentials) !== true) {
        throw new Error('Wrong MySQL credentials');
    }

    return new Promise((resolve, reject) => {
        const resultKey = `Tables_in_${credentials.database}`;
        const tables = [];

        const connection = mysql.createConnection({
            host: credentials.host,
            user: credentials.user,
            password: credentials.password,
            database: credentials.database,
            databaseType: 'mysql'
        });

        try {
            connection.connect();

            connection.on('error', (err) => {
                console.log(err);
            });

            connection.query('SHOW TABLES;', (error, results, fields) => {
                if (error) {
                    throw error;
                }

                results.forEach((res, index) => {
                    if (res.constructor.name === 'RowDataPacket') {
                        tables.push(res[resultKey]);
                    }
                });

                resolve(tables);
            });

            connection.end();
        } catch (err) {
            reject(err);
        }
    });
};


module.exports = {
    getConnectionObject: getMysqlConnectionObject,
    getTables: getMysqlTables,
    validateCredentials: validateMysqlCredentials
};
