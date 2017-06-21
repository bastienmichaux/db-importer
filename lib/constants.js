/** Constants */

const lodash = require('lodash');

const chalk = require('chalk');

const base = require('./base.js');
const packageInfo = require('../package.json');

const databaseTypes = {
    mariadb: 'mariadb',
    mssql: 'mssql',
    mysql: 'mysql',
    oracle: 'oracle',
    postgresql: 'postgresql',
    sqlite: 'sqlite',
};

const messages = {
    cat: `${chalk.bgCyan.black('/ᐠ｡ꞈ｡ᐟ\\')}`,
    hello: `${chalk.bold(`Oh hai. I'm Node-db-importer v${packageInfo.version}.\nI need information before importing your db.`)}`
};

const databaseTypesToArray = () => lodash.values(databaseTypes);

module.exports = {
    databaseTypes,
    databaseTypesToArray,
    messages
};
