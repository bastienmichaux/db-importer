const inquirer = require('inquirer');
const lodash = require('lodash');
const mysql = require('mysql');

const cst = require('./constants.js');


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

const testConnection = (credentials) => {
    if (validateMysqlCredentials(credentials) !== true) {
        throw new Error('Wrong MySQL credentials');
    }

    let result = null;

    let connection = mysql.createConnection({
        host     : credentials.host,
        user     : credentials.user,
        password : credentials.password,
        database : credentials.database
    });

    try {
        connection.connect();
        connection.query('SHOW TABLES;', (error, results, fields) => {
            if (error) {
                throw error;
            }
            result = results;
            console.log('Type of result :' + typeof result);
            console.log('result constructor :' + result.constructor.name);
            console.log(results);
        });  
    }
    catch (err) {
        console.log('Error while trying to connect to the db');
        console.log(err);
    }
    
    connection.end();
};


module.exports = {
	askCredentials:      askMysqlCredentials,
	getConnectionObject: getMysqlConnectionObject,
    testConnection,
	validateCredentials: validateMysqlCredentials
};
