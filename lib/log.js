/**
 * @file TUI front-end
 */

/* eslint no-console: 0 */
const chalk = require('chalk');
const util = require('util');

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

// inspect deeply nested objects
const inspect = (obj) => {
    console.log(util.inspect(obj, {showHidden: false, depth: null}));
};

module.exports = {
    emphasize,
    info,
    inspect,
    success,
    failure,
    warning
};
