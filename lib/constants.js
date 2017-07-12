/** Constants */

const chalk = require('chalk');
const lodash = require('lodash');

const packageInfo = require('../package.json');


const databaseTypes = {
    mysql: 'mysql',
};

const messages = {
    cat: `${chalk.bgCyan.black('/ᐠ｡ꞈ｡ᐟ\\')}`,
    hello: `${chalk.bold(`Oh hai. I'm Node-db-importer v${packageInfo.version}.\nI need information before importing your db.`)}`
};

const databaseTypesArray = () => lodash.values(databaseTypes);


module.exports = {
    databaseTypes,
    databaseTypesArray,
    messages
};
