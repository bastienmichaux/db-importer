/** Constants */

const chalk = require('chalk');
const toArray = require('lodash/object').values;
const pickProperty = require('lodash/object').mapValues;

const packageInfo = require('./package.json');


const dbmsList = {
    mysql: {
        name: 'mysql',
        defaultPort: 3306
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
        // todo add validation (valid ip, see framework joi)
        default: '127.0.0.1'
    },
    user: {
        type: 'input',
        name: 'user',
        message: 'User name:',
        default: 'root'
    },
    schema: {
        type: 'input',
        name: 'database',
        message: 'Database schema to import:'
    },
    password: {
        type: 'password',
        name: 'password',
        message: 'Password'
    },
    port: {
        type: 'input',
        name: 'port',
        message: 'port:'
        // todo add validation (valid port)
    }
};

const messages = {
    greeting: `${chalk.bgCyan.black('/ᐠ｡ꞈ｡ᐟ\\')} ${chalk.bold(`Oh hai. I'm Node-db-importer v${packageInfo.version}.
I need information before importing your db.`)}`
};

module.exports = {
    dbmsList,
    inquiries,
    messages
};
