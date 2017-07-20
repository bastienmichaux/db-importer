/** Constants */

const chalk = require('chalk');

const packageInfo = require('./package.json');


const DBMSs = {
    mysql: 'mysql'
};

const messages = {
    cat: `${chalk.bgCyan.black('/ᐠ｡ꞈ｡ᐟ\\')}`,
    hello: `${chalk.bold(`Oh hai. I'm Node-db-importer v${packageInfo.version}.\nI need information before importing your db.`)}`
};


module.exports = {
    databaseTypes: DBMSs,
    messages
};
