const lodash = require('lodash/object');

const packageInfo = require('./package.json');
const validation = require('./lib/validation');
const db = require('./lib/db-commons');

const toArray = lodash.values;
const pickProperty = lodash.mapValues;


const inquiries = {
    dbms: {
        type: 'list',
        name: 'dbms',
        message: 'DBMS:',
        choices: toArray(pickProperty(db.dbmsList, 'name')),
        default: db.dbmsList.mysql.name
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
            if (input.dbms) return db.dbmsList[input.dbms].defaultPort;
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
        name: 'schema',
        message: 'Database schema to import:'
    }
};

const configFile = '.db-config.json';

const messages = {
    greeting: `/ᐠ｡ꞈ｡ᐟ\\ Oh hai. I'm Node-db-importer v${packageInfo.version}.
I need information before importing your db.\n`,
    noConfig: `${configFile} not found`,
    foundConfig: `${configFile} has been loaded`
};

module.exports = {
    inquiries,
    messages,
    configFile
};
