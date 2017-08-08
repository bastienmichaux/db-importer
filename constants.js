const lodash = require('lodash/object');

const validation = require('./lib/validation');
const mysql = require('./lib/mysql/index');
const packageInfo = require('./package.json');

const toArray = lodash.values;
const pickProperty = lodash.mapValues;


const dbmsList = {
    mysql: {
        name: 'mysql',
        defaultPort: 3306,
        driver: mysql
    }
};

const inquiries = {
    dbms: {
        type: 'list',
        name: 'dbms',
        message: 'DBMS:',
        choices: toArray(pickProperty(dbmsList, 'name')),
        default: dbmsList.mysql.name
    },
    host: {
        type: 'input',
        name: 'host',
        message: 'Host address:',
        validate: validation.validateHost,
        default: 'localhost',
    },
    port: {
        type: 'input',
        name: 'port',
        message: 'port:',
        validate: validation.validatePort,
        default: (input) => {
            if (input.dbms) return dbmsList[input.dbms].defaultPort;
            return null; // It means we offer no default
        }
    },
    user: {
        type: 'input',
        name: 'user',
        message: 'User name:',
        default: 'root'
    },
    password: {
        type: 'password',
        name: 'password',
        message: 'Password'
    },
    schema: {
        type: 'input',
        name: 'database',
        message: 'Database schema to import:'
    }
};

const messages = {
    greeting: `/ᐠ｡ꞈ｡ᐟ\\ Oh hai. I'm Node-db-importer v${packageInfo.version}.
I need information before importing your db.\n`,
    connectionSuccess: 'connected to the database',
    connectionFailure: 'failed to connect to the database',
    noConfig: 'no configuration file found'
};

const configFile = '.db-config.json';

module.exports = {
    dbmsList,
    inquiries,
    messages,
    configFile
};
