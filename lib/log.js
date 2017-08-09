const chalk = require('chalk');

const emphasize = (msg) => {
    /* istanbul ignore next */
    console.log(chalk.bold(msg));
};

const info = (msg) => {
    /* istanbul ignore next */
    console.info(chalk.hex('#00f2ff')(msg));
};

const success = (msg) => {
    /* istanbul ignore next */
    console.log(chalk.hex('#06F90B')(msg));
};

const failure = (msg) => {
    /* istanbul ignore next */
    console.error(chalk.hex('#F9060B')(msg));
};

const warning = (msg) => {
    /* istanbul ignore next */
    console.warn(chalk.hex('#f7ff00')(msg));
};

module.exports = {
    emphasize,
    info,
    success,
    failure,
    warning
};
