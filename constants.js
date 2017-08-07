const chalk = require('chalk');
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
        default: input => dbmsList[input.dbms].defaultPort
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

const colors = {
    success: chalk.hex('#06F90B'),
    failure: chalk.hex('#F9060B')
};

const messages = {
    greeting: `${chalk.bgCyan.black('/ᐠ｡ꞈ｡ᐟ\\')} ${chalk.bold(`Oh hai. I'm Node-db-importer v${packageInfo.version}.
I need information before importing your db.`)}`,
    connectionSuccess: `${colors.success('connected to the database')}`,
    connectionFailure: `${colors.failure('failed to connect to the database')}`
};

module.exports = {
    dbmsList,
    inquiries,
    messages
};
