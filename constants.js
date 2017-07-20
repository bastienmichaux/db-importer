/** Constants */

const chalk = require('chalk');
const toArray = require('lodash').values;

const packageInfo = require('./package.json');


const dbmsList = {
    mysql: 'mysql'
};

const inquiries = {
    dbms: {
        type: 'list',
        name: 'dbms',
        message: 'Database type?',
        choices: toArray(dbmsList),
        default: dbmsList.mysql
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
