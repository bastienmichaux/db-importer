const chalk = require('chalk');

const emphasize = (msg) => {
    console.log(chalk.bold(msg));
};

const info = (msg) => {
    console.info(chalk.hex('#00f2ff')(msg));
};

const success = (msg) => {
    console.log(chalk.hex('#06F90B')(msg));
};

const failure = (msg) => {
    console.error(chalk.hex('#F9060B')(msg));
};

const warning = (msg) => {
    console.warn(chalk.hex('#f7ff00')(msg));
};

module.exports = {
    emphasize,
    info,
    success,
    failure,
    warning
};
