const inquirer = require('inquirer');
const lodash = require('lodash');
const mysql = require('mysql');

const cst = require('./constants.js');

// use theses queries when connected to the database 'information_schema'
const queries = {
    manyToMany: (obj) => {

    },
    manyToOne: (obj) => {

    },
    oneToOne: (obj) => {

    },
    tables: (obj) => {

    }
}

const askMysqlCredentials = () => {
    const questions = [
        {
            type: 'input',
            name: 'host',
            message: 'Host address:',
        },
        {
            type: 'input',
            name: 'user',
            message: 'User name:',
        },
        {
            type: 'input',
            name: 'database',
            message: 'Database name:',
        },
        {
            type: 'password',
            name: 'password',
            message: 'Password',
        }
    ];

    return inquirer.prompt(questions)
    .then(
        answers => answers,
        onError => onError // TODO: right way to handle promise rejection in this case ?
    );
};

/**
 * Validate the parameters needed
 * in order to get a connection to a MySQL server
 * TODO: error messages
 */
const validateMysqlCredentials = (cred) => {
    if (typeof cred.host !== 'string') {
        console.log(`validateMysqlCredentials: wrong host '${cred.host}'`);
        return new TypeError;
    }
    if (typeof cred.user !== 'string') {
        console.log(`validateMysqlCredentials: wrong user '${cred.user}'`);
        return new TypeError;
    }
    if (typeof cred.password !== 'string') {
        console.log('validateMysqlCredentials: wrong password');
        return new TypeError;
    }
    if (typeof cred.database !== 'string') {
        console.log(`validateMysqlCredentials: wrong database ${cred.database}`);
        return new TypeError;
    }
    return true;
};

/**
 * return a connection object to the database,
 * this object will establish the connection when the .connect() method is called
 */
const getMysqlConnectionObject = credentials => {
	if (validateMysqlCredentials(credentials) !== true) {
		throw new Error('Wrong MySQL credentials');
	}

	let connection = mysql.createConnection({
		host     : credentials.host,
		user     : credentials.user,
		password : credentials.password,
		database : credentials.database
	});

	return connection;
};

const getMysqlTables = (credentials) => {

    if (validateMysqlCredentials(credentials) !== true) {
        throw new Error('Wrong MySQL credentials');
    }

    return new Promise((resolve, reject) => {
        
        let result = null;
        let resultKey = `Tables_in_${credentials.database}`;
        let tables = [];

        let connection = mysql.createConnection({
            host     : credentials.host,
            user     : credentials.user,
            password : credentials.password,
            database : credentials.database
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
        }
        catch (err) {
            reject(err);
        }
    });
};


module.exports = {
	askCredentials:      askMysqlCredentials,
	getConnectionObject: getMysqlConnectionObject,
    getTables:           getMysqlTables,
	validateCredentials: validateMysqlCredentials
};
